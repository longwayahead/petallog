// useCardSwipe.ts
import { useState, useRef } from 'react';
import { SlideController } from './SlideController';

export function useCardSwipe({ onDelete }: { onDelete: () => void }) {
  const [dx, setDx] = useState(0);

  const ctrlRef = useRef<SlideController>(null);
  if (!ctrlRef.current) {
    ctrlRef.current = new SlideController({
      axis: 'x',
      max: 96,
      minCommit: 84,
      allowLeft: false,
      allowRight: true,
      stopPropagationOnStart: true,
      onCommitLeft: () => {},
      onCommitRight: onDelete,
    });
  }
  const ctrl = ctrlRef.current;

  return {
    dx,
    bind: {
      ...ctrl.bind,
      onPointerMove: (e: React.PointerEvent) => {
        ctrl.bind.onPointerMove(e);
        setDx(ctrl.dx);
      },
      onPointerUp: () => {
        ctrl.bind.onPointerUp();
        setDx(ctrl.dx); // reset to 0 after commit/release
      },
    },
  };
}
