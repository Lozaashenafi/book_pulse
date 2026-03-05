"use server";

import { db } from "@/lib/db";
import {
  chatRooms,
  chatMessages,
  chapters,
  readingProgress,
  profiles,
  clubs,
} from "@/lib/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";

/**
 * Fetch all rooms for a club and calculate which ones are locked based on progress
 */

export async function getClubRooms(clubId: string, userId: string) {
  try {
    const rooms = await db.query.chatRooms.findMany({
      where: eq(chatRooms.clubId, clubId),
      with: {
        chapter: true, // Now Drizzle knows this exists
      },
    });

    const progress = await db.query.readingProgress.findFirst({
      where: and(
        eq(readingProgress.clubId, clubId),
        eq(readingProgress.userId, userId),
      ),
      orderBy: [desc(readingProgress.updatedAt)],
    });

    const userPage = progress?.currentPage || 0;

    return rooms.map((room) => {
      // Logic: Only CHAPTER types check for locks
      // We check if room.chapter exists before accessing startPage
      const isLocked =
        room.type === "CHAPTER" && room.chapter
          ? userPage < room.chapter.startPage
          : false;

      return {
        id: room.id,
        type: room.type,
        title: room.title,
        isLocked: isLocked,
      };
    });
  } catch (error) {
    console.error("Fetch Rooms Error:", error);
    return [];
  }
}
/**
 * Fetch messages for a specific room
 */
export async function getRoomMessages(roomId: string) {
  try {
    const data = await db
      .select({
        id: chatMessages.id,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
        userId: chatMessages.userId,
        userName: profiles.name,
        userImage: profiles.image,
      })
      .from(chatMessages)
      .innerJoin(profiles, eq(chatMessages.userId, profiles.id))
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(asc(chatMessages.createdAt));

    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error("Fetch Messages Error:", error);
    return [];
  }
}

/**
 * Send a message
 */
export async function sendRoomMessage(
  userId: string,
  roomId: string,
  content: string,
) {
  try {
    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        userId,
        roomId,
        content,
      })
      .returning();

    return JSON.parse(JSON.stringify(newMessage));
  } catch (error) {
    console.error("Send Message Error:", error);
    throw new Error("Failed to send message");
  }
}
export async function updateUserProgress(
  userId: string,
  clubId: string,
  pageNumber: number,
) {
  try {
    // 1. Find which chapter this page belongs to
    const allChapters = await db
      .select()
      .from(chapters)
      .where(eq(chapters.clubId, clubId));
    const currentChapter =
      allChapters.find(
        (ch) => pageNumber >= ch.startPage && pageNumber <= ch.endPage,
      ) || allChapters[0];

    // 2. Update or Insert progress
    // We use a manual check because Neon HTTP doesn't do 'onConflictUpdate' easily in some versions
    const existing = await db.query.readingProgress.findFirst({
      where: and(
        eq(readingProgress.userId, userId),
        eq(readingProgress.clubId, clubId),
      ),
    });

    if (existing) {
      await db
        .update(readingProgress)
        .set({
          currentPage: pageNumber,
          chapterId: currentChapter.id,
          updatedAt: new Date(),
        })
        .where(eq(readingProgress.id, existing.id));
    } else {
      await db.insert(readingProgress).values({
        userId,
        clubId,
        chapterId: currentChapter.id,
        currentPage: pageNumber,
        status: "IN_PROGRESS",
      });
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to log progress");
  }
}

/**
 * Gets the latest message ID/Timestamp for each room to check for unread status
 */
export async function getRoomLastMessages(clubId: string) {
  const rooms = await db
    .select({ id: chatRooms.id })
    .from(chatRooms)
    .where(eq(chatRooms.clubId, clubId));

  const results = await Promise.all(
    rooms.map(async (room) => {
      const lastMsg = await db
        .select({ createdAt: chatMessages.createdAt })
        .from(chatMessages)
        .where(eq(chatMessages.roomId, room.id))
        .orderBy(desc(chatMessages.createdAt))
        .limit(1);
      return { roomId: room.id, lastTimestamp: lastMsg[0]?.createdAt || null };
    }),
  );

  return JSON.parse(JSON.stringify(results));
}
export async function getUserClubProgress(userId: string, clubId: string) {
  const res = await db.query.readingProgress.findFirst({
    where: and(
      eq(readingProgress.userId, userId),
      eq(readingProgress.clubId, clubId),
    ),
  });
  return res?.currentPage || 0;
}

/**
 * Deletes a message (Security: ensures only the author can delete)
 */
export async function deleteRoomMessage(userId: string, messageId: string) {
  try {
    await db
      .delete(chatMessages)
      .where(
        and(eq(chatMessages.id, messageId), eq(chatMessages.userId, userId)),
      );
    return { success: true };
  } catch (error) {
    throw new Error("Unauthorized or message not found");
  }
}

/**
 * Edits a message (Security: ensures only the author can edit)
 */
export async function editRoomMessage(
  userId: string,
  messageId: string,
  newContent: string,
) {
  try {
    await db
      .update(chatMessages)
      .set({ content: newContent })
      .where(
        and(eq(chatMessages.id, messageId), eq(chatMessages.userId, userId)),
      );
    return { success: true };
  } catch (error) {
    throw new Error("Unauthorized or message not found");
  }
}
export async function getClubPdfUrl(clubId: string) {
  try {
    const data = await db.query.clubs.findFirst({
      where: eq(clubs.id, clubId),
      with: {
        book: true, // This uses the 'book' relation we defined in schema.ts
      },
    });

    // Check if the book exists and has a pdfUrl
    return data?.book?.pdfUrl || null;
  } catch (error) {
    console.error("Error fetching PDF URL:", error);
    return null;
  }
}
