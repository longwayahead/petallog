// src/features/pots/Modals/AssignPotModal.tsx
import { useEffect, useState } from "react";

type Pot = {
  potsId: number;
  potFriendlyName: string;
  potStatusName: string;
  potStatusDescription: string;
  currentPlantId: number | null;
  currentPlantName: string | null;
  currentPlantSpecies: string | null;
  currentPlantPhoto: string | null;
};

type AssignPotModalProps = {
  open: boolean;
  qrCode: string;
  onClose: () => void;
  onAssign: (potId: number) => void;
  onCreateNew: () => void;
};

export default function AssignPotModal({
  open,
  qrCode,
  onClose,
  onAssign,
  onCreateNew,
}: AssignPotModalProps) {
  const [pots, setPots] = useState<Pot[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("/api/pots/")
        .then((res) => res.json())
        .then((data) => setPots(data))
        .catch(() => setPots([]))
        .finally(() => setLoading(false));
    }
  }, [open]);

  if (!open) return null;

  const filtered = pots.filter((pot) => {
    const q = query.toLowerCase();
    return (
      pot.potFriendlyName.toLowerCase().includes(q) ||
      (pot.currentPlantName?.toLowerCase().includes(q) ?? false)
    );
  });

  const emptyPots = filtered.filter((p) => p.potStatusName === "empty");
  const occupiedPots = filtered.filter((p) => p.potStatusName === "occupied");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col h-[90vh] relative">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-semibold text-gray-800">
              Choose a Pot
            </h2>
            <span className="text-xs text-gray-500 truncate">QR: {qrCode}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times text-lg" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Search pots or plants…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-gray-400 text-sm">
              No pots found
            </p>
          ) : (
            <ul>
              {emptyPots.length > 0 && (
                <>
                  <h3 className="flex items-center px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase">
                    <span>Empty Pots</span>
                    <span className="ml-2 flex-1 border-t border-gray-200" />
                  </h3>
                  {emptyPots.map((pot) => (
                    <li
                      key={pot.potsId}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-50 flex items-center"
                      onClick={() => onAssign(pot.potsId)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800 truncate">
                            {pot.potFriendlyName}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 ml-2">
                            {pot.potStatusName}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 italic truncate">
                          {pot.potStatusDescription}
                        </div>
                      </div>
                      <i className="fas fa-chevron-right text-gray-400 ml-2" />
                    </li>
                  ))}
                </>
              )}

              {occupiedPots.length > 0 && (
                <>
                  <h3 className="flex items-center px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase">
                    <span>Occupied Pots</span>
                    <span className="ml-2 flex-1 border-t border-gray-200" />
                  </h3>
                  {occupiedPots.map((pot) => (
                    <li
                      key={pot.potsId}
                      className="px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center"
                      onClick={() => onAssign(pot.potsId)}
                    >
                      {pot.currentPlantName && (
                        <img
                          src={
                            pot.currentPlantPhoto ||
                            `https://placehold.co/48x48/ccc/fff?text=${pot.currentPlantName[0]}`
                          }
                          alt={pot.currentPlantName}
                          className="w-12 h-12 rounded-full object-cover mr-3"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800 truncate">
                            {pot.potFriendlyName}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 ml-2">
                            {pot.potStatusName}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {pot.potStatusDescription}{" "}
                          <span className="font-medium">
                            {pot.currentPlantName}
                          </span>
                          {/* {pot.currentPlantSpecies
                            ? ` • ${pot.currentPlantSpecies}`
                            : ""} */}
                        </div>
                      </div>
                      <i className="fas fa-chevron-right text-gray-400 ml-2" />
                    </li>
                  ))}
                </>
              )}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-gray-200 flex justify-end">
          <button
            onClick={onCreateNew}
            className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
          >
            <i className="fas fa-plus" />
            <span>Add Pot</span>
          </button>
        </div>
      </div>
    </div>
  );
}
