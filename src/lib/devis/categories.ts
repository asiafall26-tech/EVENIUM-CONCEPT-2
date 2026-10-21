import type { PricingModeId } from "./pricing";

/**
 * Référentiel des 15 catégories de prestataires Evenium :
 * services proposés dans la liste déroulante, champs spécifiques du devis et modes de calcul.
 */

export type FieldType = "text" | "textarea" | "number" | "select" | "multiselect" | "boolean" | "date";

export interface CategoryField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  /** Suffixe affiché après un nombre (heures, m², personnes…) */
  suffix?: string;
  /** N'afficher le champ que si un autre champ a cette valeur (ou l'une de ces valeurs) */
  showWhen?: { key: string; equals: string | boolean | (string | boolean)[] };
  /** Pré-remplissage à partir de la demande du client */
  prefill?: "guests" | "quantity" | "date" | "location";
}

export interface ProviderCategory {
  id: string;
  label: string;
  /** Mode de calcul proposé par défaut pour une nouvelle ligne */
  defaultPricing: PricingModeId;
  /** Modes de calcul pertinents pour ce métier (le forfait reste toujours disponible) */
  pricingModes: PricingModeId[];
  services: string[];
  fields: CategoryField[];
  /** Anciennes valeurs de profiles.category reconnues comme cette catégorie */
  aliases: string[];
}

const YES_NO = ["Oui", "Non"];

