from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import yfinance as yf
import os
import requests
import time
import json

from pathlib import Path
from dotenv import load_dotenv
from openai import AsyncOpenAI

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


# =========================================
# LOAD ENV VARIABLES
# =========================================

BASE_DIR = Path(__file__).resolve().parent
env_file = BASE_DIR / ".env"

load_dotenv(env_file)

print("ENV PATH:", env_file)
print("NEWS API:", os.getenv("NEWS_API_KEY"))


# =========================================
# FASTAPI APP
# =========================================

app = FastAPI()


# =========================================
# SENTIMENT ANALYZER
# =========================================

analyzer = SentimentIntensityAnalyzer()


# =========================================
# AI CLIENT
# =========================================
ai_client = AsyncOpenAI(
    base_url="https://api.fireworks.ai/inference/v1",
    api_key=os.getenv("FIREWORKS_API_KEY", "")
)

async def generate_ai_response(system_prompt: str, user_message: str) -> str:
    try:
        response = await ai_client.chat.completions.create(
            model="accounts/fireworks/models/deepseek-v4-pro",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=700,
            temperature=0.4,
        )
        return response.choices[0].message.content
    except Exception as e:
        print("DeepSeek model failed, trying fallback...", e)
        response = await ai_client.chat.completions.create(
            model="accounts/fireworks/models/gpt-oss-120b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=700,
            temperature=0.4,
        )
        return response.choices[0].message.content


# =========================================
# CORS
# =========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================
# HOME ROUTE
# =========================================

@app.get("/")
def home():
    return {
        "message": "TradeMind AI Backend Running"
    }


# =========================================
# HELPER FUNCTIONS & CACHE
# =========================================

def format_inr(value):
    if not value or value <= 0:
        return "N/A"
    if value >= 10000000000000: # 10 Lakh Crore
        return f"₹{value / 10000000000000:.2f} Lakh Cr"
    elif value >= 10000000: # 1 Crore
        return f"₹{value / 10000000:.2f} Cr"
    elif value >= 100000: # 1 Lakh
        return f"₹{value / 100000:.2f} Lakh"
    return f"₹{value:,.2f}"

CACHE = {}
def get_cached_data(key, ttl):
    if key in CACHE:
        data, timestamp = CACHE[key]
        if time.time() - timestamp < ttl:
            return data
    return None

def set_cached_data(key, data):
    CACHE[key] = (data, time.time())


# =========================================
# MARKET DATA
# =========================================

