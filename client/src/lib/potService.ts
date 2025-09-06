// src/lib/potService.ts
import type { ActionsApi, ValidateQRCodeResult, CreatePot, Plant, Photo } from "../types";

export async function apiValidateQRCode(code: string): Promise<ValidateQRCodeResult> {
  const res = await fetch(`/api/qr/${code}`);
  if (!res.ok) throw new Error("Failed to validate QR code");
  return res.json();
}

export async function apiCreatePot(data: CreatePot): Promise<string> { //working
  const res = await fetch(`/api/pots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create pot");
  const json = await res.json();
  return String(json.potId);
}

export async function apiCreatePlantPot(plantId: string, potId: string): Promise<void> {
  await fetch(`/api/plants/${plantId}/pots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ potId }),
  });
}


export async function apiAssignQRCodeToPot(qrCode: string, potId: string): Promise<void> {
  const res = await fetch(`/api/pots/assign-qr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qrCode, potId }),
  });
  if (!res.ok) throw new Error("Failed to assign QR code to pot");
  return res.json();
}

export async function apiFreePot(potId: string): Promise<any> {
  const res = await fetch(`/api/pots/${potId}/free`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to free pot");
  return res.json();
}

export async function apiKillPlant(plantId: string): Promise<any> {
  const res = await fetch(`/api/plants/${plantId}/kill`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to kill plant");
  return res.json();
}

export async function apiAssignPlantPot(plantId: string, potId: string): Promise<Plant> {
  const res = await fetch(`/api/plants/${plantId}/pot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ potId }),
  });
  if (!res.ok) throw new Error("Failed to assign plant to pot");
  return res.json();
}

export async function apiCreatePlant(data: Partial<Plant> & {potId: string}): Promise<Plant> {
  console.log("apiCreatePlant called with", data);
  const res = await fetch(`/api/plants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create plant");
  return res.json();
}

export async function apiUploadPhoto(file: File, interactionId: string): Promise<Photo> {
  const form = new FormData();
  console.log("Uploading photo to interaction", interactionId);
  form.append("photos", file);

  const res = await fetch(`/api/interactions/${interactionId}/photos`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error("Failed to upload photo");
  }

  const photos: Photo[] = await res.json();
  return photos[0]; // backend can return multiple, we only care about the first
}





export const actionsApi: ActionsApi = {
  validateQRCode: apiValidateQRCode,
  createPot: apiCreatePot,
  createPlantPot: apiCreatePlantPot,
  apiAssignQRCodeToPot: apiAssignQRCodeToPot,
  apiFreePot: apiFreePot,
  apiCreatePlant: apiCreatePlant,
  apiKillPlant: apiKillPlant,
};
