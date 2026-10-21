"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowDown, ArrowUp, CheckCircle, Edit3, Eye, EyeOff, Loader2, Music, Pause, Play, RefreshCw, Search, Trash2, UploadCloud } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { AudioTrimmer } from "@/components/media/AudioTrimmer";
import { uploadMedia } from "@/utils/uploadMedia";
import { formatTime } from "@/utils/audioSegment";
import { createTrack, deleteTrack, getAllTracks, reorderTracks, updateTrack } from "@/app/actions/musicLibrary";
import { MUSIC_CATEGORIES, MUSIC_MOODS, type LibraryTrack } from "@/data/musicLibrary";

const inputCls =
  "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40 focus:bg-white";

interface UploadItem {
  name: string;
  status: "uploading" | "done" | "error";
  error?: string;
}

/** Reads the length of an audio file before it is uploaded */
function fileDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const a = new Audio();
    a.preload = "metadata";
    a.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(a.duration) ? Math.round(a.duration * 10) / 10 : null);
    };
    a.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    a.src = url;
  });
}

const prettyTitle = (fileName: string) =>
  fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());

export default function AdminSoundBankPage() {
  const [tracks, setTracks] = useState<LibraryTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("Toutes");
  const [query, setQuery] = useState("");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [editing, setEditing] = useState<LibraryTrack | null>(null);
  const [saving, setSaving] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const res = await getAllTracks();
    setTracks(res.data);
    setError(res.error);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch: state is only set once the request resolves
    load();
    return () => audioRef.current?.pause();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tracks.filter(
      (t) =>
        (filter === "Toutes" || t.category === filter) &&
        (!q || t.title.toLowerCase().includes(q) || (t.artist ?? "").toLowerCase().includes(q))
    );
  }, [tracks, filter, query]);

  /* ---------- Import ---------- */
  const importFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("audio/") || /\.(mp3|m4a|wav|ogg|aac|flac)$/i.test(f.name));
    if (!list.length) return;
    setUploads((u) => [...list.map((f) => ({ name: f.name, status: "uploading" as const })), ...u]);
    const setStatus = (name: string, patch: Partial<UploadItem>) => setUploads((u) => u.map((x) => (x.name === name ? { ...x, ...patch } : x)));

    for (const file of list) {
      const [duration, up] = await Promise.all([fileDuration(file), uploadMedia(file, "library")]);
      if (!up.success || !up.url) {
        setStatus(file.name, { status: "error", error: up.error });
        continue;
      }
      const res = await createTrack({ title: prettyTitle(file.name), audio_url: up.url, storage_path: up.path ?? null, duration, category: "Mariage" });
      if (res.error || !res.data) setStatus(file.name, { status: "error", error: res.error });
      else {
        setStatus(file.name, { status: "done" });
        setTracks((t) => [...t, res.data!]);
      }
    }
  };

  /* ---------- Playback ---------- */
  const togglePlay = (t: LibraryTrack) => {
    if (playingId === t.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current?.pause();
    const a = new Audio(t.audio_url);
    a.currentTime = t.excerpt_start || 0;
    a.ontimeupdate = () => {
      if (t.excerpt_end > t.excerpt_start && a.currentTime >= t.excerpt_end) {
        a.pause();
        setPlayingId(null);
      }
    };
    a.onended = () => setPlayingId(null);
    audioRef.current = a;
    a.play().then(() => setPlayingId(t.id)).catch(() => setPlayingId(null));
  };

  /* ---------- Edits ---------- */
  const patchTrack = async (t: LibraryTrack, patch: Partial<LibraryTrack>) => {
    setTracks((list) => list.map((x) => (x.id === t.id ? { ...x, ...patch } : x)));
    const res = await updateTrack(t.id, patch);
    if (res.error) {
      alert(res.error);
      load();
    }
  };

  const move = async (t: LibraryTrack, dir: -1 | 1) => {
    const i = tracks.findIndex((x) => x.id === t.id);
    const j = i + dir;
    if (j < 0 || j >= tracks.length) return;
    const next = [...tracks];
    [next[i], next[j]] = [next[j], next[i]];
    setTracks(next);
    const res = await reorderTracks(next.map((x) => x.id));
    if (res.error) alert(res.error);
  };

  const remove = async (t: LibraryTrack) => {
    if (!confirm(`Supprimer « ${t.title} » de la banque ? Le fichier sera effacé. Les invitations qui l'utilisent n'auront plus de musique.`)) return;
    if (playingId === t.id) audioRef.current?.pause();
    const res = await deleteTrack(t.id);
    if (res.error) alert(res.error);
    else setTracks((list) => list.filter((x) => x.id !== t.id));
  };

  const saveEditing = async () => {
    if (!editing) return;
    setSaving(true);
    const { id, title, artist, category, mood, excerpt_start, excerpt_end, is_active } = editing;
    const res = await updateTrack(id, { title, artist, category, mood, excerpt_start, excerpt_end, is_active });
    setSaving(false);
    if (res.error || !res.data) return alert(res.error);
    setTracks((list) => list.map((x) => (x.id === id ? res.data! : x)));
    setEditing(null);
  };

  const activeCount = tracks.filter((t) => t.is_active).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2 flex items-center gap-2">
            Banque de sons <Music size={24} className="text-[#b8924a]" />
          </h1>
          <p className="text-gray-500 text-sm">
            Les morceaux proposés aux clients pour la musique de leur invitation · {activeCount} visible{activeCount > 1 ? "s" : ""} sur {tracks.length}
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors text-gray-600"
        >
          <RefreshCw size={16} /> Rafraîchir
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Import */}
      <input ref={fileRef} type="file" accept="audio/*,.mp3,.m4a,.wav" multiple className="hidden" onChange={(e) => e.target.files && importFiles(e.target.files).then(() => (e.target.value = ""))} />
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          importFiles(e.dataTransfer.files);
        }}
        className={`mb-6 cursor-pointer rounded-3xl border-2 border-dashed p-4 sm:p-6 lg:p-8 text-center transition-colors ${
          dragOver ? "border-[#b8924a] bg-[#fbf7f0]" : "border-gray-200 bg-white hover:border-[#b8924a]/60 hover:bg-[#fbf7f0]/50"
        }`}
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#efe6d6] text-[#8f6f33] flex items-center justify-center mb-3">
          <UploadCloud size={26} />
        </div>
        <p className="font-semibold text-gray-900">Glissez vos fichiers audio ici ou cliquez pour les choisir</p>
        <p className="text-xs text-gray-500 mt-1">MP3, M4A ou WAV · 25 Mo maximum par fichier · plusieurs fichiers à la fois</p>
      </div>

      {uploads.length > 0 && (
        <div className="mb-6 bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {uploads.slice(0, 8).map((u, i) => (
            <div key={`${u.name}-${i}`} className="px-4 py-2.5 flex items-center gap-3 text-sm">
              {u.status === "uploading" && <Loader2 size={16} className="animate-spin text-[#8f6f33]" />}
              {u.status === "done" && <CheckCircle size={16} className="text-green-600" />}
              {u.status === "error" && <AlertCircle size={16} className="text-red-600" />}
              <span className="truncate flex-1 text-gray-800">{u.name}</span>
              <span className={`text-xs ${u.status === "error" ? "text-red-600" : "text-gray-400"}`}>
                {u.status === "uploading" ? "Import…" : u.status === "done" ? "Ajouté — pensez à renseigner sa catégorie" : u.error}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {["Toutes", ...MUSIC_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === c ? "bg-[#241b13] text-[#d9c08c]" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {c === "Tous" ? "Tous événements" : c}
            </button>
          ))}
        </div>
        <div className="relative md:ml-auto md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un titre, un artiste…" className={`${inputCls} pl-9`} />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <p className="px-6 py-12 text-center text-gray-500 text-sm">Chargement de la banque…</p>
        ) : visible.length === 0 ? (
          <div className="px-6 py-14 text-center text-gray-500 text-sm">
            <Music size={32} className="mx-auto mb-3 text-gray-300" />
            {tracks.length === 0 ? "La banque est vide : importez vos premiers morceaux ci-dessus." : "Aucun morceau ne correspond à ce filtre."}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {visible.map((t) => {
              const index = tracks.findIndex((x) => x.id === t.id);
              const hasExcerpt = t.excerpt_start > 0 || t.excerpt_end > 0;
              return (
                <li key={t.id} className={`px-4 sm:px-6 py-4 flex items-center gap-4 ${t.is_active ? "" : "opacity-55"}`}>
                  <button
                    onClick={() => togglePlay(t)}
                    aria-label={playingId === t.id ? "Arrêter" : "Écouter l'extrait conseillé"}
                    className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-colors ${
                      playingId === t.id ? "bg-[#241b13] text-[#d9c08c]" : "bg-[#efe6d6] text-[#7a5e2b] hover:bg-[#e4d8c4]"
                    }`}
                  >
                    {playingId === t.id ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{t.title}</p>
                    <p className="text-xs text-gray-500 truncate">{t.artist || "Artiste non renseigné"}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">{t.category === "Tous" ? "Tous événements" : t.category}</span>
                      {t.mood && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700">{t.mood}</span>}
                      <span className="text-[11px] text-gray-400 font-mono">{t.duration ? formatTime(t.duration) : "—"}</span>
                      {hasExcerpt && (
                        <span className="text-[11px] text-[#7a5e2b]">
                          · extrait {formatTime(t.excerpt_start)}–{t.excerpt_end ? formatTime(t.excerpt_end) : "fin"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => move(t, -1)} disabled={index <= 0} aria-label="Monter" className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30">
                      <ArrowUp size={16} />
                    </button>
                    <button onClick={() => move(t, 1)} disabled={index >= tracks.length - 1} aria-label="Descendre" className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30">
                      <ArrowDown size={16} />
                    </button>
                    <button
                      onClick={() => patchTrack(t, { is_active: !t.is_active })}
                      title={t.is_active ? "Masquer aux clients" : "Proposer aux clients"}
                      className={`p-2 rounded-lg hover:bg-gray-100 ${t.is_active ? "text-green-600" : "text-gray-400"}`}
                    >
                      {t.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={() => setEditing(t)} aria-label="Modifier" className="p-2 rounded-lg text-gray-500 hover:text-[#8f6f33] hover:bg-[#fbf7f0]">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => remove(t)} aria-label="Supprimer" className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Edit */}
      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} title="Modifier le morceau" maxWidth="2xl">
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-semibold text-gray-700 mb-1.5">Titre</span>
                <input className={inputCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-gray-700 mb-1.5">Artiste</span>
                <input className={inputCls} value={editing.artist ?? ""} onChange={(e) => setEditing({ ...editing, artist: e.target.value || null })} />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-gray-700 mb-1.5">Type d&apos;événement</span>
                <select className={inputCls} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                  {MUSIC_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c === "Tous" ? "Tous événements" : c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-gray-700 mb-1.5">Ambiance</span>
                <select className={inputCls} value={editing.mood ?? ""} onChange={(e) => setEditing({ ...editing, mood: e.target.value || null })}>
                  <option value="">Non précisée</option>
                  {MUSIC_MOODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <span className="block text-xs font-semibold text-gray-700 mb-1.5">Extrait conseillé (présélectionné pour le client, qu&apos;il pourra ajuster)</span>
              <AudioTrimmer
                url={editing.audio_url}
                start={editing.excerpt_start}
                end={editing.excerpt_end}
                onChange={(excerpt_start, excerpt_end) => setEditing({ ...editing, excerpt_start, excerpt_end })}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="w-4 h-4 accent-[#8f6f33]" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
              Proposer ce morceau aux clients
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={saveEditing}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#241b13] text-[#d9c08c] text-sm font-bold hover:bg-black disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <Loader2 size={15} className="animate-spin" />} Enregistrer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
