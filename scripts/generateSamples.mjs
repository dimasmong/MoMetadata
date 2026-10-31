import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import piexif from 'piexifjs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const samplesDir = path.join(__dirname, '../public/samples');

if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

// 1. Generate Sample 4: PDF Document
async function generateSamplePdf() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('MoMetadata Architecture & Technical Specification');
  pdfDoc.setAuthor('Dimas Mong');
  pdfDoc.setSubject('Client-Side File Metadata Inspection, Editing, and Privacy Analysis');
  pdfDoc.setKeywords(['metadata', 'exif', 'privacy', 'pdf-lib', 'client-side', 'mometadata']);
  pdfDoc.setCreator('MoMetadata Engine 1.0');
  pdfDoc.setProducer('pdf-lib v1.17.1');
  pdfDoc.setCreationDate(new Date('2026-10-31T10:00:00Z'));
  pdfDoc.setModificationDate(new Date('2026-10-31T12:00:00Z'));

  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawText('MoMetadata — Technical Specification', {
    x: 50,
    y: 780,
    size: 22,
    font: fontBold,
    color: rgb(0.14, 0.23, 0.45) // #243A73
  });

  page.drawText('Client-Side Metadata Inspector, Editor & Privacy Toolkit', {
    x: 50,
    y: 750,
    size: 13,
    font: font,
    color: rgb(0.3, 0.35, 0.45)
  });

  const bodyText = [
    'This sample PDF document is designed for testing metadata extraction, editing, and wiping.',
    '',
    'Embedded Document Properties:',
    '• Title: MoMetadata Architecture & Technical Specification',
    '• Author / Creator: Dimas Mong',
    '• Subject: Client-Side File Metadata Inspection, Editing, and Privacy Analysis',
    '• Keywords: metadata, exif, privacy, pdf-lib, client-side, mometadata',
    '• Producer: pdf-lib v1.17.1',
    '',
    'MoMetadata processes all files 100% locally in your browser memory.',
    'No files or private metadata are uploaded to remote servers.'
  ];

  let yPos = 700;
  for (const line of bodyText) {
    page.drawText(line, {
      x: 50,
      y: yPos,
      size: 11,
      font: line.startsWith('•') || line.startsWith('Embedded') ? fontBold : font,
      color: rgb(0.1, 0.1, 0.15)
    });
    yPos -= 22;
  }

  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(samplesDir, 'sample-document.pdf');
  fs.writeFileSync(filePath, Buffer.from(pdfBytes));
  console.log(`Generated: ${filePath} (${pdfBytes.length} bytes)`);
}

