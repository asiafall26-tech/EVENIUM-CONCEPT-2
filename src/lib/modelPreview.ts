/**
 * Affichage des invitations sur ordinateur : toujours au centre, aux proportions d'un écran de smartphone,
 * devant la couverture floutée du modèle (/apercu). Sur mobile, en plein écran.
 * - depuis la galerie : lien vers /apercu avec mémorisation de la catégorie consultée
 * - ouverture directe (démo d'un modèle, modèle importé, lien d'invitation) : le proxy affiche /apercu à la même adresse
 */
export const previewHref = (
  m: { id: string; name: string; liveUrl?: string; thumbnail?: string; category?: string },
  fromCategory?: string
) => {
  if (!m.liveUrl) return "/invitations";
  const cat = fromCategory || m.category || "";
  const params = new URLSearchParams({
    src: m.liveUrl,
    id: m.id,
    name: m.name,
    cover: m.thumbnail ?? "",
  });
  if (cat && cat !== "Tous") {
    params.set("cat", cat);
  }
  return `/apercu?${params.toString()}`;
};

/** Pages d'invitation présentées ainsi : démos des modèles, modèles importés, liens envoyés aux invités */
export const STAGED_PAGE = /^\/(invitation-[a-z-]+|m\/[a-z0-9-]+\/[^?#]+\.html?|invite\/[\w-]+)$/;

/** Adresse d'une invitation sur le site, jamais un autre domaine */
export const isModelSrc = (src: string) => STAGED_PAGE.test(src) && !src.includes("..");

/** Couverture du modèle (fond flouté de l'aperçu) : image du site ou du stockage, jamais de code */
export const isCoverUrl = (url: string) => /^(\/[\w\-./%]+|https:\/\/[\w\-.]+\/[\w\-./%]+)\.(jpe?g|png|webp|avif|gif)(\?[\w=&.-]*)?$/i.test(url);

/** La page affichée dans le cadre : garde son bloc de fin, ouvre ses liens dans la page entière, et n'est pas re-cadrée */
export const demoSrc = (src: string, category?: string) => {
  const sep = src.includes("?") ? "&" : "?";
  const catParam = category && category !== "Tous" ? `&cat=${encodeURIComponent(category)}` : "";
  return `${src}${sep}demo=1${catParam}`;
};
