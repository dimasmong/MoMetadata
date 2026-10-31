import { describe, it, expect } from 'vitest';
import { detectFileFormat, sanitizeMetadataString, cleanPlainText } from '../../src/core/formatDetector';
import { createSampleJpegWithMetadata, createSamplePng, createSampleWebp, createCorruptedFile } from '../fixtures/sampleFiles';

describe('Format Detector & Security Validation', () => {
  it('detects JPEG format from valid magic bytes', async () => {
    const buffer = createSampleJpegWithMetadata();
    const file = new File([buffer], 'photo.jpg', { type: 'image/jpeg' });
    const result = await detectFileFormat(file, buffer);

    expect(result.format).toBe('JPEG');
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.isValidSignature).toBe(true);
    expect(result.category).toBe('image');
  });

  it('detects PNG format from valid magic bytes', async () => {
    const buffer = createSamplePng();
    const file = new File([buffer], 'image.png', { type: 'image/png' });
    const result = await detectFileFormat(file, buffer);

    expect(result.format).toBe('PNG');
    expect(result.mimeType).toBe('image/png');
    expect(result.isValidSignature).toBe(true);
    expect(result.category).toBe('image');
  });

  it('detects WebP format from RIFF...WEBP header', async () => {
    const buffer = createSampleWebp();
    const file = new File([buffer], 'graphic.webp', { type: 'image/webp' });
    const result = await detectFileFormat(file, buffer);

    expect(result.format).toBe('WEBP');
    expect(result.mimeType).toBe('image/webp');
    expect(result.isValidSignature).toBe(true);
    expect(result.category).toBe('image');
  });

  it('flags spoofed extensions where content signature does not match', async () => {
    // An executable/corrupted file named .jpg
    const buffer = createCorruptedFile();
    const file = new File([buffer], 'spoofed.jpg', { type: 'image/jpeg' });
    const result = await detectFileFormat(file, buffer);

    expect(result.isValidSignature).toBe(false);
  });

  it('sanitizes metadata strings against XSS and HTML injection', () => {
    const malicious = '<script>alert("xss")</script>&<img src="x" onerror="steal()"/>';
    const sanitized = sanitizeMetadataString(malicious);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
    expect(sanitized).toContain('&amp;');
    expect(sanitized).toContain('&quot;');
  });

  it('cleans non-printable ASCII control characters in cleanPlainText', () => {
    const inputWithControl = 'Valid Title\x00\x08\x1F With Hidden Bytes';
    const cleaned = cleanPlainText(inputWithControl);

    expect(cleaned).toBe('Valid Title With Hidden Bytes');
    expect(cleaned).not.toContain('\x00');
    expect(cleaned).not.toContain('\x08');
  });
});
