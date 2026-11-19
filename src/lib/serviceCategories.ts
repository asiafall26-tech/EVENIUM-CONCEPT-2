/**
 * Gestion dynamique des catégories de services d'invitation.
 * Permet à l'admin de créer, modifier, supprimer des catégories et d'affecter
 * les modèles d'invitation à une catégorie spécifique avec tarifs associés.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { broadcastChange } from "@/lib/syncService";

export const SERVICE_CATEGORIES_TABLE = "invitation_service_categories";
export const BACKUP_ROW_ID = "__service_categories__";

export interface ServiceCategory {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  icon: string;
  price_fcfa: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Catégories par défaut définies selon les services Evenium */
export const FALLBACK_CATEGORIES: ServiceCategory[] = [
  {
    id: "invitations",
    slug: "invitations",
    label: "Invitations événementielles",
    description: "Mariages, anniversaires, baptêmes, galas et cérémonies (invitation animée ou statique)",
    icon: "🎉",
    price_fcfa: null,
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "voeux",
    slug: "voeux",
    label: "Vœux & Célébrations",
    description: "Cartes interactives de vœux et félicitations au tarif de 2 000 FCFA",
    icon: "🎁",
    price_fcfa: 2000,
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "mots_doux",
    slug: "mots_doux",
    label: "Mots doux",
    description: "Messages affectueux et lettres d'amour scellées au tarif de 1 000 FCFA",
    icon: "💌",
    price_fcfa: 1000,
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "couple",
    slug: "couple",
    label: "Espace Couple",
    description: "Invitations secrètes et rendez-vous romantiques au tarif de 4 000 FCFA",
    icon: "❤️",
    price_fcfa: 4000,
    sort_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let cache: ServiceCategory[] | null = null;
let cacheTs = 0;
const CACHE_TTL = 15_000; // 15s

export function invalidateServiceCategoriesCache() {
  cache = null;
  cacheTs = 0;
}

/**
 * Récupère les catégories actives depuis Supabase.
 * Tente d'abord la table `invitation_service_categories`.
 * En cas d'absence de la table, lit la configuration stockée dans `invitation_model_defaults`.
 */
export async function fetchServiceCategories(
  supabase: SupabaseClient,
  force = false
): Promise<ServiceCategory[]> {
  if (!force && cache && Date.now() - cacheTs < CACHE_TTL) {
    return cache.filter((c) => c.is_active);
  }

  const all = await fetchAllServiceCategories(supabase);
  return all.filter((c) => c.is_active);
}

/**
 * Récupère toutes les catégories (actives et inactives) pour l'administration.
 */
export async function fetchAllServiceCategories(
  supabase: SupabaseClient
): Promise<ServiceCategory[]> {
  try {
    // 1. Essai sur la table dédiée
    const { data, error } = await supabase
      .from(SERVICE_CATEGORIES_TABLE)
      .select("*")
      .order("sort_order");

    if (!error && Array.isArray(data) && data.length > 0) {
      cache = data as ServiceCategory[];
      cacheTs = Date.now();
      return cache;
    }
  } catch {
    // Table inexistante ou erreur réseau
  }

  // 2. Repli transparent sur la table `invitation_model_defaults`
  try {
    const { data: row, error: rowError } = await supabase
      .from("invitation_model_defaults")
      .select("content")
      .eq("model_id", BACKUP_ROW_ID)
      .maybeSingle();

    if (!rowError && row?.content && Array.isArray((row.content as any).categories)) {
      const cats = (row.content as any).categories as ServiceCategory[];
      cats.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      cache = cats;
      cacheTs = Date.now();
      return cats;
    }
  } catch {
    // ignore
  }

  // 3. Fallback en mémoire / initial
  cache = FALLBACK_CATEGORIES;
  cacheTs = Date.now();
  return FALLBACK_CATEGORIES;
}

/** Sauvegarde dans la ligne de secours invitation_model_defaults */
async function syncToBackupRow(supabase: SupabaseClient, categories: ServiceCategory[]) {
  try {
    await supabase.from("invitation_model_defaults").upsert({
      model_id: BACKUP_ROW_ID,
      name: "Categories Config",
      content: { categories },
      is_hidden: true,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("syncToBackupRow error:", err);
  }
}

/** Crée une nouvelle catégorie */
export async function createServiceCategory(
  supabase: SupabaseClient,
  cat: Omit<ServiceCategory, "id" | "created_at" | "updated_at">
): Promise<ServiceCategory> {
  const newCat: ServiceCategory = {
    ...cat,
    id: cat.slug || `cat_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Essai table dédiée
  try {
    await supabase.from(SERVICE_CATEGORIES_TABLE).insert(newCat);
  } catch {}

  // Toujours synchroniser avec le backup row
  const current = await fetchAllServiceCategories(supabase);
  const updated = [...current.filter((c) => c.slug !== newCat.slug), newCat];
  updated.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  await syncToBackupRow(supabase, updated);

  invalidateServiceCategoriesCache();
  broadcastChange("categories");
  broadcastChange("models");
  return newCat;
}

/** Met à jour une catégorie existante */
export async function updateServiceCategory(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Omit<ServiceCategory, "id" | "created_at">>
): Promise<void> {
  // Essai table dédiée
  try {
    await supabase
      .from(SERVICE_CATEGORIES_TABLE)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .or(`id.eq.${id},slug.eq.${id}`);
  } catch {}

  // Synchroniser backup row
  const current = await fetchAllServiceCategories(supabase);
  const updated = current.map((c) =>
    c.id === id || c.slug === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
  );
  updated.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  await syncToBackupRow(supabase, updated);

  invalidateServiceCategoriesCache();
  broadcastChange("categories");
  broadcastChange("models");
}

/** Supprime une catégorie */
export async function deleteServiceCategory(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  // Essai table dédiée
  try {
    await supabase
      .from(SERVICE_CATEGORIES_TABLE)
      .delete()
      .or(`id.eq.${id},slug.eq.${id}`);
  } catch {}

  // Synchroniser backup row
  const current = await fetchAllServiceCategories(supabase);
  const updated = current.filter((c) => c.id !== id && c.slug !== id);
  await syncToBackupRow(supabase, updated);

  invalidateServiceCategoriesCache();
  broadcastChange("categories");
  broadcastChange("models");
}

/**
 * Détermine si un modèle appartient à une catégorie de service donnée.
 * Le type d'invitation défini par l'admin (ou par défaut) est la référence absolue.
 */
export function modelMatchesCategory(
  model: {
    id?: string;
    type?: string;
    category?: string;
    events?: string[];
    name?: string;
  },
  catSlug: string
): boolean {
  if (catSlug === "Tous" || catSlug === "tous" || catSlug === "all") return true;

  const type = (model.type || "").toLowerCase().trim();
  const slug = catSlug.toLowerCase().trim();

  // 1. Invitations événementielles (animée ou carte/statique)
  if (
    slug === "invitations" ||
    slug === "evenementielles" ||
    slug === "invitations_evenementielles" ||
    slug === "grands_evenements"
  ) {
    if (type === "voeu" || type === "mot_doux" || type === "couple") return false;
    return type === "animée" || type === "carte" || type === "statique" || !type || type === "invitation";
  }

  // 2. Vœux & Célébrations
  if (
    slug === "voeux" ||
    slug === "celebrations" ||
    slug === "voeux_celebrations" ||
    slug === "voeu"
  ) {
    return type === "voeu";
  }

  // 3. Mots doux
  if (
    slug === "mots_doux" ||
    slug === "mot_doux" ||
    slug === "mots-doux" ||
    slug === "mots doux"
  ) {
    return type === "mot_doux";
  }

  // 4. Espace Couple
  if (
    slug === "couple" ||
    slug === "espace_couple" ||
    slug === "espace-couple" ||
    slug === "invitations_couple"
  ) {
    return type === "couple";
  }

  // Pour toute catégorie personnalisée ajoutée par l'admin
  const normalizedSlug = slug.replace(/_/g, " ");
  const category = (model.category || "").toLowerCase();
  const events = Array.isArray(model.events) ? model.events.map((e) => e.toLowerCase()) : [];
  const name = (model.name || "").toLowerCase();
  return (
    type === slug ||
    category.includes(normalizedSlug) ||
    events.some((e) => e.includes(normalizedSlug)) ||
    name.includes(normalizedSlug)
  );
}

/**
 * Détermine si un modèle correspond au filtre d'événement sélectionné.
 * Utilise strictement le classement des événements (`events`) défini par l'admin.
 */
export function modelMatchesEvent(
  model: {
    events?: string[];
    category?: string;
  },
  selectedEvent: string
): boolean {
  if (!selectedEvent || selectedEvent === "all" || selectedEvent === "Tous" || selectedEvent === "tous") {
    return true;
  }
  const target = selectedEvent.toLowerCase().trim();
  const evs = Array.isArray(model.events) && model.events.length > 0
    ? model.events.map((e) => e.toLowerCase().trim())
    : [model.category?.toLowerCase().trim() || ""];

  // Égalité stricte insensible à la casse : "Mariage", "Anniversaire de mariage",
  // "Demande en mariage" et "Anniversaire" sont des types d'événements strictement distincts.
  return evs.some((e) => e === target);
}

/**
 * Filtre de format pour les Invitations événementielles :
 * - "all" : tous les formats
 * - "animée" : invitations avec cinématique / musique
 * - "statique" : invitations cartes statiques épurées
 */
export type InvitationFormatFilter = "all" | "animée" | "statique";

export function modelMatchesFormat(
  model: { type?: string },
  format: InvitationFormatFilter
): boolean {
  if (format === "all") return true;
  const t = (model.type || "").toLowerCase();
  if (format === "animée") {
    return t === "animée" || t === "animee" || t === "animated" || !t;
  }
  if (format === "statique") {
    return t === "carte" || t === "statique" || t === "static";
  }
  return true;
}

/**
 * Trouve le slug de la catégorie principale d'un modèle.
 */
export function getCategorySlugForModel(model: {
  id?: string;
  type?: string;
  category?: string;
  events?: string[];
  name?: string;
}): string {
  if (modelMatchesCategory(model, "voeux")) return "voeux";
  if (modelMatchesCategory(model, "mots_doux")) return "mots_doux";
  if (modelMatchesCategory(model, "couple")) return "couple";
  return "invitations";
}
