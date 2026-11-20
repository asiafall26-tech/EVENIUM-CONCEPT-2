"use client";

import StudioShell from "../StudioShell";
import StudioSectionCard from "../StudioSectionCard";
import ToneSelector from "../ToneSelector";
import { builtInSections, sectionsOf } from "@/lib/invitationSections";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ImagePlus, Play, Plus, Trash2, Loader2, Music, UploadCloud, Pause, CheckCircle, HeartHandshake, BookHeart, Clock, Camera, MapPin, Quote, Sparkles } from "lucide-react";
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
  "w-full min-h-[3.25rem] px-4 py-3 bg-white hover:bg-gray-50/50 border border-gray-200 focus:border-[#b8924a] rounded-xl text-sm sm:text-base text-gray-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#b8924a]/30 transition-all shadow-2xs";

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5 w-full">
      <span className="block text-xs sm:text-sm font-semibold text-gray-800">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
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

      <div className="p-3 sm:p-4 bg-gray-50/90 rounded-2xl border border-gray-200/90 flex flex-col gap-3 shadow-2xs">
        {/* En-tête : Morceau actuel + contrôles avec pleine largeur sur mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#5c0f21]/10 text-[#5c0f21] flex items-center justify-center shrink-0">
              <Music size={20} />
            </div>

            <div className="flex-1 min-w-0">
              {value.url ? (
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-900 truncate" title={value.title || "Musique d'ouverture sélectionnée"}>
                    {value.title || "Musique d'ouverture sélectionnée"}
                  </p>
                  <p className="text-[11px] text-green-700 font-medium flex items-center gap-1 mt-0.5">
                    <CheckCircle size={12} className="shrink-0" /> Prête pour l&apos;ouverture
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700">Aucune musique ajoutée</p>
                  <p className="text-[11px] text-gray-400 truncate">{emptyHint}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end">
            {value.url && (
              <button
                type="button"
                onClick={togglePlay}
                className="flex-1 sm:flex-initial h-9 px-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors shadow-2xs"
                title={isPlaying ? "Mettre en pause" : "Écouter"}
              >
                {isPlaying ? <Pause size={14} className="text-[#5c0f21]" /> : <Play size={14} className="text-[#5c0f21]" />}
                <span>{isPlaying ? "Pause" : "Écouter"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5c0f21] hover:bg-[#7a1a2e] text-white text-xs font-semibold transition-colors shadow-2xs"
            >
              <Music size={14} />
              <span>{value.url ? "Changer" : "Choisir une musique"}</span>
            </button>
          </div>
        </div>

        {/* Bouton Import personnel */}
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-[#D4AF37]/50 bg-white text-xs font-semibold text-[#8a6d1f] hover:bg-[#FFFBF0] hover:border-[#D4AF37] transition-colors disabled:opacity-60 shadow-2xs"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
          {uploading ? "Import en cours…" : "Importer mon propre son (MP3, M4A, WAV)"}
        </button>
        {uploadError && <p className="text-[11px] text-red-600">{uploadError}</p>}

        {value.url && (
          <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
            <audio ref={audioPlayerRef} src={value.url} onEnded={() => setIsPlaying(false)} className="hidden" />
            <span className="text-[11px] text-gray-500">Se lance automatiquement à l&apos;ouverture</span>
            <button
              type="button"
              onClick={() => {
                if (audioPlayerRef.current) audioPlayerRef.current.pause();
                setIsPlaying(false);
                onChange({ url: "", title: "", start: 0, end: 0 });
              }}
              className="text-xs text-red-600 hover:underline font-medium"
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

  type VeloursMenuKey = "hero" | "welcome" | "story" | "details" | "programme" | "rsvp" | "media" | "all";
  const [activeMenu, setActiveMenu] = useState<VeloursMenuKey>("hero");

  const hiddenSecs = value.__hidden ?? [];
  const isHidden = (key: string) => hiddenSecs.includes(key);
  const toggleSec = (key: string) => {
    const next = isHidden(key) ? hiddenSecs.filter((k) => k !== key) : [...hiddenSecs, key];
    onChange({ ...value, __hidden: next });
  };

  const MENUS = [
    { id: "hero" as const, label: "1. Couverture & Mariés", shortLabel: "Couverture", icon: HeartHandshake, desc: "Prénoms des hôtes et phrase d'accroche", muted: isHidden("hero") },
    { id: "welcome" as const, label: "2. Mot d'accueil", shortLabel: "Accueil", icon: Sparkles, desc: "Titre et message d'accueil avec tonalités en 1 clic", muted: isHidden("welcome") },
    { id: "story" as const, label: "3. Notre Histoire", shortLabel: "Histoire", icon: BookHeart, desc: "Récit, citation d'amour et photo du couple", muted: isHidden("story") },
    { id: "details" as const, label: "4. Date, Lieux & Accès", shortLabel: "Lieux & Date", icon: MapPin, desc: "Date, horaires, adresse et carte interactive", muted: isHidden("details") },
    { id: "programme" as const, label: "5. Programme du Jour J", shortLabel: "Programme", icon: Clock, badge: value.programme.length, desc: "Déroulé heure par heure et photo du programme", muted: isHidden("programme") },
    { id: "rsvp" as const, label: "6. Confirmation (RSVP)", shortLabel: "RSVP & Fin", icon: Quote, desc: "Consignes de réponse, date limite et mot de fin", muted: isHidden("rsvp") },
    ...(!isStatic ? [{ id: "media" as const, label: "7. Musique d'ambiance", shortLabel: "Musique", icon: Music, desc: "Bande sonore d'ouverture" }] : []),
  ];

  return (
    <StudioShell
      title="Velours Bordeaux"
      subtitle="Personnalisez chaque section et son intitulé ci-dessous pour composer votre invitation."
      demoUrl="/invitation-mariage"
      menus={MENUS.map((m) => ({ id: m.id, label: String(("shortLabel" in m && m.shortLabel) || m.label), icon: m.icon, badge: "badge" in m ? m.badge : undefined, muted: m.muted }))}
      active={activeMenu}
      onActive={(id) => setActiveMenu(id as never)}
      onViewFullScreen={onViewFullScreen}
      onFinalize={onFinalize}
      sections={{
        defs: builtInSections("invit-7", value as unknown as Record<string, unknown>),
        state: sectionsOf(value),
        onChange: (st) => onChange({ ...value, __hidden: st.hidden, __rubriques: st.rubriques }),
      }}
    >
      {/* 1. Couverture & Mariés */}
      {(activeMenu === "hero" || activeMenu === "all") && (
        <StudioSectionCard
          num={1}
          icon={HeartHandshake}
          title="Section 1 : Couverture & Les Mariés"
          desc="Prénoms affichés au cœur de l'invitation et phrase d'accroche de bienvenue"
          isHidden={isHidden("hero")}
          onToggleHide={() => toggleSec("hero")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            <Field label="Prénom du 1er marié">
              <input className={inputCls} value={value.partnerA} onChange={(e) => set("partnerA", e.target.value)} placeholder="Ex : Alexandre" />
            </Field>
            <Field label="Prénom du 2nd marié">
              <input className={inputCls} value={value.partnerB} onChange={(e) => set("partnerB", e.target.value)} placeholder="Ex : Marie" />
            </Field>
          </div>
          <Field label="Intitulé de la couverture (Phrase d'accroche)" hint="S'affiche élégamment sur la couverture au-dessus des prénoms">
            <input className={inputCls} value={value.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Ex : Deux cœurs, une histoire, pour toujours ♡" />
          </Field>
        </StudioSectionCard>
      )}

      {/* 2. Mot d'accueil & Message */}
      {(activeMenu === "welcome" || activeMenu === "all") && (
        <StudioSectionCard
          num={2}
          icon={Sparkles}
          title="Section 2 : Mot d'accueil & Message"
          desc="Titre de bienvenue et message chaleureux partagé avec vos convives"
          isHidden={isHidden("welcome")}
          onToggleHide={() => toggleSec("welcome")}
        >
          <Field label="Intitulé de la section (Titre d'accueil)" hint="Le titre affiché en grand pour introduire votre message">
            <input className={inputCls} value={value.welcomeTitle} onChange={(e) => set("welcomeTitle", e.target.value)} placeholder="Ex : Chers amis & famille !" />
          </Field>

          {/* Tonalités d'inspirations prêtes à l'emploi */}
          <ToneSelector
            currentText={value.welcomeText}
            onSelect={(t) => onChange({ ...value, welcomeTitle: t.welcomeTitle, welcomeText: t.welcomeText })}
          />

          <Field label="Message d'accueil (Corps de l'invitation)">
            <textarea
              rows={4}
              className={`${inputCls} min-h-[110px] resize-y`}
              value={value.welcomeText}
              onChange={(e) => set("welcomeText", e.target.value)}
              placeholder="Rédigez votre mot d'accueil ou choisissez une tonalité ci-dessus..."
            />
          </Field>
        </StudioSectionCard>
      )}

      {/* 3. Notre Histoire & Récit */}
      {(activeMenu === "story" || activeMenu === "all") && (
        <StudioSectionCard
          num={3}
          icon={BookHeart}
          title="Section 3 : Notre Histoire & Récit"
          desc="Votre histoire d'amour, citation poétique et photo d'illustration"
          isHidden={isHidden("story")}
          onToggleHide={() => toggleSec("story")}
        >
          <Field label="Intitulé de la section (Citation ou Titre)" hint="Personnalisable (ex: « Notre Histoire », « Notre Rencontre », ou une citation d'amour)">
            <input className={inputCls} value={value.storyQuote} onChange={(e) => set("storyQuote", e.target.value)} placeholder="Ex : L'amour — notre plus belle aventure ♡" />
          </Field>

          <Field label="Récit de votre histoire">
            <textarea
              rows={4}
              className={`${inputCls} min-h-[110px] resize-y`}
              value={value.storyText}
              onChange={(e) => set("storyText", e.target.value)}
              placeholder="Partagez quelques lignes sur votre belle rencontre..."
            />
          </Field>

          <PhotoField label="Photo « Notre Histoire »" value={value.photoStory} onChange={(v) => set("photoStory", v)} />
        </StudioSectionCard>
      )}

      {/* 4. Date, Lieux & Accès */}
      {(activeMenu === "details" || activeMenu === "all") && (
        <StudioSectionCard
          num={4}
          icon={MapPin}
          title="Section 4 : Date, Lieux & Accès"
          desc="Calendrier, horaires, lieu de réception et adresse avec bouton GPS"
          isHidden={isHidden("details")}
          onToggleHide={() => toggleSec("details")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            <Field label="Date de l'événement">
              <input type="date" className={inputCls} value={value.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field label="Heure d'accueil">
              <input type="time" className={inputCls} value={value.time} onChange={(e) => set("time", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            <Field label="Ville">
              <input className={inputCls} value={value.city} onChange={(e) => set("city", e.target.value)} placeholder="Ex : Paris" />
            </Field>
            <Field label="Lieu de réception">
              <input className={inputCls} value={value.venue} onChange={(e) => set("venue", e.target.value)} placeholder="Ex : Domaine du Jardin Blanc" />
            </Field>
          </div>
          <Field label="Adresse complète" hint="Utilisée directement pour le bouton GPS « Voir sur la carte »">
            <input className={inputCls} value={value.address} onChange={(e) => set("address", e.target.value)} placeholder="Ex : 20 rue des Lilas, 75000 Paris" />
          </Field>
        </StudioSectionCard>
      )}

      {/* 5. Programme du Jour J */}
      {(activeMenu === "programme" || activeMenu === "all") && (
        <StudioSectionCard
          num={5}
          icon={Clock}
          title={`Section 5 : Programme du Jour J (${value.programme.length} étapes)`}
          desc="Déroulement chronologique heure par heure pour rythmer votre journée"
          badge={<span className="text-[11px] bg-[#5c0f21]/10 text-[#5c0f21] px-2.5 py-0.5 rounded-full font-bold">{value.programme.length} étape(s)</span>}
          isHidden={isHidden("programme")}
          onToggleHide={() => toggleSec("programme")}
        >
          <Field label="Intitulé du programme (Sous-titre ou Citation)" hint="Ex : « Déroulé de la journée », « Ce sera beau, délicieux et inoubliable ! »">
            <input className={inputCls} value={value.programmeQuote} onChange={(e) => set("programmeQuote", e.target.value)} placeholder="Ex : Ce sera beau, délicieux et inoubliable ! ♡" />
          </Field>

          <div className="space-y-2.5">
            <span className="block text-xs font-semibold text-gray-700">Étapes de la journée</span>
            {value.programme.map((p, i) => (
              <div key={i} className="flex gap-2 items-center bg-gray-50/80 p-3 rounded-xl border border-gray-200 shadow-2xs">
                <input
                  type="time"
                  className={`${inputCls} !w-28 shrink-0 !bg-white`}
                  value={p.time}
                  onChange={(e) => updateProgramme(i, { time: e.target.value })}
                />
                <input
                  className={`${inputCls} !bg-white`}
                  value={p.label}
                  placeholder="Ex : Cérémonie"
                  onChange={(e) => updateProgramme(i, { label: e.target.value })}
                />
                <button
                  type="button"
                  aria-label="Supprimer l'étape"
                  onClick={() => set("programme", value.programme.filter((_, idx) => idx !== i))}
                  className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => set("programme", [...value.programme, { time: "", label: "" }])}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#5c0f21]/30 text-xs font-semibold text-[#5c0f21] hover:bg-[#5c0f21]/5 transition-colors cursor-pointer"
          >
            <Plus size={15} /> Ajouter une étape au programme
          </button>

          <PhotoField label="Photo d'ambiance « Programme »" value={value.photoProgramme} onChange={(v) => set("photoProgramme", v)} />
        </StudioSectionCard>
      )}

      {/* 6. Confirmation (RSVP) & Mot de fin */}
      {(activeMenu === "rsvp" || activeMenu === "all") && (
        <StudioSectionCard
          num={6}
          icon={Quote}
          title="Section 6 : Confirmation (RSVP) & Mot de clôture"
          desc="Consignes de réponse adressées aux invités et signature finale"
          isHidden={isHidden("rsvp")}
          onToggleHide={() => toggleSec("rsvp")}
        >
          <Field label="Consignes de réponse (RSVP)" hint="Précisez la date limite ou la façon dont vos convives doivent vous répondre">
            <textarea
              rows={2}
              className={`${inputCls} resize-none`}
              value={value.rsvpText}
              onChange={(e) => set("rsvpText", e.target.value)}
              placeholder="Ex : Merci de nous confirmer votre présence avant le 1er mai..."
            />
          </Field>
          <Field label="Intitulé de fin (Signature ou Citation de clôture)">
            <input className={inputCls} value={value.closingQuote} onChange={(e) => set("closingQuote", e.target.value)} placeholder="Ex : Les petits moments créent les grands souvenirs" />
          </Field>
        </StudioSectionCard>
      )}

      {/* 7. Musique d'ambiance */}
      {(activeMenu === "media" || activeMenu === "all") && (
        <StudioSectionCard
          num={7}
          icon={Music}
          title={isStatic ? "Section 7 : Mode Carte Statique" : "Section 7 : Musique d'Ambiance"}
          desc={isStatic ? "Format visuel pur sans musique" : "Piste sonore lancée à l'ouverture avec découpe et volume"}
        >
          {isStatic ? (
            <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <span className="text-base">🔇</span>
              <div>
                <p className="font-bold text-amber-950">Option audio désactivée (Format Carte Statique)</p>
                <p className="mt-0.5 text-amber-800 leading-relaxed">
                  Votre invitation est configurée au format <strong>Carte statique classique</strong>. Ce format est conçu pour être purement visuel sans lecteur audio.
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
        </StudioSectionCard>
      )}
    </StudioShell>
  );
}
