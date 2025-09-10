// src/features/pots/Modals/AssignPotModal.tsx
import { useEffect, useState } from "react";

// type Pot = {
//   potsId: number;
//   potLocation: string | null;
//   potDiameter: number | null;
//   potHeight: number | null;
//   potFriendlyName: string;
//   potAcquiredAt: string | null;
//   potStatusName: string;
// };

type AssignPotModalProps = {
  open: boolean;
  qrCode: string;
  onClose: () => void;
  onAssign: (potId: number) => void;
  onCreateNew: () => void;
};

export default function AssignPotModal({ open, qrCode, onClose, onAssign, onCreateNew }: AssignPotModalProps) {
  const [pots, setPots] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetch("/api/pots/empty")
        .then((res) => res.json())
        .then(setPots)
        .catch(() => setPots([]));
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-bold mb-4">Assign QR to an existing pot</h2>
        <p className="text-sm text-gray-500 mb-4">QR: {qrCode}</p>

        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {pots.map((pot) => (
            <li
              key={pot.potsId}
              className="p-2 border rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => onAssign(pot.potsId)}
            >
              <div className="font-medium">{pot.potFriendlyName}</div>
              {/* <div className="text-xs text-gray-500">{pot.potLocation}</div> */}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            + Create New Pot
          </button>
        </div>
      </div>
    </div>
  );
}
