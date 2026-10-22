"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Play,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Loader2,
  Music,
  UploadCloud,
  Pause,
  CheckCircle,
  HeartHandshake,
  BookHeart,
  Clock,
  Camera,
  MapPin,
  Quote,
  Eye,
  Sparkles,
} from "lucide-react";
import { type VeloursContent } from "./content";
import { uploadMedia } from "@/utils/uploadMedia";
import { AudioPickerModal } from "@/components/media/AudioPickerModal";
import { AudioTrimmer } from "@/components/media/AudioTrimmer";

interface Props {
  value: VeloursContent;
  onChange: (next: VeloursContent) => void;
  onViewFullScreen?: () => void;
  onFinalize?: () => void;
  isStatic?: boolean;
}

export const inputCls =
  "w-full min-h-[3.25rem] px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#7a1a2e]/40 focus:bg-white transition-colors";

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-gray-400 mt-1">{hint}</span>}
    </label>
  );
}

export function Group({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border border-gray-100 rounded-2xl bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

/** Downscales an uploaded photo to a JPEG data URL so it can be stored with the event. */
function fileToDataUrl(file: File, maxSize = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image illisible"));
    };
    img.src = url;
  });
}

export function PhotoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const res = await uploadMedia(file, "photos");
      if (res.success && res.url) {
        onChange(res.url);
      } else {
        setError(res.error || "Erreur lors du téléversement de la photo.");
      }
    } catch (err: any) {
      setError(err?.message || "Échec de l'envoi.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</span>
      <div className="flex gap-3 items-center">
        <div
          className="w-20 h-20 rounded-xl bg-gray-100 bg-cover bg-center border border-gray-200 shrink-0 relative overflow-hidden shadow-xs flex items-center justify-center"
          style={{ backgroundImage: value ? `url("${value}")` : undefined }}
        >
          {uploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
              <Loader2 size={22} className="animate-spin text-[#D4AF37]" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5c0f21] text-white text-sm font-semibold hover:bg-[#7a1a2e] transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin text-[#D4AF37]" />
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <ImagePlus size={16} />
                <span>{value ? "Changer la photo" : "Importer une photo"}</span>
              </>
            )}
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors text-left cursor-pointer"
            >
              Retirer la photo
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}

/** Soundtrack of an invitation: file URL, display title and the part of the track that is played */
export interface AudioValue {
  url: string;
  title: string;
  /** seconds */
  start: number;
  /** seconds; 0 = until the end of the track */
  end: number;
}

