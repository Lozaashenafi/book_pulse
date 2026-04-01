"use server";

import { db } from "@/lib/db";
import { badges, userBadges, readingProgress, chatMessages, notifications } from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
export async function checkFounderBadge(userId: string) {
  try {
    const badge = await db.query.badges.findFirst({
      where: eq(badges.name, "CEO of Circles")
    });

    if (badge) {
      await awardBadge(userId, badge.id, badge.name);
    }
  } catch (error) {
    console.error("Founder Badge Error:", error);
  }
}
export async function checkReadingStreak(userId: string) {
  try {
    // Check max streak in the last 25 days
    const activity: any = await db.execute(sql`
      SELECT count(DISTINCT DATE(updated_at)) as "days" 
      FROM ${readingProgress} 
      WHERE user_id = ${userId} 
      AND updated_at > NOW() - INTERVAL '25 days'
    `);

    const daysCount = Number(activity[0]?.days || 0);
    
    // Check milestones in descending order
    const milestones = [25, 10, 3];
    for (const m of milestones) {
      if (daysCount >= m) {
        const badge = await db.query.badges.findFirst({
          where: and(eq(badges.requirement, m), eq(badges.type, 'READING'))
        });
        if (badge) await awardBadge(userId, badge.id, badge.name);
      }
    }
  } catch (error) {
    console.error("Reading Streak Error:", error);
  }
}

export async function checkDiscussionStreak(userId: string) {
  try {
    const activity: any = await db.execute(sql`
      SELECT count(DISTINCT DATE(created_at)) as "days" 
      FROM ${chatMessages} 
      WHERE user_id = ${userId} 
      AND created_at > NOW() - INTERVAL '25 days'
    `);

    const daysCount = Number(activity[0]?.days || 0);

    const milestones = [25, 10, 3];
    for (const m of milestones) {
      if (daysCount >= m) {
        const badge = await db.query.badges.findFirst({
          where: and(eq(badges.requirement, m), eq(badges.type, 'DISCUSSION'))
        });
        if (badge) await awardBadge(userId, badge.id, badge.name);
      }
    }
  } catch (error) {
    console.error("Discussion Streak Error:", error);
  }
}

async function awardBadge(userId: string, badgeId: string, badgeName: string) {
  try {
    // Attempt to insert (unique constraint prevents duplicates)
    await db.insert(userBadges).values({ userId, badgeId });

    // Send a system notification
    await db.insert(notifications).values({
      userId,
      type: "ANNOUNCEMENT",
      title: "New Seal Unlocked!",
      message: `Congratulations! You've earned the "${badgeName}" Recognition Seal for your consistency.`,
    });
  } catch (e) {
    // If they already have the badge, Drizzle throws error 23505, which we ignore
  }
}

export async function getUserBadges(userId: string) {
  return await db
    .select({
      id: badges.id,
      name: badges.name,
      desc: badges.description,
      icon: badges.icon,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId));
}