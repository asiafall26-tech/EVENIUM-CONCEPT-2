export type InvitationType = "carte" | "animée";
export type EventCategory = "Mariage" | "Anniversaire" | "Anniversaire de mariage" | "Gala" | "Baptême" | "Corporate";

export interface InvitationModel {
  id: string;
  name: string;
  type: InvitationType;
  category: EventCategory;
  thumbnail: string;
  isPremium: boolean;
  description: string;
  /** Live, interactive version of the model */
  liveUrl?: string;
}

export const mockInvitationModels: InvitationModel[] = [
  {
    id: "invit-7",
    name: "Velours Bordeaux",
    type: "animée",
    category: "Mariage",
    thumbnail: "/invit-velours-cover.jpg",
    isPremium: true,
    description: "Une enveloppe scellée à la cire qui s'ouvre sous une pluie de pétales, puis une invitation velours bordeaux et satin ivoire : histoire, programme, lieu, compte à rebours et confirmation de présence.",
    liveUrl: "/invitation-mariage",
  },
  {
    id: "invit-8",
    name: "Sceau d'Or Impérial",
    type: "animée",
    category: "Mariage",
    thumbnail: "/invit-sceau-dor-cover.jpg",
    isPremium: true,
    description: "Un sceau de cire doré à briser, des rideaux de velours carmin qui s'écartent au son d'une boîte à musique enchanteresse : calendrier, itinéraire Google Maps, programme à feuillets, dress code et confirmation de présence.",
    liveUrl: "/invitation-sceau-dor",
  },
  {
    id: "invit-9",
    name: "Ivoire Couture",
    type: "animée",
    category: "Mariage",
    thumbnail: "/invit-ivoire-cover.jpg",
    isPremium: true,
    description: "Une enveloppe ivoire au sceau doré, votre photo en couverture, papier texturé aux bords déchirés et rubans de satin bordeaux : lieux avec Google Maps, programme, compte à rebours et confirmation de présence.",
    liveUrl: "/invitation-ivoire",
  },
  {
    id: "invit-10",
    name: "Rose Poudrée & Or Impérial",
    type: "animée",
    category: "Mariage",
    thumbnail: "/invit-rose-or-cover.jpg",
    isPremium: true,
    description: "Une enveloppe blush scellée d'or qui s'ouvre sur une vidéo cinématique et douce mélodie : rideaux de soie dorée, colonnes fleuries, compte à rebours, galerie photos, déroulé et confirmation RSVP.",
    liveUrl: "/invitation-rose-or",
  },
  {
    id: "invit-11",
    name: "Anniversaire Bordeaux & Or",
    type: "animée",
    category: "Anniversaire",
    thumbnail: "/invit-anniversaire-cover.jpg",
    isPremium: true,
    description: "Une invitation sur deux pages qui se tourne comme un faire-part : votre photo en couverture « Happy Birthday », puis une carte crème aux roses bordeaux et dorures avec date, lieu, programme et confirmation de présence.",
    liveUrl: "/invitation-anniversaire",
  },
];

/** Models shown in the homepage showcase (up to 4), in display order */
export const showcaseModelIds: string[] = ["invit-7", "invit-8", "invit-9", "invit-10"];

/** Classement d'origine d'un modèle (type d'invitation et événement), remplaçable dans le studio des modèles */
export function defaultClassification(id: string): { type: InvitationType; events: string[] } {
  const m = mockInvitationModels.find((x) => x.id === id);
  if (id === "invit-7" || id === "invit-8" || id === "invit-9" || id === "invit-10") {
    return { type: m?.type ?? "animée", events: [m?.category ?? "Mariage", "Anniversaire de mariage"] };
  }
  return { type: m?.type ?? "animée", events: m ? [m.category] : [] };
}

/** Lookup an invitation model by its ID */
export function getInvitationModel(id?: string | null): InvitationModel | undefined {
  if (!id) return undefined;
  return mockInvitationModels.find((m) => m.id === id);
}

/** Cache en mémoire des noms de modèles personnalisés par l'admin */
let dynamicModelNames: Record<string, string> = {};

/** Enregistrer des noms personnalisés de modèles récupérés depuis Supabase */
export function registerModelNames(map: Record<string, string>) {
  dynamicModelNames = { ...dynamicModelNames, ...map };
}

/** Retrieve the human-readable, official name of an invitation model */
export function getInvitationModelName(id?: string | null, customNames?: Record<string, string>): string {
  if (!id) return "Modèle Exclusif";
  if (customNames && customNames[id]) return customNames[id];
  if (dynamicModelNames[id]) return dynamicModelNames[id];
  const model = getInvitationModel(id);
  if (model) return model.name;

  const lower = id.toLowerCase();
  if (id === "invit-7" || lower.includes("velours")) return "Velours Bordeaux";
  if (id === "invit-8" || lower.includes("sceau")) return "Sceau d'Or Impérial";
  if (id === "invit-9" || lower.includes("ivoire")) return "Ivoire Couture";
  if (id === "invit-10" || lower.includes("rose")) return "Rose Poudrée & Or Impérial";
  if (id === "invit-11" || lower.includes("anniversaire")) return "Anniversaire Bordeaux & Or";
  return id;
}

/** Retrieve the thumbnail image of an invitation model */
export function getInvitationModelThumbnail(id?: string | null): string {
  const model = getInvitationModel(id);
  if (model?.thumbnail) return model.thumbnail;

  const lower = (id || "").toLowerCase();
  if (id === "invit-7" || lower.includes("velours")) return "/invit-velours-cover.jpg";
  if (id === "invit-8" || lower.includes("sceau")) return "/invit-sceau-dor-cover.jpg";
  if (id === "invit-9" || lower.includes("ivoire")) return "/invit-ivoire-cover.jpg";
  if (id === "invit-10" || lower.includes("rose")) return "/invit-rose-or-cover.jpg";
  if (id === "invit-11" || lower.includes("anniversaire")) return "/invit-anniversaire-cover.jpg";
  return "/invit-velours-cover.jpg";
}
