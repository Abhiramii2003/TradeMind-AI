from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import os
import requests
from dotenv import load_dotenv
from transformers import pipeline

load_dotenv()

app = FastAPI()
sentiment_pipeline = pipeline(
    "sentiment-analysis"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "TradeMind AI Backend Running"}

@app.get("/market")
def market_data():
    nifty = yf.Ticker("^NSEI")
    banknifty = yf.Ticker("^NSEBANK")

    nifty_price = nifty.history(period="1d")["Close"].iloc[-1]
    banknifty_price = banknifty.history(period="1d")["Close"].iloc[-1]

    return {
        "NIFTY": round(float(nifty_price), 2),
        "BANKNIFTY": round(float(banknifty_price), 2)
    }

@app.get("/news")
def get_news():
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

        title = article["title"]

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

    return {"news": articles}