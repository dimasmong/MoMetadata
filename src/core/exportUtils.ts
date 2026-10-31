import JSZip from 'jszip';
import type { FileRecord, MetadataGroup } from '../types/metadata';

/**
 * Initiates an in-browser download of a Blob or ArrayBuffer
 */
export function downloadBuffer(buffer: ArrayBuffer, fileName: string, mimeType = 'application/octet-stream') {
  const blob = new Blob([buffer], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Exports metadata groups as clean JSON
 */
export function exportMetadataAsJson(groups: MetadataGroup[], fileName: string) {
  const output: Record<string, Record<string, unknown>> = {};

  for (const group of groups) {
    output[group.name] = {};
    for (const tag of group.tags) {
      output[group.name][tag.name] = tag.raw !== undefined ? tag.raw : tag.value;
    }
  }

  const jsonStr = JSON.stringify(output, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName.replace(/\.[^/.]+$/, '')}_metadata.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Exports metadata as CSV
 */
export function exportMetadataAsCsv(groups: MetadataGroup[], fileName: string) {
  const rows: string[] = ['"Group","Field Name","Category","Value","Writable"'];

  for (const group of groups) {
    for (const tag of group.tags) {
      const g = group.name.replace(/"/g, '""');
      const n = tag.displayName.replace(/"/g, '""');
      const c = tag.category;
      const v = String(tag.value).replace(/"/g, '""');
      const w = tag.writable ? 'Yes' : 'No';
      rows.push(`"${g}","${n}","${c}","${v}","${w}"`);
    }
  }

  const csvContent = '\uFEFF' + rows.join('\r\n'); // Include UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName.replace(/\.[^/.]+$/, '')}_metadata.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Packages all completed modified/cleaned files into a single ZIP archive
 */
export async function downloadBatchZip(files: FileRecord[], zipName = 'MoMetadata_Batch.zip'): Promise<void> {
  const zip = new JSZip();

  for (const file of files) {
    const buffer = file.modifiedBuffer || file.originalBuffer;
    if (buffer) {
      const name = file.modifiedFileName || file.name;
      zip.file(name, buffer);
    }
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
