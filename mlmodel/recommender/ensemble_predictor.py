"""
Tier 2 Ensemble Stock Predictor.

Combines three models for robust predictions:
- AttentionLSTM (50%) — Non-linear patterns, long sequences
- XGBoost (30%)       — Feature interactions, fast training
- ARIMA (20%)         — Linear trend + seasonality

Falls back gracefully if any model fails.
"""
import os
import numpy as np
import pandas as pd
import time
import warnings
warnings.filterwarnings('ignore')

from datetime import timedelta

try:
    from recommender.stock_predictor import (
        train_and_predict as lstm_predict,
        prepare_features,
        get_sentiment_for_ticker,
        get_cached_prediction,
        save_prediction
    )
except ImportError:
    from stock_predictor import (
        train_and_predict as lstm_predict,
        prepare_features,
        get_sentiment_for_ticker,
        get_cached_prediction,
        save_prediction
    )


# ============================================================
#  XGBOOST PREDICTOR
# ============================================================

def _xgboost_predict(df, sentiment_score=0.0, forecast_days=7):
    """
    XGBoost regression on flattened sliding-window features.
    Uses last 5 days of 13 features → predicts 7-day returns.
    """
    try:
        import xgboost as xgb
    except ImportError:
        print("[ENSEMBLE] xgboost not installed, skipping XGBoost...")
        return None

    features_df = prepare_features(df, sentiment_score=sentiment_score)
    data = features_df.values
    close_prices = df['Close'].values

    lookback = 5  # XGBoost uses short lookback (flattened)
    num_features = data.shape[1]

    # Create flattened sliding-window features
    X, y = [], []
    for i in range(lookback, len(data) - forecast_days):
        flat = data[i - lookback:i].flatten()
        # Target: percentage returns for next 7 days
        future_returns = (close_prices[i:i + forecast_days] / close_prices[i - 1]) - 1
        X.append(flat)
        y.append(future_returns)

    if len(X) < 20:
        return None

    X = np.array(X)
    y = np.array(y)

    # Train on all but last fold (time-ordered)
    split = int(len(X) * 0.85)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    # Multi-output via separate models per day
    predictions = []
    last_price = close_prices[-1]

    for day in range(forecast_days):
        model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42,
            verbosity=0
        )
        model.fit(X_train, y_train[:, day])
        pred_return = model.predict(X[-1:].reshape(1, -1))[0]
        pred_price = last_price * (1 + pred_return)
        predictions.append(round(float(pred_price), 2))
        last_price = pred_price  # Chain predictions

    print(f"[ENSEMBLE] XGBoost predictions: {predictions}")
    return predictions


# ============================================================
#  ARIMA PREDICTOR
# ============================================================

def _arima_predict(df, forecast_days=7):
    """
    Auto-ARIMA on Close prices for trend/seasonal forecasting.
    """
    try:
        import pmdarima as pm
    except ImportError:
        print("[ENSEMBLE] pmdarima not installed, skipping ARIMA...")
        return None

    try:
        close = df['Close'].values

        # Use last 200 trading days for faster fitting
        close_subset = close[-200:] if len(close) > 200 else close

        model = pm.auto_arima(
            close_subset,
            seasonal=False,
            stepwise=True,
            suppress_warnings=True,
            error_action='ignore',
            max_p=5, max_q=5, max_d=2,
            trace=False
        )

        forecast = model.predict(n_periods=forecast_days)
        predictions = [round(float(p), 2) for p in forecast]

        print(f"[ENSEMBLE] ARIMA predictions: {predictions}")
        return predictions

    except Exception as e:
        print(f"[ENSEMBLE] ARIMA failed: {e}")
        return None


# ============================================================
#  ENSEMBLE COMBINER
# ============================================================

# Model weights
WEIGHTS = {
    'lstm': 0.70,
    'xgboost': 0.10,
    'arima': 0.20,
}


from recommender.data_loader import SafeDataFetcher

# ============================================================
#  XGBOOST PREDICTOR
# ============================================================

