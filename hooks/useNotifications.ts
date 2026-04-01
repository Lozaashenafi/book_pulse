"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUserNotifications,
  markAllAsRead,
} from "@/services/notification.service";
import { toast } from "sonner";

export function useNotifications(userId?: string) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const res = await getUserNotifications(userId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const clearUnread = async () => {
    if (!userId) return;
    // Optimistic Update
    const previousData = [...data];
    setData(data.map((n) => ({ ...n, isRead: true })));

    try {
      await markAllAsRead(userId);
    } catch (err) {
      setData(previousData);
      toast.error("Failed to clear notifications");
    }
  };


  return {
    notifications: data,
    isLoading,
    clearUnread,
    
    refresh: fetchNotifications,
  };
}
