/**
 * Retouches de style d'une invitation (studio des modèles), réglées par catégorie de texte :
 * prénoms, titres, petites mentions, dates & chiffres, textes, boutons.
 * Enregistrées dans le contenu de l'invitation (champ `style`), appliquées par-dessus le design du modèle.
 */

export type StylePart = "names" | "titles" | "labels" | "numbers" | "body" | "buttons";

export interface PartStyle {
  font?: string;
  color?: string;
  /** pourcentage de la taille d'origine (100 = inchangé) */
  scale?: number;
  italic?: boolean;
  uppercase?: boolean;
}

export interface InvitationStyle {
  parts?: Partial<Record<StylePart, PartStyle>>;
  /* Anciens réglages globaux (titres / textes), toujours lus */
  titleFont?: string;
  bodyFont?: string;
  titleColor?: string;
  textColor?: string;
  titleScale?: number;
  textScale?: number;
  titleSpacing?: number;
  titleItalic?: boolean;
  titleUppercase?: boolean;
}

export const STYLE_PARTS: { id: StylePart; label: string; hint: string }[] = [
  { id: "names", label: "Prénoms & nom principal", hint: "Les prénoms des mariés, le nom de la personne fêtée" },
  { id: "titles", label: "Titres des sections", hint: "« Notre histoire », « Le programme », « Le lieu »…" },
  { id: "labels", label: "Petites mentions", hint: "Lignes en majuscules, horaires, étiquettes, sous-titres" },
  { id: "numbers", label: "Dates & chiffres", hint: "Grande date, compte à rebours" },
  { id: "body", label: "Textes", hint: "Paragraphes, citations, adresses, déroulé" },
  { id: "buttons", label: "Boutons", hint: "« Confirmer ma présence », « Itinéraire »…" },
];

export const FONT_GROUPS: { label: string; fonts: string[] }[] = [
  {
    label: "Serif élégant",
    fonts: [
      "Cormorant Garamond", "Playfair Display", "Bodoni Moda", "Cinzel", "Cinzel Decorative", "Libre Baskerville",
      "EB Garamond", "Lora", "Marcellus", "Prata", "Gilda Display", "Italiana", "Forum", "Bellefair",
      "DM Serif Display", "Abril Fatface", "Yeseva One", "Rozha One", "Cormorant SC", "Tenor Sans",
    ],
  },
  {
    label: "Calligraphie & script",
    fonts: [
      "Great Vibes", "Parisienne", "Allura", "Alex Brush", "Pinyon Script", "Tangerine", "Sacramento",
      "Dancing Script", "Petit Formal Script", "Italianno", "Monsieur La Doulaise", "Rouge Script",
      "Mrs Saint Delafield", "Herr Von Muellerhoff", "Bilbo Swash Caps", "WindSong", "Imperial Script",
      "Corinthia", "Ballet", "Water Brush", "Birthstone", "Meow Script", "Licorice",
    ],
  },
  {
    label: "Sans-serif moderne",
    fonts: [
      "Jost", "Montserrat", "Raleway", "Poppins", "Lato", "Josefin Sans", "Nunito Sans", "Quicksand",
      "Work Sans", "Outfit", "Questrial", "Didact Gothic", "Manrope", "Inter", "Urbanist",
    ],
  },
  {
    label: "Décoratif",
    fonts: ["Poiret One", "Federo", "Limelight", "Josefin Slab", "Unna", "Old Standard TT", "Spectral SC"],
  },
];

export const ALL_FONTS = [...new Set(FONT_GROUPS.flatMap((g) => g.fonts))];

/** Feuilles Google Fonts des polices choisies, une par famille (une requête groupée échoue si une seule famille est inconnue). */
export function googleFontHrefs(fonts: (string | undefined)[]): string[] {
  const list = [...new Set(fonts.filter((f): f is string => !!f && ALL_FONTS.includes(f)))];
  return list.map((f) => `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f).replace(/%20/g, "+")}&display=swap`);
}

