import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Activity, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/common/Logo';
import { Link } from 'react-router-dom';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { login, register, googleLogin, loading, error } = useAuth();
    
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: (codeResponse) => googleLogin(codeResponse.access_token),
        onError: (error) => console.log('Google Login Failed:', error)
    });
    
    const quotes = [
        {
            text: "The stock market is a device for transferring money from the impatient to the patient.",
            author: "Warren Buffett"
        },
        {
            text: "An investment in knowledge pays the best interest.",
            author: "Benjamin Franklin"
        },
        {
            text: "In investing, what is comfortable is rarely profitable.",
            author: "Robert Arnott"
        },
        {
            text: "The individual investor should act consistently as an investor and not as a speculator.",
            author: "Ben Graham"
        }
    ];
    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % quotes.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLogin) {
            await login(formData.email, formData.password);
        } else {
            await register(formData.name, formData.email, formData.password);
        }
    };

    return (
        <div className="min-h-screen flex bg-black font-sans selection:bg-white/20">
            {/* Left Panel - Visuals */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#050505] overflow-hidden flex-col justify-between p-12 xl:p-16 border-r border-white/5">
                {/* Abstract Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent blur-[120px]" />
                    <div className="absolute bottom-[10%] -right-[20%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-white/5 to-transparent blur-[100px]" />
                </div>
                
                {/* Top Branding */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <Logo className="w-8 h-8" />
                        <span className="text-xl font-bold tracking-tight text-white">Cresta</span>
                    </div>
                </div>

                {/* Hero Content / Quotes */}
                <div className="relative z-10 max-w-lg mt-auto mb-24 min-h-[220px] flex flex-col justify-end">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={quoteIndex}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                        >
                            <h1 className="text-3xl lg:text-[34px] font-semibold tracking-tight text-white leading-[1.4] mb-8">
                                "{quotes[quoteIndex].text}"
                            </h1>
                            <div className="flex items-center gap-4">
                                <div className="h-[2px] w-8 bg-white/20 rounded-full"></div>
                                <span className="text-[17px] text-gray-400 font-medium tracking-wide">
                                    {quotes[quoteIndex].author}
                                </span>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                    
                    {/* Carousel Indicators */}
                    <div className="flex gap-2.5 mt-12">
                        {quotes.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setQuoteIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                                    idx === quoteIndex ? 'w-10 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'
                                }`}
                                aria-label={`Go to quote ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer/Trust */}
                <div className="relative z-10 flex items-center justify-between text-sm font-medium text-gray-600">
                    <span>© {new Date().getFullYear()} Cresta Capital</span>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 xl:px-32 relative">
                {/* Back to Home Button */}
                <div className="absolute top-8 right-6 sm:right-12">
                    <Link to="/" className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </div>

                <div className="absolute top-8 left-6 sm:left-12 lg:hidden">
                    <div className="flex items-center gap-3">
                        <Logo className="w-8 h-8" />
                        <span className="text-xl font-bold tracking-tight text-white">Cresta</span>
                    </div>
                </div>

                <div className="w-full max-w-[420px] mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-10 text-left"
                    >
                        <h2 className="text-[32px] font-semibold tracking-tight text-white mb-2">
                            {isLogin ? 'Welcome back' : 'Create account'}
                        </h2>
                        <p className="text-gray-400 text-[15px]">
                            {isLogin ? 'Enter your credentials to access your portfolio.' : 'Start managing your wealth intelligently.'}
                        </p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        <motion.form 
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5" 
                            onSubmit={handleSubmit}
                        >
                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-gray-300 ml-1">
                                        Full Name
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <User className="h-[18px] w-[18px] text-gray-500 group-focus-within:text-white transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full h-12 pl-11 pr-4 bg-[#0F0F0F] border border-[#222] rounded-xl text-white text-[15px] focus:outline-none focus:border-white/30 focus:bg-[#151515] transition-all placeholder:text-gray-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-gray-300 ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className="h-[18px] w-[18px] text-gray-500 group-focus-within:text-white transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full h-12 pl-11 pr-4 bg-[#0F0F0F] border border-[#222] rounded-xl text-white text-[15px] focus:outline-none focus:border-white/30 focus:bg-[#151515] transition-all placeholder:text-gray-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-gray-300 ml-1">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-[18px] w-[18px] text-gray-500 group-focus-within:text-white transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full h-12 pl-11 pr-4 bg-[#0F0F0F] border border-[#222] rounded-xl text-white text-[15px] focus:outline-none focus:border-white/30 focus:bg-[#151515] transition-all placeholder:text-gray-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[14px] text-red-400 font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl text-[15px] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                                >
                                    {loading ? 'Authenticating...' : (isLogin ? 'Sign in' : 'Create account')}
                                    {!loading && <ArrowRight size={18} className="text-black/70" />}
                                </button>
                            </div>

                            <div className="flex items-center gap-4 my-4">
                                <div className="h-[1px] flex-1 bg-white/10"></div>
                                <span className="text-[13px] text-gray-500 font-medium">OR</span>
                                <div className="h-[1px] flex-1 bg-white/10"></div>
                            </div>
                            
                            <button
                                type="button"
                                onClick={() => handleGoogleLogin()}
                                disabled={loading}
                                className="w-full h-12 bg-transparent hover:bg-white/5 border border-[#333] text-white font-medium rounded-xl text-[15px] flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Continue with Google
                            </button>
                        </motion.form>
                    </AnimatePresence>


                    <div className="mt-8 text-left">
                        <p className="text-gray-500 text-[15px]">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setFormData({ name: '', email: '', password: '' });
                                }}
                                className="ml-2 font-medium text-white hover:text-gray-300 transition-colors"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
