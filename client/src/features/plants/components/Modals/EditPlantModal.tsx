import { useState, useEffect } from "react";
import type { Plant } from "../../../../types";

type Props = {
  open: boolean;
  plant: Plant | null;
  onClose: () => void;
  onSaved: () => void;
};

// helper to ensure MySQL date string
function formatAsMySQLDate(input: string | Date | null | undefined): string {
  if (!input) return new Date().toISOString().split("T")[0];
  const d = input instanceof Date ? input : new Date(input);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

export default function EditPlantModal({ open, plant, onClose, onSaved }: Props) {
  const [form, setForm] = useState<{
    plantName: string;
    species: string;
    acquiredAt: string; // always stored as MySQL date
    acquiredFrom: string;
    plantNotes: string;
    foodId: number | null;
  }>({
    plantName: "",
    species: "",
    acquiredAt: formatAsMySQLDate(new Date()),
    acquiredFrom: "",
    plantNotes: "",
    foodId: null,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && plant) {
      setForm({
        plantName: plant.plantName ?? "",
        species: plant.species ?? "",
        acquiredAt: formatAsMySQLDate(plant.acquiredAt),
        acquiredFrom: plant.acquiredFrom ?? "",
        plantNotes: plant.plantNotes ?? "",
        foodId: plant.foodId,
      });
    }
  }, [open, plant]);

  if (!open || !plant) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    // Required validation
    if (!form.plantName || !form.species || !form.acquiredAt || !form.foodId) {
      alert("Name, Species, Acquired At, and Food are required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        friendly_name: form.plantName,
        species: form.species,
        acquired_at: formatAsMySQLDate(form.acquiredAt), // ✅ enforce MySQL format
        acquired_from: form.acquiredFrom || null,
        notes: form.plantNotes || null,
        foods_id: form.foodId,
      };

      const res = await fetch(`/api/plants/${plant?.plantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update plant");

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">plnt dtls – {plant.plantName}</h2>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium">Name *</label>
            <input
              className="w-full border rounded p-2"
              value={form.plantName}
              onChange={(e) => setForm({ ...form, plantName: e.target.value })}
              required
            />
          </div>

          {/* Species */}
          <div>
            <label className="block text-sm font-medium">Species *</label>
            <input
              className="w-full border rounded p-2"
              value={form.species}
              onChange={(e) => setForm({ ...form, species: e.target.value })}
              required
            />
          </div>

          {/* Acquired At */}
          <div>
            <label className="block text-sm font-medium">Acquired At *</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={form.acquiredAt}
              onChange={(e) =>
                setForm({ ...form, acquiredAt: formatAsMySQLDate(e.target.value) })
              }
              required
            />
          </div>

          {/* Acquired From */}
          <div>
            <label className="block text-sm font-medium">Acquired From</label>
            <input
              className="w-full border rounded p-2"
              value={form.acquiredFrom}
              onChange={(e) => setForm({ ...form, acquiredFrom: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              className="w-full border rounded p-2"
              rows={3}
              value={form.plantNotes}
              onChange={(e) => setForm({ ...form, plantNotes: e.target.value })}
            />
          </div>

          {/* Food */}
          <div>
            <label className="block text-sm font-medium">Food *</label>
            <select
              className="w-full border rounded p-2"
              value={form.foodId ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  foodId: e.target.value ? Number(e.target.value) : null,
                })
              }
              required
            >
              <option value="">-- Select food --</option>
              <option value={1}>Liquid Fertiliser</option>
              <option value={2}>Solid Food</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
