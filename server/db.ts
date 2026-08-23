import { and, desc, eq, inArray, lt, or } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { drizzle } from "drizzle-orm/mysql2";

import {
  comments,
  communityGroups,
  conversationMembers,
  conversations,
  follows,
  groupMembers,
  localAccounts,
  listingFavorites,
  listingImages,
  listings,
  messages,
  notifications,
  postReactions,
  posts,
  professionalPages,
  profiles,
  type InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

const publicProfileFields = {
  userId: profiles.userId,
  displayName: profiles.displayName,
  bio: profiles.bio,
  category: profiles.category,
  location: profiles.location,
  coverUrl: profiles.coverUrl,
  identityStatus: profiles.identityStatus,
};

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

function requireDb(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) throw new Error("La base de données n’est pas disponible.");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId, lastSignedIn: new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: new Date() };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = requireDb(await getDb());
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function createListing(sellerId: number, input: { title: string; description: string; price: number; category: string; location: string; condition: "new" | "used" | "service"; images: Array<{ key: string; url: string }> }, sellerName?: string | null) {
  const db = requireDb(await getDb());
  const profile = await ensureProfile(sellerId, sellerName);
  if (profile.identityStatus !== "selfie_captured" || !profile.selfieUrl) {
    throw new Error("SELFIE_VERIFICATION_REQUIRED");
  }
  const inserted = await db.insert(listings).values({ sellerId, title: input.title, description: input.description, price: input.price, category: input.category, location: input.location, condition: input.condition });
  const listingId = Number(inserted[0].insertId);
  if (input.images.length) await db.insert(listingImages).values(input.images.map((image, sortOrder) => ({ listingId, storageKey: image.key, url: image.url, sortOrder })));
  return { listingId };
}

export async function listPublicListings(input: { cursor?: { createdAt: Date; id: number }; limit: number }) {
  const db = requireDb(await getDb());
  const limit = Math.min(Math.max(input.limit, 1), 40);
  const cursorFilter = input.cursor ? or(
    lt(listings.createdAt, input.cursor.createdAt),
    and(eq(listings.createdAt, input.cursor.createdAt), lt(listings.id, input.cursor.id)),
  ) : undefined;
  const baseFilter = and(eq(listings.status, "active"), eq(profiles.identityStatus, "selfie_captured"));
  const where = cursorFilter ? and(baseFilter, cursorFilter) : baseFilter;
  const listingRows = await db.select({ listing: listings }).from(listings).innerJoin(profiles, eq(profiles.userId, listings.sellerId)).where(where).orderBy(desc(listings.createdAt), desc(listings.id)).limit(limit + 1);
  const rows = listingRows.map((row) => row.listing);
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const items = await Promise.all(page.map(async (listing) => {
    const images = await db.select().from(listingImages).where(eq(listingImages.listingId, listing.id)).orderBy(listingImages.sortOrder);
    const seller = (await db.select({ ...publicProfileFields }).from(profiles).where(eq(profiles.userId, listing.sellerId)).limit(1))[0] ?? null;
    return { ...listing, images, seller };
  }));
  const last = items.at(-1);
  return { items, nextCursor: hasMore && last ? { createdAt: last.createdAt, id: last.id } : null };
}

export async function getListing(id: number) {
  const db = requireDb(await getDb());
  const listing = (await db.select({ listing: listings }).from(listings).innerJoin(profiles, eq(profiles.userId, listings.sellerId)).where(and(eq(listings.id, id), eq(listings.status, "active"), eq(profiles.identityStatus, "selfie_captured"))).limit(1))[0]?.listing;
  if (!listing) return null;
  const images = await db.select().from(listingImages).where(eq(listingImages.listingId, id)).orderBy(listingImages.sortOrder);
  const seller = (await db.select({ ...publicProfileFields }).from(profiles).where(eq(profiles.userId, listing.sellerId)).limit(1))[0] ?? null;
  return { ...listing, images, seller };
}

export async function toggleListingFavorite(userId: number, listingId: number) {
  const db = requireDb(await getDb());
  const existing = await db.select().from(listingFavorites).where(and(eq(listingFavorites.userId, userId), eq(listingFavorites.listingId, listingId))).limit(1);
  if (existing[0]) {
    await db.delete(listingFavorites).where(eq(listingFavorites.id, existing[0].id));
    return { favorited: false };
  }
  await db.insert(listingFavorites).values({ userId, listingId });
  return { favorited: true };
}

