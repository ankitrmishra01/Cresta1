"""
Model Persistence and Prediction Caching.

Handles saving/loading trained LSTM models to disk,
and caching predictions in the PostgreSQL/SQLite database.
"""
import os
import time
import torch
import joblib
import logging

from django.utils import timezone

from .models.attention_lstm import AttentionLSTM

logger = logging.getLogger(__name__)

# --- Config ---
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')
os.makedirs(MODEL_DIR, exist_ok=True)

CACHE_DURATION = 86400  # 24 hours in seconds


# ============================================================
#  DATABASE PREDICTION CACHE
# ============================================================

def get_cached_prediction(ticker):
    """Retrieve a cached prediction from the database if fresh (< 24h)."""
    try:
        from advisor.models import StockPrediction
        obj = StockPrediction.objects.get(ticker=ticker)
        # Check if stale (older than 24 hours)
        age = timezone.now() - obj.last_updated
        if age.total_seconds() < CACHE_DURATION:
            return {
                "history": obj.history_array,
                "predictions": obj.future_forecast_array,
                "metrics": obj.metrics
            }
    except Exception as e:
        logger.debug(f"Cache miss for {ticker}: {e}")
    return None


def save_prediction(ticker, result_dict):
    """Save a prediction result to the database for caching."""
    try:
        from advisor.models import StockPrediction
        StockPrediction.objects.update_or_create(
            ticker=ticker,
            defaults={
                'history_array': result_dict['history'],
                'future_forecast_array': result_dict['predictions'],
                'metrics': result_dict.get('metrics', {})
            }
        )
    except Exception as e:
        logger.error(f"Failed to save prediction for {ticker} to DB: {e}")


# ============================================================
#  MODEL FILE PERSISTENCE
# ============================================================

def _model_path(ticker):
    """Get the file path for a saved model."""
    safe_ticker = ticker.replace('.', '_').replace('^', '_')
    return os.path.join(MODEL_DIR, f'{safe_ticker}_lstm.pt')


def _scaler_path(ticker):
    """Get the file path for a saved scaler."""
    safe_ticker = ticker.replace('.', '_').replace('^', '_')
    return os.path.join(MODEL_DIR, f'{safe_ticker}_scaler.pkl')


def save_model(ticker, model, scaler, feature_count):
    """Save a trained model and scaler to disk."""
    torch.save({
        'model_state_dict': model.state_dict(),
        'input_size': feature_count,
        'hidden_size': model.hidden_size,
        'num_layers': model.num_layers,
        'output_size': model.output_size,
        'has_attention': True,
        'timestamp': time.time(),
    }, _model_path(ticker))
    joblib.dump(scaler, _scaler_path(ticker))
    print(f"[LSTM] Model saved for {ticker}")


def load_saved_model(ticker, feature_count=13):
    """Load a pre-trained model from disk if it exists and is fresh."""
    model_file = _model_path(ticker)
    scaler_file = _scaler_path(ticker)

    if not os.path.exists(model_file) or not os.path.exists(scaler_file):
        return None, None

    try:
        checkpoint = torch.load(model_file, weights_only=False)

        # Check if model is still fresh (less than 24h old)
        saved_time = checkpoint.get('timestamp', 0)
        if time.time() - saved_time > CACHE_DURATION:
            return None, None  # Stale model

        model = AttentionLSTM(
            input_size=checkpoint['input_size'],
            hidden_size=checkpoint.get('hidden_size', 64),
            num_layers=checkpoint.get('num_layers', 2),
            output_size=checkpoint.get('output_size', 7),
        )
        model.load_state_dict(checkpoint['model_state_dict'])
        model.eval()

        scaler = joblib.load(scaler_file)
        print(f"[LSTM] Loaded saved AttentionLSTM for {ticker}")
        return model, scaler
    except Exception as e:
        print(f"[LSTM] Could not load saved model for {ticker}: {e}")
        return None, None
