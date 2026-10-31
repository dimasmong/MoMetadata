import ExifReader from 'exifreader';
import { 
  ParsedMetadata, 
  FileInfo, 
  CameraInfo, 
  LocationInfo, 
  CreatorInfo, 
  TechnicalInfo, 
  RawTag 
} from '../types/metadata';
import { getCapabilitiesForFile } from '../types/capabilities';
import { analyzePrivacyRisks } from './privacy/analyzer';
import { getFileCategory, readFileAsArrayBuffer } from '../utils/fileHelper';
import { formatBytes, formatDuration, formatGpsCoordinate, generateMapUrl } from '../utils/formatters';
import { inspectPdfDocument } from './pdf/pdfEngine';
import { inspectMp3Tags } from './audio/mp3';
import { inspectOfficeDocument } from './office/openxml';

function normalizeGps(latVal?: any, latRef?: any, lonVal?: any, lonRef?: any): LocationInfo {
  if (latVal === undefined || lonVal === undefined) {
    return { hasGps: false };
  }

  let lat = typeof latVal === 'number' ? latVal : parseFloat(latVal);
  let lon = typeof lonVal === 'number' ? lonVal : parseFloat(lonVal);

  if (isNaN(lat) || isNaN(lon)) {
    return { hasGps: false };
  }

  if (latRef && typeof latRef === 'string' && latRef.toUpperCase().startsWith('S') && lat > 0) {
    lat = -lat;
  }
  if (lonRef && typeof lonRef === 'string' && lonRef.toUpperCase().startsWith('W') && lon > 0) {
    lon = -lon;
  }

  return {
    hasGps: true,
    latitude: lat,
    longitude: lon,
    latitudeFormatted: formatGpsCoordinate(lat, true),
    longitudeFormatted: formatGpsCoordinate(lon, false),
    mapUrl: generateMapUrl(lat, lon)
  };
}

/**
 * Probes HTML5 media element to retrieve exact duration and dimensions
 */
async function probeMediaElement(file: File, category: 'audio' | 'video'): Promise<{
  width?: number;
  height?: number;
  duration?: number;
}> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    if (category === 'video') {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const width = video.videoWidth;
        const height = video.videoHeight;
        const duration = video.duration;
        URL.revokeObjectURL(url);
        resolve({ width, height, duration });
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({});
      };
      video.src = url;
    } else {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        const duration = audio.duration;
        URL.revokeObjectURL(url);
        resolve({ duration });
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({});
      };
      audio.src = url;
    }
  });
}

/**
 * Main inspection function that parses all metadata truthfully across supported formats.
 */
