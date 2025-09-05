import { useEffect, useState } from "react";
import type { Plant } from "../../../types";

export function usePlant(plantId: string | undefined) {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!plantId) return;
    let isMounted = true;

    (async () => {
      try {
        const res = await fetch(`/api/plants/${plantId}`);
        if (!res.ok) throw new Error("Failed to fetch plant");
        const data = await res.json();
        if (isMounted) setPlant(data);
      } catch (err) {
        if (isMounted) setError("Failed to load plant");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false };
  }, [plantId]);

  return { plant, loading, error };
}