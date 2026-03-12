import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { User, Shield, Moon, Sun, Globe, Bell, ChevronRight, Check } from 'lucide-react';

const SettingsPage = () => {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const { user } = useUser();

    const languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
        { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
        { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' }
    ];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('settings')}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('manage_your_account_and_preferences') || 'Manage your account settings and preferences.'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Settings Navigation (Optional, for larger screens) */}
                    <div className="hidden md:block col-span-1 space-y-2">
                        <nav className="flex flex-col gap-1 sticky top-24">
                            <a href="#profile" className="px-4 py-3 rounded-xl bg-cyan-50 dark:bg-neon-cyan/10 text-cyan-600 dark:text-neon-cyan font-medium flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <User size={18} />
                                    <span>{t('profile') || 'Profile'}</span>
                                </div>
                                <ChevronRight size={16} />
                            </a>
                            <a href="#appearance" className="px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 font-medium flex items-center justify-between transition-colors">
                                <div className="flex items-center gap-3">
                                    {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                                    <span>{t('appearance') || 'Appearance'}</span>
                                </div>
                                <ChevronRight size={16} />
                            </a>
                            <a href="#language" className="px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 font-medium flex items-center justify-between transition-colors">
                                <div className="flex items-center gap-3">
                                    <Globe size={18} />
                                    <span>{t('language') || 'Language'}</span>
                                </div>
                                <ChevronRight size={16} />
                            </a>
                        </nav>
                    </div>

                    {/* Settings Content */}
                    <div className="col-span-1 md:col-span-2 space-y-8">

                        {/* Profile Section */}
                        <motion.section
                            id="profile"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-fintech-card/50 backdrop-blur-xl"
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-white/10">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <User className="text-cyan-500" size={20} />
                                    {t('profile_settings') || 'Profile Settings'}
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</h3>
                                        <p className="text-gray-500 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('full_name')}</label>
                                            <input
                                                type="text"
                                                value={user?.name || ''}
                                                readOnly
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white opacity-70 cursor-not-allowed focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('email_address')}</label>
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                readOnly
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white opacity-70 cursor-not-allowed focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* Appearance Section */}
                        <motion.section
                            id="appearance"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-panel rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-fintech-card/50 backdrop-blur-xl"
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-white/10">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    {theme === 'dark' ? <Moon className="text-cyan-500" size={20} /> : <Sun className="text-emerald-500" size={20} />}
                                    {t('appearance') || 'Appearance'}
                                </h2>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    {t('customize_how_cresta_looks_on_your_device') || 'Customize how Cresta looks on your device.'}
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => theme === 'dark' && toggleTheme()}
                                        className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200 ${theme === 'light'
                                                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                                                : 'border-gray-200 dark:border-white/10 hover:border-cyan-300 dark:hover:border-cyan-700 focus:outline-none'
                                            }`}
                                    >
                                        <Sun size={32} className={`mb-3 ${theme === 'light' ? 'text-cyan-500' : 'text-gray-400'}`} />
                                        <span className={`font-medium ${theme === 'light' ? 'text-cyan-700 dark:text-cyan-300' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {t('light_mode') || 'Light Mode'}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => theme === 'light' && toggleTheme()}
                                        className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200 ${theme === 'dark'
                                                ? 'border-neon-cyan bg-neon-cyan/10'
                                                : 'border-gray-200 dark:border-white/10 hover:border-cyan-300 dark:hover:border-cyan-700 focus:outline-none'
                                            }`}
                                    >
                                        <Moon size={32} className={`mb-3 ${theme === 'dark' ? 'text-neon-cyan' : 'text-gray-400'}`} />
                                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {t('dark_mode') || 'Dark Mode'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </motion.section>

                        {/* Language Section */}
                        <motion.section
                            id="language"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-panel rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-fintech-card/50 backdrop-blur-xl"
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-white/10">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Globe className="text-blue-500" size={20} />
                                    {t('language') || 'Language'}
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-gray-500 dark:text-gray-400 mb-2">
                                    {t('select_language') || 'Select your preferred language for the interface.'}
                                </p>

                                <div className="space-y-2">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => changeLanguage(lang.code)}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${i18n.language === lang.code
                                                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 shadow-sm'
                                                    : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 focus:outline-none'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${i18n.language === lang.code
                                                        ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-800 dark:text-cyan-200'
                                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                    {lang.code.toUpperCase()}
                                                </div>
                                                <div className="text-left">
                                                    <div className={`font-medium ${i18n.language === lang.code ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {lang.nativeName}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {lang.name}
                                                    </div>
                                                </div>
                                            </div>
                                            {i18n.language === lang.code && (
                                                <Check className="text-cyan-500" size={20} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.section>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
