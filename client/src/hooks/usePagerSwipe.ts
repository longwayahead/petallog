import { useEffect, useRef, type RefObject } from 'react';
import type React from 'react';
import { useSwipeable } from './useSwipeable';

// Accepts both RefObject and MutableRefObject by shape
type AnyRef<T extends HTMLElement = HTMLElement> = { readonly current: T | null };

// For spreading onto a div
type BindProps = Pick<
  React.HTMLAttributes<HTMLElement>,
  'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel'
>;

export function usePagerSwipe({
  index,
  count,
  onIndexChange,
  containerRef,
  wrapperRef,
  indicatorRef,
  minCommitRatio = 0.2,
}: {
  index: number;
  count: number;
  onIndexChange: (i: number) => void;
  containerRef: AnyRef<HTMLElement>;
  wrapperRef: AnyRef<HTMLElement>;
  indicatorRef?: AnyRef<HTMLElement>;
  minCommitRatio?: number;
}) {
  const widthRef = useRef(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => { widthRef.current = el.clientWidth || 1; };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  function setTransforms(progressIndex: number) {
    const w = wrapperRef.current;
    const ind = indicatorRef?.current;
    const perPanel = 100 / count;
    if (w) w.style.transform = `translateX(-${progressIndex * perPanel}%)`;
    if (ind) ind.style.transform = `translateX(${(progressIndex / (count - 1)) * 100}%)`;
  }

  function snap(toIndex = index) {
    const w = wrapperRef.current;
    if (!w) return;
    w.style.transition = 'transform 300ms cubic-bezier(.2,.8,.2,1)';
    requestAnimationFrame(() => setTransforms(toIndex));
    setTimeout(() => { if (w) w.style.transition = ''; }, 320);
  }

  const { bind } = useSwipeable({
    axis: 'x',
    minCommit: widthRef.current * minCommitRatio,
    onMove: (dx) => {
      const w = wrapperRef.current;
      if (!w) return;
      w.style.transition = 'none';
      const deltaPages = -dx / widthRef.current;
      setTransforms(index + deltaPages);
    },
    onCommitLeft: () => { if (index < count - 1) onIndexChange(index + 1); snap(index + 1); },
    onCommitRight: () => { if (index > 0) onIndexChange(index - 1); snap(index - 1); },
    onCancel: () => snap(index),
  });

  return { bind: bind as BindProps };
}
