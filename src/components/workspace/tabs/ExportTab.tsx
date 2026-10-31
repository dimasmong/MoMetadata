import React from 'react';
import { useMetadata } from '../../../context/MetadataContext';
import { useLanguage } from '../../../i18n';
import { Button } from '../../common/Button';
import {
  downloadBuffer,
  exportMetadataAsJson,
  exportMetadataAsCsv,
  downloadBatchZip,
} from '../../../core/exportUtils';
import {
  Download,
  FileCode,
  FileSpreadsheet,
  Archive,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';

export const ExportTab: React.FC = () => {
  const { selectedFile, files, isProcessing } = useMetadata();
  const { t, formatBytes } = useLanguage();

  if (!selectedFile) {
    return (
      <div className="p-6 text-center text-slate-400 text-sm">
        {t.preview.noSelection}
      </div>
    );
  }

  const { metadata, modifiedBuffer, modifiedFileName, originalBuffer, name, type } = selectedFile;
  const groups = metadata?.groups || [];

  const handleDownloadSingle = () => {
    const bufferToDownload = modifiedBuffer || originalBuffer;
    const downloadName = modifiedFileName || name;
    if (bufferToDownload) {
      downloadBuffer(bufferToDownload, downloadName, type);
    }
  };

  const processedFilesCount = files.filter((f) => f.modifiedBuffer !== undefined).length;
  const totalFilesCount = files.length;

  const handleBatchZip = async () => {
    // Only package files that have been modified or all loaded files
    const targets = files.filter((f) => f.modifiedBuffer || f.originalBuffer);
    if (targets.length > 0) {
      await downloadBatchZip(targets, `MoMetadata_Batch_${Date.now()}.zip`);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {t.exportTab.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t.exportTab.description}
        </p>
      </div>

      {/* Single File Downloads Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>Current File: {name}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Status:{' '}
              {modifiedBuffer ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {selectedFile.lastAction === 'cleaned' ? 'Cleaned' : 'Edited'} (Ready for download)
                </span>
              ) : (
                <span className="text-slate-400">Original (Unmodified)</span>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleDownloadSingle}
            icon={<Download className="w-4 h-4" />}
          >
            {modifiedBuffer ? t.exportTab.downloadCurrent : `Download Original (${formatBytes(selectedFile.size)})`}
          </Button>
        </div>

        {modifiedFileName && (
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">
            Output name: <strong>{modifiedFileName}</strong>
          </div>
        )}

        <div className="pt-2 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportMetadataAsJson(groups, name)}
            icon={<FileCode className="w-4 h-4 text-blue-600" />}
          >
            {t.exportTab.downloadJson}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportMetadataAsCsv(groups, name)}
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            {t.exportTab.downloadCsv}
          </Button>
        </div>
      </div>

      {/* Batch ZIP Export Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Archive className="w-4 h-4 text-amber-500" />
              <span>{t.exportTab.batchZipTitle}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t.exportTab.batchZipDesc}
            </p>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {processedFilesCount} modified/cleaned files of {totalFilesCount} total files loaded
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            loading={isProcessing}
            onClick={handleBatchZip}
            icon={<Archive className="w-4 h-4" />}
          >
            {t.exportTab.downloadBatchZip.replace('{count}', String(totalFilesCount))}
          </Button>
        </div>
      </div>

      {/* File naming explanation */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 space-y-1">
        <div className="font-medium text-slate-700 dark:text-slate-300">
          {t.exportTab.fileNamingRule}
        </div>
        <div>• Cleaned files: <code className="text-blue-600 dark:text-blue-400">{t.exportTab.namingCleaned}</code></div>
        <div>• Modified files: <code className="text-blue-600 dark:text-blue-400">{t.exportTab.namingEdited}</code></div>
      </div>
    </div>
  );
};
