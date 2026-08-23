import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ error: "Méthode non autorisée." }, 405);

  const authorization = request.headers.get("Authorization");
  if (!authorization) return response({ error: "Authentification requise." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return response({ error: "Configuration serveur indisponible." }, 500);

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData.user;
  if (userError || !user) return response({ error: "Session invalide." }, 401);

  const payload = await request.json().catch(() => null) as { selfiePath?: unknown } | null;
  const selfiePath = typeof payload?.selfiePath === "string" ? payload.selfiePath.trim() : "";
  const expectedPrefix = `${user.id}/`;
  if (!selfiePath.startsWith(expectedPrefix) || selfiePath.length > 512) {
    return response({ error: "Chemin de selfie invalide." }, 400);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: privateSelfie, error: selfieDownloadError } = await admin.storage
    .from("identity-selfies")
    .download(selfiePath);
  if (selfieDownloadError || !privateSelfie) {
    return response({ error: "Selfie privé introuvable." }, 400);
  }

  const extensionMatch = selfiePath.match(/\.([a-z0-9]{2,5})$/i);
  const extension = extensionMatch?.[1]?.toLowerCase() ?? "jpg";
  const avatarPath = `${user.id}/avatar-${Date.now()}.${extension}`;
  const contentType = privateSelfie.type || (extension === "jpg" ? "image/jpeg" : `image/${extension}`);
  const { error: avatarUploadError } = await admin.storage
    .from("profile-avatars")
    .upload(avatarPath, privateSelfie, { contentType, upsert: false });
  if (avatarUploadError) {
    return response({ error: "Création de l’avatar public impossible." }, 500);
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ avatar_path: avatarPath })
    .eq("id", user.id);
  if (profileError) {
    await admin.storage.from("profile-avatars").remove([avatarPath]);
    return response({ error: "Mise à jour du profil impossible." }, 500);
  }

  const { error: verificationError } = await admin.from("identity_verifications").upsert({
    profile_id: user.id,
    selfie_path: selfiePath,
    selfie_captured_at: new Date().toISOString(),
    status: "selfie_captured",
  }, { onConflict: "profile_id" });

  if (verificationError) return response({ error: "Enregistrement de la vérification impossible." }, 500);
  return response({ identityStatus: "selfie_captured", avatarPath });
});
