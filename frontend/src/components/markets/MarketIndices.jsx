import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

/**
 * Displays the 3-card grid for NIFTY 50, SENSEX, and BANK NIFTY
 * with live mini area charts.
 */
const MarketIndices = ({ indicesData, chartData, t }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const displayData = indicesData.length > 0
        ? indicesData
        : ['NIFTY 50', 'SENSEX', 'BANK NIFTY'].map((name, i) => ({
            name, value: 24000 + i * 5000, change: 0.8, isPositive: true
        }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayData.map((index, i) => (
                <motion.div
                    key={index.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bento-panel p-6 rounded border ${isDark ? 'border-[#222222] bg-[#0A0A0A]' : 'border-slate-200 bg-white shadow-sm'}`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className={`font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{index.name}</h3>
                            <div className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {index.value}
                            </div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${index.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {index.change}
                        </div>
                    </div>
                    {(() => {
                        const trendIsPositive = chartData.length >= 2 
                            ? chartData[chartData.length - 1].value >= chartData[0].value 
                            : index.isPositive;
                        const mainColor = trendIsPositive ? "#10B981" : "#ef4444";
                        
                        return (
                            <div className="h-16">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={mainColor} stopOpacity={0.15} />
                                                <stop offset="100%" stopColor={mainColor} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={mainColor}
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill={`url(#grad${i})`}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        );
                    })()}
                </motion.div>
            ))}
        </div>
    );
};

export default MarketIndices;
