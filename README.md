
# TradeMind AI 🧠📈

**TradeMind AI** is an AI-powered market intelligence platform built for the Indian stock market ecosystem. It combines real-time market analytics, financial news sentiment analysis, institutional flow tracking, and an AI-powered market assistant into a single unified dashboard.

The platform is designed to help traders, investors, and students better understand market movements through data-driven insights and conversational AI.

---

## 🚀 Features

### 📊 Real-Time Market Dashboard

- Live tracking of:
  - NIFTY 50
  - BSE SENSEX
  - NIFTY BANK
  - India VIX
- Intraday 5-minute interval charts.
- Real-time market snapshots powered by Yahoo Finance.

### 📈 Market Breadth Analytics

- Tracks all NIFTY 50 constituents.
- Displays:
  - Advances
  - Declines
  - Unchanged stocks
- Includes market data quality indicators and tracking statistics.

### 🔥 Sector Performance Heatmap

Monitor sector-wise performance including:

- IT
- Banking
- Pharma
- FMCG
- Metals
- Auto

### 🚀 Top Gainers & Losers

Real-time identification of:

- Top gaining stocks
- Top losing stocks
- Percentage movement
- Live prices

### ⭐ Dynamic Watchlists

- Add any NSE stock to a personalized watchlist.
- Real-time updates on:
  - Price
  - Percentage change
  - Market movement

### 📰 News Intelligence Feed

- Live financial news aggregation.
- Automatic sentiment classification:
  - Positive
  - Negative
  - Neutral
- VADER sentiment engine integration.

### 🤖 AI Market Assistant

An AI-powered conversational assistant capable of:

- Explaining market movements.
- Analyzing sector trends.
- Interpreting institutional flows.
- Summarizing news sentiment.
- Answering finance-related questions using live market context.

### 💰 Institutional Flow Tracking

Track daily:

- Foreign Institutional Investors (FII/FPI)
- Domestic Institutional Investors (DII)

### ⚡ Intelligent Backend Caching

- Reduces Yahoo Finance rate limits.
- Improves response times.
- Enhances dashboard stability.

---

## 🏗️ System Architecture

```text
React + Vite Frontend
        │
        ▼
FastAPI Backend
        │
 ┌──────┼─────────────┐
 │      │             │
 ▼      ▼             ▼
Yahoo  NewsAPI    Fireworks AI
Finance             LLM API
 │
 ▼
VADER Sentiment Engine


---

## 🛠️ Technology Stack

### Frontend

- React 19
- Vite
- Tailwind CSS v4
- React Router
- Recharts
- Axios

### Backend

- Python 3
- FastAPI
- yfinance
- vaderSentiment
- Fireworks AI API
- NewsAPI

### Infrastructure

- Docker
- Docker Compose

---

## 📦 Project Structure

```text
TradeMind-AI/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── README.md
└── screenshots/
```

---

## ⚙️ Installation & Setup

### Option 1 — Docker (Recommended)

#### Clone Repository

```bash
git clone https://github.com/Abhiramii2003/TradeMind-AI.git
cd TradeMind-AI
```

#### Create Environment File

Create:

```text
backend/.env
```

Add:

```env
FIREWORKS_API_KEY=your_fireworks_api_key
NEWS_API_KEY=your_news_api_key
```

#### Start Containers

```bash
docker compose up --build
```

#### Access Application

Frontend:

```text
http://localhost:5173
```

Backend API Documentation:

```text
http://localhost:8000/docs
```

---

### Option 2 — Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Linux/macOS:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run server:

```bash
uvicorn main:app --reload --port 8000
```

---

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 API Endpoints

### GET `/market`

Returns:

- Index values
- Market breadth
- Sector heatmap
- Top gainers and losers
- FII/DII activity

### GET `/watchlist`

Returns:

- Real-time stock prices
- Percentage changes
- Watchlist analytics

Example:

```text
/watchlist?symbols=RELIANCE,TCS,HDFCBANK,INFY
```

### GET `/search/{symbol}`

Returns:

- Company information
- Key financial metrics
- Market statistics

### GET `/chart/{symbol}`

Returns:

- 5-minute interval intraday chart data.

### GET `/news`

Returns:

- Financial news articles
- Sentiment classification.

### POST `/chat`

AI Assistant endpoint.

Features:

- Live market context injection
- Financial Q&A
- Sector analysis
- Market explanations

---

## 📸 Screenshots

Add screenshots before submission:

```text
screenshots/dashboard.png
screenshots/ai_assistant.png
screenshots/market_breadth.png
```

---

## 🎯 Example Questions for the AI Assistant

- Why is the IT sector falling today?
- Analyze Reliance Industries.
- What is driving NIFTY weakness?
- Explain current FII and DII flows.
- Which sectors are outperforming today?
- Summarize today's market sentiment.

---

## 🔮 Future Roadmap

- Self-hosted LLM inference on AMD Developer Cloud GPUs.
- Portfolio risk analytics.
- AI-based Buy/Hold/Sell recommendations.
- Predictive analytics using time-series forecasting models.
- Financial document analysis using Retrieval-Augmented Generation (RAG).
- Personalized investment dashboards.

---

## 🏆 Hackathon Highlights

- AI-powered financial market assistant.
- Full-stack architecture with FastAPI and React.
- Dockerized deployment.
- Real-time market intelligence workflows.
- Market breadth analytics covering all NIFTY 50 constituents.
- Designed for future scalability on AMD GPU infrastructure.
- Approved for AMD Developer Cloud GPU credits.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

Feel free to fork the repository and submit pull requests.

---

## 📝 License

This project is licensed under the MIT License.

---

## 👩‍💻 Author

**Abhirami Aji**

B.Tech Computer Science Engineering  
College of Engineering Poonjar

GitHub:  
https://github.com/Abhiramii2003

Portfolio:  
https://abhiramiportfolio.vercel.app/

LinkedIn:  
https://www.linkedin.com/in/abhirami-aji/