@app.get("/market")
async def market_data():
    cached = get_cached_data("market", 60)
    if cached:
        return cached

    try:
        nifty_info = yf.Ticker("^NSEI").fast_info
        sensex_info = yf.Ticker("^BSESN").fast_info
        banknifty_info = yf.Ticker("^NSEBANK").fast_info
        vix_info = yf.Ticker("^INDIAVIX").fast_info
        
        nifty_price = nifty_info.get("lastPrice")
        sensex_price = sensex_info.get("lastPrice")
        banknifty_price = banknifty_info.get("lastPrice")
        vix_price = vix_info.get("lastPrice")
        
        if not all([nifty_price, sensex_price, banknifty_price, vix_price]):
            return {"error": "Market data unavailable"}
        
        # Sector Data
        sector_symbols = {
            "IT": "^CNXIT",
            "Auto": "^CNXAUTO",
            "Pharma": "^CNXPHARMA",
            "FMCG": "^CNXFMCG",
            "Metal": "^CNXMETAL"
        }
        sectors_data = []
        for name, symbol in sector_symbols.items():
            try:
                info = yf.Ticker(symbol).fast_info
                curr = info.get("lastPrice")
                prev = info.get("previousClose")
                if curr and prev and curr > 0 and prev > 0:
                    sectors_data.append({"name": name, "change": round(((curr - prev) / prev) * 100, 2)})
                else:
                    sectors_data.append({"name": name, "change": 0.0})
            except:
                sectors_data.append({"name": name, "change": 0.0})
        
        # Movers & Breadth
        NIFTY_50_TICKERS = [
            "ADANIENT.NS", "ADANIPORTS.NS", "APOLLOHOSP.NS", "ASIANPAINT.NS", "AXISBANK.NS",
            "BAJAJ-AUTO.NS", "BAJFINANCE.NS", "BAJAJFINSV.NS", "BPCL.NS", "BHARTIARTL.NS",
            "BRITANNIA.NS", "CIPLA.NS", "COALINDIA.NS", "DIVISLAB.NS", "DRREDDY.NS",
            "EICHERMOT.NS", "GRASIM.NS", "HCLTECH.NS", "HDFCBANK.NS", "HDFCLIFE.NS",
            "HEROMOTOCO.NS", "HINDALCO.NS", "HINDUNILVR.NS", "ICICIBANK.NS", "ITC.NS",
            "INDUSINDBK.NS", "INFY.NS", "JSWSTEEL.NS", "KOTAKBANK.NS", "LTIM.NS",
            "LT.NS", "M&M.NS", "MARUTI.NS", "NTPC.NS", "NESTLEIND.NS",
            "ONGC.NS", "POWERGRID.NS", "RELIANCE.NS", "SBILIFE.NS", "SBIN.NS",
            "SUNPHARMA.NS", "TATAMOTORS.NS", "TATASTEEL.NS", "TCS.NS", "TATACONSUM.NS",
            "TECHM.NS", "TITAN.NS", "ULTRACEMCO.NS", "WIPRO.NS", "SHRIRAMFIN.NS"
        ]
        
        tickers = yf.Tickers(" ".join(NIFTY_50_TICKERS))
        movers = []
        advances = 0
        declines = 0
        unchanged = 0
        failed_symbols = []
        
        for symbol in NIFTY_50_TICKERS:
            try:
                info = tickers.tickers[symbol].fast_info
                last_price = info.get("lastPrice")
                prev_close = info.get("previousClose")
                
                if last_price is not None and prev_close is not None and last_price > 0 and prev_close > 0:
                    change_pct = ((last_price - prev_close) / prev_close) * 100
                    if change_pct > 0:
                        advances += 1
                    elif change_pct < 0:
                        declines += 1
                    else:
                        unchanged += 1
                        
                    movers.append({
                        "name": symbol.replace(".NS", ""),
                        "price": round(float(last_price), 2),
                        "change": f"{'+' if change_pct >= 0 else ''}{round(float(change_pct), 2)}%",
                        "change_val": float(change_pct)
                    })
                else:
                    failed_symbols.append(symbol)
            except Exception as e:
                print(f"Failed to fetch {symbol}: {e}")
                failed_symbols.append(symbol)
                
        gainers_list = sorted([m for m in movers if m["change_val"] > 0], key=lambda x: x["change_val"], reverse=True)
        losers_list = sorted([m for m in movers if m["change_val"] < 0], key=lambda x: x["change_val"])
        
        gainers = gainers_list[:3]
        losers = losers_list[:3]
        
        for g in gainers: g.pop("change_val", None)
        for l in losers: l.pop("change_val", None)
        
        # FII DII Data
        fii_dii = []
        fii_dii_date = None
        try:
            headers = {"User-Agent": "Mozilla/5.0"}
            res = requests.get("https://www.nseindia.com/api/fiidiiTradeReact", headers=headers, timeout=5)
            if res.status_code == 200:
                data = res.json()
                fii_dii = data
                if data and isinstance(data, list) and len(data) > 0:
                    fii_dii_date = data[0].get("date")
        except:
            pass

        tracked = advances + declines + unchanged
        if tracked >= 48:
            data_quality = "GOOD"
        elif tracked >= 40:
            data_quality = "DEGRADED"
        else:
            data_quality = "POOR"

        result = {
            "NIFTY": round(float(nifty_price), 2),
            "SENSEX": round(float(sensex_price), 2),
            "BANKNIFTY": round(float(banknifty_price), 2),
            "VIX": round(float(vix_price), 2),
            "sectors": sectors_data,
            "breadth": {
                "advances": advances,
                "declines": declines,
                "unchanged": unchanged,
                "tracked": tracked,
                "expected": len(NIFTY_50_TICKERS),
                "failed_symbols": failed_symbols
            },
            "data_quality": data_quality,
            "fii_dii": fii_dii,
            "fii_dii_date": fii_dii_date,
            "gainers": gainers,
            "losers": losers
        }
        set_cached_data("market", result)
        return result

    except Exception as e:
        print("Market API Error:", e)
        return {"error": "Market data unavailable"}


