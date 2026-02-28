import { getExploreClubs } from "@/services/club.service";
import { useState, useEffect } from "react";

export function useExploreClubs() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await getExploreClubs();
        setClubs(data);
      } catch (err) {
        console.error("Explore fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClubs();
  }, []);

  return { clubs, isLoading };
}
