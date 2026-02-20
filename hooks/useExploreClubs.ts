import { useState, useEffect } from "react";
import { clubService } from "@/services/club.service";

export function useExploreClubs() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await clubService.getExploreClubs();
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
