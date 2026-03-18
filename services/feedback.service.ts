"use server";

import { db } from "@/lib/db";
import { feedbacks, profiles } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

/**
 * Public: Submit anonymous feedback
 */
export async function submitFeedbackAction(content: string, category: string) {
  try {
    await db.insert(feedbacks).values({
      content,
      category,
    });
    return { success: true };
  } catch (error) {
    throw new Error("Failed to send dispatch to the archives.");
  }
}

/**
 * Admin Only: Fetch all feedback
 */
export async function getFeedbacksAdmin(adminId: string) {
  const user = await db.query.profiles.findFirst({
    where: eq(profiles.id, adminId),
  });

  if (user?.role !== "admin") throw new Error("Unauthorized");

  const data = await db
    .select()
    .from(feedbacks)
    .orderBy(desc(feedbacks.createdAt));
  return JSON.parse(JSON.stringify(data));
}

export async function deleteFeedbackAction(
  adminId: string,
  feedbackId: string,
) {
  const user = await db.query.profiles.findFirst({
    where: eq(profiles.id, adminId),
  });

  if (user?.role !== "admin") throw new Error("Unauthorized Access");

  try {
    await db.delete(feedbacks).where(eq(feedbacks.id, feedbackId));
    return { success: true };
  } catch (error) {
    throw new Error("Failed to delete record from archives.");
  }
}
