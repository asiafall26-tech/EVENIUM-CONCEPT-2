/**
 * Pays et zones d'intervention proposés aux prestataires.
 * Un prestataire peut ajouter sa propre zone si elle n'est pas dans la liste.
 */

export const WHOLE_COUNTRY = "Tout le pays";

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
  { name: "France", zones: ["Paris / Île-de-France", "Lyon", "Marseille", "Lille", "Bordeaux", "Toulouse", "Nice", "Strasbourg"] },
  { name: "Belgique", zones: ["Bruxelles", "Anvers", "Liège"] },
];

export const COUNTRY_NAMES = COUNTRIES.map((c) => c.name);

export const zonesOf = (country?: string | null) => COUNTRIES.find((c) => c.name === country)?.zones ?? [];

/** Libellé court de la localisation d'un prestataire, ex. « Dakar, Saly · Sénégal ». */
export function locationLabel(country?: string | null, zones?: string[] | null, max = 2): string {
  const list = (zones ?? []).filter(Boolean);
  const head = list.includes(WHOLE_COUNTRY) ? WHOLE_COUNTRY : list.slice(0, max).join(", ") + (list.length > max ? ` +${list.length - max}` : "");
  return [head, country].filter(Boolean).join(" · ");
}
