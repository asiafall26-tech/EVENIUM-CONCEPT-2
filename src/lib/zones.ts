/**
 * Pays et zones d'intervention proposés aux prestataires.
 * Un prestataire peut ajouter sa propre zone si elle n'est pas dans la liste.
 */

export const WHOLE_COUNTRY = "Tout le pays";

export const MAIN_COUNTRIES = ["Sénégal", "Côte d'Ivoire", "France"] as const;

export interface RegionWithQuartiers {
  region: string;
  quartiers: string[];
}

export const GEOGRAPHIC_HIERARCHY: Record<string, RegionWithQuartiers[]> = {
  "Sénégal": [
    {
      region: "Dakar",
      quartiers: [
        "Almadies", "Ngor", "Ouakam", "Mermoz", "Sacré-Cœur", "Point E", "Fann", "Dakar Plateau",
        "Yoff", "Mamelles", "Hann Maristes", "Liberté", "Sicap", "Parcelles Assainies",
        "Pikine", "Guédiawaye", "Rufisque", "Keur Massar", "Diamniadio", "Lac Rose"
      ]
    },
    {
      region: "Thiès & Petite-Côte",
      quartiers: [
        "Saly Portudal", "Mbour", "Somone", "Ngaparou", "Toubab Dialaw", "Popenguine",
        "Thiès Ville", "Joal-Fadiouth", "Nianing"
      ]
    },
    {
      region: "Saint-Louis",
      quartiers: [
        "Île de Saint-Louis", "Sor", "Ndioloffène", "Gandiol", "Dagana", "Podor"
      ]
    },
    {
      region: "Ziguinchor (Casamance)",
      quartiers: [
        "Cap Skirring", "Ziguinchor Ville", "Oussouye", "Bignona", "Kafountine"
      ]
    },
    {
      region: "Diourbel",
      quartiers: [
        "Touba", "Mbacké", "Diourbel Ville"
      ]
    },
    {
      region: "Sine-Saloum (Fatick / Kaolack)",
      quartiers: [
        "Kaolack", "Fatick", "Ndangane", "Mar Lodj", "Toubacouta", "Kaffrine"
      ]
    },
    {
      region: "Autres régions du Sénégal",
      quartiers: [
        "Louga", "Kolda", "Sédhiou", "Tambacounda", "Kédougou", "Matam"
      ]
    }
  ],
  "Côte d'Ivoire": [
    {
      region: "Abidjan (District)",
      quartiers: [
        "Cocody", "Riviera", "Deux Plateaux", "Angré", "Plateau", "Marcory", "Zone 4", "Biétry",
        "Treichville", "Yopougon", "Koumassi", "Port-Bouët", "Adjamé", "Abobo", "Bingerville"
      ]
    },
    {
      region: "Sud-Comoé",
      quartiers: [
        "Grand-Bassam", "Assinie", "Assouindé", "Aboisso", "Bonoua"
      ]
    },
    {
      region: "Grands Ponts & Littoral",
      quartiers: [
        "Jacqueville", "Dabou", "San-Pédro", "Sassandra"
      ]
    },
    {
      region: "Bélier & Gbêkê",
      quartiers: [
        "Yamoussoukro", "Bouaké", "Dimbokro", "Toumodi"
      ]
    },
    {
      region: "Autres régions de Côte d'Ivoire",
      quartiers: [
        "Daloa", "Korhogo", "Man", "Gagnoa", "Abengourou", "Soubré"
      ]
    }
  ],
  "France": [
    {
      region: "Île-de-France (Paris)",
      quartiers: [
        "Paris Centre (1er-4e)", "Paris Triangle d'Or (8e-16e)", "Paris Rive Gauche (5e-7e)",
        "Paris (9e-20e)", "Neuilly-sur-Seine", "Boulogne-Billancourt", "Levallois-Perret",
        "Versailles", "Saint-Germain-en-Laye", "Saint-Denis", "Marne-la-Vallée"
      ]
    },
    {
      region: "Provence-Alpes-Côte d'Azur (PACA)",
      quartiers: [
        "Cannes", "Nice", "Monaco / Monte-Carlo", "Antibes", "Saint-Tropez",
        "Marseille", "Aix-en-Provence", "Toulon", "Avignon"
      ]
    },
    {
      region: "Auvergne-Rhône-Alpes",
      quartiers: [
        "Lyon", "Annecy", "Megève", "Chamonix", "Grenoble", "Valence"
      ]
    },
    {
      region: "Nouvelle-Aquitaine",
      quartiers: [
        "Bordeaux", "Bassin d'Arcachon", "Biarritz", "Saint-Jean-de-Luz", "La Rochelle"
      ]
    },
    {
      region: "Occitanie",
      quartiers: [
        "Toulouse", "Montpellier", "Nîmes", "Perpignan"
      ]
    },
    {
      region: "Hauts-de-France",
      quartiers: [
        "Lille", "Le Touquet", "Chantilly"
      ]
    }
  ]
};

