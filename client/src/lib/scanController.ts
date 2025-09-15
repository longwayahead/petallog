// src/lib/scanController.ts
// handles the qr code scanning flow in the main scanner

import { apiValidateQRCode, apiCreatePot, apiAssignQRCodeToPot, apiCreatePlant, apiUploadPhoto } from "./potService";
import { createAssignPotPromise, createPotFormPromise, createPlantFormPromise } from "./potFormBridge";

export async function scanController(qrCode: string, navigate: (path: string) => void) {
  let qr = await apiValidateQRCode(qrCode);

  console.log("QR result:", qr);

  //qr not in DB
  if (!qr.valid) {
    alert("Invalid QR code");
    return;
  }


    // @ts-ignore  
    let newPotId: string | null = null;

    // QR has no pot
    if (!qr.potId) {
        //assign to existing pot or make a new pot?
        const result = await createAssignPotPromise(qrCode);
        if (result === null) {
          // user cancelled
          return;
        } else if (result === "create") {
           
            console.log("User chose to create a new pot, qrCode =", JSON.stringify(qrCode));
            console.log(qrCode);
            const details = await createPotFormPromise(qrCode);
             if (!details) return; 
            console.log("scanController received details", details);

            const newPot = await apiCreatePot(details);
            console.log("Created pot", newPot);
            newPotId = String(newPot);
        } else if (typeof result === "number" || typeof result === "string") {
            
            console.log("Assigned existing pot", result);

            newPotId = String(result);

            //bind qrCode → potId (insert into qrcodes_pots)
            await apiAssignQRCodeToPot(qrCode, String(result));

            

          

        } 
        qr = await apiValidateQRCode(qrCode); // refresh qr data
    }

  /// Pot has pot and plant
  if (qr.plantId) {
    navigate(`/plants/${qr.plantId}`);
    return;
  }

    // console.log(qr);
    

  // Case: Pot exists but empty
  if ((qr.potId && !qr.plantId)) {
    const potId: any = qr.potId;
    const details = await createPlantFormPromise(potId, null);
    if(!details) return; // user cancelled
    const newPlant = await apiCreatePlant({ ...details, potId: potId });

          // 2a. Add a timeline card for the child plant
          const res = await fetch(
        `/api/interactions?plantId=${newPlant.plantId}&actionId=13`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // body: JSON.stringify({ note: `Propagated from parent "${plant.plantName}"` }),
        }
      );
      if (!res.ok) throw new Error("Failed to create new plant interaction");
      const newInteraction = await res.json();    
        console.log("New interaction created", newInteraction.interactionID);

      if (details.photoFile) {

        // 2b. Upload the photo to that new interaction        
    
        console.log("Uploading photo to interaction", newInteraction.interactionID);
        const uploadedPhoto = await apiUploadPhoto(details.photoFile, newInteraction.interactionID);
    
        // 2c. Set that uploaded photo as the profile photo
        await fetch(`/api/plants/${newPlant.plantId}/photo/${uploadedPhoto.id}`, {
          method: "PATCH",
        });
    
      }

    navigate(`/plants/${newPlant.plantId}`);
    return;
  }


}
