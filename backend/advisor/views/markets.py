import math
import time
import yfinance as yf
from django.http import JsonResponse

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

# ============= CACHE =============
market_cache = {}
CACHE_DURATION = 600  # 10 minutes


STOCK_NAME_MAPPING = {
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "TATA CONSULTANCY": "TCS.NS",
    "HDFC BANK": "HDFCBANK.NS",
    "INFOSYS": "INFY.NS",
    "INFY": "INFY.NS",
    "ICICI BANK": "ICICIBANK.NS",
    "HINDUSTAN UNILEVER": "HINDUNILVR.NS",
    "HUL": "HINDUNILVR.NS",
    "UNILEVER": "HINDUNILVR.NS",
    "ITC": "ITC.NS",
    "SBI": "SBIN.NS",
    "STATE BANK": "SBIN.NS",
    "BHARTI AIRTEL": "BHARTIARTL.NS",
    "AIRTEL": "BHARTIARTL.NS",
    "KOTAK": "KOTAKBANK.NS",
    "L&T": "LT.NS",
    "LARSEN": "LT.NS",
    "AXIS": "AXISBANK.NS",
    "ASIAN PAINTS": "ASIANPAINT.NS",
    "MARUTI": "MARUTI.NS",
    "SUN PHARMA": "SUNPHARMA.NS",
    "BAJAJ FINANCE": "BAJFINANCE.NS",
    "TITAN": "TITAN.NS",
    "ULTRATECH": "ULTRACEMCO.NS",
    "BAJAJ FINSERV": "BAJAJFINSV.NS",
    "WIPRO": "WIPRO.NS",
}

# Popular NIFTY 50 tickers for top movers — use batch download
TOP_MOVERS_TICKERS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
    "HINDUNILVR.NS", "ITC.NS", "SBIN.NS", "BHARTIARTL.NS", "KOTAKBANK.NS",
    "LT.NS", "AXISBANK.NS", "ASIANPAINT.NS", "MARUTI.NS", "SUNPHARMA.NS",
    "BAJFINANCE.NS", "TITAN.NS", "ULTRACEMCO.NS", "BAJAJFINSV.NS", "WIPRO.NS",
    "TATASTEEL.NS", "ADANIENT.NS", "ONGC.NS", "TATAMOTORS.NS", "POWERGRID.NS",
]

# Friendly short names for top movers (fallback)
TICKER_SHORT_NAMES = {
    "RELIANCE": "Reliance Ind.", "TCS": "TCS", "HDFCBANK": "HDFC Bank",
    "INFY": "Infosys", "ICICIBANK": "ICICI Bank", "HINDUNILVR": "HUL",
    "ITC": "ITC", "SBIN": "SBI", "BHARTIARTL": "Bharti Airtel",
    "KOTAKBANK": "Kotak Bank", "LT": "L&T", "AXISBANK": "Axis Bank",
    "ASIANPAINT": "Asian Paints", "MARUTI": "Maruti Suzuki",
    "SUNPHARMA": "Sun Pharma", "BAJFINANCE": "Bajaj Finance",
    "TITAN": "Titan", "ULTRACEMCO": "UltraTech", "BAJAJFINSV": "Bajaj Finserv",
    "WIPRO": "Wipro", "TATASTEEL": "Tata Steel", "ADANIENT": "Adani Ent.",
    "ONGC": "ONGC", "TATAMOTORS": "Tata Motors", "POWERGRID": "Power Grid",
}


# ============= HELPERS =============

def safe_float(val, default=0.0):
    """Convert value to float, returning default if NaN/None/invalid."""
    try:
        f = float(val)
        if math.isnan(f) or math.isinf(f):
            return default
        return f
    except (TypeError, ValueError):
        return default


def safe_int(val, default=0):
    """Convert value to int, returning default if NaN/None/invalid."""
    try:
        f = float(val)
        if math.isnan(f) or math.isinf(f):
            return default
        return int(f)
    except (TypeError, ValueError):
        return default


