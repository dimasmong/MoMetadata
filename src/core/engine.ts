import type { FileRecord, ParsedMetadata } from '../types/metadata';
import { detectFileFormat } from './formatDetector';
import { parseImageMetadata } from './parsers/imageParser';
import { parsePdfMetadata } from './parsers/pdfParser';
import { parseAudioMetadata } from './parsers/audioParser';
import { parseVideoMetadata } from './parsers/videoParser';
import { editJpegMetadata, removeJpegMetadata } from './writers/jpegWriter';
import type { JpegEditOptions } from './writers/jpegWriter';
import { editPdfMetadata, removePdfMetadata } from './writers/pdfWriter';
import type { PdfEditOptions } from './writers/pdfWriter';
import { executeWasmExifTool } from './writers/wasmWriter';
import { verifyMetadataOperation } from './verification';
import type { RemovalPreset } from '../types/settings';
import { getCapabilityForFormat } from './capabilityRegistry';

export async function processLoadedFile(file: File): Promise<FileRecord> {
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const detection = await detectFileFormat(file);

  const capability = getCapabilityForFormat(detection.format);
  if (!capability || !capability.readSupport) {
    return {
      id: fileId,
      file,
      name: file.name,
      size: file.size,
      type: file.type || detection.mimeType,
      detectedFormat: detection.format,
      status: 'unsupported',
      errorMessage: `Format ${detection.format} is currently unsupported.`,
    };
  }

  let metadata: ParsedMetadata;
  let previewUrl: string | undefined;
  let buffer: ArrayBuffer | undefined;

  try {
    buffer = await file.arrayBuffer();

    if (detection.category === 'image' || detection.category === 'raw') {
      metadata = await parseImageMetadata(buffer);
      if (detection.category === 'image') {
        previewUrl = URL.createObjectURL(file);
      }
    } else if (detection.category === 'document' && detection.format === 'PDF') {
      metadata = await parsePdfMetadata(buffer);
    } else if (detection.category === 'audio') {
      const audioResult = await parseAudioMetadata(file);
      metadata = audioResult;
      previewUrl = audioResult.coverUrl;
    } else if (detection.category === 'video') {
      metadata = await parseVideoMetadata(file);
      previewUrl = URL.createObjectURL(file);
    } else {
      metadata = {
        groups: [],
        raw: {},
        fieldCount: 0,
        hasIccProfile: false,
        hasGps: false,
        hasSensitiveData: false,
      };
    }

    return {
      id: fileId,
      file,
      name: file.name,
      size: file.size,
      type: file.type || detection.mimeType,
      detectedFormat: detection.format,
      status: 'ready',
      metadata,
      previewUrl,
      originalBuffer: buffer,
      selected: true,
    };
  } catch (err: any) {
    return {
      id: fileId,
      file,
      name: file.name,
      size: file.size,
      type: file.type || detection.mimeType,
      detectedFormat: detection.format,
      status: 'failed',
      errorMessage: err?.message || 'Failed to parse file metadata',
    };
  }
}

export interface EngineEditPayload {
  title?: string;
  author?: string;
  copyright?: string;
  description?: string;
  keywords?: string[];
  comment?: string;
  dateOriginal?: string;
  dateModified?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAltitude?: number;
}

