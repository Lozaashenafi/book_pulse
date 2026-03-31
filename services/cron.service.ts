"use server";

import { db } from "@/lib/db";
import { profiles, notifications, readingProgress, chatMessages } from "@/lib/db/schema";
import { eq, and, isNull, or, notExists, sql } from "drizzle-orm";
import { Resend } from "resend";
import { nudgeEmailTemplate } from "@/lib/emails/NudgeEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function processInactivityNudges() {
  // 1. Create the date and convert it to an ISO String immediately
  // This is the CRITICAL fix for the 'ERR_INVALID_ARG_TYPE' error
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 3);
  const cutoffStr = cutoffDate.toISOString(); 

  console.log("🕒 Starting Inactivity Check for cutoff:", cutoffStr);

  try {
    // 2. Find inactive users
    // We use sql`${column} < ${string}::timestamp` to force the driver to send a string
    const inactiveUsers = await db
      .select({
        id: profiles.id,
        name: profiles.name,
        email: profiles.email,
      })
      .from(profiles)
      .where(
        and(
          // Condition A: Haven't been reminded in 3 days
          or(
            isNull(profiles.lastReminderAt),
            sql`${profiles.lastReminderAt} < ${cutoffStr}::timestamp`
          ),
          // Condition B: No reading progress updates in 3 days
          notExists(
            db.select()
              .from(readingProgress)
              .where(
                and(
                  eq(readingProgress.userId, profiles.id),
                  sql`${readingProgress.updatedAt} > ${cutoffStr}::timestamp`
                )
              )
          ),
          // Condition C: No chat messages sent in 3 days
          notExists(
            db.select()
              .from(chatMessages)
              .where(
                and(
                  eq(chatMessages.userId, profiles.id),
                  sql`${chatMessages.createdAt} > ${cutoffStr}::timestamp`
                )
              )
          )
        )
      );

    console.log(`📑 Found ${inactiveUsers.length} inactive curators.`);

    for (const user of inactiveUsers) {
      if (!user.email || !user.name) continue;

      try {
        // 3. Dispatch Email
        await resend.emails.send({
          from: "BookPulse <auth@noreply.lozi.me>", 
          to: user.email,
          subject: `Psst... ${user.name.split(' ')[0]}, your book misses you!`,
          html: nudgeEmailTemplate(user.name),
        });

        // 4. Send System Notification
        await db.insert(notifications).values({
          userId: user.id,
          type: "READING_REMINDER",
          title: "The archives are quiet...",
          message: "It's been 3 days since your last update. The fellowship misses you!",
        });

        // 5. Update timestamp (Standard .set() handles Dates fine, it's just the .where() that crashes)
        await db.update(profiles)
          .set({ lastReminderAt: new Date() })
          .where(eq(profiles.id, user.id));

        console.log(`✅ Nudge sent to: ${user.email}`);
      } catch (emailErr: any) {
        console.error(`❌ Email failed for ${user.email}:`, emailErr.message);
      }
    }

    return { processed: inactiveUsers.length };
  } catch (error: any) {
    console.error("🔥 CRITICAL Cron Error:", error);
    return { error: error.message || "Nudge processing failed" };
  }
}