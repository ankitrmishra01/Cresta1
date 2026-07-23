import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Shield, Zap, Target, Globe, Smartphone } from 'lucide-react';

const features = [
    {
        icon: <LineChart size={20} />,
        title: 'Advanced Analytics',
        description: 'Deep insights into your portfolio performance with institutional-grade charting and metrics.',
    },
    {
        icon: <Shield size={20} />,
        title: 'Risk Management',
        description: 'Automated risk assessment and dynamic asset allocation to protect your downside.',
    },
    {
        icon: <Zap size={20} />,
        title: 'AI Advisor',
        description: 'Proprietary machine learning models that analyze market sentiment and identify opportunities.',
    },
    {
        icon: <Target size={20} />,
        title: 'Goal Tracking',
        description: 'Set precise financial milestones and let our algorithms optimize your path to success.',
    },
    {
        icon: <Globe size={20} />,
        title: 'Global Markets',
        description: 'Access real-time data across domestic indices, US markets, and global commodities.',
    },
    {
        icon: <Smartphone size={20} />,
        title: 'Seamless Experience',
        description: 'A beautifully crafted interface that works flawlessly across all your devices.',
    }
];

const Features = () => {
    return (
        <section id="features" className="py-24 bg-[#000000] relative overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-left mb-16 max-w-2xl">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold tracking-[-0.03em] text-white mb-6 leading-tight"
                    >
                        Infrastructure designed<br />
                        for scale and precision.
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-400 font-medium"
                    >
                        Every component is engineered to deliver institutional-grade performance and uncompromising reliability.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 auto-rows-[250px] gap-4">
                    {features.map((feature, index) => {
                        let spanClasses = "";
                        // Asymmetrical layout logic
                        if (index === 0) spanClasses = "md:col-span-2 md:row-span-1";
                        else if (index === 2) spanClasses = "md:col-span-1 md:row-span-2";
                        else if (index === 5) spanClasses = "md:col-span-2 md:row-span-1";
                        else spanClasses = "md:col-span-1 md:row-span-1";

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`p-8 bento-panel group ${spanClasses} flex flex-col justify-between hover-lift relative overflow-hidden`}
                            >
                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/[0.08] blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                <div className="w-10 h-10 bg-[#111111] border border-[#222222] rounded-lg flex items-center justify-center text-white mb-6 relative z-10 group-hover:scale-110 group-hover:border-white/20 transition-all duration-300">
                                    {feature.icon}
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{feature.title}</h3>
                                    <p className="text-gray-400 text-[13px] leading-relaxed max-w-sm group-hover:text-gray-300 transition-colors duration-300">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Features;
