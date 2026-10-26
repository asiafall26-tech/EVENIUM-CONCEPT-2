/** Types d'événements proposés dans toute l'application (création d'événement, devis…). */
export const EVENT_TYPES = [
  "Mariage",
  "Baptême",
  "Henné time",
  "Baby shower",
  "Fiançailles",
  "Enterrement de vie de jeune fille",
  "Anniversaire",
  "Anniversaire de mariage",
  "Gala",
  "Soirée",
  "Conférence",
  "Réception",
  "Dîner",
  "Brunch",
  "Yendou",
] as const;

export type EventTypeName = (typeof EVENT_TYPES)[number];

/** Icône de chaque type d'événement (filtres des modèles d'invitation) */
export const EVENT_TYPE_ICONS: Record<EventTypeName, string> = {
  "Mariage": "💍",
  "Baptême": "👶",
  "Henné time": "🌿",
  "Baby shower": "🍼",
  "Fiançailles": "💐",
  "Enterrement de vie de jeune fille": "👑",
  "Anniversaire": "🎂",
  "Anniversaire de mariage": "🥂",
  "Gala": "🥂",
  "Soirée": "🌙",
  "Conférence": "🎤",
  "Réception": "🍾",
  "Dîner": "🍽️",
  "Brunch": "🥐",
  "Yendou": "🪘",
};

/** Liste des types à afficher dans un sélecteur, en gardant une valeur existante hors liste. */
export function eventTypeOptions(current?: string | null): string[] {
  const list: string[] = [...EVENT_TYPES];
  if (current && !list.includes(current)) list.unshift(current);
  return list;
}
