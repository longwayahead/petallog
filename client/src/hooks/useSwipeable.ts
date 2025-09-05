import { useRef, useState } from 'react';

type Opts = {
  axis?: 'x' | 'y';
  minCommit?: number;
  max?: number;
  stopPropagationOnStart?: boolean;
  allowLeft?: boolean;
  allowRight?: boolean;
  onMove?: (dx: number, dy: number) => void;
  onCommitLeft?: () => void;
  onCommitRight?: () => void;
  onCancel?: () => void;
};

export function useSwipeable({
  axis = 'x',
  minCommit = 96,
  max = Infinity,
  stopPropagationOnStart = false,
  allowLeft = true,
  allowRight = true,
  onMove,
  onCommitLeft,
  onCommitRight,
  onCancel,
}: Opts) {
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const start = useRef({
    x: 0,
    y: 0,
    dragging: false,
    locked: null as null | 'x' | 'y',
  });

  function onPointerDown(e: React.PointerEvent) {
    start.current = { x: e.clientX, y: e.clientY, dragging: true, locked: null };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    
    //  don’t stop propagation yet — wait until direction is clear
  }

  function onPointerMove(e: React.PointerEvent) {
    const s = start.current;
    if (!s.dragging) return;
    const mdx = e.clientX - s.x;
    const mdy = e.clientY - s.y;

    // lock axis once intent is clear
    if (!s.locked) {
      if (Math.abs(mdx) > 6 || Math.abs(mdy) > 6) {
        s.locked = Math.abs(mdx) > Math.abs(mdy) ? 'x' : 'y';
      } else {
        return;
      }
    }

    // if vertical intent → bail (let scroll happen)
    if (s.locked !== axis) return;

    // 👉 only claim the event if swiping in an allowed direction
    if (mdx > 0 && allowRight && stopPropagationOnStart) {
      e.stopPropagation();
    }
    if (mdx < 0 && allowLeft && stopPropagationOnStart) {
      e.stopPropagation();
    }

    // 🚫 disallowed directions: ignore & don’t block
    if (mdx < 0 && !allowLeft) {
      setDx(0);
      setDy(0);
      return;
    }
    if (mdx > 0 && !allowRight) {
      setDx(0);
      setDy(0);
      return;
    }

    const clampedX = Math.max(-max, Math.min(max, mdx));
    const clampedY = Math.max(-max, Math.min(max, mdy));
    setDx(clampedX);
    setDy(clampedY);
    onMove?.(clampedX, clampedY);
  }

  function onPointerUp() {
    const s = start.current;
    if (!s.dragging) return;

    const shouldCommitX = axis === 'x' && Math.abs(dx) >= minCommit;
    const dirRight = dx > 0;

    setDx(0);
    setDy(0);
    start.current = { x: 0, y: 0, dragging: false, locked: null };

    if (shouldCommitX) {
      if (dirRight && allowRight) {
        onCommitRight?.();
      } else if (!dirRight && allowLeft) {
        onCommitLeft?.();
      } else {
        onCancel?.();
      }
    } else {
      onCancel?.();
    }
  }

  const bind = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  } as const;

  return { dx, dy, active: start.current.dragging, bind };
  // return { dx, dy, bind: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp } };
}
