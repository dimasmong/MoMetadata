export type RemovalPreset = 'gps' | 'personal' | 'capture' | 'all-writable' | 'custom';

export type AppTheme = 'light' | 'dark' | 'system';

export type Language = 'en' | 'id';

export interface UserSettings {
  theme: AppTheme;
  language: Language;
  defaultPreset: RemovalPreset;
  confirmBeforeBatch: boolean;
  preserveColorProfile: boolean;
  preserveRenderingMetadata: boolean;
  lazyLoadWasm: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  language: 'en',
  defaultPreset: 'gps',
  confirmBeforeBatch: true,
  preserveColorProfile: true,
  preserveRenderingMetadata: true,
  lazyLoadWasm: true,
};
