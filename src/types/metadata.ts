export type FileStatus = 'ready' | 'processing' | 'completed' | 'failed' | 'unsupported';

export type MetadataCategory = 'general' | 'camera' | 'location' | 'description' | 'advanced';

export interface MetadataTag {
  id: string;
  name: string;
  displayName: string;
  value: string | number | boolean;
  raw?: unknown;
  category: MetadataCategory;
  group: string; // e.g. "EXIF", "IPTC", "XMP", "GPS", "ICC", "PDF", "ID3", "Composite"
  writable: boolean;
  description?: string;
  sensitive?: boolean; // Personally identifiable or location data
}

export interface MetadataGroup {
  name: string;
  category: MetadataCategory;
  tags: MetadataTag[];
}

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp?: string;
  dmsLatitude?: string;
  dmsLongitude?: string;
}

export interface VerificationResult {
  verified: boolean;
  status: 'pass' | 'warning' | 'fail';
  removedTags: string[];
  retainedTags: string[];
  modifiedTags: string[];
  unexpectedRetainedTags: string[];
  message: string;
  details?: Record<string, unknown>;
}

export interface ParsedMetadata {
  groups: MetadataGroup[];
  raw: Record<string, unknown>;
  fieldCount: number;
  location?: LocationData;
  dimensions?: { width: number; height: number };
  duration?: number;
  colorSpace?: string;
  hasIccProfile: boolean;
  hasGps: boolean;
  hasSensitiveData: boolean;
}

export interface FileRecord {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  detectedFormat: string;
  status: FileStatus;
  errorMessage?: string;
  metadata?: ParsedMetadata;
  previewUrl?: string;
  thumbnailUrl?: string;
  originalBuffer?: ArrayBuffer;
  modifiedBuffer?: ArrayBuffer;
  modifiedFileName?: string;
  verification?: VerificationResult;
  lastAction?: 'edited' | 'cleaned' | 'verified';
  selected?: boolean;
}
