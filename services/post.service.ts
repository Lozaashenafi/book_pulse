"use server";

import { db } from "@/lib/db";
import {
  posts,
  postLikes,
  postShares,
  profiles,
  notifications,
} from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function getFeedPosts(currentUserId?: string) {
  try {
    const data = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        userId: posts.userId,
        userName: profiles.name,
        userImage: profiles.image,
        likeCount: sql<number>`(SELECT count(*) FROM ${postLikes} WHERE ${postLikes.postId} = ${posts.id})`,
        shareCount: sql<number>`(SELECT count(*) FROM ${postShares} WHERE ${postShares.postId} = ${posts.id})`,
        isLiked: currentUserId
          ? sql<boolean>`EXISTS(SELECT 1 FROM ${postLikes} WHERE ${postLikes.postId} = ${posts.id} AND ${postLikes.userId} = ${currentUserId})`
          : sql<boolean>`false`,
      })
      .from(posts)
      .innerJoin(profiles, eq(posts.userId, profiles.id))
      .orderBy(desc(posts.createdAt));

    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error("Fetch Posts Error:", error);
    return [];
  }
}

export async function createPostAction(userId: string, content: string) {
  const [newPost] = await db
    .insert(posts)
    .values({
      userId,
      content,
      postType: "GENERAL",
    })
    .returning();
  return JSON.parse(JSON.stringify(newPost));
}

export async function toggleLikeAction(
  postId: string,
  userId: string,
  authorId: string,
  userName: string,
) {
  const existing = await db
    .select()
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
  if (existing.length > 0) {
    await db
      .delete(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
    return { liked: false };
  } else {
    await db.insert(postLikes).values({ postId, userId });
    if (userId !== authorId) {
      await db.insert(notifications).values({
        userId: authorId,
        type: "NEW_POST",
        title: "New Like",
        message: `${userName} appreciated your scribble.`,
      });
    }
    return { liked: true };
  }
}

export async function sharePostAction(
  postId: string,
  userId: string,
  authorId: string,
  userName: string,
) {
  try {
    await db.insert(postShares).values({ postId, userId });
    if (userId !== authorId) {
      await db.insert(notifications).values({
        userId: authorId,
        type: "NEW_POST",
        title: "Scribble Shared",
        message: `${userName} shared your post with the community.`,
      });
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function deletePostAction(postId: string, userId: string) {
  await db
    .delete(posts)
    .where(and(eq(posts.id, postId), eq(posts.userId, userId)));
}

export async function updatePostAction(
  postId: string,
  userId: string,
  content: string,
) {
  await db
    .update(posts)
    .set({ content })
    .where(and(eq(posts.id, postId), eq(posts.userId, userId)));
}
