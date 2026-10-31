import { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UploadZone } from './components/UploadZone';
import { FormatCapabilitiesModal } from './components/FormatCapabilitiesModal';
import { SettingsModal } from './components/SettingsModal';
import { FileListPanel } from './components/workspace/FileListPanel';
import { PreviewPanel } from './components/workspace/PreviewPanel';
import { WorkspaceTabs } from './components/workspace/WorkspaceTabs';
import { OverviewTab } from './components/workspace/tabs/OverviewTab';
import { AllMetadataTab } from './components/workspace/tabs/AllMetadataTab';
import { EditMetadataTab } from './components/workspace/tabs/EditMetadataTab';
import { RemoveMetadataTab } from './components/workspace/tabs/RemoveMetadataTab';
import { ExportTab } from './components/workspace/tabs/ExportTab';
import { useMetadata } from './context/MetadataContext';
import { useLanguage } from './i18n';
import { Loader2 } from 'lucide-react';

export function AppContent() {
  const { files, activeTab, addFiles, isProcessing, processingMessage } = useMetadata();
  const { t } = useLanguage();

  const [isCapabilitiesOpen, setIsCapabilitiesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const hasFiles = files.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Header
        onOpenCapabilities={() => setIsCapabilitiesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Global Processing Toast / Indicator */}
      {isProcessing && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl border border-slate-700 dark:border-slate-200 animate-in slide-in-from-bottom-5 duration-200 text-xs font-medium"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span>{processingMessage || t.status.loadingEngine}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {!hasFiles ? (
          /* Landing Page State */
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="text-center max-w-2xl mx-auto mb-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                MoMetadata
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                {t.app.tagline}
              </p>
            </div>

            <UploadZone onFilesSelected={addFiles} isProcessing={isProcessing} />
          </div>
        ) : (
          /* Interactive Workspace State */
          <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
            {/* Responsive Workspace Grid */}
            <div className="flex-1 flex flex-col md:grid md:grid-cols-12 overflow-hidden">
              {/* Left Column: File List */}
              <div className="md:col-span-3 lg:col-span-3 h-48 md:h-full border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 overflow-hidden">
                <FileListPanel />
              </div>

              {/* Center Column: Preview & Summary */}
              <div className="md:col-span-4 lg:col-span-4 h-72 md:h-full border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 overflow-hidden">
                <PreviewPanel />
              </div>

              {/* Right Column: Tabbed Metadata Editor & Inspector */}
              <div className="md:col-span-5 lg:col-span-5 flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900">
                <WorkspaceTabs />
                <div className="flex-1 overflow-y-auto">
                  {activeTab === 'overview' && <OverviewTab />}
                  {activeTab === 'allMetadata' && <AllMetadataTab />}
                  {activeTab === 'editMetadata' && <EditMetadataTab />}
                  {activeTab === 'removeMetadata' && <RemoveMetadataTab />}
                  {activeTab === 'export' && <ExportTab />}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {!hasFiles && <Footer />}

      {/* Modals */}
      <FormatCapabilitiesModal
        isOpen={isCapabilitiesOpen}
        onClose={() => setIsCapabilitiesOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
