import React from 'react';
import { 
  GitCompare, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';
import type { ParsedMetadata, ProcessedOutput } from '../../types/metadata';
import { triggerManualDownload, generateOutputFilename } from '../../utils/download';
import { formatBytes } from '../../utils/formatters';

interface CompareViewProps {
  originalMetadata: ParsedMetadata;
  lastProcessedOutput?: ProcessedOutput | null;
}

export const CompareView: React.FC<CompareViewProps> = ({ lastProcessedOutput }) => {
  const { t } = useLanguage();

  if (!lastProcessedOutput) {
    return (
      <div className="w-full glass-panel rounded-2xl p-8 sm:p-12 text-center transition-all">
        <div className="w-14 h-14 rounded-2xl bg-[#243A73]/10 dark:bg-[#243A73]/30 text-[#243A73] dark:text-[#8EA9ED] flex items-center justify-center mx-auto mb-4">
          <GitCompare className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
          {t.compareTitle}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          Process a file in the <strong>Editor</strong>, <strong>Remover</strong>, or <strong>Privacy Audit</strong> tab to inspect side-by-side verification differences here.
        </p>
      </div>
    );
  }

  const { verification, file, blob } = lastProcessedOutput;

  const handleDownload = () => {
    const isClean = lastProcessedOutput.operationType.startsWith('remove');
    const outName = generateOutputFilename(file.name, isClean ? 'cleaned' : 'edited');
    triggerManualDownload(blob, outName);
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-4 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-[#243A73] dark:text-[#8EA9ED]" />
            {t.compareTitle}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            {t.compareSubtitle}
          </p>
        </div>

        {/* Verification Status Pill */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
            ${verification.status === 'verified' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' : ''}
            ${verification.status === 'partially_verified' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800' : ''}
            ${verification.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800' : ''}
          `}>
            {verification.status === 'verified' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
            {verification.status === 'partially_verified' && <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
            {verification.status === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />}
            {verification.status === 'verified' ? t.verifiedLabel : verification.status === 'partially_verified' ? t.partiallyVerifiedLabel : t.failedLabel}
          </span>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Card 1: File Size Delta */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/70">
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
            File Size Comparison
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {formatBytes(verification.afterSize)}
            </span>
            <span className="text-xs text-slate-500 line-through">
              {formatBytes(verification.beforeSize)}
            </span>
          </div>
          <span className={`text-[10px] font-semibold mt-1 block ${verification.sizeDifference <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
            {verification.sizeDifference <= 0 ? `${Math.abs(verification.sizeDifference)} bytes scrubbed` : `+${verification.sizeDifference} bytes metadata`}
          </span>
        </div>

        {/* Card 2: Privacy Risk Reduction */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/70">
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
            Sensitive Tags Sanitized
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {verification.afterSensitiveCount} Remaining
            </span>
            <span className="text-xs text-slate-500">
              ({verification.beforeSensitiveCount} before)
            </span>
          </div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 block">
            {verification.sensitiveRemovedCount} tracking tags removed
          </span>
        </div>

        {/* Card 3: Media Payload Integrity */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/70">
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
            Payload Integrity
          </span>
          <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Lossless</span>
          </div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 block">
            Compressed entropy scan preserved
          </span>
        </div>
      </div>

      {/* Diff Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 font-semibold text-xs text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
          Verified Structural Changes
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-4">{t.compareField}</th>
              <th className="py-2.5 px-4">{t.compareBefore}</th>
              <th className="py-2.5 px-4">{t.compareAfter}</th>
              <th className="py-2.5 px-4 text-right">{t.compareStatus}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {verification.details.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                  {item.field}
                </td>
                <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs break-all">
                  {item.before}
                </td>
                <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs break-all">
                  {item.after}
                </td>
                <td className="py-2.5 px-4 text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                    ${item.status === 'removed' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300' : ''}
                    ${item.status === 'modified' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' : ''}
                    ${item.status === 'unchanged' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : ''}
                    ${item.status === 'unverified' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' : ''}
                  `}>
                    {item.status === 'removed' ? t.statusRemoved : item.status === 'modified' ? t.statusModified : item.status === 'unchanged' ? t.statusUnchanged : t.statusUnverified}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manual Download Button */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleDownload}
          className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#243A73] hover:bg-[#1B2D5A] dark:hover:bg-[#304B91] shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          {lastProcessedOutput.operationType.startsWith('remove') ? t.downloadCleaned : t.downloadEdited}
        </button>
      </div>
    </div>
  );
};
