// src/utils/date.ts
import { formatDistanceToNow } from "date-fns";

export function fuzzyDate(dateString: string): string {
  const d = new Date(dateString);
  // console.log("fuzzyDate input:", dateString, "parsed:", d);
  return formatDistanceToNow(new Date(d.getTime() - 5000), { addSuffix: true });
}
