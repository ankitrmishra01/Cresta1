import yfinance as yf
from django.http import JsonResponse

def analyze_stock(request, symbol):
    try:
        # Append .NS for NSE stocks
        ticker = yf.Ticker(f"{symbol}.NS")
        df = ticker.history(period="5d")

        if df.empty or "Close" not in df.columns:
            return JsonResponse({"error": f"No data found for {symbol}"}, status=404)

        latest_price = df["Close"].iloc[-1]
        average_price = df["Close"].mean()

        suggestion = "Buy" if latest_price < average_price else "Hold"

        return JsonResponse({
            "symbol": symbol,
            "latest_price": round(latest_price, 2),
            "average_price": round(average_price, 2),
            "suggestion": suggestion
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
    
import time

# Simple in-memory cache
# Format: {symbol: {'price': 123.45, 'timestamp': 1700000000}}
market_cache = {}
CACHE_DURATION = 600  # 10 minutes

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
        data = ticker.history(period="2d") # Fetch 2 days to get previous close
        
        if data.empty or "Close" not in data.columns:
             raise ValueError("No data found")
             
        latest_price = round(data["Close"].iloc[-1], 2)
        
        # Calculate change
        if len(data) >= 2:
            prev_close = data["Close"].iloc[-2]
            change = round(latest_price - prev_close, 2)
            percent_change = round((change / prev_close) * 100, 2)
        else:
            # Fallback if only 1 day data is available (e.g. new listing or API issue)
            prev_close = latest_price
            change = 0.0
            percent_change = 0.0
            
            # Try getting previousClose from info if history is insufficient
            try:
                info = ticker.info
                if 'previousClose' in info and info['previousClose']:
                    prev_close = info['previousClose']
                    change = round(latest_price - prev_close, 2)
                    percent_change = round((change / prev_close) * 100, 2)
            except:
                pass

        # Update cache
        market_cache[symbol] = {
            'price': latest_price,
            'change': change,
            'percent': percent_change,
            'timestamp': current_time
        }
        
    except Exception:
        # If fetch fails, use cached if available (even if expired), or fallback
        if symbol in market_cache:
             cached = market_cache[symbol]
             latest_price = cached['price']
             change = cached.get('change', 0.0)
             percent_change = cached.get('percent', 0.0)
        else:
             # Hardcoded fallbacks
             latest_price = 24000.00 if "NSEI" in symbol else 79000.00 if "BSESN" in symbol else 51000.00
             change = 0.0
             percent_change = 0.0
    
    return {
        "name": name,
        "value": f"{latest_price:,.2f}",
        "change": f"{'+' if change >= 0 else ''}{change:,.2f}",
        "percent": f"{'+' if percent_change >= 0 else ''}{percent_change}%"
    }

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
    data = get_market_data("^NSEI", "NIFTY 50")
    return JsonResponse(data)

def get_sensex(request):
    data = get_market_data("^BSESN", "SENSEX")
    return JsonResponse(data)

def get_banknifty(request):
    data = get_market_data("^NSEBANK", "BANK NIFTY")
    return JsonResponse(data)

def search_stock(request):
    symbol = request.GET.get('symbol')
    if not symbol:
        return JsonResponse({"error": "Symbol parameter is required"}, status=400)
    
    # Auto-append .NS if not present (assuming NSE for Indian context)
    if not symbol.endswith('.NS') and not symbol.endswith('.BO') and not symbol.startswith('^'):
        symbol = f"{symbol}.NS"
        
    try:
        # Check cache first (using the existing cache mechanism)
        if symbol in market_cache:
            cached_data = market_cache[symbol]
            if time.time() - cached_data['timestamp'] < CACHE_DURATION:
                return JsonResponse({
                    "symbol": symbol,
                    "name": cached_data.get('name', symbol),
                    "price": cached_data['price'],
                    "change_percent": cached_data.get('change_percent', 0.0),
                    "volume": cached_data.get('volume', "N/A"),
                    "suggestion": cached_data.get('suggestion', "Hold") 
                })

        ticker = yf.Ticker(symbol)
        data = ticker.history(period="5d")
        
        if data.empty:
             return JsonResponse({"error": "Stock not found"}, status=404)
        
        latest_price = round(data["Close"].iloc[-1], 2)
        average_price = data["Close"].mean()
        suggestion = "Buy" if latest_price < average_price else "Hold"
        
        # Try to get more info
        info = ticker.info
        name = info.get('longName', symbol)
        previous_close = info.get('previousClose', latest_price)
        change = round(((latest_price - previous_close) / previous_close) * 100, 2)
        volume = info.get('volume', 0)
        
        # Update cache
        market_cache[symbol] = {
            'price': latest_price,
            'timestamp': time.time(),
            'name': name,
            'change_percent': change,
            'volume': volume,
            'suggestion': suggestion
        }
        
        return JsonResponse({
            "symbol": symbol,
            "name": name,
            "price": latest_price,
            "change_percent": change,
            "volume": volume,
            "suggestion": suggestion
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

import json
import requests
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def google_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            access_token = data.get('access_token')
            
            if not access_token:
                return JsonResponse({'error': 'No access_token provided'}, status=400)
                
            # Fetch user info from Google using the access token
            response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            
            if response.status_code != 200:
                return JsonResponse({'error': 'Failed to fetch user info from Google'}, status=400)
                
            user_info = response.json()
            email = user_info.get('email')
            name = user_info.get('name', email.split('@')[0] if email else 'Google User')
            picture = user_info.get('picture', '')
            
            # Return user details for the frontend context
            return JsonResponse({
                'success': True,
                'user': {
                    'email': email,
                    'name': name,
                    'picture': picture
                }
            })
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)
