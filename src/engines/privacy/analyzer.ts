import { SensitiveFinding, CameraInfo, LocationInfo, CreatorInfo, RawTag } from '../../types/metadata';

export function analyzePrivacyRisks(
  location?: LocationInfo,
  camera?: CameraInfo,
  creator?: CreatorInfo,
  rawTags: RawTag[] = [],
  canRemove = true
): SensitiveFinding[] {
  const findings: SensitiveFinding[] = [];

  // 1. GPS Coordinates (High Risk)
  if (location && location.hasGps && location.latitude !== undefined && location.longitude !== undefined) {
    findings.push({
      id: 'gps-coordinates',
      field: 'GPS Coordinates',
      value: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
      category: 'location',
      risk: 'high',
      explanation: {
        en: 'Precise geographic coordinates reveal the exact physical location where this file was captured, potentially exposing home, workplace, or private travel routes.',
        id: 'Koordinat geografis yang tepat mengungkap lokasi fisik tempat berkas ini diambil, berpotensi mengekspos rumah, tempat kerja, atau rute perjalanan pribadi.'
      },
      canRemove
    });
  }

  // 2. GPS Altitude & Timestamp
  if (location?.altitude !== undefined) {
    findings.push({
      id: 'gps-altitude',
      field: 'GPS Altitude',
      value: `${location.altitude} m`,
      category: 'location',
      risk: 'low',
      explanation: {
        en: 'Elevation data complements geographic location and can help identify specific floors or terrain.',
        id: 'Data ketinggian melengkapi lokasi geografis dan dapat mengidentifikasi lantai gedung atau medan tertentu.'
      },
      canRemove
    });
  }

  // 3. Device Serial Numbers (High Risk)
  if (camera?.serialNumber) {
    findings.push({
      id: 'device-serial',
      field: 'Device Serial Number',
      value: String(camera.serialNumber),
      category: 'device',
      risk: 'high',
      explanation: {
        en: 'Unique hardware identifier that can link multiple anonymous photos or files back to your specific physical device.',
        id: 'Pengidentifikasi perangkat keras unik yang dapat menautkan beberapa foto atau berkas anonim ke perangkat fisik Anda.'
      },
      canRemove
    });
  }

  // Check raw tags for serial numbers
  const rawSerial = rawTags.find(t => 
    t.tag.toLowerCase().includes('serialnumber') || 
    t.tag.toLowerCase().includes('bodyserialnumber') ||
    t.tag.toLowerCase().includes('lensserialnumber')
  );
  if (rawSerial && !camera?.serialNumber) {
    findings.push({
      id: `raw-serial-${rawSerial.tag}`,
      field: rawSerial.description || rawSerial.tag,
      value: rawSerial.value,
      category: 'device',
      risk: 'high',
      explanation: {
        en: 'Hardware serial identifier found in raw EXIF/MakerNotes data that uniquely identifies your equipment.',
        id: 'Nomor seri perangkat keras ditemukan di data EXIF/MakerNotes mentah yang mengidentifikasi peralatan Anda secara unik.'
      },
      canRemove
    });
  }

  // 4. Creator / Author / Artist Name (Moderate Risk)
  const creatorValue = creator?.creator || creator?.artist || creator?.author;
  if (creatorValue && creatorValue.trim().length > 0) {
    findings.push({
      id: 'creator-name',
      field: 'Creator / Author Name',
      value: creatorValue,
      category: 'identity',
      risk: 'moderate',
      explanation: {
        en: 'Personal name or pseudonym directly associates this file with an identifiable individual.',
        id: 'Nama pribadi atau nama samaran yang secara langsung mengaitkan berkas ini dengan individu yang dapat diidentifikasi.'
      },
      canRemove
    });
  }

  // 5. Precise Creation / Capture Timestamp (Moderate Risk)
  const rawDate = rawTags.find(t => 
    t.tag.toLowerCase() === 'datetimeoriginal' || 
    t.tag.toLowerCase() === 'createdate' ||
    t.tag.toLowerCase() === 'creationdate'
  );
  if (rawDate && rawDate.value) {
    findings.push({
      id: 'creation-timestamp',
      field: 'Capture / Creation Timestamp',
      value: rawDate.value,
      category: 'temporal',
      risk: 'moderate',
      explanation: {
        en: 'Exact date and second of capture can correlate with schedules, surveillance logs, or social activities.',
        id: 'Tanggal dan detik pengambilan yang tepat dapat dicocokkan dengan jadwal, log pengawasan, atau aktivitas publik.'
      },
      canRemove
    });
  }

  // 6. Editing Software / System Info (Low to Moderate Risk)
  if (camera?.software) {
    findings.push({
      id: 'editing-software',
      field: 'Software / Application',
      value: camera.software,
      category: 'software',
      risk: 'low',
      explanation: {
        en: 'Reveals the software, version, and operating system used to edit or export the file.',
        id: 'Mengungkap aplikasi, versi, dan sistem operasi yang digunakan untuk mengedit atau mengekspor berkas.'
      },
      canRemove
    });
  }

  // 7. Organization / Company (Moderate Risk)
  if (creator?.company) {
    findings.push({
      id: 'organization',
      field: 'Company / Organization',
      value: creator.company,
      category: 'identity',
      risk: 'moderate',
      explanation: {
        en: 'Corporate or employer name embedded in document properties.',
        id: 'Nama perusahaan atau organisasi yang tertanam di properti dokumen.'
      },
      canRemove
    });
  }

  // 8. Embedded Comments / Notes (Low to Moderate Risk)
  if (creator?.comments && creator.comments.trim().length > 0) {
    findings.push({
      id: 'user-comments',
      field: 'Embedded Comments / Notes',
      value: creator.comments.length > 80 ? `${creator.comments.slice(0, 80)}...` : creator.comments,
      category: 'comment',
      risk: 'moderate',
      explanation: {
        en: 'Freeform comments or internal workflow notes may contain sensitive internal references.',
        id: 'Komentar bebas atau catatan alur kerja internal dapat berisi referensi internal sensitif.'
      },
      canRemove
    });
  }

  return findings;
}
