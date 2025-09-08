// src/lib/scannerBridge.ts
let resolver: ((result: string) => void) | null = null;

export function createScannerPromise(): Promise<string> {
  return new Promise<string>((resolve) => {
    resolver = resolve;
  });
}

export function resolveScanner(result: string) {
  if (resolver) {
    resolver(result);
    resolver = null;
  }
}

let pauseFn: (() => void) | null = null;
let resumeFn: (() => void) | null = null;
let closeFn: (() => void) | null = null;

export function registerScannerControls(pause: () => void, resume: () => void, close: () => void) {
  pauseFn = pause;
  resumeFn = resume;
  closeFn = close;
}

export function pauseScanner() {
  pauseFn?.();
}
export function resumeScanner() {
  resumeFn?.();
}
export function closeScanner() {
  closeFn?.();
}
