import React, { useState } from 'react';
import { useMetadata } from '../../../context/MetadataContext';
import { useLanguage } from '../../../i18n';
import {
  MapPin,
  Camera,
  FileText,
  Sliders,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export const OverviewTab: React.FC = () => {
  const { selectedFile } = useMetadata();
  const { t } = useLanguage();
  const [copiedCoords, setCopiedCoords] = useState(false);

  if (!selectedFile || !selectedFile.metadata) {
    return (
      <div className="p-6 text-center text-slate-400 text-sm">
        {t.preview.noSelection}
      </div>
    );
  }

  const { metadata } = selectedFile;
  const groups = metadata.groups;

  // Find tags by category
  const generalTags = groups.flatMap((g) => g.tags.filter((t) => t.category === 'general'));
  const cameraTags = groups.flatMap((g) => g.tags.filter((t) => t.category === 'camera'));
  const descriptionTags = groups.flatMap((g) => g.tags.filter((t) => t.category === 'description'));
  const advancedTags = groups.flatMap((g) => g.tags.filter((t) => t.category === 'advanced'));

  const handleCopyCoords = () => {
    if (metadata.location) {
      const coordStr = `${metadata.location.latitude.toFixed(6)}, ${metadata.location.longitude.toFixed(6)}`;
      navigator.clipboard.writeText(coordStr);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    }
  };

  const renderTagList = (tags: typeof generalTags, emptyMsg: string) => {
    if (tags.length === 0) {
      return (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
          {emptyMsg}
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
              <span className="font-medium truncate">{tag.displayName}</span>
              <span className="text-[10px] uppercase font-mono">{tag.group}</span>
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 break-words">
              {String(tag.value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
      {/* Privacy & Security Audit Card */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3.5 ${
          metadata.hasSensitiveData
            ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60'
            : 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/60'
        }`}
      >
        {metadata.hasSensitiveData ? (
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 text-xs">
          <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            {t.overview.privacyAudit}
          </div>
          <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
            {metadata.hasSensitiveData
              ? t.overview.auditAlert
              : t.overview.auditClean}
          </p>
        </div>
      </div>

      {/* Location / GPS Section */}
      {metadata.location && (
        <section aria-labelledby="location-heading" className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <h3 id="location-heading" className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                {t.overview.locationCategory}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCoords}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCoords ? t.overview.coordinatesCopied : t.overview.copyCoordinates}</span>
              </button>

              <a
                href={`https://www.openstreetmap.org/?mlat=${metadata.location.latitude}&mlon=${metadata.location.longitude}#map=16/${metadata.location.latitude}/${metadata.location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/60 border border-blue-200 dark:border-blue-800 transition-colors"
              >
                <span>{t.overview.viewOnMap}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500 text-[11px]">Latitude</span>
              <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {metadata.location.latitude.toFixed(6)}°
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500 text-[11px]">Longitude</span>
              <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {metadata.location.longitude.toFixed(6)}°
              </div>
            </div>
            {metadata.location.altitude !== undefined && (
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500 text-[11px]">Altitude</span>
                <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {metadata.location.altitude} m
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Camera & Hardware Section */}
      <section aria-labelledby="camera-heading" className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="w-4 h-4 text-blue-500" />
          <h3 id="camera-heading" className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            {t.overview.cameraCategory}
          </h3>
        </div>
        {renderTagList(cameraTags, t.overview.noCamera)}
      </section>

      {/* Description & Intellectual Property Section */}
      <section aria-labelledby="desc-heading" className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-emerald-500" />
          <h3 id="desc-heading" className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            {t.overview.descriptionCategory}
          </h3>
        </div>
        {renderTagList(descriptionTags, t.overview.noDescription)}
      </section>

      {/* General Properties */}
      {generalTags.length > 0 && (
        <section aria-labelledby="general-heading" className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Sliders className="w-4 h-4 text-slate-500" />
            <h3 id="general-heading" className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {t.overview.generalCategory}
            </h3>
          </div>
          {renderTagList(generalTags, '')}
        </section>
      )}

      {/* Advanced Technical Properties */}
      {advancedTags.length > 0 && (
        <section aria-labelledby="advanced-heading" className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-purple-500" />
            <h3 id="advanced-heading" className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {t.overview.advancedCategory}
            </h3>
          </div>
          {renderTagList(advancedTags, '')}
        </section>
      )}
    </div>
  );
};
