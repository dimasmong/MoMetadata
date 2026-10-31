import piexif from 'piexifjs';
import type { RemovalPreset } from '../../types/settings';

export interface JpegEditOptions {
  title?: string;
  artist?: string;
  copyright?: string;
  description?: string;
  comment?: string;
  dateOriginal?: string;
  dateModified?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAltitude?: number;
}

export function arrayBufferToBinaryString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 8192;
  let binary = '';
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return binary;
}

export function binaryStringToArrayBuffer(binary: string): ArrayBuffer {
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i) & 0xFF;
  }
  return bytes.buffer;
}

/**
 * Converts decimal degrees into EXIF rational DMS tuples
 */
export function degToDms(deg: number): [[number, number], [number, number], [number, number]] {
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60 * 100);
  return [[degrees, 1], [minutes, 1], [seconds, 100]];
}

/**
 * Extracts ICC profile (APP2 segments) from a JPEG buffer so it can be restored if needed
 */
export function extractIccSegments(buffer: ArrayBuffer): Uint8Array[] {
  const bytes = new Uint8Array(buffer);
  const iccSegments: Uint8Array[] = [];
  let offset = 2; // skip SOI (FF D8)

  while (offset < bytes.length - 1) {
    if (bytes[offset] !== 0xFF) break;
    const marker = bytes[offset + 1];
    if (marker === 0xDA || marker === 0xD9) break; // SOS or EOI

    const segLen = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (marker === 0xE2) { // APP2
      const id = String.fromCharCode(...bytes.subarray(offset + 4, offset + 15));
      if (id.startsWith('ICC_PROFILE')) {
        iccSegments.push(bytes.slice(offset, offset + 2 + segLen));
      }
    }
    offset += 2 + segLen;
  }

  return iccSegments;
}

/**
 * Re-inserts ICC segments right after SOI (0xFF, 0xD8)
 */
export function restoreIccSegments(buffer: ArrayBuffer, iccSegments: Uint8Array[]): ArrayBuffer {
  if (iccSegments.length === 0) return buffer;

  const totalIccLen = iccSegments.reduce((sum, seg) => sum + seg.byteLength, 0);
  const origBytes = new Uint8Array(buffer);
  const newBytes = new Uint8Array(origBytes.length + totalIccLen);

  newBytes[0] = origBytes[0];
  newBytes[1] = origBytes[1];

  let currentOffset = 2;
  for (const seg of iccSegments) {
    newBytes.set(seg, currentOffset);
    currentOffset += seg.byteLength;
  }

  newBytes.set(origBytes.subarray(2), currentOffset);
  return newBytes.buffer;
}

/**
 * Edits metadata in a JPEG buffer losslessly without recompressing image data
 */
export function editJpegMetadata(buffer: ArrayBuffer, edits: JpegEditOptions): ArrayBuffer {
  const binary = arrayBufferToBinaryString(buffer);
  let exifObj: any;

  try {
    exifObj = piexif.load(binary);
  } catch {
    exifObj = { '0th': {}, 'Exif': {}, 'GPS': {}, '1st': {}, 'thumbnail': null };
  }

  if (!exifObj['0th']) exifObj['0th'] = {};
  if (!exifObj['Exif']) exifObj['Exif'] = {};
  if (!exifObj['GPS']) exifObj['GPS'] = {};

  if (edits.title !== undefined) {
    exifObj['0th'][piexif.ImageIFD.ImageDescription] = edits.title;
  }

  if (edits.artist !== undefined) {
    exifObj['0th'][piexif.ImageIFD.Artist] = edits.artist;
  }

  if (edits.copyright !== undefined) {
    exifObj['0th'][piexif.ImageIFD.Copyright] = edits.copyright;
  }

  if (edits.description !== undefined) {
    exifObj['0th'][piexif.ImageIFD.ImageDescription] = edits.description;
  }

  if (edits.comment !== undefined) {
    exifObj['Exif'][piexif.ExifIFD.UserComment] = edits.comment;
  }

  if (edits.dateOriginal !== undefined) {
    const formatted = formatExifDate(edits.dateOriginal);
    exifObj['Exif'][piexif.ExifIFD.DateTimeOriginal] = formatted;
  }

  if (edits.dateModified !== undefined) {
    const formatted = formatExifDate(edits.dateModified);
    exifObj['0th'][piexif.ImageIFD.DateTime] = formatted;
  }

  // GPS coordinates
  if (edits.gpsLatitude !== undefined && edits.gpsLongitude !== undefined) {
    const lat = edits.gpsLatitude;
    const lon = edits.gpsLongitude;

    const latRef = lat >= 0 ? 'N' : 'S';
    const lonRef = lon >= 0 ? 'E' : 'W';

    exifObj['GPS'][piexif.GPSIFD.GPSLatitudeRef] = latRef;
    exifObj['GPS'][piexif.GPSIFD.GPSLatitude] = degToDms(lat);

    exifObj['GPS'][piexif.GPSIFD.GPSLongitudeRef] = lonRef;
    exifObj['GPS'][piexif.GPSIFD.GPSLongitude] = degToDms(lon);

    if (edits.gpsAltitude !== undefined) {
      const alt = edits.gpsAltitude;
      exifObj['GPS'][piexif.GPSIFD.GPSAltitudeRef] = alt >= 0 ? 0 : 1;
      exifObj['GPS'][piexif.GPSIFD.GPSAltitude] = [Math.round(Math.abs(alt) * 100), 100];
    }
  }

  const exifBytes = piexif.dump(exifObj);
  const updatedBinary = piexif.insert(exifBytes, binary);
  return binaryStringToArrayBuffer(updatedBinary);
}

