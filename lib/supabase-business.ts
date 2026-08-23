import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

import { supabase, supabaseAnonKey, supabaseUrl } from "@/lib/supabase";

type IdentityStatus = "pending" | "selfie_captured" | "approved" | "rejected";

async function describeSelfieError(error: unknown) {
  if (error instanceof Error && error.message && !/non-2xx|failed to fetch/i.test(error.message)) return error.message;
  const context = error && typeof error === "object" && "context" in error ? (error as { context?: unknown }).context : undefined;
  if (context && typeof (context as { clone?: unknown }).clone === "function") {
    const response = context as Response;
    const body = await response.clone().json().catch(() => null) as { error?: unknown; message?: unknown } | null;
    const serverMessage = body && (typeof body.error === "string" ? body.error : typeof body.message === "string" ? body.message : undefined);
    if (serverMessage) return serverMessage;
  }
  return "Le serveur n’a pas pu confirmer votre selfie. Vérifiez votre session et votre connexion, puis réessayez.";
}

export type SupabaseBusinessProfile = {
  id: string;
  displayName: string;
  bio: string;
  category: string;
  location: string;
  phone?: string;
  contactEmail?: string;
  coverUrl?: string;
  avatarUrl?: string;
  locked: boolean;
  identityStatus: IdentityStatus;
};

function publicCoverUrl(path?: string | null) {
  return path ? supabase.storage.from("profile-covers").getPublicUrl(path).data.publicUrl : undefined;
}

function publicAvatarUrl(path?: string | null) {
  return path ? supabase.storage.from("profile-avatars").getPublicUrl(path).data.publicUrl : undefined;
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Connexion requise.");
  return data.user.id;
}

export function isIdentityVerified(status?: IdentityStatus | null) {
  return status === "selfie_captured" || status === "approved";
}

async function requireCapturedSelfie() {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("identity_verifications")
    .select("status")
    .eq("profile_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!isIdentityVerified(data?.status as IdentityStatus | undefined)) {
    throw new Error("Prenez d’abord votre selfie en direct pour accéder à cette fonctionnalité.");
  }
  return userId;
}

async function dataUriToBlob(dataUri: string) {
  const response = await fetch(dataUri);
  if (!response.ok) throw new Error("Lecture de l’image impossible.");
  return response.blob();
}

function contentTypeForExtension(extension: string) {
  return `image/${extension === "jpg" ? "jpeg" : extension}`;
}

async function uploadCapturedSelfie(path: string, dataUri: string, extension: string) {
  const contentType = contentTypeForExtension(extension);
  console.info("[identity] selfie upload started", { platform: Platform.OS, path });

  if (Platform.OS === "web") {
    const { error } = await supabase.storage
      .from("identity-selfies")
      .upload(path, await dataUriToBlob(dataUri), { contentType });
    if (error) throw error;
    console.info("[identity] selfie private upload completed", { path });
    return;
  }

  const encoded = dataUri.split(",")[1];
  if (!encoded) throw new Error("Le fichier selfie ne contient aucune image exploitable.");
  const temporaryUri = `${FileSystem.cacheDirectory}business-ivoire-selfie-${Date.now()}.${extension}`;
  try {
    await FileSystem.writeAsStringAsync(temporaryUri, encoded, { encoding: FileSystem.EncodingType.Base64 });
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (sessionError || !accessToken) throw new Error("Votre session Supabase a expiré. Reconnectez-vous puis réessayez.");
    const upload = await FileSystem.uploadAsync(
      `${supabaseUrl}/storage/v1/object/identity-selfies/${path}`,
      temporaryUri,
      {
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: supabaseAnonKey ?? "",
          "Content-Type": contentType,
          "x-upsert": "false",
        },
      },
    );
    if (upload.status < 200 || upload.status >= 300) {
      throw new Error(`Téléversement du selfie refusé par Supabase (HTTP ${upload.status}).`);
    }
    console.info("[identity] selfie private upload completed", { path, status: upload.status });
  } finally {
    await FileSystem.deleteAsync(temporaryUri, { idempotent: true }).catch(() => undefined);
  }
}

function extensionForDataUri(dataUri: string) {
  if (dataUri.startsWith("data:image/png")) return "png";
  if (dataUri.startsWith("data:image/webp")) return "webp";
  return "jpg";
}

export async function getMyBusinessProfile(): Promise<SupabaseBusinessProfile | null> {
  const userId = await currentUserId();
  const [{ data: profile, error: profileError }, { data: identity, error: identityError }] = await Promise.all([
    supabase.from("profiles").select("id,display_name,bio,category,location,phone,contact_email,cover_path,avatar_path,profile_locked").eq("id", userId).maybeSingle(),
    supabase.from("identity_verifications").select("status").eq("profile_id", userId).maybeSingle(),
  ]);
  if (profileError) throw profileError;
  if (identityError) throw identityError;
  if (!profile) return null;
  return {
    id: profile.id,
    displayName: profile.display_name,
    bio: profile.bio ?? "",
    category: profile.category,
    location: profile.location,
    phone: profile.phone ?? undefined,
    contactEmail: profile.contact_email ?? undefined,
    coverUrl: publicCoverUrl(profile.cover_path),
    avatarUrl: publicAvatarUrl(profile.avatar_path),
    locked: profile.profile_locked,
    identityStatus: (identity?.status ?? "pending") as IdentityStatus,
  };
}

