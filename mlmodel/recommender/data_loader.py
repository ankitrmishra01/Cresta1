import yfinance as yf
import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

class SafeDataFetcher:
    """
    Robust wrapper for yfinance data fetching.
    Handles NoneType returns, minimum length requirements, and data cleaning.
    """
    
    @staticmethod
    def fetch_ticker_data(ticker: str, period: str = "1y", interval: str = "1d", min_days: int = 60) -> pd.DataFrame:
        """
        Fetches stock data and performs validation/cleaning.
        
        Args:
            ticker: The stock ticker (e.g., 'AAPL' or 'RELIANCE.NS')
            period: Time period to fetch
            interval: Data interval
            min_days: Minimum number of trading days required
            
        Returns:
            pd.DataFrame: Cleaned stock data
            
        Raises:
            ValueError: If data is insufficient or fetching fails
        """
        try:
            stock = yf.Ticker(ticker)
            df = stock.history(period=period, interval=interval)
            
            # Handle yfinance returning None or empty DF
            if df is None or df.empty:
                logger.error(f"Fetcher returned None or empty for {ticker}")
                raise ValueError(f"No data found for ticker: {ticker}")
            
            # Remove any leading/trailing NaNs
            df = df.dropna(subset=['Close', 'Open', 'High', 'Low', 'Volume'])
            
            # Drop rows where volume is 0 (to avoid holidays/errors)
            df = df[df['Volume'] > 0]
            
            # Check minimum data length
            if len(df) < min_days:
                logger.error(f"Insufficient data for {ticker}: {len(df)} days < {min_days}")
                raise ValueError(f"Insufficient data for {ticker}. Found {len(df)} days, need {min_days}.")
            
            # Ensure price is positive
            if (df['Close'] <= 0).any():
                logger.warning(f"Detected zero or negative prices for {ticker}. Cleaning data...")
                df = df[df['Close'] > 0]
                
            return df
            
        except Exception as e:
            logger.error(f"Critical error fetching {ticker}: {str(e)}")
            raise ValueError(f"Failed to fetch data for {ticker}: {str(e)}")

    @staticmethod
    def calculate_log_returns(df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculates log returns and adds them to the dataframe.
        Log Returns = ln(P_t / P_{t-1})
        """
        df = df.copy()
        df['Log_Return'] = np.log(df['Close'] / df['Close'].shift(1))
        # First row will be NaN
        return df.dropna(subset=['Log_Return'])

    @staticmethod
    def find_proxy_ticker(ticker: str) -> str:
        """
        Finds a logical proxy for a ticker if data fetching fails.
        Currently simple mapping based on common indices/sector leaders.
        """
        proxies = {
            "ICICIBANK.NS": "HDFCBANK.NS",
            "INFY.NS": "TCS.NS",
            "RELIANCE.NS": "ONGC.NS",
            "TATAMOTORS.NS": "MARUTI.NS",
        }
        return proxies.get(ticker, "RELIANCE.NS") # Default to market leader