export function AudioField({
  label,
  value,
  onChange,
  emptyHint = "Titres connus disponibles ou MP3 personnel",
}: {
  label: string;
  value: AudioValue;
  /** Always called once with the whole new value (url, title and excerpt change together) */
  onChange: (next: AudioValue) => void;
  /** Shown when no song is chosen */
  emptyHint?: string;
}) {
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // A bank song comes with its suggested excerpt; an imported file starts with the whole track
  const pick = (url: string, songTitle: string, start = 0, end = 0) => {
    audioPlayerRef.current?.pause();
    setIsPlaying(false);
    onChange({ url, title: songTitle, start, end });
  };

  const importFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const res = await uploadMedia(file, "music");
    setUploading(false);
    if (res.success && res.url) pick(res.url, file.name.replace(/\.[^/.]+$/, ""));
    else setUploadError(res.error || "Impossible d'importer ce fichier audio.");
  };

  const togglePlay = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.currentTime = value.start;
      audioPlayerRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold text-gray-700">{label}</span>
      <input ref={fileRef} type="file" accept="audio/*,.mp3,.m4a,.wav" className="hidden" onChange={importFile} />

      <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#5c0f21]/10 text-[#5c0f21] flex items-center justify-center shrink-0">
            <Music size={22} />
          </div>

          <div className="flex-1 min-w-0">
            {value.url ? (
              <div>
                <p className="text-xs font-bold text-gray-900 truncate">{value.title || "Musique d'ouverture sélectionnée"}</p>
                <p className="text-[11px] text-green-700 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle size={12} /> Prête pour l&apos;ouverture
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-medium text-gray-700">Aucune musique ajoutée</p>
                <p className="text-[11px] text-gray-400">{emptyHint}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {value.url && (
              <button
                type="button"
                onClick={togglePlay}
                className="w-9 h-9 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 flex items-center justify-center transition-colors shadow-sm"
                title={isPlaying ? "Mettre en pause" : "Écouter"}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#5c0f21] hover:bg-[#7a1a2e] text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Music size={14} />
              <span>{value.url ? "Changer" : "Choisir une musique"}</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-[#D4AF37]/50 bg-white text-xs font-semibold text-[#8a6d1f] hover:bg-[#FFFBF0] hover:border-[#D4AF37] transition-colors disabled:opacity-60"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
          {uploading ? "Import en cours…" : "Importer mon propre son (MP3, M4A, WAV)"}
        </button>
        {uploadError && <p className="text-[11px] text-red-600">{uploadError}</p>}

        {value.url && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
            <audio ref={audioPlayerRef} src={value.url} onEnded={() => setIsPlaying(false)} className="hidden" />
            <span className="text-[10px] text-gray-500">Se lance automatiquement à l&apos;ouverture de l&apos;invitation</span>
            <button
              type="button"
              onClick={() => {
                if (audioPlayerRef.current) audioPlayerRef.current.pause();
                setIsPlaying(false);
                onChange({ url: "", title: "", start: 0, end: 0 });
              }}
              className="text-xs text-red-600 hover:underline"
            >
              Retirer le morceau
            </button>
          </div>
        )}

        {value.url && (
          <AudioTrimmer url={value.url} start={value.start} end={value.end} onChange={(start, end) => onChange({ ...value, start, end })} />
        )}
      </div>

      <AudioPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={pick}
        currentUrl={value.url}
        currentTitle={value.title}
      />
    </div>
  );
}

export default function VeloursStudio({ value, onChange, onViewFullScreen, onFinalize, isStatic }: Props) {
  const set = <K extends keyof VeloursContent>(key: K, v: VeloursContent[K]) => onChange({ ...value, [key]: v });

  const updateProgramme = (i: number, patch: Partial<VeloursContent["programme"][number]>) =>
    set(
      "programme",
      value.programme.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    );

  type VeloursMenuKey = "general" | "texts" | "programme" | "media" | "rsvp" | "all";
  const [activeMenu, setActiveMenu] = useState<VeloursMenuKey>("general");

  const MENUS = [
    { id: "general" as const, label: "Les Mariés & la Date", shortLabel: "Mariés & Date", icon: HeartHandshake, desc: "Prénoms, date, lieu et adresse" },
    { id: "texts" as const, label: "Textes & Histoire", shortLabel: "Textes & Récit", icon: BookHeart, desc: "Messages d'accueil et récit de votre histoire" },
    { id: "programme" as const, label: "Programme du Jour J", shortLabel: "Programme", icon: Clock, badge: value.programme.length, desc: "Étapes et horaires de la journée" },
    {
      id: "media" as const,
      label: isStatic ? "Photos de l'invitation" : "Photos & Musique",
      shortLabel: isStatic ? "Photos" : "Photos & Musique",
      icon: Camera,
      desc: isStatic ? "Photos des sections (sans musique sur carte statique)" : "Photos des sections et musique d'ambiance"
    },
    { id: "rsvp" as const, label: "Confirmation (RSVP)", shortLabel: "RSVP & Fin", icon: Quote, desc: "Consignes de réponse et mot de clôture" },
  ];

  const currentMenuIndex = MENUS.findIndex((m) => m.id === activeMenu);

  const goToPrevious = () => {
    if (currentMenuIndex > 0) setActiveMenu(MENUS[currentMenuIndex - 1].id);
  };
  const goToNext = () => {
    if (currentMenuIndex >= 0 && currentMenuIndex < MENUS.length - 1) setActiveMenu(MENUS[currentMenuIndex + 1].id);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#faf7f5]">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-200/70 shrink-0 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-100 text-[#5c0f21] text-xs font-semibold shrink-0">
            Velours Bordeaux
          </span>
          <p className="text-xs text-gray-500 truncate hidden sm:block">
            Renseignez et personnalisez les informations de votre événement ci-dessous.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/invitation-mariage"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-black text-xs font-semibold transition-all shadow-xs shrink-0 hidden sm:inline-flex"
          >
            <ExternalLink size={13} />
            <span>Démo modèle</span>
          </a>
        </div>
      </div>

      {/* Main Container - Full Width Form */}
      <div className="w-full flex-1 min-h-0 overflow-clip lg:overflow-hidden flex flex-col">
        {/* Category Menus & Editor Panel */}
        <div className="w-full flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-clip lg:overflow-hidden">
          {/* Horizontal Menu Navigation Bar */}
          <div className="border-b border-gray-100 bg-gray-50 p-2 shrink-0 sticky top-[var(--studio-sticky-top,0px)] z-20 lg:static">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
              {MENUS.map((menu) => {
                const Icon = menu.icon;
                const isActive = activeMenu === menu.id;
                return (
                  <button
                    key={menu.id}
                    type="button"
                    onClick={() => setActiveMenu(menu.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                      isActive
                        ? "bg-[#5c0f21] text-white shadow-sm"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-200/60"
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-white" : "text-[#5c0f21]"} />
                    <span>{menu.shortLabel}</span>
                    {menu.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {menu.badge}
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setActiveMenu("all")}
                className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ml-auto ${
                  activeMenu === "all"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/60"
                }`}
                title="Afficher l'ensemble des menus à la suite"
              >
                <Layers size={13} />
                <span>Tous les menus</span>
              </button>
            </div>
          </div>

          {/* Active Menu Content Area */}
          <div className="studio-fields flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6">
            {/* 1. Mariés & Date */}
            {(activeMenu === "general" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#5c0f21]/10 text-[#5c0f21] flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Les Mariés &amp; la Date</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Prénoms affichés au cœur de l'invitation, date et lieu de réception.</p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                    <Field label="Prénom du 1er marié">
                      <input className={inputCls} value={value.partnerA} onChange={(e) => set("partnerA", e.target.value)} />
                    </Field>
                    <Field label="Prénom du 2nd marié">
                      <input className={inputCls} value={value.partnerB} onChange={(e) => set("partnerB", e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Phrase d'accroche" hint="Ex : « Nous allons nous dire oui »">
                    <input className={inputCls} value={value.tagline} onChange={(e) => set("tagline", e.target.value)} />
                  </Field>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                    <Field label="Date de l'événement">
                      <input type="date" className={inputCls} value={value.date} onChange={(e) => set("date", e.target.value)} />
                    </Field>
                    <Field label="Heure d'accueil">
                      <input type="time" className={inputCls} value={value.time} onChange={(e) => set("time", e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Ville">
                    <input className={inputCls} value={value.city} onChange={(e) => set("city", e.target.value)} />
                  </Field>
                  <Field label="Lieu de réception">
                    <input className={inputCls} value={value.venue} onChange={(e) => set("venue", e.target.value)} />
                  </Field>
                  <Field label="Adresse complète" hint="Utilisée pour le bouton « Voir sur la carte ».">
                    <input className={inputCls} value={value.address} onChange={(e) => set("address", e.target.value)} />
                  </Field>
                </div>
              </section>
            )}

            {/* 2. Textes & Histoire */}
            {(activeMenu === "texts" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#5c0f21]/10 text-[#5c0f21] flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Textes d'Accueil &amp; Notre Histoire</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mots de bienvenue et récit romantique partagés avec vos convives.</p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <Field label="Titre d'accueil">
                    <input className={inputCls} value={value.welcomeTitle} onChange={(e) => set("welcomeTitle", e.target.value)} />
                  </Field>
                  <Field label="Message d'accueil">
                    <textarea rows={3} className={`${inputCls} resize-none`} value={value.welcomeText} onChange={(e) => set("welcomeText", e.target.value)} />
                  </Field>
                  <Field label="Notre histoire">
                    <textarea rows={4} className={`${inputCls} resize-none`} value={value.storyText} onChange={(e) => set("storyText", e.target.value)} />
                  </Field>
                  <Field label="Citation (histoire)">
                    <input className={inputCls} value={value.storyQuote} onChange={(e) => set("storyQuote", e.target.value)} />
                  </Field>
                </div>
              </section>
            )}

            {/* 3. Programme */}
            {(activeMenu === "programme" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#5c0f21]/10 text-[#5c0f21] flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Programme du Jour J ({value.programme.length} étapes)</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Déroulé chronologique heure par heure pour rythmer votre journée.</p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <div className="space-y-2.5">
                    {value.programme.map((p, i) => (
                      <div key={i} className="flex gap-2 items-center bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
                        <input
                          type="time"
                          className={`${inputCls} !w-28 shrink-0`}
                          value={p.time}
                          onChange={(e) => updateProgramme(i, { time: e.target.value })}
                        />
                        <input
                          className={inputCls}
                          value={p.label}
                          placeholder="Ex : Cérémonie"
                          onChange={(e) => updateProgramme(i, { label: e.target.value })}
                        />
                        <button
                          type="button"
                          aria-label="Supprimer l'étape"
                          onClick={() => set("programme", value.programme.filter((_, idx) => idx !== i))}
                          className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => set("programme", [...value.programme, { time: "", label: "" }])}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#5c0f21]/30 text-sm font-semibold text-[#5c0f21] hover:bg-[#5c0f21]/5 transition-colors"
                  >
                    <Plus size={16} /> Ajouter une étape au programme
                  </button>

                  <Field label="Citation du programme">
                    <input className={inputCls} value={value.programmeQuote} onChange={(e) => set("programmeQuote", e.target.value)} />
                  </Field>
                </div>
              </section>
            )}

            {/* 4. Photos & Musique */}
            {(activeMenu === "media" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#5c0f21]/10 text-[#5c0f21] flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">
                      {isStatic ? "Photos de l'Invitation" : "Photos & Musique d'Ambiance"}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isStatic
                      ? "Illustrations et photos des sections pour votre carte statique."
                      : "Illustrations et bande sonore lancée automatiquement à l'ouverture."}
                  </p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <PhotoField label="Photo « Notre histoire »" value={value.photoStory} onChange={(v) => set("photoStory", v)} />
                  <PhotoField label="Photo « Programme »" value={value.photoProgramme} onChange={(v) => set("photoProgramme", v)} />
                  {isStatic ? (
                    <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                      <span className="text-base">🔇</span>
                      <div>
                        <p className="font-bold text-amber-950">Option audio désactivée (Format Carte Statique)</p>
                        <p className="mt-0.5 text-amber-800 leading-relaxed">
                          Votre événement est configuré au format <strong>Carte statique classique</strong>. Les cartes statiques sont conçues pour être purement visuelles et ne comportent aucun lecteur audio ni son d&apos;ambiance.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <AudioField
                      label="Musique d'ouverture (Fichier audio MP3/WAV)"
                      value={{ url: value.audioUrl ?? "", title: value.audioTitle ?? "", start: value.audioStart ?? 0, end: value.audioEnd ?? 0 }}
                      onChange={(a) => onChange({ ...value, audioUrl: a.url, audioTitle: a.title, audioStart: a.start, audioEnd: a.end })}
                    />
                  )}
                </div>
              </section>
            )}

            {/* 5. RSVP & Clôture */}
            {(activeMenu === "rsvp" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#5c0f21]/10 text-[#5c0f21] flex items-center justify-center font-bold text-xs">
                      5
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Confirmation (RSVP) &amp; Mot de Clôture</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Consignes adressées à vos invités et signature finale.</p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <Field label="Texte de confirmation (RSVP)">
                    <textarea rows={2} className={`${inputCls} resize-none`} value={value.rsvpText} onChange={(e) => set("rsvpText", e.target.value)} />
                  </Field>
                  <Field label="Phrase de fin">
                    <input className={inputCls} value={value.closingQuote} onChange={(e) => set("closingQuote", e.target.value)} />
                  </Field>
                </div>
              </section>
            )}
          </div>

          {/* Stepper Footer for Easy Navigation */}
          {activeMenu !== "all" && (
            <div className="px-3 sm:px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:pb-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2 shrink-0 sticky bottom-0 z-20 lg:static">
              <button
                type="button"
                onClick={goToPrevious}
                disabled={currentMenuIndex <= 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-200/60 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={14} />
                <span>Précédent</span>
              </button>

              <span className="text-xs font-medium text-gray-500">
                Menu {currentMenuIndex + 1} sur {MENUS.length}
              </span>

              {currentMenuIndex >= MENUS.length - 1 ? (
                onViewFullScreen ? (
                  <button
                    type="button"
                    onClick={onViewFullScreen}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#b8924a] via-[#F3E5AB] to-[#b8924a] text-black font-extrabold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all border border-[#b8924a]/50"
                  >
                    <Eye size={14} />
                    <span>Voir le résultat en plein écran</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-lg">
                    Toutes les étapes complétées
                  </span>
                )
              ) : (
                <button
                  type="button"
                  onClick={goToNext}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5c0f21] hover:bg-[#7a1a2e] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Suivant</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
