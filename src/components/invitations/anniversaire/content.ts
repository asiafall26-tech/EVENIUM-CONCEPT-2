// Editable content of the "Anniversaire Bordeaux & Or" invitation model (two pages, stored as JSON on the event).

export const ANNIVERSAIRE_MODEL_ID = "invit-11";

export const ASSETS = "/models/anniversaire";
export const DEFAULT_PHOTO = `${ASSETS}/photo.jpg`;

/** Icons available for the "Au programme" items */
export const PROGRAMME_ICONS = {
  diner: "Dîner",
  gateau: "Gâteau",
  ambiance: "Ambiance",
  souvenirs: "Souvenirs",
  cadeaux: "Cadeaux",
  cocktail: "Cocktail",
  danse: "Danse",
  surprise: "Surprise",
} as const;
export type ProgrammeIcon = keyof typeof PROGRAMME_ICONS;

export interface ProgrammeItem {
  icon: ProgrammeIcon;
  label: string;
}

export interface AnniversaireContent {
  /* Page 1 — couverture */
  coverTitle: string;
  coverSubtitle: string;
  coverPhoto: string;
  /** CSS object-position of the photo */
  coverFocus: string;
  /* Page 2 — invitation */
  celebrant: string;
  age: string;
  kicker: string;
  title: string;
  message: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM */
  time: string;
  timeLabel: string;
  venueName: string;
  venueCity: string;
  /** Google Maps link; empty = search by venue name + city */
  mapsUrl: string;
  programmeTitle: string;
  programme: ProgrammeItem[];
  closing: string;
  rsvpDeadline: string;
  /** Optional song; empty = no music */
  audioUrl?: string;
  audioTitle?: string;
  audioStart?: number;
  audioEnd?: number;
}

export const DEFAULT_ANNIVERSAIRE: AnniversaireContent = {
  coverTitle: "Happy Birthday",
  coverSubtitle: "",
  coverPhoto: DEFAULT_PHOTO,
  coverFocus: "50% 35%",
  celebrant: "Aïcha",
  age: "",
  kicker: "Vous êtes cordialement invité(e) à mon",
  title: "Anniversaire",
  message:
    "C'est avec une immense joie que je vous invite à célébrer cette journée si spéciale à mes côtés. Votre présence rendra cet anniversaire encore plus mémorable.",
  date: "2026-02-15",
  time: "19:00",
  timeLabel: "À partir de",
  venueName: "Salle de réception",
  venueCity: "Dakar",
  mapsUrl: "",
  programmeTitle: "Au programme",
  programme: [
    { icon: "diner", label: "Dîner" },
    { icon: "gateau", label: "Gâteau" },
    { icon: "ambiance", label: "Ambiance" },
    { icon: "souvenirs", label: "Souvenirs" },
  ],
  closing: "Votre présence est mon plus beau cadeau",
  rsvpDeadline: "Merci de confirmer votre présence avant le 5 février",
};

export const MAX_PROGRAMME = 6;

/** Fills missing keys (e.g. content saved by an older version) with defaults. */
export function withDefaults(partial?: Partial<AnniversaireContent> | null): AnniversaireContent {
  const c = { ...DEFAULT_ANNIVERSAIRE, ...(partial ?? {}) };
  if (!Array.isArray(c.programme)) c.programme = DEFAULT_ANNIVERSAIRE.programme;
  c.programme = c.programme
    .filter((p) => p && typeof p === "object")
    .map((p) => ({ icon: (p.icon in PROGRAMME_ICONS ? p.icon : "surprise") as ProgrammeIcon, label: p.label ?? "" }))
    .slice(0, MAX_PROGRAMME);
  if (!c.coverPhoto) c.coverPhoto = DEFAULT_PHOTO;
  return c;
}

/** Pre-fills the model from the event (name, date, time, location). */
export function seedFromEvent(event: { name?: string; date?: string; time?: string; location?: string }): AnniversaireContent {
  const seeded = withDefaults();
  // "Anniversaire de Aïcha" / "Anniversaire d'Aïcha" → Aïcha
  const name = event.name?.match(/anniversaire\s+(?:de\s+|d['’]\s*)?(.+)$/i)?.[1]?.trim();
  if (name) seeded.celebrant = name;
  if (event.date && /^\d{4}-\d{2}-\d{2}$/.test(event.date)) seeded.date = event.date;
  if (event.time && /^\d{2}:\d{2}/.test(event.time)) seeded.time = event.time.slice(0, 5);
  if (event.location && event.location !== "À définir") {
    const [venue, ...rest] = event.location.split(",").map((s) => s.trim()).filter(Boolean);
    if (venue) seeded.venueName = venue;
    seeded.venueCity = rest.join(", ") || seeded.venueCity;
  }
  return seeded;
}

export function eventDate(c: AnniversaireContent): Date | null {
  const d = new Date(`${c.date}T${c.time || "00:00"}:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDates(c: AnniversaireContent) {
  const d = eventDate(c);
  if (!d) return { weekday: "", dayMonth: "Date à définir", year: "", long: "Date à définir" };
  return {
    weekday: d.toLocaleDateString("fr-FR", { weekday: "long" }),
    dayMonth: d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" }),
    year: String(d.getFullYear()),
    long: d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  };
}

/** "19:00" → "19H00" as printed on the invitation */
export const printTime = (t: string) => t.replace(":", "H");

export function mapsLink(c: AnniversaireContent) {
  if (c.mapsUrl.trim()) return c.mapsUrl.trim();
  const q = [c.venueName, c.venueCity].filter(Boolean).join(", ");
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : "";
}
