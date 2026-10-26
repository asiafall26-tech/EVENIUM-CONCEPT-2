export type EventCategory = 
  | "Tous"
  | "Mariage"
  | "Anniversaire"
  | "Anniversaire de mariage"
  | "Gala"
  | "Baptême"
  | "Corporate";

export interface PresetPhoto {
  id: string;
  title: string;
  category: "Mariage" | "Anniversaire" | "Anniversaire de mariage" | "Gala" | "Baptême" | "Corporate";
  url: string;
  alt: string;
}

/**
 * Galerie Photos organisée strictement par Type d'Événement
 */
export const PRESET_PHOTOS: PresetPhoto[] = [
  // --- MARIAGE & FIANÇAILLES ---
  {
    id: "w-1",
    title: "Étreinte romantique au coucher de soleil",
    category: "Mariage",
    url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=1200&q=80",
    alt: "Couple marié romantique",
  },
  {
    id: "w-2",
    title: "Alliances en or & bouquet blanc",
    category: "Mariage",
    url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
    alt: "Alliances de mariage",
  },
  {
    id: "w-3",
    title: "Cérémonie sous arche florale",
    category: "Mariage",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    alt: "Cérémonie sous arche",
  },
  {
    id: "w-4",
    title: "Regard complice & voilage de la mariée",
    category: "Mariage",
    url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
    alt: "Mariés en tenue de cérémonie",
  },
  {
    id: "w-5",
    title: "Table d'honneur & chandeliers dorés",
    category: "Mariage",
    url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
    alt: "Table de mariage raffinée",
  },
  {
    id: "w-6",
    title: "Cortège & sortie sous les pétales",
    category: "Mariage",
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
    alt: "Sortie des mariés",
  },

  // --- ANNIVERSAIRE DE MARIAGE ---
  {
    id: "am-1",
    title: "Trinquer aux années d'amour & flûtes de champagne",
    category: "Anniversaire de mariage",
    url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
    alt: "Flûtes de champagne pour anniversaire de mariage",
  },
  {
    id: "am-2",
    title: "Dîner romantique aux chandelles",
    category: "Anniversaire de mariage",
    url: "https://images.unsplash.com/photo-1529516548873-9ce57c8f155e?auto=format&fit=crop&w=1200&q=80",
    alt: "Dîner romantique aux chandelles",
  },
  {
    id: "am-3",
    title: "Renouvellement des vœux & alliances",
    category: "Anniversaire de mariage",
    url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
    alt: "Alliances et renouvellement des vœux",
  },
  {
    id: "am-4",
    title: "Roses romantiques & lumières dorées",
    category: "Anniversaire de mariage",
    url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80",
    alt: "Roses romantiques pour célébration de noces",
  },

  // --- ANNIVERSAIRE ---
  {
    id: "b-1",
    title: "Pièce montée de fête & étincelles",
    category: "Anniversaire",
    url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
    alt: "Fête d'anniversaire et ballons",
  },
  {
    id: "b-2",
    title: "Gâteau élégant aux framboises & or",
    category: "Anniversaire",
    url: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1200&q=80",
    alt: "Gâteau chic pour anniversaire",
  },
  {
    id: "b-3",
    title: "Toasts au champagne & confettis dorés",
    category: "Anniversaire",
    url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80",
    alt: "Trinquage au champagne",
  },
  {
    id: "b-4",
    title: "Ballons dorés & ambiance lumineuse",
    category: "Anniversaire",
    url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80",
    alt: "Soirée d'anniversaire festive",
  },

  // --- GALA & SOIRÉE PRESTIGE ---
  {
    id: "g-1",
    title: "Banquet impérial dans un palais",
    category: "Gala",
    url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
    alt: "Soirée de gala et lustres en cristal",
  },
  {
    id: "g-2",
    title: "Verres en cristal & champagne pétillant",
    category: "Gala",
    url: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80",
    alt: "Cocktail chic de gala",
  },
  {
    id: "g-3",
    title: "Tapis rouge & éclairage feutré",
    category: "Gala",
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    alt: "Événement mondain de gala",
  },
  {
    id: "g-4",
    title: "Piste de danse sous verrière étoilée",
    category: "Gala",
    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    alt: "Soirée dansante élégante",
  },

  // --- BAPTÊME & BABY SHOWER ---
  {
    id: "bp-1",
    title: "Douceur pastel & nuages décoratifs",
    category: "Baptême",
    url: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80",
    alt: "Table douce pour baptême",
  },
  {
    id: "bp-2",
    title: "Macarons fins & fleurs blanches",
    category: "Baptême",
    url: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=1200&q=80",
    alt: "Gourmandises blanches pour cérémonie de baptême",
  },
  {
    id: "bp-3",
    title: "Berceau fleuri & ambiance pureté",
    category: "Baptême",
    url: "https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=1200&q=80",
    alt: "Célébration naissance et baptême",
  },

  // --- CORPORATE & SÉMINAIRE ---
  {
    id: "c-1",
    title: "Cocktail dînatoire & networking corporate",
    category: "Corporate",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    alt: "Événement professionnel et conférence",
  },
  {
    id: "c-2",
    title: "Grande salle de conférence contemporaine",
    category: "Corporate",
    url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    alt: "Séminaire d'entreprise",
  },
  {
    id: "c-3",
    title: "Dîner annuel d'entreprise & tables alignées",
    category: "Corporate",
    url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80",
    alt: "Dîner corporate",
  },
];
