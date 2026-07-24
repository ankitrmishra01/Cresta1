"""
LangChain tool definitions for the CRESTA chatbot.

Tools are built per-request via `build_tools(user)`, which returns a list
of @tool-decorated closures bound to the authenticated Django user. This
means the LLM never has to pass a user_id — it's scoped automatically,
the same way your other advisor views scope queries to request.user.

Wired directly to your existing code:
- Holding / UserProfile / WatchlistAlert  -> advisor.models
- get_cached_sentiment                    -> advisor.tasks
- ensemble_predict                        -> recommender.ensemble_predictor
- get_market_data / STOCK_NAME_MAPPING    -> advisor.views.markets

run_backtest has no existing engine to call into (no BacktestEngine was
found in the uploaded code), so it's implemented here from scratch as a
simple buy-and-hold calculation over yfinance history.
"""
import yfinance as yf
from django.contrib.auth.models import User
from langchain.tools import tool

from advisor.models import Holding, UserProfile, WatchlistAlert
from advisor.tasks import get_cached_sentiment
from advisor.views.markets import get_market_data as _market_snapshot, STOCK_NAME_MAPPING

TICKER_ALIASES = {
    'INFOSYS': 'INFY', 'TATAMOTORS': 'TATAMTRDVR', 'BAJAJFINSERV': 'BAJFINANCE',
    'STATEBANK': 'SBIN', 'SBI': 'SBIN',
}

INDEX_MAP = {
    "NIFTY": ("^NSEI", "NIFTY 50"),
    "NIFTY50": ("^NSEI", "NIFTY 50"),
    "SENSEX": ("^BSESN", "SENSEX"),
    "BANKNIFTY": ("^NSEBANK", "BANK NIFTY"),
}


def _normalize_ticker(raw: str) -> str:
    """Mirrors the alias/suffix logic already used in advisor/views."""
    t = raw.upper().strip()
    if t in STOCK_NAME_MAPPING:
        return STOCK_NAME_MAPPING[t]
    base = t.replace('.NS', '').replace('.BO', '')
    if base in TICKER_ALIASES:
        base = TICKER_ALIASES[base]
    if not base.endswith('.NS') and not base.endswith('.BO') and not base.startswith('^'):
        base = f"{base}.NS"
    return base


