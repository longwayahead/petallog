import { useState, useEffect } from "react";
import type { Photo, Plant } from "../../../../types";
import { fuzzyDate } from "../../../../utils/date";

export default function PhotoModal({
  photo,
  currentProfilePicture,
  onClose,
  onDelete,
  onSetProfilePhoto,
  plant,
}: {
  photo: Photo | null;
  currentProfilePicture?: string | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onSetProfilePhoto?: (id: string) => void;
  plant: Plant | null;
}) {
  const [loading, setLoading] = useState(true);

  // Reset loading whenever a new photo is selected
  useEffect(() => {
    if (photo) {
      setLoading(true);
    }
  }, [photo]);

  if (!photo) return null;

  const isProfilePicture = currentProfilePicture === photo.thumbnail_url;

  return (
    <div className="photo-modal fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar */}
      <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4 z-50">
        {/* Left: Delete */}
        {Boolean(plant?.plantAlive) && (
          <div>
            {onDelete && (
              <button
                className="bg-red-600 p-2 rounded"
              onClick={() => onDelete(photo.id)}
            >
              <i className="fas fa-trash text-white" />
            </button>
          )}
        </div>
        )}

        {/* Center: Set profile */}
        <div>
          {onSetProfilePhoto && !isProfilePicture && (
            <button
              className="bg-yellow-500 p-2 rounded"
              onClick={() => onSetProfilePhoto(photo.id)}
            >
              <i className="fas fa-star text-white" />
            </button>
          )}
        </div>

        {/* Right: Close */}
        <div>
          <button className="text-white text-3xl" onClick={onClose}>
            &times;
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative bg-black">
        {/* Thumbnail placeholder */}
        {photo.thumbnail_url && (
          <img
            src={photo.thumbnail_url}
            alt="thumbnail"
            className={`absolute inset-0 w-full h-full object-contain blur-lg scale-105 transition-opacity duration-300 ${
              loading ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Full resolution image */}
        <img
          src={photo.url}
          alt="interaction photo"
          className={`max-h-full max-w-full object-contain transition-opacity duration-500 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />

        {/* Spinner while full image is loading */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fas fa-spinner fa-spin text-white text-3xl" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-black/70 text-white text-sm p-4 text-center">
        <span>{fuzzyDate(photo.created_at)}</span>
      </div>
    </div>
  );
}
