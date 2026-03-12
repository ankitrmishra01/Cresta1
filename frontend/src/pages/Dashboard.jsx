import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import PortfolioChart from '../components/dashboard/PortfolioChart';
import AssetAllocation from '../components/dashboard/AssetAllocation';
import AIInsights from '../components/dashboard/AIInsights';
import { DollarSign, Briefcase, Activity } from 'lucide-react';
import MarketTicker from '../components/dashboard/MarketTicker';
import { motion } from 'framer-motion';
import Skeleton from '../components/common/Skeleton';
import HoldingsTable from '../components/dashboard/HoldingsTable';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const Dashboard = () => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-8">
                    {/* Ticker Skeleton */}
                    <Skeleton className="w-full h-10 mb-8" />

                    {/* Stats Row Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-40 w-full" />
                        ))}
                    </div>

                    {/* Main Grid Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
                        <div className="lg:col-span-2 h-full">
                            <Skeleton className="w-full h-[400px] lg:h-full" />
                        </div>
                        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
                            <Skeleton className="w-full h-1/2" />
                            <Skeleton className="w-full h-1/2" />
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }
    return (
        <DashboardLayout>
            <MarketTicker />
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stats Row */}
                    <motion.div variants={itemVariants} className="lg:col-span-1">
                        <StatCard
                            title={t('total_invested')}
                            value="₹24,500.00"
                            change="+12.5%"
                            isPositive={true}
                            icon={DollarSign}
                            delay={0}
                        />
                    </motion.div>
                    <motion.div variants={itemVariants} className="lg:col-span-1">
                        <StatCard
                            title={t('current_value')}
                            value="₹28,340.50"
                            change="+5.2%"
                            isPositive={true}
                            icon={Briefcase}
                            delay={0}
                        />
                    </motion.div>
                    <motion.div variants={itemVariants} className="lg:col-span-1">
                        <StatCard
                            title={t('ai_risk_score')}
                            value="Low / 24"
                            change="-2.0%"
                            isPositive={true}
                            icon={Activity}
                            delay={0}
                        />
                    </motion.div>
                    <motion.div variants={itemVariants} className="lg:col-span-1">
                        {/* Extra stat or maybe a quick action */}
                        <StatCard
                            title={t('ytd_return')}
                            value="+₹3,840.50"
                            change="+15.6%"
                            isPositive={true}
                            icon={DollarSign}
                            delay={0}
                        />
                    </motion.div>
                </div>

                {/* Main Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
                    {/* Main Chart Area */}
                    <div className="lg:col-span-2 h-full">
                        <PortfolioChart delay={0.5} />
                    </div>

                    {/* Right Side Panel (Asset Allocation + Insights) */}
                    <div className="lg:col-span-1 flex flex-col gap-6 h-full">
                        <div className="flex-1">
                            <AssetAllocation delay={0.6} />
                        </div>
                        <div className="flex-1">
                            <AIInsights delay={0.7} />
                        </div>
                    </div>
                </motion.div>

                {/* Holdings Table */}
                <motion.div variants={itemVariants}>
                    <HoldingsTable />
                </motion.div>
            </motion.div>
        </DashboardLayout>
    );
};

export default Dashboard;
