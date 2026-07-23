import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '../../context/UserContext';
import { Loader2 } from 'lucide-react';
import { apiCall } from '../../api';

const PERIODS = [
    { label: '7D', value: '5d' },
    { label: '1M', value: '1mo' },
    { label: '3M', value: '3mo' },
    { label: '6M', value: '6mo' },
    { label: '1Y', value: '1y' },
];

const PortfolioChart = ({ delay }) => {
    const { t } = useTranslation();
    const { user } = useUser();
    const [data, setData] = useState([]);
    const [period, setPeriod] = useState('1mo');
    const [loading, setLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await apiCall(`/holdings/history/?period=${period}`);
            if (res.ok) {
                const result = await res.json();
                const chartData = (result.data || []).map(item => ({
                    date: item.date,
                    value: Number(item.value),
                    label: new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                }));
                setData(chartData);
            }
        } catch (e) {
            console.error('Portfolio history fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, [user, period]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const growth = data.length >= 2 ? data[data.length - 1].value - data[0].value : 0;
    const growthPct = data.length >= 2 && data[0].value > 0
        ? ((growth / data[0].value) * 100).toFixed(2)
        : 0;
    const isPositive = growth >= 0;
    const chartColor = isPositive ? '#00B852' : '#EB5B3C';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bento-panel border border-[#222222] bg-[#0A0A0A] p-5 md:col-span-2 min-h-[400px] flex flex-col rounded-2xl"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-[13px] font-medium text-gray-400">
                        {t('portfolio_growth', 'Portfolio Value')}
                    </h3>
                    {data.length >= 2 && (
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-semibold tracking-tight text-white tabular-nums">
                                ₹{data[data.length - 1].value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </span>
                            <span className={`text-[13px] font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                {isPositive ? '+' : '-'}₹{Math.abs(growth).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                {' '}({isPositive ? '+' : ''}{growthPct}%)
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex bg-[#111111] rounded p-0.5 border border-[#222222]">
                    {PERIODS.map(p => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={`px-3 py-1 text-[12px] font-medium rounded-sm transition-colors ${
                                period === p.value
                                    ? 'bg-[#222222] text-white shadow-sm'
                                    : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full flex-1 min-h-[250px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-sm text-gray-400">
                            No data available
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer width="99%" height={280}>
                        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 11, fontFamily: 'Inter' }}
                                dy={10}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 11, fontFamily: 'Inter' }}
                                width={50}
                                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                                domain={['dataMin', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--tw-colors-white)',
                                    borderColor: 'var(--tw-colors-gray-200)',
                                    borderRadius: '4px',
                                    fontFamily: 'Inter',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    padding: '8px 12px'
                                }}
                                itemStyle={{ color: '#212121', fontWeight: 600, fontSize: 13 }}
                                labelStyle={{ color: '#757575', marginBottom: '4px', fontSize: 11 }}
                                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Value']}
                                labelFormatter={(label) => label}
                                cursor={{ stroke: '#BDBDBD', strokeWidth: 1, strokeDasharray: '3 3' }}
                            />
                            <Area
                                type="linear"
                                dataKey="value"
                                stroke={chartColor}
                                strokeWidth={1.5}
                                fillOpacity={1}
                                fill="url(#portfolioGrad)"
                                dot={false}
                                activeDot={{ r: 4, stroke: '#fff', strokeWidth: 1.5, fill: chartColor }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </motion.div>
    );
};

export default PortfolioChart;
