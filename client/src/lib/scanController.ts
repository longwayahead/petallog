// src/lib/scanController.ts
// handles the qr code scanning flow in the main scanner

import {
  apiValidateQRCode,
  apiCreatePot,
  apiAssignQRCodeToPot,
  apiCreatePlant,
  apiUploadPhoto,
} from "./potService";
import {
  createAssignPotPromise,
  createPotFormPromise,
  createPlantFormPromise,
} from "./potFormBridge";

// 🔒 prevent multiple overlapping scans
let scanningLocked = false;

export async function scanController(
  qrCode: string,
  navigate: (path: string) => void
) {
  if (scanningLocked) {
    console.log("Ignoring scan, already processing...");
    return;
  }
  scanningLocked = true;

  try {
    const qr = await apiValidateQRCode(qrCode);
    console.log("QR result:", qr);

    // QR not in DB
    if (!qr.valid) {
      alert("Invalid QR code");
      return;
    }

    // Case: Pot already has a plant
    if (qr.plantId) {
      navigate(`/plants/${qr.plantId}`);
      return;
    }

    let newPotId: string | null = null;

    // Case: QR has no pot
    if (!qr.potId) {
      const result = await createAssignPotPromise(qrCode);

      // 👇 if user cancelled AssignPotModal
      if (result === null) {
        console.log("Assign pot cancelled by user");
        return;
      }

      if (result === "create") {
        console.log("User chose to create a new pot");
        const details = await createPotFormPromise(qrCode);

        if (!details) {
          console.log("Pot creation cancelled by user");
          return;
        }

        const newPot = await apiCreatePot(details);
        console.log("Created pot", newPot);
        newPotId = String(newPot);
      } else {
        console.log("Assigned existing pot", result);
        newPotId = String(result);

        await apiAssignQRCodeToPot(qrCode, String(result));
      }
    }

    // Case: Pot exists but empty (or just created)
    if ((qr.potId && !qr.plantId) || newPotId) {
      const potId: any = newPotId || qr.potId;
      const details = await createPlantFormPromise(potId, null);

      // 👇 if user cancelled PlantFormModal
      if (!details) {
        console.log("Plant creation cancelled by user");
        return;
      }

      const newPlant = await apiCreatePlant({ ...details, potId });

      const res = await fetch(
          `/api/interactions?plantId=${newPlant.plantId}&actionId=13`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!res.ok) throw new Error("Failed to create new plant interaction");

        const newInteraction = await res.json();
        console.log("New interaction created", newInteraction.interactionID);
        
      if (details.photoFile) {
        

        console.log("Uploading photo to interaction", newInteraction.interactionID);
        const uploadedPhoto = await apiUploadPhoto(
          details.photoFile,
          newInteraction.interactionID
        );

        await fetch(
          `/api/plants/${newPlant.plantId}/photo/${uploadedPhoto.id}`,
          {
            method: "PATCH",
          }
        );
      }

      navigate(`/plants/${newPlant.plantId}`);
      return;
    }
  } finally {
    scanningLocked = false; // ✅ always release lock
  }
}
