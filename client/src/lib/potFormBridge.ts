// potFormBridge.ts
// Provides global promises for coordinating multi-step flows
// between actionController (logic) and UI (RootLayout/PlantProfilePage).

import type { Plant } from "../types";

// ---------- LISTENERS ----------
type Listener = (qr: string) => void;
let listeners: Listener[] = [];

export function subscribePendingQr(fn: Listener) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
}
// @ts-ignore
let pendingQr: string | null = null;
export function subscribePendingPlant(
  fn: (potId: string, parentPlant?: Partial<Plant> | null) => void
) {
  plantListeners.push(fn);
  return () => {
    plantListeners = plantListeners.filter(l => l !== fn);
  };
}


// ---------- CREATE POT ----------
let potFormResolver: ((data: any) => void) | null = null;
let pendingCreateQr: string | null = null;
let createListeners: ((qr: string) => void)[] = [];

export function createPotFormPromise(qrCode: string): Promise<any> {
  console.log("Creating pot form promise for", qrCode);
  pendingCreateQr = qrCode;
  createListeners.forEach(fn => fn(qrCode)); // notify RootLayout
  return new Promise(resolve => {
    potFormResolver = resolve;
  });
}

export function subscribePendingCreate(fn: (qr: string) => void) {
  createListeners.push(fn);

  if (pendingCreateQr) {
    fn(pendingCreateQr); // replay if already pending
  }

  return () => {
    createListeners = createListeners.filter(l => l !== fn);
  };
}

export function resolvePotForm(data: any) {
  if (potFormResolver) {
    potFormResolver(data);
    potFormResolver = null;
    pendingCreateQr = null;
  }
}


// ---------- ASSIGN POT ----------
let assignPotResolver: ((result: number | "create") => void) | null = null;

export function createAssignPotPromise(qr: string): Promise<number | "create"> {
  console.log("Creating assign pot promise for", qr);
  pendingQr = qr;
  listeners.forEach(fn => fn(qr)); // notify subscribers
  return new Promise((resolve) => {
    assignPotResolver = resolve;
  });
}

export function resolveAssignPot(potId: number) {
  console.log("Resolving assign pot with", potId);
  assignPotResolver?.(potId);
  assignPotResolver = null;
  pendingQr = null;
}

export function resolveAssignPotCreate() {
  console.log("Resolving assign pot with 'create'");
  assignPotResolver?.("create");
  assignPotResolver = null;
  pendingQr = null;
}

// ---------- PLANT FORM ----------
let plantFormResolver: ((data: any) => void) | null = null;
// @ts-ignore
let pendingPotId: string | null = null;
// @ts-ignore
let pendingParentPlant: Partial<Plant> | null = null;

// IMPORTANT: subscriber now receives *both* potId and parentPlant
let plantListeners: ((potId: string, parentPlant?: Partial<Plant> | null) => void)[] = [];

/**
 * Called by actionController to start a new plant flow.
 * Notifies subscribers (RootLayout/PlantProfilePage) to open PlantFormModal.
 */
export function createPlantFormPromise(
  potId: string,
  parentPlant?: Partial<Plant> | null
): Promise<any> {
  console.log("Creating plant form promise for pot", potId, "parent:", parentPlant);
  pendingPotId = potId;
  pendingParentPlant = parentPlant ?? null;
  plantListeners.forEach(fn => fn(potId, parentPlant));
  return new Promise(resolve => {
    plantFormResolver = resolve;
  });
}

/**
 * Called from PlantProfilePage after user submits PlantFormModal.
 */
export function resolvePlantForm(data: any) {
  if (plantFormResolver) {
    plantFormResolver(data);
    plantFormResolver = null;
    pendingPotId = null;
    pendingParentPlant = null;
  }
}

