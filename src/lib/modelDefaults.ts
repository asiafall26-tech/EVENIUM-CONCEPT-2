/**
 * Modèles d'invitation du site gérés par l'admin (studio des modèles).
 * - draft_content : version enregistrée dans le studio, pas encore visible
 * - content       : version publiée, affichée sur le site et proposée aux clients
 * - is_hidden     : modèle retiré du site (galeries, démo, création d'événement)
 * Sans ligne en base, chaque modèle garde le contenu de son fichier content.ts.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const MODEL_DEFAULTS_TABLE = "invitation_model_defaults";

export interface ModelDefaultRow {
  model_id: string;
  content: Record<string, unknown> | null;
  draft_content: Record<string, unknown> | null;
  is_hidden: boolean;
  updated_at: string;
  published_at: string | null;
}

const isMissingTable = (e: { code?: string; message?: string }) =>
  e.code === "42P01" || e.code === "PGRST205" || /does not exist|schema cache/i.test(e.message ?? "");
const isMissingColumn = (e: { code?: string; message?: string }) =>
  e.code === "42703" || e.code === "PGRST204" || /column .* does not exist/i.test(e.message ?? "");

const SETUP_HINT = "exécutez le script supabase_model_defaults.sql dans Supabase.";

function normalize(r: Partial<ModelDefaultRow> & { model_id: string }): ModelDefaultRow {
  return {
    model_id: r.model_id,
    content: r.content ?? null,
    draft_content: r.draft_content ?? null,
    is_hidden: !!r.is_hidden,
    updated_at: r.updated_at ?? new Date(0).toISOString(),
    published_at: r.published_at ?? null,
  };
}

/** Toutes les lignes, indexées par identifiant de modèle (vide si la table n'existe pas encore). */
export async function fetchModelDefaults(supabase: SupabaseClient): Promise<Record<string, ModelDefaultRow>> {
  let res = await supabase.from(MODEL_DEFAULTS_TABLE).select("model_id, content, draft_content, is_hidden, updated_at, published_at");
  // Colonnes du brouillon / retrait absentes tant que le script complet n'a pas été exécuté
  if (res.error && isMissingColumn(res.error)) res = await supabase.from(MODEL_DEFAULTS_TABLE).select("model_id, content, updated_at");
  if (res.error || !res.data) return {};
  return Object.fromEntries((res.data as ModelDefaultRow[]).map((r) => [r.model_id, normalize(r)]));
}

/** Identifiants des modèles retirés du site. */
export const hiddenModelIds = (rows: Record<string, ModelDefaultRow>) =>
  new Set(Object.values(rows).filter((r) => r.is_hidden).map((r) => r.model_id));

/** Version publiée d'un modèle et son état sur le site. */
export async function fetchPublishedModel<T>(supabase: SupabaseClient, modelId: string): Promise<{ content: Partial<T> | null; hidden: boolean }> {
  let res = await supabase.from(MODEL_DEFAULTS_TABLE).select("content, is_hidden").eq("model_id", modelId).maybeSingle();
  if (res.error && isMissingColumn(res.error)) res = await supabase.from(MODEL_DEFAULTS_TABLE).select("content").eq("model_id", modelId).maybeSingle();
  if (res.error || !res.data) return { content: null, hidden: false };
  const row = res.data as { content?: Partial<T> | null; is_hidden?: boolean };
  return { content: row.content ?? null, hidden: !!row.is_hidden };
}

async function write(supabase: SupabaseClient, row: Record<string, unknown>) {
  const { error } = await supabase.from(MODEL_DEFAULTS_TABLE).upsert(row, { onConflict: "model_id" });
  if (!error) return;
  if (isMissingTable(error)) throw new Error(`La table des modèles n'existe pas encore : ${SETUP_HINT}`);
  if (isMissingColumn(error)) throw new Error(`La table des modèles doit être mise à jour : ${SETUP_HINT}`);
  throw new Error(error.message);
}

/** « Enregistrer la modification » : garde la version de travail sans la publier. */
export async function saveModelDraft(supabase: SupabaseClient, modelId: string, content: object, userId?: string) {
  await write(supabase, { model_id: modelId, draft_content: content, updated_at: new Date().toISOString(), updated_by: userId ?? null });
}

/** « Publier » : la version donnée devient celle du site, et le modèle y est (re)mis. */
export async function publishModel(supabase: SupabaseClient, modelId: string, content: object, userId?: string) {
  const now = new Date().toISOString();
  await write(supabase, { model_id: modelId, content, draft_content: content, is_hidden: false, updated_at: now, published_at: now, updated_by: userId ?? null });
}

/** « Retirer du site » / « Remettre sur le site » sans toucher au contenu. */
export async function setModelHidden(supabase: SupabaseClient, modelId: string, hidden: boolean, userId?: string) {
  await write(supabase, { model_id: modelId, is_hidden: hidden, updated_at: new Date().toISOString(), updated_by: userId ?? null });
}

/** « Version d'origine » : supprime les ajustements, publiés ou non. */
export async function resetModelDefault(supabase: SupabaseClient, modelId: string) {
  const { error } = await supabase.from(MODEL_DEFAULTS_TABLE).delete().eq("model_id", modelId);
  if (error) throw new Error(error.message);
}
