"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUserNotifications,
  markAllAsRead,
  deleteNotificationRecord,
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

  const removeNotification = async (id: string) => {
    if (!userId) return;
    // Optimistic Update
    setData(data.filter((n) => n.id !== id));

    try {
      await deleteNotificationRecord(id, userId);
    } catch (err) {
      fetchNotifications(); // Rollback if failed
      toast.error("Failed to delete notification");
    }
  };

  return {
    notifications: data,
    isLoading,
    clearUnread,
    removeNotification,
    refresh: fetchNotifications,
  };
}
