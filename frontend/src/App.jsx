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

      <div className="header">
        <h1>TradeMind AI</h1>
        <p>AI Powered Market Intelligence Platform</p>
      </div>

      <div className="market-grid">

        <div className="card">
          <h2>NIFTY</h2>
          <h1>{market.nifty}</h1>
        </div>

        <div className="card">
          <h2>BANKNIFTY</h2>
          <h1>{market.banknifty}</h1>
        </div>

      </div>

      <div className="stocks-section">

        <div className="card">
          <h2 className="green">Top Gainers</h2>

          {market.gainers?.map((stock, index) => (
            <div className="stock-row" key={index}>
              <div>
                <h3>{stock.name}</h3>
                <p>₹{stock.price}</p>
              </div>

              <h3 className="green">{stock.change}</h3>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="red">Top Losers</h2>

          {market.losers?.map((stock, index) => (
            <div className="stock-row" key={index}>
              <div>
                <h3>{stock.name}</h3>
                <p>₹{stock.price}</p>
              </div>

              <h3 className="red">{stock.change}</h3>
            </div>
          ))}
        </div>

      </div>

      <div className="news-section">
        <h2>Market Intelligence Feed</h2>

        {news.map((item, index) => (
          <div className="news-card" key={index}>

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

              <a href={item.url} target="_blank">
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