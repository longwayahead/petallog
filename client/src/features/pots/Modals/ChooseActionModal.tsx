// src/features/pots/ChoosePotActionModal.tsx
type Props = {
  open: boolean;
  onClose: () => void;
  onChoose: (choice: "create" | "assign") => void;
};

export default function ChoosePotActionModal({ open, onClose, onChoose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-lg font-bold mb-4">QR code not assigned</h2>
        <p className="text-sm text-gray-500 mb-6">
          What would you like to do?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => { onChoose("assign"); onClose(); }}
            className="px-4 py-2 border rounded"
          >
            Assign Existing
          </button>
          <button
            onClick={() => { onChoose("create"); onClose(); }}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Create New
          </button>
        </div>
      </div>
    </div>
  );
}