export async function getLocalAccountByEmail(email: string) {
  const db = requireDb(await getDb());
  const result = await db.select().from(localAccounts).where(eq(localAccounts.email, email)).limit(1);
  return result[0];
}

export async function createLocalAccount(input: { email: string; name: string; passwordHash: string; passwordSalt: string }) {
  const db = requireDb(await getDb());
  const openId = `local_${randomUUID()}`;
  const inserted = await db.insert(users).values({ openId, name: input.name, email: input.email, loginMethod: "email" });
  const userId = Number(inserted[0].insertId);
  await db.insert(localAccounts).values({ userId, email: input.email, passwordHash: input.passwordHash, passwordSalt: input.passwordSalt });
  return getUserById(userId);
}

export async function ensureProfile(userId: number, displayName?: string | null) {
  const db = requireDb(await getDb());
  const existing = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (existing[0]) return existing[0];

  const title = displayName?.trim() || "Membre Business Ivoire";
  await db.insert(profiles).values({ userId, displayName: title });
  await db.insert(professionalPages).values({
    ownerUserId: userId,
    title,
    category: "Immobilier & Entrepreneuriat",
    description: "Page professionnelle Business Ivoire.",
    location: "Abidjan, Côte d’Ivoire",
  });
  const created = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return created[0];
}

export async function getMyProfile(userId: number, name?: string | null) {
  const db = requireDb(await getDb());
  const profile = await ensureProfile(userId, name);
  const page = await db.select().from(professionalPages).where(eq(professionalPages.ownerUserId, userId)).limit(1);
  const followers = await db.select().from(follows).where(eq(follows.followedId, userId));
  return { profile, page: page[0] ?? null, followerCount: followers.length };
}

export async function updateMyProfile(userId: number, name: string | null | undefined, input: {
  displayName?: string; bio?: string; category?: string; location?: string; phone?: string; contactEmail?: string; profileLocked?: boolean;
}) {
  const db = requireDb(await getDb());
  await ensureProfile(userId, name);
  await db.update(profiles).set(input).where(eq(profiles.userId, userId));
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result[0];
}

export async function setProfileMedia(userId: number, name: string | null | undefined, kind: "selfie" | "cover", key: string, url: string) {
  const db = requireDb(await getDb());
  await ensureProfile(userId, name);
  if (kind === "selfie") {
    await db.update(profiles).set({ selfieKey: key, selfieUrl: url, selfieCapturedAt: new Date(), identityStatus: "selfie_captured" }).where(eq(profiles.userId, userId));
  } else {
    await db.update(profiles).set({ coverKey: key, coverUrl: url }).where(eq(profiles.userId, userId));
  }
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result[0];
}

async function getReactionAndCommentCounts(postIds: number[], viewerId: number) {
  if (!postIds.length) return new Map<number, { reactions: number; comments: number; reacted: boolean }>();
  const db = requireDb(await getDb());
  const [allReactions, allComments] = await Promise.all([
    db.select().from(postReactions).where(inArray(postReactions.postId, postIds)),
    db.select().from(comments).where(inArray(comments.postId, postIds)),
  ]);
  const counts = new Map<number, { reactions: number; comments: number; reacted: boolean }>();
  postIds.forEach((id) => counts.set(id, { reactions: 0, comments: 0, reacted: false }));
  allReactions.forEach((reaction) => {
    const item = counts.get(reaction.postId);
    if (item) {
      item.reactions += 1;
      item.reacted ||= reaction.userId === viewerId;
    }
  });
  allComments.forEach((comment) => {
    const item = counts.get(comment.postId);
    if (item) item.comments += 1;
  });
  return counts;
}

export async function listFeed(viewerId: number) {
  const db = requireDb(await getDb());
  const rows = await db
    .select({ post: posts, profile: publicProfileFields })
    .from(posts)
    .innerJoin(profiles, eq(posts.authorId, profiles.userId))
    .orderBy(desc(posts.createdAt))
    .limit(50);
  const counts = await getReactionAndCommentCounts(rows.map((row) => row.post.id), viewerId);
  return rows.map(({ post, profile }) => ({ ...post, author: profile, ...counts.get(post.id)! }));
}

