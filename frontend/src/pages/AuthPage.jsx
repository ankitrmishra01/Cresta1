import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Github, Chrome, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import { useGoogleLogin } from '@react-oauth/google';

const AuthPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(location.state?.isSignUp ? false : true);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const navigate = useNavigate();
    const { login } = useUser();

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                const res = await fetch('http://localhost:8000/api/auth/google/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ access_token: tokenResponse.access_token })
                });

                const data = await res.json();

                if (data.success) {
                    login(data.user);
                    navigate('/dashboard');
                } else {
                    console.error('Backend Google Auth Failed:', data.error);
                }
            } catch (err) {
                console.error('Google Auth Request Failed:', err);
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            console.log('Google Login Failed');
            setIsLoading(false);
        }
    });

    const toggleMode = () => setIsLogin(!isLogin);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);

            let displayName = 'Investor';
            if (!isLogin && formData.name) {
                displayName = formData.name;
            } else if (isLogin && formData.email) {
                const emailName = formData.email.split('@')[0];
                displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
            }

            login({
                name: displayName,
                email: formData.email
            });

            navigate('/dashboard');
        }, 2000);
    };

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-fintech-bg text-gray-900 dark:text-white overflow-hidden transition-colors duration-300">

            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-white/50 dark:bg-slate-900 border-r border-gray-200 dark:border-white/10">
                <div className="absolute inset-0 z-0 opacity-30">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale dark:grayscale-0 transition-all duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-blue-100/40 to-transparent dark:from-fintech-bg dark:via-fintech-primary/80 dark:to-transparent"></div>
                </div>

                <Link to="/" className="relative z-10 flex items-center gap-2 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors w-fit group">
                    <div className="p-2 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span>{t('back_future')}</span>
                </Link>

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        key={isLogin ? 'login-quote' : 'signup-quote'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="h-1 w-12 bg-cyan-600 dark:bg-neon-cyan mb-6 rounded-full"></div>
                        <blockquote className="text-4xl font-light leading-tight mb-6 font-serif text-gray-900 dark:text-white">
                            {isLogin
                                ? t('quote_buffett')
                                : t('quote_einstein')}
                        </blockquote>
                        <cite className="not-italic text-lg text-cyan-600 dark:text-neon-cyan/80">
                            — {isLogin ? "Warren Buffett" : "Albert Einstein"}
                        </cite>
                    </motion.div>
                </div>

                <div className="relative z-10 text-sm text-gray-500">
                    &copy; 2026 Cresta AI.
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">

                <div className="absolute inset-0 z-0 lg:hidden">
                    <div className="absolute inset-0 bg-gray-50 dark:bg-fintech-bg transition-colors duration-300"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 dark:bg-neon-cyan/10 rounded-full blur-[100px]"></div>
                </div>

                <motion.div
                    layout
                    className="w-full max-w-md relative z-10"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                            {isLogin ? t('auth_welcome_back') : t('create_account')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {isLogin ? t('login_subtitle') : t('signup_subtitle')}
                        </p>
                    </div>

                    <div className="glass-panel p-8 rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl bg-white/50 dark:bg-fintech-card/50 backdrop-blur-xl">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <AnimatePresence mode="popLayout">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="relative group"
                                    >
                                        <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-neon-cyan transition-colors" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required={!isLogin}
                                            placeholder=" "
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-10 py-3 text-gray-900 dark:text-white outline-none focus:border-cyan-500/50 dark:focus:border-neon-cyan/50 focus:bg-white dark:focus:bg-white/10 transition-all peer"
                                        />
                                        <label className="absolute left-10 top-3 text-sm text-gray-500 dark:text-gray-400 transition-all bg-gray-50 dark:bg-fintech-card/50 px-1 ml-[-4px] pointer-events-none peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-cyan-600 dark:peer-focus:text-neon-cyan peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-cyan-600 dark:peer-[:not(:placeholder-shown)]:text-neon-cyan">
                                            {t('full_name')}
                                        </label>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative group">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-neon-cyan transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder=" "
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-10 py-3 text-gray-900 dark:text-white outline-none focus:border-cyan-500/50 dark:focus:border-neon-cyan/50 focus:bg-white dark:focus:bg-white/10 transition-all peer"
                                />
                                <label className="absolute left-10 top-3 text-sm text-gray-500 dark:text-gray-400 transition-all bg-gray-50 dark:bg-fintech-card/50 px-1 ml-[-4px] pointer-events-none peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-cyan-600 dark:peer-focus:text-neon-cyan peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-cyan-600 dark:peer-[:not(:placeholder-shown)]:text-neon-cyan">
                                    {t('email_address')}
                                </label>
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-neon-cyan transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder=" "
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-12 py-3 text-gray-900 dark:text-white outline-none focus:border-cyan-500/50 dark:focus:border-neon-cyan/50 focus:bg-white dark:focus:bg-white/10 transition-all peer"
                                />
                                <label className="absolute left-10 top-3 text-sm text-gray-500 dark:text-gray-400 transition-all bg-gray-50 dark:bg-fintech-card/50 px-1 ml-[-4px] pointer-events-none peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-cyan-600 dark:peer-focus:text-neon-cyan peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-cyan-600 dark:peer-[:not(:placeholder-shown)]:text-neon-cyan">
                                    {t('password')}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-cyan-600 dark:hover:text-neon-cyan transition-colors"
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.div
                                            key={showPassword ? "hide" : "show"}
                                            initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </motion.div>
                                    </AnimatePresence>
                                </button>
                            </div>

                            {isLogin && (
                                <div className="flex justify-end">
                                    <a href="#" className="text-sm text-cyan-600 dark:text-neon-cyan/80 hover:text-cyan-500 dark:hover:text-neon-cyan transition-colors">
                                        {t('forgot_password')}
                                    </a>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full glass-btn py-3 rounded-xl font-semibold text-cyan-900 dark:text-white flex items-center justify-center gap-2 group relative overflow-hidden"
                            >
                                {isLoading ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>{isLogin ? t('sign_in') : t('create_account')}</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="my-6 flex items-center gap-4">
                            <div className="h-px bg-gray-200 dark:bg-white/10 flex-1"></div>
                            <span className="text-gray-500 text-sm">{t('or_continue_with')}</span>
                            <div className="h-px bg-gray-200 dark:bg-white/10 flex-1"></div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button type="button" onClick={() => loginWithGoogle()} className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm font-medium w-full text-gray-700 dark:text-white">
                                <Chrome className="w-4 h-4" /> Google
                            </button>
                        </div>
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-gray-600 dark:text-gray-400">
                            {isLogin ? t('dont_have_account') : t('already_have_account')} {' '}
                            <button
                                onClick={toggleMode}
                                className="text-cyan-600 dark:text-neon-cyan hover:underline font-medium"
                            >
                                {isLogin ? t('sign_up') : t('log_in')}
                            </button>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;
