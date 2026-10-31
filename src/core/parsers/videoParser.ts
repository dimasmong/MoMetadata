import type { MetadataGroup, MetadataTag, ParsedMetadata } from '../../types/metadata';
import { cleanPlainText } from '../formatDetector';

export async function parseVideoMetadata(file: File): Promise<ParsedMetadata> {
  const groups: MetadataGroup[] = [];
  const rawData: Record<string, unknown> = {};
  const tags: MetadataTag[] = [];
  let fieldCount = 0;
  let dimensions: { width: number; height: number } | undefined;
  let duration: number | undefined;

  // We can load metadata safely via a lightweight video element
  try {
    const videoUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        resolve(); // Don't hang if format is unsupported by browser
      }, 3000);

      video.onloadedmetadata = () => {
        clearTimeout(timeout);
        if (video.videoWidth && video.videoHeight) {
          dimensions = { width: video.videoWidth, height: video.videoHeight };
        }
        if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
          duration = video.duration;
        }
        resolve();
      };

      video.onerror = () => {
        clearTimeout(timeout);
        resolve(); // Continue even if browser video decoder failed
      };

      video.src = videoUrl;
    });

    URL.revokeObjectURL(videoUrl);
  } catch {
    // Non-fatal fallback
  }

  const addTag = (
    id: string,
    name: string,
    displayName: string,
    value: string | number | undefined | null,
    category: 'general' | 'description' | 'advanced'
  ) => {
    if (value === undefined || value === null || value === '') return;

    tags.push({
      id,
      name,
      displayName,
      value: cleanPlainText(String(value)),
      raw: value,
      category,
      group: 'VIDEO CONTAINER',
      writable: false,
      sensitive: false,
    });
    fieldCount++;
  };

  addTag('video_name', 'FileName', 'File Name', file.name, 'general');
  addTag('video_size', 'FileSize', 'File Size (bytes)', file.size, 'general');
  addTag('video_mime', 'MIMEType', 'MIME Type', file.type || 'video/mp4', 'general');

  if (dimensions) {
    addTag('video_width', 'ImageWidth', 'Frame Width', dimensions.width, 'general');
    addTag('video_height', 'ImageHeight', 'Frame Height', dimensions.height, 'general');
    addTag('video_resolution', 'Resolution', 'Resolution', `${dimensions.width}x${dimensions.height}`, 'general');
    rawData.width = dimensions.width;
    rawData.height = dimensions.height;
  }

  if (duration !== undefined) {
    addTag('video_duration', 'Duration', 'Duration (seconds)', duration.toFixed(2), 'general');
    rawData.duration = duration;
  }

  if (tags.length > 0) {
    groups.push({
      name: 'VIDEO PROPERTIES',
      category: 'general',
      tags,
    });
  }

  return {
    groups,
    raw: rawData,
    fieldCount,
    dimensions,
    duration,
    hasIccProfile: false,
    hasGps: false,
    hasSensitiveData: false,
  };
}
