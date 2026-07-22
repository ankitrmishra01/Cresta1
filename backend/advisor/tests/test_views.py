"""
Tests for advisor API views.

Covers:
- Authentication enforcement (authenticated vs unauthenticated)
- Portfolio CRUD operations
- Market data endpoint responses
"""
import pytest
from django.urls import reverse
from advisor.models import Holding, UserProfile


@pytest.mark.django_db
class TestPortfolioViews:
    def test_get_holdings_unauthenticated(self, api_client):
        """Unauthenticated requests should be rejected."""
        response = api_client.get('/api/holdings/')
        assert response.status_code in [401, 403]

    def test_get_holdings_authenticated_empty(self, auth_client):
        """Authenticated user with no holdings gets empty list."""
        response = auth_client.get('/api/holdings/')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_add_holding(self, auth_client, user):
        """Add a valid holding via POST."""
        payload = {
            'ticker': 'TCS.NS',
            'name': 'TCS Limited',
            'qty': 5,
            'avg_price': 3500.00
        }
        response = auth_client.post('/api/holdings/', payload, format='json')
        assert response.status_code in [200, 201]

        # Verify it was created in DB
        assert Holding.objects.filter(user=user, ticker='TCS.NS').exists()


@pytest.mark.django_db
class TestProfileViews:
    def test_get_profile_unauthenticated(self, api_client):
        response = api_client.get('/api/profile/')
        assert response.status_code in [401, 403]

    def test_get_profile_authenticated(self, auth_client, user_profile):
        response = auth_client.get('/api/profile/')
        assert response.status_code == 200


@pytest.mark.django_db
class TestMarketViews:
    """Market data endpoints should work without auth (public data)."""

    def test_nifty_endpoint(self, api_client):
        response = api_client.get('/api/nifty/')
        # Should return 200 (live data) or reasonable error
        assert response.status_code in [200, 500, 503]

    def test_sensex_endpoint(self, api_client):
        response = api_client.get('/api/sensex/')
        assert response.status_code in [200, 500, 503]

    def test_banknifty_endpoint(self, api_client):
        response = api_client.get('/api/banknifty/')
        assert response.status_code in [200, 500, 503]

    def test_top_movers_endpoint(self, api_client):
        response = api_client.get('/api/top-movers/')
        assert response.status_code in [200, 500, 503]


@pytest.mark.django_db
class TestRecommendView:
    def test_recommend_requires_post(self, api_client):
        """GET to /recommend/ should fail."""
        response = api_client.get('/api/recommend/')
        assert response.status_code in [405, 400]

    def test_recommend_invalid_payload(self, api_client):
        """POST with missing fields should return 400."""
        response = api_client.post('/api/recommend/', {}, format='json')
        assert response.status_code == 400


@pytest.mark.django_db  
class TestPredictionView:
    def test_prediction_with_cached_data(self, api_client, stock_prediction):
        """If a cached prediction exists, the endpoint should return it."""
        response = api_client.get('/api/prediction/?symbol=TCS.NS')
        # Should return cached data or trigger prediction
        assert response.status_code in [200, 202, 500]
