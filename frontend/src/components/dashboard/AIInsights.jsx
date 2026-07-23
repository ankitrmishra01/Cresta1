import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, AlertTriangle, TrendingUp, ChevronDown, ChevronUp, BarChart3, Newspaper, Shield, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PredictiveChart from './PredictiveChart';
import { apiCall } from '../../api';
import { useUser } from '../../context/UserContext';
import Skeleton from '../common/Skeleton';

const AIInsights = ({ delay }) => {
    const [insights, setInsights] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [chartTicker, setChartTicker] = useState(null);
    const { t } = useTranslation();
    const { user, hasCompletedRiskAssessment } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    const formatAndSetInsights = (data) => {
        if (data.Recommended_Stocks && data.Recommended_Stocks.length > 0) {
            const userClass = data.Assigned_Class || 'Moderate';
            const newInsights = data.Recommended_Stocks.map((rec, index) => ({
                id: `ai-rec-${index}`,
                ticker: rec.Ticker,
                name: rec.Name || rec.Ticker.replace('.NS', ''),
                price: rec.Price || 0,
                sector: rec.Sector || 'Market',
                confidence: rec.Confidence || 70,
                reasoning: rec.Reasoning || '',
                headlines: rec.Headlines || [],
                userClass: userClass,
                xai: rec.xai || null,
            }));
            setInsights(newInsights);
        }
    };

    useEffect(() => {
        const loadInsights = async () => {
            const localData = localStorage.getItem('ai_insights_data');
            if (localData) {
                try {
                    const data = JSON.parse(localData);
                    formatAndSetInsights(data);
                } catch (e) {
                    console.error("Error formatting insights", e);
                }
            } else if (hasCompletedRiskAssessment) {
                setIsLoading(true);
                try {
                    const res = await apiCall('/recommend/', { method: 'POST', body: JSON.stringify({}) });
                    if (res.ok) {
                        const data = await res.json();
                        localStorage.setItem('ai_insights_data', JSON.stringify(data));
                        formatAndSetInsights(data);
                    }
                } catch (e) {
                    console.error("Failed to fetch insights", e);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setInsights([]);
            }
        };

        loadInsights();
    }, [hasCompletedRiskAssessment]);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
        if (expandedId !== id) setChartTicker(null);
    };

    const getConfidenceColor = (c) => {
        if (c >= 75) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        if (c >= 55) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    };

    const getConfidenceLabel = (c) => {
        if (c >= 75) return t('strong_match');
        if (c >= 55) return t('good_match');
        return t('worth_watching');
    };

    const getSentimentDot = (s) => {
        if (s === 'positive') return '🟢';
        if (s === 'negative') return '🔴';
        return '🟡';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bento-panel p-5 h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-5 border-b border-[#222222] pb-3">
                <h3 className="text-[13px] font-semibold text-white uppercase tracking-wide flex items-center gap-2">
                    {t('ai_stock_advisor')}
                    <span className="text-[11px] text-gray-400 bg-[#111111] px-1.5 py-0.5 rounded border border-[#222222]">
                        {insights.length} {t('picks')}
                    </span>
                </h3>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <AnimatePresence mode='popLayout'>
                    {isLoading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="w-full h-[76px] rounded-xl" />
                            ))}
                        </motion.div>
                    ) : insights.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-40 text-center"
                        >
                            <AlertTriangle className="text-yellow-500 mb-3" size={28} />
                            <p className="text-gray-500 font-semibold">{t('setup_required')}</p>
                            <p className="text-xs text-gray-400 mt-1">{t('complete_risk_for_ai')}</p>
                        </motion.div>
                    ) : (
                        insights.map((stock) => (
                            <motion.div
                                key={stock.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="rounded-xl bg-[#0A0A0A] border border-[#222222] overflow-hidden hover-lift"
                            >
                                <button
                                    onClick={() => toggleExpand(stock.id)}
                                    className="w-full p-4 flex items-center gap-3 hover:bg-white/[0.02] transition-colors text-left"
                                >
                                    <div className="p-2 rounded-lg bg-[#1A1A1A] border border-[#333333] text-white shrink-0">
                                        <Lightbulb size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white text-sm truncate">{stock.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-mono text-gray-400 bg-[#111111] px-1 rounded border border-[#222222]">
                                                {stock.ticker}
                                            </span>
                                            <span className="text-xs font-medium text-gray-300">
                                                ₹{stock.price.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getConfidenceColor(stock.confidence)}`}>
                                            {stock.confidence}%
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium">
                                            {getConfidenceLabel(stock.confidence)}
                                        </span>
                                    </div>
                                    <div className="ml-2 text-gray-400">
                                        {expandedId === stock.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {expandedId === stock.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-gray-200 dark:border-[#222]"
                                        >
                                            <div className="p-4 space-y-4">
                                                {/* XAI: Sentiment Meter + Score Breakdown */}
                                                {stock.xai && (
                                                    <div className="space-y-3">
                                                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                                            <BarChart3 size={10} /> {t('ai_score_breakdown')}
                                                        </h5>
                                                        {/* Sentiment Meter */}
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between items-center text-[10px]">
                                                                <span className="text-red-400">{t('bearish')}</span>
                                                                <span className="font-bold" style={{ color: stock.xai.sentiment_score > 0.1 ? '#10b981' : stock.xai.sentiment_score < -0.1 ? '#ef4444' : '#eab308' }}>
                                                                    {stock.xai.sentiment_score > 0 ? '+' : ''}{stock.xai.sentiment_score.toFixed(2)}
                                                                </span>
                                                                <span className="text-emerald-400">{t('bullish')}</span>
                                                            </div>
                                                            <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full relative overflow-hidden">
                                                                <div className="absolute inset-0 flex">
                                                                    <div className="w-1/2 bg-gradient-to-r from-red-500/30 to-yellow-500/30"></div>
                                                                    <div className="w-1/2 bg-gradient-to-r from-yellow-500/30 to-emerald-500/30"></div>
                                                                </div>
                                                                <div
                                                                    className="absolute top-0 w-3 h-2 rounded-full bg-white border-2 border-emerald-500 shadow-lg"
                                                                    style={{ left: `${Math.max(2, Math.min(96, (stock.xai.sentiment_score + 1) * 50))}%`, transform: 'translateX(-50%)' }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                        {/* Score Bars */}
                                                        {[
                                                            { label: t('sentiment'), pts: stock.xai.sentiment_pts, max: 40, color: '#10B981' },
                                                            { label: t('risk_fit'), pts: stock.xai.risk_fit_pts, max: 40, color: '#8b5cf6' },
                                                            { label: t('valuation'), pts: stock.xai.valuation_pts, max: 20, color: '#f59e0b' },
                                                        ].map((bar) => (
                                                            <div key={bar.label} className="space-y-0.5">
                                                                <div className="flex justify-between text-[10px]">
                                                                    <span className="text-gray-500 dark:text-gray-400">{bar.label}</span>
                                                                    <span className="font-bold text-gray-600 dark:text-gray-300">{bar.pts.toFixed(0)}/{bar.max}</span>
                                                                </div>
                                                                <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full rounded-full transition-all"
                                                                        style={{ width: `${(bar.pts / bar.max) * 100}%`, backgroundColor: bar.color }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="text-[10px] text-gray-400 flex items-center gap-2">
                                                            <span>β = {stock.xai.beta}</span>
                                                            <span>•</span>
                                                            <span>52W pos: {(stock.xai.price_position_52w * 100).toFixed(0)}%</span>
                                                            <span>•</span>
                                                            <span>Conf: {(stock.xai.sentiment_confidence * 100).toFixed(0)}%</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Why AI recommends this */}
                                                <div className="space-y-1.5">
                                                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                                        <Shield size={10} /> {t('why_recommend')}
                                                    </h5>
                                                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                                        {t('based_on_risk_prefix')} <span className="font-bold text-vercel-900 dark:text-white">{t(`profile_${stock.userClass.toLowerCase()}`, stock.userClass)}</span> {t('based_on_risk_suffix')} {stock.reasoning.charAt(0).toLowerCase() + stock.reasoning.slice(1)}
                                                    </p>
                                                </div>

                                                {/* News Headlines */}
                                                {stock.headlines && stock.headlines.length > 0 && (
                                                    <div className="space-y-1.5">
                                                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                                            <Newspaper size={10} /> {t('latest_news')}
                                                        </h5>
                                                        <div className="space-y-1.5">
                                                            {stock.headlines.map((hl, i) => (
                                                                <div key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                                    <span className="shrink-0 mt-0.5 text-[10px]">{getSentimentDot(hl.sentiment)}</span>
                                                                    <span className="leading-relaxed">{hl.text}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* View Chart Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setChartTicker(chartTicker === stock.ticker ? null : stock.ticker);
                                                    }}
                                                    className="w-full py-2.5 vercel-button vercel-button-secondary"
                                                >
                                                    <BarChart3 size={14} />
                                                    {chartTicker === stock.ticker ? t('hide_growth_chart') : t('view_growth_chart')}
                                                    <TrendingUp size={14} className="group-hover:translate-x-1 transition-transform" />
                                                </button>

                                                {/* Inline Chart */}
                                                <AnimatePresence>
                                                    {chartTicker === stock.ticker && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                        >
                                                            <PredictiveChart symbol={stock.ticker} onClose={() => setChartTicker(null)} />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default AIInsights;
