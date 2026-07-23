"""
Bulk LSTM Training Script for Kaggle Nifty50 Dataset.

Reads CSVs from nifty50_data/ folder and trains AttentionLSTM
models for each stock. Saves to saved_models/ directory.

Usage:
  1. Download dataset from: https://www.kaggle.com/datasets/rohanrao/nifty50-stock-market-data
  2. Extract CSVs into backend/recommender/nifty50_data/
  3. Run: python -m recommender.train_nifty50_lstm
"""
import os
import sys
import time
import glob
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler
import joblib

try:
    from recommender.stock_predictor import (
        AttentionLSTM, prepare_features, create_sequences,
        walk_forward_split, save_model, MODEL_DIR
    )
except ImportError:
    from stock_predictor import (
        AttentionLSTM, prepare_features, create_sequences,
        walk_forward_split, save_model, MODEL_DIR
    )


# --- Config ---
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(CURRENT_DIR, 'nifty50_data')

LOOKBACK = 60
FORECAST_DAYS = 7
HIDDEN_SIZE = 64
NUM_LAYERS = 2
EPOCHS = 80
LEARNING_RATE = 0.001
PATIENCE = 8  # Early stopping patience


def load_full_data(filepath, ticker):
    """
    Load Kaggle Nifty50 CSV base and merge with recent yfinance data for a full training set.
    """
    df_kaggle = pd.read_csv(filepath)

    # Standardize column names
    df_kaggle.columns = df_kaggle.columns.str.strip()

    # Parse date
    if 'Date' in df_kaggle.columns:
        df_kaggle['Date'] = pd.to_datetime(df_kaggle['Date'])
        df_kaggle = df_kaggle.set_index('Date')
    else:
        raise ValueError(f"No 'Date' column in {filepath}")

    # Ensure required columns exist
    required = ['Open', 'High', 'Low', 'Close', 'Volume']
    for col in required:
        if col not in df_kaggle.columns:
            raise ValueError(f"Missing column '{col}' in {filepath}")

    # Clean Kaggle Data
    df_kaggle = df_kaggle[df_kaggle['Close'] > 0].dropna(subset=['Close', 'Volume'])
    df_kaggle = df_kaggle.sort_index()[required]
    
    # Append recent data via yfinance that Kaggle doesn't have
    try:
        import yfinance as yf
        ticker_ns = ticker if ticker.endswith('.NS') else f"{ticker}.NS"
        df_recent = yf.Ticker(ticker_ns).history(
            start="2021-01-01", 
            auto_adjust=True
        )
        if not df_recent.empty:
            df_recent.index = df_recent.index.tz_localize(None)
            df_recent = df_recent[required]
            
            # Merge and deduplicate
            df_full = pd.concat([df_kaggle, df_recent])
            df_full = df_full[~df_full.index.duplicated(keep='last')]
            df_full = df_full.sort_index()
            
            if len(df_full) < 500:
                print(f"  ⚠ {ticker}: Insufficient data ({len(df_full)} rows). Skipping.")
                return None
                
            return df_full
    except Exception as e:
        print(f"  ⚠ Could not fetch yfinance data for merge: {e}")
        
    if len(df_kaggle) < 500:
        print(f"  ⚠ {ticker}: Insufficient data ({len(df_kaggle)} rows). Skipping.")
        return None
        
    return df_kaggle


