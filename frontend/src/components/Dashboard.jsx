import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
    const [marketData, setMarketData] = useState(null);
    const [news, setNews] = useState([]);

    useEffect(() => {
        fetchMarketData();
        fetchNews();
    }, []);

    const fetchMarketData = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/market");
            setMarketData(response.data);
        } catch (error) {
            console.error("Error fetching market data:", error);
        }
    };

    const fetchNews = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/news");
            setNews(response.data.news);
        } catch (error) {
            console.error("Error fetching news:", error);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <h1 className="text-4xl font-bold mb-8">
                TradeMind AI Dashboard
            </h1>

            {/* Market Cards */}
            {marketData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-semibold mb-2">NIFTY</h2>
                        <p className="text-3xl text-green-400">
                            {marketData.NIFTY}
                        </p>
                    </div>

                    <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-semibold mb-2">
                            BANKNIFTY
                        </h2>
                        <p className="text-3xl text-blue-400">
                            {marketData.BANKNIFTY}
                        </p>
                    </div>
                </div>
            ) : (
                <p>Loading market data...</p>
            )}

            {/* News Section */}
            <div>
                <h2 className="text-3xl font-bold mb-6">
                    Financial News
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {news.map((article, index) => (
                        <div
                            key={index}
                            className="bg-zinc-900 p-5 rounded-2xl shadow-md hover:scale-[1.02] transition"
                        >
                            <h3 className="text-xl font-semibold mb-3">
                                {article.title}
                            </h3>

                            <p className="text-gray-400 mb-4">
                                Source: {article.source}
                            </p>

                            <a
                                href={article.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-400 hover:underline"
                            >
                                Read More →
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;