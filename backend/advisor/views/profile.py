import yfinance as yf
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from ..models import UserProfile, WatchlistItem, Transaction
from ..serializers import UserProfileSerializer, WatchlistSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """Get user profile data."""
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    return Response({
        'email': request.user.email,
        'name': request.user.get_full_name() or request.user.username,
        'picture': profile.picture,
        'risk_score': profile.risk_score,
        'risk_profile': profile.risk_profile,
        'investment_goal': profile.investment_goal,
        'age': profile.age,
        'income': profile.income,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_profile(request):
    """Save/update user profile (risk assessment results etc.)."""
    serializer = UserProfileSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    for field, value in serializer.validated_data.items():
        setattr(profile, field, value)
    profile.save()

    return Response({'message': 'Profile updated', 'risk_profile': profile.risk_profile})


# ============= WATCHLIST =============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_watchlist(request):
    """Get user's watchlist with live prices."""
    items = WatchlistItem.objects.filter(user=request.user)

    result = []
    for item in items:
        ltp = 0
        change_pct = 0
        try:
            ticker = yf.Ticker(item.ticker)
            info = ticker.info
            ltp = info.get('currentPrice', info.get('regularMarketPrice', 0)) or 0
            prev = info.get('previousClose', ltp) or ltp
            if prev > 0:
                change_pct = round(((ltp - prev) / prev) * 100, 2)
        except:
            pass

        result.append({
            'id': item.id,
            'ticker': item.ticker,
            'name': item.name or item.ticker.replace('.NS', ''),
            'price': round(float(ltp), 2),
            'change': change_pct,
            'added_at': item.added_at.isoformat(),
        })

    return Response(result)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_watchlist(request):
    """Add a stock to watchlist."""
    serializer = WatchlistSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    ticker = serializer.validated_data['ticker'].upper()
    if not ticker.endswith('.NS') and not ticker.endswith('.BO'):
        ticker = f"{ticker}.NS"

    # Check if already watching
    if WatchlistItem.objects.filter(user=request.user, ticker=ticker).exists():
        return Response({'error': 'Already in watchlist'}, status=status.HTTP_400_BAD_REQUEST)

    # Fetch name
    name = ticker.replace('.NS', '')
    try:
        info = yf.Ticker(ticker).info
        name = info.get('shortName', info.get('longName', name))
    except:
        pass

    item = WatchlistItem.objects.create(user=request.user, ticker=ticker, name=name)
    return Response({'id': item.id, 'ticker': item.ticker, 'name': item.name, 'message': 'Added to watchlist'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_watchlist(request):
    """Remove a stock from watchlist."""
    ticker = request.data.get('ticker', '').upper()
    if not ticker:
        item_id = request.data.get('id')
        if item_id:
            WatchlistItem.objects.filter(id=item_id, user=request.user).delete()
            return Response({'message': 'Removed from watchlist'})
        return Response({'error': 'ticker or id required'}, status=status.HTTP_400_BAD_REQUEST)

    if not ticker.endswith('.NS') and not ticker.endswith('.BO'):
        ticker = f"{ticker}.NS"

    deleted = WatchlistItem.objects.filter(user=request.user, ticker=ticker).delete()
    if deleted[0] == 0:
        return Response({'error': 'Not in watchlist'}, status=status.HTTP_404_NOT_FOUND)

    return Response({'message': 'Removed from watchlist'})


# ============= TRANSACTIONS =============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transactions(request):
    """Get transaction history with optional filters."""
    txns = Transaction.objects.filter(user=request.user)

    ticker = request.query_params.get('ticker')
    if ticker:
        txns = txns.filter(ticker__icontains=ticker)

    txn_type = request.query_params.get('type')
    if txn_type:
        txns = txns.filter(transaction_type=txn_type.upper())

    limit = int(request.query_params.get('limit', 50))
    txns = txns[:limit]

    return Response([{
        'id': t.id,
        'ticker': t.ticker,
        'name': t.name,
        'type': t.transaction_type,
        'qty': t.qty,
        'price': t.price,
        'total_value': t.total_value,
        'notes': t.notes,
        'date': t.transaction_date.isoformat(),
    } for t in txns])
