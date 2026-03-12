import React from 'react';
import Sidebar from './Sidebar';
import Header from './DashboardHeader';
import { Menu, X } from 'lucide-react'; // Import icons for mobile menu toggle


const DashboardLayout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-fintech-bg text-gray-900 dark:text-white flex transition-colors duration-300">
            <Sidebar />

            {/* Mobile Header & Sidebar Overlay */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-fintech-bg border-b border-gray-200 dark:border-white/10 px-4 py-3 flex items-center justify-between transition-colors duration-300">
                <span className="text-xl font-bold tracking-wide text-gray-900 dark:text-white">
                    <span className="text-neon-cyan">Cresta</span>
                </span>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>


            {/* Mobile Sidebar Content (basic implementation) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-gray-50 dark:bg-fintech-bg pt-16 px-4 md:hidden transition-colors duration-300">
                    <nav className="flex flex-col space-y-4">
                        <a href="/dashboard" className="text-lg font-medium text-cyan-600 dark:text-neon-cyan">Portfolio</a>
                        <a href="/markets" className="text-lg font-medium text-gray-600 dark:text-gray-400">Market Watch</a>
                        <a href="/risk" className="text-lg font-medium text-gray-600 dark:text-gray-400">Risk Assessment</a>
                        <a href="/settings" className="text-lg font-medium text-gray-600 dark:text-gray-400">Settings</a>
                    </nav>
                </div>
            )}


            <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
                {/* Background Orbs */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                    <div className="absolute top-[-5%] right-[10%] w-[30%] h-[30%] bg-neon-blue/5 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-[10%] left-[5%] w-[25%] h-[25%] bg-neon-cyan/5 rounded-full blur-[80px]"></div>
                </div>

                <Header />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 pt-16 md:pt-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
