import os
import sys
import yfinance as yf
import pandas as pd
import numpy as np
import time

sys.path.append(os.path.dirname(__file__))

from recommender.ensemble_predictor import ensemble_predict
import recommender.stock_predictor

# Use 15 Nifty 50 stocks for validation
TICKERS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
    "SBIN.NS", "BHARTIARTL.NS", "ITC.NS", "ASIANPAINT.NS", "HINDUNILVR.NS",
    "LT.NS", "BAJFINANCE.NS", "AXISBANK.NS", "MARUTI.NS", "SUNPHARMA.NS"
]

def validate_accuracy(days_to_hide=7):
    """
    Validates prediction accuracy by hiding the last `days_to_hide` days of data,
    running the prediction, and then comparing the predicted prices against the
    actual prices that occurred during those hidden days.
    """
    print(f"=== Running Prediction Validation ===")
    print(f"Hiding the last {days_to_hide} trading days to simulate past predictions.\n")

    results = []
    
    # Save original functions
    original_history = yf.Ticker.history
    original_load_saved_model = recommender.stock_predictor.load_saved_model

    for ticker in TICKERS:
        try:
            # 1. Fetch complete real data using the original history function
            stock = original_history(yf.Ticker(ticker), period="1y")
            
            if len(stock) < 100:
                print(f"[{ticker}] Not enough data. Skipping.")
                continue
                
            # The actual history for the last `days_to_hide` days
            actual_future = stock.iloc[-days_to_hide:]['Close'].values
            
            # The last known price before the prediction window starts
            price_before_predict = stock.iloc[-(days_to_hide + 1)]['Close']
            
            # 2. Monkey-patch yf.Ticker.history to return data excluding the last `days_to_hide` days
            def mock_history(self, *args, **kwargs):
                return stock.iloc[:-days_to_hide]
                
            yf.Ticker.history = mock_history
            
            # 3. Prevent data leakage: Clear memory cache and prevent loading disk models
            # that might have been trained on the full dataset (including the hidden days).
            recommender.stock_predictor._model_cache.clear()
            recommender.stock_predictor.load_saved_model = lambda t, f=13: (None, None)
            
            # 4. Predict! (The model will think today is `days_to_hide` days ago)
            pred_result = ensemble_predict(ticker, forecast_days=days_to_hide)
            predicted_prices = [p['price'] for p in pred_result['predictions']][:days_to_hide]
            
            actual_future = actual_future[:len(predicted_prices)]
            
            # 5. Calculate Metrics
            # MSE & RMSE
            mse = np.mean((np.array(actual_future) - np.array(predicted_prices))**2)
            rmse = np.sqrt(mse)
            
            # MAPE (Mean Absolute Percentage Error)
            mape = np.mean(np.abs((np.array(actual_future) - np.array(predicted_prices)) / np.array(actual_future))) * 100
            
            # Directional accuracy (Did the model correctly predict if the stock would go up or down over the period?)
            actual_direction = np.sign(actual_future[-1] - price_before_predict)
            pred_direction = np.sign(predicted_prices[-1] - price_before_predict)
            direction_correct = (actual_direction == pred_direction)
            
            results.append({
                'Ticker': ticker,
                'MAPE_%': round(mape, 2),
                'RMSE': round(rmse, 2),
                'Direction_Match': direction_correct,
                'Actual_Final_Price': round(actual_future[-1], 2),
                'Predicted_Final_Price': round(predicted_prices[-1], 2)
            })
            
            status = "✅" if direction_correct else "❌"
            print(f"[{ticker}] {status} MAPE: {mape:.2f}% | RMSE: {rmse:.2f} | Actual: ₹{actual_future[-1]:.2f} | Pred: ₹{predicted_prices[-1]:.2f}\n")
            
        except Exception as e:
            print(f"[{ticker}] Failed validation: {e}\n")
        finally:
            # Restore original functions for the next iteration step just in case
            yf.Ticker.history = original_history
            recommender.stock_predictor.load_saved_model = original_load_saved_model

    print("\n" + "="*50)
    print("=== FINAL VALIDATION SUMMARY ===")
    print("="*50)
    
    df_results = pd.DataFrame(results)
    if not df_results.empty:
        print(df_results.to_string(index=False))
        
        avg_mape = df_results['MAPE_%'].mean()
        dir_accuracy = (df_results['Direction_Match'].sum() / len(df_results)) * 100
        
        print("-" * 50)
        print(f"Overall Average MAPE:        {avg_mape:.2f}%")
        print(f"Overall Directional Accuracy: {dir_accuracy:.2f}%")
        print("=" * 50)
        
        csv_path = os.path.join(os.path.dirname(__file__), "prediction_backtest_results.csv")
        df_results.to_csv(csv_path, index=False)
        print(f"\nDetailed results saved to: {csv_path}")

if __name__ == "__main__":
    import warnings
    warnings.filterwarnings('ignore')
    validate_accuracy(days_to_hide=7)
