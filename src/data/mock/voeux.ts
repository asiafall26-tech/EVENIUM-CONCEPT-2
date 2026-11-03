export interface VoeuxCategory {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  subcategories: string[];
  description: string;
  accentColor: string;
}

export interface VoeuxTemplate {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  badge?: "Nouveau" | "Signature" | "Coup de cœur" | "Populaire";
  coverImage: string;
  theme: "gold" | "rose" | "velvet" | "emerald" | "midnight" | "pearl";
  quotePreview: string;
  description: string;
  suggestedMusic: string;
  formats: ("animée" | "vidéo" | "interactive")[];
}

export interface VoeuxInspiration {
  categoryId: string;
  occasion: string;
  text: string;
}

export const VOEUX_CATEGORIES: VoeuxCategory[] = [
  {
    id: "anniversaires",
    name: "Anniversaires",
    icon: "🎂",
    tagline: "Naissance, anniversaire adulte, enfant",
    subcategories: ["Anniversaire Adulte", "Anniversaire Enfant", "Premier Anniversaire", "Âge d'Or & Jubilé"],
    description: "Célébrez chaque bougie avec éclat, tendresse et émotion à travers des cartes festives et raffinées.",
    accentColor: "from-[#b8924a] to-[#d4af37]"
  },
  {
    id: "mariage",
    name: "Mariage",
    icon: "💍",
    tagline: "Mariage, fiançailles, anniversaire de mariage",
    subcategories: ["Félicitations Mariage", "Fiançailles", "Noces de Coton, d'Or ou de Platine", "Vœux aux Mariés"],
    description: "Sublimez l'union de deux âmes avec des dorures intemporelles, sceaux de cire et messages passionnés.",
    accentColor: "from-[#d4af37] to-[#f3e5ab]"
  },
  {
    id: "naissance-famille",
    name: "Naissance & Famille",
    icon: "👶",
    tagline: "Baptême, naissance, baby shower",
    subcategories: ["Bienvenue au Bébé", "Baptême", "Baby Shower & Révélation", "Fête des Mères & Pères"],
    description: "Une vague de douceur pastel et poétique pour accueillir les nouveaux miracles de la famille.",
    accentColor: "from-[#f4c2c2] to-[#e8a598]"
  },
  {
    id: "reussite",
    name: "Réussite",
    icon: "🎓",
    tagline: "Diplôme, concours, promotion",
    subcategories: ["Remise de Diplôme", "Réussite aux Concours", "Promotion & Nouveau Poste", "Succès d'Entreprise"],
    description: "Couronnez le labeur, l'excellence et les étapes professionnelles marquantes avec élégance.",
    accentColor: "from-[#3b5998] to-[#1e3c72]"
  },
  {
    id: "celebrations",
    name: "Célébrations",
    icon: "🎉",
    tagline: "Fêtes, Nouvel An, inaugurations",
    subcategories: ["Nouvel An & Meilleurs Vœux", "Fêtes Religieuses & Coutumes", "Inauguration & Vernissage", "Gala & Soirée"],
    description: "Illuminez les grands rassemblements et festivités de l'année au son de scintillements festifs.",
    accentColor: "from-[#ffaa00] to-[#b8860b]"
  },
  {
    id: "messages-personnels",
    name: "Messages personnels",
    icon: "❤️",
    tagline: "Remerciements, amour, amitié & pensées",
    subcategories: ["Remerciements chaleureux", "Déclaration & Amour", "Amitié indéfectible", "Pensées & Prompt Rétablissement"],
    description: "Des mots doux et intimes couchés sur du papier virtuel d'exception, droit au cœur de ceux qui comptent.",
    accentColor: "from-[#c2185b] to-[#e91e63]"
  }
];

