import { createContext, useContext, useMemo, type ReactNode } from "react";

import { getApiBaseUrl } from "@/constants/oauth";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

export type FeedPost = {
  id: number;
  author: string;
  role: string;
  place: string;
  avatar: string;
  publishedAt: string;
  text: string;
  image?: string;
  reactions: number;
  comments: number;
  reacted: boolean;
  tag: "Immobilier" | "Entrepreneuriat" | "Opportunité";
  mediaType: "text" | "photo" | "reel" | "live";
};

export type Conversation = {
  id: number;
  name: string;
  initials: string;
  preview: string;
  time: string;
  unread: number;
  color: string;
};

export type Profile = {
  name: string;
  category: string;
  location: string;
  followers: number;
  bio: string;
  selfieUri?: string;
  coverUri?: string;
  identityStatus: "pending" | "selfie_captured" | "approved" | "rejected";
  phone?: string;
  contactEmail?: string;
  locked: boolean;
};

type BusinessContextValue = {
  posts: FeedPost[];
  profile: Profile;
  conversations: Conversation[];
  notifications: Array<{ id: number; message: string; createdAt: Date; readAt: Date | null; actor: { displayName: string } | null; kind: string }>;
  authenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  loading: boolean;
  error: string | null;
  currentUserId?: number;
  refreshAll: () => Promise<void>;
  publishPost: (text: string, category: FeedPost["tag"], mediaImage?: string) => Promise<void>;
  toggleReaction: (id: number) => Promise<void>;
  setSelfie: (image: string) => Promise<void>;
  setCover: (image: string) => Promise<void>;
  updateProfile: (input: Partial<Pick<Profile, "name" | "bio" | "category" | "location" | "phone" | "contactEmail" | "locked">>) => Promise<void>;
  sendMessage: (id: number, body: string) => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
  logout: () => Promise<void>;
  retryAuth: () => Promise<void>;
};

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined);

