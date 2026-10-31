import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import ExifReader from 'exifreader';
import { parseWebpChunks, stripWebpMetadata } from '../engines/images/webp';

const sampleWebpPath = path.resolve(__dirname, '../../public/samples/sample-illustration.webp');

describe('WebP Metadata Engine', () => {
  it('correctly parses RIFF and WebP chunks from real illustration', () => {
    const buffer = fs.readFileSync(sampleWebpPath);
    const u8 = new Uint8Array(buffer);
    const { riffSize, chunks } = parseWebpChunks(u8);

    expect(riffSize).toBeGreaterThan(0);
    expect(chunks.some(c => c.fourCC === 'VP8X')).toBe(true);
    expect(chunks.some(c => c.fourCC === 'VP8 ')).toBe(true);
    expect(chunks.some(c => c.fourCC === 'EXIF')).toBe(true);
  });

  it('losslessly strips EXIF chunks and clears VP8X flags', async () => {
    const buffer = fs.readFileSync(sampleWebpPath);
    const u8 = new Uint8Array(buffer);

    const stripped = stripWebpMetadata(u8, true);
    const { chunks } = parseWebpChunks(stripped);

    // EXIF chunk must be gone
    expect(chunks.some(c => c.fourCC === 'EXIF')).toBe(false);

    // VP8X flags bit 3 (EXIF) must be cleared
    const vp8x = chunks.find(c => c.fourCC === 'VP8X');
    expect(vp8x).toBeDefined();
    if (vp8x) {
      expect((vp8x.data[0] & 0x08)).toBe(0);
    }

    // Size must be reduced
    expect(stripped.length).toBeLessThan(u8.length);

    // ExifReader verification
    const tags = await ExifReader.load(stripped.buffer as ArrayBuffer, { expanded: true });
    expect(tags.exif).toBeUndefined();
  });
});
