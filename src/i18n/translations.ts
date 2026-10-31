export type Language = 'en' | 'id';

export interface TranslationDictionary {
  // Brand & Header
  brandName: string;
  brandTagline: string;
  navWorkspace: string;
  navFeatures: string;
  navCapability: string;
  navFaq: string;
  navAttribution: string;
  themeToggle: string;
  langToggle: string;

  // Hero
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroCta: string;
  heroSamplePrompt: string;

  // Workspace Tabs
  tabInspector: string;
  tabEditor: string;
  tabRemover: string;
  tabPrivacy: string;
  tabCompare: string;
  tabBatch: string;

  // Upload Zone
  uploadTitle: string;
  uploadSubtitle: string;
  uploadBrowse: string;
  uploadDropHere: string;
  uploadFormatsHint: string;
  uploadPrivacyBadge: string;
  uploadChangeFile: string;
  uploadClearFile: string;

  // Samples
  samplesTitle: string;
  samplesSubtitle: string;
  samplePhotoTitle: string;
  samplePhotoDesc: string;
  samplePaintingTitle: string;
  samplePaintingDesc: string;
  sampleIllustrationTitle: string;
  sampleIllustrationDesc: string;
  sampleDocTitle: string;
  sampleDocDesc: string;

  // Inspector
  overviewTab: string;
  cameraTab: string;
  locationTab: string;
  creatorTab: string;
  technicalTab: string;
  rawTagsTab: string;
  noMetadataFound: string;
  noCategoryData: string;
  searchTagsPlaceholder: string;
  copyValue: string;
  copied: string;
  copySummary: string;
  summaryCopied: string;
  exportReport: string;

  // Metadata Labels
  fileName: string;
  fileSize: string;
  fileType: string;
  dimensions: string;
  duration: string;
  cameraMake: string;
  cameraModel: string;
  lensModel: string;
  iso: string;
  shutterSpeed: string;
  aperture: string;
  focalLength: string;
  orientation: string;
  software: string;
  deviceSerial: string;
  gpsLatitude: string;
  gpsLongitude: string;
  gpsAltitude: string;
  openInMap: string;
  mapDisclaimer: string;
  titleLabel: string;
  artistLabel: string;
  copyrightLabel: string;
  descriptionLabel: string;
  commentsLabel: string;
  albumLabel: string;
  yearLabel: string;
  genreLabel: string;

  // Editor
  editorTitle: string;
  editorSubtitle: string;
  editorReset: string;
  editorSave: string;
  editorProcessing: string;
  editorUnsavedChanges: string;
  editorReadOnlyWarning: string;
  editorSuccess: string;

  // Remover
  removerTitle: string;
  removerSubtitle: string;
  removeGpsBtn: string;
  removeGpsDesc: string;
  removeAllBtn: string;
  removeAllDesc: string;
  preserveIccOption: string;
  preserveIccHint: string;
  removerDisclaimer: string;
  removerProcessing: string;

  // Privacy Analyzer
  privacyTitle: string;
  privacySubtitle: string;
  privacyScoreHigh: string;
  privacyScoreModerate: string;
  privacyScoreLow: string;
  riskHigh: string;
  riskModerate: string;
  riskLow: string;
  privacyCleanAllAction: string;
  noSensitiveDataFound: string;
  noSensitiveDataDesc: string;

  // Comparison
  compareTitle: string;
  compareSubtitle: string;
  compareBefore: string;
  compareAfter: string;
  compareField: string;
  compareStatus: string;
  statusRemoved: string;
  statusModified: string;
  statusUnchanged: string;
  statusUnverified: string;
  verificationStatus: string;
  verifiedLabel: string;
  partiallyVerifiedLabel: string;
  failedLabel: string;

  // Download & Actions
  downloadCleaned: string;
  downloadEdited: string;
  downloadReportJson: string;
  downloadReportCsv: string;
  downloadReportTxt: string;
  downloadAllZip: string;
  close: string;
  cancel: string;

  // Batch Processing
  batchTitle: string;
  batchSubtitle: string;
  batchAddFiles: string;
  batchClearQueue: string;
  batchProcessAll: string;
  batchRemoveGpsAll: string;
  batchRemoveAllMeta: string;
  batchQueued: string;
  batchProcessingState: string;
  batchCompleted: string;
  batchFailed: string;
  batchUnsupported: string;
  batchFilesTotal: string;

