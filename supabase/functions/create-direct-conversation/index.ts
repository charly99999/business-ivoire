import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Origin": "*" };
const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);
  const authorization = request.headers.get("Authorization");
  const url = Deno.env.get("SUPABASE_URL") ?? ""; const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? ""; const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!authorization || !url || !anon || !service) return json({ error: "Configuration indisponible." }, 500);
  const callerClient = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
  const { data: userData, error: userError } = await callerClient.auth.getUser();
  const user = userData.user;
  if (userError || !user) return json({ error: "Session invalide." }, 401);
  const payload = await request.json().catch(() => null) as { recipientId?: unknown; listingId?: unknown } | null;
  const recipientId = typeof payload?.recipientId === "string" ? payload.recipientId : "";
  const listingId = typeof payload?.listingId === "string" ? payload.listingId : null;
  if (!recipientId || recipientId === user.id) return json({ error: "Destinataire invalide." }, 400);
  const directKey = [user.id, recipientId].sort().join(":");
  const admin = createClient(url, service);
  const { data: recipient } = await admin.from("profiles").select("id").eq("id", recipientId).maybeSingle();
  if (!recipient) return json({ error: "Vendeur indisponible." }, 404);
  const { data: existing, error: existingError } = await admin.from("conversations").select("id").eq("direct_key", directKey).maybeSingle();
  if (existingError) return json({ error: "Recherche de conversation impossible." }, 500);
  if (existing) return json({ id: existing.id });
  const { data: conversation, error: createError } = await admin.from("conversations").insert({ kind: "direct", direct_key: directKey, listing_id: listingId }).select("id").single();
  if (createError || !conversation) return json({ error: "Ouverture de conversation impossible." }, 500);
  const { error: membersError } = await admin.from("conversation_members").insert([{ conversation_id: conversation.id, user_id: user.id }, { conversation_id: conversation.id, user_id: recipientId }]);
  if (membersError) return json({ error: "Ajout des participants impossible." }, 500);
  return json({ id: conversation.id });
});
