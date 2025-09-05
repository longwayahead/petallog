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
