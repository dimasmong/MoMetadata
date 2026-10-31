import { PDFDocument } from 'pdf-lib';
import type { MetadataGroup, MetadataTag, ParsedMetadata } from '../../types/metadata';
import { cleanPlainText } from '../formatDetector';

export async function parsePdfMetadata(file: File | ArrayBuffer): Promise<ParsedMetadata> {
  const groups: MetadataGroup[] = [];
  const rawData: Record<string, unknown> = {};
  const tags: MetadataTag[] = [];
  let fieldCount = 0;
  let hasSensitiveData = false;

  try {
    const buffer = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const subject = pdfDoc.getSubject();
    const keywords = pdfDoc.getKeywords();
    const creator = pdfDoc.getCreator();
    const producer = pdfDoc.getProducer();
    const creationDate = pdfDoc.getCreationDate();
    const modificationDate = pdfDoc.getModificationDate();
    const pageCount = pdfDoc.getPageCount();

    rawData.title = title;
    rawData.author = author;
    rawData.subject = subject;
    rawData.keywords = keywords;
    rawData.creator = creator;
    rawData.producer = producer;
    rawData.creationDate = creationDate;
    rawData.modificationDate = modificationDate;
    rawData.pageCount = pageCount;

    const addTag = (
      id: string,
      name: string,
      displayName: string,
      value: string | number | boolean | undefined | null,
      category: 'general' | 'description' | 'advanced',
      sensitive = false
    ) => {
      if (value === undefined || value === null || value === '') return;
      if (sensitive) hasSensitiveData = true;

      tags.push({
        id,
        name,
        displayName,
        value: cleanPlainText(String(value)),
        raw: value,
        category,
        group: 'PDF',
        writable: true,
        sensitive,
      });
      fieldCount++;
    };

    addTag('pdf_title', 'Title', 'Title', title, 'description', false);
    addTag('pdf_author', 'Author', 'Author / Creator', author, 'description', true);
    addTag('pdf_subject', 'Subject', 'Subject', subject, 'description', false);
    addTag('pdf_keywords', 'Keywords', 'Keywords', keywords, 'description', false);
    addTag('pdf_creator', 'Creator', 'Creator Software', creator, 'description', true);
    addTag('pdf_producer', 'Producer', 'Producer Library', producer, 'advanced', false);
    addTag('pdf_creationDate', 'CreationDate', 'Creation Date', creationDate ? creationDate.toISOString() : undefined, 'general', false);
    addTag('pdf_modDate', 'ModificationDate', 'Modification Date', modificationDate ? modificationDate.toISOString() : undefined, 'general', false);
    addTag('pdf_pageCount', 'PageCount', 'Total Pages', pageCount, 'general', false);

    if (tags.length > 0) {
      groups.push({
        name: 'PDF DOCUMENT PROPERTIES',
        category: 'description',
        tags,
      });
    }
  } catch (err) {
    console.warn('PDF parsing error:', err);
  }

  return {
    groups,
    raw: rawData,
    fieldCount,
    hasIccProfile: false,
    hasGps: false,
    hasSensitiveData,
  };
}