export const PROVIDER_CATEGORIES: ProviderCategory[] = [
  {
    id: "organisation",
    label: "Organisation et coordination événementielle",
    defaultPricing: "forfait",
    pricingModes: ["forfait", "journalier", "par_personne", "horaire"],
    aliases: ["organisat", "coordinat", "planner", "wedding"],
    services: [
      "Organisation complète de mariage",
      "Coordination du jour J",
      "Organisation de baptême",
      "Organisation de henné time",
      "Organisation de dot / mariage coutumier",
      "Organisation de fiançailles",
      "Organisation d'anniversaire",
      "Organisation de baby shower",
      "Organisation d'EVJF",
      "Organisation de Yendou",
      "Organisation de gala",
      "Organisation de séminaire / conférence",
      "Organisation de soirée d'entreprise",
      "Organisation de réception / dîner",
      "Gestion des prestataires",
      "Accueil et gestion des invités",
      "Gestion du protocole",
      "Planification et rétroplanning",
      "Conseil et accompagnement à la carte",
    ],
    fields: [
      { key: "accompagnement", label: "Type d'accompagnement", type: "select", options: ["Organisation complète", "Organisation partielle", "Coordination du jour J", "Conseil à la carte"] },
      { key: "nb_invites", label: "Nombre d'invités", type: "number", suffix: "invités", prefill: "guests" },
      { key: "duree_preparation", label: "Durée de préparation", type: "select", options: ["Moins d'1 mois", "1 à 3 mois", "3 à 6 mois", "6 mois à 1 an", "Plus d'1 an"] },
      { key: "prestations_incluses", label: "Prestations incluses", type: "multiselect", options: ["Recherche du lieu", "Sélection des prestataires", "Gestion du budget", "Rétroplanning", "Gestion des invités / RSVP", "Plan de table", "Protocole", "Gestion des cadeaux", "Coordination le jour J"] },
      { key: "presence_jour_j", label: "Présence le jour J", type: "select", options: YES_NO },
      { key: "nb_coordinateurs", label: "Nombre de coordinateurs sur place", type: "number", suffix: "personnes", showWhen: { key: "presence_jour_j", equals: "Oui" } },
    ],
  },
  {
    id: "decoration",
    label: "Décoration et scénographie",
    defaultPricing: "unitaire",
    pricingModes: ["forfait", "unitaire"],
    aliases: ["décorat", "decorat", "scénograph", "scenograph", "fleur", "florist"],
    services: [
      "Décoration de mariage",
      "Décoration de baptême",
      "Décoration de henné",
      "Décoration de dot",
      "Décoration de Yendou",
      "Décoration d'anniversaire",
      "Décoration de baby shower",
      "Décoration de fiançailles",
      "Décoration de gala / soirée",
      "Décoration florale",
      "Décoration de salle",
      "Décoration de table",
      "Décoration de cérémonie traditionnelle",
      "Décoration de cérémonie religieuse",
      "Arche et photobooth",
      "Estrade / trône des mariés",
      "Ciel de salle et drapés",
      "Ballons et arches de ballons",
      "Centres de table",
      "Scénographie événementielle",
      "Installation et démontage",
    ],
    fields: [
      { key: "type_decoration", label: "Type de décoration", type: "select", options: ["Moderne", "Traditionnelle", "Bohème / champêtre", "Luxe / royale", "Florale", "Minimaliste", "Thématique"] },
      { key: "theme", label: "Thème", type: "text", placeholder: "Ex : Royal Wolof, Mille et une nuits, Jardin d'Éden…" },
      { key: "couleurs", label: "Couleurs", type: "text", placeholder: "Ex : blanc, or et bordeaux" },
      { key: "espaces", label: "Espaces à décorer", type: "multiselect", options: ["Entrée", "Salle de réception", "Tables des invités", "Table d'honneur", "Estrade / trône", "Scène", "Extérieur / jardin", "Espace photo", "Lieu de cérémonie"] },
      { key: "dimensions", label: "Dimensions / surface", type: "text", placeholder: "Ex : 400 m², 30 tables de 10" },
      { key: "elements", label: "Éléments décoratifs", type: "multiselect", options: ["Fleurs naturelles", "Fleurs artificielles", "Drapés / tentures", "Ciel de salle", "Lustres / bougies", "Ballons", "Tapis", "Housses de chaises", "Nappes et chemins de table", "Arche", "Lettres lumineuses"] },
      { key: "installation", label: "Installation et démontage", type: "select", options: ["Inclus", "En supplément", "Non concerné"] },
    ],
  },
  {
    id: "traiteur",
    label: "Traiteurs et restauration",
    defaultPricing: "par_personne",
    pricingModes: ["par_personne", "forfait", "unitaire"],
    aliases: ["traiteur", "restaura", "cuisin", "catering"],
    services: [
      "Buffet traditionnel",
      "Buffet international",
      "Buffet mixte (africain et international)",
      "Service à table",
      "Cocktail dînatoire",
      "Cocktail de bienvenue",
      "Pause-café",
      "Petit-déjeuner / brunch",
      "Dîner de gala",
      "Préparation de repas à domicile",
      "Service de boissons",
      "Bar à jus locaux (bissap, bouye, gingembre)",
      "Dibi / grillades",
      "Méchoui",
      "Thiéboudienne / plats sénégalais",
      "Attiéké-poisson / plats ivoiriens",
      "Menu du Yendou",
      "Traiteur de mariage",
      "Traiteur de baptême",
      "Plateaux-repas",
      "Location de vaisselle",
    ],
    fields: [
      { key: "type_menu", label: "Type de menu", type: "select", options: ["Africain / local", "International", "Mixte", "Végétarien", "Personnalisé"] },
      { key: "nb_personnes", label: "Nombre de personnes", type: "number", suffix: "personnes", prefill: "guests" },
      { key: "nb_plats", label: "Nombre de plats", type: "select", options: ["Plat unique", "Entrée + plat", "Plat + dessert", "Entrée + plat + dessert", "Buffet à volonté"] },
      { key: "formule_service", label: "Formule de service", type: "select", options: ["Buffet", "Service à table", "Cocktail", "Livraison seule", "Mixte"] },
      { key: "boissons", label: "Boissons", type: "multiselect", options: ["Eau", "Jus locaux", "Sodas", "Café / thé (ataya)", "Boissons alcoolisées", "Non incluses"] },
      { key: "besoins_alimentaires", label: "Besoins alimentaires particuliers", type: "textarea", placeholder: "Halal, sans porc, végétarien, allergies…" },
      { key: "personnel_service", label: "Personnel de service", type: "select", options: ["Inclus", "En supplément", "Non"] },
    ],
  },
  {
    id: "patisserie",
    label: "Pâtisserie et gourmandises",
    defaultPricing: "unitaire",
    pricingModes: ["unitaire", "forfait", "par_personne"],
    aliases: ["pâtiss", "patiss", "cake", "gâteau", "gateau", "gourmand", "confiser"],
    services: [
      "Wedding cake / pièce montée",
      "Gâteau d'anniversaire",
      "Gâteau de baptême",
      "Gâteau personnalisé / design",
      "Number cake / letter cake",
      "Cupcakes",
      "Mignardises et petits fours",
      "Macarons",
      "Bar à desserts / Sweet table",
      "Candy bar",
      "Beignets / pastels / fataya",
      "Thiakry / desserts locaux",
      "Biscuits personnalisés",
      "Chocolats et dragées",
      "Gâteau de fiançailles",
    ],
    fields: [
      { key: "type_gateau", label: "Type de gâteau", type: "select", options: ["Pièce montée", "Gâteau à étages", "Number / letter cake", "Layer cake", "Gâteau sculpté", "Assortiment de douceurs"] },
      { key: "nb_parts", label: "Nombre de parts", type: "number", suffix: "parts", prefill: "guests" },
      { key: "parfums", label: "Parfums", type: "text", placeholder: "Ex : vanille, chocolat, bissap, coco…" },
      { key: "dimensions", label: "Dimensions / nombre d'étages", type: "text", placeholder: "Ex : 4 étages, 30 cm de diamètre" },
      { key: "decoration", label: "Décoration", type: "select", options: ["Pâte à sucre", "Crème au beurre", "Fleurs fraîches", "Fruits", "Feuille d'or", "Minimaliste"] },
      { key: "personnalisation", label: "Personnalisation", type: "text", placeholder: "Prénoms, topper, logo, photo comestible…" },
      { key: "livraison", label: "Livraison", type: "select", options: ["Retrait en boutique", "Livraison incluse", "Livraison en supplément", "Livraison et installation"] },
    ],
  },
  {
    id: "tenues",
    label: "Tenues et accessoires de cérémonie",
    defaultPricing: "unitaire",
    pricingModes: ["unitaire", "forfait", "location"],
    aliases: ["tenue", "couture", "couturi", "styl", "robe", "tailleur", "bijou", "accessoire", "mode"],
    services: [
      "Robe de mariée",
      "Costume du marié",
      "Grand boubou / bazin",
      "Tenues traditionnelles (wax, kente, pagne tissé)",
      "Tenues assorties de la famille",
      "Tenues des demoiselles d'honneur",
      "Tenue de henné",
      "Tenue de baptême",
      "Tenue de soirée / gala",
      "Location de robe",
      "Location de costume",
      "Retouches",
      "Voile, foulard et attaches",
      "Bijoux et parures",
      "Chaussures et sacs",
      "Accessoires de cérémonie",
    ],
    fields: [
      { key: "type_tenue", label: "Type de tenue", type: "select", options: ["Robe de mariée", "Costume", "Tenue traditionnelle", "Tenue de soirée", "Tenue d'enfant", "Accessoires"] },
      { key: "modele", label: "Modèle", type: "text", placeholder: "Description ou référence du modèle" },
      { key: "tissu", label: "Tissu", type: "text", placeholder: "Ex : bazin riche, wax, kente, dentelle, satin…" },
      { key: "taille", label: "Taille(s)", type: "text", placeholder: "Ex : 38, M, sur mesure" },
      { key: "quantite", label: "Quantité", type: "number", suffix: "tenues", prefill: "quantity" },
      { key: "mode", label: "Confection ou location", type: "select", options: ["Confection sur mesure", "Location", "Vente prêt-à-porter"] },
      { key: "essayages", label: "Nombre d'essayages", type: "number", suffix: "essayages", showWhen: { key: "mode", equals: ["Confection sur mesure", "Location"] } },
      { key: "date_livraison", label: "Date de livraison", type: "date" },
    ],
  },
  {
    id: "beaute",
    label: "Beauté et mise en beauté",
    defaultPricing: "par_personne",
    pricingModes: ["par_personne", "forfait", "horaire"],
    aliases: ["beaut", "maquill", "coiff", "make", "esthéti", "estheti", "henné", "henne", "ongle"],
    services: [
      "Maquillage de la mariée",
      "Coiffure de la mariée",
      "Forfait mariée (maquillage + coiffure)",
      "Maquillage des invitées",
      "Coiffure des invitées",
      "Pose de henné (mains et pieds)",
      "Tresses et coiffures africaines",
      "Pose de perruque",
      "Attache de foulard / musoor",
      "Manucure et pédicure",
      "Pose d'ongles",
      "Soins du visage",
      "Maquillage de soirée / gala",
      "Mise en beauté du marié",
      "Essai maquillage / coiffure",
    ],
    fields: [
      { key: "type_prestation", label: "Type de prestation", type: "multiselect", options: ["Maquillage", "Coiffure", "Henné", "Ongles", "Soins", "Attache de foulard"] },
      { key: "nb_personnes", label: "Nombre de personnes", type: "number", suffix: "personnes", prefill: "quantity" },
      { key: "lieu", label: "Lieu de la prestation", type: "select", options: ["À domicile", "À l'hôtel", "En salon", "Sur le lieu de l'événement"] },
      { key: "duree", label: "Durée estimée", type: "number", suffix: "heures" },
      { key: "deplacement", label: "Déplacement", type: "select", options: ["Inclus", "En supplément", "Non concerné"] },
      { key: "essai", label: "Essai préalable", type: "select", options: ["Inclus", "En supplément", "Non prévu"] },
    ],
  },
  {
    id: "photo_video",
    label: "Photographie et vidéographie",
    defaultPricing: "forfait",
    pricingModes: ["forfait", "horaire", "journalier"],
    aliases: ["photo", "vidéo", "video", "vidéast", "videast", "film", "drone", "camera"],
    services: [
      "Photographie de mariage",
      "Photographie de baptême",
      "Photographie d'anniversaire",
      "Photographie de henné time",
      "Photographie de Yendou",
      "Photographie professionnelle / corporate",
      "Vidéo événementielle",
      "Film de mariage",
      "Teaser / bande-annonce",
      "Montage vidéo",
      "Séance photo",
      "Séance photo pré-mariage",
      "Couverture complète d'événement",
      "Prises de vue par drone",
      "Photobooth / borne photo",
      "Diffusion en direct (live)",
      "Album photo imprimé",
    ],
    fields: [
      { key: "type_couverture", label: "Type de couverture", type: "select", options: ["Photo", "Vidéo", "Photo + vidéo", "Séance photo"] },
      { key: "nb_heures", label: "Nombre d'heures de couverture", type: "number", suffix: "heures" },
      { key: "nb_photographes", label: "Nombre de photographes / vidéastes", type: "number", suffix: "personnes" },
      { key: "nb_videos", label: "Nombre de vidéos", type: "number", suffix: "vidéos", showWhen: { key: "type_couverture", equals: ["Vidéo", "Photo + vidéo"] } },
      { key: "retouches", label: "Retouches", type: "select", options: ["Retouches basiques", "Retouches avancées", "Aucune"] },
      { key: "livrables", label: "Livrables", type: "multiselect", options: ["Photos HD numériques", "Galerie en ligne", "Clé USB", "Album imprimé", "Film long", "Teaser", "Vidéo réseaux sociaux"] },
      { key: "delai_livraison", label: "Délai de livraison", type: "select", options: ["1 semaine", "2 semaines", "1 mois", "2 mois", "Plus de 2 mois"] },
    ],
  },
  {
    id: "musique",
    label: "Musique et animation",
    defaultPricing: "forfait",
    pricingModes: ["forfait", "horaire"],
    aliases: ["dj", "musique", "animat", "orchestre", "artist", "groupe", "griot", "chanteu", "danse", "spectacle"],
    services: [
      "DJ",
      "Animateur / maître de cérémonie (MC)",
      "Orchestre live",
      "Groupe de musique traditionnelle",
      "Sabar / percussions",
      "Griot / griotte",
      "Chorale",
      "Chanteur / chanteuse",
      "Danseurs",
      "Animation pour enfants",
      "Humoriste",
      "Spectacle / show",
      "Karaoké",
      "Musique d'ambiance (cocktail)",
      "Joueur de kora / balafon",
    ],
    fields: [
      { key: "type_animation", label: "Type d'animation", type: "select", options: ["DJ", "MC / animateur", "Live / orchestre", "Traditionnelle", "Spectacle", "Mixte"] },
      { key: "duree", label: "Durée", type: "number", suffix: "heures" },
      { key: "nb_intervenants", label: "Nombre d'intervenants", type: "number", suffix: "personnes" },
      { key: "equipements", label: "Équipements nécessaires", type: "multiselect", options: ["Sonorisation", "Micros", "Éclairage", "Scène", "Fournis par le prestataire", "Fournis par le client"] },
      { key: "horaires", label: "Horaires", type: "text", placeholder: "Ex : 20h00 – 02h00" },
    ],
  },
  {
    id: "lieux",
    label: "Lieux de réception et hébergement",
    defaultPricing: "journalier",
    pricingModes: ["journalier", "forfait", "horaire", "par_personne"],
    aliases: ["lieu", "salle", "réception", "reception", "héberg", "heberg", "hôtel", "hotel", "villa", "domaine", "jardin"],
    services: [
      "Location de salle de réception",
      "Location de jardin / espace extérieur",
      "Location de villa",
      "Location de terrasse / rooftop",
      "Location de salle de conférence",
      "Location de plage privée",
      "Location de chapiteau",
      "Location de cour pour cérémonie traditionnelle",
      "Hébergement des invités",
      "Suite nuptiale",
      "Forfait jour J (lieu + nuitée)",
      "Location d'espace de restauration",
    ],
    fields: [
      { key: "type_espace", label: "Type d'espace", type: "select", options: ["Salle", "Jardin", "Villa", "Terrasse / rooftop", "Plage", "Hôtel", "Chapiteau"] },
      { key: "capacite", label: "Capacité", type: "number", suffix: "personnes", prefill: "guests" },
      { key: "duree_location", label: "Durée de location", type: "select", options: ["Demi-journée", "Journée", "Soirée", "Week-end", "Plusieurs jours"] },
      { key: "equipements", label: "Équipements inclus", type: "multiselect", options: ["Tables et chaises", "Climatisation", "Sonorisation", "Éclairage", "Cuisine", "Parking", "Groupe électrogène", "Toilettes", "Vestiaire / loge"] },
      { key: "horaires", label: "Horaires", type: "text", placeholder: "Ex : de 14h à 2h du matin" },
      { key: "hebergement", label: "Hébergement", type: "select", options: YES_NO },
      { key: "nb_chambres", label: "Nombre de chambres", type: "number", suffix: "chambres", showWhen: { key: "hebergement", equals: "Oui" } },
      { key: "caution", label: "Caution demandée", type: "select", options: YES_NO },
    ],
  },
  {
    id: "location_materiel",
    label: "Location de matériel et mobilier",
    defaultPricing: "location",
    pricingModes: ["location", "unitaire", "forfait"],
    aliases: ["mobilier", "matériel", "materiel", "location", "loueur", "chaise", "bâche", "bache", "tente"],
    services: [
      "Location de chaises",
      "Location de chaises Napoléon / Chiavari",
      "Location de tables",
      "Location de nappes et housses",
      "Location de bâches / tentes / chapiteaux",
      "Location de vaisselle et verrerie",
      "Location de mobilier lounge",
      "Location de trône / fauteuils des mariés",
      "Location de tapis",
      "Location de podium / estrade",
      "Location de groupe électrogène",
      "Location de ventilateurs / climatiseurs",
      "Location de matériel de cuisine",
      "Location de barrières et poteaux",
    ],
    fields: [
      { key: "type_materiel", label: "Type de matériel", type: "multiselect", options: ["Chaises", "Tables", "Nappes / housses", "Tentes / bâches", "Vaisselle", "Mobilier lounge", "Podium", "Électricité", "Climatisation / ventilation"] },
      { key: "quantite", label: "Quantité totale", type: "number", suffix: "pièces", prefill: "quantity" },
      { key: "duree_location", label: "Durée de location", type: "number", suffix: "jours" },
      { key: "livraison", label: "Livraison", type: "select", options: ["Incluse", "En supplément", "Retrait par le client"] },
      { key: "installation", label: "Installation", type: "select", options: ["Incluse", "En supplément", "Non"] },
      { key: "recuperation", label: "Récupération", type: "select", options: ["Incluse", "En supplément", "Retour par le client"] },
      { key: "caution", label: "Caution demandée", type: "select", options: YES_NO },
    ],
  },
  {
    id: "sono_audiovisuel",
    label: "Sonorisation, éclairage et audiovisuel",
    defaultPricing: "forfait",
    pricingModes: ["forfait", "location", "journalier", "personnel"],
    aliases: ["sono", "éclairage", "eclairage", "lumière", "lumiere", "audiovisuel", "écran", "ecran", "technique"],
    services: [
      "Sonorisation complète",
      "Sonorisation de cérémonie",
      "Éclairage d'ambiance",
      "Éclairage scénique",
      "Écran LED géant",
      "Vidéoprojecteur et écran",
      "Micros sans fil",
      "Effets spéciaux (fumée lourde, étincelles froides)",
      "Mapping vidéo",
      "Captation et retransmission",
      "Interprétation simultanée (cabines, casques)",
      "Scène et structure",
      "Technicien son et lumière",
    ],
    fields: [
      { key: "equipements", label: "Équipements", type: "multiselect", options: ["Enceintes", "Table de mixage", "Micros", "Projecteurs / lyres", "Écran LED", "Vidéoprojecteur", "Machine à fumée", "Étincelles froides", "Structure / truss"] },
      { key: "quantites", label: "Quantités", type: "text", placeholder: "Ex : 4 enceintes, 2 micros HF, 12 projecteurs" },
      { key: "caracteristiques", label: "Puissance ou caractéristiques techniques", type: "text", placeholder: "Ex : 5 000 W, écran 4×3 m" },
      { key: "duree", label: "Durée", type: "number", suffix: "heures" },
      { key: "installation", label: "Installation", type: "select", options: ["Incluse", "En supplément"] },
      { key: "nb_techniciens", label: "Nombre de techniciens", type: "number", suffix: "techniciens" },
    ],
  },
  {
    id: "papeterie",
    label: "Papeterie et cadeaux",
    defaultPricing: "unitaire",
    pricingModes: ["unitaire", "forfait"],
    aliases: ["papeterie", "imprim", "faire-part", "cadeau", "souvenir", "graphi", "design", "carte"],
    services: [
      "Faire-part imprimés",
      "Cartes d'invitation",
      "Menus personnalisés",
      "Marque-places et plan de table",
      "Livre d'or",
      "Programme de cérémonie",
      "Signalétique / panneaux de bienvenue",
      "Cadeaux invités",
      "Coffrets cadeaux personnalisés",
      "Pagnes / tissus personnalisés",
      "Éventails personnalisés",
      "Sacs personnalisés",
      "Dragées et boîtes à dragées",
      "Étiquettes et stickers",
      "Goodies d'entreprise",
    ],
    fields: [
      { key: "type_produit", label: "Type de produit", type: "select", options: ["Faire-part / invitations", "Menus", "Signalétique", "Cadeaux invités", "Coffrets", "Textile personnalisé", "Goodies"] },
      { key: "format", label: "Format", type: "text", placeholder: "Ex : A5, carré 15×15, pochette" },
      { key: "dimensions", label: "Dimensions", type: "text", placeholder: "Ex : 148 × 210 mm" },
      { key: "quantite", label: "Quantité", type: "number", suffix: "exemplaires", prefill: "guests" },
      { key: "personnalisation", label: "Personnalisation", type: "text", placeholder: "Prénoms, date, logo, photo…" },
      { key: "materiau", label: "Matériau", type: "text", placeholder: "Ex : papier 350 g, kraft, acrylique, wax" },
      { key: "delai_production", label: "Délai de production", type: "select", options: ["Moins d'1 semaine", "1 à 2 semaines", "3 à 4 semaines", "Plus d'1 mois"] },
    ],
  },
  {
    id: "transport",
    label: "Transport et cortège",
    defaultPricing: "vehicule",
    pricingModes: ["vehicule", "forfait", "journalier"],
    aliases: ["transport", "véhicul", "vehicul", "voiture", "cortège", "cortege", "limousine", "bus", "chauffeur"],
    services: [
      "Voiture des mariés",
      "Cortège nuptial",
      "Voiture de luxe avec chauffeur",
      "Limousine",
      "Voiture de collection",
      "Minibus / navette des invités",
      "Bus / car",
      "Transferts aéroport",
      "Moto escorte",
      "Calèche",
      "Décoration de véhicule",
      "Location de véhicule sans chauffeur",
    ],
    fields: [
      { key: "type_vehicule", label: "Type de véhicule", type: "select", options: ["Berline de luxe", "SUV / 4x4", "Limousine", "Voiture de collection", "Minibus", "Bus / car", "Moto"] },
      { key: "nb_vehicules", label: "Nombre de véhicules", type: "number", suffix: "véhicules", prefill: "quantity" },
      { key: "trajet", label: "Trajet", type: "textarea", placeholder: "Ex : Domicile → Mairie → Salle de réception" },
      { key: "duree", label: "Durée", type: "select", options: ["Un trajet", "Demi-journée", "Journée", "Plusieurs jours"] },
      { key: "chauffeur", label: "Chauffeur", type: "select", options: ["Inclus", "Sans chauffeur"] },
      { key: "carburant", label: "Carburant", type: "select", options: ["Inclus", "En supplément"] },
      { key: "nb_passagers", label: "Nombre de passagers", type: "number", suffix: "passagers" },
    ],
  },
  {
    id: "personnel",
    label: "Personnel et services événementiels",
    defaultPricing: "personnel",
    pricingModes: ["personnel", "journalier", "forfait"],
    aliases: ["personnel", "hôtesse", "hotesse", "serveur", "sécurit", "securit", "gardien", "agent", "nettoyage", "baby", "nounou", "voiturier"],
    services: [
      "Hôtesses d'accueil",
      "Serveurs / serveuses",
      "Maîtres d'hôtel",
      "Agents de sécurité",
      "Vigiles / gardiennage",
      "Voituriers",
      "Agents de nettoyage",
      "Plongeurs",
      "Barmans",
      "Baby-sitters / animation enfants",
      "Placeurs / protocole",
      "Vestiaire",
      "Agents d'entretien des toilettes",
    ],
    fields: [
      { key: "type_personnel", label: "Type de personnel", type: "multiselect", options: ["Hôtesses", "Serveurs", "Sécurité", "Voituriers", "Nettoyage", "Barmans", "Baby-sitters", "Protocole"] },
      { key: "effectif", label: "Effectif", type: "number", suffix: "agents", prefill: "quantity" },
      { key: "duree_mission", label: "Durée de la mission", type: "number", suffix: "heures" },
      { key: "horaires", label: "Horaires", type: "text", placeholder: "Ex : 17h00 – 01h00" },
      { key: "missions", label: "Missions", type: "textarea", placeholder: "Accueil, placement, service, contrôle des accès…" },
      { key: "equipements", label: "Équipements nécessaires", type: "multiselect", options: ["Tenue fournie", "Tenue fournie par le client", "Talkies-walkies", "Badges", "Détecteurs"] },
    ],
  },
  {
    id: "communication",
    label: "Communication et création de contenu",
    defaultPricing: "forfait",
    pricingModes: ["forfait", "unitaire", "journalier"],
    aliases: ["communication", "contenu", "community", "influen", "réseaux", "reseaux", "social", "marketing", "content"],
    services: [
      "Couverture réseaux sociaux en direct",
      "Création de contenu (stories, reels, TikTok)",
      "Community management",
      "Live Instagram / Facebook / TikTok",
      "Création de visuels / affiches",
      "Identité visuelle de l'événement",
      "Site web de l'événement",
      "Hashtag et stratégie digitale",
      "Relations presse",
      "Vidéo récapitulative (aftermovie)",
      "Influenceur / créateur invité",
      "Conception de faire-part digital",
    ],
    fields: [
      { key: "type_contenu", label: "Type de contenu", type: "multiselect", options: ["Stories", "Reels / TikTok", "Photos", "Visuels / affiches", "Live", "Articles", "Aftermovie"] },
      { key: "nb_livrables", label: "Nombre de livrables", type: "number", suffix: "livrables" },
      { key: "formats", label: "Formats", type: "multiselect", options: ["Vertical 9:16", "Carré 1:1", "Horizontal 16:9", "Impression"] },
      { key: "plateformes", label: "Plateformes", type: "multiselect", options: ["Instagram", "TikTok", "Facebook", "YouTube", "LinkedIn", "WhatsApp", "Snapchat"] },
      { key: "duree_couverture", label: "Durée de couverture", type: "number", suffix: "heures" },
      { key: "delai_livraison", label: "Délai de livraison", type: "select", options: ["En direct", "24 heures", "48 heures", "1 semaine", "2 semaines"] },
    ],
  },
];

