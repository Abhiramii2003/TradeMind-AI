import yfinance as yf

def test():
    indices = {
        "NIFTY": "^NSEI",
        "SENSEX": "^BSESN",
        "BANKNIFTY": "^NSEBANK",
        "VIX": "^INDIAVIX"
    }
    
    for name, symbol in indices.items():
        try:
            info = yf.Ticker(symbol).fast_info
            print(f"{name} fast_info lastPrice:", info.get("lastPrice"))
            
            info2 = yf.Ticker(symbol).info
            print(f"{name} info currentPrice:", info2.get("currentPrice"))
            print(f"{name} info regularMarketPrice:", info2.get("regularMarketPrice"))
        except Exception as e:
            print(f"{name} ERROR:", e)

test()
