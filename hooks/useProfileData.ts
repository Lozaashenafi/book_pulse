"use client";

import { useState, useEffect } from "react";
import { getUserBadges } from "@/services/badge.service";
import {
  getActiveCircles,
  getCurrentReads,
  getStats,
} from "@/services/profile.service";

export function useProfileData(userId: string | undefined) {
  const [data, setData] = useState({
    stats: { booksRead: 0, circles: 0, discussions: 0 },
    currentReads: [] as any[],
    activeCircles: [] as any[],
    badges: [] as any[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch all data in parallel for speed
        const [stats, currentReads, activeCircles, badges] = await Promise.all([
          getStats(userId),
          getCurrentReads(userId),
          getActiveCircles(userId),
          getUserBadges(userId),
        ]);
        // console.log(currentReads)

        setData({ stats, currentReads, activeCircles, badges });
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return { ...data, isLoading };
}