// potFormBridge.ts
// Provides global promises for coordinating multi-step flows
// between actionController (logic) and UI (RootLayout/PlantProfilePage).

import type { Plant } from "../types";

//
// ---------- CHOOSE POT ----------
//
type ChooseListener = (qr: string) => void;
let chooseListeners: ChooseListener[] = [];
let chooseActionResolver: ((choice: "create" | "assign") => void) | null = null;
let pendingChooseQr: string | null = null;

export function createChoosePotActionPromise(qr: string): Promise<"create" | "assign"> {
  console.log("Creating choose pot action promise");
  pendingChooseQr = qr;
  chooseListeners.forEach(fn => fn(qr));
  return new Promise(resolve => {
    chooseActionResolver = resolve;
  });
}

export function subscribePendingChoose(fn: ChooseListener) {
  chooseListeners.push(fn);
  if (pendingChooseQr) {
    console.log("Replaying pending choose QR:", pendingChooseQr);
    fn(pendingChooseQr);
  }
  return () => {
    chooseListeners = chooseListeners.filter(l => l !== fn);
  };
}

export function resolveChoosePotAction(choice: "create" | "assign") {
  chooseActionResolver?.(choice);
  chooseActionResolver = null;
  pendingChooseQr = null;
}

//
// ---------- CREATE POT ----------
//
let potFormResolver: ((data: any) => void) | null = null;
//@ts-ignore
let pendingCreateQr: string | null = null;

export function createPotFormPromise(qrCode: string): Promise<any> {
  pendingCreateQr = qrCode;
  return new Promise(resolve => {
    potFormResolver = resolve;
  });
}

export function resolvePotForm(data: any) {
  if (potFormResolver) {
    potFormResolver(data);
    potFormResolver = null;
    pendingCreateQr = null;
  }
}

//
// ---------- ASSIGN POT ----------
//
type AssignListener = (qr: string) => void;
let assignListeners: AssignListener[] = [];
let assignPotResolver: ((result: number | "create" | null) => void) | null = null;
let pendingAssignQr: string | null = null;

export function createAssignPotPromise(qr: string): Promise<number | "create" | null> {
  console.log("Creating assign pot promise for", qr);
  pendingAssignQr = qr;
  assignListeners.forEach(fn => fn(qr));
  return new Promise(resolve => {
    assignPotResolver = resolve;
  });
}

export function subscribePendingAssign(fn: AssignListener) {
  assignListeners.push(fn);
  if (pendingAssignQr) {
    console.log("Replaying pending assign QR:", pendingAssignQr);
    fn(pendingAssignQr);
  }
  return () => {
    assignListeners = assignListeners.filter(l => l !== fn);
  };
}

export function resolveAssignPot(potId: number) {
  console.log("Resolving assign pot with", potId);
  assignPotResolver?.(potId);
  assignPotResolver = null;
  pendingAssignQr = null;
}

export function resolveAssignPotCreate() {
  console.log("Resolving assign pot with 'create'");
  assignPotResolver?.("create");
  assignPotResolver = null;
  pendingAssignQr = null;
}

export function cancelAssignPot() {
  console.log("Assign pot cancelled");
  assignPotResolver?.(null);
  assignPotResolver = null;
  pendingAssignQr = null;
}

//
// ---------- PLANT FORM ----------
//
let plantFormResolver: ((data: any) => void) | null = null;
let pendingPotId: string | null = null;
let pendingParentPlant: Partial<Plant> | null = null;
let plantListeners: ((potId: string, parentPlant?: Partial<Plant> | null) => void)[] = [];

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

export function resolvePlantForm(data: any) {
  if (plantFormResolver) {
    plantFormResolver(data);
    plantFormResolver = null;
    pendingPotId = null;
    pendingParentPlant = null;
  }
}

export function cancelPlantForm() {
  console.log("Plant form cancelled");
  plantFormResolver?.(null);
  plantFormResolver = null;
  pendingPotId = null;
  pendingParentPlant = null;
}

export function subscribePendingPlant(
  fn: (potId: string, parentPlant?: Partial<Plant> | null) => void
) {
  plantListeners.push(fn);
  if (pendingPotId) {
    console.log("Replaying pending plant form:", pendingPotId);
    fn(pendingPotId, pendingParentPlant);
  }
  return () => {
    plantListeners = plantListeners.filter(l => l !== fn);
  };
}
