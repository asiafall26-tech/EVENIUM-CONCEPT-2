/**
 * Modèles d'invitation du site gérés par l'admin (studio des modèles).
 * - draft_content : version enregistrée dans le studio, pas encore visible
 * - content       : version publiée, affichée sur le site et proposée aux clients
 * - is_hidden     : modèle retiré du site (galeries, démo, création d'événement)
 * - invitation_type / event_types : classement choisi par l'admin (sinon celui d'origine)
 * Sans ligne en base, chaque modèle garde le contenu de son fichier content.ts.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { registerModelNames } from "@/data/mock/invitations";

export const MODEL_DEFAULTS_TABLE = "invitation_model_defaults";

export interface ModelDefaultRow {
  model_id: string;
  name: string | null;
  content: Record<string, unknown> | null;
  draft_content: Record<string, unknown> | null;
  is_hidden: boolean;
  updated_at: string;
  published_at: string | null;
  invitation_type: InvitationKind | null;
  event_types: string[] | null;
}

export type InvitationKind = "animée" | "carte";

export interface ModelClassification {
  type: InvitationKind;
  /** types d'événement pour lesquels le modèle est proposé, le premier est le principal */
  events: string[];
}

/** Classement d'un modèle : celui de l'admin s'il existe, sinon celui d'origine. */
export function classificationOf(row: ModelDefaultRow | undefined, fallback: ModelClassification): ModelClassification {
  return {
    type: row?.invitation_type === "carte" || row?.invitation_type === "animée" ? row.invitation_type : fallback.type,
    events: row?.event_types?.length ? row.event_types : fallback.events,
  };
}

/** Nom public d'un modèle : celui personnalisé par l'admin si défini, sinon le nom d'origine. */
export function modelNameOf(row: ModelDefaultRow | undefined, fallback: string): string {
  if (row?.name && typeof row.name === "string" && row.name.trim()) return row.name.trim();
  const draftName = (row?.draft_content as Record<string, unknown> | null | undefined)?.model_name;
  if (typeof draftName === "string" && draftName.trim()) return draftName.trim();
  const contentName = (row?.content as Record<string, unknown> | null | undefined)?.model_name;
  if (typeof contentName === "string" && contentName.trim()) return contentName.trim();
  return fallback;
}

/** Dictionnaire des noms personnalisés { [model_id]: name } */
export function modelNamesMap(rows: Record<string, ModelDefaultRow>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [id, row] of Object.entries(rows)) {
    if (row.name) map[id] = row.name;
    else {
      const draftName = (row.draft_content as Record<string, unknown> | null | undefined)?.model_name;
      const contentName = (row.content as Record<string, unknown> | null | undefined)?.model_name;
      if (typeof draftName === "string" && draftName.trim()) map[id] = draftName.trim();
      else if (typeof contentName === "string" && contentName.trim()) map[id] = contentName.trim();
    }
  }
  return map;
}

const isMissingTable = (e: { code?: string; message?: string }) =>
  e.code === "42P01" || e.code === "PGRST205" || /does not exist|schema cache/i.test(e.message ?? "");
const isMissingColumn = (e: { code?: string; message?: string }) =>
  e.code === "42703" || e.code === "PGRST204" || /column .* does not exist/i.test(e.message ?? "");

const SETUP_HINT = "exécutez le script supabase_model_defaults.sql dans Supabase.";

function normalize(r: Partial<ModelDefaultRow> & { model_id: string }): ModelDefaultRow {
  const explicitName = typeof r.name === "string" && r.name.trim() ? r.name.trim() : null;
  const draftName = (r.draft_content as Record<string, unknown> | null | undefined)?.model_name;
  const contentName = (r.content as Record<string, unknown> | null | undefined)?.model_name;
  const resolvedName =
    explicitName ||
    (typeof draftName === "string" && draftName.trim() ? draftName.trim() : null) ||
    (typeof contentName === "string" && contentName.trim() ? contentName.trim() : null);

  return {
    model_id: r.model_id,
    name: resolvedName,
    content: r.content ?? null,
    draft_content: r.draft_content ?? null,
    is_hidden: !!r.is_hidden,
    updated_at: r.updated_at ?? new Date(0).toISOString(),
    published_at: r.published_at ?? null,
    invitation_type: r.invitation_type ?? null,
    event_types: Array.isArray(r.event_types) ? r.event_types : null,
  };
}