  // Features Section
  featuresHeading: string;
  featuresSubheading: string;
  featLocalTitle: string;
  featLocalDesc: string;
  featFormatsTitle: string;
  featFormatsDesc: string;
  featLosslessTitle: string;
  featLosslessDesc: string;
  featVerificationTitle: string;
  featVerificationDesc: string;
  featPrivacyTitle: string;
  featPrivacyDesc: string;
  featBatchTitle: string;
  featBatchDesc: string;

  // How It Works Section
  howHeading: string;
  howSubheading: string;
  howStep1Title: string;
  howStep1Desc: string;
  howStep2Title: string;
  howStep2Desc: string;
  howStep3Title: string;
  howStep3Desc: string;
  howStep4Title: string;
  howStep4Desc: string;

  // Capability Matrix
  matrixHeading: string;
  matrixSubheading: string;
  matrixColFormat: string;
  matrixColInspect: string;
  matrixColEdit: string;
  matrixColRemoveGps: string;
  matrixColRemoveAll: string;
  matrixColVerify: string;
  matrixColNotes: string;
  matrixYes: string;
  matrixNo: string;

  // FAQ
  faqHeading: string;
  faqSubheading: string;

  // Attribution
  attrHeading: string;
  attrSubheading: string;
  attrModelNotice: string;
  attrLibraryName: string;
  attrVersion: string;
  attrLicense: string;
  attrPurpose: string;

  // Footer
  footerCopyright: string;
  footerCraftedWith: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    // Brand & Header
    brandName: 'MoMetadata',
    brandTagline: 'Complete Metadata Inspector, Editor & Privacy Toolkit',
    navWorkspace: 'Workspace',
    navFeatures: 'Features',
    navCapability: 'Formats',
    navFaq: 'FAQ',
    navAttribution: 'Attribution',
    themeToggle: 'Toggle appearance theme',
    langToggle: 'Switch language',

    // Hero
    heroTitle: 'Inspect, Edit, & Clean File Metadata',
    heroHighlight: 'With True Client-Side Precision',
    heroSubtitle: 'Deep metadata extraction, lossless EXIF/GPS removal, and privacy audits for images, documents, audio, and video. 100% private in browser memory.',
    heroCta: 'Open Inspector Workspace',
    heroSamplePrompt: 'Or try an authentic test file:',

    // Workspace Tabs
    tabInspector: 'Inspector',
    tabEditor: 'Editor',
    tabRemover: 'Remover',
    tabPrivacy: 'Privacy Audit',
    tabCompare: 'Comparison',
    tabBatch: 'Batch Queue',

    // Upload Zone
    uploadTitle: 'Drop your file here or click to browse',
    uploadSubtitle: 'Supports JPEG, PNG, WebP, PDF, MP3, DOCX, XLSX, PPTX, TIFF, HEIC, MP4, and more',
    uploadBrowse: 'Browse Files',
    uploadDropHere: 'Release to load file into MoMetadata workspace',
    uploadFormatsHint: 'Maximum client-side buffer: 500 MB. Zero data is sent to external servers.',
    uploadPrivacyBadge: 'Zero Server Uploads — 100% Local In-Browser Processing',
    uploadChangeFile: 'Change File',
    uploadClearFile: 'Clear Workspace',

    // Samples
    samplesTitle: 'Interactive Real Samples',
    samplesSubtitle: 'Click any sample to test real metadata parsing, editing, and wiping without uploading your own files.',
    samplePhotoTitle: 'Sample 1: Photography (JPEG)',
    samplePhotoDesc: 'Canon EOS 5D Mark IV with camera exposure settings and test GPS location.',
    samplePaintingTitle: 'Sample 2: Digital Painting (PNG)',
    samplePaintingDesc: 'PNG artwork with embedded tEXt chunks (Title, Author, Copyright, Software).',
    sampleIllustrationTitle: 'Sample 3: Concept Art (WebP)',
    sampleIllustrationDesc: 'RIFF container illustration with embedded EXIF & creator tags.',
    sampleDocTitle: 'Sample 4: Document (PDF)',
    sampleDocDesc: 'Standard PDF document with title, author, subject, and keywords metadata.',