const BY_ID = new Map(PROVIDER_CATEGORIES.map((c) => [c.id, c]));

export const getCategory = (id?: string | null) => (id ? BY_ID.get(id) : undefined);

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Retrouve une catégorie à partir d'un identifiant, d'un libellé ou d'une ancienne valeur libre. */
export function matchCategory(value?: string | null): ProviderCategory | undefined {
  if (!value) return undefined;
  const direct = BY_ID.get(value);
  if (direct) return direct;
  const v = normalize(value);
  const byLabel = PROVIDER_CATEGORIES.find((c) => normalize(c.label) === v);
  if (byLabel) return byLabel;
  return PROVIDER_CATEGORIES.find((c) => c.aliases.some((a) => v.includes(normalize(a))));
}

const SERVICE_TO_CATEGORY = new Map<string, string>();
for (const c of PROVIDER_CATEGORIES) for (const s of c.services) if (!SERVICE_TO_CATEGORY.has(normalize(s))) SERVICE_TO_CATEGORY.set(normalize(s), c.id);

/** Types de prestation proposés aux prestataires (profil, catalogue, filtres de l'annuaire). */
export const PRESTATION_TYPES = PROVIDER_CATEGORIES.map((c) => c.label);

/**
 * Activité correspondant à un type de prestation ou à un service détaillé
 * (undefined pour une prestation personnalisée).
 */
