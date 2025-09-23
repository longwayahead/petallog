// src/utils/date.ts
import { formatDistanceToNow } from "date-fns";
import { TZDate } from "@date-fns/tz";

export function fuzzyDate(dateString: string): string {
  // Create a TZDate in Dublin time
  const d = new TZDate(dateString, "Europe/Dublin");
  // possibly adjust a little buffer if needed (-5000 ms)
  const d2 = new Date(d.getTime() - 5000);
  return formatDistanceToNow(d2, { addSuffix: true });
}

export function formatDueDate(dueDateString: string): string {
  // Make sure to treat dueDate in Dublin time
  const today = new TZDate(new Date(), "Europe/Dublin");
  // Normalize both to midnight Dublin time
  today.setHours(0, 0, 0, 0);

  const date = new TZDate(dueDateString, "Europe/Dublin");
  date.setHours(0, 0, 0, 0);

  const diffMs = date.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === -1) return "yesterday";
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === 1) return "tomorrow";
  return `in ${diffDays} days`;
}
