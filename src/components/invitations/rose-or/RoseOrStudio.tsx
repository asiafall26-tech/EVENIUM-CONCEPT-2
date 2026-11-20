"use client";

import StudioShell from "../StudioShell";
import StudioSectionCard from "../StudioSectionCard";
import ToneSelector from "../ToneSelector";
import { builtInSections, sectionsOf } from "@/lib/invitationSections";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, BookHeart, Camera, Clock, HeartHandshake, MapPin, Music, Plus, Quote, Trash2, Sparkles } from "lucide-react";
import { AudioField, Field, inputCls, PhotoField } from "../velours/VeloursStudio";
import { MapsField } from "../sceau/SceauStudio";
import {
  DEFAULT_FOOTER_PHOTO,
  venueQuery,
  type ProgrammeItem,
  type RoseOrContent,
  type StoryItem,
} from "./content";

interface Props {
  value: RoseOrContent;
  onChange: (next: RoseOrContent) => void;
  onViewFullScreen?: () => void;
  onFinalize?: () => void;
  isStatic?: boolean;
}

const MAX_PHOTOS = 8;

const iconBtn =
  "w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent";
const dangerBtn = `${iconBtn} hover:!text-red-600 hover:!bg-red-50`;
const addCls =
  "w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#8a5243]/30 text-sm font-semibold text-[#8a5243] hover:bg-[#8a5243]/5 transition-colors";

function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const next = [...list];
  [next[i], next[i + dir]] = [next[i + dir], next[i]];
  return next;
}

