import { ParsedMetadata, ProcessedOutput } from '../types/metadata';
import { readFileAsArrayBuffer } from '../utils/fileHelper';
import { editJpegMetadata, removeJpegGps, stripJpegMetadata } from './images/jpeg';
import { editPngMetadata, stripPngMetadata } from './images/png';
import { stripWebpMetadata } from './images/webp';
import { editPdfMetadata, stripPdfMetadata } from './pdf/pdfEngine';
import { editMp3Metadata, stripMp3Metadata } from './audio/mp3';
import { editOfficeMetadata, stripOfficeMetadata } from './office/openxml';
import { verifyProcessedOutput } from './verification/verifier';

export interface ProcessActionOptions {
  action: 'remove_gps' | 'remove_all' | 'edit';
  editValues?: {
    title?: string;
    artist?: string;
    creator?: string;
    author?: string;
    copyright?: string;
    description?: string;
    software?: string;
    comments?: string;
    album?: string;
    year?: string;
    genre?: string;
    dateTime?: string;
    latitude?: number;
    longitude?: number;
  };
  preserveICC?: boolean;
}

export async function processFile(
  file: File,
  originalMetadata: ParsedMetadata,
  options: ProcessActionOptions
): Promise<ProcessedOutput> {
  const ext = originalMetadata.fileInfo.extension.toLowerCase();
  const rawBuffer = await readFileAsArrayBuffer(file);
  const u8Buffer = new Uint8Array(rawBuffer);
  const preserveICC = options.preserveICC ?? true;

  let outputBuffer: Uint8Array;

  // 1. REMOVE GPS
  if (options.action === 'remove_gps') {
    if (['jpg', 'jpeg'].includes(ext)) {
      outputBuffer = removeJpegGps(u8Buffer);
    } else if (['png', 'webp'].includes(ext)) {
      // For PNG/WebP, strip metadata chunks containing GPS
      outputBuffer = ext === 'png' ? stripPngMetadata(u8Buffer, preserveICC) : stripWebpMetadata(u8Buffer, preserveICC);
    } else {
      throw new Error(`GPS removal is not applicable or supported for .${ext} files.`);
    }
  }
  // 2. REMOVE ALL NON-ESSENTIAL METADATA
  else if (options.action === 'remove_all') {
    if (['jpg', 'jpeg'].includes(ext)) {
      outputBuffer = stripJpegMetadata(u8Buffer, preserveICC);
    } else if (ext === 'png') {
      outputBuffer = stripPngMetadata(u8Buffer, preserveICC);
    } else if (ext === 'webp') {
      outputBuffer = stripWebpMetadata(u8Buffer, preserveICC);
    } else if (ext === 'pdf') {
      outputBuffer = await stripPdfMetadata(rawBuffer);
    } else if (ext === 'mp3') {
      outputBuffer = stripMp3Metadata(u8Buffer);
    } else if (['docx', 'xlsx', 'pptx'].includes(ext)) {
      outputBuffer = await stripOfficeMetadata(rawBuffer);
    } else {
      throw new Error(`Metadata stripping is not supported for .${ext} files.`);
    }
  }
  // 3. EDIT METADATA
  else if (options.action === 'edit') {
    const edits = options.editValues || {};
    if (['jpg', 'jpeg'].includes(ext)) {
      outputBuffer = editJpegMetadata(u8Buffer, {
        title: edits.title,
        artist: edits.artist || edits.creator || edits.author,
        copyright: edits.copyright,
        description: edits.description,
        software: edits.software,
        dateTime: edits.dateTime,
        latitude: edits.latitude,
        longitude: edits.longitude
      });
    } else if (ext === 'png') {
      outputBuffer = editPngMetadata(u8Buffer, {
        title: edits.title,
        artist: edits.artist || edits.author || edits.creator,
        copyright: edits.copyright,
        description: edits.description,
        software: edits.software,
        comments: edits.comments
      });
    } else if (ext === 'pdf') {
      outputBuffer = await editPdfMetadata(rawBuffer, {
        title: edits.title,
        author: edits.author || edits.artist || edits.creator,
        subject: edits.description,
        creator: edits.software || 'MoMetadata',
        producer: 'pdf-lib'
      });
    } else if (ext === 'mp3') {
      outputBuffer = editMp3Metadata(rawBuffer, {
        title: edits.title,
        artist: edits.artist || edits.creator,
        album: edits.album,
        year: edits.year,
        genre: edits.genre,
        comment: edits.comments
      });
    } else if (['docx', 'xlsx', 'pptx'].includes(ext)) {
      outputBuffer = await editOfficeMetadata(rawBuffer, {
        title: edits.title,
        creator: edits.creator || edits.artist || edits.author,
        description: edits.description
      });
    } else {
      throw new Error(`Editing is not supported for .${ext} files.`);
    }
  } else {
    throw new Error('Unknown operation type');
  }

  // Create generated output file
  const mimeType = file.type || 'application/octet-stream';
  const outBlob = new Blob([outputBuffer.buffer as ArrayBuffer], { type: mimeType });
  const outFile = new File([outBlob], file.name, {
    type: mimeType,
    lastModified: Date.now()
  });

  // Verify generated output
  const { newMetadata, verification } = await verifyProcessedOutput(originalMetadata, outFile, {
    operationType: options.action,
    editedFields: options.editValues
  });

  return {
    file: outFile,
    blob: outBlob,
    parsedMetadata: newMetadata,
    verification,
    operationType: options.action
  };
}
