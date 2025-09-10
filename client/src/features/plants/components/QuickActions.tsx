import { useState, useRef, useEffect } from "react";
import { type Action } from "../../../types";

export default function QuickActions({ actions, onAdd }: { actions: Action[], onAdd: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!actions || actions.length === 0) return null;

  const topThree = actions.slice(0, 3);
  const others = actions.slice(3);

  return (
    <div className="flex justify-between py-3 border-y border-gray-200 mb-4" ref={ref}>
      {topThree.map((a) => (
        <button
          key={a.actionID}
          className="text-center status-icon"
          onClick={() => onAdd(a.actionID)}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-1 ${a.actionBackground}`}>
            <i className={`${a.actionIcon} ${a.actionColour} text-xl`} />
          </div>
          <p className="text-xs font-medium">{a.actionName}</p>
        </button>
      ))}

      {/* More button */}
      <div className="text-center relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        >
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-1 transition-colors">
            <i className={`text-gray-500 text-xl ${open ? "fas fa-minus" : "fa-solid fa-plus"}`} />
          </div>
          <p className="text-xs font-medium">{open ? "Less" : "More"}</p>
        </button>

        {/* Animated dropdown */}
        <div
          className={`absolute right-0 mt-2 bg-white shadow-lg rounded-xl p-3 z-50 grid grid-cols-3 gap-2 w-72 transform transition-all duration-200 origin-top-right ${
            open ? "opacity-100 scale-100 max-h-96" : "opacity-0 scale-95 max-h-0 pointer-events-none"
          }`}
        >
          {others.map((a) => (
            <button
              key={a.actionID}
              onClick={() => {
                setOpen(false);
                onAdd(a.actionID);
              }}
              className="rounded-lg hover:bg-gray-50 p-2 flex flex-col items-center transition"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${a.actionBackground}`}>
                <i className={`${a.actionIcon} ${a.actionColour}`} />
              </div>
              <span className="text-xs">{a.actionName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
