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
  // Get today's date in YYYY-MM-DD format based on server time
  const today = new Date().toISOString().split('T')[0];
  
  console.log(`📅 Starting Reading Reminders for: ${today}`);

  try {
    // 1. Query pending schedules joined with user profiles
    const pending = await db
      .select({
        id: bookSchedules.id,
        title: bookSchedules.title,
        userId: bookSchedules.userId,
        userEmail: profiles.email,
        userName: profiles.name,
        emailNotifications: profiles.emailNotifications, // Check preference
      })
      .from(bookSchedules)
      .innerJoin(profiles, eq(bookSchedules.userId, profiles.id))
      .where(
        and(
          // Match the date (ignoring time)
          eq(sql`DATE(${bookSchedules.scheduledDate})`, today),
          // Only if not already notified
          eq(bookSchedules.isNotified, false)
        )
      );

    console.log(`📖 Found ${pending.length} scheduled readings for today.`);

    for (const item of pending) {
      try {
        // 2. Internal System Notification
        await db.insert(notifications).values({
          userId: item.userId,
          type: "READING_REMINDER",
          title: "Time to Start Reading!",
          message: `Today is the day! Dust off the covers of "${item.title}" and enjoy.`,
        });

        // 3. Dispatch Email (only if user permits and has email)
        if (item.userEmail && item.emailNotifications) {
          const firstName = item.userName?.split(' ')[0] || "Reader";
          
          await resend.emails.send({
            from: "BookPulse <auth@noreply.lozi.me>",
            to: item.userEmail,
            subject: `Registry Alert: It's time for "${item.title}"`,
            html: `
              <div style="font-family: serif; line-height: 1.6; color: #1a3f22;">
                <h2>Greetings, ${firstName}</h2>
                <p>According to your personal archive, today is the scheduled date to begin reading:</p>
                <div style="padding: 20px; border-left: 4px solid #d4a373; background: #fdfaf3; font-style: italic; font-size: 18px;">
                  "${item.title}"
                </div>
                <p>Happy reading,<br/>The BookPulse Archive</p>
                <hr style="border: none; border-top: 1px dashed #ccc; margin: 20px 0;" />
                <p style="font-size: 11px; color: #888;">
                  You received this because you scheduled a reminder. 
                  Update your preferences in <a href="${process.env.NEXT_PUBLIC_SITE_URL}/settings">Settings</a>.
                </p>
              </div>
            `,
            headers: {
              "List-Unsubscribe": `<${process.env.NEXT_PUBLIC_SITE_URL}/settings>`,
            }
          });
        }

        // 4. Mark as Notified to prevent duplicate processing
        await db
          .update(bookSchedules)
          .set({ isNotified: true })
          .where(eq(bookSchedules.id, item.id));

      } catch (innerErr: any) {
        console.error(`❌ Failed to process item ${item.id}:`, innerErr.message);
      }
    }

    return { processed: pending.length };
  } catch (error: any) {
    console.error("🔥 CRITICAL Reminder Cron Error:", error);
    return { error: error.message || "Reminder processing failed" };
  }
}