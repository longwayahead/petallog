// src/features/plants/components/GalleryGrid.tsx
import { useState, useEffect } from "react";
import type { Photo, GalleryGridProps } from "../../../types";


export default function GalleryGrid({ plantId, refreshKey, onSelect }: GalleryGridProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/plants/${plantId}/photos`);
        if (res.ok) {
          setPhotos(await res.json());
        } else {
          setPhotos([]);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [plantId, refreshKey]);

  if (loading) {
    return <div className="text-center text-gray-500 py-6">Loading photos…</div>;
  }

  if (photos.length === 0) {
    return <div className="text-center text-gray-500 py-6">No photos yet</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {photos.map((p) => (
        <img
          key={p.id}
          src={p.thumbnail_url || p.url}
          className="w-full aspect-square object-cover cursor-pointer"
          onClick={() => onSelect(p)}
        />
      ))}
    </div>
  );
}
