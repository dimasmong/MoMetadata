import piexif from 'piexifjs';
import { bufferToBinaryString, binaryStringToBuffer } from '../../utils/fileHelper';

export interface JpegEditOptions {
  title?: string;
  artist?: string;
  copyright?: string;
  description?: string;
  software?: string;
  dateTime?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Converts decimal degrees to Piexif rational GPS coordinate format
 * e.g., 37.7749 -> [[37, 1], [46, 1], [2964, 100]]
 */
function degToGpsRational(deg: number): [[number, number], [number, number], [number, number]] {
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const minFloat = (abs - d) * 60;
  const m = Math.floor(minFloat);
  const s = Math.round((minFloat - m) * 60 * 100);
  return [[d, 1], [m, 1], [s, 100]];
}

/**
 * Losslessly strips metadata segments from a JPEG byte stream.
 * Preserves SOF, DQT, DHT, DRI, and all SOS compressed image scan data.
 * If preserveICC is true, APP2 ICC_PROFILE segments are retained.
 */
export function stripJpegMetadata(buffer: Uint8Array, preserveICC = true): Uint8Array {
  // Validate JPEG SOI marker (0xFFD8)
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error('Invalid JPEG: Missing SOI marker (0xFFD8)');
  }

  const chunks: Uint8Array[] = [];
  // Add SOI marker
  chunks.push(new Uint8Array([0xff, 0xd8]));

  let offset = 2;
  const len = buffer.length;

  while (offset < len) {
    if (buffer[offset] !== 0xff) {
      // Stream error or reached raw data
      break;
    }

    // Skip any fill bytes 0xFF
    while (offset < len && buffer[offset] === 0xff) {
      offset++;
    }

    if (offset >= len) break;

    const marker = buffer[offset];
    offset++;

    // SOS (Start of Scan) - reached compressed entropy payload
    if (marker === 0xda) {
      // Append the SOS marker and the rest of the entire file untouched
      chunks.push(buffer.subarray(offset - 2));
      break;
    }

    // Standalone markers without length: RST0-RST7 (0xD0-0xD7), SOI (0xD8), EOI (0xD9), TEM (0x01)
    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0xd8 || marker === 0xd9 || marker === 0x01) {
      chunks.push(new Uint8Array([0xff, marker]));
      if (marker === 0xd9) break; // End of image
      continue;
    }

    // Segment with length
    if (offset + 1 >= len) break;
    const segLength = (buffer[offset] << 8) | buffer[offset + 1];
    if (segLength < 2 || offset + segLength > len) break;

    const segStart = offset - 2; // includes 0xFF, marker
    const segEnd = offset + segLength;
    const segData = buffer.subarray(segStart, segEnd);

    // Identify segment type
    let shouldStrip = false;

    // APP1 (0xE1): EXIF & XMP
    if (marker === 0xe1) {
      shouldStrip = true;
    }
    // APP13 (0xED): Photoshop IPTC
    else if (marker === 0xed) {
      shouldStrip = true;
    }
    // COM (0xFE): JPEG Comment
    else if (marker === 0xfe) {
      shouldStrip = true;
    }
    // APP2 (0xE2): Could be ICC Profile or FlashPix
    else if (marker === 0xe2) {
      const isIcc = segLength > 14 &&
        buffer[offset + 2] === 0x49 && // 'I'
        buffer[offset + 3] === 0x43 && // 'C'
        buffer[offset + 4] === 0x43 && // 'C'
        buffer[offset + 5] === 0x5f && // '_'
        buffer[offset + 6] === 0x50 && // 'P'
        buffer[offset + 7] === 0x52 && // 'R'
        buffer[offset + 8] === 0x4f && // 'O'
        buffer[offset + 9] === 0x46 && // 'F'
        buffer[offset + 10] === 0x49 && // 'I'
        buffer[offset + 11] === 0x4c && // 'L'
        buffer[offset + 12] === 0x45;  // 'E'

      if (isIcc && preserveICC) {
        shouldStrip = false;
      } else {
        shouldStrip = true;
      }
    }

    if (!shouldStrip) {
      chunks.push(segData);
    }

    offset += segLength;
  }

  // Calculate total length
  const totalLength = chunks.reduce((acc, curr) => acc + curr.length, 0);
  const result = new Uint8Array(totalLength);
  let pos = 0;
  for (const chunk of chunks) {
    result.set(chunk, pos);
    pos += chunk.length;
  }

  return result;
}

/**
 * Removes GPS IFD from JPEG EXIF without altering other EXIF tags or image data
 */
export function removeJpegGps(buffer: Uint8Array): Uint8Array {
  const binaryStr = bufferToBinaryString(buffer);
  let exifObj: any;

  try {
    exifObj = piexif.load(binaryStr);
  } catch {
    // If piexif cannot parse existing EXIF, strip metadata safely
    return stripJpegMetadata(buffer, true);
  }

  // Clear GPS dictionary
  exifObj['GPS'] = {};

  const exifBytes = piexif.dump(exifObj);
  const updatedBinary = piexif.insert(exifBytes, binaryStr);
  return binaryStringToBuffer(updatedBinary);
}

/**
 * Edits EXIF metadata in a JPEG file without touching compressed pixel scan data
 */
export function editJpegMetadata(buffer: Uint8Array, options: JpegEditOptions): Uint8Array {
  const binaryStr = bufferToBinaryString(buffer);
  let exifObj: any;

  try {
    exifObj = piexif.load(binaryStr);
  } catch {
    exifObj = {
      '0th': {},
      'Exif': {},
      'GPS': {},
      '1st': {},
      'Interop': {}
    };
  }

  if (!exifObj['0th']) exifObj['0th'] = {};
  if (!exifObj['Exif']) exifObj['Exif'] = {};
  if (!exifObj['GPS']) exifObj['GPS'] = {};

  // Standard Image IFD tags
  if (options.title !== undefined) {
    exifObj['0th'][piexif.ImageIFD.ImageDescription] = options.title;
  }
  if (options.artist !== undefined) {
    exifObj['0th'][piexif.ImageIFD.Artist] = options.artist;
  }
  if (options.copyright !== undefined) {
    exifObj['0th'][piexif.ImageIFD.Copyright] = options.copyright;
  }
  if (options.software !== undefined) {
    exifObj['0th'][piexif.ImageIFD.Software] = options.software;
  }
  if (options.dateTime !== undefined) {
    // Standard EXIF date format: "YYYY:MM:DD HH:MM:SS"
    const formattedDate = options.dateTime.replace(/-/g, ':');
    exifObj['0th'][piexif.ImageIFD.DateTime] = formattedDate;
    exifObj['Exif'][piexif.ExifIFD.DateTimeOriginal] = formattedDate;
  }

  // GPS tags
  if (options.latitude !== undefined && options.longitude !== undefined) {
    const latRational = degToGpsRational(options.latitude);
    const lonRational = degToGpsRational(options.longitude);

    exifObj['GPS'][piexif.GPSIFD.GPSLatitudeRef] = options.latitude >= 0 ? 'N' : 'S';
    exifObj['GPS'][piexif.GPSIFD.GPSLatitude] = latRational;
    exifObj['GPS'][piexif.GPSIFD.GPSLongitudeRef] = options.longitude >= 0 ? 'E' : 'W';
    exifObj['GPS'][piexif.GPSIFD.GPSLongitude] = lonRational;
  }

  const exifBytes = piexif.dump(exifObj);
  const updatedBinary = piexif.insert(exifBytes, binaryStr);
  return binaryStringToBuffer(updatedBinary);
}
