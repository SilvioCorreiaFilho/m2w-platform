/**
 * Web Worker for off-main-thread WebP frame decoding.
 * Receives { url: string, index: number } messages and replies with
 * { index: number, bitmap: ImageBitmap } or { index: number, error: string }.
 *
 * Usage in Next.js:
 *   const worker = new Worker(
 *     new URL('./workers/imageDecoder.worker.ts', import.meta.url)
 *   );
 *
 * Note: CanvasSequence already uses createImageBitmap() inline which runs
 * off the main thread in supported browsers. This worker provides an
 * alternative path for bulk pre-decode batching.
 */

export type WorkerInMessage = {
  url: string;
  index: number;
};

export type WorkerOutMessage =
  | { index: number; bitmap: ImageBitmap; error?: never }
  | { index: number; bitmap?: never; error: string };

self.onmessage = async (event: MessageEvent<WorkerInMessage>) => {
  const { url, index } = event.data;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    // Transfer the bitmap to the main thread (zero-copy)
    const msg: WorkerOutMessage = { index, bitmap };
    (self as unknown as Worker).postMessage(msg, [bitmap as unknown as Transferable]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const msg: WorkerOutMessage = { index, error: message };
    (self as unknown as Worker).postMessage(msg);
  }
};