// 2. Generate Minimal Valid JPEG with Real EXIF + GPS
function generateSampleJpeg() {
  // A clean minimal 64x64 valid JPEG image with SOF0, DQT, DHT, SOS
  // We can construct a valid minimal JPEG base and inject complete EXIF tags via piexif
  // Minimal valid 1x1 JPEG:
  const minimalJpegBase64 = 
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
  
  const rawData = Buffer.from(minimalJpegBase64, 'base64');
  let binaryStr = '';
  for (let i = 0; i < rawData.length; i++) {
    binaryStr += String.fromCharCode(rawData[i]);
  }

  // Construct comprehensive EXIF tags
  const zeroth = {};
  const exif = {};
  const gps = {};

  zeroth[piexif.ImageIFD.Make] = 'Canon';
  zeroth[piexif.ImageIFD.Model] = 'Canon EOS 5D Mark IV';
  zeroth[piexif.ImageIFD.Software] = 'Adobe Photoshop Lightroom Classic 13.0 (Macintosh)';
  zeroth[piexif.ImageIFD.DateTime] = '2026:10:31 14:22:18';
  zeroth[piexif.ImageIFD.Artist] = 'Dimas Mong';
  zeroth[piexif.ImageIFD.ImageDescription] = 'Golden Gate Bridge Fog at Dusk';
  zeroth[piexif.ImageIFD.Copyright] = '© 2026 Dimas Mong. All rights reserved.';
  zeroth[piexif.ImageIFD.Orientation] = 1;

  exif[piexif.ExifIFD.DateTimeOriginal] = '2026:10:31 14:22:18';
  exif[piexif.ExifIFD.DateTimeDigitized] = '2026:10:31 14:22:18';
  exif[piexif.ExifIFD.ExposureTime] = [1, 500]; // 1/500s
  exif[piexif.ExifIFD.FNumber] = [28, 10]; // f/2.8
  exif[piexif.ExifIFD.ISOSpeedRatings] = 200;
  exif[piexif.ExifIFD.FocalLength] = [50, 1]; // 50mm
  exif[piexif.ExifIFD.LensModel] = 'EF 24-70mm f/2.8L II USM';
  exif[piexif.ExifIFD.BodySerialNumber] = 'CANON-5DMK4-8849201';

  // San Francisco Coordinates: 37° 46' 29.74" N, 122° 25' 9.89" W
  gps[piexif.GPSIFD.GPSLatitudeRef] = 'N';
  gps[piexif.GPSIFD.GPSLatitude] = [[37, 1], [46, 1], [2974, 100]];
  gps[piexif.GPSIFD.GPSLongitudeRef] = 'W';
  gps[piexif.GPSIFD.GPSLongitude] = [[122, 1], [25, 1], [989, 100]];
  gps[piexif.GPSIFD.GPSAltitudeRef] = 0;
  gps[piexif.GPSIFD.GPSAltitude] = [15, 1]; // 15 meters

  const exifObj = { '0th': zeroth, 'Exif': exif, 'GPS': gps, '1st': {}, 'Interop': {} };
  const exifBytes = piexif.dump(exifObj);
  const updatedBinary = piexif.insert(exifBytes, binaryStr);

  const outBuf = Buffer.from(updatedBinary, 'binary');
  const filePath = path.join(samplesDir, 'sample-photo.jpg');
  fs.writeFileSync(filePath, outBuf);
  console.log(`Generated: ${filePath} (${outBuf.length} bytes)`);
}

