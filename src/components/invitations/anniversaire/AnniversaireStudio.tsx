"use client";

import StudioShell from "../StudioShell";
import { builtInSections, sectionsOf } from "@/lib/invitationSections";
import { useState } from "react";
import { ArrowDown, ArrowUp, BookOpen, CalendarDays, Heart, Image as ImageIcon, ListChecks, Music, Plus, Trash2 } from "lucide-react";
import { AudioField, Field, inputCls, PhotoField } from "../velours/VeloursStudio";
import { MapsField } from "../sceau/SceauStudio";
import { DEFAULT_PHOTO, MAX_PROGRAMME, PROGRAMME_ICONS, type AnniversaireContent, type ProgrammeIcon } from "./content";

interface Props {
  value: AnniversaireContent;
  onChange: (next: AnniversaireContent) => void;
  onViewFullScreen?: () => void;
  onFinalize?: () => void;
  isStatic?: boolean;
}

const ACCENT = "#6b1428";
const iconBtn =
  "w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent";

const FOCUS = [
  { label: "Haut de la photo", value: "50% 15%" },
  { label: "Centre", value: "50% 35%" },
  { label: "Bas de la photo", value: "50% 75%" },
];

function Section({ n, title, desc, children }: { n: number; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#6b1428]/10 text-[#6b1428] flex items-center justify-center font-bold text-xs">{n}</span>
          <h4 className="font-serif text-lg font-bold text-gray-900">{title}</h4>
        </div>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>
      {children}
    </section>
  );
}

const box = "p-3 sm:p-5 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4";

