"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { MODEL_DEFAULTS_TABLE, invalidateModelDefaultsCache, type ModelClassification, type ModelDefaultRow } from "@/lib/modelDefaults";
import { CUSTOM_MODELS_TABLE, invalidateCustomModelsCache, type CustomModelRow } from "@/lib/customModels";

function purgeModelCaches() {
  invalidateModelDefaultsCache();
  invalidateCustomModelsCache();
  try {
    revalidatePath("/", "layout");
    revalidatePath("/invitations");
    revalidatePath("/create");
    revalidatePath("/admin/modeles");
  } catch {
    // ignore
  }
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Clé de service Supabase manquante (SUPABASE_SERVICE_ROLE_KEY).");
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/** Vérifie que l'utilisateur actuel est bien connecté en tant qu'administrateur */
async function verifyAdmin(): Promise<string> {
  const userClient = await createServerClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    throw new Error("Session expirée. Veuillez vous reconnecter.");
  }
  const adminClient = getAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    throw new Error("Action réservée aux administrateurs Evenium.");
  }
  return user.id;
}

/** Écrit dans la table des modèles par défaut sans être bloqué par les RLS */
async function writeModelDefault(payload: Record<string, unknown>) {
  const client = getAdminClient();
  let { error } = await client.from(MODEL_DEFAULTS_TABLE).upsert(payload, { onConflict: "model_id" });
  if (error && error.message?.includes("name") && "name" in payload) {
    const { name: _omitted, ...fallback } = payload;
    const retry = await client.from(MODEL_DEFAULTS_TABLE).upsert(fallback, { onConflict: "model_id" });
    error = retry.error;
  }
  if (error) {
    throw new Error(error.message);
  }
}

/** Enregistre un brouillon de modèle (sans le publier) */
export async function saveModelDraftAction(modelId: string, content: object, customName?: string): Promise<void> {
  const userId = await verifyAdmin();
  const cleanName = customName?.trim() || (content as Record<string, unknown>)?.model_name;
  const enriched = cleanName ? { ...content, model_name: cleanName } : content;
  const payload: Record<string, unknown> = {
    model_id: modelId,
    draft_content: enriched,
    updated_at: new Date().toISOString(),
    updated_by: userId,
  };
  if (typeof cleanName === "string" && cleanName.trim()) {
    payload.name = cleanName.trim();
  }
  await writeModelDefault(payload);
}

/** Publie un modèle sur le site */
export async function publishModelAction(modelId: string, content: object, customName?: string): Promise<void> {
  const userId = await verifyAdmin();
  const now = new Date().toISOString();
  const cleanName = customName?.trim() || (content as Record<string, unknown>)?.model_name;
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
  if (typeof cleanName === "string" && cleanName.trim()) {
    payload.name = cleanName.trim();
  }
  await writeModelDefault(payload);
  purgeModelCaches();
}

/** Renomme un modèle */
export async function saveModelNameAction(modelId: string, name: string): Promise<void> {
  const userId = await verifyAdmin();
  const client = getAdminClient();
  const cleanName = name.trim();
  const existing = await client.from(MODEL_DEFAULTS_TABLE).select("content, draft_content").eq("model_id", modelId).maybeSingle();
  const existingContent = (existing.data?.content && typeof existing.data.content === "object" ? existing.data.content : {}) as Record<string, unknown>;
  const existingDraft = (existing.data?.draft_content && typeof existing.data.draft_content === "object" ? existing.data.draft_content : {}) as Record<string, unknown>;

  const payload: Record<string, unknown> = {
    model_id: modelId,
    name: cleanName,
    content: { ...existingContent, model_name: cleanName },
    draft_content: { ...existingDraft, model_name: cleanName },
    updated_at: new Date().toISOString(),
    updated_by: userId,
  };
  await writeModelDefault(payload);
  purgeModelCaches();
}

/** Change la classification d'un modèle */
export async function saveModelClassificationAction(modelId: string, classification: ModelClassification): Promise<void> {
  const userId = await verifyAdmin();
  const payload: Record<string, unknown> = {
    model_id: modelId,
    invitation_type: classification.type,
    event_types: classification.events,
    updated_at: new Date().toISOString(),
    updated_by: userId,
  };
  await writeModelDefault(payload);
  purgeModelCaches();
}

