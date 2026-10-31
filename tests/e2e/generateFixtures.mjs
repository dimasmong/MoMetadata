import fs from 'fs';
import path from 'path';
import piexif from 'piexifjs';
import { PDFDocument } from 'pdf-lib';

const MINIMAL_JPEG = Buffer.from([
  0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
  0xFF, 0xDB, 0x00, 0x43, 0x00, ...Array(64).fill(1),
  0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00,
  0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0x50, 0xFF, 0xD9
]);

function degToDms(deg) {
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60 * 100);
  return [[degrees, 1], [minutes, 1], [seconds, 100]];
}

async function run() {
  const dir = path.resolve('tests/e2e/fixtures');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const binary = Array.from(MINIMAL_JPEG).map((b) => String.fromCharCode(b)).join('');
  const exifObj = {
    '0th': {
      [piexif.ImageIFD.Artist]: 'Dimas Mong',
      [piexif.ImageIFD.ImageDescription]: 'MoMetadata E2E Test Image',
      [piexif.ImageIFD.Make]: 'Sony',
      [piexif.ImageIFD.Model]: 'ILCE-7RM4',
    },
    'Exif': {
      [piexif.ExifIFD.DateTimeOriginal]: '2026:10:31 15:00:00',
    },
    'GPS': {
      [piexif.GPSIFD.GPSLatitudeRef]: 'S',
      [piexif.GPSIFD.GPSLatitude]: degToDms(-6.2088),
      [piexif.GPSIFD.GPSLongitudeRef]: 'E',
      [piexif.GPSIFD.GPSLongitude]: degToDms(106.8456),
    },
  };
  const exifBytes = piexif.dump(exifObj);
  const updatedBinary = piexif.insert(exifBytes, binary);
  const jpegBuf = Buffer.from(updatedBinary, 'binary');
  fs.writeFileSync(path.join(dir, 'sample-photo.jpg'), jpegBuf);

  // PDF
  const doc = await PDFDocument.create();
  doc.setTitle('MoMetadata Test Document');
  doc.setAuthor('Dimas Mong');
  doc.setSubject('E2E Browser Test');
  doc.setKeywords(['metadata', 'security', 'verified']);
  doc.addPage([400, 400]);
  const pdfBytes = await doc.save();
  fs.writeFileSync(path.join(dir, 'sample-doc.pdf'), Buffer.from(pdfBytes));

  // PNG
  const pngBytes = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89,
    0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54,
    0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  fs.writeFileSync(path.join(dir, 'sample-image.png'), pngBytes);

  console.log('Fixtures created successfully!');
}

run();
