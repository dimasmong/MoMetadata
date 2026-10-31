import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import ExifReader from 'exifreader';
import { parsePngChunks, stripPngMetadata, editPngMetadata } from '../engines/images/png';

const samplePaintingPath = path.resolve(__dirname, '../../public/samples/sample-painting.png');

describe('PNG Metadata Engine', () => {
  it('correctly parses PNG chunks from real sample painting', () => {
    const buffer = fs.readFileSync(samplePaintingPath);
    const u8 = new Uint8Array(buffer);
    const chunks = parsePngChunks(u8);

    expect(chunks.length).toBeGreaterThan(3);
    expect(chunks[0].type).toBe('IHDR');
    expect(chunks.some(c => c.type === 'tEXt')).toBe(true);
    expect(chunks.some(c => c.type === 'IDAT')).toBe(true);
    expect(chunks[chunks.length - 1].type).toBe('IEND');
  });

  it('strips textual metadata while preserving IHDR, IDAT, and IEND losslessly', async () => {
    const buffer = fs.readFileSync(samplePaintingPath);
    const u8 = new Uint8Array(buffer);

    const stripped = stripPngMetadata(u8, true);
    const strippedChunks = parsePngChunks(stripped);

    expect(strippedChunks.some(c => c.type === 'tEXt')).toBe(false);
    expect(strippedChunks.some(c => c.type === 'IHDR')).toBe(true);
    expect(strippedChunks.some(c => c.type === 'IDAT')).toBe(true);
    expect(strippedChunks[strippedChunks.length - 1].type).toBe('IEND');
    expect(stripped.length).toBeLessThan(u8.length);

    // Verify ExifReader can read valid image without text tags
    const tags = await ExifReader.load(stripped.buffer as ArrayBuffer, { expanded: true });
    expect(tags.pngText).toBeUndefined();
  });

  it('edits PNG metadata chunks with valid CRC32 validation', async () => {
    const buffer = fs.readFileSync(samplePaintingPath);
    const u8 = new Uint8Array(buffer);

    const edited = editPngMetadata(u8, {
      title: 'Misty Forest Dawn Study',
      artist: 'Dimas Mong PNG Artist',
      description: 'Updated digital brushwork study'
    });

    const tags = await ExifReader.load(edited.buffer as ArrayBuffer, { expanded: true });
    const textGroup = (tags as any).pngText || {};
    expect(textGroup.Title?.description).toBe('Misty Forest Dawn Study');
    expect(textGroup.Author?.description).toBe('Dimas Mong PNG Artist');
  });
});
