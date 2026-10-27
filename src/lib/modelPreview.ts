/**
 * Affichage des invitations sur ordinateur : toujours au centre, aux proportions d'un écran de smartphone,
 * devant la couverture floutée du modèle (/apercu). Sur mobile, en plein écran.
 * - depuis la galerie : lien vers /apercu
 * - ouverture directe (démo d'un modèle, modèle importé, lien d'invitation) : le proxy affiche /apercu à la même adresse
 */
export const previewHref = (m: { id: string; name: string; liveUrl?: string; thumbnail?: string }) =>
  m.liveUrl ? `/apercu?${new URLSearchParams({ src: m.liveUrl, id: m.id, name: m.name, cover: m.thumbnail ?? "" })}` : "/invitations";

/** Pages d'invitation présentées ainsi : démos des modèles, modèles importés, liens envoyés aux invités */
export const STAGED_PAGE = /^\/(invitation-[a-z-]+|m\/[a-z0-9-]+\/[^?#]+\.html?|invite\/[\w-]+)$/;

/** Adresse d'une invitation sur le site, jamais un autre domaine */
export const isModelSrc = (src: string) => STAGED_PAGE.test(src) && !src.includes("..");

/** Couverture du modèle (fond flouté de l'aperçu) : image du site ou du stockage, jamais de code */
export const isCoverUrl = (url: string) => /^(\/[\w\-./%]+|https:\/\/[\w\-.]+\/[\w\-./%]+)\.(jpe?g|png|webp|avif|gif)(\?[\w=&.-]*)?$/i.test(url);

/** La page affichée dans le cadre : garde son bloc de fin, ouvre ses liens dans la page entière, et n'est pas re-cadrée */
export const demoSrc = (src: string) => `${src}${src.includes("?") ? "&" : "?"}demo=1`;
