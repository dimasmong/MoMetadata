export type FileCategory = 'image' | 'audio' | 'video' | 'document' | 'other';

export type SensitiveRiskLevel = 'low' | 'moderate' | 'high';

export interface SensitiveFinding {
  id: string;
  field: string;
  value: string;
  category: 'location' | 'identity' | 'temporal' | 'device' | 'software' | 'comment';
  risk: SensitiveRiskLevel;
  explanation: {
    en: string;
    id: string;
  };
  canRemove: boolean;
}

export interface FileInfo {
  name: string;
  size: number;
  sizeFormatted: string;
  type: string;
  extension: string;
  category: FileCategory;
  lastModified: number;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;
  durationFormatted?: string;
}

export interface CameraInfo {
  make?: string;
  model?: string;
  lens?: string;
  iso?: string | number;
  shutterSpeed?: string;
  aperture?: string;
  focalLength?: string;
  exposureProgram?: string;
  exposureBias?: string;
  meteringMode?: string;
  flash?: string;
  whiteBalance?: string;
  orientation?: number | string;
  software?: string;
  serialNumber?: string;
}

export interface LocationInfo {
  hasGps: boolean;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  latitudeFormatted?: string;
  longitudeFormatted?: string;
  altitudeFormatted?: string;
  timestamp?: string;
  mapUrl?: string;
}

export interface CreatorInfo {
  title?: string;
  creator?: string;
  artist?: string;
  author?: string;
  copyright?: string;
  description?: string;
  subject?: string;
  keywords?: string[];
  comments?: string;
  company?: string;
  album?: string;
  genre?: string;
  trackNumber?: string | number;
  discNumber?: string | number;
  year?: string | number;
}

export interface TechnicalInfo {
  colorSpace?: string;
  profileName?: string;
  compression?: string;
  bitDepth?: number | string;
  resolutionUnit?: string;
  xResolution?: number | string;
  yResolution?: number | string;
  sampleRate?: number | string;
  channels?: number | string;
  bitrate?: number | string;
  audioCodec?: string;
  videoCodec?: string;
  frameRate?: number | string;
  containerFormat?: string;
}

export interface RawTag {
  id: string;
  category: 'EXIF' | 'IPTC' | 'XMP' | 'GPS' | 'PNG' | 'RIFF' | 'ID3' | 'PDF' | 'Office' | 'File' | 'Other';
  tag: string;
  description: string;
  value: string;
  raw?: any;
}

export interface FormatCapabilities {
  canInspect: boolean;
  canEdit: boolean;
  canRemoveGps: boolean;
  canRemoveAll: boolean;
  canExport: boolean;
  canVerify: boolean;
  editableFields: string[];
  readOnlyReason?: {
    en: string;
    id: string;
  };
}

export interface ParsedMetadata {
  fileInfo: FileInfo;
  camera?: CameraInfo;
  location?: LocationInfo;
  creator?: CreatorInfo;
  technical?: TechnicalInfo;
  rawTags: RawTag[];
  capabilities: FormatCapabilities;
  sensitiveFindings: SensitiveFinding[];
  hasMetadata: boolean;
  previewUrl?: string;
}

export interface VerificationDiffItem {
  field: string;
  before: string;
  after: string;
  status: 'removed' | 'modified' | 'unchanged' | 'unverified';
}

export interface VerificationResult {
  status: 'verified' | 'partially_verified' | 'failed' | 'not_available';
  message: {
    en: string;
    id: string;
  };
  details: VerificationDiffItem[];
  beforeSize: number;
  afterSize: number;
  sizeDifference: number;
  beforeSensitiveCount: number;
  afterSensitiveCount: number;
  sensitiveRemovedCount: number;
  mediaPayloadPreserved: boolean;
}

export interface ProcessedOutput {
  file: File;
  blob: Blob;
  parsedMetadata: ParsedMetadata;
  verification: VerificationResult;
  operationType: 'edit' | 'remove_gps' | 'remove_all' | 'remove_selected';
}
