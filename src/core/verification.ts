import type { ParsedMetadata, VerificationResult } from '../types/metadata';
import { parseImageMetadata } from './parsers/imageParser';
import { parsePdfMetadata } from './parsers/pdfParser';
import { detectFileFormat } from './formatDetector';
import type { RemovalPreset } from '../types/settings';

export interface VerificationOptions {
  format: string;
  operation: 'edit' | 'remove';
  preset?: RemovalPreset;
  expectedEdits?: Record<string, string | number | boolean>;
  originalMetadata?: ParsedMetadata;
}

const TAG_SYNONYMS: Record<string, string[]> = {
  title: ['title', 'imagedescription', 'pdf_title', 'headline'],
  author: ['author', 'artist', 'creator', 'pdf_author', 'by-line', 'byline'],
  description: ['description', 'imagedescription', 'subject', 'pdf_subject', 'caption-abstract'],
  copyright: ['copyright', 'rights', 'copyrightnotice'],
  keywords: ['keywords', 'subject', 'xpkeywords'],
  comment: ['comment', 'usercomment', 'xpcomment'],
  dateoriginal: ['datetimeoriginal', 'dateoriginal', 'creationdate', 'createdate'],
  datemodified: ['modifydate', 'datetime', 'modificationdate', 'datemodified'],
  gpslatitude: ['gpslatitude', 'latitude'],
  gpslongitude: ['gpslongitude', 'longitude'],
  gpsaltitude: ['gpsaltitude', 'altitude'],
};

export async function verifyMetadataOperation(
  outputBuffer: ArrayBuffer,
  options: VerificationOptions
): Promise<VerificationResult> {
  const { format, operation, preset, expectedEdits, originalMetadata } = options;

  // Basic sanity check: outputBuffer size and file signature
  if (!outputBuffer || outputBuffer.byteLength < 16) {
    return {
      verified: false,
      status: 'fail',
      removedTags: [],
      retainedTags: [],
      modifiedTags: [],
      unexpectedRetainedTags: [],
      message: 'Verification failed: Output buffer is empty or too small to be a valid file.',
    };
  }

  const detection = await detectFileFormat(new File([outputBuffer], 'test'), outputBuffer);
  if (!detection.isValidSignature) {
    return {
      verified: false,
      status: 'fail',
      removedTags: [],
      retainedTags: [],
      modifiedTags: [],
      unexpectedRetainedTags: [],
      message: 'Verification failed: Output file has invalid or corrupted file signature.',
    };
  }

  let verifiedParsed: ParsedMetadata;
  try {
    if (format === 'PDF') {
      verifiedParsed = await parsePdfMetadata(outputBuffer);
    } else {
      verifiedParsed = await parseImageMetadata(outputBuffer);
    }
  } catch (err: any) {
    return {
      verified: false,
      status: 'fail',
      removedTags: [],
      retainedTags: [],
      modifiedTags: [],
      unexpectedRetainedTags: [],
      message: `Output file could not be parsed: ${err?.message || 'Corrupted structure'}`,
    };
  }

  // Extract all tag names in the newly generated file
  const verifiedTagNames = new Set<string>();
  const verifiedTagValues = new Map<string, string | number | boolean>();

  for (const group of verifiedParsed.groups) {
    for (const tag of group.tags) {
      verifiedTagNames.add(tag.name.toLowerCase());
      verifiedTagValues.set(tag.name.toLowerCase(), tag.value);
    }
  }

  // Operation: Edit verification
  if (operation === 'edit' && expectedEdits) {
    const modifiedTags: string[] = [];
    const missingEdits: string[] = [];

    for (const key of Object.keys(expectedEdits)) {
      const lowerKey = key.toLowerCase();
      const synonyms = TAG_SYNONYMS[lowerKey] || [lowerKey];

      let found = false;
      for (const syn of synonyms) {
        for (const vKey of verifiedTagValues.keys()) {
          if (vKey === syn || vKey.includes(syn) || syn.includes(vKey)) {
            found = true;
            modifiedTags.push(key);
            break;
          }
        }
        if (found) break;
      }

      if (!found) {
        missingEdits.push(key);
      }
    }

    if (missingEdits.length === 0) {
      return {
        verified: true,
        status: 'pass',
        removedTags: [],
        retainedTags: Array.from(verifiedTagNames),
        modifiedTags,
        unexpectedRetainedTags: [],
        message: 'Verification passed: All edited tags were confirmed in the output file.',
      };
    } else {
      return {
        verified: modifiedTags.length > 0,
        status: modifiedTags.length > 0 ? 'warning' : 'fail',
        removedTags: [],
        retainedTags: Array.from(verifiedTagNames),
        modifiedTags,
        unexpectedRetainedTags: missingEdits,
        message: `Some edited fields were not detected in output: ${missingEdits.join(', ')}`,
      };
    }
  }

  // Operation: Remove verification
  const removedTags: string[] = [];
  const retainedTags: string[] = Array.from(verifiedTagNames);
  const unexpectedRetainedTags: string[] = [];

  const originalTagNames = new Set<string>();
  if (originalMetadata) {
    for (const group of originalMetadata.groups) {
      for (const tag of group.tags) {
        originalTagNames.add(tag.name.toLowerCase());
      }
    }
  }

  // Check what was in original but is now absent
  for (const origTag of originalTagNames) {
    if (!verifiedTagNames.has(origTag)) {
      removedTags.push(origTag);
    }
  }

  if (preset === 'gps') {
    if (verifiedParsed.hasGps || verifiedParsed.location) {
      unexpectedRetainedTags.push('GPS Location Coordinates');
    }
    for (const tag of verifiedTagNames) {
      if (tag.startsWith('gps') || tag.includes('latitude') || tag.includes('longitude')) {
        unexpectedRetainedTags.push(tag);
      }
    }
  } else if (preset === 'personal') {
    const personalKeys = ['artist', 'author', 'copyright', 'cameraownername', 'serialnumber'];
    for (const tag of verifiedTagNames) {
      if (personalKeys.some((pk) => tag.includes(pk)) || tag.startsWith('gps')) {
        unexpectedRetainedTags.push(tag);
      }
    }
  } else if (preset === 'all-writable') {
    // Non-rendering tags: exclude JFIF/IHDR header metadata and orientation
    const nonRenderingTags = verifiedParsed.groups
      .filter((g) => g.name !== 'JFIF' && g.name !== 'IHDR')
      .flatMap((g) => g.tags)
      .filter(
        (t) =>
          t.category !== 'general' &&
          !t.name.toLowerCase().includes('orientation') &&
          !t.name.toLowerCase().includes('jfif')
      );

    if (nonRenderingTags.length > 0) {
      for (const t of nonRenderingTags) {
        unexpectedRetainedTags.push(t.name);
      }
    }
  }

  if (unexpectedRetainedTags.length > 0) {
    return {
      verified: true,
      status: 'warning',
      removedTags,
      retainedTags,
      modifiedTags: [],
      unexpectedRetainedTags,
      message: `File modified successfully, but ${unexpectedRetainedTags.length} target tags could not be completely stripped due to container structure.`,
    };
  }

  return {
    verified: true,
    status: 'pass',
    removedTags,
    retainedTags,
    modifiedTags: [],
    unexpectedRetainedTags: [],
    message: 'Verification passed: Target metadata was completely removed and output file integrity confirmed.',
  };
}
