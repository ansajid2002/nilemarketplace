// TranslationContext.js
import React, { createContext, useContext } from 'react';
import { translateText } from './TranslationService';

const TranslationContext = createContext();

export function useTranslation() {
  return useContext(TranslationContext);
}

export function TranslationProvider({ children }) {
  const translate = async (text, targetLanguage) => {
    try {
      const translation = await translateText(text, targetLanguage);
      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const contextValue = {
    translate,
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}
