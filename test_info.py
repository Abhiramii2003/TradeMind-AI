import yfinance as yf
info = yf.Ticker("RELIANCE.NS").info

keys = [
    "currentPrice", "dayHigh", "dayLow", "open", "previousClose", 
    "volume", "marketCap", "trailingPE", "fiftyTwoWeekHigh", "fiftyTwoWeekLow",
    "longBusinessSummary", "sector"
]

for k in keys:
    print(f"{k}: {info.get(k)}")