def _xgboost_predict(df, sentiment_score=0.0, forecast_days=7):
    """
    XGBoost regression on log returns for stationarity.
    """
    try:
        import xgboost as xgb
    except ImportError:
        return None

    # Use Log Returns as target
    df = df.copy()
    df['Log_Ret'] = np.log(df['Close'] / df['Close'].shift(1))
    df = df.dropna()
    
    features_df = prepare_features(df, sentiment_score=sentiment_score)
    data = features_df.values
    
    lookback = 5
    X, y = [], []
    for i in range(lookback, len(data) - forecast_days):
        X.append(data[i - lookback:i].flatten())
        # Predict cumulative log returns for simplicity
        y.append(df['Log_Ret'].iloc[i:i + forecast_days].values)

    if len(X) < 20: return None

    X, y = np.array(X), np.array(y)
    split = int(len(X) * 0.85)
    X_train, y_train = X[:split], y[:split]

    predictions = []
    last_price = df['Close'].iloc[-1]
    
    # Train multi-output
    model = xgb.XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42)
    model.fit(X_train, y_train)
    
    pred_log_rets = model.predict(X[-1:].reshape(1, -1))[0]
    
    cum_ret = 0
    for r in pred_log_rets:
        cum_ret += r
        pred_price = last_price * np.exp(cum_ret)
        predictions.append(round(float(pred_price), 2))
        
    return predictions


# ============================================================
#  ARIMA PREDICTOR
# ============================================================

def _arima_predict(df, forecast_days=7):
    """
    Auto-ARIMA on log returns for better stationarity.
    """
    try:
        import pmdarima as pm
    except ImportError:
        return None

    try:
        # Train on log returns
        log_returns = np.log(df['Close'] / df['Close'].shift(1)).dropna().values
        last_price = df['Close'].iloc[-1]
        
        subset = log_returns[-200:] if len(log_returns) > 200 else log_returns

        model = pm.auto_arima(subset, seasonal=False, stepwise=True, suppress_warnings=True, max_p=3, max_q=3)
        forecast_rets = model.predict(n_periods=forecast_days)
        
        predictions = []
        cum_ret = 0
        for r in forecast_rets:
            cum_ret += r
            predictions.append(round(float(last_price * np.exp(cum_ret)), 2))
            
        return predictions
    except Exception as e:
        print(f"[ENSEMBLE] ARIMA failed: {e}")
        return None


def calculate_ivw_weights(ticker, df, forecast_days=7):
    """ 
    Volatility-Adjusted Inverse Variance Weighting.

    Defensive: normalizes prediction shapes and verifies lengths before computing MSE.
    """

    def _normalize_price_list(preds):
        """Convert predictions into list[float] of length forecast horizon."""
        if preds is None:
            return None
        if isinstance(preds, (int, float)):
            return [float(preds)]
        if not isinstance(preds, (list, tuple)):
            return None

        out = []
        for p in preds:
            if isinstance(p, dict):
                if 'price' in p:
                    out.append(float(p['price']))
                elif 'Close' in p:
                    out.append(float(p['Close']))
                else:
                    # best-effort fallback: first numeric field
                    found = False
                    for v in p.values():
                        if isinstance(v, (int, float)):
                            out.append(float(v))
                            found = True
                            break
                    if not found:
                        continue
            else:
                try:
                    out.append(float(p))
                except Exception:
                    continue

        return out if out else None

    print(f"[ENSEMBLE] Calculating Dynamic IVW Weights for {ticker}...")

    # Split data to hide last 5 days
    eval_len = 5
    train_df = df.iloc[:-eval_len]
    actual_prices = df['Close'].iloc[-eval_len:].values

    models_mse = {}

    # LSTM MSE
    try:
        res = lstm_predict(ticker, lookback=60, forecast_days=eval_len)
        pred_items = res.get('predictions', [])[:eval_len]
        preds = _normalize_price_list(pred_items)
        if preds is None or len(preds) != eval_len:
            raise ValueError(f"Unexpected LSTM preds shape: {0 if preds is None else len(preds)}")
        preds = np.array(preds, dtype=float)
        models_mse['lstm'] = float(np.mean((actual_prices - preds) ** 2))
    except Exception:
        models_mse['lstm'] = 1e6

    # XGB MSE
    try:
        preds = _xgboost_predict(train_df, sentiment_score=0.0, forecast_days=eval_len)
        preds = _normalize_price_list(preds)
        if preds is None or len(preds) != eval_len:
            raise ValueError(f"Unexpected XGB preds shape: {0 if preds is None else len(preds)}")
        preds = np.array(preds, dtype=float)
        models_mse['xgboost'] = float(np.mean((actual_prices - preds) ** 2))
    except Exception:
        models_mse['xgboost'] = 1e6

    # ARIMA MSE
    try:
        preds = _arima_predict(train_df, forecast_days=eval_len)
        preds = _normalize_price_list(preds)
        if preds is None or len(preds) != eval_len:
            raise ValueError(f"Unexpected ARIMA preds shape: {0 if preds is None else len(preds)}")
        preds = np.array(preds, dtype=float)
        models_mse['arima'] = float(np.mean((actual_prices - preds) ** 2))
    except Exception:
        models_mse['arima'] = 1e6

    inv_vars = {k: 1.0 / (v + 1e-6) for k, v in models_mse.items()}
    total_inv_var = sum(inv_vars.values()) or 1.0
    weights = {k: v / total_inv_var for k, v in inv_vars.items()}

    print(f"[ENSEMBLE] Dynamic Weights: { {k: round(v, 3) for k, v in weights.items()} }")
    return weights



