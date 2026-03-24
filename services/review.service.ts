"use server";

import { db } from "@/lib/db";
import { bookReviews, notifications, profiles, reviewFavorites, reviewLikes } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export async function getBookReviews(currentUserId?: string) {
  try {
    const data = await db
      .select({
        id: bookReviews.id,
        bookTitle: bookReviews.bookTitle,
        authorName: bookReviews.authorName,
        content: bookReviews.content,
        rating: bookReviews.rating,
        imageUrl: bookReviews.imageUrl,
        createdAt: bookReviews.createdAt,
        userName: profiles.name,
        userImage: profiles.image,
        userId: profiles.id,
        // DYNAMIC COUNTS
        likeCount: sql<number>`(SELECT count(*) FROM ${reviewLikes} WHERE ${reviewLikes.reviewId} = ${bookReviews.id})`,
        isLiked: currentUserId 
          ? sql<boolean>`EXISTS(SELECT 1 FROM ${reviewLikes} WHERE ${reviewLikes.reviewId} = ${bookReviews.id} AND ${reviewLikes.userId} = ${currentUserId})`
          : sql<boolean>`false`,
        isFavorited: currentUserId 
          ? sql<boolean>`EXISTS(SELECT 1 FROM ${reviewFavorites} WHERE ${reviewFavorites.reviewId} = ${bookReviews.id} AND ${reviewFavorites.userId} = ${currentUserId})`
          : sql<boolean>`false`,
      })
      .from(bookReviews)
      .innerJoin(profiles, eq(bookReviews.userId, profiles.id))
      .orderBy(desc(bookReviews.createdAt));

    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    return [];
  }
}


export async function toggleReviewLike(userId: string, reviewId: string, userName: string) {
  // 1. Get review details to find the author and book title
  const review = await db.query.bookReviews.findFirst({
    where: eq(bookReviews.id, reviewId),
  });

  if (!review) return;

  const existing = await db
    .select()
    .from(reviewLikes)
    .where(and(eq(reviewLikes.reviewId, reviewId), eq(reviewLikes.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(reviewLikes).where(and(eq(reviewLikes.reviewId, reviewId), eq(reviewLikes.userId, userId)));
  } else {
    await db.insert(reviewLikes).values({ userId, reviewId });

    // 2. NOTIFY AUTHOR (Only if someone else likes it)
    if (userId !== review.userId) {
      await db.insert(notifications).values({
        userId: review.userId,
        type: "NEW_POST",
        title: "Review Appreciated",
        message: `${userName} liked your reflection on "${review.bookTitle}".`,
      });
    }
  }
}
export async function toggleReviewFavorite(userId: string, reviewId: string) {
  const existing = await db.select().from(reviewFavorites).where(and(eq(reviewFavorites.reviewId, reviewId), eq(reviewFavorites.userId, userId))).limit(1);
  if (existing.length > 0) {
    await db.delete(reviewFavorites).where(and(eq(reviewFavorites.reviewId, reviewId), eq(reviewFavorites.userId, userId)));
  } else {
    await db.insert(reviewFavorites).values({ userId, reviewId });
  }
}

export async function createReviewAction(userId: string, data: any) {
  try {
    const [newReview] = await db.insert(bookReviews).values({
      userId,
      bookTitle: data.bookTitle,
      authorName: data.authorName,
      content: data.content,
      rating: data.rating,
      imageUrl: data.imageUrl,
    }).returning();
    
    return { success: true, id: newReview.id };
  } catch (error) {
    throw new Error("Failed to file review in archives.");
  }
}

export async function deleteReviewAction(userId: string, reviewId: string) {
  await db.delete(bookReviews).where(eq(bookReviews.id, reviewId));
  return { success: true };
}

export async function updateReviewAction(userId: string, reviewId: string, data: any) {
  try {
    await db.update(bookReviews)
      .set({
        bookTitle: data.bookTitle,
        authorName: data.authorName,
        content: data.content,
        rating: data.rating,
        imageUrl: data.imageUrl,
        updatedAt: new Date(),
      })
      .where(and(eq(bookReviews.id, reviewId), eq(bookReviews.userId, userId)));
    
    return { success: true };
  } catch (error) {
    throw new Error("Failed to update archive entry.");
  }
}