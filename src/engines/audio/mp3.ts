import MP3Tag from 'mp3tag.js';
import { CreatorInfo, TechnicalInfo } from '../../types/metadata';

export interface Mp3EditOptions {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  track?: string;
  comment?: string;
}

export function inspectMp3Tags(buffer: ArrayBuffer): {
  creator: CreatorInfo;
  technical: TechnicalInfo;
  rawTags: { tag: string; value: string }[];
} {
  const mp3tag = new MP3Tag(buffer);
  mp3tag.read();

  const tags = mp3tag.tags as any;
  const rawTags: { tag: string; value: string }[] = [];

  for (const key of Object.keys(tags)) {
    if (tags[key] && typeof tags[key] === 'string') {
      rawTags.push({ tag: key, value: tags[key] });
    }
  }

  const creator: CreatorInfo = {
    title: tags.title,
    artist: tags.artist,
    creator: tags.artist,
    album: tags.album,
    year: tags.year,
    genre: tags.genre,
    trackNumber: tags.track,
    comments: typeof tags.comment === 'string' ? tags.comment : tags.comment?.text
  };

  const technical: TechnicalInfo = {
    containerFormat: 'MPEG-1/2 Audio Layer 3 (MP3)',
    audioCodec: 'MP3'
  };

  return { creator, technical, rawTags };
}

/**
 * Losslessly strips ID3v1 and ID3v2 metadata tags from an MP3 file,
 * preserving pure MPEG audio frames without re-encoding.
 */
export function stripMp3Metadata(buffer: Uint8Array): Uint8Array {
  let startOffset = 0;
  let endOffset = buffer.length;

  // Check ID3v2 at the beginning
  if (
    buffer.length >= 10 &&
    buffer[0] === 0x49 && // 'I'
    buffer[1] === 0x44 && // 'D'
    buffer[2] === 0x33    // '3'
  ) {
    const flags = buffer[5];
    const footerPresent = (flags & 0x10) !== 0;

    // Synchsafe integer (7 bits per byte)
    const tagSize =
      ((buffer[6] & 0x7f) << 21) |
      ((buffer[7] & 0x7f) << 14) |
      ((buffer[8] & 0x7f) << 7) |
      (buffer[9] & 0x7f);

    startOffset = 10 + tagSize + (footerPresent ? 10 : 0);
    if (startOffset > buffer.length) {
      startOffset = 0; // Malformed ID3v2 header, keep whole
    }
  }

  // Check ID3v1 at the end (128 bytes)
  if (
    endOffset - startOffset >= 128 &&
    buffer[endOffset - 128] === 0x54 && // 'T'
    buffer[endOffset - 127] === 0x41 && // 'A'
    buffer[endOffset - 126] === 0x47    // 'G'
  ) {
    endOffset -= 128;
  }

  return buffer.slice(startOffset, endOffset);
}

/**
 * Edits ID3 tags of an MP3 file using mp3tag.js
 */
export function editMp3Metadata(buffer: ArrayBuffer, options: Mp3EditOptions): Uint8Array {
  const mp3tag = new MP3Tag(buffer.slice(0));
  mp3tag.read();

  if (options.title !== undefined) mp3tag.tags.title = options.title;
  if (options.artist !== undefined) mp3tag.tags.artist = options.artist;
  if (options.album !== undefined) mp3tag.tags.album = options.album;
  if (options.year !== undefined) mp3tag.tags.year = options.year;
  if (options.genre !== undefined) mp3tag.tags.genre = options.genre;
  if (options.track !== undefined) mp3tag.tags.track = options.track;
  if (options.comment !== undefined) mp3tag.tags.comment = options.comment;

  const success = mp3tag.save({
    strict: false,
    id3v1: {
      include: false
    },
    id3v2: {
      include: true,
      version: 3 // ID3v2.3 standard
    }
  });

  if (!success && mp3tag.error) {
    throw new Error(`Failed to save MP3 tags: ${mp3tag.error}`);
  }

  return new Uint8Array(mp3tag.buffer);
}
