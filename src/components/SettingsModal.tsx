import React from 'react';
import { Modal } from './common/Modal';
import { useLanguage } from '../i18n';
import { useTheme } from '../context/ThemeContext';
import { useMetadata } from '../context/MetadataContext';
import { Button } from './common/Button';
import type { RemovalPreset, AppTheme } from '../types/settings';
import { Trash2 } from 'lucide-react';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, clearAllFiles, files } = useMetadata();

  const handleClearSession = () => {
    if (window.confirm(t.settingsModal.clearSessionConfirm)) {
      clearAllFiles();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.settingsModal.title}
      maxWidth="md"
    >
      <div className="space-y-6 text-sm">
        {/* Language */}
        <div>
          <label className="block font-medium text-slate-800 dark:text-slate-200 mb-2">
            {t.settingsModal.language}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                language === 'en'
                  ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-200'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('id')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                language === 'id'
                  ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-200'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              Bahasa Indonesia
            </button>
          </div>
        </div>

        {/* Theme */}
        <div>
          <label className="block font-medium text-slate-800 dark:text-slate-200 mb-2">
            {t.settingsModal.theme}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['light', 'dark', 'system'] as AppTheme[]).map((themeOption) => (
              <button
                key={themeOption}
                type="button"
                onClick={() => setTheme(themeOption)}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition-all ${
                  theme === themeOption
                    ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-200'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {themeOption === 'light'
                  ? t.settingsModal.themeLight
                  : themeOption === 'dark'
                  ? t.settingsModal.themeDark
                  : t.settingsModal.themeSystem}
              </button>
            ))}
          </div>
        </div>

        {/* Default Removal Preset */}
        <div>
          <label className="block font-medium text-slate-800 dark:text-slate-200 mb-2">
            {t.settingsModal.defaultPreset}
          </label>
          <select
            value={settings.defaultPreset}
            onChange={(e) => updateSettings({ defaultPreset: e.target.value as RemovalPreset })}
            className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="gps">{t.remove.presetGps}</option>
            <option value="personal">{t.remove.presetPersonal}</option>
            <option value="capture">{t.remove.presetCapture}</option>
            <option value="all-writable">{t.remove.presetAllWritable}</option>
          </select>
        </div>

        {/* Preservation checkboxes */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={settings.preserveColorProfile}
              onChange={(e) => updateSettings({ preserveColorProfile: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>{t.settingsModal.preserveIccDefault}</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={settings.preserveRenderingMetadata}
              onChange={(e) => updateSettings({ preserveRenderingMetadata: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>{t.settingsModal.preserveRenderingDefault}</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={settings.confirmBeforeBatch}
              onChange={(e) => updateSettings({ confirmBeforeBatch: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>{t.settingsModal.confirmBatch}</span>
          </label>
        </div>

        {/* Clear Session */}
        {files.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              {files.length} active files loaded
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
              onClick={handleClearSession}
            >
              {t.settingsModal.clearSession}
            </Button>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <Button type="button" variant="primary" size="sm" onClick={onClose}>
            {t.settingsModal.closeButton}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
