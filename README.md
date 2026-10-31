# MoMetadata

> **Professional Standalone Browser-Based File Metadata Manager**  
> Inspect, edit, and remove file metadata entirely in your browser with zero server uploads, genuine WebAssembly processing, and post-process verification.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-ExifTool_Wasm-654ff0.svg?logo=webassembly&logoColor=white)](https://webassembly.org/)
[![Vitest](https://img.shields.io/badge/Vitest-30_Passed-729b1b.svg?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-16_Passed-2EAD33.svg?logo=playwright&logoColor=white)](https://playwright.dev/)

---

## Overview

**MoMetadata** is an independent, single-purpose web application designed for photographers, privacy advocates, journalists, and developers who need absolute control over their file metadata.

Unlike common online metadata tools that silently transmit your photos and documents to remote cloud servers, **MoMetadata executes 100% locally in your browser**. Files never leave your device. All parsing, editing, and stripping operations run client-side using a combination of lightweight metadata parsers and browser-compiled WebAssembly engines.

### Key Principles

1. **Zero Server Uploads**: No backend APIs, no cloud persistence, and no network transmission of user files.
2. **Genuine Metadata Writing**: No simulated operations, mock timers, or fake success messages. Every byte modification is real.
3. **Lossless Operations**: Modifies and strips EXIF/XMP/IPTC structures without recompressing image or audio data, preserving 100% original pixel fidelity.
4. **Automated Verification**: Automatically re-opens modified and cleaned files to verify whether target tags were actually altered or stripped before reporting success.
5. **No Exaggerated Marketing**: Engineered with a calm, professional Frost White aesthetic, transparent capability limits, and honest status reports.

---

## Features

### 1. Comprehensive Metadata Inspection
- Extracts and categorizes every discoverable tag:
  - **General**: File size, MIME type, dimensions, color space, creation and modification timestamps.
  - **Camera & Capture**: Make, model, lens, focal length, ISO, shutter speed, aperture, flash, metering, orientation, camera firmware.
  - **Location & GPS**: Latitude, longitude, altitude, GPS timestamps, and map positioning coordinates.
  - **Description & Rights**: Title, author/artist, copyright notice, description, keywords, comments, creator software.
  - **Advanced Containers**: Raw EXIF, IPTC, XMP, ICC color profiles, MakerNotes, ID3v1/ID3v2, Vorbis Comments, and PDF properties.
- **Grouped & Raw Views**: Seamlessly switch between structured category accordions and a raw tag inspector.
- **Full-Text Filter**: Real-time instant search across tag names, categories, and values.
- **One-Click Copy**: Copy any single tag value directly to the clipboard.
- **Structured Export**: Export extracted metadata as structured JSON or tabular CSV.

### 2. Lossless Metadata Editing
- Genuine per-format tag modification:
  - **JPEG**: Modifies EXIF IFD0, ExifIFD, and GPS IFD structures losslessly via direct marker manipulation.
  - **PDF**: Updates Document Information dictionaries (Title, Author, Subject, Keywords, Creator) via `pdf-lib`.
  - **PNG, WebP, TIFF**: Compiles and writes metadata tags via WebAssembly ExifTool Web Workers.
- Pre-populates existing values for easy refinement.
- Provides individual field clearing and single-click reset to original values.
- Input validation for coordinates (-90° to 90° latitude, -180° to 180° longitude) and ISO/EXIF date strings.
- Never overwrites the original file—always produces a downloadable modified copy (`_metadata-edited.ext`).

### 3. Metadata Stripping & Privacy Presets
- **Preset A — Remove GPS & Location**: Strips GPS latitude, longitude, altitude, and location timestamps while leaving camera settings intact.
- **Preset B — Remove Personal Information**: Strips author, artist, copyright, owner name, contact details, and location identifiers.
- **Preset C — Remove Capture Information**: Strips camera model, lens specifications, exposure parameters, and shooting timestamps.
- **Preset D — Remove All Removable Metadata**: Strips all non-essential metadata while protecting essential rendering data.
- **Custom Removal**: Interactive checklist allowing users to select individual tags or entire metadata groups to strip.
- **Preservation Controls**:
  - *Preserve Color Profile*: Safeguards embedded ICC color profiles by default to prevent color shifting in browsers and printers.
  - *Preserve Rendering Metadata*: Protects image dimensions and orientation markers needed for correct screen display.

### 4. Post-Process Verification Engine
Every modified or cleaned file is automatically passed through a verification stage before presenting the result to the user:
1. Re-opens the generated binary buffer with the metadata parser.
2. Checks whether target tags were actually modified or removed.
3. Verifies that the container structure and magic bytes remain uncorrupted.
4. Generates a transparent verification report (`pass`, `warning`, or `fail`) listing modified tags, removed tags, and any residual metadata.

### 5. Multi-File Batch Processing
- Add, select, deselect, or remove files in a shared workspace.
- Individual processing status indicators (`Ready`, `Processing`, `Completed`, `Failed`, `Unsupported`).
- Apply editing or removal operations across all selected files in a single pass.
- Concurrency-controlled execution to avoid browser memory pressure.
- Export all successfully processed files bundled into a single ZIP archive.

### 6. File Preview
- **Images**: Responsive, orientation-aware image preview with dimension and aspect ratio metrics.
- **Audio**: Format details and extracted embedded album cover artwork (ID3/Vorbis).
- **Video**: Native browser video player for compatible codecs (MP4, MOV).
- **PDF**: Document metadata card with page metrics and stream info.
- Non-previewable formats display a clean, accessible file format badge without blocking metadata analysis.

### 7. Bilingual Localization
- Full dual-language support:
  - **English (US)** (default)
  - **Bahasa Indonesia**
- Every label, button, modal, tooltip, error message, and verification report is 100% localized.
- Locale-aware number and date formatting.

### 8. Theme System
- **Light Mode** (default): Refined Frost White primary appearance with subtle slate borders and blue accents.
- **Dark Mode**: High-contrast, glare-free dark slate workspace.
- Persistent user preference stored in `localStorage`.

---

## Format Compatibility Matrix

| Format | Category | Read | Edit | Remove | Verification | Implementation Notes |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| **JPEG / JPG** | Image | Yes | Yes | Yes | Yes | Lossless EXIF manipulation (`piexifjs`); zero image recompression. |
| **PNG** | Image | Yes | Yes | Yes | Yes | Parsed via `exifr`; edited/stripped via ExifTool Wasm worker. |
| **WebP** | Image | Yes | Yes | Yes | Yes | Lossless chunk parsing; edited/stripped via ExifTool Wasm worker. |
| **TIFF** | Image | Yes | Yes | Yes | Yes | Deep IFD inspection; ExifTool Wasm tag editing. |
| **HEIC / HEIF** | Image | Yes | Read-Only | Read-Only | Yes | Read-only in browser to avoid non-standard container re-muxing. |
| **AVIF** | Image | Yes | Read-Only | Read-Only | Yes | Read-only in browser to avoid re-encoding. |
| **PDF** | Document | Yes | Yes | Yes | Yes | Document dictionary manipulation via `pdf-lib`. |
| **MP3** | Audio | Yes | Read-Only | Read-Only | Yes | ID3v1, ID3v2.2-2.4 parsing & cover art via `music-metadata`. |
| **M4A / AAC** | Audio | Yes | Read-Only | Read-Only | Yes | QuickTime atom & iTunes metadata tag inspection. |
| **FLAC** | Audio | Yes | Read-Only | Read-Only | Yes | Vorbis comments & picture block extraction. |
| **MP4** | Video | Yes | Read-Only | Read-Only | Yes | ISO base media file format atom parsing without memory leaks. |
| **MOV** | Video | Yes | Read-Only | Read-Only | Yes | QuickTime movie header inspection. |
| **DNG / RAW** | Camera RAW | Yes | Read-Only | Read-Only | Yes | Defaults to read-only to prevent destructive sensor alteration. |

---

## Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      MoMetadata UI                          │
│        React 19 + TypeScript + Tailwind CSS v4 + Vite       │
├──────────────────────────────┬──────────────────────────────┤
│       Read Pipeline          │       Write Pipeline         │
│  ┌────────────────────────┐  │  ┌────────────────────────┐  │
│  │         exifr          │  │  │        piexifjs        │  │
│  │ (EXIF, IPTC, XMP, ICC) │  │  │ (Lossless JPEG EXIF)   │  │
│  ├────────────────────────┤  │  ├────────────────────────┤  │
│  │        pdf-lib         │  │  │        pdf-lib         │  │
│  │    (PDF Doc Info)      │  │  │ (PDF Doc Info Editing) │  │
│  ├────────────────────────┤  │  ├────────────────────────┤  │
│  │     music-metadata     │  │  │  Web Worker Bridge     │  │
│  │   (ID3, Vorbis, Art)   │  │  │  ┌──────────────────┐  │  │
│  ├────────────────────────┤  │  │  │ ExifTool Wasm    │  │  │
│  │  HTML5 Video Inspector │  │  │  │ (zeroperl.wasm)  │  │  │
│  │  (Native Video Atoms)  │  │  │  └──────────────────┘  │  │
│  └────────────────────────┘  │  └────────────────────────┘  │
├──────────────────────────────┴──────────────────────────────┤
│               Post-Process Verification Engine               │
│       (Re-parses generated bytes & validates output)         │
└─────────────────────────────────────────────────────────────┘
```

- **Runtime**: Browser WebAssembly + Web Workers.
- **Styling**: Tailwind CSS v4 modern utility system.
- **Icons**: Lucide Icons.
- **Archive Generation**: `jszip` in-memory archiver.
- **Unit Testing**: Vitest 5 with `@testing-library/react`.
- **E2E Testing**: Playwright with Desktop Chromium and Android Mobile emulation.

---

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/dimasmong/MoMetadata.git
cd MoMetadata

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```
Open your browser at `http://localhost:5173` (or the port indicated in your terminal).

### Running Tests

```bash
# Run Vitest unit tests (30 tests)
npm test

# Run Playwright end-to-end tests (16 tests across desktop and mobile)
npm run test:e2e
```

### Production Build

```bash
npm run build
```
The optimized static bundle will be generated in `dist/`.

### Preview Production Build

```bash
npm run preview
```

---

## Deployment to Vercel

MoMetadata is pre-configured for static deployment on Vercel with high-security headers:

1. Push your repository to GitHub (`https://github.com/dimasmong/MoMetadata`).
2. Import the project into the [Vercel Dashboard](https://vercel.com).
3. The included `vercel.json` automatically configures:
   - Client-side SPA routing rewrites.
   - Cross-Origin Opener Policy (`COOP: same-origin`).
   - Cross-Origin Embedder Policy (`COEP: require-corp`) for WebAssembly and Web Worker isolation.
   - Strict Content Security Policy (`CSP`).
   - WASM MIME-type serving and immutable caching for `zeroperl.wasm`.

---

## Security and Privacy

- **No Data Retention**: Processing takes place exclusively inside memory buffers within the browser tab.
- **Strict Content Security Policy**: Prohibits unexpected outbound connections and remote scripts.
- **Input Sanitization**: All metadata keys and values are sanitized to protect against HTML injection and control code attacks.
- Read our full [Security Policy](SECURITY.md) for vulnerability reporting guidelines.

---

## Attributions

MoMetadata is made possible by extraordinary open-source projects including ExifTool by Phil Harvey, `@lilohuang/exiftool`, `exifr`, `pdf-lib`, `piexifjs`, `music-metadata`, `jszip`, and `lucide-react`.

For complete license notices and author credits, please see [ATTRIBUTIONS.md](ATTRIBUTIONS.md).

---

## License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for details.

© 2026 Dimas Mong.
