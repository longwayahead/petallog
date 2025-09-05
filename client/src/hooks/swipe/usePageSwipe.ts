// usePageSwipe.ts
import { type RefObject, useEffect } from "react";
import { useSwipe } from "./useSwipe";

interface PagerSwipeOptions {
  index: number;
  count: number;
  onIndexChange: (i: number) => void;
  wrapperRef: RefObject<HTMLDivElement | null>;
  minCommit?: number;
}

export function usePagerSwipe({
  index,
  count,
  onIndexChange,
  wrapperRef,
  minCommit = 40,
}: PagerSwipeOptions) {
  const { dxRef, bind } = useSwipe({
    axis: "x",
    max: 9999,
    minCommit,
    allowLeft: true,
    allowRight: true,
    startThreshold: 0,
    lockRatio: 1,
    claimOnLock: false,
    priority: "page",
    onRelease: (finalDx) => {
      if (finalDx < -minCommit && index < count - 1) {
        onIndexChange(index + 1);
      } else if (finalDx > minCommit && index > 0) {
        onIndexChange(index - 1);
      }
    },
  });

  // 🔹 rAF loop for buttery smooth transforms
  useEffect(() => {
    if (!wrapperRef.current) return;
    const wrapper = wrapperRef.current;
    const containerWidth =
      wrapper.parentElement?.offsetWidth ?? window.innerWidth;

    let frame: number;
    const render = () => {
      const dx = dxRef.current;
      const basePercent = -(index * 100) / count;
      const dragPercent = (dx / containerWidth) * (100 / count);

      let percent = basePercent + dragPercent;

      const minPercent = -(100 / count) * (count - 1);
      const maxPercent = 0;
      percent = Math.max(Math.min(percent, maxPercent), minPercent);

      wrapper.style.transition =
        dx === 0
          ? "transform .3s cubic-bezier(0.22, 1, 0.36, 1)" // snap
          : "none"; // drag

      wrapper.style.transform = `translateX(${percent}%)`;

      frame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frame);
  }, [dxRef, index, count, wrapperRef]);

  return { bind };
}
