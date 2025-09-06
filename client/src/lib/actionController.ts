// src/lib/actionController.ts

import type { Action, Interaction,  ActionsApi } from "../types";
import {
  apiValidateQRCode,
  apiCreatePot,
  apiAssignPlantPot,
  apiAssignQRCodeToPot
} from "./potService";
import { createPotFormPromise, createAssignPotPromise } from "./potFormBridge";

type Deps = {
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

        if (typeof result === "number" || typeof result === "string") {
          
          console.log("Assigned existing pot", result);

          newPotId = String(result);

          //bind qrCode → potId (insert into qrcodes_pots)
          await apiAssignQRCodeToPot(qrCode, String(result));

        } else if (result === "create") {
          console.log("User chose to create a new pot");
          const details = await createPotFormPromise(qrCode);
          console.log("actionController received details", details);

          const newPot = await apiCreatePot(details);
          console.log("Created pot", newPot);
          newPotId = String(newPot);
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

      return newPotId;


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

      const newPotId = await newPot( currentPotId, openScanner, navigateTo );

      const newPotPlant = await apiAssignPlantPot(plantId, newPotId ? newPotId : "");
      // console.log("Assigned plant to pot", newPotPlant);

      await addTimelineCard(plantId, action, {
        note: `Repotted into ${newPotPlant.potName}`,
      });

    },


  prop: async (
    action,
    { plantId, currentPotId, addTimelineCard, openScanner, api, navigateTo }
  ) => {
    const newPotId = await newPot( currentPotId, openScanner, navigateTo );

    // const { childId } = await api.createPropagation(plantId, newPotId ? newPotId : "");
    //make plant here

    // await addTimelineCard(plantId, action, {
    //   note: `Propagated into pot ${newPotId}`,
    // });
    // await addTimelineCard(childId, action, {
    //   note: `Propagated from parent plant ${plantId}`,
    // });
    // navigateTo(`/plants/${childId}`);
  },

  relo: async (action, { plantId, addTimelineCard, chooseLocation }) => {
    const newLocationId = await chooseLocation();
    await addTimelineCard(plantId, action, {
      note: `Moved to location ${newLocationId}`,
    });
  },

};
