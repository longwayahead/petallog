// src/utils/date.ts
import { formatDistanceToNow } from "date-fns";

export function fuzzyDate(dateString: string): string {
  const d = new Date(dateString);
  // console.log("fuzzyDate input:", dateString, "parsed:", d);
  return formatDistanceToNow(new Date(d.getTime() - 5000), { addSuffix: true });
}

export function formatDueDate(dueDate: string): string {
   const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to midnight
  const date = new Date(dueDate);
  date.setHours(0, 0, 0, 0);

  const diffMs = date.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === -1) return "yesterday";
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === 1) return "tomorrow";
  return `in ${diffDays} days`;
}