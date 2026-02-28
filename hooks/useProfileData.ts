"use client";

import {
  getActiveCircles,
  getCurrentReads,
  getStats,
} from "@/services/profile.service";
import { useState, useEffect } from "react";
// Import the server-side service

export function useProfileData(userId: string | undefined) {
  const [data, setData] = useState({
    stats: { booksRead: 0, circles: 0, discussions: 0 },
    currentReads: [] as any[],
    activeCircles: [] as any[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // These calls now act as secure requests to the server
        const [stats, currentReads, activeCircles] = await Promise.all([
          getStats(userId),
          getCurrentReads(userId),
          getActiveCircles(userId),
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
