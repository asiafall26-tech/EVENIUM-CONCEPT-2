import { EVENT_TYPES } from "@/lib/eventTypes";
import { prestationType } from "@/lib/devis/categories";
import { parseRubriques, type Rubrique } from "@/lib/rubriques";

/**
 * Lecture des offres du catalogue (table `services`).
 * Les types d'événements, prestations, rubriques personnalisées et rubriques masquées
 * sont stockés dans `infos_pratiques` (JSON) ; `categorie` et `prestation` gardent
 * la première valeur pour les anciens affichages.
 */

export const ALL_EVENTS = "Tous événements";

/** Rubriques intégrées d'une offre, que le prestataire peut retirer */
export const BUILTIN_SECTIONS = {
  inclus: "Ce qui est inclus",
  options: "Options supplémentaires",
  infos: "Informations pratiques",
} as const;
export type BuiltinSection = keyof typeof BUILTIN_SECTIONS;

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x.trim()) : []);

export function offerEventTypes(s: any): string[] {
  const list = strings(s?.event_types).length ? strings(s?.event_types) : strings(s?.infos_pratiques?.event_types);
  if (list.length) return list;
  return (EVENT_TYPES as readonly string[]).includes(s?.categorie) ? [s.categorie] : [];
}

export function offerPrestations(s: any): string[] {
  const list = strings(s?.prestations).length ? strings(s?.prestations) : strings(s?.infos_pratiques?.prestations);
  const raw = list.length ? list : s?.prestation ? [s.prestation] : [];
  return [...new Set(raw.map(prestationType))];
}

export const offerRubriques = (s: any): Rubrique[] => parseRubriques(s?.infos_pratiques?.rubriques);

export const offerHidden = (s: any): BuiltinSection[] =>
  strings(s?.infos_pratiques?.masquees).filter((k): k is BuiltinSection => k in BUILTIN_SECTIONS);

/** Ligne courte « Traiteurs et restauration · Mariage, Baptême » */
export function offerTagLine(s: any, max = 2): string {
  const prestations = offerPrestations(s);
  const events = offerEventTypes(s);
  const p = prestations.slice(0, max).join(", ") + (prestations.length > max ? ` +${prestations.length - max}` : "");
  const e = events.length ? events.slice(0, max).join(", ") + (events.length > max ? ` +${events.length - max}` : "") : ALL_EVENTS;
  return [p, e].filter(Boolean).join(" · ");
}

/** L'offre convient-elle à ce type d'événement ? (aucun type = tous les événements) */
export const offerMatchesEvent = (s: any, type: string) => {
  const events = offerEventTypes(s);
  return events.length === 0 || events.includes(type);
};