/** Éditeur du modèle « Anniversaire Bordeaux & Or » (deux pages). */
export default function AnniversaireStudio({ value, onChange, onViewFullScreen, onFinalize, isStatic }: Props) {
  type MenuKey = "cover" | "card" | "when" | "programme" | "end" | "music" | "all";
  const [active, setActive] = useState<MenuKey>("cover");
  const set = <K extends keyof AnniversaireContent>(k: K, v: AnniversaireContent[K]) => onChange({ ...value, [k]: v });

  const MENUS = [
    { id: "cover" as const, label: "Couverture", icon: ImageIcon },
    { id: "card" as const, label: "Invitation", icon: BookOpen },
    { id: "when" as const, label: "Date & lieu", icon: CalendarDays },
    { id: "programme" as const, label: "Programme", icon: ListChecks, badge: value.programme.length },
    { id: "end" as const, label: "Fin & confirmation", icon: Heart },
    { id: "music" as const, label: isStatic ? "Musique (désactivée)" : "Musique", icon: Music },
  ];
  const show = (k: MenuKey) => active === k || active === "all";

  const items = value.programme;
  const setItem = (i: number, patch: Partial<(typeof items)[number]>) => set("programme", items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const moveItem = (i: number, dir: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    set("programme", next);
  };

  return (
    <StudioShell
      title="Anniversaire Bordeaux & Or"
      subtitle={"Invitation sur deux pages : couverture photo et carte d'invitation."}
      demoUrl="/invitation-anniversaire"
      menus={MENUS.map((m) => ({ id: m.id, label: String(("shortLabel" in m && m.shortLabel) || m.label), icon: m.icon, badge: "badge" in m ? m.badge : undefined }))}
      active={active}
      onActive={(id) => setActive(id as never)}
      onViewFullScreen={onViewFullScreen}
      onFinalize={onFinalize}
      sections={{
        defs: builtInSections("invit-11", value as unknown as Record<string, unknown>),
        state: sectionsOf(value),
        onChange: (st) => onChange({ ...value, __hidden: st.hidden, __rubriques: st.rubriques }),
      }}
    >
          {show("cover") && (
            <Section n={1} title="Page 1 · Couverture" desc="Titre manuscrit, prénom et photo de la couverture.">
              <div className={box}>
                <Field label="Titre de la couverture" hint="Ex : Happy Birthday, Joyeux anniversaire, 30 ans !">
                  <input className={inputCls} value={value.coverTitle} onChange={(e) => set("coverTitle", e.target.value)} />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                  <Field label="Prénom de la personne fêtée">
                    <input className={inputCls} value={value.celebrant} onChange={(e) => set("celebrant", e.target.value)} />
                  </Field>
                  <Field label="Âge (facultatif)">
                    <input className={inputCls} inputMode="numeric" value={value.age} placeholder="Ex : 30" onChange={(e) => set("age", e.target.value)} />
                  </Field>
                </div>
                <Field label="Ligne sous le titre (facultatif)" hint="Vide = prénom et âge.">
                  <input className={inputCls} value={value.coverSubtitle} placeholder="Ex : Les 30 ans d'Aïcha" onChange={(e) => set("coverSubtitle", e.target.value)} />
                </Field>
              </div>
              <div className={box}>
                <PhotoField label="Photo de couverture" value={value.coverPhoto === DEFAULT_PHOTO ? "" : value.coverPhoto} onChange={(v) => set("coverPhoto", v || DEFAULT_PHOTO)} />
                <Field label="Cadrage de la photo">
                  <select className={inputCls} value={value.coverFocus} onChange={(e) => set("coverFocus", e.target.value)}>
                    {FOCUS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </Section>
          )}

          {show("card") && (
            <Section n={2} title="Page 2 · Invitation" desc="Phrase d'accroche, titre et message à vos invités.">
              <div className={box}>
                <Field label="Phrase d'accroche (en haut)">
                  <input className={inputCls} value={value.kicker} onChange={(e) => set("kicker", e.target.value)} />
                </Field>
                <Field label="Titre manuscrit">
                  <input className={inputCls} value={value.title} onChange={(e) => set("title", e.target.value)} />
                </Field>
                <Field label="Message">
                  <textarea rows={6} className={`${inputCls} min-h-[140px] resize-y`} value={value.message} onChange={(e) => set("message", e.target.value)} />
                </Field>
              </div>
            </Section>
          )}

          {show("when") && (
            <Section n={3} title="Date, heure & lieu" desc="Affichés sur la page 2, avec l'itinéraire Google Maps.">
              <div className={box}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <Field label="Date">
                    <input type="date" className={inputCls} value={value.date} onChange={(e) => set("date", e.target.value)} />
                  </Field>
                  <Field label="Heure">
                    <input type="time" className={inputCls} value={value.time} onChange={(e) => set("time", e.target.value)} />
                  </Field>
                  <Field label="Texte avant l'heure">
                    <input className={inputCls} value={value.timeLabel} placeholder="À partir de" onChange={(e) => set("timeLabel", e.target.value)} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                  <Field label="Lieu">
                    <input className={inputCls} value={value.venueName} onChange={(e) => set("venueName", e.target.value)} />
                  </Field>
                  <Field label="Ville">
                    <input className={inputCls} value={value.venueCity} onChange={(e) => set("venueCity", e.target.value)} />
                  </Field>
                </div>
                <MapsField label="Lien Google Maps" value={value.mapsUrl} query={[value.venueName, value.venueCity].filter(Boolean).join(", ")} onChange={(v) => set("mapsUrl", v)} />
              </div>
            </Section>
          )}

          {show("programme") && (
            <Section n={4} title="Au programme" desc={`De 1 à ${MAX_PROGRAMME} moments, chacun avec son icône.`}>
              <div className={box}>
                <Field label="Titre de la rubrique">
                  <input className={inputCls} value={value.programmeTitle} onChange={(e) => set("programmeTitle", e.target.value)} />
                </Field>
                <div className="space-y-2">
                  {items.map((it, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select className={`${inputCls} !w-40 shrink-0`} value={it.icon} onChange={(e) => setItem(i, { icon: e.target.value as ProgrammeIcon })} aria-label="Icône">
                        {(Object.keys(PROGRAMME_ICONS) as ProgrammeIcon[]).map((k) => (
                          <option key={k} value={k}>
                            Icône : {PROGRAMME_ICONS[k]}
                          </option>
                        ))}
                      </select>
                      <input className={inputCls} value={it.label} placeholder="Ex : Dîner" onChange={(e) => setItem(i, { label: e.target.value })} />
                      <button type="button" className={iconBtn} disabled={i === 0} onClick={() => moveItem(i, -1)} aria-label="Monter">
                        <ArrowUp size={16} />
                      </button>
                      <button type="button" className={iconBtn} disabled={i === items.length - 1} onClick={() => moveItem(i, 1)} aria-label="Descendre">
                        <ArrowDown size={16} />
                      </button>
                      <button type="button" className={`${iconBtn} hover:!text-red-600 hover:!bg-red-50`} onClick={() => set("programme", items.filter((_, j) => j !== i))} aria-label="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                {items.length < MAX_PROGRAMME && (
                  <button
                    type="button"
                    onClick={() => set("programme", [...items, { icon: "surprise", label: "" }])}
                    className="flex items-center gap-2 text-sm font-semibold hover:underline"
                    style={{ color: ACCENT }}
                  >
                    <Plus size={16} /> Ajouter un moment
                  </button>
                )}
              </div>
            </Section>
          )}

          {show("end") && (
            <Section n={5} title="Fin & confirmation" desc="Phrase de fin et date limite de réponse.">
              <div className={box}>
                <Field label="Phrase de fin">
                  <input className={inputCls} value={value.closing} onChange={(e) => set("closing", e.target.value)} />
                </Field>
                <Field label="Date limite de réponse" hint="Affichée sous l'invitation et dans le formulaire de confirmation.">
                  <input className={inputCls} value={value.rsvpDeadline} onChange={(e) => set("rsvpDeadline", e.target.value)} />
                </Field>
              </div>
            </Section>
          )}

          {show("music") && (
            <Section n={6} title="Musique d'ambiance" desc={isStatic ? "Option désactivée sur les cartes statiques." : "Facultative : jouée quand l'invité ouvre l'invitation."}>
              <div className={box}>
                {isStatic ? (
                  <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-3">Votre événement est au format carte statique : l&apos;invitation ne comporte pas de musique.</p>
                ) : (
                  <AudioField
                    label="Musique de l'invitation"
                    emptyHint="Sans musique choisie, l'invitation reste silencieuse."
                    value={{ url: value.audioUrl ?? "", title: value.audioTitle ?? "", start: value.audioStart ?? 0, end: value.audioEnd ?? 0 }}
                    onChange={(a) => onChange({ ...value, audioUrl: a.url, audioTitle: a.title, audioStart: a.start, audioEnd: a.end })}
                  />
                )}
              </div>
            </Section>
          )}
        </StudioShell>
  );
}
