import type { WorkerRequest, WorkerResponse } from '../../workers/exiftool.worker';

let workerInstance: Worker | null = null;
const pendingRequests = new Map<string, { resolve: (val: any) => void; reject: (err: any) => void; timer: any }>();

function getWorker(): Worker {
  if (!workerInstance) {
    workerInstance = new Worker(new URL('../../workers/exiftool.worker.ts', import.meta.url), {
      type: 'module',
    });

    workerInstance.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id, success, data, error } = event.data;
      const handler = pendingRequests.get(id);
      if (handler) {
        clearTimeout(handler.timer);
        pendingRequests.delete(id);
        if (success) {
          handler.resolve(data);
        } else {
          handler.reject(new Error(error || 'Worker operation failed'));
        }
      }
    };

    workerInstance.onerror = (err) => {
      console.error('ExifTool worker error:', err);
      for (const [, handler] of pendingRequests.entries()) {
        clearTimeout(handler.timer);
        handler.reject(new Error(`Worker fatal error: ${err.message}`));
      }
      pendingRequests.clear();
      workerInstance?.terminate();
      workerInstance = null;
    };
  }
  return workerInstance;
}

export function terminateWorker() {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
  pendingRequests.clear();
}

export async function executeWasmExifTool(
  request: Omit<WorkerRequest, 'id'>,
  timeoutMs = 60000
): Promise<ArrayBuffer | unknown> {
  const worker = getWorker();
  const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error('ExifTool WebAssembly operation timed out'));
    }, timeoutMs);

    pendingRequests.set(id, { resolve, reject, timer });

    if (request.buffer && request.buffer instanceof ArrayBuffer) {
      const copy = request.buffer.slice(0);
      worker.postMessage({ ...request, id, buffer: copy });
    } else {
      worker.postMessage({ ...request, id });
    }
  });
}
