import { PDFDocument } from 'pdf-lib';
import type { CreatorInfo } from '../../types/metadata';

export interface PdfEditOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
}

export async function inspectPdfDocument(buffer: ArrayBuffer): Promise<{
  creator: CreatorInfo;
  rawTags: { tag: string; value: string }[];
}> {
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  
  const title = pdfDoc.getTitle() || undefined;
  const author = pdfDoc.getAuthor() || undefined;
  const subject = pdfDoc.getSubject() || undefined;
  const keywords = pdfDoc.getKeywords() || undefined;
  const creator = pdfDoc.getCreator() || undefined;
  const producer = pdfDoc.getProducer() || undefined;
  const creationDate = pdfDoc.getCreationDate();
  const modificationDate = pdfDoc.getModificationDate();

  const kwArray = keywords ? keywords.split(/[,;\s]+/).filter(Boolean) : [];

  const rawTags: { tag: string; value: string }[] = [];
  if (title) rawTags.push({ tag: 'Title', value: title });
  if (author) rawTags.push({ tag: 'Author', value: author });
  if (subject) rawTags.push({ tag: 'Subject', value: subject });
  if (keywords) rawTags.push({ tag: 'Keywords', value: keywords });
  if (creator) rawTags.push({ tag: 'Creator', value: creator });
  if (producer) rawTags.push({ tag: 'Producer', value: producer });
  if (creationDate) rawTags.push({ tag: 'CreationDate', value: creationDate.toISOString() });
  if (modificationDate) rawTags.push({ tag: 'ModDate', value: modificationDate.toISOString() });

  return {
    creator: {
      title,
      author,
      creator: creator && !creator.includes('pdf-lib') ? creator : author,
      subject,
      keywords: kwArray,
      comments: producer ? `Producer: ${producer}` : undefined
    },
    rawTags
  };
}

export async function editPdfMetadata(buffer: ArrayBuffer, options: PdfEditOptions): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  if (options.title !== undefined) pdfDoc.setTitle(options.title);
  if (options.author !== undefined) pdfDoc.setAuthor(options.author);
  if (options.subject !== undefined) pdfDoc.setSubject(options.subject);
  if (options.keywords !== undefined) pdfDoc.setKeywords(options.keywords);
  if (options.creator !== undefined) pdfDoc.setCreator(options.creator);
  if (options.producer !== undefined) pdfDoc.setProducer(options.producer);
  pdfDoc.setModificationDate(new Date());

  return await pdfDoc.save();
}

export async function stripPdfMetadata(buffer: ArrayBuffer): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  // Clear standard document properties
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setCreator('');
  pdfDoc.setProducer('');

  return await pdfDoc.save();
}
