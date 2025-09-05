import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

type Opts = {
  max?: number;                 // pixels to trigger commit
  onCommitRight?: () => void;
};

export function useSwipe({ max = 96, onCommitRight }: Opts) {
  const [dx, setDx] = useState(0);
  const start = useRef<{ x:number; y:number; dragging:boolean }>({ x:0, y:0, dragging:false });

  function onPointerDown(e: ReactPointerEvent) {
    start.current = { x: e.clientX, y: e.clientY, dragging: true };
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: ReactPointerEvent) {
    if (!start.current.dragging) return;
    const mdx = e.clientX - start.current.x;
    const mdy = e.clientY - start.current.y;
    if (Math.abs(mdy) > Math.abs(mdx) && Math.abs(mdy) > 6) return; // vertical intent
    setDx(Math.max(0, Math.min(max, mdx)));
  }
  function onPointerUp() {
    if (!start.current.dragging) return;
    const committed = dx >= max;
    setDx(0);
    start.current.dragging = false;
    if (committed) onCommitRight?.();
  }

  const bind = { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp } as const;
  return { dx, bind };
}
