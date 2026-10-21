"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BookHeart,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  HeartHandshake,
  Layers,
  MapPin,
  Music,
  Plus,
  Quote,
  Trash2,
  Eye,
  Sparkles,
} from "lucide-react";
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

type MenuKey = "general" | "quote" | "gallery" | "story" | "programme" | "venue" | "rsvp" | "all";

interface MenuDef {
  id: MenuKey;
  label: string;
  shortLabel: string;
  icon: typeof HeartHandshake;
  badge?: number;
  desc: string;
}

export default function RoseOrStudio({ value, onChange, onViewFullScreen, onFinalize, isStatic }: Props) {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("general");

  const set = <K extends keyof RoseOrContent>(key: K, v: RoseOrContent[K]) => onChange({ ...value, [key]: v });

  const { gallery, story, programme } = value;
  const setStory = (i: number, patch: Partial<StoryItem>) => set("story", story.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const setStep = (i: number, patch: Partial<ProgrammeItem>) => set("programme", programme.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const MENUS: MenuDef[] = [
    { id: "general", label: "Les Mariés & la Date", shortLabel: "Mariés & Date", icon: HeartHandshake, desc: "Prénoms, date, heure et phrase d'introduction" },
    { id: "quote", label: "Citation & Textes", shortLabel: "Citation & Textes", icon: Quote, desc: "Citation d'amour et texte du compte à rebours" },
    { id: "gallery", label: "Galerie Photos", shortLabel: "Galerie Photos", icon: Camera, badge: gallery.length, desc: "Photos du carrousel et titre de la galerie" },
    { id: "story", label: "Notre Histoire", shortLabel: "Notre Histoire", icon: BookHeart, badge: story.length, desc: "Les moments clés de votre rencontre à aujourd'hui" },
    { id: "programme", label: "Déroulé du Jour J", shortLabel: "Le Déroulé", icon: Clock, badge: programme.length, desc: "Programme heure par heure de la journée" },
    { id: "venue", label: "Lieu & Google Maps", shortLabel: "Lieu & Maps", icon: MapPin, desc: "Salle, adresse, horaires et carte interactive" },
    {
      id: "rsvp",
      label: isStatic ? "RSVP (Sans son)" : "RSVP & Musique",
      shortLabel: isStatic ? "RSVP" : "RSVP & Musique",
      icon: Music,
      desc: isStatic ? "Date limite de confirmation, message convives et signature" : "Date limite de confirmation, message et ambiance musicale"
    },
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-semibold shrink-0">
            Rose Poudrée &amp; Or
          </span>
          <p className="text-xs text-gray-500 truncate hidden sm:block">
            Renseignez et personnalisez les informations de votre événement ci-dessous.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/invitation-rose-or"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-black text-xs font-semibold transition-all shadow-xs shrink-0 hidden sm:inline-flex"
          >
            <ExternalLink size={13} />
            <span>Démo modèle</span>
          </a>
        </div>
      </div>

      {/* Main Container - Full Width */}
      <div className="w-full flex-1 min-h-0 overflow-clip lg:overflow-hidden flex flex-col">
        {/* Editor Panel */}
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
                        ? "bg-[#8a5243] text-white shadow-sm"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-200/60"
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-white" : "text-[#8a5243]"} />
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
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6">
            {/* 1. Les Mariés & la Date */}
            {(activeMenu === "general" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#8a5243]/10 text-[#8a5243] flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Les Mariés &amp; la Date du Mariage</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Prénoms affichés au cœur de l'invitation, date officielle et compte à rebours.</p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field label="Prénom du 1er marié">
                      <input className={inputCls} value={value.partnerA} placeholder="Ex: Adama" onChange={(e) => set("partnerA", e.target.value)} />
                    </Field>
                    <Field label="Prénom du 2nd marié">
                      <input className={inputCls} value={value.partnerB} placeholder="Ex: Mariama" onChange={(e) => set("partnerB", e.target.value)} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field label="Date de l'événement">
                      <input type="date" className={inputCls} value={value.date} onChange={(e) => set("date", e.target.value)} />
                    </Field>
                    <Field label="Heure cible (compte à rebours)">
                      <input type="time" className={inputCls} value={value.time} onChange={(e) => set("time", e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Phrase au-dessus des prénoms (vidéo d'ouverture)" hint="Ex : « Nous allons nous marier »">
                    <input className={inputCls} value={value.kicker} onChange={(e) => set("kicker", e.target.value)} />
                  </Field>
                </div>
              </section>
            )}

            {/* 2. Citation & Textes */}
            {(activeMenu === "quote" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#8a5243]/10 text-[#8a5243] flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Citation &amp; Compte à Rebours</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Phrases poétiques et message de célébration affichés sous la vidéo.</p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <Field label="Citation des mariés" hint="Sautez une ligne pour couper la phrase harmonieusement.">
                    <textarea rows={3} className={`${inputCls} resize-none`} value={value.quote} onChange={(e) => set("quote", e.target.value)} />
                  </Field>
                  <Field label="Texte sous le compte à rebours" hint="Ex : « jusqu'au plus beau jour de nos vies »">
                    <textarea rows={2} className={`${inputCls} resize-none`} value={value.countdownText} onChange={(e) => set("countdownText", e.target.value)} />
                  </Field>
                </div>
              </section>
            )}

            {/* 3. Galerie Photos */}
            {(activeMenu === "gallery" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#8a5243]/10 text-[#8a5243] flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">
                      Galerie Photos ({gallery.length}/{MAX_PHOTOS})
                    </h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Photos haute définition qui défilent dans le carrousel animé.</p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <Field label="Titre de la galerie">
                    <input className={inputCls} value={value.galleryTitle} onChange={(e) => set("galleryTitle", e.target.value)} />
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
                </div>
              </section>
            )}

            {/* 4. Notre Histoire */}
            {(activeMenu === "story" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#8a5243]/10 text-[#8a5243] flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Notre Histoire ({story.length} étapes)</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Racontez votre parcours : la rencontre, le premier voyage, la demande en mariage.</p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <Field label="Titre de la section">
                    <input className={inputCls} value={value.storyTitle} onChange={(e) => set("storyTitle", e.target.value)} />
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
                        <div className="grid grid-cols-[6rem_1fr] gap-3">
                          <Field label="Année">
                            <input className={inputCls} value={s.year} placeholder="2022" onChange={(e) => setStory(i, { year: e.target.value })} />
                          </Field>
                          <Field label="Titre de l'étape">
                            <input className={inputCls} value={s.title} placeholder="Notre rencontre" onChange={(e) => setStory(i, { title: e.target.value })} />
                          </Field>
                        </div>
                        <Field label="Récit de l'étape">
                          <textarea rows={3} className={`${inputCls} resize-none`} value={s.text} onChange={(e) => setStory(i, { text: e.target.value })} />
                        </Field>
                      </div>
                    ))}
                  </div>

                  <button type="button" className={addCls} onClick={() => set("story", [...story, { year: "", title: "", text: "" }])}>
                    <Plus size={16} /> Ajouter une étape à notre histoire
                  </button>
                </div>
              </section>
            )}

            {/* 5. Le Déroulé */}
            {(activeMenu === "programme" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#8a5243]/10 text-[#8a5243] flex items-center justify-center font-bold text-xs">
                      5
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Le Déroulé du Jour J ({programme.length} moments)</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Programme chronologique pour guider vos invités tout au long de la fête.</p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field label="Titre principal">
                      <input className={inputCls} value={value.programmeTitle} onChange={(e) => set("programmeTitle", e.target.value)} />
                    </Field>
                    <Field label="Sous-titre">
                      <input className={inputCls} value={value.programmeSubtitle} onChange={(e) => set("programmeSubtitle", e.target.value)} />
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
                        <div className="grid grid-cols-[7rem_1fr] gap-3">
                          <Field label="Horaire">
                            <input type="time" className={inputCls} value={p.time} onChange={(e) => setStep(i, { time: e.target.value })} />
                          </Field>
                          <Field label="Intitulé du moment">
                            <input className={inputCls} value={p.title} placeholder="Cérémonie civile" onChange={(e) => setStep(i, { title: e.target.value })} />
                          </Field>
                        </div>
                        <Field label="Description courte">
                          <input className={inputCls} value={p.text} placeholder="Ex: Là où deux cœurs n'en font plus qu'un" onChange={(e) => setStep(i, { text: e.target.value })} />
                        </Field>
                      </div>
                    ))}
                  </div>

                  <button type="button" className={addCls} onClick={() => set("programme", [...programme, { time: "", title: "", text: "" }])}>
                    <Plus size={16} /> Ajouter un moment au déroulé
                  </button>
                </div>
              </section>
            )}

            {/* 6. Lieu & Google Maps */}
            {(activeMenu === "venue" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#8a5243]/10 text-[#8a5243] flex items-center justify-center font-bold text-xs">
                      6
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Lieu &amp; Itinéraire Google Maps</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Permet à vos convives d'ouvrir l'itinéraire directement dans leur application GPS.</p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <Field label="Nom du lieu ou de la salle">
                    <input className={inputCls} value={value.venue} placeholder="Ex: Les Jardins de la Corniche" onChange={(e) => set("venue", e.target.value)} />
                  </Field>
                  <Field label="Adresse complète">
                    <input className={inputCls} value={value.address} placeholder="Ex: Corniche Ouest, Dakar, Sénégal" onChange={(e) => set("address", e.target.value)} />
                  </Field>
                  <Field label="Horaires et consignes affichées" hint="Ex : « La cérémonie débute à 17 h 30 · fin vers 1 h »">
                    <input className={inputCls} value={value.scheduleLine} onChange={(e) => set("scheduleLine", e.target.value)} />
                  </Field>
                  <MapsField label="Lien Google Maps personnalisé" value={value.mapsUrl} query={venueQuery(value)} onChange={(v) => set("mapsUrl", v)} />
                </div>
              </section>
            )}

            {/* 7. RSVP & Musique */}
            {(activeMenu === "rsvp" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#8a5243]/10 text-[#8a5243] flex items-center justify-center font-bold text-xs">
                      7
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">
                      {isStatic ? "Confirmation (RSVP) & Signature" : "Confirmation (RSVP) & Musique"}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isStatic
                      ? "Conditions de confirmation et photo de signature finale pour votre carte statique."
                      : "Conditions de confirmation, musique d'ambiance et photo de signature finale."}
                  </p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <Field label="Date limite de confirmation" hint="Laissez vide si vous ne souhaitez pas de date butoir.">
                    <input className={inputCls} value={value.rsvpDeadline} placeholder="Ex: 8 novembre 2026" onChange={(e) => set("rsvpDeadline", e.target.value)} />
                  </Field>
                  <Field label="Message pour les convives" hint="Ex : « Les places étant limitées, chaque invitation est nominative. »">
                    <textarea rows={2} className={`${inputCls} resize-none`} value={value.rsvpText} onChange={(e) => set("rsvpText", e.target.value)} />
                  </Field>
                  <PhotoField
                    label="Photo de signature de fin (facultatif)"
                    value={value.footerPhoto === DEFAULT_FOOTER_PHOTO ? "" : value.footerPhoto}
                    onChange={(v) => set("footerPhoto", v || DEFAULT_FOOTER_PHOTO)}
                  />
                  <Field label="Signature finale" hint="Ex : « Fait avec amour »">
                    <input className={inputCls} value={value.footerText} onChange={(e) => set("footerText", e.target.value)} />
                  </Field>
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
                      label="Musique d'ambiance de l'invitation"
                      value={{ url: value.music, title: value.musicTitle, start: value.musicStart ?? 0, end: value.musicEnd ?? 0 }}
                      onChange={(a) => onChange({ ...value, music: a.url, musicTitle: a.title, musicStart: a.start, musicEnd: a.end })}
                    />
                  )}
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8a5243] hover:bg-[#6e3f33] text-white text-xs font-semibold shadow-xs transition-colors"
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
