import type { FileCategory } from '../types/metadata';

export function getFileCategory(filename: string, _mimeType?: string): FileCategory {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'tiff', 'tif', 'heic', 'heif', 'avif', 'svg', 'bmp'].includes(ext)) {
    return 'image';
  }
  if (['mp3', 'flac', 'wav', 'ogg', 'm4a', 'aac', 'aiff', 'wma'].includes(ext)) {
    return 'audio';
  }
  if (['mp4', 'm4v', 'mov', 'mkv', 'webm', 'avi', 'wmv'].includes(ext)) {
    return 'video';
  }
  if (['pdf', 'docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt', 'txt'].includes(ext)) {
    return 'document';
  }
  return 'other';
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function bufferToBinaryString(buffer: Uint8Array): string {
  let str = '';
  for (let i = 0; i < buffer.length; i++) {
    str += String.fromCharCode(buffer[i]);
  }
  return str;
}

export function binaryStringToBuffer(str: string): Uint8Array {
  const buf = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    buf[i] = str.charCodeAt(i) & 0xff;
  }
  return buf;
}

export async function readFileAsArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    return await file.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}
