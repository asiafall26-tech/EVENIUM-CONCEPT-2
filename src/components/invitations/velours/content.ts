import type { AddedRubrique } from "@/lib/invitationSections";
import type { InvitationStyle } from "@/lib/invitationStyle";
// Editable content of the "Velours Bordeaux" invitation model (stored as JSON on the event).

export const VELOURS_MODEL_ID = "invit-7";

export interface ProgrammeItem {
  time: string;
  label: string;
}

export interface VeloursContent {
  /** Retouches de polices, couleurs et tailles (studio des modèles) */
  style?: InvitationStyle;
  /** Rubriques du modèle supprimées par l'organisateur (clés data-inv-sec) */
  __hidden?: string[];
  /** Rubriques ajoutées par l'organisateur */
  __rubriques?: AddedRubrique[];
  partnerA: string;
  partnerB: string;
  tagline: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM */
  time: string;
  city: string;
  venue: string;
  address: string;
  welcomeTitle: string;
  welcomeText: string;
  storyText: string;
  storyQuote: string;
  programme: ProgrammeItem[];
  programmeQuote: string;
  rsvpText: string;
  closingQuote: string;
  photoStory: string;
  photoProgramme: string;
  familyParents?: string;
  familyBlessing?: string;
  dressCodeText?: string;
  dressColors?: string[];
  mapsUrl?: string;
  gallery?: string[];
  rsvpDeadline?: string;
  giftTitle?: string;
  giftText?: string;
  footerPhoto?: string;
  /** Custom MP3 or audio URL stored in Supabase Storage */
  audioUrl?: string;
  /** Title or label of the chosen soundtrack */
  audioTitle?: string;
  /** Part of the track played (seconds); audioEnd 0 = until the end */
  audioStart?: number;
  audioEnd?: number;
}

export const DEFAULT_VELOURS: VeloursContent = {
  partnerA: "Alexandre",
  partnerB: "Marie",
  tagline: "Deux cœurs, une histoire, pour toujours ♡",
  date: "2027-06-12",
  time: "16:00",
  city: "Paris",
  venue: "Domaine du Jardin Blanc",
  address: "20 rue des Lilas",
  welcomeTitle: "Chers amis & famille !",
  welcomeText:
    "Nous serions profondément heureux de vous compter parmi nous pour célébrer notre mariage — un jour unique que nous souhaitons partager avec les personnes qui nous sont les plus chères.",
  storyText:
    "Tout a commencé de façon inattendue… Une rencontre, une conversation, et depuis, nos jours sont devenus plus lumineux. Nous rions, nous rêvons et construisons notre avenir ensemble. Aujourd'hui, nous voulons partager ce moment important avec vous !",
  storyQuote: "L'amour — notre plus belle aventure ♡",
  programme: [
    { time: "16:00", label: "Accueil des invités" },
    { time: "17:00", label: "Cérémonie" },
    { time: "18:00", label: "Vin d'honneur" },
    { time: "19:00", label: "Dîner" },
    { time: "21:00", label: "Pièce montée" },
    { time: "23:00", label: "Soirée dansante ♡" },
  ],
  programmeQuote: "Ce sera beau, délicieux et inoubliable ! ♡",
  rsvpText: "Il est très important pour nous de savoir si vous pourrez partager cette journée avec nous.",
  closingQuote: "Les petits moments créent les grands souvenirs",
  photoStory: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=900&q=80",
  photoProgramme: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80",
  familyParents: "Les familles Dupont et Traoré ont l'immense joie de vous annoncer le mariage de leurs enfants.",
  familyBlessing: "Avec la bénédiction de nos parents et aînés",
  dressCodeText: "Nous serions ravis que vos tenues s'accordent aux nuances de notre fête :",
  dressColors: ["#5e1622", "#7b5960", "#d4bfa4", "#f1e7da", "#D4AF37"],
  mapsUrl: "https://maps.google.com",
  gallery: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
  ],
  rsvpDeadline: "Avant le 15 mai",
  giftTitle: "Un mot sur les cadeaux",
  giftText: "Votre présence est notre plus beau cadeau. Une urne vous attendra à l'entrée pour vos enveloppes et mots doux.",
  footerPhoto: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
};

/** Fills missing keys (e.g. content saved by an older version) with defaults. */
export function withDefaults(partial?: Partial<VeloursContent> | null): VeloursContent {
  return { ...DEFAULT_VELOURS, ...(partial ?? {}) };
}

/** Pre-fills the model from what the user typed in the event creation wizard. */
export function seedFromEvent(event: { name?: string; date?: string; time?: string; location?: string }): VeloursContent {
  const seeded = { ...DEFAULT_VELOURS };
  // "Mariage Astou & Ali" → Astou / Ali
  const names = event.name?.match(/([\p{L}'-]+)\s*(?:&|et)\s*([\p{L}'-]+)/iu);
  if (names) {
    seeded.partnerA = names[1];
    seeded.partnerB = names[2];
  }
  if (event.date && /^\d{4}-\d{2}-\d{2}$/.test(event.date)) seeded.date = event.date;
  if (event.time && /^\d{2}:\d{2}/.test(event.time)) seeded.time = event.time.slice(0, 5);
  if (event.location?.trim()) seeded.city = event.location.trim();
  return seeded;
}

export function weddingDate(c: VeloursContent): Date | null {
  const d = new Date(`${c.date}T${c.time || "00:00"}:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDates(c: VeloursContent) {
  const d = weddingDate(c);
  if (!d) return { long: "Date à définir", weekday: "", short: "" };
  const weekday = d.toLocaleDateString("fr-FR", { weekday: "long" });
  return {
    long: d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    short: `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`,
  };
}

export function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "·";
}

/* postMessage protocol between an editor and the preview iframe */
export const PREVIEW_MSG = {
  ready: "velours:ready",
  content: "velours:content",
  replay: "velours:replay",
  skip: "velours:skip",
} as const;