    // Inspector
    overviewTab: 'Overview',
    cameraTab: 'Camera & Optics',
    locationTab: 'Location & GPS',
    creatorTab: 'Creator & Rights',
    technicalTab: 'Technical & Format',
    rawTagsTab: 'Raw Metadata Tags',
    noMetadataFound: 'No metadata found in this category for the loaded file.',
    noCategoryData: 'No tags available in this group.',
    searchTagsPlaceholder: 'Search metadata tags or values...',
    copyValue: 'Copy value',
    copied: 'Copied!',
    copySummary: 'Copy Metadata Summary',
    summaryCopied: 'Summary copied to clipboard!',
    exportReport: 'Export Report',

    // Metadata Labels
    fileName: 'File Name',
    fileSize: 'File Size',
    fileType: 'MIME Type',
    dimensions: 'Dimensions',
    duration: 'Duration',
    cameraMake: 'Camera Make',
    cameraModel: 'Camera Model',
    lensModel: 'Lens Model',
    iso: 'ISO Sensitivity',
    shutterSpeed: 'Shutter Speed',
    aperture: 'Aperture',
    focalLength: 'Focal Length',
    orientation: 'Orientation',
    software: 'Software / Application',
    deviceSerial: 'Device Serial Number',
    gpsLatitude: 'GPS Latitude',
    gpsLongitude: 'GPS Longitude',
    gpsAltitude: 'GPS Altitude',
    openInMap: 'View Coordinates on OpenStreetMap',
    mapDisclaimer: 'Clicking opens an external map in a new tab. No automated queries are sent.',
    titleLabel: 'Title',
    artistLabel: 'Artist / Author',
    copyrightLabel: 'Copyright Notice',
    descriptionLabel: 'Description / Abstract',
    commentsLabel: 'Comments / Notes',
    albumLabel: 'Album',
    yearLabel: 'Release Year',
    genreLabel: 'Genre',

    // Editor
    editorTitle: 'Metadata Editor',
    editorSubtitle: 'Modify supported metadata fields. The original compressed payload is preserved losslessly.',
    editorReset: 'Reset to Original',
    editorSave: 'Apply Changes & Verify',
    editorProcessing: 'Processing and verifying file...',
    editorUnsavedChanges: 'You have unsaved changes in the editor.',
    editorReadOnlyWarning: 'This format is currently read-only. Editing is disabled to protect container integrity.',
    editorSuccess: 'Changes saved and verified! Click Download below to save your file.',

    // Remover
    removerTitle: 'Metadata Remover & Sanitizer',
    removerSubtitle: 'Remove sensitive tracking information while preserving audio/visual quality.',
    removeGpsBtn: 'Remove GPS & Location Data Only',
    removeGpsDesc: 'Wipes geographic coordinates, altitude, and timestamps while keeping camera settings and titles.',
    removeAllBtn: 'Remove Supported Non-Essential Metadata',
    removeAllDesc: 'Strips EXIF, IPTC, XMP, comments, and identifiers while preserving audio/image stream integrity.',
    preserveIccOption: 'Preserve ICC Color Profile (Recommended)',
    preserveIccHint: 'Keeps display color consistency across professional screens and print workflows.',
    removerDisclaimer: 'Note: Metadata removal strips embedded data headers. It does not erase information visible inside the actual pixels, audio waveform, or file text.',
    removerProcessing: 'Sanitizing metadata...',

    // Privacy Analyzer
    privacyTitle: 'Privacy Risk Audit',
    privacySubtitle: 'Automated inspection for sensitive tracking information, device identifiers, and locations.',
    privacyScoreHigh: 'High Privacy Exposure Detected',
    privacyScoreModerate: 'Moderate Privacy Exposure Detected',
    privacyScoreLow: 'Low Privacy Exposure Detected',
    riskHigh: 'High Risk',
    riskModerate: 'Moderate Risk',
    riskLow: 'Low Risk',
    privacyCleanAllAction: 'Sanitize Detected Sensitive Metadata',
    noSensitiveDataFound: 'No Sensitive Metadata Detected',
    noSensitiveDataDesc: 'No GPS coordinates, device serial numbers, or identifiable personal tags were found in this file.',

