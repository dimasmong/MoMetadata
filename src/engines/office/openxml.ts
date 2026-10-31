import JSZip from 'jszip';
import type { CreatorInfo } from '../../types/metadata';

export interface OfficeEditOptions {
  title?: string;
  creator?: string;
  description?: string;
  subject?: string;
  keywords?: string;
}

function extractXmlTag(xml: string, tagName: string): string | undefined {
  // Matches <dc:title>content</dc:title> or <tagName>content</tagName>
  const escaped = tagName.replace(':', '\\:');
  const regex = new RegExp(`<(?:${escaped})[^>]*>([\\s\\S]*?)<\\/(?:${escaped})>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : undefined;
}

function updateXmlTag(xml: string, tagName: string, value: string): string {
  const escaped = tagName.replace(':', '\\:');
  const regex = new RegExp(`(<(?:${escaped})[^>]*>)[\\s\\S]*?(<\\/(?:${escaped})>)`, 'i');
  if (regex.test(xml)) {
    return xml.replace(regex, `$1${value}$2`);
  }
  // If tag does not exist, insert before closing root tag </cp:coreProperties>
  const closeIdx = xml.lastIndexOf('</');
  if (closeIdx !== -1) {
    return `${xml.slice(0, closeIdx)}  <${tagName}>${value}</${tagName}>\n${xml.slice(closeIdx)}`;
  }
  return xml;
}

export async function inspectOfficeDocument(buffer: ArrayBuffer): Promise<{
  creator: CreatorInfo;
  rawTags: { tag: string; value: string }[];
}> {
  const zip = await JSZip.loadAsync(buffer);
  const coreXmlFile = zip.file('docProps/core.xml');

  if (!coreXmlFile) {
    return {
      creator: {},
      rawTags: []
    };
  }

  const xmlText = await coreXmlFile.async('text');

  const title = extractXmlTag(xmlText, 'dc:title') || extractXmlTag(xmlText, 'title');
  const creator = extractXmlTag(xmlText, 'dc:creator') || extractXmlTag(xmlText, 'creator');
  const description = extractXmlTag(xmlText, 'dc:description') || extractXmlTag(xmlText, 'description');
  const subject = extractXmlTag(xmlText, 'dc:subject') || extractXmlTag(xmlText, 'subject');
  const keywords = extractXmlTag(xmlText, 'cp:keywords') || extractXmlTag(xmlText, 'keywords');
  const lastModifiedBy = extractXmlTag(xmlText, 'cp:lastModifiedBy') || extractXmlTag(xmlText, 'lastModifiedBy');

  const rawTags: { tag: string; value: string }[] = [];
  if (title) rawTags.push({ tag: 'dc:title', value: title });
  if (creator) rawTags.push({ tag: 'dc:creator', value: creator });
  if (description) rawTags.push({ tag: 'dc:description', value: description });
  if (subject) rawTags.push({ tag: 'dc:subject', value: subject });
  if (keywords) rawTags.push({ tag: 'cp:keywords', value: keywords });
  if (lastModifiedBy) rawTags.push({ tag: 'cp:lastModifiedBy', value: lastModifiedBy });

  return {
    creator: {
      title,
      creator,
      author: creator,
      description,
      subject,
      keywords: keywords ? keywords.split(/[,;\s]+/).filter(Boolean) : undefined,
      comments: lastModifiedBy ? `Last Modified By: ${lastModifiedBy}` : undefined
    },
    rawTags
  };
}

export async function editOfficeMetadata(buffer: ArrayBuffer, options: OfficeEditOptions): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(buffer);
  let coreXmlText = await zip.file('docProps/core.xml')?.async('text');

  if (!coreXmlText) {
    coreXmlText = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:dcmitype="http://purl.org/dc/dcmitype/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
</cp:coreProperties>`;
  }

  if (options.title !== undefined) coreXmlText = updateXmlTag(coreXmlText, 'dc:title', options.title);
  if (options.creator !== undefined) coreXmlText = updateXmlTag(coreXmlText, 'dc:creator', options.creator);
  if (options.description !== undefined) coreXmlText = updateXmlTag(coreXmlText, 'dc:description', options.description);
  if (options.subject !== undefined) coreXmlText = updateXmlTag(coreXmlText, 'dc:subject', options.subject);
  if (options.keywords !== undefined) coreXmlText = updateXmlTag(coreXmlText, 'cp:keywords', options.keywords);

  zip.file('docProps/core.xml', coreXmlText);

  return await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}

export async function stripOfficeMetadata(buffer: ArrayBuffer): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(buffer);

  // Clean empty core properties
  const cleanCoreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:dcmitype="http://purl.org/dc/dcmitype/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
</cp:coreProperties>`;

  zip.file('docProps/core.xml', cleanCoreXml);
  zip.remove('docProps/custom.xml');

  return await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}
