import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../common/Logo';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-[#000000]/80 backdrop-blur-xl border-b border-[#222222] py-4'
                    : 'bg-transparent py-6 border-b border-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <Logo className="w-6 h-6 group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            Cresta
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <a
                            href="#features"
                            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Features
                        </a>

                        <a
                            href="#about"
                            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            About
                        </a>

                        <Link
                            to="/auth"
                            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Login
                        </Link>

                        <Link
                            to="/dashboard"
                            className="premium-button premium-button-primary"
                        >
                            Dashboard
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-white"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#0A0A0A] border-b border-[#222222] absolute w-full left-0 top-full shadow-2xl p-6">
                    <div className="flex flex-col gap-6">

                        <a
                            href="#features"
                            className="text-lg font-medium text-white hover:text-gray-300"
                        >
                            Features
                        </a>

                        <a
                            href="#about"
                            className="text-lg font-medium text-white hover:text-gray-300"
                        >
                            About
                        </a>

                        <Link
                            to="/auth"
                            className="text-lg font-medium text-white hover:text-gray-300"
                        >
                            Login
                        </Link>

                        <Link
                            to="/dashboard"
                            className="w-full premium-button premium-button-primary justify-center py-4 text-base"
                        >
                            Dashboard
                        </Link>

                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;