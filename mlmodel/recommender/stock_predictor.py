"""
Tier 2 LSTM Stock Price Predictor — Orchestrator Module.

Coordinates the full prediction pipeline:
1. Check DB cache → 2. Fetch data → 3. Engineer features →
4. Train with walk-forward validation → 5. Predict with Monte Carlo Dropout.

Model architecture, feature engineering, validation, and persistence
are handled by dedicated submodules.
"""
import numpy as np
import torch
import torch.nn as nn
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from datetime import timedelta

from .models.attention_lstm import AttentionLSTM, StockLSTM  # noqa: F401
from .features import prepare_features  # noqa: F401
from .validation import walk_forward_split, create_sequences  # noqa: F401
from .persistence import (  # noqa: F401
    get_cached_prediction,
    save_prediction,
    save_model,
    load_saved_model,
)
from .data_loader import SafeDataFetcher

import logging
logger = logging.getLogger(__name__)


def set_seed(seed=42):
    """Set random seeds for reproducibility."""
    import random
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


def get_sentiment_for_ticker(ticker):
    """Get cached sentiment score for a ticker (0.0 if unavailable)."""
    try:
        from advisor.tasks import get_cached_sentiment
        data = get_cached_sentiment(ticker)
        return data.get('score', 0.0)
    except Exception:
        try:
            from recommender.sentiment import get_market_sentiment
            data = get_market_sentiment(ticker)
            return data.get('score', 0.0)
        except Exception:
            return 0.0


