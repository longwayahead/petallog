export type InteractionType =
  | 'water'|'mist'|'feed'|'repot'|'prune'|'propagate'
  | 'dust'|'bathe'|'relocate'|'note'|'photo'|'kill';


export interface Plant {
  id: string;
  plantId: string;
  species: string;
  plantName: string;
  acquiredAt: string;
  acquiredFrom: string;
  plantNotes: string;
  potId: string;
  potName: string;
  potLocation: string;
  plantPhoto: string;

}

export interface Task {
  taskID: string;
  plantId: string;
  plantName: string;
  potCode: string;
  photo: string;
  due: string; // ISO date
  dueDate: string;
  effect: string; // lowercase effect name, e.g. "watering"
  effectName: string;
  status: "pending" | "done" | "snoozed";
  statusName?: string; 
  statusId: number; // 1 = overdue, 2 = due today, 3 = snoozed
  completedAt?: string; // ISO timestamp
}

export type Interaction = {
  id: string;
  type: string;
  title: string;
  badgeBg: string;
  badgeIcon: string;
  badgeColor: string;
  note?: string;
  when: string; 
  photos: Photo[];
};

export type ApiInteraction = {
  interactionID: number;
  plantID: number,
  actionID: number;
  actionName: string;
  actionNamePast: string;
  actionIcon: string;
  actionColour: string;
  actionBackground: string;
  interactionNote: string | null;
  createdAt: string;
  photos: Photo[];
}

export interface InteractionCardProps {
  data: Interaction;
  editing: boolean;
  onLongPress: () => void;
  onUpdateNote: (text: string) => void;
  inputRef: (el: HTMLTextAreaElement | null) => void;
  onDelete: () => void;
  onAddPhoto: (id: string) => void;
  onCardClick: () => void;
  onDoneEditing?: () => void;
  onSelectPhoto: (p: Photo) => void;
}

export interface Preference {
  plantsEffectsID: number;     // row in plants_effects
  effectID: number;            // the care "category" (watering, feeding, etc.)
  effectName: string;

  // presentation (pulled from one linked action)
  actionName: string;          // e.g. "Water"
  namePast: string;            // e.g. "Watered"
  actionDescription: string | null;
  actionIcon: string;
  actionColour: string;
  actionBackground: string;

  frequencyDays: number;       // from plants_effects
}


export interface Action {
  actionID: number;
  actionName: string;
  actionNamePast: string;
  actionDescription: string | null;
  actionFlow: 'note' | 'repo' | 'prop' | 'relo';
  actionBackground: string;
  actionIcon: string;
  actionColour: string;
  actionSort: number;
  refreshTasks: boolean;
}

export interface Photo {
  id: string;
  url: string;
  created_at: string;
  interaction_id: string;
  pending?: boolean;
}

export interface GalleryGridProps {
  plantId: string;
  onSelect: (p: Photo) => void
  refreshKey: number;
}


export type ValidateQRCodeResult = {
  message: string;
  valid: boolean;
  potId: number | null;
  plantId: number | null;
};

export interface ActionsApi {
  validateQRCode: (code: string) => Promise<ValidateQRCodeResult>;
  createPot: (data: CreatePot) => Promise<string>;
  createPlantPot: (plantId: string, potId: string) => Promise<void>;
  createPropagation: (
    parentId: string,
    newPotId: string
  ) => Promise<{ childId: string }>;
  apiAssignQRCodeToPot: (qrCode: string, potId: string) => Promise<void>;
  apiFreePot: (potId: string) => Promise<void>;
}

export interface CreatePot {
  location: string | null;
  diameter_cm: number | null;
  height_cm: number | null;
  friendly_name: string;
  acquired_at: string;
  acquired_from: string | null;
  qrCode: string;
}

export interface createPlantPot {
  (plantId: string, potId: string): Promise<void>;
}

export interface freePot {
  (potId: string): Promise<void>;
}