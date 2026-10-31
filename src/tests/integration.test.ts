import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { inspectFile } from '../engines/core';
import { processFile } from '../engines/processor';
import { getCapabilitiesForFile } from '../types/capabilities';

const samplePhotoPath = path.resolve(__dirname, '../../public/samples/sample-photo.jpg');
const samplePaintingPath = path.resolve(__dirname, '../../public/samples/sample-painting.png');
const samplePdfPath = path.resolve(__dirname, '../../public/samples/sample-document.pdf');
const sampleWebpPath = path.resolve(__dirname, '../../public/samples/sample-illustration.webp');

describe('End-to-End Processing & Verification Suite', () => {
  it('E2E: inspects, strips GPS, and verifies sample-photo.jpg', async () => {
    const buffer = fs.readFileSync(samplePhotoPath);
    const file = new File([buffer], 'sample-photo.jpg', { type: 'image/jpeg' });

    // Step 1: Ingest & Inspect
    const originalMeta = await inspectFile(file);
    expect(originalMeta.location?.hasGps).toBe(true);
    expect(originalMeta.camera?.make).toBe('Canon');

    // Step 2: Remove GPS
    const result = await processFile(file, originalMeta, { action: 'remove_gps' });

    // Step 3: Verification Check
    expect(result.verification.status).toBe('verified');
    expect(result.parsedMetadata.location?.hasGps).toBe(false);
    expect(result.parsedMetadata.camera?.make).toBe('Canon');
    expect(result.blob.size).toBeGreaterThan(0);
  });

  it('E2E: inspects, edits metadata, and verifies sample-painting.png', async () => {
    const buffer = fs.readFileSync(samplePaintingPath);
    const file = new File([buffer], 'sample-painting.png', { type: 'image/png' });

    const originalMeta = await inspectFile(file);
    expect(originalMeta.creator?.title).toBe('Serene Mountain Valley at Sunset');

    const result = await processFile(file, originalMeta, {
      action: 'edit',
      editValues: {
        title: 'New Mountain Panorama',
        artist: 'Dimas Mong Masterpiece'
      }
    });

    expect(result.verification.status).toBe('verified');
    expect(result.parsedMetadata.creator?.title).toBe('New Mountain Panorama');
    expect(result.parsedMetadata.creator?.artist).toBe('Dimas Mong Masterpiece');
  });

  it('E2E: strips document properties and verifies sample-document.pdf', async () => {
    const buffer = fs.readFileSync(samplePdfPath);
    const file = new File([buffer], 'sample-document.pdf', { type: 'application/pdf' });

    const originalMeta = await inspectFile(file);
    expect(originalMeta.creator?.title).toBe('MoMetadata Architecture & Technical Specification');

    const result = await processFile(file, originalMeta, { action: 'remove_all' });
    expect(result.verification.status).toBe('verified');
    expect(result.parsedMetadata.creator?.title).toBeFalsy();
    expect(result.parsedMetadata.creator?.author).toBeFalsy();
  });

  it('E2E: sanitizes WebP illustration', async () => {
    const buffer = fs.readFileSync(sampleWebpPath);
    const file = new File([buffer], 'sample-illustration.webp', { type: 'image/webp' });

    const originalMeta = await inspectFile(file);
    const result = await processFile(file, originalMeta, { action: 'remove_all' });

    expect(result.verification.status).toBe('verified');
    expect(result.blob.size).toBeLessThan(file.size);
  });

  it('Capabilities: accurately marks video and uncommon formats as read-only', () => {
    const mp4Cap = getCapabilitiesForFile('recording.mp4', 'video/mp4');
    expect(mp4Cap.canInspect).toBe(true);
    expect(mp4Cap.canEdit).toBe(false);
    expect(mp4Cap.canRemoveAll).toBe(false);

    const tiffCap = getCapabilitiesForFile('archive.tiff', 'image/tiff');
    expect(tiffCap.canInspect).toBe(true);
    expect(tiffCap.canEdit).toBe(false);

    const heicCap = getCapabilitiesForFile('photo.heic', 'image/heic');
    expect(heicCap.canInspect).toBe(true);
    expect(heicCap.canEdit).toBe(false);
  });
});
