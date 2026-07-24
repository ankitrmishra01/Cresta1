import json
import yfinance as yf
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from ..models import Holding, Transaction
from ..serializers import HoldingSerializer, HoldingUpdateSerializer, HoldingDeleteSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_holdings(request):
    """Get all holdings for the authenticated user with live prices."""
    user = request.user

    holdings = Holding.objects.filter(user=user)

    result = []
    for h in holdings:
        ltp = h.avg_price  # fallback
        try:
            ticker = yf.Ticker(h.ticker)
            info = ticker.info
            ltp = info.get('currentPrice', info.get('regularMarketPrice', h.avg_price))
            if not ltp:
                ltp = h.avg_price
        except:
            pass

        result.append({
            "id": h.id,
            "ticker": h.ticker,
            "name": h.name,
            "qty": h.qty,
            "avg": h.avg_price,
            "ltp": round(float(ltp), 2),
            "purchase_date": h.purchase_date.isoformat() if h.purchase_date else None
        })

    return Response(result)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_holding(request):
    """Add or update a stock holding."""
    serializer = HoldingSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    ticker = serializer.validated_data['ticker'].upper()
    qty = serializer.validated_data['qty']
    avg_price = serializer.validated_data['avg_price']
    purchase_date = serializer.validated_data.get('purchase_date')

    # Common ticker aliases for Indian stocks
    TICKER_ALIASES = {
        'INFOSYS': 'INFY', 'TATAMOTORS': 'TATAMTRDVR', 'BAJAJFINSERV': 'BAJFINANCE',
        'STATEBANK': 'SBIN', 'SBI': 'SBIN', 'ICICIBANK': 'ICICIBANK',
        'HDFCBANK': 'HDFCBANK', 'TATA': 'TATASTEEL', 'WIPRO': 'WIPRO',
    }
    base_ticker = ticker.replace('.NS', '').replace('.BO', '')
    if base_ticker in TICKER_ALIASES:
        ticker = TICKER_ALIASES[base_ticker]
    else:
        ticker = base_ticker

    # Auto-append .NS if not present
    if not ticker.endswith('.NS') and not ticker.endswith('.BO'):
        ticker = f"{ticker}.NS"

    # Fetch stock name
    name = ticker.replace('.NS', '')
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        name = info.get('longName', info.get('shortName', name))
    except:
        pass

    # Check if holding already exists — average up
    try:
        existing = Holding.objects.filter(user=user, ticker=ticker).first()
        if existing:
            total_qty = existing.qty + qty
            new_avg = ((existing.avg_price * existing.qty) + (avg_price * qty)) / total_qty
            existing.qty = total_qty
            existing.avg_price = round(new_avg, 2)
            if purchase_date:
                existing.purchase_date = purchase_date
            existing.save()
            holding = existing
        else:
            holding = Holding.objects.create(
                user=user,
                user_email=user.email,
                ticker=ticker,
                name=name,
                qty=qty,
                avg_price=avg_price,
                purchase_date=purchase_date
            )

        # Log BUY transaction
        Transaction.objects.create(
            user=user,
            ticker=ticker,
            name=name,
            transaction_type='BUY',
            qty=qty,
            price=avg_price,
            total_value=round(qty * avg_price, 2),
        )

        return Response({
            "id": holding.id,
            "ticker": holding.ticker,
            "name": holding.name,
            "qty": holding.qty,
            "avg": holding.avg_price,
            "message": "Holding added successfully"
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_holding(request):
    """Update quantity or avg price of an existing holding."""
    serializer = HoldingUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    holding_id = serializer.validated_data['id']

    try:
        holding = Holding.objects.filter(id=holding_id, user=user).first()
        if not holding:
            return Response({"error": "Holding not found"}, status=status.HTTP_404_NOT_FOUND)

        if 'qty' in serializer.validated_data:
            holding.qty = serializer.validated_data['qty']
        if 'avg_price' in serializer.validated_data:
            holding.avg_price = serializer.validated_data['avg_price']
        if 'purchase_date' in serializer.validated_data:
            holding.purchase_date = serializer.validated_data['purchase_date']

        if holding.qty <= 0:
            holding.delete()
            return Response({"message": "Holding removed (qty <= 0)"})

        holding.save()
        return Response({
            "id": holding.id,
            "ticker": holding.ticker,
            "qty": holding.qty,
            "avg": holding.avg_price,
            "message": "Holding updated"
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_holding(request):
    """Delete a holding."""
    serializer = HoldingDeleteSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    holding_id = serializer.validated_data['id']

    try:
        deleted = Holding.objects.filter(id=holding_id, user=user).delete()
        if deleted[0] == 0:
            return Response({"error": "Holding not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"message": "Holding deleted successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_portfolio_history(request):
    """Get historical portfolio value over time."""
    user = request.user
    period = request.query_params.get('period', '1mo')

    holdings = Holding.objects.filter(user=user)
    if not holdings.exists():
        return Response({"data": []})

    try:
        all_histories = {}
        for h in holdings:
            try:
                ticker = yf.Ticker(h.ticker)
                hist = ticker.history(period=period)
                if not hist.empty:
                    all_histories[h.ticker] = {
                        'qty': h.qty,
                        'prices': {idx.strftime('%Y-%m-%d'): round(float(row['Close']), 2)
                                   for idx, row in hist.iterrows()}
                    }
            except Exception as e:
                print(f"History error for {h.ticker}: {e}")

        if not all_histories:
            return Response({"data": []})

        all_dates = sorted(set(
            date for h in all_histories.values() for date in h['prices'].keys()
        ))

        data = []
        last_prices = {}
        for date in all_dates:
            total = 0
            for ticker, info in all_histories.items():
                price = info['prices'].get(date)
                if price:
                    last_prices[ticker] = price
                total += info['qty'] * last_prices.get(ticker, 0)

            data.append({
                "date": date,
                "value": round(total, 2)
            })

        return Response({"data": data})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_portfolio_signals(request):
    """
    Analyze holdings and generate Buy More / Hold / Sell signals.
    Enhanced with MACD crossover + Bollinger Band analysis for robust signals.
    """
    user = request.user

    holdings = Holding.objects.filter(user=user)
    if not holdings.exists():
        return Response({"signals": [], "alerts": []})

    risk_profile = request.query_params.get('risk', 'Moderate')
    stop_loss = {"Conservative": 0.07, "Moderate": 0.10, "Aggressive": 0.15}.get(risk_profile, 0.10)

    total_invested = sum(h.qty * h.avg_price for h in holdings)
    ideal_per_stock = total_invested / max(len(holdings), 1)

    signals = []
    alerts = []

    for h in holdings:
        try:
            ticker = yf.Ticker(h.ticker)
            info = ticker.info
            ltp = info.get('currentPrice', info.get('regularMarketPrice', h.avg_price))
            if not ltp:
                ltp = h.avg_price

            # Fetch 3 months of history for technical indicators
            hist = ticker.history(period="3mo")
            trend = 0
            macd_signal_val = "neutral"
            bollinger_position = "middle"
            technical_summary = ""

            if not hist.empty and len(hist) >= 26:
                close = hist['Close']

                # --- 5-day trend ---
                if len(close) >= 5:
                    trend = (close.iloc[-1] - close.iloc[-5]) / close.iloc[-5] * 100

                # --- MACD (12, 26, 9) ---
                ema12 = close.ewm(span=12, adjust=False).mean()
                ema26 = close.ewm(span=26, adjust=False).mean()
                macd_line = ema12 - ema26
                signal_line = macd_line.ewm(span=9, adjust=False).mean()

                current_macd = macd_line.iloc[-1]
                current_signal = signal_line.iloc[-1]
                prev_macd = macd_line.iloc[-2]
                prev_signal = signal_line.iloc[-2]

                if current_macd > current_signal and prev_macd <= prev_signal:
                    macd_signal_val = "bullish_crossover"
                elif current_macd < current_signal and prev_macd >= prev_signal:
                    macd_signal_val = "bearish_crossover"
                elif current_macd > current_signal:
                    macd_signal_val = "bullish"
                else:
                    macd_signal_val = "bearish"

                # --- Bollinger Bands (20, 2) ---
                sma20 = close.rolling(window=20).mean()
                std20 = close.rolling(window=20).std()
                upper_band = sma20 + (2 * std20)
                lower_band = sma20 - (2 * std20)

                current_price = close.iloc[-1]
                if current_price > upper_band.iloc[-1]:
                    bollinger_position = "above_upper"  # Overbought
                elif current_price < lower_band.iloc[-1]:
                    bollinger_position = "below_lower"  # Oversold
                else:
                    bb_range = upper_band.iloc[-1] - lower_band.iloc[-1]
                    if bb_range > 0:
                        position = (current_price - lower_band.iloc[-1]) / bb_range
                        if position > 0.7:
                            bollinger_position = "upper_zone"
                        elif position < 0.3:
                            bollinger_position = "lower_zone"
                        else:
                            bollinger_position = "middle"

                # Technical summary
                tech_signals = []
                if macd_signal_val.startswith("bullish"):
                    tech_signals.append("MACD bullish")
                else:
                    tech_signals.append("MACD bearish")
                if bollinger_position in ("below_lower", "lower_zone"):
                    tech_signals.append("near support")
                elif bollinger_position in ("above_upper", "upper_zone"):
                    tech_signals.append("near resistance")
                technical_summary = " | ".join(tech_signals)

            elif not hist.empty and len(hist) >= 2:
                trend = (hist['Close'].iloc[-1] - hist['Close'].iloc[0]) / hist['Close'].iloc[0] * 100

            pnl_pct = ((ltp - h.avg_price) / h.avg_price) * 100 if h.avg_price > 0 else 0
            current_value = h.qty * ltp

            signal = "HOLD"
            signal_reason = ""
            suggested_action = ""
            urgency = "low"

            # === ENSEMBLE: Combine trend + MACD + Bollinger for signals ===

            # SELL signals
            if pnl_pct <= -(stop_loss * 100):
                signal = "SELL"
                signal_reason = f"Stop-loss triggered: down {abs(pnl_pct):.1f}% (limit: {stop_loss*100:.0f}%)"
                suggested_action = f"Consider selling {h.qty} shares to limit losses"
                urgency = "high"
            elif pnl_pct > 30 and macd_signal_val.startswith("bearish") and bollinger_position in ("above_upper", "upper_zone"):
                signal = "SELL"
                signal_reason = f"Profit booking: up {pnl_pct:.1f}%, MACD bearish + overbought on Bollinger"
                sell_qty = max(1, h.qty // 2)
                suggested_action = f"Book partial profit: sell {sell_qty} of {h.qty} shares (₹{(sell_qty * ltp):,.0f})"
                urgency = "medium"
            elif pnl_pct > 30 and trend < -2:
                signal = "SELL"
                signal_reason = f"Profit booking opportunity: up {pnl_pct:.1f}% but trend reversing"
                sell_qty = max(1, h.qty // 2)
                suggested_action = f"Book partial profit: sell {sell_qty} of {h.qty} shares (₹{(sell_qty * ltp):,.0f})"
                urgency = "medium"
            elif trend < -5 and macd_signal_val.startswith("bearish"):
                signal = "SELL"
                signal_reason = f"Downtrend confirmed: {trend:.1f}% in 5 days + MACD bearish"
                suggested_action = f"Consider reducing position by {max(1, h.qty // 3)} shares"
                urgency = "medium"
            # BUY MORE signals
            elif macd_signal_val == "bullish_crossover" and bollinger_position in ("below_lower", "lower_zone"):
                signal = "BUY_MORE"
                signal_reason = f"Strong buy signal: MACD bullish crossover + oversold on Bollinger"
                buy_qty = max(1, int((ideal_per_stock * 0.3) / ltp)) if ltp > 0 else 1
                suggested_action = f"Add {buy_qty} shares (~₹{(buy_qty * ltp):,.0f})"
                urgency = "medium"
            elif trend > 3 and pnl_pct > 0 and macd_signal_val.startswith("bullish"):
                signal = "BUY_MORE"
                signal_reason = f"Momentum confirmed: +{trend:.1f}% trend + MACD bullish"
                target_allocation = ideal_per_stock * 1.2
                room = max(0, target_allocation - current_value)
                if room > 0 and ltp > 0:
                    buy_qty = max(1, int(room / ltp))
                    suggested_action = f"Add {buy_qty} shares (~₹{(buy_qty * ltp):,.0f})"
                else:
                    suggested_action = "Position already well-sized"
                urgency = "low"
            elif pnl_pct < -5 and trend > 1:
                signal = "BUY_MORE"
                signal_reason = f"Dip recovery: recovering (+{trend:.1f}% this week) from -{abs(pnl_pct):.1f}% loss"
                buy_qty = max(1, int((h.qty * 0.25)))
                suggested_action = f"Average down: buy {buy_qty} more shares at ₹{ltp:,.2f}"
                urgency = "low"
            # HOLD signals
            else:
                signal = "HOLD"
                if pnl_pct > 0:
                    signal_reason = f"Healthy position: +{pnl_pct:.1f}%, trend {'↑' if trend > 0 else '→'} steady"
                else:
                    signal_reason = f"Small dip ({pnl_pct:.1f}%), no action needed yet"
                suggested_action = "Continue holding"
                urgency = "low"

            signal_data = {
                "id": h.id,
                "ticker": h.ticker,
                "name": h.name,
                "signal": signal,
                "reason": signal_reason,
                "action": suggested_action,
                "urgency": urgency,
                "pnl_pct": round(pnl_pct, 2),
                "trend_5d": round(trend, 2),
                "ltp": round(float(ltp), 2),
                # Technical indicators
                "macd_signal": macd_signal_val,
                "bollinger_position": bollinger_position,
                "technical_summary": technical_summary,
            }
            signals.append(signal_data)

            if urgency in ("high", "medium"):
                alerts.append(signal_data)

        except Exception as e:
            print(f"Signal error for {h.ticker}: {e}")
            signals.append({
                "id": h.id,
                "ticker": h.ticker,
                "name": h.name,
                "signal": "HOLD",
                "reason": "Unable to analyze — data unavailable",
                "action": "Continue holding",
                "urgency": "low",
                "pnl_pct": 0,
                "trend_5d": 0,
                "ltp": h.avg_price,
                "macd_signal": "neutral",
                "bollinger_position": "middle",
                "technical_summary": "",
            })

    return Response({"signals": signals, "alerts": alerts})
