import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sun, 
  Moon, 
  Languages, 
  Menu, 
  X
} from 'lucide-react';
import { GithubIcon } from './ui/GithubIcon';
import { useLanguage } from '../i18n/useLanguage';
import { useTheme } from '../themes/useTheme';

interface HeaderProps {
  onNavigateSection?: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateSection }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'workspace-section', label: t.navWorkspace },
    { id: 'features-section', label: t.navFeatures },
    { id: 'capability-section', label: t.navCapability },
    { id: 'faq-section', label: t.navFaq },
    { id: 'attribution-section', label: t.navAttribution },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('workspace-section')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#243A73] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-blue-200" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Mo<span className="text-[#243A73] dark:text-blue-400">Metadata</span>
            </span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium hidden sm:inline">
              Privacy & Metadata Toolkit
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/60 p-1 rounded-full border border-slate-200/80 dark:border-slate-700/60">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-full text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Tools: Language, Theme, GitHub */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title={t.langToggle}
            aria-label={t.langToggle}
          >
            <Languages className="w-3.5 h-3.5 text-[#243A73] dark:text-[#8EA9ED]" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title={t.themeToggle}
            aria-label={t.themeToggle}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* GitHub repo */}
          <a
            href="https://github.com/dimasmong/MoMetadata"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="GitHub Repository"
            aria-label="GitHub Repository"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131D32] px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">Language: {language === 'en' ? 'English' : 'Bahasa Indonesia'}</span>
            <a
              href="https://github.com/dimasmong/MoMetadata"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              GitHub
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
