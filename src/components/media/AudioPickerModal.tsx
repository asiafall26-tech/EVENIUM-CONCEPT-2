"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Play, Pause, Music, UploadCloud, Loader2, Sparkles, Check, Search } from "lucide-react";
import { getActiveTracks } from "@/app/actions/musicLibrary";
import { MUSIC_CATEGORIES, MUSIC_MOODS, type LibraryTrack } from "@/data/musicLibrary";
import { uploadMedia } from "@/utils/uploadMedia";
import { formatTime } from "@/utils/audioSegment";

interface AudioPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** start / end: suggested excerpt of a bank track (seconds, end 0 = until the end); 0 for an imported file */
  onSelect: (url: string, title: string, start: number, end: number) => void;
  currentUrl?: string;
  currentTitle?: string;
  /** Event type shown first (e.g. "Mariage") */
  defaultCategory?: string;
}

const trackTitle = (t: LibraryTrack) => (t.artist ? `${t.title} - ${t.artist}` : t.title);

export function AudioPickerModal({ isOpen, onClose, onSelect, currentUrl, defaultCategory = "Mariage" }: AudioPickerModalProps) {
  const [tracks, setTracks] = useState<LibraryTrack[] | null>(null);
  const [category, setCategory] = useState<string>(defaultCategory);
  const [mood, setMood] = useState<string>("");
  const [query, setQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load the bank the first time the picker opens
  useEffect(() => {
    if (!isOpen || tracks) return;
    let cancelled = false;
    getActiveTracks().then((res) => {
      if (cancelled) return;
      // Errors (e.g. bank not created yet) are shown to the admin only: clients just see an empty bank
      setTracks(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, tracks]);

  // Stop the preview when the picker closes
  useEffect(() => {
    if (isOpen) return;
    audioRef.current?.pause();
    audioRef.current = null;
  }, [isOpen]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (tracks ?? []).filter(
      (t) =>
        (category === "Toutes" || t.category === category || t.category === "Tous") &&
        (!mood || t.mood === mood) &&
        (!q || t.title.toLowerCase().includes(q) || (t.artist ?? "").toLowerCase().includes(q))
    );
  }, [tracks, category, mood, query]);

  // Categories that actually contain tracks (+ "Toutes")
  const categories = useMemo(() => {
    const used = new Set((tracks ?? []).map((t) => t.category));
    return ["Toutes", ...MUSIC_CATEGORIES.filter((c) => c !== "Tous" && (used.has(c) || c === defaultCategory))];
  }, [tracks, defaultCategory]);

  if (!isOpen) return null;

  const stopPreview = () => {
    audioRef.current?.pause();
    setPlayingId(null);
  };

  const togglePreview = (t: LibraryTrack) => {
    if (playingId === t.id) return stopPreview();
    audioRef.current?.pause();
    const a = new Audio(t.audio_url);
    a.currentTime = t.excerpt_start || 0;
    a.ontimeupdate = () => {
      if (t.excerpt_end > t.excerpt_start && a.currentTime >= t.excerpt_end) stopPreview();
    };
    a.onended = () => setPlayingId(null);
    audioRef.current = a;
    a.play().then(() => setPlayingId(t.id)).catch(() => setPlayingId(null));
  };

  const handleCustomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const res = await uploadMedia(file, "music");
    setUploading(false);
    if (res.success && res.url) {
      stopPreview();
      onSelect(res.url, file.name.replace(/\.[^/.]+$/, ""), 0, 0);
      onClose();
    } else {
      setUploadError(res.error || "Erreur lors du téléversement du fichier audio.");
    }
  };

  const choose = (t: LibraryTrack) => {
    stopPreview();
    onSelect(t.audio_url, trackTitle(t), t.excerpt_start, t.excerpt_end);
    onClose();
  };

  const moods = MUSIC_MOODS.filter((m) => (tracks ?? []).some((t) => t.mood === m));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#b8924a]/30 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/60">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={20} className="text-[#b8924a]" />
              <span>Choisir une musique d&apos;ambiance</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Piochez dans la banque de sons Evenium ou importez votre propre fichier.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filters + upload */}
        <div className="px-6 py-3.5 border-b border-gray-100 bg-white shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un titre, un artiste…"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
              />
            </div>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-black text-[#b8924a] hover:bg-gray-900 border border-[#b8924a]/40 text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
              <span>{uploading ? "Envoi..." : "Importer mon propre son"}</span>
            </button>
            <input ref={fileInputRef} type="file" accept="audio/*,.mp3,.m4a,.wav" className="hidden" onChange={handleCustomUpload} />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                  category === c ? "bg-[#241b13] text-[#d9c08c]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {c}
              </button>
            ))}
            {moods.length > 0 && (
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="ml-auto px-3 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border-0 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                aria-label="Filtrer par ambiance"
              >
                <option value="">Toutes ambiances</option>
                {moods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {uploadError && <div className="px-6 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600 font-medium">{uploadError}</div>}

        {/* Tracks */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {tracks === null ? (
            <p className="text-center text-sm text-gray-500 py-10 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Chargement de la banque de sons…
            </p>
          ) : list.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Music size={30} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-600 font-medium">
                {tracks.length === 0 ? "La banque de sons sera bientôt disponible." : "Aucun morceau ne correspond à votre recherche."}
              </p>
              <p className="text-xs text-gray-400 mt-1">Vous pouvez importer votre propre son avec le bouton ci-dessus.</p>
            </div>
          ) : (
            list.map((t) => {
              const isPlaying = playingId === t.id;
              const isSelected = currentUrl === t.audio_url;
              const hasExcerpt = t.excerpt_start > 0 || t.excerpt_end > 0;
              return (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected ? "bg-[#b8924a]/10 border-[#b8924a] shadow-sm" : "bg-gray-50/70 border-gray-200/80 hover:bg-white hover:border-[#b8924a]/50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => togglePreview(t)}
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                      isPlaying ? "bg-[#6b1f2a] text-white shadow-md scale-105" : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-100"
                    }`}
                    title={isPlaying ? "Arrêter" : "Écouter l'extrait"}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-950 truncate">{t.title}</p>
                      {isSelected && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#b8924a] text-black shrink-0">Sélectionné</span>}
                    </div>
                    <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                      {t.artist || "Evenium Audio"}
                      {t.mood && <span className="text-gray-400"> · {t.mood}</span>}
                      {hasExcerpt && <span className="text-[#7a5e2b]"> · extrait conseillé</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {t.duration ? <span className="text-xs text-gray-400 font-mono hidden sm:inline">{formatTime(t.duration)}</span> : null}
                    <button
                      type="button"
                      onClick={() => choose(t)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected ? "bg-[#b8924a] text-black font-bold" : "bg-gray-900 hover:bg-black text-white"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check size={14} /> Actif
                        </>
                      ) : (
                        "Choisir"
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <Music size={14} className="text-[#b8924a]" />
            <span>Vous pourrez ensuite choisir la partie du morceau jouée.</span>
          </span>
          <button type="button" onClick={onClose} className="px-4 py-1.5 rounded-xl text-gray-600 hover:text-black hover:bg-gray-200 transition-colors font-medium">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