export async function createPost(userId: number, body: string, category: "Immobilier" | "Entrepreneuriat" | "Opportunité", type: "text" | "photo" | "reel" | "live", media?: { key: string; url: string }) {
  const db = requireDb(await getDb());
  const inserted = await db.insert(posts).values({ authorId: userId, body, category, type, mediaKey: media?.key, mediaUrl: media?.url });
  const postId = Number(inserted[0].insertId);
  const profile = await ensureProfile(userId);
  const created = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  return { ...created[0], author: profile, reactions: 0, comments: 0, reacted: false };
}

export async function toggleReaction(userId: number, postId: number) {
  const db = requireDb(await getDb());
  const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (!post[0]) throw new Error("Publication introuvable.");
  const existing = await db.select().from(postReactions).where(and(eq(postReactions.postId, postId), eq(postReactions.userId, userId))).limit(1);
  if (existing[0]) {
    await db.delete(postReactions).where(eq(postReactions.id, existing[0].id));
    return { reacted: false };
  }
  await db.insert(postReactions).values({ postId, userId });
  if (post[0].authorId !== userId) {
    await db.insert(notifications).values({ userId: post[0].authorId, actorId: userId, kind: "reaction", entityId: postId, message: "a réagi à votre publication." });
  }
  return { reacted: true };
}

export async function listComments(postId: number) {
  const db = requireDb(await getDb());
  const rows = await db.select({ comment: comments, profile: publicProfileFields }).from(comments).innerJoin(profiles, eq(comments.authorId, profiles.userId)).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt));
  return rows.map(({ comment, profile }) => ({ ...comment, author: profile }));
}

export async function addComment(userId: number, postId: number, body: string) {
  const db = requireDb(await getDb());
  const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (!post[0]) throw new Error("Publication introuvable.");
  const inserted = await db.insert(comments).values({ postId, authorId: userId, body });
  const id = Number(inserted[0].insertId);
  if (post[0].authorId !== userId) {
    await db.insert(notifications).values({ userId: post[0].authorId, actorId: userId, kind: "comment", entityId: postId, message: "a commenté votre publication." });
  }
  const result = await listComments(postId);
  return result.find((comment) => comment.id === id)!;
}

export async function listPeople(userId: number) {
  const db = requireDb(await getDb());
  const userIds = (await db.select({ id: users.id }).from(users).limit(60)).map((row) => row.id).filter((id) => id !== userId);
  if (!userIds.length) return [];
  return db.select(publicProfileFields).from(profiles).where(inArray(profiles.userId, userIds)).limit(40);
}

export async function toggleFollow(userId: number, targetUserId: number) {
  if (userId === targetUserId) throw new Error("Vous ne pouvez pas vous suivre vous-même.");
  const db = requireDb(await getDb());
  const existing = await db.select().from(follows).where(and(eq(follows.followerId, userId), eq(follows.followedId, targetUserId))).limit(1);
  if (existing[0]) {
    await db.delete(follows).where(eq(follows.id, existing[0].id));
    return { following: false };
  }
  await db.insert(follows).values({ followerId: userId, followedId: targetUserId });
  await db.insert(notifications).values({ userId: targetUserId, actorId: userId, kind: "follow", message: "vous suit désormais." });
  return { following: true };
}

export async function listGroups(userId: number) {
  const db = requireDb(await getDb());
  const groups = await db.select().from(communityGroups).orderBy(desc(communityGroups.createdAt)).limit(60);
  if (!groups.length) return [];
  const memberships = await db.select().from(groupMembers).where(inArray(groupMembers.groupId, groups.map((group) => group.id)));
  return groups.map((group) => ({
    ...group,
    memberCount: memberships.filter((membership) => membership.groupId === group.id).length,
    joined: memberships.some((membership) => membership.groupId === group.id && membership.userId === userId),
  }));
}

export async function createGroup(userId: number, input: { name: string; description: string; category: string; location: string }) {
  const db = requireDb(await getDb());
  const inserted = await db.insert(communityGroups).values({ ownerUserId: userId, ...input });
  const id = Number(inserted[0].insertId);
  await db.insert(groupMembers).values({ groupId: id, userId, role: "admin" });
  const created = await db.select().from(communityGroups).where(eq(communityGroups.id, id)).limit(1);
  return created[0];
}

export async function toggleGroupMembership(userId: number, groupId: number) {
  const db = requireDb(await getDb());
  const group = await db.select().from(communityGroups).where(eq(communityGroups.id, groupId)).limit(1);
  if (!group[0]) throw new Error("Groupe introuvable.");
  const current = await db.select().from(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))).limit(1);
  if (current[0]) {
    if (current[0].role === "admin") throw new Error("Le créateur du groupe ne peut pas quitter ce groupe sans transférer la gestion.");
    await db.delete(groupMembers).where(eq(groupMembers.id, current[0].id));
    return { joined: false };
  }
  await db.insert(groupMembers).values({ groupId, userId });
  return { joined: true };
}

