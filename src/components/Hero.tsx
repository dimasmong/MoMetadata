import React from 'react';
import { ShieldCheck, Lock, ArrowDown } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';

interface HeroProps {
  onScrollToWorkspace: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToWorkspace }) => {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden pt-8 pb-6 sm:pt-12 sm:pb-8 border-b border-slate-200/80 dark:border-slate-800/80">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#243A73]/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Privacy Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#243A73]/10 dark:bg-blue-400/15 text-[#243A73] dark:text-blue-300 border border-[#243A73]/20 dark:border-blue-400/30 mb-4 shadow-xs">
          <Lock className="w-3.5 h-3.5 text-[#243A73] dark:text-blue-300" />
          <span>{t.uploadPrivacyBadge}</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
          {t.heroTitle}{' '}
          <span className="text-[#243A73] dark:text-blue-400 block sm:inline">
            {t.heroHighlight}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6 leading-relaxed font-normal">
          {t.heroSubtitle}
        </p>

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onScrollToWorkspace}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#243A73] hover:bg-[#1B2D5A] dark:hover:bg-[#304B91] shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            {t.heroCta}
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
