import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';
import { FAQ_ITEMS } from '../../data/faqData';

export const FaqSection: React.FC = () => {
  const { t, language } = useLanguage();
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-1': true, // first question expanded by default
    'faq-3': true
  });

  const toggleItem = (id: string) => {
    setOpenIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <section id="faq-section" className="py-12 sm:py-16 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#243A73] dark:text-[#8EA9ED]" />
            {t.faqHeading}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            {t.faqSubheading}
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => {
            const isOpen = !!openIds[item.id];
            return (
              <div
                key={item.id}
                className="rounded-2xl glass-card overflow-hidden border border-slate-200/80 dark:border-slate-800/80 transition-all duration-200"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.question[language]}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#243A73] dark:text-[#8EA9ED]' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                    {item.answer[language]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
