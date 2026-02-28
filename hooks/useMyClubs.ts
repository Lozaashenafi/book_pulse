import { getMyClubs } from "@/services/profile.service";
import { useState, useEffect } from "react";

export function useMyClubs(userId: string | undefined) {
  const [clubs, setClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchClubs = async () => {
      try {
        setIsLoading(true);
        const data = await getMyClubs(userId);
        setClubs(data);
      } catch (err) {
        console.error("Error fetching my clubs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubs();
  }, [userId]);

  return { clubs, isLoading };
}
