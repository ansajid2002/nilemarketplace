// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { AdminUrl } from '../constant';

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
      // Add more language resources as needed
    },
  });

  const fetchTranslationResources = async (language) => {
    try {
   
      // Fetch translation data from your backend based on the provided language
      const response = await fetch(`${AdminUrl}/api/translations/${language}`);
      const translationData = await response.json();

      // Add the fetched translation data to i18n resources
      i18n.addResourceBundle(language, 'translation', translationData);
  
      // Set the language
      i18n.changeLanguage(language);
    } catch (error) {
      console.error('Error fetching translation resources:', error);
    }
  };
  
  export const changeLanguage = async (language) => {
    // If the language is different from the current one, fetch new translation resources
    if (language !== i18n.language) {
      await fetchTranslationResources(language);
    }
  };

export default i18n;



