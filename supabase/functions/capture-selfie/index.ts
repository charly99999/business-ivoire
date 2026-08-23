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
  const { error: verificationError } = await admin.from("identity_verifications").upsert({
    profile_id: user.id,
    selfie_path: selfiePath,
    selfie_captured_at: new Date().toISOString(),
    status: "selfie_captured",
  }, { onConflict: "profile_id" });

  if (verificationError) return response({ error: "Enregistrement de la vérification impossible." }, 500);
  return response({ identityStatus: "selfie_captured" });
});