/** Change la couverture d'un modèle */
export async function saveModelCoverAction(modelId: string, coverUrl: string): Promise<void> {
  const userId = await verifyAdmin();
  const client = getAdminClient();
  const existing = await client.from(MODEL_DEFAULTS_TABLE).select("content, draft_content").eq("model_id", modelId).maybeSingle();
  const existingContent = (existing.data?.content && typeof existing.data.content === "object" ? existing.data.content : {}) as Record<string, unknown>;
  const existingDraft = (existing.data?.draft_content && typeof existing.data.draft_content === "object" ? existing.data.draft_content : {}) as Record<string, unknown>;

  const payload: Record<string, unknown> = {
    model_id: modelId,
    content: { ...existingContent, model_cover: coverUrl },
    draft_content: { ...existingDraft, model_cover: coverUrl },
    updated_at: new Date().toISOString(),
    updated_by: userId,
  };
  await writeModelDefault(payload);
  purgeModelCaches();
}

/** Masque ou affiche un modèle sur le site */
export async function setModelHiddenAction(modelId: string, hidden: boolean): Promise<void> {
  const userId = await verifyAdmin();
  const client = getAdminClient();
  const existing = await client.from(MODEL_DEFAULTS_TABLE).select("content, draft_content, name").eq("model_id", modelId).maybeSingle();
  const payload: Record<string, unknown> = {
    model_id: modelId,
    is_hidden: hidden,
    content: existing.data?.content ?? {},
    draft_content: existing.data?.draft_content ?? null,
    updated_at: new Date().toISOString(),
    updated_by: userId,
  };
  if (existing.data?.name) payload.name = existing.data.name;
  await writeModelDefault(payload);
  purgeModelCaches();
}

/** Marque un modèle comme supprimé ou restauré */
export async function setModelDeletedAction(modelId: string, deleted: boolean): Promise<void> {
  const userId = await verifyAdmin();
  const client = getAdminClient();
  const existing = await client.from(MODEL_DEFAULTS_TABLE).select("content, draft_content, name").eq("model_id", modelId).maybeSingle();
  const c = (existing.data?.content && typeof existing.data.content === "object" ? existing.data.content : {}) as Record<string, unknown>;
  const d = (existing.data?.draft_content && typeof existing.data.draft_content === "object" ? existing.data.draft_content : {}) as Record<string, unknown>;

  const payload: Record<string, unknown> = {
    model_id: modelId,
    content: { ...c, model_deleted: deleted },
    draft_content: { ...d, model_deleted: deleted },
    is_hidden: deleted,
    updated_at: new Date().toISOString(),
    updated_by: userId,
  };
  if (existing.data?.name) payload.name = existing.data.name;
  await writeModelDefault(payload);
  purgeModelCaches();
}

/** Rétablit la version d'origine d'un modèle */
export async function resetModelDefaultAction(modelId: string, resetName = false): Promise<void> {
  await verifyAdmin();
  const client = getAdminClient();
  if (resetName) {
    await client.from(MODEL_DEFAULTS_TABLE).delete().eq("model_id", modelId);
  } else {
    await client.from(MODEL_DEFAULTS_TABLE).update({
      content: null,
      draft_content: null,
      is_hidden: false,
      published_at: null,
      updated_at: new Date().toISOString(),
    }).eq("model_id", modelId);
  }
  purgeModelCaches();
}

/** Met à jour un modèle importé (ZIP/HTML) */
export async function saveCustomModelAction(slug: string, patch: Partial<CustomModelRow>): Promise<void> {
  await verifyAdmin();
  const client = getAdminClient();
  const { error } = await client
    .from(CUSTOM_MODELS_TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("slug", slug);
  if (error) {
    throw new Error(error.message);
  }
  purgeModelCaches();
}

/** Enregistre un nouveau modèle importé */
export async function insertCustomModelAction(row: Omit<CustomModelRow, "updated_at" | "published_at" | "draft_content">): Promise<void> {
  await verifyAdmin();
  const client = getAdminClient();
  const { error } = await client.from(CUSTOM_MODELS_TABLE).insert(row);
  if (error) {
    throw new Error(error.message);
  }
  purgeModelCaches();
}
