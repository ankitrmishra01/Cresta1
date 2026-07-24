# Re-export all views so urls.py imports remain unchanged
from .markets import (
    analyze_stock,
    get_market_data,
    get_market_status,
    get_nifty,
    get_sensex,
    get_banknifty,
    search_stock,
    get_news,
    get_top_movers,
)

from .auth import google_login, token_refresh, get_me, signup, verify_email, VerifiedTokenObtainPairView

from .ml import recommend_api, get_prediction, sector_sentiment

from .portfolio import (
    get_holdings,
    add_holding,
    update_holding,
    delete_holding,
    get_portfolio_history,
    get_portfolio_signals,
)

from .profile import (
    get_profile,
    save_profile,
    get_watchlist,
    add_to_watchlist,
    remove_from_watchlist,
    get_transactions,
)