def train_and_predict(ticker: str, lookback: int = 60, forecast_days: int = 7) -> dict:
    """
    Fetch real data, train AttentionLSTM with log returns for stationarity,
    and predict next 7 days.
    """
    set_seed(42)
    # Check persistent DB cache
    cached_result = get_cached_prediction(ticker)
    if cached_result:
        print(f"[LSTM] Returning DB cached result for {ticker}")
        return cached_result

    print(f"[LSTM] Processing {ticker} with Log Returns...")

    # 1. Fetch data using SafeDataFetcher
    try:
        df = SafeDataFetcher.fetch_ticker_data(ticker, period="1y", min_days=lookback + forecast_days + 15)
    except ValueError as e:
        print(f"[LSTM] Data fetch failed for {ticker}: {e}")
        # Try proxy
        proxy = SafeDataFetcher.find_proxy_ticker(ticker)
        print(f"[LSTM] Using proxy {proxy} instead.")
        df = SafeDataFetcher.fetch_ticker_data(proxy, period="1y", min_days=lookback + forecast_days + 15)

    # 2. Get sentiment score
    sentiment_score = get_sentiment_for_ticker(ticker)

    # 3. Prepare features
    features_df = prepare_features(df, sentiment_score=sentiment_score)
    
    # --- STATIONARITY OVERHAUL: Log Returns Transformation ---
    # We predict Log Returns, not raw prices.
    # We'll use Log Returns of Close as the primary target/feature.
    last_actual_price = float(df['Close'].iloc[-1])
    features_df['Target'] = np.log(features_df['Close'] / features_df['Close'].shift(1))
    features_df = features_df.dropna() # Drop first row (NaN log return)
    
    # Reorder to put Target as Column 0
    cols = ['Target'] + [c for c in features_df.columns if c != 'Target' and c != 'Close']
    features_df = features_df[cols]
    
    feature_columns = features_df.columns.tolist()
    num_features = len(feature_columns)

    # 4. Scale data
    scaler = MinMaxScaler(feature_range=(-1, 1)) # Better for centered returns
    scaled_data = scaler.fit_transform(features_df.values)

    # 5. Training / Loading
    model, loaded_scaler = load_saved_model(ticker, num_features)
    test_loss_val = 0.0
    wf_mse = 0.0

    if model is None or loaded_scaler is None:
        print(f"[LSTM] Training new AttentionLSTM for {ticker} (Target: Log Returns)...")
        X, y = create_sequences(scaled_data, lookback, forecast_days)

        if len(X) < 10:
            raise ValueError(f"Not enough sequences for training {ticker}.")

        # --- Walk-Forward Validation ---
        splits = walk_forward_split(X, y, n_folds=3)
        fold_losses = []

        for fold_idx, ((X_tr, y_tr), (X_te, y_te)) in enumerate(splits):
            fold_model = AttentionLSTM(
                input_size=num_features, hidden_size=64,
                num_layers=2, output_size=forecast_days
            )
            criterion = nn.MSELoss()
            optimizer = torch.optim.Adam(fold_model.parameters(), lr=0.001)

            X_tr_t = torch.FloatTensor(X_tr)
            y_tr_t = torch.FloatTensor(y_tr)
            X_te_t = torch.FloatTensor(X_te)
            y_te_t = torch.FloatTensor(y_te)

            fold_model.train()
            for epoch in range(40):
                optimizer.zero_grad()
                output = fold_model(X_tr_t)
                loss = criterion(output, y_tr_t)
                loss.backward()
                optimizer.step()

            fold_model.eval()
            with torch.no_grad():
                test_pred = fold_model(X_te_t)
                fold_loss = criterion(test_pred, y_te_t).item()
                fold_losses.append(fold_loss)

        wf_mse = np.mean(fold_losses)
        
        # Final Training
        model = AttentionLSTM(input_size=num_features, hidden_size=64, num_layers=2, output_size=forecast_days)
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
        X_all_t = torch.FloatTensor(X)
        y_all_t = torch.FloatTensor(y)

        model.train()
        for epoch in range(60):
            optimizer.zero_grad()
            output = model(X_all_t)
            loss = criterion(output, y_all_t)
            loss.backward()
            optimizer.step()
        
        model.eval()
        test_loss_val = loss.item()
        save_model(ticker, model, scaler, num_features)

    # 6. Prediction with MC Dropout
    last_sequence = scaled_data[-lookback:]
    last_sequence_t = torch.FloatTensor(last_sequence).unsqueeze(0)
    model.train() # MC Dropout env

    n_samples = 30
    mc_preds = []
    for _ in range(n_samples):
        with torch.no_grad():
            mc_preds.append(model(last_sequence_t).numpy()[0])
            
    mc_preds_np = np.array(mc_preds)
    future_returns_scaled = mc_preds_np.mean(axis=0)
    lower_returns_scaled = np.percentile(mc_preds_np, 10, axis=0)
    upper_returns_scaled = np.percentile(mc_preds_np, 90, axis=0)

    # 7. Inverse Transform & Price Reconstruction
    # Scale back to log return units
    def reconstruct_prices(scaled_returns):
        dummy = np.zeros((forecast_days, num_features))
        dummy[:, 0] = scaled_returns
        inv = scaler.inverse_transform(dummy)[:, 0]
        # inv is array of 7 log returns: [r1, r2, r3, r4, r5, r6, r7]
        # P_k = P_0 * exp(sum(r_1...r_k))
        prices = []
        current_cum_ret = 0
        for r in inv:
            current_cum_ret += r
            prices.append(last_actual_price * np.exp(current_cum_ret))
        return prices

    future_prices = reconstruct_prices(future_returns_scaled)
    lower_prices = reconstruct_prices(lower_returns_scaled)
    upper_prices = reconstruct_prices(upper_returns_scaled)

    # Build response
    history = []
    for idx, row in df.tail(30).iterrows():
        history.append({
            "date": idx.strftime('%Y-%m-%d'),
            "price": round(float(row['Close']), 2),
            "isFuture": False
        })

    last_date = df.index[-1]
    predictions = []
    for i in range(forecast_days):
        next_date = last_date + timedelta(days=i + 1)
        while next_date.weekday() >= 5: next_date += timedelta(days=1)
        predictions.append({
            "date": next_date.strftime('%Y-%m-%d'),
            "price": round(float(future_prices[i]), 2),
            "lower_bound": round(float(lower_prices[i]), 2),
            "upper_bound": round(float(upper_prices[i]), 2),
            "isFuture": True
        })

    result = {
        "history": history,
        "predictions": predictions,
        "metrics": {
            "test_mse": round(test_loss_val, 6),
            "walk_forward_mse": round(wf_mse, 6),
            "training_samples": len(scaled_data) - lookback - forecast_days,
            "features": num_features,
            "model": "AttentionLSTM (Log Returns - Stationary)"
        }
    }

    save_prediction(ticker, result)
    print(f"[LSTM] Stationary prediction complete for {ticker}")
    return result

    # Save to persistent database
    save_prediction(ticker, result)

    print(f"[LSTM] Prediction complete for {ticker}")
    return result


if __name__ == "__main__":
    result = train_and_predict("RELIANCE.NS")
    print(f"\nHistory points: {len(result['history'])}")
    print(f"Predictions: {len(result['predictions'])}")
    print(f"Metrics: {result['metrics']}")
    print("\nFuture prices:")
    for p in result['predictions']:
        print(f"  {p['date']}: ₹{p['price']}")
