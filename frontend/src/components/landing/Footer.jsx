import React, { useState } from 'react';
import { Twitter, Linkedin, Github, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { useToast } from '../../context/ToastContext';

const Footer = () => {
    const { showToast } = useToast();
    const [showFounders, setShowFounders] = useState(false);
    const founders = [
        { name: 'Ankit', email: 'ankitrmishra01@gmail.com' },
        { name: 'Shivam', email: 'panchalshivam436@gmail.com' },
        { name: 'Om', email: 'om2317161@gmail.com' },
        { name: 'Shubham', email: 'shubhamjhadhoni@gmail.com' },
    ];

    const handleCopyEmail = async (email) => {
        try {
            await navigator.clipboard.writeText(email);
            showToast(`Copied ${email}`, 'success');
        } catch (error) {
            console.error('Failed to copy email:', error);
            showToast('Could not copy email. Please copy manually.', 'error');
        }
    };

    return (
        <footer className="relative z-10 bg-black border-t border-[#222222] pt-16 pb-8 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 flex items-center justify-center">
                                <Logo className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-white">Cresta</span>
                        </div>
                        <p className="text-gray-500 text-[13px] leading-relaxed mb-6 font-medium">
                            Intelligent wealth management, engineered for the modern investor.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://x.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                                aria-label="Visit Cresta on X"
                            >
                                <Twitter size={18} />
                            </a>
                            <a
                                href="https://www.linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                                aria-label="Visit Cresta on LinkedIn"
                            >
                                <Linkedin size={18} />
                            </a>
                            <a
                                href="https://github.com/ankitrmishra01/Cresta"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                                aria-label="Visit Cresta on GitHub"
                            >
                                <Github size={18} />
                            </a>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-white text-sm mb-4">Platform</h4>
                        <ul className="space-y-3">
                            <li><a href="/#features" className="text-sm text-gray-500 hover:text-white transition-colors">Features</a></li>
                            <li><a href="/auth" className="text-sm text-gray-500 hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="/#about" className="text-sm text-gray-500 hover:text-white transition-colors">Security</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white text-sm mb-4">Company</h4>
                        <ul className="space-y-3">
                            <li><a href="/#about" className="text-sm text-gray-500 hover:text-white transition-colors">About Us</a></li>
                            <li><a href="https://www.linkedin.com/jobs/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-white transition-colors">Careers</a></li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setShowFounders((prev) => !prev)}
                                    className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-white transition-colors"
                                    aria-expanded={showFounders}
                                    aria-controls="founders-list"
                                >
                                    <span>Founders</span>
                                    {showFounders ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                            </li>
                            {showFounders && (
                                <li id="founders-list">
                                    <ul className="space-y-3">
                                        {founders.map((founder) => (
                                            <li key={founder.email} className="flex items-center justify-between gap-2">
                                                <a href={`mailto:${founder.email}`} className="text-sm text-gray-500 hover:text-white transition-colors">
                                                    {founder.name} - {founder.email}
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyEmail(founder.email)}
                                                    className="p-1 rounded text-gray-500 hover:text-white hover:bg-[#111111] transition-colors"
                                                    aria-label={`Copy ${founder.name} email`}
                                                    title={`Copy ${founder.name} email`}
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white text-sm mb-4">Legal</h4>
                        <ul className="space-y-3">
                            <li><Link to="/privacy-policy" className="text-sm text-gray-500 hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms-of-service" className="text-sm text-gray-500 hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                
                <div className="border-t border-[#222222] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-[12px] font-medium">
                        © {new Date().getFullYear()} Cresta Technologies Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-[12px] font-medium text-gray-400">
                        <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
