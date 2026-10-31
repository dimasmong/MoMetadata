import piexif from 'piexifjs';
import { PDFDocument } from 'pdf-lib';
import { binaryStringToArrayBuffer, degToDms } from '../../src/core/writers/jpegWriter';

// Minimal 1x1 baseline JPEG bytes
const MINIMAL_JPEG = new Uint8Array([
  0xFF, 0xD8, // SOI
  0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
  0xFF, 0xDB, 0x00, 0x43, 0x00, ...Array(64).fill(1),
  0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00,
  0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0x50,
  0xFF, 0xD9 // EOI
]);

/**
 * Creates a real JPEG file with known EXIF, GPS, and metadata
 */
export function createSampleJpegWithMetadata(options?: {
  artist?: string;
  title?: string;
  latitude?: number;
  longitude?: number;
  orientation?: number;
}): ArrayBuffer {
  const binary = Array.from(MINIMAL_JPEG).map((b) => String.fromCharCode(b)).join('');

  const exifObj: any = {
    '0th': {
      [piexif.ImageIFD.Artist]: options?.artist ?? 'Dimas Mong',
      [piexif.ImageIFD.ImageDescription]: options?.title ?? 'Test Photo with GPS',
      [piexif.ImageIFD.Make]: 'Sony',
      [piexif.ImageIFD.Model]: 'ILCE-7RM4',
      [piexif.ImageIFD.Software]: 'Camera Firmware 2.0',
      [piexif.ImageIFD.Orientation]: options?.orientation ?? 1,
    },
    'Exif': {
      [piexif.ExifIFD.DateTimeOriginal]: '2026:10:31 15:00:00',
      [piexif.ExifIFD.UserComment]: 'Captured for MoMetadata QA test suite',
      [piexif.ExifIFD.FNumber]: [28, 10], // f/2.8
      [piexif.ExifIFD.ISOSpeedRatings]: 100,
      [piexif.ExifIFD.CameraOwnerName]: 'Dimas Mong',
    },
    'GPS': {},
  };

  const lat = options?.latitude ?? -6.2088;
  const lon = options?.longitude ?? 106.8456;

  exifObj['GPS'][piexif.GPSIFD.GPSLatitudeRef] = lat >= 0 ? 'N' : 'S';
  exifObj['GPS'][piexif.GPSIFD.GPSLatitude] = degToDms(lat);
  exifObj['GPS'][piexif.GPSIFD.GPSLongitudeRef] = lon >= 0 ? 'E' : 'W';
  exifObj['GPS'][piexif.GPSIFD.GPSLongitude] = degToDms(lon);
  exifObj['GPS'][piexif.GPSIFD.GPSAltitude] = [1500, 10]; // 150m

  const exifBytes = piexif.dump(exifObj);
  const updatedBinary = piexif.insert(exifBytes, binary);
  return binaryStringToArrayBuffer(updatedBinary);
}

/**
 * Creates a bare JPEG with no EXIF metadata
 */
export function createBareJpeg(): ArrayBuffer {
  return MINIMAL_JPEG.buffer.slice(0);
}

/**
 * Creates a valid PDF document with known properties
 */
export async function createSamplePdf(): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  doc.setTitle('MoMetadata Test Document');
  doc.setAuthor('Dimas Mong');
  doc.setSubject('Metadata Security and QA Verification');
  doc.setKeywords(['metadata', 'security', 'privacy', 'vitest', 'verified']);
  doc.setCreator('MoMetadata Engine');
  doc.setProducer('pdf-lib');

  const page = doc.addPage([500, 500]);
  page.drawText('MoMetadata Sample PDF Page Content');

  const bytes = await doc.save();
  return bytes.buffer as ArrayBuffer;
}

/**
 * Minimal 1x1 valid PNG buffer
 */
export function createSamplePng(): ArrayBuffer {
  const bytes = new Uint8Array([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk length 13
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89,
    0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, // IDAT chunk length 10
    0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
  ]);
  return bytes.buffer.slice(0);
}

/**
 * Minimal 1x1 valid WebP buffer
 */
export function createSampleWebp(): ArrayBuffer {
  const bytes = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x1A, 0x00, 0x00, 0x00, // RIFF
    0x57, 0x45, 0x42, 0x50, // WEBP
    0x56, 0x50, 0x38, 0x4C, // VP8L
    0x0E, 0x00, 0x00, 0x00,
    0x2F, 0x00, 0x00, 0x00, 0x00, 0x07, 0x88, 0x85, 0x85, 0x88, 0x00, 0x00, 0xFE, 0x01
  ]);
  return bytes.buffer.slice(0);
}

/**
 * Corrupted file buffer
 */
export function createCorruptedFile(): ArrayBuffer {
  const bytes = new Uint8Array([0x00, 0xFF, 0x42, 0x11, 0x99, 0x88, 0x77, 0x66]);
  return bytes.buffer.slice(0);
}
