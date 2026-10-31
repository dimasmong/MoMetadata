import { FormatCapabilities } from './metadata';

export interface FormatSupportRow {
  format: string;
  extensions: string[];
  category: 'image' | 'audio' | 'video' | 'document';
  canInspect: boolean;
  canEdit: boolean;
  canRemoveGps: boolean;
  canRemoveAll: boolean;
  canExport: boolean;
  canVerify: boolean;
  notes: {
    en: string;
    id: string;
  };
}

export const SUPPORTED_FORMAT_MATRIX: FormatSupportRow[] = [
  {
    format: 'JPEG / JPG',
    extensions: ['jpg', 'jpeg'],
    category: 'image',
    canInspect: true,
    canEdit: true,
    canRemoveGps: true,
    canRemoveAll: true,
    canExport: true,
    canVerify: true,
    notes: {
      en: 'Lossless EXIF/GPS manipulation and complete metadata stripping without recompressing image data.',
      id: 'Manipulasi EXIF/GPS tanpa kehilangan data dan pembersihan metadata lengkap tanpa kompresi ulang gambar.'
    }
  },
  {
    format: 'PNG',
    extensions: ['png'],
    category: 'image',
    canInspect: true,
    canEdit: true,
    canRemoveGps: true,
    canRemoveAll: true,
    canExport: true,
    canVerify: true,
    notes: {
      en: 'Binary chunk editor for tEXt, iTXt, zTXt, and eXIf with CRC32 integrity validation. ICC profile preserved by default.',
      id: 'Editor chunk biner untuk tEXt, iTXt, zTXt, dan eXIf dengan validasi CRC32. Profil ICC dipertahankan secara default.'
    }
  },
  {
    format: 'WebP',
    extensions: ['webp'],
    category: 'image',
    canInspect: true,
    canEdit: true,
    canRemoveGps: true,
    canRemoveAll: true,
    canExport: true,
    canVerify: true,
    notes: {
      en: 'RIFF container chunk modification (EXIF & XMP chunks) with VP8X header sync without re-encoding pixels.',
      id: 'Modifikasi chunk kontainer RIFF (chunk EXIF & XMP) dengan sinkronisasi header VP8X tanpa re-encode piksel.'
    }
  },
  {
    format: 'PDF',
    extensions: ['pdf'],
    category: 'document',
    canInspect: true,
    canEdit: true,
    canRemoveGps: true,
    canRemoveAll: true,
    canExport: true,
    canVerify: true,
    notes: {
      en: 'Document info dictionary & XMP stream inspection, editing, and wiping using pdf-lib.',
      id: 'Inspeksi, pengeditan, dan pembersihan dictionary Info dokumen & XMP menggunakan pdf-lib.'
    }
  },
  {
    format: 'MP3',
    extensions: ['mp3'],
    category: 'audio',
    canInspect: true,
    canEdit: true,
    canRemoveGps: false,
    canRemoveAll: true,
    canExport: true,
    canVerify: true,
    notes: {
      en: 'ID3v1 and ID3v2 tag parsing, editing, and complete stripping while preserving 100% of audio frames.',
      id: 'Penguraian, pengeditan, dan penghapusan tag ID3v1 dan ID3v2 dengan menjaga 100% frame audio utuh.'
    }
  },
  {
    format: 'Office Open XML (DOCX, XLSX, PPTX)',
    extensions: ['docx', 'xlsx', 'pptx'],
    category: 'document',
    canInspect: true,
    canEdit: true,
    canRemoveGps: false,
    canRemoveAll: true,
    canExport: true,
    canVerify: true,
    notes: {
      en: 'Safe inspection and modification of docProps/core.xml package properties without touching document content.',
      id: 'Inspeksi dan modifikasi properti paket docProps/core.xml secara aman tanpa menyentuh isi dokumen.'
    }
  },
  {
    format: 'TIFF',
    extensions: ['tif', 'tiff'],
    category: 'image',
    canInspect: true,
    canEdit: false,
    canRemoveGps: false,
    canRemoveAll: false,
    canExport: true,
    canVerify: false,
    notes: {
      en: 'Comprehensive IFD tag inspection. Writing is intentionally disabled to avoid corrupting complex multi-page or tiled TIFF structures.',
      id: 'Inspeksi tag IFD komprehensif. Penulisan dinonaktifkan untuk mencegah kerusakan struktur TIFF berhalaman ganda/tiled.'
    }
  },
  {
    format: 'HEIC / HEIF / AVIF',
    extensions: ['heic', 'heif', 'avif'],
    category: 'image',
    canInspect: true,
    canEdit: false,
    canRemoveGps: false,
    canRemoveAll: false,
    canExport: true,
    canVerify: false,
    notes: {
      en: 'ISOBMFF container metadata inspection. Read-only in browser to preserve proprietary coding boxes.',
      id: 'Inspeksi metadata kontainer ISOBMFF. Hanya-baca di peramban untuk menjaga box pengodean khusus.'
    }
  },
  {
    format: 'GIF',
    extensions: ['gif'],
    category: 'image',
    canInspect: true,
    canEdit: false,
    canRemoveGps: false,
    canRemoveAll: false,
    canExport: true,
    canVerify: false,
    notes: {
      en: 'GIF header, screen descriptor, and application/comment extension blocks inspection.',
      id: 'Inspeksi header GIF, deskriptor layar, dan blok ekstensi aplikasi/komentar.'
    }
  },
  {
    format: 'MP4 / MOV / MKV / WebM',
    extensions: ['mp4', 'm4v', 'mov', 'mkv', 'webm', 'avi'],
    category: 'video',
    canInspect: true,
    canEdit: false,
    canRemoveGps: false,
    canRemoveAll: false,
    canExport: true,
    canVerify: false,
    notes: {
      en: 'Inspects ISO base media atoms (moov, udta, meta), video dimensions, duration, bitrate, and audio streams.',
      id: 'Inspeksi atom media ISO (moov, udta, meta), dimensi video, durasi, bitrate, dan stream audio.'
    }
  },
  {
    format: 'FLAC / WAV / OGG / AAC / M4A',
    extensions: ['flac', 'wav', 'ogg', 'aac', 'm4a', 'aiff'],
    category: 'audio',
    canInspect: true,
    canEdit: false,
    canRemoveGps: false,
    canRemoveAll: false,
    canExport: true,
    canVerify: false,
    notes: {
      en: 'Inspects audio headers, sample rate, channels, bitrate, duration, and Vorbis/RIFF comments.',
      id: 'Inspeksi header audio, sample rate, kanal, bitrate, durasi, dan komentar Vorbis/RIFF.'
    }
  }
];

