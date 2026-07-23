import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import CountUp from '../common/CountUp';

const StatCard = ({ title, value, change, isPositive, icon: Icon, delay, subtitle }) => {
    const parseValue = (str) => {
        if (!str || typeof str !== 'string') return { prefix: '', val: 0, suffix: '' };
        const match = str.match(/^([^\d-]*)(-?[\d,.]+)([^\d]*)$/);
        if (match) {
            return {
                prefix: match[1],
                val: parseFloat(match[2].replace(/,/g, '')),
                suffix: match[3]
            };
        }
        return { prefix: '', val: NaN, suffix: '' };
    };

    const { prefix, val, suffix } = parseValue(value);
    const decimalPlaces = val.toString().includes('.') ? val.toString().split('.')[1].length : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay, ease: "easeOut" }}
            className="premium-panel p-5 flex flex-col justify-between min-h-[120px] hover-glow hover-lift"
        >
            <div className="flex justify-between items-start w-full">
                <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <div className="w-8 h-8 rounded flex items-center justify-center text-white bg-white/5 border border-white/10">
                    <Icon size={16} strokeWidth={2} />
                </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-white">
                        {isNaN(val) || val === 0 ? value : (
                            <CountUp value={val} prefix={prefix} suffix={suffix} decimals={decimalPlaces} duration={1.5} />
                        )}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
                
                <div className={`flex items-center text-[12px] font-medium
                        ${isPositive 
                        ? 'text-financial-profit dark:text-financial-profitDark' 
                        : 'text-financial-loss dark:text-financial-lossDark'}
                    `}>
                        {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                        {change}
                </div>
            </div>
        </motion.div>
    );
};

export default StatCard;
