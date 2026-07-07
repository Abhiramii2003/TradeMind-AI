import { useEffect, useState } from "react";
import "./App.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {

  const [market, setMarket] = useState(null);

  const [news, setNews] = useState([]);

  const [question, setQuestion] = useState("");

  const [aiReply, setAiReply] = useState("");


  // ====================================
  // FETCH MARKET DATA
  // ====================================

  useEffect(() => {

    fetch("http://127.0.0.1:8000/market")
      .then((res) => res.json())
      .then((data) => {
        console.log("MARKET DATA:", data);
        setMarket(data);
      });

  }, []);


  // ====================================
  // FETCH NEWS
  // ====================================

  useEffect(() => {

    fetch("http://127.0.0.1:8000/news")
      .then((res) => res.json())
      .then((data) => {
        setNews(data.news || []);
      });

  }, []);


  // ====================================
  // AI CHAT
  // ====================================

  const askAI = async () => {

    const response = await fetch(
      "http://127.0.0.1:8000/chat",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: question,
        }),
      }
    );

    const data = await response.json();

    setAiReply(data.reply);
  };


  // ====================================
  // CHART DATA
  // ====================================

  const chartData = [
    { time: "9AM", value: 24300 },
    { time: "10AM", value: 24350 },
    { time: "11AM", value: 24400 },
    { time: "12PM", value: 24420 },
    { time: "1PM", value: 24450 },
  ];


  return (

    <div className="app">

      {/* HEADER */}

      <div className="header">

        <h1>TradeMind AI</h1>

        <p>
          AI Powered Market Intelligence Platform
        </p>

      </div>


      {/* MARKET CARDS */}

      <div className="market-grid">

        <div className="card">

          <h2>NIFTY</h2>

          <h1>
            {market?.nifty || "Loading..."}
          </h1>

        </div>


        <div className="card">

          <h2>BANKNIFTY</h2>

          <h1>
            {market?.banknifty || "Loading..."}
          </h1>

        </div>

      </div>


      {/* CHART */}

      <div className="chart-card">

        <h2>NIFTY Trend</h2>

        <ResponsiveContainer
          width="100%"
          height={300}
        >

          <LineChart data={chartData}>

            <XAxis dataKey="time" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#00c3ff"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>


      {/* GAINERS & LOSERS */}

      <div className="market-grid">

        <div className="card">

          <h2 className="green">
            Top Gainers
          </h2>

          {market?.gainers?.map((stock, index) => (

            <div
              key={index}
              className="stock-item"
            >

              <h3>{stock.name}</h3>

              <p>₹{stock.price}</p>

              <span className="green">
                {stock.change}
              </span>

            </div>

          ))}

        </div>


        <div className="card">

          <h2 className="red">
            Top Losers
          </h2>

          {market?.losers?.map((stock, index) => (

            <div
              key={index}
              className="stock-item"
            >

              <h3>{stock.name}</h3>

              <p>₹{stock.price}</p>

              <span className="red">
                {stock.change}
              </span>

            </div>

          ))}

        </div>

      </div>


      {/* WATCHLIST */}

      <div className="card">

        <h2>Watchlist</h2>

        <div className="watchlist">

          {market?.watchlist?.map(
            (stock, index) => (

              <div
                key={index}
                className="watch-item"
              >

                <h3>{stock.name}</h3>

                <p>₹{stock.price}</p>

              </div>

            )
          )}

        </div>

      </div>


      {/* AI CHAT */}

      <div className="card">

        <h2>AI Market Assistant</h2>

        <div className="chat-box">

          <input
            type="text"
            placeholder="Ask about market trends..."
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
          />

          <button onClick={askAI}>
            Ask AI
          </button>

        </div>

        {aiReply && (

          <div className="ai-response">

            {aiReply}

          </div>

        )}

      </div>


      {/* NEWS */}

      <div className="card">

        <h2>
          Market Intelligence Feed
        </h2>

        {news.map((item, index) => (

          <div
            key={index}
            className="news-item"
          >

            <h3>{item.title}</h3>

            <p>{item.source}</p>

            <span
              className={
                item.sentiment === "POSITIVE"
                  ? "green"
                  : "red"
              }
            >
              {item.sentiment}
            </span>

            <br />

            <a
              href={item.url}
              target="_blank"
            >
              Read More
            </a>

          </div>

        ))}

      </div>

    </div>
  );
}

export default App;