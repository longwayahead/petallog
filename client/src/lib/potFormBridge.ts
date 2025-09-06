// potFormBridge provides global promises for coordinating multi-step flows
// between actionController (which drives the logic) and PlantProfilePage
// (which owns the UI). actionController calls create*Promise() to request
// user input and pauses until it’s available. PlantProfilePage listens for
// pending requests (via subscribers) and opens the right modal. When the
// user submits, resolve*() is called, fulfilling the promise back in
// actionController and resuming the flow.


// choice

type Listener = (qr: string) => void;
let listeners: Listener[] = [];

export function createChoosePotActionPromise(qr: string): Promise<"create" | "assign"> {
  console.log("Creating choose pot action promise");
  pendingQr = qr;
  listeners.forEach(fn => fn(qr));   // 👈 notify subscribers
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


///create pot form


let potFormResolver: ((data: any) => void) | null = null;
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



//assign existing pot


let assignPotResolver: ((result: number | "create") => void) | null = null;

export function createAssignPotPromise(qr: string): Promise<number | "create"> {
  console.log("Creating assign pot promise for", qr);
  pendingQr = qr;
  listeners.forEach(fn => fn(qr));  // ✅ notify subscribers (PlantProfilePage)
  return new Promise((resolve) => {
    assignPotResolver = resolve;
  });
}

// Called when user picks an existing pot
export function resolveAssignPot(potId: number) {
  console.log("Resolving assign pot with", potId);
  assignPotResolver?.(potId);
  assignPotResolver = null;
  pendingQr = null;
}

// Called when user clicks "Create new pot" in AssignPotModal
export function resolveAssignPotCreate() {
  console.log("Resolving assign pot with 'create'");
  assignPotResolver?.("create");
  assignPotResolver = null;
  pendingQr = null;
}


/// plant form
let plantFormResolver: ((data: any) => void) | null = null;
let pendingPotId: string | null = null;
let plantListeners: ((potId: string) => void)[] = [];

/**
 * Called by actionController to start a new plant flow.
 * Notifies subscribers (PlantProfilePage) to open PlantFormModal.
 */
export function createPlantFormPromise(potId: string): Promise<any> {
  console.log("Creating plant form promise for pot", potId);
  pendingPotId = potId;
  plantListeners.forEach(fn => fn(potId)); // notify UI
  return new Promise((resolve) => {
    console.log("Setting plant form resolver");
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
  }
}

/**
 * Subscribe to pending plant requests.
 * Returns an unsubscribe function.
 */
export function subscribePendingPlant(fn: (potId: string) => void) {
  plantListeners.push(fn);
  return () => {
    plantListeners = plantListeners.filter(l => l !== fn);
  };
}
