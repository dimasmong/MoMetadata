import React, { useRef } from 'react';
import { useMetadata } from '../../context/MetadataContext';
import { useLanguage } from '../../i18n';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Trash2, Plus, CheckSquare, Square, File as FileIcon, Image, Music, Video, FileText } from 'lucide-react';
import type { FileStatus } from '../../types/metadata';

export const FileListPanel: React.FC = () => {
  const {
    files,
    selectedFileId,
    setSelectedFileId,
    removeFile,
    clearAllFiles,
    toggleFileSelection,
    selectAllFiles,
    deselectAllFiles,
    addFiles,
    isProcessing,
  } = useMetadata();

  const { t, formatBytes } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCount = files.filter((f) => f.selected).length;
  const allSelected = files.length > 0 && selectedCount === files.length;

  const handleToggleSelectAll = () => {
    if (allSelected) deselectAllFiles();
    else selectAllFiles();
  };

  const handleAddMore = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const getFormatIcon = (format: string, type: string) => {
    if (['JPEG', 'PNG', 'WEBP', 'TIFF', 'HEIC', 'AVIF', 'DNG'].includes(format) || type.startsWith('image/')) {
      return <Image className="w-4 h-4 text-blue-500" />;
    }
    if (['MP3', 'M4A', 'FLAC'].includes(format) || type.startsWith('audio/')) {
      return <Music className="w-4 h-4 text-purple-500" />;
    }
    if (['MP4', 'MOV', 'M4V'].includes(format) || type.startsWith('video/')) {
      return <Video className="w-4 h-4 text-emerald-500" />;
    }
    if (format === 'PDF' || type === 'application/pdf') {
      return <FileText className="w-4 h-4 text-rose-500" />;
    }
    return <FileIcon className="w-4 h-4 text-slate-400" />;
  };

  const getStatusBadge = (status: FileStatus) => {
    switch (status) {
      case 'ready':
        return <Badge variant="slate">{t.fileList.status.ready}</Badge>;
      case 'processing':
        return <Badge variant="blue">{t.fileList.status.processing}</Badge>;
      case 'completed':
        return <Badge variant="green">{t.fileList.status.completed}</Badge>;
      case 'failed':
        return <Badge variant="red">{t.fileList.status.failed}</Badge>;
      case 'unsupported':
        return <Badge variant="amber">{t.fileList.status.unsupported}</Badge>;
    }
  };

  return (
    <aside
      className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"
      aria-label="Files Sidebar"
    >
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="p-1 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            title={allSelected ? t.fileList.deselectAll : t.fileList.selectAll}
            aria-label={allSelected ? t.fileList.deselectAll : t.fileList.selectAll}
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t.fileList.title}
            </div>
            <div className="text-[10px] text-slate-500">
              {t.fileList.selectedCount.replace('{count}', String(selectedCount)).replace('{total}', String(files.length))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleAddMore}
            className="sr-only"
            tabIndex={-1}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={isProcessing}
            title="Add more files"
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add
          </Button>

          <button
            type="button"
            onClick={clearAllFiles}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t.fileList.clearAll}
            aria-label={t.fileList.clearAll}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* File List Scrollable Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {files.map((file) => {
          const isSelectedForInspection = file.id === selectedFileId;
          return (
            <div
              key={file.id}
              onClick={() => setSelectedFileId(file.id)}
              className={`group flex items-start gap-2.5 p-3 cursor-pointer transition-colors ${
                isSelectedForInspection
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-600'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              {/* Checkbox */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFileSelection(file.id);
                }}
                className="mt-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label={`Select ${file.name}`}
              >
                {file.selected ? (
                  <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>

              {/* Icon & Details */}
              <div className="mt-0.5 shrink-0">
                {getFormatIcon(file.detectedFormat, file.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate" title={file.name}>
                  {file.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {formatBytes(file.size)}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {file.detectedFormat}
                  </span>
                  {getStatusBadge(file.status)}
                </div>
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                title={t.fileList.removeFile}
                aria-label={t.fileList.removeFile}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
