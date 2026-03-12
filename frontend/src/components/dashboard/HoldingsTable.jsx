import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, MoreHorizontal, ArrowUpDown } from 'lucide-react';

const initialHoldings = [
    { id: 1, name: 'Reliance Industries', ticker: 'RELIANCE', qty: 50, avg: 2450.00, ltp: 2540.50, type: 'Stock' },
    { id: 2, name: 'HDFC Bank', ticker: 'HDFCBANK', qty: 100, avg: 1450.00, ltp: 1680.20, type: 'Stock' },
    { id: 3, name: 'Tata Motors', ticker: 'TATAMOTORS', qty: 200, avg: 450.00, ltp: 980.40, type: 'Stock' },
    { id: 4, name: 'Infosys', ticker: 'INFY', qty: 150, avg: 1300.00, ltp: 1650.00, type: 'Stock' },
    { id: 5, name: 'Nifty 50 ETF', ticker: 'NIFTYBEES', qty: 500, avg: 190.00, ltp: 220.50, type: 'ETF' },
];

const HoldingsTable = () => {
    const { t } = useTranslation();
    const [holdings, setHoldings] = useState(initialHoldings);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const sortData = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });

        const sorted = [...holdings].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
            return 0;
        });
        setHoldings(sorted);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-fintech-card/50 backdrop-blur-xl overflow-hidden"
        >
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('holdings', 'Holdings')}</h3>
                <button className="text-sm text-cyan-600 dark:text-neon-cyan font-medium hover:underline">
                    View All
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50/50 dark:bg-white/5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 text-left cursor-pointer hover:text-cyan-600 dark:hover:text-neon-cyan transition-colors" onClick={() => sortData('name')}>
                                <div className="flex items-center gap-2">Instrument <ArrowUpDown className="w-3 h-3" /></div>
                            </th>
                            <th className="px-6 py-4 text-right">Qty</th>
                            <th className="px-6 py-4 text-right">Avg. Price</th>
                            <th className="px-6 py-4 text-right">LTP</th>
                            <th className="px-6 py-4 text-right">Cur. Value</th>
                            <th className="px-6 py-4 text-right">P&L</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                        {holdings.map((stock) => {
                            const currentValue = stock.qty * stock.ltp;
                            const investedValue = stock.qty * stock.avg;
                            const pnl = currentValue - investedValue;
                            const pnlPercent = (pnl / investedValue) * 100;
                            const isProfit = pnl >= 0;

                            return (
                                <tr key={stock.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900 dark:text-white">{stock.name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{stock.ticker}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700 dark:text-gray-300">
                                        {stock.qty}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700 dark:text-gray-300">
                                        ₹{stock.avg.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900 dark:text-white">
                                        ₹{stock.ltp.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900 dark:text-white">
                                        ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className={`flex flex-col items-end ${isProfit ? 'text-emerald-600 dark:text-neon-emerald' : 'text-red-500'}`}>
                                            <span className="font-bold flex items-center gap-1">
                                                {isProfit ? '+' : ''}₹{Math.abs(pnl).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                            </span>
                                            <span className="text-xs opacity-80">
                                                ({isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%)
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default HoldingsTable;
