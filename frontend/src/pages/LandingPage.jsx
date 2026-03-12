import React from 'react';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Footer from '../components/layout/Footer';

import BackgroundEffects from '../components/common/BackgroundEffects';

const LandingPage = () => {
    return (
        <div className="min-h-screen selection:bg-cyan-300/30 dark:selection:bg-neon-cyan/30 transition-colors duration-300">
            <BackgroundEffects />

            <Navbar />
            <main>
                <Hero />
                <Features />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
