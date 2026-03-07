"use server";

import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";

export async function getUserNotes(userId: string) {
  try {
    const data = await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      // Sort: Pinned first, then by newest created
      .orderBy(desc(notes.isPinned), desc(notes.createdAt));

    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error("Fetch Notes Error:", error);
    return [];
  }
}

export async function createNoteAction(
  userId: string,
  data: { title: string; content: string; tags: string[] },
) {
  const [newNote] = await db
    .insert(notes)
    .values({
      userId,
      title: data.title,
      content: data.content,
      tags: data.tags,
      color: "bg-white", // Default
    })
    .returning();
  return JSON.parse(JSON.stringify(newNote));
}

export async function updateNoteAction(
  userId: string,
  noteId: string,
  updates: any,
) {
  await db
    .update(notes)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
  return { success: true };
}

export async function deleteNoteAction(userId: string, noteId: string) {
  await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
  return { success: true };
}

export async function togglePinAction(
  userId: string,
  noteId: string,
  isPinned: boolean,
) {
  await db
    .update(notes)
    .set({ isPinned })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
  return { success: true };
}
