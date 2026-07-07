import { useEffect, useState } from "react";

function Dashboard() {

    const [marketData, setMarketData] = useState(null);
    const [news, setNews] = useState([]);

    useEffect(() => {

        fetch("http://127.0.0.1:8000/market")
            .then((res) => res.json())
            .then((data) => setMarketData(data));

        fetch("http://127.0.0.1:8000/news")
            .then((res) => res.json())
            .then((data) => setNews(data.news));

    }, []);

    if (!marketData) {
        return (
            <div className="text-white p-10">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1120] text-white p-8">

            {/* HEADER */}
            <div className="text-center mb-12">

                <h1 className="text-6xl font-bold mb-4">
                    TradeMind AI
                </h1>

                <p className="text-gray-400 text-xl">
                    AI Powered Market Intelligence Platform
                </p>

            </div>

            {/* MARKET CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

                <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800 shadow-lg">

                    <h2 className="text-gray-400 text-xl mb-2">
                        NIFTY
                    </h2>

                    <p className="text-5xl font-bold text-green-400">
                        {marketData.NIFTY}
                    </p>

                </div>

                <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800 shadow-lg">

                    <h2 className="text-gray-400 text-xl mb-2">
                        BANKNIFTY
                    </h2>

                    <p className="text-5xl font-bold text-blue-400">
                        {marketData.BANKNIFTY}
                    </p>

                </div>

            </div>

            {/* MARKET MOVERS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">

                {/* GAINERS */}
                <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800">

                    <h2 className="text-2xl font-bold mb-5 text-green-400">
                        Top Gainers
                    </h2>

                    {marketData.gainers.map((stock, index) => (

                        <div
                            key={index}
                            className="flex justify-between py-3 border-b border-gray-800"
                        >

                            <span>{stock.name}</span>

                            <div className="text-right">

                                <p>₹{stock.price}</p>

                                <p className="text-green-400">
                                    {stock.change}
                                </p>

                            </div>

                        </div>

                    ))}

                </div>

                {/* LOSERS */}
                <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800">

                    <h2 className="text-2xl font-bold mb-5 text-red-400">
                        Top Losers
                    </h2>

                    {marketData.losers.map((stock, index) => (

                        <div
                            key={index}
                            className="flex justify-between py-3 border-b border-gray-800"
                        >

                            <span>{stock.name}</span>

                            <div className="text-right">

                                <p>₹{stock.price}</p>

                                <p className="text-red-400">
                                    {stock.change}
                                </p>

                            </div>

                        </div>

                    ))}

                </div>

                {/* WATCHLIST */}
                <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800">

                    <h2 className="text-2xl font-bold mb-5 text-blue-400">
                        Watchlist
                    </h2>

                    {marketData.watchlist.map((stock, index) => (

                        <div
                            key={index}
                            className="flex justify-between py-3 border-b border-gray-800"
                        >

                            <span>{stock.name}</span>

                            <p>₹{stock.price}</p>

                        </div>

                    ))}

                </div>

            </div>

            {/* NEWS */}
            <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800">

                <h2 className="text-3xl font-bold mb-8">
                    Market Intelligence Feed
                </h2>

                <div className="space-y-6">

                    {news.map((item, index) => (

                        <div
                            key={index}
                            className="border-b border-gray-800 pb-5"
                        >

                            <h3 className="text-xl font-semibold mb-2">
                                {item.title}
                            </h3>

                            <div className="flex items-center gap-4 mb-3">

                                <span className="text-gray-400">
                                    {item.source}
                                </span>

                                <span
                                    className={`font-bold ${item.sentiment === "POSITIVE"
                                        ? "text-green-400"
                                        : "text-red-400"
                                        }`}
                                >
                                    {item.sentiment}
                                </span>

                            </div>

                            <a
                                href={item.url}
                                target="_blank"
                                className="text-blue-400 hover:underline"
                            >
                                Read Full Article →
                            </a>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );
}

export default Dashboard;