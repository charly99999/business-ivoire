import { supabase } from "@/lib/supabase";

function dataUriToBlob(dataUri: string) {
  const [header, encoded] = dataUri.split(",");
  const mime = header?.match(/data:(.*?);base64/)?.[1] ?? "image/jpeg";
  const binary = atob(encoded ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: mime });
}

function extensionForDataUri(dataUri: string) {
  const mime = dataUri.match(/data:(.*?);base64/)?.[1] ?? "image/jpeg";
  return mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
}

export type SocialPost = {
  id: string;
  authorId: string;
  author: string;
  role: string;
  place: string;
  avatar?: string;
  publishedAt: string;
  text: string;
  image?: string;
  reactions: number;
  comments: number;
  reacted: boolean;
};

export type SocialComment = { id: string; author: string; avatar?: string; body: string; createdAt: string };

type PostRow = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
  profiles?: { display_name?: string | null; category?: string | null; location?: string | null; avatar_path?: string | null } | null;
  post_media?: Array<{ storage_path: string; sort_order: number }>;
  post_reactions?: Array<{ user_id: string }>;
  post_comments?: Array<{ id: string }>;
  post_shares?: Array<{ user_id: string }>;
};

function avatarUrl(path?: string | null) {
  return path ? supabase.storage.from("profile-avatars").getPublicUrl(path).data.publicUrl : undefined;
}

function mediaUrl(path?: string | null) {
  return path ? supabase.storage.from("post-media").getPublicUrl(path).data.publicUrl : undefined;
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Connexion requise.");
  return data.user.id;
}

async function requireVerifiedUser() {
  const userId = await currentUserId();
  const { data, error } = await supabase.from("identity_verifications").select("status").eq("profile_id", userId).maybeSingle();
  if (error) throw error;
  if (data?.status !== "selfie_captured" && data?.status !== "approved") {
    throw new Error("Prenez d’abord votre selfie direct pour utiliser le fil Business Ivoire.");
  }
  return userId;
}

export async function fetchPublicSocialPosts(viewerId?: string, limit = 20): Promise<SocialPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id,author_id,body,created_at,profiles!posts_author_id_fkey(display_name,category,location,avatar_path),post_media(storage_path,sort_order),post_reactions(user_id),post_comments(id),post_shares(user_id)")
    .eq("status", "published")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as PostRow[]).map((post) => {
    const firstMedia = [...(post.post_media ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];
    return {
      id: post.id,
      authorId: post.author_id,
      author: post.profiles?.display_name || "Membre Business Ivoire",
      role: post.profiles?.category || "Membre vérifié",
      place: post.profiles?.location || "Côte d’Ivoire",
      avatar: avatarUrl(post.profiles?.avatar_path),
      publishedAt: post.created_at,
      text: post.body,
      image: mediaUrl(firstMedia?.storage_path),
      reactions: post.post_reactions?.length ?? 0,
      comments: post.post_comments?.length ?? 0,
      reacted: Boolean(viewerId && post.post_reactions?.some((reaction) => reaction.user_id === viewerId)),
    };
  });
}

export async function createSupabasePost(body: string, mediaImage?: string) {
  const userId = await requireVerifiedUser();
  const content = body.trim();
  if (content.length < 1 || content.length > 3000) throw new Error("Votre publication doit contenir entre 1 et 3 000 caractères.");
  const { data, error } = await supabase.from("posts").insert({ author_id: userId, body: content }).select("id").single();
  if (error || !data) throw error ?? new Error("Publication impossible.");
  if (!mediaImage) return data.id as string;
  try {
    const extension = extensionForDataUri(mediaImage);
    const path = `${userId}/${data.id}/0-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("post-media").upload(path, dataUriToBlob(mediaImage), { contentType: extension === "jpg" ? "image/jpeg" : `image/${extension}` });
    if (uploadError) throw uploadError;
    const { error: mediaError } = await supabase.from("post_media").insert({ post_id: data.id, storage_path: path, media_type: "image", sort_order: 0 });
    if (mediaError) {
      await supabase.storage.from("post-media").remove([path]);
      throw mediaError;
    }
    return data.id as string;
  } catch (mediaError) {
    await supabase.from("posts").delete().eq("id", data.id);
    throw mediaError;
  }
}

export async function toggleSupabasePostReaction(postId: string) {
  const userId = await requireVerifiedUser();
  const { data: existing, error: lookupError } = await supabase.from("post_reactions").select("post_id").eq("post_id", postId).eq("user_id", userId).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) {
    const { error } = await supabase.from("post_reactions").delete().eq("post_id", postId).eq("user_id", userId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase.from("post_reactions").insert({ post_id: postId, user_id: userId, reaction: "like" });
  if (error) throw error;
  return true;
}

export async function fetchSupabasePostComments(postId: string): Promise<SocialComment[]> {
  const { data, error } = await supabase
    .from("post_comments")
    .select("id,body,created_at,profiles!post_comments_author_id_fkey(display_name,avatar_path)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((comment: { id: string; body: string; created_at: string; profiles?: { display_name?: string | null; avatar_path?: string | null } | Array<{ display_name?: string | null; avatar_path?: string | null }> | null }) => {
    const author = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles;
    return { id: comment.id, body: comment.body, createdAt: comment.created_at, author: author?.display_name || "Membre Business Ivoire", avatar: avatarUrl(author?.avatar_path) };
  });
}

export async function createSupabasePostComment(postId: string, body: string) {
  const userId = await requireVerifiedUser();
  const content = body.trim();
  if (content.length < 1 || content.length > 1200) throw new Error("Votre commentaire doit contenir entre 1 et 1 200 caractères.");
  const { error } = await supabase.from("post_comments").insert({ post_id: postId, author_id: userId, body: content });
  if (error) throw error;
}

export async function recordSupabasePostShare(postId: string) {
  const userId = await requireVerifiedUser();
  const { error } = await supabase.from("post_shares").upsert({ post_id: postId, user_id: userId }, { onConflict: "post_id,user_id", ignoreDuplicates: true });
  if (error) throw error;
}
