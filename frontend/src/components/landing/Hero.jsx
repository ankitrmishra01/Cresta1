import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Typewriter from '../common/Typewriter';

const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            {/* Background handled by BackgroundEffects.jsx */}
            <div className="absolute inset-0 z-0 pointer-events-none"></div>

            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">

                <div className="text-left space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-500/30 dark:border-neon-cyan/30 bg-cyan-50 dark:bg-neon-cyan/10 text-cyan-600 dark:text-neon-cyan text-sm mb-6">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            <span>Next Gen Investing</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-4 min-h-[160px] md:min-h-[220px]">
                            Your Wealth, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-neon-cyan dark:to-neon-blue text-glow block mt-2">
                                <Typewriter text="Powered by Intelligence" delay={50} />
                            </span>
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed">
                            Experience the future of asset management with our AI-driven robo-advisory system. Real-time analysis, automated rebalancing, and personalized growth strategies.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <Link
                            to="/auth"
                            state={{ isSignUp: true }}
                            className="glass-btn px-8 py-4 rounded-xl font-semibold text-cyan-900 dark:text-white flex items-center justify-center group"
                        >
                            Get Started
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/markets"
                            className="px-8 py-4 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:text-cyan-900 dark:hover:text-white border border-transparent hover:border-cyan-900/20 dark:hover:border-white/20 transition-all flex items-center justify-center"
                        >
                            Explore Markets
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="relative h-[400px] w-full flex items-center justify-center"
                >
                    <div className="relative w-64 h-64 md:w-80 md:h-80">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border border-gray-200 dark:border-white/10 border-t-cyan-500 dark:border-t-neon-cyan border-b-blue-500 dark:border-b-neon-blue shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                        >
                        </motion.div>

                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-[20px] rounded-full border border-gray-100 dark:border-white/5 border-l-emerald-500 dark:border-l-neon-emerald border-r-cyan-500 dark:border-r-neon-cyan"
                        >
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/4 left-1/4 p-4 glass-panel rounded-lg border-l-4 border-l-cyan-500 dark:border-l-neon-cyan"
                        >
                            <div className="text-xs text-gray-500 dark:text-gray-400">Portfolio Growth</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">+24.5%</div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-1/4 right-0 p-4 glass-panel rounded-lg border-l-4 border-l-emerald-500 dark:border-l-neon-emerald"
                        >
                            <div className="text-xs text-gray-500 dark:text-gray-400">Risk Level</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">Optimal</div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
