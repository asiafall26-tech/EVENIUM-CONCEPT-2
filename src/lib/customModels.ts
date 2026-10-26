/**
 * Modèles d'invitation importés par l'admin (ZIP ou HTML) dans le studio des modèles.
 * Les fichiers sont servis par /m/<slug>/…, les éléments modifiables portent `data-ev-field`
 * et reçoivent leurs valeurs par messages (public/ev-runtime.js).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchModelDefaults, type InvitationKind } from "@/lib/modelDefaults";
import { registerModelCovers, registerModelNames } from "@/data/mock/invitations";
import { googleFontHrefs, styleCss, styleFonts, type InvitationStyle, type PartSelectors } from "@/lib/invitationStyle";

/** Valeurs réservées : style (polices, couleurs) et musique d'ambiance ajoutée dans le studio */
export const STYLE_KEY = "__style";
export const MUSIC = { url: "__music", title: "__music_title", start: "__music_start", end: "__music_end" } as const;

export const CUSTOM_MODELS_TABLE = "custom_invitation_models";
export const CUSTOM_PREFIX = "custom:";
export const CUSTOM_STORAGE_DIR = "custom-models";

export type CustomFieldType = "text" | "image" | "audio" | "video" | "link" | "color";

export interface CustomField {
  id: string;
  type: CustomFieldType;
  label: string;
  /** valeur d'origine dans le fichier */
  original: string;
  /** le client peut-il le modifier ? */
  clientEditable: boolean;
  /** texte long (paragraphe) */
  multiline?: boolean;
  /** section de la page (menus du studio) */
  section?: number;
  sectionTitle?: string;
}

export type CustomValues = Record<string, string>;

export type CustomStatus = "draft" | "published" | "hidden";

export interface CustomModelRow {
  slug: string;
  name: string;
  entry: string;
  fields: CustomField[];
  content: CustomValues;
  draft_content: CustomValues | null;
  cover_url: string | null;
  invitation_type: InvitationKind;
  event_types: string[];
  status: CustomStatus;
  updated_at: string;
  published_at: string | null;
}

export const isCustomModelId = (id?: string | null) => !!id && id.startsWith(CUSTOM_PREFIX);
export const customModelId = (slug: string) => `${CUSTOM_PREFIX}${slug}`;
export const slugOfModelId = (id: string) => id.slice(CUSTOM_PREFIX.length);

/** Adresse de la page du modèle (servie par /m/<slug>/…) */
export const customModelUrl = (m: Pick<CustomModelRow, "slug" | "entry">) => `/m/${m.slug}/${m.entry}`;

/** Valeurs complètes : celles données, sinon celles d'origine du fichier. */
export function customValues(fields: CustomField[], ...layers: (CustomValues | null | undefined)[]): CustomValues {
  const out: CustomValues = {};
  for (const f of fields) out[f.id] = f.original;
  for (const layer of layers) if (layer) for (const [k, v] of Object.entries(layer)) if (typeof v === "string") out[k] = v;
  return out;
}

/** Contenu enregistré sur un événement qui utilise un modèle importé */
export interface CustomEventContent {
  values: CustomValues;
}

const isMissingTable = (e: { code?: string; message?: string }) =>
  e.code === "42P01" || e.code === "PGRST205" || /does not exist|schema cache/i.test(e.message ?? "");

export async function fetchCustomModels(supabase: SupabaseClient, opts: { publishedOnly?: boolean } = {}): Promise<CustomModelRow[]> {
  let q = supabase.from(CUSTOM_MODELS_TABLE).select("*").order("created_at", { ascending: false });
  if (opts.publishedOnly) q = q.eq("status", "published");
  const { data, error } = await q;
  if (error || !data) return [];
  return data as CustomModelRow[];
}

/**
 * Noms et couvertures de tous les modèles (intégrés renommés par l'admin + importés, même retirés du site),
 * pour les pages qui affichent le modèle d'un événement : getInvitationModelName / getInvitationModelThumbnail.
 */
