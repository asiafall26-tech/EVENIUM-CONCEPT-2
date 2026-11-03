export interface VoeuxCategory {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  subcategories: string[];
  description: string;
  accentColor: string;
  themeStyle: {
    bgGradient: string;
    badgeColor: string;
    sealColor: string;
    borderColor: string;
  };
}

export interface VoeuxTemplate {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  subCategory: string;
  badge?: "Signature" | "Nouveau" | "Coup de cœur" | "Prestige";
  coverImage: string;
  theme: "gold" | "rose" | "velvet" | "emerald" | "midnight" | "pearl";
  quotePreview: string;
  description: string;
  suggestedMusic: string;
  paperTexture: string;
  waxSealColor: string;
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
    subcategories: ["Anniversaire Adulte", "Anniversaire Enfant", "Jubilé & 50 ans+", "Première Bougie"],
    description: "Célébrez chaque printemps avec éclat, tendresse et allégresse à travers des faire-part virtuels étincelants.",
    accentColor: "from-[#d4af37] via-[#f3e5ab] to-[#b8924a]",
    themeStyle: {
      bgGradient: "from-[#241a0e] via-[#1a1208] to-[#120c05]",
      badgeColor: "bg-[#d4af37]/20 text-[#f5d77f] border-[#d4af37]/40",
      sealColor: "#c98f24",
      borderColor: "border-[#d4af37]/30"
    }
  },
  {
    id: "mariage",
    name: "Mariage",
    icon: "💍",
    tagline: "Mariage, fiançailles, anniversaire de mariage",
    subcategories: ["Félicitations Mariage", "Fiançailles", "Noces d'Or & d'Argent", "Vœux d'Amour"],
    description: "Sublimez l'union de deux âmes avec des dorures intemporelles, sceaux de cire bordeaux et mots passionnés.",
    accentColor: "from-[#8a1c14] via-[#b8332a] to-[#4a0d08]",
    themeStyle: {
      bgGradient: "from-[#280d11] via-[#190608] to-[#100305]",
      badgeColor: "bg-[#8a1c14]/30 text-[#fca5a5] border-[#b8332a]/40",
      sealColor: "#8a1c14",
      borderColor: "border-[#b8332a]/30"
    }
  },
  {
    id: "naissance-famille",
    name: "Naissance & Famille",
    icon: "👶",
    tagline: "Baptême, naissance, baby shower",
    subcategories: ["Bienvenue au Bébé", "Baptême", "Baby Shower & Révélation", "Fête des Mères & Pères"],
    description: "Une vague de douceur pastel, de nacre et de poésie pour accueillir les nouveaux miracles de la vie.",
    accentColor: "from-[#e8a598] via-[#fce4ec] to-[#d88d80]",
    themeStyle: {
      bgGradient: "from-[#261517] via-[#1c0f11] to-[#13090a]",
      badgeColor: "bg-[#e8a598]/25 text-[#ffd1dc] border-[#e8a598]/40",
      sealColor: "#d88d80",
      borderColor: "border-[#e8a598]/30"
    }
  },
  {
    id: "reussite",
    name: "Réussite",
    icon: "🎓",
    tagline: "Diplôme, concours, promotion",
    subcategories: ["Diplôme & Thèse", "Grands Concours", "Promotion & Nouveau Poste", "Succès d'Entreprise"],
    description: "Couronnez le labeur, l'effort et les grandes étapes d'élévation professionnelle avec distinction.",
    accentColor: "from-[#1e3c72] via-[#2a5298] to-[#0f2042]",
    themeStyle: {
      bgGradient: "from-[#0c182c] via-[#08101e] to-[#040810]",
      badgeColor: "bg-[#2a5298]/30 text-[#93c5fd] border-[#3b82f6]/40",
      sealColor: "#1e3c72",
      borderColor: "border-[#2a5298]/30"
    }
  },
  {
    id: "celebrations",
    name: "Célébrations",
    icon: "🎉",
    tagline: "Fêtes, Nouvel An, inaugurations",
    subcategories: ["Nouvel An & Meilleurs Vœux", "Fêtes Religieuses & Eid", "Inauguration & Vernissage", "Gala & Triomphe"],
    description: "Illuminez les grands rassemblements et festivités de l'année au son d'étincelles dorées inoubliables.",
    accentColor: "from-[#0f382c] via-[#1b5e20] to-[#082019]",
    themeStyle: {
      bgGradient: "from-[#0a1f18] via-[#06140f] to-[#030a08]",
      badgeColor: "bg-[#1b5e20]/30 text-[#a7f3d0] border-[#10b981]/40",
      sealColor: "#1b5e20",
      borderColor: "border-[#1b5e20]/30"
    }
  },
  {
    id: "messages-personnels",
    name: "Messages personnels",
    icon: "❤️",
    tagline: "Remerciements, amour, amitié & pensées",
    subcategories: ["Remerciements sincères", "Déclaration secrète", "Amitié éternelle", "Pensées & Rétablissement"],
    description: "Des mots doux et intimes couchés sur du papier virtuel d'exception, droit au cœur de ceux qui comptent.",
    accentColor: "from-[#9c27b0] via-[#ba68c8] to-[#4a148c]",
    themeStyle: {
      bgGradient: "from-[#1d0a24] via-[#120517] to-[#0b030e]",
      badgeColor: "bg-[#9c27b0]/25 text-[#f3e8ff] border-[#c084fc]/40",
      sealColor: "#8e24aa",
      borderColor: "border-[#9c27b0]/30"
    }
  }
];

