from rest_framework import serializers


class GoogleAuthSerializer(serializers.Serializer):
    access_token = serializers.CharField(required=True)


class HoldingSerializer(serializers.Serializer):
    ticker = serializers.CharField(max_length=20)
    qty = serializers.IntegerField(min_value=1)
    avg_price = serializers.FloatField(min_value=0.01)
    purchase_date = serializers.DateField(required=False, allow_null=True)


class HoldingUpdateSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=True)
    qty = serializers.IntegerField(required=False, min_value=0)
    avg_price = serializers.FloatField(required=False, min_value=0.01)
    purchase_date = serializers.DateField(required=False, allow_null=True)


class HoldingDeleteSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=True)


class RecommendSerializer(serializers.Serializer):
    Age = serializers.IntegerField(min_value=1, max_value=120)
    Income = serializers.IntegerField(min_value=0)
    Risk_Tolerance = serializers.IntegerField(min_value=1, max_value=5)
    Investment_Goal = serializers.CharField(max_length=50)


class UserProfileSerializer(serializers.Serializer):
    risk_score = serializers.IntegerField(required=False, allow_null=True)
    risk_profile = serializers.CharField(max_length=20, required=False, allow_blank=True)
    investment_goal = serializers.CharField(max_length=50, required=False, allow_blank=True)
    age = serializers.IntegerField(required=False, allow_null=True)
    income = serializers.IntegerField(required=False, allow_null=True)


class WatchlistSerializer(serializers.Serializer):
    ticker = serializers.CharField(max_length=20)


class PaperTradeSerializer(serializers.ModelSerializer):
    current_pnl = serializers.SerializerMethodField()
    
    class Meta:
        from .models import PaperTrade
        model = PaperTrade
        fields = ['id', 'ticker', 'action', 'quantity', 'price_at_trade', 'created_at', 'current_pnl']
        read_only_fields = ['id', 'created_at', 'current_pnl']
    
    def get_current_pnl(self, obj):
        from django.core.cache import cache
        
        # Use Redis cached price — NOT live yfinance call
        cache_key = f"price:{obj.ticker}"
        current = cache.get(cache_key)
        
        if not current:
            # Fallback for missing cache to avoid null PNLs, but try not to block long
            try:
                import yfinance as yf
                current = round(yf.Ticker(obj.ticker).history(period='1d')['Close'].iloc[-1], 2)
                cache.set(cache_key, current, timeout=300) # cache for 5 mins
            except Exception:
                return None  # return null, don't block
                
        if obj.action == 'BUY':
            return round((float(current) - float(obj.price_at_trade)) * float(obj.quantity), 2)
        return round((float(obj.price_at_trade) - float(current)) * float(obj.quantity), 2)


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class VerifiedTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Check if email is verified
        profile = getattr(self.user, 'profile', None)
        if profile and not profile.email_verified:
            raise serializers.ValidationError({
                'error': 'Please verify your email before logging in. Check your inbox.'
            })
            
        return data
