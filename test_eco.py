import yfinance as yf

symbols = ["INR=X", "CL=F", "GC=F", "SI=F", "^GSPC", "^DJI", "^IXIC", "^TNX"]
tickers = yf.Tickers(" ".join(symbols))

for sym in symbols:
    try:
        info = tickers.tickers[sym].fast_info
        print(f"{sym}: {info.get('lastPrice')}")
    except Exception as e:
        print(f"{sym} failed: {e}")
