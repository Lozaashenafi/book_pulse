"use server"; // MUST be line 1, no parentheses, no imports above it.

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
  notifications,
  bookCategories,
} from "@/lib/db/schema";
import { eq, and, asc, sql, count } from "drizzle-orm";

export async function createFullClub(
  userId: string,
  { bookData, clubData, chapters: chapterList }: any,
) {
  if (!chapterList || chapterList.length === 0) {
    throw new Error("At least one chapter is required.");
  }

  try {
    // 1. Create Book
    const [newBook] = await db
      .insert(books)

      .values({
        title: bookData.title,
        author: bookData.author,
        description: bookData.description,
        categoryId: bookData.categoryId,
        coverUrl: bookData.coverUrl, // Passed from client storage upload
        pdfUrl: bookData.pdfUrl,
        totalPages: chapterList[chapterList.length - 1].end_page,
      })
      .returning();

    // 2. Create Club
    const [newClub] = await db
      .insert(clubs)
      .values({
        name: clubData.name,
        description: clubData.description,
        startDate: new Date(clubData.startDate),
        endDate: new Date(clubData.endDate),
        bookId: newBook.id,
        ownerId: userId,
        visibility: clubData.visibility,
      })
      .returning();

    // 3. Create Chapters, Chats, and Initial Progress
    for (const [index, ch] of chapterList.entries()) {
      const [insertedChapter] = await db
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
      await db.insert(chatRooms).values({
        clubId: newClub.id,
        chapterId: insertedChapter.id,
        type: "CHAPTER",
        title: `📖 ${ch.title}`,
      });

      // Reading Progress for the Owner
      await db.insert(readingProgress).values({
        userId: userId,
        clubId: newClub.id,
        chapterId: insertedChapter.id,
        status: index === 0 ? "IN_PROGRESS" : "NOT_STARTED",
        currentPage: index === 0 ? ch.start_page : null,
      });
    }

    // 4. Global Chat Rooms
    await db.insert(chatRooms).values([
      { clubId: newClub.id, type: "GENERAL", title: "💬 General Discussion" },
      { clubId: newClub.id, type: "SPOILER", title: "🚨 Spoiler Room" },
    ]);

    // 5. Membership
    await db.insert(clubMembers).values({
      clubId: newClub.id,
      userId: userId,
      role: "OWNER",
    });

    // 6. Optional Announcement Post
    if (clubData.makePost && clubData.visibility === "PUBLIC") {
      await db.insert(posts).values({
        userId: userId,
        clubId: newClub.id,
        content: `A new reading circle just started! "${clubData.name}" is now open and we're diving into ${bookData.title}.`,
        postType: "CLUB_ANNOUNCEMENT",
      });
    }

    // 7. Generate Invite Link Token
    const token = Math.random().toString(36).substring(2, 15);
    await db.insert(clubInvites).values({
      clubId: newClub.id,
      token,
      createdBy: userId,
    });

    return { id: newClub.id, inviteLink: token };
  } catch (error) {
    console.error("Create Club Failed:", error);
    throw error;
  }
}
export async function getExploreClubs(userId?: string) {
  try {
    const data = await db
      .select({
        id: clubs.id,
        name: clubs.name,
        description: clubs.description,
        startDate: clubs.startDate,
        endDate: clubs.endDate,
        ownerId: clubs.ownerId,
        bookTitle: books.title,
        author: books.author,
        coverUrl: books.coverUrl,
        category: bookCategories.name, // We are selecting this...

        readerCount: sql<number>`(SELECT count(*) FROM ${clubMembers} WHERE ${clubMembers.clubId} = ${clubs.id})`,
        userMembershipCount: userId
          ? sql<number>`(SELECT count(*) FROM ${clubMembers} WHERE ${clubMembers.clubId} = ${clubs.id} AND ${clubMembers.userId} = ${userId})`
          : sql<number>`0`,
      })
      .from(clubs)
      .leftJoin(books, eq(clubs.bookId, books.id))
      // --- ADD THIS JOIN BELOW ---
      .leftJoin(bookCategories, eq(books.categoryId, bookCategories.id))
      // ---------------------------
      .where(and(eq(clubs.visibility, "PUBLIC"), eq(clubs.isActive, true)));

    return data.map((c) => ({
      id: c.id,
      title: c.name,
      bookTitle: c.bookTitle || "Unknown",
      author: c.author || "Unknown",
      category: c.category || "General", // If the join returns null, default to General
      desc: c.description || "",
      cover: c.coverUrl,
      readers: Number(c.readerCount),
      isMember: Number(c.userMembershipCount) > 0,
      ownerId: c.ownerId,
      dateRange: c.startDate
        ? `${new Date(c.startDate).toLocaleDateString()} - ${new Date(c.endDate!).toLocaleDateString()}`
        : "TBD",
    }));
  } catch (error) {
    console.error("Explore Error:", error);
    return [];
  }
}
export async function getCategories() {
  try {
    // Fetch from the actual categories table
    const data = await db
      .select()
      .from(bookCategories)
      .orderBy(bookCategories.name);
    return JSON.parse(JSON.stringify(data)); // Returns array of {id, name}
  } catch (error) {
    console.error("Drizzle Categories Error:", error);
    return [];
  }
}
// 4. Fetch Full Club Data for Settings/Dashboard
export async function getClubFullData(clubId: string) {
  try {
    const data = await db.query.clubs.findFirst({
      where: eq(clubs.id, clubId),
      with: {
        book: {
          with: {
            category: true, // Assuming you added category relation in schema.ts
          },
        },
        members: { with: { profile: true } },
        invites: true,
      },
    });

    if (!data) throw new Error("Club not found");

    const mappedData = {
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

    // This converts Date objects to strings and removes class prototypes
    return JSON.parse(JSON.stringify(mappedData));
  } catch (error) {
    console.error("Drizzle Fetch Error:", error);
    throw error;
  }
}

// 5. Update Club Settings

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
        categoryId: updates.categoryId,
        pdfUrl: pdfUrl || updates.pdf_url,
      })
      .where(eq(books.id, bookId))
      .returning();
  } catch (error) {
    console.error("Drizzle Book Update Error:", error);
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
export async function joinClub(
  userId: string,
  clubId: string,
  ownerId: string,
  clubName: string,
  userName: string,
) {
  try {
    // 1. Double-check if the user is already a member
    // This handles cases where the UI hasn't refreshed yet
    const existing = await db
      .select()
      .from(clubMembers)
      .where(
        and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)),
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: true, message: "Already a member" };
    }

    // 2. Perform the join
    await db.insert(clubMembers).values({
      clubId,
      userId,
      role: "MEMBER",
    });

    // 3. Send Notification to Owner
    // We only do this if they actually joined for the first time
    await db.insert(notifications).values({
      userId: ownerId,
      type: "NEW_MEMBER",
      title: "New Club Member",
      message: `${userName} has joined your club: ${clubName}`,
    });

    return { success: true };
  } catch (error: any) {
    // Handle the specific Postgres unique constraint error just in case of a race condition
    if (error.code === "23505") {
      return { success: true, message: "Already joined" };
    }

    console.error("Join Error:", error);
    throw new Error("Failed to join circle.");
  }
}
export async function updateClub(clubId: string, updates: any) {
  try {
    await db
      .update(clubs)
      .set({
        name: updates.name,
        description: updates.description,
        startDate: new Date(updates.startDate),
        endDate: new Date(updates.endDate),
        visibility: updates.visibility,
      })
      .where(eq(clubs.id, clubId));

    // CRITICAL: Return a PLAIN object, not the DB result
    return { success: true };
  } catch (error) {
    console.error("Drizzle Club Update Error:", error);
    throw new Error("Failed to update ledger");
  }
}