// 3. Generate Valid PNG with tEXt Chunks
// Standard IEEE 802.3 CRC32
function crc32(buf, offset, length) {
  let crc = 0xffffffff;
  for (let i = offset; i < offset + length; i++) {
    crc ^= buf[i];
    for (let k = 0; k < 8; k++) {
      crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makePngChunk(typeStr, dataBuf) {
  const len = dataBuf.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(typeStr, 4, 4, 'ascii');
  dataBuf.copy(chunk, 8);
  const crcVal = crc32(chunk, 4, 4 + len);
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

function makeTextChunk(keyword, text) {
  const kw = Buffer.from(keyword, 'latin1');
  const val = Buffer.from(text, 'utf-8');
  const data = Buffer.alloc(kw.length + 1 + val.length);
  kw.copy(data, 0);
  data[kw.length] = 0; // null separator
  val.copy(data, kw.length + 1);
  return makePngChunk('tEXt', data);
}

function generateSamplePng() {
  // Minimal valid 1x1 PNG components:
  // Signature: 89 50 4E 47 0D 0A 1A 0A
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  // IHDR: width=1, height=1, bit depth=8, color type=2 (RGB), def compression, def filter, no interlace
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(1, 0);
  ihdrData.writeUInt32BE(1, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // RGB
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makePngChunk('IHDR', ihdrData);

  // Metadata chunks
  const textChunks = [
    makeTextChunk('Title', 'Serene Mountain Valley at Sunset'),
    makeTextChunk('Author', 'Dimas Mong'),
    makeTextChunk('Description', 'A classical oil painting study of mountain vistas and alpine glow.'),
    makeTextChunk('Copyright', '© 2026 Dimas Mong. Licensed under Creative Commons BY 4.0.'),
    makeTextChunk('Software', 'Krita 5.2.2 Digital Painting Studio')
  ];

  // IDAT: compressed scanline: filter byte 0, R=50, G=120, B=200
  // zlib stream for: 0x00, 0x32, 0x78, 0xC8 -> 78 9c 63 60 66 60 70 02 00 01 f9 01 de
  const idatData = Buffer.from([0x78, 0x9c, 0x62, 0x32, 0x78, 0xc8, 0x00, 0x00, 0x02, 0x73, 0x01, 0x73]);
  const idatChunk = makePngChunk('IDAT', idatData);

  // IEND
  const iendChunk = makePngChunk('IEND', Buffer.alloc(0));

  const totalPng = Buffer.concat([sig, ihdrChunk, ...textChunks, idatChunk, iendChunk]);
  const filePath = path.join(samplesDir, 'sample-painting.png');
  fs.writeFileSync(filePath, totalPng);
  console.log(`Generated: ${filePath} (${totalPng.length} bytes)`);
}

// 4. Generate Valid WebP with RIFF EXIF/XMP Chunks
function generateSampleWebp() {
  // A minimal valid WebP file with VP8X + VP8 + EXIF chunk
  // Prepare EXIF data
  const zeroth = {};
  zeroth[piexif.ImageIFD.Make] = 'Studio Workstation';
  zeroth[piexif.ImageIFD.Model] = 'Digital Canvas Pro';
  zeroth[piexif.ImageIFD.Software] = 'Blender 4.2 & Adobe Photoshop';
  zeroth[piexif.ImageIFD.Artist] = 'Dimas Mong Studio';
  zeroth[piexif.ImageIFD.ImageDescription] = 'Neon Cyberpunk Metropolis Concept Art';
  zeroth[piexif.ImageIFD.Copyright] = '© 2026 Dimas Mong. All rights reserved.';
  
  const exifBytes = piexif.dump({ '0th': zeroth, 'Exif': {}, 'GPS': {}, '1st': {}, 'Interop': {} });
  // EXIF chunk data in WebP begins with 'Exif\0\0' followed by TIFF header (which piexif generates)
  const exifHeader = Buffer.from('Exif\0\0', 'latin1');
  const exifData = Buffer.concat([exifHeader, Buffer.from(exifBytes, 'binary')]);

  // VP8 chunk (minimal 1x1 keyframe)
  // 10 bytes VP8 frame header + data
  const vp8Data = Buffer.from([
    0x30, 0x01, 0x00, 0x9d, 0x01, 0x2a, 0x01, 0x00, 0x01, 0x00,
    0x02, 0x00, 0x34, 0x25, 0xa4, 0x00, 0x03, 0x70, 0x00, 0xfe, 0xfb, 0xfd, 0x50, 0x00
  ]);

  // VP8X extended chunk (10 bytes)
  // Flags: bit 3 (EXIF) = 0x08
  const vp8xData = Buffer.alloc(10);
  vp8xData[0] = 0x08; // EXIF flag set
  // Canvas width - 1 (1 - 1 = 0)
  vp8xData[4] = 0; vp8xData[5] = 0; vp8xData[6] = 0;
  // Canvas height - 1 (1 - 1 = 0)
  vp8xData[7] = 0; vp8xData[8] = 0; vp8xData[9] = 0;

  function makeRiffChunk(fourCC, data) {
    const len = data.length;
    const pad = len % 2 === 1 ? 1 : 0;
    const header = Buffer.alloc(8);
    header.write(fourCC, 0, 4, 'ascii');
    header.writeUInt32LE(len, 4);
    if (pad) {
      return Buffer.concat([header, data, Buffer.from([0])]);
    }
    return Buffer.concat([header, data]);
  }

  const vp8xChunk = makeRiffChunk('VP8X', vp8xData);
  const vp8Chunk = makeRiffChunk('VP8 ', vp8Data);
  const exifChunk = makeRiffChunk('EXIF', exifData);

  const riffBody = Buffer.concat([Buffer.from('WEBP', 'ascii'), vp8xChunk, vp8Chunk, exifChunk]);
  const riffHeader = Buffer.alloc(8);
  riffHeader.write('RIFF', 0, 4, 'ascii');
  riffHeader.writeUInt32LE(riffBody.length, 4);

  const totalWebp = Buffer.concat([riffHeader, riffBody]);
  const filePath = path.join(samplesDir, 'sample-illustration.webp');
  fs.writeFileSync(filePath, totalWebp);
  console.log(`Generated: ${filePath} (${totalWebp.length} bytes)`);
}

async function run() {
  console.log('Generating real sample test files...');
  await generateSamplePdf();
  generateSampleJpeg();
  generateSamplePng();
  generateSampleWebp();
  console.log('Sample generation complete!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
