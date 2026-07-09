import yfinance as yf
print("NIFTY:", yf.Ticker("^NSEI").fast_info.get("lastPrice"))
print("SENSEX:", yf.Ticker("^BSESN").fast_info.get("lastPrice"))
print("BANKNIFTY:", yf.Ticker("^NSEBANK").fast_info.get("lastPrice"))

tickers = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS"]
data = yf.download(tickers, period="1d", group_by="ticker")
print(data)