export async function updateMemberStatus(
  clubId: string,
  userId: string,
  action: "REMOVE" | "BAN" | "UNBAN",
) {
  try {
    if (action === "REMOVE") {
      await db
        .delete(clubMembers)
        .where(
          and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)),
        );
    } else {
      await db
        .update(clubMembers)
        .set({ isSuspended: action === "BAN" })
        .where(
          and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)),
        );
    }
    return { success: true }; // PLAIN object
  } catch (error) {
    console.error("Drizzle Member Status Error:", error);
    throw new Error("Failed to update club member");
  }
}
export async function getInviteDetails(token: string) {
  try {
    const invite = await db.query.clubInvites.findFirst({
      where: eq(clubInvites.token, token),
      with: {
        club: {
          with: {
            book: true,
          },
        },
      },
    });

    if (!invite) return null;

    // Clean for client
    return JSON.parse(
      JSON.stringify({
        clubId: invite.clubId,
        clubName: invite.club.name,
        clubDesc: invite.club.description,
        bookTitle: invite.club.book.title,
        cover: invite.club.book.coverUrl,
        ownerId: invite.club.ownerId,
      }),
    );
  } catch (error) {
    return null;
  }
}
export async function joinWithToken(
  userId: string,
  token: string,
  userName: string,
) {
  const invite = await db.query.clubInvites.findFirst({
    where: eq(clubInvites.token, token),
  });

  if (!invite) throw new Error("Link invalid.");

  // Check if member exists
  const existing = await db.query.clubMembers.findFirst({
    where: and(
      eq(clubMembers.clubId, invite.clubId),
      eq(clubMembers.userId, userId),
    ),
  });

  if (!existing) {
    // Insert Member
    await db
      .insert(clubMembers)
      .values({ clubId: invite.clubId, userId, role: "MEMBER" });

    // Insert Notification
    await db.insert(notifications).values({
      userId: invite.createdBy, // Correctly notify the person who made the link
      type: "CLUB_INVITE",
      title: "Invite Accepted",
      message: `${userName} joined your circle via link.`,
    });
  }

  return { success: true, clubId: invite.clubId };
}
// services/club.service.ts
export async function getClubName(clubId: string) {
  const data = await db.query.clubs.findFirst({
    where: eq(clubs.id, clubId),
    columns: { name: true },
  });
  return data?.name || "The ";
}