export const COUNTRIES: { name: string; zones: string[] }[] = [
  {
    name: "Sénégal",
    zones: [
      "Dakar", "Dakar Plateau", "Almadies", "Ngor", "Ouakam", "Mermoz", "Sacré-Cœur", "Point E", "Fann", "Yoff",
      "Parcelles Assainies", "Pikine", "Guédiawaye", "Rufisque", "Keur Massar", "Diamniadio", "Lac Rose",
      "Thiès", "Mbour", "Saly", "Somone", "Ngaparou", "Popenguine", "Toubab Dialaw", "Joal-Fadiouth",
      "Saint-Louis", "Louga", "Touba", "Diourbel", "Mbacké", "Kaolack", "Fatick", "Kaffrine",
      "Ziguinchor", "Cap Skirring", "Kolda", "Sédhiou", "Tambacounda", "Kédougou", "Matam",
    ],
  },
  {
    name: "Côte d'Ivoire",
    zones: [
      "Abidjan", "Cocody", "Plateau", "Marcory", "Treichville", "Yopougon", "Koumassi", "Port-Bouët", "Adjamé",
      "Abobo", "Bingerville", "Riviera", "Angré", "Deux Plateaux", "Grand-Bassam", "Assinie", "Jacqueville",
      "Yamoussoukro", "Bouaké", "San-Pédro", "Daloa", "Korhogo", "Man", "Gagnoa", "Abengourou", "Sassandra",
    ],
  },
  {
    name: "France",
    zones: [
      "Paris / Île-de-France", "Paris", "Lyon", "Marseille", "Lille", "Bordeaux", "Toulouse", "Nice", "Cannes", "Monaco", "Strasbourg"
    ]
  },
  { name: "Mali", zones: ["Bamako", "Kati", "Koulikoro", "Ségou", "Sikasso", "Kayes", "Mopti", "Tombouctou"] },
  { name: "Guinée", zones: ["Conakry", "Kaloum", "Ratoma", "Matoto", "Kindia", "Boké", "Labé", "Kankan", "Nzérékoré"] },
  { name: "Burkina Faso", zones: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Ouahigouya", "Banfora"] },
  { name: "Mauritanie", zones: ["Nouakchott", "Nouadhibou", "Rosso", "Kiffa"] },
  { name: "Gambie", zones: ["Banjul", "Serrekunda", "Brikama", "Bakau"] },
  { name: "Guinée-Bissau", zones: ["Bissau", "Bafatá", "Gabú"] },
  { name: "Bénin", zones: ["Cotonou", "Porto-Novo", "Abomey-Calavi", "Ouidah", "Parakou"] },
  { name: "Togo", zones: ["Lomé", "Kara", "Sokodé", "Kpalimé", "Aného"] },
  { name: "Niger", zones: ["Niamey", "Maradi", "Zinder", "Tahoua"] },
  { name: "Cameroun", zones: ["Douala", "Yaoundé", "Kribi", "Bafoussam", "Limbé", "Garoua"] },
  { name: "Gabon", zones: ["Libreville", "Port-Gentil", "Franceville", "Owendo"] },
  { name: "Congo", zones: ["Brazzaville", "Pointe-Noire", "Dolisie"] },
  { name: "RD Congo", zones: ["Kinshasa", "Lubumbashi", "Goma", "Matadi"] },
  { name: "Maroc", zones: ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir"] },
  { name: "Tunisie", zones: ["Tunis", "Sousse", "Hammamet", "Sfax", "Djerba"] },
  { name: "Belgique", zones: ["Bruxelles", "Anvers", "Liège"] },
];

export const COUNTRY_NAMES = COUNTRIES.map((c) => c.name);

export function regionsOf(country?: string | null): string[] {
  if (!country || !GEOGRAPHIC_HIERARCHY[country]) return [];
  return GEOGRAPHIC_HIERARCHY[country].map((r) => r.region);
}

export function quartiersOf(country?: string | null, region?: string | null): string[] {
  if (!country || !GEOGRAPHIC_HIERARCHY[country]) return [];
  if (region) {
    const found = GEOGRAPHIC_HIERARCHY[country].find((r) => r.region.toLowerCase() === region.toLowerCase());
    return found ? found.quartiers : [];
  }
  return GEOGRAPHIC_HIERARCHY[country].flatMap((r) => r.quartiers);
}

export const zonesOf = (country?: string | null) => {
  if (!country) return [];
  if (GEOGRAPHIC_HIERARCHY[country]) {
    const fromH = [
      ...regionsOf(country),
      ...quartiersOf(country)
    ];
    return [...new Set(fromH)];
  }
  return COUNTRIES.find((c) => c.name === country)?.zones ?? [];
};

/** Libellé court de la localisation d'un prestataire, ex. « Dakar, Saly · Sénégal ». */
export function locationLabel(country?: string | null, zones?: string[] | null, max = 2): string {
  const list = (zones ?? []).filter(Boolean);
  const head = list.includes(WHOLE_COUNTRY) ? WHOLE_COUNTRY : list.slice(0, max).join(", ") + (list.length > max ? ` +${list.length - max}` : "");
  return [head, country].filter(Boolean).join(" · ");
}
