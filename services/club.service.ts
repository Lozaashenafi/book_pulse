"use server";

import { db } from "@/lib/db";
import {
  clubs,
  books,
  chapters,
  chatRooms,
  readingProgress,
  clubMembers,
  clubInvites,
  posts,
  profiles,
} from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
export async function getExploreClubs() {
  try {
    // SWITCH TO MANUAL JOINS (Much faster and more stable on Supabase Pooler)
    const data = await db
      .select({
        id: clubs.id,
        name: clubs.name,
        description: clubs.description,
        startDate: clubs.startDate,
        endDate: clubs.endDate,
        bookTitle: books.title,
        author: books.author,
        coverUrl: books.coverUrl,
        category: books.category,
      })
      .from(clubs)
      .leftJoin(books, eq(clubs.bookId, books.id))
      .where(and(eq(clubs.visibility, "PUBLIC"), eq(clubs.isActive, true)));

    return data.map((c) => ({
      id: c.id,
      title: c.name,
      bookTitle: c.bookTitle || "Unknown Book",
      author: c.author || "Unknown Author",
      category: c.category || "General",
      desc: c.description || "No description provided.",
      cover: c.coverUrl,
      readers: 1,
      dateRange: c.startDate
        ? `${new Date(c.startDate).toLocaleDateString()} - ${new Date(c.endDate!).toLocaleDateString()}`
        : "TBD",
      color: "bg-primary",
    }));
  } catch (error) {
    console.error("Drizzle Explore Error:", error);
    return [];
  }
}

export async function getCategories() {
  try {
    // Simple flat query
    const data = await db.selectDistinct({ name: books.category }).from(books);
    return data.map((c) => c.name).filter(Boolean) as string[];
  } catch (error) {
    console.error("Drizzle Categories Error:", error);
    return ["Fiction", "Non-Fiction", "Sci-Fi", "Fantasy", "Mystery"];
  }
}
// 3. The Mega-Function: Create everything (Book, Club, Chapters, Chats, Progress, Invites)
// NOTE: bookData.coverUrl and bookData.pdfUrl must be pre-uploaded via the client storage helper
export async function createFullClub(
  userId: string,
  { bookData, clubData, chapters: chapterList }: any,
) {
  if (!chapterList || chapterList.length === 0) {
    throw new Error("At least one chapter is required.");
  }

  try {
    return await db.transaction(async (tx) => {
      // 1. Create Book
      const [newBook] = await tx
        .insert(books)
        .values({
          title: bookData.title,
          author: bookData.author,
          description: bookData.description,
          category: bookData.category,
          coverUrl: bookData.coverUrl, // URL from client upload
          pdfUrl: bookData.pdfUrl, // URL from client upload
          totalPages: chapterList[chapterList.length - 1].end_page,
        })
        .returning();

      // 2. Create Club
      const [newClub] = await tx
        .insert(clubs)
        .values({
          name: clubData.name,
          description: clubData.description,
          startDate: new Date(clubData.startDate),
          endDate: new Date(clubData.endDate),
          visibility: clubData.visibility,
          bookId: newBook.id,
          ownerId: userId,
        })
        .returning();

      // 3. Create Chapters, Chats, and Initial Progress
      for (const [index, ch] of chapterList.entries()) {
        const [chapter] = await tx
          .insert(chapters)
          .values({
            clubId: newClub.id,
            title: ch.title,
            chapterNumber: index + 1,
            startPage: ch.start_page,
            endPage: ch.end_page,
          })
          .returning();

        // Chapter Chat Room
        await tx.insert(chatRooms).values({
          clubId: newClub.id,
          chapterId: chapter.id,
          type: "CHAPTER",
          title: `📖 ${ch.title}`,
        });

        // Reading Progress for the Owner
        await tx.insert(readingProgress).values({
          userId: userId,
          clubId: newClub.id,
          chapterId: chapter.id,
          status: index === 0 ? "IN_PROGRESS" : "NOT_STARTED",
          currentPage: index === 0 ? ch.start_page : null,
        });
      }

      // 4. Global Chat Rooms
      await tx.insert(chatRooms).values([
        { clubId: newClub.id, type: "GENERAL", title: "💬 General Discussion" },
        { clubId: newClub.id, type: "SPOILER", title: "🚨 Spoiler Room" },
      ]);

      // 5. Membership
      await tx.insert(clubMembers).values({
        clubId: newClub.id,
        userId: userId,
        role: "OWNER",
      });

      // 6. Announcement Post
      if (clubData.makePost && clubData.visibility === "PUBLIC") {
        await tx.insert(posts).values({
          userId: userId,
          clubId: newClub.id,
          content: `Founded a new circle: ${clubData.name}! Reading ${bookData.title}.`,
          postType: "CLUB_ANNOUNCEMENT",
        });
      }

      // 7. Invite Link
      const token = Math.random().toString(36).substring(2, 15);
      await tx.insert(clubInvites).values({
        clubId: newClub.id,
        token,
        createdBy: userId,
      });

      return {
        club: newClub,
        inviteLink: token,
      };
    });
  } catch (error) {
    console.error("Create Club Transaction Failed:", error);
    throw error;
  }
}