export const categoryOfService = (name: string) =>
  PROVIDER_CATEGORIES.find((c) => normalize(c.label) === normalize(name))?.id ?? SERVICE_TO_CATEGORY.get(normalize(name));

/** Ramène une prestation à son type (« Buffet traditionnel » → « Traiteurs et restauration »). */
export const prestationType = (name: string) => getCategory(categoryOfService(name))?.label ?? name;

/**
 * Activités d'un prestataire : déduites de ses prestations (`services_proposes`),
 * sinon colonne `categories`, sinon l'ancienne colonne `category`.
 */
export function resolveProviderCategories(profile: any): string[] {
  const ids = new Set<string>();
  const services: unknown = profile?.services_proposes;
  if (Array.isArray(services)) {
    for (const s of services) {
      const id = categoryOfService(String(s));
      if (id) ids.add(id);
    }
  }
  if (ids.size) return [...ids];
  const list: unknown = profile?.categories;
  if (Array.isArray(list)) {
    for (const v of list) {
      const c = matchCategory(String(v));
      if (c) ids.add(c.id);
    }
  }
  if (ids.size === 0 && profile?.category) {
    const c = matchCategory(String(profile.category));
    if (c) ids.add(c.id);
  }
  return [...ids];
}

/** Valeur d'un champ considérée comme renseignée */
export const isFilled = (v: unknown) =>
  v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);

