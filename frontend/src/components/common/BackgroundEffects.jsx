import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const BackgroundEffects = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* 1. Base Grid Layer */}
            <div className="absolute inset-0 opacity-[0.1] dark:opacity-[0.15]">
                <div
                    className="absolute inset-0 bg-[linear-gradient(to_right,#0891b2_1px,transparent_1px),linear-gradient(to_bottom,#0891b2_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
                />
            </div>

            {/* 2. Ambient Gradient Blobs - Subtle and Professional */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px]"
                style={{
                    background: isDark
                        ? 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(8, 145, 178, 0.10) 0%, transparent 70%)'
                }}
            />

            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px]"
                style={{
                    background: isDark
                        ? 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(37, 99, 235, 0.10) 0%, transparent 70%)'
                }}
            />
        </div>
    );
};

export default BackgroundEffects;
