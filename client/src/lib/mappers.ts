  
  
  import { fuzzyDate } from "./date.ts";
  import type { ApiInteraction } from "../types.ts";
  import type { Interaction } from "../types.ts";
  
  export
  function mapApiToInteraction(api: ApiInteraction): Interaction {
    return {
      id: String(api.interactionID),
      type: api.actionName,
      title: api.actionNamePast,
      badgeBg: api.actionBackground,
      badgeIcon: api.actionIcon,
      badgeColor: api.actionColour,
      note: api.interactionNote ?? "",
      when: fuzzyDate(api.createdAt), // or relative time
      photos: [], // unless you support them from API
    };
  }