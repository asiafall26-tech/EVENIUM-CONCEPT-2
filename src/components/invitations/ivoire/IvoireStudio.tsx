"use client";

import StudioShell from "../StudioShell";
import StudioSectionCard from "../StudioSectionCard";
import ToneSelector from "../ToneSelector";
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
  type IvoireMenuKey = "hero" | "welcome" | "venues" | "programme" | "dresscode" | "rsvp" | "music" | "all";
  const [activeMenu, setActiveMenu] = useState<IvoireMenuKey>("hero");

  const set = <K extends keyof IvoireContent>(key: K, v: IvoireContent[K]) => onChange({ ...value, [key]: v });

  const venues = value.venues;
  const blocks = value.programme;
  const setBlock = (i: number, b: ProgrammeBlock) => set("programme", blocks.map((x, idx) => (idx === i ? b : x)));

  const hiddenSecs = value.__hidden ?? [];
  const isHidden = (key: string) => hiddenSecs.includes(key);
  const toggleSec = (key: string) => {
    const next = isHidden(key) ? hiddenSecs.filter((k) => k !== key) : [...hiddenSecs, key];
    onChange({ ...value, __hidden: next });
  };

  const MENUS = [
    { id: "hero" as const, label: "1. Couverture & Mariés", shortLabel: "Couverture", icon: HeartHandshake, desc: "Prénoms, date, photo et texte d'enveloppe" },
    { id: "welcome" as const, label: "2. Mot de Bienvenue", shortLabel: "Bienvenue", icon: Sparkles, desc: "Titre et message d'accueil avec tonalités en 1 clic", muted: isHidden("welcome") },
    { id: "venues" as const, label: "3. Lieux & Google Maps", shortLabel: "Lieux & Maps", icon: MapPin, badge: venues.length, desc: "Cérémonie, cocktail, réception et itinéraires GPS", muted: isHidden("venues") },
    { id: "programme" as const, label: "4. Programme de la Journée", shortLabel: "Programme", icon: Clock, badge: blocks.length, desc: "Organisation par parties et étapes horaires", muted: isHidden("programme") },
    { id: "dresscode" as const, label: "5. Dress Code & Nuances", shortLabel: "Dress Code", icon: Palette, badge: value.dressColors.length, desc: "Guide vestimentaire et palette de couleurs", muted: isHidden("dress") },
    { id: "rsvp" as const, label: "6. Confirmation & Clôture", shortLabel: "RSVP & Fin", icon: Palette, desc: "Date limite de réponse et signature finale", muted: isHidden("rsvp") },
    ...(!isStatic ? [{ id: "music" as const, label: "7. Musique d'ambiance", shortLabel: "Musique", icon: Music, desc: "Bande sonore d'ouverture" }] : []),
  ];

  return (
    <StudioShell
      title="Ivoire Couture"
      subtitle="Personnalisez chaque section et son intitulé ci-dessous pour composer votre invitation."
      demoUrl="/invitation-ivoire"
      menus={MENUS.map((m) => ({ id: m.id, label: String(("shortLabel" in m && m.shortLabel) || m.label), icon: m.icon, badge: "badge" in m ? m.badge : undefined, muted: m.muted }))}
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
      {/* 1. Couverture & Mariés */}
      {(activeMenu === "hero" || activeMenu === "all") && (
        <StudioSectionCard
          num={1}
          icon={HeartHandshake}
          title="Section 1 : Couverture & Les Mariés"
          desc="Prénoms des hôtes, date de célébration et photo principale de couverture"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            <Field label="Prénom du 1er marié">
              <input className={inputCls} value={value.partnerA} onChange={(e) => set("partnerA", e.target.value)} placeholder="Ex : Sarah" />
            </Field>
            <Field label="Prénom du 2nd marié">
              <input className={inputCls} value={value.partnerB} onChange={(e) => set("partnerB", e.target.value)} placeholder="Ex : Alexandre" />
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
          <Field label="Intitulé sur l'enveloppe" hint="S'affiche élégamment sur le carton d'ouverture">
            <input className={inputCls} value={value.openingText} onChange={(e) => set("openingText", e.target.value)} placeholder="Ex : Nous allons nous marier !" />
          </Field>

          <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700">Photo de Couverture & Cadrage</h5>
            <PhotoField
              label="Photo principale de couverture"
              value={value.heroPhoto === DEFAULT_PHOTO ? "" : value.heroPhoto}
              onChange={(v) => set("heroPhoto", v || DEFAULT_PHOTO)}
            />
            <Field label="Cadrage de la photo sur mobile">
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

          <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Horaires sur la photo de couverture ({value.heroTimes.length}/3)
            </h5>
            <TimeRows items={value.heroTimes} placeholder="Ex : Cérémonie civile" onChange={(v) => set("heroTimes", v)} />
            {value.heroTimes.length < 3 && (
              <button type="button" className={addBtn} onClick={() => set("heroTimes", [...value.heroTimes, { time: "", label: "" }])}>
                <Plus size={16} /> Ajouter un horaire
              </button>
            )}
          </div>
        </StudioSectionCard>
      )}

      {/* 2. Mot de Bienvenue */}
      {(activeMenu === "welcome" || activeMenu === "all") && (
        <StudioSectionCard
          num={2}
          icon={Sparkles}
          title="Section 2 : Mot de Bienvenue & Message"
          desc="Introduction chaleureuse adressée à vos proches et invités"
          isHidden={isHidden("welcome")}
          onToggleHide={() => toggleSec("welcome")}
        >
          <Field label="Intitulé de la section (Phrase d'accroche)" hint="Titre mis en avant pour introduire votre message">
            <input className={inputCls} value={value.welcomeLead} onChange={(e) => set("welcomeLead", e.target.value)} placeholder="Ex : Chers amis, bienvenue à notre mariage !" />
          </Field>

          {/* Tonalités d'inspirations prêtes à l'emploi */}
          <ToneSelector
            currentText={value.welcomeText}
            onSelect={(t) => onChange({ ...value, welcomeLead: t.welcomeTitle, welcomeText: t.welcomeText })}
          />

          <Field label="Message d'invitation (Corps du texte)">
            <textarea
              rows={5}
              className={`${inputCls} min-h-[120px] resize-y`}
              value={value.welcomeText}
              onChange={(e) => set("welcomeText", e.target.value)}
              placeholder="Rédigez votre mot d'accueil ou choisissez une tonalité ci-dessus..."
            />
          </Field>

          <Field label="Texte de l'étiquette interactive">
            <input className={inputCls} value={value.detailsText} onChange={(e) => set("detailsText", e.target.value)} placeholder="Ex : Les détails de la journée" />
          </Field>
        </StudioSectionCard>
      )}

      {/* 3. Lieux & Google Maps */}
      {(activeMenu === "venues" || activeMenu === "all") && (
        <StudioSectionCard
          num={3}
          icon={MapPin}
          title={`Section 3 : Lieux & Itinéraires Google Maps (${venues.length} lieu(x))`}
          desc="Mairie, cérémonie religieuse, réception… Chaque lieu dispose de son bouton GPS en un clic"
          badge={<span className="text-[11px] bg-[#6e1a25]/10 text-[#6e1a25] px-2.5 py-0.5 rounded-full font-bold">{venues.length} lieu(x)</span>}
          isHidden={isHidden("venues")}
          onToggleHide={() => toggleSec("venues")}
        >
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
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-[#6e1a25]/30 text-xs font-semibold text-[#6e1a25] hover:bg-[#6e1a25]/5 transition-colors cursor-pointer"
            >
              <Plus size={15} /> Ajouter un nouveau lieu
            </button>
          </div>
        </StudioSectionCard>
      )}

      {/* 4. Programme de la Journée */}
      {(activeMenu === "programme" || activeMenu === "all") && (
        <StudioSectionCard
          num={4}
          icon={Clock}
          title={`Section 4 : Programme de la Journée (${blocks.length} partie(s))`}
          desc="Déroulé chronologique par parties, horaires et moments clés"
          badge={<span className="text-[11px] bg-[#6e1a25]/10 text-[#6e1a25] px-2.5 py-0.5 rounded-full font-bold">{blocks.length} partie(s)</span>}
          isHidden={isHidden("programme")}
          onToggleHide={() => toggleSec("programme")}
        >
          <Field label="Intitulé principal du programme">
            <input className={inputCls} value={value.programmeTitle} onChange={(e) => set("programmeTitle", e.target.value)} placeholder="Ex : Le Programme" />
          </Field>
          <Field label="Introduction ou sous-titre du programme">
            <textarea
              rows={2}
              className={`${inputCls} min-h-[70px] resize-y`}
              value={value.programmeIntro}
              onChange={(e) => set("programmeIntro", e.target.value)}
              placeholder="Ex : Voici le déroulement de notre belle journée..."
            />
          </Field>

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
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-[#6e1a25]/30 text-xs font-semibold text-[#6e1a25] hover:bg-[#6e1a25]/5 transition-colors cursor-pointer"
            >
              <Plus size={15} /> Ajouter une partie (autre jour, autre lieu…)
            </button>
          </div>
        </StudioSectionCard>
      )}

      {/* 5. Dress Code & Nuances */}
      {(activeMenu === "dresscode" || activeMenu === "all") && (
        <StudioSectionCard
          num={5}
          icon={Palette}
          title="Section 5 : Dress Code & Nuances d'Honneur"
          desc="Palette de couleurs des tenues et consignes vestimentaires suggérées"
          isHidden={isHidden("dress")}
          onToggleHide={() => toggleSec("dress")}
        >
          <Field label="Consigne pour les tenues (Intitulé & Conseils)">
            <textarea
              rows={3}
              className={`${inputCls} min-h-[85px] resize-y`}
              value={value.dressCodeText}
              placeholder="Nous serions ravis que vos tenues s'accordent à nos couleurs..."
              onChange={(e) => set("dressCodeText", e.target.value)}
            />
          </Field>
          <DressCodeEditor value={value.dressColors} onChange={(v) => set("dressColors", v)} />
        </StudioSectionCard>
      )}

      {/* 6. Confirmation & Fin */}
      {(activeMenu === "rsvp" || activeMenu === "all") && (
        <StudioSectionCard
          num={6}
          icon={Palette}
          title="Section 6 : Confirmation & Clôture"
          desc="Date limite de réponse des invités et signature finale"
          isHidden={isHidden("rsvp")}
          onToggleHide={() => toggleSec("rsvp")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            <Field label="Intitulé de confirmation">
              <input className={inputCls} value={value.rsvpTitle} onChange={(e) => set("rsvpTitle", e.target.value)} placeholder="Ex : Confirmez votre présence" />
            </Field>
            <Field label="Date limite de réponse">
              <input className={inputCls} value={value.rsvpDeadline} onChange={(e) => set("rsvpDeadline", e.target.value)} placeholder="Ex : Avant le 15 mai 2027" />
            </Field>
          </div>
          <Field label="Phrase de signature finale">
            <input className={inputCls} value={value.loveText} onChange={(e) => set("loveText", e.target.value)} placeholder="Ex : Avec tout notre amour, Sarah & Alexandre" />
          </Field>
        </StudioSectionCard>
      )}

      {/* 7. Musique d'ambiance */}
      {(activeMenu === "music" || activeMenu === "all") && (
        <StudioSectionCard
          num={7}
          icon={Music}
          title={isStatic ? "Section 7 : Mode Carte Statique" : "Section 7 : Musique d'Ambiance"}
          desc={isStatic ? "Format visuel pur sans musique" : "Piste sonore jouée à l'ouverture avec découpe et gestion"}
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
              label="Musique de l'invitation"
              emptyHint="Choisissez un morceau dans la bibliothèque Evenium ou importez le vôtre."
              value={{ url: value.audioUrl ?? "", title: value.audioTitle ?? "", start: value.audioStart ?? 0, end: value.audioEnd ?? 0 }}
              onChange={(a) => onChange({ ...value, audioUrl: a.url, audioTitle: a.title, audioStart: a.start, audioEnd: a.end })}
            />
          )}
        </StudioSectionCard>
      )}
    </StudioShell>
  );
}