/** Toutes les lignes, indexées par identifiant de modèle (vide si la table n'existe pas encore). */
export async function fetchModelDefaults(supabase: SupabaseClient): Promise<Record<string, ModelDefaultRow>> {
  // Colonnes ajoutées au fil des versions du script : on se rabat sur les plus anciennes si besoin
  const selects = [
    "model_id, name, content, draft_content, is_hidden, updated_at, published_at, invitation_type, event_types",
    "model_id, content, draft_content, is_hidden, updated_at, published_at, invitation_type, event_types",
    "model_id, content, draft_content, is_hidden, updated_at, published_at",
    "model_id, content, updated_at",
  ];
  let res = await supabase.from(MODEL_DEFAULTS_TABLE).select(selects[0]);
  for (let i = 1; i < selects.length && res.error && isMissingColumn(res.error); i++) res = await supabase.from(MODEL_DEFAULTS_TABLE).select(selects[i]);
  if (res.error || !res.data) return {};
  const rows = Object.fromEntries((res.data as unknown as ModelDefaultRow[]).map((r) => [r.model_id, normalize(r)]));
  try {
    registerModelNames(modelNamesMap(rows));
  } catch {
    // ignore
  }
  return rows;
}

/** Identifiants des modèles retirés du site. */
export const hiddenModelIds = (rows: Record<string, ModelDefaultRow>) =>
  new Set(Object.values(rows).filter((r) => r.is_hidden).map((r) => r.model_id));

/** Version publiée d'un modèle et son état sur le site. */
export async function fetchPublishedModel<T>(
  supabase: SupabaseClient,
  modelId: string
): Promise<{ content: Partial<T> | null; hidden: boolean; isCard: boolean; name: string | null }> {
  const selects = [
    "name, content, is_hidden, invitation_type",
    "content, is_hidden, invitation_type",
    "content, is_hidden",
    "content",
  ];
  let res = await supabase.from(MODEL_DEFAULTS_TABLE).select(selects[0]).eq("model_id", modelId).maybeSingle();
  for (let i = 1; i < selects.length && res.error && isMissingColumn(res.error); i++) {
    res = await supabase.from(MODEL_DEFAULTS_TABLE).select(selects[i]).eq("model_id", modelId).maybeSingle();
  }
  if (res.error || !res.data) return { content: null, hidden: false, isCard: false, name: null };
  const row = res.data as { name?: string | null; content?: Partial<T> | null; is_hidden?: boolean; invitation_type?: string | null };
  const contentName = (row.content as Record<string, unknown> | null | undefined)?.model_name;
  const name = (typeof row.name === "string" && row.name.trim()) || (typeof contentName === "string" && contentName.trim()) || null;
  return { content: row.content ?? null, hidden: !!row.is_hidden, isCard: row.invitation_type === "carte", name };
}

async function write(supabase: SupabaseClient, row: Record<string, unknown>) {
  const { error } = await supabase.from(MODEL_DEFAULTS_TABLE).upsert(row, { onConflict: "model_id" });
  if (!error) return;
  if (isMissingTable(error)) throw new Error(`La table des modèles n'existe pas encore : ${SETUP_HINT}`);
  if (isMissingColumn(error)) throw new Error(`La table des modèles doit être mise à jour : ${SETUP_HINT}`);
  throw new Error(error.message);
}

/** « Enregistrer la modification » : garde la version de travail sans la publier. */
export async function saveModelDraft(
  supabase: SupabaseClient,
  modelId: string,
  content: object,
  userId?: string,
  customName?: string
) {
  const cleanName = customName?.trim() || (content as Record<string, unknown>)?.model_name;
  const enriched = cleanName ? { ...content, model_name: cleanName } : content;
  const payload: Record<string, unknown> = {
    model_id: modelId,
    draft_content: enriched,
    updated_at: new Date().toISOString(),
    updated_by: userId ?? null,
  };
  if (typeof cleanName === "string" && cleanName.trim()) {
    payload.name = cleanName.trim();
  }
  try {
    await write(supabase, payload);
  } catch (err: unknown) {
    if (payload.name && isMissingColumn(err as { code?: string; message?: string })) {
      delete payload.name;
      await write(supabase, payload);
    } else {
      throw err;
    }
  }
}