/**
 * Removes metadata from a JPEG file according to the selected preset
 */
export function removeJpegMetadata(
  buffer: ArrayBuffer,
  preset: RemovalPreset,
  preserveIcc = true,
  preserveOrientation = true
): ArrayBuffer {
  const binary = arrayBufferToBinaryString(buffer);

  // Preserve ICC profile if requested
  const iccSegments = preserveIcc ? extractIccSegments(buffer) : [];

  let exifObj: any;
  try {
    exifObj = piexif.load(binary);
  } catch {
    return buffer;
  }

  // Preserve orientation if present
  let orientationTag: number | undefined;
  if (preserveOrientation && exifObj['0th'] && exifObj['0th'][piexif.ImageIFD.Orientation]) {
    orientationTag = exifObj['0th'][piexif.ImageIFD.Orientation];
  }

  if (preset === 'all-writable') {
    const strippedBinary = piexif.remove(binary);
    let outputBuffer = binaryStringToArrayBuffer(strippedBinary);

    if (preserveOrientation && orientationTag !== undefined) {
      const minimalExif = {
        '0th': { [piexif.ImageIFD.Orientation]: orientationTag },
        'Exif': {},
        'GPS': {},
      };
      const minimalBytes = piexif.dump(minimalExif);
      const inserted = piexif.insert(minimalBytes, arrayBufferToBinaryString(outputBuffer));
      outputBuffer = binaryStringToArrayBuffer(inserted);
    }

    if (preserveIcc && iccSegments.length > 0) {
      outputBuffer = restoreIccSegments(outputBuffer, iccSegments);
    }

    return outputBuffer;
  }

  if (preset === 'gps') {
    exifObj['GPS'] = {};
  } else if (preset === 'personal') {
    exifObj['GPS'] = {};
    if (exifObj['0th']) {
      delete exifObj['0th'][piexif.ImageIFD.Artist];
      delete exifObj['0th'][piexif.ImageIFD.Copyright];
      delete exifObj['0th'][piexif.ImageIFD.ImageDescription];
      delete exifObj['0th'][piexif.ImageIFD.Software];
    }
    if (exifObj['Exif']) {
      delete exifObj['Exif'][piexif.ExifIFD.UserComment];
      delete exifObj['Exif'][piexif.ExifIFD.CameraOwnerName];
      delete exifObj['Exif'][piexif.ExifIFD.BodySerialNumber];
      delete exifObj['Exif'][piexif.ExifIFD.LensSerialNumber];
      delete exifObj['Exif'][piexif.ExifIFD.LensMake];
      delete exifObj['Exif'][piexif.ExifIFD.LensModel];
    }
  } else if (preset === 'capture') {
    if (exifObj['0th']) {
      delete exifObj['0th'][piexif.ImageIFD.Make];
      delete exifObj['0th'][piexif.ImageIFD.Model];
      delete exifObj['0th'][piexif.ImageIFD.Software];
    }
    if (exifObj['Exif']) {
      delete exifObj['Exif'][piexif.ExifIFD.MakerNote];
      delete exifObj['Exif'][piexif.ExifIFD.ExposureTime];
      delete exifObj['Exif'][piexif.ExifIFD.FNumber];
      delete exifObj['Exif'][piexif.ExifIFD.ISOSpeedRatings];
      delete exifObj['Exif'][piexif.ExifIFD.FocalLength];
      delete exifObj['Exif'][piexif.ExifIFD.Flash];
      delete exifObj['Exif'][piexif.ExifIFD.WhiteBalance];
    }
  }

  const exifBytes = piexif.dump(exifObj);
  const updatedBinary = piexif.insert(exifBytes, binary);
  let outputBuffer = binaryStringToArrayBuffer(updatedBinary);

  if (preserveIcc && iccSegments.length > 0) {
    outputBuffer = restoreIccSegments(outputBuffer, iccSegments);
  }

  return outputBuffer;
}

function formatExifDate(input: string): string {
  try {
    const d = new Date(input);
    if (isNaN(d.getTime())) return input;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return input;
  }
}
