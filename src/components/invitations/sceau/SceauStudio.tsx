"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Gift,
  HeartHandshake,
  Layers,
  MapPin,
  Palette,
  Play,
  Plus,
  Trash2,
  Clock,
  Camera,
  Music,
  X,
  Eye,
  Sparkles,
} from "lucide-react";
import { AudioField, Field, Group, inputCls } from "../velours/VeloursStudio";
import { EMPTY_PROGRAMME_PAGE, mapsLink, safeUrl, venueQuery, type ProgrammePage, type SceauContent } from "./content";
import { DRESS_PALETTE, nearestColorName } from "./palette";

interface Props {
  value: SceauContent;
  onChange: (next: SceauContent) => void;
  onViewFullScreen?: () => void;
  onFinalize?: () => void;
  isStatic?: boolean;
}

const iconBtn =
  "w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent";

/** Google Maps link field: validates the link and offers a test button */
export function MapsField({ value, onChange, query, label }: { value: string; onChange: (v: string) => void; query: string; label: string }) {
  const invalid = value.trim() !== "" && !safeUrl(value);
  return (
    <Field
      label={label}
      hint={
        invalid
          ? "Le lien doit commencer par https:// — copiez-le depuis Google Maps (Partager › Copier le lien)."
          : "Facultatif. Dans Google Maps : Partager › Copier le lien. Sans lien, l'adresse est recherchée automatiquement."
      }
    >
      <div className="flex gap-2">
        <input
          className={`${inputCls} ${invalid ? "!border-red-300" : ""}`}
          value={value}
          placeholder="https://maps.app.goo.gl/…"
          onChange={(e) => onChange(e.target.value)}
        />
        <a
          href={mapsLink(value, query)}
          target="_blank"
          rel="noopener noreferrer"
          title="Tester le lien"
          className="shrink-0 flex items-center gap-1.5 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <ExternalLink size={14} /> Tester
        </a>
      </div>
    </Field>
  );
}

