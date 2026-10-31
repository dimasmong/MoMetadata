import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { GithubIcon } from './ui/GithubIcon';

interface FooterProps {
  onNavigateSection?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateSection }) => {
  const handleNavClick = (id: string) => {
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
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0B1020]/70 backdrop-blur-md py-8 sm:py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
          {/* Logo & Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#243A73] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-blue-200" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              Mo<span className="text-[#243A73] dark:text-[#8EA9ED]">Metadata</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-slate-700 dark:text-slate-300">
            <button
              onClick={() => handleNavClick('workspace-section')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Workspace
            </button>
            <button
              onClick={() => handleNavClick('features-section')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('capability-section')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Formats
            </button>
            <button
              onClick={() => handleNavClick('faq-section')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <button
              onClick={() => handleNavClick('attribution-section')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Attribution
            </button>
            <a
              href="https://github.com/dimasmong/MoMetadata"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              GitHub
            </a>
          </div>
        </div>

        {/* Exact Footer Text Requirements from Section 25 */}
        <div className="pt-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            © 2026 MoMetadata. Licensed under the MIT License.
          </p>
          <p className="font-medium text-slate-600 dark:text-slate-400">
            Crafted with ❤️ by Dimas Mong
          </p>
        </div>
      </div>
    </footer>
  );
};
