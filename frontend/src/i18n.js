import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Lazy-load translations — only English is bundled, others load on demand
const en = () => import('./locales/en.json');
const hi = () => import('./locales/hi.json');
const gu = () => import('./locales/gu.json');
const pa = () => import('./locales/pa.json');

const LOADERS = { en, hi, gu, pa };

// Start with English embedded for instant load
import enTranslations from './locales/en.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslations }
        },
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

// Lazy-load other languages when selected
export async function loadLanguage(lang) {
    if (lang === 'en') {
        i18n.changeLanguage('en');
        return;
    }

    if (!i18n.hasResourceBundle(lang, 'translation')) {
        const loader = LOADERS[lang];
        if (loader) {
            const module = await loader();
            i18n.addResourceBundle(lang, 'translation', module.default || module);
        }
    }
    i18n.changeLanguage(lang);
}

export default i18n;
