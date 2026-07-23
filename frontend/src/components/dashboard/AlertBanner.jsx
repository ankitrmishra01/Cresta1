import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, Shield, X, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SignalBadge = ({ signal }) => {
    const { t } = useTranslation();
    const config = {
        SELL: { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-600 dark:text-red-400', label: t('sell'), icon: TrendingDown },
        BUY_MORE: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400', label: t('buy_more'), icon: TrendingUp },
        HOLD: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', label: t('hold'), icon: Shield }
    };
    const c = config[signal] || config.HOLD;
    const Icon = c.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${c.bg} ${c.text} border ${c.border} rounded-full text-[10px] font-bold uppercase tracking-wide`}>
            <Icon size={10} /> {c.label}
        </span>
    );
};

const AlertBanner = ({ alerts = [], onDismiss }) => {
    if (!alerts || alerts.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 space-y-3"
            >
                {alerts.map((alert, i) => {
                    const isHigh = alert.urgency === 'high';
                    const isSell = alert.signal === 'SELL';

                    return (
                        <motion.div
                            key={alert.id || i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`relative overflow-hidden bento-panel p-3 border border-[#222222] ${isHigh
                                ? 'border-l-2 border-l-red-500 bg-[#1A0A0A]'
                                : 'border-l-2 border-l-[#F59E0B] bg-[#1A1305]'
                                }`}
                        >
                            {/* Animated pulse for high urgency */}
                            {isHigh && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse" />
                            )}

                            <div className="flex items-start gap-3 ml-1">
                                <div className={`p-2 rounded ${isHigh ? 'bg-red-500/10 text-red-600' : 'bg-yellow-500/10 text-yellow-600'} shrink-0 mt-0.5`}>
                                    <AlertTriangle size={14} strokeWidth={2.5} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-[13px] text-white">{alert.name}</span>
                                        <span className="text-[10px] text-gray-400 font-medium bg-black px-1.5 py-0.5 rounded border border-[#222222]">{alert.ticker}</span>
                                        <SignalBadge signal={alert.signal} />
                                    </div>
                                    <p className="text-[12px] text-gray-300 leading-snug">{alert.reason}</p>
                                    <div className="mt-2 flex items-center gap-1 text-[11px]">
                                        <ChevronRight size={12} className={isSell ? 'text-red-600' : 'text-yellow-600'} />
                                        <span className={`font-semibold uppercase ${isSell ? 'text-red-600' : 'text-yellow-600'}`}>
                                            {alert.action}
                                        </span>
                                    </div>
                                </div>

                                {onDismiss && (
                                    <button
                                        onClick={() => onDismiss(alert.id)}
                                        className="p-1 hover:bg-white/5 rounded-lg transition-colors shrink-0"
                                    >
                                        <X size={14} className="text-gray-500" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </AnimatePresence>
    );
};

export { SignalBadge, AlertBanner };
export default AlertBanner;
