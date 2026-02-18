// src/hooks/useProfileData.ts
import { useState, useEffect } from "react";
import { profileService } from "@/services/profile.service";

export function useProfileData(userId: string | undefined) {
  const [data, setData] = useState({
    stats: { booksRead: 0, circles: 0, discussions: 0 },
    currentReads: [] as any[],
    activeCircles: [] as any[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If no user yet, stay in loading state or handle accordingly
    if (!userId) {
      setIsLoading(true);
      return;
    }

    const fetchData = async () => {
      try {
        console.log("Fetching data for user:", userId);
        const [stats, currentReads, activeCircles] = await Promise.all([
          profileService.getStats(userId),
          profileService.getCurrentReads(userId),
          profileService.getActiveCircles(userId),
        ]);

        setData({ stats, currentReads, activeCircles });
      } catch (err) {
        console.error("Hook Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return { ...data, isLoading };
}
