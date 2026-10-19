// Editable content of the "Sceau d'Or" invitation model (stored as JSON on the event).

export const SCEAU_MODEL_ID = "invit-8";

export interface ProgrammeItem {
  time: string;
  label: string;
}

/** One programme page; large weddings can split days / venues into as many pages as needed */
export interface ProgrammePage {
  title: string;
  /** Free text shown under the title, e.g. "Vendredi 14 mai" */
  subtitle: string;
  place: string;
  /** Google Maps link for this page's place (optional) */
  mapsUrl: string;
  items: ProgrammeItem[];
}

export interface DressColor {
  name: string;
  hex: string;
}

export interface SceauContent {
  partnerA: string;
  partnerB: string;
  /** Name on the envelope; a link ending in #famille-diop overrides it per guest */
  guestLabel: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM */
  time: string;
  city: string;
  welcomeTitle: string;
  welcomeText: string;
  venueTitle: string;
  address: string;
  venueKind: string;
  venue: string;
  /** Google Maps link of the venue; empty = search by address */
  mapsUrl: string;
  showMap: boolean;
  programme: ProgrammePage[];
  dressCodeText: string;
  dressColors: DressColor[];
  giftsTitle: string;
  giftsText: string;
  rsvpText: string;
  drinks: string[];
  closingText: string;
  /** Optional song chosen or imported by the couple; empty = synthesised music box */
  audioUrl?: string;
  audioTitle?: string;
  /** Part of the song played (seconds); audioEnd 0 = until the end */
  audioStart?: number;
  audioEnd?: number;
}

export const DEFAULT_SCEAU: SceauContent = {
  partnerA: "Aïssatou",
  partnerB: "Cheikh",
  guestLabel: "Famille Ndiaye",
  date: "2027-05-15",
  time: "19:00",
  city: "Dakar",
  welcomeTitle: "Chers parents et amis !",
  welcomeText:
    "Nous avons la joie de vous inviter à partager avec nous un jour unique : celui où notre histoire devient une famille.",
  venueTitle: "La fête aura lieu",
  address: "Route de la Corniche Ouest, Dakar",
  venueKind: "salle de réception",
  venue: "Le Pavillon des Roses",
  // Demo pin on the Corniche Ouest; replaced by the client's own link after purchase
  mapsUrl: "https://www.google.com/maps/@14.6928,-17.4730,15z",
  showMap: true,
  programme: [
    {
      title: "Programme du jour",
      subtitle: "",
      place: "",
      mapsUrl: "",
      items: [
        { time: "19:00", label: "Accueil des invités" },
        { time: "19:30", label: "Arrivée des mariés" },
        { time: "20:30", label: "Dîner" },
        { time: "22:00", label: "Ouverture du bal" },
        { time: "01:00", label: "Fin de la soirée" },
      ],
    },
  ],
  dressCodeText: "Nous serions ravis que vos tenues s'accordent aux couleurs de notre mariage :",
  dressColors: [
    { name: "Bordeaux", hex: "#5e1622" },
    { name: "Mauve", hex: "#7b5960" },
    { name: "Sable", hex: "#d4bfa4" },
    { name: "Ivoire", hex: "#f1e7da" },
  ],
  giftsTitle: "Un mot sur les cadeaux",
  giftsText:
    "Votre présence est notre plus beau cadeau.\nSi vous souhaitez nous gâter, une urne vous attendra à l'entrée pour vos enveloppes et vos mots doux : ils nous aideront à réaliser nos rêves à deux.",
  rsvpText: "Merci de répondre avant le 15 avril 2027 : cela nous aidera à organiser la fête.",
  drinks: ["Bissap", "Gingembre", "Bouye", "Cocktail sans alcool", "Soda", "Eau minérale"],
  closingText: "Nous avons hâte de vous retrouver à notre mariage !",
};

export const EMPTY_PROGRAMME_PAGE: ProgrammePage = {
  title: "",
  subtitle: "",
  place: "",
  mapsUrl: "",
  items: [{ time: "", label: "" }],
};

