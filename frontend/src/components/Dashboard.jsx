import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
    const [marketData, setMarketData] = useState(null);

    useEffect(() => {
        fetchMarketData();
    }, []);

    const fetchMarketData = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/market");
            setMarketData(response.data);
        } catch (error) {
            console.error("Error fetching market data:", error);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <h1 className="text-4xl font-bold mb-8">
                TradeMind AI Dashboard
            </h1>

            {marketData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
    );
};

export default Dashboard;