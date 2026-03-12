import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import CountUp from '../common/CountUp';

const StatCard = ({ title, value, change, isPositive, icon: Icon, delay }) => {
    // Parse the value string (e.g., "₹24,500.00" -> prefix="₹", val=24500, suffix="")
    const parseValue = (str) => {
        const match = str.match(/^([^\d-]*)(-?[\d,.]+)([^\d]*)$/);
        if (match) {
            return {
                prefix: match[1],
                val: parseFloat(match[2].replace(/,/g, '')),
                suffix: match[3]
            };
        }
        return { prefix: '', val: 0, suffix: '' };
    };

    const { prefix, val, suffix } = parseValue(value);
    const decimalPlaces = (val.toString().split('.')[1] || '').length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:shadow-[0_10px_40px_-10px_rgba(34,211,238,0.2)] hover:border-cyan-400/30 dark:hover:border-neon-cyan/30 transition-all duration-300"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {/* If it's not a valid number parse, fallback to raw string, otherwise animate */}
                        {isNaN(val) ? value : (
                            <CountUp value={val} prefix={prefix} suffix={suffix} decimals={decimalPlaces} duration={2.5} />
                        )}
                    </h3>
                </div>
                <div className={`p-2.5 rounded-xl ${isPositive ? 'bg-neon-emerald/10 text-neon-emerald' : 'bg-neon-cyan/10 text-neon-cyan'}`}>
                    <Icon size={20} />
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
                <span className={`flex items-center font-semibold ${isPositive ? 'text-neon-emerald' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                    {change}
                </span>
                <span className="text-gray-500">vs last month</span>
            </div>

            {/* Decorative Glow */}
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-neon-cyan/5 rounded-full blur-2xl group-hover:bg-neon-cyan/10 transition-colors"></div>
        </motion.div>
    );
};

export default StatCard;
