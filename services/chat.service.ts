"use server";

import { db } from "@/lib/db";
import {
  chatRooms,
  chatMessages,
  chapters,
  readingProgress,
  profiles,
  clubs,
  clubMembers,
  books,
  notifications,
} from "@/lib/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { cacheService } from "./cache.service";

// Add this at the top of your existing service file
export async function getClubRoomsWithCache(clubId: string, userId: string) {
  // Check cache first
  const cachedRooms = cacheService.getRooms(clubId);
  if (cachedRooms) {
    // Still need to check locks with current progress
    const progress = await getUserClubProgress(userId, clubId);
    return cachedRooms.map(room => ({
      ...room,
      isLocked: room.type === "CHAPTER" && room.chapter
        ? progress < (room.chapter?.startPage || 0)
        : false
    }));
  }

  // Fetch fresh data
  const rooms = await getClubRooms(clubId, userId);
  cacheService.setRooms(clubId, rooms);
  return rooms;
}

export async function getRoomMessagesWithCache(roomId: string) {
  // Check cache first
  const cachedMessages = cacheService.getMessages(roomId);
  if (cachedMessages) {
    return cachedMessages;
  }

  // Fetch fresh data
  const messages = await getRoomMessages(roomId);
  cacheService.setMessages(roomId, messages);
  return messages;
}

export async function getUserProgressWithCache(userId: string, clubId: string) {
  // Check cache first
  const cachedProgress = cacheService.getProgress(userId, clubId);
  if (cachedProgress !== null) {
    return cachedProgress;
  }

  // Fetch fresh data
  const progress = await getUserClubProgress(userId, clubId);
  cacheService.setProgress(userId, clubId, progress);
  return progress;
}

// Update the progress function to invalidate cache
export async function updateUserProgressWithCache(
  userId: string,
  clubId: string,
  pageNumber: number,
) {
  // Call the original function
  const result = await updateUserProgress(userId, clubId, pageNumber);
  
  if (result.success) {
    // Invalidate cache for this user and club
    cacheService.clearProgress(userId, clubId);
    
    // Also invalidate rooms cache as lock status might change
    cacheService.clearRooms(clubId);
  }
  
  return result;
}
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
  // 1. Safety check for NaN
  if (!pageNumber || isNaN(pageNumber)) throw new Error("Invalid page number.");

  try {
    // 2. Find which chapter this page belongs to
    const allChapters = await db
      .select()
      .from(chapters)
      .where(eq(chapters.clubId, clubId));
    const currentChapter = allChapters.find(
      (ch) => pageNumber >= ch.startPage && pageNumber <= ch.endPage,
    );

    if (!currentChapter)
      throw new Error("Page number is outside of club milestones.");

    // 3. Check if progress already exists for THIS SPECIFIC CHAPTER
    const existing = await db.query.readingProgress.findFirst({
      where: and(
        eq(readingProgress.userId, userId),
        eq(readingProgress.chapterId, currentChapter.id),
      ),
    });

    if (existing) {
      // Update existing chapter progress
      await db
        .update(readingProgress)
        .set({
          currentPage: pageNumber,
          status:
            pageNumber === currentChapter.endPage ? "COMPLETED" : "IN_PROGRESS",
          updatedAt: new Date(),
        })
        .where(eq(readingProgress.id, existing.id));
    } else {
      // Insert new progress for this chapter
      await db.insert(readingProgress).values({
        userId,
        clubId,
        chapterId: currentChapter.id,
        currentPage: pageNumber,
        status: "IN_PROGRESS",
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Sync Error:", error.message);
    throw new Error(error.message || "Failed to log progress");
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

export async function getPublicProfileData(userId: string) {
  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    });

    const userClubs = await db
      .select({
        id: clubs.id,
        name: clubs.name,
        role: clubMembers.role,
        bookTitle: books.title,
      })
      .from(clubMembers)
      .innerJoin(clubs, eq(clubMembers.clubId, clubs.id))
      .innerJoin(books, eq(clubs.bookId, books.id))
      .where(eq(clubMembers.userId, userId));

    return JSON.parse(
      JSON.stringify({
        ...profile,
        ownedClubs: userClubs.filter((c) => c.role === "OWNER"),
        joinedClubs: userClubs.filter((c) => c.role === "MEMBER"),
      }),
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Enhanced Leave: Notifies Owner
 */
export async function leaveClubRecord(clubId: string, userId: string) {
  try {
    // 1. Check if the user exists in the club and what their role is
    const member = await db.query.clubMembers.findFirst({
      where: and(
        eq(clubMembers.clubId, clubId),
        eq(clubMembers.userId, userId)
      ),
    });

    if (!member) {
      return { success: false, error: "You are not a member of this circle." };
    }

    // 2. Prevent the Owner from leaving (they should delete the club instead)
    if (member.role === "OWNER") {
      return { 
        success: false, 
        error: "As the Architect (Owner), you cannot leave. You must delete the archive instead." 
      };
    }

    // 3. Remove the record from clubMembers
    await db
      .delete(clubMembers)
      .where(
        and(
          eq(clubMembers.clubId, clubId),
          eq(clubMembers.userId, userId)
        )
      );

    // 4. (Optional) Remove reading progress for this specific club to save space
    await db
      .delete(readingProgress)
      .where(
        and(
          eq(readingProgress.clubId, clubId),
          eq(readingProgress.userId, userId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Drizzle Leave Error:", error);
    return { success: false, error: "Failed to exit the fellowship." };
  }
}
export async function getClubMembers(clubId: string) {
  try {
    const data = await db
      .select({
        id: profiles.id,
        name: profiles.name,
        image: profiles.image,
        username: profiles.username, // <--- CRITICAL: Add this line
        role: clubMembers.role,
        bio: profiles.bio,
        location: profiles.location,
      })
      .from(clubMembers)
      .innerJoin(profiles, eq(clubMembers.userId, profiles.id))
      .where(eq(clubMembers.clubId, clubId));

    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
}
