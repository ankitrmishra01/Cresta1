import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', value: 24000 },
    { name: 'Tue', value: 24500 },
    { name: 'Wed', value: 24200 },
    { name: 'Thu', value: 25100 },
    { name: 'Fri', value: 25800 },
    { name: 'Sat', value: 26500 },
    { name: 'Sun', value: 28340 },
];


const PortfolioChart = ({ delay }) => {
    const { t } = useTranslation();
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
            className="glass-panel p-6 rounded-2xl md:col-span-2 min-h-[400px] flex flex-col relative overflow-hidden"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">{t('portfolio_growth')}</h3>
                <select className="bg-white/5 border border-white/10 rounded-lg text-xs px-3 py-1.5 text-gray-300 focus:outline-none focus:border-neon-cyan/50">
                    <option>Last 7 Days</option>
                    <option>Last Month</option>
                    <option>YTD</option>
                    <option>All Time</option>
                </select>
            </div>

            {/* Chart Visualization */}
            {/* Chart Visualization */}
            <div className="w-full h-[350px] relative mt-4">
                <ResponsiveContainer width="99%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 0,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            hide={true}
                            domain={['dataMin - 1000', 'dataMax + 1000']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                            itemStyle={{ color: '#22D3EE' }}
                            labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#22D3EE"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default PortfolioChart;
