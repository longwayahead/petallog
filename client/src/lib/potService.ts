// src/lib/potService.ts
import type { ActionsApi, ValidateQRCodeResult, CreatePot, Plant } from "../types";

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

export async function apiCreatePropagation(
  parentId: string,
  newPotId: string
): Promise<{ childId: string }> {
  const res = await fetch(`/api/propagations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parentId, newPotId }),
  });
  if (!res.ok) throw new Error("Failed to create propagation");
  return res.json();
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

export async function apiFreePot(potId: string): Promise<void> {
  const res = await fetch(`/api/pots/${potId}/free`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to free pot");
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




export const actionsApi: ActionsApi = {
  validateQRCode: apiValidateQRCode,
  createPot: apiCreatePot,
  createPlantPot: apiCreatePlantPot,
  createPropagation: apiCreatePropagation,
  apiAssignQRCodeToPot: apiAssignQRCodeToPot,
  apiFreePot: apiFreePot,
};
