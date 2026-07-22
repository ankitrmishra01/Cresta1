from django.urls import path
from . import views

urlpatterns = [
    path("analyze/<str:symbol>/", views.analyze_stock),
    path("nifty/", views.get_nifty),
    path("sensex/", views.get_sensex),
    path("banknifty/", views.get_banknifty),
    path("search/", views.search_stock),
    path("market-status/", views.get_market_status),
    path("news/", views.get_news),
    path("top-movers/", views.get_top_movers),
    # Auth (JWT)
    path("auth/login/", views.VerifiedTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("auth/signup/", views.signup, name='signup'),
    path("auth/verify-email/", views.verify_email),
    path("auth/google/", views.google_login),
    path("auth/refresh/", views.token_refresh),
    path("auth/me/", views.get_me),
    # User Profile
    path("profile/", views.get_profile),
    path("profile/save/", views.save_profile),
    # ML
    path("recommend/", views.recommend_api),
    path("prediction/", views.get_prediction),
    path("api/sector-sentiment/", views.sector_sentiment),
    # Portfolio CRUD (JWT-protected)
    path("holdings/", views.get_holdings),
    path("holdings/add/", views.add_holding),
    path("holdings/update/", views.update_holding),
    path("holdings/delete/", views.delete_holding),
    path("holdings/signals/", views.get_portfolio_signals),
    path("holdings/history/", views.get_portfolio_history),
    # Watchlist
    path("watchlist/", views.get_watchlist),
    path("watchlist/add/", views.add_to_watchlist),
    path("watchlist/remove/", views.remove_from_watchlist),
    # Transactions
    path("transactions/", views.get_transactions),
]
