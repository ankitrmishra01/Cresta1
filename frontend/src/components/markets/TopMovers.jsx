import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Tabbed gainers/losers table with skeleton loading state.
 */
const TopMovers = ({ selectedTab, setSelectedTab, currentMovers, moversLoading, t }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={`bento-panel rounded border overflow-hidden ${isDark ? 'border-[#222222] bg-[#0A0A0A]' : 'border-slate-200 bg-white shadow-sm'}`}>
            <div className={`p-6 border-b flex justify-between items-center ${isDark ? 'border-[#222222]' : 'border-slate-200'}`}>
                <button
                    onClick={() => setSelectedTab('gainers')}
                    className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${selectedTab === 'gainers' || selectedTab === 'overview' ? 'text-financial-profit dark:text-financial-profitDark border-financial-profit dark:border-financial-profitDark' : (isDark ? 'text-gray-500 border-transparent hover:text-gray-300' : 'text-slate-500 border-transparent hover:text-slate-700')}`}
                >
                    {t('top_gainers')}
                </button>
                <button
                    onClick={() => setSelectedTab('losers')}
                    className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${selectedTab === 'losers' ? 'text-financial-loss dark:text-financial-lossDark border-financial-loss dark:border-financial-lossDark' : (isDark ? 'text-gray-500 border-transparent hover:text-gray-300' : 'text-slate-500 border-transparent hover:text-slate-700')}`}
                >
                    {t('top_losers')}
                </button>
            </div>

            <div className="p-4">
                {moversLoading ? (
                    // Skeleton loading
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse flex justify-between items-center py-4">
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
                                </div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                            </div>
                        ))}
                    </div>
                ) : currentMovers.length > 0 ? (
                    <table className="w-full">
                        <thead>
                            <tr className={`text-left text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                <th className="pb-4">{t('company')}</th>
                                <th className="pb-4 text-right">{t('price')}</th>
                                <th className="pb-4 text-right">{t('change')}</th>
                                <th className="pb-4 text-right hidden sm:table-cell">{t('volume')}</th>
                            </tr>
                        </thead>
                        <tbody className={`${isDark ? 'divide-y divide-[#222222]' : 'divide-y divide-slate-200'}`}>
                            {currentMovers.map((stock, idx) => (
                                <tr key={stock.symbol || idx} className={`transition-colors group cursor-pointer ${isDark ? 'hover:bg-[#111111]' : 'hover:bg-slate-50'}`}>
                                    <td className="py-4">
                                        <div>
                                            <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stock.symbol}</div>
                                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>{stock.name}</div>
                                        </div>
                                    </td>
                                    <td className={`py-4 text-right font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{stock.price?.toFixed(2)}</td>
                                    <td className={`py-4 text-right font-bold ${stock.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {stock.change > 0 ? '+' : ''}{stock.change}%
                                    </td>
                                    <td className={`py-4 text-right hidden sm:table-cell ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>{stock.volume}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-8">
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                            {selectedTab === 'gainers' ? t('no_gainers_data') : t('no_losers_data')}
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t('backend_not_running')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopMovers;
