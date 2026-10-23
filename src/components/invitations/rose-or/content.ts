import { GENERIC_SELECTORS, googleFontHrefs, styleCss, styleFonts, type InvitationStyle, type PartSelectors } from "@/lib/invitationStyle";

/** Textes de la page animée par catégorie, pour les réglages de style du studio des modèles */
const STYLE_SELECTORS: PartSelectors = {
  names: [...GENERIC_SELECTORS.names, ".names", ".amp"],
  titles: [...GENERIC_SELECTORS.titles],
  labels: [".eyebrow", ".kicker", ".sub", ".meta", ".y", ".made", ".tap-hint"],
  numbers: [".date", ".countdown"],
  body: [...GENERIC_SELECTORS.body, ".intro", ".quote", ".addr", ".venue", ".ev", ".tl-item"],
  buttons: [".pill", ".btn", ".cta"],
};
// Editable content of the "Rose Poudrée & Or Impérial" invitation model (stored as JSON on the event).
// The invitation itself is the static page public/invitations/rose-or/index.html, driven by postMessage.

import { mapsEmbedUrl, mapsLink } from "../sceau/content";

export const ROSE_OR_MODEL_ID = "invit-10";

const ASSETS = "/invitations/rose-or";
export const DEFAULT_MUSIC = `${ASSETS}/ambiance.mp3`;
export const DEFAULT_FOOTER_PHOTO = `${ASSETS}/photo3.jpg`;

/** Bump after each change to index.html so browsers that cached the page fetch the new version */
export const PAGE_VERSION = "4";

/** URL of the invitation page, in "live" mode (waits for content sent by the parent window) */
export const LIVE_SRC = `${ASSETS}/index.html?live=1&v=${PAGE_VERSION}`;

/** URL of the page showing the demo content of the model */
export const DEMO_SRC = `${ASSETS}/index.html?v=${PAGE_VERSION}`;

export interface StoryItem {
  year: string;
  title: string;
  text: string;
}

export interface ProgrammeItem {
  /** HH:MM */
  time: string;
  title: string;
  text: string;
}

export interface RoseOrContent {
  /** Retouches de polices, couleurs et tailles (studio des modèles) */
  style?: InvitationStyle;
  partnerA: string;
  partnerB: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM, target of the countdown */
  time: string;
  /** Line above the names on the video, e.g. "Nous allons nous marier" */
  kicker: string;
  /** Quote under the video; new lines are kept */
  quote: string;
  countdownText: string;
  galleryTitle: string;
  /** Photos of the carousel (URL or uploaded data URL) */
  gallery: string[];
  storyTitle: string;
  story: StoryItem[];
  programmeTitle: string;
  programmeSubtitle: string;
  programme: ProgrammeItem[];
  venue: string;
  address: string;
  /** Google Maps link; empty = search by venue + address */
  mapsUrl: string;
  /** e.g. "La cérémonie débute à 17 h 30 · fin vers 1 h" */
  scheduleLine: string;
  rsvpDeadline: string;
  rsvpText: string;
  footerPhoto: string;
  footerText: string;
  music: string;
  musicTitle: string;
  /** Part of the track played (seconds); musicEnd 0 = until the end */
  musicStart: number;
  musicEnd: number;
}

