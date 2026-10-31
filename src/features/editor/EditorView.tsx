import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';
import { ParsedMetadata, ProcessedOutput } from '../../types/metadata';
import { processFile } from '../../engines/processor';
import { triggerManualDownload, generateOutputFilename } from '../../utils/download';

interface EditorViewProps {
  file: File;
  metadata: ParsedMetadata;
  onOperationComplete: (result: ProcessedOutput) => void;
}

export const EditorView: React.FC<EditorViewProps> = ({ file, metadata, onOperationComplete }) => {
  const { t, language } = useLanguage();
  const { capabilities, creator, camera, location } = metadata;

  // Form states initialized with extracted values
  const [title, setTitle] = useState(creator?.title || '');
  const [artist, setArtist] = useState(creator?.artist || creator?.creator || creator?.author || '');
  const [copyright, setCopyright] = useState(creator?.copyright || '');
  const [description, setDescription] = useState(creator?.description || '');
  const [software, setSoftware] = useState(camera?.software || '');
  const [comments, setComments] = useState(creator?.comments || '');
  const [album, setAlbum] = useState(creator?.album || '');
  const [year, setYear] = useState(creator?.year ? String(creator.year) : '');
  const [latitude, setLatitude] = useState(location?.latitude !== undefined ? String(location.latitude) : '');
  const [longitude, setLongitude] = useState(location?.longitude !== undefined ? String(location.longitude) : '');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastOutput, setLastOutput] = useState<ProcessedOutput | null>(null);

  // Re-sync when metadata changes
  useEffect(() => {
    setTitle(creator?.title || '');
    setArtist(creator?.artist || creator?.creator || creator?.author || '');
    setCopyright(creator?.copyright || '');
    setDescription(creator?.description || '');
    setSoftware(camera?.software || '');
    setComments(creator?.comments || '');
    setAlbum(creator?.album || '');
    setYear(creator?.year ? String(creator.year) : '');
    setLatitude(location?.latitude !== undefined ? String(location.latitude) : '');
    setLongitude(location?.longitude !== undefined ? String(location.longitude) : '');
    setLastOutput(null);
    setErrorMsg(null);
  }, [metadata]);

  const handleReset = () => {
    setTitle(creator?.title || '');
    setArtist(creator?.artist || creator?.creator || creator?.author || '');
    setCopyright(creator?.copyright || '');
    setDescription(creator?.description || '');
    setSoftware(camera?.software || '');
    setComments(creator?.comments || '');
    setAlbum(creator?.album || '');
    setYear(creator?.year ? String(creator.year) : '');
    setLatitude(location?.latitude !== undefined ? String(location.latitude) : '');
    setLongitude(location?.longitude !== undefined ? String(location.longitude) : '');
    setErrorMsg(null);
  };

  const hasUnsavedChanges = 
    title !== (creator?.title || '') ||
    artist !== (creator?.artist || creator?.creator || creator?.author || '') ||
    copyright !== (creator?.copyright || '') ||
    description !== (creator?.description || '') ||
    software !== (camera?.software || '') ||
    comments !== (creator?.comments || '') ||
    album !== (creator?.album || '');

  const handleApplyChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capabilities.canEdit) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const editValues: any = {
        title,
        artist,
        creator: artist,
        author: artist,
        copyright,
        description,
        software,
        comments,
        album,
        year
      };

      if (latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
        editValues.latitude = Number(latitude);
        editValues.longitude = Number(longitude);
      }

      const result = await processFile(file, metadata, {
        action: 'edit',
        editValues
      });

      setLastOutput(result);
      onOperationComplete(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while writing metadata.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!lastOutput) return;
    const outName = generateOutputFilename(file.name, 'edited');
    triggerManualDownload(lastOutput.blob, outName);
  };

  if (!capabilities.canEdit) {
    return (
      <div className="w-full glass-panel rounded-2xl p-6 sm:p-8 text-center transition-all">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
          {t.editorReadOnlyWarning}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">
          {capabilities.readOnlyReason ? capabilities.readOnlyReason[language] : 'This file format is read-only.'}
        </p>
      </div>
    );
  }

  const ext = metadata.fileInfo.extension.toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
  const isPdf = ext === 'pdf';
  const isMp3 = ext === 'mp3';
  const isOffice = ['docx', 'xlsx', 'pptx'].includes(ext);

  return (
    <div className="w-full glass-panel rounded-2xl p-4 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[#243A73] dark:text-[#8EA9ED]" />
            {t.editorTitle}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            {t.editorSubtitle}
          </p>
        </div>

        {hasUnsavedChanges && (
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 self-start sm:self-auto">
            {t.editorUnsavedChanges}
          </span>
        )}
      </div>

      <form onSubmit={handleApplyChanges} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t.titleLabel}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Project Sunset Horizon"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#243A73] dark:focus:ring-[#8EA9ED]"
            />
          </div>

          {/* Artist / Author / Creator */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isPdf || isOffice ? 'Author / Creator' : t.artistLabel}
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g. Dimas Mong"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#243A73] dark:focus:ring-[#8EA9ED]"
            />
          </div>

          {/* Copyright (Images / Audio) */}
          {(isImage || isMp3) && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.copyrightLabel}
              </label>
              <input
                type="text"
                value={copyright}
                onChange={(e) => setCopyright(e.target.value)}
                placeholder="e.g. © 2026 Dimas Mong. All rights reserved."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#243A73] dark:focus:ring-[#8EA9ED]"
              />
            </div>
          )}

          {/* Software (Images) */}
          {isImage && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.software}
              </label>
              <input
                type="text"
                value={software}
                onChange={(e) => setSoftware(e.target.value)}
                placeholder="e.g. Adobe Lightroom Classic"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#243A73] dark:focus:ring-[#8EA9ED]"
              />
            </div>
          )}

          {/* MP3 Specific: Album, Year */}
          {isMp3 && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.albumLabel}
                </label>
                <input
                  type="text"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  placeholder="e.g. Studio Master Sessions"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#243A73] dark:focus:ring-[#8EA9ED]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.yearLabel}
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#243A73] dark:focus:ring-[#8EA9ED]"
                />
              </div>
            </>
          )}

          {/* JPEG GPS editing */}
          {['jpg', 'jpeg'].includes(ext) && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.gpsLatitude}
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 37.774929"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#243A73] dark:focus:ring-[#8EA9ED]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.gpsLongitude}
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. -122.419416"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#243A73] dark:focus:ring-[#8EA9ED]"
                />
              </div>
            </>
          )}
        </div>

        {/* Description / Abstract */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.descriptionLabel}
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Overview or caption notes..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#243A73] dark:focus:ring-[#8EA9ED]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <button
            type="button"
            onClick={handleReset}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t.editorReset}
          </button>

          <button
            type="submit"
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#243A73] hover:bg-[#1B2D5A] dark:hover:bg-[#304B91] shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.editorProcessing}
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                {t.editorSave}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Notice */}
      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Completed Result & Manual Download Panel */}
      {lastOutput && (
        <div className="mt-6 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  {lastOutput.verification.status === 'verified' ? t.verifiedLabel : t.partiallyVerifiedLabel}
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {lastOutput.verification.message[language]}
                </p>
              </div>
            </div>

            {/* Manual download button - only downloaded upon user click */}
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              {t.downloadEdited}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