    // Comparison
    compareTitle: 'Before & After Verification',
    compareSubtitle: 'Inspect the structural differences between original and processed files.',
    compareBefore: 'Original File',
    compareAfter: 'Processed File',
    compareField: 'Property / Tag',
    compareStatus: 'Verification Status',
    statusRemoved: 'Removed',
    statusModified: 'Modified',
    statusUnchanged: 'Preserved / Unchanged',
    statusUnverified: 'Unverified',
    verificationStatus: 'Output Verification Status',
    verifiedLabel: 'Verified Lossless & Clean',
    partiallyVerifiedLabel: 'Partially Verified',
    failedLabel: 'Verification Check Failed',

    // Download & Actions
    downloadCleaned: 'Download Sanitized File',
    downloadEdited: 'Download Edited File',
    downloadReportJson: 'Download Report (JSON)',
    downloadReportCsv: 'Download Report (CSV)',
    downloadReportTxt: 'Download Report (TXT)',
    downloadAllZip: 'Download All as ZIP',
    close: 'Close',
    cancel: 'Cancel',

    // Batch Processing
    batchTitle: 'Batch Metadata Queue',
    batchSubtitle: 'Queue multiple files to inspect, strip GPS, or sanitize metadata in one batch.',
    batchAddFiles: 'Add Files to Queue',
    batchClearQueue: 'Clear Queue',
    batchProcessAll: 'Process Compatible Files',
    batchRemoveGpsAll: 'Remove GPS from All Supported',
    batchRemoveAllMeta: 'Sanitize All Supported Files',
    batchQueued: 'Queued',
    batchProcessingState: 'Processing...',
    batchCompleted: 'Completed',
    batchFailed: 'Failed',
    batchUnsupported: 'Unsupported',
    batchFilesTotal: 'Files in Queue',

    // Features Section
    featuresHeading: 'Engineered for Precision, Privacy, & Truth',
    featuresSubheading: 'Built from the ground up for security researchers, photographers, and privacy-conscious users.',
    featLocalTitle: '100% In-Browser & Local',
    featLocalDesc: 'Files are never uploaded to any server. Your sensitive photos, audio, and documents remain strictly in your browser memory.',
    featFormatsTitle: 'Wide Format Capabilities',
    featFormatsDesc: 'Comprehensive support for JPEG, PNG, WebP, PDF, MP3, and Office Open XML documents with honest format matrices.',
    featLosslessTitle: 'Lossless Metadata Rewriting',
    featLosslessDesc: 'Modifies EXIF, RIFF, and PNG chunks at the binary segment level without recompressing or degrading media streams.',
    featVerificationTitle: 'Automated Output Verification',
    featVerificationDesc: 'Every processed file is automatically re-opened and inspected to confirm that requested changes actually took place.',
    featPrivacyTitle: 'Deep Privacy Risk Analysis',
    featPrivacyDesc: 'Automatically detects GPS coordinates, device serial numbers, capture timestamps, and author identities.',
    featBatchTitle: 'Controlled Batch Operations',
    featBatchDesc: 'Process multiple files simultaneously with per-file progress tracking, individual downloads, and ZIP exports.',

    // How It Works Section
    howHeading: 'How MoMetadata Works',
    howSubheading: 'A transparent, multi-step pipeline that guarantees file safety.',
    howStep1Title: '1. Ingest & Inspect',
    howStep1Desc: 'Your file is read into memory as an ArrayBuffer. Dedicated binary parsers inspect EXIF, IPTC, XMP, ID3, and PDF dictionaries.',
    howStep2Title: '2. Audit & Configure',
    howStep2Desc: 'Review privacy risk indicators, edit supported properties, or choose specific metadata categories to remove.',
    howStep3Title: '3. Lossless Segment Processing',
    howStep3Desc: 'The file is rewritten at the chunk/segment level. Pixel and audio entropy data is untouched.',
    howStep4Title: '4. Re-Inspection & Manual Download',
    howStep4Desc: 'MoMetadata parses the generated file again to verify the output before you manually trigger download.',

