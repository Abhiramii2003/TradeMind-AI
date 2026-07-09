import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    const [marketData, setMarketData] = useState(null);
    const [news, setNews] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [selectedChart, setSelectedChart] = useState("NIFTY");
    const [question, setQuestion] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chatError, setChatError] = useState("");
    
    const [searchQuery, setSearchQuery] = useState("");
    const [watchlist, setWatchlist] = useState(() => {
        const saved = localStorage.getItem("trademind_watchlist");
        return saved ? JSON.parse(saved) : ["RELIANCE", "TCS", "HDFCBANK", "INFY"];
    });
    const [watchlistData, setWatchlistData] = useState([]);
    const [marketError, setMarketError] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);

    const fetchMarketData = () => {
        fetch("http://127.0.0.1:8000/market")
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setMarketError(data.error);
                } else {
                    setMarketData(data);
                    setMarketError(null);
                }
                setIsRetrying(false);
            })
            .catch((err) => {
                setMarketError("Unable to connect to server");
                setIsRetrying(false);
            });
    };

    const fetchNewsData = () => {
        fetch("http://127.0.0.1:8000/news")
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) setNews(data.news);
            })
            .catch(console.error);
    };

    const fetchChartData = (index) => {
        fetch(`http://127.0.0.1:8000/chart/${index}`)
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) setChartData(data.data || []);
            })
            .catch(console.error);
    };

    const fetchWatchlistData = (symbols) => {
        if (symbols.length === 0) {
            setWatchlistData([]);
            return;
        }
        fetch(`http://127.0.0.1:8000/watchlist?symbols=${symbols.join(",")}`)
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) setWatchlistData(data.data || []);
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchMarketData();
        fetchNewsData();

        const marketInterval = setInterval(fetchMarketData, 30000);
        const newsInterval = setInterval(fetchNewsData, 300000);

        return () => {
            clearInterval(marketInterval);
            clearInterval(newsInterval);
        };
    }, []);

    useEffect(() => {
        fetchChartData(selectedChart);
        
        const chartInterval = setInterval(() => fetchChartData(selectedChart), 30000);
        
        return () => clearInterval(chartInterval);
    }, [selectedChart]);

    useEffect(() => {
        localStorage.setItem("trademind_watchlist", JSON.stringify(watchlist));
        fetchWatchlistData(watchlist);
        
        const watchlistInterval = setInterval(() => fetchWatchlistData(watchlist), 30000);
        
        return () => clearInterval(watchlistInterval);
    }, [watchlist]);

    const handleRetry = () => {
        setIsRetrying(true);
        fetchMarketData();
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/stock/${searchQuery.trim()}`);
        }
    };

    const removeWatchlist = (e, symbol) => {
        e.stopPropagation();
        setWatchlist(watchlist.filter(s => s !== symbol));
    };

    const askAI = async () => {
        if (!question.trim()) return;
        
        const userQ = question;
        setQuestion("");
        setIsChatLoading(true);
        setChatError("");
        
        // Add to history
        setChatHistory(prev => [...prev, { role: "user", text: userQ }]);

        try {
            const response = await fetch("http://127.0.0.1:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userQ }),
            });
            const data = await response.json();
            
            if (data.error) {
                setChatError(data.error);
                // Remove the user question from history or mark as error? We can just leave it and show error.
            } else {
                setChatHistory(prev => [...prev, { role: "ai", text: data.reply }]);
            }
        } catch (err) {
            setChatError("AI service temporarily unavailable");
        } finally {
            setIsChatLoading(false);
        }
    };

    if (marketError) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/20 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[128px]"></div>
                
                <div className="relative z-10 flex flex-col items-center gap-6 max-w-md text-center">
                    <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mb-4 shadow-[0_0_30px_rgba(244,63,94,0.3)] border border-rose-500/30">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Connection Lost</h2>
                    <p className="text-slate-400 text-lg">{marketError}</p>
                    <button 
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="mt-6 bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-3 rounded-xl font-bold tracking-widest uppercase transition-all disabled:opacity-50 flex items-center gap-3 shadow-[0_5px_15px_-5px_rgba(255,255,255,0.2)]"
                    >
                        {isRetrying ? (
                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Retrying...</>
                        ) : "Retry Connection"}
                    </button>
                </div>
            </div>
        );
    }

    if (!marketData) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/30 rounded-full blur-[128px]"></div>
                
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="text-2xl font-light tracking-widest text-blue-200 animate-pulse">INITIALIZING TERMINAL</div>
                </div>
            </div>
        );
    }

    const glassCard = "bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-3xl transition-all duration-500 hover:bg-white/[0.05]";

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 relative overflow-hidden font-sans">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">

                {/* HEADER & SEARCH */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-16 mt-8 gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 md:mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 drop-shadow-sm cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.scrollTo(0,0)}>
                            TradeMind AI
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide">
                            Advanced Market Intelligence Platform
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full md:w-[400px]">
                        <input 
                            type="text" 
                            placeholder="Search NSE stocks (e.g. RELIANCE)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl py-4 px-6 pl-12 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
                        />
                        <svg className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <button type="submit" className="hidden"></button>
                    </form>
                </div>

                {/* MARKET CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    <div 
                        onClick={() => setSelectedChart("NIFTY")}
                        className={`${glassCard} p-8 cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)] ${selectedChart === 'NIFTY' ? 'ring-2 ring-blue-500/50 bg-white/[0.06]' : ''}`}
                    >
                        <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-3">NIFTY 50</h2>
                        <p className="text-5xl font-bold text-white tracking-tight">
                            {marketData.NIFTY.toLocaleString('en-IN')}
                        </p>
                    </div>
                    
                    <div 
                        onClick={() => setSelectedChart("SENSEX")}
                        className={`${glassCard} p-8 cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.3)] ${selectedChart === 'SENSEX' ? 'ring-2 ring-purple-500/50 bg-white/[0.06]' : ''}`}
                    >
                        <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-3">BSE SENSEX</h2>
                        <p className="text-5xl font-bold text-white tracking-tight">
                            {marketData.SENSEX.toLocaleString('en-IN')}
                        </p>
                    </div>

                    <div 
                        onClick={() => setSelectedChart("BANKNIFTY")}
                        className={`${glassCard} p-8 cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)] ${selectedChart === 'BANKNIFTY' ? 'ring-2 ring-emerald-500/50 bg-white/[0.06]' : ''}`}
                    >
                        <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-3">NIFTY BANK</h2>
                        <p className="text-5xl font-bold text-white tracking-tight">
                            {marketData.BANKNIFTY.toLocaleString('en-IN')}
                        </p>
                    </div>
                </div>

                {/* ADVANCED METRICS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {/* VIX */}
                    <div className={`${glassCard} p-8 flex flex-col justify-center relative overflow-hidden group`}>
                        <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                        <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-3">India VIX</h2>
                        <div className="flex items-end gap-3">
                            <p className={`text-6xl font-bold tracking-tight ${marketData.VIX > 15 ? 'text-rose-400' : 'text-emerald-400'} drop-shadow-md`}>
                                {marketData.VIX}
                            </p>
                            <span className="text-slate-500 mb-2 font-medium">Vol</span>
                        </div>
                    </div>

                    {/* BREADTH */}
                    <div className={`${glassCard} p-8 flex flex-col justify-center`}>
                        <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-5">Market Breadth</h2>
                        <div className="flex justify-between text-sm mb-3 font-bold tracking-wide">
                            <span className="text-emerald-400 drop-shadow-sm">{marketData.breadth.advances} Adv</span>
                            <span className="text-slate-400 drop-shadow-sm">{marketData.breadth.unchanged} Unc</span>
                            <span className="text-rose-400 drop-shadow-sm">{marketData.breadth.declines} Dec</span>
                        </div>
                        <div className="w-full bg-slate-800/50 h-3 rounded-full overflow-hidden flex shadow-inner border border-white/5">
                            <div 
                                className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                                style={{ width: `${(marketData.breadth.advances / marketData.breadth.total) * 100}%` }}
                            ></div>
                            <div 
                                className="bg-gradient-to-r from-slate-600 to-slate-400 h-full transition-all duration-1000" 
                                style={{ width: `${(marketData.breadth.unchanged / marketData.breadth.total) * 100}%` }}
                            ></div>
                            <div 
                                className="bg-gradient-to-l from-rose-600 to-rose-400 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(244,63,94,0.5)]" 
                                style={{ width: `${(marketData.breadth.declines / marketData.breadth.total) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* FII DII */}
                    <div className={`${glassCard} p-8 flex flex-col justify-center`}>
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Inst. Flow (₹ Cr)</h2>
                            {marketData.fii_dii_date && (
                                <span className="text-xs font-medium text-slate-500 bg-white/5 px-2 py-1 rounded-md">{marketData.fii_dii_date}</span>
                            )}
                        </div>
                        <div className="space-y-4">
                            {marketData.fii_dii.map((item, i) => {
                                const valStr = String(item.netValue).replace(/,/g, '');
                                const val = parseFloat(valStr);
                                const isPositive = val >= 0;
                                return (
                                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                                        <span className="text-slate-300 font-medium tracking-wide">{item.category}</span>
                                        <span className={`text-xl font-bold tracking-tight ${isPositive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]'}`}>
                                            {isPositive ? '+' : ''}{item.netValue}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* SECTOR HEATMAP */}
                <div className={`${glassCard} p-10 mb-16`}>
                    <h2 className="text-2xl font-bold mb-8 text-white tracking-tight flex items-center gap-3">
                        <span className="w-2 h-8 bg-blue-500 rounded-full inline-block"></span>
                        Sector Heatmap
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
                        {marketData.sectors.map((sector, index) => {
                            const isPositive = sector.change >= 0;
                            const intensity = Math.min(Math.abs(sector.change) / 2.5, 1);
                            const baseColor = isPositive ? '16, 185, 129' : '244, 63, 94';
                            const bgColor = `rgba(${baseColor}, ${0.1 + intensity * 0.7})`;
                            const glow = `0 0 ${20 * intensity}px rgba(${baseColor}, ${0.2 + intensity * 0.3})`;
                                
                            return (
                                <div 
                                    key={index} 
                                    className="p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.03] border border-white/10"
                                    style={{ backgroundColor: bgColor, boxShadow: glow }}
                                >
                                    <span className="font-semibold text-white/90 text-sm tracking-widest uppercase mb-3">{sector.name}</span>
                                    <span className="text-white font-extrabold text-3xl tracking-tighter drop-shadow-md">
                                        {isPositive ? '+' : ''}{sector.change}%
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* CHART */}
                <div className={`${glassCard} p-10 mb-16`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                            <span className="w-2 h-8 bg-indigo-500 rounded-full inline-block"></span>
                            Intraday Trend: <span className="text-indigo-400">{selectedChart}</span>
                        </h2>
                        <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                            Live 5-Min Intervals
                        </span>
                    </div>
                    
                    <div className="h-[450px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                                    <XAxis 
                                        dataKey="time" 
                                        stroke="#94a3b8" 
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                        tickLine={false}
                                        axisLine={false}
                                        minTickGap={40}
                                        dy={10}
                                    />
                                    <YAxis 
                                        domain={['auto', 'auto']} 
                                        stroke="#94a3b8" 
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                        tickLine={false}
                                        axisLine={false}
                                        dx={-10}
                                        tickFormatter={(val) => val.toLocaleString('en-IN')}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                            backdropFilter: 'blur(12px)',
                                            borderColor: 'rgba(255, 255, 255, 0.1)', 
                                            borderRadius: '16px', 
                                            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
                                            padding: '12px 20px'
                                        }}
                                        itemStyle={{ color: '#818cf8', fontWeight: 'bold', fontSize: '16px' }}
                                        labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke="#6366f1" 
                                        strokeWidth={4}
                                        dot={false} 
                                        activeDot={{ r: 8, fill: '#818cf8', stroke: '#312e81', strokeWidth: 3 }} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-4">
                                <div className="w-8 h-8 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin"></div>
                                <span className="text-sm font-semibold tracking-widest uppercase">Fetching Chart Data...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* MARKET MOVERS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {/* GAINERS */}
                    <div className={`${glassCard} p-8`}>
                        <h2 className="text-lg font-bold mb-6 text-emerald-400 tracking-wider uppercase flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400">↑</span> 
                            Top Gainers
                        </h2>
                        <div className="space-y-2">
                            {marketData.gainers.map((stock, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigate(`/stock/${stock.name}`)}
                                    className="flex justify-between items-center py-4 px-4 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/5 transition-all group cursor-pointer"
                                >
                                    <span className="font-bold text-white tracking-wide group-hover:text-emerald-300 transition-colors">{stock.name}</span>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-300">₹{stock.price.toLocaleString('en-IN')}</p>
                                        <p className="text-emerald-400 font-bold text-sm tracking-wide drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]">
                                            {stock.change}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LOSERS */}
                    <div className={`${glassCard} p-8`}>
                        <h2 className="text-lg font-bold mb-6 text-rose-400 tracking-wider uppercase flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500/20 text-rose-400">↓</span> 
                            Top Losers
                        </h2>
                        <div className="space-y-2">
                            {marketData.losers.map((stock, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigate(`/stock/${stock.name}`)}
                                    className="flex justify-between items-center py-4 px-4 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/5 transition-all group cursor-pointer"
                                >
                                    <span className="font-bold text-white tracking-wide group-hover:text-rose-300 transition-colors">{stock.name}</span>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-300">₹{stock.price.toLocaleString('en-IN')}</p>
                                        <p className="text-rose-400 font-bold text-sm tracking-wide drop-shadow-[0_0_5px_rgba(244,63,94,0.3)]">
                                            {stock.change}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* WATCHLIST */}
                    <div className={`${glassCard} p-8`}>
                        <h2 className="text-lg font-bold mb-6 text-blue-400 tracking-wider uppercase flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400">★</span> 
                            Watchlist
                        </h2>
                        <div className="space-y-2">
                            {watchlistData.length === 0 ? (
                                <div className="text-slate-500 text-center py-4">Your watchlist is empty.<br/>Search for a stock to add it!</div>
                            ) : (
                                watchlistData.map((stock, index) => {
                                    const isPositive = stock.change.includes('+');
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => navigate(`/stock/${stock.name}`)}
                                            className="flex justify-between items-center py-4 px-4 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/5 transition-all group cursor-pointer"
                                        >
                                            <div>
                                                <span className="font-bold text-white tracking-wide group-hover:text-blue-300 transition-colors block">{stock.name}</span>
                                                <span className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>{stock.change}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {stock.error ? (
                                                    <p className="text-rose-400 text-xs italic">{stock.error}</p>
                                                ) : (
                                                    <p className="font-bold text-slate-300">₹{stock.price.toLocaleString('en-IN')}</p>
                                                )}
                                                <button onClick={(e) => removeWatchlist(e, stock.name)} className="text-slate-500 hover:text-rose-400 transition-colors" title="Remove from Watchlist">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* AI CHAT */}
                <div className="bg-gradient-to-br from-indigo-900/40 via-blue-900/20 to-slate-900/60 backdrop-blur-3xl p-10 md:p-12 rounded-[2.5rem] border border-white/10 mb-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                    <div className="absolute top-[-50%] right-[-10%] w-[80%] h-[150%] bg-[conic-gradient(from_90deg_at_50%_50%,#3b82f620_0%,#8b5cf620_50%,#3b82f620_100%)] blur-3xl pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-1000"></div>
                    
                    <h2 className="text-4xl font-extrabold mb-8 text-white flex items-center gap-4 tracking-tight relative z-10">
                        <span className="text-5xl drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]">✨</span> 
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-300">
                            AI Market Assistant
                        </span>
                    </h2>
                    
                    {/* Chat History */}
                    <div className="flex flex-col gap-4 mb-6 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-5 rounded-2xl max-w-[85%] text-lg font-light tracking-wide shadow-inner ${msg.role === 'user' ? 'bg-indigo-600/40 border border-indigo-400/20 text-white rounded-br-none' : 'bg-black/20 backdrop-blur-md border border-white/5 text-indigo-100 border-l-4 border-l-indigo-500 rounded-bl-none'}`}>
                                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {chatError && (
                        <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 font-semibold flex items-center gap-3 relative z-10">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {chatError}
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-4 relative z-10">
                        <input
                            type="text"
                            placeholder="Ask about market trends, e.g. 'Why is IT sector falling?'"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            disabled={isChatLoading}
                            className="flex-1 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 transition-all text-lg shadow-inner disabled:opacity-50"
                            onKeyDown={(e) => e.key === 'Enter' && askAI()}
                        />
                        <button 
                            onClick={askAI}
                            disabled={isChatLoading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wider uppercase text-sm py-5 px-10 rounded-2xl transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(79,70,229,0.8)] hover:shadow-[0_15px_25px_-10px_rgba(79,70,229,1)] active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isChatLoading ? (
                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Thinking...</>
                            ) : "Analyze"}
                        </button>
                    </div>
                </div>

                {/* NEWS */}
                <div className={`${glassCard} p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]`}>
                    <h2 className="text-3xl font-bold mb-10 text-white tracking-tight flex items-center gap-3">
                        <span className="w-2 h-8 bg-emerald-500 rounded-full inline-block"></span>
                        Market Intelligence Feed
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {news.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white/[0.02] rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.04] flex flex-col h-full group"
                            >
                                <h3 className="text-xl font-bold mb-6 text-white/90 leading-relaxed group-hover:text-white transition-colors">
                                    {item.title}
                                </h3>
                                <div className="mt-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            {item.source}
                                        </span>
                                        <span
                                            className={`text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase ${item.sentiment === "POSITIVE"
                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                : item.sentiment === "NEGATIVE" 
                                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                                                    : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                                                }`}
                                        >
                                            {item.sentiment}
                                        </span>
                                    </div>
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-sm uppercase tracking-widest transition-colors group/link"
                                    >
                                        Read Article 
                                        <span className="group-hover/link:translate-x-2 transition-transform duration-300">→</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;