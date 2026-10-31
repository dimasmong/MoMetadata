export interface DetectedFormatInfo {
  format: string;
  mimeType: string;
  category: 'image' | 'video' | 'audio' | 'document' | 'raw' | 'unknown';
  extension: string;
  isValidSignature: boolean;
}

/**
 * Validates the actual magic bytes (file signature) of a file buffer
 * to avoid spoofed extensions or malicious executables renamed as media.
 */
export async function detectFileFormat(file: File, buffer?: ArrayBuffer): Promise<DetectedFormatInfo> {
  const bytesToRead = Math.min(file.size, 64);
  let bytes: Uint8Array;

  if (buffer && buffer.byteLength >= bytesToRead) {
    bytes = new Uint8Array(buffer, 0, bytesToRead);
  } else {
    const slice = file.slice(0, bytesToRead);
    const sliceBuffer = await slice.arrayBuffer();
    bytes = new Uint8Array(sliceBuffer);
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  // 1. JPEG: FF D8 FF
  if (bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return {
      format: 'JPEG',
      mimeType: 'image/jpeg',
      category: 'image',
      extension: 'jpg',
      isValidSignature: true,
    };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4E &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0D &&
    bytes[5] === 0x0A &&
    bytes[6] === 0x1A &&
    bytes[7] === 0x0A
  ) {
    return {
      format: 'PNG',
      mimeType: 'image/png',
      category: 'image',
      extension: 'png',
      isValidSignature: true,
    };
  }

  // 3. WebP: RIFF....WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return {
      format: 'WEBP',
      mimeType: 'image/webp',
      category: 'image',
      extension: 'webp',
      isValidSignature: true,
    };
  }

  // 4. PDF: %PDF
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return {
      format: 'PDF',
      mimeType: 'application/pdf',
      category: 'document',
      extension: 'pdf',
      isValidSignature: true,
    };
  }

  // 5. FLAC: fLaC
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x66 &&
    bytes[1] === 0x4C &&
    bytes[2] === 0x61 &&
    bytes[3] === 0x43
  ) {
    return {
      format: 'FLAC',
      mimeType: 'audio/flac',
      category: 'audio',
      extension: 'flac',
      isValidSignature: true,
    };
  }

  // 6. MP3: ID3 header or sync frame
  if (
    (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) ||
    (bytes.length >= 2 && bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0)
  ) {
    return {
      format: 'MP3',
      mimeType: 'audio/mpeg',
      category: 'audio',
      extension: 'mp3',
      isValidSignature: true,
    };
  }

  // 7. MP4 / MOV / M4V / M4A / HEIC / AVIF: ftyp box at offset 4
  if (
    bytes.length >= 12 &&
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    const lowerBrand = brand.toLowerCase();

    if (lowerBrand.includes('avif')) {
      return {
        format: 'AVIF',
        mimeType: 'image/avif',
        category: 'image',
        extension: 'avif',
        isValidSignature: true,
      };
    }
    if (lowerBrand.includes('heic') || lowerBrand.includes('heix') || lowerBrand.includes('mif1') || lowerBrand.includes('msf1')) {
      return {
        format: 'HEIC',
        mimeType: 'image/heic',
        category: 'image',
        extension: 'heic',
        isValidSignature: true,
      };
    }
    if (lowerBrand.includes('m4a')) {
      return {
        format: 'M4A',
        mimeType: 'audio/mp4',
        category: 'audio',
        extension: 'm4a',
        isValidSignature: true,
      };
    }
    if (ext === 'mov' || lowerBrand.includes('qt')) {
      return {
        format: 'MOV',
        mimeType: 'video/quicktime',
        category: 'video',
        extension: 'mov',
        isValidSignature: true,
      };
    }

    return {
      format: 'MP4',
      mimeType: 'video/mp4',
      category: 'video',
      extension: 'mp4',
      isValidSignature: true,
    };
  }

  // 8. TIFF / DNG: Little-endian (II*\0) or Big-endian (MM\0*)
  if (
    bytes.length >= 4 &&
    ((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2A && bytes[3] === 0x00) ||
      (bytes[0] === 0x4D && bytes[1] === 0x4D && bytes[2] === 0x00 && bytes[3] === 0x2A))
  ) {
    if (['dng', 'cr2', 'nef', 'arw', 'orf', 'rw2'].includes(ext)) {
      return {
        format: ext.toUpperCase(),
        mimeType: 'image/x-raw',
        category: 'raw',
        extension: ext,
        isValidSignature: true,
      };
    }
    return {
      format: 'TIFF',
      mimeType: 'image/tiff',
      category: 'image',
      extension: 'tiff',
      isValidSignature: true,
    };
  }

  // Fallback to extension check if signature is uncommon
  const formatMap: Record<string, { format: string; mime: string; category: DetectedFormatInfo['category'] }> = {
    jpg: { format: 'JPEG', mime: 'image/jpeg', category: 'image' },
    jpeg: { format: 'JPEG', mime: 'image/jpeg', category: 'image' },
    png: { format: 'PNG', mime: 'image/png', category: 'image' },
    webp: { format: 'WEBP', mime: 'image/webp', category: 'image' },
    tif: { format: 'TIFF', mime: 'image/tiff', category: 'image' },
    tiff: { format: 'TIFF', mime: 'image/tiff', category: 'image' },
    heic: { format: 'HEIC', mime: 'image/heic', category: 'image' },
    avif: { format: 'AVIF', mime: 'image/avif', category: 'image' },
    pdf: { format: 'PDF', mime: 'application/pdf', category: 'document' },
    mp3: { format: 'MP3', mime: 'audio/mpeg', category: 'audio' },
    m4a: { format: 'M4A', mime: 'audio/mp4', category: 'audio' },
    flac: { format: 'FLAC', mime: 'audio/flac', category: 'audio' },
    mp4: { format: 'MP4', mime: 'video/mp4', category: 'video' },
    mov: { format: 'MOV', mime: 'video/quicktime', category: 'video' },
    m4v: { format: 'M4V', mime: 'video/x-m4v', category: 'video' },
    dng: { format: 'DNG', mime: 'image/x-adobe-dng', category: 'raw' },
  };

  if (formatMap[ext]) {
    return {
      format: formatMap[ext].format,
      mimeType: formatMap[ext].mime,
      category: formatMap[ext].category,
      extension: ext,
      isValidSignature: false, // Flagged because signature didn't match standard
    };
  }

  return {
    format: ext.toUpperCase() || 'UNKNOWN',
    mimeType: file.type || 'application/octet-stream',
    category: 'unknown',
    extension: ext,
    isValidSignature: false,
  };
}

/**
 * Sanitizes metadata strings to prevent XSS, HTML injection, and control characters
 */
export function sanitizeMetadataString(input: unknown): string {
  if (input === null || input === undefined) return '';
  const str = String(input);

  // Replace XML/HTML control characters
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Strip ASCII control codes
}

/**
 * Clean sanitization for safe plain text display (no HTML escape entities)
 */
export function cleanPlainText(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input)
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}
