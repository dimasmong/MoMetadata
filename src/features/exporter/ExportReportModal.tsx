import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileJson, 
  FileSpreadsheet, 
  FileText 
} from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';
import { ParsedMetadata } from '../../types/metadata';
import { triggerManualDownload } from '../../utils/download';

interface ExportReportModalProps {
  metadata: ParsedMetadata;
  isOpen: boolean;
  onClose: () => void;
}

type ReportFormat = 'json' | 'csv' | 'txt';

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ metadata, isOpen, onClose }) => {
  const { t } = useLanguage();
  const [format, setFormat] = useState<ReportFormat>('json');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { fileInfo, camera, location, creator, technical, rawTags, sensitiveFindings } = metadata;

  // Generate Report Content
  const generateReport = (): string => {
    const timestamp = new Date().toISOString();
    if (format === 'json') {
      const data = {
        meta: {
          generator: 'MoMetadata',
          url: 'https://mometadata.vercel.app',
          exportTimestamp: timestamp
        },
        file: fileInfo,
        camera: camera || null,
        location: location || null,
        creator: creator || null,
        technical: technical || null,
        privacyAudit: {
          totalSensitiveFound: sensitiveFindings.length,
          findings: sensitiveFindings.map(f => ({
            field: f.field,
            value: f.value,
            risk: f.risk
          }))
        },
        rawTags: rawTags.map(t => ({
          category: t.category,
          tag: t.tag,
          value: t.value
        }))
      };
      return JSON.stringify(data, null, 2);
    }

    if (format === 'csv') {
      const rows: string[][] = [
        ['MoMetadata Report Export', timestamp],
        ['File Name', fileInfo.name],
        ['File Size', fileInfo.sizeFormatted],
        ['MIME Type', fileInfo.type],
        [],
        ['Category', 'Tag Name', 'Value']
      ];

      for (const t of rawTags) {
        rows.push([t.category, t.tag, t.value]);
      }

      return rows.map(r => r.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    }

    // Plain text format
    const lines: string[] = [
      `==================================================`,
      `MoMetadata — Technical File Metadata Report`,
      `Generated: ${timestamp}`,
      `Tool: https://mometadata.vercel.app`,
      `==================================================`,
      ``,
      `FILE IDENTIFICATION:`,
      `  Name: ${fileInfo.name}`,
      `  Size: ${fileInfo.sizeFormatted} (${fileInfo.size} bytes)`,
      `  Type: ${fileInfo.type}`,
      fileInfo.dimensions ? `  Dimensions: ${fileInfo.dimensions.width}x${fileInfo.dimensions.height} px` : '',
      fileInfo.durationFormatted ? `  Duration: ${fileInfo.durationFormatted}` : '',
      ``,
      `CAMERA & DEVICE:`,
      camera?.make ? `  Make: ${camera.make}` : '',
      camera?.model ? `  Model: ${camera.model}` : '',
      camera?.lens ? `  Lens: ${camera.lens}` : '',
      camera?.iso ? `  ISO: ${camera.iso}` : '',
      camera?.shutterSpeed ? `  Shutter: ${camera.shutterSpeed}` : '',
      camera?.aperture ? `  Aperture: ${camera.aperture}` : '',
      camera?.software ? `  Software: ${camera.software}` : '',
      ``,
      `GEOGRAPHIC LOCATION:`,
      location?.hasGps ? `  Latitude: ${location.latitudeFormatted}` : '  GPS: None',
      location?.hasGps ? `  Longitude: ${location.longitudeFormatted}` : '',
      location?.altitudeFormatted ? `  Altitude: ${location.altitudeFormatted}` : '',
      ``,
      `CREATOR & COPYRIGHT:`,
      creator?.title ? `  Title: ${creator.title}` : '',
      creator?.artist || creator?.creator ? `  Creator: ${creator.artist || creator.creator}` : '',
      creator?.copyright ? `  Copyright: ${creator.copyright}` : '',
      creator?.description ? `  Description: ${creator.description}` : '',
      ``,
      `RAW METADATA TAGS (${rawTags.length} tags):`,
      ...rawTags.map(t => `  [${t.category}] ${t.tag}: ${t.value}`)
    ].filter(Boolean);

    return lines.join('\n');
  };

  const reportText = generateReport();

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'txt';
    const mime = format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv' : 'text/plain';
    const blob = new Blob([reportText], { type: mime });
    const filename = `${fileInfo.name}_metadata-report.${ext}`;
    triggerManualDownload(blob, filename);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl glass-panel rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-[#243A73] dark:text-[#8EA9ED]" />
            {t.exportReport}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="flex gap-2 py-4">
          <button
            onClick={() => setFormat('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer
              ${format === 'json' 
                ? 'bg-[#243A73] text-white shadow-xs' 
                : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <FileJson className="w-4 h-4" />
            JSON
          </button>

          <button
            onClick={() => setFormat('csv')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer
              ${format === 'csv' 
                ? 'bg-[#243A73] text-white shadow-xs' 
                : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </button>

          <button
            onClick={() => setFormat('txt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer
              ${format === 'txt' 
                ? 'bg-[#243A73] text-white shadow-xs' 
                : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <FileText className="w-4 h-4" />
            Plain Text
          </button>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-3 font-mono text-xs">
          <pre className="h-full overflow-y-auto whitespace-pre-wrap break-all pr-2">
            {reportText}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t.copied : 'Copy to Clipboard'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {t.close}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#243A73] hover:bg-[#1B2D5A] dark:hover:bg-[#304B91] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
