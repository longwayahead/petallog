// potFormBridge.ts
// Provides global promises for coordinating multi-step flows
// between actionController (logic) and UI (RootLayout/PlantProfilePage).

import type { Plant } from "../types";

// ---------- CHOOSE POT ----------
type Listener = (qr: string) => void;
let listeners: Listener[] = [];

export function createChoosePotActionPromise(qr: string): Promise<"create" | "assign"> {
  console.log("Creating choose pot action promise");
  pendingQr = qr;
  listeners.forEach(fn => fn(qr)); // notify subscribers
  return new Promise((resolve) => {
    chooseActionResolver = resolve;
  });
}

export function subscribePendingQr(fn: Listener) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
}

export function resolveChoosePotAction(choice: "create" | "assign") {
  chooseActionResolver?.(choice);
  chooseActionResolver = null;
}

// ---------- CREATE POT ----------
let potFormResolver: ((data: any) => void) | null = null;
// @ts-ignore
let pendingQr: string | null = null;
let chooseActionResolver: ((choice: "create" | "assign") => void) | null = null;

export function createPotFormPromise(qrCode: string): Promise<any> {
  pendingQr = qrCode;
  return new Promise((resolve) => {
    potFormResolver = resolve;
  });
}

export function resolvePotForm(data: any) {
  if (potFormResolver) {
    potFormResolver(data);
    potFormResolver = null;
    pendingQr = null;
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

/**
 * Subscribe to pending plant requests.
 * Returns an unsubscribe function.
 */
export function subscribePendingPlant(
  fn: (potId: string, parentPlant?: Partial<Plant> | null) => void
) {
  plantListeners.push(fn);
  return () => {
    plantListeners = plantListeners.filter(l => l !== fn);
  };
}
