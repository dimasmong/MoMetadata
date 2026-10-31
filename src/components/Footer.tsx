import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { useLanguage } from '../i18n';
import { GithubIcon } from './common/GithubIcon';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 mt-auto py-8 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600/10 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span>{t.app.footer}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.app.privacyBadge}</span>
          </div>

          <a
            href="https://github.com/dimasmong/MoMetadata"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
