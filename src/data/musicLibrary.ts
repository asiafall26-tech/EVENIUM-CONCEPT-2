/** Evenium's sound bank (table music_library): shared by the admin page and the clients' music picker */

export const MUSIC_CATEGORIES = ["Tous", "Mariage", "Baptême", "Anniversaire", "Gala", "Corporate"] as const;
export const MUSIC_MOODS = ["Romantique", "Douce", "Festive", "Traditionnelle", "Instrumentale", "Solennelle"] as const;

export interface LibraryTrack {
  id: string;
  title: string;
  artist: string | null;
  /** One of MUSIC_CATEGORIES; "Tous" = suits every event */
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
