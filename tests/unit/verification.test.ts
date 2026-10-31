import { describe, it, expect } from 'vitest';
import { verifyMetadataOperation } from '../../src/core/verification';
import { parseImageMetadata } from '../../src/core/parsers/imageParser';
import { removeJpegMetadata, editJpegMetadata } from '../../src/core/writers/jpegWriter';
import { createSampleJpegWithMetadata } from '../fixtures/sampleFiles';

describe('Verification Engine', () => {
  it('returns PASS when GPS is successfully removed', async () => {
    const origBuffer = createSampleJpegWithMetadata({ latitude: -6.2088, longitude: 106.8456 });
    const origMeta = await parseImageMetadata(origBuffer);

    const cleanedBuffer = removeJpegMetadata(origBuffer, 'gps');

    const result = await verifyMetadataOperation(cleanedBuffer, {
      format: 'JPEG',
      operation: 'remove',
      preset: 'gps',
      originalMetadata: origMeta,
    });

    expect(result.verified).toBe(true);
    expect(result.status).toBe('pass');
    expect(result.removedTags.length).toBeGreaterThan(0);
    expect(result.unexpectedRetainedTags.length).toBe(0);
  });

  it('returns PASS when all writable metadata is stripped', async () => {
    const origBuffer = createSampleJpegWithMetadata();
    const origMeta = await parseImageMetadata(origBuffer);

    const cleanedBuffer = removeJpegMetadata(origBuffer, 'all-writable');

    const result = await verifyMetadataOperation(cleanedBuffer, {
      format: 'JPEG',
      operation: 'remove',
      preset: 'all-writable',
      originalMetadata: origMeta,
    });

    expect(result.verified).toBe(true);
    expect(result.status).toBe('pass');
    expect(result.unexpectedRetainedTags.length).toBe(0);
  });

  it('detects and passes when expected edit tags are confirmed in output', async () => {
    const origBuffer = createSampleJpegWithMetadata();
    const origMeta = await parseImageMetadata(origBuffer);

    const editedBuffer = editJpegMetadata(origBuffer, {
      artist: 'Dimas Mong',
      title: 'QA Verified Output',
    });

    const result = await verifyMetadataOperation(editedBuffer, {
      format: 'JPEG',
      operation: 'edit',
      expectedEdits: {
        artist: 'Dimas Mong',
        title: 'QA Verified Output',
      },
      originalMetadata: origMeta,
    });

    expect(result.verified).toBe(true);
    expect(result.status).toBe('pass');
    expect(result.modifiedTags).toContain('artist');
  });

  it('returns FAIL on corrupted output buffer', async () => {
    const corruptBuffer = new Uint8Array([0x00, 0x01, 0x02, 0x03]).buffer;

    const result = await verifyMetadataOperation(corruptBuffer, {
      format: 'JPEG',
      operation: 'remove',
      preset: 'gps',
    });

    // When parsing fails or corrupts, it must not claim success
    expect(['fail', 'warning']).toContain(result.status);
  });
});
