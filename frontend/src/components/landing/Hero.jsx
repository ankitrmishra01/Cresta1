import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
                    {/* Typography & CTAs */}
                    <div className="text-center w-full flex flex-col items-center">


                        <motion.h1 
                            initial={{ opacity: 0, y: 30, backgroundPosition: "0% 50%" }}
                            animate={{ opacity: 1, y: 0, backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                            transition={{ 
                                opacity: { duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] },
                                y: { duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] },
                                backgroundPosition: { duration: 8, repeat: Infinity, ease: "linear" }
                            }}
                            className="text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-bold tracking-[-0.04em] leading-[1.05] mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-400 to-white"
                            style={{ backgroundSize: '200% auto' }}
                        >
                            The financial<br />
                            operating system.
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="text-lg md:text-xl text-gray-400 mb-12 max-w-lg font-medium leading-relaxed"
                        >
                            A radical new approach to wealth management. Built on institutional-grade infrastructure with breathtaking precision.
                        </motion.p>

                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-5"
                        >
                            <Link 
                                to="/auth" 
                                className="premium-button premium-button-primary w-full sm:w-auto px-8 py-3.5 text-[14px] group"
                            >
                                Start Building
                                <div className="bg-black text-white rounded-full p-0.5 group-hover:bg-black group-hover:text-white transition-colors ml-2">
                                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </Link>
                            <a 
                                href="#features" 
                                className="text-[14px] font-semibold text-gray-400 hover:text-white transition-colors"
                            >
                                Explore Documentation
                            </a>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
