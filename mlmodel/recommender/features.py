"""
Technical Indicator Feature Engineering for Stock Prediction.

Computes RSI, MACD, Bollinger Bands, OBV, and macro features,
and assembles them into a feature matrix for the LSTM model.
"""
import pandas as pd
import yfinance as yf
import logging

logger = logging.getLogger(__name__)


def compute_rsi(prices, period=14):
    """Compute Relative Strength Index."""
    delta = prices.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(window=period, min_periods=1).mean()
    avg_loss = loss.rolling(window=period, min_periods=1).mean()
    rs = avg_gain / (avg_loss + 1e-10)
    return 100 - (100 / (1 + rs))


def compute_macd(prices, fast=12, slow=26, signal=9):
    """Compute MACD and Signal line."""
    ema_fast = prices.ewm(span=fast, min_periods=1).mean()
    ema_slow = prices.ewm(span=slow, min_periods=1).mean()
    macd = ema_fast - ema_slow
    macd_signal = macd.ewm(span=signal, min_periods=1).mean()
    return macd, macd_signal


def compute_bollinger(prices, period=20, num_std=2):
    """Compute Bollinger Bands (upper and lower)."""
    sma = prices.rolling(window=period, min_periods=1).mean()
    std = prices.rolling(window=period, min_periods=1).std().fillna(0)
    upper = sma + (std * num_std)
    lower = sma - (std * num_std)
    return upper, lower


def compute_obv(close, volume):
    """Compute On-Balance Volume."""
    obv = pd.Series(0.0, index=close.index)
    for i in range(1, len(close)):
        if close.iloc[i] > close.iloc[i - 1]:
            obv.iloc[i] = obv.iloc[i - 1] + volume.iloc[i]
        elif close.iloc[i] < close.iloc[i - 1]:
            obv.iloc[i] = obv.iloc[i - 1] - volume.iloc[i]
        else:
            obv.iloc[i] = obv.iloc[i - 1]
    return obv


def prepare_features(df, sentiment_score=0.0):
    """
    Create feature matrix from raw OHLCV data.

    13 Features (Tier 2):
    Close, Volume, SMA_5, SMA_20, RSI_14, Daily_Return, Price_Range,
    MACD, MACD_Signal, Bollinger_Upper, Bollinger_Lower, OBV, Sentiment
    """
    features = pd.DataFrame(index=df.index)

    # Original 7 features
    features['Close'] = df['Close']
    features['Volume'] = df['Volume']
    features['SMA_5'] = df['Close'].rolling(5, min_periods=1).mean()
    features['SMA_20'] = df['Close'].rolling(20, min_periods=1).mean()
    features['RSI'] = compute_rsi(df['Close'])
    features['Return'] = df['Close'].pct_change().fillna(0)
    features['Range'] = (df['High'] - df['Low']) / (df['Close'] + 1e-10)

    # New Tier 2 features
    macd, macd_signal = compute_macd(df['Close'])
    features['MACD'] = macd
    features['MACD_Signal'] = macd_signal

    bb_upper, bb_lower = compute_bollinger(df['Close'])
    features['BB_Upper'] = bb_upper
    features['BB_Lower'] = bb_lower

    features['OBV'] = compute_obv(df['Close'], df['Volume'])

    # Tier 3 Macro Features
    start_date = df.index[0]
    try:
        usd_inr = yf.download("INR=X", start=start_date, progress=False)['Close']
        vix = yf.download("^INDIAVIX", start=start_date, progress=False)['Close']
        crude = yf.download("CL=F", start=start_date, progress=False)['Close']
        
        # We need to flatten MultiIndex columns if yfinance returns them
        if isinstance(usd_inr, pd.DataFrame): usd_inr = usd_inr.iloc[:, 0]
        if isinstance(vix, pd.DataFrame): vix = vix.iloc[:, 0]
        if isinstance(crude, pd.DataFrame): crude = crude.iloc[:, 0]

        features['USD_INR'] = usd_inr.reindex(df.index).ffill().bfill()
        features['VIX'] = vix.reindex(df.index).ffill().bfill()
        features['CRUDE'] = crude.reindex(df.index).ffill().bfill()
    except Exception as e:
        logger.error(f"Failed to fetch macro features: {e}")
        features['USD_INR'] = 0.0
        features['VIX'] = 0.0
        features['CRUDE'] = 0.0

    # Sentiment as a constant feature (from FinBERT)
    features['Sentiment'] = sentiment_score

    features = features.bfill().fillna(0)
    return features
