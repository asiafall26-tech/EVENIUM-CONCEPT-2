/**
 * Retouches de style d'une invitation (studio des modèles) : polices, couleurs et tailles des titres et des textes.
 * Enregistrées dans le contenu de l'invitation (champ `style`), appliquées par-dessus le design du modèle.
 */

export interface InvitationStyle {
  titleFont?: string;
  bodyFont?: string;
  titleColor?: string;
  textColor?: string;
  /** pourcentage de la taille d'origine (100 = inchangé) */
  titleScale?: number;
  textScale?: number;
  /** espacement des lettres des titres, en em */
  titleSpacing?: number;
  titleItalic?: boolean;
  titleUppercase?: boolean;
}

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
    fonts: ["Cinzel", "Poiret One", "Federo", "Limelight", "Josefin Slab", "Unna", "Old Standard TT", "Spectral SC"],
  },
];

export const ALL_FONTS = [...new Set(FONT_GROUPS.flatMap((g) => g.fonts))];

/** Feuilles Google Fonts des polices choisies, une par famille (une requête groupée échoue si une seule famille est inconnue). */
export function googleFontHrefs(fonts: (string | undefined)[]): string[] {
  const list = [...new Set(fonts.filter((f): f is string => !!f && ALL_FONTS.includes(f)))];
  return list.map((f) => `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f).replace(/%20/g, "+")}&display=swap`);
}

export const hasStyle = (s?: InvitationStyle | null): s is InvitationStyle =>
  !!s && Object.values(s).some((v) => v !== undefined && v !== "" && v !== null && v !== false && v !== 100);

const safeColor = (c?: string) => (c && /^#[0-9a-f]{3,8}$/i.test(c) ? c : undefined);
const safeFont = (f?: string) => (f && ALL_FONTS.includes(f) ? `"${f}"` : undefined);
const clampScale = (n?: number) => (typeof n === "number" && n >= 50 && n <= 200 && n !== 100 ? n / 100 : undefined);

/**
 * Règles CSS appliquées sous `scope` (ex. « [data-inv-style] » ou « body »).
 * Le bloc de fin d'invitation (boutons Evenium, [data-inv-cta]) n'est pas touché.
 */
export function styleCss(style: InvitationStyle | null | undefined, scope: string): string {
  if (!hasStyle(style)) return "";
  const notCta = ":not([data-inv-cta] *)";
  const titles = ["h1", "h2", "h3", "h4"].map((t) => `${scope} ${t}${notCta}`).join(",");
  const texts = ["p", "li", "blockquote", "dd", "dt", "label", "small"].map((t) => `${scope} ${t}${notCta}`).join(",");
  const rules: string[] = [];

  const t: string[] = [];
  const tf = safeFont(style.titleFont);
  if (tf) t.push(`font-family:${tf},serif !important`);
  const tc = safeColor(style.titleColor);
  if (tc) t.push(`color:${tc} !important`, `-webkit-text-fill-color:${tc} !important`, "background-image:none !important");
  const ts = clampScale(style.titleScale);
  if (ts) t.push(`zoom:${ts}`);
  if (typeof style.titleSpacing === "number" && style.titleSpacing !== 0) t.push(`letter-spacing:${Math.max(-0.05, Math.min(0.5, style.titleSpacing))}em !important`);
  if (style.titleItalic) t.push("font-style:italic !important");
  if (style.titleUppercase) t.push("text-transform:uppercase !important");
  if (t.length) rules.push(`${titles}{${t.join(";")}}`);

  const b: string[] = [];
  const bf = safeFont(style.bodyFont);
  if (bf) b.push(`font-family:${bf},sans-serif !important`);
  const bc = safeColor(style.textColor);
  if (bc) b.push(`color:${bc} !important`);
  const bs = clampScale(style.textScale);
  if (bs) b.push(`zoom:${bs}`);
  if (b.length) rules.push(`${texts}{${b.join(";")}}`);

  return rules.join("\n");
}
