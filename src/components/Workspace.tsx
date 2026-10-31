import React, { useState } from 'react';
import { 
  FileSearch, 
  Edit3, 
  Trash2, 
  ShieldAlert, 
  GitCompare, 
  Layers, 
  Loader2 
} from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';
import { ParsedMetadata, ProcessedOutput } from '../types/metadata';
import { inspectFile } from '../engines/core';
import { FileUploadZone } from './FileUploadZone';
import { SampleGallery } from '../features/samples/SampleGallery';
import { SampleFileDef, fetchSampleAsFile } from '../features/samples/sampleFiles';
import { InspectorView } from '../features/inspector/InspectorView';
import { EditorView } from '../features/editor/EditorView';
import { RemoverView } from '../features/remover/RemoverView';
import { PrivacyView } from '../features/privacy/PrivacyView';
import { CompareView } from '../features/compare/CompareView';
import { BatchView } from '../features/batch/BatchView';
import { ExportReportModal } from '../features/exporter/ExportReportModal';

type WorkspaceTab = 'inspector' | 'editor' | 'remover' | 'privacy' | 'compare' | 'batch';

export const Workspace: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('inspector');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ParsedMetadata | null>(null);
  const [lastOutput, setLastOutput] = useState<ProcessedOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setCurrentFile(file);
    setLastOutput(null);

    try {
      const parsed = await inspectFile(file);
      setMetadata(parsed);
      setActiveTab('inspector');
    } catch (err) {
      console.error('Failed to parse metadata:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleSelect = async (sample: SampleFileDef) => {
    setIsLoading(true);
    try {
      const file = await fetchSampleAsFile(sample);
      await handleFileSelect(file);
    } catch (err) {
      console.error('Failed to load sample:', err);
      setIsLoading(false);
    }
  };

  const handleClearFile = () => {
    setCurrentFile(null);
    setMetadata(null);
    setLastOutput(null);
  };

  const handleOperationComplete = (result: ProcessedOutput) => {
    setLastOutput(result);
  };

  return (
    <section id="workspace-section" className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Workspace Mode Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 rounded-2xl glass-panel mb-6">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap
              ${activeTab === 'inspector'
                ? 'bg-[#243A73] hover:bg-[#1B2D5A] dark:hover:bg-[#304B91] text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <FileSearch className="w-4 h-4" />
            {t.tabInspector}
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap
              ${activeTab === 'editor'
                ? 'bg-[#243A73] hover:bg-[#1B2D5A] dark:hover:bg-[#304B91] text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <Edit3 className="w-4 h-4" />
            {t.tabEditor}
          </button>

          <button
            onClick={() => setActiveTab('remover')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap
              ${activeTab === 'remover'
                ? 'bg-[#243A73] hover:bg-[#1B2D5A] dark:hover:bg-[#304B91] text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <Trash2 className="w-4 h-4" />
            {t.tabRemover}
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap
              ${activeTab === 'privacy'
                ? 'bg-[#243A73] hover:bg-[#1B2D5A] dark:hover:bg-[#304B91] text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <ShieldAlert className="w-4 h-4" />
            {t.tabPrivacy}
            {metadata && metadata.sensitiveFindings.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap
              ${activeTab === 'compare'
                ? 'bg-[#243A73] hover:bg-[#1B2D5A] dark:hover:bg-[#304B91] text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <GitCompare className="w-4 h-4" />
            {t.tabCompare}
            {lastOutput && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap
              ${activeTab === 'batch'
                ? 'bg-[#243A73] hover:bg-[#1B2D5A] dark:hover:bg-[#304B91] text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <Layers className="w-4 h-4" />
            {t.tabBatch}
          </button>
        </div>

        {/* Batch view handles its own file queue */}
        {activeTab === 'batch' ? (
          <BatchView />
        ) : (
          <>
            {/* Upload Zone */}
            <FileUploadZone
              onFileSelected={handleFileSelect}
              currentMetadata={metadata || undefined}
              onClearFile={handleClearFile}
              isLoading={isLoading}
            />

            {/* When no file is loaded, show the authentic sample gallery */}
            {!metadata && !isLoading && (
              <div className="mb-6">
                <SampleGallery onSelectSample={handleSampleSelect} isLoading={isLoading} />
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="w-full glass-panel rounded-2xl p-12 text-center my-6">
                <Loader2 className="w-8 h-8 text-[#243A73] dark:text-blue-400 animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Inspecting file metadata and verifying binary structure...
                </p>
              </div>
            )}

            {/* Active Tab View */}
            {metadata && currentFile && !isLoading && (
              <div className="transition-all">
                {activeTab === 'inspector' && (
                  <InspectorView 
                    metadata={metadata} 
                    onOpenExportModal={() => setIsExportModalOpen(true)} 
                  />
                )}

                {activeTab === 'editor' && (
                  <EditorView
                    file={currentFile}
                    metadata={metadata}
                    onOperationComplete={handleOperationComplete}
                  />
                )}

                {activeTab === 'remover' && (
                  <RemoverView
                    file={currentFile}
                    metadata={metadata}
                    onOperationComplete={handleOperationComplete}
                  />
                )}

                {activeTab === 'privacy' && (
                  <PrivacyView
                    file={currentFile}
                    metadata={metadata}
                    onOperationComplete={handleOperationComplete}
                  />
                )}

                {activeTab === 'compare' && (
                  <CompareView
                    originalMetadata={metadata}
                    lastProcessedOutput={lastOutput}
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* Export Report Modal */}
        {metadata && (
          <ExportReportModal
            metadata={metadata}
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
          />
        )}
      </div>
    </section>
  );
};
