/**
 * Cartes statiques : pas de musique (ni import, ni banque de sons), à l'édition, à l'achat et après.
 * La musique est réservée aux faire-part animés.
 */

const MUSIC_FIELDS = ["audioUrl", "audioTitle", "music", "musicTitle"] as const;

/** Contenu d'invitation sans musique. */
export function withoutMusic<T extends object>(content: T): T {
  const c = { ...content } as Record<string, unknown>;
  for (const k of MUSIC_FIELDS) if (k in c) c[k] = "";
  for (const k of ["audioStart", "audioEnd", "musicStart", "musicEnd"]) if (k in c) c[k] = 0;
  return c as T;
}

/** Applique la règle selon le type d'invitation. */
export const forInvitationKind = <T extends object>(content: T, isStatic: boolean): T => (isStatic ? withoutMusic(content) : content);
