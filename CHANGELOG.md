# Changelog

All notable changes to **MoMetadata** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-31

### Added
- **Client-Side Metadata Inspector**: Deep hierarchical extraction of EXIF, GPS, IPTC, XMP, ICC, RIFF, PNG textual chunks, ID3v1/ID3v2, and PDF Document Info.
- **Lossless Metadata Editor**: Precision editing of Title, Author/Artist, Copyright, Description, Software, Comments, Year, Album, and GPS coordinates without recompressing media entropy.
- **Privacy Sanitizer & Remover**: Scrub GPS coordinates only, or wipe all non-essential tracking metadata with optional ICC color profile preservation.
- **Privacy Risk Analysis**: Heuristic scanning categorized into High, Moderate, and Low privacy exposure levels.
- **Before & After Structural Diff**: Verification table showing exact byte delta, sanitized tags, and payload integrity confirmation.
- **Batch Processing Queue**: Bulk metadata inspection and stripping with ZIP packaging export.
- **Report Exporter**: Export comprehensive technical metadata summaries in JSON, CSV, and formatted TXT.
- **Authentic Sample Gallery**: Integrated pre-packaged samples (JPEG with GPS, PNG with chunks, WebP with EXIF, and PDF with Document Info).
- **Dual Glassmorphism Theme**: Light Mode (default) and Dark Mode adhering to WCAG 2.1 AA contrast requirements with primary brand `#243A73`.
- **Bilingual Support**: Fully localized interface in English and Bahasa Indonesia.
