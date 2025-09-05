import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import {resolveScanner} from "../../../lib/scannerBridge";

export default function ScanPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const state = location.state as {mode?: string; heading?: string; returnTo?: string};

  const heading = state?.heading || "Scan a pot";
  
  async function handleScan(result: string) {
     if (state?.mode === "flow") {
      resolveScanner(result);
      // return scanned code back to controller
      navigate(state.returnTo || "/", {
        replace: true,
        state: { scannedQr: result }, 
      });
      return;
    }


    
    if (!result || loading) return;
    setLoading(true);
    setError(null);
    try {
      // Call your backend API with scanned code
      const res = await fetch(`/api/qr/${result}`);
      if (!res.ok) throw new Error("Invalid response");
      const data = await res.json();
      console.log(data);
      if (!data.valid) {
        setError("Invalid QR code");
        console.log('1');
      } else if (!data.potId) {
        // qr valid not tied to pot
        navigate(`/pots/new?qrId=${data.qrId}`);
        console.log('2');
      } else if (data.potId && !data.plantId) {
        // pot exists but empty
        navigate(`/plants/new?potId=${data.potId}`);
        console.log('3');
      } else if (data.potId && data.plantId) {
        // pot occupied
        navigate(`/plants/${data.plantId}`);
        console.log('4');
      } 
    } catch (err) {
      console.error(err);
      setError("Error checking QR code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-root app-container mx-auto max-w-md bg-black text-white pb-16">
      <header className="sticky top-0 z-10 bg-black/70 backdrop-blur px-4 h-[56px] flex items-center">
        <h1 className="text-lg font-semibold">{heading}</h1>
      </header>

      <div className="p-4">
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
    </main>
    //  <div className="p-4">
    //   <h1 className="text-lg font-bold">Scan QR</h1>
    //   {error && <p className="text-red-600">{error}</p>}

    //   {/* Replace this with your QR scanner component */}
    //   <button
    //     className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded"
    //     onClick={() => handleScan("AAAA")}
    //   >
    //     Simulate Scan
    //   </button>
    // </div>
  );
}
