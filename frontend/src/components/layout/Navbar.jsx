import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';

const Navbar = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 top-0 start-0 border-b border-gray-200 dark:border-white/10 glass-panel">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 15L85 75H15L50 15Z" stroke="#00D09C" strokeWidth="8" strokeLinejoin="round" />
                        <circle cx="50" cy="45" r="5" fill="#00D09C" />
                        <path d="M50 45L35 65M50 45L65 65" stroke="#00D09C" strokeWidth="4" strokeLinecap="round" />
                    </svg>

                    <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Cresta<span className="text-[#00D09C]">.</span>
                    </span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    type="button"
                    className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 dark:text-gray-300 rounded-lg md:hidden hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-neon-cyan"
                >
                    <span className="sr-only">Open main menu</span>
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Navigation Links */}
                <div className={`${isOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`} id="navbar-default">
                    <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 dark:border-white/10 rounded-lg bg-white dark:bg-fintech-card md:bg-transparent md:flex-row md:items-center md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0">
                        <li>
                            <Link to="/" className="block py-2 px-3 text-cyan-700 dark:text-white bg-cyan-50 dark:bg-neon-cyan/10 rounded md:bg-transparent md:text-cyan-600 dark:md:text-neon-cyan md:p-0 hover:text-cyan-600 dark:hover:text-neon-cyan transition-colors" aria-current="page">{t('dashboard')}</Link>
                        </li>
                        <li>
                            <Link to="/" className="block py-2 px-3 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-white/10 md:hover:bg-transparent md:border-0 md:hover:text-cyan-600 dark:md:hover:text-neon-cyan md:p-0 transition-colors">{t('markets')}</Link>
                        </li>
                        <li>
                            <Link to="/" className="block py-2 px-3 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-white/10 md:hover:bg-transparent md:border-0 md:hover:text-cyan-600 dark:md:hover:text-neon-cyan md:p-0 transition-colors">{t('about')}</Link>
                        </li>
                        <li className="mt-4 md:mt-0 p-2 md:p-0">
                            <Link to="/auth" className="block w-full md:w-auto text-center px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-neon-cyan/20 dark:to-neon-blue/20 border border-cyan-500/50 dark:border-neon-cyan/50 text-cyan-600 dark:text-neon-cyan font-semibold hover:border-cyan-400 dark:hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-300">
                                {t('login')}
                            </Link>
                        </li>
                        <li className="mt-4 md:mt-0 p-2 md:p-0 flex justify-center md:block">
                            <ThemeToggle />
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
