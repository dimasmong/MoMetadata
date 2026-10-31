/**
 * Manual file download helper.
 * Strictly adheres to rule: NEVER download automatically.
 * Must only be invoked via user interaction (e.g. click).
 */
export function triggerManualDownload(blob: Blob, filename: string): void {
  if (!blob || blob.size === 0) {
    throw new Error('Cannot download an empty or invalid file.');
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  
  document.body.appendChild(a);
  a.click();
  
  // Clean up safely
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

export function generateOutputFilename(
  originalName: string, 
  operation: 'edited' | 'cleaned' | 'report',
  extensionOverride?: string
): string {
  const lastDot = originalName.lastIndexOf('.');
  const baseName = lastDot !== -1 ? originalName.slice(0, lastDot) : originalName;
  const ext = extensionOverride || (lastDot !== -1 ? originalName.slice(lastDot) : '');
  
  return `${baseName}_metadata-${operation}${ext.startsWith('.') ? ext : `.${ext}`}`;
}
