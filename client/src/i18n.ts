import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslation from './locales/en.json';
import itTranslation from './locales/it.json';

// Configure i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      it: {
        translation: itTranslation
      }
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    // Common namespace used around the app
    defaultNS: 'translation',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator'],
      
      // Keys or params to lookup language from
      lookupLocalStorage: 'i18nextLng',
      
      // Cache language detection
      caches: ['localStorage'],
      
      // Optional expire and domain for set cookie
      cookieExpirationDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years
    }
  });

export default i18n;