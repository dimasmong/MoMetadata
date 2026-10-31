import { describe, it, expect } from 'vitest';
import { parseImageMetadata } from '../../src/core/parsers/imageParser';
import {
  editJpegMetadata,
  removeJpegMetadata,
  extractIccSegments,
  restoreIccSegments,
} from '../../src/core/writers/jpegWriter';
import {
  createSampleJpegWithMetadata,
  createBareJpeg,
} from '../fixtures/sampleFiles';

describe('JPEG Metadata Engine (Lossless EXIF Read/Write/Strip)', () => {
  it('correctly reads EXIF tags, GPS coordinates, and camera metadata', async () => {
    const buffer = createSampleJpegWithMetadata({
      artist: 'Dimas Mong',
      title: 'MoMetadata Scenic Photo',
      latitude: -6.2088,
      longitude: 106.8456,
    });

    const parsed = await parseImageMetadata(buffer);

    expect(parsed.fieldCount).toBeGreaterThan(0);
    expect(parsed.hasGps).toBe(true);
    expect(parsed.hasSensitiveData).toBe(true);
    expect(parsed.location).toBeDefined();
    expect(parsed.location?.latitude).toBeCloseTo(-6.2088, 2);
    expect(parsed.location?.longitude).toBeCloseTo(106.8456, 2);

    const allTags = parsed.groups.flatMap((g) => g.tags);
    const artistTag = allTags.find((t) => t.name === 'Artist');
    expect(artistTag).toBeDefined();
    expect(artistTag?.value).toBe('Dimas Mong');
  });

  it('losslessly edits metadata without recompression and verifies changes', async () => {
    const originalBuffer = createSampleJpegWithMetadata();

    const modifiedBuffer = editJpegMetadata(originalBuffer, {
      title: 'Updated Landscape Title',
      artist: 'Jane Doe',
      copyright: 'Copyright (c) 2026 Dimas Mong',
      comment: 'Custom losslessly written comment',
      gpsLatitude: 37.7749,
      gpsLongitude: -122.4194,
    });

    expect(modifiedBuffer.byteLength).toBeGreaterThan(100);

    // Re-parse modified buffer to verify genuine modifications
    const reloaded = await parseImageMetadata(modifiedBuffer);
    const tags = reloaded.groups.flatMap((g) => g.tags);

    const titleTag = tags.find((t) => t.name === 'ImageDescription');
    expect(titleTag?.value).toBe('Updated Landscape Title');

    const artistTag = tags.find((t) => t.name === 'Artist');
    expect(artistTag?.value).toBe('Jane Doe');

    const copyrightTag = tags.find((t) => t.name === 'Copyright');
    expect(copyrightTag?.value).toBe('Copyright (c) 2026 Dimas Mong');

    expect(reloaded.location).toBeDefined();
    expect(reloaded.location?.latitude).toBeCloseTo(37.7749, 2);
    expect(reloaded.location?.longitude).toBeCloseTo(-122.4194, 2);
  });

  it('removes GPS metadata while strictly preserving artist and other tags (Preset A)', async () => {
    const originalBuffer = createSampleJpegWithMetadata({
      artist: 'Dimas Mong',
      title: 'Keep this title',
      latitude: 40.7128,
      longitude: -74.006,
    });

    const cleanedBuffer = removeJpegMetadata(originalBuffer, 'gps');
    const reloaded = await parseImageMetadata(cleanedBuffer);

    // GPS must be stripped
    expect(reloaded.hasGps).toBe(false);
    expect(reloaded.location).toBeUndefined();

    // Artist and Title must remain intact!
    const tags = reloaded.groups.flatMap((g) => g.tags);
    const artistTag = tags.find((t) => t.name === 'Artist');
    expect(artistTag?.value).toBe('Dimas Mong');

    const titleTag = tags.find((t) => t.name === 'ImageDescription');
    expect(titleTag?.value).toBe('Keep this title');
  });

  it('removes all personal information (Preset B)', async () => {
    const originalBuffer = createSampleJpegWithMetadata({
      artist: 'Dimas Mong',
      latitude: 40.7128,
      longitude: -74.006,
    });

    const cleanedBuffer = removeJpegMetadata(originalBuffer, 'personal');
    const reloaded = await parseImageMetadata(cleanedBuffer);

    expect(reloaded.hasGps).toBe(false);

    const tags = reloaded.groups.flatMap((g) => g.tags);
    expect(tags.find((t) => t.name === 'Artist')).toBeUndefined();
    expect(tags.find((t) => t.name === 'CameraOwnerName')).toBeUndefined();

    // Hardware camera make/model can still be retained if safe
    const makeTag = tags.find((t) => t.name === 'Make');
    expect(makeTag?.value).toBe('Sony');
  });

  it('strips all writable EXIF metadata while preserving orientation if requested (Preset D)', async () => {
    const originalBuffer = createSampleJpegWithMetadata({ orientation: 6 });

    const cleanedBuffer = removeJpegMetadata(originalBuffer, 'all-writable', true, true);
    const reloaded = await parseImageMetadata(cleanedBuffer);

    // GPS and personal tags must be gone
    expect(reloaded.hasGps).toBe(false);
    const tags = reloaded.groups.flatMap((g) => g.tags);
    expect(tags.find((t) => t.name === 'Artist')).toBeUndefined();
    expect(tags.find((t) => t.name === 'Make')).toBeUndefined();

    // Orientation tag is preserved for correct rendering
    const orientationTag = tags.find((t) => t.name.toLowerCase().includes('orientation'));
    expect(orientationTag?.value).toBe('6');
  });

  it('preserves ICC segments across segment restoration', () => {
    // Construct mock JPEG with an APP2 ICC profile segment
    const bareJpeg = new Uint8Array(createBareJpeg());
    const iccData = new Uint8Array([
      0xFF, 0xE2, 0x00, 0x16, // APP2, length 22
      0x49, 0x43, 0x43, 0x5F, 0x50, 0x52, 0x4F, 0x46, 0x49, 0x4C, 0x45, 0x00, // ICC_PROFILE\0
      0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);

    // Insert ICC into JPEG
    const withIcc = new Uint8Array(bareJpeg.length + iccData.length);
    withIcc.set(bareJpeg.subarray(0, 2), 0); // SOI
    withIcc.set(iccData, 2);
    withIcc.set(bareJpeg.subarray(2), 2 + iccData.length);

    const segments = extractIccSegments(withIcc.buffer);
    expect(segments.length).toBe(1);
    expect(segments[0].byteLength).toBe(iccData.length);

    const restored = restoreIccSegments(bareJpeg.buffer, segments);
    const reExtracted = extractIccSegments(restored);
    expect(reExtracted.length).toBe(1);
  });
});
