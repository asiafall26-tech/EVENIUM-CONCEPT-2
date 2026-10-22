/**
 * Contenu des modèles d'invitation publiés sur le site, ajusté par l'admin (studio des modèles).
 * Sans ligne en base, chaque modèle garde le contenu défini dans son fichier content.ts.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const MODEL_DEFAULTS_TABLE = "invitation_model_defaults";

export interface ModelDefaultRow {
  model_id: string;
  content: Record<string, unknown>;
  updated_at: string;
}

/** Toutes les versions publiées par l'admin, indexées par identifiant de modèle (vide si la table n'existe pas encore). */
export async function fetchModelDefaults(supabase: SupabaseClient): Promise<Record<string, ModelDefaultRow>> {
  const { data, error } = await supabase.from(MODEL_DEFAULTS_TABLE).select("model_id, content, updated_at");
  if (error || !data) return {};
  return Object.fromEntries((data as ModelDefaultRow[]).map((r) => [r.model_id, r]));
}

/** Contenu publié d'un modèle, ou null. */
export async function fetchModelDefault<T>(supabase: SupabaseClient, modelId: string): Promise<Partial<T> | null> {
  const { data, error } = await supabase.from(MODEL_DEFAULTS_TABLE).select("content").eq("model_id", modelId).maybeSingle();
  if (error || !data?.content) return null;
  return data.content as Partial<T>;
}

export async function saveModelDefault(supabase: SupabaseClient, modelId: string, content: object, userId?: string) {
  const { error } = await supabase
    .from(MODEL_DEFAULTS_TABLE)
    .upsert({ model_id: modelId, content, updated_at: new Date().toISOString(), updated_by: userId ?? null }, { onConflict: "model_id" });
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message)) {
      throw new Error("La table des modèles n'existe pas encore : exécutez le script supabase_model_defaults.sql dans Supabase.");
    }
    throw new Error(error.message);
  }
}

export async function resetModelDefault(supabase: SupabaseClient, modelId: string) {
  const { error } = await supabase.from(MODEL_DEFAULTS_TABLE).delete().eq("model_id", modelId);
  if (error) throw new Error(error.message);
}
