import React from 'react';
import { ExternalLink, ShieldCheck, FileCode } from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';
import { ATTRIBUTION_ITEMS } from '../../data/attributionData';

export const AttributionSection: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <section id="attribution-section" className="py-12 sm:py-16 border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
            <FileCode className="w-6 h-6 text-[#243A73] dark:text-[#8EA9ED]" />
            {t.attrHeading}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            {t.attrSubheading}
          </p>
        </div>

        {/* Explicit Model Notice */}
        <div className="mb-8 p-4 rounded-2xl glass-card border-[#243A73]/20 dark:border-blue-900/60 bg-[#243A73]/5 dark:bg-blue-950/20 text-center max-w-2xl mx-auto flex items-center justify-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#243A73] dark:text-[#8EA9ED] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            {t.attrModelNotice}
          </span>
        </div>

        {/* Libraries Table */}
        <div className="overflow-x-auto rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">{t.attrLibraryName}</th>
                <th className="py-3 px-3">{t.attrVersion}</th>
                <th className="py-3 px-3">{t.attrLicense}</th>
                <th className="py-3 px-4">{t.attrPurpose}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {ATTRIBUTION_ITEMS.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-[#243A73] dark:hover:text-blue-400 transition-colors"
                    >
                      {item.name}
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <div className="text-[10px] text-slate-400 font-normal">
                      Maintainer: {item.maintainer}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {item.version}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.license}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    {item.purpose[language]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
