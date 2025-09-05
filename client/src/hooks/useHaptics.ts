// src/hooks/useHaptics.ts
export type HapticKind = 'light' | 'medium' | 'heavy' | 'success' | 'error';

export function useHaptics() {
  function trigger(kind: HapticKind = 'light') {
    try {
      if (!('vibrate' in navigator)) return;

      switch (kind) {
        case 'light':
          navigator.vibrate(8);
          break;
        case 'medium':
          navigator.vibrate(15);
          break;
        case 'heavy':
          navigator.vibrate(30);
          break;
        case 'success':
          navigator.vibrate([10, 20, 10]); // short pattern
          break;
        case 'error':
          navigator.vibrate([30, 50, 30]);
          break;
      }
    } catch {
      // fail silently
    }
  }

  return { haptic: trigger };
}
