import React, { useState } from 'react';
import { useMetadata } from '../../../context/MetadataContext';
import { useLanguage } from '../../../i18n';
import { Button } from '../../common/Button';
import type { RemovalPreset } from '../../../types/settings';
import { getCapabilityForFormat } from '../../../core/capabilityRegistry';
import { downloadBuffer } from '../../../core/exportUtils';
import {
  ShieldAlert,
  MapPin,
  UserX,
  Camera,
  Layers,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  Info,
} from 'lucide-react';

export const RemoveMetadataTab: React.FC = () => {
  const {
    selectedFile,
    removeCurrentFileMetadata,
    removeSelectedFilesMetadata,
    files,
    isProcessing,
  } = useMetadata();
  const { t } = useLanguage();

  const [selectedPreset, setSelectedPreset] = useState<RemovalPreset>('gps');
  const [preserveIcc, setPreserveIcc] = useState(true);
  const [preserveRendering, setPreserveRendering] = useState(true);
  const [applyToBatch, setApplyToBatch] = useState(false);

  if (!selectedFile) {
    return (
      <div className="p-6 text-center text-slate-400 text-sm">
        {t.preview.noSelection}
      </div>
    );
  }

  const format = selectedFile.detectedFormat.toUpperCase();
  const capability = getCapabilityForFormat(format);
  const isRemovable = capability?.removeSupport ?? false;
  const selectedCount = files.filter((f) => f.selected).length;

  const presets: { id: RemovalPreset; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'gps',
      title: t.remove.presetGps,
      desc: t.remove.presetGpsDesc,
      icon: <MapPin className="w-4 h-4 text-rose-500" />,
    },
    {
      id: 'personal',
      title: t.remove.presetPersonal,
      desc: t.remove.presetPersonalDesc,
      icon: <UserX className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 'capture',
      title: t.remove.presetCapture,
      desc: t.remove.presetCaptureDesc,
      icon: <Camera className="w-4 h-4 text-purple-500" />,
    },
    {
      id: 'all-writable',
      title: t.remove.presetAllWritable,
      desc: t.remove.presetAllWritableDesc,
      icon: <Layers className="w-4 h-4 text-amber-500" />,
    },
  ];

  const handleExecuteRemoval = async () => {
    if (applyToBatch && selectedCount > 1) {
      await removeSelectedFilesMetadata(selectedPreset);
    } else {
      await removeCurrentFileMetadata(selectedPreset);
    }
  };

  const handleDownloadCleaned = () => {
    if (selectedFile.modifiedBuffer && selectedFile.modifiedFileName) {
      downloadBuffer(selectedFile.modifiedBuffer, selectedFile.modifiedFileName, selectedFile.type);
    }
  };

  const verification = selectedFile.verification;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t.remove.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.remove.description}
          </p>
        </div>

        {selectedFile.modifiedBuffer && selectedFile.lastAction === 'cleaned' && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadCleaned}
            icon={<Download className="w-3.5 h-3.5 text-blue-600" />}
          >
            {t.exportTab.downloadCurrent}
          </Button>
        )}
      </div>

      {!isRemovable && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200">
          <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-semibold">{t.edit.unsupportedNote}</span>
            <p className="mt-0.5">
              Metadata removal is currently restricted for <strong>{format}</strong> to avoid corruption.
            </p>
          </div>
        </div>
      )}

      {/* Verification Report Banner (shown when verified) */}
      {verification && selectedFile.lastAction === 'cleaned' && (
        <div
          className={`p-4 rounded-xl border space-y-2 text-xs ${
            verification.status === 'pass'
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200'
              : verification.status === 'warning'
              ? 'bg-amber-50/70 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200'
              : 'bg-rose-50/70 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold text-sm">
            {verification.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {verification.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
            {verification.status === 'fail' && <XCircle className="w-4 h-4 text-rose-600" />}
            <span>{t.remove.verificationTitle}</span>
          </div>

          <p className="leading-relaxed">{verification.message}</p>

          {verification.removedTags.length > 0 && (
            <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
              <span className="font-medium">{t.remove.removedLabel}</span>{' '}
              <span className="font-mono text-[11px]">{verification.removedTags.slice(0, 8).join(', ')}</span>
              {verification.removedTags.length > 8 && ` (+${verification.removedTags.length - 8} more)`}
            </div>
          )}

          {verification.unexpectedRetainedTags.length > 0 && (
            <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/60 text-amber-900 dark:text-amber-200">
              <span className="font-medium">{t.remove.retainedLabel}</span>{' '}
              <span className="font-mono text-[11px]">{verification.unexpectedRetainedTags.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Presets List */}
      <div className={`space-y-4 ${!isRemovable ? 'opacity-60 pointer-events-none' : ''}`}>
        <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          {t.remove.presetsTitle}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presets.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => setSelectedPreset(preset.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 dark:border-blue-500 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {preset.icon}
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {preset.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {preset.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Safeguards */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            {t.remove.preservationTitle}
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={preserveIcc}
              onChange={(e) => setPreserveIcc(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>{t.remove.preserveIcc}</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={preserveRendering}
              onChange={(e) => setPreserveRendering(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>{t.remove.preserveRendering}</span>
          </label>
        </div>

        {/* Batch apply option */}
        {selectedCount > 1 && (
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={applyToBatch}
                onChange={(e) => setApplyToBatch(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                {t.remove.applyBatchRemoval.replace('{count}', String(selectedCount))}
              </span>
            </label>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 flex justify-end">
          <Button
            type="button"
            variant="primary"
            size="md"
            loading={isProcessing}
            onClick={handleExecuteRemoval}
            icon={<ShieldAlert className="w-4 h-4" />}
          >
            {t.remove.executeButton}
          </Button>
        </div>
      </div>
    </div>
  );
};
