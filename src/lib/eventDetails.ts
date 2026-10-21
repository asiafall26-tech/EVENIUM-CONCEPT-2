/**
 * Détails importants d'un événement, demandés à l'achat des formules Premium et Gold
 * puis affichés et modifiables dans le dashboard organisateur.
 * Colonnes : guests_count, budget_total, date, time, location (existantes) + event_details (JSON).
 */

export interface EventDetails {
  guestsCount: number | "";
  date: string;
  time: string;
  location: string;
  budget: number | "";
  /** Thème, style, couleurs */
  theme: string;
  /** Déroulé : cérémonie, cocktail, soirée… */
  programme: string;
  /** Types de prestation recherchés */
  prestationsRecherchees: string[];
  /** Informations importantes (accès, contraintes, invités VIP…) */
  notes: string;
}

export const EMPTY_EVENT_DETAILS: EventDetails = {
  guestsCount: "",
  date: "",
  time: "",
  location: "",
  budget: "",
  theme: "",
  programme: "",
  prestationsRecherchees: [],
  notes: "",
};

/** Les formules Premium et Gold exigent ces détails à l'inscription. */
export const requiresEventDetails = (plan?: string | null) => plan === "Premium" || plan === "Gold";

export function missingEventDetails(d: EventDetails): string[] {
  const missing: string[] = [];
  if (!(Number(d.guestsCount) > 0)) missing.push("le nombre d'invités");
  if (!d.date.trim()) missing.push("la date");
  if (!d.location.trim()) missing.push("le lieu");
  return missing;
}

const clean = (v: unknown) => (typeof v === "string" && v !== "À définir" ? v : "");

/** Détails à partir d'une ligne `events` (ou d'un événement du contexte). */
export function eventDetailsFromRow(row: any): EventDetails {
  const extra = (row?.event_details ?? row?.eventDetails ?? {}) as Record<string, unknown>;
  const guests = Number(row?.guests_count ?? row?.guestsCount);
  const budget = Number(row?.budget_total ?? row?.budget?.total);
  return {
    guestsCount: guests > 0 ? guests : "",
    date: clean(row?.date),
    time: clean(row?.time),
    location: clean(row?.location),
    budget: budget > 0 ? budget : "",
    theme: typeof extra.theme === "string" ? extra.theme : "",
    programme: typeof extra.programme === "string" ? extra.programme : "",
    prestationsRecherchees: Array.isArray(extra.prestations_recherchees) ? (extra.prestations_recherchees as string[]) : [],
    notes: typeof extra.notes === "string" ? extra.notes : "",
  };
}

/** Colonnes `events` correspondantes ; `event_details` n'existe qu'après le script SQL. */
export function eventDetailsToRow(d: EventDetails) {
  return {
    guests_count: Number(d.guestsCount) || 0,
    date: d.date || null,
    time: d.time || null,
    location: d.location.trim() || null,
    budget_total: Number(d.budget) || 0,
    event_details: {
      theme: d.theme.trim(),
      programme: d.programme.trim(),
      prestations_recherchees: d.prestationsRecherchees,
      notes: d.notes.trim(),
    },
  };
}

/** Thème et programme ne sont plus demandés (déjà présents dans l'invitation) */
export const hasExtraDetails = (d: EventDetails) => !!(d.notes || d.prestationsRecherchees.length);
