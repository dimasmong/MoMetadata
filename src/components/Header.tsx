import React from 'react';
import { ShieldCheck, Moon, Sun, Globe, TableProperties, Settings } from 'lucide-react';
import { useLanguage } from '../i18n';
import { useTheme } from '../context/ThemeContext';
import { GithubIcon } from './common/GithubIcon';

export interface HeaderProps {
  onOpenCapabilities: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCapabilities, onOpenSettings }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'id' : 'en');
  };

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else setTheme('light');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              MoMetadata
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              v{t.app.version}
            </span>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenCapabilities}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700"
            title={t.nav.capabilities}
          >
            <TableProperties className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden md:inline">{t.nav.capabilities}</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700"
            title={t.nav.settings}
            aria-label={t.nav.settings}
          >
            <Settings className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span className="hidden md:inline">{t.nav.settings}</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" aria-hidden="true" />

          {/* Language Selector */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            aria-label={`Switch language. Current: ${language.toUpperCase()}`}
            title="Switch Language (English / Bahasa Indonesia)"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/dimasmong/MoMetadata"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={t.nav.github}
            title={t.nav.github}
          >
            <GithubIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
