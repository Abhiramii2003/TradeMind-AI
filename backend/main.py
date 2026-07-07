from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import yfinance as yf
import os
import requests

from pathlib import Path
from dotenv import load_dotenv

from transformers import pipeline
from openai import OpenAI


# =========================================
# LOAD ENV VARIABLES
# =========================================

BASE_DIR = Path(__file__).resolve().parent

env_file = BASE_DIR / ".env"

print("ENV PATH:", env_file)

load_dotenv(env_file)

print("FIREWORKS KEY:", os.getenv("FIREWORKS_API_KEY"))


# =========================================
# FIREWORKS AI CLIENT
# =========================================

client = OpenAI(
    api_key=os.getenv("FIREWORKS_API_KEY"),
    base_url="https://api.fireworks.ai/inference/v1",
)


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
def market_data():

    try:

        # LIVE MARKET DATA
        nifty = yf.Ticker("^NSEI")
        banknifty = yf.Ticker("^NSEBANK")

        nifty_price = nifty.history(period="1d")["Close"].iloc[-1]
        banknifty_price = banknifty.history(period="1d")["Close"].iloc[-1]

        return {
            "NIFTY": round(float(nifty_price), 2),
            "BANKNIFTY": round(float(banknifty_price), 2),

            # TOP GAINERS
            "gainers": [
                {
                    "name": "RELIANCE",
                    "price": 3120,
                    "change": "+2.4%"
                },
                {
                    "name": "TCS",
                    "price": 4280,
                    "change": "+1.9%"
                },
                {
                    "name": "INFY",
                    "price": 1670,
                    "change": "+1.5%"
                },
            ],

            # TOP LOSERS
            "losers": [
                {
                    "name": "HDFC",
                    "price": 1540,
                    "change": "-1.8%"
                },
                {
                    "name": "ITC",
                    "price": 420,
                    "change": "-1.1%"
                },
                {
                    "name": "WIPRO",
                    "price": 540,
                    "change": "-0.9%"
                },
            ],

            # WATCHLIST
            "watchlist": [
                {
                    "name": "ADANIENT",
                    "price": 3510
                },
                {
                    "name": "SBIN",
                    "price": 890
                },
                {
                    "name": "TATASTEEL",
                    "price": 176
                },
            ]
        }

    except Exception as e:
        return {
            "error": str(e)
        }


# =========================================
# FINANCIAL NEWS + SENTIMENT ROUTE
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
            f"domains=economictimes.indiatimes.com,moneycontrol.com,business-standard.com,cnbctv18.com&"
            f"apiKey={api_key}"
        )

        response = requests.get(url)

        data = response.json()

        articles = []

        for article in data.get("articles", [])[:5]:

            title = article.get("title", "No Title")

            sentiment_result = sentiment_pipeline(title)[0]

            label = sentiment_result["label"]

            score = round(sentiment_result["score"], 2)

            articles.append({
                "title": title,
                "source": article["source"]["name"],
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

        user_message = data.get("message")

        if not user_message:
            return {
                "error": "Message is required"
            }

        completion = client.chat.completions.create(

            # CHANGE MODEL LATER AFTER FIREWORKS ACCESS
            model="accounts/fireworks/models/llama-v3-8b-instruct",

            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an AI financial market assistant. "
                        "Answer clearly and professionally about stock market trends, "
                        "NIFTY, BANKNIFTY, trading sentiment, "
                        "finance news, and trading psychology."
                    ),
                },
                {
                    "role": "user",
                    "content": user_message,
                },
            ],

            temperature=0.7,
            max_tokens=300,
        )

        reply = completion.choices[0].message.content

        return {
            "reply": reply
        }

    except Exception as e:

        # TEMPORARY FALLBACK RESPONSE
        return {
            "reply": (
                "AI model is currently unavailable. "
                "Fireworks model access is not enabled yet. "
                "Please apply for AMD Fireworks credits or update the model name later."
            ),
            "error": str(e)
        }