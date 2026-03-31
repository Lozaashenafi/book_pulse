"use server"; // Add this line

import { db } from "@/lib/db";
import {
  clubMembers,
  readingProgress,
  chatMessages,
  clubs,
  books,
  profiles,
  posts,
  postLikes,
  badges,
  userBadges,
} from "@/lib/db/schema";
import { eq, count, and, sql, desc } from "drizzle-orm";

export async function getProfile(userId: string) {
  try {
    const data = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    });
    return data || null;
  } catch (error) {
    console.error("Neon Fetch Error:", error);
    throw new Error("Database is taking too long to respond.");
  }
}

export async function ensureNeonProfile(supabaseUser: any) {
  if (!supabaseUser) return null;

  try {
    console.log("🔍 Checking Neon for User ID:", supabaseUser.id);
    
    const existing = await db.query.profiles.findFirst({
      where: eq(profiles.id, supabaseUser.id),
    });

    if (existing) {
      console.log("✅ Profile already exists in Neon.");
      return existing;
    }

    console.log("🚨 Profile MISSING in Neon. Attempting to create...");

    const name = supabaseUser.user_metadata?.full_name || 
                 supabaseUser.user_metadata?.name || 
                 supabaseUser.email?.split('@')[0] || "New Reader";

    const [newProfile] = await db.insert(profiles).values({
      id: supabaseUser.id,
      name: name,
      email: supabaseUser.email!,
      username: name.toLowerCase().replace(/\s/g, "_") + Math.floor(Math.random() * 100).toString(),
      role: "user",
    }).returning();

    console.log("✨ Successfully created profile in Neon for:", supabaseUser.email);
    return newProfile;
  } catch (error: any) {
    console.error("❌ CRITICAL Neon Sync Error:", error.message);
    // If it's a timeout, we see it here
    return null;
  }
}

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
    const data = await db
      .select({
        currentPage: readingProgress.currentPage,
        status: readingProgress.status,
        clubName: clubs.name,
        bookTitle: books.title,
        bookAuthor: books.author,
        totalPages: books.totalPages,
        // We select the value and give it an alias 'cover'
        cover: books.coverUrl 
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
      // FIX: Use 'item.cover' to get the actual data from the query result
      cover: item.cover, 
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
// export async function getProfile(userId: string) {
//   try {
//     const [profile] = await db
//       .select()
//       .from(profiles)
//       .where(eq(profiles.id, userId))
//       .limit(1);
//     return profile || null;
//   } catch (error) {
//     console.error("Error fetching profile from Neon:", error);
//     return null;
//   }
// }

export async function getMyClubs(userId: string) {
  if (!userId) return [];

  try {
    const data = await db
      .select({
        role: clubMembers.role,
        club: clubs,
        book: books,
        // DYNAMIC COUNT: This is the missing piece for MyClubCard
        readerCount: sql<number>`(SELECT count(*) FROM ${clubMembers} WHERE ${clubMembers.clubId} = ${clubs.id})`,
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
      role: item.role,
      desc: item.club.description,
      cover: item.book.coverUrl,
      // Map the reader count here
      readers: Number(item.readerCount),
      dateRange: `${new Date(item.club.startDate).toLocaleDateString()} - ${new Date(item.club.endDate).toLocaleDateString()}`,
    }));
  } catch (error) {
    console.error("Error in getMyClubs:", error);
    return [];
  }
}

export async function getSidebarClubs(userId: string) {
  if (!userId) return { owned: [], all: [] };

  try {
    const data = await db
      .select({
        id: clubs.id,
        name: clubs.name,
        role: clubMembers.role,
      })
      .from(clubMembers)
      .innerJoin(clubs, eq(clubMembers.clubId, clubs.id))
      .where(eq(clubMembers.userId, userId));

    return {
      // Clubs user created
      owned: data.filter((c) => c.role === "OWNER"),
      // Every club the user is in (including owned ones)
      all: data,
    };
  } catch (error) {
    console.error("Error fetching sidebar clubs:", error);
    return { owned: [], all: [] };
  }
}
export async function getPublicProfileByUsername(username: string) {
  try {
    // 1. Fetch User Profile
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.username, username),
    });

    if (!user) return null;

    // 2. Fetch User's Posts (Scribbles)
    const userPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        likeCount: sql<number>`(SELECT count(*) FROM ${postLikes} WHERE ${postLikes.postId} = ${posts.id})`,
      })
      .from(posts)
      .where(eq(posts.userId, user.id))
      .orderBy(desc(posts.createdAt));

    // 3. Fetch User's Clubs (Joined & Owned)
    const userClubs = await db
      .select({
        id: clubs.id,
        name: clubs.name,
        role: clubMembers.role,
        cover: books.coverUrl,
        bookTitle: books.title,
      })
      .from(clubMembers)
      .innerJoin(clubs, eq(clubMembers.clubId, clubs.id))
      .innerJoin(books, eq(clubs.bookId, books.id))
      .where(eq(clubMembers.userId, user.id));
 const earnedBadges = await db
      .select({
        id: badges.id,
        name: badges.name,
        desc: badges.description,
        icon: badges.icon,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, user.id));

    // Serialize for Client Component
    return JSON.parse(
      JSON.stringify({
        ...user,
        badges: earnedBadges, // Add this to the returned object
        posts: userPosts,
        clubs: userClubs,
      }),
    );
  } catch (error) {
    console.error("Public Profile Fetch Error:", error);
    return null;
  }
}


export async function updatePreferences(
  userId: string,
  prefs: {
    emailNotifications?: boolean;
    privateShelf?: boolean;
    clubInvites?: boolean;
  },
) {
  try {
    await db
      .update(profiles)
      .set({
        ...prefs,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId));
    return { success: true };
  } catch (error) {
    console.error("Preference Update Error:", error);
    throw new Error("Failed to save preferences");
  }
}
