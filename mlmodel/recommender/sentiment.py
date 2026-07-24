import yfinance as yf
from transformers import pipeline

# Global cache for the pipeline — loaded at startup via AppConfig.ready()
_finbert_pipeline = None


def load_finbert():
    """Load FinBERT model. Called at Django startup via AppConfig.ready()."""
    global _finbert_pipeline
    if _finbert_pipeline is None:
        print("[ML] Loading FinBERT model at startup...")
        _finbert_pipeline = pipeline(
            "sentiment-analysis",
            model="ProsusAI/finbert",
            tokenizer="ProsusAI/finbert"
        )
        print("[ML] FinBERT loaded successfully.")
    return _finbert_pipeline


def get_finbert():
    """Get the loaded FinBERT pipeline (lazy fallback if not preloaded)."""
    global _finbert_pipeline
    if _finbert_pipeline is None:
        load_finbert()
    return _finbert_pipeline


def get_market_sentiment(ticker: str) -> dict:
    """
    Fetches news headlines for a given ticker and returns:
    - score: float between -1.0 and 1.0 (confidence-weighted)
    - confidence: average confidence of the model
    - headlines: list of top 5 headline strings with sentiment + confidence
    """
    pipe = get_finbert()

    stock = yf.Ticker(ticker)
    news = stock.news

    if not news:
        return {"score": 0.0, "confidence": 0.0, "headlines": []}

    # Handle new yfinance format: title is under item['content']['title']
    headlines = []
    for item in news:
        content = item.get('content', item)
        title = content.get('title', '') or item.get('title', '')
        if title:
            headlines.append(title)

    if not headlines:
        return {"score": 0.0, "confidence": 0.0, "headlines": []}

    # Analyze sentiment for each headline
    results = pipe(headlines[:10])  # Limit to 10 for speed

    scored_headlines = []
    weighted_score = 0.0
    total_confidence = 0.0
    valid_results = 0

    for hl, res in zip(headlines[:10], results):
        label = res.get('label', '').lower()
        confidence = round(res.get('score', 0.5), 3)  # FinBERT confidence

        if label == 'positive':
            weighted_score += confidence  # Confidence-weighted positive
            valid_results += 1
            total_confidence += confidence
            scored_headlines.append({
                "text": hl,
                "sentiment": "positive",
                "confidence": confidence
            })
        elif label == 'negative':
            weighted_score -= confidence  # Confidence-weighted negative
            valid_results += 1
            total_confidence += confidence
            scored_headlines.append({
                "text": hl,
                "sentiment": "negative",
                "confidence": confidence
            })
        elif label == 'neutral':
            valid_results += 1
            total_confidence += confidence
            scored_headlines.append({
                "text": hl,
                "sentiment": "neutral",
                "confidence": confidence
            })

    avg_score = weighted_score / valid_results if valid_results > 0 else 0.0
    avg_confidence = total_confidence / valid_results if valid_results > 0 else 0.0

    # Sort by confidence (highest first)
    scored_headlines.sort(key=lambda x: x['confidence'], reverse=True)

    return {
        "score": round(avg_score, 3),
        "confidence": round(avg_confidence, 3),
        "headlines": scored_headlines[:5]  # Return top 5
    }


if __name__ == "__main__":
    test_ticker = "RELIANCE.NS"
    print(f"Testing sentiment for {test_ticker}")
    result = get_market_sentiment(test_ticker)
    print(f"Score: {result['score']} (confidence: {result['confidence']})")
    for hl in result['headlines']:
        print(f"  [{hl['sentiment']} {hl['confidence']:.0%}] {hl['text']}")
