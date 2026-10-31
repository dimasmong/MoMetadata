# Security and Privacy Policy

## 1. Core Privacy Architecture

MoMetadata is engineered strictly as a **client-side, browser-based standalone application**.

- **Zero Server Uploads**: User files are never uploaded to any remote server or third-party cloud service. All reading, editing, and stripping of metadata happens inside the local browser session.
- **Zero Third-Party Telemetry**: There are no analytics trackers, advertising beacons, external logging hooks, or cloud telemetry scripts bundled in this application.
- **No User Accounts**: MoMetadata operates without logins, accounts, or persistent remote state.
- **Temporary Object URL Cleanup**: All created Blob URLs and object memory representations are explicitly tracked and revoked upon file removal or session clearing to prevent memory exhaustion and data persistence.

---

## 2. Input Sanitization & Threat Protection

All metadata strings extracted from arbitrary files are treated as untrusted user input:

- **Cross-Site Scripting (XSS) Prevention**: Every tag key and tag value displayed in the user interface is sanitized and sanitized against HTML/XML injection before DOM rendering.
- **ASCII Control Character Stripping**: Null bytes and unexpected terminal control codes (`\x00-\x08`, `\x0B\x0C`, `\x0E-\x1F`, `\x7F`) are stripped from metadata strings.
- **Magic Byte Validation**: File formats are identified and verified by analyzing leading magic numbers and container structures rather than relying on user-controlled file extensions.
- **Worker Isolation**: WebAssembly ExifTool operations run inside dedicated Web Workers, preventing main-thread blocking and ensuring memory limits are sandboxed.

---

## 3. Content Security Policy (CSP)

MoMetadata is configured to be served with strict HTTP response headers:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; worker-src 'self' blob:; connect-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```

---

## 4. Reporting a Security Vulnerability

If you discover a security vulnerability or security bug in MoMetadata:

1. **Please do not disclose it publicly** until it has been investigated and addressed.
2. Email your findings with reproduction steps and proof-of-concept files to:
   - **dimasmong.dev@gmail.com** (or open a confidential security advisory on GitHub).
3. We will acknowledge receipt within 48 hours and work with you to patch any confirmed vulnerabilities promptly.