/** Réglages effectifs par catégorie, anciens réglages globaux compris. */
export function resolveParts(style?: InvitationStyle | null): Partial<Record<StylePart, PartStyle>> {
  if (!style) return {};
  const legacyTitle: PartStyle = {
    font: style.titleFont,
    color: style.titleColor,
    scale: style.titleScale,
    italic: style.titleItalic,
    uppercase: style.titleUppercase,
  };
  const legacyBody: PartStyle = { font: style.bodyFont, color: style.textColor, scale: style.textScale };
  const merge = (a: PartStyle, b?: PartStyle): PartStyle => ({ ...a, ...Object.fromEntries(Object.entries(b ?? {}).filter(([, v]) => v !== undefined)) });
  const p = style.parts ?? {};
  return {
    names: merge(legacyTitle, p.names),
    titles: merge(legacyTitle, p.titles),
    labels: merge({}, p.labels),
    numbers: merge({}, p.numbers),
    body: merge(legacyBody, p.body),
    buttons: merge({}, p.buttons),
  };
}

const isSet = (p?: PartStyle) =>
  !!p && (!!p.font || !!p.color || (typeof p.scale === "number" && p.scale !== 100) || !!p.italic || !!p.uppercase);

export const hasStyle = (s?: InvitationStyle | null): s is InvitationStyle =>
  !!s && (Object.values(resolveParts(s)).some(isSet) || (typeof s.titleSpacing === "number" && s.titleSpacing !== 0));

/** Polices utilisées par un style (pour les charger). */
export const styleFonts = (s?: InvitationStyle | null) => Object.values(resolveParts(s)).map((p) => p?.font);

/** Sélecteurs de chaque catégorie de texte, propres à un modèle. */
export type PartSelectors = Record<StylePart, string[]>;

/** Repli pour un modèle sans correspondance : balises sans classe propre. */
export const GENERIC_SELECTORS: PartSelectors = {
  names: ["h1"],
  titles: ["h2", "h3", "h4"],
  labels: [],
  numbers: [],
  body: ["p:not([class])", "li:not([class])", "blockquote"],
  buttons: ["button", "a[class]"],
};

/** Liste de classes CSS (modules) → sélecteurs. */
export const cls = (...names: (string | undefined)[]) => names.filter((n): n is string => !!n).map((n) => `.${n.split(" ")[0]}`);

const safeColor = (c?: string) => (c && /^#[0-9a-f]{3,8}$/i.test(c) ? c : undefined);
const safeFont = (f?: string) => (f && ALL_FONTS.includes(f) ? `"${f}"` : undefined);
const clampScale = (n?: number) => (typeof n === "number" && n >= 50 && n <= 200 && n !== 100 ? n / 100 : undefined);

/**
 * Règles CSS appliquées sous `scope` (ex. « [data-inv-style] » ou « body »).
 * Le bloc de fin d'invitation (boutons Evenium, [data-inv-cta]) n'est jamais touché.
 */
export function styleCss(style: InvitationStyle | null | undefined, scope: string, selectors: PartSelectors = GENERIC_SELECTORS): string {
  if (!hasStyle(style)) return "";
  const parts = resolveParts(style);
  const notCta = ":not([data-inv-cta] *):not([data-inv-cta])";
  const rules: string[] = [];
  for (const { id } of STYLE_PARTS) {
    const p = parts[id];
    const sels = selectors[id];
    if (!sels?.length) continue;
    const d: string[] = [];
    const f = safeFont(p?.font);
    if (f) d.push(`font-family:${f},serif !important`);
    const c = safeColor(p?.color);
    if (c) d.push(`color:${c} !important`, `-webkit-text-fill-color:${c} !important`, "background-image:none !important");
    const z = clampScale(p?.scale);
    if (z) d.push(`zoom:${z}`);
    if (p?.italic) d.push("font-style:italic !important");
    if (p?.uppercase) d.push("text-transform:uppercase !important");
    if ((id === "names" || id === "titles") && typeof style.titleSpacing === "number" && style.titleSpacing !== 0) {
      d.push(`letter-spacing:${Math.max(-0.05, Math.min(0.5, style.titleSpacing))}em !important`);
    }
    if (!d.length) continue;
    // Classe doublée : plus forte que les balises génériques des autres catégories
    const list = sels.map((sel) => `${scope} ${sel.startsWith(".") ? sel + sel : sel}${notCta}`).join(",");
    rules.push(`${list}{${d.join(";")}}`);
  }
  return rules.join("\n");
}