# =========================================
# DYNAMIC WATCHLIST
# =========================================

@app.get("/watchlist")
async def fetch_watchlist(symbols: str):
    cache_key = f"watchlist_{symbols}"
    cached = get_cached_data(cache_key, 60)
    if cached:
        return cached

    symbol_list = [s.strip() for s in symbols.split(",") if s.strip()]
    if not symbol_list:
        return {"data": []}
        
    try:
        query_symbols = [f"{sym}.NS" if not (sym.endswith(".NS") or sym.endswith(".BO")) else sym for sym in symbol_list]
        tickers = yf.Tickers(" ".join(query_symbols))
        data = []
        for sym, q_sym in zip(symbol_list, query_symbols):
            try:
                ticker = tickers.tickers[q_sym]
                last = ticker.fast_info.get("lastPrice") or ticker.info.get("currentPrice") or ticker.info.get("regularMarketPrice")
                prev = ticker.fast_info.get("previousClose") or ticker.info.get("previousClose")
                
                if last and prev and last > 0 and prev > 0:
                    change = ((last - prev) / prev) * 100
                    data.append({
                        "name": sym.replace(".NS", ""),
                        "price": round(float(last), 2),
                        "change": f"{'+' if change >= 0 else ''}{round(float(change), 2)}%"
                    })
                else:
                    data.append({
                        "name": sym.replace(".NS", ""),
                        "error": "Unable to fetch live data"
                    })
            except:
                data.append({
                    "name": sym.replace(".NS", ""),
                    "error": "Unable to fetch live data"
                })
        result = {"data": data}
        set_cached_data(cache_key, result)
        return result
    except Exception as e:
        return {"error": "Unable to fetch live data"}


# =========================================
# SEARCH
# =========================================

@app.get("/search/{symbol}")
async def search_stock(symbol: str):
    cache_key = f"search_{symbol}"
    cached = get_cached_data(cache_key, 300) # 5 min cache
    if cached:
        return cached

    if not symbol.endswith(".NS") and not symbol.endswith(".BO"):
        symbol = f"{symbol.upper()}.NS"
    else:
        symbol = symbol.upper()
        
    try:
        t = yf.Ticker(symbol)
        info = t.info
        
        result = {
            "symbol": symbol.replace(".NS", ""),
            "name": info.get("longName", info.get("shortName", symbol)),
            "currentPrice": info.get("currentPrice", info.get("previousClose", 0)),
            "dayHigh": info.get("dayHigh", 0),
            "dayLow": info.get("dayLow", 0),
            "open": info.get("open", 0),
            "previousClose": info.get("previousClose", 0),
            "volume": info.get("volume", 0),
            "marketCap": format_inr(info.get("marketCap", 0)),
            "trailingPE": info.get("trailingPE", 0),
            "fiftyTwoWeekHigh": info.get("fiftyTwoWeekHigh", 0),
            "fiftyTwoWeekLow": info.get("fiftyTwoWeekLow", 0),
            "longBusinessSummary": info.get("longBusinessSummary", "No summary available."),
            "sector": info.get("sector", "Unknown")
        }
        set_cached_data(cache_key, result)
        return result
    except Exception as e:
        return {"error": str(e)}


