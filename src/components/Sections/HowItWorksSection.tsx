import React from 'react';
import { useLanguage } from '../../i18n/useLanguage';

export const HowItWorksSection: React.FC = () => {
  const { t } = useLanguage();

  const steps = [
    {
      num: '01',
      title: t.howStep1Title,
      desc: t.howStep1Desc
    },
    {
      num: '02',
      title: t.howStep2Title,
      desc: t.howStep2Desc
    },
    {
      num: '03',
      title: t.howStep3Title,
      desc: t.howStep3Desc
    },
    {
      num: '04',
      title: t.howStep4Title,
      desc: t.howStep4Desc
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.howHeading}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            {t.howSubheading}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl glass-card flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl font-black text-[#243A73]/40 dark:text-[#8EA9ED]/40 mb-2 block font-mono">
                  {st.num}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
