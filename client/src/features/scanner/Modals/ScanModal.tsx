// src/features/scanner/ScanModal.tsx
import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { resolveScanner } from "../../../lib/scannerBridge";

type ScanModalProps = {
  open: boolean;
  heading?: string;
  onClose: () => void;
};

export default function ScanModal({ open, heading = "Scan a pot", onClose }: ScanModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleScan(result: string) {
    if (!result || loading) return;
    setLoading(true);
    setError(null);

    resolveScanner(result);
    onClose();
    setLoading(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col z-50">
      <header className="px-4 h-[56px] flex items-center justify-between text-white">
        <h1 className="text-lg font-semibold">{heading}</h1>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/20"
          aria-label="Close"
        >
          <i className="fa fa-times text-xl"></i>
        </button>
      </header>

      <div className="flex-1 p-4">
        <div className="aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden">
          <Scanner
            onScan={(codes) => {
              const { rawValue } = codes[0] || {};
              if (rawValue) handleScan(rawValue);
            }}
            onError={(err) => console.error("Scanner error", err)}
            constraints={{ facingMode: "environment" }}
          />
        </div>

        {loading && <p className="mt-4 text-emerald-400">Checking code…</p>}
        {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>
    </div>
  );
}