export async function executeFileEdit(
  fileRecord: FileRecord,
  edits: EngineEditPayload
): Promise<FileRecord> {
  const format = fileRecord.detectedFormat.toUpperCase();
  const capability = getCapabilityForFormat(format);

  if (!capability || !capability.editSupport) {
    throw new Error(`Editing metadata is not supported for ${format} files.`);
  }

  const originalBuffer = fileRecord.originalBuffer || (await fileRecord.file.arrayBuffer());
  let modifiedBuffer: ArrayBuffer;

  if (format === 'JPEG') {
    const jpegEdits: JpegEditOptions = {
      title: edits.title,
      artist: edits.author,
      copyright: edits.copyright,
      description: edits.description,
      comment: edits.comment,
      dateOriginal: edits.dateOriginal,
      dateModified: edits.dateModified,
      gpsLatitude: edits.gpsLatitude,
      gpsLongitude: edits.gpsLongitude,
      gpsAltitude: edits.gpsAltitude,
    };
    modifiedBuffer = editJpegMetadata(originalBuffer, jpegEdits);
  } else if (format === 'PDF') {
    const pdfEdits: PdfEditOptions = {
      title: edits.title,
      author: edits.author,
      subject: edits.description,
      keywords: edits.keywords,
      creator: edits.author,
    };
    modifiedBuffer = await editPdfMetadata(originalBuffer, pdfEdits);
  } else if (format === 'PNG' || format === 'WEBP' || format === 'TIFF') {
    // Use ExifTool WebWorker
    const tags: Record<string, string | number | boolean> = {};
    if (edits.title) tags['Title'] = edits.title;
    if (edits.author) tags['Author'] = edits.author;
    if (edits.description) tags['Description'] = edits.description;
    if (edits.copyright) tags['Copyright'] = edits.copyright;
    if (edits.comment) tags['Comment'] = edits.comment;
    if (edits.gpsLatitude !== undefined && edits.gpsLongitude !== undefined) {
      tags['GPSLatitude'] = edits.gpsLatitude;
      tags['GPSLongitude'] = edits.gpsLongitude;
    }

    const wasmResult = await executeWasmExifTool({
      type: 'write',
      fileName: fileRecord.name,
      buffer: originalBuffer,
      tags,
    });
    modifiedBuffer = wasmResult as ArrayBuffer;
  } else {
    throw new Error(`Unsupported write format: ${format}`);
  }

  // Filter out empty edits for accurate verification
  const expectedEdits: Record<string, any> = {};
  for (const [k, v] of Object.entries(edits)) {
    if (v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0)) {
      expectedEdits[k] = v;
    }
  }

  // Verification
  const verification = await verifyMetadataOperation(modifiedBuffer, {
    format,
    operation: 'edit',
    expectedEdits,
    originalMetadata: fileRecord.metadata,
  });

  // Re-parse modified metadata for accurate display
  let newMetadata: ParsedMetadata | undefined;
  try {
    if (format === 'PDF') {
      newMetadata = await parsePdfMetadata(modifiedBuffer);
    } else {
      newMetadata = await parseImageMetadata(modifiedBuffer);
    }
  } catch {
    newMetadata = fileRecord.metadata;
  }

  const nameParts = fileRecord.name.split('.');
  const ext = nameParts.pop() || '';
  const base = nameParts.join('.');
  const modifiedFileName = `${base}_metadata-edited.${ext}`;

  return {
    ...fileRecord,
    modifiedBuffer,
    modifiedFileName,
    metadata: newMetadata,
    verification,
    lastAction: 'edited',
    status: verification.verified ? 'completed' : 'failed',
    errorMessage: verification.verified ? undefined : verification.message,
  };
}

export async function executeFileRemoval(
  fileRecord: FileRecord,
  preset: RemovalPreset,
  preserveIcc = true,
  preserveRendering = true
): Promise<FileRecord> {
  const format = fileRecord.detectedFormat.toUpperCase();
  const capability = getCapabilityForFormat(format);

  if (!capability || !capability.removeSupport) {
    throw new Error(`Removing metadata is not supported for ${format} files.`);
  }

  const originalBuffer = fileRecord.originalBuffer || (await fileRecord.file.arrayBuffer());
  let modifiedBuffer: ArrayBuffer;

  if (format === 'JPEG') {
    modifiedBuffer = removeJpegMetadata(originalBuffer, preset, preserveIcc, preserveRendering);
  } else if (format === 'PDF') {
    modifiedBuffer = await removePdfMetadata(originalBuffer, preset);
  } else if (format === 'PNG' || format === 'WEBP' || format === 'TIFF') {
    let args: string[] = [];
    if (preset === 'gps') {
      args = ['-gps:all='];
    } else if (preset === 'personal') {
      args = ['-gps:all=', '-Author=', '-Artist=', '-Creator=', '-Copyright='];
    } else if (preset === 'capture') {
      args = ['-Make=', '-Model=', '-Lens=', '-Software='];
    } else {
      // all-writable
      args = ['-all='];
      if (preserveIcc) {
        args.push('--icc_profile:all');
      }
    }

    const wasmResult = await executeWasmExifTool({
      type: 'strip',
      fileName: fileRecord.name,
      buffer: originalBuffer,
      args,
    });
    modifiedBuffer = wasmResult as ArrayBuffer;
  } else {
    throw new Error(`Unsupported removal format: ${format}`);
  }

  // Verification
  const verification = await verifyMetadataOperation(modifiedBuffer, {
    format,
    operation: 'remove',
    preset,
    originalMetadata: fileRecord.metadata,
  });

  // Re-parse modified metadata
  let newMetadata: ParsedMetadata | undefined;
  try {
    if (format === 'PDF') {
      newMetadata = await parsePdfMetadata(modifiedBuffer);
    } else {
      newMetadata = await parseImageMetadata(modifiedBuffer);
    }
  } catch {
    newMetadata = fileRecord.metadata;
  }

  const nameParts = fileRecord.name.split('.');
  const ext = nameParts.pop() || '';
  const base = nameParts.join('.');
  const modifiedFileName = `${base}_metadata-cleaned.${ext}`;

  return {
    ...fileRecord,
    modifiedBuffer,
    modifiedFileName,
    metadata: newMetadata,
    verification,
    lastAction: 'cleaned',
    status: verification.verified ? 'completed' : 'failed',
    errorMessage: verification.verified ? undefined : verification.message,
  };
}
