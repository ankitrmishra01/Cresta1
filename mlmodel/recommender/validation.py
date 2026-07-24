"""
Walk-Forward Validation and Data Sequence utilities for time-series ML.

Implements expanding-window validation splits that prevent look-ahead bias,
and creates input sequences for LSTM training.
"""
import numpy as np


def walk_forward_split(X, y, n_folds=3, min_test_size=45):
    """
    Time-series walk-forward splits (expanding window).
    Never leaks future data into training.
    """
    n = len(X)
    test_size = max(min_test_size, n // (n_folds + 1))
    
    splits = []
    
    for i in range(n_folds, 0, -1):
        test_start = n - i * test_size
        test_end = n - (i - 1) * test_size
        
        if test_start > 0:
            splits.append((
                (X[:test_start], y[:test_start]),
                (X[test_start:test_end], y[test_start:test_end])
            ))
            
    if not splits or len(splits) < n_folds:
        splits = []
        fold_size = max(1, n // (n_folds + 1))
        for i in range(n_folds):
            train_end = fold_size * (i + 2)
            test_end = min(train_end + fold_size, n)
            if test_end <= train_end:
                continue
            splits.append((
                (X[:train_end], y[:train_end]),
                (X[train_end:test_end], y[train_end:test_end])
            ))
            
    return splits


def create_sequences(data, lookback=60, forecast_days=7):
    """Create input sequences and targets for training."""
    X, y = [], []
    for i in range(lookback, len(data) - forecast_days):
        X.append(data[i - lookback:i])
        y.append(data[i:i + forecast_days, 0])  # Predict Close prices (column 0)
    return np.array(X), np.array(y)
