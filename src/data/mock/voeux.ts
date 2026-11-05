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

// MODÈLES DE VŒUX D'EXCEPTION
export const VOEUX_TEMPLATES: VoeuxTemplate[] = [
  // 1. Anniversaire
  {
    id: "voeu-anniv-or",
    title: "L'Étoile du Jubilé",
    occasionId: "anniversaire",
    occasionName: "Anniversaire",
    badge: "Bestseller",
    theme: "gold",
    paperTexture: "velin-ivoire",
    waxSealColor: "gold",
    waxSealEmblem: "couronne",
    defaultKicker: "Joyeux Anniversaire",
    defaultTitle: "Que cette nouvelle année fasse éclore tous tes rêves",
    defaultMessage: "En ce jour béni où le monde a eu la chance de t'accueillir, je te souhaite une année lumineuse, baignée de succès, de rires et d'une santé de fer. Que chaque pas te rapproche de tes plus grandes aspirations.",
    suggestedMusic: "Clair de Lune - Debussy",
    priceFcfa: 3900,
    priceEur: "3,90 €"
  },
  {
    id: "voeu-anniv-minuit",
    title: "Aura Nocturne & Poussière d'Or",
    occasionId: "anniversaire",
    occasionName: "Anniversaire",
    badge: "Signature",
    theme: "midnight",
    paperTexture: "soie-noire",
    waxSealColor: "gold",
    waxSealEmblem: "etoile",
    defaultKicker: "Une Nouvelle Bougie",
    defaultTitle: "À toi, l'âme rare et lumineuse",
    defaultMessage: "Le temps n'a pas de prise sur les êtres extraordinaires : il ne fait que révéler leur éclat. Joyeux anniversaire du fond du cœur. Continue de faire rayonner ta bonté autour de toi.",
    suggestedMusic: "Nocturne Op. 9 No. 2 - Chopin",
    priceFcfa: 3900,
    priceEur: "3,90 €"
  },

  // 2. Anniversaire de mariage
  {
    id: "voeu-anniv-mariage-noces",
    title: "Le Sceau des Années Heureuses",
    occasionId: "anniversaire-mariage",
    occasionName: "Anniversaire de mariage",
    badge: "Signature",
    theme: "gold",
    paperTexture: "coton-creme",
    waxSealColor: "bronze",
    waxSealEmblem: "coeur",
    defaultKicker: "Joyeux Anniversaire de Mariage",
    defaultTitle: "Un amour qui traverse le temps avec grâce",
    defaultMessage: "Félicitations pour cette nouvelle année d'union, de complicité et de soutien mutuel. Vous êtes un exemple d'harmonie et d'amour sincère pour nous tous. Que votre chemin continue d'être pavé de tendresse et de paix.",
    suggestedMusic: "Canon in D - Pachelbel",
    priceFcfa: 3900,
    priceEur: "3,90 €"
  },

  // 3. Mariage
  {
    id: "voeu-mariage-eternel",
    title: "L'Alliance Céleste",
    occasionId: "mariage",
    occasionName: "Mariage",
    badge: "Bestseller",
    theme: "pearl",
    paperTexture: "velin-ivoire",
    waxSealColor: "rose-gold",
    waxSealEmblem: "coeur",
    defaultKicker: "Félicitations pour votre Mariage",
    defaultTitle: "Deux cœurs réunis pour une destinée commune",
    defaultMessage: "Que votre foyer soit un havre de paix, de patience et de bonheur infini. Que chaque aube renouvelle la force de votre promesse et que vos lendemains soient plus doux encore que vos plus beaux souvenirs.",
    suggestedMusic: "River Flows in You - Yiruma",
    priceFcfa: 3900,
    priceEur: "3,90 €"
  },

  // 4. Baptême & Naissance
  {
    id: "voeu-bapteme-purete",
    title: "L'Aube Précieuse",
    occasionId: "bapteme",
    occasionName: "Baptême & Naissance",
    badge: "Coup de cœur",
    theme: "pearl",
    paperTexture: "coton-creme",
    waxSealColor: "gold",
    waxSealEmblem: "fleuron",
    defaultKicker: "Bienvenue au Monde & Bénédictions",
    defaultTitle: "Une nouvelle lumière éclaire votre famille",
    defaultMessage: "Félicitations pour ce merveilleux trésor qui vient d'enrichir votre foyer. Que ce petit ange grandisse entouré d'amour, de sagesse et de bienveillance divine. Tous nos vœux de santé et de bonheur infini.",
    suggestedMusic: "Gymnopédie No. 1 - Satie",
    priceFcfa: 3900,
    priceEur: "3,90 €"
  },

  // 5. Graduation & Réussite
  {
    id: "voeu-graduation-triomphe",
    title: "Les Lauriers de l'Excellence",
    occasionId: "graduation",
    occasionName: "Graduation & Réussite",
    badge: "Prestige",
    theme: "emerald",
    paperTexture: "parchemin-or",
    waxSealColor: "gold",
    waxSealEmblem: "diplome",
    defaultKicker: "Félicitations pour votre Réussite",
    defaultTitle: "Le couronnement du travail et de la persévérance",
    defaultMessage: "Cette graduation n'est pas seulement l'aboutissement de longues années d'efforts : c'est la porte grande ouverte sur un avenir brillant. Nous sommes immensément fiers de votre parcours remarquable. Visez haut, le monde vous appartient.",
    suggestedMusic: "Arrival of the Queen of Sheba - Haendel",
    priceFcfa: 3900,
    priceEur: "3,90 €"
  }
];

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