def ensemble_predict(ticker: str, lookback: int = 60, forecast_days: int = 7) -> dict:
    """
    Dynamic Ensemble using IVW for LSTM + XGBoost + ARIMA.
    """
    # Check persistent DB cache first
    cached_result = get_cached_prediction(ticker)
    if cached_result:
        return cached_result

    print(f"[ENSEMBLE] Starting Dynamic Pipeline for {ticker}...")
    start_time = time.time()

    # 1. Fetch data safely
    try:
        df = SafeDataFetcher.fetch_ticker_data(ticker, period="1y", min_days=lookback + forecast_days + 10)
    except ValueError:
        proxy = SafeDataFetcher.find_proxy_ticker(ticker)
        df = SafeDataFetcher.fetch_ticker_data(proxy)
        ticker = proxy

    sentiment_score = get_sentiment_for_ticker(ticker)

    # 2. Calculate Dynamic Weights
    weights = calculate_ivw_weights(ticker, df, forecast_days)

    # 3. Run predictions
    model_predictions = {}
    
    try:
        lstm_res = lstm_predict(ticker, lookback, forecast_days)
        model_predictions['lstm'] = [p['price'] for p in lstm_res['predictions']]
    except: pass
        
    try:
        model_predictions['xgboost'] = _xgboost_predict(df, sentiment_score, forecast_days)
    except: pass
        
    try:
        model_predictions['arima'] = _arima_predict(df, forecast_days)
    except: pass

    # 4. Weighted Combination
    active_models = [m for m in model_predictions if model_predictions[m]]
    if not active_models:
        raise ValueError(f"All models failed for {ticker}")
        
    # Re-normalize weights for active models only
    active_weight_sum = sum(weights[m] for m in active_models)
    norm_weights = {m: weights[m] / active_weight_sum for m in active_models}

    # Defensive: ensure each active model has enough horizon steps.
    horizon = forecast_days
    for m in list(active_models):
        if len(model_predictions.get(m, [])) < horizon:
            # drop model with insufficient horizon to avoid index errors
            active_models.remove(m)
            norm_weights.pop(m, None)

    if not active_models:
        raise ValueError(f"All models failed to produce full horizon for {ticker}")

    active_weight_sum = sum(norm_weights[m] for m in active_models) or 1.0
    norm_weights = {m: norm_weights[m] / active_weight_sum for m in active_models}

    ensemble_prices = []
    for day in range(horizon):
        p_val = 0.0
        for m in active_models:
            p_val += float(model_predictions[m][day]) * float(norm_weights[m])
        ensemble_prices.append(round(p_val, 2))


    # 5. Result construction
    history = []
    for idx, row in df.tail(30).iterrows():
        history.append({"date": idx.strftime('%Y-%m-%d'), "price": round(float(row['Close']), 2), "isFuture": False})

    last_date = df.index[-1]
    predictions = []
    for i in range(forecast_days):
        next_date = last_date + timedelta(days=i + 1)
        while next_date.weekday() >= 5: next_date += timedelta(days=1)
        predictions.append({"date": next_date.strftime('%Y-%m-%d'), "price": ensemble_prices[i], "isFuture": True})

    result = {
        "history": history,
        "predictions": predictions,
        "metrics": {
            "model": "Dynamic Ensemble (IVW)",
            "models_used": active_models,
            "weights": {k: round(v, 3) for k, v in norm_weights.items()},
            "elapsed_seconds": round(time.time() - start_time, 2),
        },
        "model_breakdown": model_predictions
    }

    save_prediction(ticker, result)
    return result


if __name__ == "__main__":
    result = ensemble_predict("RELIANCE.NS")
    print(f"\nHistory points: {len(result['history'])}")
    print(f"Predictions: {len(result['predictions'])}")
    print(f"Metrics: {result['metrics']}")
    print(f"\nModel Breakdown:")
    for model, prices in result['model_breakdown'].items():
        print(f"  {model}: {prices}")
    print(f"\nEnsemble Prices:")
    for p in result['predictions']:
        print(f"  {p['date']}: ₹{p['price']}")
