// src/layouts/RootLayout.tsx
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import AssignPotModal from "../../features/pots/Modals/AssignPotModal";
import PotFormModal from "../../features/pots/Modals/PotFormModal";
import PlantFormModal from "../../features/plants/Modals/PlantFormModal";
import {
  subscribePendingQr,
  resolveAssignPot,
  resolveAssignPotCreate,
  resolvePotForm,
  subscribePendingPlant,
  resolvePlantForm,
  subscribePendingCreate
} from "../../lib/potFormBridge";
import {  pauseScanner, resumeScanner } from "../../lib/scannerBridge";
import type { Plant } from "../../types";

export default function RootLayout() {
  // 🔹 AssignPotModal
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);

  // 🔹 PotFormModal
  const [potFormOpen, setPotFormOpen] = useState(false);

  // 🔹 PlantFormModal
  const [plantFormOpen, setPlantFormOpen] = useState(false);
  const [plantPotId, setPlantPotId] = useState<string | null>(null);
   const [parentPlant, setParentPlant] = useState<Partial<Plant> | null | undefined>(undefined);

  // 🔹 Global scanner modal
  // const [scannerOpen, setScannerOpen] = useState(false);
  // const [scannerHeading, setScannerHeading] = useState("Scan a pot");

// Sub: PotFormModal
useEffect(() => {
  const unsub = subscribePendingCreate((qr) => {
    console.log("RootLayout got pending PotForm for QR:", qr);
    pauseScanner(); // pause while pot form is open
    setQrCode(qr);
    setPotFormOpen(true);
  });
  return unsub;
}, []);

  // Sub: AssignPotModal
  useEffect(() => {
    const unsub = subscribePendingQr((qr) => {
      console.log("RootLayout got pending QR:", qr);
      pauseScanner(); // 👈 pause camera when modal opens
      setQrCode(qr);
      setAssignOpen(true);
    });
    return unsub;
  }, []);

  // Sub: PlantFormModal
  useEffect(() => {
    const unsub = subscribePendingPlant((potId, parentPlant) => {
      console.log("RootLayout got pending PlantForm for pot:", potId);
      pauseScanner(); // 👈 pause while plant form is open
      setPlantPotId(potId);
      setParentPlant(parentPlant || null);
      setPlantFormOpen(true);
    });
    return unsub;
  }, []);

  // Sub: Scanner (bridge promise → modal)
  // useEffect(() => {
  //   // when actionController calls createScannerPromise → open scanner modal
  //   (createScannerPromise as any)._open = (heading?: string) => {
  //     // setScannerHeading(heading || "Scan a pot");
  //     // setScannerOpen(true);
  //   };
  // }, []);

  return (
    <>
      <Outlet />

      {/* 🔹 AssignPotModal */}
      <AssignPotModal
        open={assignOpen}
        qrCode={qrCode || ""}
        onClose={() => {
          setAssignOpen(false);
          resumeScanner();
        }}
        onAssign={(potId) => {
          resolveAssignPot(potId);
          setAssignOpen(false);
        }}
        onCreateNew={() => {
          resolveAssignPotCreate();
          setAssignOpen(false);
        }}
      />

      {/* 🔹 PotFormModal */}
      <PotFormModal
        open={potFormOpen}
        qrCode={qrCode || ""}
        onClose={() => {
          setPotFormOpen(false);
          setQrCode(null);
          resumeScanner();
        }}
        onSubmit={(data) => {
          resolvePotForm(data);
          setPotFormOpen(false);
          setQrCode(null);
          resumeScanner();
        }}
      />

      {/* 🔹 PlantFormModal */}
      <PlantFormModal
        open={plantFormOpen}
        potId={plantPotId || ""}
        parentPlant={parentPlant === undefined ? undefined : parentPlant} // differentiate between "not set" and "null"
        onClose={() => {
          setPlantFormOpen(false);
          setPlantPotId(null);
          setParentPlant(undefined);
          console.log("Closing PlantFormModal, closing scanner");
          resumeScanner();
        }}
        onSubmit={(data) => {
          resolvePlantForm(data);
          setPlantFormOpen(false);
          setPlantPotId(null);
          setParentPlant(undefined);
          resumeScanner();
        }}
      />

      {/* 🔹 Global Scanner Modal */}
      {/* <ScanScreen
        open={scannerOpen}
        heading={scannerHeading}
        asPage={false}
        // onClose={() => setScannerOpen(false)}
        onClose={() => {
            console.log("RootLayout closing scanner");
            setScannerOpen(false);

            // If user is *on* /scan, make sure we navigate back
            if (window.location.pathname === "/scan" && history.state?.usr?.returnTo) {
              window.history.replaceState(null, "", history.state.usr.returnTo);
            }
          }}
      /> */}
    </>
  );
}
