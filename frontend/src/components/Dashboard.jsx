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
            console.error(error);
        }
    };

    const fetchNews = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/news");
            setNews(response.data.news);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white px-6 py-8">

            {/* HEADER */}
            <div className="mb-10">
                <h1 className="text-5xl font-bold mb-3">
                    TradeMind AI
                </h1>

                <p className="text-gray-400 text-lg">
                    AI Powered Market Intelligence Platform
                </p>
            </div>

            {/* MARKET SECTION */}
            {marketData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

                    <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800 shadow-xl">
                        <p className="text-gray-400 text-lg mb-3">
                            NIFTY
                        </p>

                        <h2 className="text-5xl font-bold text-green-400">
                            {marketData.NIFTY}
                        </h2>
                    </div>

                    <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800 shadow-xl">
                        <p className="text-gray-400 text-lg mb-3">
                            BANKNIFTY
                        </p>

                        <h2 className="text-5xl font-bold text-blue-400">
                            {marketData.BANKNIFTY}
                        </h2>
                    </div>

                </div>
            )}

            {/* NEWS SECTION */}
            <div>
                <h2 className="text-3xl font-bold mb-8">
                    Market Intelligence Feed
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {news.map((article, index) => (
                        <div
                            key={index}
                            className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-lg hover:scale-[1.02] transition duration-300"
                        >
                            <h3 className="text-xl font-semibold leading-relaxed mb-5">
                                {article.title}
                            </h3>

                            <div className="flex items-center justify-between mb-5">

                                <span className="text-gray-400">
                                    {article.source}
                                </span>

                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${article.sentiment === "POSITIVE"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-red-500/20 text-red-400"
                                        }`}
                                >
                                    {article.sentiment}
                                </span>

                            </div>

                            <a
                                href={article.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-400 hover:text-blue-300 transition"
                            >
                                Read Full Article →
                            </a>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
};

export default Dashboard;