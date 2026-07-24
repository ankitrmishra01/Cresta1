"""
Recommendation Engine — Core Scoring and Stock Selection.

Implements the 100-point fiduciary scoring algorithm that
evaluates stocks based on sentiment, risk fit, and valuation,
personalized to each user's ML-classified risk profile.
"""
import os
import json
import joblib
import pandas as pd
import yfinance as yf
from django.core.cache import cache
import concurrent.futures

try:
    from recommender.sentiment import get_market_sentiment
except ImportError:
    from sentiment import get_market_sentiment

# Try to use cached sentiment from Celery tasks
try:
    from advisor.tasks import get_cached_sentiment
except ImportError:
    get_cached_sentiment = get_market_sentiment

from .constants import SECTOR_MAP, STOCK_UNIVERSE, MAX_PER_SECTOR
from .reasoning import REASONING


def load_model():
    """Load the trained XGBoost risk classification model."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, "user_classifier.pkl")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}. Please run train.py first.")
    return joblib.load(model_path)


def get_stock_profile(ticker: str):
    """Fetches key stock metrics via yfinance."""
    cache_key = f"profile:{ticker}"
    cached_profile = cache.get(cache_key)
    
    if cached_profile:
        return cached_profile

    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        beta = info.get("beta", 1.0)
        price = info.get("currentPrice", info.get("regularMarketPrice", 0.0))
        name = info.get("longName", ticker.replace(".NS", ""))
        sector = SECTOR_MAP.get(ticker, info.get("sector", "Other"))
        pe_ratio = info.get("trailingPE", 0)
        market_cap = info.get("marketCap", 0)
        week52_high = info.get("fiftyTwoWeekHigh", price)
        week52_low = info.get("fiftyTwoWeekLow", price)
        
        result = {
            "beta": beta if beta else 1.0,
            "price": price,
            "name": name,
            "sector": sector,
            "pe_ratio": round(pe_ratio, 2) if pe_ratio else 0,
            "market_cap": market_cap,
            "week52_high": week52_high,
            "week52_low": week52_low
        }
        cache.set(cache_key, result, timeout=86400) # Cache for 24h
        return result
    except Exception:
        fallback = {
            "beta": 1.0, "price": 0.0, "name": ticker.replace(".NS", ""),
            "sector": SECTOR_MAP.get(ticker, "Other"), "pe_ratio": 0,
            "market_cap": 0, "week52_high": 0, "week52_low": 0
        }
        return fallback


def _process_single_stock(ticker, user_class, phrases):
    """Helper function to process a single stock."""
    try:
        # Use cached sentiment (from Celery) or compute live
        sentiment_data = get_cached_sentiment(ticker)
        sentiment_score = sentiment_data["score"]
        sentiment_confidence = sentiment_data.get("confidence", 0.5)
        headlines = sentiment_data["headlines"]

        profile = get_stock_profile(ticker)
        beta = profile["beta"]
        price = profile["price"]
        sector = profile["sector"]

        if price <= 0:
            return None

        # --- Scoring Algorithm (100 points max) ---

        # Sentiment: up to 40 points (confidence-weighted)
        sentiment_pts = (sentiment_score + 1) * 20  # maps -1..1 to 0..40

        # Risk alignment: up to 40 points
        if user_class == "Conservative":
            beta_pts = max(0, (1.2 - beta) * 33)
        elif user_class == "Aggressive":
            beta_pts = max(0, (beta - 0.5) * 28)
        else:  # Moderate
            beta_pts = max(0, (1.0 - abs(beta - 1.0)) * 40)

        # Valuation: up to 20 points
        valuation_pts = 10  # neutral default
        price_position = 0.5
        if profile["week52_high"] > 0:
            price_position = (price - profile["week52_low"]) / (profile["week52_high"] - profile["week52_low"] + 0.01)
            valuation_pts = (1 - price_position) * 20

        total_score = sentiment_pts + beta_pts + valuation_pts

        # --- Build translated reasoning ---
        if user_class == "Conservative":
            fit_phrase = phrases['conservative_low_beta'] if beta < 0.9 else phrases['conservative_other']
        elif user_class == "Aggressive":
            fit_phrase = phrases['aggressive_high_beta'] if beta > 1.1 else phrases['aggressive_other']
        else:
            fit_phrase = phrases['moderate']

        if sentiment_score > 0.1:
            news_phrase = phrases['news_positive']
        elif sentiment_score < -0.1:
            news_phrase = phrases['news_cautious']
        else:
            news_phrase = phrases['news_neutral']

        reasoning = f"{fit_phrase} {news_phrase}"
        if price_position < 0.3:
            reasoning += f" {phrases['value_low']}"
        elif price_position > 0.8:
            reasoning += f" {phrases['value_high']}"

        return {
            "Ticker": ticker,
            "Name": profile["name"],
            "Price": round(price, 2),
            "Sector": sector,
            "Confidence": min(99, max(45, int(total_score))),
            "Reasoning": reasoning,
            "Headlines": headlines,
            "Score": total_score,
            # XAI: score breakdown for explainability
            "xai": {
                "sentiment_score": round(sentiment_score, 3),
                "sentiment_confidence": round(sentiment_confidence, 3),
                "sentiment_pts": round(sentiment_pts, 1),
                "risk_fit_pts": round(beta_pts, 1),
                "valuation_pts": round(valuation_pts, 1),
                "beta": round(beta, 2),
                "price_position_52w": round(price_position, 2),
            }
        }
    except Exception as e:
        print(f"Skipping {ticker}: {e}")
        return None


def recommend_stocks(user_profile: dict, max_recommendations: int = 5, lang: str = 'en') -> str:
    """
    Main recommendation function.
    Returns JSON with scored, ranked stocks including:
    - XAI score breakdown (sentiment, risk_fit, valuation)
    - Translated reasoning
    - Sectoral diversity (max 2 per sector)
    - News headlines with confidence
    """
    phrases = REASONING.get(lang, REASONING['en'])

    # 1. Predict User Class
    export_data = load_model()
    model = export_data['model']
    encoder = export_data['goal_encoder']

    encoded_goal = encoder.transform([user_profile['Investment_Goal']])[0]

    feature_dict = {
        'Age': user_profile['Age'],
        'Income': user_profile['Income'],
        'Risk_Tolerance': user_profile['Risk_Tolerance'],
        'Investment_Goal_Encoded': encoded_goal
    }

    feature_columns = export_data.get('feature_columns', list(feature_dict.keys()))
    if 'Experience_Years' in feature_columns:
        feature_dict['Experience_Years'] = max(0, user_profile.get('Age', 25) - 21)

    df_features = pd.DataFrame([feature_dict])[feature_columns]
    user_class_num = model.predict(df_features)[0]
    
    if 'label_encoder' in export_data:
        user_class = export_data['label_encoder'].inverse_transform([user_class_num])[0]
    else:
        user_class = user_class_num
        
    print(f"Determined User Class: {user_class}")

    # 2. Score every stock in the universe concurrently
    scored_stocks = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
        futures = {executor.submit(_process_single_stock, ticker, user_class, phrases): ticker for ticker in STOCK_UNIVERSE}
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            if result:
                scored_stocks.append(result)

    # 3. Sort by score, enforce sector diversity (max 2 per sector)
    scored_stocks.sort(key=lambda x: x['Score'], reverse=True)

    final_picks = []
    sector_count = {}

    for stock in scored_stocks:
        if len(final_picks) >= max_recommendations:
            break
        sector = stock['Sector']
        if sector_count.get(sector, 0) >= MAX_PER_SECTOR:
            continue  # Skip: already 2 from this sector
        sector_count[sector] = sector_count.get(sector, 0) + 1
        pick = {k: v for k, v in stock.items() if k != 'Score'}
        final_picks.append(pick)

    return json.dumps({
        "User_Profile": user_profile,
        "Assigned_Class": user_class,
        "Recommended_Stocks": final_picks
    }, indent=4)


if __name__ == "__main__":
    print("--- Running Recommendation Engine Test ---")
    test_profile = {
        'Age': 26,
        'Income': 2500000,
        'Risk_Tolerance': 5,
        'Investment_Goal': 'Wealth'
    }
    print(recommend_stocks(test_profile))
