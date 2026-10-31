import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { inspectOfficeDocument, editOfficeMetadata, stripOfficeMetadata } from '../engines/office/openxml';

async function createTestOfficeDoc(): Promise<ArrayBuffer> {
  const zip = new JSZip();
  const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:dcmitype="http://purl.org/dc/dcmitype/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Q4 Financial Report</dc:title>
  <dc:creator>Dimas Mong</dc:creator>
  <dc:description>Confidential internal projections</dc:description>
  <cp:keywords>finance, budget, 2026</cp:keywords>
</cp:coreProperties>`;

  zip.file('docProps/core.xml', coreXml);
  zip.file('word/document.xml', '<w:document><w:body><w:p><w:r><w:t>Hello World</w:t></w:r></w:p></w:body></w:document>');
  return await zip.generateAsync({ type: 'arraybuffer' });
}

describe('Office Open XML Metadata Engine', () => {
  it('correctly inspects docProps/core.xml package properties', async () => {
    const docBuffer = await createTestOfficeDoc();
    const { creator, rawTags } = await inspectOfficeDocument(docBuffer);

    expect(creator.title).toBe('Q4 Financial Report');
    expect(creator.creator).toBe('Dimas Mong');
    expect(creator.description).toBe('Confidential internal projections');
    expect(rawTags.length).toBeGreaterThanOrEqual(4);
  });

  it('safely edits core properties without touching document content', async () => {
    const docBuffer = await createTestOfficeDoc();
    const editedBuffer = await editOfficeMetadata(docBuffer, {
      title: 'Public Financial Summary',
      creator: 'MoMetadata Reviewer'
    });

    const { creator } = await inspectOfficeDocument(editedBuffer.buffer as ArrayBuffer);
    expect(creator.title).toBe('Public Financial Summary');
    expect(creator.creator).toBe('MoMetadata Reviewer');

    // Confirm document content remains untouched
    const zip = await JSZip.loadAsync(editedBuffer);
    const bodyXml = await zip.file('word/document.xml')?.async('text');
    expect(bodyXml).toContain('Hello World');
  });

  it('strips core properties to prevent metadata leaks', async () => {
    const docBuffer = await createTestOfficeDoc();
    const strippedBuffer = await stripOfficeMetadata(docBuffer);

    const { creator } = await inspectOfficeDocument(strippedBuffer.buffer as ArrayBuffer);
    expect(creator.title).toBeFalsy();
    expect(creator.creator).toBeFalsy();
  });
});
