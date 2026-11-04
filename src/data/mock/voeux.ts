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

export const VOEUX_TEMPLATES: VoeuxTemplate[] = [];

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