export const VOEUX_TEMPLATES: VoeuxTemplate[] = [
  // 1. ANNIVERSAIRES
  {
    id: "voeu-anniversaire-flamboyant",
    title: "Floraison d'Or & Pétales",
    categoryId: "anniversaires",
    categoryName: "Anniversaires",
    subCategory: "Anniversaire Adulte",
    badge: "Signature",
    coverImage: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop",
    theme: "gold",
    quotePreview: "Que cette nouvelle année de vie soit jalonné de succès éclatants, de sourires précieux et de moments inoubliables.",
    description: "Pétales dorés flottants, ruban de soie champagne et lettrine anglaise raffinée.",
    suggestedMusic: "Valse Poétique de Vienne (Piano & Harpe)",
    paperTexture: "Papier vergé crème avec liseré or",
    waxSealColor: "#c98f24"
  },
  {
    id: "voeu-anniversaire-prestige-50",
    title: "Jubilé Impérial Noir & Or",
    categoryId: "anniversaires",
    categoryName: "Anniversaires",
    subCategory: "Jubilé & 50 ans+",
    badge: "Prestige",
    coverImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800&auto=format&fit=crop",
    theme: "midnight",
    quotePreview: "Un demi-siècle de sagesse, de générosité et de charisme. Très joyeux anniversaire d'or à une personne d'exception !",
    description: "Contraste profond noir ébène et or pur 24 carats avec animation de bulles de champagne.",
    suggestedMusic: "Jazz Lounge Doré & Contrebasse",
    paperTexture: "Carton velouté noir mat et dorure à chaud",
    waxSealColor: "#e6b800"
  },

  // 2. MARIAGE
  {
    id: "voeu-mariage-imperial",
    title: "Sceau de Cire & Velours Grenat",
    categoryId: "mariage",
    categoryName: "Mariage",
    subCategory: "Félicitations Mariage",
    badge: "Coup de cœur",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
    theme: "velvet",
    quotePreview: "Deux âmes qui s'unissent pour composer la plus pure des symphonies. Que votre amour brille d'une éternelle splendeur.",
    description: "Enveloppe drapée de velours carmin, sceau de cire frappé du monogramme d'or et dentelle vénitienne.",
    suggestedMusic: "Sonate d'Amour Romantique (Violon & Piano)",
    paperTexture: "Vélin d'Arches ivoire et ruban carmin",
    waxSealColor: "#8a1c14"
  },
  {
    id: "voeu-fiancailles-promesse",
    title: "La Promesse de Diamant",
    categoryId: "mariage",
    categoryName: "Mariage",
    subCategory: "Fiançailles",
    badge: "Nouveau",
    coverImage: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop",
    theme: "rose",
    quotePreview: "Félicitations pour vos fiançailles ! Que le chemin qui vous mène vers le grand jour soit semé d'allégresse et de magie.",
    description: "Écrin nacre aux reflets argentés, scintillements de cristal et calligraphie fine.",
    suggestedMusic: "Clair de Lune de Debussy (Harpe)",
    paperTexture: "Papier satin nacré",
    waxSealColor: "#c98f24"
  },

  // 3. NAISSANCE & FAMILLE
  {
    id: "voeu-naissance-douceur",
    title: "Petit Ange & Berceau Céleste",
    categoryId: "naissance-famille",
    categoryName: "Naissance & Famille",
    subCategory: "Bienvenue au Bébé",
    badge: "Coup de cœur",
    coverImage: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop",
    theme: "pearl",
    quotePreview: "Bienvenue au monde petit ange ! Que la vie t'enveloppe de tendresse, de découvertes joyeuses et de sourires enchantés.",
    description: "Nuages cotonneux, croissant de lune doré et boîte à musique enchanteresse pour fêter l'arrivée d'un nouveau-né.",
    suggestedMusic: "Douce Berceuse des Étoiles (Boîte à musique)",
    paperTexture: "Papier buvard texturé pastel",
    waxSealColor: "#d88d80"
  },
  {
    id: "voeu-bapteme-lumiere",
    title: "Colombe de Grâce & Baptême",
    categoryId: "naissance-famille",
    categoryName: "Naissance & Famille",
    subCategory: "Baptême",
    badge: "Signature",
    coverImage: "https://images.unsplash.com/photo-1544126592-807ade215a0b?q=80&w=800&auto=format&fit=crop",
    theme: "pearl",
    quotePreview: "En ce jour saint et béni du baptême, que la paix, la foi et l'amour divin guident chacun de ses pas.",
    description: "Rameau d'olivier argenté, colombe en relief et dorures solennelles.",
    suggestedMusic: "Hymne de Sérénité Céleste",
    paperTexture: "Papier vergé blanc pur aux tranches dorées",
    waxSealColor: "#c98f24"
  },

  // 4. RÉUSSITE
  {
    id: "voeu-reussite-lauriers",
    title: "Lauriers Triomphants & Diplôme",
    categoryId: "reussite",
    categoryName: "Réussite",
    subCategory: "Diplôme & Thèse",
    badge: "Signature",
    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
    theme: "midnight",
    quotePreview: "Chapeau bas pour cette consécration ! Ton travail acharné et ton brillant talent sont justement couronnés. Bravo !",
    description: "Couronne de lauriers en or repoussé, parchemins solennels et pluie d'étincelles de triomphe.",
    suggestedMusic: "Ode Triomphante & Cordes Majestueuses",
    paperTexture: "Parchemin impérial bleu nuit et or",
    waxSealColor: "#1e3c72"
  },
  {
    id: "voeu-promotion-sommet",
    title: "Cap vers l'Excellence",
    categoryId: "reussite",
    categoryName: "Réussite",
    subCategory: "Promotion & Nouveau Poste",
    badge: "Prestige",
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
    theme: "gold",
    quotePreview: "Toutes mes félicitations pour cette belle ascension professionnelle ! Ton leadership et ton audace forcent l'admiration.",
    description: "Lignes géométriques Art Déco or et bronze, esprit club privé d'élite.",
    suggestedMusic: "Fanfare Moderne d'Excellence",
    paperTexture: "Carton épais anthracite et cuivre",
    waxSealColor: "#b8924a"
  },

  // 5. CÉLÉBRATIONS
  {
    id: "voeu-gold-celebration",
    title: "Constellation Festive & Nouvel An",
    categoryId: "celebrations",
    categoryName: "Célébrations",
    subCategory: "Nouvel An & Meilleurs Vœux",
    badge: "Signature",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    theme: "emerald",
    quotePreview: "Que cette nouvelle année t'offre 365 jours de prospérité rayonnante, de projets couronnés et d'amour infini !",
    description: "Feu d'artifice or sur fond vert émeraude profond avec envolée de confettis holographiques.",
    suggestedMusic: "Symphonie Festive du Nouvel An",
    paperTexture: "Papier émeraude nacré",
    waxSealColor: "#1b5e20"
  },
  {
    id: "voeu-eid-moubarak",
    title: "Croissant d'Or & Lumières Saintes",
    categoryId: "celebrations",
    categoryName: "Célébrations",
    subCategory: "Fêtes Religieuses & Eid",
    badge: "Coup de cœur",
    coverImage: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800&auto=format&fit=crop",
    theme: "gold",
    quotePreview: "Eid Moubarak ! Puisse cette sainte fête apporter paix, miséricorde et abondance dans vos foyers et auprès de vos proches.",
    description: "Arabesques fines dorées, lanterne orientale animée et lueurs chaleureuses.",
    suggestedMusic: "Mélodie Orientale Apaisante (Oud & Flûte)",
    paperTexture: "Carton ivoire à découpes laser ouvragées",
    waxSealColor: "#d4af37"
  },

  // 6. MESSAGES PERSONNELS
  {
    id: "voeu-gratitude-intime",
    title: "Lettre de Cœur & Gratitude",
    categoryId: "messages-personnels",
    categoryName: "Messages personnels",
    subCategory: "Remerciements sincères",
    badge: "Coup de cœur",
    coverImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
    theme: "rose",
    quotePreview: "Du fond du cœur, un immense merci pour ta générosité et ta présence bienveillante. Tu es un être d'exception.",
    description: "Papier buvard vergé aux tranches brutes, sceau d'amour rose poudrée et calligraphie plume.",
    suggestedMusic: "Nocturne Intime au Piano",
    paperTexture: "Papier fait main à la cuve",
    waxSealColor: "#8e24aa"
  },
  {
    id: "voeu-amitie-eternelle",
    title: "L'Étoile de l'Amitié",
    categoryId: "messages-personnels",
    categoryName: "Messages personnels",
    subCategory: "Amitié éternelle",
    badge: "Nouveau",
    coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop",
    theme: "midnight",
    quotePreview: "Pour tous ces rires partagés, ces souvenirs précieux et cette complicité inaltérable : merci d'être toi !",
    description: "Ciel étoilé profond scintillant au passage du doigt, gravure de constellation d'or.",
    suggestedMusic: "Guitare Acoustique & Rêverie",
    paperTexture: "Papier bleu nuit satiné",
    waxSealColor: "#3b82f6"
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
