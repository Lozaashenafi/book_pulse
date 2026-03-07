"use server";

import { db } from "@/lib/db";
import { profiles, clubs, books, posts, bookCategories } from "@/lib/db/schema";
import { eq, count, sql, desc } from "drizzle-orm";

/**
 * Security Check: Ensures the user is an admin
 */
async function checkAdmin(adminId: string) {
  const user = await db.query.profiles.findFirst({
    where: eq(profiles.id, adminId),
  });
  if (user?.role !== "admin")
    throw new Error("Unauthorized Access to Grand Archive");
}

export async function getAdminStats(adminId: string) {
  await checkAdmin(adminId);

  const [uCount] = await db.select({ value: count() }).from(profiles);
  const [cCount] = await db.select({ value: count() }).from(clubs);
  const [bCount] = await db.select({ value: count() }).from(books);
  const [pCount] = await db.select({ value: count() }).from(posts);

  return {
    users: uCount.value,
    clubs: cCount.value,
    books: bCount.value,
    posts: pCount.value,
  };
}

export async function getAllUsersAdmin(adminId: string) {
  await checkAdmin(adminId);
  const data = await db
    .select()
    .from(profiles)
    .orderBy(desc(profiles.createdAt));
  return JSON.parse(JSON.stringify(data));
}

export async function updateUserRole(
  adminId: string,
  targetUserId: string,
  newRole: string,
) {
  await checkAdmin(adminId);
  await db
    .update(profiles)
    .set({ role: newRole })
    .where(eq(profiles.id, targetUserId));
  return { success: true };
}

export async function manageCategory(
  adminId: string,
  name: string,
  action: "ADD" | "DELETE",
  id?: string,
) {
  await checkAdmin(adminId);
  if (action === "ADD") {
    await db.insert(bookCategories).values({ name });
  } else if (id) {
    await db.delete(bookCategories).where(eq(bookCategories.id, id));
  }
  return { success: true };
}

export async function getBookCategoriesAdmin() {
  const data = await db
    .select()
    .from(bookCategories)
    .orderBy(bookCategories.name);
  return JSON.parse(JSON.stringify(data));
}
