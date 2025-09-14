import { useState, useEffect } from "react";
import type { Plant } from "../../../types";
import CameraCaptureOverlay from "../components/CameraCaptureOverlay";

type Props = {
  open: boolean;
  potId: string;
  parentPlant?: Partial<Plant> | null;
  onClose: () => void;
  onSubmit: (
    data: Partial<Plant> & {
      photoFile?: File | null;
      foodId?: number | null;
      parentPlantId?: string | null;
    }
  ) => void;
  requiredFields?: (keyof Plant | "photoFile" | "foodId")[];
};


export default function PlantFormModal({
  open,
  potId,
  parentPlant = null,
  onClose,
  onSubmit,
  requiredFields = [],
}: Props) {
  const [form, setForm] = useState<
    Partial<Plant> & {
      photoFile?: File | null;
      foodId?: number | null; 
      parentPlantId?: string | null;
    }
  >({
    plantName: "",
    species: "",
    acquiredAt: new Date().toISOString().split("T")[0],
    acquiredFrom: "",
    plantNotes: "",
    foodId: null,
    photoFile: null,
    parentPlantId: null,
  });
//   console.log("parent plant", parentPlant);

// console.log(parentPlant);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (parentPlant) {
        setForm({
          plantName: "",
          species: parentPlant.species ?? "",
          acquiredAt: new Date().toISOString().split("T")[0],
          acquiredFrom: "Propagation",
          plantNotes: "",
          foodId: parentPlant.foodId !== undefined && parentPlant.foodId !== null ? parentPlant.foodId : undefined,
          photoFile: null,
          parentPlantId: parentPlant.plantId ?? null,
        });
      } else {
        setForm({
          plantName: "",
          species: "",
          acquiredAt: new Date().toISOString().split("T")[0],
          acquiredFrom: "",
          plantNotes: "",
          foodId: null,
          photoFile: null,
          parentPlantId: null,
        });
      }
      setPreviewUrl(null);
    }
  }, [open, potId, parentPlant]);
//   console.log("parent plant food", parentPlant?.foodId);
  if (!open) return null;

  const isRequired = (field: keyof Plant | "photoFile" | "foodId") =>
    requiredFields.includes(field);

  if (!open) return null;
  if (parentPlant === undefined) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">
          {parentPlant ? "Propagate Plant" : "New Plant"}
        </h2>

        <form
            onSubmit={(e) => {
                e.preventDefault();

                // Map camelCase -> API expected shape
                const { foodId, photoFile, ...rest } = form;
                onSubmit({
                ...rest,
                potId,
                foodId: foodId,
                photoFile,                 // stays as-is for file handling
                });
            }}
            className="space-y-4"
            >
          {/* Hidden parent ID */}
          {form.parentPlantId && (
            <input type="hidden" value={form.parentPlantId} />
          )}

          {/* Photo + Name row */}
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={() => setCameraOpen(true)}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-gray-400 text-sm">Add Photo</span>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium">Name</label>
              <input
                className="w-full border rounded p-2"
                value={form.plantName ?? ""}
                onChange={(e) =>
                  setForm({ ...form, plantName: e.target.value })
                }
                required={isRequired("plantName")}
              />
            </div>
          </div>

          {/* Species (only editable for new plants) */}
          {!parentPlant && (
            <div>
              <label className="block text-sm font-medium">Species</label>
              <input
                className="w-full border rounded p-2"
                value={form.species ?? ""}
                onChange={(e) => setForm({ ...form, species: e.target.value })}
                required={isRequired("species")}
              />
            </div>
          )}

          {/* Acquired At / From (hidden in propagation mode) */}
          {!parentPlant && (
            <>
              <div>
                <label className="block text-sm font-medium">Acquired At</label>
                <input
                  type="date"
                  className="w-full border rounded p-2"
                  value={form.acquiredAt ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, acquiredAt: e.target.value })
                  }
                  required={isRequired("acquiredAt")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Acquired From</label>
                <input
                  className="w-full border rounded p-2"
                  value={form.acquiredFrom ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, acquiredFrom: e.target.value })
                  }
                  required={isRequired("acquiredFrom")}
                />
              </div>
            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              className="w-full border rounded p-2"
              rows={3}
              value={form.plantNotes ?? ""}
              onChange={(e) =>
                setForm({ ...form, plantNotes: e.target.value })
              }
              required={isRequired("plantNotes")}
            />
          </div>

          {/* Food (only if not propagation) */}
          {!parentPlant && (
            <div>
              <label className="block text-sm font-medium">Food</label>
              <select
                className="w-full border rounded p-2"
                value={form.foodId ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    foodId: e.target.value ? Number(e.target.value) : null,
                  })
                }
                required={isRequired("foodId")}
              >
                <option value="">-- Select food --</option>
                <option value={1}>Liquid Fertiliser</option>
                <option value={2}>Solid Food</option>
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {parentPlant ? "Propagate" : "Create Plant"}
            </button>
          </div>
        </form>
      </div>

      {/* Camera capture overlay */}
      {cameraOpen && (
        <CameraCaptureOverlay
          onCapture={(file, preview) => {
            setForm({ ...form, photoFile: file });
            setPreviewUrl(preview);
            setCameraOpen(false);
          }}
          onCancel={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}