def get_market_data(symbol, name):
    current_time = time.time()

    # Check cache first
    if symbol in market_cache:
        cached_data = market_cache[symbol]
        if current_time - cached_data['timestamp'] < CACHE_DURATION:
            latest_price = cached_data['price']
            change = cached_data.get('change', 0.0)
            percent_change = cached_data.get('percent', 0.0)
            return {
                "name": name,
                "value": f"{latest_price:,.2f}",
                "change": f"{'+' if change >= 0 else ''}{change:,.2f}",
                "percent": f"{'+' if percent_change >= 0 else ''}{percent_change}%"
            }

    # Fetch from API
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="5d")

        if data.empty or "Close" not in data.columns:
            raise ValueError("No data found")

        close_data = data["Close"].dropna()
        if close_data.empty:
            raise ValueError("Invalid price data")

        latest_price = round(float(close_data.iloc[-1]), 2)
        if latest_price <= 0.0:
            raise ValueError("Invalid price data")

        # Calculate change
        if len(close_data) >= 2:
            prev_close = safe_float(close_data.iloc[-2], latest_price)
            change = round(latest_price - prev_close, 2)
            percent_change = round((change / prev_close) * 100, 2) if prev_close != 0 else 0.0
        else:
            prev_close = latest_price
            change = 0.0
            percent_change = 0.0

            try:
                info = ticker.info
                if info.get('previousClose'):
                    prev_close = safe_float(info['previousClose'], latest_price)
                    change = round(latest_price - prev_close, 2)
                    percent_change = round((change / prev_close) * 100, 2) if prev_close != 0 else 0.0
            except Exception:
                pass

        # Update cache
        market_cache[symbol] = {
            'price': latest_price,
            'change': change,
            'percent': percent_change,
            'timestamp': current_time
        }

    except Exception as err:
        print(f"[get_market_data ERROR] {symbol}: {err}")
        if symbol in market_cache:
            cached = market_cache[symbol]
            latest_price = cached['price']
            change = cached.get('change', 0.0)
            percent_change = cached.get('percent', 0.0)
        else:
            # Fallback for indices vs stocks
            if "^NSEI" in symbol:
                latest_price = 24187.70
            elif "^BSESN" in symbol:
                latest_price = 77470.11
            elif "^NSEBANK" in symbol:
                latest_price = 57835.35
            else:
                # Try fetching info or ticker fast fallback
                try:
                    info = yf.Ticker(symbol).fast_info
                    latest_price = round(float(info.last_price), 2)
                except Exception:
                    latest_price = 0.0
            change = 0.0
            percent_change = 0.0

    return {
        "name": name,
        "value": f"{latest_price:,.2f}",
        "change": f"{'+' if change >= 0 else ''}{change:,.2f}",
        "percent": f"{'+' if percent_change >= 0 else ''}{percent_change}%"
    }



# ============= VIEWS =============