@app.get("/chart/{index}")
async def chart_data(index: str):
    cache_key = f"chart_{index}"
    cached = get_cached_data(cache_key, 60)
    if cached:
        return cached

    symbols = {
        "NIFTY": "^NSEI",
        "SENSEX": "^BSESN",
        "BANKNIFTY": "^NSEBANK"
    }
    symbol = symbols.get(index.upper())
    if not symbol:
        symbol = index if index.endswith(".NS") or index.endswith(".BO") else f"{index.upper()}.NS"
    
    try:
        t = yf.Ticker(symbol)
        df = t.history(period="1d", interval="5m")
        
        if df.empty:
            return {"error": f"No chart data found for {symbol}", "data": []}
            
        chart_points = []
        for index_val, row in df.iterrows():
            time_str = index_val.strftime("%H:%M")
            chart_points.append({
                "time": time_str,
                "price": round(float(row["Close"]), 2)
            })
            
        result = {"data": chart_points}
        set_cached_data(cache_key, result)
        return result
    except Exception as e:
        print("Chart Error:", e)
        return {"error": "Chart data unavailable", "data": []}


# =========================================
# NEWS + SENTIMENT
# =========================================

@app.get("/news")
def get_news():
    cached = get_cached_data("news", 300) # 5 min
    if cached:
        return cached

    try:

        api_key = os.getenv("NEWS_API_KEY")

        url = (
            f"https://newsapi.org/v2/everything?"
            f"q=NIFTY OR BANKNIFTY OR stock market OR Sensex OR NSE India&"
            f"language=en&"
            f"sortBy=publishedAt&"
            f"pageSize=5&"
            f"apiKey={api_key}"
        )

        response = requests.get(url)
        data = response.json()

        articles = []

        for article in data.get("articles", []):

            title = article.get("title", "No Title")

            score = analyzer.polarity_scores(title)

            compound = score["compound"]

            if compound >= 0.05:
                sentiment = "POSITIVE"
            elif compound <= -0.05:
                sentiment = "NEGATIVE"
            else:
                sentiment = "NEUTRAL"

            articles.append({
                "title": title,
                "source": article["source"]["name"],
                "url": article["url"],
                "sentiment": sentiment,
                "confidence": abs(round(compound, 2))
            })

        result = {"news": articles}
        set_cached_data("news", result)
        return result

    except Exception as e:
        return {
            "error": "News data unavailable"
        }


# =========================================
# AI CHAT
# =========================================

@app.post("/chat")
async def chat_with_ai(data: dict):
    user_message = data.get("message", "")
    if not user_message:
        return {"error": "Message cannot be empty"}
        
    cache_key = f"chat_{user_message.strip().lower()}"
    cached = get_cached_data(cache_key, 300)
    if cached:
        return {"reply": cached}

    try:
        # Get Context
        market_ctx = get_cached_data("market", 30)
        news_ctx = get_cached_data("news", 300)
        
        context_str = "Current Market Data is not available."
        if market_ctx:
            context_str = f"""
Current Market Context:
- NIFTY: {market_ctx.get('NIFTY')}
- SENSEX: {market_ctx.get('SENSEX')}
- BANKNIFTY: {market_ctx.get('BANKNIFTY')}
- India VIX: {market_ctx.get('VIX')}
- Market Breadth: {market_ctx.get('breadth', {})}
- Sectors: {market_ctx.get('sectors', [])}
- FII/DII Data: {market_ctx.get('fii_dii', [])}
"""
        news_str = ""
        if news_ctx and "news" in news_ctx:
            headlines = [n["title"] for n in news_ctx["news"][:3]]
            news_str = f"Recent News Headlines: {', '.join(headlines)}"
            
        system_prompt = f"""You are TradeMind AI, an expert Indian financial market analyst.

You specialize in:
- NIFTY
- Sensex
- BankNifty
- Indian equities
- Sector analysis
- Market breadth
- FII/DII activity
- Technical indicators
- Financial news analysis

Provide educational market insights and explanations.
Never provide financial advice or guarantee profits.
Always explain reasoning clearly and concisely.

{context_str}
{news_str}
"""
        reply = await generate_ai_response(system_prompt, user_message)
        
        set_cached_data(cache_key, reply)
        return {"reply": reply}

    except Exception as e:
        print("AI Chat Error:", e)
        return {"error": "AI service temporarily unavailable"}