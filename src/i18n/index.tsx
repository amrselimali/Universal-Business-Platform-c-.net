import React, { createContext, useContext, useState, useEffect } from 'react';
import arData from '../locales/ar.json';
import enData from '../locales/en.json';

type Language = 'ar' | 'en';

interface I18nContextType {
  language: Language;
  direction: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, ...args: (string | number)[]) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: arData as Record<string, string>,
  en: enData as Record<string, string>,
};

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ubp_lang');
    return saved === 'en' ? 'en' : 'ar';
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('ubp_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: string, ...args: (string | number)[]): string => {
    const dict = translations[language] || translations.ar;
    let text = dict[key];
    if (text === undefined) {
      // Fallback to other language or raw key
      text = translations.ar[key] || translations.en[key] || key;
    }
    if (args.length > 0) {
      args.forEach((arg, index) => {
        text = text.replace(new RegExp(`\\{${index}\\}`, 'g'), String(arg));
      });
    }
    return text;
  };

  return (
    <I18nContext.Provider value={{ language, direction, setLanguage, toggleLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