export function isFieldVisible(field: CategoryField, values: Record<string, unknown>): boolean {
  if (!field.showWhen) return true;
  const current = values[field.showWhen.key];
  const expected = field.showWhen.equals;
  return Array.isArray(expected) ? expected.includes(current as string | boolean) : current === expected;
}

/** Valeur d'un champ mise en forme pour l'affichage (devis client, PDF). */
export function formatFieldValue(field: CategoryField | undefined, value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (field?.type === "date" && typeof value === "string" && value) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString("fr-FR");
  }
  const s = String(value ?? "");
  return field?.suffix && field.type === "number" && s ? `${s} ${field.suffix}` : s;
}

/**
 * Détails par catégorie enregistrés sur un devis, prêts à afficher :
 * [{ category, rows: [{ label, value }] }]
 */
export function categoryDetailsForDisplay(details: unknown): { label: string; rows: { label: string; value: string }[] }[] {
  if (!details || typeof details !== "object") return [];
  return Object.entries(details as Record<string, Record<string, unknown>>)
    .map(([catId, values]) => {
      const cat = getCategory(catId);
      if (!cat || !values || typeof values !== "object") return null;
      const rows = cat.fields
        .filter((f) => isFilled(values[f.key]) && isFieldVisible(f, values))
        .map((f) => ({ label: f.label, value: formatFieldValue(f, values[f.key]) }));
      return rows.length ? { label: cat.label, rows } : null;
    })
    .filter((x): x is { label: string; rows: { label: string; value: string }[] } => x !== null);
}
