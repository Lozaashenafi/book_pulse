"use server";

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Fetch all notifications for a specific user
 */
export async function getUserNotifications(userId: string) {
  try {
    const data = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

    return data;
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    return [];
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string) {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
      );
    return { success: true };
  } catch (error) {
    console.error("Mark Read Error:", error);
    throw new Error("Failed to clear unread notifications");
  }
}

/**
 * Delete a specific notification
 */
export async function deleteNotificationRecord(id: string, userId: string) {
  try {
    await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
    return { success: true };
  } catch (error) {
    console.error("Delete Notification Error:", error);
    throw new Error("Failed to delete record");
  }
}
