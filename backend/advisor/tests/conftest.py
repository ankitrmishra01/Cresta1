import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from advisor.models import (
    UserProfile, Holding, Transaction, WatchlistItem,
    StockPrediction, PaperTrade, WatchlistAlert,
)


@pytest.fixture
def user(db):
    """Create a test user."""
    return User.objects.create_user(
        username='testuser',
        email='test@cresta.ai',
        password='securepass123'
    )


@pytest.fixture
def user_profile(user):
    """Create a UserProfile linked to the test user."""
    return UserProfile.objects.create(
        user=user,
        risk_score=3,
        risk_profile='Balanced',
        investment_goal='Wealth',
        age=28,
        income=1200000,
    )


@pytest.fixture
def holding(user):
    """Create a sample Holding."""
    return Holding.objects.create(
        user=user,
        ticker='RELIANCE.NS',
        name='Reliance Industries',
        qty=10,
        avg_price=2500.00,
    )


@pytest.fixture
def stock_prediction(db):
    """Create a sample StockPrediction cache entry."""
    return StockPrediction.objects.create(
        ticker='TCS.NS',
        history_array=[{"date": "2026-03-01", "price": 3500.0, "isFuture": False}],
        future_forecast_array=[{"date": "2026-03-10", "price": 3600.0, "isFuture": True}],
        metrics={"test_mse": 0.001, "model": "AttentionLSTM"},
    )


@pytest.fixture
def api_client():
    """Return an unauthenticated DRF APIClient."""
    return APIClient()


@pytest.fixture
def auth_client(api_client, user):
    """Return an authenticated DRF APIClient."""
    api_client.force_authenticate(user=user)
    return api_client
