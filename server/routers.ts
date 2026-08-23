import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";

const recentWrites = new Map<string, number[]>();

function enforceRateLimit(userId: number, action: string, limit: number, windowMs: number) {
  if (recentWrites.size > 10_000) {
    const cutoff = Date.now() - windowMs;
    for (const [storedKey, timestamps] of recentWrites) {
      if (!timestamps.some((timestamp) => timestamp >= cutoff)) recentWrites.delete(storedKey);
    }
  }
  const key = `${userId}:${action}`;
  const now = Date.now();
  const kept = (recentWrites.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);
  if (kept.length >= limit) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Veuillez patienter avant de recommencer." });
  kept.push(now);
  recentWrites.set(key, kept);
}

function decodeImage(dataUri: string) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUri);
  if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Format d’image non pris en charge." });
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length === 0 || bytes.length > 3 * 1024 * 1024) {
    throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "L’image doit peser au maximum 3 Mo." });
  }
  const extension = match[1] === "image/png" ? "png" : match[1] === "image/webp" ? "webp" : "jpg";
  return { bytes, mimeType: match[1], extension };
}

async function storeImage(userId: number, purpose: "selfies" | "covers" | "posts" | "listings", dataUri: string) {
  const image = decodeImage(dataUri);
  return storagePut(`business-ivoire/${purpose}/${userId}/${Date.now()}.${image.extension}`, image.bytes, image.mimeType);
}

