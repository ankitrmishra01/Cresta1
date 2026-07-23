import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen app-bg flex font-sans">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            
            <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-200 w-full relative">
                <DashboardHeader toggleSidebar={toggleSidebar} />
                
                <main className="flex-1 p-4 lg:p-6 w-full max-w-7xl mx-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