export async function listNotifications(userId: number) {
  const db = requireDb(await getDb());
  const rows = await db.select({ notification: notifications, actor: publicProfileFields }).from(notifications).leftJoin(profiles, eq(notifications.actorId, profiles.userId)).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(60);
  return rows.map(({ notification, actor }) => ({ ...notification, actor }));
}

export async function markNotificationRead(userId: number, id: number) {
  const db = requireDb(await getDb());
  await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  return { success: true };
}

export async function listConversations(userId: number) {
  const db = requireDb(await getDb());
  const membership = await db.select().from(conversationMembers).where(eq(conversationMembers.userId, userId));
  if (!membership.length) return [];
  const ids = membership.map((item) => item.conversationId);
  const items = await db.select().from(conversations).where(inArray(conversations.id, ids)).orderBy(desc(conversations.updatedAt));
  return Promise.all(items.map(async (conversation) => {
    const members = await db.select({ profile: publicProfileFields }).from(conversationMembers).innerJoin(profiles, eq(conversationMembers.userId, profiles.userId)).where(eq(conversationMembers.conversationId, conversation.id));
    const latest = await db.select().from(messages).where(eq(messages.conversationId, conversation.id)).orderBy(desc(messages.createdAt)).limit(1);
    return { ...conversation, members: members.map((row) => row.profile), latestMessage: latest[0] ?? null };
  }));
}

export async function createDirectConversation(userId: number, targetUserId: number) {
  if (userId === targetUserId) throw new Error("Sélectionnez un autre membre.");
  await Promise.all([ensureProfile(userId), ensureProfile(targetUserId)]);
  const db = requireDb(await getDb());
  const inserted = await db.insert(conversations).values({ kind: "direct" });
  const conversationId = Number(inserted[0].insertId);
  await db.insert(conversationMembers).values([{ conversationId, userId }, { conversationId, userId: targetUserId }]);
  return { id: conversationId };
}

async function assertConversationMember(userId: number, conversationId: number) {
  const db = requireDb(await getDb());
  const member = await db.select().from(conversationMembers).where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, userId))).limit(1);
  if (!member[0]) throw new Error("Vous n’avez pas accès à cette conversation.");
  return db;
}

export async function listMessages(userId: number, conversationId: number) {
  const db = await assertConversationMember(userId, conversationId);
  const rows = await db.select({ message: messages, profile: publicProfileFields }).from(messages).innerJoin(profiles, eq(messages.senderId, profiles.userId)).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt).limit(100);
  return rows.map(({ message, profile }) => ({ ...message, sender: profile }));
}

export async function sendMessage(userId: number, conversationId: number, body: string) {
  await ensureProfile(userId);
  const db = await assertConversationMember(userId, conversationId);
  const inserted = await db.insert(messages).values({ conversationId, senderId: userId, body });
  await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversationId));
  const recipients = await db.select().from(conversationMembers).where(eq(conversationMembers.conversationId, conversationId));
  await Promise.all(recipients.filter((member) => member.userId !== userId).map((member) => db.insert(notifications).values({ userId: member.userId, actorId: userId, kind: "message", entityId: conversationId, message: "vous a envoyé un message." })));
  const result = await listMessages(userId, conversationId);
  return result.find((message) => message.id === Number(inserted[0].insertId))!;
}

export async function getDashboard(userId: number, name?: string | null) {
  const db = requireDb(await getDb());
  await ensureProfile(userId, name);
  const [ownPosts, followerRows] = await Promise.all([
    db.select().from(posts).where(eq(posts.authorId, userId)).orderBy(desc(posts.createdAt)),
    db.select().from(follows).where(eq(follows.followedId, userId)),
  ]);
  const counts = await getReactionAndCommentCounts(ownPosts.map((post) => post.id), userId);
  const interactions = Array.from(counts.values()).reduce((total, item) => total + item.reactions + item.comments, 0);
  return {
    posts: ownPosts.length,
    interactions,
    followers: followerRows.length,
    views: 0,
    estimatedRevenue: 0,
    latestPost: ownPosts[0] ?? null,
  };
}
