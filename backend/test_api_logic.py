import os
import django
import json
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'robo_advisor.settings')
sys.path.append(os.path.join(os.getcwd(), 'backend'))
django.setup()

from recommender.engine import recommend_stocks
from recommender.ensemble_predictor import ensemble_predict
from recommender.sentiment import get_market_sentiment

def test_recommendation_logic():
    print("=== Testing Recommendation Logic ===")
    sample_data = {
        'Age': 26, # Using same as engine.py test
        'Income': 2500000,
        'Risk_Tolerance': 5,
        'Investment_Goal': 'Wealth' # Fixed label
    }
    try:
        result_json = recommend_stocks(sample_data, lang='en')
        result = json.loads(result_json)
        print("OK: Recommendation structure is valid JSON.")
        print(f"OK: Recommendation contains {len(result.get('Recommended_Stocks', []))} stocks.")
        print(f"OK: Assigned Class: {result.get('Assigned_Class')}")
        return True
    except Exception as e:
        print(f"FAIL: Recommendation Logic Failed: {e}")
        return False

def test_prediction_logic():
    print("\n=== Testing Prediction Logic (Ensemble) ===")
    ticker = "RELIANCE.NS"
    try:
        result = ensemble_predict(ticker)
        print(f"OK: Ensemble prediction for {ticker} successful.")
        print(f"OK: History length: {len(result.get('history', []))}")
        print(f"OK: Predictions length: {len(result.get('predictions', []))}")
        print(f"OK: Confidence metrics present: {'metrics' in result}")
        return True
    except Exception as e:
        print(f"FAIL: Prediction Logic Failed: {e}")
        return False

def test_sentiment_logic():
    print("\n=== Testing Sentiment Logic ===")
    ticker = "RELIANCE.NS"
    try:
        result = get_market_sentiment(ticker)
        print(f"OK: Sentiment analysis for {ticker} successful.")
        print(f"OK: Score: {result.get('score')} | Confidence: {result.get('confidence')}")
        print(f"OK: Headlines count: {len(result.get('headlines', []))}")
        return True
    except Exception as e:
        print(f"FAIL: Sentiment Logic Failed: {e}")
        return False

if __name__ == "__main__":
    r_ok = test_recommendation_logic()
    p_ok = test_prediction_logic()
    s_ok = test_sentiment_logic()
    
    if r_ok and p_ok and s_ok:
        print("\n✅ ALL API LOGIC TESTS PASSED.")
    else:
        print("\n❌ SOME TESTS FAILED.")
        sys.exit(1)
