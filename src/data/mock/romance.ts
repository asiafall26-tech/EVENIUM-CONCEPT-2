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
  badge?: "Signature" | "Coup de cœur" | "Passion" | "Confidentiel" | "Édition Privée";
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

export const ROMANCE_TEMPLATES: RomanceTemplate[] = [
  // ── MOTS DOUX ──
  {
    id: "mot-passion-grenat",
    type: "mot_doux",
    title: "La Lettre Passionnée",
    tagline: "Papier velours bordeaux & sceau de cire rubis",
    badge: "Coup de cœur",
    theme: "ruby",
    paperTexture: "velours-grenat",
    waxSealColor: "ruby",
    defaultSender: "Celui qui t'aime",
    defaultRecipient: "Mon Amour",
    defaultKicker: "Confidentiel & Secret",
    defaultTitle: "Pour que tu n'oublies jamais à quel point tu es précieuse",
    defaultMessage: "Au milieu du bruit du monde, il y a ton sourire qui apaise tout. Je voulais simplement te rappeler à quel point ma vie a pris une saveur unique depuis que tu en fais partie. Merci d'être mon port d'attache, mon éclat de rire quotidien et la plus douce de mes pensées.",
    suggestedMusic: "Experience - Ludovico Einaudi",
    priceFcfa: 3900,
    priceEur: "3,90 €"
  },
  {
    id: "mot-pensee-rose",
    type: "mot_doux",
    title: "La Pensée du Matin",
    tagline: "Poudre de rose, or délicat & poésie du réveil",
    badge: "Signature",
    theme: "rose-gold",
    paperTexture: "coton-poudre",
    waxSealColor: "rose-gold",
    defaultSender: "Ton âme sœur",
    defaultRecipient: "Mon Cœur",
    defaultKicker: "Une Douce Pensée",
    defaultTitle: "Commencer la journée avec ton image en tête",
    defaultMessage: "Avant même que le soleil n'éclaire la ville, mes pensées filent déjà vers toi. Passe une journée lumineuse et douce. Sache qu'à chaque instant, quelqu'un t'aime d'un amour infini et inconditionnel.",
    suggestedMusic: "Nuvole Bianche - Ludovico Einaudi",
    priceFcfa: 3900,
    priceEur: "3,90 €"
  },
  {
    id: "mot-pardon-serenite",
    type: "mot_doux",
    title: "Pardon & Réconciliation",
    tagline: "Sobriété or et noir, sincérité absolue",
    badge: "Édition Privée",
    theme: "velvet-black",
    paperTexture: "soie-noire",
    waxSealColor: "gold",
    defaultSender: "Moi",
    defaultRecipient: "À toi",
    defaultKicker: "Du Plus Profond du Cœur",
    defaultTitle: "Parce que notre lien compte plus que tout",
    defaultMessage: "Les maladresses arrivent, mais elles ne pèseront jamais plus lourd que l'amour immense et le respect sincère que je te porte. Je regrette les moments de tension et je souhaite de tout mon être retrouver la sérénité et la douceur de nos regards.",
    suggestedMusic: "Adagio for Strings - Samuel Barber",
    priceFcfa: 3900,
    priceEur: "3,90 €"
  },

  // ── INVITATIONS COUPLE ──
  {
    id: "invi-diner-chandelles",
    type: "invitation_couple",
    title: "Dîner Secret aux Chandelles",
    tagline: "Ambiance feutrée, adresse confidentielle & suspense",
    badge: "Bestseller",
    theme: "ruby",
    paperTexture: "velours-grenat",
    waxSealColor: "ruby",
    defaultSender: "Ton cavalier mystère",
    defaultRecipient: "Ma reine d'un soir",
    defaultKicker: "Invitation Exclusive • Soirée Privée",
    defaultTitle: "Ce soir, laisse-toi guider... Je m'occupe de tout",
    defaultMessage: "Oublie les contraintes, les écrans et le quotidien. J'ai réservé une table intime où les bougies danseront pour nous deux. Viens avec ton plus beau sourire et laisse-toi chérir comme au premier jour.",
    suggestedMusic: "La Vie en Rose - Version Violon & Piano",
    defaultDate: "Ce Vendredi soir",
    defaultTime: "20h30 précises",
    defaultPlace: "Lieu gardé secret... Je passe te chercher en voiture",
    defaultDressCode: "Chic & Séduction",
    priceFcfa: 3900,
    priceEur: "3,90 €"
  },
  {
    id: "invi-escapade-weekend",
    type: "invitation_couple",
    title: "L'Escapade Romantique",
    tagline: "Carton d'embarquement secret pour une nuit à deux",
    badge: "Signature",
    theme: "champagne",
    paperTexture: "or-et-rose",
    waxSealColor: "gold",
    defaultSender: "Ton complice de voyage",
    defaultRecipient: "Mon Amour",
    defaultKicker: "Parenthèse Enchantée",
    defaultTitle: "Deux jours rien que pour nous, loin de tout",
    defaultMessage: "Prépare un petit sac de voyage : ce week-end, nous fuyons la routine. Une suite avec vue, le calme absolu et du temps précieux à partager ensemble. Tout est déjà orchestré.",
    suggestedMusic: "Fly Me to the Moon - Version Acoustique",
    defaultDate: "Ce Samedi matin",
    defaultTime: "Départ 10h00",
    defaultPlace: "Destination secrète dévoilée en chemin",
    defaultDressCode: "Élégance décontractée & Maillot de bain",
    priceFcfa: 3900,
    priceEur: "3,90 €"
  },
  {
    id: "invi-cocooning-cinema",
    type: "invitation_couple",
    title: "Nuit Cocooning & Cinéma Privé",
    tagline: "Plaids en cachemire, douceurs gourmandes & câlins",
    badge: "Confidentiel",
    theme: "rose-gold",
    paperTexture: "coton-poudre",
    waxSealColor: "rose-gold",
    defaultSender: "Ton amour",
    defaultRecipient: "Mon Trésor",
    defaultKicker: "Passe Privilège Soirée Maison",
    defaultTitle: "Une soirée douceur réservée rien qu'à toi",
    defaultMessage: "Au programme : lumière tamisée, ton film préféré sélectionné avec soin, de petites douceurs gourmandes et tout le confort dont tu as besoin après cette longue semaine. Ton unique mission : te détendre.",
    suggestedMusic: "Kiss the Rain - Yiruma",
    defaultDate: "Ce soir",
    defaultTime: "Dès que tu rentres",
    defaultPlace: "Notre cocon secret (Le Salon des Amoureux)",
    defaultDressCode: "Pyjama en soie ou tenue ultra-douce",
    priceFcfa: 3900,
    priceEur: "3,90 €"
  }
];

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

