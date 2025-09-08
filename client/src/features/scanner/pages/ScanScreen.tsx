// src/features/scanner/ScanScreen.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import { resolveScanner, registerScannerControls } from "../../../lib/scannerBridge";
import { scanController } from "../../../lib/scanController";

type ScanScreenProps = {
  open?: boolean;           // modal mode
  heading?: string;
  onClose?: () => void;     // modal mode
  asPage?: boolean;         // full page mode
  returnTo?: string;        // where to go back in page mode
};

export default function ScanScreen({
  open,
  heading,
  onClose,
  asPage = false,
  returnTo = "/", // fallback
}: ScanScreenProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false); // 👈 local paused state
    // console.log("ScanScreen props:", { open, heading, onClose, asPage, returnTo });
  // Hook up pause/resume controls from scannerBridge
  useEffect(() => {
    registerScannerControls(
      () => setPaused(true),
      () => setPaused(false),
      () => {
        console.log("in the weird bit");
        if (asPage) {
            navigate(returnTo);
        } else {
            onClose?.();
        }
        // navigate(returnTo);
        // setPaused(true);
        // onClose?.();
        }
    );
  }, [asPage, returnTo, navigate, onClose]);

  async function handleScan(result: string) {
    if (!result || loading) return;
    setLoading(true);
    setError(null);

    try {
      if (asPage) {
        // 🔹 page flow → run full scanController
        await scanController(result, navigate);
      } else {
        // 🔹 modal flow → just resolve promise and let actionController handle
        resolveScanner(result);
        onClose?.();
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Don’t render in modal mode if closed
  if (!asPage && !open) return null;

  return (
    <div
      className={
        asPage
          ? "app-root app-container mx-auto max-w-md bg-black text-white min-h-screen flex flex-col"
          : "fixed inset-0 bg-black/80 flex flex-col z-50"
      }
    >
      <header className="px-4 h-[56px] flex items-center justify-between text-white bg-black/70 backdrop-blur">
        <h1 className="text-lg font-semibold">{heading}</h1>

        <button
          type="button"
          onClick={() => (asPage ? navigate(returnTo) : onClose?.())}
          className="p-2 rounded-full hover:bg-white/20"
          aria-label="Close"
        >
          <i className="fa fa-times text-xl"></i>
        </button>
      </header>

      <div className="flex-1 p-4">
        <div className="aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden">
          {!paused && ( // 👈 conditionally render scanner only when not paused
            <Scanner
              onScan={(codes) => {
                const { rawValue } = codes[0] || {};
                if (rawValue) handleScan(rawValue);
              }}
              onError={(err) => console.error("Scanner error", err)}
              constraints={{ facingMode: "environment" }}
              sound={false}
            />
          )}
        </div>

        {loading && <p className="mt-4 text-emerald-400">Checking code…</p>}
        {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>
    </div>
  );
}
