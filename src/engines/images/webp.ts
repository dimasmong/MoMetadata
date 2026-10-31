export interface WebpChunk {
  fourCC: string;
  data: Uint8Array;
}

export function parseWebpChunks(buffer: Uint8Array): { riffSize: number; chunks: WebpChunk[] } {
  if (buffer.length < 12) {
    throw new Error('File too small to be a valid WebP');
  }

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const riff = String.fromCharCode(buffer[0], buffer[1], buffer[2], buffer[3]);
  const webp = String.fromCharCode(buffer[8], buffer[9], buffer[10], buffer[11]);

  if (riff !== 'RIFF' || webp !== 'WEBP') {
    throw new Error('Not a valid RIFF/WEBP file');
  }

  const riffSize = view.getUint32(4, true);
  const chunks: WebpChunk[] = [];
  let offset = 12;

  while (offset + 8 <= buffer.length) {
    const fourCC = String.fromCharCode(
      buffer[offset],
      buffer[offset + 1],
      buffer[offset + 2],
      buffer[offset + 3]
    );
    offset += 4;

    const chunkSize = view.getUint32(offset, true);
    offset += 4;

    if (offset + chunkSize > buffer.length) {
      throw new Error(`Corrupted WebP chunk ${fourCC}: size exceeds file length`);
    }

    const data = buffer.slice(offset, offset + chunkSize);
    chunks.push({ fourCC, data });

    offset += chunkSize;
    // RIFF chunks are padded to even 16-bit boundaries
    if (chunkSize % 2 === 1) {
      offset += 1;
    }
  }

  return { riffSize, chunks };
}

export function buildWebpFromChunks(chunks: WebpChunk[]): Uint8Array {
  // Calculate total body length
  let totalDataLength = 4; // 'WEBP'
  for (const c of chunks) {
    totalDataLength += 8 + c.data.length + (c.data.length % 2 === 1 ? 1 : 0);
  }

  const totalFileSize = 8 + totalDataLength;
  const result = new Uint8Array(totalFileSize);
  const view = new DataView(result.buffer, result.byteOffset, result.byteLength);

  // 'RIFF'
  result[0] = 0x52; result[1] = 0x49; result[2] = 0x46; result[3] = 0x46;
  // Size = totalFileSize - 8
  view.setUint32(4, totalFileSize - 8, true);
  // 'WEBP'
  result[8] = 0x57; result[9] = 0x45; result[10] = 0x42; result[11] = 0x50;

  let offset = 12;
  for (const c of chunks) {
    // FourCC
    for (let i = 0; i < 4; i++) {
      result[offset++] = c.fourCC.charCodeAt(i);
    }
    // Chunk size
    view.setUint32(offset, c.data.length, true);
    offset += 4;
    // Data
    result.set(c.data, offset);
    offset += c.data.length;
    // Padding
    if (c.data.length % 2 === 1) {
      result[offset++] = 0x00;
    }
  }

  return result;
}

/**
 * Strips EXIF and XMP metadata chunks from a WebP image.
 * Updates VP8X extended header flags if present to ensure specification compliance.
 */
export function stripWebpMetadata(buffer: Uint8Array, preserveICC = true): Uint8Array {
  const { chunks } = parseWebpChunks(buffer);

  const filteredChunks = chunks.filter(c => {
    if (c.fourCC === 'EXIF' || c.fourCC === 'XMP ') {
      return false;
    }
    if (c.fourCC === 'ICCP' && !preserveICC) {
      return false;
    }
    return true;
  });

  // If there is a VP8X chunk, update its flags
  const vp8xChunk = filteredChunks.find(c => c.fourCC === 'VP8X');
  if (vp8xChunk && vp8xChunk.data.length >= 10) {
    // Flags byte is byte 0
    let flags = vp8xChunk.data[0];
    // bit 3 is EXIF (0x08), bit 2 is XMP (0x04)
    flags &= ~0x08; // Clear EXIF
    flags &= ~0x04; // Clear XMP
    if (!preserveICC) {
      flags &= ~0x20; // Clear ICC
    }
    vp8xChunk.data[0] = flags;
  }

  return buildWebpFromChunks(filteredChunks);
}
