"""
Stock Universe constants and sector mappings for the Indian equity market (NSE).
"""

SECTOR_MAP = {
    # IT
    "TCS.NS": "IT", "INFY.NS": "IT", "WIPRO.NS": "IT", "HCLTECH.NS": "IT",
    # Banking & Finance
    "HDFCBANK.NS": "Banking", "ICICIBANK.NS": "Banking", "SBIN.NS": "Banking",
    "KOTAKBANK.NS": "Banking", "AXISBANK.NS": "Banking", "BAJFINANCE.NS": "Finance",
    "BAJAJFINSV.NS": "Finance", "INDUSINDBK.NS": "Banking",
    # Energy & Oil
    "RELIANCE.NS": "Energy", "ONGC.NS": "Energy", "BPCL.NS": "Energy",
    # FMCG
    "HUL.NS": "FMCG", "ITC.NS": "FMCG", "NESTLEIND.NS": "FMCG", "BRITANNIA.NS": "FMCG",
    # Auto
    "MARUTI.NS": "Auto", "BAJAJ-AUTO.NS": "Auto", "EICHERMOT.NS": "Auto",
    "HEROMOTOCO.NS": "Auto", "M&M.NS": "Auto",
    # Pharma
    "SUNPHARMA.NS": "Pharma", "CIPLA.NS": "Pharma", "DRREDDY.NS": "Pharma",
    "DIVISLAB.NS": "Pharma", "APOLLOHOSP.NS": "Healthcare",
    # Metals & Infrastructure
    "JSWSTEEL.NS": "Metals", "HINDALCO.NS": "Metals", "COALINDIA.NS": "Mining",
    "LT.NS": "Infrastructure", "ULTRACEMCO.NS": "Infrastructure", "GRASIM.NS": "Infrastructure",
    # Telecom & Consumer
    "BHARTIARTL.NS": "Telecom", "TITAN.NS": "Consumer", "ASIANPAINT.NS": "Consumer",
    # Conglomerates
    "ADANIENT.NS": "Conglomerate", "ADANIPORTS.NS": "Infrastructure",
}

STOCK_UNIVERSE = list(SECTOR_MAP.keys())
MAX_PER_SECTOR = 2  # Cap: max 2 stocks from same sector in recommendations
