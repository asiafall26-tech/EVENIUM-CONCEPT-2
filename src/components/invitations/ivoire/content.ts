// Editable content of the "Ivoire Couture" invitation model (stored as JSON on the event).

import type { DressColor } from "../sceau/content";

export const IVOIRE_MODEL_ID = "invit-9";

export const DEFAULT_PHOTO = "/models/ivoire/couple.jpg";

export interface TimeItem {
  time: string;
  label: string;
}

export interface Venue {
  /** Line above the card, e.g. "Rejoignez-nous à" */
  intro: string;
  name: string;
  /** e.g. "Cérémonie civile" */
  kind: string;
  address: string;
  /** e.g. "Merci d'être présent(e) dès 13H45" */
  when: string;
  /** Google Maps link; empty = search by name + address */
  mapsUrl: string;
}

/** One block of the programme (a day, or a part of the day) */
export interface ProgrammeBlock {
  title: string;
  items: TimeItem[];
}

export interface IvoireContent {
  partnerA: string;
  partnerB: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM, target of the countdown */
  time: string;
  /** Main photo of the couple (URL or uploaded data URL) */
  heroPhoto: string;
  /** Focal point of the photo, CSS object-position (e.g. "52% 45%") */
  heroFocus: string;
  /** Up to 3 key times shown on the photo */
  heroTimes: TimeItem[];
  openingText: string;
  welcomeLead: string;
  welcomeText: string;
  detailsText: string;
  venues: Venue[];
  programmeTitle: string;
  programmeIntro: string;
  programme: ProgrammeBlock[];
  dressCodeText: string;
  dressColors: DressColor[];
  rsvpTitle: string;
  rsvpDeadline: string;
  loveText: string;
  /** Optional photo in the oval frame of the final card; empty = monogram */
  finalPhoto: string;
  /** Optional song chosen or imported by the couple; empty = synthesised music box */
  audioUrl?: string;
  audioTitle?: string;
  /** Part of the song played (seconds); audioEnd 0 = until the end */
  audioStart?: number;
  audioEnd?: number;
}

export const DEFAULT_IVOIRE: IvoireContent = {
  partnerA: "Khadija",
  partnerB: "Ousmane",
  date: "2027-08-15",
  time: "13:45",
  heroPhoto: DEFAULT_PHOTO,
  heroFocus: "52% 45%",
  heroTimes: [
    { time: "13:45", label: "Cérémonie civile" },
    { time: "17:30", label: "Réception" },
  ],
  openingText: "Vous êtes invités",
  welcomeLead: "C'est avec beaucoup de bonheur que nous vous invitons",
  welcomeText:
    "à partager avec nous une journée qui nous est chère.\n\nEntourés de nos familles et de nos proches,\nnous célébrerons l'amour qui nous unit\net la promesse d'une vie à deux.",
  detailsText: "Tout ce dont vous avez besoin pour célébrer notre journée spéciale",
  venues: [
    {
      intro: "Rejoignez-nous à",
      name: "Mairie de Dakar-Plateau",
      kind: "Cérémonie civile",
      address: "Dakar-Plateau, Dakar, Sénégal",
      when: "Merci d'être présent(e) dès 13H45",
      mapsUrl: "https://www.google.com/maps/@14.6677,-17.4365,16z",
    },
    {
      intro: "Puis, la fête continue à",
      name: "Les Salons du Lac",
      kind: "Réception",
      address: "Route des Almadies, Dakar, Sénégal",
      when: "À partir de 17H30",
      mapsUrl: "https://www.google.com/maps/@14.7425,-17.5108,15z",
    },
  ],
  programmeTitle: "Programme",
  programmeIntro:
    "Nous serions honorés de partager avec vous cette journée unique et de célébrer ensemble le début de notre nouvelle histoire.",
  programme: [
    {
      title: "Le fil de notre journée",
      items: [
        { time: "13:45", label: "Cérémonie civile" },
        { time: "15:00", label: "Shooting des mariés" },
        { time: "17:30", label: "Cocktail de bienvenue" },
        { time: "19:30", label: "Dîner & soirée" },
      ],
    },
  ],
  dressCodeText: "",
  dressColors: [],
  rsvpTitle: "Nous comptons sur votre présence",
  rsvpDeadline: "Merci de nous confirmer votre présence avant le 01/08",
  loveText: "Avec tout notre amour",
  finalPhoto: "",
};

export const EMPTY_VENUE: Venue = { intro: "", name: "", kind: "", address: "", when: "", mapsUrl: "" };

/** Fills missing keys (e.g. content saved by an older version) with defaults. */
export function withDefaults(partial?: Partial<IvoireContent> | null): IvoireContent {
  const c = { ...DEFAULT_IVOIRE, ...(partial ?? {}) };
  if (!Array.isArray(c.venues)) c.venues = DEFAULT_IVOIRE.venues;
  c.venues = c.venues.map((v) => ({ ...EMPTY_VENUE, ...v }));
  if (!Array.isArray(c.programme)) c.programme = DEFAULT_IVOIRE.programme;
  c.programme = c.programme.map((b) => ({ title: b.title ?? "", items: b.items ?? [] }));
  if (!Array.isArray(c.heroTimes)) c.heroTimes = DEFAULT_IVOIRE.heroTimes;
  if (!Array.isArray(c.dressColors)) c.dressColors = [];
  if (!c.heroPhoto) c.heroPhoto = DEFAULT_PHOTO;
  return c;
}

/** Pre-fills the model from what the user typed in the event creation wizard. */
export function seedFromEvent(event: { name?: string; date?: string; time?: string; location?: string }): IvoireContent {
  const seeded = withDefaults();
  // Demo pins must not follow a real event: without a link each map searches the venue address
  seeded.venues = seeded.venues.map((v) => ({ ...v, mapsUrl: "" }));
  // "Mariage Astou & Ali" → Astou / Ali
  const names = event.name?.match(/([\p{L}'-]+)\s*(?:&|et)\s*([\p{L}'-]+)/iu);
  if (names) {
    seeded.partnerA = names[1];
    seeded.partnerB = names[2];
  }
  if (event.date && /^\d{4}-\d{2}-\d{2}$/.test(event.date)) seeded.date = event.date;
  if (event.time && /^\d{2}:\d{2}/.test(event.time)) seeded.time = event.time.slice(0, 5);
  return seeded;
}

export function weddingDate(c: IvoireContent): Date | null {
  const d = new Date(`${c.date}T${c.time || "00:00"}:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function formatDates(c: IvoireContent) {
  const d = weddingDate(c);
  if (!d) return { weekday: "", day: "", monthYear: "Date à définir", dots: "", long: "Date à définir" };
  return {
    weekday: capitalize(d.toLocaleDateString("fr-FR", { weekday: "long" })),
    day: String(d.getDate()),
    monthYear: `${capitalize(d.toLocaleDateString("fr-FR", { month: "long" }))} · ${d.getFullYear()}`,
    dots: `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`,
    long: d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
  };
}

/** "13:45" → "13H45" as printed on the invitation */
export function printTime(t: string) {
  return t.replace(":", "H");
}

export function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "·";
}

/* postMessage protocol between an editor and the preview iframe */
export const PREVIEW_MSG = {
  ready: "ivoire:ready",
  content: "ivoire:content",
  replay: "ivoire:replay",
  skip: "ivoire:skip",
} as const;
