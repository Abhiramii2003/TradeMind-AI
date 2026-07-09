import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function CompanyAnalysis() {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const [info, setInfo] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [watchlist, setWatchlist] = useState(() => {
        const saved = localStorage.getItem("trademind_watchlist");
        return saved ? JSON.parse(saved) : ["RELIANCE", "TCS", "HDFCBANK", "INFY"];
    });

    useEffect(() => {
        setLoading(true);
        setError(null);
        
        // Fetch Fundamentals
        fetch(`http://127.0.0.1:8000/search/${symbol}`)
            .then(res => res.json())
            .then(data => {
                if(data.error) throw new Error(data.error);
                setInfo(data);
            })
            .catch(err => setError(err.message));

        // Fetch Chart Data
        fetch(`http://127.0.0.1:8000/chart/${symbol}`)
            .then(res => res.json())
            .then(data => {
                setChartData(data.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
            
    }, [symbol]);

    const isWatchlisted = watchlist.includes(info?.symbol || symbol.toUpperCase());

    const toggleWatchlist = () => {
        const targetSymbol = info?.symbol || symbol.toUpperCase();
        let updated = [];
        if (isWatchlisted) {
            updated = watchlist.filter(s => s !== targetSymbol);
        } else {
            updated = [...watchlist, targetSymbol];
        }
        setWatchlist(updated);
        localStorage.setItem("trademind_watchlist", JSON.stringify(updated));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="mt-6 text-xl tracking-widest font-light text-indigo-300 animate-pulse">ANALYZING {symbol.toUpperCase()}</div>
            </div>
        );
    }

    if (error || !info) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
                <h1 className="text-4xl text-rose-500 font-bold mb-4">Analysis Failed</h1>
                <p className="text-slate-400 mb-8">{error || "Could not find stock data."}</p>
                <button onClick={() => navigate("/")} className="px-6 py-3 bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors tracking-widest uppercase font-bold text-sm">Return to Dashboard</button>
            </div>
        );
    }

    const glassCard = "bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-3xl p-8";

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 relative overflow-hidden font-sans">
            {/* Ambient Backgrounds */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Navigation */}
                <button onClick={() => navigate("/")} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest text-sm mb-10 group bg-white/5 px-6 py-3 rounded-full border border-white/10 transition-colors">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm">{info.name}</h1>
                            <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold tracking-widest uppercase text-slate-300">{info.symbol}</span>
                        </div>
                        <p className="text-slate-400 text-lg tracking-wide">{info.sector}</p>
                    </div>
                    
                    <div className="flex flex-row md:flex-row items-end md:items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-left md:text-right">
                            <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-1">Current Price</p>
                            <p className="text-5xl font-bold tracking-tight text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">₹{info.currentPrice?.toLocaleString('en-IN')}</p>
                        </div>
                        <button 
                            onClick={toggleWatchlist}
                            className={`p-4 rounded-2xl border transition-all shadow-lg flex items-center justify-center w-16 h-16 ${isWatchlisted ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
                            title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                        >
                            <svg className="w-8 h-8" fill={isWatchlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {/* Left Column: Chart & Summary */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* CHART */}
                        <div className={`${glassCard} p-10`}>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                <h2 className="text-xl font-bold tracking-wider text-white uppercase flex items-center gap-3">
                                    <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
                                    Intraday Performance
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
                                    <div className="h-full w-full flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-sm">
                                        No Intraday Data Available Today
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BUSINESS SUMMARY */}
                        <div className={`${glassCard} p-10`}>
                            <h2 className="text-xl font-bold tracking-wider text-white uppercase flex items-center gap-3 mb-6">
                                <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
                                Company Profile
                            </h2>
                            <p className="text-slate-300 leading-relaxed tracking-wide text-justify font-light text-lg">
                                {info.longBusinessSummary}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Fundamentals */}
                    <div className="flex flex-col gap-8">
                        <div className={`${glassCard} p-10`}>
                            <h2 className="text-xl font-bold tracking-wider text-white uppercase flex items-center gap-3 mb-8">
                                <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block"></span>
                                Key Metrics
                            </h2>
                            
                            <div className="flex flex-col gap-6">
                                <div className="flex justify-between items-center border-b border-white/5 pb-4 group">
                                    <span className="text-slate-400 font-semibold tracking-widest text-xs uppercase group-hover:text-white transition-colors">Market Cap</span>
                                    <span className="text-white font-bold tracking-wide">₹{info.marketCap?.toLocaleString('en-IN') || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-4 group">
                                    <span className="text-slate-400 font-semibold tracking-widest text-xs uppercase group-hover:text-white transition-colors">PE Ratio (TTM)</span>
                                    <span className="text-white font-bold tracking-wide">{info.trailingPE ? info.trailingPE.toFixed(2) : "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-4 group">
                                    <span className="text-slate-400 font-semibold tracking-widest text-xs uppercase group-hover:text-white transition-colors">Volume</span>
                                    <span className="text-white font-bold tracking-wide">{info.volume?.toLocaleString('en-IN') || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-4 group">
                                    <span className="text-slate-400 font-semibold tracking-widest text-xs uppercase group-hover:text-white transition-colors">Previous Close</span>
                                    <span className="text-white font-bold tracking-wide">₹{info.previousClose?.toLocaleString('en-IN') || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-4 group">
                                    <span className="text-slate-400 font-semibold tracking-widest text-xs uppercase group-hover:text-white transition-colors">Open</span>
                                    <span className="text-white font-bold tracking-wide">₹{info.open?.toLocaleString('en-IN') || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-4 group">
                                    <span className="text-slate-400 font-semibold tracking-widest text-xs uppercase group-hover:text-white transition-colors">Day High</span>
                                    <span className="text-emerald-400 font-bold tracking-wide drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]">₹{info.dayHigh?.toLocaleString('en-IN') || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-4 group">
                                    <span className="text-slate-400 font-semibold tracking-widest text-xs uppercase group-hover:text-white transition-colors">Day Low</span>
                                    <span className="text-rose-400 font-bold tracking-wide drop-shadow-[0_0_5px_rgba(244,63,94,0.3)]">₹{info.dayLow?.toLocaleString('en-IN') || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-4 group">
                                    <span className="text-slate-400 font-semibold tracking-widest text-xs uppercase group-hover:text-white transition-colors">52W High</span>
                                    <span className="text-emerald-400 font-bold tracking-wide drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]">₹{info.fiftyTwoWeekHigh?.toLocaleString('en-IN') || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-slate-400 font-semibold tracking-widest text-xs uppercase group-hover:text-white transition-colors">52W Low</span>
                                    <span className="text-rose-400 font-bold tracking-wide drop-shadow-[0_0_5px_rgba(244,63,94,0.3)]">₹{info.fiftyTwoWeekLow?.toLocaleString('en-IN') || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default CompanyAnalysis;
