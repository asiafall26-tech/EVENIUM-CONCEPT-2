import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { MODEL_DEFAULTS_TABLE } from "@/lib/modelDefaults";

export const dynamic = "force-dynamic";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Configuration Supabase manquante.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function verifyAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await admin().from("profiles").select("role").eq("id", user.id).single();
  return data?.role === "admin" ? user.id : null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyAdmin();
    if (!userId) return NextResponse.json({ error: "Réservé à l'administrateur." }, { status: 403 });
    const body = await req.json();
    const { action, modelId, content, customName, classification, coverUrl, hidden, deleted, reset, resetName } = body;
    const client = admin();

    if (action === "draft") {
      const cleanName = customName?.trim() || content?.model_name;
      const enriched = cleanName ? { ...content, model_name: cleanName } : content;
      const payload: Record<string, unknown> = {
        model_id: modelId,
        draft_content: enriched,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      };
      if (typeof cleanName === "string" && cleanName.trim()) payload.name = cleanName.trim();
      let { error } = await client.from(MODEL_DEFAULTS_TABLE).upsert(payload, { onConflict: "model_id" });
      if (error && error.message?.includes("name") && "name" in payload) {
        const { name: _omitted, ...fallback } = payload;
        const retry = await client.from(MODEL_DEFAULTS_TABLE).upsert(fallback, { onConflict: "model_id" });
        error = retry.error;
      }
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true });
    }

    if (action === "publish") {
      const now = new Date().toISOString();
      const cleanName = customName?.trim() || content?.model_name;
      const enriched = cleanName ? { ...content, model_name: cleanName } : content;
      const payload: Record<string, unknown> = {
        model_id: modelId,
        content: enriched,
        draft_content: enriched,
        is_hidden: false,
        updated_at: now,
        published_at: now,
        updated_by: userId,
      };
      if (typeof cleanName === "string" && cleanName.trim()) payload.name = cleanName.trim();
      let { error } = await client.from(MODEL_DEFAULTS_TABLE).upsert(payload, { onConflict: "model_id" });
      if (error && error.message?.includes("name") && "name" in payload) {
        const { name: _omitted, ...fallback } = payload;
        const retry = await client.from(MODEL_DEFAULTS_TABLE).upsert(fallback, { onConflict: "model_id" });
        error = retry.error;
      }
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Action non reconnue." }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur serveur." }, { status: 500 });
  }
}