function assetUrl(value?: string | null) {
  if (!value) return undefined;
  if (/^https?:\/\//.test(value) || value.startsWith("data:")) return value;
  return `${getApiBaseUrl()}${value}`;
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "BI";
}

function relativeTime(value: Date | string) {
  const date = new Date(value);
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (minutes < 1) return "À l’instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  return `Il y a ${Math.floor(hours / 24)} j`;
}

export function BusinessProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const enabled = auth.isAuthenticated;
  const profileQuery = trpc.profile.mine.useQuery(undefined, { enabled });
  const feedQuery = trpc.feed.list.useQuery(undefined, { enabled });
  const conversationQuery = trpc.conversations.list.useQuery(undefined, { enabled });
  const notificationQuery = trpc.notifications.list.useQuery(undefined, { enabled });
  const publishMutation = trpc.feed.create.useMutation();
  const reactionMutation = trpc.feed.react.useMutation();
  const selfieMutation = trpc.profile.captureSelfie.useMutation();
  const coverMutation = trpc.profile.setCover.useMutation();
  const profileMutation = trpc.profile.update.useMutation();
  const messageMutation = trpc.conversations.send.useMutation();
  const readMutation = trpc.notifications.markRead.useMutation();

  const profile = useMemo<Profile>(() => {
    const data = profileQuery.data;
    if (!data) return {
      name: "",
      category: "Immobilier & Entrepreneuriat",
      location: "Abidjan, Côte d’Ivoire",
      followers: 0,
      bio: "",
      identityStatus: "pending",
      locked: false,
    };
    return {
      name: data.profile.displayName,
      category: data.profile.category,
      location: data.profile.location,
      followers: data.followerCount,
      bio: data.profile.bio ?? "",
      selfieUri: assetUrl(data.profile.selfieUrl),
      coverUri: assetUrl(data.profile.coverUrl),
      identityStatus: data.profile.identityStatus,
      phone: data.profile.phone ?? undefined,
      contactEmail: data.profile.contactEmail ?? undefined,
      locked: data.profile.profileLocked,
    };
  }, [profileQuery.data]);

  const posts = useMemo<FeedPost[]>(() => (feedQuery.data ?? []).map((post) => ({
    id: post.id,
    author: post.author.displayName,
    role: post.author.category,
    place: post.author.location,
    avatar: initials(post.author.displayName),
    publishedAt: relativeTime(post.createdAt),
    text: post.body,
    image: assetUrl(post.mediaUrl),
    reactions: post.reactions,
    comments: post.comments,
    reacted: post.reacted,
    tag: post.category,
    mediaType: post.type,
  })), [feedQuery.data]);

  const conversations = useMemo<Conversation[]>(() => (conversationQuery.data ?? []).map((conversation, index) => {
    const counterpart = conversation.members.find((member) => member.userId !== auth.user?.id) ?? conversation.members[0];
    const name = conversation.title || counterpart?.displayName || "Conversation";
    return {
      id: conversation.id,
      name,
      initials: initials(name),
      preview: conversation.latestMessage?.body ?? "Aucun message pour le moment.",
      time: conversation.latestMessage ? relativeTime(conversation.latestMessage.createdAt) : "",
      unread: 0,
      color: ["#0B6E8A", "#E8752B", "#1D8A5B", "#805AD5"][index % 4],
    };
  }), [auth.user?.id, conversationQuery.data]);

  const refreshAll = async () => {
    await Promise.all([
      utils.profile.mine.invalidate(),
      utils.feed.list.invalidate(),
      utils.conversations.list.invalidate(),
      utils.notifications.list.invalidate(),
      utils.dashboard.mine.invalidate(),
    ]);
  };

  const value = useMemo<BusinessContextValue>(() => ({
    posts,
    profile,
    conversations,
    notifications: notificationQuery.data ?? [],
    authenticated: auth.isAuthenticated,
    authLoading: auth.loading,
    authError: auth.error?.message ?? null,
    loading: profileQuery.isLoading || feedQuery.isLoading || conversationQuery.isLoading || notificationQuery.isLoading,
    error: [profileQuery.error, feedQuery.error, conversationQuery.error, notificationQuery.error].find(Boolean)?.message ?? null,
    currentUserId: auth.user?.id,
    refreshAll,
    publishPost: async (text, category, mediaImage) => {
      await publishMutation.mutateAsync({ body: text, category, type: mediaImage ? "photo" : "text", mediaImage });
      await utils.feed.list.invalidate();
      await utils.dashboard.mine.invalidate();
    },
    toggleReaction: async (id) => {
      await reactionMutation.mutateAsync({ postId: id });
      await utils.feed.list.invalidate();
    },
    setSelfie: async (image) => {
      await selfieMutation.mutateAsync({ image });
      await utils.profile.mine.invalidate();
    },
    setCover: async (image) => {
      await coverMutation.mutateAsync({ image });
      await utils.profile.mine.invalidate();
    },
    updateProfile: async (input) => {
      await profileMutation.mutateAsync({
        displayName: input.name,
        bio: input.bio,
        category: input.category,
        location: input.location,
        phone: input.phone,
        contactEmail: input.contactEmail,
        profileLocked: input.locked,
      });
      await utils.profile.mine.invalidate();
    },
    sendMessage: async (id, body) => {
      await messageMutation.mutateAsync({ conversationId: id, body });
      await utils.conversations.list.invalidate();
      await utils.conversations.messages.invalidate({ conversationId: id });
    },
    markNotificationRead: async (id) => {
      await readMutation.mutateAsync({ id });
      await utils.notifications.list.invalidate();
    },
    logout: auth.logout,
    retryAuth: auth.refresh,
  }), [auth.error?.message, auth.isAuthenticated, auth.loading, auth.logout, auth.refresh, auth.user?.id, conversationQuery.isLoading, conversations, coverMutation, feedQuery.error, feedQuery.isLoading, messageMutation, notificationQuery.data, notificationQuery.error, notificationQuery.isLoading, posts, profile, profileQuery.error, profileQuery.isLoading, profileMutation, publishMutation, reactionMutation, readMutation, selfieMutation, utils]);

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) throw new Error("useBusiness doit être utilisé dans BusinessProvider");
  return context;
}

export { assetUrl, relativeTime };
