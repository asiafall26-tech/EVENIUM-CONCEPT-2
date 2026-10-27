"use client";

import StudioShell from "../StudioShell";
import { builtInSections, sectionsOf } from "@/lib/invitationSections";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Clock, HeartHandshake, MapPin, Music, Palette, Play, Plus, Sparkles, Trash2 } from "lucide-react";
import { AudioField, Field, Group, inputCls, PhotoField } from "../velours/VeloursStudio";
import { DressCodeEditor, MapsField } from "../sceau/SceauStudio";
import { DEFAULT_PHOTO, EMPTY_VENUE, type IvoireContent, type ProgrammeBlock, type TimeItem, type Venue } from "./content";

interface Props {
  value: IvoireContent;
  onChange: (next: IvoireContent) => void;
  onViewFullScreen?: () => void;
  onFinalize?: () => void;
  isStatic?: boolean;
}

const iconBtn =
  "w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent";
const dangerBtn = `${iconBtn} hover:!text-red-600 hover:!bg-red-50`;
const addBtn = "flex items-center gap-2 text-sm font-semibold text-[#6e1a25] hover:underline";

const FOCUS = [
  { label: "Haut de la photo", value: "50% 15%" },
  { label: "Centre", value: "52% 45%" },
  { label: "Bas de la photo", value: "50% 85%" },
];

function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const next = [...list];
  [next[i], next[i + dir]] = [next[i + dir], next[i]];
  return next;
}

