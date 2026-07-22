import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'robo_advisor.settings')
django.setup()

from recommender.sentiment import get_market_sentiment
from recommender.constants import STOCK_UNIVERSE

def test_sentiment_single():
    ticker = "RELIANCE.NS"
    print(f"Testing sentiment for {ticker}...")
    try:
        result = get_market_sentiment(ticker)
        print(f"Result: {result}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    test_sentiment_single()
