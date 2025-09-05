import { formatDistanceToNow } from "date-fns";

export function fuzzyDate(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}
