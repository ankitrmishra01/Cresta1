import React from 'react';
import { Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * News feed column showing personalized or general market news
 * with publisher, timestamp, and headline links.
 */
const MarketNews = ({ news, newsLoading, user, t }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={`bento-panel p-6 rounded border ${isDark ? 'border-[#222222] bg-[#0A0A0A]' : 'border-slate-200 bg-white shadow-sm'}`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Clock className={`w-4 h-4 ${isDark ? 'text-white' : 'text-slate-700'}`} /> {user ? t('personalized_news') : t('market_news')}
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {newsLoading ? (
                    [1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse space-y-2">
                            <div className={`h-3 rounded w-1/4 ${isDark ? 'bg-gray-700' : 'bg-slate-200'}`}></div>
                            <div className={`h-4 rounded w-full ${isDark ? 'bg-gray-700' : 'bg-slate-200'}`}></div>
                            <div className={`h-4 rounded w-3/4 ${isDark ? 'bg-gray-700' : 'bg-slate-200'}`}></div>
                        </div>
                    ))
                ) : news.length > 0 ? (
                    news.map((item, i) => (
                        <div key={i} className={`group cursor-pointer border-b pb-4 last:border-0 ${isDark ? 'border-[#222222]' : 'border-slate-200'}`}>
                            <div className="flex justify-between items-center mb-1">
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{item.publisher}</div>
                                <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                    {item.time ? new Date(item.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('just_now')}
                                </div>
                            </div>
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-sm font-medium transition-colors line-clamp-2 ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}
                            >
                                {item.title}
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>{t('no_news_available')}</p>
                    </div>
                )}
            </div>
            <button className="w-full mt-6 py-2 premium-button premium-button-secondary">
                {t('read_more')}
            </button>
        </div>
    );
};

export default MarketNews;
