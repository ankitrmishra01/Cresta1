import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpDown, BarChart2, Trash2, Edit2, Check, X } from 'lucide-react';
import PredictiveChart from './PredictiveChart';
import { SignalBadge } from './AlertBanner';

const MiniSparkline = ({ data = [] }) => {
    if (!data || data.length < 2) return <div className="w-full h-8 flex items-center justify-center text-[10px] text-gray-500 opacity-30">No trend</div>;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const isPositive = data[data.length - 1] >= data[0];
    const color = isPositive ? '#10B981' : '#ef4444';

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 80 - 10; // scale to 80% height with 10% padding
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-20 h-10 flex items-center">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id={`sparkGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d={`M ${points.split(' ')[0]} L ${points} L 100,100 L 0,100 Z`}
                    fill={`url(#sparkGrad-${color.replace('#', '')})`}
                    stroke="none"
                />
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />
            </svg>
        </div>
    );
};

const HoldingsTable = ({ holdings = [], onDelete, onUpdate, signals = {} }) => {
    const { t } = useTranslation();
    const [analyzingStock, setAnalyzingStock] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editQty, setEditQty] = useState('');
    const [editAvg, setEditAvg] = useState('');

    const startEdit = (stock) => {
        setEditingId(stock.id);
        setEditQty(stock.qty.toString());
        setEditAvg(stock.avg.toString());
    };

    const saveEdit = (stock) => {
        if (onUpdate && editQty && editAvg) {
            onUpdate(stock.id, {
                qty: parseInt(editQty),
                avg_price: parseFloat(editAvg)
            });
        }
        setEditingId(null);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="bento-panel overflow-hidden"
            >
                <div className="px-5 py-4 border-b border-[#222222] flex justify-between items-center bg-[#0A0A0A]">
                    <h3 className="text-[13px] font-semibold text-white uppercase tracking-wide">{t('holdings', 'Holdings')}</h3>
                    <span className="text-[11px] font-medium text-gray-400 bg-[#111111] px-2 py-0.5 rounded border border-[#222222]">{holdings.length}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#111111] border-b border-[#222222]">
                            <tr>
                                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{t('stock')}</th>
                                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{t('qty')}</th>
                                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{t('avg_price')}</th>
                                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{t('ltp')}</th>
                                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{t('current_value')}</th>
                                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{t('p_and_l')}</th>
                                <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#222222] bg-[#0A0A0A]">
                            {holdings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                        {t('no_holdings_yet')}
                                    </td>
                                </tr>
                            ) : holdings.filter(s => s && s.qty != null).map((stock) => {
                                const avg = stock.avg || 0;
                                const ltp = stock.ltp || avg;
                                const qty = stock.qty || 0;
                                const currentValue = qty * ltp;
                                const investedValue = qty * avg;
                                const pnl = currentValue - investedValue;
                                const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
                                const isProfit = pnl >= 0;
                                const isEditing = editingId === stock.id;

                                return (
                                    <tr key={stock.id} className="hover:bg-[#111111] transition-colors group relative z-0 hover:z-10">
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-semibold text-white">{stock.name}</span>
                                                <span className="text-[10px] text-gray-400 font-mono">{stock.ticker}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap text-right text-[13px] font-medium text-gray-300 tabular-nums">
                                            {isEditing ? (
                                                <input type="number" value={editQty} onChange={e => setEditQty(e.target.value)}
                                                    className="w-16 px-2 py-1 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded text-right text-xs" />
                                            ) : qty}
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap text-right text-[13px] font-medium text-gray-300 tabular-nums">
                                            {isEditing ? (
                                                <input type="number" step="0.01" value={editAvg} onChange={e => setEditAvg(e.target.value)}
                                                    className="w-20 px-2 py-1 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded text-right text-xs" />
                                            ) : `₹${avg.toFixed(2)}`}
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap text-right text-[13px] font-medium text-white tabular-nums">
                                            ₹{ltp.toFixed(2)}
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap text-right text-[13px] font-medium text-white tabular-nums">
                                            ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={`text-[13px] font-medium tabular-nums ${isProfit ? 'text-financial-profit' : 'text-financial-loss'}`}>
                                                    {isProfit ? '+' : ''}₹{pnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                </span>
                                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ${isProfit ? 'bg-financial-profit/10 text-financial-profit' : 'bg-financial-loss/10 text-financial-loss'}`}>
                                                    {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {isEditing ? (
                                                    <>
                                                        <button onClick={() => saveEdit(stock)}
                                                            className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-emerald-500 transition-all" title="Save">
                                                            <Check size={14} />
                                                        </button>
                                                        <button onClick={() => setEditingId(null)}
                                                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 transition-all" title="Cancel">
                                                            <X size={14} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => setAnalyzingStock(stock.ticker)}
                                                            className="p-1.5 hover:bg-vercel-100 dark:hover:bg-vercel-800 rounded-lg text-vercel-600 dark:text-vercel-400 transition-all" title="Prediction">
                                                            <BarChart2 size={14} />
                                                        </button>
                                                        <button onClick={() => startEdit(stock)}
                                                            className="p-1.5 hover:bg-blue-500/10 rounded-lg text-blue-400 transition-all opacity-0 group-hover:opacity-100" title="Edit">
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button onClick={() => onDelete && onDelete(stock.id)}
                                                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 transition-all opacity-0 group-hover:opacity-100" title="Delete">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

            </motion.div>

            {/* Prediction Modal — outside motion.div so fixed positioning works */}
            {analyzingStock && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
                    onClick={() => setAnalyzingStock(null)}>
                    <div className="w-full max-w-3xl cursor-default" onClick={e => e.stopPropagation()}>
                        <PredictiveChart
                            symbol={analyzingStock}
                            onClose={() => setAnalyzingStock(null)}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default HoldingsTable;
