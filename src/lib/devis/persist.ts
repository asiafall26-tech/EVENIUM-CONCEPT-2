import type { SupabaseClient } from "@supabase/supabase-js";
import { getCategory, isFilled, resolveProviderCategories } from "./categories";
import {
  computeAmounts,
  modeOf,
  normalizeLine,
  type DevisAmounts,
  type DevisLine,
  type DevisOption,
  type PricingModeId,
} from "./pricing";

/** État complet du formulaire de devis (création et révision). */
export interface DevisDraft {
  reference: string;
  validUntil: string;
  clientName: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  eventLocation: string;
  serviceName: string;
  description: string;
  categoryIds: string[];
  categoryDetails: Record<string, Record<string, unknown>>;
  items: DevisLine[];
  options: DevisOption[];
  discountType: "amount" | "percentage";
  discountValue: number | "";
  taxRate: number | "";
  depositType: "amount" | "percentage";
  depositValue: number | "";
  cautionAmount: number | "";
  notes: string;
}

export interface CustomService {
  id: string;
  name: string;
  category_id: string | null;
}

export const DEFAULT_NOTES =
  "Le présent devis est valable 14 jours. Un acompte est requis pour valider la réservation. Le solde devra être réglé au plus tard 48h avant l'événement.";

let localId = 0;
export const newLocalId = () => `new-${Date.now()}-${++localId}`;

export function emptyLine(categoryId?: string | null): DevisLine {
  const cat = getCategory(categoryId);
  const mode = modeOf(cat?.defaultPricing ?? "forfait");
  return normalizeLine({
    id: newLocalId(),
    category_id: categoryId ?? null,
    designation: "",
    description: "",
    pricing_mode: mode.id,
    quantity: 1,
    unit: mode.defaultUnit,
    duration: mode.durationLabel ? 1 : null,
    duration_unit: mode.durationUnits?.[0] ?? null,
    unit_price: 0,
    total: 0,
  });
}

export function draftAmounts(d: DevisDraft): DevisAmounts {
  return computeAmounts({
    items: d.items,
    options: d.options,
    discountType: d.discountType,
    discountValue: Number(d.discountValue) || 0,
    taxRate: Number(d.taxRate) || 0,
    depositType: d.depositType,
    depositValue: Number(d.depositValue) || 0,
  });
}

const plusDays = (n: number) => {
  const date = new Date();
  date.setDate(date.getDate() + n);
  return date.toISOString().split("T")[0];
};

const eventGuests = (demande: any): number | undefined => {
  const g = Number(demande?.event_guests || demande?.events?.guestsCount || demande?.events?.guests_count);
  return Number.isFinite(g) && g > 0 ? g : undefined;
};

/** Pré-remplit les champs spécifiques à partir de la demande (invités, quantité, date, lieu). */
function prefillDetails(categoryIds: string[], demande: any): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  const guests = eventGuests(demande);
  const qty = Number(demande?.needs_quantity) || undefined;
  for (const id of categoryIds) {
    const cat = getCategory(id);
    if (!cat) continue;
    const values: Record<string, unknown> = {};
    for (const f of cat.fields) {
      if (f.prefill === "guests" && guests) values[f.key] = guests;
      if (f.prefill === "quantity" && qty) values[f.key] = qty;
      if (f.prefill === "date" && demande?.event_date) values[f.key] = demande.event_date;
      if (f.prefill === "location" && demande?.event_location) values[f.key] = demande.event_location;
    }
    out[id] = values;
  }
  return out;
}

