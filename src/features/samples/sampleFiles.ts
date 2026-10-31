export interface SampleFileDef {
  id: string;
  filename: string;
  path: string;
  type: string;
  titleKey: 'samplePhotoTitle' | 'samplePaintingTitle' | 'sampleIllustrationTitle' | 'sampleDocTitle';
  descKey: 'samplePhotoDesc' | 'samplePaintingDesc' | 'sampleIllustrationDesc' | 'sampleDocDesc';
  badge: string;
  category: 'image' | 'document';
}

export const SAMPLE_FILES: SampleFileDef[] = [
  {
    id: 'sample-photo',
    filename: 'sample-photo.jpg',
    path: '/samples/sample-photo.jpg',
    type: 'image/jpeg',
    titleKey: 'samplePhotoTitle',
    descKey: 'samplePhotoDesc',
    badge: 'JPEG / EXIF + GPS',
    category: 'image'
  },
  {
    id: 'sample-painting',
    filename: 'sample-painting.png',
    path: '/samples/sample-painting.png',
    type: 'image/png',
    titleKey: 'samplePaintingTitle',
    descKey: 'samplePaintingDesc',
    badge: 'PNG / Textual Chunks',
    category: 'image'
  },
  {
    id: 'sample-illustration',
    filename: 'sample-illustration.webp',
    path: '/samples/sample-illustration.webp',
    type: 'image/webp',
    titleKey: 'sampleIllustrationTitle',
    descKey: 'sampleIllustrationDesc',
    badge: 'WebP / RIFF EXIF',
    category: 'image'
  },
  {
    id: 'sample-doc',
    filename: 'sample-document.pdf',
    path: '/samples/sample-document.pdf',
    type: 'application/pdf',
    titleKey: 'sampleDocTitle',
    descKey: 'sampleDocDesc',
    badge: 'PDF / Document Info',
    category: 'document'
  }
];

export async function fetchSampleAsFile(sample: SampleFileDef): Promise<File> {
  const response = await fetch(sample.path);
  if (!response.ok) {
    throw new Error(`Failed to load sample file ${sample.filename}: ${response.statusText}`);
  }
  const blob = await response.blob();
  return new File([blob], sample.filename, {
    type: sample.type,
    lastModified: Date.now()
  });
}
