import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    PieChart,
    Activity,
    Settings,
    LogOut,
    X
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../common/Logo';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { t } = useTranslation();
    const { logout } = useUser();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const isDark = theme === 'dark';

    const navItems = [
        { path: '/dashboard',       label: t('portfolio'),       icon: LayoutDashboard, shortcut: '1' },
        { path: '/markets',         label: t('market_watch'),    icon: Activity,        shortcut: '2' },
        { path: '/risk-assessment', label: t('risk_assessment'), icon: PieChart,        shortcut: '3' },
        { path: '/settings',        label: t('settings'),        icon: Settings,        shortcut: '4' },
    ];

    // Keyboard shortcuts: 1 -> Portfolio, 2 -> Market Watch, 3 -> Risk Assessment, 4 -> Settings
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.isContentEditable) return;
            if (e.key === '1') navigate('/dashboard');
            else if (e.key === '2') navigate('/markets');
            else if (e.key === '3') navigate('/risk-assessment');
            else if (e.key === '4') navigate('/settings');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    return (
        <>
            {isOpen && (
                <div
                    className={`fixed inset-0 z-40 lg:hidden transition-opacity ${isDark ? 'bg-black/30' : 'bg-slate-900/20'}`}
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-screen w-64 z-50 flex flex-col transition-transform duration-200 ease-in-out border-r ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
                style={{
                    backgroundColor: 'var(--app-surface)',
                    borderColor: 'var(--app-border)',
                }}
            >
                {/* Logo */}
                <div
                    className="h-14 flex items-center justify-between px-6 border-b shrink-0"
                    style={{ borderColor: 'var(--app-border)' }}
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-3 group cursor-pointer"
                        title="Go to Dashboard"
                    >
                        <div className="w-8 h-8 flex items-center justify-center">
                            <Logo className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <span
                            className="text-lg font-bold tracking-tight group-hover:opacity-80 transition-opacity"
                            style={{ color: 'var(--app-heading)' }}
                        >
                            Cresta
                        </span>
                    </button>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-1 rounded-md transition-colors"
                        style={{ color: 'var(--app-muted)' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Nav — full navigation links */}
                <nav className="flex-1 py-6 px-3 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group ${
                                    isActive
                                        ? isDark
                                            ? 'bg-white/10 text-white border border-white/10'
                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : isDark
                                            ? 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon
                                        size={16}
                                        className={isActive
                                            ? isDark ? 'text-white' : 'text-emerald-600'
                                            : isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-slate-500 group-hover:text-slate-700'
                                        }
                                    />
                                    <span className="flex-1">{item.label}</span>
                                    <span
                                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                                            isActive
                                                ? isDark
                                                    ? 'bg-white/20 border-white/20 text-white'
                                                    : 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                                : isDark
                                                    ? 'bg-[#111] border-[#222] text-gray-600 group-hover:text-gray-400'
                                                    : 'bg-slate-100 border-slate-200 text-slate-400 group-hover:text-slate-600'
                                        }`}
                                    >
                                        {item.shortcut}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div
                    className="border-t shrink-0"
                    style={{ borderColor: 'var(--app-border)' }}
                >
                    <button
                        onClick={logout}
                        className={`flex items-center gap-3 px-5 py-4 w-full transition-colors text-sm font-medium ${
                            isDark
                                ? 'text-gray-400 hover:bg-white/5 hover:text-red-400'
                                : 'text-slate-600 hover:bg-red-50 hover:text-red-600'
                        }`}
                    >
                        <LogOut size={15} />
                        <span>{t('logout', 'Logout')}</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
