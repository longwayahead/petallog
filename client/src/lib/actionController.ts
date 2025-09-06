// src/lib/actionController.ts

import type { Action, Interaction,  ActionsApi, Plant } from "../types";
import {
  apiValidateQRCode,
  apiCreatePot,
  apiAssignPlantPot,
  apiAssignQRCodeToPot,
  apiCreatePlant,
  apiUploadPhoto,
  apiFreePot,
  apiKillPlant,
} from "./potService";
import { createPotFormPromise, createAssignPotPromise, createPlantFormPromise } from "./potFormBridge";

type Deps = {
  plant: Plant;
  plantId: string;
  currentPotId: string;
  addTimelineCard: (
    plantId: string,
    action: Action,
    extras?: Partial<Interaction>
  ) => Promise<void>;
  openScanner: (heading?: string) => Promise<string>;
  openCamera: () => Promise<string[]>;
  chooseLocation: () => Promise<string>;
  navigateTo: (path: string) => void;
  api: ActionsApi;
};

export async function newPot(currentPotId: string, openScanner: (heading?: string) => Promise<string | null>, navigateTo: (path: string) => void): Promise<string | null> {

// 1. Scan QR code
      const qrCode = await openScanner("Scan the destination pot");

      if (!qrCode) return null;

      // 2. Validate QR code
      const qr = await apiValidateQRCode(qrCode);
      console.log("QR result:", qr);

      if (!qr.valid) {
        alert("This QR code doesn't exist.");
        return null;
      }

      if (qr.plantId) {
        // pot already has a plant
        navigateTo(`/plants/${qr.plantId}`);
        return null;
      }

      let newPotId: string | null = null;

      if (!qr.potId) { //QR code is not assigned to a pot...yet.
   
        console.log("QR has no pot → opening assign modal first");
        console.log(qrCode);
        const result = await createAssignPotPromise(qrCode);
        
        console.log("actionController got assign result", result);
        // result can be either a potId (number/string) OR a signal to create a new pot

        console.log("Assign pot result", result);

        if (result === "create") {
          console.log("User chose to create a new pot");
          const details = await createPotFormPromise(qrCode);
          console.log("actionController received details", details);

          const newPot = await apiCreatePot(details);
          console.log("Created pot", newPot);
          newPotId = String(newPot);
        } else if (typeof result === "number" || typeof result === "string") {
          
          console.log("Assigned existing pot", result);

          newPotId = String(result);

          //bind qrCode → potId (insert into qrcodes_pots)
          await apiAssignQRCodeToPot(qrCode, String(result));

        } 
      } else { //qr already assigned to pot
        newPotId = String(qr.potId);
        console.log(qrCode, qr);
        console.log("QR already assigned to pot", newPotId);
      }
      console.log(currentPotId, newPotId);

      if (String(currentPotId) === String(newPotId)) {
        alert("This plant is already in that pot. Try scanning a different pot.");
        return null;
      }

      console.log(newPotId);

      return newPotId;


}

export async function newPlant(
  plant: Plant,
  potId: string,
  addTimelineCard?: (plantId: string, action: Action, extras?: Partial<Interaction>) => Promise<void>,
  action?: Action
): Promise<any> {
  console.log("Starting new plant flow");
  const details = await createPlantFormPromise(potId);
  console.log("Received plant details", details);

  // 1. Create the child plant
  const newPlant = await apiCreatePlant({ ...details, potId });

  // 2. If the user supplied a photo
  console.log("details", details);
  console.log("newplant", newPlant);
  if (details.photoFile && addTimelineCard && action) {
      // 2a. Add a timeline card for the child plant
      const res = await fetch(
    `/api/interactions?plantId=${newPlant.plantId}&actionId=${action.actionID}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: `Propagated from parent "${plant.plantName}"` }),
    }
  );
  if (!res.ok) throw new Error("Failed to create child interaction");
const newInteraction = await res.json();

 

    console.log("New interaction created", newInteraction.interactionID);

    // 2b. Upload the photo to that new interaction

    

    console.log("Uploading photo to interaction", newInteraction.interactionID);
    const uploadedPhoto = await apiUploadPhoto(details.photoFile, newInteraction.interactionID);

    // 2c. Set that uploaded photo as the profile photo
    await fetch(`/api/plants/${newPlant.plantId}/photo/${uploadedPhoto.id}`, {
      method: "PATCH",
    });

    // Update return object
    newPlant.plantPhoto = uploadedPhoto.url;
  }

  console.log("Created plant", newPlant);
  return newPlant;
}


export const actionHandlers: Record<
  Action["actionFlow"],
  (a: Action, d: Deps) => Promise<void>
> = {
  note: async (action, { plantId, addTimelineCard }) => {
    await addTimelineCard(plantId, action);
  },

    repo: async (
      action,
      { plantId, currentPotId, addTimelineCard, openScanner, navigateTo }
    ) => {
      console.log("Starting repotting flow");
      const newPotId = await newPot( currentPotId, openScanner, navigateTo );


      await apiFreePot(currentPotId);
      const newPotPlant = await apiAssignPlantPot(plantId, newPotId ? newPotId : "");
      // console.log("Assigned plant to pot", newPotPlant);

      await addTimelineCard(plantId, action, {
        note: `Repotted into ${newPotPlant.potName}`,
      });

    },


  prop: async (
    action,
    { plant, plantId, currentPotId, addTimelineCard, openScanner, navigateTo }
  ) => {
    console.log("Starting propagation flow");
    const newPotId = await newPot( currentPotId, openScanner, navigateTo );
    console.log("newPotId", newPotId);
    if (!newPotId) return;

    const newPlantDetails = await newPlant( plant, newPotId ? newPotId : "", addTimelineCard, action );

    if(!newPlantDetails) return;

    //add a card onto the parent
    await addTimelineCard(plantId, action, {
      note: `Propagated into ${newPlantDetails.potName} as "${newPlantDetails.plantName}"`
    });

    navigateTo(`/plants/${newPlantDetails.plantId}`);
  },

  kill: async (action, {plant, addTimelineCard}) => {

    const freePot = await apiFreePot(plant.potId);
    console.log("Freed pot", freePot);
    
    if (!freePot) return;

    const setPlantDead = apiKillPlant(plant.plantId);

    if (!setPlantDead) return;

    await addTimelineCard(plant.plantId, action, {
      note: `bleh 💀`,
    });
  }

};