export async function updateMyBusinessProfile(input: Partial<Pick<SupabaseBusinessProfile, "displayName" | "bio" | "category" | "location" | "phone" | "contactEmail" | "locked">>) {
  const userId = await currentUserId();
  const { error } = await supabase.from("profiles").update({
    display_name: input.displayName,
    bio: input.bio,
    category: input.category,
    location: input.location,
    phone: input.phone,
    contact_email: input.contactEmail,
    profile_locked: input.locked,
  }).eq("id", userId);
  if (error) throw error;
}

export async function setMyCover(dataUri: string) {
  const userId = await currentUserId();
  const extension = extensionForDataUri(dataUri);
  const path = `${userId}/cover-${Date.now()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("profile-covers").upload(path, await dataUriToBlob(dataUri), { contentType: `image/${extension === "jpg" ? "jpeg" : extension}` });
  if (uploadError) throw uploadError;
  const { error: profileError } = await supabase.from("profiles").update({ cover_path: path }).eq("id", userId);
  if (profileError) throw profileError;
  return publicCoverUrl(path);
}

export async function captureMySelfie(dataUri: string) {
  try {
    const userId = await currentUserId();
    const extension = extensionForDataUri(dataUri);
    const path = `${userId}/selfie-${Date.now()}.${extension}`;
    await uploadCapturedSelfie(path, dataUri, extension);
    console.info("[identity] capture-selfie function invoked", { path });
    const { data, error } = await supabase.functions.invoke("capture-selfie", { body: { selfiePath: path } });
    if (error) throw error;
    if (data?.identityStatus !== "selfie_captured") throw new Error("Vérification selfie non confirmée.");
    console.info("[identity] capture-selfie function completed", { path });
    return data.identityStatus as IdentityStatus;
  } catch (error) {
    throw new Error(await describeSelfieError(error));
  }
}

export async function createSupabaseListing(input: { title: string; description: string; price: number; category: string; location: string; condition: "new" | "used" | "service"; images: string[] }) {
  if (input.images.length < 1 || input.images.length > 8) throw new Error("Ajoutez entre 1 et 8 photos.");
  const userId = await requireCapturedSelfie();
  const { data: listing, error: listingError } = await supabase.from("listings").insert({
    seller_id: userId,
    title: input.title,
    description: input.description,
    price_fcfa: input.price,
    category: input.category,
    location: input.location,
    condition: input.condition,
  }).select("id").single();
  if (listingError || !listing) throw listingError ?? new Error("Création de l’annonce impossible.");

  const imageRows: Array<{ listing_id: string; storage_path: string; sort_order: number }> = [];
  for (const [sortOrder, image] of input.images.entries()) {
    const extension = extensionForDataUri(image);
    const path = `${userId}/${listing.id}/${sortOrder}-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("listing-media").upload(path, await dataUriToBlob(image), { contentType: `image/${extension === "jpg" ? "jpeg" : extension}` });
    if (uploadError) throw uploadError;
    imageRows.push({ listing_id: listing.id, storage_path: path, sort_order: sortOrder });
  }
  const { error: imagesError } = await supabase.from("listing_images").insert(imageRows);
  if (imagesError) throw imagesError;
  return listing.id as string;
}

export async function toggleSupabaseFavorite(listingId: string) {
  const userId = await currentUserId();
  const { data: existing, error: lookupError } = await supabase.from("listing_favorites").select("listing_id").eq("listing_id", listingId).eq("user_id", userId).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) {
    const { error } = await supabase.from("listing_favorites").delete().eq("listing_id", listingId).eq("user_id", userId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase.from("listing_favorites").insert({ listing_id: listingId, user_id: userId });
  if (error) throw error;
  return true;
}

export async function createDirectSupabaseConversation(recipientId: string, listingId?: string) {
  await requireCapturedSelfie();
  const { data, error } = await supabase.functions.invoke("create-direct-conversation", { body: { recipientId, listingId } });
  if (error) throw error;
  if (!data?.id || typeof data.id !== "string") throw new Error("Conversation non créée.");
  return data.id as string;
}

export async function sendSupabaseMessage(conversationId: string, body: string) {
  const userId = await requireCapturedSelfie();
  const message = body.trim();
  if (!message) throw new Error("Message vide.");
  const { error } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: userId, body: message });
  if (error) throw error;
}

export async function fetchSupabaseMessages(conversationId: string) {
  const { data, error } = await supabase.from("messages").select("id,sender_id,body,created_at").eq("conversation_id", conversationId).order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
