export interface VoeuxOccasion {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  hook: string;
  description: string;
  accentColor: string;
  sealColor: string;
}

export interface VoeuxTemplate {
  id: string;
  title: string;
  occasionId: string;
  occasionName: string;
  badge?: "Signature" | "Coup de cœur" | "Bestseller" | "Prestige" | "Édition Limitée";
  theme: "gold" | "velvet" | "rose" | "midnight" | "emerald" | "pearl";
  paperTexture: "velin-ivoire" | "coton-creme" | "parchemin-or" | "soie-noire";
  waxSealColor: "gold" | "bronze" | "rose-gold" | "emerald" | "burgundy";
  waxSealEmblem: "fleuron" | "coeur" | "etoile" | "couronne" | "diplome";
  defaultKicker: string;
  defaultTitle: string;
  defaultMessage: string;
  suggestedMusic: string;
  priceFcfa: number;
  priceEur: string;
}

export interface VoeuxInspiration {
  occasionId: string;
  title: string;
  text: string;
}

export type VoeuxCategory = VoeuxOccasion;

// 5 OCCASIONS OFFICIELLES DEMANDÉES
export const VOEUX_OCCASIONS: VoeuxOccasion[] = [
  {
    id: "anniversaire",
    name: "Anniversaire",
    icon: "🎂",
    tagline: "Naissance, adulte, enfant & jubilés",
    hook: "Faites briller les yeux de ceux qui célèbrent un an de plus.",
    description: "Des lettres numériques scellées au cachet d'or pour marquer une nouvelle bougie avec émotion.",
    accentColor: "#b8924a",
    sealColor: "#c9a45e"
  },
  {
    id: "anniversaire-mariage",
    name: "Anniversaire de mariage",
    icon: "🥂",
    tagline: "Noces de coton, d'étain, d'or et jubilés",
    hook: "Honorez chaque année d'un amour qui traverse le temps.",
    description: "Une célébration poétique pour féliciter les couples qui écrivent leur histoire main dans la main.",
    accentColor: "#d4af37",
    sealColor: "#b8924a"
  },
  {
    id: "mariage",
    name: "Mariage",
    icon: "💍",
    tagline: "Félicitations, vœux de bonheur & bénédictions",
    hook: "Offrez vos plus beaux vœux de vie aux nouveaux mariés.",
    description: "Un message empreint de noblesse et de tendresse pour accompagner le plus beau jour de leur vie.",
    accentColor: "#c9a45e",
    sealColor: "#d4af37"
  },
  {
    id: "bapteme",
    name: "Baptême & Naissance",
    icon: "👶",
    tagline: "Bienvenue au monde, baptême & baby shower",
    hook: "Bénissez les premiers pas d'une vie précieuse.",
    description: "Des créations douces aux nuances ivoire et perle pour féliciter les parents et combler l'enfant.",
    accentColor: "#e6c387",
    sealColor: "#e2b866"
  },
  {
    id: "graduation",
    name: "Graduation & Réussite",
    icon: "🎓",
    tagline: "Diplôme, concours, promotion & nouveaux horizons",
    hook: "Célébrez le mérite, l'effort et la gloire du succès.",
    description: "Une lettre solennelle et prestigieuse pour saluer une étape majeure vers l'excellence.",
    accentColor: "#2b4c7e",
    sealColor: "#c9a45e"
  }
];

export const VOEUX_CATEGORIES = VOEUX_OCCASIONS;

// MODÈLES DE VŒUX D'EXCEPTION (Générés dynamiquement dans le Studio de création)
export const VOEUX_TEMPLATES: VoeuxTemplate[] = [];

// TEXTES D'INSPIRATION POUR AIDER LE CLIENT S'IL MANQUE DE MOTS
export const VOEUX_INSPIRATIONS: VoeuxInspiration[] = [
  {
    occasionId: "anniversaire",
    title: "Vœu Émouvant & Profond",
    text: "En ce jour si spécial, je voulais prendre un instant pour te remercier d'être la personne exceptionnelle que tu es. Que cette année nouvelle t'apporte la paix du cœur, la concrétisation de tes projets et une abondance de joies quotidiennes. Très bel anniversaire !"
  },
  {
    occasionId: "anniversaire",
    title: "Vœu Court & Chaleureux",
    text: "Une bougie de plus, mais surtout une infinité de souvenirs précieux en plus à tes côtés. Que cette journée soit à ton image : généreuse, joyeuse et inoubliable !"
  },
  {
    occasionId: "anniversaire-mariage",
    title: "Hommage au Couple",
    text: "Année après année, vous prouvez que le véritable amour se bonifie avec le temps. Votre complicité fait plaisir à voir et inspire tous ceux qui vous entourent. Heureux anniversaire de mariage !"
  },
  {
    occasionId: "mariage",
    title: "Bénédiction Solennelle",
    text: "Que votre union soit bénie de prospérité, de respect et d'une tendresse inaltérable. Main dans la main, bâtissez une vie extraordinaire à la hauteur de vos plus beaux rêves. Toutes nos félicitations !"
  },
  {
    occasionId: "bapteme",
    title: "Douceur pour l'Enfant",
    text: "Que la vie t'offre ses plus douces mélodies, ses plus éclatantes couleurs et tout l'amour dont un cœur d'enfant a besoin. Félicitations aux heureux parents pour cette bénédiction."
  },
  {
    occasionId: "graduation",
    title: "Fierté & Encouragements",
    text: "Bravo pour cette magnifique consécration ! Ton assiduité, ton intelligence et ta ténacité forcent l'admiration. Que cette réussite soit le premier tremplin d'une carrière florissante."
  }
];
