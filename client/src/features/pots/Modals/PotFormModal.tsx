// src/features/pots/PotFormModal.tsx
import { useState, useEffect } from "react";
import type { CreatePot } from "../../../types";

type Props = {
  open: boolean;
  qrCode: string;
  onClose: () => void;
  onSubmit: (data: CreatePot) => void;
};

export default function PotFormModal({ open, qrCode, onClose, onSubmit }: Props) {
    const [form, setForm] = useState<Omit<CreatePot, "qrCode">>({
        friendly_name: "",
        location: "",
        diameter_cm: null,
        height_cm: null,
        acquired_at: new Date().toISOString(),
        acquired_from: null,
    });

  useEffect(() => {
    if (open) {
      setForm({
        friendly_name: "",
        location: "",
        diameter_cm: null,
        height_cm: null,
        acquired_at: new Date().toISOString(),
        acquired_from: null,
      });
    }
  }, [open, qrCode]);

  if (!open) return null;



  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-lg font-bold mb-4">Create New Pot</h2>
        <p className="text-sm text-gray-500 mb-4">QR Code: {qrCode}</p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            onSubmit({ qrCode, ...form });
            // onClose();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium">Name*</label>
            <input
              className="w-full border rounded p-2"
              value={form.friendly_name}
              onChange={(e) => setForm({ ...form, friendly_name: e.target.value })}
              required
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium">Location</label>
            <input
              className="w-full border rounded p-2"
              value={form.location ?? ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
          </div> */}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">Diameter (cm)</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={form.diameter_cm ?? ""}
                onChange={(e) =>
                  setForm({ ...form, diameter_cm: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Height (cm)</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={form.height_cm ?? ""}
                onChange={(e) =>
                  setForm({ ...form, height_cm: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Acquired from</label>
            <input
              className="w-full border rounded p-2"
              value={form.acquired_from ?? ""}
              onChange={(e) => setForm({ ...form, acquired_from: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
              Create Pot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
