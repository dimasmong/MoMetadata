import React, { useState } from 'react';
import { 
  Trash2, 
  MapPinOff, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Loader2, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';
import { ParsedMetadata, ProcessedOutput } from '../../types/metadata';
import { processFile } from '../../engines/processor';
import { triggerManualDownload, generateOutputFilename } from '../../utils/download';

interface RemoverViewProps {
  file: File;
  metadata: ParsedMetadata;
  onOperationComplete: (result: ProcessedOutput) => void;
}

export const RemoverView: React.FC<RemoverViewProps> = ({ file, metadata, onOperationComplete }) => {
  const { t, language } = useLanguage();
  const { capabilities, location } = metadata;

  const [preserveICC, setPreserveICC] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastOutput, setLastOutput] = useState<ProcessedOutput | null>(null);

  const handleAction = async (action: 'remove_gps' | 'remove_all') => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const result = await processFile(file, metadata, {
        action,
        preserveICC
      });

      setLastOutput(result);
      onOperationComplete(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove metadata.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!lastOutput) return;
    const outName = generateOutputFilename(file.name, 'cleaned');
    triggerManualDownload(lastOutput.blob, outName);
  };

  const canRemoveGps = capabilities.canRemoveGps && location?.hasGps;
  const canRemoveAll = capabilities.canRemoveAll;

  return (
    <div className="w-full glass-panel rounded-2xl p-4 sm:p-6 transition-all">
      <div className="mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-[#243A73] dark:text-[#8EA9ED]" />
          {t.removerTitle}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
          {t.removerSubtitle}
        </p>
      </div>

      {/* ICC Profile Preservation Option (for images) */}
      {metadata.fileInfo.category === 'image' && (
        <div className="mb-6 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 flex items-start gap-3">
          <input
            type="checkbox"
            id="preserve-icc"
            checked={preserveICC}
            onChange={(e) => setPreserveICC(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-[#243A73] focus:ring-[#243A73] cursor-pointer"
          />
          <label htmlFor="preserve-icc" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <span className="font-semibold block">{t.preserveIccOption}</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5">
              {t.preserveIccHint}
            </span>
          </label>
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Action 1: Remove GPS Only */}
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <MapPinOff className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.removeGpsBtn}
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              {t.removeGpsDesc}
            </p>
          </div>

          <button
            onClick={() => handleAction('remove_gps')}
            disabled={!canRemoveGps || isProcessing}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPinOff className="w-4 h-4" />}
            {canRemoveGps ? t.removeGpsBtn : 'GPS Not Detected or Unsupported'}
          </button>
        </div>

        {/* Action 2: Remove All Non-Essential */}
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.removeAllBtn}
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              {t.removeAllDesc}
            </p>
          </div>

          <button
            onClick={() => handleAction('remove_all')}
            disabled={!canRemoveAll || isProcessing}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#243A73] hover:bg-[#1B2D5A] dark:hover:bg-[#304B91] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {canRemoveAll ? t.removeAllBtn : 'Not Supported for This Format'}
          </button>
        </div>
      </div>

      {/* Honest Privacy Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-2.5 text-slate-600 dark:text-slate-300 text-xs">
        <Lock className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          {t.removerDisclaimer}
        </p>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Completed Result & Manual Download Panel */}
      {lastOutput && (
        <div className="mt-6 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  {lastOutput.verification.status === 'verified' ? t.verifiedLabel : t.partiallyVerifiedLabel}
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {lastOutput.verification.message[language]}
                </p>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                  Removed: {lastOutput.verification.details.filter(d => d.status === 'removed').length} tags • Size difference: {lastOutput.verification.sizeDifference} bytes
                </div>
              </div>
            </div>

            {/* Manual download button - only downloaded upon user click */}
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              {t.downloadCleaned}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
