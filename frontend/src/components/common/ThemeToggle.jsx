import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2.5 rounded-xl bg-gray-100/70 dark:bg-white/[0.04] hover:bg-gray-200/70 dark:hover:bg-white/[0.08] border border-transparent hover:border-gray-200/50 dark:hover:border-white/[0.06] transition-all duration-300 focus:outline-none"
            aria-label="Toggle Theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                    {theme === 'dark' ? (
                        <Moon className="w-[18px] h-[18px] text-emerald-400" />
                    ) : (
                        <Sun className="w-[18px] h-[18px] text-amber-500" />
                    )}
                </motion.div>
            </AnimatePresence>
        </button>
    );
};

export default ThemeToggle;