export const DEFAULT_ROSE_OR: RoseOrContent = {
  partnerA: "Adama",
  partnerB: "Mariama",
  date: "2026-11-22",
  time: "17:30",
  kicker: "Nous allons nous marier",
  quote: "Là où l'amour commence,\nl'éternité se dessine doucement.",
  countdownText: "jusqu'au plus beau\njour de nos vies",
  galleryTitle: "Un aperçu de nous",
  gallery: [`${ASSETS}/photo3.jpg`, `${ASSETS}/photo-bague.jpg`, `${ASSETS}/photo-nb.jpg`, `${ASSETS}/still-9.jpg`],
  storyTitle: "Notre histoire",
  story: [
    {
      year: "2022",
      title: "Une rencontre fortuite",
      text: "Un après-midi de pluie à Dakar, un parapluie partagé, une longue conversation… et le sentiment tranquille que tout était déjà écrit.",
    },
    {
      year: "2024",
      title: "L'aventure",
      text: "Un voyage improvisé le long de la côte, qui nous a prouvé que nous savions avancer ensemble, quoi qu'il arrive.",
    },
    {
      year: "2025",
      title: "Le oui",
      text: "Un soir paisible, dans le jardin familial, une question, une bague… et un « pour toujours » qui commence.",
    },
  ],
  programmeTitle: "Le déroulé",
  programmeSubtitle: "Notre jour spécial",
  programme: [
    { time: "16:30", title: "Arrivée des invités", text: "Un accueil chaleureux pour le début de notre histoire" },
    { time: "17:30", title: "Cérémonie", text: "Là où deux cœurs n'en font plus qu'un" },
    { time: "19:00", title: "Dîner", text: "Une soirée d'amour et de partage" },
    { time: "21:00", title: "Première danse", text: "Nos premiers pas ensemble en tant qu'époux" },
    { time: "22:00", title: "La fête", text: "Que la célébration commence !" },
    { time: "00:00", title: "Au revoir", text: "La fin d'une journée parfaite, le début de notre éternité" },
  ],
  venue: "Les Jardins de la Corniche",
  address: "Corniche Ouest, Dakar, Sénégal",
  mapsUrl: "https://www.google.com/maps/@14.7167,-17.495,15z",
  scheduleLine: "La cérémonie débute à 17 h 30 · fin vers 1 h",
  rsvpDeadline: "8 novembre 2026",
  rsvpText: "Les places étant limitées, chaque invitation est strictement nominative.",
  footerPhoto: DEFAULT_FOOTER_PHOTO,
  footerText: "Fait avec ♥",
  music: DEFAULT_MUSIC,
  musicTitle: "Ambiance douce",
  musicStart: 0,
  musicEnd: 0,
};

/** Fills missing keys (e.g. content saved by an older version) with defaults. */
export function withDefaults(partial?: Partial<RoseOrContent> | null): RoseOrContent {
  const c = { ...DEFAULT_ROSE_OR, ...(partial ?? {}) };
  if (!Array.isArray(c.gallery)) c.gallery = DEFAULT_ROSE_OR.gallery;
  if (!Array.isArray(c.story)) c.story = DEFAULT_ROSE_OR.story;
  c.story = c.story.map((s) => ({ year: s.year ?? "", title: s.title ?? "", text: s.text ?? "" }));
  if (!Array.isArray(c.programme)) c.programme = DEFAULT_ROSE_OR.programme;
  c.programme = c.programme.map((p) => ({ time: p.time ?? "", title: p.title ?? "", text: p.text ?? "" }));
  return c;
}

/** Pre-fills the model from what the user typed in the event creation wizard. */
export function seedFromEvent(event: { name?: string; date?: string; time?: string; location?: string }): RoseOrContent {
  const seeded = withDefaults();
  // The demo pin must not follow a real event: without a link the map searches the address
  seeded.mapsUrl = "";
  // "Mariage Astou & Ali" → Astou / Ali
  const names = event.name?.match(/([\p{L}'-]+)\s*(?:&|et)\s*([\p{L}'-]+)/iu);
  if (names) {
    seeded.partnerA = names[1];
    seeded.partnerB = names[2];
  }
  if (event.date && /^\d{4}-\d{2}-\d{2}$/.test(event.date)) seeded.date = event.date;
  if (event.time && /^\d{2}:\d{2}/.test(event.time)) seeded.time = event.time.slice(0, 5);
  if (event.location?.trim()) {
    seeded.venue = event.location.trim();
    seeded.address = "";
  }
  return seeded;
}

export function venueQuery(c: RoseOrContent) {
  return [c.venue, c.address].filter((s) => s.trim()).join(", ");
}

/** Message sent to the invitation page: the content plus the links the static page cannot compute itself. */
export function toPreviewMessage(c: RoseOrContent, handlesRsvp = false, showCta = false) {
  const q = venueQuery(c);
  return {
    type: PREVIEW_MSG.content,
    content: c,
    handlesRsvp,
    showCta,
    view: { mapEmbed: mapsEmbedUrl(c.mapsUrl, q), mapHref: mapsLink(c.mapsUrl, q) },
    style: { css: styleCss(c.style, "body", STYLE_SELECTORS), fonts: googleFontHrefs(styleFonts(c.style)) },
  };
}

/* postMessage protocol between the parent window and the invitation iframe */
export const PREVIEW_MSG = {
  ready: "roseor:ready",
  content: "roseor:content",
  replay: "roseor:replay",
  skip: "roseor:skip",
  rsvp: "roseor:rsvp",
  rsvpResult: "roseor:rsvp-result",
} as const;
