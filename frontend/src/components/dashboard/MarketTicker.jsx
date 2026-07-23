import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const defaultIndices = [
    { name: 'NIFTY 50', value: '22,530.75', change: '+124.50', percent: '+0.56%' },
    { name: 'SENSEX', value: '74,248.20', change: '+350.80', percent: '+0.47%' },
    { name: 'BANK NIFTY', value: '48,125.10', change: '-85.30', percent: '-0.18%' },
    { name: 'NIFTY IT', value: '36,450.00', change: '+450.20', percent: '+1.25%' },
    { name: 'NASDAQ', value: '16,275.40', change: '+85.60', percent: '+0.53%' },
    { name: 'S&P 500', value: '5,210.85', change: '+15.20', percent: '+0.29%' },
    { name: 'GOLD', value: '71,250.00', change: '+150.00', percent: '+0.21%' },
    { name: 'USD/INR', value: '83.45', change: '-0.05', percent: '-0.06%' },
];

const MarketTicker = () => {
    const [indices, setIndices] = React.useState(defaultIndices);

    React.useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const response = await fetch('/api/market-status/');
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) setIndices(data);
                }
            } catch (error) {
                // Ignore error, fallback to defaults
            }
        };

        fetchMarketData();
        const interval = setInterval(fetchMarketData, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-black border-b border-[#222222] overflow-hidden py-2 flex items-center">
            <motion.div
                className="flex gap-10 px-4"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
                style={{ width: "fit-content" }}
            >
                {[...indices, ...indices].map((index, i) => {
                    const changeStr = String(index.change || '');
                    const isPositive = changeStr.startsWith('+');
                    return (
                        <div key={i} className="flex items-center gap-2.5 text-[12px] uppercase tracking-wide whitespace-nowrap">
                            <span className="font-semibold text-gray-400">{index.name}</span>
                            <span className="font-mono text-white font-medium">{index.value}</span>
                            <span className={`flex items-center font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                {isPositive ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                                {index.percent}
                            </span>
                        </div>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default MarketTicker;
