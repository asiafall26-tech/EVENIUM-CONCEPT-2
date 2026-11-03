export interface VoeuxCategory {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  hook: string;
  subcategories: string[];
  description: string;
  accentColor: string;
  themeStyle: {
    bgGradient: string;
    badgeColor: string;
    sealColor: string;
    borderColor: string;
    lightBg: string;
  };
}

export interface VoeuxTemplate {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  subCategory: string;
  badge?: "Signature" | "Coup de cœur" | "Bestseller" | "Prestige" | "Édition Limitée";
  coverImage: string;
  theme: "gold" | "rose" | "velvet" | "emerald" | "midnight" | "pearl";
  quotePreview: string;
  description: string;
  suggestedMusic: string;
  paperTexture: string;
  waxSealColor: string;
  price: string;
}

export interface VoeuxInspiration {
  categoryId: string;
  occasion: string;
  title: string;
  text: string;
}

export const VOEUX_CATEGORIES: VoeuxCategory[] = [
  {
    id: "anniversaires",
    name: "Anniversaires",
    icon: "🎂",
    tagline: "Naissance, adulte, enfant & jubilés",
    hook: "Faites briller les yeux de ceux qui célèbrent un an de plus.",
    subcategories: ["Anniversaire Adulte", "Anniversaire Enfant", "Jubilé 50 ans+", "Première Bougie"],
    description: "Bien plus qu'un simple texto : une lettre d'art aux reflets dorés qui célèbre une vie précieuse et laisse un souvenir impérissable.",
    accentColor: "from-[#d4af37] via-[#f3e5ab] to-[#b8924a]",
    themeStyle: {
      bgGradient: "from-[#2e1d0f] via-[#1a1008] to-[#120a05]",
      badgeColor: "bg-[#d4af37]/20 text-[#8f6f33] border-[#d4af37]/50",
      sealColor: "#c98f24",
      borderColor: "border-[#d4af37]/40",
      lightBg: "bg-[#fdf9f2]"
    }
  },
  {
    id: "mariage",
    name: "Mariage & Amour",
    icon: "💍",
    tagline: "Mariage, fiançailles, noces d'or & déclarations",
    hook: "L'élégance suprême pour saluer l'union de deux âmes.",
    subcategories: ["Félicitations Mariage", "Fiançailles", "Noces d'Or & d'Argent", "Vœux d'Amour"],
    description: "Le raffinement du velours grenat et du sceau de cire pour adresser vos bénédictions les plus sincères aux mariés.",
    accentColor: "from-[#8a1c14] via-[#b8332a] to-[#4a0d08]",
    themeStyle: {
      bgGradient: "from-[#330f14] via-[#1e070a] to-[#140406]",
      badgeColor: "bg-[#8a1c14]/20 text-[#a8231a] border-[#8a1c14]/40",
      sealColor: "#8a1c14",
      borderColor: "border-[#b8332a]/40",
      lightBg: "bg-[#fff5f5]"
    }
  },
  {
    id: "naissance-famille",
    name: "Naissance & Famille",
    icon: "👶",
    tagline: "Baptême, naissance, baby shower & petits anges",
    hook: "Accueillez un nouveau miracle avec une infinie douceur.",
    subcategories: ["Bienvenue au Bébé", "Baptême", "Baby Shower & Révélation", "Fête des Mères & Pères"],
    description: "Une envolée poétique de pastel et de nacre pour féliciter les jeunes parents et déposer une caresse d'amour sur le berceau.",
    accentColor: "from-[#e8a598] via-[#fce4ec] to-[#d88d80]",
    themeStyle: {
      bgGradient: "from-[#2f181c] via-[#1c0f12] to-[#12090b]",
      badgeColor: "bg-[#e8a598]/20 text-[#b55848] border-[#e8a598]/40",
      sealColor: "#d88d80",
      borderColor: "border-[#e8a598]/40",
      lightBg: "bg-[#fdf4f2]"
    }
  },
  {
    id: "reussite",
    name: "Réussite & Victoires",
    icon: "🎓",
    tagline: "Diplôme, concours, promotion & consécration",
    hook: "Couronnez le labeur et l'excellence avec panache.",
    subcategories: ["Diplôme & Thèse", "Grands Concours", "Promotion & Nouveau Poste", "Succès d'Entreprise"],
    description: "Félicitez une étape charnière avec la solennité des grands parchemins et l'énergie des lauriers dorés triomphants.",
    accentColor: "from-[#1e3c72] via-[#2a5298] to-[#0f2042]",
    themeStyle: {
      bgGradient: "from-[#0e1e38] via-[#091324] to-[#040812]",
      badgeColor: "bg-[#1e3c72]/20 text-[#1e3c72] border-[#2a5298]/40",
      sealColor: "#1e3c72",
      borderColor: "border-[#2a5298]/40",
      lightBg: "bg-[#f0f5fc]"
    }
  },
  {
    id: "celebrations",
    name: "Célébrations & Fêtes",
    icon: "🎉",
    tagline: "Fêtes de fin d'année, Nouvel An, Eid & inaugurations",
    hook: "Semez l'étincelle et la joie dans les grands moments de l'année.",
    subcategories: ["Nouvel An & Meilleurs Vœux", "Fêtes Religieuses & Eid", "Inauguration & Vernissage", "Gala & Triomphe"],
    description: "Des gerbes d'or, des bulles de champagne et une aura festive pour adresser des vœux de prospérité inoubliables.",
    accentColor: "from-[#0f382c] via-[#1b5e20] to-[#082019]",
    themeStyle: {
      bgGradient: "from-[#0e2b21] via-[#081b14] to-[#040d0a]",
      badgeColor: "bg-[#1b5e20]/20 text-[#165e26] border-[#10b981]/40",
      sealColor: "#1b5e20",
      borderColor: "border-[#1b5e20]/40",
      lightBg: "bg-[#f0f9f4]"
    }
  },
  {
    id: "messages-personnels",
    name: "Messages du Cœur",
    icon: "❤️",
    tagline: "Remerciements, déclarations, tendresse & pardon",
    hook: "Dites les mots que l'on n'ose jamais assez prononcer.",
    subcategories: ["Remerciements sincères", "Déclaration secrète", "Amitié éternelle", "Pensées & Réconfort"],
    description: "Pour dire merci, pardon, ou simplement 'je t'aime' : une enveloppe intime qui va droit au cœur et se garde pour toujours.",
    accentColor: "from-[#9c27b0] via-[#ba68c8] to-[#4a148c]",
    themeStyle: {
      bgGradient: "from-[#290e33] via-[#18081f] to-[#0d0411]",
      badgeColor: "bg-[#9c27b0]/20 text-[#7b1fa2] border-[#c084fc]/40",
      sealColor: "#8e24aa",
      borderColor: "border-[#9c27b0]/40",
      lightBg: "bg-[#faf0ff]"
    }
  }
];

