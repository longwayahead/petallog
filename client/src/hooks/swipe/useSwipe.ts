// useSwipe.ts
import { useRef, useCallback } from "react";

export interface UseSwipeOptions {
  axis?: "x" | "y";
  max?: number;
  minCommit?: number;
  allowLeft?: boolean;
  allowRight?: boolean;
  allowUp?: boolean;
  allowDown?: boolean;
  enabled?: boolean;

  startThreshold?: number;
  lockRatio?: number;
  claimOnLock?: boolean;
  priority?: "page" | "card";

  onCommitLeft?: () => void;
  onCommitRight?: () => void;
  onCommitUp?: () => void;
  onCommitDown?: () => void;
  onRelease?: (dx: number, dy: number) => void;
}

export function useSwipe({
  axis = "x",
  max = 0,
  minCommit = 50,
  allowLeft = true,
  allowRight = true,
  allowUp = true,
  allowDown = true,
  enabled = true,
  startThreshold = 12,
  lockRatio = 1.5,
  claimOnLock = false,
  priority = "card",
  onCommitLeft,
  onCommitRight,
  onCommitUp,
  onCommitDown,
  onRelease,
}: UseSwipeOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const lockedAxis = useRef<null | "x" | "y">(null);
  const pointerIdRef = useRef<number | null>(null);
  const tracking = useRef(false);
  const activePriority = useRef<"page" | "card" | null>(null);

  const dxRef = useRef(0); // 🔹 live values, no React state
  const dyRef = useRef(0);

  const reset = () => {
    dxRef.current = 0;
    dyRef.current = 0;
    lockedAxis.current = null;
    pointerIdRef.current = null;
    tracking.current = false;
    activePriority.current = null;
  };

  const lockAndClaim = (
    locked: "x" | "y",
    e: React.PointerEvent<HTMLDivElement>,
    prio: "page" | "card"
  ) => {
    lockedAxis.current = locked;
    activePriority.current = prio;
    if (claimOnLock) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
    }
  };

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (!enabled) return;
      startX.current = e.clientX;
      startY.current = e.clientY;
      tracking.current = true;
      lockedAxis.current = null;
      pointerIdRef.current = e.pointerId;
    },
    [enabled]
  );

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (!enabled || !tracking.current) return;

      const deltaX = e.clientX - startX.current;
      const deltaY = e.clientY - startY.current;

      if (!lockedAxis.current) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX < startThreshold && absY < startThreshold) return;

        const prefersX = absX >= absY * lockRatio;
        const prefersY = absY >= absX * lockRatio;

        if (axis === "x" && prefersX) {
          lockAndClaim("x", e, priority);
        } else if (axis === "y" && prefersY) {
          lockAndClaim("y", e, priority);
        } else {
          return;
        }
      }

      if (activePriority.current && activePriority.current !== priority) return;

      if (lockedAxis.current === "x") {
        let clamped = deltaX;
        if (!allowRight && clamped > 0) clamped = 0;
        if (!allowLeft && clamped < 0) clamped = 0;
        clamped = Math.max(Math.min(clamped, max), -max);
        dxRef.current = clamped; // 🔹 only update ref
        dyRef.current = 0;
        // console.log("[useSwipe] moveX:", clamped);
      } else {
        let clamped = deltaY;
        if (!allowDown && clamped > 0) clamped = 0;
        if (!allowUp && clamped < 0) clamped = 0;
        clamped = Math.max(Math.min(clamped, max), -max);
        dyRef.current = clamped;
        dxRef.current = 0;
        // console.log("[useSwipe] moveY:", clamped);
      }
    },
    [axis, max, allowLeft, allowRight, allowUp, allowDown, enabled, startThreshold, lockRatio, claimOnLock, priority]
  );

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (_) => {
      if (!enabled) {
        reset();
        return;
      }
      const locked = lockedAxis.current;

      if (locked === "x" && activePriority.current === priority) {
        const finalDx = dxRef.current;
        // console.log("[useSwipe] releaseX:", finalDx);
        if (finalDx > minCommit && allowRight) onCommitRight?.();
        else if (finalDx < -minCommit && allowLeft) onCommitLeft?.();

        onRelease?.(finalDx, 0);
      } else if (locked === "y" && activePriority.current === priority) {
        const finalDy = dyRef.current;
        // console.log("[useSwipe] releaseY:", finalDy);
        if (finalDy > minCommit && allowDown) onCommitDown?.();
        else if (finalDy < -minCommit && allowUp) onCommitUp?.();

        onRelease?.(0, finalDy);
      }

      reset();
      // console.log("[useSwipe] reset");
    },
    [enabled, minCommit, allowLeft, allowRight, allowUp, allowDown, onCommitLeft, onCommitRight, onCommitUp, onCommitDown, onRelease, priority]
  );

  const onPointerCancel: React.PointerEventHandler<HTMLDivElement> = useCallback(() => {
    reset();
  }, []);

  // 🔹 expose refs instead of React state
  return { dxRef, dyRef, bind: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } };
}
