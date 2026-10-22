import { googleFontHrefs, hasStyle, styleCss, type InvitationStyle } from "@/lib/invitationStyle";

/** Polices et règles de style choisies dans le studio, appliquées à l'élément racine portant `data-inv-style`. */
export default function InvitationStyleTag({ style }: { style?: InvitationStyle | null }) {
  if (!hasStyle(style)) return null;
  return (
    <>
      {googleFontHrefs([style.titleFont, style.bodyFont]).map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <style>{styleCss(style, "[data-inv-style]")}</style>
    </>
  );
}