def build_tools(user: User):
    """Return the list of LangChain tools scoped to `user`."""

    @tool
    def get_portfolio() -> dict:
        """Get the user's current holdings: quantities, average buy price,
        live price, P&L per stock, total portfolio value, and the
        best/worst performing holding."""
        if not user or not getattr(user, 'is_authenticated', False):
            return {"holdings": [], "message": "User is not logged in."}
        holdings = Holding.objects.filter(user=user)
        if not holdings.exists():
            return {"holdings": [], "message": "No holdings found for this user."}

        rows = []
        for h in holdings:
            ltp = h.avg_price
            try:
                info = yf.Ticker(h.ticker).info
                ltp = info.get('currentPrice', info.get('regularMarketPrice', h.avg_price)) or h.avg_price
            except Exception:
                pass
            pnl_pct = ((ltp - h.avg_price) / h.avg_price * 100) if h.avg_price else 0
            rows.append({
                "ticker": h.ticker,
                "name": h.name,
                "qty": h.qty,
                "avg_price": h.avg_price,
                "ltp": round(float(ltp), 2),
                "current_value": round(h.qty * ltp, 2),
                "pnl_pct": round(pnl_pct, 2),
            })

        total_value = sum(r["current_value"] for r in rows)
        total_invested = sum(r["qty"] * r["avg_price"] for r in rows)
        total_pnl_pct = ((total_value - total_invested) / total_invested * 100) if total_invested else 0
        best = max(rows, key=lambda r: r["pnl_pct"])
        worst = min(rows, key=lambda r: r["pnl_pct"])

        return {
            "holdings": rows,
            "total_invested": round(total_invested, 2),
            "total_current_value": round(total_value, 2),
            "total_pnl_pct": round(total_pnl_pct, 2),
            "best_performer": best,
            "worst_performer": worst,
        }

    @tool
    def get_forecast(ticker: str) -> dict:
        """Get a 7-day price forecast for a stock using the ensemble ML
        model (AttentionLSTM + XGBoost + ARIMA). Pass a ticker symbol,
        e.g. 'RELIANCE' or 'TCS'."""
        symbol = _normalize_ticker(ticker)
        try:
            from recommender.ensemble_predictor import ensemble_predict
            result = ensemble_predict(symbol)
            return {
                "ticker": symbol,
                "predictions": result.get("predictions", []),
                "metrics": result.get("metrics", {}),
                "model_breakdown": result.get("model_breakdown", {}),
                "model": "Ensemble (AttentionLSTM + XGBoost + ARIMA)",
            }
        except Exception as e:
            return {"error": f"Forecast unavailable for {symbol}: {e}"}

    @tool
    def get_risk_profile() -> dict:
        """Get the user's risk classification (Conservative/Balanced/
        Aggressive), risk score, investment goal, age and income."""
        if not user or not getattr(user, 'is_authenticated', False):
            return {"message": "User is not logged in."}
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if not profile.risk_profile:
            return {
                "message": "No risk assessment completed yet. Tell the "
                           "user to complete the risk assessment first."
            }
        return {
            "risk_profile": profile.risk_profile,
            "risk_score": profile.risk_score,
            "investment_goal": profile.investment_goal,
            "age": profile.age,
            "income": profile.income,
        }

    @tool
    def get_market_data(ticker: str) -> dict:
        """Get the live price, absolute change, and percent change for a
        stock ticker or a major index. Recognised index names: NIFTY,
        SENSEX, BANKNIFTY."""
        t = ticker.upper().strip()
        if t in INDEX_MAP:
            symbol, name = INDEX_MAP[t]
            return _market_snapshot(symbol, name)
        symbol = _normalize_ticker(ticker)
        return _market_snapshot(symbol, symbol.replace(".NS", "").replace(".BO", ""))

    @tool
    def create_alert(ticker: str, target_price: float, direction: str) -> dict:
        """Create a price alert for the user. direction must be 'above'
        or 'below'. Example: alert when TCS drops below 3800."""
        if not user or not getattr(user, 'is_authenticated', False):
            return {"error": "User must be logged in to create alerts."}
        symbol = _normalize_ticker(ticker)
        cond = "ABOVE" if direction.lower().startswith("above") else "BELOW"
        alert = WatchlistAlert.objects.create(
            user=user, ticker=symbol, target_price=target_price, condition=cond
        )

        return {
            "status": "created",
            "alert_id": alert.id,
            "ticker": symbol,
            "condition": cond,
            "target_price": target_price,
        }

    @tool
    def get_news_sentiment(ticker: str) -> dict:
        """Get FinBERT sentiment score and recent headlines for a stock."""
        symbol = _normalize_ticker(ticker)
        try:
            data = get_cached_sentiment(symbol)
            return {
                "ticker": symbol,
                "sentiment_score": data.get("score", 0.0),
                "confidence": data.get("confidence", 0),
                "headlines": data.get("headlines", []),
            }
        except Exception as e:
            return {"error": f"Sentiment unavailable for {symbol}: {e}"}

    @tool
    def run_backtest(ticker: str, start_date: str, capital: float) -> dict:
        """Backtest a simple buy-and-hold strategy. start_date format is
        YYYY-MM-DD, capital is in INR. Returns final value, return %,
        Sharpe ratio, and max drawdown."""
        symbol = _normalize_ticker(ticker)
        try:
            hist = yf.Ticker(symbol).history(start=start_date)
            if hist.empty:
                return {"error": f"No historical data for {symbol} since {start_date}"}

            start_price = float(hist["Close"].iloc[0])
            end_price = float(hist["Close"].iloc[-1])
            shares = capital / start_price
            final_value = shares * end_price
            return_pct = (final_value - capital) / capital * 100

            daily_returns = hist["Close"].pct_change().dropna()
            sharpe = (
                daily_returns.mean() / daily_returns.std() * (252 ** 0.5)
                if daily_returns.std() else 0
            )
            running_max = hist["Close"].cummax()
            max_drawdown = ((hist["Close"] - running_max) / running_max).min() * 100

            return {
                "ticker": symbol,
                "start_date": start_date,
                "initial_capital": capital,
                "final_value": round(final_value, 2),
                "return_pct": round(return_pct, 2),
                "sharpe_ratio": round(float(sharpe), 2),
                "max_drawdown_pct": round(float(max_drawdown), 2),
            }
        except Exception as e:
            return {"error": str(e)}

    return [
        get_portfolio,
        get_forecast,
        get_risk_profile,
        get_market_data,
        create_alert,
        get_news_sentiment,
        run_backtest,
    ]