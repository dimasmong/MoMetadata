import { describe, it, expect } from 'vitest';
import { parsePdfMetadata } from '../../src/core/parsers/pdfParser';
import { editPdfMetadata, removePdfMetadata } from '../../src/core/writers/pdfWriter';
import { createSamplePdf } from '../fixtures/sampleFiles';

describe('PDF Document Properties Engine', () => {
  it('correctly reads PDF document properties', async () => {
    const pdfBuffer = await createSamplePdf();
    const parsed = await parsePdfMetadata(pdfBuffer);

    expect(parsed.fieldCount).toBeGreaterThan(0);
    const tags = parsed.groups.flatMap((g) => g.tags);

    const titleTag = tags.find((t) => t.name === 'Title');
    expect(titleTag?.value).toBe('MoMetadata Test Document');

    const authorTag = tags.find((t) => t.name === 'Author');
    expect(authorTag?.value).toBe('Dimas Mong');

    const subjectTag = tags.find((t) => t.name === 'Subject');
    expect(subjectTag?.value).toBe('Metadata Security and QA Verification');

    const keywordsTag = tags.find((t) => t.name === 'Keywords');
    expect(keywordsTag?.value).toContain('privacy');
  });

  it('edits PDF document properties and verifies updated output', async () => {
    const pdfBuffer = await createSamplePdf();

    const modified = await editPdfMetadata(pdfBuffer, {
      title: 'Updated PDF Manual',
      author: 'Jane Doe',
      subject: 'Security Documentation',
      keywords: ['clean', 'verified', 'audit'],
    });

    expect(modified.byteLength).toBeGreaterThan(500);

    const reloaded = await parsePdfMetadata(modified);
    const tags = reloaded.groups.flatMap((g) => g.tags);

    const titleTag = tags.find((t) => t.name === 'Title');
    expect(titleTag?.value).toBe('Updated PDF Manual');

    const authorTag = tags.find((t) => t.name === 'Author');
    expect(authorTag?.value).toBe('Jane Doe');

    const keywordsTag = tags.find((t) => t.name === 'Keywords');
    expect(keywordsTag?.value).toContain('audit');
  });

  it('strips all writable PDF properties (Preset all-writable)', async () => {
    const pdfBuffer = await createSamplePdf();

    const cleaned = await removePdfMetadata(pdfBuffer, 'all-writable');
    const reloaded = await parsePdfMetadata(cleaned);

    const tags = reloaded.groups.flatMap((g) => g.tags);
    expect(tags.find((t) => t.name === 'Title')).toBeUndefined();
    expect(tags.find((t) => t.name === 'Author')).toBeUndefined();
    expect(tags.find((t) => t.name === 'Subject')).toBeUndefined();
  });
});
