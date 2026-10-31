import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { 
  Layers, 
  Plus, 
  Trash2, 
  MapPinOff, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Loader2, 
  FileCheck 
} from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';
import { inspectFile } from '../../engines/core';
import { processFile } from '../../engines/processor';
import { triggerManualDownload, generateOutputFilename } from '../../utils/download';
import { formatBytes } from '../../utils/formatters';
import { ProcessedOutput, ParsedMetadata } from '../../types/metadata';

interface BatchItem {
  id: string;
  file: File;
  metadata?: ParsedMetadata;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'unsupported';
  processedOutput?: ProcessedOutput;
  error?: string;
}

export const BatchView: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: BatchItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newItems.push({
        id: `${file.name}-${file.size}-${Date.now()}-${i}`,
        file,
        status: 'queued'
      });
    }

    setItems((prev) => [...prev, ...newItems]);

    // Inspect files asynchronously
    for (const item of newItems) {
      try {
        const meta = await inspectFile(item.file);
        setItems((current) =>
          current.map((it) =>
            it.id === item.id ? { ...it, metadata: meta } : it
          )
        );
      } catch {
        setItems((current) =>
          current.map((it) =>
            it.id === item.id ? { ...it, status: 'failed', error: 'Failed to inspect file' } : it
          )
        );
      }
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleClearQueue = () => {
    setItems([]);
  };

  const runBatchOperation = async (action: 'remove_gps' | 'remove_all') => {
    if (items.length === 0 || isProcessing) return;
    setIsProcessing(true);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let meta = item.metadata;

      if (!meta) {
        try {
          meta = await inspectFile(item.file);
        } catch {
          setItems((current) =>
            current.map((it) =>
              it.id === item.id ? { ...it, status: 'failed', error: 'Inspection failed' } : it
            )
          );
          continue;
        }
      }

      const isGpsAction = action === 'remove_gps';
      const isSupported = isGpsAction 
        ? meta.capabilities.canRemoveGps && meta.location?.hasGps 
        : meta.capabilities.canRemoveAll;

      if (!isSupported) {
        setItems((current) =>
          current.map((it) =>
            it.id === item.id ? { ...it, status: 'unsupported' } : it
          )
        );
        continue;
      }

      // Mark processing
      setItems((current) =>
        current.map((it) =>
          it.id === item.id ? { ...it, status: 'processing' } : it
        )
      );

      try {
        const out = await processFile(item.file, meta, {
          action,
          preserveICC: true
        });

        setItems((current) =>
          current.map((it) =>
            it.id === item.id ? { ...it, status: 'completed', processedOutput: out } : it
          )
        );
      } catch (err: any) {
        setItems((current) =>
          current.map((it) =>
            it.id === item.id ? { ...it, status: 'failed', error: err?.message || 'Processing failed' } : it
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const handleDownloadSingle = (item: BatchItem) => {
    if (!item.processedOutput) return;
    const isClean = item.processedOutput.operationType.startsWith('remove');
    const outName = generateOutputFilename(item.file.name, isClean ? 'cleaned' : 'edited');
    triggerManualDownload(item.processedOutput.blob, outName);
  };

  const handleDownloadAllZip = async () => {
    const completedItems = items.filter((it) => it.status === 'completed' && it.processedOutput);
    if (completedItems.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();

      for (const item of completedItems) {
        if (!item.processedOutput) continue;
        const outName = generateOutputFilename(item.file.name, 'cleaned');
        zip.file(outName, item.processedOutput.blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      triggerManualDownload(zipBlob, `MoMetadata_Batch_Export_${Date.now()}.zip`);
    } catch (err) {
      console.error('Failed to generate ZIP archive:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const completedCount = items.filter((it) => it.status === 'completed').length;

  return (
    <div className="w-full glass-panel rounded-2xl p-4 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#243A73] dark:text-[#8EA9ED]" />
            {t.batchTitle}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            {t.batchSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={(e) => handleAddFiles(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#243A73] hover:bg-[#1B2D5A] dark:hover:bg-[#304B91] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.batchAddFiles}
          </button>
          {items.length > 0 && (
            <button
              onClick={handleClearQueue}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t.batchClearQueue}
            </button>
          )}
        </div>
      </div>

      {/* Batch Actions Bar */}
      {items.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-6">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
            {items.length} {t.batchFilesTotal} ({completedCount} completed)
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => runBatchOperation('remove_gps')}
              disabled={isProcessing}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <MapPinOff className="w-3.5 h-3.5" />
              {t.batchRemoveGpsAll}
            </button>

            <button
              onClick={() => runBatchOperation('remove_all')}
              disabled={isProcessing}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#243A73] hover:bg-[#1B2D5A] dark:hover:bg-[#304B91] text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.batchRemoveAllMeta}
            </button>

            {completedCount > 0 && (
              <button
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isZipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {t.downloadAllZip} ({completedCount})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Queue List */}
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-500 shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md" title={item.file.name}>
                    {item.file.name}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {formatBytes(item.file.size)} • {item.metadata ? `${item.metadata.rawTags.length} tags` : 'Inspecting...'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                {/* Status Badge */}
                <div className="flex items-center gap-1.5">
                  {item.status === 'queued' && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t.batchQueued}
                    </span>
                  )}
                  {item.status === 'processing' && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {t.batchProcessingState}
                    </span>
                  )}
                  {item.status === 'completed' && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {t.batchCompleted}
                    </span>
                  )}
                  {item.status === 'unsupported' && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {t.batchUnsupported}
                    </span>
                  )}
                  {item.status === 'failed' && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 flex items-center gap-1" title={item.error}>
                      <AlertCircle className="w-3 h-3" />
                      {t.batchFailed}
                    </span>
                  )}
                </div>

                {/* Single Download Button if completed */}
                {item.status === 'completed' && (
                  <button
                    onClick={() => handleDownloadSingle(item)}
                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                    title={t.downloadCleaned}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}

                {/* Remove from queue */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={isProcessing}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Remove from queue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-slate-400">
          <Layers className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          Queue is empty. Click <strong>{t.batchAddFiles}</strong> above to load multiple files.
        </div>
      )}
    </div>
  );
};
