import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';
import {
    PieChart,
    TrendingUp,
    Activity,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const { logout } = useUser();
    const navigate = useNavigate();

    const toggleSidebar = () => setCollapsed(!collapsed);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const navItems = [
        { icon: PieChart, label: t('portfolio'), path: '/dashboard' },
        { icon: TrendingUp, label: t('market_watch'), path: '/markets' },
        { icon: Activity, label: t('risk_assessment'), path: '/risk' },
        { icon: Settings, label: t('settings'), path: '/settings' },
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 80 : 280 }}
            className="hidden md:flex flex-col h-screen sticky top-0 bg-white/70 dark:bg-fintech-card/30 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 z-20 transition-colors duration-300"
        >
            <div className="p-6 flex items-center justify-between">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 15L85 75H15L50 15Z" stroke="#00D09C" strokeWidth="8" strokeLinejoin="round" />
                            <circle cx="50" cy="45" r="5" fill="#00D09C" />
                            <path d="M50 45L35 65M50 45L65 65" stroke="#00D09C" strokeWidth="4" strokeLinecap="round" />
                        </svg>

                        <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Cresta<span className="text-[#00D09C]">.</span>
                        </span>
                    </div>
                )}
                <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ml-auto"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative
              ${isActive
                                ? 'bg-cyan-50 dark:bg-neon-cyan/10 text-cyan-600 dark:text-neon-cyan'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}
            `}
                    >
                        <item.icon size={22} className="min-w-[22px]" />
                        {!collapsed && (
                            <span className="font-medium whitespace-nowrap overflow-hidden">
                                {item.label}
                            </span>
                        )}
                        {/* Tooltip for collapsed state */}
                        {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-white/10">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                    <LogOut size={22} className="min-w-[22px]" />
                    {!collapsed && <span className="font-medium">{t('logout')}</span>}
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