export async function loadModelLabels(supabase: SupabaseClient) {
  const [, customs] = await Promise.all([fetchModelDefaults(supabase), fetchCustomModels(supabase)]);
  registerModelNames(Object.fromEntries(customs.map((m) => [customModelId(m.slug), m.name])));
  registerModelCovers(Object.fromEntries(customs.filter((m) => m.cover_url).map((m) => [customModelId(m.slug), m.cover_url as string])));
}

export async function fetchCustomModel(supabase: SupabaseClient, slug: string): Promise<CustomModelRow | null> {
  const { data, error } = await supabase.from(CUSTOM_MODELS_TABLE).select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return data as CustomModelRow;
}

export async function saveCustomModel(supabase: SupabaseClient, slug: string, patch: Partial<CustomModelRow>) {
  const { error } = await supabase
    .from(CUSTOM_MODELS_TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("slug", slug);
  if (error) throw new Error(isMissingTable(error) ? "Exécutez d'abord le script supabase_custom_models.sql dans Supabase." : error.message);
}

export async function insertCustomModel(supabase: SupabaseClient, row: Omit<CustomModelRow, "updated_at" | "published_at" | "draft_content">) {
  const { error } = await supabase.from(CUSTOM_MODELS_TABLE).insert(row);
  if (error) throw new Error(isMissingTable(error) ? "Exécutez d'abord le script supabase_custom_models.sql dans Supabase." : error.message);
}

/** Petit identifiant lisible et unique pour le dossier du modèle */
export function makeSlug(name: string) {
  const base = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "modele";
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Nom de stockage d'un fichier du modèle : les segments aux caractères spéciaux (accents, espaces…)
 * sont encodés, de façon identique à l'envoi et à la lecture.
 */
export function storageKey(path: string) {
  return path
    .split("/")
    .map((seg) =>
      /^[A-Za-z0-9._()-]+$/.test(seg)
        ? seg
        : "x-" + Array.from(new TextEncoder().encode(seg), (b) => b.toString(16).padStart(2, "0")).join("")
    )
    .join("/");
}

/** Carte statique : les musiques du modèle sont coupées. */
export function withoutMusicValues(fields: CustomField[], values: CustomValues): CustomValues {
  const out = { ...values };
  for (const f of fields) if (f.type === "audio") out[f.id] = "";
  out[MUSIC.url] = "";
  return out;
}

/** Catégories de texte d'une page importée (balises, quelle que soit leur classe) */
const IMPORTED_SELECTORS: PartSelectors = {
  names: ["h1"],
  titles: ["h2", "h3", "h4"],
  labels: ["small", "label", "time"],
  numbers: [],
  body: ["p", "li", "blockquote", "td", "figcaption"],
  buttons: ["button", "a"],
};

export function parseStyle(values: CustomValues): InvitationStyle | undefined {
  try {
    return values[STYLE_KEY] ? (JSON.parse(values[STYLE_KEY]) as InvitationStyle) : undefined;
  } catch {
    return undefined;
  }
}

/** Règles CSS et polices à injecter dans la page du modèle */
export function styleMessage(values: CustomValues) {
  const style = parseStyle(values);
  return { css: styleCss(style, "body", IMPORTED_SELECTORS), fonts: googleFontHrefs(styleFonts(style)) };
}

/* ---------- Rubriques : suppression et ajout par l'organisateur ---------- */

/** Rubriques de la page supprimées (numéros de section) */
export const HIDDEN_KEY = "__hidden";
/** Rubriques ajoutées */
export const RUBRIQUES_KEY = "__rubriques";

export interface AddedRubrique {
  id: string;
  title: string;
  text: string;
  image: string;
  /** numéro de la section après laquelle elle s'affiche (vide = à la fin) */
  after: string;
}

const readJson = <T,>(v: string | undefined, fallback: T): T => {
  try {
    const x = JSON.parse(v || "null");
    return x ?? fallback;
  } catch {
    return fallback;
  }
};

export const hiddenSections = (values: CustomValues): string[] => readJson<unknown[]>(values[HIDDEN_KEY], []).map(String);
export const addedRubriques = (values: CustomValues): AddedRubrique[] =>
  readJson<AddedRubrique[]>(values[RUBRIQUES_KEY], []).filter((r) => r && typeof r === "object" && r.id);