/** Fills missing keys (e.g. content saved by an older version) with defaults. */
export function withDefaults(partial?: Partial<SceauContent> | null): SceauContent {
  const c = { ...DEFAULT_SCEAU, ...(partial ?? {}) };
  if (!Array.isArray(c.programme) || c.programme.length === 0) c.programme = DEFAULT_SCEAU.programme;
  c.programme = c.programme.map((p) => ({ ...EMPTY_PROGRAMME_PAGE, ...p, items: p.items ?? [] }));
  return c;
}

/** Pre-fills the model from what the user typed in the event creation wizard. */
export function seedFromEvent(event: { name?: string; date?: string; time?: string; location?: string }): SceauContent {
  const seeded = withDefaults();
  // The demo pin must not follow a real event: without a link the map searches the client's address
  seeded.mapsUrl = "";
  // "Mariage Astou & Ali" → Astou / Ali
  const names = event.name?.match(/([\p{L}'-]+)\s*(?:&|et)\s*([\p{L}'-]+)/iu);
  if (names) {
    seeded.partnerA = names[1];
    seeded.partnerB = names[2];
  }
  if (event.time && /^\d{2}:\d{2}/.test(event.time)) seeded.time = event.time.slice(0, 5);
  if (event.location?.trim()) seeded.city = event.location.trim();
  if (event.date && /^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
    seeded.date = event.date;
    const d = weddingDate(seeded);
    if (d) {
      const deadline = new Date(d);
      deadline.setMonth(deadline.getMonth() - 1);
      seeded.rsvpText = `Merci de répondre avant le ${deadline.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} : cela nous aidera à organiser la fête.`;
    }
  }
  return seeded;
}

export function weddingDate(c: SceauContent): Date | null {
  const d = new Date(`${c.date}T${c.time || "00:00"}:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function formatDates(c: SceauContent) {
  const d = weddingDate(c);
  if (!d) return { long: "Date à définir", dots: "", month: "", week: [] as number[], day: 0, time: c.time };
  // Monday-first week containing the wedding day
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const week = Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return x.getDate();
  });
  return {
    long: capitalize(d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })),
    dots: `${String(d.getDate()).padStart(2, "0")} · ${String(d.getMonth() + 1).padStart(2, "0")} · ${d.getFullYear()}`,
    month: capitalize(d.toLocaleDateString("fr-FR", { month: "long" })),
    week,
    day: d.getDate(),
    time: `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`,
  };
}

export function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "·";
}

/* ---------- Google Maps ---------- */

/** Only http(s) links are kept: the content is shown to every guest. */
export function safeUrl(url: string): string | null {
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : null;
}

/** Link opened by the "Voir sur la carte" buttons: the pasted Google Maps link, else a search on the address. */
export function mapsLink(url: string, query: string): string {
  return safeUrl(url) ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Embeddable map (no API key needed). Short share links (maps.app.goo.gl) cannot be embedded,
 * so coordinates or a place name are pulled from full links when possible, else the address is used.
 */
export function mapsEmbedUrl(url: string, query: string): string {
  const u = safeUrl(url) ?? "";
  const coords = u.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ?? u.match(/[?&](?:q|query|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  const place = u.match(/\/place\/([^/@?]+)/)?.[1];
  const q = coords ? `${coords[1]},${coords[2]}` : place ? decodeURIComponent(place.replace(/\+/g, " ")) : query;
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`;
}

/** Waze navigation: uses coordinates from a full Google Maps link when present, else searches the address */
export function wazeLink(url: string, query: string): string {
  const u = safeUrl(url) ?? "";
  const coords = u.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ?? u.match(/[?&](?:q|query|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  return coords
    ? `https://waze.com/ul?ll=${coords[1]},${coords[2]}&navigate=yes`
    : `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`;
}

export function venueQuery(c: SceauContent) {
  return [c.venue, c.address, c.city].filter((s) => s.trim()).join(", ");
}

/* postMessage protocol between an editor and the preview iframe */
export const PREVIEW_MSG = {
  ready: "sceau:ready",
  content: "sceau:content",
  replay: "sceau:replay",
  skip: "sceau:skip",
} as const;
