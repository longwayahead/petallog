// src/utils/date.ts
import { formatDistanceToNow } from "date-fns";

export function fuzzyDate(dateString: string): string {
  const d = new Date(dateString);
  return formatDistanceToNow(new Date(d.getTime() - 1000), { addSuffix: true });
}
