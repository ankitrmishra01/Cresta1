import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import ThemeToggle from '../common/ThemeToggle';
import { useSearch } from '../../context/SearchContext';


const Header = () => {
    const { user } = useUser();
    const { setSearchQuery } = useSearch();
    const displayName = user?.name || 'Investor';
    const location = useLocation();

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setSearchQuery(e.target.value);
        }
    };



    return (
        <header className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-fintech-bg/50 backdrop-blur-md sticky top-0 z-10 transition-colors duration-300">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back, <span className="text-cyan-600 dark:text-neon-cyan">{displayName}</span>
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Here's what's happening with your portfolio today.</p>
            </div>

            <div className="flex items-center gap-6">
                {/* Search */}
                {location.pathname === '/markets' && (
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search assets (e.g. RELIANCE)..."
                            onKeyDown={handleSearch}
                            className="bg-gray-100 dark:bg-fintech-card/50 border border-transparent dark:border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-fintech-card focus:border-cyan-500/50 dark:focus:border-neon-cyan/50 focus:ring-2 ring-cyan-500/10 dark:ring-neon-cyan/10 w-64 transition-all placeholder:text-gray-500"
                        />
                    </div>
                )}


                {/* Notifications */}
                <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 dark:bg-neon-cyan rounded-full"></span>
                </button>

                <ThemeToggle />

                {/* Profile */}
                <div className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-white/10">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Premium Investor</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 dark:from-neon-cyan dark:to-neon-blue p-[2px]">
                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                            <User className="w-5 h-5 text-gray-600 dark:text-white/80" />
                            {/* <img src="..." alt="User" /> */}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
