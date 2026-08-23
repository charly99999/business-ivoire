import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getApiBaseUrl } from "@/constants/oauth";
import { useAuth } from "@/hooks/use-auth";
import { captureMySelfie, fetchSupabaseConversations, getMyBusinessProfile, isIdentityVerified, setMyCover, updateMyBusinessProfile, type SupabaseBusinessProfile } from "@/lib/supabase-business";
import { createSupabasePost, fetchPublicSocialPosts, recordSupabasePostShare, toggleSupabasePostReaction } from "@/lib/supabase-social";

export type FeedPost = { id: string; authorId: string; author: string; role: string; place: string; avatar?: string; publishedAt: string; text: string; image?: string; reactions: number; comments: number; reacted: boolean; tag: "Immobilier" | "Entrepreneuriat" | "Opportunité"; mediaType: "text" | "photo" | "reel" | "live"; };
export type Conversation = { id: string; name: string; preview: string; time: string; avatarUrl?: string; };
export type Profile = { name: string; category: string; location: string; followers: number; bio: string; avatarUri?: string; coverUri?: string; identityStatus: "pending" | "selfie_captured" | "approved" | "rejected"; phone?: string; contactEmail?: string; locked: boolean; };

type BusinessContextValue = {
  posts: FeedPost[]; profile: Profile; conversations: Conversation[]; notifications: Array<{ id: number; message: string; createdAt: Date; readAt: Date | null; actor: { displayName: string } | null; kind: string }>;
  authenticated: boolean; authLoading: boolean; authError: string | null; loading: boolean; identityReady: boolean; identityVerified: boolean; error: string | null; currentUserId?: string;
  refreshAll: () => Promise<void>; publishPost: (text: string, category: FeedPost["tag"], mediaImage?: string) => Promise<void>; toggleReaction: (id: string) => Promise<void>; recordPostShare: (id: string) => Promise<void>; setSelfie: (image: string) => Promise<void>; setCover: (image: string) => Promise<void>; updateProfile: (input: Partial<Pick<Profile, "name" | "bio" | "category" | "location" | "phone" | "contactEmail" | "locked">>) => Promise<void>; sendMessage: (id: number, body: string) => Promise<void>; markNotificationRead: (id: number) => Promise<void>; logout: () => Promise<void>; retryAuth: () => Promise<void>;
};

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined);
const emptyProfile: Profile = { name: "", category: "Immobilier & Entrepreneuriat", location: "Abidjan, Côte d’Ivoire", followers: 0, bio: "", identityStatus: "pending", locked: false };

function assetUrl(value?: string | null) { if (!value) return undefined; if (/^https?:\/\//.test(value) || value.startsWith("data:")) return value; return `${getApiBaseUrl()}${value}`; }
function initials(name: string) { return name.split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "BI"; }
function relativeTime(value: Date | string) { const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000)); return minutes < 1 ? "À l’instant" : minutes < 60 ? `Il y a ${minutes} min` : minutes < 1_440 ? `Il y a ${Math.floor(minutes / 60)} h` : `Il y a ${Math.floor(minutes / 1_440)} j`; }
function mapProfile(source: SupabaseBusinessProfile): Profile { return { name: source.displayName, category: source.category, location: source.location, followers: 0, bio: source.bio, avatarUri: source.avatarUrl, coverUri: source.coverUrl, identityStatus: source.identityStatus, phone: source.phone, contactEmail: source.contactEmail, locked: source.locked }; }

export function BusinessProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [identityReady, setIdentityReady] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const refreshAll = useCallback(async () => {
    try {
      setProfileLoading(true); setProfileError(null);
      const social = fetchPublicSocialPosts(auth.user?.id).then((items) => setPosts(items.map((post) => ({ ...post, tag: "Opportunité", mediaType: post.image ? "photo" : "text" }))));
      if (!auth.isAuthenticated) { setProfile(emptyProfile); setConversations([]); setIdentityReady(!auth.loading); await social; return; }
      setIdentityReady(false);
      const inbox = fetchSupabaseConversations().then(setConversations).catch(() => setConversations([]));
      const next = await getMyBusinessProfile(); setProfile(next ? mapProfile(next) : emptyProfile); await Promise.all([social, inbox]);
    }
    catch (error) { setProfileError(error instanceof Error ? error.message : "Profil Supabase indisponible."); }
    finally { setProfileLoading(false); setIdentityReady(true); }
  }, [auth.isAuthenticated, auth.loading]);

  useEffect(() => { void refreshAll(); }, [refreshAll]);

  const unavailable = async () => { throw new Error("Cette fonction est en cours de migration vers Supabase."); };
  const value = useMemo<BusinessContextValue>(() => ({
    posts, profile, conversations, notifications: [], authenticated: auth.isAuthenticated, authLoading: auth.loading, authError: auth.error?.message ?? null, loading: profileLoading, identityReady, identityVerified: isIdentityVerified(profile.identityStatus), error: profileError, currentUserId: auth.user?.id,
    refreshAll,
    publishPost: async (text, _category, mediaImage) => { await createSupabasePost(text, mediaImage); await refreshAll(); },
    toggleReaction: async (id) => { await toggleSupabasePostReaction(id); await refreshAll(); },
    recordPostShare: async (id) => { await recordSupabasePostShare(id); await refreshAll(); },
    setSelfie: async (image) => { await captureMySelfie(image); await refreshAll(); },
    setCover: async (image) => { await setMyCover(image); await refreshAll(); },
    updateProfile: async (input) => { await updateMyBusinessProfile({ displayName: input.name, bio: input.bio, category: input.category, location: input.location, phone: input.phone, contactEmail: input.contactEmail, locked: input.locked }); await refreshAll(); },
    sendMessage: unavailable,
    markNotificationRead: unavailable,
    logout: auth.logout,
    retryAuth: auth.refresh,
  }), [auth.error?.message, auth.isAuthenticated, auth.loading, auth.logout, auth.refresh, auth.user?.id, conversations, identityReady, posts, profile, profileError, profileLoading, refreshAll]);

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() { const context = useContext(BusinessContext); if (!context) throw new Error("useBusiness doit être utilisé dans BusinessProvider"); return context; }
export { assetUrl, relativeTime, initials };
