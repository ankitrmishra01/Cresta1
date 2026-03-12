import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const AssetAllocation = ({ delay }) => {
    const { t } = useTranslation();
    const assets = [
        { name: 'Stocks', value: 55, color: '#22D3EE' }, // Neon Cyan
        { name: 'Bonds', value: 30, color: '#3B82F6' }, // Neon Blue
        { name: 'Crypto', value: 15, color: '#34D399' }, // Neon Emerald
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay }}
            className="glass-panel p-6 rounded-2xl flex flex-col"
        >
            <h3 className="text-lg font-bold text-white mb-6">{t('asset_allocation')}</h3>

            <div className="flex-1 flex flex-col items-center justify-center relative">
                {/* Simple Donut Chart Representation using conic-gradient */}
                <div
                    className="w-48 h-48 rounded-full relative mb-8 shadow-[0_0_30px_rgba(0,0,0,0.3)] animate-[spin_60s_linear_infinite] hover:pause"
                    style={{
                        background: `conic-gradient(
                    ${assets[0].color} 0% 55%, 
                    ${assets[1].color} 55% 85%, 
                    ${assets[2].color} 85% 100%
                )`
                    }}
                >
                    <div className="absolute inset-4 bg-fintech-card rounded-full flex items-center justify-center">
                        <div className="text-center">
                            <span className="text-gray-400 text-xs uppercase tracking-wider">{t('total')}</span>
                            <div className="text-xl font-bold text-white">₹24,500</div>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="w-full space-y-3">
                    {assets.map((asset) => (
                        <div key={asset.name} className="flex items-center justify-between text-sm group cursor-default">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }}></span>
                                <span className="text-gray-300 group-hover:text-white transition-colors">{asset.name}</span>
                            </div>
                            <span className="font-semibold text-white">{asset.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default AssetAllocation;
