import { crc32 } from '../../utils/crc32';

export interface PngEditOptions {
  title?: string;
  artist?: string;
  copyright?: string;
  description?: string;
  software?: string;
  comments?: string;
}

export interface PngChunk {
  type: string;
  data: Uint8Array;
  crc: number;
}

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

export function parsePngChunks(buffer: Uint8Array): PngChunk[] {
  // Validate signature
  if (buffer.length < 8) {
    throw new Error('File too small to be a valid PNG');
  }
  for (let i = 0; i < 8; i++) {
    if (buffer[i] !== PNG_SIGNATURE[i]) {
      throw new Error('Invalid PNG signature');
    }
  }

  const chunks: PngChunk[] = [];
  let offset = 8;
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) {
      break;
    }

    const length = view.getUint32(offset, false);
    offset += 4;

    const typeBytes = buffer.subarray(offset, offset + 4);
    const type = String.fromCharCode(...typeBytes);
    offset += 4;

    if (offset + length + 4 > buffer.length) {
      throw new Error(`Corrupted PNG chunk ${type}: unexpected end of file`);
    }

    const data = buffer.slice(offset, offset + length);
    offset += length;

    const crc = view.getUint32(offset, false);
    offset += 4;

    chunks.push({ type, data, crc });

    if (type === 'IEND') {
      break;
    }
  }

  return chunks;
}

export function buildPngFromChunks(chunks: PngChunk[]): Uint8Array {
  // Total size: 8 bytes header + for each chunk: 4 len + 4 type + data.length + 4 crc
  let totalLength = 8;
  for (const c of chunks) {
    totalLength += 12 + c.data.length;
  }

  const result = new Uint8Array(totalLength);
  result.set(PNG_SIGNATURE, 0);

  let offset = 8;
  const view = new DataView(result.buffer, result.byteOffset, result.byteLength);

  for (const c of chunks) {
    // Length
    view.setUint32(offset, c.data.length, false);
    offset += 4;

    // Type
    const typeOffset = offset;
    for (let i = 0; i < 4; i++) {
      result[offset++] = c.type.charCodeAt(i);
    }

    // Data
    result.set(c.data, offset);
    offset += c.data.length;

    // CRC computed over type + data
    const crcVal = crc32(result, typeOffset, 4 + c.data.length);
    view.setUint32(offset, crcVal, false);
    offset += 4;
  }

  return result;
}

function createTextChunk(keyword: string, text: string): PngChunk {
  const encoder = new TextEncoder();
  const kwBytes = encoder.encode(keyword);
  const textBytes = encoder.encode(text);

  const data = new Uint8Array(kwBytes.length + 1 + textBytes.length);
  data.set(kwBytes, 0);
  data[kwBytes.length] = 0; // null separator
  data.set(textBytes, kwBytes.length + 1);

  // Compute dummy CRC, buildPngFromChunks will recalculate correctly
  return {
    type: 'tEXt',
    data,
    crc: 0
  };
}

/**
 * Strips metadata chunks (tEXt, zTXt, iTXt, eXIf, tIME) from a PNG image.
 * Preserves IHDR, PLTE, tRNS, IDAT, IEND, and optionally iCCP.
 */
export function stripPngMetadata(buffer: Uint8Array, preserveICC = true): Uint8Array {
  const chunks = parsePngChunks(buffer);
  const filteredChunks = chunks.filter(c => {
    const t = c.type;
    if (['tEXt', 'zTXt', 'iTXt', 'eXIf', 'tIME'].includes(t)) {
      return false;
    }
    if (t === 'iCCP' && !preserveICC) {
      return false;
    }
    return true;
  });

  return buildPngFromChunks(filteredChunks);
}

/**
 * Edits textual metadata in a PNG image without re-encoding pixels.
 */
export function editPngMetadata(buffer: Uint8Array, options: PngEditOptions): Uint8Array {
  const chunks = parsePngChunks(buffer);

  // Remove existing metadata chunks matching our editable fields
  const preservedChunks = chunks.filter(c => {
    if (!['tEXt', 'iTXt', 'zTXt'].includes(c.type)) {
      return true;
    }
    // Check keyword
    let nullIdx = -1;
    for (let i = 0; i < c.data.length; i++) {
      if (c.data[i] === 0) {
        nullIdx = i;
        break;
      }
    }
    if (nullIdx > 0) {
      const kw = String.fromCharCode(...c.data.subarray(0, nullIdx));
      if (['Title', 'Author', 'Copyright', 'Description', 'Software', 'Comment'].includes(kw)) {
        return false;
      }
    }
    return true;
  });

  // Prepare new chunks
  const newChunks: PngChunk[] = [];
  if (options.title) newChunks.push(createTextChunk('Title', options.title));
  if (options.artist) newChunks.push(createTextChunk('Author', options.artist));
  if (options.copyright) newChunks.push(createTextChunk('Copyright', options.copyright));
  if (options.description) newChunks.push(createTextChunk('Description', options.description));
  if (options.software) newChunks.push(createTextChunk('Software', options.software));
  if (options.comments) newChunks.push(createTextChunk('Comment', options.comments));

  // Insert before first IDAT chunk
  const firstIdatIndex = preservedChunks.findIndex(c => c.type === 'IDAT');
  const insertIndex = firstIdatIndex !== -1 ? firstIdatIndex : preservedChunks.length - 1;

  preservedChunks.splice(insertIndex, 0, ...newChunks);

  return buildPngFromChunks(preservedChunks);
}
