"use server";

import { db } from "@/lib/db";
import { profiles, notifications, readingProgress, chatMessages } from "@/lib/db/schema";
import { eq, and, lt, isNull, or, sql, notExists } from "drizzle-orm";
import { Resend } from "resend";
import { nudgeEmailTemplate } from "@/lib/emails/NudgeEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function processInactivityNudges() {
  // 1. CHANGE: Increased timeframe to 5 days
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 5);
  const cutoffStr = cutoffDate.toISOString(); 

  console.log("🕒 Starting Inactivity Check (5-Day Window)...");

  try {
    const inactiveUsers = await db
      .select({
        id: profiles.id,
        name: profiles.name,
        email: profiles.email,
        emailNotifications: profiles.emailNotifications, // Pull preference
      })
      .from(profiles)
      .where(
        and(
          // 2. CHECK PREFERENCE: User must have notifications ENABLED
          eq(profiles.emailNotifications, true),
          
          or(
            isNull(profiles.lastReminderAt),
            sql`${profiles.lastReminderAt} < ${cutoffStr}::timestamp`
          ),
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

    console.log(`📑 Found ${inactiveUsers.length} curators who permit dispatches.`);

    for (const user of inactiveUsers) {
      if (!user.email || !user.name) continue;

      try {
        // 3. Dispatch Email with Anti-Spam Headers
        await resend.emails.send({
          from: "BookPulse <auth@noreply.lozi.me>", 
          to: user.email,
          subject: `Psst... ${user.name.split(' ')[0]}, your book is waiting!`,
          html: nudgeEmailTemplate(user.name),
          // ANTI-SPAM: Adding a List-Unsubscribe header tells Gmail this is a clean app
          headers: {
            "List-Unsubscribe": `<${process.env.NEXT_PUBLIC_SITE_URL}/settings>`,
          }
        });

        // 4. System Notification (Internal)
        await db.insert(notifications).values({
          userId: user.id,
          type: "READING_REMINDER",
          title: "Dusting off the covers...",
          message: "It's been 5 days since your last archive update. See what's new in the circles!",
        });

        await db.update(profiles)
          .set({ lastReminderAt: new Date() })
          .where(eq(profiles.id, user.id));

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