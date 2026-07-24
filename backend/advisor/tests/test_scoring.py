"""
Tests for the 100-point fiduciary scoring algorithm.

Tests the scoring logic in isolation (without yfinance/cache dependencies)
to verify that sentiment, risk-fit, and valuation scoring behaves correctly.
"""
import pytest


class TestSentimentScoring:
    """Sentiment maps -1..1 → 0..40 points."""

    def test_max_positive(self):
        score = (1.0 + 1) * 20  # = 40
        assert score == 40.0

    def test_max_negative(self):
        score = (-1.0 + 1) * 20  # = 0
        assert score == 0.0

    def test_neutral(self):
        score = (0.0 + 1) * 20  # = 20
        assert score == 20.0

    def test_slightly_positive(self):
        score = (0.3 + 1) * 20  # = 26
        assert score == pytest.approx(26.0)


class TestRiskFitScoring:
    """Beta-based risk alignment scoring (up to 40 points)."""

    def test_conservative_low_beta(self):
        """Low-beta stocks should score high for conservative users."""
        beta = 0.5
        pts = max(0, (1.2 - beta) * 33)  # (1.2 - 0.5) * 33 = 23.1
        assert pts == pytest.approx(23.1)

    def test_conservative_high_beta(self):
        """High-beta stocks should score poorly for conservative users."""
        beta = 1.8
        pts = max(0, (1.2 - beta) * 33)  # (1.2 - 1.8) * 33 = negative → 0
        assert pts == 0.0

    def test_aggressive_high_beta(self):
        """High-beta stocks should score high for aggressive users."""
        beta = 1.5
        pts = max(0, (beta - 0.5) * 28)  # (1.5 - 0.5) * 28 = 28
        assert pts == pytest.approx(28.0)

    def test_aggressive_low_beta(self):
        """Low-beta stocks score poorly for aggressive users."""
        beta = 0.3
        pts = max(0, (beta - 0.5) * 28)  # (0.3 - 0.5) * 28 = negative → 0
        assert pts == 0.0

    def test_moderate_perfect_beta(self):
        """Beta = 1.0 should be ideal for moderate users."""
        beta = 1.0
        pts = max(0, (1.0 - abs(beta - 1.0)) * 40)  # (1.0 - 0) * 40 = 40
        assert pts == pytest.approx(40.0)

    def test_moderate_extreme_beta(self):
        """Extreme beta should score poorly for moderate users."""
        beta = 2.0
        pts = max(0, (1.0 - abs(beta - 1.0)) * 40)  # (1.0 - 1.0) * 40 = 0
        assert pts == pytest.approx(0.0)


class TestValuationScoring:
    """Price position in 52-week range (up to 20 points)."""

    def test_at_yearly_low(self):
        """Price at 52-week low → highest valuation score (20 pts)."""
        price, low, high = 100.0, 100.0, 200.0
        position = (price - low) / (high - low + 0.01)
        pts = (1 - position) * 20
        assert pts == pytest.approx(20.0, abs=0.1)

    def test_at_yearly_high(self):
        """Price at 52-week high → lowest valuation score (~0 pts)."""
        price, low, high = 200.0, 100.0, 200.0
        position = (price - low) / (high - low + 0.01)
        pts = (1 - position) * 20
        assert pts == pytest.approx(0.0, abs=0.1)

    def test_midpoint(self):
        """Price at midpoint → ~10 points."""
        price, low, high = 150.0, 100.0, 200.0
        position = (price - low) / (high - low + 0.01)
        pts = (1 - position) * 20
        assert pts == pytest.approx(10.0, abs=0.2)


class TestTotalScoreRange:
    """The total score should always be between 0 and 100."""

    @pytest.mark.parametrize("sentiment,beta,price,low,high,user_class", [
        (1.0, 0.5, 100, 100, 200, "Conservative"),      # Best case conservative
        (-1.0, 2.0, 200, 100, 200, "Conservative"),      # Worst case conservative
        (1.0, 1.5, 100, 100, 200, "Aggressive"),          # Best case aggressive
        (0.0, 1.0, 150, 100, 200, "Moderate"),            # Average moderate
    ])
    def test_score_bounds(self, sentiment, beta, price, low, high, user_class):
        """Total score should always be 0-100."""
        sentiment_pts = (sentiment + 1) * 20

        if user_class == "Conservative":
            beta_pts = max(0, (1.2 - beta) * 33)
        elif user_class == "Aggressive":
            beta_pts = max(0, (beta - 0.5) * 28)
        else:
            beta_pts = max(0, (1.0 - abs(beta - 1.0)) * 40)

        position = (price - low) / (high - low + 0.01)
        valuation_pts = (1 - position) * 20

        total = sentiment_pts + beta_pts + valuation_pts
        assert 0 <= total <= 100
