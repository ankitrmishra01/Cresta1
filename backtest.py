
import yfinance as yf
import pandas as pd
import numpy as np
import sys
import os

# Suppress stderr to hide yfinance progress bars and errors
sys.stderr = open(os.devnull, 'w')

def backtest_strategy(symbol, period="1y"):
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period)
        
        if df.empty:
            return None

        # Calculate 5-day SMA
        df['SMA_5'] = df['Close'].rolling(window=5).mean()
        
        # Generate signals: Buy if Price < SMA
        df['Signal'] = np.where(df['Close'] < df['SMA_5'], 1, 0)
        
        # Calculate returns for the NEXT day
        df['Next_Day_Return'] = df['Close'].shift(-1) - df['Close']
        df['Next_Day_Percent'] = (df['Next_Day_Return'] / df['Close']) * 100
        
        buy_signals = df[df['Signal'] == 1]
        total_trades = len(buy_signals)
        
        if total_trades == 0:
            return {
                "symbol": symbol,
                "trades": 0,
                "win_rate": 0,
                "avg_return": 0
            }

        profitable_trades = len(buy_signals[buy_signals['Next_Day_Return'] > 0])
        win_rate = (profitable_trades / total_trades) * 100
        avg_return = buy_signals['Next_Day_Percent'].mean()
        
        return {
            "symbol": symbol,
            "trades": total_trades,
            "win_rate": win_rate,
            "avg_return": avg_return
        }
    except Exception:
        return None


if __name__ == "__main__":
    symbols = ["^NSEI", "^BSESN", "RELIANCE.NS", "TCS.NS", "INFY.NS"]
    results = []
    
    for sym in symbols:
        res = backtest_strategy(sym)
        if res:
            results.append(res)
            
    with open("results_final.txt", "w") as f:
        f.write(f"{'Symbol':<15} {'Trades':<10} {'Win Rate':<10} {'Avg Return':<15}\n")
        f.write("-" * 50 + "\n")
        for res in results:
            f.write(f"{res['symbol']:<15} {res['trades']:<10} {res['win_rate']:.2f}%     {res['avg_return']:.2f}%\n")

