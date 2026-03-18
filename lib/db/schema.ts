import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  unique,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- ENUMS ---
export const postTypeEnum = pgEnum("post_type", [
  "CLUB_ANNOUNCEMENT",
  "MEMBER_POST",
  "CHAPTER_UPDATE",
  "GENERAL",
]);
export const readingStatusEnum = pgEnum("reading_status", [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
]);
export const chatRoomTypeEnum = pgEnum("chat_room_type", [
  "GENERAL",
  "SPOILER",
  "CHAPTER",
]);
export const clubRoleEnum = pgEnum("club_role", [
  "OWNER",
  "ADMIN",
  "MODERATOR",
  "MEMBER",
]);
export const clubVisibilityEnum = pgEnum("club_visibility", [
  "PUBLIC",
  "PRIVATE",
]);
// ADDED: Notification Type Enum
export const notificationTypeEnum = pgEnum("notification_type", [
  "NEW_MEMBER",
  "NEW_POST",
  "READING_REMINDER",
  "CLUB_INVITE",
  "ANNOUNCEMENT",
]);

// --- TABLES ---

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(),
  name: text("name"),
  email: text("email").unique(),
  image: text("image"),
  role: text("role").default("user"),
  username: text("username"),
  location: text("location"),
  bio: text("bio"),
  emailNotifications: boolean("email_notifications").default(true),
  privateShelf: boolean("private_shelf").default(false),
  clubInvites: boolean("club_invites").default(true),
  lastReminderAt: timestamp("last_reminder_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ADDED: Notifications Table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  metadata: jsonb("metadata"), // Useful for storing { clubId: "..." }
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  author: text("author"),
  description: text("description"),
  coverUrl: text("cover_url"),
  totalPages: integer("total_pages"),
  pdfUrl: text("pdf_url"),
  categoryId: uuid("category_id").references(() => bookCategories.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
export const bookCategories = pgTable("book_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const clubs = pgTable("clubs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  visibility: clubVisibilityEnum("visibility").default("PUBLIC"),
  isActive: boolean("is_active").default(true),
  bookId: uuid("book_id")
    .references(() => books.id)
    .notNull(),
  ownerId: uuid("owner_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const chapters = pgTable("chapters", {
  id: uuid("id").primaryKey().defaultRandom(),
  clubId: uuid("club_id")
    .references(() => clubs.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title"),
  chapterNumber: integer("chapter_number").notNull(),
  startPage: integer("start_page").notNull(),
  endPage: integer("end_page").notNull(),
});

export const clubMembers = pgTable(
  "club_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clubId: uuid("club_id")
      .references(() => clubs.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    role: clubRoleEnum("role").default("MEMBER"),
    isSuspended: boolean("is_suspended").default(false),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    unq: unique().on(t.clubId, t.userId),
  }),
);

export const readingProgress = pgTable(
  "reading_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    clubId: uuid("club_id")
      .references(() => clubs.id, { onDelete: "cascade" })
      .notNull(),
    chapterId: uuid("chapter_id").references(() => chapters.id),
    currentPage: integer("current_page"),
    status: readingStatusEnum("status").default("NOT_STARTED"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    unq: unique().on(t.userId, t.chapterId),
  }),
);

export const chatRooms = pgTable("chat_rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  clubId: uuid("club_id")
    .references(() => clubs.id, { onDelete: "cascade" })
    .notNull(),
  chapterId: uuid("chapter_id").references(() => chapters.id, {
    onDelete: "set null",
  }),
  type: chatRoomTypeEnum("type").notNull(),
  title: text("title").notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id")
    .references(() => chatRooms.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  clubId: uuid("club_id").references(() => clubs.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  postType: postTypeEnum("post_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const clubInvites = pgTable("club_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  clubId: uuid("club_id")
    .references(() => clubs.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").unique().notNull(),
  createdBy: uuid("created_by")
    .references(() => profiles.id)
    .notNull(),
});
export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),

  title: text("title"),
  content: text("content").notNull(),

  tags: jsonb("tags").$type<string[]>().default([]),

  isPinned: boolean("is_pinned").default(false),

  color: text("color").default("bg-[#f4ebd0]"),

  //
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
export const postLikes = pgTable(
  "post_likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    unq: unique().on(t.postId, t.userId), // One like per user per post
  }),
);

export const postShares = pgTable("post_shares", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const feedbacks = pgTable("feedbacks", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  category: text("category").default("General"), // e.g. "Bug", "Idea", "Love"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
// --- Update RELATIONS section ---
export const postRelations = relations(posts, ({ one, many }) => ({
  user: one(profiles, { fields: [posts.userId], references: [profiles.id] }),
  likes: many(postLikes),
  shares: many(postShares),
}));

export const postLikeRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, { fields: [postLikes.postId], references: [posts.id] }),
  user: one(profiles, {
    fields: [postLikes.userId],
    references: [profiles.id],
  }),
}));
// --- RELATIONS ---

export const noteRelations = relations(notes, ({ one }) => ({
  user: one(profiles, {
    fields: [notes.userId],
    references: [profiles.id],
  }),
}));
export const chatRoomRelations = relations(chatRooms, ({ one }) => ({
  chapter: one(chapters, {
    fields: [chatRooms.chapterId],
    references: [chapters.id],
  }),
  club: one(clubs, {
    fields: [chatRooms.clubId],
    references: [clubs.id],
  }),
}));

// 2. Chapter Relations
export const chapterRelations = relations(chapters, ({ one, many }) => ({
  club: one(clubs, {
    fields: [chapters.clubId],
    references: [clubs.id],
  }),
  chatRooms: many(chatRooms),
  progress: many(readingProgress),
}));

export const profileNoteRelations = relations(profiles, ({ many }) => ({
  notes: many(notes),
}));

// --- RELATIONS ---
// 1. Club Relations (Already mostly correct, but needs books backlink)
export const clubRelations = relations(clubs, ({ one, many }) => ({
  book: one(books, { fields: [clubs.bookId], references: [books.id] }),
  members: many(clubMembers),
  invites: many(clubInvites),
}));

// 2. Book Relations (NEW: Helps Drizzle map the connection)
export const bookRelations = relations(books, ({ one, many }) => ({
  clubs: many(clubs), // Keep your existing clubs link
  category: one(bookCategories, {
    // ADD THIS: The link to category table
    fields: [books.categoryId],
    references: [bookCategories.id],
  }),
}));

// 3. Member Relations (Correct)
export const memberRelations = relations(clubMembers, ({ one }) => ({
  profile: one(profiles, {
    fields: [clubMembers.userId],
    references: [profiles.id],
  }),
  club: one(clubs, { fields: [clubMembers.clubId], references: [clubs.id] }),
}));

// 4. Invite Relations (CRITICAL NEW PIECE: This is what fixes your error)
export const clubInviteRelations = relations(clubInvites, ({ one }) => ({
  club: one(clubs, {
    fields: [clubInvites.clubId],
    references: [clubs.id],
  }),
}));

// 5. Progress Relations (Correct)
export const progressRelations = relations(readingProgress, ({ one }) => ({
  club: one(clubs, {
    fields: [readingProgress.clubId],
    references: [clubs.id],
  }),
}));

// ADDED: Notification Relations
export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(profiles, {
    fields: [notifications.userId],
    references: [profiles.id],
  }),
}));
export const bookCategoryRelations = relations(bookCategories, ({ many }) => ({
  books: many(books),
}));
