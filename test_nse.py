import requests
import json
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
}
session = requests.Session()
session.get("https://www.nseindia.com", headers=headers, timeout=10)
res = session.get("https://www.nseindia.com/api/fiidiiTradeReact", headers=headers, timeout=10)
print(res.text)
