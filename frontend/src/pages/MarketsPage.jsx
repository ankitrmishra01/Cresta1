import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Clock } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { API_BASE, apiCall } from '../api';

// Decomposed sub-components
import SearchResultCard from '../components/markets/SearchResultCard';
import MarketIndices from '../components/markets/MarketIndices';
import TopMovers from '../components/markets/TopMovers';
import MarketNews from '../components/markets/MarketNews';

// Mock Data Generator for mini charts
const generateChartData = (points = 50) => {
    let data = [];
    let value = 1500;
    for (let i = 0; i < points; i++) {
        value = value + (Math.random() - 0.5) * 50;
        data.push({ time: `${i}:00`, value: Math.abs(value) });
    }
    return data;
};

const MarketsPage = () => {
    const { t } = useTranslation();
    const { searchQuery } = useSearch();
    const { showToast } = useToast();
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [showSearchChart, setShowSearchChart] = useState(false);

    const [indicesData, setIndicesData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('gainers');
    const [news, setNews] = useState([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const { user } = useUser();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Live top movers data
    const [topGainers, setTopGainers] = useState([]);
    const [topLosers, setTopLosers] = useState([]);
    const [moversLoading, setMoversLoading] = useState(true);

    // Search Effect
    useEffect(() => {
        if (!searchQuery) {
            setSearchResult(null);
            setShowSearchChart(false);
            return;
        }

        const fetchSearch = async () => {
            try {
                setSearchLoading(true);
                setSearchError(null);
                setShowSearchChart(false);

                // Get user's risk class for personalized suggestion
                let riskParam = '';
                if (user) {
                    try {
                        const riskData = localStorage.getItem('risk_assessment_result');
                        if (riskData) {
                            const riskClass = JSON.parse(riskData)?.User_Class;
                            if (riskClass) riskParam = `&risk=${riskClass}`;
                        }
                    } catch (e) { }
                }

                const response = await apiCall(`/search/?ticker=${searchQuery}${riskParam}`);
                if (!response.ok) throw new Error('Stock not found');

                // Sanitize NaN / Infinity from Python response before parsing
                const rawText = await response.text();
                const safeText = rawText.replace(/:\s*NaN/g, ': null').replace(/:\s*Infinity/g, ': null');
                const data = JSON.parse(safeText);
                if (data.error) throw new Error(data.error);
                setSearchResult(data);
            } catch (err) {
                setSearchError(err.message);
                setSearchResult(null);
                showToast(`Search failed: ${err.message}`, 'error');
            } finally {
                setSearchLoading(false);
            }
        };

        const timeout = setTimeout(fetchSearch, 500);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    useEffect(() => {
        const fetchIndices = async () => {
            try {
                setLoading(true);
                const endpoints = ['nifty', 'sensex', 'banknifty'];
                const fetchWithTimeout = (url, ms = 15000) => {
                    return Promise.race([
                        fetch(url).then(async res => {
                            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                            return res.json();
                        }),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), ms))
                    ]);
                };

                const results = await Promise.allSettled(
                    endpoints.map(endpoint => fetchWithTimeout(`${API_BASE}/${endpoint}/`, 15000))
                );

                const mappedData = results.map((result, idx) => {
                    const fallbackNames = ['NIFTY 50', 'SENSEX', 'BANK NIFTY'];
                    const fallbackValues = [23996.25, 76755.05, 57126.80];
                    if (result.status === 'fulfilled' && result.value) {
                        const data = result.value;
                        return {
                            name: data.name || fallbackNames[idx],
                            value: data.value || fallbackValues[idx],
                            change: data.percent || '0.0%',
                            isPositive: String(data.change || '').startsWith('+')
                        };
                    }
                    return {
                        name: fallbackNames[idx],
                        value: fallbackValues[idx],
                        change: '0.0%',
                        isPositive: true
                    };
                });

                setIndicesData(mappedData);
                setError(null);
            } catch (error) {
                console.error("Failed to fetch market indices:", error);
                setIndicesData([
                    { name: 'NIFTY 50', value: 23996.25, change: '-0.79%', isPositive: false },
                    { name: 'SENSEX', value: 76755.05, change: '-0.92%', isPositive: false },
                    { name: 'BANK NIFTY', value: 57126.80, change: '-1.23%', isPositive: false }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchIndices();
        const interval = setInterval(fetchIndices, 60000);
        return () => clearInterval(interval);
    }, []);

    // Fetch top movers (live gainers/losers)
    useEffect(() => {
        const fetchTopMovers = async () => {
            try {
                setMoversLoading(true);
                const response = await fetch(`${API_BASE}/top-movers/`);
                if (!response.ok) throw new Error('Failed to fetch top movers');
                const data = await response.json();
                setTopGainers(data.gainers || []);
                setTopLosers(data.losers || []);
            } catch (err) {
                console.error("Top movers error:", err);
                setTopGainers([]);
                setTopLosers([]);
            } finally {
                setMoversLoading(false);
            }
        };

        fetchTopMovers();
        const interval = setInterval(fetchTopMovers, 300000); // Refresh every 5 min
        return () => clearInterval(interval);
    }, []);

    const [chartData, setChartData] = useState(generateChartData());

    // News Effect
    useEffect(() => {
        const fetchNews = async () => {
            try {
                setNewsLoading(true);
                let url = `${API_BASE}/news/`;

                if (user) {
                    let tickers = [];
                    try {
                        const aiData = localStorage.getItem('ai_insights_data');
                        if (aiData) {
                            const parsed = JSON.parse(aiData);
                            if (parsed.Recommended_Stocks) {
                                tickers = parsed.Recommended_Stocks.map(s => s.Ticker).slice(0, 3);
                            }
                        }
                    } catch (e) { }

                    if (tickers.length > 0) {
                        url += `?symbol=${tickers.join(',')}`;
                    } else {
                        url += '?symbol=RELIANCE.NS,TCS.NS,HDFCBANK.NS';
                    }
                }

                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch news');
                const data = await response.json();
                setNews(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("News fetch error:", err);
                setNews([]);
            } finally {
                setNewsLoading(false);
            }
        };

        fetchNews();
    }, [user]);

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

    const currentMovers = selectedTab === 'losers' ? topLosers : topGainers;

    const renderContent = () => (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('market_watch')}</h1>
                    <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>{t('markets_subtitle')}</p>

                    {/* Search Status */}
                    {searchQuery && !user && (
                        <div className={`mt-4 p-3 rounded text-sm flex items-center gap-2 ${isDark ? 'bg-[#111111] border border-[#222222] text-gray-400' : 'bg-slate-100 border border-slate-200 text-slate-600'}`}>
                            <Clock className="w-4 h-4" />
                            <span>{t('sign_in_unlock')}</span>
                        </div>
                    )}
                    {searchLoading && <p className={`mt-2 animate-pulse ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{t('searching_for')} "{searchQuery}"...</p>}
                    {searchError && <p className="text-red-500 mt-2">Error: {searchError}</p>}

                    {/* Main Status Indicators */}
                    {loading && !indicesData.length && (
                        <div className="flex items-center gap-2 mt-2 text-vercel-600 dark:text-vercel-400 animate-pulse">
                            <span className="w-2 h-2 bg-current rounded-full"></span>
                            <span className="text-sm font-medium">{t('fetching_live_data')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Search Result Card */}
            <SearchResultCard
                searchResult={searchResult}
                user={user}
                showSearchChart={showSearchChart}
                setShowSearchChart={setShowSearchChart}
                t={t}
            />

            {/* Market Indices Cards */}
            <MarketIndices indicesData={indicesData} chartData={chartData} t={t} />

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Gainers/Losers */}
                <div className="lg:col-span-2 space-y-6">
                    <TopMovers
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                        currentMovers={currentMovers}
                        moversLoading={moversLoading}
                        t={t}
                    />
                </div>

                {/* Right Column: News */}
                <div className="space-y-6">
                    <MarketNews news={news} newsLoading={newsLoading} user={user} t={t} />
                </div>
            </div>
        </div>
    );

    if (!user) {
        return (
            <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#000000]' : 'bg-slate-50'}`}>
                <Navbar />
                <main className="container mx-auto px-6 py-32">
                    {renderContent()}
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <DashboardLayout>
            {renderContent()}
        </DashboardLayout>
    );
};

export default MarketsPage;