    // Capability Matrix
    matrixHeading: 'Format Capability Matrix',
    matrixSubheading: 'Honest, transparent disclosure of supported inspection, editing, and removal operations.',
    matrixColFormat: 'Format',
    matrixColInspect: 'Inspect',
    matrixColEdit: 'Edit',
    matrixColRemoveGps: 'Remove GPS',
    matrixColRemoveAll: 'Sanitize',
    matrixColVerify: 'Verify',
    matrixColNotes: 'Technical Implementation Details',
    matrixYes: 'Yes',
    matrixNo: 'Read-only / No',

    // FAQ
    faqHeading: 'Frequently Asked Questions',
    faqSubheading: 'Accurate answers about metadata, privacy, and how MoMetadata operates.',

    // Attribution
    attrHeading: 'Open-Source & Model Attribution',
    attrSubheading: 'MoMetadata is open-source software built upon maintained open-source libraries.',
    attrModelNotice: 'No AI models are used in the current version of MoMetadata.',
    attrLibraryName: 'Library',
    attrVersion: 'Version',
    attrLicense: 'License',
    attrPurpose: 'Purpose & Implementation',

    // Footer
    footerCopyright: '© 2026 MoMetadata. Licensed under the MIT License.',
    footerCraftedWith: 'Crafted with ❤️ by Dimas Mong'
  },
  id: {
    // Brand & Header
    brandName: 'MoMetadata',
    brandTagline: 'Toolkit Lengkap Inspeksi, Pengeditan & Privasi Metadata',
    navWorkspace: 'Ruang Kerja',
    navFeatures: 'Fitur',
    navCapability: 'Format',
    navFaq: 'Tanya Jawab',
    navAttribution: 'Atribusi',
    themeToggle: 'Ganti tema tampilan',
    langToggle: 'Ganti bahasa',

    // Hero
    heroTitle: 'Inspeksi, Edit, & Bersihkan Metadata Berkas',
    heroHighlight: 'Dengan Presisi Sisi-Klien Nyata',
    heroSubtitle: 'Ekstraksi metadata mendalam, penghapusan EXIF/GPS tanpa kompresi ulang, dan audit privasi untuk gambar, dokumen, audio, dan video. 100% aman di memori peramban.',
    heroCta: 'Buka Ruang Kerja Inspektor',
    heroSamplePrompt: 'Atau coba berkas sampel asli:',

    // Workspace Tabs
    tabInspector: 'Inspektor',
    tabEditor: 'Editor',
    tabRemover: 'Pembersih',
    tabPrivacy: 'Audit Privasi',
    tabCompare: 'Perbandingan',
    tabBatch: 'Antrean Massal',

    // Upload Zone
    uploadTitle: 'Tarik berkas Anda ke sini atau klik untuk memilih',
    uploadSubtitle: 'Mendukung JPEG, PNG, WebP, PDF, MP3, DOCX, XLSX, PPTX, TIFF, HEIC, MP4, dan lainnya',
    uploadBrowse: 'Pilih Berkas',
    uploadDropHere: 'Lepaskan untuk memuat berkas ke ruang kerja MoMetadata',
    uploadFormatsHint: 'Batas buffer sisi-klien: 500 MB. Tidak ada data yang dikirim ke server luar.',
    uploadPrivacyBadge: 'Nol Pengunggahan ke Server — 100% Pemrosesan Lokal di Peramban',
    uploadChangeFile: 'Ganti Berkas',
    uploadClearFile: 'Kosongkan Ruang Kerja',

    // Samples
    samplesTitle: 'Sampel Nyata Interaktif',
    samplesSubtitle: 'Klik salah satu sampel untuk mencoba penguraian, pengeditan, dan pembersihan metadata asli tanpa perlu mengunggah berkas pribadi Anda.',
    samplePhotoTitle: 'Sampel 1: Fotografi (JPEG)',
    samplePhotoDesc: 'Canon EOS 5D Mark IV dengan setelan eksposur kamera dan koordinat lokasi GPS uji.',
    samplePaintingTitle: 'Sampel 2: Lukisan Digital (PNG)',
    samplePaintingDesc: 'Karya seni PNG dengan chunk tEXt tertanam (Judul, Penulis, Hak Cipta, Perangkat Lunak).',
    sampleIllustrationTitle: 'Sampel 3: Seni Konsep (WebP)',
    sampleIllustrationDesc: 'Ilustrasi kontainer RIFF dengan tag EXIF & pembuat tertanam.',
    sampleDocTitle: 'Sampel 4: Dokumen (PDF)',
    sampleDocDesc: 'Dokumen PDF standar dengan metadata judul, penulis, subjek, dan kata kunci.',

    // Inspector
    overviewTab: 'Ringkasan',
    cameraTab: 'Kamera & Optik',
    locationTab: 'Lokasi & GPS',
    creatorTab: 'Pembuat & Hak Cipta',
    technicalTab: 'Teknis & Format',
    rawTagsTab: 'Tag Metadata Mentah',
    noMetadataFound: 'Tidak ditemukan metadata dalam kategori ini untuk berkas yang dimuat.',
    noCategoryData: 'Tidak ada tag dalam kelompok ini.',
    searchTagsPlaceholder: 'Cari tag atau nilai metadata...',
    copyValue: 'Salin nilai',
    copied: 'Tersalin!',
    copySummary: 'Salin Ringkasan Metadata',
    summaryCopied: 'Ringkasan berhasil disalin ke papan klip!',
    exportReport: 'Ekspor Laporan',

    // Metadata Labels
    fileName: 'Nama Berkas',
    fileSize: 'Ukuran Berkas',
    fileType: 'Tipe MIME',
    dimensions: 'Dimensi',
    duration: 'Durasi',
    cameraMake: 'Merek Kamera',
    cameraModel: 'Model Kamera',
    lensModel: 'Model Lensa',
    iso: 'Sensitivitas ISO',
    shutterSpeed: 'Kecepatan Rana',
    aperture: 'Bukaan (Aperture)',
    focalLength: 'Panjang Fokus',
    orientation: 'Orientasi',
    software: 'Perangkat Lunak / Aplikasi',
    deviceSerial: 'Nomor Seri Perangkat',
    gpsLatitude: 'Lintang GPS (Latitude)',
    gpsLongitude: 'Bujur GPS (Longitude)',
    gpsAltitude: 'Ketinggian GPS',
    openInMap: 'Lihat Koordinat di OpenStreetMap',
    mapDisclaimer: 'Mengklik akan membuka peta eksternal di tab baru. Tidak ada kueri otomatis yang dikirim.',
    titleLabel: 'Judul',
    artistLabel: 'Artis / Penulis',
    copyrightLabel: 'Pemberitahuan Hak Cipta',
    descriptionLabel: 'Deskripsi / Abstrak',
    commentsLabel: 'Komentar / Catatan',
    albumLabel: 'Album',
    yearLabel: 'Tahun Rilis',
    genreLabel: 'Genre',

    // Editor
    editorTitle: 'Editor Metadata',
    editorSubtitle: 'Ubah ruas metadata yang didukung. Payload terkompresi asli dipertahankan tanpa penurunan kualitas.',
    editorReset: 'Kembalikan ke Asli',
    editorSave: 'Terapkan Perubahan & Verifikasi',
    editorProcessing: 'Memproses dan memverifikasi berkas...',
    editorUnsavedChanges: 'Anda memiliki perubahan yang belum disimpan di editor.',
    editorReadOnlyWarning: 'Format ini saat ini hanya-baca. Pengeditan dinonaktifkan untuk menjaga keutuhan struktur berkas.',
    editorSuccess: 'Perubahan berhasil disimpan dan diverifikasi! Klik Unduh di bawah untuk menyimpan berkas Anda.',

    // Remover
    removerTitle: 'Pembersih & Sanitasi Metadata',
    removerSubtitle: 'Hapus informasi pelacakan sensitif dengan tetap menjaga kualitas audio/visual.',
    removeGpsBtn: 'Hapus Data GPS & Lokasi Saja',
    removeGpsDesc: 'Menghapus koordinat geografis, ketinggian, dan waktu pengambilan sambil mempertahankan setelan kamera dan judul.',
    removeAllBtn: 'Hapus Metadata Non-Esensial yang Didukung',
    removeAllDesc: 'Membersihkan EXIF, IPTC, XMP, komentar, dan pengidentifikasi dengan menjaga keutuhan aliran audio/gambar.',
    preserveIccOption: 'Pertahankan Profil Warna ICC (Disarankan)',
    preserveIccHint: 'Menjaga konsistensi warna tampilan di berbagai layar profesional dan alur kerja cetak.',
    removerDisclaimer: 'Catatan: Penghapusan metadata membersihkan header data tertanam. Ini tidak menghapus informasi yang terlihat pada piksel gambar, gelombang audio, atau teks berkas.',
    removerProcessing: 'Membersihkan metadata...',

    // Privacy Analyzer
    privacyTitle: 'Audit Risiko Privasi',
    privacySubtitle: 'Inspeksi otomatis untuk informasi pelacakan sensitif, pengidentifikasi perangkat, dan lokasi.',
    privacyScoreHigh: 'Paparan Privasi Tinggi Terdeteksi',
    privacyScoreModerate: 'Paparan Privasi Sedang Terdeteksi',
    privacyScoreLow: 'Paparan Privasi Rendah Terdeteksi',
    riskHigh: 'Risiko Tinggi',
    riskModerate: 'Risiko Sedang',
    riskLow: 'Risiko Rendah',
    privacyCleanAllAction: 'Sanitasi Metadata Sensitif yang Terdeteksi',
    noSensitiveDataFound: 'Tidak Ada Metadata Sensitif yang Terdeteksi',
    noSensitiveDataDesc: 'Tidak ada koordinat GPS, nomor seri perangkat, atau tag pribadi yang dapat diidentifikasi pada berkas ini.',

    // Comparison
    compareTitle: 'Verifikasi Sebelum & Sesudah',
    compareSubtitle: 'Periksa perbedaan struktural antara berkas asli dan berkas hasil proses.',
    compareBefore: 'Berkas Asli',
    compareAfter: 'Berkas Hasil',
    compareField: 'Properti / Tag',
    compareStatus: 'Status Verifikasi',
    statusRemoved: 'Dihapus',
    statusModified: 'Diubah',
    statusUnchanged: 'Dipertahankan / Tidak Berubah',
    statusUnverified: 'Belum Terverifikasi',
    verificationStatus: 'Status Verifikasi Output',
    verifiedLabel: 'Terverifikasi Utuh & Bersih',
    partiallyVerifiedLabel: 'Terverifikasi Sebagian',
    failedLabel: 'Pemeriksaan Verifikasi Gagal',

    // Download & Actions
    downloadCleaned: 'Unduh Berkas yang Telah Dibersihkan',
    downloadEdited: 'Unduh Berkas yang Diedit',
    downloadReportJson: 'Unduh Laporan (JSON)',
    downloadReportCsv: 'Unduh Laporan (CSV)',
    downloadReportTxt: 'Unduh Laporan (TXT)',
    downloadAllZip: 'Unduh Semua sebagai ZIP',
    close: 'Tutup',
    cancel: 'Batal',

    // Batch Processing
    batchTitle: 'Antrean Metadata Massal',
    batchSubtitle: 'Antrekan beberapa berkas sekaligus untuk diinspeksi, dihapus GPS, atau dibersihkan metadatanya.',
    batchAddFiles: 'Tambah Berkas ke Antrean',
    batchClearQueue: 'Kosongkan Antrean',
    batchProcessAll: 'Proses Berkas yang Kompatibel',
    batchRemoveGpsAll: 'Hapus GPS dari Semua yang Didukung',
    batchRemoveAllMeta: 'Sanitasi Semua Berkas yang Didukung',
    batchQueued: 'Dalam Antrean',
    batchProcessingState: 'Memproses...',
    batchCompleted: 'Selesai',
    batchFailed: 'Gagal',
    batchUnsupported: 'Tidak Didukung',
    batchFilesTotal: 'Total Berkas dalam Antrean',

    // Features Section
    featuresHeading: 'Dirancang untuk Presisi, Privasi, & Kebenaran Data',
    featuresSubheading: 'Dibangun dari nol untuk peneliti keamanan, fotografer, dan pengguna yang peduli privasi.',
    featLocalTitle: '100% Lokal di Dalam Peramban',
    featLocalDesc: 'Berkas tidak pernah diunggah ke server mana pun. Foto, rekaman audio, dan dokumen sensitif Anda tetap berada di memori peramban.',
    featFormatsTitle: 'Kemampuan Format Luas',
    featFormatsDesc: 'Dukungan komprehensif untuk dokumen JPEG, PNG, WebP, PDF, MP3, dan Office Open XML dengan matriks kemampuan yang jujur.',
    featLosslessTitle: 'Penulisan Metadata Tanpa Kehilangan Mutu',
    featLosslessDesc: 'Memodifikasi chunk EXIF, RIFF, dan PNG pada tingkat segmen biner tanpa mengompresi ulang atau menurunkan kualitas aliran media.',
    featVerificationTitle: 'Verifikasi Output Otomatis',
    featVerificationDesc: 'Setiap berkas hasil proses dibuka kembali dan diinspeksi untuk memastikan bahwa perubahan yang diminta benar-benar terjadi.',
    featPrivacyTitle: 'Analisis Risiko Privasi Mendalam',
    featPrivacyDesc: 'Mendeteksi otomatis koordinat GPS, nomor seri perangkat, waktu pengambilan gambar, dan identitas pembuat.',
    featBatchTitle: 'Operasi Massal Terkendali',
    featBatchDesc: 'Proses banyak berkas secara bersamaan dengan pemantauan progres per berkas, unduhan mandiri, dan ekspor arsip ZIP.',

    // How It Works Section
    howHeading: 'Cara Kerja MoMetadata',
    howSubheading: 'Alur kerja multi-tahap yang transparan demi menjamin keamanan berkas Anda.',
    howStep1Title: '1. Muat & Inspeksi',
    howStep1Desc: 'Berkas dimuat ke memori sebagai ArrayBuffer. Parser biner khusus memeriksa dictionary EXIF, IPTC, XMP, ID3, dan PDF.',
    howStep2Title: '2. Audit & Konfigurasi',
    howStep2Desc: 'Tinjau indikator risiko privasi, sesuaikan properti yang didukung, atau pilih kategori metadata tertentu untuk dibersihkan.',
    howStep3Title: '3. Pemrosesan Segmen Biner',
    howStep3Desc: 'Berkas ditulis ulang pada tingkat segmen/chunk. Data piksel dan entropi audio dibiarkan utuh tanpa perubahan.',
    howStep4Title: '4. Re-Inspeksi & Unduhan Manual',
    howStep4Desc: 'MoMetadata menguraikan ulang berkas yang dihasilkan untuk memverifikasi hasilnya sebelum Anda menekan tombol unduh.',

    // Capability Matrix
    matrixHeading: 'Matriks Kemampuan Format',
    matrixSubheading: 'Pengungkapan transparan dan jujur mengenai operasi inspeksi, edit, dan sanitasi yang didukung.',
    matrixColFormat: 'Format',
    matrixColInspect: 'Inspeksi',
    matrixColEdit: 'Edit',
    matrixColRemoveGps: 'Hapus GPS',
    matrixColRemoveAll: 'Sanitasi',
    matrixColVerify: 'Verifikasi',
    matrixColNotes: 'Detail Implementasi Teknis',
    matrixYes: 'Ya',
    matrixNo: 'Hanya-baca / Tidak',

    // FAQ
    faqHeading: 'Pertanyaan yang Sering Diajukan (FAQ)',
    faqSubheading: 'Jawaban akurat seputar metadata, privasi, dan cara kerja MoMetadata.',

    // Attribution
    attrHeading: 'Atribusi Sumber Terbuka & Model AI',
    attrSubheading: 'MoMetadata adalah perangkat lunak sumber terbuka yang dibangun di atas pustaka teruji.',
    attrModelNotice: 'Tidak ada model AI yang digunakan dalam versi MoMetadata saat ini.',
    attrLibraryName: 'Pustaka',
    attrVersion: 'Versi',
    attrLicense: 'Lisensi',
    attrPurpose: 'Tujuan & Implementasi',

    // Footer
    footerCopyright: '© 2026 MoMetadata. Licensed under the MIT License.',
    footerCraftedWith: 'Crafted with ❤️ by Dimas Mong'
  }
};
