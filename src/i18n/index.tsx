import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './en';
import { id } from './id';
import type { Language } from '../types/settings';

type TranslationType = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
  formatNumber: (value: number) => string;
  formatDate: (date: Date | string | number) => string;
  formatBytes: (bytes: number) => string;
}

const translations: Record<Language, TranslationType> = {
  en,
  id,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mometadata_lang');
    if (saved === 'en' || saved === 'id') return saved;
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mometadata_lang', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  const formatNumber = (value: number): string => {
    const locale = language === 'id' ? 'id-ID' : 'en-US';
    return new Intl.NumberFormat(locale).format(value);
  };

  const formatDate = (dateInput: Date | string | number): string => {
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return String(dateInput);
      const locale = language === 'id' ? 'id-ID' : 'en-US';
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    } catch {
      return String(dateInput);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return `0 ${t.common.bytes}`;
    const k = 1024;
    const sizes = [t.common.bytes, t.common.kb, t.common.mb, t.common.gb];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return `${formatNumber(formatted)} ${sizes[i] || t.common.bytes}`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatNumber,
        formatDate,
        formatBytes,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