// 4. Fetch Full Club Data for Settings/Dashboard
export async function getClubFullData(clubId: string) {
  try {
    const data = await db.query.clubs.findFirst({
      where: eq(clubs.id, clubId),
      with: {
        book: true,
        members: {
          with: {
            profile: true,
          },
        },
        invites: true,
      },
    });

    if (!data) throw new Error("Club not found");

    // Flatten/Map to match original Supabase object structure for UI compatibility
    return {
      ...data,
      books: data.book,
      club_members: data.members.map((m) => ({
        id: m.id,
        user_id: m.userId,
        role: m.role,
        is_suspended: m.isSuspended,
        profiles: m.profile,
      })),
      club_invites: data.invites,
    };
  } catch (error) {
    console.error("Drizzle Fetch Error:", error);
    throw error;
  }
}

// 5. Update Club Settings
export async function updateClub(clubId: string, updates: any) {
  try {
    return await db
      .update(clubs)
      .set({
        name: updates.name,
        description: updates.description,
        startDate: new Date(updates.start_date),
        endDate: new Date(updates.end_date),
        visibility: updates.visibility,
      })
      .where(eq(clubs.id, clubId))
      .returning();
  } catch (error) {
    console.error("Drizzle Club Update Error:", error);
    throw error;
  }
}

// 6. Update Book Info
export async function updateBook(
  bookId: string,
  updates: any,
  pdfUrl?: string,
) {
  try {
    return await db
      .update(books)
      .set({
        title: updates.title,
        author: updates.author,
        description: updates.description,
        category: updates.category,
        pdfUrl: pdfUrl || updates.pdf_url,
      })
      .where(eq(books.id, bookId))
      .returning();
  } catch (error) {
    console.error("Drizzle Book Update Error:", error);
    throw error;
  }
}

// 7. Manage Member Status
export async function updateMemberStatus(
  clubId: string,
  userId: string,
  action: "REMOVE" | "BAN" | "UNBAN",
) {
  try {
    if (action === "REMOVE") {
      return await db
        .delete(clubMembers)
        .where(
          and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)),
        );
    } else {
      return await db
        .update(clubMembers)
        .set({ isSuspended: action === "BAN" })
        .where(
          and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)),
        );
    }
  } catch (error) {
    console.error("Drizzle Member Status Error:", error);
    throw error;
  }
}

// 8. Delete Club and associated Book
export async function deleteClub(clubId: string) {
  try {
    const club = await db.query.clubs.findFirst({
      where: eq(clubs.id, clubId),
    });

    await db.delete(clubs).where(eq(clubs.id, clubId));

    if (club?.bookId) {
      await db.delete(books).where(eq(books.id, club.bookId));
    }
    return true;
  } catch (error) {
    console.error("Drizzle Delete Error:", error);
    throw error;
  }
}
