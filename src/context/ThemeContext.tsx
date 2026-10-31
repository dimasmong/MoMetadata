import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppTheme } from '../types/settings';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('mometadata_theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'light'; // Light is default per requirement
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateDarkState = () => {
      let activeDark = false;
      if (theme === 'dark') {
        activeDark = true;
      } else if (theme === 'system') {
        activeDark = mediaQuery.matches;
      } else {
        activeDark = false;
      }

      setIsDark(activeDark);
      if (activeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateDarkState();

    const listener = () => {
      if (theme === 'system') updateDarkState();
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('mometadata_theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
