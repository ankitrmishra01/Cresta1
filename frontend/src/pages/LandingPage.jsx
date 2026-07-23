import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import About from '../components/landing/About';
import Footer from '../components/landing/Footer';
import BackgroundEffects from '../components/landing/BackgroundEffects';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="min-h-screen relative">
            <BackgroundEffects isDark={isDark} />
            <Navbar />
            <main className="relative z-10">
                <Hero />
                <Features />
                <About />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
