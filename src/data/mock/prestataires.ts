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

export interface ProviderService {
  id: string;
  nom_service: string;
  description?: string;
  tarif?: number;
  unite_tarif?: string;
  status: "Publié";
  event_types?: string[];
  prestations?: string[];
}

export interface Provider {
  id: string;
  name: string;
  role: string;
  category: ProviderCategory;
  description: string;
  eventTypes: string[];
  prestations: string[];
  country: string;
  region: string;
  quartier?: string;
  zones: string[];
  zone: string;
  phone: string;
  whatsapp: string;
  website?: string | null;
  instagram?: string | null;
  experience?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  priceRange: string;
  gallery: string[];
  rating: number;
  reviews: number;
  isPlatformProvider: boolean;
  services: ProviderService[];
}

export const mockProviders: Provider[] = [
  // ──────────────── SÉNÉGAL ────────────────
  {
    id: "prov-sn-001",
    name: "Photo Event Luxe",
    role: "Photographe de Mariage & Portrait",
    category: "Photographes",
    description: "Spécialiste de la photographie de mariage haut de gamme, éditoriale et lumineuse au Sénégal et à l'international.",
    eventTypes: ["Mariage", "Anniversaire", "Gala & Soirée", "Séminaire", "Baptême"],
    prestations: ["Photographes", "Vidéastes"],
    country: "Sénégal",
    region: "Dakar",
    quartier: "Almadies",
    zones: ["Dakar", "Almadies", "Dakar Plateau", "Saly Portudal"],
    zone: "Almadies, Dakar · Sénégal",
    phone: "+221 77 123 45 67",
    whatsapp: "+221 77 123 45 67",
    instagram: "@photoeventluxe",
    experience: "8 ans d'expérience",
    rating: 4.9,
    reviews: 32,
    priceRange: "À partir de 350 000 FCFA",
    isPlatformProvider: true,
    gallery: [],
    services: [
      {
        id: "srv-001-1",
        nom_service: "Couverture Complète Mariage & Album Luxe",
        description: "Présence continue des préparatifs jusqu'à la fin de soirée, galerie en ligne sécurisée et album premium.",
        tarif: 500000,
        unite_tarif: "Forfait journée",
        status: "Publié",
      },
      {
        id: "srv-001-2",
        nom_service: "Shooting Photo Anniversaire & Célébration",
        description: "Shooting en extérieur ou sur le lieu de réception avec retouches d'art de 50 photos haute résolution.",
        tarif: 150000,
        unite_tarif: "Séance 2h",
        status: "Publié",
      }
    ]
  },
  {
    id: "prov-sn-002",
    name: "Délices & Saveurs Traiteur",
    role: "Traiteur Gastronomique & Cocktail",
    category: "Traiteurs",
    description: "Cuisine gastronomique raffinée alliant saveurs ouest-africaines et haute cuisine internationale pour vos dîners et cocktails.",
    eventTypes: ["Mariage", "Anniversaire", "Gala & Soirée", "Séminaire", "Baptême"],
    prestations: ["Traiteurs", "Pâtissiers"],
    country: "Sénégal",
    region: "Dakar",
    quartier: "Point E",
    zones: ["Dakar", "Point E", "Fann", "Dakar Plateau", "Mermoz"],
    zone: "Point E, Dakar · Sénégal",
    phone: "+221 77 234 56 78",
    whatsapp: "+221 77 234 56 78",
    experience: "12 ans d'expérience",
    rating: 4.8,
    reviews: 45,
    priceRange: "15 000 à 35 000 FCFA / convive",
    isPlatformProvider: true,
    gallery: [],
    services: [
      {
        id: "srv-002-1",
        nom_service: "Menu Dîner de Gala & Mariage 3 Services",
        description: "Entrée raffinée, plat d'exception au choix (viande noble, poisson noble) et dessert signature.",
        tarif: 25000,
        unite_tarif: "Par invité",
        status: "Publié",
      },
      {
        id: "srv-002-2",
        nom_service: "Cocktail Dînatoire Chic & Jus Locaux Premium",
        description: "Assortiment de 12 pièces salées et sucrées avec bar à jus locaux d'exception et service à table.",
        tarif: 18000,
        unite_tarif: "Par invité",
        status: "Publié",
      }
    ]
  },
  {
    id: "prov-sn-003",
    name: "Golden Decor & Scénographie",
    role: "Décoration Florale & Scénographie",
    category: "Décorateurs",
    description: "Transformation sur mesure des espaces événementiels : arches florales spectaculaires, art de la table et jeux d'éclairage féeriques.",
    eventTypes: ["Mariage", "Anniversaire", "Gala & Soirée"],
    prestations: ["Décorateurs", "Fleuristes"],
    country: "Sénégal",
    region: "Dakar",
    quartier: "Mermoz",
    zones: ["Dakar", "Mermoz", "Almadies", "Thiès & Petite-Côte", "Saly Portudal"],
    zone: "Mermoz, Dakar · Sénégal",
    phone: "+221 78 345 67 89",
    whatsapp: "+221 78 345 67 89",
    experience: "7 ans d'expérience",
    rating: 5.0,
    reviews: 28,
    priceRange: "Sur devis (dès 400 000 FCFA)",
    isPlatformProvider: true,
    gallery: [],
    services: [
      {
        id: "srv-003-1",
        nom_service: "Scénographie Complète Salle & Table d'Honneur",
        description: "Arche monumentale, habillage lumières architecturales, centres de table fleuris et art de la table d'or.",
        tarif: 850000,
        unite_tarif: "Forfait événement",
        status: "Publié",
      }
    ]
  },
  {
    id: "prov-sn-004",
    name: "Le Palais des Vents",
    role: "Salle de Réception & Domaine Événementiel",
    category: "Salles de réception",
    description: "Espace moderne et climatisé de 600 places assises avec jardin paysager, parking sécurisé et loges privatives.",
    eventTypes: ["Mariage", "Anniversaire", "Gala & Soirée", "Séminaire"],
    prestations: ["Salles de réception"],
    country: "Sénégal",
    region: "Dakar",
    quartier: "Diamniadio",
    zones: ["Dakar", "Diamniadio", "Rufisque", "Lac Rose"],
    zone: "Diamniadio, Dakar · Sénégal",
    phone: "+221 33 820 00 00",
    whatsapp: "+221 77 456 78 90",
    experience: "5 ans d'expérience",
    rating: 4.9,
    reviews: 19,
    priceRange: "1 500 000 FCFA / jour",
    isPlatformProvider: true,
    gallery: [],
    services: [
      {
        id: "srv-004-1",
        nom_service: "Location Grande Salle Climatisée & Espaces Extérieurs",
        description: "Accès de 10h à 04h du matin, groupe électrogène de secours, agents d'entretien et sécurité inclus.",
        tarif: 1500000,
        unite_tarif: "Par journée",
        status: "Publié",
      }
    ]
  },
  {
    id: "prov-sn-005",
    name: "DJ Vibes Animation",
    role: "DJ Professionnel & Sonorisation",
    category: "DJ / Animation",
    description: "Animation musicale festive tous styles (Afrobeats, Mbalax, R&B, Pop, House) avec sonorisation JBL et lumières robotisées.",
    eventTypes: ["Mariage", "Anniversaire", "Gala & Soirée", "Séminaire"],
    prestations: ["DJ / Animation"],
    country: "Sénégal",
    region: "Dakar",
    quartier: "Ouakam",
    zones: ["Dakar", "Ouakam", "Yoff", "Saly Portudal"],
    zone: "Ouakam, Dakar · Sénégal",
    phone: "+221 77 567 89 01",
    whatsapp: "+221 77 567 89 01",
    experience: "10 ans d'expérience",
    rating: 4.8,
    reviews: 37,
    priceRange: "À partir de 250 000 FCFA",
    isPlatformProvider: true,
    gallery: [],
    services: [
      {
        id: "srv-005-1",
        nom_service: "Pack Soirée Complète DJ & Son & Lumières",
        description: "Régie complète, micro sans fil pour discours, mix personnalisé selon les souhaits des hôtes.",
        tarif: 300000,
        unite_tarif: "Prestation complète",
        status: "Publié",
      }
    ]
  },
  {
    id: "prov-sn-006",
    name: "Elite Security VIP",
    role: "Sécurité & Contrôle d'Accès Événementiel",
    category: "Sécurité",
    description: "Agents de sécurité assermentés, hôtesses d'accueil VIP et gestion des flux d'invités pour vos réceptions sereines.",
    eventTypes: ["Mariage", "Anniversaire", "Gala & Soirée", "Séminaire"],
    prestations: ["Sécurité"],
    country: "Sénégal",
    region: "Dakar",
    quartier: "Dakar Plateau",
    zones: ["Dakar", "Dakar Plateau", "Fann", "Almadies"],
    zone: "Dakar Plateau · Sénégal",
    phone: "+221 77 678 90 12",
    whatsapp: "+221 77 678 90 12",
    experience: "14 ans d'expérience",
    rating: 4.9,
    reviews: 22,
    priceRange: "25 000 FCFA / agent",
    isPlatformProvider: true,
    gallery: [],
    services: [
      {
        id: "srv-006-1",
        nom_service: "Dispositif Sécurité & Hôtesses d'Accueil (Pack 4 agents)",
        description: "2 agents aux portes de filtrage, 2 agents en patrouille salle et accueil VIP des convives.",
        tarif: 120000,
        unite_tarif: "Forfait soirée",
        status: "Publié",
      }
    ]
  },
  {
    id: "prov-sn-007",
    name: "Sublime Beauty & Coiffure",
    role: "Maquillage Mariée & Coiffure Haute Couture",
    category: "Coiffeurs / maquilleurs",
    description: "Mise en beauté professionnelle pour mariées, demoiselles d'honneur et anniversaires d'exception avec déplacement.",
    eventTypes: ["Mariage", "Anniversaire", "Gala & Soirée"],
    prestations: ["Coiffeurs / maquilleurs"],
    country: "Sénégal",
    region: "Dakar",
    quartier: "Ngor",
    zones: ["Dakar", "Ngor", "Almadies", "Mermoz"],
    zone: "Ngor / Almadies, Dakar · Sénégal",
    phone: "+221 70 789 01 23",
    whatsapp: "+221 70 789 01 23",
    experience: "6 ans d'expérience",
    rating: 4.9,
    reviews: 41,
    priceRange: "À partir de 150 000 FCFA",
    isPlatformProvider: true,
    gallery: [],
    services: [
      {
        id: "srv-007-1",
        nom_service: "Pack Mariée Prestige (Essai + Jour J)",
        description: "Maquillage HD waterproof longue tenue, coiffure stylisée, pose cils et kit retouche complet.",
        tarif: 180000,
        unite_tarif: "Forfait mariée",
        status: "Publié",
      }
    ]
  },

  // ──────────────── CÔTE D'IVOIRE ────────────────
  {
    id: "prov-ci-001",
    name: "Ivoire Prestige Réceptions",
    role: "Traiteur Gastronomique & Dîner de Gala",
    category: "Traiteurs",
    description: "Haute gastronomie ivoirienne et internationale pour des mariages prestigieux et des dîners de gala à Abidjan et Grand-Bassam.",
    eventTypes: ["Mariage", "Anniversaire", "Gala & Soirée", "Séminaire"],
    prestations: ["Traiteurs", "Pâtissiers"],
    country: "Côte d'Ivoire",
    region: "Abidjan (District)",
    quartier: "Cocody",
    zones: ["Abidjan (District)", "Cocody", "Riviera", "Deux Plateaux", "Plateau"],
    zone: "Cocody, Abidjan · Côte d'Ivoire",
    phone: "+225 07 11 22 33 44",
    whatsapp: "+225 07 11 22 33 44",
    experience: "11 ans d'expérience",
    rating: 4.9,
    reviews: 35,
    priceRange: "20 000 à 45 000 FCFA / convive",
    isPlatformProvider: true,
    gallery: [],
    services: [
      {
        id: "srv-ci-001-1",
        nom_service: "Banquet Prestige Ivoire & Saveurs du Monde",
        description: "Cocktail d'accueil au champagne, menu gastronomique 3 temps et service gants blancs.",
        tarif: 30000,
        unite_tarif: "Par invité",
        status: "Publié",
      }
    ]
  },
  {
    id: "prov-ci-002",
    name: "Aura Événements & Design",
    role: "Décoration Grand Luxe & Scénographie",
    category: "Décorateurs",
    description: "Conception florale spectaculaire, plafonds scintillants et mobilier design pour des réceptions d'exception à Abidjan.",
    eventTypes: ["Mariage", "Anniversaire", "Gala & Soirée"],
    prestations: ["Décorateurs", "Fleuristes"],
    country: "Côte d'Ivoire",
    region: "Abidjan (District)",
    quartier: "Deux Plateaux",
    zones: ["Abidjan (District)", "Deux Plateaux", "Cocody", "Angré"],
    zone: "Deux Plateaux, Abidjan · Côte d'Ivoire",
    phone: "+225 05 22 33 44 55",
    whatsapp: "+225 05 22 33 44 55",
    experience: "9 ans d'expérience",
    rating: 5.0,
    reviews: 26,
    priceRange: "Sur devis",
    isPlatformProvider: true,
    gallery: [],
    services: [
      {
        id: "srv-ci-002-1",
        nom_service: "Décoration Scénique & Florale Majestueuse",
        description: "Mise en scène complète du lieu de réception avec fleurs fraîches importées et effets lumineux.",
        tarif: 1200000,
        unite_tarif: "Forfait mariage",
        status: "Publié",
      }
    ]
  },
  {
    id: "prov-ci-003",
    name: "Studio Lumière Abidjan",
    role: "Photographe & Captation Cinématique",
    category: "Photographes",
    description: "Équipe de photographes et cadreurs cinéma pour capturer l'émotion de vos événements avec authenticité et élégance.",
    eventTypes: ["Mariage", "Anniversaire", "Gala & Soirée", "Séminaire"],
    prestations: ["Photographes", "Vidéastes"],
    country: "Côte d'Ivoire",
    region: "Abidjan (District)",
    quartier: "Marcory",
    zones: ["Abidjan (District)", "Marcory", "Zone 4", "Biétry"],
    zone: "Marcory / Zone 4, Abidjan · Côte d'Ivoire",
    phone: "+225 01 33 44 55 66",
    whatsapp: "+225 01 33 44 55 66",
    experience: "7 ans d'expérience",
    rating: 4.8,
    reviews: 29,
    priceRange: "À partir de 400 000 FCFA",
    isPlatformProvider: true,
    gallery: [],
    services: [
      {
        id: "srv-ci-003-1",
        nom_service: "Film Cinématique 4K & Album Prestige",
        description: "Film teaser 3 min, film long métrage 45 min avec prises de vue drone et album d'art.",
        tarif: 650000,
        unite_tarif: "Forfait journée",
        status: "Publié",
      }
    ]
  },

  // ──────────────── FRANCE ────────────────
  {
    id: "prov-fr-001",
    name: "Lumière & Style Paris",
    role: "Photographe de Mariage & Réceptions Privées",
    category: "Photographes",
    description: "Photographie de mariage et célébrations privées d'exception à Paris, en Île-de-France et en Côte d'Azur.",
    eventTypes: ["Mariage", "Anniversaire", "Gala & Soirée"],
    prestations: ["Photographes"],
    country: "France",
    region: "Île-de-France (Paris)",
    quartier: "Paris Centre (1er-4e)",
    zones: ["Île-de-France (Paris)", "Paris Centre (1er-4e)", "Paris Triangle d'Or (8e-16e)", "Neuilly-sur-Seine"],
    zone: "Paris Centre · France",
    phone: "+33 6 12 34 56 78",
    whatsapp: "+33 6 12 34 56 78",
    experience: "10 ans d'expérience",
    rating: 5.0,
    reviews: 48,
    priceRange: "À partir de 1 200 €",
    isPlatformProvider: true,
    gallery: [],
    services: [
      {
        id: "srv-fr-001-1",
        nom_service: "Reportage Photo Complet Mariage d'Exception",
        description: "Des préparatifs jusqu'à la pièce montée, galerie privée en ligne et livre d'art relié cuir.",
        tarif: 1500000,
        unite_tarif: "Forfait journée",
        status: "Publié",
      }
    ]
  },
  {
    id: "prov-fr-002",
    name: "Saveurs d'Excellence Paris",
    role: "Traiteur Événementiel & Cocktails Haute Couture",
    category: "Traiteurs",
    description: "Gastronomie française raffinée et cuisine du monde sublimée pour vos réceptions d'entreprise et événements privés à Paris.",
    eventTypes: ["Mariage", "Anniversaire", "Gala & Soirée", "Séminaire"],
    prestations: ["Traiteurs", "Pâtissiers"],
    country: "France",
    region: "Île-de-France (Paris)",
    quartier: "Neuilly-sur-Seine",
    zones: ["Île-de-France (Paris)", "Neuilly-sur-Seine", "Boulogne-Billancourt", "Versailles"],
    zone: "Neuilly / Paris · France",
    phone: "+33 1 45 67 89 00",
    whatsapp: "+33 6 23 45 67 89",
    experience: "15 ans d'expérience",
    rating: 4.9,
    reviews: 52,
    priceRange: "80 € à 160 € / convive",
    isPlatformProvider: true,
    gallery: [],
    services: [
      {
        id: "srv-fr-002-1",
        nom_service: "Menu Dégustation Gastronomique Événementiel",
        description: "Cocktail apéritif, entrée de saison, plat signature et buffet de douceurs maison.",
        tarif: 75000,
        unite_tarif: "Par convive",
        status: "Publié",
      }
    ]
  }
];