export async function inspectFile(file: File): Promise<ParsedMetadata> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const category = getFileCategory(file.name, file.type);
  const buffer = await readFileAsArrayBuffer(file);
  const capabilities = getCapabilitiesForFile(file.name, file.type);

  const fileInfo: FileInfo = {
    name: file.name,
    size: file.size,
    sizeFormatted: formatBytes(file.size),
    type: file.type || `application/x-${ext}`,
    extension: ext,
    category,
    lastModified: file.lastModified
  };

  let camera: CameraInfo | undefined;
  let location: LocationInfo | undefined = { hasGps: false };
  let creator: CreatorInfo | undefined;
  let technical: TechnicalInfo | undefined;
  const rawTags: RawTag[] = [];

  // 1. PDF Documents
  if (ext === 'pdf') {
    try {
      const pdfRes = await inspectPdfDocument(buffer);
      creator = pdfRes.creator;
      for (const t of pdfRes.rawTags) {
        rawTags.push({
          id: `pdf-${t.tag}`,
          category: 'PDF',
          tag: t.tag,
          description: t.tag,
          value: t.value
        });
      }
    } catch {
      // PDF might be encrypted or malformed
    }
  }
  // 2. Office Open XML Documents
  else if (['docx', 'xlsx', 'pptx'].includes(ext)) {
    try {
      const officeRes = await inspectOfficeDocument(buffer);
      creator = officeRes.creator;
      for (const t of officeRes.rawTags) {
        rawTags.push({
          id: `office-${t.tag}`,
          category: 'Office',
          tag: t.tag,
          description: t.tag,
          value: t.value
        });
      }
    } catch {
      // Not a valid zip or corrupted
    }
  }
  // 3. MP3 Audio
  else if (ext === 'mp3') {
    try {
      const mp3Res = inspectMp3Tags(buffer);
      creator = mp3Res.creator;
      technical = mp3Res.technical;
      for (const t of mp3Res.rawTags) {
        rawTags.push({
          id: `mp3-${t.tag}`,
          category: 'ID3',
          tag: t.tag,
          description: t.tag,
          value: t.value
        });
      }
    } catch {
      // Not valid ID3
    }
  }

  // 4. ExifReader Inspection for Images, Videos, Audio containers
  try {
    const tags = await ExifReader.load(buffer, { expanded: true });

    // Iterate through all tag groups
    for (const groupKey of Object.keys(tags)) {
      const group = (tags as any)[groupKey];
      if (!group || typeof group !== 'object') continue;

      let categoryType: RawTag['category'] = 'Other';
      if (groupKey.toLowerCase() === 'exif') categoryType = 'EXIF';
      else if (groupKey.toLowerCase() === 'iptc') categoryType = 'IPTC';
      else if (groupKey.toLowerCase() === 'xmp') categoryType = 'XMP';
      else if (groupKey.toLowerCase() === 'gps') categoryType = 'GPS';
      else if (groupKey.toLowerCase() === 'png') categoryType = 'PNG';
      else if (groupKey.toLowerCase() === 'riff') categoryType = 'RIFF';

      for (const tagKey of Object.keys(group)) {
        const item = group[tagKey];
        if (item && item.description !== undefined) {
          rawTags.push({
            id: `${groupKey}-${tagKey}`,
            category: categoryType,
            tag: tagKey,
            description: item.description,
            value: String(item.description),
            raw: item.value
          });
        }
      }
    }

    // Camera mapping
    const exifGroup = (tags as any).exif || {};
    const ifd0 = exifGroup['0th'] || exifGroup;
    const ifdExif = exifGroup['Exif'] || exifGroup;

    const make = ifd0.Make?.description || (tags as any).Make?.description;
    const model = ifd0.Model?.description || (tags as any).Model?.description;
    const lens = ifdExif.LensModel?.description || (tags as any).LensModel?.description;
    const iso = ifdExif.ISOSpeedRatings?.description || (tags as any).ISOSpeedRatings?.description;
    const shutterSpeed = ifdExif.ExposureTime?.description || (tags as any).ExposureTime?.description;
    const aperture = ifdExif.FNumber?.description || (tags as any).FNumber?.description;
    const focalLength = ifdExif.FocalLength?.description || (tags as any).FocalLength?.description;
    const orientation = ifd0.Orientation?.description || (tags as any).Orientation?.description;
    const software = ifd0.Software?.description || (tags as any).Software?.description;
    const serial = ifdExif.BodySerialNumber?.description || (tags as any).SerialNumber?.description;

    if (make || model || lens || iso || shutterSpeed || aperture || focalLength || software) {
      camera = {
        make,
        model,
        lens,
        iso,
        shutterSpeed,
        aperture,
        focalLength,
        orientation,
        software,
        serialNumber: serial
      };
    }

    // Location / GPS mapping
    const gpsGroup = (tags as any).gps || {};
    const lat = gpsGroup.Latitude || (tags as any).GPSLatitude?.description;
    const latRef = gpsGroup.GPSLatitudeRef || (tags as any).GPSLatitudeRef?.value?.[0];
    const lon = gpsGroup.Longitude || (tags as any).GPSLongitude?.description;
    const lonRef = gpsGroup.GPSLongitudeRef || (tags as any).GPSLongitudeRef?.value?.[0];
    const alt = gpsGroup.Altitude || (tags as any).GPSAltitude?.description;

    const parsedLoc = normalizeGps(lat, latRef, lon, lonRef);
    if (parsedLoc.hasGps) {
      if (alt !== undefined) {
        parsedLoc.altitude = typeof alt === 'number' ? alt : parseFloat(alt);
        parsedLoc.altitudeFormatted = `${parsedLoc.altitude} m`;
      }
      location = parsedLoc;
    }

    // Creator / Copyright mapping
    const iptcGroup = (tags as any).iptc || {};
    const xmpGroup = (tags as any).xmp || {};
    const pngGroup = (tags as any).pngText || {};

    const title = iptcGroup['Object Name']?.description || xmpGroup.title?.description || (tags as any).ImageDescription?.description || pngGroup.Title?.description || creator?.title;
    const artist = iptcGroup['By-line']?.description || (tags as any).Artist?.description || pngGroup.Author?.description || creator?.artist;
    const copyright = (tags as any).Copyright?.description || xmpGroup.rights?.description || iptcGroup['Copyright Notice']?.description || pngGroup.Copyright?.description || creator?.copyright;
    const description = (tags as any).ImageDescription?.description || iptcGroup['Caption/Abstract']?.description || pngGroup.Description?.description || creator?.description;

    if (title || artist || copyright || description) {
      creator = {
        ...creator,
        title: title || creator?.title,
        artist: artist || creator?.artist,
        creator: artist || creator?.creator,
        copyright: copyright || creator?.copyright,
        description: description || creator?.description
      };
    }

    // Technical info mapping
    const colorSpace = (tags as any).ColorSpace?.description;
    const xRes = (tags as any).XResolution?.description;
    const yRes = (tags as any).YResolution?.description;

    if (colorSpace || xRes) {
      technical = {
        ...technical,
        colorSpace,
        xResolution: xRes,
        yResolution: yRes
      };
    }

    // Dimensions
    const widthTag = (tags as any)['Image Width']?.value || (tags as any).PixelXDimension?.value || (tags as any).ExifImageWidth?.value;
    const heightTag = (tags as any)['Image Height']?.value || (tags as any).PixelYDimension?.value || (tags as any).ExifImageHeight?.value;
    if (widthTag && heightTag) {
      fileInfo.dimensions = {
        width: Number(widthTag),
        height: Number(heightTag)
      };
    }
  } catch {
    // ExifReader fallback
  }

  // Probe media for audio/video duration and dimensions if missing
  if (typeof window !== 'undefined' && (category === 'audio' || category === 'video')) {
    try {
      const probed = await probeMediaElement(file, category);
      if (probed.width && probed.height) {
        fileInfo.dimensions = { width: probed.width, height: probed.height };
      }
      if (probed.duration) {
        fileInfo.duration = probed.duration;
        fileInfo.durationFormatted = formatDuration(probed.duration);
      }
    } catch {
      // probe failed
    }
  }

  // Create preview URL for images
  let previewUrl: string | undefined;
  if (typeof window !== 'undefined' && category === 'image' && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    previewUrl = URL.createObjectURL(file);
  }

  const sensitiveFindings = analyzePrivacyRisks(location, camera, creator, rawTags, capabilities.canRemoveAll);
  const hasMetadata = rawTags.length > 0 || !!camera || !!location.hasGps || !!creator;

  return {
    fileInfo,
    camera,
    location,
    creator,
    technical,
    rawTags,
    capabilities,
    sensitiveFindings,
    hasMetadata,
    previewUrl
  };
}
