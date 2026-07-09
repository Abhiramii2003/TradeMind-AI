import yfinance as yf
import requests

print("--- VIX ---")
vix = yf.Ticker("^INDIAVIX").fast_info
print("VIX:", vix.get("lastPrice"))

print("--- SECTORS ---")
sectors = {
    "IT": "^CNXIT",
    "Auto": "^CNXAUTO",
    "Pharma": "^CNXPHARMA",
    "FMCG": "^CNXFMCG",
    "Metal": "^CNXMETAL"
}
for name, symbol in sectors.items():
    info = yf.Ticker(symbol).fast_info
    curr = info.get("lastPrice")
    prev = info.get("previousClose")
    if curr and prev:
        print(f"{name}: {((curr - prev)/prev)*100:.2f}%")

print("--- FII/DII Test ---")
# Try scraping a reliable site for FII DII, e.g. nseindia or moneycontrol
# To avoid blocking, let's just see if nseindia works without headers (it usually fails)
try:
    res = requests.get("https://www.nseindia.com/api/fiidiiTradeReact", headers={"User-Agent": "Mozilla/5.0"})
    print("NSE FII:", res.status_code)
except Exception as e:
    print("Error:", e)
