"""
Tests for advisor Django models.

Covers:
- Object creation and string representations
- Unique constraints and cascade deletes
- Field defaults and null handling
"""
import pytest
from django.contrib.auth.models import User
from django.db import IntegrityError

from advisor.models import (
    UserProfile, Holding, Transaction, WatchlistItem,
    StockPrediction, PaperTrade, WatchlistAlert,
)


@pytest.mark.django_db
class TestUserProfile:
    def test_create_profile(self, user_profile):
        assert user_profile.risk_profile == 'Balanced'
        assert user_profile.age == 28
        assert user_profile.income == 1200000

    def test_str_representation(self, user_profile):
        assert 'test@cresta.ai' in str(user_profile)
        assert 'Balanced' in str(user_profile)

    def test_profile_with_no_risk(self, user):
        profile = UserProfile.objects.create(user=user)
        assert 'No profile' in str(profile)

    def test_one_to_one_constraint(self, user_profile):
        """Cannot create a second profile for the same user."""
        with pytest.raises(IntegrityError):
            UserProfile.objects.create(user=user_profile.user)


@pytest.mark.django_db
class TestHolding:
    def test_create_holding(self, holding):
        assert holding.ticker == 'RELIANCE.NS'
        assert holding.qty == 10
        assert holding.avg_price == 2500.00

    def test_str_representation(self, holding):
        assert 'RELIANCE.NS' in str(holding)
        assert 'x10' in str(holding)

    def test_unique_together(self, user, holding):
        """Cannot hold the same ticker twice for the same user."""
        with pytest.raises(IntegrityError):
            Holding.objects.create(
                user=user, ticker='RELIANCE.NS',
                name='Duplicate', qty=5, avg_price=2600.0
            )

    def test_cascade_delete(self, user, holding):
        """Holdings are deleted when user is deleted."""
        user_id = user.id
        user.delete()
        assert not Holding.objects.filter(user_id=user_id).exists()


@pytest.mark.django_db
class TestTransaction:
    def test_create_buy(self, user):
        txn = Transaction.objects.create(
            user=user, ticker='TCS.NS', name='TCS',
            transaction_type='BUY', qty=5,
            price=3500.0, total_value=17500.0
        )
        assert txn.transaction_type == 'BUY'
        assert txn.total_value == 17500.0

    def test_str_representation(self, user):
        txn = Transaction.objects.create(
            user=user, ticker='INFY.NS', name='Infosys',
            transaction_type='SELL', qty=3,
            price=1500.0, total_value=4500.0
        )
        assert 'SELL' in str(txn)
        assert 'INFY.NS' in str(txn)


@pytest.mark.django_db
class TestStockPrediction:
    def test_create_prediction(self, stock_prediction):
        assert stock_prediction.ticker == 'TCS.NS'
        assert len(stock_prediction.history_array) == 1
        assert len(stock_prediction.future_forecast_array) == 1

    def test_str_representation(self, stock_prediction):
        assert 'TCS.NS' in str(stock_prediction)

    def test_metrics_stored(self, stock_prediction):
        assert stock_prediction.metrics['model'] == 'AttentionLSTM'


@pytest.mark.django_db
class TestPaperTrade:
    def test_create_paper_trade(self, user):
        trade = PaperTrade.objects.create(
            user=user, ticker='HDFCBANK.NS',
            action='BUY', quantity=100,
            price_at_trade=1600.50
        )
        assert trade.action == 'BUY'
        assert trade.quantity == 100

    def test_str_representation(self, user):
        trade = PaperTrade.objects.create(
            user=user, ticker='SBIN.NS',
            action='SELL', quantity=50,
            price_at_trade=600.25
        )
        assert 'SELL' in str(trade)
        assert 'SBIN.NS' in str(trade)


@pytest.mark.django_db
class TestWatchlistAlert:
    def test_create_alert(self, user):
        alert = WatchlistAlert.objects.create(
            user=user, ticker='RELIANCE.NS',
            target_price=2800.00,
            condition='ABOVE'
        )
        assert alert.is_active is True
        assert alert.condition == 'ABOVE'

    def test_str_representation(self, user):
        alert = WatchlistAlert.objects.create(
            user=user, ticker='MARUTI.NS',
            target_price=10000.00,
            condition='BELOW'
        )
        assert 'BELOW' in str(alert)
        assert 'MARUTI.NS' in str(alert)
