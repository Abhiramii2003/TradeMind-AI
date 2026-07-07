from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import yfinance as yf
import os
import requests

from pathlib import Path
from dotenv import load_dotenv

from transformers import pipeline


# =========================================
# LOAD ENV VARIABLES
# =========================================

BASE_DIR = Path(__file__).resolve().parent

env_file = BASE_DIR / ".env"

print("ENV PATH:", env_file)

load_dotenv(env_file)

print("NEWS API:", os.getenv("NEWS_API_KEY"))


# =========================================
# FASTAPI APP
# =========================================

app = FastAPI()


# =========================================
# SENTIMENT ANALYSIS MODEL
# =========================================

sentiment_pipeline = pipeline(
    "sentiment-analysis"
)


# =========================================
# CORS CONFIG
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
# MARKET DATA ROUTE
# =========================================

@app.get("/market")
async def market_data():

    try:

        # LIVE MARKET DATA
        nifty = yf.Ticker("^NSEI")
        banknifty = yf.Ticker("^NSEBANK")

        # BETTER REALTIME FETCH
        nifty_price = nifty.fast_info["lastPrice"]
        banknifty_price = banknifty.fast_info["lastPrice"]

    except Exception as e:

        print("YFinance Error:", e)

        # FALLBACK VALUES
        nifty_price = 24398.7
        banknifty_price = 58200.7

    return {

        "nifty": round(float(nifty_price), 2),

        "banknifty": round(
            float(banknifty_price), 2
        ),

        # TOP GAINERS
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

        # TOP LOSERS
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

        # WATCHLIST
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
# FINANCIAL NEWS + SENTIMENT ROUTE
# =========================================

@app.get("/news")
def get_news():

    try:

        api_key = os.getenv(
            "NEWS_API_KEY"
        )

        url = (
            f"https://newsapi.org/v2/everything?"
            f"q=NIFTY OR BANKNIFTY OR stock market OR Sensex OR NSE India&"
            f"language=en&"
            f"sortBy=publishedAt&"
            f"domains=economictimes.indiatimes.com,moneycontrol.com,business-standard.com,cnbctv18.com&"
            f"apiKey={api_key}"
        )

        response = requests.get(url)

        data = response.json()

        articles = []

        for article in data.get(
            "articles", []
        )[:5]:

            title = article.get(
                "title",
                "No Title"
            )

            sentiment_result = (
                sentiment_pipeline(title)[0]
            )

            label = sentiment_result[
                "label"
            ]

            score = round(
                sentiment_result["score"],
                2
            )

            articles.append({

                "title": title,

                "source": article[
                    "source"
                ]["name"],

                "url": article["url"],

                "sentiment": label,

                "confidence": score
            })

        return {
            "news": articles
        }

    except Exception as e:

        return {
            "error": str(e)
        }


# =========================================
# AI MARKET CHAT ASSISTANT
# =========================================

@app.post("/chat")
async def chat_with_ai(data: dict):

    try:

        user_message = data["message"]

        # SIMPLE AI RESPONSE
        reply = f"""
Market analysis for: {user_message}

Current market sentiment appears bullish.
Banking and export sectors are performing strongly.
Investors are showing positive momentum today.
"""

        return {
            "reply": reply
        }

    except Exception as e:

        return {
            "error": str(e)
        }