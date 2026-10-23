import { GENERIC_SELECTORS, googleFontHrefs, hasStyle, styleCss, styleFonts, type InvitationStyle, type PartSelectors, type StylePart } from "@/lib/invitationStyle";

/** Sélecteurs d'un modèle, complétés par les balises génériques. */
export const modelSelectors = (own: Partial<PartSelectors>): PartSelectors =>
  Object.fromEntries(
    (Object.keys(GENERIC_SELECTORS) as StylePart[]).map((k) => [k, [...GENERIC_SELECTORS[k], ...(own[k] ?? [])]])
  ) as PartSelectors;

/** Polices et règles de style choisies dans le studio, appliquées à l'élément racine portant `data-inv-style`. */
export default function InvitationStyleTag({ style, selectors }: { style?: InvitationStyle | null; selectors?: PartSelectors }) {
  if (!hasStyle(style)) return null;
  return (
    <>
      {googleFontHrefs(styleFonts(style)).map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <style>{styleCss(style, "[data-inv-style]", selectors)}</style>
    </>
  );
}
