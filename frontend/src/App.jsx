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

  useEffect(() => {
    fetchMarket();
    fetchNews();
  }, []);

  const fetchMarket = async () => {
    const res = await axios.get("http://127.0.0.1:8000/market");
    setMarket(res.data);
  };

  const fetchNews = async () => {
    const res = await axios.get("http://127.0.0.1:8000/news");
    setNews(res.data.news);
  };

  return (
    <div className="app">

      {/* HEADER */}
      <div className="header">
        <h1>TradeMind AI</h1>
        <p>AI Powered Market Intelligence Platform</p>
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

        <ResponsiveContainer width="100%" height={300}>

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