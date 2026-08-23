import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const localAccounts = mysqlTable(
  "local_accounts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: varchar("passwordHash", { length: 128 }).notNull(),
    passwordSalt: varchar("passwordSalt", { length: 64 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [uniqueIndex("local_accounts_user_unique").on(table.userId), uniqueIndex("local_accounts_email_unique").on(table.email)],
);

export const profiles = mysqlTable(
  "profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    displayName: varchar("displayName", { length: 120 }).notNull(),
    bio: text("bio"),
    category: varchar("category", { length: 80 }).default("Immobilier & Entrepreneuriat").notNull(),
    location: varchar("location", { length: 160 }).default("Abidjan, Côte d’Ivoire").notNull(),
    phone: varchar("phone", { length: 40 }),
    contactEmail: varchar("contactEmail", { length: 320 }),
    selfieKey: varchar("selfieKey", { length: 512 }),
    selfieUrl: varchar("selfieUrl", { length: 1024 }),
    selfieCapturedAt: timestamp("selfieCapturedAt"),
    identityStatus: mysqlEnum("identityStatus", ["pending", "selfie_captured", "approved", "rejected"]).default("pending").notNull(),
    coverKey: varchar("coverKey", { length: 512 }),
    coverUrl: varchar("coverUrl", { length: 1024 }),
    profileLocked: boolean("profileLocked").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [uniqueIndex("profiles_user_unique").on(table.userId)],
);

export const professionalPages = mysqlTable(
  "professional_pages",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull(),
    title: varchar("title", { length: 120 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    description: text("description"),
    location: varchar("location", { length: 160 }),
    hours: varchar("hours", { length: 160 }),
    phone: varchar("phone", { length: 40 }),
    email: varchar("email", { length: 320 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [uniqueIndex("pages_owner_unique").on(table.ownerUserId)],
);

export const posts = mysqlTable(
  "posts",
  {
    id: int("id").autoincrement().primaryKey(),
    authorId: int("authorId").notNull(),
    body: text("body").notNull(),
    category: mysqlEnum("category", ["Immobilier", "Entrepreneuriat", "Opportunité"]).default("Opportunité").notNull(),
    type: mysqlEnum("type", ["text", "photo", "reel", "live"]).default("text").notNull(),
    visibility: mysqlEnum("visibility", ["public", "followers"]).default("public").notNull(),
    mediaKey: varchar("mediaKey", { length: 512 }),
    mediaUrl: varchar("mediaUrl", { length: 1024 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("posts_author_created_idx").on(table.authorId, table.createdAt), index("posts_created_idx").on(table.createdAt)],
);

export const postReactions = mysqlTable(
  "post_reactions",
  {
    id: int("id").autoincrement().primaryKey(),
    postId: int("postId").notNull(),
    userId: int("userId").notNull(),
    type: mysqlEnum("type", ["like", "support", "insightful"]).default("like").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("reaction_post_user_unique").on(table.postId, table.userId), index("reaction_post_idx").on(table.postId)],
);

export const comments = mysqlTable(
  "comments",
  {
    id: int("id").autoincrement().primaryKey(),
    postId: int("postId").notNull(),
    authorId: int("authorId").notNull(),
    body: varchar("body", { length: 1000 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("comments_post_created_idx").on(table.postId, table.createdAt)],
);

export const follows = mysqlTable(
  "follows",
  {
    id: int("id").autoincrement().primaryKey(),
    followerId: int("followerId").notNull(),
    followedId: int("followedId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("follow_pair_unique").on(table.followerId, table.followedId), index("followed_idx").on(table.followedId)],
);

export const communityGroups = mysqlTable(
  "community_groups",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull(),
    name: varchar("name", { length: 140 }).notNull(),
    description: varchar("description", { length: 1200 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    location: varchar("location", { length: 160 }).default("Abidjan, Côte d’Ivoire").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("groups_category_idx").on(table.category), index("groups_owner_idx").on(table.ownerUserId)],
);

export const groupMembers = mysqlTable(
  "group_members",
  {
    id: int("id").autoincrement().primaryKey(),
    groupId: int("groupId").notNull(),
    userId: int("userId").notNull(),
    role: mysqlEnum("role", ["member", "admin"]).default("member").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("group_member_unique").on(table.groupId, table.userId), index("group_members_user_idx").on(table.userId)],
);

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  kind: mysqlEnum("kind", ["direct", "group"]).default("direct").notNull(),
  title: varchar("title", { length: 160 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const conversationMembers = mysqlTable(
  "conversation_members",
  {
    id: int("id").autoincrement().primaryKey(),
    conversationId: int("conversationId").notNull(),
    userId: int("userId").notNull(),
    lastReadAt: timestamp("lastReadAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("conversation_member_unique").on(table.conversationId, table.userId), index("member_user_idx").on(table.userId)],
);

export const messages = mysqlTable(
  "messages",
  {
    id: int("id").autoincrement().primaryKey(),
    conversationId: int("conversationId").notNull(),
    senderId: int("senderId").notNull(),
    body: varchar("body", { length: 2000 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("messages_conversation_created_idx").on(table.conversationId, table.createdAt)],
);

export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    actorId: int("actorId"),
    kind: mysqlEnum("kind", ["reaction", "comment", "follow", "message", "system"]).notNull(),
    entityId: int("entityId"),
    message: varchar("message", { length: 500 }).notNull(),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("notifications_user_created_idx").on(table.userId, table.createdAt)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type Post = typeof posts.$inferSelect;
