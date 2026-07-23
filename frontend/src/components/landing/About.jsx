import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <section id="about" className="py-24 bg-[#000000] font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
                                Our philosophy.
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed font-medium">
                                We believe wealth management shouldn't be complicated. Cresta was built with a singular focus: to provide absolute clarity and data-dense precision to modern investors.
                            </p>
                            <p className="text-gray-400 text-lg leading-relaxed font-medium mt-4">
                                By combining clean design with powerful financial engineering, we provide a unified platform that helps you understand, protect, and grow your assets with absolute clarity. No noise, just precision.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bento-panel bg-[#0A0A0A] border border-[#222222] p-8 rounded-2xl"
                    >
                         <h3 className="text-lg font-semibold text-white mb-4">Our Commitment</h3>
                         <ul className="space-y-4">
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 shrink-0"></div>
                                <p className="text-sm text-gray-400">Absolute transparency in all algorithms and risk assessments.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 shrink-0"></div>
                                <p className="text-sm text-gray-400">Continuous innovation to keep you ahead of the market.</p>
                            </li>
                         </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default About;
