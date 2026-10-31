import React from 'react';
import { useMetadata } from '../../context/MetadataContext';
import { useLanguage } from '../../i18n';
import { Badge } from '../common/Badge';
import {
  Music,
  FileText,
  AlertTriangle,
  MapPin,
  Palette,
  Maximize2,
  FileCheck,
} from 'lucide-react';

export const PreviewPanel: React.FC = () => {
  const { selectedFile } = useMetadata();
  const { t, formatBytes } = useLanguage();

  if (!selectedFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <p className="text-sm">{t.preview.noSelection}</p>
      </div>
    );
  }

  const { metadata, previewUrl, detectedFormat, type } = selectedFile;
  const isImage = ['JPEG', 'PNG', 'WEBP', 'TIFF', 'HEIC', 'AVIF'].includes(detectedFormat) || type.startsWith('image/');
  const isAudio = ['MP3', 'M4A', 'FLAC'].includes(detectedFormat) || type.startsWith('audio/');
  const isVideo = ['MP4', 'MOV', 'M4V'].includes(detectedFormat) || type.startsWith('video/');
  const isPdf = detectedFormat === 'PDF' || type === 'application/pdf';

  return (
    <section className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-5 overflow-y-auto">
      {/* File Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              {t.preview.title}
            </span>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate" title={selectedFile.name}>
              {selectedFile.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span className="font-mono">{formatBytes(selectedFile.size)}</span>
              <span>•</span>
              <span className="font-mono uppercase">{detectedFormat}</span>
              {metadata?.dimensions && (
                <>
                  <span>•</span>
                  <span>{metadata.dimensions.width} × {metadata.dimensions.height} px</span>
                </>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            <Badge variant="blue" size="sm">
              <FileCheck className="w-3 h-3 mr-1" />
              {t.preview.fieldCount.replace('{count}', String(metadata?.fieldCount || 0))}
            </Badge>
          </div>
        </div>

        {/* Security & Audit Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {metadata?.hasGps && (
            <Badge variant="amber" size="sm">
              <MapPin className="w-3 h-3 mr-1" />
              {t.preview.gpsPresent}
            </Badge>
          )}

          {metadata?.hasSensitiveData && (
            <Badge variant="red" size="sm">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {t.preview.sensitiveWarning}
            </Badge>
          )}

          {metadata?.hasIccProfile && (
            <Badge variant="purple" size="sm">
              <Palette className="w-3 h-3 mr-1" />
              {t.preview.iccProfile}
            </Badge>
          )}

          {metadata?.colorSpace && (
            <Badge variant="slate" size="sm">
              {metadata.colorSpace}
            </Badge>
          )}
        </div>
      </div>

      {/* Visual Media Preview */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center min-h-[260px] overflow-hidden">
        {isImage && previewUrl ? (
          <div className="relative w-full h-full max-h-[400px] flex items-center justify-center">
            <img
              src={previewUrl}
              alt={selectedFile.name}
              className="max-h-full max-w-full object-contain rounded-lg shadow-xs"
            />
          </div>
        ) : isAudio ? (
          <div className="flex flex-col items-center justify-center text-center p-6 w-full">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Album Cover"
                className="w-36 h-36 object-cover rounded-xl shadow-md mb-4 border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Music className="w-12 h-12" />
              </div>
            )}
            <audio
              controls
              className="w-full max-w-xs mt-2"
              src={selectedFile.previewUrl || URL.createObjectURL(selectedFile.file)}
            />
          </div>
        ) : isVideo && previewUrl ? (
          <div className="w-full h-full max-h-[380px] flex items-center justify-center">
            <video
              controls
              src={previewUrl}
              className="max-h-full max-w-full rounded-lg shadow-xs"
            />
          </div>
        ) : isPdf ? (
          <div className="flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
              <FileText className="w-10 h-10" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {t.preview.pdfDocInfo}
            </span>
            {metadata?.raw?.pageCount !== undefined && metadata?.raw?.pageCount !== null && (
              <span className="text-xs text-slate-500 mt-1">
                {t.preview.pages}: {String(metadata.raw.pageCount)}
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
              <Maximize2 className="w-8 h-8" />
            </div>
            <p className="text-xs max-w-xs">
              {t.preview.unsupportedPreview}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
