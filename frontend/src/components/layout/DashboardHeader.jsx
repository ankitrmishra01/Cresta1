import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, LogOut, Settings } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useSearch } from '../../context/SearchContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Derive a readable page title from the current route
const getPageTitle = (pathname) => {
    const map = {
        '/dashboard':       'Portfolio',
        '/markets':         'Market Watch',
        '/risk-assessment': 'Risk Assessment',
        '/settings':        'Settings',
    };
    return map[pathname] || 'Dashboard';
};

const DashboardHeader = ({ toggleSidebar }) => {
    const { user, logout } = useUser();
    const { searchQuery, setSearchQuery } = useSearch();
    const { showToast } = useToast();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [localQuery, setLocalQuery] = useState(searchQuery || '');
    const [showProfile, setShowProfile] = useState(false);
    const profileRef = useRef(null);
    const isDark = theme === 'dark';

    const pageTitle = getPageTitle(location.pathname);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (localQuery.trim()) {
                setSearchQuery(localQuery.trim().toUpperCase());
                navigate('/markets');
            }
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfile(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const avatarLetter = user?.name
        ? user.name.charAt(0).toUpperCase()
        : user?.email
        ? user.email.charAt(0).toUpperCase()
        : 'U';

    return (
        <header
            className="h-14 border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shrink-0 transition-colors duration-200"
            style={{
                backgroundColor: 'var(--app-surface)',
                borderColor: 'var(--app-border)',
            }}
        >
            {/* Left: hamburger + page title */}
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleSidebar}
                    className={`lg:hidden p-1.5 rounded-md transition-colors ${isDark ? 'text-gray-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}
                    aria-label="Toggle menu"
                >
                    <Menu size={18} />
                </button>

                {/* Page title — just a label, not clickable */}
                <span
                    className="text-sm font-semibold hidden sm:block"
                    style={{ color: 'var(--app-heading)' }}
                >
                    {pageTitle}
                </span>
            </div>

            {/* Right: search + notifications + avatar */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative hidden md:block w-60">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        size={13}
                        style={{ color: 'var(--app-muted)' }}
                    />
                    <input
                        type="text"
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        placeholder="Search eg: INFY, TCS..."
                        className="w-full pl-8 pr-3 py-1.5 border rounded text-[12.5px] transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                        style={{
                            backgroundColor: 'var(--app-bg)',
                            borderColor: 'var(--app-border)',
                            color: 'var(--app-text)',
                        }}
                    />
                </div>

                {/* Notifications */}
                <button
                    onClick={() => showToast('No new notifications', 'info')}
                    className={`p-1.5 rounded transition-colors relative ${isDark ? 'text-gray-500 hover:bg-[#111111]' : 'text-slate-500 hover:bg-slate-100'}`}
                    aria-label="Notifications"
                >
                    <Bell size={17} />
                    <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                </button>

                {/* Avatar + Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setShowProfile((p) => !p)}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isDark
                                ? 'bg-[#111111] border-[#222222] hover:bg-[#1a1a1a] hover:border-white/20'
                                : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                        } ${showProfile ? (isDark ? 'border-white/30 ring-1 ring-white/10' : 'border-emerald-400') : ''}`}
                        aria-label="User profile"
                    >
                        <span className={`font-bold text-[11px] uppercase ${isDark ? 'text-white' : 'text-emerald-700'}`}>
                            {avatarLetter}
                        </span>
                    </button>

                    {/* Dropdown card */}
                    {showProfile && (
                        <div
                            className="absolute right-0 top-10 w-60 rounded-xl border shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                            style={{
                                backgroundColor: 'var(--app-surface)',
                                borderColor: 'var(--app-border)',
                            }}
                        >
                            {/* User Info */}
                            <div
                                className="px-4 py-3.5 border-b"
                                style={{ borderColor: 'var(--app-border)' }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                        isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-emerald-50 border-emerald-200'
                                    }`}>
                                        <span className={`font-bold text-sm uppercase ${isDark ? 'text-white' : 'text-emerald-700'}`}>
                                            {avatarLetter}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--app-heading)' }}>
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-xs truncate" style={{ color: 'var(--app-muted)' }}>
                                            {user?.email || ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="py-1">
                                <button
                                    onClick={() => { setShowProfile(false); navigate('/settings'); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                        isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <Settings size={14} />
                                    Settings
                                </button>
                                <button
                                    onClick={() => { setShowProfile(false); logout(); navigate('/'); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                        isDark ? 'text-gray-400 hover:bg-white/5 hover:text-red-400' : 'text-slate-600 hover:bg-red-50 hover:text-red-600'
                                    }`}
                                >
                                    <LogOut size={14} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
