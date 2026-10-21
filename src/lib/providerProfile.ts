import type { SupabaseClient } from "@supabase/supabase-js";
import { categoryOfService, getCategory, prestationType } from "@/lib/devis/categories";
import { isMissingColumn } from "@/lib/devis/persist";

/**
 * Activité d'un prestataire : types d'événements, prestations, pays et zones d'intervention.
 * Ces informations servent aux filtres des organisateurs et à adapter ses devis.
 */
export interface ProviderActivity {
  event_types: string[];
  services: string[];
  country: string;
  zones: string[];
}

export const EMPTY_ACTIVITY: ProviderActivity = { event_types: [], services: [], country: "", zones: [] };

const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : []);

/** Prestations ramenées à leur type (les anciens services détaillés deviennent leur type), sans doublon. */
export const normalizePrestations = (list: string[]) => [...new Set(list.map(prestationType))];

export function activityFromProfile(profile: any): ProviderActivity {
  const meta = profile?.user_metadata?.activity || {};
  return {
    event_types: arr(profile?.event_types).length ? arr(profile?.event_types) : arr(meta.event_types),
    services: normalizePrestations(arr(profile?.services_proposes).length ? arr(profile?.services_proposes) : arr(meta.services)),
    country: profile?.country || meta.country || "",
    zones: arr(profile?.zones).length ? arr(profile?.zones) : arr(meta.zones),
  };
}

/** Champs manquants, dans l'ordre du formulaire. */
export function missingActivity(a: ProviderActivity): string[] {
  const missing: string[] = [];
  if (!a.event_types.length) missing.push("au moins un type d'événement");
  if (!a.services.length) missing.push("au moins une prestation");
  if (!a.country.trim()) missing.push("votre pays");
  if (!a.zones.length) missing.push("au moins une zone d'intervention");
  return missing;
}

export const isActivityComplete = (a: ProviderActivity) => missingActivity(a).length === 0;

/** La base contient-elle les colonnes d'activité (script SQL exécuté) ? */
export const hasActivityColumns = (profile: any) =>
  !!profile && "event_types" in profile && "services_proposes" in profile && "country" in profile && "zones" in profile;

/** Activités (identifiants de catégorie) déduites des prestations choisies. */
export function categoriesFromServices(services: string[]): string[] {
  return [...new Set(services.map((s) => categoryOfService(s)).filter((c): c is string => !!c))];
}

/** Libellé court d'un prestataire : ses premières prestations, sinon son ancienne catégorie. */
export function providerHeadline(profile: any, max = 2): string {
  const services = activityFromProfile(profile).services;
  if (services.length) return services.slice(0, max).join(" · ") + (services.length > max ? ` +${services.length - max}` : "");
  return profile?.category || "Prestataire";
}

/** Enregistre l'activité du prestataire (et les activités de devis qui en découlent). */
export async function saveActivity(supabase: SupabaseClient, userId: string, a: ProviderActivity) {
  const categories = categoriesFromServices(a.services);
  const row = {
    event_types: a.event_types,
    services_proposes: a.services,
    country: a.country.trim(),
    zones: a.zones,
    categories,
    // Ancienne colonne conservée pour l'affichage (messagerie, admin, PDF)
    category: getCategory(categories[0])?.label ?? a.services[0] ?? null,
  };
  const res = await supabase.from("profiles").update(row).eq("id", userId);
  if (isMissingColumn(res.error)) {
    return { error: { message: "La base de données n'est pas à jour : exécutez le script « supabase_prestataires_activite.sql » dans Supabase." } };
  }
  if (!res.error) await syncCustomServices(supabase, userId, a.services);
  return { error: res.error };
}

/** Les prestations hors liste rejoignent les services personnalisés proposés dans les devis. */
async function syncCustomServices(supabase: SupabaseClient, userId: string, services: string[]) {
  const custom = services.filter((s) => !categoryOfService(s));
  if (!custom.length) return;
  const { data, error } = await supabase.from("prestataire_services_perso").select("name").eq("prestataire_id", userId);
  if (error) return;
  const known = new Set((data ?? []).map((r: { name: string }) => r.name.toLowerCase()));
  const rows = custom.filter((s) => !known.has(s.toLowerCase())).map((name) => ({ prestataire_id: userId, name, category_id: null }));
  if (rows.length) await supabase.from("prestataire_services_perso").insert(rows);
}