export const VOEUX_TEMPLATES: VoeuxTemplate[] = [
  // 1. ANNIVERSAIRES
  {
    id: "voeu-anniversaire-flamboyant",
    title: "Floraison d'Or & Pétales de Soie",
    categoryId: "anniversaires",
    categoryName: "Anniversaires",
    subCategory: "Anniversaire Adulte",
    badge: "Bestseller",
    coverImage: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=900&auto=format&fit=crop",
    theme: "gold",
    quotePreview: "Que chaque seconde de cette nouvelle année te rappelle combien ta présence est un cadeau pour nous tous. Très bel anniversaire !",
    description: "Pluie de pétales dorés, champagne pétillant et cachet de cire couleur miel sauvage.",
    suggestedMusic: "Valse Poétique de Vienne (Piano & Harpe)",
    paperTexture: "Vélin de coton ivoire 350g à la feuille d'or",
    waxSealColor: "#c98f24",
    price: "3,90 €"
  },
  {
    id: "voeu-anniversaire-prestige-50",
    title: "Jubilé Impérial Noir & Or 24K",
    categoryId: "anniversaires",
    categoryName: "Anniversaires",
    subCategory: "Jubilé 50 ans+",
    badge: "Prestige",
    coverImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=900&auto=format&fit=crop",
    theme: "midnight",
    quotePreview: "Un demi-siècle de sagesse, de panache et de générosité. Tu ne prends pas de l'âge : tu deviens une légende. Joyeux Jubilé d'Or !",
    description: "Contraste somptueux noir ébène et or 24 carats, bulles dorées et contrebasse feutrée.",
    suggestedMusic: "Lounge Bar Doré (Contrebasse & Saxophone)",
    paperTexture: "Carton velours noir intense et dorure à chaud",
    waxSealColor: "#e6b800",
    price: "4,90 €"
  },

  // 2. MARIAGE
  {
    id: "voeu-mariage-imperial",
    title: "Sceau d'Amour & Velours Carmin",
    categoryId: "mariage",
    categoryName: "Mariage & Amour",
    subCategory: "Félicitations Mariage",
    badge: "Coup de cœur",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=900&auto=format&fit=crop",
    theme: "velvet",
    quotePreview: "Quand deux âmes étaient écrites dans les étoiles, leur union n'est pas un hasard, mais une symphonie. Que votre amour brille d'une éternelle splendeur.",
    description: "Draperie de velours grenat, sceau de cire frappé du monogramme d'or et dentelle ancienne.",
    suggestedMusic: "Sonate d'Amour Romantique (Violon & Piano)",
    paperTexture: "Vélin d'Arches ivoire et ruban de soie carmin",
    waxSealColor: "#8a1c14",
    price: "3,90 €"
  },
  {
    id: "voeu-fiancailles-promesse",
    title: "La Promesse Éternelle de Nacre",
    categoryId: "mariage",
    categoryName: "Mariage & Amour",
    subCategory: "Fiançailles",
    badge: "Signature",
    coverImage: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=900&auto=format&fit=crop",
    theme: "rose",
    quotePreview: "Deux mains qui se lient pour ne plus jamais se lâcher. Que le doux chemin vers le grand jour soit semé d'étoiles et de complicité.",
    description: "Écrin nacré aux reflets scintillants de cristal, lettrine fine à l'encre d'or.",
    suggestedMusic: "Clair de Lune de Debussy (Harpe céleste)",
    paperTexture: "Papier satin nacré aux tranches or",
    waxSealColor: "#c98f24",
    price: "3,90 €"
  },

  // 3. NAISSANCE & FAMILLE
  {
    id: "voeu-naissance-douceur",
    title: "Petit Ange & Berceau Céleste",
    categoryId: "naissance-famille",
    categoryName: "Naissance & Famille",
    subCategory: "Bienvenue au Bébé",
    badge: "Coup de cœur",
    coverImage: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=900&auto=format&fit=crop",
    theme: "pearl",
    quotePreview: "Dix petits doigts, un souffle d'ange et tout l'univers qui bascule dans l'amour pur. Bienvenue au monde petit trésor, et tendresse infinie aux parents !",
    description: "Nuages cotonneux, croissant de lune d'or et berceuse douce comme une boîte à musique.",
    suggestedMusic: "Douce Berceuse des Étoiles (Boîte à musique)",
    paperTexture: "Papier buvard texturé pastel poudré",
    waxSealColor: "#d88d80",
    price: "3,90 €"
  },
  {
    id: "voeu-bapteme-lumiere",
    title: "Colombe de Grâce & Bénédiction",
    categoryId: "naissance-famille",
    categoryName: "Naissance & Famille",
    subCategory: "Baptême",
    badge: "Signature",
    coverImage: "https://images.unsplash.com/photo-1544126592-807ade215a0b?q=80&w=900&auto=format&fit=crop",
    theme: "pearl",
    quotePreview: "En ce jour béni du baptême, que la bienveillance, la paix et la grâce accompagnent chacun de ses pas tout au long de sa vie.",
    description: "Rameau d'olivier d'or, colombe immaculée en relief et dorures solennelles.",
    suggestedMusic: "Hymne de Sérénité Céleste (Chœurs & Orgue doux)",
    paperTexture: "Papier vergé blanc pur aux tranches dorées",
    waxSealColor: "#c98f24",
    price: "3,90 €"
  },

  // 4. RÉUSSITE
  {
    id: "voeu-reussite-lauriers",
    title: "Lauriers Triomphants & Consécration",
    categoryId: "reussite",
    categoryName: "Réussite & Victoires",
    subCategory: "Diplôme & Thèse",
    badge: "Signature",
    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=900&auto=format&fit=crop",
    theme: "midnight",
    quotePreview: "Les victoires ne doivent rien au hasard : elles couronnent ceux qui osent rêver grand et travailler dur. Immense bravo pour ce diplôme mérité !",
    description: "Couronne de lauriers en or repoussé, sceau impérial bleu saphir et étincelles de triomphe.",
    suggestedMusic: "Ode Triomphante & Cordes Majestueuses",
    paperTexture: "Parchemin impérial bleu nuit et or",
    waxSealColor: "#1e3c72",
    price: "3,90 €"
  },
  {
    id: "voeu-promotion-sommet",
    title: "Cap vers l'Excellence & Sommets",
    categoryId: "reussite",
    categoryName: "Réussite & Victoires",
    subCategory: "Promotion & Nouveau Poste",
    badge: "Prestige",
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=900&auto=format&fit=crop",
    theme: "gold",
    quotePreview: "Félicitations éclatantes pour cette belle ascension ! Ton talent, ta vision et ton audace t'ouvrent les plus belles portes. Plein succès !",
    description: "Lignes géométriques Art Déco bronze et or brossé, esprit club privé d'élite.",
    suggestedMusic: "Fanfare Moderne d'Excellence (Cuivres feutrés)",
    paperTexture: "Carton épais anthracite et filigrane cuivre",
    waxSealColor: "#b8924a",
    price: "4,90 €"
  },

  // 5. CÉLÉBRATIONS
  {
    id: "voeu-gold-celebration",
    title: "Constellation d'Or & Nouvel An Éclatant",
    categoryId: "celebrations",
    categoryName: "Célébrations & Fêtes",
    subCategory: "Nouvel An & Meilleurs Vœux",
    badge: "Bestseller",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=900&auto=format&fit=crop",
    theme: "emerald",
    quotePreview: "Que cette nouvelle année t'offre 365 matins d'optimisme, des projets couronnés de succès et l'amour inconditionnel des tiens !",
    description: "Feu d'artifice or sur fond vert émeraude profond avec envolée de confettis dorés chatoyants.",
    suggestedMusic: "Symphonie Festive du Nouvel An",
    paperTexture: "Papier vert impérial et dorure miroir",
    waxSealColor: "#1b5e20",
    price: "3,90 €"
  },
  {
    id: "voeu-eid-moubarak",
    title: "Croissant d'Or & Lumières Saintes",
    categoryId: "celebrations",
    categoryName: "Célébrations & Fêtes",
    subCategory: "Fêtes Religieuses & Eid",
    badge: "Coup de cœur",
    coverImage: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=900&auto=format&fit=crop",
    theme: "gold",
    quotePreview: "Eid Moubarak ! Puisse cette sainte journée inonder votre foyer de paix spirituelle, de douce santé et de bonheur partagé en famille.",
    description: "Arabesques d'or fin, lanterne orientale animée et lueur ambrée chaleureuse.",
    suggestedMusic: "Mélodie Orientale Apaisante (Oud & Flûte)",
    paperTexture: "Carton ivoire à découpes ouvragées",
    waxSealColor: "#d4af37",
    price: "3,90 €"
  },

  // 6. MESSAGES PERSONNELS
  {
    id: "voeu-gratitude-intime",
    title: "Lettre de Cœur & Gratitude Infinie",
    categoryId: "messages-personnels",
    categoryName: "Messages du Cœur",
    subCategory: "Remerciements sincères",
    badge: "Coup de cœur",
    coverImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=900&auto=format&fit=crop",
    theme: "rose",
    quotePreview: "Il y a des présences qui illuminent une vie et des gestes que l'on n'oublie jamais. Merci d'être cette personne rare et précieuse pour moi.",
    description: "Papier vergé fait main aux tranches brutes, cachet de cire améthyste et plume d'or.",
    suggestedMusic: "Nocturne Intime au Piano (Chopin spirit)",
    paperTexture: "Papier à la cuve artisanal et liseré amarante",
    waxSealColor: "#8e24aa",
    price: "3,90 €"
  },
  {
    id: "voeu-amitie-eternelle",
    title: "L'Étoile Complice de l'Amitié",
    categoryId: "messages-personnels",
    categoryName: "Messages du Cœur",
    subCategory: "Amitié éternelle",
    badge: "Signature",
    coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=900&auto=format&fit=crop",
    theme: "midnight",
    quotePreview: "Pour tous les éclats de rire partagés, les silences réconfortants et cette complicité que rien n'altère : merci d'exister dans ma vie !",
    description: "Constellation dorée animée, ciel bleu nuit velouté et lettrine anglaise lumineuse.",
    suggestedMusic: "Guitare Acoustique & Rêverie Nostalgique",
    paperTexture: "Papier bleu saphir texturé grain fin",
    waxSealColor: "#3b82f6",
    price: "3,90 €"
  }
];

