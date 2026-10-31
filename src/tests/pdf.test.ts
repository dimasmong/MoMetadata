import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { inspectPdfDocument, editPdfMetadata, stripPdfMetadata } from '../engines/pdf/pdfEngine';

const samplePdfPath = path.resolve(__dirname, '../../public/samples/sample-document.pdf');

describe('PDF Metadata Engine', () => {
  it('correctly extracts metadata from real sample PDF document', async () => {
    const buffer = fs.readFileSync(samplePdfPath);
    const { creator, rawTags } = await inspectPdfDocument(buffer.buffer);

    expect(creator.title).toBe('MoMetadata Architecture & Technical Specification');
    expect(creator.author).toBe('Dimas Mong');
    expect(creator.subject).toBe('Client-Side File Metadata Inspection, Editing, and Privacy Analysis');
    expect(creator.keywords).toContain('metadata');
    expect(creator.keywords).toContain('privacy');
    expect(rawTags.length).toBeGreaterThanOrEqual(4);
  });

  it('edits PDF document info dictionary properties', async () => {
    const buffer = fs.readFileSync(samplePdfPath);
    const edited = await editPdfMetadata(buffer.buffer, {
      title: 'Updated MoMetadata Security Audit',
      author: 'Dimas Mong QA Lead',
      subject: 'Regression Testing'
    });

    const { creator } = await inspectPdfDocument(edited.buffer as ArrayBuffer);
    expect(creator.title).toBe('Updated MoMetadata Security Audit');
    expect(creator.author).toBe('Dimas Mong QA Lead');
    expect(creator.subject).toBe('Regression Testing');
  });

  it('strips PDF document metadata', async () => {
    const buffer = fs.readFileSync(samplePdfPath);
    const stripped = await stripPdfMetadata(buffer.buffer);

    const { creator } = await inspectPdfDocument(stripped.buffer as ArrayBuffer);
    expect(creator.title).toBeFalsy();
    expect(creator.author).toBeFalsy();
    expect(creator.subject).toBeFalsy();
    expect(creator.keywords?.length || 0).toBe(0);
  });
});