const categorySchema = z.enum(["Immobilier", "Entrepreneuriat", "Opportunité"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  profile: router({
    mine: protectedProcedure.query(({ ctx }) => db.getMyProfile(ctx.user.id, ctx.user.name)),
    update: protectedProcedure.input(z.object({
      displayName: z.string().trim().min(2).max(120).optional(),
      bio: z.string().trim().max(1200).optional(),
      category: z.string().trim().min(2).max(80).optional(),
      location: z.string().trim().min(2).max(160).optional(),
      phone: z.string().trim().max(40).optional(),
      contactEmail: z.string().trim().email().max(320).optional(),
      profileLocked: z.boolean().optional(),
    })).mutation(({ ctx, input }) => {
      enforceRateLimit(ctx.user.id, "profile", 10, 60_000);
      return db.updateMyProfile(ctx.user.id, ctx.user.name, input);
    }),
    captureSelfie: protectedProcedure.input(z.object({ image: z.string().min(50) })).mutation(async ({ ctx, input }) => {
      enforceRateLimit(ctx.user.id, "selfie", 3, 10 * 60_000);
      const stored = await storeImage(ctx.user.id, "selfies", input.image);
      return db.setProfileMedia(ctx.user.id, ctx.user.name, "selfie", stored.key, stored.url);
    }),
    setCover: protectedProcedure.input(z.object({ image: z.string().min(50) })).mutation(async ({ ctx, input }) => {
      enforceRateLimit(ctx.user.id, "cover", 6, 10 * 60_000);
      const stored = await storeImage(ctx.user.id, "covers", input.image);
      return db.setProfileMedia(ctx.user.id, ctx.user.name, "cover", stored.key, stored.url);
    }),
  }),
  feed: router({
    list: protectedProcedure.query(({ ctx }) => db.listFeed(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      body: z.string().trim().min(1).max(3000),
      category: categorySchema,
      type: z.enum(["text", "photo", "reel", "live"]).default("text"),
      mediaImage: z.string().min(50).optional(),
    })).mutation(async ({ ctx, input }) => {
      enforceRateLimit(ctx.user.id, "post", 8, 10 * 60_000);
      const media = input.mediaImage ? await storeImage(ctx.user.id, "posts", input.mediaImage) : undefined;
      return db.createPost(ctx.user.id, input.body, input.category, input.type, media);
    }),
    react: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).mutation(({ ctx, input }) => {
      enforceRateLimit(ctx.user.id, "reaction", 80, 60_000);
      return db.toggleReaction(ctx.user.id, input.postId);
    }),
    comments: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).query(({ input }) => db.listComments(input.postId)),
    comment: protectedProcedure.input(z.object({ postId: z.number().int().positive(), body: z.string().trim().min(1).max(1000) })).mutation(({ ctx, input }) => {
      enforceRateLimit(ctx.user.id, "comment", 20, 10 * 60_000);
      return db.addComment(ctx.user.id, input.postId, input.body);
    }),
  }),
  marketplace: router({
    list: protectedProcedure.query(({ ctx }) => db.listListings(ctx.user.id)),
    byId: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => db.getListing(input.id)),
    toggleFavorite: protectedProcedure.input(z.object({ listingId: z.number().int().positive() })).mutation(({ ctx, input }) => db.toggleListingFavorite(ctx.user.id, input.listingId)),
    create: protectedProcedure.input(z.object({ title: z.string().trim().min(3).max(160), description: z.string().trim().min(10).max(5000), price: z.number().int().positive(), category: z.string().trim().min(2).max(80), location: z.string().trim().min(2).max(160), condition: z.enum(["new", "used", "service"]), images: z.array(z.string().min(50)).min(1).max(8) })).mutation(async ({ ctx, input }) => {
      enforceRateLimit(ctx.user.id, "listing", 6, 60 * 60_000);
      const images = await Promise.all(input.images.map((image) => storeImage(ctx.user.id, "listings", image)));
      return db.createListing(ctx.user.id, { ...input, images: images.map((image) => ({ key: image.key, url: image.url })) });
    }),
  }),
  people: router({
    list: protectedProcedure.query(({ ctx }) => db.listPeople(ctx.user.id)),
    toggleFollow: protectedProcedure.input(z.object({ userId: z.number().int().positive() })).mutation(({ ctx, input }) => db.toggleFollow(ctx.user.id, input.userId)),
  }),
  groups: router({
    list: protectedProcedure.query(({ ctx }) => db.listGroups(ctx.user.id)),
    create: protectedProcedure.input(z.object({ name: z.string().trim().min(3).max(140), description: z.string().trim().min(10).max(1200), category: z.string().trim().min(2).max(80), location: z.string().trim().min(2).max(160) })).mutation(({ ctx, input }) => {
      enforceRateLimit(ctx.user.id, "group", 4, 60 * 60_000);
      return db.createGroup(ctx.user.id, input);
    }),
    toggleMembership: protectedProcedure.input(z.object({ groupId: z.number().int().positive() })).mutation(({ ctx, input }) => db.toggleGroupMembership(ctx.user.id, input.groupId)),
  }),
  notifications: router({
    list: protectedProcedure.query(({ ctx }) => db.listNotifications(ctx.user.id)),
    markRead: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => db.markNotificationRead(ctx.user.id, input.id)),
  }),
  conversations: router({
    list: protectedProcedure.query(({ ctx }) => db.listConversations(ctx.user.id)),
    createDirect: protectedProcedure.input(z.object({ userId: z.number().int().positive() })).mutation(({ ctx, input }) => db.createDirectConversation(ctx.user.id, input.userId)),
    messages: protectedProcedure.input(z.object({ conversationId: z.number().int().positive() })).query(({ ctx, input }) => db.listMessages(ctx.user.id, input.conversationId)),
    send: protectedProcedure.input(z.object({ conversationId: z.number().int().positive(), body: z.string().trim().min(1).max(2000) })).mutation(({ ctx, input }) => {
      enforceRateLimit(ctx.user.id, "message", 30, 60_000);
      return db.sendMessage(ctx.user.id, input.conversationId, input.body);
    }),
  }),
  dashboard: router({
    mine: protectedProcedure.query(({ ctx }) => db.getDashboard(ctx.user.id, ctx.user.name)),
  }),
});

export type AppRouter = typeof appRouter;
