// src/hooks/useClubSettings.ts
import { useState, useEffect, useCallback } from "react";
import { clubService } from "@/services/club.service";

export const useClubSettings = (clubId: string, userId?: string) => {
  const [data, setData] = useState<any>({
    club: null,
    members: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!userId || !clubId) return;
    try {
      setLoading(true);
      const [clubRes, catRes] = await Promise.all([
        clubService.getClubFullData(clubId),
        clubService.getCategories(),
      ]);

      setData({
        club: clubRes,
        members: clubRes.club_members || [],
        categories: catRes || [],
      });
    } catch (err) {
      console.error("Hook Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [clubId, userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, setData, loading, saving, setSaving, refresh: fetchAll };
};