function ProgrammePageEditor({
  page,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  page: ProgrammePage;
  index: number;
  total: number;
  onChange: (p: ProgrammePage) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof ProgrammePage>(k: K, v: ProgrammePage[K]) => onChange({ ...page, [k]: v });
  const setItem = (i: number, patch: Partial<ProgrammePage["items"][number]>) =>
    set("items", page.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#7a1a2e]">Page {index + 1}</span>
        <div className="ml-auto flex">
          <button type="button" className={iconBtn} disabled={index === 0} onClick={() => onMove(-1)} aria-label="Monter la page">
            <ArrowUp size={16} />
          </button>
          <button type="button" className={iconBtn} disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Descendre la page">
            <ArrowDown size={16} />
          </button>
          <button
            type="button"
            className={`${iconBtn} hover:!text-red-600 hover:!bg-red-50`}
            disabled={total === 1}
            onClick={onRemove}
            aria-label="Supprimer la page"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Titre">
          <input className={inputCls} value={page.title} placeholder="Ex : Le mariage civil" onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Sous-titre">
          <input className={inputCls} value={page.subtitle} placeholder="Ex : Vendredi 14 mai" onChange={(e) => set("subtitle", e.target.value)} />
        </Field>
      </div>

      <div className="space-y-2">
        {page.items.map((it, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input type="time" className={`${inputCls} !w-28 shrink-0`} value={it.time} onChange={(e) => setItem(i, { time: e.target.value })} />
            <input className={inputCls} value={it.label} placeholder="Ex : Arrivée des mariés" onChange={(e) => setItem(i, { label: e.target.value })} />
            <button
              type="button"
              aria-label="Supprimer l'étape"
              onClick={() => set("items", page.items.filter((_, idx) => idx !== i))}
              className={`${iconBtn} hover:!text-red-600 hover:!bg-red-50`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set("items", [...page.items, { time: "", label: "" }])}
          className="flex items-center gap-2 text-sm font-semibold text-[#7a1a2e] hover:underline"
        >
          <Plus size={16} /> Ajouter une étape
        </button>
      </div>

      <Field label="Lieu de cette page" hint="Facultatif : affiche un bouton « Itinéraire » sous le programme.">
        <input className={inputCls} value={page.place} placeholder="Ex : Mairie de Dakar-Plateau" onChange={(e) => set("place", e.target.value)} />
      </Field>
      {page.place.trim() && (
        <MapsField label="Lien Google Maps du lieu" value={page.mapsUrl} query={page.place} onChange={(v) => set("mapsUrl", v)} />
      )}
    </div>
  );
}

export function DressCodeEditor({ value, onChange }: { value: SceauContent["dressColors"]; onChange: (v: SceauContent["dressColors"]) => void }) {
  const [custom, setCustom] = useState("#7b1c2e");
  const has = (hex: string) => value.some((c) => c.hex.toLowerCase() === hex.toLowerCase());
  const toggle = (c: { name: string; hex: string }) =>
    onChange(has(c.hex) ? value.filter((x) => x.hex.toLowerCase() !== c.hex.toLowerCase()) : [...value, c]);

  return (
    <div className="space-y-4">
      <div>
        <span className="block text-xs font-semibold text-gray-700 mb-2">Couleurs choisies ({value.length})</span>
        {value.length === 0 && <p className="text-xs text-gray-400">Aucune couleur : la section Dress code sera masquée.</p>}
        <div className="space-y-2">
          {value.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <label className="relative w-10 h-10 shrink-0 rounded-full border border-gray-200 cursor-pointer shadow-sm" style={{ background: c.hex }} title="Changer la teinte">
                <input
                  type="color"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  value={c.hex}
                  onChange={(e) => onChange(value.map((x, idx) => (idx === i ? { ...x, hex: e.target.value } : x)))}
                />
              </label>
              <input
                className={inputCls}
                value={c.name}
                onChange={(e) => onChange(value.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))}
              />
              <button
                type="button"
                className={iconBtn}
                disabled={i === 0}
                onClick={() => {
                  const next = [...value];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  onChange(next);
                }}
                aria-label="Avancer la couleur"
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                className={`${iconBtn} hover:!text-red-600 hover:!bg-red-50`}
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                aria-label="Retirer la couleur"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 p-3 space-y-3 max-h-[340px] overflow-y-auto">
        <span className="block text-xs font-semibold text-gray-700">Palette — touchez une couleur pour l&apos;ajouter ou la retirer</span>
        {DRESS_PALETTE.map((fam) => (
          <div key={fam.family}>
            <span className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1.5">{fam.family}</span>
            <div className="flex flex-wrap gap-2">
              {fam.colors.map((c) => {
                const on = has(c.hex);
                return (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    aria-pressed={on}
                    onClick={() => toggle(c)}
                    className={`relative w-8 h-8 rounded-full border transition-transform hover:scale-110 ${
                      on ? "ring-2 ring-offset-2 ring-[#7a1a2e] border-transparent" : "border-gray-200"
                    }`}
                    style={{ background: c.hex }}
                  >
                    {on && (
                      <Check
                        size={14}
                        className="absolute inset-0 m-auto"
                        color={parseInt(c.hex.slice(1), 16) > 0x999999 ? "#5a1420" : "#fff"}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="relative w-10 h-10 shrink-0 rounded-full border border-gray-200 cursor-pointer shadow-sm" style={{ background: custom }}>
          <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={custom} onChange={(e) => setCustom(e.target.value)} />
        </label>
        <button
          type="button"
          onClick={() => !has(custom) && onChange([...value, { name: nearestColorName(custom), hex: custom }])}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5c0f21] text-white text-sm font-semibold hover:bg-[#7a1a2e] transition-colors"
        >
          <Plus size={16} /> Ajouter une couleur libre
        </button>
      </div>
    </div>
  );
}

export default function SceauStudio({ value, onChange, onViewFullScreen, onFinalize, isStatic }: Props) {
  type SceauMenuKey = "general" | "venue" | "programme" | "dresscode" | "gifts" | "rsvp" | "music" | "all";
  const [activeMenu, setActiveMenu] = useState<SceauMenuKey>("general");

  const set = <K extends keyof SceauContent>(key: K, v: SceauContent[K]) => onChange({ ...value, [key]: v });

  const pages = value.programme;
  const setPage = (i: number, p: ProgrammePage) => set("programme", pages.map((x, idx) => (idx === i ? p : x)));
  const movePage = (i: number, dir: -1 | 1) => {
    const next = [...pages];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    set("programme", next);
  };

  const MENUS = [
    { id: "general" as const, label: "Les Mariés & l'Accueil", shortLabel: "Mariés & Accueil", icon: HeartHandshake, desc: "Prénoms, enveloppe, date, ville et mot de bienvenue" },
    { id: "venue" as const, label: "Lieu & Google Maps", shortLabel: "Lieu & Maps", icon: MapPin, desc: "Lieu de réception, adresse et itinéraire GPS" },
    { id: "programme" as const, label: "Programme Multi-Pages", shortLabel: "Programme", icon: Clock, badge: pages.length, desc: "Organisation par pages et moments clés" },
    { id: "dresscode" as const, label: "Dress Code & Couleurs", shortLabel: "Dress Code", icon: Palette, desc: "Thème vestimentaire et palette de couleurs" },
    { id: "gifts" as const, label: "Cadeaux & Attentions", shortLabel: "Cadeaux", icon: Gift, desc: "Message pour la liste de mariage ou cagnotte" },
    { id: "rsvp" as const, label: "Fiche Invité & Fin", shortLabel: "RSVP & Boissons", icon: Camera, desc: "Boissons proposées et phrase de fin" },
    {
      id: "music" as const,
      label: isStatic ? "Musique (Désactivée)" : "Musique d'ambiance",
      shortLabel: "Musique",
      icon: Music,
      desc: isStatic ? "Option désactivée sur carte statique sans son" : "Votre propre son et la partie jouée à l'ouverture"
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
            Sceau d&apos;Or Impérial
          </span>
          <p className="text-xs text-gray-500 truncate hidden sm:block">
            Renseignez et personnalisez les informations de votre événement ci-dessous.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/invitation-sceau-dor"
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
                        ? "bg-[#7a1a2e] text-white shadow-sm"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-200/60"
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-white" : "text-[#7a1a2e]"} />
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
            {/* 1. Mariés & Accueil */}
            {(activeMenu === "general" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#7a1a2e]/10 text-[#7a1a2e] flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Les Mariés, Enveloppe &amp; Accueil</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Prénoms gravés sous le sceau royal, date et message d'accueil.</p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field label="Prénom du 1er marié">
                      <input className={inputCls} value={value.partnerA} onChange={(e) => set("partnerA", e.target.value)} />
                    </Field>
                    <Field label="Prénom du 2nd marié">
                      <input className={inputCls} value={value.partnerB} onChange={(e) => set("partnerB", e.target.value)} />
                    </Field>
                  </div>
                  <Field
                    label="Nom sur l'enveloppe"
                    hint="Pour personnaliser par invité, ajoutez #famille-diop à la fin du lien partagé : « Famille Diop » s'affichera."
                  >
                    <input className={inputCls} value={value.guestLabel} onChange={(e) => set("guestLabel", e.target.value)} />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                  <Field label="Titre d'accueil">
                    <input className={inputCls} value={value.welcomeTitle} onChange={(e) => set("welcomeTitle", e.target.value)} />
                  </Field>
                  <Field label="Message d'accueil">
                    <textarea rows={4} className={`${inputCls} resize-none`} value={value.welcomeText} onChange={(e) => set("welcomeText", e.target.value)} />
                  </Field>
                </div>
              </section>
            )}

            {/* 2. Lieu & Google Maps */}
            {(activeMenu === "venue" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#7a1a2e]/10 text-[#7a1a2e] flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Lieu &amp; Carte Google Maps</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Coordonnées du lieu de réception et carte interactive.</p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <Field label="Titre de la carte">
                    <input className={inputCls} value={value.venueTitle} onChange={(e) => set("venueTitle", e.target.value)} />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Nom du lieu">
                      <input className={inputCls} value={value.venue} onChange={(e) => set("venue", e.target.value)} />
                    </Field>
                    <Field label="Type de lieu">
                      <input className={inputCls} value={value.venueKind} placeholder="salle de réception" onChange={(e) => set("venueKind", e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Adresse">
                    <input className={inputCls} value={value.address} onChange={(e) => set("address", e.target.value)} />
                  </Field>
                  <MapsField label="Lien Google Maps" value={value.mapsUrl} query={venueQuery(value)} onChange={(v) => set("mapsUrl", v)} />
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#7a1a2e]"
                      checked={value.showMap}
                      onChange={(e) => set("showMap", e.target.checked)}
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1.5">
                      <MapPin size={14} /> Afficher la carte Google Maps dans l&apos;invitation
                    </span>
                  </label>
                </div>
              </section>
            )}

            {/* 3. Programme Multi-Pages */}
            {(activeMenu === "programme" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#7a1a2e]/10 text-[#7a1a2e] flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Programme Multi-Pages ({pages.length} pages)</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Chaque page du livret correspond à un moment de la célébration.</p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <div className="space-y-3.5">
                    {pages.map((p, i) => (
                      <ProgrammePageEditor
                        key={i}
                        page={p}
                        index={i}
                        total={pages.length}
                        onChange={(np) => setPage(i, np)}
                        onMove={(dir) => movePage(i, dir)}
                        onRemove={() => set("programme", pages.filter((_, idx) => idx !== i))}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      set("programme", [...pages, { ...EMPTY_PROGRAMME_PAGE, title: `Programme ${pages.length + 1}`, items: [{ time: "", label: "" }] }])
                    }
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#7a1a2e]/30 text-sm font-semibold text-[#7a1a2e] hover:bg-[#7a1a2e]/5 transition-colors"
                  >
                    <Plus size={16} /> Ajouter une page de programme
                  </button>
                </div>
              </section>
            )}

            {/* 4. Dress Code & Couleurs */}
            {(activeMenu === "dresscode" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#7a1a2e]/10 text-[#7a1a2e] flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Dress Code &amp; Palette de Couleurs</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Guide vestimentaire et nuances d'honneur suggérées aux invités.</p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <Field label="Consigne du dress code">
                    <textarea rows={2} className={`${inputCls} resize-none`} value={value.dressCodeText} onChange={(e) => set("dressCodeText", e.target.value)} />
                  </Field>
                  <DressCodeEditor value={value.dressColors} onChange={(v) => set("dressColors", v)} />
                </div>
              </section>
            )}

            {/* 5. Cadeaux & Attentions */}
            {(activeMenu === "gifts" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#7a1a2e]/10 text-[#7a1a2e] flex items-center justify-center font-bold text-xs">
                      5
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Cadeaux &amp; Attentions</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Facilitez les attentions de vos convives avec votre message ou liste de mariage.</p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <Field label="Titre">
                    <input className={inputCls} value={value.giftsTitle} onChange={(e) => set("giftsTitle", e.target.value)} />
                  </Field>
                  <Field label="Texte" hint="Laissez le titre et le texte vides pour masquer cette carte.">
                    <textarea rows={4} className={`${inputCls} resize-none`} value={value.giftsText} onChange={(e) => set("giftsText", e.target.value)} />
                  </Field>
                </div>
              </section>
            )}

            {/* 6. Fiche Invité & Fin */}
            {(activeMenu === "rsvp" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#7a1a2e]/10 text-[#7a1a2e] flex items-center justify-center font-bold text-xs">
                      6
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Fiche Invité, Boissons &amp; Fin</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Menu des rafraîchissements servis et signature de clôture.</p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
                  <Field label="Texte au-dessus du formulaire">
                    <textarea rows={2} className={`${inputCls} resize-none`} value={value.rsvpText} onChange={(e) => set("rsvpText", e.target.value)} />
                  </Field>
                  <div>
                    <span className="block text-xs font-semibold text-gray-700 mb-1.5">Boissons proposées</span>
                    <div className="space-y-2">
                      {value.drinks.map((d, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            className={inputCls}
                            value={d}
                            onChange={(e) => set("drinks", value.drinks.map((x, idx) => (idx === i ? e.target.value : x)))}
                          />
                          <button
                            type="button"
                            aria-label="Retirer la boisson"
                            onClick={() => set("drinks", value.drinks.filter((_, idx) => idx !== i))}
                            className={`${iconBtn} hover:!text-red-600 hover:!bg-red-50`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => set("drinks", [...value.drinks, ""])}
                      className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-[#7a1a2e] hover:underline"
                    >
                      <Plus size={14} /> Ajouter une boisson
                    </button>
                  </div>
                  <Field label="Phrase de fin">
                    <input className={inputCls} value={value.closingText} onChange={(e) => set("closingText", e.target.value)} />
                  </Field>
                </div>
              </section>
            )}

            {/* 7. Musique */}
            {(activeMenu === "music" || activeMenu === "all") && (
              <section className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#7a1a2e]/10 text-[#7a1a2e] flex items-center justify-center font-bold text-xs">
                      7
                    </span>
                    <h4 className="font-serif text-lg font-bold text-gray-900">Musique d&apos;ambiance</h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isStatic
                      ? "Option musicale désactivée sur les modèles au format carte statique."
                      : "Importez votre propre son et choisissez la partie jouée à l'ouverture de l'invitation."}
                  </p>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#7a1a2e] hover:bg-[#5a0e1b] text-white text-xs font-semibold shadow-xs transition-colors"
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
