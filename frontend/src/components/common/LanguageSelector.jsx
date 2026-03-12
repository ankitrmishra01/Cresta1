import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="relative group">
            <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-2">
                <Globe size={20} />
                <span className="text-sm font-medium uppercase">{i18n.language}</span>
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-fintech-card border border-white/10 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50 backdrop-blur-xl">
                <div className="py-1">
                    <button
                        onClick={() => changeLanguage('en')}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${i18n.language === 'en' ? 'text-neon-cyan' : 'text-gray-300'}`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => changeLanguage('hi')}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${i18n.language === 'hi' ? 'text-neon-cyan' : 'text-gray-300'}`}
                    >
                        हिंदी (Hindi)
                    </button>
                    <button
                        onClick={() => changeLanguage('gu')}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${i18n.language === 'gu' ? 'text-neon-cyan' : 'text-gray-300'}`}
                    >
                        ગુજરાતી (Gujarati)
                    </button>
                    <button
                        onClick={() => changeLanguage('pa')}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${i18n.language === 'pa' ? 'text-neon-cyan' : 'text-gray-300'}`}
                    >
                        ਪੰਜਾਬੀ (Punjabi)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LanguageSelector;
