export interface AttributionItem {
  name: string;
  url: string;
  version: string;
  license: string;
  maintainer: string;
  purpose: {
    en: string;
    id: string;
  };
}

export const ATTRIBUTION_ITEMS: AttributionItem[] = [
  {
    name: 'ExifReader',
    url: 'https://github.com/mattiasw/ExifReader',
    version: '^4.52.0',
    license: 'MPL-2.0 / BSD-2-Clause',
    maintainer: 'Mattias Wadman',
    purpose: {
      en: 'Primary client-side metadata parsing for EXIF, IPTC, XMP, GPS, PNG chunks, WebP headers, and ISOBMFF video atoms.',
      id: 'Penguraian metadata sisi-klien untuk EXIF, IPTC, XMP, GPS, chunk PNG, header WebP, dan atom video ISOBMFF.'
    }
  },
  {
    name: 'piexifjs',
    url: 'https://github.com/hMatoba/piexifjs',
    version: '^1.0.6',
    license: 'MIT',
    maintainer: 'hMatoba',
    purpose: {
      en: 'JPEG EXIF binary segment serialization, GPS tag editing, and EXIF reconstruction without recompressing JPEG DCT scan data.',
      id: 'Serialisasi segmen biner JPEG EXIF, pengeditan tag GPS, dan rekonstruksi EXIF tanpa kompresi ulang data scan JPEG DCT.'
    }
  },
  {
    name: 'pdf-lib',
    url: 'https://github.com/Hopding/pdf-lib',
    version: '^1.17.1',
    license: 'MIT',
    maintainer: 'Andrew Dillon',
    purpose: {
      en: 'Client-side PDF document loading, metadata dictionary inspection, title/author/keywords modification, and metadata wiping.',
      id: 'Pemuatan dokumen PDF sisi-klien, inspeksi dictionary metadata, modifikasi judul/penulis/kata kunci, dan pembersihan metadata.'
    }
  },
  {
    name: 'mp3tag.js',
    url: 'https://github.com/eidoriantan/mp3tag.js',
    version: '^3.17.1',
    license: 'MIT',
    maintainer: 'eidoriantan',
    purpose: {
      en: 'Standards-compliant ID3v2.3 tag inspection and writing for MP3 audio files while preserving MPEG audio frames untouched.',
      id: 'Inspeksi dan penulisan tag ID3v2.3 standar untuk berkas audio MP3 dengan menjaga frame audio MPEG tetap utuh.'
    }
  },
  {
    name: 'JSZip',
    url: 'https://github.com/Stuk/jszip',
    version: '^3.10.2',
    license: 'MIT / GPLv3',
    maintainer: 'Stuart Knightley',
    purpose: {
      en: 'Office Open XML (DOCX, XLSX, PPTX) docProps/core.xml package inspection and batch ZIP export compression.',
      id: 'Inspeksi paket docProps/core.xml Office Open XML (DOCX, XLSX, PPTX) dan pembuatan kompresi arsip ZIP untuk unduhan massal.'
    }
  },
  {
    name: 'Lucide React',
    url: 'https://github.com/lucide-icons/lucide',
    version: '^1.66.0',
    license: 'ISC',
    maintainer: 'Lucide Contributors',
    purpose: {
      en: 'Accessible, clean, and consistent iconography for the modern Glassmorphism interface.',
      id: 'Ikonografi yang bersih, konsisten, dan mudah diakses untuk antarmuka Glassmorphism modern.'
    }
  }
];