export function getCapabilitiesForFile(filename: string, _mimeType?: string): FormatCapabilities {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const match = SUPPORTED_FORMAT_MATRIX.find(row => row.extensions.includes(ext));

  if (!match) {
    return {
      canInspect: true,
      canEdit: false,
      canRemoveGps: false,
      canRemoveAll: false,
      canExport: true,
      canVerify: false,
      editableFields: [],
      readOnlyReason: {
        en: 'This file format is not currently supported for editing or removal.',
        id: 'Format berkas ini saat ini tidak didukung untuk pengeditan atau penghapusan.'
      }
    };
  }

  const editableFields: string[] = [];
  if (match.canEdit) {
    if (['jpg', 'jpeg'].includes(ext)) {
      editableFields.push('title', 'artist', 'copyright', 'description', 'software', 'dateTime', 'latitude', 'longitude');
    } else if (['png', 'webp'].includes(ext)) {
      editableFields.push('title', 'artist', 'copyright', 'description', 'software', 'comments');
    } else if (ext === 'pdf') {
      editableFields.push('title', 'author', 'subject', 'keywords', 'creator', 'producer');
    } else if (ext === 'mp3') {
      editableFields.push('title', 'artist', 'album', 'year', 'genre', 'track', 'comment');
    } else if (['docx', 'xlsx', 'pptx'].includes(ext)) {
      editableFields.push('title', 'creator', 'description', 'subject', 'keywords');
    }
  }

  return {
    canInspect: match.canInspect,
    canEdit: match.canEdit,
    canRemoveGps: match.canRemoveGps,
    canRemoveAll: match.canRemoveAll,
    canExport: match.canExport,
    canVerify: match.canVerify,
    editableFields,
    readOnlyReason: !match.canEdit ? match.notes : undefined
  };
}
