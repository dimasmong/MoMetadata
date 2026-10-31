import React from 'react';
import { Check, X } from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';
import { SUPPORTED_FORMAT_MATRIX } from '../../types/capabilities';

export const CapabilityMatrixSection: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <section id="capability-section" className="py-12 sm:py-16 border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.matrixHeading}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            {t.matrixSubheading}
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">{t.matrixColFormat}</th>
                <th className="py-3 px-3 text-center">{t.matrixColInspect}</th>
                <th className="py-3 px-3 text-center">{t.matrixColEdit}</th>
                <th className="py-3 px-3 text-center">{t.matrixColRemoveGps}</th>
                <th className="py-3 px-3 text-center">{t.matrixColRemoveAll}</th>
                <th className="py-3 px-3 text-center">{t.matrixColVerify}</th>
                <th className="py-3 px-4">{t.matrixColNotes}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {SUPPORTED_FORMAT_MATRIX.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {row.format}
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {row.extensions.map(e => `.${e}`).join(', ')}
                    </div>
                  </td>

                  {/* Inspect */}
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  </td>

                  {/* Edit */}
                  <td className="py-3 px-3 text-center">
                    {row.canEdit ? (
                      <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Remove GPS */}
                  <td className="py-3 px-3 text-center">
                    {row.canRemoveGps ? (
                      <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Remove All */}
                  <td className="py-3 px-3 text-center">
                    {row.canRemoveAll ? (
                      <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Verify */}
                  <td className="py-3 px-3 text-center">
                    {row.canVerify ? (
                      <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Notes */}
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed max-w-sm">
                    {row.notes[language]}
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
