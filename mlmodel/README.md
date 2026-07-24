# mlmodel/ — Cresta ML & Recommendation Engine

This module contains all machine learning training, inference, and data
processing code for the Cresta robo-advisor platform.

## Owner

**Team Member:** *(assign owner here)*

## Architecture

```
mlmodel/
├── recommender/              # Core ML package (imported by backend/)
│   ├── models/
│   │   └── attention_lstm.py # AttentionLSTM + StockLSTM PyTorch architectures
│   ├── saved_models/         # Pre-trained .pt weights and .pkl scalers
│   ├── nifty50_data/         # Historical stock CSVs for training
│   ├── engine.py             # 100-point fiduciary scoring algorithm
│   ├── ensemble_predictor.py # Dynamic IVW ensemble (LSTM+XGBoost+ARIMA)
│   ├── stock_predictor.py    # LSTM prediction pipeline orchestrator
│   ├── sentiment.py          # FinBERT sentiment analysis
│   ├── features.py           # Technical indicator feature engineering
│   ├── data_loader.py        # Robust yfinance data fetcher
│   ├── persistence.py        # Model save/load + DB prediction caching
│   ├── validation.py         # Walk-forward time-series CV
│   ├── constants.py          # Stock universe, sector map
│   ├── reasoning.py          # Multi-language recommendation explanations
│   ├── risk_profiler.py      # User risk profiling
│   ├── train.py              # XGBoost risk classifier training
│   └── train_nifty50_lstm.py # Batch LSTM training script
├── mlruns/                   # MLflow experiment tracking data
├── backtest.py               # Backtesting script
├── requirements.txt          # ML-specific Python dependencies
└── README.md                 # This file
```

## How It Integrates with Backend

The `recommender` package is imported by `backend/` as a Python module
(via `PYTHONPATH`). In Docker, the backend Dockerfile copies `mlmodel/`
and adds it to the Python path so that all `from recommender.* import ...`
statements work transparently.

Key integration points:
- `backend/advisor/views/ml.py` → calls `recommender.engine.recommend_stocks()`
  and `recommender.ensemble_predictor.ensemble_predict()`
- `backend/advisor/tasks.py` → Celery tasks call `recommender.sentiment` and
  `recommender.ensemble_predictor` for daily pre-computation
- `backend/advisor/apps.py` → pre-loads FinBERT model at Django startup

## Running Standalone

```bash
# Install dependencies
pip install -r requirements.txt

# Train the risk classifier
python -m recommender.train

# Batch-train LSTM models for Nifty 50
python -m recommender.train_nifty50_lstm

# Run backtesting
python backtest.py

# Test a single prediction
python -m recommender.engine
```

## Key Models

| Model | Purpose | Weight in Ensemble |
|---|---|---|
| AttentionLSTM | Non-linear pattern recognition | ~70% (IVW adjusted) |
| XGBoost | Feature interactions, fast training | ~10% (IVW adjusted) |
| Auto-ARIMA | Linear trend + seasonality | ~20% (IVW adjusted) |
| FinBERT | News headline sentiment scoring | Feeds into scoring engine |
| XGBoost Classifier | User risk profile classification | Used by engine.py |

## TODO

- [ ] Add unit tests for ML pipeline
- [ ] Add MLflow experiment comparison scripts
- [ ] Document hyperparameter tuning workflow
