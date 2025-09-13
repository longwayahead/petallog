// src/layouts/RootLayout.tsx
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import AssignPotModal from "../../features/pots/Modals/AssignPotModal";
import PotFormModal from "../../features/pots/Modals/PotFormModal";
import PlantFormModal from "../../features/plants/Modals/PlantFormModal";
import {
  subscribePendingAssign,
  resolveAssignPot,
  resolveAssignPotCreate,
  resolvePotForm,
  subscribePendingPlant,
  resolvePlantForm,
  cancelAssignPot,
  cancelPlantForm
} from "../../lib/potFormBridge";
import { pauseScanner, resumeScanner } from "../../lib/scannerBridge";
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

  // Sub: AssignPotModal
  useEffect(() => {
    const unsub = subscribePendingAssign((qr) => {
      console.log("RootLayout got pending Assign QR:", qr);
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

  return (
    <>
      <Outlet />

      {/* 🔹 AssignPotModal */}
      <AssignPotModal
        open={assignOpen}
        qrCode={qrCode || ""}
        onClose={() => {
          cancelAssignPot();
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
          setPotFormOpen(true);
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
          cancelPlantForm();
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
    </>
  );
}
