"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, BookOpen, CalendarDays, ChevronLeft, ChevronRight, ExternalLink, Eye, Heart, Image as ImageIcon, Layers, ListChecks, Music, Plus, Trash2 } from "lucide-react";
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

const box = "p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4";

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
  const index = MENUS.findIndex((m) => m.id === active);
  const show = (k: MenuKey) => active === k || active === "all";

  const items = value.programme;
  const setItem = (i: number, patch: Partial<(typeof items)[number]>) => set("programme", items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const moveItem = (i: number, dir: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    set("programme", next);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#faf7f5]">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-200/70 shrink-0 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#6b1428]/10 text-[#6b1428] text-xs font-semibold shrink-0">Anniversaire Bordeaux &amp; Or</span>
          <p className="text-xs text-gray-500 truncate hidden sm:block">Invitation sur deux pages : couverture photo et carte d&apos;invitation.</p>
        </div>
        <a
          href="/invitation-anniversaire"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shrink-0"
        >
          <ExternalLink size={13} /> Démo modèle
        </a>
      </div>

      <div className="w-full flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-clip lg:overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 p-2 shrink-0 sticky top-[var(--studio-sticky-top,0px)] z-20 lg:static">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {MENUS.map((m) => {
              const Icon = m.icon;
              const on = active === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActive(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 ${on ? "bg-[#6b1428] text-white shadow-sm" : "text-gray-700 hover:bg-gray-200/60"}`}
                >
                  <Icon size={14} className={on ? "text-white" : "text-[#6b1428]"} />
                  {m.label}
                  {m.badge !== undefined && <span className={`text-[10px] px-1.5 rounded-full font-bold ${on ? "bg-white/20" : "bg-gray-200 text-gray-700"}`}>{m.badge}</span>}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setActive("all")}
              className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 ml-auto ${active === "all" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-200/60"}`}
            >
              <Layers size={13} /> Tous les menus
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-8">
          {show("cover") && (
            <Section n={1} title="Page 1 · Couverture" desc="Titre manuscrit, prénom et photo de la couverture.">
              <div className={box}>
                <Field label="Titre de la couverture" hint="Ex : Happy Birthday, Joyeux anniversaire, 30 ans !">
                  <input className={inputCls} value={value.coverTitle} onChange={(e) => set("coverTitle", e.target.value)} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                  <textarea rows={5} className={`${inputCls} resize-none`} value={value.message} onChange={(e) => set("message", e.target.value)} />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
        </div>

        {active !== "all" && (
          <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:pb-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2 shrink-0 sticky bottom-0 z-20 lg:static">
            <button
              type="button"
              onClick={() => index > 0 && setActive(MENUS[index - 1].id)}
              disabled={index <= 0}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-30"
            >
              <ChevronLeft size={14} /> Précédent
            </button>
            <span className="text-xs text-gray-500 font-medium">
              Menu {index + 1} sur {MENUS.length}
            </span>
            {index >= MENUS.length - 1 ? (
              onViewFullScreen ? (
                <button
                  type="button"
                  onClick={onViewFullScreen}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#b8924a] via-[#F3E5AB] to-[#b8924a] text-black font-extrabold text-xs shadow-md border border-[#b8924a]/50"
                >
                  <Eye size={14} /> Voir le résultat en plein écran
                </button>
              ) : onFinalize ? (
                <button type="button" onClick={onFinalize} className="px-4 py-2 rounded-xl bg-[#6b1428] text-white text-xs font-semibold">
                  Finaliser
                </button>
              ) : (
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-lg">Toutes les étapes complétées</span>
              )
            ) : (
              <button
                type="button"
                onClick={() => setActive(MENUS[index + 1].id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#6b1428] text-white"
              >
                Suivant <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
