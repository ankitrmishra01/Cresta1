import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const STOCK_COLORS = [
    '#10B981', '#3B82F6', '#34D399', '#A78BFA', '#F472B6',
    '#FBBF24', '#FB923C', '#4ADE80', '#818CF8', '#F87171'
];

const AssetAllocation = ({ holdings = [], delay }) => {
    const { t } = useTranslation();

    // Calculate per-stock allocation from real holdings
    const stockValues = holdings
        .filter(s => s && s.qty && s.ltp)
        .map((stock, i) => ({
            name: stock.name || stock.ticker?.replace('.NS', '') || 'Unknown',
            value: (stock.qty || 0) * (stock.ltp || stock.avg || 0),
            color: STOCK_COLORS[i % STOCK_COLORS.length]
        }))
        .filter(s => s.value > 0)
        .sort((a, b) => b.value - a.value);

    const totalValue = stockValues.reduce((sum, s) => sum + s.value, 0);

    // Calculate percentages
    const assets = totalValue > 0
        ? stockValues.map(s => ({
            ...s,
            percent: Math.round((s.value / totalValue) * 100),
            amount: s.value
        }))
        : [];

    // Ensure percentages sum to 100
    if (assets.length > 0) {
        const diff = 100 - assets.reduce((s, a) => s + a.percent, 0);
        assets[0].percent += diff;
    }

    // Empty state
    if (assets.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay }}
                className="bento-panel bg-[#0A0A0A] border border-[#222222] p-6 rounded-2xl flex flex-col"
            >
                <h3 className="text-lg font-bold text-white mb-6">{t('asset_allocation', 'Portfolio Allocation')}</h3>
                <div className="flex-1 flex items-center justify-center py-8">
                    <p className="text-sm text-gray-500">Add holdings to see your allocation</p>
                </div>
            </motion.div>
        );
    }

    // Generate conic gradient from actual holdings
    let currentPos = 0;
    const gradientString = assets.map(asset => {
        const start = currentPos;
        currentPos += asset.percent;
        return `${asset.color} ${start}% ${currentPos}%`;
    }).join(', ');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bento-panel bg-[#0A0A0A] border border-[#222222] p-5 rounded-2xl flex flex-col"
        >
            <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-6">{t('asset_allocation', 'Portfolio Allocation')}</h3>

            <div className="flex-1 flex flex-col items-center justify-center relative">
                <div
                    className="w-48 h-48 rounded-full relative mb-8 shadow-[0_0_30px_rgba(0,0,0,0.3)] animate-[spin_60s_linear_infinite] hover:pause"
                    style={{
                        background: `conic-gradient(${gradientString})`
                    }}
                >
                    <div className="absolute inset-4 bg-[#0A0A0A] rounded-full flex items-center justify-center">
                        <div className="text-center">
                            <span className="text-gray-500 text-xs uppercase tracking-wider">{t('total', 'Total')}</span>
                            <div className="text-xl font-bold text-white">
                                ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-3 w-full">
                    {assets.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-[13px] font-medium text-gray-300">{item.name}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[13px] font-semibold text-white tabular-nums">{item.percent}%</p>
                                <p className="text-[11px] text-gray-500 tabular-nums">₹{item.amount.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default AssetAllocation;
