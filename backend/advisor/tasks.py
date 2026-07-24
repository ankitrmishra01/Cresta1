"""
Celery tasks for background ML processing.
Pre-computes sentiment and LSTM predictions so API requests are instant.
"""
import json
import time
from django.core.cache import cache

try:
    from celery import shared_task
except ImportError:
    # Fallback: if celery not installed, make tasks callable as regular functions
    def shared_task(func):
        func.delay = func
        func.apply_async = lambda *a, **kw: func()
        return func


# ============= SENTIMENT PRE-COMPUTATION =============

NIFTY_TICKERS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
    "HINDUNILVR.NS", "BHARTIARTL.NS", "SBIN.NS", "ITC.NS", "BAJFINANCE.NS",
    "KOTAKBANK.NS", "LT.NS", "HCLTECH.NS", "AXISBANK.NS", "ASIANPAINT.NS",
    "MARUTI.NS", "SUNPHARMA.NS", "TITAN.NS", "ULTRACEMCO.NS", "WIPRO.NS",
    "TATAMOTORS.NS", "TATASTEEL.NS", "JSWSTEEL.NS", "POWERGRID.NS", "COALINDIA.NS",
    "ADANIENT.NS", "ADANIPORTS.NS", "HINDALCO.NS", "GRASIM.NS", "BAJAJFINSV.NS",
]


@shared_task
def precompute_sentiment():
    """
    Pre-compute FinBERT sentiment for all NIFTY 50 stocks.
    Results are stored in Django cache (Redis if configured, else LocMem).
    Runs daily via Celery Beat.
    """
    from recommender.sentiment import get_market_sentiment

    print(f"[CELERY] Starting sentiment pre-computation for {len(NIFTY_TICKERS)} stocks...")
    results = {}
    success = 0
    errors = 0

    for ticker in NIFTY_TICKERS:
        try:
            sentiment = get_market_sentiment(ticker)
            results[ticker] = {
                'score': sentiment['score'],
                'confidence': sentiment.get('confidence', 0),
                'headlines': sentiment['headlines'],
                'timestamp': time.time(),
            }
            # Cache each ticker individually (24h TTL)
            cache.set(f'sentiment:{ticker}', results[ticker], timeout=86400)
            success += 1
            print(f"  ✓ {ticker}: score={sentiment['score']:.3f}")
        except Exception as e:
            print(f"  ✗ {ticker}: {e}")
            errors += 1

    # Cache the full results map
    cache.set('sentiment:all', results, timeout=86400)
    cache.set('sentiment:last_run', time.time(), timeout=86400 * 7)

    print(f"[CELERY] Sentiment done: {success} ok, {errors} errors")
    return {'success': success, 'errors': errors}


def get_cached_sentiment(ticker):
    """
    Get pre-computed sentiment from cache, fallback to live computation.
    Used by engine.py instead of calling FinBERT directly.
    """
    cached = cache.get(f'sentiment:{ticker}')
    if cached and time.time() - cached.get('timestamp', 0) < 86400:
        return cached

    # Fallback: compute live
    from recommender.sentiment import get_market_sentiment
    return get_market_sentiment(ticker)


# ============= LSTM PRE-TRAINING =============

TOP_TICKERS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
    "SBIN.NS", "ITC.NS", "BAJFINANCE.NS", "LT.NS", "TATAMOTORS.NS",
    "HINDUNILVR.NS", "BHARTIARTL.NS", "KOTAKBANK.NS", "HCLTECH.NS",
    "AXISBANK.NS", "ASIANPAINT.NS", "MARUTI.NS", "SUNPHARMA.NS",
    "TITAN.NS", "ULTRACEMCO.NS", "WIPRO.NS", "TATASTEEL.NS",
    "JSWSTEEL.NS", "POWERGRID.NS", "COALINDIA.NS", "ADANIENT.NS",
    "ADANIPORTS.NS", "HINDALCO.NS", "GRASIM.NS", "BAJAJFINSV.NS",
]


@shared_task
def pretrain_lstm_models():
    """
    Pre-train ensemble models (AttentionLSTM + XGBoost + ARIMA) for popular stocks.
    Models are saved to disk and reused for 24h.
    Runs daily via Celery Beat.
    """
    from recommender.ensemble_predictor import ensemble_predict

    print(f"[CELERY] Starting ensemble pre-training for {len(TOP_TICKERS)} stocks...")
    success = 0
    errors = 0

    for ticker in TOP_TICKERS:
        try:
            result = ensemble_predict(ticker)
            success += 1
            models_used = result.get('metrics', {}).get('models_used', [])
            print(f"  ✓ {ticker}: {len(result['predictions'])} predictions ({', '.join(models_used)})")
        except Exception as e:
            print(f"  ✗ {ticker}: {e}")
            errors += 1

    print(f"[CELERY] Ensemble pre-training done: {success} ok, {errors} errors")
    return {'success': success, 'errors': errors}


