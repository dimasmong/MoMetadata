import { parseMetadata, writeMetadata } from '@lilohuang/exiftool';

export interface WorkerRequest {
  id: string;
  type: 'write' | 'strip' | 'parse';
  fileName: string;
  buffer: ArrayBuffer;
  tags?: Record<string, string | number | boolean>;
  args?: string[];
}

export interface WorkerResponse {
  id: string;
  success: boolean;
  data?: ArrayBuffer | unknown;
  error?: string;
}

// Custom fetch handler to resolve zeroperl.wasm from static public folder
const workerFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const urlStr = typeof input === 'string' ? input : (input as URL).toString();
  if (urlStr.includes('zeroperl.wasm')) {
    const origin = (self as any).location?.origin || '';
    return fetch(`${origin}/zeroperl.wasm`, init);
  }
  return fetch(input, init);
};

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, type, fileName, buffer, tags, args } = e.data;

  try {
    if (type === 'parse') {
      const result = await parseMetadata(
        { name: fileName, data: new Uint8Array(buffer) },
        { args: args || ['-json'], fetch: workerFetch as any }
      );
      if (result.success) {
        let parsed = result.data;
        if (typeof result.data === 'string') {
          try {
            parsed = JSON.parse(result.data);
          } catch {
            // Keep raw string
          }
        }
        self.postMessage({ id, success: true, data: parsed } as WorkerResponse);
      } else {
        self.postMessage({ id, success: false, error: result.error } as WorkerResponse);
      }
    } else if (type === 'write' || type === 'strip') {
      const writeTags = tags || {};
      const writeArgs = args || [];

      const result = await writeMetadata(
        { name: fileName, data: new Uint8Array(buffer) },
        writeTags,
        { args: writeArgs, fetch: workerFetch as any }
      );

      if (result.success && result.data) {
        const outBuffer = result.data;
        self.postMessage({ id, success: true, data: outBuffer } as WorkerResponse);
      } else {
        self.postMessage({ id, success: false, error: result.error || 'Metadata operation failed' } as WorkerResponse);
      }
    }
  } catch (err: any) {
    self.postMessage({ id, success: false, error: err?.message || String(err) } as WorkerResponse);
  }
};