export const VOEUX_INSPIRATIONS: VoeuxInspiration[] = [
  {
    categoryId: "anniversaires",
    occasion: "Anniversaire d'une personne chère",
    title: "Éloge de ta lumière",
    text: "En ce jour unique où tu es venu(e) illuminer le monde, je voulais te rappeler combien ta présence est un cadeau précieux. Que cette nouvelle année t'apporte la santé, l'audace de réaliser tes rêves les plus fous et une montagne de bonheurs quotidiens. Très bel anniversaire !"
  },
  {
    categoryId: "anniversaires",
    occasion: "Jubilé ou Cap des 50 / 60 ans",
    title: "Hommage à un parcours admirable",
    text: "Chaque ride d'expression est le témoin d'un rire partagé, chaque année passée une leçon de générosité offerte à ceux qui t'entourent. Tu traverses les âges avec une élégance et une force qui forcent l'admiration. Magnifique jubilé à une personne exceptionnelle !"
  },
  {
    categoryId: "anniversaires",
    occasion: "Anniversaire d'enfant",
    title: "Pour notre petit aventurier",
    text: "Un merveilleux anniversaire au plus intrépide et souriant des petits champions ! Que ta journée soit remplie de surprises éclatantes, de jeux avec tes amis et de gâteaux gourmands. Continue de rêver grand et de faire briller tes petits yeux d'étoiles !"
  },
  {
    categoryId: "mariage",
    occasion: "Félicitations de Mariage",
    title: "Pour une union éternelle",
    text: "Quand deux êtres s'aiment avec une telle évidence, le mariage n'est pas un commencement mais l'accomplissement d'un destin. Que votre foyer soit un havre de paix, de tendresse inaltérable et de rires complices. Toutes nos félicitations et longue vie à votre amour !"
  },
  {
    categoryId: "mariage",
    occasion: "Fiançailles ou Déclaration",
    title: "La promesse de deux cœurs",
    text: "Deux mains qui se serrent, deux destins qui ne font plus qu'un. Que chaque pas franchi vers le jour J soit baigné de magie, de préparatifs joyeux et d'un bonheur infini. Félicitations pour ce merveilleux engagement !"
  },
  {
    categoryId: "naissance-famille",
    occasion: "Bienvenue au Nouveau-né",
    title: "Un miracle parmi nous",
    text: "Un tout petit être vient de pousser son premier cri, et c'est le cœur de toute une famille qui chavire d'amour. Bienvenue dans ce monde petit trésor ! Nous souhaitons aux nouveaux parents des nuits paisibles et des journées comblées d'émerveillement."
  },
  {
    categoryId: "reussite",
    occasion: "Diplôme ou Concours",
    title: "Couronnement d'un travail d'élite",
    text: "Pendant que d'autres dormaient ou doutaient, toi tu as persévéré avec méthode, courage et brio. Aujourd'hui, cette consécration éclatante porte ton nom. Nous sommes immensément fiers de toi ! Ce n'est que la première victoire d'un avenir radieux."
  },
  {
    categoryId: "reussite",
    occasion: "Promotion ou Nouveau Poste",
    title: "L'ascension d'un grand talent",
    text: "Toutes mes plus vives félicitations pour cette promotion amplement méritée ! Ton professionnalisme, ton calme et ton leadership naturel t'amènent là où tu dois être. Plein succès dans ces nouveaux défis qui t'attendent !"
  },
  {
    categoryId: "celebrations",
    occasion: "Vœux du Nouvel An",
    title: "365 jours de grâce et d'abondance",
    text: "Que cette nouvelle année balaie les doutes passés et t'ouvre grand les bras vers la réussite, la prospérité et une santé de fer. Qu'elle dépose dans ton cœur la paix et dans ton foyer des éclats de rire incessants. Excellente et glorieuse année !"
  },
  {
    categoryId: "messages-personnels",
    occasion: "Gratitude & Remerciements profonds",
    title: "Du fond de l'âme, merci",
    text: "Il existe des personnes dont la simple présence réchauffe l'existence. Tu as été là au moment précis où j'en avais le plus besoin, avec une délicatesse et une générosité sans égale. Je ne l'oublierai jamais. Mille mercis d'être qui tu es."
  }
];
