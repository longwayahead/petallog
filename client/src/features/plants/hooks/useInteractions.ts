// src/hooks/useInteractions.ts
import { useState } from "react";
import type { ApiInteraction, Interaction, Action } from "../../../types";
import { mapApiToInteraction } from "../../../lib/mappers";

export function useInteractions(initial: Interaction[] = []) {
  const [items, setItems] = useState<Interaction[]>(initial);

  async function addTimelineCard(
    plantId: string,
    action: Action,
    extras: Partial<Interaction> = {}
  ) {
    // console.log("Adding timeline card", action, extras);
    const tempId =
      Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const now = new Date();
    const createdAt = new Date(now.getTime() - 5000);
    const newItem: Interaction = {
      id: tempId,
      type: action.actionName,
      title: action.actionNamePast,
      badgeBg: action.actionBackground,
      badgeIcon: action.actionIcon,
      badgeColor: action.actionColour,
      when: createdAt.toISOString(),
      photos: [],
      ...extras,
    };

    setItems((prev) => [newItem, ...prev]);

    try {
      const res = await fetch(
        `/api/interactions?plantId=${plantId}&actionId=${action.actionID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(extras),
        }
      );
      if (!res.ok) throw new Error("Failed to add interaction");

      const savedApi: ApiInteraction = await res.json();
      const saved = mapApiToInteraction(savedApi);
      setItems((prev) => prev.map((it) => (it.id === tempId ? saved : it)));
    } catch (err) {
      console.error("Failed to save interaction", err);
      setItems((prev) => prev.filter((it) => it.id !== tempId)); // rollback
    }
  }

  return { items, setItems, addTimelineCard, mapApiToInteraction };
}
