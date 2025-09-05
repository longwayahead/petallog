// src/features/plants/components/GalleryGrid.tsx
import { useState, useEffect } from "react";
import type { Photo, GalleryGridProps } from "../../../types";


export default function GalleryGrid({ plantId, refreshKey, onSelect}: GalleryGridProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/plants/${plantId}/photos`);
      if (res.ok) setPhotos(await res.json());
    }
    load();
  }, [plantId, refreshKey]);

  return (
    <div>
      <div className="grid grid-cols-3 gap-1">
        {photos.map((p) => (
          <img
            key={p.id}
            src={p.url}
            className="w-full aspect-square object-cover cursor-pointer"
            onClick={() => onSelect(p)}
          />
        ))}
      </div>
    </div>
  );
}
