import { useEffect, useState, useRef } from "react";
import type { InteractionCardProps } from "../../../../types";
import { useCardSwipe } from "../../../../hooks/swipe/useCardSwipe";
import { useHaptics } from "../../../../hooks/useHaptics";

export default function InteractionCard({
  data,
  editing,
  onLongPress,
  onUpdateNote,
  inputRef,
  onDelete,
  onAddPhoto,
  onCardClick,
  onDoneEditing,
  onSelectPhoto,
}: InteractionCardProps) {
  const [swipeEnabled, setSwipeEnabled] = useState(false);
  const [pressing, setPressing] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(false);

  const { haptic } = useHaptics();

  // useCardSwipe now gives dxRef instead of state
 const { dxRef, bind, showLeft } = useCardSwipe({
  editing,
  swipeEnabled,
  pressing,
  onDelete,
});

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Reset pressing when editing mode toggles
  useEffect(() => {
    if (editing) setPressing(false);
  }, [editing]);

  // Long press detection
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    if (!editing) {
      const start = (e: PointerEvent) => {
        e.preventDefault();
        setPressing(true);
        activeRef.current = true;

        timer = setTimeout(() => {
          if (!activeRef.current) return;
          setPressing(false);
          haptic("medium");
          onLongPress();
          setSwipeEnabled(true);
        }, 500);
      };

      const cancel = () => {
        activeRef.current = false;
        setPressing(false);
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        setSwipeEnabled(false);
      };

      const preventContextMenu = (e: Event) => e.preventDefault();

      el.addEventListener("pointerdown", start, { passive: false });
      el.addEventListener("pointerup", cancel);
      el.addEventListener("pointercancel", cancel);
      el.addEventListener("pointerleave", cancel);
      el.addEventListener("contextmenu", preventContextMenu);

      return () => {
        el.removeEventListener("pointerdown", start);
        el.removeEventListener("pointerup", cancel);
        el.removeEventListener("pointercancel", cancel);
        el.removeEventListener("pointerleave", cancel);
        el.removeEventListener("contextmenu", preventContextMenu);
      };
    }

    return undefined;
  }, [editing, onLongPress, haptic]);

  // rAF loop: update card transform without re-render
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    let frame: number;
    const render = () => {
      const dx = dxRef.current;
      el.style.transform = `translateX(${dx}px)`;
      frame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frame);
  }, [dxRef]);

  const [allowPointer, setAllowPointer] = useState(false);

  useEffect(() => {
    if (editing) {
      const id = setTimeout(() => setAllowPointer(true), 300);
      return () => {
        clearTimeout(id);
        setAllowPointer(false);
      };
    }
  }, [editing]);

  return (
    <div className="relative timeline-item pl-6 pb-4">
      {/* Badge */}
      <div
        className={`absolute left-0 w-8 h-8 ${data.badgeBg} rounded-full flex items-center justify-center z-10`}
      >
        <i className={`${data.badgeIcon} ${data.badgeColor}`} />
      </div>

      {/* Swipe wrapper */}
      <div className={`swipe-wrap ${showLeft ? "show-left" : ""}`}>
        <div className="action-rail">
          <div className="left">
            <div className="flex flex-col items-center gap-1 text-xs font-semibold">
              <i className="fas fa-trash text-lg" />
              <span>Delete</span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div
          {...bind}
          ref={cardRef}
          className={`interaction-card${editing ? " editing" : ""} ${
            pressing ? "scale-98" : "scale-100"
          } transition-transform duration-150 ease-in-out`}
          style={{ touchAction: "pan-y" }}
          onClick={onCardClick}
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <span className="font-medium">{data.title}</span>
            <span className="text-sm text-gray-500">{data.when}</span>
          </div>

          {/* Note */}
          {!editing && data.note && (
            <p className="text-sm text-gray-600 mt-1">{data.note}</p>
          )}

          {editing && (
            <div className="edit-extras mt-3">
              <div className="input-wrap mt-2 relative">
                <textarea
                  ref={(el) => {
                    textareaRef.current = el;
                    inputRef(el);
                  }}
                  className={`w-full min-h-[60px] max-h-40 resize-none border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent select-none focus:select-text ${
                    allowPointer
                      ? "pointer-events-auto"
                      : "pointer-events-none"
                  }`}
                  value={data.note ?? ""}
                  onChange={(e) => onUpdateNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      (e.currentTarget as HTMLTextAreaElement).blur();
                      onDoneEditing?.();
                    }
                  }}
                  placeholder="Type a note…"
                />
              </div>
            </div>
          )}

          {/* Photos grid */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {editing && (
              <div
                className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer w-22 h-22"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddPhoto(data.id);
                }}
              >
                <i className="fas fa-camera text-gray-400 text-xl" />
              </div>
            )}
            {data.photos.map((p) => (
              <div key={p.id} className="relative w-22 h-22">
                {p.pending ? (
                  <div className="w-full aspect-square rounded bg-gray-200 flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin text-gray-500 text-lg" />
                  </div>
                ) : (
                  <img
                    src={p.url}
                    className="w-full aspect-square object-cover rounded cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPhoto(p);
                    }}
                  />
                )}
              </div>
            ))}
          </div>



        </div>
      </div>
    </div>
  );
}
