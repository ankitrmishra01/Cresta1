import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Loader2, BarChart2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../../../api';

const SectorHeatmap = () => {
    const [sectors, setSectors] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchSentiment = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/sector-sentiment/`);
                if (!res.ok) throw new Error('API Error');
                const data = await res.json();
                setSectors(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSentiment();
        // Setup polling every 2 minutes for live heatmap updates
        const intervalId = setInterval(fetchSentiment, 120000);
        return () => clearInterval(intervalId);
    }, []);

    // Helper: translate a (-1 to 1) FinBERT score into a bg-color & text.
    const getScoreStyle = (score) => {
        if (score === 0 || score === undefined) return 'bg-gray-800 text-gray-400 border-gray-700'; // Neutral or missing
        if (score > 0.3) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'; // Very Bullish
        if (score > 0) return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'; // Bullish
        if (score < -0.3) return 'bg-red-500/20 text-red-400 border-red-500/30'; // Very Bearish
        return 'bg-red-500/10 text-red-300 border-red-500/20'; // Bearish
    };

    return (
        <div className="bento-panel p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A] relative overflow-hidden group">
            {/* Background glowing effects removed */}

            {/* Header Section */}
            <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center border border-[#222222]">
                        <BarChart2 className="text-white w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase shadow-sm">
                            {t('market_sentiment_heatmap', 'Sector Market Sentiment')}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                                {t('live_finbert_analysis', 'Live FinBERT Analysis')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 min-h-[160px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[160px] gap-3">
                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin opacity-80" />
                        <p className="text-xs text-gray-400 font-medium tracking-wide">Scanning News Nodes...</p>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center min-h-[160px] text-red-400/80 text-xs bg-red-500/5 rounded-xl border border-red-500/10">
                        {error}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(sectors).map(([sectorName, tickers]) => {
                            // Calculate avg sector score
                            const values = Object.values(tickers);
                            const avgScore = values.reduce((sum, val) => sum + val, 0) / (values.length || 1);

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={sectorName}
                                    className="bg-black/20 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-bold text-gray-300 ml-1">{sectorName}</h4>
                                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getScoreStyle(avgScore)}`}>
                                            AVG: {avgScore.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {Object.entries(tickers).map(([ticker, score]) => (
                                            <div
                                                key={ticker}
                                                className={`flex items-center justify-between px-2 py-1.5 rounded-lg border ${getScoreStyle(score)}`}
                                                title={`FinBERT Score: ${score}`}
                                            >
                                                <span className="text-[10px] font-extrabold">{ticker.replace('.NS', '')}</span>
                                                <span className="text-[9px] font-medium font-mono">{score.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-500">
                <span className="flex items-center gap-1"><Activity size={10} /> Powered by transformer models</span>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-500/40"></div> Bullish</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-red-500/40"></div> Bearish</span>
                </div>
            </div>
        </div>
    );
};

export default SectorHeatmap;
