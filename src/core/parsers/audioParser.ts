import { parseBlob } from 'music-metadata';
import type { MetadataGroup, MetadataTag, ParsedMetadata } from '../../types/metadata';
import { cleanPlainText } from '../formatDetector';

export interface AudioParseResult extends ParsedMetadata {
  coverUrl?: string;
}

export async function parseAudioMetadata(file: File): Promise<AudioParseResult> {
  const groups: MetadataGroup[] = [];
  const rawData: Record<string, unknown> = {};
  const tags: MetadataTag[] = [];
  let fieldCount = 0;
  let hasSensitiveData = false;
  let coverUrl: string | undefined;
  let duration: number | undefined;

  try {
    const mm = await parseBlob(file);
    const { common, format } = mm;

    rawData.common = common;
    rawData.format = format;

    if (format.duration) {
      duration = format.duration;
    }

    const addTag = (
      id: string,
      name: string,
      displayName: string,
      value: string | number | boolean | undefined | null,
      category: 'general' | 'description' | 'advanced',
      sensitive = false
    ) => {
      if (value === undefined || value === null || value === '') return;
      if (sensitive) hasSensitiveData = true;

      tags.push({
        id,
        name,
        displayName,
        value: cleanPlainText(String(value)),
        raw: value,
        category,
        group: 'ID3 / AUDIO',
        writable: false,
        sensitive,
      });
      fieldCount++;
    };

    addTag('audio_title', 'Title', 'Title', common.title, 'description', false);
    addTag('audio_artist', 'Artist', 'Artist', common.artist, 'description', true);
    addTag('audio_album', 'Album', 'Album', common.album, 'description', false);
    addTag('audio_year', 'Year', 'Year', common.year, 'description', false);
    addTag('audio_genre', 'Genre', 'Genre', common.genre ? common.genre.join(', ') : undefined, 'description', false);
    addTag('audio_composer', 'Composer', 'Composer', common.composer ? common.composer.join(', ') : undefined, 'description', true);
    addTag('audio_comment', 'Comment', 'Comment', common.comment ? common.comment.join(' ') : undefined, 'description', false);
    addTag('audio_duration', 'Duration', 'Duration (seconds)', format.duration ? format.duration.toFixed(1) : undefined, 'general', false);
    addTag('audio_bitrate', 'Bitrate', 'Bitrate (kbps)', format.bitrate ? Math.round(format.bitrate / 1000) : undefined, 'general', false);
    addTag('audio_samplerate', 'SampleRate', 'Sample Rate (Hz)', format.sampleRate, 'general', false);
    addTag('audio_codec', 'Codec', 'Audio Codec', format.codec, 'advanced', false);
    addTag('audio_lossless', 'Lossless', 'Lossless Audio', format.lossless ? 'Yes' : 'No', 'advanced', false);

    // Extract cover artwork
    if (common.picture && common.picture.length > 0) {
      const pic = common.picture[0];
      const blob = new Blob([new Uint8Array(pic.data)], { type: pic.format });
      coverUrl = URL.createObjectURL(blob);
      addTag('audio_artwork', 'Picture', 'Embedded Cover Artwork', `${pic.format} (${pic.data.byteLength} bytes)`, 'advanced', false);
    }

    if (tags.length > 0) {
      groups.push({
        name: 'AUDIO METADATA',
        category: 'description',
        tags,
      });
    }
  } catch (err) {
    console.warn('Audio metadata parsing error:', err);
  }

  return {
    groups,
    raw: rawData,
    fieldCount,
    duration,
    coverUrl,
    hasIccProfile: false,
    hasGps: false,
    hasSensitiveData,
  };
}