@shared_task
def daily_ml_refresh():
    """Master task: runs both sentiment + LSTM pre-computation."""
    print("[CELERY] === Daily ML Refresh Started ===")
    sentiment_result = precompute_sentiment()
    lstm_result = pretrain_lstm_models()
    print("[CELERY] === Daily ML Refresh Complete ===")
    return {
        'sentiment': sentiment_result,
        'lstm': lstm_result,
    }


# ============= ALERTING & MONITORING =============

@shared_task
def check_price_alerts():
    """
    Checks active WatchlistAlerts against live yfinance prices.
    Designed to run every 15 mins during market hours.
    """
    from advisor.models import WatchlistAlert
    from django.core.mail import send_mail
    from django.conf import settings
    import yfinance as yf
    
    active_alerts = WatchlistAlert.objects.filter(is_active=True)
    if not active_alerts.exists():
        return "No active alerts"
        
    print(f"[CELERY] Checking {active_alerts.count()} price alerts...")
    triggered = 0
    
    # Batch fetch live prices to reduce yfinance hits
    tickers = list(active_alerts.values_list('ticker', flat=True).distinct())
    prices = {}
    
    for ticker in tickers:
        try:
            prices[ticker] = yf.Ticker(ticker).history(period='1d')['Close'].iloc[-1]
        except Exception:
            continue
            
    for alert in active_alerts:
        live_price = prices.get(alert.ticker)
        if not live_price:
            continue
            
        is_triggered = False
        if alert.condition == 'ABOVE' and live_price >= float(alert.target_price):
            is_triggered = True
        elif alert.condition == 'BELOW' and live_price <= float(alert.target_price):
            is_triggered = True
            
        if is_triggered:
            # Here we integrate with email/push notification logic
            print(f"🚨 ALERT TRIGGERED: {alert.ticker} dropped {alert.condition} ₹{alert.target_price}")
            
            subject = f"🚨 Cresta Alert: {alert.ticker} {alert.condition} ₹{alert.target_price}"
            body = (
                f"Your price alert has triggered.\n\n"
                f"Stock: {alert.ticker}\n"
                f"Condition: Price went {alert.condition} ₹{alert.target_price}\n"
                f"Check your Cresta dashboard for details.\n\n"
                f"— Cresta Robo-Advisor"
            )
            
            send_mail(
                subject=subject,
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[alert.user.email],
                fail_silently=True  # don't crash the task if email fails
            )
            
            alert.is_active = False # Deactivate after firing once
            alert.save()
            triggered += 1
            
    return f"Checked {active_alerts.count()} alerts, triggered {triggered}"


@shared_task
def check_model_drift():
    """
    Daily check of LSTM cached predictions against actual market close prices
    to detect if models are drifting out of alignment with reality.
    """
    from advisor.models import StockPrediction
    import yfinance as yf
    
    predictions = StockPrediction.objects.all()
    print(f"[CELERY] Checking drift for {predictions.count()} cached models...")
    
    drift_count = 0
    
    for pred in predictions:
        try:
            forecasts = pred.future_forecast_array
            if not forecasts or len(forecasts) < 1:
                continue
                
            first_pred_date = forecasts[0]['date']
            first_pred_price = forecasts[0]['price']
            
            # Fetch actual price for that 'future' date if it has passed
            actual_data = yf.Ticker(pred.ticker).history(start=first_pred_date, end=first_pred_date)
            
            if not actual_data.empty:
                actual_price = actual_data['Close'].iloc[0]
                error_margin = abs(actual_price - first_pred_price) / actual_price
                
                # If error is greater than 5% on Day 1 forecast, we have drift
                if error_margin > 0.05:
                    print(f"⚠️ DRIFT DETECTED for {pred.ticker}: Predicted ₹{first_pred_price}, Actual ₹{actual_price:.2f}")
                    drift_count += 1
                    
                    # Force eviction of this model from the persistent cache
                    pred.delete() 
                    
        except Exception as e:
            pass
            
    return f"Drift check complete. Evicted {drift_count} stale models."
