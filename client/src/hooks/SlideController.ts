// src/hooks/SlideController.ts
type Axis = 'x' | 'y';

export interface SlideOptions {
  axis?: Axis;
  max?: number;
  minCommit?: number;
  allowLeft?: boolean;
  allowRight?: boolean;
  stopPropagationOnStart?: boolean;
  onCommitLeft?: () => void;
  onCommitRight?: () => void;
}

export class SlideController {
  dx = 0;
  dy = 0;
  private startX = 0;
  private startY = 0;
  private dragging = false;
  private opts: Required<SlideOptions>;

  constructor(opts: SlideOptions) {
    this.opts = {
      axis: opts.axis ?? 'x',
      max: opts.max ?? 0,
      minCommit: opts.minCommit ?? 50,
      allowLeft: opts.allowLeft ?? true,
      allowRight: opts.allowRight ?? true,
      stopPropagationOnStart: opts.stopPropagationOnStart ?? false,
      onCommitLeft: opts.onCommitLeft ?? (() => {}),
      onCommitRight: opts.onCommitRight ?? (() => {}),
    };
  }

  bind = {
    onPointerDown: (e: React.PointerEvent) => {
      if (this.opts.stopPropagationOnStart) {
        e.stopPropagation();
        e.preventDefault();
      }
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.dragging = true;
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;

      if (this.opts.axis === 'x') {
        if (dx < 0 && !this.opts.allowLeft) return;
        if (dx > 0 && !this.opts.allowRight) return;
        this.dx = Math.max(Math.min(dx, this.opts.max), -this.opts.max);
      } else {
        this.dy = Math.max(Math.min(dy, this.opts.max), -this.opts.max);
      }
    },
    onPointerUp: () => {
      if (!this.dragging) return;
      this.dragging = false;

      if (this.opts.axis === 'x') {
        if (this.dx > this.opts.minCommit) {
          this.opts.onCommitRight();
        }
        else if (this.dx < -this.opts.minCommit) {
          this.opts.onCommitLeft();
        }
      }
      this.dy = 0;
      this.dx = 0;
    },
  };
}
