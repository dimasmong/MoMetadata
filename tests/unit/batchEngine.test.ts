import { describe, it, expect } from 'vitest';
import { processLoadedFile, executeFileRemoval } from '../../src/core/engine';
import {
  createSampleJpegWithMetadata,
  createSamplePng,
  createCorruptedFile,
} from '../fixtures/sampleFiles';

describe('Batch Processing & Engine Error Handling', () => {
  it('processes multiple files in batch and correctly assigns individual statuses', async () => {
    const jpegBuf = createSampleJpegWithMetadata({ artist: 'Dimas Mong' });
    const pngBuf = createSamplePng();

    const file1 = new File([jpegBuf], 'sample1.jpg', { type: 'image/jpeg' });
    const file2 = new File([pngBuf], 'sample2.png', { type: 'image/png' });

    const record1 = await processLoadedFile(file1);
    const record2 = await processLoadedFile(file2);

    expect(record1.status).toBe('ready');
    expect(record1.detectedFormat).toBe('JPEG');
    expect(record1.metadata?.fieldCount).toBeGreaterThan(0);

    expect(record2.status).toBe('ready');
    expect(record2.detectedFormat).toBe('PNG');
  });

  it('handles duplicate file names gracefully with unique record IDs', async () => {
    const jpegBuf = createSampleJpegWithMetadata();
    const fileA = new File([jpegBuf], 'image.jpg', { type: 'image/jpeg' });
    const fileB = new File([jpegBuf], 'image.jpg', { type: 'image/jpeg' });

    const recA = await processLoadedFile(fileA);
    const recB = await processLoadedFile(fileB);

    expect(recA.id).not.toBe(recB.id);
    expect(recA.name).toBe('image.jpg');
    expect(recB.name).toBe('image.jpg');
  });

  it('handles unsupported or unknown files cleanly without crashing', async () => {
    const binary = new Uint8Array([0x7F, 0x45, 0x4C, 0x46, 0x02]); // ELF executable header
    const file = new File([binary], 'program.exe', { type: 'application/octet-stream' });

    const record = await processLoadedFile(file);

    expect(record.status).toBe('unsupported');
    expect(record.errorMessage).toBeDefined();
  });

  it('remains stable and does not throw on corrupt files', async () => {
    const corruptBuf = createCorruptedFile();
    const file = new File([corruptBuf], 'broken.jpg', { type: 'image/jpeg' });

    const record = await processLoadedFile(file);
    // Either unsupported or fails cleanly without throwing
    expect(['ready', 'unsupported', 'failed']).toContain(record.status);
  });

  it('produces proper output names (originalname_metadata-cleaned.ext)', async () => {
    const jpegBuf = createSampleJpegWithMetadata();
    const file = new File([jpegBuf], 'vacation_photo.jpeg', { type: 'image/jpeg' });

    const record = await processLoadedFile(file);
    const cleaned = await executeFileRemoval(record, 'gps');

    expect(cleaned.modifiedFileName).toBe('vacation_photo_metadata-cleaned.jpeg');
    expect(cleaned.status).toBe('completed');
  });
});