def train_single_stock(filepath, ticker_name):
    """Train an AttentionLSTM model for a single stock CSV."""
    print(f"\n{'='*50}")
    print(f"  Training: {ticker_name}")
    print(f"{'='*50}")

    start_time = time.time()

    # 1. Load merged data
    df = load_full_data(filepath, ticker_name)
    if df is None:
        return False
        
    print(f"  Data: {len(df)} days ({df.index[0].date()} to {df.index[-1].date()})")

    # 2. Prepare features (sentiment = 0 for historical training)
    features_df = prepare_features(df, sentiment_score=0.0)
    num_features = len(features_df.columns)

    # 3. Scale
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(features_df.values)

    # 4. Create sequences
    X, y = create_sequences(scaled_data, LOOKBACK, FORECAST_DAYS)
    print(f"  Sequences: {len(X)} (features: {num_features})")

    if len(X) < 20:
        print(f"  ⚠ Skipping {ticker_name}: not enough sequences")
        return False

    # 5. Walk-forward validation
    splits = walk_forward_split(X, y, n_folds=3)
    fold_losses = []

    for fold_idx, ((X_tr, y_tr), (X_te, y_te)) in enumerate(splits):
        fold_model = AttentionLSTM(
            input_size=num_features, hidden_size=HIDDEN_SIZE,
            num_layers=NUM_LAYERS, output_size=FORECAST_DAYS
        )
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(fold_model.parameters(), lr=LEARNING_RATE)

        X_tr_t = torch.FloatTensor(X_tr)
        y_tr_t = torch.FloatTensor(y_tr)
        X_te_t = torch.FloatTensor(X_te)
        y_te_t = torch.FloatTensor(y_te)

        fold_model.train()
        best_fold_loss = float('inf')
        patience_counter = 0
        for epoch in range(40):
            optimizer.zero_grad()
            output = fold_model(X_tr_t)
            loss = criterion(output, y_tr_t)
            loss.backward()
            optimizer.step()
            # Early stopping for folds
            val_loss = criterion(fold_model(X_te_t), y_te_t).item()
            if val_loss < best_fold_loss - 1e-6:
                best_fold_loss = val_loss
                patience_counter = 0
            else:
                patience_counter += 1
                if patience_counter >= 5:
                    break

        fold_model.eval()
        with torch.no_grad():
            fold_loss = criterion(fold_model(X_te_t), y_te_t).item()
            fold_losses.append(fold_loss)

    wf_mse = np.mean(fold_losses)
    print(f"  Walk-Forward MSE: {wf_mse:.6f}")

    # 6. Final training on ALL data
    model = AttentionLSTM(
        input_size=num_features, hidden_size=HIDDEN_SIZE,
        num_layers=NUM_LAYERS, output_size=FORECAST_DAYS
    )
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)

    X_all_t = torch.FloatTensor(X)
    y_all_t = torch.FloatTensor(y)

    model.train()
    best_loss = float('inf')
    patience_counter = 0
    best_state = None
    for epoch in range(EPOCHS):
        optimizer.zero_grad()
        output = model(X_all_t)
        loss = criterion(output, y_all_t)
        loss.backward()
        optimizer.step()

        current_loss = loss.item()
        if current_loss < best_loss - 1e-6:
            best_loss = current_loss
            patience_counter = 0
            best_state = model.state_dict().copy()
        else:
            patience_counter += 1

        if (epoch + 1) % 10 == 0:
            print(f"  Epoch {epoch+1}/{EPOCHS}, Loss: {current_loss:.6f}")

        if patience_counter >= PATIENCE:
            print(f"  Early stop at epoch {epoch+1} (best loss: {best_loss:.6f})")
            break

    # Restore best weights
    if best_state is not None:
        model.load_state_dict(best_state)

    # 7. Save model with .NS ticker convention
    ticker_ns = f"{ticker_name}.NS"
    save_model(ticker_ns, model, scaler, num_features)

    elapsed = time.time() - start_time
    print(f"  ✓ {ticker_name} done in {elapsed:.1f}s (WF-MSE: {wf_mse:.6f})")
    return True


def main():
    """Train models for all CSVs in nifty50_data/ folder."""
    if not os.path.exists(DATA_DIR):
        print(f"ERROR: Data directory not found at {DATA_DIR}")
        print(f"Please download the dataset from:")
        print(f"  https://www.kaggle.com/datasets/rohanrao/nifty50-stock-market-data")
        print(f"And extract CSVs into: {DATA_DIR}")
        sys.exit(1)

    csv_files = glob.glob(os.path.join(DATA_DIR, '*.csv'))
    if not csv_files:
        print(f"ERROR: No CSV files found in {DATA_DIR}")
        sys.exit(1)

    print(f"Found {len(csv_files)} CSV files in {DATA_DIR}")
    print(f"Models will be saved to: {MODEL_DIR}")
    print(f"Config: lookback={LOOKBACK}, forecast={FORECAST_DAYS}, epochs={EPOCHS}")

    start_total = time.time()
    success = 0
    errors = 0
    results = []
    total = len(csv_files)

    for idx, csv_path in enumerate(sorted(csv_files), 1):
        filename = os.path.basename(csv_path)
        ticker_name = filename.replace('.csv', '').replace('.CSV', '')

        elapsed = time.time() - start_total
        if idx > 1:
            eta = (elapsed / (idx - 1)) * (total - idx + 1)
            eta_str = f"ETA: {eta/60:.1f}min"
        else:
            eta_str = "ETA: calculating..."

        print(f"\n[{idx}/{total}] {eta_str}")

        try:
            ok = train_single_stock(csv_path, ticker_name)
            if ok:
                success += 1
                results.append((ticker_name, "✓"))
            else:
                errors += 1
                results.append((ticker_name, "⚠ skipped"))
        except Exception as e:
            errors += 1
            results.append((ticker_name, f"✗ {e}"))
            print(f"  ✗ {ticker_name} FAILED: {e}")

    total_time = time.time() - start_total

    # Summary
    print(f"\n{'='*60}")
    print(f"  TRAINING COMPLETE")
    print(f"{'='*60}")
    print(f"  Total: {success + errors} stocks")
    print(f"  Success: {success}")
    print(f"  Errors/Skipped: {errors}")
    print(f"  Total Time: {total_time:.0f}s ({total_time/60:.1f} min)")
    print(f"\n  Results:")
    for name, status in results:
        print(f"    {name:20s} {status}")


if __name__ == "__main__":
    main()
