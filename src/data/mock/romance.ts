export type RomanceServiceType = "mot_doux" | "invitation_couple";

export interface RomanceService {
  id: RomanceServiceType;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  badge: string;
}

export interface RomanceTemplate {
  id: string;
  type: RomanceServiceType;
  title: string;
  tagline: string;
  badge?: "Signature" | "Coup de cœur" | "Passion" | "Confidentiel" | "Édition Privée" | "Bestseller";
  theme: "ruby" | "velvet-black" | "rose-gold" | "champagne";
  paperTexture: "velours-grenat" | "soie-noire" | "coton-poudre" | "or-et-rose";
  waxSealColor: "ruby" | "gold" | "rose-gold" | "black";
  defaultSender: string;
  defaultRecipient: string;
  defaultKicker: string;
  defaultTitle: string;
  defaultMessage: string;
  suggestedMusic: string;
  // Specific to invitations couple:
  defaultDate?: string;
  defaultTime?: string;
  defaultPlace?: string;
  defaultDressCode?: string;
  priceFcfa: number;
  priceEur: string;
}

export interface RomanceInspiration {
  type: RomanceServiceType;
  category: string;
  title: string;
  text: string;
}

export const ROMANCE_SERVICES: RomanceService[] = [
  {
    id: "mot_doux",
    title: "Mots Doux",
    tagline: "Lettres d'amour & Déclarations intimes scellées",
    description: "Une attention poétique et confidentielle pour exprimer ce que les mots du quotidien ne suffisent plus à dire.",
    icon: "💌",
    badge: "Romance Privée"
  },
  {
    id: "invitation_couple",
    title: "Invitations Couple",
    tagline: "Rendez-vous secrets, dîners & escapades à deux",
    description: "Un carton d'invitation haute couture pour surprendre son partenaire avec une expérience inoubliable.",
    icon: "🕯️",
    badge: "Tête-à-tête Exclusif"
  }
];

// MODÈLES ROMANCE (Générés dynamiquement dans le Studio de création)
export const ROMANCE_TEMPLATES: RomanceTemplate[] = [];

export const ROMANCE_INSPIRATIONS: RomanceInspiration[] = [
  {
    type: "mot_doux",
    category: "Déclaration d'Amour",
    title: "Les sentiments profonds",
    text: "Si je devais revivre mille vies, c'est encore vers toi que mes pas se dirigeraient. Ton rire est ma mélodie favorite et ta présence est le plus doux des réconforts. Je t'aime d'une force inaltérable."
  },
  {
    type: "mot_doux",
    category: "Petite Attention",
    title: "Un sourire au milieu du jour",
    text: "Une seconde pour t'écrire, mais une journée entière à penser à toi. Merci d'être cette lumière constante dans mon quotidien. Hâte de te serrer dans mes bras ce soir."
  },
  {
    type: "mot_doux",
    category: "Pardon & Sérénité",
    title: "Les mots de paix",
    text: "Notre amour est bien plus grand que nos petits désaccords. Pardon pour mes mots trop vifs, rien n'égale la tendresse que j'ai pour toi. Retrouvons vite notre harmonie."
  },
  {
    type: "invitation_couple",
    category: "Dîner Secret",
    title: "Rendez-vous gastronomique",
    text: "J'ai réservé une table intime dans un cadre enchanteur. Enfile cette tenue que j'aime tant. À 20h pile, le monde extérieur s'arrêtera pour nous."
  },
  {
    type: "invitation_couple",
    category: "Surprise Spa",
    title: "Détente & Massages en duo",
    text: "Laisse toutes tes tensions à la porte. J'ai privatisé pour nous deux une parenthèse de pure détente : massages aux huiles chaudes, tisane et sérénité absolue."
  }
];

