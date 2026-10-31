import React, { useState, useEffect } from 'react';
import { useMetadata } from '../../../context/MetadataContext';
import { useLanguage } from '../../../i18n';
import { Button } from '../../common/Button';
import { getCapabilityForFormat } from '../../../core/capabilityRegistry';
import { downloadBuffer } from '../../../core/exportUtils';
import {
  Save,
  Download,
  RotateCcw,
  X,
  AlertCircle,
  CheckCircle2,
  Users,
  Info,
} from 'lucide-react';

interface FormState {
  title: string;
  author: string;
  copyright: string;
  description: string;
  keywords: string;
  comment: string;
  dateOriginal: string;
  dateModified: string;
  gpsLatitude: string;
  gpsLongitude: string;
  gpsAltitude: string;
}

export const EditMetadataTab: React.FC = () => {
  const {
    selectedFile,
    editCurrentFile,
    editSelectedFiles,
    files,
    isProcessing,
  } = useMetadata();
  const { t } = useLanguage();

  const [form, setForm] = useState<FormState>({
    title: '',
    author: '',
    copyright: '',
    description: '',
    keywords: '',
    comment: '',
    dateOriginal: '',
    dateModified: '',
    gpsLatitude: '',
    gpsLongitude: '',
    gpsAltitude: '',
  });

  const [initialValues, setInitialValues] = useState<FormState>({ ...form });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [applyToBatch, setApplyToBatch] = useState(false);

  const format = selectedFile?.detectedFormat.toUpperCase() || '';
  const capability = getCapabilityForFormat(format);
  const isEditable = capability?.editSupport ?? false;

  // Populate form with current values of the selected file
  useEffect(() => {
    if (!selectedFile || !selectedFile.metadata) return;

    const allTags = selectedFile.metadata.groups.flatMap((g) => g.tags);
    const findTag = (...keys: string[]) => {
      const target = allTags.find((t) => keys.some((k) => t.name.toLowerCase() === k.toLowerCase()));
      return target ? String(target.value) : '';
    };

    const newForm: FormState = {
      title: findTag('Title', 'ImageDescription', 'pdf_title'),
      author: findTag('Artist', 'Author', 'Creator', 'pdf_author'),
      copyright: findTag('Copyright'),
      description: findTag('Description', 'ImageDescription', 'Subject', 'pdf_subject'),
      keywords: findTag('Keywords', 'XPKeywords', 'pdf_keywords'),
      comment: findTag('UserComment', 'Comment'),
      dateOriginal: findTag('DateTimeOriginal', 'CreationDate'),
      dateModified: findTag('DateTime', 'ModifyDate', 'ModificationDate'),
      gpsLatitude: selectedFile.metadata.location
        ? String(selectedFile.metadata.location.latitude)
        : '',
      gpsLongitude: selectedFile.metadata.location
        ? String(selectedFile.metadata.location.longitude)
        : '',
      gpsAltitude: selectedFile.metadata.location?.altitude !== undefined
        ? String(selectedFile.metadata.location.altitude)
        : '',
    };

    setForm(newForm);
    setInitialValues(newForm);
    setErrorMsg(null);
  }, [selectedFile]);

  if (!selectedFile) {
    return (
      <div className="p-6 text-center text-slate-400 text-sm">
        {t.preview.noSelection}
      </div>
    );
  }

  const selectedCount = files.filter((f) => f.selected).length;

  const handleFieldReset = (key: keyof FormState) => {
    setForm((prev) => ({ ...prev, [key]: initialValues[key] }));
  };

  const handleFieldClear = (key: keyof FormState) => {
    setForm((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    // Validate GPS if filled
    if (form.gpsLatitude.trim() || form.gpsLongitude.trim()) {
      const lat = parseFloat(form.gpsLatitude);
      const lon = parseFloat(form.gpsLongitude);
      if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lon) || lon < -180 || lon > 180) {
        setErrorMsg(t.edit.gpsValidationError);
        return false;
      }
    }

    setErrorMsg(null);
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      title: form.title,
      author: form.author,
      copyright: form.copyright,
      description: form.description,
      keywords: form.keywords ? form.keywords.split(',').map((s) => s.trim()) : undefined,
      comment: form.comment,
      dateOriginal: form.dateOriginal,
      dateModified: form.dateModified,
      gpsLatitude: form.gpsLatitude ? parseFloat(form.gpsLatitude) : undefined,
      gpsLongitude: form.gpsLongitude ? parseFloat(form.gpsLongitude) : undefined,
      gpsAltitude: form.gpsAltitude ? parseFloat(form.gpsAltitude) : undefined,
    };

    if (applyToBatch && selectedCount > 1) {
      await editSelectedFiles(payload);
    } else {
      await editCurrentFile(payload);
    }
  };

  const handleDownload = () => {
    if (selectedFile.modifiedBuffer && selectedFile.modifiedFileName) {
      downloadBuffer(selectedFile.modifiedBuffer, selectedFile.modifiedFileName, selectedFile.type);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t.edit.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.edit.description}
          </p>
        </div>

        {selectedFile.modifiedBuffer && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            icon={<Download className="w-3.5 h-3.5 text-blue-600" />}
          >
            {t.edit.downloadButton}
          </Button>
        )}
      </div>

      {!isEditable && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200">
          <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-semibold">{t.edit.unsupportedNote}</span>
            <p className="mt-0.5">
              Format <strong>{format}</strong> is currently read-only to preserve file integrity.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {selectedFile.status === 'completed' && selectedFile.lastAction === 'edited' && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{selectedFile.verification?.message || t.status.success}</span>
        </div>
      )}

      {/* Form Fields */}
      <div className={`space-y-4 ${!isEditable ? 'opacity-60 pointer-events-none' : ''}`}>
        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="edit-title" className="font-medium text-slate-700 dark:text-slate-300">
              {t.edit.titleField}
            </label>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{t.edit.currentValue} {initialValues.title || t.edit.noValue}</span>
              <button
                type="button"
                onClick={() => handleFieldClear('title')}
                className="hover:text-rose-500"
                title={t.edit.clearField}
              >
                <X className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleFieldReset('title')}
                className="hover:text-blue-600"
                title={t.edit.resetField}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
          <input
            id="edit-title"
            aria-label={t.edit.titleField}
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Author / Artist */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-slate-700 dark:text-slate-300">
              {t.edit.authorField}
            </label>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{t.edit.currentValue} {initialValues.author || t.edit.noValue}</span>
              <button
                type="button"
                onClick={() => handleFieldClear('author')}
                className="hover:text-rose-500"
                title={t.edit.clearField}
              >
                <X className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleFieldReset('author')}
                className="hover:text-blue-600"
                title={t.edit.resetField}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
          <input
            type="text"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Copyright */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-slate-700 dark:text-slate-300">
              {t.edit.copyrightField}
            </label>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{t.edit.currentValue} {initialValues.copyright || t.edit.noValue}</span>
              <button
                type="button"
                onClick={() => handleFieldClear('copyright')}
                className="hover:text-rose-500"
                title={t.edit.clearField}
              >
                <X className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleFieldReset('copyright')}
                className="hover:text-blue-600"
                title={t.edit.resetField}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
          <input
            type="text"
            value={form.copyright}
            onChange={(e) => setForm({ ...form, copyright: e.target.value })}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Description / Caption */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-slate-700 dark:text-slate-300">
              {t.edit.descriptionField}
            </label>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{t.edit.currentValue} {initialValues.description || t.edit.noValue}</span>
              <button
                type="button"
                onClick={() => handleFieldClear('description')}
                className="hover:text-rose-500"
                title={t.edit.clearField}
              >
                <X className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleFieldReset('description')}
                className="hover:text-blue-600"
                title={t.edit.resetField}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Keywords */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-slate-700 dark:text-slate-300">
              {t.edit.keywordsField}
            </label>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{t.edit.currentValue} {initialValues.keywords || t.edit.noValue}</span>
              <button
                type="button"
                onClick={() => handleFieldClear('keywords')}
                className="hover:text-rose-500"
                title={t.edit.clearField}
              >
                <X className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleFieldReset('keywords')}
                className="hover:text-blue-600"
                title={t.edit.resetField}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
          <input
            type="text"
            value={form.keywords}
            onChange={(e) => setForm({ ...form, keywords: e.target.value })}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* GPS Coordinates */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
          <div className="font-medium text-xs text-slate-800 dark:text-slate-200">
            GPS Coordinates (WGS84)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">
                {t.edit.latitudeField}
              </label>
              <input
                type="text"
                placeholder="-6.2088"
                value={form.gpsLatitude}
                onChange={(e) => setForm({ ...form, gpsLatitude: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">
                {t.edit.longitudeField}
              </label>
              <input
                type="text"
                placeholder="106.8456"
                value={form.gpsLongitude}
                onChange={(e) => setForm({ ...form, gpsLongitude: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
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
                {t.edit.applyBatch.replace('{count}', String(selectedCount))}
              </span>
            </label>
          </div>
        )}

        {/* Save button */}
        <div className="pt-4 flex justify-end">
          <Button
            type="button"
            variant="primary"
            size="md"
            loading={isProcessing}
            onClick={handleSave}
            icon={<Save className="w-4 h-4" />}
          >
            {t.edit.saveCopyButton}
          </Button>
        </div>
      </div>
    </div>
  );
};
