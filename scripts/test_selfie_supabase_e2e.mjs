import "./load-env.js";
import { writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) throw new Error("Variables Supabase publiques indisponibles.");

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const email = `marcarnaudkonan2+businessivoire-selfie-e2e-${suffix}@gmail.com`;
const password = `BusinessIvoire!${suffix}Aa`;
const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const result = { email, userId: null, selfiePath: null, avatarPath: null, identityStatus: null, profileAvatarPath: null };

try {
  const { data: signupData, error: signupError } = await client.auth.signUp({
    email,
    password,
    options: { data: { display_name: "Selfie E2E Test" } },
  });
  if (signupError) throw signupError;
  if (!signupData.session || !signupData.user) {
    throw new Error("Aucune session de test créée : la confirmation e-mail Supabase est encore activée ou l’inscription est incomplète.");
  }

  const userId = signupData.user.id;
  const accessToken = signupData.session.access_token;
  const selfiePath = `${userId}/selfie-e2e-${suffix}.png`;
  result.userId = userId;
  result.selfiePath = selfiePath;

  const image = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL0DgAAAABJRU5ErkJggg==", "base64"));
  const uploadResponse = await fetch(`${url}/storage/v1/object/identity-selfies/${selfiePath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: anonKey,
      "Content-Type": "image/png",
      "x-upsert": "false",
    },
    body: image,
  });
  if (!uploadResponse.ok) throw new Error(`Upload privé échoué (HTTP ${uploadResponse.status}).`);

  const { data: functionData, error: functionError } = await client.functions.invoke("capture-selfie", {
    body: { selfiePath },
  });
  if (functionError) throw functionError;
  if (functionData?.identityStatus !== "selfie_captured" || typeof functionData.avatarPath !== "string") {
    throw new Error("La fonction n’a pas confirmé le statut selfie_captured et l’avatar public.");
  }
  result.identityStatus = functionData.identityStatus;
  result.avatarPath = functionData.avatarPath;

  const { data: identity, error: identityError } = await client
    .from("identity_verifications")
    .select("profile_id,selfie_path,status")
    .eq("profile_id", userId)
    .single();
  if (identityError || identity?.status !== "selfie_captured" || identity.selfie_path !== selfiePath) {
    throw new Error("La ligne identity_verifications attendue est absente ou invalide.");
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("avatar_path")
    .eq("id", userId)
    .single();
  if (profileError || profile?.avatar_path !== functionData.avatarPath) {
    throw new Error("profiles.avatar_path n’a pas été renseigné par la fonction selfie.");
  }
  result.profileAvatarPath = profile.avatar_path;

  console.log(JSON.stringify({ ok: true, ...result }));
  await writeFile("/tmp/business-ivoire-selfie-e2e-result.json", JSON.stringify({ ok: true, ...result }, null, 2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify({ ok: false, ...result, error: message }));
  await writeFile("/tmp/business-ivoire-selfie-e2e-result.json", JSON.stringify({ ok: false, ...result, error: message }, null, 2));
  process.exitCode = 1;
}
