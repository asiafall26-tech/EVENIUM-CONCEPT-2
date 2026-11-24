"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { MODEL_DEFAULTS_TABLE, invalidateModelDefaultsCache, type ModelClassification, type ModelDefaultRow } from "@/lib/modelDefaults";
import { CUSTOM_MODELS_TABLE, invalidateCustomModelsCache, withoutMusicValues, type CustomField, type CustomModelRow } from "@/lib/customModels";
import { withoutMusic } from "@/lib/staticCard";

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

/** Désérialise les payloads volumineux ou imbriqués pour contourner la limite de récursion Flight de React */
function parsePayload<T>(input: T | string): T {
  if (typeof input === "string") {
    try {
      return JSON.parse(input) as T;
    } catch {
      return input as unknown as T;
    }
  }
  return input;
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
export async function saveModelDraftAction(modelId: string, contentOrJson: Record<string, unknown> | string, customName?: string): Promise<void> {
  const userId = await verifyAdmin();
  const content = parsePayload<Record<string, unknown>>(contentOrJson);
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
  purgeModelCaches();
}

/** Publie un modèle sur le site */
export async function publishModelAction(modelId: string, contentOrJson: Record<string, unknown> | string, customName?: string): Promise<void> {
  const userId = await verifyAdmin();
  const content = parsePayload<Record<string, unknown>>(contentOrJson);
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
export async function saveCustomModelAction(slug: string, patchOrJson: Partial<CustomModelRow> | string): Promise<void> {
  await verifyAdmin();
  const patch = parsePayload<Partial<CustomModelRow>>(patchOrJson);
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
export async function insertCustomModelAction(rowOrJson: Omit<CustomModelRow, "updated_at" | "published_at" | "draft_content"> | string): Promise<void> {
  await verifyAdmin();
  const row = parsePayload<Omit<CustomModelRow, "updated_at" | "published_at" | "draft_content">>(rowOrJson);
  const client = getAdminClient();
  const { error } = await client.from(CUSTOM_MODELS_TABLE).insert(row);
  if (error) {
    throw new Error(error.message);
  }
  purgeModelCaches();
}

/** Affecte directement un modèle à une catégorie précise */
export async function assignModelCategoryAction(modelId: string, categorySlug: string, categoryLabel?: string): Promise<void> {
  let type: any = "animée";
  let events: string[] = [];

  const officialEvents = [
    "Mariage",
    "Anniversaire de mariage",
    "Gala",
    "Conférence",
    "Noël",
    "Pâques",
    "Pentecôte",
    "Communion",
    "Demande en mariage",
    "Yendou",
    "Picnic",
    "Anniversaire",
    "Baptême",
    "Enterrement de vie de jeune fille",
    "Henné time",
  ];

  if (categorySlug === "invitations") {
    type = "animée";
    events = officialEvents;
  } else if (categorySlug === "voeux") {
    type = "voeu";
    events = officialEvents;
  } else if (categorySlug === "mots_doux") {
    type = "mot_doux";
    events = ["Demande en mariage", "Anniversaire de mariage", "Mariage"];
  } else if (categorySlug === "couple") {
    type = "couple";
    events = ["Demande en mariage", "Anniversaire de mariage", "Mariage"];
  } else {
    type = "animée";
    events = officialEvents;
  }

  if (modelId.startsWith("custom-")) {
    const slug = modelId.replace("custom-", "");
    await saveCustomModelAction(slug, {
      invitation_type: type,
      event_types: events,
    });
    return;
  }

  await saveModelClassificationAction(modelId, { type, events });
}

/** Supprime définitivement tout son ou musique d'origine sur un modèle */
export async function removeModelSoundAction(modelId: string): Promise<void> {
  const userId = await verifyAdmin();
  const now = new Date().toISOString();

  // 1. Modèle importé (ZIP / HTML)
  if (modelId.startsWith("custom-")) {
    const slug = modelId.replace("custom-", "");
    const client = getAdminClient();
    const { data: row } = await client.from(CUSTOM_MODELS_TABLE).select("*").eq("slug", slug).maybeSingle();
    if (row) {
      const fields = (row.fields ?? []) as CustomField[];
      const cleanContent = withoutMusicValues(fields, row.content ?? {});
      const cleanDraft = row.draft_content ? withoutMusicValues(fields, row.draft_content) : null;
      await client
        .from(CUSTOM_MODELS_TABLE)
        .update({
          content: cleanContent,
          draft_content: cleanDraft,
          updated_at: now,
        })
        .eq("slug", slug);
    }
    purgeModelCaches();
    return;
  }

  // 2. Modèle officiel Evenium
  const client = getAdminClient();
  const { data: row } = await client.from(MODEL_DEFAULTS_TABLE).select("*").eq("model_id", modelId).maybeSingle();

  const currentContent = (row?.draft_content ?? row?.content ?? {}) as Record<string, unknown>;
  const cleanContent = withoutMusic(currentContent);

  const payload: Record<string, unknown> = {
    model_id: modelId,
    content: cleanContent,
    draft_content: cleanContent,
    updated_at: now,
    published_at: now,
    updated_by: userId,
  };

  await writeModelDefault(payload);
  purgeModelCaches();
}
