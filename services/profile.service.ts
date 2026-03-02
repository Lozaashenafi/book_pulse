"use server"; // Add this line

import { db } from "@/lib/db";
import {
  clubMembers,
  readingProgress,
  chatMessages,
  clubs,
  books,
  profiles,
} from "@/lib/db/schema";
import { eq, count, and } from "drizzle-orm";

export async function getStats(userId: string) {
  if (!userId) return { circles: 0, booksRead: 0, discussions: 0 };

  try {
    // We execute these individually to catch which one fails
    const membershipsResult = await db
      .select({ value: count() })
      .from(clubMembers)
      .where(eq(clubMembers.userId, userId))
      .catch((e) => {
        console.error("Stats count error:", e);
        return [{ value: 0 }];
      });

    const progressResult = await db
      .select({ value: count() })
      .from(readingProgress)
      .where(
        and(
          eq(readingProgress.userId, userId),
          eq(readingProgress.status, "COMPLETED"),
        ),
      )
      .catch((e) => {
        console.error("Progress count error:", e);
        return [{ value: 0 }];
      });

    return {
      circles: Number(membershipsResult[0]?.value) || 0,
      booksRead: Number(progressResult[0]?.value) || 0,
      discussions: 0,
    };
  } catch (error) {
    console.error("Global stats error:", error);
    return { circles: 0, booksRead: 0, discussions: 0 };
  }
}
export async function updateProfile(
  userId: string,
  data: { name: string; location: string; bio: string },
) {
  try {
    await db
      .update(profiles)
      .set({
        name: data.name,
        location: data.location,
        bio: data.bio,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId));
    return { success: true };
  } catch (error) {
    console.error("Neon Update Error:", error);
    throw new Error("Failed to update profile in database");
  }
}

export async function updateProfileImage(userId: string, imageUrl: string) {
  try {
    await db
      .update(profiles)
      .set({
        image: imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId));
    return { success: true };
  } catch (error) {
    console.error("Neon Image Update Error:", error);
    throw new Error("Failed to update image link in database");
  }
}
export async function getCurrentReads(userId: string) {
  if (!userId) return [];

  try {
    // We use a standard SQL join instead of the complex .findMany relational query
    const data = await db
      .select({
        currentPage: readingProgress.currentPage,
        status: readingProgress.status,
        clubName: clubs.name,
        bookTitle: books.title,
        bookAuthor: books.author,
        totalPages: books.totalPages,
      })
      .from(readingProgress)
      .innerJoin(clubs, eq(readingProgress.clubId, clubs.id))
      .innerJoin(books, eq(clubs.bookId, books.id))
      .where(
        and(
          eq(readingProgress.userId, userId),
          eq(readingProgress.status, "IN_PROGRESS"),
        ),
      )
      .limit(2);

    return data.map((item) => ({
      title: item.bookTitle || "Unknown",
      author: item.bookAuthor || "Unknown",
      progress: Math.min(
        100,
        Math.round(((item.currentPage || 0) / (item.totalPages || 100)) * 100),
      ),
    }));
  } catch (err) {
    console.error("Manual Join Error (CurrentReads):", err);
    return [];
  }
}

export async function getActiveCircles(userId: string) {
  if (!userId) return [];

  try {
    const data = await db
      .select({
        id: clubs.id,
        name: clubs.name,
      })
      .from(clubMembers)
      .innerJoin(clubs, eq(clubMembers.clubId, clubs.id))
      .where(eq(clubMembers.userId, userId))
      .limit(5);

    return data;
  } catch (err) {
    console.error("Manual Join Error (ActiveCircles):", err);
    return [];
  }
}
export async function getProfile(userId: string) {
  try {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);
    return profile || null;
  } catch (error) {
    console.error("Error fetching profile from Neon:", error);
    return null;
  }
}

// Update getMyClubs as well to be safe
export async function getMyClubs(userId: string) {
  if (!userId) return [];

  try {
    const data = await db
      .select({
        role: clubMembers.role,
        club: clubs,
        book: books,
      })
      .from(clubMembers)
      .innerJoin(clubs, eq(clubMembers.clubId, clubs.id))
      .innerJoin(books, eq(clubs.bookId, books.id))
      .where(eq(clubMembers.userId, userId));

    return data.map((item) => ({
      id: item.club.id,
      title: item.club.name,
      bookTitle: item.book.title,
      author: item.book.author,
      category: item.role === "OWNER" ? "My Circle" : "Member",
      desc: item.club.description,
      cover: item.book.coverUrl,
      readers: 1,
      dateRange: `${new Date(item.club.startDate).toLocaleDateString()} - ${new Date(item.club.endDate).toLocaleDateString()}`,
    }));
  } catch (err) {
    console.error("Manual Join Error (MyClubs):", err);
    return [];
  }
}
