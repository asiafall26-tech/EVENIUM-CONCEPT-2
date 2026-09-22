export type ProviderCategory = 
  | "Traiteurs"
  | "Décorateurs"
  | "Photographes"
  | "Vidéastes"
  | "DJ / Animation"
  | "Salles de réception"
  | "Wedding planners"
  | "Fleuristes"
  | "Location de matériel"
  | "Pâtissiers"
  | "Coiffeurs / maquilleurs"
  | "Transport"
  | "Sécurité";

export interface Provider {
  id: string;
  name: string;
  category: ProviderCategory;
  description: string;
  services: string[];
  zone: string;
  phone: string;
  whatsapp: string;
  priceRange: string;
  gallery: string[];
  rating: number;
  isPlatformProvider: boolean;
}

export const mockProviders: Provider[] = [
  // PHOTOGRAPHES
  {
    id: "prov-001",
    name: "Photo Event Luxe",
    category: "Photographes",
    description: "Spécialiste de la photographie de mariage haut de gamme avec une approche éditoriale et lumineuse.",
    services: ["Couverture complète de l'événement", "Album photo premium", "Séance d'engagement"],
    zone: "Dakar et alentours",
    phone: "+221 77 123 45 67",
    whatsapp: "+221 77 123 45 67",
    priceRange: "Sur devis (à partir de 500 000 FCFA)",
    gallery: ["/mock/photo1.jpg", "/mock/photo2.jpg", "/mock/photo3.jpg"],
    rating: 4.9,
    isPlatformProvider: true,
  },
  {
    id: "prov-002",
    name: "Vision Claire",
    category: "Photographes",
    description: "Photographie moderne et captation drone pour des souvenirs époustouflants de vos événements professionnels.",
    services: ["Photographie Corporate", "Vidéos de présentation", "Drone"],
    zone: "Sénégal entier",
    phone: "+221 76 111 22 33",
    whatsapp: "+221 76 111 22 33",
    priceRange: "À partir de 150 000 FCFA",
    gallery: [],
    rating: 4.5,
    isPlatformProvider: false, // Externe qui a payé
  },

  // TRAITEURS
  {
    id: "prov-003",
    name: "Délices & Saveurs",
    category: "Traiteurs",
    description: "Gastronomie raffinée mêlant saveurs locales et cuisine internationale pour des réceptions inoubliables.",
    services: ["Buffet gastronomique", "Dîner assis", "Cocktail dînatoire", "Pièce montée"],
    zone: "Sénégal entier",
    phone: "+221 76 987 65 43",
    whatsapp: "+221 76 987 65 43",
    priceRange: "À partir de 15 000 FCFA / personne",
    gallery: ["/mock/food1.jpg", "/mock/food2.jpg"],
    rating: 4.8,
    isPlatformProvider: true,
  },
  {
    id: "prov-004",
    name: "Mamy Kitchen",
    category: "Traiteurs",
    description: "La cuisine sénégalaise authentique pour tous vos événements familiaux.",
    services: ["Plats traditionnels", "Jus locaux", "Amuse-bouches sénégalais"],
    zone: "Dakar",
    phone: "+221 77 333 44 55",
    whatsapp: "+221 77 333 44 55",
    priceRange: "À partir de 5 000 FCFA / personne",
    gallery: [],
    rating: 4.6,
    isPlatformProvider: true,
  },

  // DÉCORATEURS
  {
    id: "prov-005",
    name: "Golden Decor",
    category: "Décorateurs",
    description: "Design floral et scénographie sur mesure pour transformer vos lieux de réception.",
    services: ["Décoration florale", "Éclairage d'ambiance", "Art de la table", "Mobilier design"],
    zone: "Dakar, Thiès, Mbour",
    phone: "+221 78 555 44 33",
    whatsapp: "+221 78 555 44 33",
    priceRange: "Sur devis",
    gallery: ["/mock/decor1.jpg", "/mock/decor2.jpg"],
    rating: 5.0,
    isPlatformProvider: true,
  },
  {
    id: "prov-006",
    name: "Espaces Magiques",
    category: "Décorateurs",
    description: "Décoration de salles de conférence et soirées de gala pour entreprises.",
    services: ["Aménagement d'espace", "PLV", "Décoration scénique"],
    zone: "Sénégal entier",
    phone: "+221 70 888 77 66",
    whatsapp: "+221 70 888 77 66",
    priceRange: "À partir de 300 000 FCFA",
    gallery: [],
    rating: 4.7,
    isPlatformProvider: false,
  },

  // SALLES DE RÉCEPTION
  {
    id: "prov-007",
    name: "Le Palais des Vents",
    category: "Salles de réception",
    description: "Magnifique salle de réception climatisée pouvant accueillir jusqu'à 500 convives.",
    services: ["Salle climatisée", "Parking sécurisé", "Loge pour les mariés", "Nettoyage inclus"],
    zone: "Diamniadio",
    phone: "+221 33 800 00 00",
    whatsapp: "+221 77 800 00 00",
    priceRange: "1 500 000 FCFA / jour",
    gallery: [],
    rating: 4.9,
    isPlatformProvider: true,
  },
  {
    id: "prov-008",
    name: "Villa Océane",
    category: "Salles de réception",
    description: "Villa en bord de mer parfaite pour les petits événements privés et les réceptions intimistes.",
    services: ["Jardin", "Piscine", "Vue sur mer", "Espace couvert"],
    zone: "Saly",
    phone: "+221 76 555 66 77",
    whatsapp: "+221 76 555 66 77",
    priceRange: "800 000 FCFA / jour",
    gallery: [],
    rating: 4.8,
    isPlatformProvider: true,
  },

  // SÉCURITÉ
  {
    id: "prov-009",
    name: "Elite Security",
    category: "Sécurité",
    description: "Agence de sécurité professionnelle spécialisée dans le contrôle d'accès événementiel.",
    services: ["Agents de sécurité", "Hôtesses d'accueil", "Contrôle d'accès VIP"],
    zone: "Dakar",
    phone: "+221 77 999 11 22",
    whatsapp: "+221 77 999 11 22",
    priceRange: "À partir de 25 000 FCFA / agent",
    gallery: [],
    rating: 4.7,
    isPlatformProvider: true,
  },

  // BEAUTÉ
  {
    id: "prov-010",
    name: "Sublime Beauty",
    category: "Coiffeurs / maquilleurs",
    description: "Maquillage professionnel et coiffure pour mariées et invités.",
    services: ["Maquillage mariée", "Coiffure", "Soin du visage", "Déplacement à domicile"],
    zone: "Dakar",
    phone: "+221 70 444 33 22",
    whatsapp: "+221 70 444 33 22",
    priceRange: "Pack mariée à partir de 150 000 FCFA",
    gallery: [],
    rating: 4.9,
    isPlatformProvider: true,
  },

  // ANIMATION / DJ
  {
    id: "prov-011",
    name: "DJ Vibes",
    category: "DJ / Animation",
    description: "Animation musicale tous genres pour enflammer vos soirées.",
    services: ["Mix Live", "Sonorisation", "Jeux de lumières", "Machines à fumée"],
    zone: "Sénégal entier",
    phone: "+221 77 555 99 88",
    whatsapp: "+221 77 555 99 88",
    priceRange: "À partir de 200 000 FCFA",
    gallery: [],
    rating: 4.6,
    isPlatformProvider: false,
  }
];