/** Nouveau devis à partir d'une demande de l'organisateur. */
export function draftFromDemande(demande: any, providerCategoryIds: string[]): DevisDraft {
  const ev = demande?.events || {};
  const firstCat = providerCategoryIds[0] ?? null;
  const line = emptyLine(firstCat);
  if (demande?.service_name) line.designation = demande.service_name;
  const qty = Number(demande?.needs_quantity) || 0;
  const guests = eventGuests(demande);
  if (line.pricing_mode === "par_personne" && guests) line.quantity = guests;
  else if (qty > 0 && modeOf(line.pricing_mode).qtyLabel) line.quantity = qty;
  if (demande?.budget_indicatif && modeOf(line.pricing_mode).id === "forfait") line.unit_price = Number(demande.budget_indicatif) || 0;

  return {
    reference: `DEV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    validUntil: plusDays(14),
    clientName: demande?.client_name || ev?.profiles?.full_name || "",
    eventName: ev?.name || "",
    eventType: demande?.event_type || ev?.type || "",
    eventDate: demande?.event_date || ev?.date || "",
    eventLocation: demande?.event_location || ev?.location || "",
    serviceName: demande?.service_name || "",
    description: "",
    categoryIds: providerCategoryIds,
    categoryDetails: prefillDetails(providerCategoryIds, demande),
    items: [normalizeLine(line)],
    options: [],
    discountType: "amount",
    discountValue: "",
    taxRate: "",
    depositType: "percentage",
    depositValue: 30,
    cautionAmount: "",
    notes: DEFAULT_NOTES,
  };
}

/** Devis existant (révision) remis sous forme de brouillon éditable. */
export function draftFromDevis(devis: any, items: any[], options: any[], demande: any, providerCategoryIds: string[]): DevisDraft {
  const ev = demande?.events || devis?.events || {};
  const storedCats: string[] = Array.isArray(devis?.category_ids) ? devis.category_ids : [];
  const lineCats = items.map((i) => i.category_id).filter(Boolean);
  const categoryIds = [...new Set([...storedCats, ...lineCats, ...(storedCats.length || lineCats.length ? [] : providerCategoryIds)])].filter((id) => getCategory(id));
  // Anciens devis : deposit_amount contient la valeur saisie (pas encore de deposit_value)
  const hasNewDeposit = devis?.deposit_value !== undefined && devis?.deposit_value !== null;

  return {
    reference: devis?.reference || "",
    validUntil: devis?.valid_until || plusDays(14),
    clientName: devis?.client_name || demande?.client_name || ev?.profiles?.full_name || "",
    eventName: devis?.event_name || ev?.name || "",
    eventType: devis?.event_type || demande?.event_type || ev?.type || "",
    eventDate: devis?.event_date || demande?.event_date || ev?.date || "",
    eventLocation: devis?.event_location || demande?.event_location || ev?.location || "",
    serviceName: devis?.service_name || demande?.service_name || "",
    description: devis?.description || "",
    categoryIds,
    categoryDetails: (devis?.category_details as DevisDraft["categoryDetails"]) || prefillDetails(categoryIds, demande),
    items: (items.length ? items : [emptyLine(categoryIds[0])]).map((i) =>
      normalizeLine({
        ...i,
        // Anciennes lignes : quantité × prix, même avec l'unité « Forfait », pour garder le même total
        pricing_mode: i.pricing_mode || "unitaire",
        quantity: Number(i.quantity) || 0,
        unit_price: Number(i.unit_price) || 0,
        duration: i.duration ?? null,
        total: Number(i.total) || 0,
      })
    ),
    options: options.map((o) => ({ id: o.id, name: o.name, is_included: !!o.is_included, price: Number(o.price) || 0 })),
    discountType: devis?.discount_type || "amount",
    discountValue: devis?.discount ? Number(devis.discount) : "",
    taxRate: devis?.tax_rate ? Number(devis.tax_rate) : "",
    depositType: devis?.deposit_type || "percentage",
    depositValue: hasNewDeposit ? Number(devis.deposit_value) : devis?.deposit_amount ? Number(devis.deposit_amount) : "",
    cautionAmount: devis?.caution_amount ? Number(devis.caution_amount) : "",
    notes: devis?.notes ?? DEFAULT_NOTES,
  };
}

/** Garde uniquement les champs renseignés et visibles des catégories retenues. */
function cleanDetails(d: DevisDraft) {
  const out: Record<string, Record<string, unknown>> = {};
  for (const id of d.categoryIds) {
    const values = d.categoryDetails[id];
    if (!values) continue;
    const kept = Object.fromEntries(Object.entries(values).filter(([, v]) => isFilled(v)));
    if (Object.keys(kept).length) out[id] = kept;
  }
  return out;
}

/** Colonnes du devis : `legacy` existe dans toutes les bases, `extended` après le script SQL. */
export function devisColumns(d: DevisDraft) {
  const a = draftAmounts(d);
  const legacy = {
    reference: d.reference,
    valid_until: d.validUntil || null,
    subtotal: a.subtotal,
    discount: Number(d.discountValue) || 0,
    discount_type: d.discountType,
    extra_fees: a.fees,
    total: a.total,
    // Sans la colonne deposit_value, on garde l'ancienne convention (valeur saisie)
    deposit_amount: Number(d.depositValue) || 0,
    deposit_type: d.depositType,
    notes: d.notes,
  };
  const extended = {
    category_ids: d.categoryIds,
    service_name: d.serviceName || d.items.find((i) => i.designation)?.designation || null,
    description: d.description || null,
    client_name: d.clientName || null,
    event_name: d.eventName || null,
    event_type: d.eventType || null,
    event_date: d.eventDate || null,
    event_location: d.eventLocation || null,
    category_details: cleanDetails(d),
    tax_rate: Number(d.taxRate) || 0,
    tax_amount: a.tax,
    discount_amount: a.discount,
    deposit_value: Number(d.depositValue) || 0,
    deposit_amount: a.deposit,
    caution_amount: Number(d.cautionAmount) || 0,
  };
  return { legacy, extended, amounts: a };
}

/** Erreur due à une colonne absente (script SQL pas encore exécuté). */
export const isMissingColumn = (error: any) =>
  !!error && (error.code === "PGRST204" || error.code === "42703" || /column .* does not exist|Could not find the .* column/i.test(error.message || ""));

/**
 * Insère ou met à jour un devis avec toutes les colonnes,
 * et se rabat sur les colonnes historiques si la base n'est pas encore à jour.
 */
export async function writeDevis(
  supabase: SupabaseClient,
  d: DevisDraft,
  base: Record<string, unknown>,
  target: { id?: string }
): Promise<{ data: any; error: any; degraded: boolean }> {
  const { legacy, extended } = devisColumns(d);
  const run = (payload: Record<string, unknown>) =>
    target.id
      ? supabase.from("devis").update(payload).eq("id", target.id).select().single()
      : supabase.from("devis").insert(payload).select().single();

  const full = await run({ ...base, ...legacy, ...extended });
  if (!isMissingColumn(full.error)) return { data: full.data, error: full.error, degraded: false };
  const fallback = await run({ ...base, ...legacy });
  return { data: fallback.data, error: fallback.error, degraded: true };
}

/** Remplace les lignes et les frais d'un devis. */
export async function writeLines(supabase: SupabaseClient, devisId: string, d: DevisDraft): Promise<{ error: any }> {
  await supabase.from("devis_items").delete().eq("devis_id", devisId);
  await supabase.from("devis_options").delete().eq("devis_id", devisId);

  const items = d.items.filter((i) => i.designation.trim() || Number(i.total) > 0).map(normalizeLine);
  const legacyRows = items.map((i) => {
    const mode = modeOf(i.pricing_mode);
    // Sans colonne durée, la quantité porte quantité × durée pour que le total reste juste
    const quantity = mode.durationLabel ? Number(i.quantity) * Number(i.duration ?? 1) : Number(i.quantity);
    return {
      devis_id: devisId,
      designation: i.designation.trim() || "Prestation",
      description: i.description || null,
      quantity,
      unit: i.unit,
      unit_price: Number(i.unit_price) || 0,
      total: i.total,
    };
  });
  const fullRows = items.map((i, idx) => ({
    ...legacyRows[idx],
    quantity: Number(i.quantity),
    category_id: i.category_id || null,
    pricing_mode: i.pricing_mode || null,
    duration: i.duration ?? null,
    duration_unit: i.duration_unit ?? null,
  }));

  let error: any = null;
  if (fullRows.length) {
    const res = await supabase.from("devis_items").insert(fullRows);
    error = res.error;
    if (isMissingColumn(error)) error = (await supabase.from("devis_items").insert(legacyRows)).error;
  }

  const opts = d.options
    .filter((o) => o.name.trim())
    .map((o) => ({ devis_id: devisId, name: o.name.trim(), is_included: o.is_included, price: o.is_included ? 0 : Number(o.price) || 0 }));
  if (opts.length) {
    const res = await supabase.from("devis_options").insert(opts);
    error = error || res.error;
  }
  return { error };
}

/** Profil du prestataire (catégories comprises). */
export async function fetchProvider(supabase: SupabaseClient, id: string) {
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  return { profile: data, categoryIds: resolveProviderCategories(data) };
}

/** Enregistre les activités du prestataire dans son profil. */
export async function saveProviderCategories(supabase: SupabaseClient, id: string, categoryIds: string[]) {
  const label = getCategory(categoryIds[0])?.label ?? null;
  const res = await supabase.from("profiles").update({ categories: categoryIds, category: label }).eq("id", id);
  if (isMissingColumn(res.error)) return supabase.from("profiles").update({ category: label }).eq("id", id);
  return res;
}

const CUSTOM_TABLE = "prestataire_services_perso";

export async function loadCustomServices(supabase: SupabaseClient, providerId: string): Promise<{ list: CustomService[]; available: boolean }> {
  const { data, error } = await supabase.from(CUSTOM_TABLE).select("id, name, category_id").eq("prestataire_id", providerId).order("name");
  if (error) return { list: [], available: false };
  return { list: (data as CustomService[]) || [], available: true };
}

export async function addCustomService(supabase: SupabaseClient, providerId: string, name: string, categoryId: string | null) {
  return supabase
    .from(CUSTOM_TABLE)
    .insert({ prestataire_id: providerId, name: name.trim(), category_id: categoryId })
    .select("id, name, category_id")
    .single();
}

export async function removeCustomService(supabase: SupabaseClient, id: string) {
  return supabase.from(CUSTOM_TABLE).delete().eq("id", id);
}

/** Récapitulatif court des prestations pour le message automatique. */
export function linesSummary(d: DevisDraft, max = 4): string {
  const names = d.items.map((i) => i.designation.trim()).filter(Boolean);
  if (!names.length) return "";
  const shown = names.slice(0, max).map((n) => `• ${n}`).join("\n");
  return names.length > max ? `${shown}\n• … et ${names.length - max} autre(s) prestation(s)` : shown;
}

export type { PricingModeId };
