"use server";

import { db } from "@/lib/db";
import { bookSchedules, notifications, profiles } from "@/lib/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function deleteBookSchedule(userId: string, scheduleId: string) {
  try {
    await db
      .delete(bookSchedules)
      .where(and(eq(bookSchedules.id, scheduleId), eq(bookSchedules.userId, userId)));
    return { success: true };
  } catch (error) {
    throw new Error("Failed to remove from registry.");
  }
}

export async function updateBookSchedule(userId: string, scheduleId: string, data: any) {
  try {
    await db
      .update(bookSchedules)
      .set({
        title: data.title,
        author: data.author,
        notes: data.notes,
        coverUrl: data.coverUrl,
        scheduledDate: new Date(data.scheduledDate),
        // Reset notification status so they get a new alert on the new date
        isNotified: false, 
      })
      .where(and(eq(bookSchedules.id, scheduleId), eq(bookSchedules.userId, userId)));
    return { success: true };
  } catch (error) {
    throw new Error("Failed to update the archives.");
  }
}
export async function createBookSchedule(userId: string, data: any) {
  await db.insert(bookSchedules).values({
    userId,
    title: data.title,
    author: data.author,
    coverUrl: data.coverUrl,
    notes: data.notes,
    scheduledDate: new Date(data.scheduledDate),
  });
  return { success: true };
}

export async function getUserSchedules(userId: string) {
  return await db.query.bookSchedules.findMany({
    where: eq(bookSchedules.userId, userId),
    orderBy: [asc(bookSchedules.scheduledDate)],
  });
}

/**
 * CRON JOB LOGIC: To be added to your nudge cron
 * Checks for books scheduled for today
 */
export async function processBookReminders() {
  const today = new Date().toISOString().split('T')[0];
  
  // Find schedules for today that haven't been notified
  const pending = await db
    .select({
      id: bookSchedules.id,
      title: bookSchedules.title,
      userId: bookSchedules.userId,
      userEmail: profiles.email,
      userName: profiles.name,
    })
    .from(bookSchedules)
    .innerJoin(profiles, eq(bookSchedules.userId, profiles.id))
    .where(
      and(
        eq(sql`DATE(${bookSchedules.scheduledDate})`, today),
        eq(bookSchedules.isNotified, false)
      )
    );

  for (const item of pending) {
    // 1. System Notification
    await db.insert(notifications).values({
      userId: item.userId,
      type: "READING_REMINDER",
      title: "Time to Start Reading",
      message: `Today is the day! Open the covers of "${item.title}".`,
    });

    // 2. Email Dispatch
    if (item.userEmail) {
      await resend.emails.send({
        from: "BookPulse <auth@noreply.lozi.me>",
        to: item.userEmail,
        subject: `Registry Alert: It's time for "${item.title}"`,
        html: `<p>Greetings ${item.userName}, your scheduled reading date for <b>${item.title}</b> has arrived!</p>`
      });
    }

    // 3. Mark as Done
    await db.update(bookSchedules).set({ isNotified: true }).where(eq(bookSchedules.id, item.id));
  }
}