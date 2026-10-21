import { categoryOfService, getCategory } from "@/lib/devis/categories";

/**
 * Rubriques personnalisables des offres (catalogue) et des profils prestataires.
 * Le prestataire ajoute, renomme, réordonne ou supprime ses rubriques ;
 * des rubriques lui sont suggérées selon ses types d'événements et ses prestations.
 */

export type RubriqueKind = "texte" | "liste" | "infos";

export interface Rubrique {
  id: string;
  title: string;
  kind: RubriqueKind;
  text?: string;
  items?: string[];
  rows?: { label: string; value: string }[];
}

export interface RubriqueSuggestion {
  key: string;
  title: string;
  kind: RubriqueKind;
  /** Éléments pré-remplis (liste) */
  items?: string[];
  /** Libellés des lignes à compléter (infos) */
  rows?: string[];
  placeholder?: string;
  /** Prestation ou type d'événement à l'origine de la suggestion */
  source: string;
}

export const KIND_LABELS: Record<RubriqueKind, string> = {
  texte: "Texte",
  liste: "Liste",
  infos: "Informations",
};

let n = 0;
export const newRubriqueId = () => `r-${Date.now().toString(36)}-${++n}`;

type Seed = Omit<RubriqueSuggestion, "key" | "source">;
const t = (title: string, placeholder?: string): Seed => ({ title, kind: "texte", placeholder });
const l = (title: string, items: string[] = []): Seed => ({ title, kind: "liste", items });
const i = (title: string, rows: string[]): Seed => ({ title, kind: "infos", rows });

/** Rubriques d'offre suggérées par type de prestation */
const OFFER_BY_CATEGORY: Record<string, Seed[]> = {
  organisation: [l("Formules d'accompagnement", ["Organisation complète", "Coordination du jour J", "Conseil à la carte"]), t("Rétroplanning type"), i("Équipe le jour J", ["Coordinateurs", "Heures de présence"])],
  decoration: [l("Univers et thèmes"), l("Éléments fournis", ["Fleurs", "Drapés", "Centres de table", "Éclairage d'ambiance"]), i("Mise en place", ["Surface couverte", "Délai d'installation", "Démontage"])],
  traiteur: [l("Menu proposé", ["Entrée", "Plat principal", "Dessert"]), l("Boissons", ["Jus locaux (bissap, bouye, gingembre)", "Eau", "Sodas"]), t("Régimes particuliers", "Halal, végétarien, sans gluten…"), i("Service", ["Couverts minimum", "Couverts maximum", "Personnel de service"])],
  patisserie: [l("Parfums disponibles", ["Vanille", "Chocolat", "Coco", "Bissap"]), i("Commande", ["Nombre de parts", "Délai de commande", "Livraison"])],
  tenues: [l("Tissus disponibles", ["Bazin riche", "Wax", "Dentelle", "Satin"]), i("Confection", ["Délai de confection", "Nombre d'essayages", "Tailles"])],
  beaute: [l("Prestations incluses", ["Maquillage", "Coiffure", "Pose de cils"]), i("Déroulé", ["Durée", "Essai préalable", "Déplacement"])],
  photo_video: [l("Livrables", ["Photos HD retouchées", "Galerie en ligne", "Clé USB", "Film"]), l("Matériel utilisé"), i("Couverture", ["Durée de couverture", "Nombre de photos", "Délai de livraison"])],
  musique: [l("Répertoire et styles", ["Mbalax", "Coupé-décalé", "Afrobeat", "Zouk", "Variété internationale"]), l("Matériel fourni"), i("Prestation", ["Durée", "Nombre d'artistes"])],
  lieux: [l("Équipements", ["Climatisation", "Parking", "Groupe électrogène", "Cuisine"]), i("Capacités", ["Places assises", "Places debout", "Horaires", "Parking"]), t("Règlement du lieu")],
  location_materiel: [l("Inventaire disponible"), i("Location", ["Durée minimum", "Caution", "Livraison"])],
  sono_audiovisuel: [l("Matériel"), i("Technique", ["Puissance", "Techniciens", "Temps d'installation"])],
  papeterie: [l("Formats et finitions", ["Dorure", "Papier texturé", "Enveloppe personnalisée"]), i("Production", ["Quantité minimum", "Délai de production"])],
  transport: [l("Véhicules disponibles"), i("Trajet", ["Nombre de places", "Chauffeur", "Durée"])],
  personnel: [l("Profils disponibles", ["Hôtesses", "Serveurs", "Agents de sécurité"]), i("Mission", ["Effectif", "Tenue", "Durée de mission"])],
  communication: [l("Livrables", ["Stories", "Reels", "Photos", "Aftermovie"]), l("Plateformes", ["Instagram", "TikTok", "Facebook"]), i("Livraison", ["Délai de livraison", "Nombre de publications"])],
};

