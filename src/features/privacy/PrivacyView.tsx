import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Fingerprint, 
  User, 
  Laptop, 
  MessageSquare, 
  ExternalLink, 
  Trash2, 
  Loader2, 
  Download, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';
import { ParsedMetadata, SensitiveFinding, ProcessedOutput } from '../../types/metadata';
import { processFile } from '../../engines/processor';
import { triggerManualDownload, generateOutputFilename } from '../../utils/download';

interface PrivacyViewProps {
  file: File;
  metadata: ParsedMetadata;
  onOperationComplete: (result: ProcessedOutput) => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ file, metadata, onOperationComplete }) => {
  const { t, language } = useLanguage();
  const { sensitiveFindings, capabilities, location } = metadata;

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOutput, setLastOutput] = useState<ProcessedOutput | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const highRisks = sensitiveFindings.filter(f => f.risk === 'high');
  const modRisks = sensitiveFindings.filter(f => f.risk === 'moderate');
  const lowRisks = sensitiveFindings.filter(f => f.risk === 'low');

  const getOverallRisk = () => {
    if (highRisks.length > 0) return { label: t.privacyScoreHigh, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-950/40 border-red-200 dark:border-red-900' };
    if (modRisks.length > 0) return { label: t.privacyScoreModerate, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900' };
    if (lowRisks.length > 0) return { label: t.privacyScoreLow, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900' };
    return { label: t.noSensitiveDataFound, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900' };
  };

  const overall = getOverallRisk();

  const getCategoryIcon = (category: SensitiveFinding['category']) => {
    switch (category) {
      case 'location': return <MapPin className="w-4 h-4 text-red-500" />;
      case 'temporal': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'device': return <Fingerprint className="w-4 h-4 text-purple-500" />;
      case 'identity': return <User className="w-4 h-4 text-blue-500" />;
      case 'software': return <Laptop className="w-4 h-4 text-slate-500" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-indigo-500" />;
    }
  };

  const handleCleanSensitive = async () => {
    if (!capabilities.canRemoveAll) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const result = await processFile(file, metadata, {
        action: 'remove_all',
        preserveICC: true
      });
      setLastOutput(result);
      onOperationComplete(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to clean sensitive metadata.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!lastOutput) return;
    const outName = generateOutputFilename(file.name, 'cleaned');
    triggerManualDownload(lastOutput.blob, outName);
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-4 sm:p-6 transition-all">
      <div className="mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#243A73] dark:text-[#8EA9ED]" />
          {t.privacyTitle}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
          {t.privacySubtitle}
        </p>
      </div>

      {/* Overall Score Banner */}
      <div className={`p-4 rounded-xl border mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${overall.bg}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/60 shrink-0">
            {sensitiveFindings.length > 0 ? (
              <ShieldAlert className={`w-6 h-6 ${overall.color}`} />
            ) : (
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div>
            <h4 className={`text-sm font-bold ${overall.color}`}>
              {overall.label}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {sensitiveFindings.length > 0 
                ? `${sensitiveFindings.length} tracking/identifiable tags detected (${highRisks.length} high, ${modRisks.length} moderate, ${lowRisks.length} low risk).`
                : t.noSensitiveDataDesc}
            </p>
          </div>
        </div>

        {sensitiveFindings.length > 0 && capabilities.canRemoveAll && (
          <button
            onClick={handleCleanSensitive}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            {t.privacyCleanAllAction}
          </button>
        )}
      </div>

      {/* Findings List */}
      {sensitiveFindings.length > 0 ? (
        <div className="space-y-3 mb-6">
          {sensitiveFindings.map((finding) => (
            <div 
              key={finding.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-800/70 hover:shadow-xs transition-shadow"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-700/60">
                    {getCategoryIcon(finding.category)}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {finding.field}
                  </span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                  ${finding.risk === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900' : ''}
                  ${finding.risk === 'moderate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900' : ''}
                  ${finding.risk === 'low' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900' : ''}
                `}>
                  {finding.risk === 'high' ? t.riskHigh : finding.risk === 'moderate' ? t.riskModerate : t.riskLow}
                </span>
              </div>

              <div className="text-xs font-mono bg-slate-100 dark:bg-slate-900/60 px-2.5 py-1.5 rounded-lg text-slate-850 dark:text-slate-200 break-all mb-2 border border-slate-200/60 dark:border-slate-800">
                {finding.value}
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {finding.explanation[language]}
              </p>

              {finding.id === 'gps-coordinates' && location?.mapUrl && (
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    OpenStreetMap coordinate inspection (Manual action only)
                  </span>
                  <a
                    href={location.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-[#243A73] dark:text-[#8EA9ED] hover:underline inline-flex items-center gap-1"
                  >
                    View coordinates on map
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            {t.noSensitiveDataFound}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            {t.noSensitiveDataDesc}
          </p>
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Completed Result & Manual Download Panel */}
      {lastOutput && (
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/20">
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
              </div>
            </div>

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
