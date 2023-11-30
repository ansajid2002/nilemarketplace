// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(initReactI18next)
  // .use(LanguageDetector)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'en', // Default language
    // Set up a translation backend if needed (e.g., using translation API)
    // backend: ...

    // Add language resources
    resources: {
      en: {
        translation: require('../locales/en.json'),
      },
      
      am: {
        translation: require('../locales/am.json'),
      },
      ar: {
        translation: require('../locales/ar.json'),
      },
      fr: {
        translation: require('../locales/fr.json'),
      },
      so: {
        translation: require('../locales/so.json'),
      },
      sw: {
        translation: require('../locales/sw.json'),
      },
      hi: {
        translation: require('../locales/hi.json'),
      },
      // Add more language resources as needed
    },
  });

export default i18n;



