export type SupportLevel = 'full' | 'partial' | 'read-only' | 'unsupported';

export interface FormatCapability {
  format: string; // e.g. "JPEG", "PNG", "WEBP", "TIFF", "HEIC", "AVIF", "PDF", "MP3", "MP4", "DNG"
  extensions: string[];
  mimeType: string;
  category: 'image' | 'video' | 'audio' | 'document' | 'raw';
  readSupport: boolean;
  editSupport: boolean;
  removeSupport: boolean;
  verificationSupport: boolean;
  supportedFields: string[];
  limitations: string[];
}

export type CapabilityRegistry = Record<string, FormatCapability>;
