import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, Clock, Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSearch } from '../context/SearchContext';

// Mock Data Generators
const generateChartData = (points = 50) => {
    let data = [];
    let value = 1500;
    for (let i = 0; i < points; i++) {
        value = value + (Math.random() - 0.5) * 50;
        data.push({ time: `${i}:00`, value: Math.abs(value) });
    }
    return data;
};

const topGainers = [
    { id: 1, symbol: 'ADANIENT', name: 'Adani Enterprises', price: 2450.60, change: 5.4, volume: '12M' },
    { id: 2, symbol: 'TATASTEEL', name: 'Tata Steel', price: 145.20, change: 3.2, volume: '45M' },
    { id: 3, symbol: 'INFY', name: 'Infosys Ltd', price: 1650.00, change: 2.8, volume: '8M' },
];

const topLosers = [
    { id: 1, symbol: 'WIPRO', name: 'Wipro Ltd', price: 450.30, change: -2.1, volume: '5M' },
    { id: 2, symbol: 'ONGC', name: 'ONGC', price: 180.50, change: -1.5, volume: '18M' },
    { id: 3, symbol: 'ITC', name: 'ITC Ltd', price: 410.20, change: -0.8, volume: '22M' },
];

const MarketsPage = () => {
    const { t } = useTranslation();
    const { searchQuery } = useSearch();
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    const [indicesData, setIndicesData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('gainers');

    // Search Effect
    useEffect(() => {
        if (!searchQuery) {
            setSearchResult(null);
            return;
        }

        const fetchSearch = async () => {
            try {
                setSearchLoading(true);
                setSearchError(null);
                const response = await fetch(`http://127.0.0.1:8000/api/search/?symbol=${searchQuery}`);
                if (!response.ok) throw new Error('Stock not found');
                const data = await response.json();
                setSearchResult(data);
            } catch (err) {
                setSearchError(err.message);
                setSearchResult(null);
            } finally {
                setSearchLoading(false);
            }
        };

        const timeout = setTimeout(fetchSearch, 500); // Debounce
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    useEffect(() => {
        const fetchIndices = async () => {
            try {
                setLoading(true);
                const endpoints = ['nifty', 'sensex', 'banknifty'];
                // Add logic to handle slow requests
                const fetchWithTimeout = (url, ms = 5000) => {
                    return Promise.race([
                        fetch(url).then(async res => {
                            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                            return res.json();
                        }),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), ms))
                    ]);
                };

                const responses = await Promise.all(
                    endpoints.map(endpoint => fetchWithTimeout(`http://127.0.0.1:8000/api/${endpoint}/`, 8000))
                );

                // Map backend data to frontend format
                // Map backend data to frontend format
                const mappedData = responses.map((data) => ({
                    name: data.name,
                    value: data.value,
                    change: data.percent, // Using percent string directly for display
                    isPositive: String(data.change || '').startsWith('+')
                }));
                setIndicesData(mappedData);
                setError(null);
            } catch (error) {
                console.error("Failed to fetch market indices:", error);
                setError(error.message);
                // Fallback to mock data on error/timeout so the page isn't empty
                setIndicesData([
                    { name: 'NIFTY 50', value: 24000, change: 0.8, isPositive: true },
                    { name: 'SENSEX', value: 79000, change: 0.8, isPositive: true },
                    { name: 'BANK NIFTY', value: 51000, change: -0.4, isPositive: false }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchIndices();
        const interval = setInterval(fetchIndices, 60000); // Verify less often to avoid rate limits
        return () => clearInterval(interval);
    }, []);

    const [chartData, setChartData] = useState(generateChartData());

    // Simulate live chart updates
    useEffect(() => {
        const interval = setInterval(() => {
            setChartData(prev => {
                const lastValue = prev[prev.length - 1].value;
                const newValue = lastValue + (Math.random() - 0.5) * 30;
                return [...prev.slice(1), { time: 'Now', value: newValue }];
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('market_watch')}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{t('markets_subtitle')}</p>

                        {/* Search Status */}
                        {searchLoading && <p className="text-cyan-600 mt-2 animate-pulse">{t('searching_for')} "{searchQuery}"...</p>}
                        {searchError && <p className="text-red-500 mt-2">Error: {searchError}</p>}

                        {/* Main Status Indicators */}
                        {loading && !indicesData.length && (
                            <div className="flex items-center gap-2 mt-2 text-cyan-600 dark:text-neon-cyan animate-pulse">
                                <span className="w-2 h-2 bg-current rounded-full"></span>
                                <span className="text-sm font-medium">Fetching live market data...</span>
                            </div>
                        )}
                        {error && (
                            <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded border border-red-200 dark:border-red-800/30">
                                <p className="font-bold">⚠️ {t('connection_error')}</p>
                                <p>{error}</p>
                                <p className="text-xs mt-1 text-gray-500">
                                    Troubleshooting:<br />
                                    1. Ensure backend is running at <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">http://127.0.0.1:8000</code><br />
                                    2. Check console logs (F12) for detailed error.<br />
                                    3. Try disabling ad blockers or VPN.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Result Card */}
                {searchResult && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-cyan-50/10 dark:bg-cyan-900/10 backdrop-blur-xl mb-6 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <TrendingUp className="w-24 h-24 text-cyan-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('search_result')}</h2>
                        <div className="flex items-center gap-8">
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{t('symbol')}</div>
                                <div className="text-2xl font-bold text-cyan-600 dark:text-neon-cyan">{searchResult.symbol}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">{searchResult.name}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{t('price')}</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{searchResult.price}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{t('change')}</div>
                                <div className={`text-xl font-bold ${searchResult.change_percent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {searchResult.change_percent}%
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{t('volume')}</div>
                                <div className="text-xl font-bold text-gray-700 dark:text-gray-300">{searchResult.volume.toLocaleString()}</div>
                            </div>
                            {searchResult.suggestion && (
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Suggestion</div>
                                    <div className={`text-lg font-bold px-3 py-1 rounded-lg inline-block ${searchResult.suggestion === 'Buy'
                                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                                        : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                                        }`}>
                                        {searchResult.suggestion}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Market Indices Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(indicesData.length > 0 ? indicesData : ['NIFTY 50', 'SENSEX', 'BANK NIFTY'].map((name, i) => ({ name, value: 24000 + i * 5000, change: 0.8, isPositive: true }))).map((index, i) => (
                        <motion.div
                            key={index.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-panel p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-fintech-card/50 backdrop-blur-xl"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-gray-500 dark:text-gray-400 font-medium">{index.name}</h3>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {index.value}
                                    </div>
                                </div>
                                <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${index.isPositive ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                    {index.change}
                                </div>
                            </div>
                            <div className="h-16">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={index.isPositive ? "#10B981" : "#EF4444"} stopOpacity={0.2} />
                                                <stop offset="100%" stopColor={index.isPositive ? "#10B981" : "#EF4444"} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={index.isPositive ? "#10B981" : "#EF4444"}
                                            strokeWidth={2}
                                            fill={`url(#grad${i})`}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Gainers/Losers Lists */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-panel rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-fintech-card/50">
                            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex gap-6">
                                <button
                                    onClick={() => setSelectedTab('gainers')}
                                    className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${selectedTab === 'gainers' || selectedTab === 'overview' ? 'text-cyan-600 dark:text-neon-cyan border-cyan-600 dark:border-neon-cyan' : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    {t('top_gainers')}
                                </button>
                                <button
                                    onClick={() => setSelectedTab('losers')}
                                    className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${selectedTab === 'losers' ? 'text-cyan-600 dark:text-neon-cyan border-cyan-600 dark:border-neon-cyan' : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    {t('top_losers')}
                                </button>
                            </div>

                            <div className="p-4">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <th className="pb-4">{t('company')}</th>
                                            <th className="pb-4 text-right">{t('price')}</th>
                                            <th className="pb-4 text-right">{t('change')}</th>
                                            <th className="pb-4 text-right hidden sm:table-cell">{t('volume')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                        {(selectedTab === 'losers' ? topLosers : topGainers).map((stock) => (
                                            <tr key={stock.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                                                <td className="py-4">
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white">{stock.symbol}</div>
                                                        <div className="text-xs text-gray-500">{stock.name}</div>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-right font-medium text-gray-900 dark:text-white">₹{stock.price.toFixed(2)}</td>
                                                <td className={`py-4 text-right font-bold ${stock.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {stock.change > 0 ? '+' : ''}{stock.change}%
                                                </td>
                                                <td className="py-4 text-right text-gray-500 hidden sm:table-cell">{stock.volume}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Trending News or Mini Watchlist */}
                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-fintech-card/50">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-cyan-500" /> {t('market_news')}
                            </h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className="text-xs text-gray-400 mb-1">2 hours ago</div>
                                        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-cyan-600 dark:group-hover:text-neon-cyan transition-colors">
                                            RBI expected to hold rates steady in upcoming monetary policy meeting.
                                        </h4>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-2 text-sm text-cyan-600 dark:text-neon-cyan font-medium border border-cyan-600/30 dark:border-neon-cyan/30 rounded-lg hover:bg-cyan-50 dark:hover:bg-neon-cyan/10 transition-colors">
                                {t('read_more')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MarketsPage;
