/** Evenium's sound bank (table music_library): shared by the admin page and the clients' music picker */
import { EVENT_TYPES } from "@/lib/eventTypes";

/** « Tous » = convient à tous les événements */
export const ALL_EVENTS = "Tous";
export const MUSIC_CATEGORIES = [ALL_EVENTS, ...EVENT_TYPES] as const;

/** Types d'événement d'un morceau (colonne category : un ou plusieurs types séparés par des virgules) */
export const trackEvents = (t: { category?: string | null }): string[] =>
  String(t.category ?? ALL_EVENTS)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export const joinTrackEvents = (events: string[]) => (events.length === 0 || events.includes(ALL_EVENTS) ? ALL_EVENTS : events.join(", "));

/** Le morceau est-il proposé pour cet événement ? */
export const trackFits = (t: { category?: string | null }, event: string) => {
  const list = trackEvents(t);
  return list.includes(ALL_EVENTS) || list.includes(event);
};

export interface LibraryTrack {
  id: string;
  title: string;
  artist: string | null;
  /** One or more event types separated by commas; "Tous" = suits every event */
  category: string;
  mood: string | null;
  audio_url: string;
  /** Path in the evenium_assets bucket, used to delete the file */
  storage_path: string | null;
  /** seconds */
  duration: number | null;
  /** Suggested excerpt (seconds); excerpt_end 0 = until the end */
  excerpt_start: number;
  excerpt_end: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export type TrackInput = Partial<Omit<LibraryTrack, "id" | "created_at">>;
