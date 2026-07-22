"""
Tests for advisor serializers.

Covers:
- Valid and invalid input validation
- Boundary values and edge cases
- Required field enforcement
"""
import pytest
from advisor.serializers import (
    HoldingSerializer, HoldingUpdateSerializer, HoldingDeleteSerializer,
    RecommendSerializer, UserProfileSerializer, WatchlistSerializer,
    GoogleAuthSerializer,
)


class TestHoldingSerializer:
    def test_valid_data(self):
        data = {'ticker': 'RELIANCE.NS', 'qty': 10, 'avg_price': 2500.00}
        serializer = HoldingSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_invalid_qty_zero(self):
        data = {'ticker': 'TCS.NS', 'qty': 0, 'avg_price': 3500.00}
        serializer = HoldingSerializer(data=data)
        assert not serializer.is_valid()
        assert 'qty' in serializer.errors

    def test_invalid_negative_price(self):
        data = {'ticker': 'INFY.NS', 'qty': 5, 'avg_price': -100.0}
        serializer = HoldingSerializer(data=data)
        assert not serializer.is_valid()
        assert 'avg_price' in serializer.errors

    def test_missing_ticker(self):
        data = {'qty': 5, 'avg_price': 1500.00}
        serializer = HoldingSerializer(data=data)
        assert not serializer.is_valid()
        assert 'ticker' in serializer.errors

    def test_optional_purchase_date(self):
        data = {'ticker': 'SBIN.NS', 'qty': 10, 'avg_price': 600.0, 'purchase_date': '2025-01-15'}
        serializer = HoldingSerializer(data=data)
        assert serializer.is_valid(), serializer.errors


class TestRecommendSerializer:
    def test_valid_profile(self):
        data = {
            'Age': 28,
            'Income': 1200000,
            'Risk_Tolerance': 3,
            'Investment_Goal': 'Wealth'
        }
        serializer = RecommendSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_invalid_age_too_high(self):
        data = {
            'Age': 150,
            'Income': 500000,
            'Risk_Tolerance': 3,
            'Investment_Goal': 'Tax'
        }
        serializer = RecommendSerializer(data=data)
        assert not serializer.is_valid()
        assert 'Age' in serializer.errors

    def test_invalid_risk_tolerance_out_of_range(self):
        data = {
            'Age': 30,
            'Income': 800000,
            'Risk_Tolerance': 6,
            'Investment_Goal': 'Income'
        }
        serializer = RecommendSerializer(data=data)
        assert not serializer.is_valid()
        assert 'Risk_Tolerance' in serializer.errors

    def test_missing_goal(self):
        data = {'Age': 25, 'Income': 700000, 'Risk_Tolerance': 2}
        serializer = RecommendSerializer(data=data)
        assert not serializer.is_valid()
        assert 'Investment_Goal' in serializer.errors

    def test_boundary_values(self):
        """Test edge values: min age, max risk tolerance."""
        data = {
            'Age': 1,
            'Income': 0,
            'Risk_Tolerance': 5,
            'Investment_Goal': 'Wealth'
        }
        serializer = RecommendSerializer(data=data)
        assert serializer.is_valid(), serializer.errors


class TestUserProfileSerializer:
    def test_valid_partial_update(self):
        data = {'risk_profile': 'Aggressive', 'age': 35}
        serializer = UserProfileSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_empty_data_is_valid(self):
        """All fields are optional in profile updates."""
        serializer = UserProfileSerializer(data={})
        assert serializer.is_valid()


class TestWatchlistSerializer:
    def test_valid_ticker(self):
        serializer = WatchlistSerializer(data={'ticker': 'HDFCBANK.NS'})
        assert serializer.is_valid()

    def test_missing_ticker(self):
        serializer = WatchlistSerializer(data={})
        assert not serializer.is_valid()


class TestGoogleAuthSerializer:
    def test_valid_token(self):
        serializer = GoogleAuthSerializer(data={'access_token': 'ya29.abc123xyz'})
        assert serializer.is_valid()

    def test_missing_token(self):
        serializer = GoogleAuthSerializer(data={})
        assert not serializer.is_valid()


class TestHoldingUpdateSerializer:
    def test_valid_update(self):
        data = {'id': 1, 'qty': 20, 'avg_price': 2600.0}
        serializer = HoldingUpdateSerializer(data=data)
        assert serializer.is_valid()

    def test_missing_id(self):
        data = {'qty': 10}
        serializer = HoldingUpdateSerializer(data=data)
        assert not serializer.is_valid()


class TestHoldingDeleteSerializer:
    def test_valid_delete(self):
        serializer = HoldingDeleteSerializer(data={'id': 42})
        assert serializer.is_valid()

    def test_missing_id(self):
        serializer = HoldingDeleteSerializer(data={})
        assert not serializer.is_valid()