/** Header of a repeatable card: label + move up/down + delete */
function RowTools({
  label,
  index,
  total,
  onMove,
  onRemove,
}: {
  label: string;
  index: number;
  total: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-[#8a5243]">{label}</span>
      <div className="ml-auto flex">
        <button type="button" className={iconBtn} disabled={index === 0} onClick={() => onMove(-1)} aria-label="Monter">
          <ArrowUp size={16} />
        </button>
        <button type="button" className={iconBtn} disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Descendre">
          <ArrowDown size={16} />
        </button>
        <button type="button" className={dangerBtn} onClick={onRemove} aria-label="Supprimer">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

type MenuKey = "general" | "quote" | "gallery" | "story" | "programme" | "venue" | "rsvp" | "music" | "all";

interface MenuDef {
  id: MenuKey;
  label: string;
  shortLabel: string;
  icon: typeof HeartHandshake;
  badge?: number;
  desc: string;
  muted?: boolean;
}

export default function RoseOrStudio({ value, onChange, onViewFullScreen, onFinalize, isStatic }: Props) {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("general");

  const set = <K extends keyof RoseOrContent>(key: K, v: RoseOrContent[K]) => onChange({ ...value, [key]: v });

  const { gallery, story, programme } = value;
  const setStory = (i: number, patch: Partial<StoryItem>) => set("story", story.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const setStep = (i: number, patch: Partial<ProgrammeItem>) => set("programme", programme.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const hiddenSecs = value.__hidden ?? [];
  const isHidden = (key: string) => hiddenSecs.includes(key);
  const toggleSec = (key: string) => {
    const next = isHidden(key) ? hiddenSecs.filter((k) => k !== key) : [...hiddenSecs, key];
    onChange({ ...value, __hidden: next });
  };

  const MENUS: MenuDef[] = [
    { id: "general", label: "1. Couverture & Mariés", shortLabel: "Couverture", icon: HeartHandshake, desc: "Prénoms, date, heure et phrase d'introduction" },
    { id: "quote", label: "2. Citation & Message", shortLabel: "Citation", icon: Quote, desc: "Citation d'amour et texte de célébration avec tonalités en 1 clic", muted: isHidden("quote") },
    { id: "gallery", label: "3. Galerie Photos", shortLabel: "Galerie", icon: Camera, badge: gallery.length, desc: "Photos du carrousel animé et titre", muted: isHidden("gallery") },
    { id: "story", label: "4. Notre Histoire", shortLabel: "Histoire", icon: BookHeart, badge: story.length, desc: "Moments clés de votre parcours", muted: isHidden("story") },
    { id: "programme", label: "5. Déroulé du Jour J", shortLabel: "Le Déroulé", icon: Clock, badge: programme.length, desc: "Programme heure par heure de la journée", muted: isHidden("programme") },
    { id: "venue", label: "6. Lieu & Accès", shortLabel: "Lieu & Maps", icon: MapPin, desc: "Salle, adresse, horaires et carte interactive", muted: isHidden("details") },
    { id: "rsvp", label: "7. Confirmation & RSVP", shortLabel: "RSVP & Fin", icon: Sparkles, desc: "Date limite de confirmation, message et signature", muted: isHidden("rsvp") },
    ...(!isStatic ? [{ id: "music" as const, label: "8. Musique d'ambiance", shortLabel: "Musique", icon: Music, desc: "Piste sonore d'ouverture" }] : []),
  ];

  return (
    <StudioShell
      title="Rose Poudrée & Or"
      subtitle="Personnalisez chaque section et son intitulé ci-dessous pour composer votre invitation."
      demoUrl="/invitation-rose-or"
      menus={MENUS.map((m) => ({ id: m.id, label: String(("shortLabel" in m && m.shortLabel) || m.label), icon: m.icon, badge: "badge" in m ? m.badge : undefined, muted: m.muted }))}
      active={activeMenu}
      onActive={(id) => setActiveMenu(id as never)}
      onViewFullScreen={onViewFullScreen}
      onFinalize={onFinalize}
      sections={{
        defs: builtInSections("invit-10", value as unknown as Record<string, unknown>),
        state: sectionsOf(value),
        onChange: (st) => onChange({ ...value, __hidden: st.hidden, __rubriques: st.rubriques }),
      }}
    >
      {/* 1. Les Mariés & la Date */}
      {(activeMenu === "general" || activeMenu === "all") && (
        <StudioSectionCard
          num={1}
          icon={HeartHandshake}
          title="Section 1 : Couverture & Les Mariés"
          desc="Prénoms affichés au cœur de l'invitation, date officielle et compte à rebours"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            <Field label="Prénom du 1er marié">
              <input className={inputCls} value={value.partnerA} placeholder="Ex: Adama" onChange={(e) => set("partnerA", e.target.value)} />
            </Field>
            <Field label="Prénom du 2nd marié">
              <input className={inputCls} value={value.partnerB} placeholder="Ex: Mariama" onChange={(e) => set("partnerB", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            <Field label="Date de l'événement">
              <input type="date" className={inputCls} value={value.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field label="Heure cible (compte à rebours)">
              <input type="time" className={inputCls} value={value.time} onChange={(e) => set("time", e.target.value)} />
            </Field>
          </div>
          <Field label="Intitulé au-dessus des prénoms (Phrase d'accroche)" hint="Ex : « Nous allons nous marier »">
            <input className={inputCls} value={value.kicker} onChange={(e) => set("kicker", e.target.value)} placeholder="Ex : Nous allons nous marier !" />
          </Field>
        </StudioSectionCard>
      )}

      {/* 2. Citation & Textes */}
      {(activeMenu === "quote" || activeMenu === "all") && (
        <StudioSectionCard
          num={2}
          icon={Quote}
          title="Section 2 : Citation & Message d'Accueil"
          desc="Phrases poétiques et message de célébration affichés sous l'ouverture"
          isHidden={isHidden("quote")}
          onToggleHide={() => toggleSec("quote")}
        >
          {/* Tonalités d'inspirations prêtes à l'emploi */}
          <ToneSelector
            currentText={value.quote}
            onSelect={(t) => onChange({ ...value, quote: t.welcomeText, countdownText: t.welcomeTitle })}
          />

          <Field label="Citation ou Message d'amour des mariés" hint="Sautez une ligne pour couper la phrase harmonieusement">
            <textarea
              rows={4}
              className={`${inputCls} min-h-[100px] resize-y`}
              value={value.quote}
              onChange={(e) => set("quote", e.target.value)}
              placeholder="Ex : Deux âmes réunies pour une vie d'amour..."
            />
          </Field>
          <Field label="Intitulé sous le compte à rebours" hint="Ex : « jusqu'au plus beau jour de nos vies »">
            <textarea rows={2} className={`${inputCls} resize-none`} value={value.countdownText} onChange={(e) => set("countdownText", e.target.value)} />
          </Field>
        </StudioSectionCard>
      )}

      {/* 3. Galerie Photos */}
      {(activeMenu === "gallery" || activeMenu === "all") && (
        <StudioSectionCard
          num={3}
          icon={Camera}
          title={`Section 3 : Galerie Photos (${gallery.length}/${MAX_PHOTOS})`}
          desc="Photos haute définition qui défilent dans le carrousel animé"
          badge={<span className="text-[11px] bg-[#8a5243]/10 text-[#8a5243] px-2.5 py-0.5 rounded-full font-bold">{gallery.length}/{MAX_PHOTOS} photo(s)</span>}
          isHidden={isHidden("gallery")}
          onToggleHide={() => toggleSec("gallery")}
        >
          <Field label="Intitulé de la galerie (Titre)">
            <input className={inputCls} value={value.galleryTitle} onChange={(e) => set("galleryTitle", e.target.value)} placeholder="Ex : Nos Plus Beaux Souvenirs" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {gallery.map((src, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-3.5 space-y-2 shadow-xs">
                <RowTools
                  label={`Photo ${i + 1}`}
                  index={i}
                  total={gallery.length}
                  onMove={(dir) => set("gallery", move(gallery, i, dir))}
                  onRemove={() => set("gallery", gallery.filter((_, idx) => idx !== i))}
                />
                <PhotoField
                  label=""
                  value={src}
                  onChange={(v) =>
                    set(
                      "gallery",
                      v ? gallery.map((x, idx) => (idx === i ? v : x)) : gallery.filter((_, idx) => idx !== i),
                    )
                  }
                />
              </div>
            ))}
          </div>

          {gallery.length < MAX_PHOTOS && (
            <PhotoField label="Ajouter une photo à la galerie" value="" onChange={(v) => v && set("gallery", [...gallery, v])} />
          )}
          {gallery.length === 0 && <p className="text-xs text-amber-700 italic">Sans photo, la section galerie est automatiquement masquée sur l'invitation.</p>}
        </StudioSectionCard>
      )}

      {/* 4. Notre Histoire */}
      {(activeMenu === "story" || activeMenu === "all") && (
        <StudioSectionCard
          num={4}
          icon={BookHeart}
          title={`Section 4 : Notre Histoire (${story.length} étapes)`}
          desc="Racontez votre parcours : la rencontre, le premier voyage, la demande en mariage"
          badge={<span className="text-[11px] bg-[#8a5243]/10 text-[#8a5243] px-2.5 py-0.5 rounded-full font-bold">{story.length} étape(s)</span>}
          isHidden={isHidden("story")}
          onToggleHide={() => toggleSec("story")}
        >
          <Field label="Intitulé de la section (Titre)">
            <input className={inputCls} value={value.storyTitle} onChange={(e) => set("storyTitle", e.target.value)} placeholder="Ex : Notre Histoire" />
          </Field>

          <div className="space-y-3.5">
            {story.map((s, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-xs">
                <RowTools
                  label={`Étape ${i + 1}`}
                  index={i}
                  total={story.length}
                  onMove={(dir) => set("story", move(story, i, dir))}
                  onRemove={() => set("story", story.filter((_, idx) => idx !== i))}
                />
                <div className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-3">
                  <Field label="Année">
                    <input className={inputCls} value={s.year} placeholder="2022" onChange={(e) => setStory(i, { year: e.target.value })} />
                  </Field>
                  <Field label="Intitulé de l'étape">
                    <input className={inputCls} value={s.title} placeholder="Notre rencontre" onChange={(e) => setStory(i, { title: e.target.value })} />
                  </Field>
                </div>
                <Field label="Récit de l'étape">
                  <textarea rows={3} className={`${inputCls} min-h-[90px] resize-y`} value={s.text} onChange={(e) => setStory(i, { text: e.target.value })} />
                </Field>
              </div>
            ))}
          </div>

          <button type="button" className={addCls} onClick={() => set("story", [...story, { year: "", title: "", text: "" }])}>
            <Plus size={16} /> Ajouter une étape à notre histoire
          </button>
        </StudioSectionCard>
      )}

      {/* 5. Le Déroulé */}
      {(activeMenu === "programme" || activeMenu === "all") && (
        <StudioSectionCard
          num={5}
          icon={Clock}
          title={`Section 5 : Le Déroulé du Jour J (${programme.length} moments)`}
          desc="Programme chronologique pour guider vos invités tout au long de la fête"
          badge={<span className="text-[11px] bg-[#8a5243]/10 text-[#8a5243] px-2.5 py-0.5 rounded-full font-bold">{programme.length} moment(s)</span>}
          isHidden={isHidden("programme")}
          onToggleHide={() => toggleSec("programme")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            <Field label="Intitulé principal (Titre)">
              <input className={inputCls} value={value.programmeTitle} onChange={(e) => set("programmeTitle", e.target.value)} placeholder="Ex : Le Déroulé" />
            </Field>
            <Field label="Sous-titre du programme">
              <input className={inputCls} value={value.programmeSubtitle} onChange={(e) => set("programmeSubtitle", e.target.value)} placeholder="Ex : Chaque instant compte" />
            </Field>
          </div>

          <div className="space-y-3.5">
            {programme.map((p, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-xs">
                <RowTools
                  label={`Moment ${i + 1}`}
                  index={i}
                  total={programme.length}
                  onMove={(dir) => set("programme", move(programme, i, dir))}
                  onRemove={() => set("programme", programme.filter((_, idx) => idx !== i))}
                />
                <div className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-3">
                  <Field label="Horaire">
                    <input type="time" className={inputCls} value={p.time} onChange={(e) => setStep(i, { time: e.target.value })} />
                  </Field>
                  <Field label="Intitulé du moment">
                    <input className={inputCls} value={p.title} placeholder="Cérémonie civile" onChange={(e) => setStep(i, { title: e.target.value })} />
                  </Field>
                </div>
                <Field label="Description courte">
                  <textarea rows={2} className={`${inputCls} min-h-[70px] resize-y`} value={p.text} placeholder="Ex: Là où deux cœurs n'en font plus qu'un" onChange={(e) => setStep(i, { text: e.target.value })} />
                </Field>
              </div>
            ))}
          </div>

          <button type="button" className={addCls} onClick={() => set("programme", [...programme, { time: "", title: "", text: "" }])}>
            <Plus size={16} /> Ajouter un moment au déroulé
          </button>
        </StudioSectionCard>
      )}

      {/* 6. Lieu & Accès */}
      {(activeMenu === "venue" || activeMenu === "all") && (
        <StudioSectionCard
          num={6}
          icon={MapPin}
          title="Section 6 : Lieu & Itinéraire Google Maps"
          desc="Permet à vos convives d'ouvrir l'itinéraire directement dans leur application GPS"
          isHidden={isHidden("details")}
          onToggleHide={() => toggleSec("details")}
        >
          <Field label="Nom du lieu ou de la salle (Intitulé)">
            <input className={inputCls} value={value.venue} placeholder="Ex: Les Jardins de la Corniche" onChange={(e) => set("venue", e.target.value)} />
          </Field>
          <Field label="Adresse complète">
            <input className={inputCls} value={value.address} placeholder="Ex: Corniche Ouest, Dakar, Sénégal" onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field label="Horaires et consignes affichées" hint="Ex : « La cérémonie débute à 17 h 30 · fin vers 1 h »">
            <input className={inputCls} value={value.scheduleLine} onChange={(e) => set("scheduleLine", e.target.value)} />
          </Field>
          <MapsField label="Lien Google Maps personnalisé" value={value.mapsUrl} query={venueQuery(value)} onChange={(v) => set("mapsUrl", v)} />
        </StudioSectionCard>
      )}

      {/* 7. Confirmation (RSVP) & Fin */}
      {(activeMenu === "rsvp" || activeMenu === "all") && (
        <StudioSectionCard
          num={7}
          icon={Sparkles}
          title="Section 7 : Confirmation (RSVP) & Signature"
          desc="Conditions de confirmation et photo de signature finale"
          isHidden={isHidden("rsvp")}
          onToggleHide={() => toggleSec("rsvp")}
        >
          <Field label="Date limite de confirmation" hint="Laissez vide si vous ne souhaitez pas de date butoir">
            <input className={inputCls} value={value.rsvpDeadline} placeholder="Ex: 8 novembre 2026" onChange={(e) => set("rsvpDeadline", e.target.value)} />
          </Field>
          <Field label="Consignes pour les convives">
            <textarea rows={3} className={`${inputCls} min-h-[85px] resize-y`} value={value.rsvpText} onChange={(e) => set("rsvpText", e.target.value)} placeholder="Ex : Merci de nous confirmer votre présence..." />
          </Field>
          <PhotoField
            label="Photo de signature de fin (facultatif)"
            value={value.footerPhoto === DEFAULT_FOOTER_PHOTO ? "" : value.footerPhoto}
            onChange={(v) => set("footerPhoto", v || DEFAULT_FOOTER_PHOTO)}
          />
          <Field label="Intitulé de signature finale" hint="Ex : « Fait avec amour »">
            <input className={inputCls} value={value.footerText} onChange={(e) => set("footerText", e.target.value)} placeholder="Ex : Avec tout notre amour" />
          </Field>
        </StudioSectionCard>
      )}

      {/* 8. Musique d'ambiance */}
      {(activeMenu === "music" || activeMenu === "all") && (
        <StudioSectionCard
          num={8}
          icon={Music}
          title={isStatic ? "Section 8 : Mode Carte Statique" : "Section 8 : Musique d'Ambiance"}
          desc={isStatic ? "Format visuel pur sans musique" : "Piste sonore jouée à l'ouverture de l'invitation"}
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
              label="Musique d'ambiance de l'invitation"
              value={{ url: value.music, title: value.musicTitle, start: value.musicStart ?? 0, end: value.musicEnd ?? 0 }}
              onChange={(a) => onChange({ ...value, music: a.url, musicTitle: a.title, musicStart: a.start, musicEnd: a.end })}
            />
          )}
        </StudioSectionCard>
      )}
    </StudioShell>
  );
}
