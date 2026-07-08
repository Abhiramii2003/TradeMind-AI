from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import yfinance as yf
import os
import requests

from pathlib import Path
from dotenv import load_dotenv

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
# MARKET DATA
# =========================================

@app.get("/market")
async def market_data():

    try:
        nifty = yf.Ticker("^NSEI")
        banknifty = yf.Ticker("^NSEBANK")

        nifty_price = nifty.fast_info.get("lastPrice")
        banknifty_price = banknifty.fast_info.get("lastPrice")

        if nifty_price is None:
            nifty_price = 24398.70

        if banknifty_price is None:
            banknifty_price = 58200.70

    except Exception as e:
        print("YFinance Error:", e)

        nifty_price = 24398.70
        banknifty_price = 58200.70

    return {
        "nifty": round(float(nifty_price), 2),
        "banknifty": round(float(banknifty_price), 2),

        "gainers": [
            {
                "name": "RELIANCE",
                "price": 3021,
                "change": "+2.45%"
            },
            {
                "name": "INFY",
                "price": 1689,
                "change": "+1.82%"
            },
            {
                "name": "HDFCBANK",
                "price": 1750,
                "change": "+1.24%"
            }
        ],

        "losers": [
            {
                "name": "TCS",
                "price": 3920,
                "change": "-1.11%"
            },
            {
                "name": "WIPRO",
                "price": 530,
                "change": "-0.84%"
            },
            {
                "name": "SBIN",
                "price": 812,
                "change": "-0.62%"
            }
        ],

        "watchlist": [
            {
                "name": "TATA MOTORS",
                "price": 978
            },
            {
                "name": "ADANIPORTS",
                "price": 1455
            },
            {
                "name": "ICICIBANK",
                "price": 1240
            }
        ]
    }


# =========================================
# NEWS + SENTIMENT
# =========================================

@app.get("/news")
def get_news():

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

        return {
            "news": articles
        }

    except Exception as e:
        return {
            "error": str(e)
        }


# =========================================
# AI CHAT
# =========================================

@app.post("/chat")
async def chat_with_ai(data: dict):

    try:

        user_message = data.get("message", "")

        reply = f"""
Market Analysis for: {user_message}

• Current market sentiment appears bullish.
• Banking sector is showing strength.
• Export-oriented stocks are gaining momentum.
• Investors are actively buying quality large-cap stocks.
"""

        return {
            "reply": reply.strip()
        }

    except Exception as e:
        return {
            "error": str(e)
        }