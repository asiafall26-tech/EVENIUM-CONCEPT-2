/** Types d'événements proposés dans toute l'application (création d'événement, devis, filtres). */
export const EVENT_TYPES = [
  "Mariage",
  "Anniversaire de mariage",
  "Gala",
  "Conférence",
  "Noël",
  "Pâques",
  "Pentecôte",
  "Communion",
  "Demande en mariage",
  "Yendou",
  "Picnic",
  "Anniversaire",
  "Baptême",
  "Enterrement de vie de jeune fille",
  "Henné time",
  "Baby shower",
  "Fiançailles",
  "Fêtes de fin d'année",
  "Soirée",
  "Réception",
  "Dîner",
  "Brunch",
] as const;

export type EventTypeName = (typeof EVENT_TYPES)[number];

/** Événements principaux selon le classement officiel Evenium */
export const SERVICE_EVENT_FILTERS: EventTypeName[] = [
  "Mariage",
  "Anniversaire de mariage",
  "Gala",
  "Conférence",
  "Noël",
  "Pâques",
  "Pentecôte",
  "Communion",
  "Demande en mariage",
  "Yendou",
  "Picnic",
  "Anniversaire",
  "Baptême",
  "Enterrement de vie de jeune fille",
  "Henné time",
];

/** Icône de chaque type d'événement (filtres des modèles d'invitation) */
export const EVENT_TYPE_ICONS: Record<EventTypeName, string> = {
  "Mariage": "💍",
  "Anniversaire de mariage": "🥂",
  "Gala": "🥂",
  "Conférence": "🎤",
  "Noël": "🎄",
  "Pâques": "🐣",
  "Pentecôte": "🕊️",
  "Communion": "🕊️",
  "Demande en mariage": "💎",
  "Yendou": "🪘",
  "Picnic": "🧺",
  "Anniversaire": "🎂",
  "Baptême": "👶",
  "Enterrement de vie de jeune fille": "👑",
  "Henné time": "🌿",
  "Baby shower": "🍼",
  "Fiançailles": "💐",
  "Fêtes de fin d'année": "✨",
  "Soirée": "🌙",
  "Réception": "🍾",
  "Dîner": "🍽️",
  "Brunch": "🥐",
};

/** Liste des types à afficher dans un sélecteur, en gardant une valeur existante hors liste. */
export function eventTypeOptions(current?: string | null): string[] {
  const list: string[] = [...EVENT_TYPES];
  if (current && !list.includes(current as EventTypeName)) list.unshift(current as EventTypeName);
  return list;
}