export const VOEUX_TEMPLATES: VoeuxTemplate[] = [
  {
    id: "voeu-gold-celebration",
    title: "Or & Constellation Céleste",
    categoryId: "celebrations",
    categoryName: "Célébrations",
    badge: "Signature",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    theme: "gold",
    quotePreview: "Que cette nouvelle étape brille de mille feux d'or et comble votre cœur de succès et de félicité.",
    description: "Une ouverture d'enveloppe scintillante ornée d'étoiles dorées en cascade, idéale pour le Nouvel An et les célébrations grandioses.",
    suggestedMusic: "Symphonie Dorée (Valzer & Cordes)",
    formats: ["animée", "interactive"]
  },
  {
    id: "voeu-mariage-imperial",
    title: "Écrin Sceau de Cire & Dentelle",
    categoryId: "mariage",
    categoryName: "Mariage",
    badge: "Coup de cœur",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
    theme: "velvet",
    quotePreview: "Deux cœurs qui s'unissent pour écrire la plus belle des symphonies. Toutes nos félicitations pour votre mariage.",
    description: "Sceau de cire grenat à briser au toucher, ruban de velours et calligraphie royale dédiée aux vœux de mariage.",
    suggestedMusic: "Sonate d'Amour Romantique (Piano & Violoncelle)",
    formats: ["animée", "interactive"]
  },
  {
    id: "voeu-anniversaire-flamboyant",
    title: "Floraison d'Anniversaire",
    categoryId: "anniversaires",
    categoryName: "Anniversaires",
    badge: "Populaire",
    coverImage: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=800&auto=format&fit=crop",
    theme: "rose",
    quotePreview: "Joyeux anniversaire ! Que cette nouvelle année de vie soit remplie de rires, de santé et de doux rêves accomplis.",
    description: "Pétales dorés tourbillonnants, ballons holographiques et bougies virtuelles animées prêtes à être soufflées.",
    suggestedMusic: "Joyeux Anniversaire Acoustic Guitare",
    formats: ["animée", "interactive"]
  },
  {
    id: "voeu-naissance-douceur",
    title: "Petit Ange & Berceau d'Étoiles",
    categoryId: "naissance-famille",
    categoryName: "Naissance & Famille",
    badge: "Nouveau",
    coverImage: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop",
    theme: "pearl",
    quotePreview: "Bienvenue au petit trésor ! Que la vie lui réserve une infinité de merveilles et de tendres sourires.",
    description: "Nuages délicats, lune bienveillante et papier texturé aux tons nacre et pêche pour féliciter les heureux parents.",
    suggestedMusic: "Berceuse Enchantée (Boîte à musique)",
    formats: ["animée", "interactive"]
  },
  {
    id: "voeu-reussite-lauriers",
    title: "Lauriers Triomphants & Diplôme",
    categoryId: "reussite",
    categoryName: "Réussite",
    badge: "Signature",
    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
    theme: "midnight",
    quotePreview: "Bravo pour cette éclatante réussite ! Ta persévérance et ton talent sont justement récompensés. Le meilleur reste à venir.",
    description: "Couronne de lauriers dorés, pluie d'étincelles de fierté et parchemins d'honneur pour saluer concours et promotions.",
    suggestedMusic: "Ode Triomphante & Cordes Majestueuses",
    formats: ["animée", "interactive"]
  },
  {
    id: "voeu-gratitude-intime",
    title: "Lettre de Cœur & Gratitude",
    categoryId: "messages-personnels",
    categoryName: "Messages personnels",
    badge: "Coup de cœur",
    coverImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
    theme: "velvet",
    quotePreview: "Du fond du cœur, un immense merci pour ta présence précieuse et ton soutien inestimable à chaque instant.",
    description: "Une lettre manuscrite luxueuse sur papier buvard vergé, ornée de dorures à chaud et scellée avec délicatesse.",
    suggestedMusic: "Mélodie Intime & Piano feutré",
    formats: ["animée", "interactive"]
  },
  {
    id: "voeu-jubile-adulte",
    title: "Célébration Prestige Prestige 50+",
    categoryId: "anniversaires",
    categoryName: "Anniversaires",
    badge: "Signature",
    coverImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800&auto=format&fit=crop",
    theme: "gold",
    quotePreview: "Un demi-siècle de sagesse, d'amour et de joie partagée. Très joyeux jubilé à une personne d'exception !",
    description: "Chiffres dorés 3D, fond velours noir profond et bulles de champagne pétillantes.",
    suggestedMusic: "Jazz Lounge Célébration",
    formats: ["animée", "interactive"]
  },
  {
    id: "voeu-fiancailles-promesse",
    title: "La Bague Scintillante",
    categoryId: "mariage",
    categoryName: "Mariage",
    badge: "Nouveau",
    coverImage: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop",
    theme: "rose",
    quotePreview: "Félicitations pour vos fiançailles ! Que le chemin qui vous mène au grand jour soit jalonné d'allégresse.",
    description: "Un écrin blanc pur qui s'ouvre avec reflets de diamants scintillants et pétales de roses blanches.",
    suggestedMusic: "Clair de Lune (Harpe)",
    formats: ["animée", "interactive"]
  }
];

