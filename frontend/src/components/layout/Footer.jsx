import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="py-8 border-t border-gray-200 dark:border-white/10 mt-auto relative z-10 bg-white/80 dark:bg-fintech-primary/80 backdrop-blur-md transition-colors duration-300">
            <div className="container mx-auto px-6 text-center text-gray-600 dark:text-gray-500">
                <p>&copy; {new Date().getFullYear()} Cresta AI. {t('rights_reserved')}</p>
                <div className="flex justify-center space-x-6 mt-4">
                    <a href="#" className="hover:text-cyan-600 dark:hover:text-neon-cyan transition-colors">{t('privacy_policy')}</a>
                    <a href="#" className="hover:text-cyan-600 dark:hover:text-neon-cyan transition-colors">{t('terms_of_service')}</a>
                    <a href="#" className="hover:text-cyan-600 dark:hover:text-neon-cyan transition-colors">{t('contact')}</a>
                </div>
            </div>
        </footer>
    );

};

export default Footer;