/** « Publier » : la version donnée devient celle du site, et le modèle y est (re)mis. */
export async function publishModel(
  supabase: SupabaseClient,
  modelId: string,
  content: object,
  userId?: string,
  customName?: string
) {
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
    updated_by: userId ?? null,
  };
  if (typeof cleanName === "string" && cleanName.trim()) {
    payload.name = cleanName.trim();
  }
  try {
    await write(supabase, payload);
  } catch (err: unknown) {
    if (payload.name && isMissingColumn(err as { code?: string; message?: string })) {
      delete payload.name;
      await write(supabase, payload);
    } else {
      throw err;
    }
  }
}

/** Renommer directement une invitation en ligne. */
export async function saveModelName(supabase: SupabaseClient, modelId: string, name: string, userId?: string) {
  const cleanName = name.trim();
  const existing = await supabase.from(MODEL_DEFAULTS_TABLE).select("content, draft_content").eq("model_id", modelId).maybeSingle();

  const existingContent = (existing.data?.content && typeof existing.data.content === "object" ? existing.data.content : {}) as Record<string, unknown>;
  const existingDraft = (existing.data?.draft_content && typeof existing.data.draft_content === "object" ? existing.data.draft_content : {}) as Record<string, unknown>;

  const payload: Record<string, unknown> = {
    model_id: modelId,
    name: cleanName,
    content: { ...existingContent, model_name: cleanName },
    draft_content: { ...existingDraft, model_name: cleanName },
    updated_at: new Date().toISOString(),
    updated_by: userId ?? null,
  };

  try {
    await write(supabase, payload);
  } catch (err: unknown) {
    if (isMissingColumn(err as { code?: string; message?: string })) {
      delete payload.name;
      await write(supabase, payload);
    } else {
      throw err;
    }
  }
}

/** « Retirer du site » / « Remettre sur le site » sans toucher au contenu. */
export async function setModelHidden(supabase: SupabaseClient, modelId: string, hidden: boolean, userId?: string) {
  const existing = await supabase.from(MODEL_DEFAULTS_TABLE).select("content, draft_content, name").eq("model_id", modelId).maybeSingle();
  const payload: Record<string, unknown> = {
    model_id: modelId,
    is_hidden: hidden,
    updated_at: new Date().toISOString(),
    updated_by: userId ?? null,
  };
  if (existing.data?.content !== undefined) {
    payload.content = existing.data.content;
  } else {
    payload.content = {};
  }
  if (existing.data?.draft_content !== undefined) {
    payload.draft_content = existing.data.draft_content;
  }
  if (existing.data?.name) {
    payload.name = existing.data.name;
  }
  try {
    await write(supabase, payload);
  } catch (err: unknown) {
    if (payload.name && isMissingColumn(err as { code?: string; message?: string })) {
      delete payload.name;
      await write(supabase, payload);
    } else {
      throw err;
    }
  }
}

/** Classement du modèle : type d'invitation et types d'événement. */
export async function saveModelClassification(supabase: SupabaseClient, modelId: string, c: ModelClassification, userId?: string) {
  await write(supabase, { model_id: modelId, invitation_type: c.type, event_types: c.events, updated_at: new Date().toISOString(), updated_by: userId ?? null });
}

/** « Version d'origine » : efface les ajustements de contenu (publiés ou non) ; le classement et la présence sur le site sont gardés. */
export async function resetModelDefault(supabase: SupabaseClient, modelId: string, resetName = false) {
  const updateData: Record<string, unknown> = {
    content: null,
    draft_content: null,
    published_at: null,
    updated_at: new Date().toISOString(),
  };
  if (resetName) {
    updateData.name = null;
  }
  const { error } = await supabase.from(MODEL_DEFAULTS_TABLE).update(updateData).eq("model_id", modelId);
  if (error) throw new Error(error.message);
}

