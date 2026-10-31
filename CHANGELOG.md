# Changelog

All notable changes to the **MoMetadata** application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-31

### Initial Release

MoMetadata is a professional, standalone, browser-based file metadata manager engineered for local-first privacy, genuine metadata editing, and lossless metadata stripping.

#### Added
- **Core Processing Engine**:
  - Pure client-side processing architecture: zero server uploads, zero remote analytics, 100% offline-capable.
  - Integration with `@lilohuang/exiftool` compiled to WebAssembly with `zeroperl.wasm` running in isolated Web Workers.
  - High-performance `exifr` parser for EXIF, IPTC, XMP, ICC color profiles, and GPS coordinates.
  - Lossless JPEG EXIF editing, GPS stripping, and color profile preservation via `piexifjs`.
  - In-browser PDF document property manipulation with `pdf-lib`.
  - Pure browser audio tag parser with `music-metadata` supporting ID3v1, ID3v2, Vorbis Comments, and embedded artwork extraction.
  - Memory-safe video container inspection for MP4 and QuickTime MOV.
  - True magic byte signature detection preventing extension spoofing and malicious files.
- **Verification Engine**:
  - Automated post-processing verification re-opening generated files to prove tag removal or modification.
  - Detailed verification reports (Pass, Warning, Fail) with retained tag enumeration.
- **Removal Presets**:
  - Preset A: Remove GPS & Location coordinates.
  - Preset B: Remove Personal Information (Author, Artist, Owner, Contact).
  - Preset C: Remove Capture Information (Camera model, lens, exposure, timestamps).
  - Preset D: Remove All Removable Metadata (while preserving essential rendering data).
  - Custom Preset: Selective field-level and group-level metadata stripping.
- **Batch Processing**:
  - Multi-file queue management with individual status indicators (`Ready`, `Processing`, `Completed`, `Failed`, `Unsupported`).
  - Batch metadata editing across selected files.
  - Batch metadata stripping with preset selection.
  - In-memory ZIP archive generation for batch downloads using `jszip`.
- **User Interface & Design System**:
  - Frost White professional aesthetic with refined blue accents and balanced typography.
  - Responsive 3-column desktop layout (File list, Center preview, Right workspace tabs) seamlessly adapting to stacked mobile screens.
  - 5 workspace tabs: Overview, All Metadata, Edit Metadata, Remove Metadata, and Export.
  - Searchable metadata table with copyable values, group collapsing, and raw JSON/CSV export.
  - Format Compatibility Registry modal tracking Read, Edit, Remove, and Verify capabilities across 13 formats.
  - Full bilingual localization: English (default) and Bahasa Indonesia.
  - Light and Dark mode with persistent `localStorage` theme preference.
- **Testing & Quality Assurance**:
  - 30 unit tests using Vitest covering format detection, lossless JPEG modification, PDF editing, batch queue stability, and verification.
  - 16 cross-browser end-to-end tests using Playwright validating workflows on Desktop Chromium and Mobile Android-Chrome.
