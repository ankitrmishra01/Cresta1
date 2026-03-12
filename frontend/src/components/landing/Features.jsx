import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Features = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: <Shield className="w-8 h-8 text-cyan-600 dark:text-neon-cyan" />,
            title: t('feature_risk_profiling_title'),
            description: t('feature_risk_profiling_desc')
        },
        {
            icon: <Activity className="w-8 h-8 text-blue-600 dark:text-neon-blue" />,
            title: t('feature_market_data_title'),
            description: t('feature_market_data_desc')
        },
        {
            icon: <RefreshCw className="w-8 h-8 text-emerald-600 dark:text-neon-emerald" />,
            title: t('feature_auto_rebalancing_title'),
            description: t('feature_auto_rebalancing_desc')
        }
    ];

    return (
        <section className="py-24 relative z-10">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('intelligent_features')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {t('features_subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10 }}
                            className="glass-panel p-8 rounded-2xl hover:border-cyan-500/30 dark:hover:border-neon-cyan/30 transition-colors group cursor-pointer"
                        >
                            <div className="mb-6 p-4 rounded-full bg-blue-50 dark:bg-white/5 w-fit group-hover:bg-blue-100 dark:group-hover:bg-white/10 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-4 group-hover:text-cyan-600 dark:group-hover:text-neon-cyan transition-colors">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
