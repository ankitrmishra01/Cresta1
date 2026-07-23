import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart2 } from 'lucide-react';
import PredictiveChart from '../dashboard/PredictiveChart';
import { useTheme } from '../../context/ThemeContext';

/**
 * Displays the search result card with stock info, AI suggestion,
 * confidence bar, reasoning, and inline forecast chart toggle.
 */
const SearchResultCard = ({
    searchResult,
    user,
    showSearchChart,
    setShowSearchChart,
    t,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    if (!searchResult) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bento-panel p-6 rounded border mb-6 relative overflow-hidden ${isDark ? 'border-[#222222] bg-[#0A0A0A]' : 'border-slate-200 bg-white shadow-sm'}`}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className={`w-24 h-24 ${isDark ? 'text-white' : 'text-slate-700'}`} />
            </div>
            <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('search_result')}</h2>
            <div className="flex flex-wrap items-center gap-8">
                <div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t('symbol')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{searchResult.symbol}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{searchResult.name}</div>
                </div>
                <div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t('price')}</div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{searchResult.price}</div>
                </div>
                <div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t('change')}</div>
                    <div className={`text-xl font-bold ${searchResult.change_percent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {searchResult.change_percent}%
                    </div>
                </div>
                <div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t('volume')}</div>
                    <div className={`text-xl font-bold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{searchResult.volume.toLocaleString()}</div>
                </div>
                {searchResult.suggestion && user ? (
                    <div>
                        <div className="text-sm text-gray-400">{t('ai_suggestion')}</div>
                        <div className={`text-lg font-bold px-3 py-1 rounded-lg inline-block ${searchResult.suggestion === 'Buy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : searchResult.suggestion === 'Avoid'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                            {searchResult.suggestion}
                        </div>
                    </div>
                ) : searchResult.suggestion && (
                    <div className="flex flex-col items-center justify-center p-3 bg-gray-500/10 rounded-xl border border-white/10 blur-[2px] select-none cursor-not-allowed group relative">
                        <div className="text-xs text-gray-500">{t('ai_insight')}</div>
                        <div className="text-lg font-bold">{t('locked')}</div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 blur-0 rounded-xl z-10 p-2 text-center pointer-events-none">
                            <span className="text-[10px] text-white leading-tight">{t('login_unlock_ai')}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Confidence / Reasoning */}
            {searchResult.confidence && user && (
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-[#222222]' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t('ai_confidence', 'AI Confidence')}</div>
                        <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#222222]' : 'bg-slate-200'}`}>
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${searchResult.confidence >= 60 ? 'bg-emerald-500' :
                                    searchResult.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${searchResult.confidence}%` }}
                            />
                        </div>
                        <span className={`text-sm font-bold ${searchResult.confidence >= 60 ? 'text-emerald-400' :
                            searchResult.confidence >= 40 ? 'text-amber-400' : 'text-red-400'
                            }`}>{searchResult.confidence}%</span>
                    </div>
                    {searchResult.reasoning && (
                        <p className={`text-xs leading-relaxed italic ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                            "{searchResult.reasoning}"
                        </p>
                    )}
                </div>
            )}

            {/* View Forecast Button */}
            {user && (
                <div className="mt-4">
                    <button
                        onClick={() => setShowSearchChart(!showSearchChart)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${showSearchChart
                            ? (isDark ? 'bg-[#111111] text-white border border-[#222222]' : 'bg-slate-100 text-slate-900 border border-slate-300')
                            : (isDark ? 'bg-transparent text-gray-400 border border-transparent hover:border-[#222222] hover:bg-[#111111]' : 'bg-transparent text-slate-600 border border-transparent hover:border-slate-300 hover:bg-slate-50')
                            }`}
                    >
                        <BarChart2 size={16} />
                        {showSearchChart ? t('hide_forecast', 'Hide Forecast') : t('view_forecast', 'View Growth Forecast')}
                    </button>
                </div>
            )}

            {/* Inline Prediction Chart */}
            {showSearchChart && searchResult && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                >
                    <PredictiveChart
                        symbol={searchResult.symbol?.replace('.NS', '')}
                        onClose={() => setShowSearchChart(false)}
                    />
                </motion.div>
            )}
        </motion.div>
    );
};

export default SearchResultCard;
