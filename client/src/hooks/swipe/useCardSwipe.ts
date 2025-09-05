// useCardSwipe.ts
import { useEffect, useState } from "react";
import { useSwipe } from "./useSwipe";
interface CardSwipeOptions {
  editing: boolean;
  swipeEnabled: boolean;
  pressing: boolean;
  onDelete: () => void;
}
export function useCardSwipe({
  editing,
  swipeEnabled,
  pressing,
  onDelete,
}: CardSwipeOptions) {
  const { dxRef, bind } = useSwipe({
    axis: "x",
    max: editing && swipeEnabled ? 96 : 0,
    minCommit: 95,
    allowLeft: false,
    allowRight: editing && swipeEnabled,
    enabled: editing && swipeEnabled && !pressing,
    startThreshold: 12,
    lockRatio: 1.5,
    claimOnLock: true,
    priority: "card",
    onCommitRight: () => {
      if (editing && swipeEnabled) {
        onDelete();
      }
    },
  });

  const [showLeft, setShowLeft] = useState(false);

  useEffect(() => {
    let frame: number;
    const loop = () => {
      setShowLeft(dxRef.current > 12); // threshold to start showing rail
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frame);
  }, [dxRef]);

  return { dxRef, bind, showLeft };
}
