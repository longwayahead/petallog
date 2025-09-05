import React, { useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";

const panels = ["Profile", "Reels", "Tagged"];

export default function SwipeablePanels() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const tabBarRef = useRef<HTMLDivElement | null>(null);

  // per-panel scroll offsets (measured from tab bar)
  const offsets = useRef<Record<number, number>>({});

  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    const tabBar = tabBarRef.current;
    if (!scroller || !tabBar) return;

    const tabTop = tabBar.offsetTop;
    const saved = offsets.current[activeIndex] ?? 0;
    const target = tabTop + saved;

    // clamp to avoid white space
    const maxScroll = scroller.scrollHeight - scroller.clientHeight;
    scroller.scrollTop = Math.min(target, maxScroll);
  }, [activeIndex]);

  const handleScroll = () => {
    if (!scrollRef.current || !tabBarRef.current) return;
    const { scrollTop } = scrollRef.current;
    const tabTop = tabBarRef.current.offsetTop;
    const relative = Math.max(0, scrollTop - tabTop);
    offsets.current[activeIndex] = relative;
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {/* Profile header */}
        <div className="bg-white border-b">
          <div className="h-56 bg-gradient-to-r from-purple-400 to-pink-400" />
          <div className="px-4 py-6">
            <div className="flex items-center gap-4 -mt-16">
              <div className="w-24 h-24 rounded-full bg-gray-300 border-4 border-white shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold">Jane Doe</h1>
                <p className="text-sm text-gray-500">
                  Photographer & Traveler 🌍 | Coffee Lover ☕
                </p>
              </div>
            </div>
            <div className="flex gap-6 mt-6">
              <div>
                <p className="font-bold text-lg">120</p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
              <div>
                <p className="font-bold text-lg">4.2k</p>
                <p className="text-xs text-gray-500">Followers</p>
              </div>
              <div>
                <p className="font-bold text-lg">300</p>
                <p className="text-xs text-gray-500">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Tabs */}
        <div
          ref={tabBarRef}
          className="sticky top-0 z-10 bg-white shadow p-4 flex justify-center gap-6"
        >
          {panels.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`pb-1 border-b-2 transition-colors ${
                activeIndex === i
                  ? "border-black font-semibold"
                  : "border-transparent text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Panels in one scroll context */}
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex"
            initial={false}
            animate={{ x: -activeIndex * window.innerWidth }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="min-w-full px-4 py-2 space-y-4">
              {Array.from({ length: 25 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-100 rounded-xl shadow-sm"
                >
                  Profile item {idx + 1}
                </div>
              ))}
            </div>
            <div className="min-w-full px-4 py-2 space-y-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-blue-100 rounded-xl shadow-sm"
                >
                  Reel item {idx + 1}
                </div>
              ))}
            </div>
            <div className="min-w-full px-4 py-2 space-y-4">
              {Array.from({ length: 15 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-green-100 rounded-xl shadow-sm"
                >
                  Tagged item {idx + 1}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