/** Rubriques de profil suggérées par type de prestation */
const PROFILE_BY_CATEGORY: Record<string, Seed[]> = {
  organisation: [i("Notre expérience", ["Événements organisés", "Années d'expérience"])],
  decoration: [l("Univers signature")],
  traiteur: [l("Spécialités culinaires", ["Thiéboudienne", "Yassa", "Attiéké-poisson"])],
  patisserie: [l("Créations signature")],
  tenues: [l("Créations phares")],
  beaute: [l("Marques et produits utilisés")],
  photo_video: [t("Style photographique", "Naturel, éditorial, cinématographique…")],
  musique: [l("Répertoire")],
  lieux: [i("Capacités et espaces", ["Salles", "Capacité maximale", "Espaces extérieurs"])],
  location_materiel: [l("Catalogue de matériel")],
  sono_audiovisuel: [l("Parc matériel")],
  papeterie: [l("Finitions proposées")],
  transport: [l("Flotte de véhicules")],
  personnel: [t("Profils et formations")],
  communication: [i("Réseaux et audience", ["Instagram", "TikTok", "Facebook"])],
};

const PROFILE_GENERIC: Seed[] = [
  t("Pourquoi nous choisir"),
  l("Nos références"),
  t("Notre équipe"),
  t("Conditions de réservation", "Acompte, délais, annulation…"),
  l("Moyens de paiement", ["Wave", "Orange Money", "Espèces", "Virement"]),
];

/** Rubriques d'offre suggérées par type d'événement */
function offerByEventType(type: string): Seed[] {
  switch (type) {
    case "Mariage":
      return [l("Cérémonies couvertes", ["Mariage civil", "Mariage religieux", "Dot / mariage coutumier", "Réception"])];
    case "Baptême":
      return [t("Déroulé du baptême", "Ngénte, cérémonie, réception…")];
    case "Henné time":
      return [t("Ambiance henné time")];
    case "Yendou":
      return [t("Spécificités du Yendou")];
    case "Conférence":
    case "Gala":
    case "Réception":
    case "Dîner":
    case "Brunch":
    case "Soirée":
      return [i(`Format ${type === "Brunch" ? "du brunch" : type === "Soirée" ? "de la soirée" : type === "Réception" ? "de la réception" : type === "Conférence" ? "de la conférence" : type === "Gala" ? "du gala" : "du dîner"}`, ["Nombre de participants", "Durée"])];
    default:
      return [l(`Thèmes ${type === "Anniversaire" ? "d'anniversaire" : type === "Fiançailles" ? "de fiançailles" : type === "Baby shower" ? "de baby shower" : "proposés"}`)];
  }
}

const sourceLabel = (prestation: string) => getCategory(categoryOfService(prestation))?.label ?? prestation;

function dedupe(list: RubriqueSuggestion[], existing: Rubrique[]): RubriqueSuggestion[] {
  const taken = new Set(existing.map((r) => r.title.trim().toLowerCase()));
  const seen = new Set<string>();
  return list.filter((s) => {
    const k = s.title.trim().toLowerCase();
    if (taken.has(k) || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Suggestions pour une offre du catalogue, selon ses prestations et types d'événements. */
export function suggestOfferRubriques(prestations: string[], eventTypes: string[], existing: Rubrique[]): RubriqueSuggestion[] {
  const out: RubriqueSuggestion[] = [];
  for (const p of prestations) {
    const cat = categoryOfService(p);
    for (const s of (cat && OFFER_BY_CATEGORY[cat]) || []) out.push({ ...s, key: `${p}:${s.title}`, source: sourceLabel(p) });
  }
  for (const e of eventTypes) for (const s of offerByEventType(e)) out.push({ ...s, key: `${e}:${s.title}`, source: e });
  return dedupe(out, existing);
}

/** Suggestions pour le profil, selon toutes les prestations et types d'événements du prestataire. */
export function suggestProfileRubriques(prestations: string[], eventTypes: string[], existing: Rubrique[]): RubriqueSuggestion[] {
  const out: RubriqueSuggestion[] = [];
  for (const p of prestations) {
    const cat = categoryOfService(p);
    for (const s of (cat && PROFILE_BY_CATEGORY[cat]) || []) out.push({ ...s, key: `${p}:${s.title}`, source: sourceLabel(p) });
  }
  if (eventTypes.length) {
    out.push({ title: "Événements réalisés", kind: "infos", rows: eventTypes, key: "events-done", source: "Vos types d'événements" });
  }
  for (const s of PROFILE_GENERIC) out.push({ ...s, key: `generic:${s.title}`, source: "Pour tous les prestataires" });
  return dedupe(out, existing);
}

export function rubriqueFromSuggestion(s: RubriqueSuggestion): Rubrique {
  return {
    id: newRubriqueId(),
    title: s.title,
    kind: s.kind,
    text: s.kind === "texte" ? "" : undefined,
    items: s.kind === "liste" ? [...(s.items ?? [])] : undefined,
    rows: s.kind === "infos" ? (s.rows ?? []).map((label) => ({ label, value: "" })) : undefined,
  };
}

/** Rubriques valides lues depuis la base (JSON). */
export function parseRubriques(v: unknown): Rubrique[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((r): r is Rubrique => !!r && typeof r === "object" && typeof (r as Rubrique).title === "string")
    .map((r) => ({ ...r, id: r.id || newRubriqueId(), kind: (["texte", "liste", "infos"] as const).includes(r.kind) ? r.kind : "texte" }));
}

/** Contenu réellement rempli (pour l'affichage aux organisateurs). */
export function isRubriqueFilled(r: Rubrique): boolean {
  if (r.kind === "texte") return !!r.text?.trim();
  if (r.kind === "liste") return (r.items ?? []).some((x) => x.trim());
  return (r.rows ?? []).some((x) => x.value.trim());
}
