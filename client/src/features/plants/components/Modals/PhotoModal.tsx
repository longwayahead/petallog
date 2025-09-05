import type { Photo } from "../../../../types";
import { fuzzyDate } from "../../../../utils/date";

export default function PhotoModal({
  photo,
  onClose,
  onDelete,
  onSetProfilePhoto,
}: {
  photo: Photo | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onSetProfilePhoto?: (id: string) => void;
}) {
  if (!photo) return null;

  return (
    <div className="photo-modal fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar */}
      <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4 z-50">
        {/* Left: Delete */}
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

        {/* Center: Set profile */}
        <div>
          {onSetProfilePhoto && (
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
          <button
            className="text-white text-3xl"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <img
          src={photo.url}
          alt="interaction photo"
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Footer */}
      <div className="bg-black/70 text-white text-sm p-4 text-center">
        <span>{fuzzyDate(photo.created_at)}</span>
      </div>
    </div>
  );
}