export const VOEUX_INSPIRATIONS: VoeuxInspiration[] = [
  {
    categoryId: "anniversaires",
    occasion: "Anniversaire d'un proche",
    text: "En ce jour si particulier, je te souhaite une pluie de bonheurs, des rires partagés et la réalisation de tes projets les plus chers. Que cette nouvelle année t'apporte santé, paix et succès rayonnant. Joyeux anniversaire !"
  },
  {
    categoryId: "anniversaires",
    occasion: "Anniversaire d'enfant",
    text: "Un merveilleux anniversaire au plus joyeux des petits champions ! Que ta journée soit remplie de jeux, de cadeaux féeriques et de gâteaux gourmands. Grandis bien et garde toujours ton sourire magique !"
  },
  {
    categoryId: "mariage",
    occasion: "Vœux de mariage",
    text: "Deux cœurs battant désormais à l'unisson pour tisser une vie pleine d'harmonie et d'amour inconditionnel. Puisse votre foyer être béni d'une éternelle félicité. Félicitations pour cette union magnifique !"
  },
  {
    categoryId: "mariage",
    occasion: "Anniversaire de mariage",
    text: "Toutes nos félicitations pour ces magnifiques années d'amour et de complicité ! Votre histoire est une source d'inspiration pour nous tous. Joyeux anniversaire de mariage !"
  },
  {
    categoryId: "naissance-famille",
    occasion: "Félicitations Naissance",
    text: "Quelle immense joie d'apprendre la venue au monde de votre petit trésor ! Nous souhaitons à ce nouveau-né une vie douce et comblée, et beaucoup de tendresse aux merveilleux parents."
  },
  {
    categoryId: "naissance-famille",
    occasion: "Baptême",
    text: "En ce jour saint et béni du baptême, nous envoyons toutes nos prières et nos pensées chaleureuses pour accompagner cet enfant sur un chemin lumineux et bienveillant."
  },
  {
    categoryId: "reussite",
    occasion: "Obtention de diplôme",
    text: "Chapeau bas pour cette belle consécration ! Tes efforts soutenus, ta passion et ta ténacité portent enfin leurs fruits dorés. Bravo pour ton diplôme et vivement le prochain sommet !"
  },
  {
    categoryId: "reussite",
    occasion: "Promotion professionnelle",
    text: "Toutes mes félicitations pour cette belle promotion grandement méritée ! Ton leadership et ton talent sont un modèle pour tous. Plein succès dans ces nouvelles responsabilités."
  },
  {
    categoryId: "celebrations",
    occasion: "Meilleurs Vœux Nouvel An",
    text: "Que cette nouvelle année s'ouvre sous les meilleurs auspices : 365 jours de sérénité, de projets ambitieux concrétisés, de prospérité et d'amour infini pour toi et les tiens."
  },
  {
    categoryId: "messages-personnels",
    occasion: "Remerciements sincères",
    text: "Je tenais à t'exprimer toute ma reconnaissance pour ton aide bienveillante et ta présence chaleureuse. Ton geste m'a profondément touché(e) et je ne l'oublierai pas. Merci mille fois !"
  }
];
