import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, TrendingUp, ArrowRight, X, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const AIInsights = ({ delay }) => {
    const [insights, setInsights] = React.useState([
        {
            id: 1,
            type: 'opportunity',
            icon: Lightbulb,
            color: 'text-yellow-400',
            bg: 'bg-yellow-400/10',
            title: 'Tech Sector Rally',
            message: 'AI stocks are showing strong momentum. Consider increasing exposure by 5%.',
            timestamp: '2h ago'
        },
        {
            id: 2,
            type: 'warning',
            icon: AlertTriangle,
            color: 'text-red-400',
            bg: 'bg-red-400/10',
            title: 'High Volatility Detected',
            message: 'Market volatility index (VIX) is up. Defensive assets recommended.',
            timestamp: '5h ago'
        },
        {
            id: 3,
            type: 'success',
            icon: TrendingUp,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            title: 'Portfolio Performance',
            message: 'Your conservative strategy outperformed the S&P 500 this week.',
            timestamp: '1d ago'
        }
    ]);

    const removeInsight = (id) => {
        setInsights(current => current.filter(item => item.id !== id));
    };

    const handleRestore = () => {
        // Optional: logic to restore dismissed cards, not strictly needed for MVP
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
            className="glass-panel p-6 rounded-2xl h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-neon-cyan animate-pulse"></span>
                    AI Insights
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">({insights.length})</span>
                </h3>
                {insights.length === 0 && (
                    <button onClick={() => window.location.reload()} className="text-xs text-cyan-600 dark:text-neon-cyan hover:underline">
                        Refresh
                    </button>
                )}
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode='popLayout'>
                    {insights.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-40 text-gray-500 text-center"
                        >
                            <p>All caught up!</p>
                            <p className="text-xs mt-1">No new insights for now.</p>
                        </motion.div>
                    ) : (
                        insights.map((insight) => (
                            <motion.div
                                key={insight.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group relative"
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeInsight(insight.id);
                                    }}
                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${insight.bg} ${insight.color} shrink-0`}>
                                        <insight.icon size={18} />
                                    </div>
                                    <div className="flex-1 pr-6">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{insight.title}</h4>
                                            <span className="text-[10px] text-gray-400">{insight.timestamp}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{insight.message}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default AIInsights;
