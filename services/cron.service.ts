"use server";

import { db } from "@/lib/db";
import { profiles, notifications, readingProgress } from "@/lib/db/schema";
import { eq, and, lt, isNull, or, sql } from "drizzle-orm";
import { Resend } from "resend";
import { nudgeEmailTemplate } from "@/lib/emails/NudgeEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function processInactivityNudges() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  try {
    const inactiveUsers = await db
      .select({
        id: profiles.id,
        name: profiles.name,
        email: profiles.email,
      })
      .from(profiles)
      .where(
        and(
          lt(profiles.updatedAt, threeDaysAgo),
          or(
            isNull(profiles.lastReminderAt),
            lt(profiles.lastReminderAt, threeDaysAgo),
          ),
        ),
      );

    for (const user of inactiveUsers) {
      if (!user.email || !user.name) continue;

      // 2. Insert System Notification
      await db.insert(notifications).values({
        userId: user.id,
        type: "READING_REMINDER",
        title: "The Archives are Waiting",
        message:
          "It's been 3 days since your last update. Don't let your fellow readers fall behind!",
      });

      // 3. Send Professional Email
      await resend.emails.send({
        from: "Postmaster <auth@noreply.lozi.me>",
        to: user.email,
        subject: "A note from the BookPulse Archives",
        html: nudgeEmailTemplate(user.name),
      });

      // 4. Update reminder timestamp to prevent spamming
      await db
        .update(profiles)
        .set({ lastReminderAt: new Date() })
        .where(eq(profiles.id, user.id));

      console.log(`Nudge sent to: ${user.email}`);
    }

    return { processed: inactiveUsers.length };
  } catch (error) {
    console.error("Cron Error:", error);
    return { error: "Nudge processing failed" };
  }
}
