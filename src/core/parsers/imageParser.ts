import exifr from 'exifr';
import type { MetadataCategory, MetadataGroup, MetadataTag, ParsedMetadata, LocationData } from '../../types/metadata';
import { cleanPlainText } from '../formatDetector';

const SENSITIVE_TAG_NAMES = new Set([
  'latitude',
  'longitude',
  'gpslatitude',
  'gpslongitude',
  'gpsaltitude',
  'gpsposition',
  'author',
  'artist',
  'creator',
  'ownername',
  'cameragownernumber',
  'serialnumber',
  'bodyserialnumber',
  'lensserialnumber',
  'contact',
  'copyright',
]);

const WRITABLE_TAG_NAMES = new Set([
  'title',
  'artist',
  'author',
  'copyright',
  'imagedescription',
  'description',
  'usercomment',
  'comment',
  'xpkeywords',
  'keywords',
  'datetimeoriginal',
  'modifydate',
  'gpslatitude',
  'gpslongitude',
  'gpsaltitude',
  'make',
  'model',
  'software',
  'orientation',
]);

function categorizeTag(groupName: string, tagName: string): MetadataCategory {
  const lowerTag = tagName.toLowerCase();
  const lowerGroup = groupName.toLowerCase();

  if (lowerGroup.includes('gps') || lowerTag.startsWith('gps') || lowerTag.includes('latitude') || lowerTag.includes('longitude') || lowerTag.includes('altitude')) {
    return 'location';
  }

  if (
    lowerTag.includes('make') ||
    lowerTag.includes('model') ||
    lowerTag.includes('lens') ||
    lowerTag.includes('fnumber') ||
    lowerTag.includes('aperture') ||
    lowerTag.includes('shutterspeed') ||
    lowerTag.includes('exposure') ||
    lowerTag.includes('iso') ||
    lowerTag.includes('focallength') ||
    lowerTag.includes('flash') ||
    lowerTag.includes('whitebalance') ||
    lowerTag.includes('metering')
  ) {
    return 'camera';
  }

  if (
    lowerTag.includes('title') ||
    lowerTag.includes('author') ||
    lowerTag.includes('artist') ||
    lowerTag.includes('creator') ||
    lowerTag.includes('copyright') ||
    lowerTag.includes('description') ||
    lowerTag.includes('caption') ||
    lowerTag.includes('comment') ||
    lowerTag.includes('subject') ||
    lowerTag.includes('keyword')
  ) {
    return 'description';
  }

  if (
    lowerTag.includes('width') ||
    lowerTag.includes('height') ||
    lowerTag.includes('resolution') ||
    lowerTag.includes('colorspace') ||
    lowerTag.includes('bits') ||
    lowerTag.includes('compression') ||
    lowerTag.includes('mime') ||
    lowerTag.includes('format')
  ) {
    return 'general';
  }

  return 'advanced';
}

function formatTagValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value instanceof Uint8Array || ArrayBuffer.isView(value)) {
    return `[Binary Data ${value.byteLength} bytes]`;
  }
  if (Array.isArray(value)) {
    return value.map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '[Object]';
    }
  }
  return cleanPlainText(value);
}

export async function parseImageMetadata(file: File | ArrayBuffer): Promise<ParsedMetadata> {
  const groups: MetadataGroup[] = [];
  const rawData: Record<string, unknown> = {};
  let fieldCount = 0;
  let location: LocationData | undefined;
  let dimensions: { width: number; height: number } | undefined;
  let colorSpace: string | undefined;
  let hasIccProfile = false;
  let hasGps = false;
  let hasSensitiveData = false;

  try {
    // Parse comprehensive blocks with exifr
    const exifrOutput = await exifr.parse(file, {
      tiff: true,
      xmp: true,
      icc: true,
      iptc: true,
      jfif: true,
      ihdr: true,
      mergeOutput: false,
      sanitize: false,
      translateKeys: true,
      translateValues: false,
      reviveValues: true,
    });

    if (exifrOutput && typeof exifrOutput === 'object') {
      Object.assign(rawData, exifrOutput);

      for (const [groupKey, groupContent] of Object.entries(exifrOutput)) {
        if (!groupContent || typeof groupContent !== 'object') continue;

        const tags: MetadataTag[] = [];
        const entries = Object.entries(groupContent as Record<string, unknown>);

        for (const [key, val] of entries) {
          if (val === undefined || val === null || val === '') continue;

          // Check dimensions
          const lowerKey = key.toLowerCase();
          if (lowerKey === 'imagewidth' || lowerKey === 'pixelxdimension' || lowerKey === 'width') {
            const num = Number(val);
            if (!isNaN(num) && num > 0) {
              dimensions = dimensions ? { ...dimensions, width: num } : { width: num, height: 0 };
            }
          }
          if (lowerKey === 'imageheight' || lowerKey === 'pixelydimension' || lowerKey === 'height') {
            const num = Number(val);
            if (!isNaN(num) && num > 0) {
              dimensions = dimensions ? { ...dimensions, height: num } : { width: 0, height: num };
            }
          }

          if (lowerKey.includes('colorspace')) {
            colorSpace = String(val);
          }

          const category = categorizeTag(groupKey, key);
          const isSensitive = SENSITIVE_TAG_NAMES.has(lowerKey);
          const isWritable = WRITABLE_TAG_NAMES.has(lowerKey);

          if (isSensitive) hasSensitiveData = true;

          tags.push({
            id: `${groupKey}_${key}`,
            name: key,
            displayName: key.replace(/([A-Z])/g, ' $1').trim(),
            value: formatTagValue(val),
            raw: val,
            category,
            group: groupKey.toUpperCase(),
            writable: isWritable,
            sensitive: isSensitive,
          });

          fieldCount++;
        }

        if (tags.length > 0) {
          groups.push({
            name: groupKey.toUpperCase(),
            category: tags[0].category,
            tags,
          });
        }
      }
    }

    // Also extract GPS specifically via exifr.gps if present
    try {
      const gpsData: any = await exifr.gps(file);
      if (gpsData && typeof gpsData.latitude === 'number' && typeof gpsData.longitude === 'number') {
        hasGps = true;
        hasSensitiveData = true;
        location = {
          latitude: gpsData.latitude,
          longitude: gpsData.longitude,
          altitude: typeof gpsData.altitude === 'number' ? gpsData.altitude : undefined,
        };
      }
    } catch {
      // No GPS or unparseable GPS
    }

    // Check ICC profile presence
    if (rawData.icc || rawData.ICC || rawData.Icc) {
      hasIccProfile = true;
    }
  } catch (err) {
    console.warn('exifr parse warning:', err);
  }

  return {
    groups,
    raw: rawData,
    fieldCount,
    location,
    dimensions: (dimensions && dimensions.width > 0 && dimensions.height > 0) ? dimensions : undefined,
    colorSpace,
    hasIccProfile,
    hasGps,
    hasSensitiveData,
  };
}
