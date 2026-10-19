"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import type { LibraryTrack, TrackInput } from "@/data/musicLibrary";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const MISSING_TABLE = "La banque de sons n'est pas encore créée : exécutez music_library.sql dans Supabase.";

function explain(error: { code?: string; message: string }) {
  return error.code === "42P01" || error.code === "PGRST205" ? MISSING_TABLE : error.message;
}

const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
function normalise(row: Record<string, unknown>): LibraryTrack {
  return {
    ...(row as unknown as LibraryTrack),
    duration: num(row.duration),
    excerpt_start: Number(row.excerpt_start ?? 0),
    excerpt_end: Number(row.excerpt_end ?? 0),
  };
}

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non connecté.");
  const { data } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single();
  if (data?.role !== "admin") throw new Error("Action réservée à l'administrateur.");
}

/** Tracks offered to clients in the music picker */
export async function getActiveTracks(): Promise<{ data: LibraryTrack[]; error: string | null }> {
  const { data, error } = await supabaseAdmin
    .from("music_library")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { data: [], error: explain(error) };
  return { data: (data ?? []).map(normalise), error: null };
}

/* ---------- Admin ---------- */

export async function getAllTracks(): Promise<{ data: LibraryTrack[]; error: string | null }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { data: [], error: (e as Error).message };
  }
  const { data, error } = await supabaseAdmin
    .from("music_library")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { data: [], error: explain(error) };
  return { data: (data ?? []).map(normalise), error: null };
}

const EDITABLE: (keyof TrackInput)[] = [
  "title", "artist", "category", "mood", "audio_url", "storage_path", "duration", "excerpt_start", "excerpt_end", "is_active", "sort_order",
];

function pickEditable(input: TrackInput) {
  const out: Record<string, unknown> = {};
  for (const k of EDITABLE) if (input[k] !== undefined) out[k] = input[k];
  if (typeof out.title === "string") out.title = out.title.trim() || "Sans titre";
  return out;
}

export async function createTrack(input: TrackInput): Promise<{ data?: LibraryTrack; error?: string }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }
  if (!input.audio_url) return { error: "Fichier audio manquant." };
  // New tracks go to the end of the list
  const { data: last } = await supabaseAdmin.from("music_library").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const row = { category: "Tous", ...pickEditable(input), sort_order: (last?.[0]?.sort_order ?? -1) + 1 };
  const { data, error } = await supabaseAdmin.from("music_library").insert(row).select().single();
  if (error) return { error: explain(error) };
  return { data: normalise(data) };
}

export async function updateTrack(id: string, input: TrackInput): Promise<{ data?: LibraryTrack; error?: string }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }
  const { data, error } = await supabaseAdmin.from("music_library").update(pickEditable(input)).eq("id", id).select().single();
  if (error) return { error: explain(error) };
  return { data: normalise(data) };
}

/** Deletes the track and its file in storage */
export async function deleteTrack(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }
  const { data: track } = await supabaseAdmin.from("music_library").select("storage_path").eq("id", id).single();
  const { error } = await supabaseAdmin.from("music_library").delete().eq("id", id);
  if (error) return { error: explain(error) };
  // Only files of the bank itself are removed (never a client's upload)
  if (track?.storage_path?.startsWith("invitations/library/")) {
    await supabaseAdmin.storage.from("evenium_assets").remove([track.storage_path]);
  }
  return { success: true };
}

/** Saves the display order (ids from first to last) */
export async function reorderTracks(ids: string[]): Promise<{ success?: boolean; error?: string }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }
  const results = await Promise.all(ids.map((id, i) => supabaseAdmin.from("music_library").update({ sort_order: i }).eq("id", id)));
  const failed = results.find((r) => r.error);
  return failed?.error ? { error: explain(failed.error) } : { success: true };
}