function TimeRows({ items, onChange, placeholder }: { items: TimeItem[]; onChange: (v: TimeItem[]) => void; placeholder: string }) {
  const setItem = (i: number, patch: Partial<TimeItem>) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input type="time" className={`${inputCls} !w-28 shrink-0`} value={it.time} onChange={(e) => setItem(i, { time: e.target.value })} />
          <input className={inputCls} value={it.label} placeholder={placeholder} onChange={(e) => setItem(i, { label: e.target.value })} />
          <button type="button" aria-label="Supprimer" className={dangerBtn} onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function VenueEditor({
  v,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  v: Venue;
  index: number;
  total: number;
  onChange: (v: Venue) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof Venue>(k: K, val: Venue[K]) => onChange({ ...v, [k]: val });
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6e1a25]">Lieu {index + 1}</span>
        <div className="ml-auto flex">
          <button type="button" className={iconBtn} disabled={index === 0} onClick={() => onMove(-1)} aria-label="Monter">
            <ArrowUp size={16} />
          </button>
          <button type="button" className={iconBtn} disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Descendre">
            <ArrowDown size={16} />
          </button>
          <button type="button" className={dangerBtn} onClick={onRemove} aria-label="Supprimer le lieu">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <Field label="Phrase d'introduction">
        <input className={inputCls} value={v.intro} placeholder="Rejoignez-nous à" onChange={(e) => set("intro", e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nom du lieu">
          <input className={inputCls} value={v.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Moment">
          <input className={inputCls} value={v.kind} placeholder="Cérémonie civile" onChange={(e) => set("kind", e.target.value)} />
        </Field>
      </div>
      <Field label="Adresse">
        <input className={inputCls} value={v.address} onChange={(e) => set("address", e.target.value)} />
      </Field>
      <Field label="Horaire / consigne">
        <input className={inputCls} value={v.when} placeholder="Merci d'être présent(e) dès 13H45" onChange={(e) => set("when", e.target.value)} />
      </Field>
      <MapsField label="Lien Google Maps" value={v.mapsUrl} query={[v.name, v.address].filter(Boolean).join(", ")} onChange={(val) => set("mapsUrl", val)} />
    </div>
  );
}

export default function IvoireStudio({ value, onChange, onViewFullScreen, onFinalize, isStatic }: Props) {
  type IvoireMenuKey = "general" | "welcome" | "venues" | "programme" | "rsvp" | "music" | "all";
  const [activeMenu, setActiveMenu] = useState<IvoireMenuKey>("general");

  const set = <K extends keyof IvoireContent>(key: K, v: IvoireContent[K]) => onChange({ ...value, [key]: v });

  const venues = value.venues;
  const blocks = value.programme;
  const setBlock = (i: number, b: ProgrammeBlock) => set("programme", blocks.map((x, idx) => (idx === i ? b : x)));

  const MENUS = [
    { id: "general" as const, label: "Les Mariés & Photos", shortLabel: "Mariés & Photos", icon: HeartHandshake, desc: "Prénoms, date, photos de couverture et horaires" },
    { id: "welcome" as const, label: "Mot de Bienvenue", shortLabel: "Bienvenue", icon: Sparkles, desc: "Introduction poétique et texte de présentation" },
    { id: "venues" as const, label: "Lieux & Google Maps", shortLabel: "Lieux & Maps", icon: MapPin, badge: venues.length, desc: "Cérémonie, cocktail, réception et itinéraires GPS" },
    { id: "programme" as const, label: "Programme de la Journée", shortLabel: "Programme", icon: Clock, badge: blocks.length, desc: "Organisation par parties et étapes horaires" },
    { id: "rsvp" as const, label: "Dress Code & Fin", shortLabel: "Dress Code & RSVP", icon: Palette, badge: value.dressColors.length, desc: "Palette de couleurs, date limite et mot de fin" },
    {
      id: "music" as const,
      label: isStatic ? "Musique (Désactivée)" : "Musique d'ambiance",
      shortLabel: "Musique",
      icon: Music,
      desc: isStatic ? "Option désactivée sur carte statique sans son" : "Votre propre son et la partie jouée à l'ouverture"
    },
  ];

  const currentMenuIndex = MENUS.findIndex((m) => m.id === activeMenu);


  return (
    <StudioShell
      title="Ivoire Couture"
      subtitle={"Renseignez et personnalisez les informations de votre événement ci-dessous."}
      demoUrl="/invitation-ivoire"
      menus={MENUS.map((m) => ({ id: m.id, label: String(("shortLabel" in m && m.shortLabel) || m.label), icon: m.icon, badge: "badge" in m ? m.badge : undefined }))}
      active={activeMenu}
      onActive={(id) => setActiveMenu(id as never)}
      onViewFullScreen={onViewFullScreen}
      onFinalize={onFinalize}
      sections={{
        defs: builtInSections("invit-9", value as unknown as Record<string, unknown>),
        state: sectionsOf(value),
        onChange: (st) => onChange({ ...value, __hidden: st.hidden, __rubriques: st.rubriques }),
      }}
    >
            {/* 1. Mariés & Photos */}
            {(activeMenu === "general" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#6e1a25]/10 text-[#6e1a25] flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Les Mariés, Date &amp; Photos</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Prénoms, date, textes d&apos;enveloppe et photos d&apos;ambiance.</p>
                </div>

                <div className="p-3 sm:p-5 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                    <Field label="Prénom 1">
                      <input className={inputCls} value={value.partnerA} onChange={(e) => set("partnerA", e.target.value)} />
                    </Field>
                    <Field label="Prénom 2">
                      <input className={inputCls} value={value.partnerB} onChange={(e) => set("partnerB", e.target.value)} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                    <Field label="Date de l'événement">
                      <input type="date" className={inputCls} value={value.date} onChange={(e) => set("date", e.target.value)} />
                    </Field>
                    <Field label="Heure (compte à rebours)">
                      <input type="time" className={inputCls} value={value.time} onChange={(e) => set("time", e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Texte sur l'enveloppe">
                    <input className={inputCls} value={value.openingText} onChange={(e) => set("openingText", e.target.value)} />
                  </Field>
                </div>

                <div className="p-3 sm:p-5 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700">Photos &amp; Cadrage</h5>
                  <PhotoField
                    label="Photo principale (couverture)"
                    value={value.heroPhoto === DEFAULT_PHOTO ? "" : value.heroPhoto}
                    onChange={(v) => set("heroPhoto", v || DEFAULT_PHOTO)}
                  />
                  <Field label="Cadrage de la photo" hint="Choisissez la zone de la photo à privilégier au centre du mobile.">
                    <select className={inputCls} value={value.heroFocus} onChange={(e) => set("heroFocus", e.target.value)}>
                      {FOCUS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <PhotoField
                    label="Photo du médaillon final (facultatif, sinon vos initiales)"
                    value={value.finalPhoto}
                    onChange={(v) => set("finalPhoto", v)}
                  />
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Horaires sur la photo de couverture ({value.heroTimes.length}/3)
                    </h5>
                  </div>
                  <TimeRows items={value.heroTimes} placeholder="Ex : Cérémonie civile" onChange={(v) => set("heroTimes", v)} />
                  {value.heroTimes.length < 3 && (
                    <button type="button" className={addBtn} onClick={() => set("heroTimes", [...value.heroTimes, { time: "", label: "" }])}>
                      <Plus size={16} /> Ajouter un horaire
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* 2. Mot de Bienvenue */}
            {(activeMenu === "welcome" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#6e1a25]/10 text-[#6e1a25] flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Mot de Bienvenue &amp; Présentation</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Introduction chaleureuse adressée à vos proches et invités.</p>
                </div>

                <div className="p-3 sm:p-5 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <Field label="Première phrase d'accroche">
                    <input className={inputCls} value={value.welcomeLead} onChange={(e) => set("welcomeLead", e.target.value)} />
                  </Field>
                  <Field label="Texte principal (en italique)" hint="Laissez une ligne vide pour créer un nouveau paragraphe.">
                    <textarea
                      rows={6}
                      className={`${inputCls} min-h-[140px] resize-y`}
                      value={value.welcomeText}
                      onChange={(e) => set("welcomeText", e.target.value)}
                    />
                  </Field>
                  <Field label="Texte de l'étiquette interactive">
                    <input className={inputCls} value={value.detailsText} onChange={(e) => set("detailsText", e.target.value)} />
                  </Field>
                </div>
              </section>
            )}

            {/* 3. Lieux & Google Maps */}
            {(activeMenu === "venues" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#6e1a25]/10 text-[#6e1a25] flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Lieux &amp; Itinéraires Google Maps</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Mairie, cérémonie religieuse, réception… Chaque lieu dispose de son bouton d'itinéraire GPS en un clic.
                  </p>
                </div>

                <div className="space-y-4">
                  {venues.map((v, i) => (
                    <VenueEditor
                      key={i}
                      v={v}
                      index={i}
                      total={venues.length}
                      onChange={(nv) => set("venues", venues.map((x, idx) => (idx === i ? nv : x)))}
                      onMove={(dir) => set("venues", move(venues, i, dir))}
                      onRemove={() => set("venues", venues.filter((_, idx) => idx !== i))}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => set("venues", [...venues, { ...EMPTY_VENUE, intro: "Puis, rejoignez-nous à" }])}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-[#6e1a25]/30 text-sm font-semibold text-[#6e1a25] hover:bg-[#6e1a25]/5 transition-colors"
                  >
                    <Plus size={16} /> Ajouter un nouveau lieu
                  </button>
                </div>
              </section>
            )}

            {/* 4. Programme de la Journée */}
            {(activeMenu === "programme" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#6e1a25]/10 text-[#6e1a25] flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Programme de la Journée</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Déroulé chronologique par parties, horaires et moments clés.</p>
                </div>

                <div className="p-3 sm:p-5 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <Field label="Titre principal du programme">
                    <input className={inputCls} value={value.programmeTitle} onChange={(e) => set("programmeTitle", e.target.value)} />
                  </Field>
                  <Field label="Introduction du programme">
                    <textarea
                      rows={3}
                      className={`${inputCls} min-h-[85px] resize-y`}
                      value={value.programmeIntro}
                      onChange={(e) => set("programmeIntro", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="space-y-4">
                  {blocks.map((b, i) => (
                    <div key={i} className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 space-y-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#6e1a25]/10 text-[#6e1a25] text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <input
                          className={`${inputCls} font-semibold`}
                          value={b.title}
                          placeholder="Ex : Samedi — la cérémonie"
                          onChange={(e) => setBlock(i, { ...b, title: e.target.value })}
                        />
                        <button type="button" className={iconBtn} disabled={i === 0} onClick={() => set("programme", move(blocks, i, -1))} aria-label="Monter">
                          <ArrowUp size={16} />
                        </button>
                        <button type="button" className={iconBtn} disabled={i === blocks.length - 1} onClick={() => set("programme", move(blocks, i, 1))} aria-label="Descendre">
                          <ArrowDown size={16} />
                        </button>
                        <button type="button" className={dangerBtn} onClick={() => set("programme", blocks.filter((_, idx) => idx !== i))} aria-label="Supprimer la partie">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <TimeRows items={b.items} placeholder="Ex : Cocktail de bienvenue" onChange={(items) => setBlock(i, { ...b, items })} />
                      <button type="button" className={addBtn} onClick={() => setBlock(i, { ...b, items: [...b.items, { time: "", label: "" }] })}>
                        <Plus size={16} /> Ajouter une étape à cette partie
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => set("programme", [...blocks, { title: "", items: [{ time: "", label: "" }] }])}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-[#6e1a25]/30 text-sm font-semibold text-[#6e1a25] hover:bg-[#6e1a25]/5 transition-colors"
                  >
                    <Plus size={16} /> Ajouter une partie (autre jour, autre lieu…)
                  </button>
                </div>
              </section>
            )}

            {/* 5. Dress Code & RSVP */}
            {(activeMenu === "rsvp" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#6e1a25]/10 text-[#6e1a25] flex items-center justify-center font-bold text-xs">
                      5
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Dress Code, Confirmation &amp; Clôture</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Palette de couleurs des tenues, date de réponse et mot final.</p>
                </div>

                <div className="p-3 sm:p-5 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700">Dress Code</h5>
                  <Field label="Consigne pour les tenues">
                    <textarea
                      rows={3}
                      className={`${inputCls} min-h-[85px] resize-y`}
                      value={value.dressCodeText}
                      placeholder="Nous serions ravis que vos tenues s'accordent à nos couleurs"
                      onChange={(e) => set("dressCodeText", e.target.value)}
                    />
                  </Field>
                  <DressCodeEditor value={value.dressColors} onChange={(v) => set("dressColors", v)} />
                </div>

                <div className="p-3 sm:p-5 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700">Confirmation &amp; Fin</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                    <Field label="Titre de la confirmation">
                      <input className={inputCls} value={value.rsvpTitle} onChange={(e) => set("rsvpTitle", e.target.value)} />
                    </Field>
                    <Field label="Date limite de réponse">
                      <input className={inputCls} value={value.rsvpDeadline} onChange={(e) => set("rsvpDeadline", e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Phrase de signature finale">
                    <input className={inputCls} value={value.loveText} onChange={(e) => set("loveText", e.target.value)} />
                  </Field>
                </div>
              </section>
            )}

            {(activeMenu === "music" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#6e1a25]/10 text-[#6e1a25] flex items-center justify-center font-bold text-xs">
                      6
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Musique d&apos;ambiance</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isStatic
                      ? "Option musicale désactivée sur les modèles au format carte statique."
                      : "Importez votre propre son et choisissez la partie jouée à l'ouverture de l'invitation."}
                  </p>
                </div>

                <div className="p-3 sm:p-5 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
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
                      label="Musique de l'invitation"
                      emptyHint="Sans musique choisie, la boîte à musique du modèle est jouée."
                      value={{ url: value.audioUrl ?? "", title: value.audioTitle ?? "", start: value.audioStart ?? 0, end: value.audioEnd ?? 0 }}
                      onChange={(a) => onChange({ ...value, audioUrl: a.url, audioTitle: a.title, audioStart: a.start, audioEnd: a.end })}
                    />
                  )}
                </div>
              </section>
            )}
          </StudioShell>
  );
}
