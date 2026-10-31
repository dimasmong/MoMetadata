# Open-Source & Model Attribution — MoMetadata

MoMetadata is built using open-source libraries. This document provides complete, transparent attribution for all dependencies, their respective licenses, and their exact operational role in the project.

## AI & Machine Learning Model Disclosure

**No AI models are used in the current version of MoMetadata.**

All metadata inspection, EXIF parsing, ID3 manipulation, PDF property extraction, and binary chunk stripping are performed using deterministic, standards-compliant open-source algorithms and parsers running locally in the client browser.

---

## Direct Dependencies

### 1. ExifReader
- **Official Repository**: https://github.com/mattiasw/ExifReader
- **Version**: ^4.52.0
- **License**: Mozilla Public License 2.0 (MPL-2.0) / 2-Clause BSD License
- **Author/Maintainer**: Mattias Wadman
- **Role in MoMetadata**: Primary client-side binary parser for EXIF, IPTC, XMP, GPS, PNG chunks, WebP headers, TIFF IFDs, and QuickTime/ISOBMFF container metadata.

### 2. piexifjs
- **Official Repository**: https://github.com/hMatoba/piexifjs
- **Version**: ^1.0.6
- **License**: MIT License
- **Author/Maintainer**: hMatoba
- **Role in MoMetadata**: Binary JPEG EXIF segment dump and insertion, GPS IFD stripping, and EXIF tag updates without altering compressed JPEG DCT scan data.

### 3. pdf-lib
- **Official Repository**: https://github.com/Hopding/pdf-lib
- **Version**: ^1.17.1
- **License**: MIT License
- **Author/Maintainer**: Andrew Dillon
- **Role in MoMetadata**: Browser-side PDF document loading, Info dictionary inspection, metadata property editing, and metadata wiping.

### 4. mp3tag.js
- **Official Repository**: https://github.com/eidoriantan/mp3tag.js
- **Version**: ^3.17.1
- **License**: MIT License
- **Author/Maintainer**: eidoriantan
- **Role in MoMetadata**: Standards-compliant ID3v1 and ID3v2.3 tag inspection, editing, and header updates while preserving MPEG audio frames untouched.

### 5. JSZip
- **Official Repository**: https://github.com/Stuk/jszip
- **Version**: ^3.10.2
- **License**: MIT License / Dual GPLv3
- **Author/Maintainer**: Stuart Knightley
- **Role in MoMetadata**: Parsing and modifying `docProps/core.xml` within Office Open XML packages (.docx, .xlsx, .pptx) and packaging batch-processed files into ZIP archives for manual download.

### 6. Lucide React
- **Official Repository**: https://github.com/lucide-icons/lucide
- **Version**: ^1.66.0
- **License**: ISC License
- **Author/Maintainer**: Lucide Contributors
- **Role in MoMetadata**: UI icons throughout the application.

---

## License Notice
MoMetadata is licensed under the **MIT License**. The MIT License applies to the original MoMetadata source code. Third-party dependencies retain their respective original licenses (MIT, MPL-2.0, ISC, BSD).
