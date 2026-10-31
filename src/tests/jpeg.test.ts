import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import ExifReader from 'exifreader';
import { editJpegMetadata, removeJpegGps, stripJpegMetadata } from '../engines/images/jpeg';

const samplePhotoPath = path.resolve(__dirname, '../../public/samples/sample-photo.jpg');

describe('JPEG Metadata Engine', () => {
  it('correctly extracts EXIF and GPS from real sample photo', async () => {
    const buffer = fs.readFileSync(samplePhotoPath);
    const tags = await ExifReader.load(buffer, { expanded: true });

    expect(tags.exif).toBeDefined();
    expect(tags.gps).toBeDefined();
    expect(tags.exif?.Make?.description).toBe('Canon');
    expect(tags.exif?.Model?.description).toBe('Canon EOS 5D Mark IV');
    expect(tags.gps?.Latitude).toBeCloseTo(37.7749, 2);
  });

  it('removes GPS location while preserving camera settings', async () => {
    const buffer = fs.readFileSync(samplePhotoPath);
    const u8 = new Uint8Array(buffer);

    const stripped = removeJpegGps(u8);
    const tags = await ExifReader.load(stripped.buffer as ArrayBuffer, { expanded: true });

    // GPS must be gone
    expect(tags.gps?.Latitude).toBeUndefined();

    // Camera must still be intact
    expect(tags.exif?.Make?.description).toBe('Canon');
    expect(tags.exif?.Model?.description).toBe('Canon EOS 5D Mark IV');
  });

  it('losslessly strips all non-essential metadata from JPEG', async () => {
    const buffer = fs.readFileSync(samplePhotoPath);
    const u8 = new Uint8Array(buffer);

    const clean = stripJpegMetadata(u8, true);

    // Verify SOI marker (0xFFD8)
    expect(clean[0]).toBe(0xff);
    expect(clean[1]).toBe(0xd8);

    // Verify size reduction
    expect(clean.length).toBeLessThan(u8.length);

    // Verify metadata was removed
    const tags = await ExifReader.load(clean.buffer as ArrayBuffer, { expanded: true });
    expect(tags.gps?.Latitude).toBeUndefined();
    expect(tags.exif?.Model).toBeUndefined();
  });

  it('edits EXIF metadata without recompressing DCT pixel payload', async () => {
    const buffer = fs.readFileSync(samplePhotoPath);
    const u8 = new Uint8Array(buffer);

    const edited = editJpegMetadata(u8, {
      title: 'Majestic Redwoods Morning',
      artist: 'Dimas Mong Editor Test',
      copyright: '© 2026 Dimas Mong'
    });

    const tags = await ExifReader.load(edited.buffer as ArrayBuffer, { expanded: true });
    expect(tags.exif?.ImageDescription?.description).toBe('Majestic Redwoods Morning');
    expect(tags.exif?.Artist?.description).toBe('Dimas Mong Editor Test');
    expect(tags.exif?.Copyright?.description).toBe('© 2026 Dimas Mong');
  });
});
