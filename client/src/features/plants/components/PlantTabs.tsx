import React, { useRef, useEffect } from "react";
import TabBar from "./TabBar";
import TimelineList from "./Timeline/TimelineList";
import GalleryGrid from "./GalleryGrid";
import { useTabs } from "../../../hooks/useTabs";
import { usePagerSwipe } from "../../../hooks/swipe/usePageSwipe";
import type { Interaction, Photo } from "../../../types";

interface PlantTabsProps {
  items: Interaction[];
  editingId: string | null;
  onLongPress: (id: string) => void;
  onUpdateNote: (id: string, text: string) => void;
  textareaRefs: React.RefObject<Record<string, HTMLTextAreaElement | null>>;
  active: number;
  show: (index: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  indicatorRef: React.RefObject<HTMLDivElement | null>;
  timelineRef: React.RefObject<HTMLDivElement | null>;
  galleryRef: React.RefObject<HTMLDivElement | null>;
  pagerBind: ReturnType<typeof usePagerSwipe>["bind"];
  onDelete: (id: string) => void;
  onAddPhoto: (id: string) => void;
  onCardClick: (id: string) => void;
  onDoneEditing: () => void;
  plantId: string;
  onSelectPhoto: (photo: Photo) => void;
  refreshGallery: number;
}

export default function PlantTabs({
  items,
  editingId,
  onLongPress,
  onUpdateNote,
  textareaRefs,
  onDelete,
  onAddPhoto,
  onCardClick,
  onDoneEditing,
  plantId,
  onSelectPhoto,
  refreshGallery,
  timelineRef,
  galleryRef,
  active,
  wrapperRef,
  indicatorRef,
  show,
  containerRef,
}: PlantTabsProps) {

  const refs = [timelineRef, galleryRef];

 
  const { bind: pagerBind } = usePagerSwipe({
    index: active,
    count: 2,
    onIndexChange: show,
    wrapperRef,
    minCommit: 80, // avoid swiping while editing
  });

  return (
    <>
      <TabBar active={active} onChange={show} indicatorRef={indicatorRef} />
      <div
        ref={containerRef}
        className="tabs-container"
        {...pagerBind}
        style={{ touchAction: "pan-y" }}
      >
        <div
          ref={wrapperRef}
          className="tabs-wrapper flex transition-transform duration-300 ease-out" 
          style={{
            width: "200%",
          }}
        >
          {/* Timeline */}
          <div className="tab-panel flex-shrink-0 w-1/2">
            <div ref={timelineRef} 
            className="p-4 pb-20 bg-white ">
              <TimelineList
                items={items}
                editingId={editingId}
                onLongPress={onLongPress}
                onUpdateNote={onUpdateNote}
                textareaRefs={textareaRefs}
                onDelete={onDelete}
                onAddPhoto={onAddPhoto}
                onCardClick={onCardClick}
                onDoneEditing={onDoneEditing}
                onSelectPhoto={onSelectPhoto}
              />
            </div>
          </div>

          {/* Gallery */}
          <div className="tab-panel flex-shrink-0 w-1/2">
            <div ref={galleryRef}
            className="p-4 pb-20 bg-white">
              <GalleryGrid
                plantId={plantId}
                onSelect={onSelectPhoto}
                refreshKey={refreshGallery}
                />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
