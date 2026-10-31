import { PDFDocument } from 'pdf-lib';
import type { RemovalPreset } from '../../types/settings';

export interface PdfEditOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
}

export async function editPdfMetadata(buffer: ArrayBuffer, edits: PdfEditOptions): Promise<ArrayBuffer> {
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  if (edits.title !== undefined) pdfDoc.setTitle(edits.title);
  if (edits.author !== undefined) pdfDoc.setAuthor(edits.author);
  if (edits.subject !== undefined) pdfDoc.setSubject(edits.subject);
  if (edits.keywords !== undefined) pdfDoc.setKeywords(edits.keywords);
  if (edits.creator !== undefined) pdfDoc.setCreator(edits.creator);
  if (edits.producer !== undefined) pdfDoc.setProducer(edits.producer);

  pdfDoc.setModificationDate(new Date());

  const savedBytes = await pdfDoc.save();
  return savedBytes.buffer as ArrayBuffer;
}

export async function removePdfMetadata(buffer: ArrayBuffer, preset: RemovalPreset): Promise<ArrayBuffer> {
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  if (preset === 'all-writable' || preset === 'personal') {
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setCreator('');
    pdfDoc.setProducer('');
  } else if (preset === 'capture') {
    pdfDoc.setCreator('');
    pdfDoc.setProducer('');
  }

  pdfDoc.setModificationDate(new Date());

  const savedBytes = await pdfDoc.save();
  return savedBytes.buffer as ArrayBuffer;
}
