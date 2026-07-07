import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {

  const [market, setMarket] = useState({});
  const [news, setNews] = useState([]);

  // AI CHAT STATES
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  // LOADING STATE
  const [loading, setLoading] = useState(false);

  // AUTO REFRESH MARKET DATA
  useEffect(() => {

    fetchMarket();
    fetchNews();

    const interval = setInterval(() => {
      fetchMarket();
    }, 5000);

    return () => clearInterval(interval);

  }, []);

  // FETCH MARKET DATA
  const fetchMarket = async () => {

    try {

      const res = await axios.get(
        "http://127.0.0.1:8000/market"
      );

      setMarket(res.data);

    } catch (error) {

      console.log(error);

    }
  };

  // FETCH NEWS
  const fetchNews = async () => {

    try {

      const res = await axios.get(
        "http://127.0.0.1:8000/news"
      );

      setNews(res.data.news);

    } catch (error) {

      console.log(error);

    }
  };

  // AI CHAT FUNCTION
  const askAI = async () => {

    setLoading(true);

    try {

      const res = await axios.post(
        "http://127.0.0.1:8000/chat",
        {
          message: message,
        }
      );

      setReply(res.data.reply);

    } catch (error) {

      console.log(error);

      setReply(
        "AI service is currently unavailable."
      );
    }

    setLoading(false);
  };

  return (

    <div className="app">

      {/* HEADER */}
      <div className="header">

        <h1>TradeMind AI</h1>

        <p>
          AI Powered Market Intelligence Platform
        </p>

      </div>

      {/* MARKET DATA */}
      <div className="market-grid">

        <div className="card">

          <h2>NIFTY</h2>

          <h1>{market.NIFTY}</h1>

        </div>

        <div className="card">

          <h2>BANKNIFTY</h2>

          <h1>{market.BANKNIFTY}</h1>

        </div>

      </div>

      {/* NIFTY TREND CHART */}
      <div className="card chart-card">

        <h2>NIFTY Trend</h2>

        <ResponsiveContainer
          width="100%"
          height={300}
        >

          <LineChart
            data={[
              { time: "9AM", value: 24100 },
              { time: "10AM", value: 24220 },
              { time: "11AM", value: 24300 },
              { time: "12PM", value: 24270 },
              { time: "1PM", value: 24398 },
            ]}
          >

            <XAxis
              dataKey="time"
              stroke="#94a3b8"
            />

            <YAxis
              stroke="#94a3b8"
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#38bdf8"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* STOCKS SECTION */}
      <div className="stocks-section">

        {/* TOP GAINERS */}
        <div className="card">

          <h2 className="green">
            Top Gainers
          </h2>

          {market.gainers?.map((stock, index) => (

            <div
              className="stock-row"
              key={index}
            >

              <div>

                <h3>{stock.name}</h3>

                <p>₹{stock.price}</p>

              </div>

              <h3 className="green">
                {stock.change}
              </h3>

            </div>

          ))}

        </div>

        {/* TOP LOSERS */}
        <div className="card">

          <h2 className="red">
            Top Losers
          </h2>

          {market.losers?.map((stock, index) => (

            <div
              className="stock-row"
              key={index}
            >

              <div>

                <h3>{stock.name}</h3>

                <p>₹{stock.price}</p>

              </div>

              <h3 className="red">
                {stock.change}
              </h3>

            </div>

          ))}

        </div>

      </div>

      {/* AI CHAT SECTION */}
      <div className="card ai-chat">

        <h2>
          AI Market Assistant
        </h2>

        <div className="chat-box">

          <input
            type="text"
            placeholder="Ask about market trends..."
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
          />

          <button onClick={askAI}>
            {loading ? "Analyzing..." : "Ask AI"}
          </button>

        </div>

        {reply && (

          <div className="ai-reply">

            <p>{reply}</p>

          </div>

        )}

      </div>

      {/* NEWS SECTION */}
      <div className="news-section">

        <h2>
          Market Intelligence Feed
        </h2>

        {news.map((item, index) => (

          <div
            className="news-card"
            key={index}
          >

            <h3>{item.title}</h3>

            <div className="news-footer">

              <div>

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

              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
              >
                Read More
              </a>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default App;