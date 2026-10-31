import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileCheck, 
  X, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';
import type { ParsedMetadata } from '../types/metadata';

interface FileUploadZoneProps {
  onFileSelected: (file: File) => void;
  currentMetadata?: ParsedMetadata;
  onClearFile: () => void;
  isLoading?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelected,
  currentMetadata,
  onClearFile,
  isLoading
}) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setFileError(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    const MAX_SIZE = 500 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFileError('File size exceeds the 500 MB client-side memory safety limit.');
      return;
    }
    if (file.size === 0) {
      setFileError('The selected file is empty (0 bytes). Please select a valid file.');
      return;
    }

    onFileSelected(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // If a file is currently loaded
  if (currentMetadata) {
    const { fileInfo } = currentMetadata;
    return (
      <div className="w-full glass-panel rounded-2xl p-4 sm:p-5 mb-6 transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[#243A73]/10 dark:bg-blue-400/20 text-[#243A73] dark:text-blue-300 flex items-center justify-center shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[280px] sm:max-w-md" title={fileInfo.name}>
                  {fileInfo.name}
                </h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#243A73] text-white uppercase tracking-wider">
                  {fileInfo.extension}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {fileInfo.sizeFormatted} • {fileInfo.type}
                {fileInfo.dimensions && ` • ${fileInfo.dimensions.width}×${fileInfo.dimensions.height} px`}
                {fileInfo.durationFormatted && ` • ${fileInfo.durationFormatted}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {t.uploadChangeFile}
            </button>
            <button
              onClick={onClearFile}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-xs font-medium border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
              title={t.uploadClearFile}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
      />
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-10 text-center cursor-pointer flex flex-col items-center justify-center
          ${isDragging 
            ? 'border-[#243A73] dark:border-blue-400 bg-[#243A73]/5 dark:bg-blue-500/10 scale-[1.01]' 
            : 'border-slate-300 dark:border-slate-700 hover:border-[#243A73]/50 dark:hover:border-blue-400/50 glass-panel hover:shadow-md'
          }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-[#243A73]/10 dark:bg-blue-400/20 text-[#243A73] dark:text-blue-300 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
          {isDragging ? t.uploadDropHere : t.uploadTitle}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mb-4 font-normal">
          {t.uploadSubtitle}
        </p>

        <button
          type="button"
          disabled={isLoading}
          className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#243A73] hover:bg-[#1B2D5A] dark:hover:bg-[#304B91] shadow-sm transition-colors cursor-pointer"
        >
          {t.uploadBrowse}
        </button>

        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-4">
          {t.uploadFormatsHint}
        </span>

        {fileError && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
