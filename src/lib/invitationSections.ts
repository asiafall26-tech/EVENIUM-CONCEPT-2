/**
 * Rubriques d'une invitation, pour tous les modèles (Evenium et importés) :
 * l'organisateur peut supprimer (masquer) une rubrique du modèle et ajouter ses propres rubriques.
 * - Modèles Evenium : rubriques repérées par data-inv-sec="<clé>" ; réglages dans le contenu (__hidden, __rubriques)
 * - Modèles importés : rubriques numérotées à l'import ; réglages dans les valeurs (JSON)
 */

export interface AddedRubrique {
  id: string;
  title: string;
  text: string;
  image: string;
  /** clé de la rubrique après laquelle elle s'affiche (vide = à la fin) */
  after: string;
}

export interface SectionDef {
  key: string;
  label: string;
}

export interface SectionsState {
  hidden: string[];
  rubriques: AddedRubrique[];
}

export const newRubrique = (after: string): AddedRubrique => ({
  id: Math.random().toString(36).slice(2, 9),
  title: "Nouvelle rubrique",
  text: "",
  image: "",
  after,
});

/** Réglages de rubriques rangés dans le contenu d'un modèle Evenium */
export function sectionsOf(content: { __hidden?: unknown; __rubriques?: unknown } | null | undefined): SectionsState {
  const hidden = Array.isArray(content?.__hidden) ? content.__hidden.map(String) : [];
  const rubriques = Array.isArray(content?.__rubriques)
    ? (content.__rubriques as AddedRubrique[]).filter((r) => r && typeof r === "object" && r.id)
    : [];
  return { hidden, rubriques };
}

/** Rubriques des modèles Evenium, dans l'ordre de la page */
const VELOURS: SectionDef[] = [
  { key: "hero", label: "Couverture & prénoms" },
  { key: "welcome", label: "Mot d'accueil" },
  { key: "story", label: "À propos de nous" },
  { key: "programme", label: "Programme" },
  { key: "details", label: "Quand et où" },
  { key: "rsvp", label: "Confirmation (RSVP)" },
];
const IVOIRE: SectionDef[] = [
  { key: "welcome", label: "Mot d'accueil & prénoms" },
  { key: "details", label: "Date & horaires" },
  { key: "venues", label: "Lieux" },
  { key: "programme", label: "Programme" },
  { key: "dress", label: "Code vestimentaire" },
  { key: "rsvp", label: "Confirmation (RSVP)" },
  { key: "finale", label: "Mot de la fin" },
];
const ROSE_OR: SectionDef[] = [
  { key: "quote", label: "Citation" },
  { key: "countdown", label: "Compte à rebours" },
  { key: "gallery", label: "Galerie photos" },
  { key: "story", label: "Notre histoire" },
  { key: "programme", label: "Le déroulé" },
  { key: "details", label: "Lieu & détails" },
  { key: "rsvp", label: "Confirmation (RSVP)" },
];
const ANNIVERSAIRE: SectionDef[] = [
  { key: "cover", label: "Page 1 · Couverture" },
  { key: "card", label: "Page 2 · Carte d'invitation" },
];

/** Rubriques d'un modèle Evenium (le Sceau d'Or a une rubrique par page de programme). */
export function builtInSections(modelId: string, content?: Record<string, unknown> | null): SectionDef[] {
  switch (modelId) {
    case "invit-7":
      return VELOURS;
    case "invit-9":
      return IVOIRE;
    case "invit-10":
      return ROSE_OR;
    case "invit-11":
      return ANNIVERSAIRE;
    case "invit-8": {
      const pages = Array.isArray(content?.programme) ? (content.programme as { title?: string }[]) : [];
      return [
        ...pages.map((p, i) => ({ key: `prog-${i}`, label: p.title ? `Programme · ${p.title}` : `Programme · page ${i + 1}` })),
        { key: "dress", label: "Dress code" },
        { key: "rsvp", label: "Fiche invité (RSVP)" },
      ];
    }
    default:
      return [];
  }
}
