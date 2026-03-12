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
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchMarketData = async () => {
            try {
                // Use relative path so Vite proxy handles it
                const response = await fetch('/api/market-status/');
                if (!response.ok) {
                    throw new Error('Failed to fetch market data');
                }
                const data = await response.json();
                if (data && data.length > 0) {
                    setIndices(data);
                }
            } catch (error) {
                console.error('Error fetching market data:', error);
                // Keep default indices on error or maybe set a flag
            } finally {
                setLoading(false);
            }
        };

        fetchMarketData();

        // Refresh every 60 seconds
        const interval = setInterval(fetchMarketData, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-white/50 dark:bg-fintech-card/30 border-b border-gray-200 dark:border-white/10 overflow-hidden py-2 backdrop-blur-sm transition-colors duration-300">
            <div className="flex whitespace-nowrap">
                {/* We double the list to create a seamless loop */}
                <motion.div
                    className="flex gap-8 px-4"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 30, // Adjust speed (seconds for full loop)
                    }}
                    style={{ width: "fit-content" }}
                >
                    {[...indices, ...indices].map((index, i) => {
                        const changeStr = String(index.change || '');
                        const isPositive = changeStr.startsWith('+');
                        return (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{index.name}</span>
                                <span className="font-mono text-gray-900 dark:text-white">{index.value}</span>
                                <span className={`flex items-center text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                                    {index.change} ({index.percent})
                                </span>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
};

export default MarketTicker;