def analyze_stock(request, symbol):
    try:
        ticker = yf.Ticker(f"{symbol}.NS")
        df = ticker.history(period="5d")

        if df.empty or "Close" not in df.columns:
            return JsonResponse({"error": f"No data found for {symbol}"}, status=404)

        latest_price = safe_float(df["Close"].iloc[-1])
        average_price = safe_float(df["Close"].mean())
        suggestion = "Buy" if latest_price < average_price else "Hold"

        return JsonResponse({
            "symbol": symbol,
            "latest_price": round(latest_price, 2),
            "average_price": round(average_price, 2),
            "suggestion": suggestion
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def get_market_status(request):
    indices = [
        {"symbol": "^NSEI", "name": "NIFTY 50"},
        {"symbol": "^BSESN", "name": "SENSEX"},
        {"symbol": "^NSEBANK", "name": "BANK NIFTY"},
        {"symbol": "^CNXIT", "name": "NIFTY IT"},
        {"symbol": "^IXIC", "name": "NASDAQ"},
        {"symbol": "^GSPC", "name": "S&P 500"},
        {"symbol": "GC=F", "name": "GOLD"},
        {"symbol": "INR=X", "name": "USD/INR"},
    ]

    results = []
    for index in indices:
        results.append(get_market_data(index["symbol"], index["name"]))

    return JsonResponse(results, safe=False)


def get_nifty(request):
    return JsonResponse(get_market_data("^NSEI", "NIFTY 50"))


def get_sensex(request):
    return JsonResponse(get_market_data("^BSESN", "SENSEX"))


def get_banknifty(request):
    return JsonResponse(get_market_data("^NSEBANK", "BANK NIFTY"))


@api_view(['GET'])
@permission_classes([AllowAny])   # Allow guests to search stocks too
def search_stock(request):
    ticker_param = request.GET.get('ticker', '').upper().strip()
    risk_class = request.GET.get('risk', '').strip()

    if not ticker_param:
        return JsonResponse({"error": "Ticker parameter is required"}, status=400)

    # Try .NS first, then .BO as fallback
    suffixes = [''] if ('.' in ticker_param or ticker_param.startswith('^')) else ['.NS', '.BO']
    tickers_to_try = [ticker_param] if ('.' in ticker_param or ticker_param.startswith('^')) else [ticker_param + s for s in suffixes]

    # Check friendly name mapping first
    if ticker_param in STOCK_NAME_MAPPING:
        mapped = STOCK_NAME_MAPPING[ticker_param]
        if mapped in tickers_to_try:
            tickers_to_try.remove(mapped)
        tickers_to_try.insert(0, mapped)

    last_error = "Stock not found"

    for symbol in tickers_to_try:
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period="5d")

            if data.empty:
                continue

            # Drop rows where Close is NaN (yfinance sometimes returns today
            # with NaN OHLC before market close)
            close_data = data["Close"].dropna()
            if close_data.empty:
                continue

            latest_price = round(float(close_data.iloc[-1]), 2)
            average_price = safe_float(data["Close"].mean(), latest_price)

            info = {}
            try:
                info = ticker.info
            except Exception:
                pass

            name = info.get('longName') or info.get('shortName') or symbol
            previous_close = safe_float(info.get('previousClose'), latest_price)
            change = round(((latest_price - previous_close) / previous_close) * 100, 2) if previous_close != 0 else 0.0
            volume = safe_int(info.get('volume'), 0)

            # Default simple suggestion
            suggestion = "Buy" if latest_price < average_price else "Hold"
            confidence = None
            reasoning = None

            # ML-powered risk-aware suggestion (only for logged-in users)
            if risk_class and risk_class in ('Conservative', 'Moderate', 'Aggressive'):
                try:
                    from recommender.engine import get_stock_profile, REASONING
                    try:
                        from advisor.tasks import get_cached_sentiment
                    except ImportError:
                        get_cached_sentiment = None

                    profile = get_stock_profile(symbol)
                    beta = safe_float(profile.get("beta"), 1.0)
                    price = safe_float(profile.get("price"), latest_price)
                    if price <= 0:
                        price = latest_price

                    sentiment_score = 0.0
                    if get_cached_sentiment:
                        try:
                            sentiment_data = get_cached_sentiment(symbol)
                            sentiment_score = safe_float(sentiment_data.get("score"), 0.0)
                        except Exception:
                            pass

                    sentiment_pts = (sentiment_score + 1) * 20

                    if risk_class == "Conservative":
                        beta_pts = max(0, (1.2 - beta) * 33)
                    elif risk_class == "Aggressive":
                        beta_pts = max(0, (beta - 0.5) * 28)
                    else:
                        beta_pts = max(0, (1.0 - abs(beta - 1.0)) * 40)

                    week52_high = safe_float(profile.get("week52_high"), 0.0)
                    week52_low = safe_float(profile.get("week52_low"), 0.0)
                    price_position = 0.5
                    if week52_high > 0 and week52_high != week52_low:
                        price_position = (price - week52_low) / (week52_high - week52_low + 0.01)

                    valuation_pts = (1 - price_position) * 20
                    total_score = sentiment_pts + beta_pts + valuation_pts
                    confidence = min(99, max(30, int(total_score)))

                    if total_score >= 60:
                        suggestion = "Buy"
                    elif total_score >= 40:
                        suggestion = "Hold"
                    else:
                        suggestion = "Avoid"

                    phrases = REASONING.get('en', {})
                    if risk_class == "Conservative":
                        fit_phrase = phrases.get('conservative_low_beta', '') if beta < 0.9 else phrases.get('conservative_other', '')
                    elif risk_class == "Aggressive":
                        fit_phrase = phrases.get('aggressive_high_beta', '') if beta > 1.1 else phrases.get('aggressive_other', '')
                    else:
                        fit_phrase = phrases.get('moderate', '')

                    if sentiment_score > 0.1:
                        news_phrase = phrases.get('news_positive', '')
                    elif sentiment_score < -0.1:
                        news_phrase = phrases.get('news_cautious', '')
                    else:
                        news_phrase = phrases.get('news_neutral', '')

                    reasoning = f"{fit_phrase} {news_phrase}".strip()
                    if price_position < 0.3:
                        reasoning += f" {phrases.get('value_low', '')}"
                    elif price_position > 0.8:
                        reasoning += f" {phrases.get('value_high', '')}"

                except Exception as ml_err:
                    print(f"ML scoring fallback for {symbol}: {ml_err}")

            return JsonResponse({
                "symbol": symbol,
                "name": name,
                "price": latest_price,
                "change_percent": change,
                "volume": volume,
                "suggestion": suggestion,
                "confidence": confidence,
                "reasoning": reasoning,
            })

        except Exception as e:
            last_error = str(e)
            continue

    return JsonResponse({"error": last_error}, status=404)


def get_news(request):
    symbol_param = request.GET.get('symbol', '^NSEI')
    symbols = [s.strip() for s in symbol_param.split(',') if s.strip()]

    try:
        all_news = []
        seen_titles = set()

        for symbol in symbols[:5]:
            try:
                ticker = yf.Ticker(symbol)
                news = ticker.news

                if not news:
                    continue

                for item in news[:5]:
                    content = item.get('content', item)
                    title = content.get('title', '') or item.get('title', '')

                    if not title or title in seen_titles:
                        continue
                    seen_titles.add(title)

                    provider = content.get('provider', {})
                    if isinstance(provider, dict):
                        publisher = provider.get('displayName', '') or provider.get('name', 'Market News')
                    else:
                        publisher = str(provider) if provider else item.get('publisher', 'Market News')

                    canonical = content.get('canonicalUrl', {})
                    if isinstance(canonical, dict):
                        link = canonical.get('url', '')
                    else:
                        link = str(canonical) if canonical else ''

                    if not link:
                        link = item.get('link', '') or f"https://finance.yahoo.com/quote/{symbol}"

                    pub_time = content.get('pubDate', None) or item.get('providerPublishTime', None)
                    if isinstance(pub_time, str):
                        try:
                            from datetime import datetime
                            dt = datetime.fromisoformat(pub_time.replace('Z', '+00:00'))
                            pub_time = int(dt.timestamp())
                        except Exception:
                            pub_time = None

                    all_news.append({
                        'title': title,
                        'publisher': publisher or 'Market News',
                        'link': link,
                        'time': pub_time,
                        'type': content.get('contentType', item.get('type', 'STORY')),
                        'symbol': symbol.replace('.NS', '')
                    })
            except Exception as e:
                print(f"News fetch error for {symbol}: {e}")
                continue

        all_news.sort(key=lambda x: x.get('time') or 0, reverse=True)
        return JsonResponse(all_news[:15], safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_top_movers(request):
    """Return top 3 gainers and top 3 losers using batch yfinance download."""
    current_time = time.time()
    cache_key = '__top_movers__'

    # Check cache (5 min TTL)
    if cache_key in market_cache:
        cached = market_cache[cache_key]
        if current_time - cached['timestamp'] < 300:
            return JsonResponse(cached['data'])

    movers = []

    try:
        # Batch download all tickers at once — MUCH faster than one-by-one
        raw = yf.download(
            tickers=TOP_MOVERS_TICKERS,
            period="3d",
            interval="1d",
            group_by="ticker",
            auto_adjust=True,
            progress=False,
            threads=True,
        )

        for ticker_symbol in TOP_MOVERS_TICKERS:
            try:
                base = ticker_symbol.replace('.NS', '')
                # Handle both multi-ticker and single-ticker dataframe shapes
                if len(TOP_MOVERS_TICKERS) > 1:
                    if ticker_symbol not in raw.columns.get_level_values(0):
                        continue
                    df = raw[ticker_symbol].dropna(subset=['Close'])
                else:
                    df = raw.dropna(subset=['Close'])

                if df.empty or len(df) < 2:
                    continue

                # Drop NaN close rows (today's data can be NaN before market close)
                close_series = df['Close'].dropna()
                if len(close_series) < 2:
                    continue

                latest_price = safe_float(close_series.iloc[-1])
                prev_close = safe_float(close_series.iloc[-2])

                change_pct = round(((latest_price - prev_close) / prev_close) * 100, 2)
                volume = safe_int(df['Volume'].iloc[-1] if 'Volume' in df.columns else 0)

                name = TICKER_SHORT_NAMES.get(base, base)

                # Format volume
                if volume >= 1_000_000:
                    vol_str = f"{volume / 1_000_000:.1f}M"
                elif volume >= 1_000:
                    vol_str = f"{volume / 1_000:.1f}K"
                else:
                    vol_str = str(volume)

                movers.append({
                    "symbol": base,
                    "name": name,
                    "price": round(latest_price, 2),
                    "change": change_pct,
                    "volume": vol_str,
                })
            except Exception as e:
                print(f"Top movers parse error for {ticker_symbol}: {e}")
                continue

    except Exception as e:
        print(f"Top movers batch download error: {e}")
        # Fall back to empty result
        pass

    # Sort by change
    gainers = sorted([m for m in movers if m['change'] > 0], key=lambda x: x['change'], reverse=True)[:5]
    losers = sorted([m for m in movers if m['change'] < 0], key=lambda x: x['change'])[:5]

    result = {"gainers": gainers, "losers": losers}

    # Cache result
    market_cache[cache_key] = {
        'data': result,
        'timestamp': current_time,
    }

    return JsonResponse(result)
