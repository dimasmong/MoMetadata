import React, { createContext, useContext, useState } from 'react';
import type { FileRecord } from '../types/metadata';
import type { UserSettings, RemovalPreset } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';
import { processLoadedFile, executeFileEdit, executeFileRemoval } from '../core/engine';
import type { EngineEditPayload } from '../core/engine';

export type WorkspaceTab = 'overview' | 'allMetadata' | 'editMetadata' | 'removeMetadata' | 'export';

interface MetadataContextType {
  files: FileRecord[];
  selectedFileId: string | null;
  selectedFile: FileRecord | null;
  activeTab: WorkspaceTab;
  settings: UserSettings;
  isProcessing: boolean;
  processingMessage: string;
  addFiles: (newFiles: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  clearAllFiles: () => void;
  toggleFileSelection: (id: string) => void;
  selectAllFiles: () => void;
  deselectAllFiles: () => void;
  setSelectedFileId: (id: string) => void;
  setActiveTab: (tab: WorkspaceTab) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  editCurrentFile: (edits: EngineEditPayload) => Promise<void>;
  editSelectedFiles: (edits: EngineEditPayload) => Promise<void>;
  removeCurrentFileMetadata: (preset?: RemovalPreset) => Promise<void>;
  removeSelectedFilesMetadata: (preset?: RemovalPreset) => Promise<void>;
}

const MetadataContext = createContext<MetadataContextType | undefined>(undefined);

export const MetadataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingMessage, setProcessingMessage] = useState<string>('');

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('mometadata_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        // Fallback
      }
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('mometadata_settings', JSON.stringify(next));
      return next;
    });
  };

  const selectedFile = files.find((f) => f.id === selectedFileId) || (files.length > 0 ? files[0] : null);

  const addFiles = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setIsProcessing(true);
    setProcessingMessage('Processing files...');

    const processedList: FileRecord[] = [];
    for (let i = 0; i < newFiles.length; i++) {
      setProcessingMessage(`Analyzing file ${i + 1} of ${newFiles.length}...`);
      const record = await processLoadedFile(newFiles[i]);
      processedList.push(record);
    }

    setFiles((prev) => {
      const updated = [...prev, ...processedList];
      if (!selectedFileId && processedList.length > 0) {
        setSelectedFileId(processedList[0].id);
      }
      return updated;
    });

    setIsProcessing(false);
    setProcessingMessage('');
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl && target.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const filtered = prev.filter((f) => f.id !== id);
      if (selectedFileId === id) {
        setSelectedFileId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const clearAllFiles = () => {
    files.forEach((f) => {
      if (f.previewUrl && f.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(f.previewUrl);
      }
    });
    setFiles([]);
    setSelectedFileId(null);
  };

  const toggleFileSelection = (id: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f))
    );
  };

  const selectAllFiles = () => {
    setFiles((prev) => prev.map((f) => ({ ...f, selected: true })));
  };

  const deselectAllFiles = () => {
    setFiles((prev) => prev.map((f) => ({ ...f, selected: false })));
  };

  const editCurrentFile = async (edits: EngineEditPayload) => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProcessingMessage('Saving metadata changes...');

    try {
      const updated = await executeFileEdit(selectedFile, edits);
      setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    } catch (err: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === selectedFile.id
            ? { ...f, status: 'failed', errorMessage: err?.message || 'Edit failed' }
            : f
        )
      );
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const editSelectedFiles = async (edits: EngineEditPayload) => {
    const targets = files.filter((f) => f.selected);
    if (targets.length === 0) return;

    setIsProcessing(true);
    for (let i = 0; i < targets.length; i++) {
      setProcessingMessage(`Updating metadata for file ${i + 1} of ${targets.length}...`);
      try {
        const updated = await executeFileEdit(targets[i], edits);
        setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === targets[i].id
              ? { ...f, status: 'failed', errorMessage: err?.message || 'Batch edit failed' }
              : f
          )
        );
      }
    }
    setIsProcessing(false);
    setProcessingMessage('');
  };

  const removeCurrentFileMetadata = async (presetOverride?: RemovalPreset) => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProcessingMessage('Cleaning metadata...');

    const preset = presetOverride || settings.defaultPreset;

    try {
      const updated = await executeFileRemoval(
        selectedFile,
        preset,
        settings.preserveColorProfile,
        settings.preserveRenderingMetadata
      );
      setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    } catch (err: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === selectedFile.id
            ? { ...f, status: 'failed', errorMessage: err?.message || 'Removal failed' }
            : f
        )
      );
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const removeSelectedFilesMetadata = async (presetOverride?: RemovalPreset) => {
    const targets = files.filter((f) => f.selected);
    if (targets.length === 0) return;

    setIsProcessing(true);
    const preset = presetOverride || settings.defaultPreset;

    for (let i = 0; i < targets.length; i++) {
      setProcessingMessage(`Cleaning metadata for file ${i + 1} of ${targets.length}...`);
      try {
        const updated = await executeFileRemoval(
          targets[i],
          preset,
          settings.preserveColorProfile,
          settings.preserveRenderingMetadata
        );
        setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === targets[i].id
              ? { ...f, status: 'failed', errorMessage: err?.message || 'Batch removal failed' }
              : f
          )
        );
      }
    }
    setIsProcessing(false);
    setProcessingMessage('');
  };

  return (
    <MetadataContext.Provider
      value={{
        files,
        selectedFileId,
        selectedFile,
        activeTab,
        settings,
        isProcessing,
        processingMessage,
        addFiles,
        removeFile,
        clearAllFiles,
        toggleFileSelection,
        selectAllFiles,
        deselectAllFiles,
        setSelectedFileId,
        setActiveTab,
        updateSettings,
        editCurrentFile,
        editSelectedFiles,
        removeCurrentFileMetadata,
        removeSelectedFilesMetadata,
      }}
    >
      {children}
    </MetadataContext.Provider>
  );
};

export const useMetadata = (): MetadataContextType => {
  const context = useContext(MetadataContext);
  if (!context) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }
  return context;
};
