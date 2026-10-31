import React, { useRef, useState } from 'react';
import { UploadCloud, Shield, FileCheck } from 'lucide-react';
import { useLanguage } from '../i18n';
import { Button } from './common/Button';
import { Badge } from './common/Badge';

export interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFilesSelected, isProcessing = false }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(filesArray);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      e.target.value = ''; // Reset input to allow selecting same file again
    }
  };

  const openBrowse = () => {
    fileInputRef.current?.click();
  };

  const supportedFormats = [
    'JPEG', 'PNG', 'WEBP', 'TIFF', 'HEIC', 'AVIF', 'PDF', 'MP3', 'M4A', 'FLAC', 'MP4', 'DNG'
  ];

  return (
    <section className="w-full max-w-4xl mx-auto py-8 px-4" aria-labelledby="upload-heading">
      {/* Privacy Notice Banner */}
      <div className="mb-6 p-4 rounded-xl bg-blue-50/70 border border-blue-100 dark:bg-blue-950/40 dark:border-blue-900/60 flex items-start gap-3.5 text-xs text-blue-900 dark:text-blue-200">
        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-sm text-blue-950 dark:text-blue-100 flex items-center gap-2">
            <span>{t.app.privacyBadge}</span>
          </div>
          <p className="mt-1 leading-relaxed text-blue-800 dark:text-blue-300">
            {t.app.privacyDescription}
          </p>
        </div>
      </div>

      {/* Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openBrowse}
        className={`relative flex flex-col items-center justify-center p-10 sm:p-14 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/60 dark:border-blue-400 dark:bg-blue-950/30 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800/40'
        } shadow-xs`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openBrowse();
          }
        }}
        aria-label={t.upload.dropzoneTitle}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleInputChange}
          className="sr-only"
          accept=".jpg,.jpeg,.png,.webp,.tif,.tiff,.heic,.heif,.avif,.pdf,.mp3,.m4a,.flac,.mp4,.mov,.m4v,.dng"
          tabIndex={-1}
        />

        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 ring-8 ring-blue-50/50 dark:ring-blue-900/20">
          <UploadCloud className="w-8 h-8 stroke-[1.8]" />
        </div>

        <h2 id="upload-heading" className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 text-center">
          {t.upload.dropzoneTitle}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1 mb-5">
          {t.upload.dropzoneSubtitle}
        </p>

        <Button
          type="button"
          variant="primary"
          size="md"
          loading={isProcessing}
          onClick={(e) => {
            e.stopPropagation();
            openBrowse();
          }}
        >
          {t.upload.browseButton}
        </Button>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 max-w-xl">
          {supportedFormats.map((fmt) => (
            <Badge key={fmt} variant="slate" size="sm">
              {fmt}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 text-center">
        <FileCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span>{t.upload.batchNotice}</span>
      </div>
    </section>
  );
};
