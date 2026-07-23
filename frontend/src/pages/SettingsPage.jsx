import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { User, Shield, Moon, Sun, Globe, Bell, ChevronRight, Check, Lock, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SettingsPage = () => {
    const { t, i18n } = useTranslation();
    const { theme, setTheme } = useTheme();
    const { user } = useUser();
    const isDark = theme === 'dark';
    
    // Active tab state for tabbed view
    const [activeTab, setActiveTab] = React.useState('profile');

    // UI state for mock persistent settings
    const [notifications, setNotifications] = React.useState({
        email: true,
        push: true,
        weekly: false
    });
    const [currency, setCurrency] = React.useState('INR');

    const languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
        { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
        { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' }
    ];

    const changeLanguage = async (lng) => {
        const { loadLanguage } = await import('../i18n');
        await loadLanguage(lng);
    };

    const navItems = [
        { id: 'profile', label: t('profile'), icon: User },
        { id: 'risk', label: t('risk_management'), icon: Zap },
        { id: 'appearance', label: t('appearance'), icon: theme === 'dark' ? Moon : Sun },
        { id: 'notifications', label: t('notifications'), icon: Bell },
        { id: 'language', label: t('language'), icon: Globe },
        { id: 'security', label: t('security'), icon: Lock },
    ];

    const panelClass = `bento-panel rounded overflow-hidden ${isDark ? '' : 'shadow-sm'}`;
    const panelHeaderClass = `p-6 border-b ${isDark ? 'border-[#222222]' : 'border-slate-200'}`;
    const titleClass = isDark ? 'text-white' : 'text-slate-900';
    const mutedClass = isDark ? 'text-gray-400' : 'text-slate-600';
    const rowClass = isDark ? 'border-[#222222] bg-[#111111]' : 'border-slate-200 bg-slate-50';

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                <div>
                    <h1 className={`text-3xl font-bold mb-2 ${titleClass}`}>{t('settings')}</h1>
                    <p className={mutedClass}>{t('manage_your_account_and_preferences') || 'Manage your account settings and preferences.'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Settings Navigation */}
                    <div className="col-span-1 space-y-2">
                        <nav className="flex flex-col gap-1 sticky top-24">
                            {navItems.map((item) => {
                                const isActive = activeTab === item.id;
                                return (
                                    <button 
                                        key={item.id} 
                                        onClick={() => setActiveTab(item.id)}
                                        className={`px-4 py-3 rounded-xl flex items-center justify-between transition-all group w-full text-left cursor-pointer ${
                                            isActive 
                                            ? 'bg-emerald-500/10 text-emerald-400 font-bold shadow-sm border border-emerald-500/20' 
                                            : (isDark ? 'text-gray-400 hover:bg-[#111111] font-medium' : 'text-slate-600 hover:bg-slate-100 font-medium')
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-emerald-500/20 text-emerald-500' : (isDark ? 'bg-transparent text-gray-400 group-hover:text-emerald-500' : 'bg-transparent text-slate-500 group-hover:text-emerald-500')}`}>
                                                <item.icon size={18} />
                                            </div>
                                            <span>{item.label}</span>
                                        </div>
                                        <ChevronRight size={16} className={`transition-transform ${isActive ? 'translate-x-0 text-emerald-400' : 'translate-x-[-4px] opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Settings Content Panel (Shows only the active tab) */}
                    <div className="col-span-1 md:col-span-2">

                        {/* Profile Section */}
                        {activeTab === 'profile' && (
                            <motion.section
                                key="profile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={panelClass}
                            >
                                <div className={panelHeaderClass}>
                                    <h2 className={`text-xl font-semibold flex items-center gap-2 ${titleClass}`}>
                                        <User className="text-emerald-500" size={20} />
                                        {t('profile_settings') || 'Profile Settings'}
                                    </h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-medium ${titleClass}`}>{user?.name || 'User'}</h3>
                                            <p className={mutedClass}>{user?.email || 'user@example.com'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{t('full_name')}</label>
                                                <input
                                                    type="text"
                                                    value={user?.name || ''}
                                                    readOnly
                                                    className={`w-full px-4 py-2.5 rounded-xl border opacity-70 cursor-not-allowed focus:outline-none bento-input ${isDark ? 'border-[#222222] bg-[#111111] text-white' : 'border-slate-200 bg-slate-100 text-slate-800'}`}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{t('email_address')}</label>
                                                <input
                                                    type="email"
                                                    value={user?.email || ''}
                                                    readOnly
                                                    className={`w-full px-4 py-2.5 rounded-xl border opacity-70 cursor-not-allowed focus:outline-none bento-input ${isDark ? 'border-[#222222] bg-[#111111] text-white' : 'border-slate-200 bg-slate-100 text-slate-800'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {/* Risk Management Section */}
                        {activeTab === 'risk' && (
                            <motion.section
                                key="risk"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={panelClass}
                            >
                                <div className={panelHeaderClass}>
                                    <h2 className={`text-xl font-semibold flex items-center gap-2 ${titleClass}`}>
                                        <Zap className="text-amber-500" size={20} />
                                        {t('risk_management')}
                                    </h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                            <Shield size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className={`font-bold ${titleClass}`}>{t('risk_profile')}: {user?.risk_profile || 'Moderate'}</h4>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider">{t('active')}</span>
                                            </div>
                                            <p className={`text-sm leading-relaxed ${mutedClass}`}>
                                                {t('risk_profile_desc', { profile: user?.risk_profile || 'Moderate' })}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        to="/risk-assessment"
                                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border transition-all font-semibold group ${isDark ? 'border-[#222222] hover:bg-[#111111] text-gray-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                                    >
                                        {t('retake_risk_assessment')}
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.section>
                        )}

                        {/* Appearance Section */}
                        {activeTab === 'appearance' && (
                            <motion.section
                                key="appearance"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={panelClass}
                            >
                                <div className={panelHeaderClass}>
                                    <h2 className={`text-xl font-semibold flex items-center gap-2 ${titleClass}`}>
                                        {theme === 'dark' ? <Moon className="text-emerald-500" size={20} /> : <Sun className="text-emerald-500" size={20} />}
                                        {t('appearance')}
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <p className={`${mutedClass} mb-6`}>
                                        {t('customize_how_cresta_looks_on_your_device') || 'Customize how Cresta looks on your device.'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setTheme('light')}
                                            className={`flex flex-col items-center p-6 rounded border transition-all duration-200 ${theme === 'light'
                                                ? (isDark ? 'border-emerald-500 bg-emerald-900/20 shadow-sm shadow-emerald-500/10' : 'border-emerald-500 bg-emerald-50 shadow-sm')
                                                : (isDark ? 'border-[#222222] hover:border-emerald-700 focus:outline-none' : 'border-slate-200 hover:border-emerald-400 focus:outline-none bg-white')
                                                }`}
                                        >
                                            <Sun size={32} className={`mb-3 ${theme === 'light' ? 'text-emerald-500' : 'text-gray-400'}`} />
                                            <span className={`font-medium ${theme === 'light' ? (isDark ? 'text-emerald-300' : 'text-emerald-700') : (isDark ? 'text-gray-400' : 'text-slate-500')}`}>
                                                {t('light_mode')}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={`flex flex-col items-center p-6 rounded border transition-all duration-200 ${theme === 'dark'
                                                ? 'border-emerald-500 bg-emerald-500/10 shadow-sm shadow-emerald-500/10'
                                                : (isDark ? 'border-[#222222] hover:border-emerald-700 focus:outline-none' : 'border-slate-200 hover:border-emerald-400 focus:outline-none bg-white')
                                                }`}
                                        >
                                            <Moon size={32} className={`mb-3 ${theme === 'dark' ? 'text-emerald-500' : 'text-gray-400'}`} />
                                            <span className={`font-medium ${theme === 'dark' ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-gray-400' : 'text-slate-500')}`}>
                                                {t('dark_mode')}
                                            </span>
                                        </button>
                                    </div>

                                    <div className={`mt-8 pt-6 border-t ${isDark ? 'border-[#222222]' : 'border-slate-200'}`}>
                                        <label className={`text-sm font-semibold mb-4 block ${titleClass}`}>{t('preferred_currency')}</label>
                                        <div className="flex gap-3">
                                            {['INR', 'USD'].map((curr) => (
                                                <button
                                                    key={curr}
                                                    onClick={() => setCurrency(curr)}
                                                    className={`px-6 py-2 rounded-lg border-2 transition-all ${
                                                        currency === curr 
                                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold' 
                                                        : (isDark ? 'border-[#222222] text-gray-500 hover:border-emerald-500/30' : 'border-slate-200 text-slate-500 hover:border-emerald-400')
                                                    }`}
                                                >
                                                    {curr}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {/* Notifications Section */}
                        {activeTab === 'notifications' && (
                            <motion.section
                                key="notifications"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={panelClass}
                            >
                                <div className={panelHeaderClass}>
                                    <h2 className={`text-xl font-semibold flex items-center gap-2 ${titleClass}`}>
                                        <Bell className="text-emerald-500" size={20} />
                                        {t('notifications')}
                                    </h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <p className={`text-sm ${mutedClass}`}>{t('manage_notifications')}</p>
                                    <div className="space-y-4">
                                        {[
                                            { id: 'email', label: t('email_alerts'), desc: 'Receive real-time email alerts for major market moves.' },
                                            { id: 'push', label: t('browser_notifications'), desc: 'Get desktop alerts for AI buy/sell signals.' },
                                            { id: 'weekly', label: t('weekly_insights'), desc: 'Personalized performance review every Monday.' },
                                        ].map((pref) => (
                                            <div key={pref.id} className={`flex items-center justify-between p-4 rounded-xl border ${rowClass}`}>
                                                <div>
                                                    <h4 className={`text-sm font-semibold ${titleClass}`}>{pref.label}</h4>
                                                    <p className={`text-xs ${mutedClass}`}>{pref.desc}</p>
                                                </div>
                                                <button 
                                                    onClick={() => setNotifications(prev => ({ ...prev, [pref.id]: !prev[pref.id] }))}
                                                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications[pref.id] ? 'bg-emerald-500' : (isDark ? 'bg-gray-700' : 'bg-slate-300')}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications[pref.id] ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {/* Language Section */}
                        {activeTab === 'language' && (
                            <motion.section
                                key="language"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={panelClass}
                            >
                                <div className={panelHeaderClass}>
                                    <h2 className={`text-xl font-semibold flex items-center gap-2 ${titleClass}`}>
                                        <Globe className="text-blue-500" size={20} />
                                        {t('language') || 'Language'}
                                    </h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <p className={`${mutedClass} mb-2`}>
                                        {t('select_language') || 'Select your preferred language for the interface.'}
                                    </p>

                                    <div className="space-y-2">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => changeLanguage(lang.code)}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${i18n.language === lang.code
                                                    ? (isDark ? 'border-white bg-[#111111] shadow-sm' : 'border-emerald-500 bg-emerald-50 shadow-sm')
                                                    : (isDark ? 'border-[#222222] hover:bg-[#111111] focus:outline-none' : 'border-slate-200 hover:bg-slate-50 focus:outline-none')
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${i18n.language === lang.code
                                                        ? (isDark ? 'bg-[#222222] text-white' : 'bg-emerald-100 text-emerald-700')
                                                        : (isDark ? 'bg-[#111111] text-gray-400' : 'bg-slate-100 text-slate-500')
                                                        }`}>
                                                        {lang.code.toUpperCase()}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className={`font-medium ${i18n.language === lang.code ? titleClass : mutedClass}`}>
                                                            {lang.nativeName}
                                                        </div>
                                                        <div className={`text-xs ${mutedClass}`}>
                                                            {lang.name}
                                                        </div>
                                                    </div>
                                                </div>
                                                {i18n.language === lang.code && (
                                                    <Check className={isDark ? 'text-white' : 'text-emerald-700'} size={20} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {/* Security Section */}
                        {activeTab === 'security' && (
                            <motion.section
                                key="security"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={panelClass}
                            >
                                <div className={panelHeaderClass}>
                                    <h2 className={`text-xl font-semibold flex items-center gap-2 ${titleClass}`}>
                                        <Lock className="text-red-500" size={20} />
                                        {t('security')}
                                    </h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <p className={`text-sm ${mutedClass}`}>{t('security_subtitle')}</p>
                                    <div className="space-y-4">
                                        <div className={`flex items-center justify-between p-4 rounded-xl border ${rowClass}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                                    <Shield size={20} />
                                                </div>
                                                <div>
                                                    <h4 className={`text-sm font-semibold ${titleClass}`}>{t('two_factor_auth')}</h4>
                                                    <p className="text-xs text-emerald-400">{t('active')}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-sm font-semibold ${isDark ? 'border-[#222222] hover:bg-[#111111] text-gray-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'}`}>
                                            <span>{t('change_password')}</span>
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.section>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
