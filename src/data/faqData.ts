export interface FaqItem {
  id: string;
  question: {
    en: string;
    id: string;
  };
  answer: {
    en: string;
    id: string;
  };
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: {
      en: 'What is metadata?',
      id: 'Apa itu metadata?'
    },
    answer: {
      en: 'Metadata is "data about data." It is structured information embedded directly within your files describing how, when, where, and by whom the file was created. Examples include camera shutter speeds, GPS coordinates, author names, software versions, and modification timestamps.',
      id: 'Metadata adalah "data tentang data." Ini adalah informasi terstruktur yang tertanam langsung di dalam berkas Anda yang menjelaskan cara, waktu, lokasi, dan oleh siapa berkas tersebut dibuat. Contohnya meliputi kecepatan rana kamera, koordinat GPS, nama pembuat, versi perangkat lunak, dan riwayat waktu modifikasi.'
    }
  },
  {
    id: 'faq-2',
    question: {
      en: 'What is EXIF data?',
      id: 'Apa itu data EXIF?'
    },
    answer: {
      en: 'EXIF (Exchangeable Image File Format) is a standard specification for formats used by digital cameras and smartphones. It records technical camera settings (aperture, ISO, focal length, lens model), capture date/time, and geographic GPS coordinates.',
      id: 'EXIF (Exchangeable Image File Format) adalah spesifikasi standar untuk format yang digunakan kamera digital dan ponsel pintar. EXIF mencatat setelan teknis kamera (bukaan, ISO, panjang fokus, tipe lensa), tanggal/waktu pemotretan, dan koordinat geografis GPS.'
    }
  },
  {
    id: 'faq-3',
    question: {
      en: 'Can MoMetadata remove GPS location information?',
      id: 'Bisakah MoMetadata menghapus informasi lokasi GPS?'
    },
    answer: {
      en: 'Yes. MoMetadata provides a dedicated "Remove GPS" feature that scrubs latitude, longitude, altitude, and GPS timestamps from compatible files (JPEG, PNG, WebP) while preserving all other camera settings and image data intact.',
      id: 'Ya. MoMetadata menyediakan fitur khusus "Hapus GPS" yang membersihkan lintang, bujur, ketinggian, dan stempel waktu GPS dari berkas yang kompatibel (JPEG, PNG, WebP) sambil tetap mempertahankan setelan kamera dan kualitas gambar lainnya.'
    }
  },
  {
    id: 'faq-4',
    question: {
      en: 'Does editing metadata affect image quality?',
      id: 'Apakah mengedit metadata memengaruhi kualitas gambar?'
    },
    answer: {
      en: 'No. MoMetadata operates on header and metadata chunks at the binary segment level. The underlying compressed pixel entropy data (such as JPEG SOS or PNG IDAT streams) is preserved 100% losslessly without re-encoding or compression artifacts.',
      id: 'Tidak. MoMetadata beroperasi pada header dan chunk metadata di tingkat segmen biner. Data piksel terkompresi (seperti aliran JPEG SOS atau PNG IDAT) dipertahankan 100% tanpa penurunan mutu atau kompresi ulang.'
    }
  },
  {
    id: 'faq-5',
    question: {
      en: 'Which file formats are supported?',
      id: 'Format berkas apa saja yang didukung?'
    },
    answer: {
      en: 'MoMetadata supports inspecting images (JPEG, PNG, WebP, TIFF, HEIC, AVIF, GIF), audio (MP3, FLAC, WAV, OGG, AAC), video (MP4, MOV, WebM, MKV), and documents (PDF, DOCX, XLSX, PPTX). Editing and sanitizing are supported for JPEG, PNG, WebP, MP3, PDF, and Office Open XML.',
      id: 'MoMetadata mendukung inspeksi gambar (JPEG, PNG, WebP, TIFF, HEIC, AVIF, GIF), audio (MP3, FLAC, WAV, OGG, AAC), video (MP4, MOV, WebM, MKV), dan dokumen (PDF, DOCX, XLSX, PPTX). Pengeditan dan pembersihan didukung untuk JPEG, PNG, WebP, MP3, PDF, dan Office Open XML.'
    }
  },
  {
    id: 'faq-6',
    question: {
      en: 'Can metadata be edited in bulk?',
      id: 'Bisakah metadata diedit secara massal?'
    },
    answer: {
      en: 'Yes. The Batch Processing tab allows you to queue multiple files, apply GPS stripping or complete metadata sanitization across all compatible items, and download the verified results individually or bundled in a single ZIP file.',
      id: 'Ya. Tab Antrean Massal memungkinkan Anda mengantrekan banyak berkas sekaligus, menerapkan penghapusan GPS atau sanitasi metadata lengkap ke semua berkas yang kompatibel, dan mengunduh hasilnya secara mandiri maupun dalam satu arsip ZIP.'
    }
  },
  {
    id: 'faq-7',
    question: {
      en: 'Are files uploaded to a server?',
      id: 'Apakah berkas diunggah ke server?'
    },
    answer: {
      en: 'Never. MoMetadata executes entirely in your browser using modern Web APIs (FileReader, TypedArray, Blob, Web Workers). Your files, extracted metadata, and generated outputs never leave your personal computer or mobile device.',
      id: 'Sama sekali tidak. MoMetadata berjalan sepenuhnya di dalam peramban Anda menggunakan Web API modern (FileReader, TypedArray, Blob, Web Workers). Berkas, metadata, dan output yang dihasilkan tidak pernah meninggalkan perangkat komputer atau ponsel Anda.'
    }
  },
  {
    id: 'faq-8',
    question: {
      en: 'Why are some formats read-only?',
      id: 'Mengapa beberapa format berstatus hanya-baca?'
    },
    answer: {
      en: 'We prioritize data safety and honesty. Certain complex formats like multi-page TIFF, proprietary raw containers, or complex video codecs require specialized writers that cannot safely rewrite containers in-browser without risking corruption. We mark them read-only rather than providing simulated or destructive edits.',
      id: 'Kami mengutamakan keamanan data dan kejujuran fitur. Format kompleks seperti TIFF multipage, raw kamera, atau codec video membutuhkan writer khusus yang belum dapat menulis ulang kontainer secara aman di peramban tanpa risiko korupsi berkas. Kami menandainya hanya-baca alih-alih memberikan simulasi palsu.'
    }
  },
  {
    id: 'faq-9',
    question: {
      en: 'Can removed metadata be recovered?',
      id: 'Bisakah metadata yang telah dihapus dipulihkan kembali?'
    },
    answer: {
      en: 'No. When MoMetadata strips metadata segments from the generated file, the header bytes are permanently excised. Because MoMetadata never overwrites your original file on disk, your original source file remains untouched on your local drive.',
      id: 'Tidak. Ketika MoMetadata menghapus segmen metadata dari berkas baru yang dihasilkan, byte header tersebut dipotong secara permanen. Namun karena MoMetadata tidak pernah menimpa berkas asli di disk Anda, berkas sumber asli Anda tetap aman tidak tersentuh.'
    }
  },
  {
    id: 'faq-10',
    question: {
      en: 'Does metadata removal guarantee complete privacy?',
      id: 'Apakah penghapusan metadata menjamin privasi total?'
    },
    answer: {
      en: 'Metadata removal strips hidden data headers (GPS, serials, comments), but it cannot erase identifying information visible in the actual image pixels (like street signs or faces), spoken words in audio, or document text bodies. Comprehensive privacy requires reviewing visual/text content as well.',
      id: 'Pembersihan metadata menghapus header data tersembunyi (GPS, nomor seri, komentar), namun tidak dapat menghapus informasi yang terlihat langsung pada piksel gambar (seperti plang jalan atau wajah), suara pada audio, atau teks dokumen. Privasi menyeluruh tetap membutuhkan tinjauan visual dan teks.'
    }
  },
  {
    id: 'faq-11',
    question: {
      en: 'Why did my file size change?',
      id: 'Mengapa ukuran berkas saya berubah?'
    },
    answer: {
      en: 'Removing metadata segments (such as embedded camera thumbnails, large XMP XML blocks, or EXIF dictionaries) naturally reduces the total byte size by the size of those removed headers. The core media stream remains byte-for-byte lossless.',
      id: 'Menghapus segmen metadata (seperti thumbnail kamera tertanam, blok XML XMP yang besar, atau dictionary EXIF) secara alami mengurangi ukuran berkas sebesar byte header yang dibuang. Aliran media utama tetap utuh tanpa penurunan mutu.'
    }
  },
  {
    id: 'faq-12',
    question: {
      en: 'Is MoMetadata free to use?',
      id: 'Apakah MoMetadata gratis untuk digunakan?'
    },
    answer: {
      en: 'Yes. MoMetadata is 100% free, open-source software distributed under the permissive MIT License. There are no paywalls, accounts, subscriptions, or watermarks.',
      id: 'Ya. MoMetadata 100% gratis dan merupakan perangkat lunak sumber terbuka di bawah Lisensi MIT. Tidak ada biaya, pembuatan akun, langganan, ataupun watermark.'
    }
  }
];
