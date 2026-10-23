"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, RotateCcw, Search, X } from "lucide-react";
import {
  ALL_FONTS,
  FONT_GROUPS,
  STYLE_PARTS,
  googleFontHrefs,
  resolveParts,
  styleCss,
  styleFonts,
  type InvitationStyle,
  type PartSelectors,
  type PartStyle,
  type StylePart,
} from "@/lib/invitationStyle";

/** Ambiances d'écriture prêtes à l'emploi */
const PRESETS: { name: string; hint: string; names?: string; titles?: string; body?: string }[] = [
  { name: "D'origine", hint: "Le style du modèle" },
  { name: "Romantique", hint: "Calligraphie & serif fin", names: "Great Vibes", titles: "Great Vibes", body: "Cormorant Garamond" },
  { name: "Royal", hint: "Capitales gravées", names: "Cinzel Decorative", titles: "Cinzel", body: "Cormorant Garamond" },
  { name: "Haute couture", hint: "Contrasté & élégant", names: "Bodoni Moda", titles: "Bodoni Moda", body: "Jost" },
  { name: "Poétique", hint: "Plume légère", names: "Parisienne", titles: "Playfair Display", body: "Lora" },
  { name: "Classique", hint: "Intemporel", names: "Playfair Display", titles: "Playfair Display", body: "Lato" },
  { name: "Moderne", hint: "Épuré & aéré", names: "Italiana", titles: "Italiana", body: "Montserrat" },
  { name: "Art déco", hint: "Années folles", names: "Poiret One", titles: "Poiret One", body: "Josefin Sans" },
  { name: "Signature", hint: "Écriture à la main", names: "Allura", titles: "Allura", body: "EB Garamond" },
];

const COLORS: { value?: string; name: string }[] = [
  { name: "D'origine" },
  { value: "#2b2118", name: "Encre" },
  { value: "#000000", name: "Noir" },
  { value: "#ffffff", name: "Blanc" },
  { value: "#b8924a", name: "Or" },
  { value: "#6b1f2a", name: "Bordeaux" },
  { value: "#8a5243", name: "Terre de rose" },
  { value: "#c98b8b", name: "Rose poudré" },
  { value: "#1f3a2e", name: "Vert sapin" },
  { value: "#1e2a4a", name: "Bleu nuit" },
];

const SIZES = [
  { label: "Petit", value: 85 },
  { label: "Normal", value: 100 },
  { label: "Grand", value: 120 },
  { label: "Très grand", value: 140 },
];

/** Exemple de chaque catégorie, pour l'aperçu et la liste des polices */
const SAMPLES: Record<StylePart, string> = {
  names: "Aïcha & Moussa",
  titles: "Notre histoire",
  labels: "SAMEDI · 16H00",
  numbers: "12 · 12 · 2026",
  body: "Votre présence sera notre plus beau cadeau.",
  buttons: "Confirmer ma présence",
};

const SAMPLE_SELECTORS = Object.fromEntries(STYLE_PARTS.map((p) => [p.id, [`[data-part="${p.id}"]`]])) as PartSelectors;

const fontStyle = (f?: string) => (f ? { fontFamily: `"${f}"` } : undefined);

/** Liste déroulante des polices : chacune s'affiche avec un exemple écrit dans cette police. */
function FontDropdown({ value, onChange, sample }: { value?: string; onChange: (f?: string) => void; sample: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Échap ferme la liste
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const q = query.trim().toLowerCase();
  const groups = FONT_GROUPS.map((g) => ({ ...g, fonts: g.fonts.filter((f) => !q || f.toLowerCase().includes(q)) })).filter((g) => g.fonts.length);
  const pick = (f?: string) => {
    onChange(f);
    setOpen(false);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-left"
      >
        <span className="min-w-0">
          <span className="block text-[11px] text-gray-400">{value ?? "Police d'origine du modèle"}</span>
          <span className="block text-xl text-gray-900 truncate" style={fontStyle(value)}>
            {sample}
          </span>
        </span>
        <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Liste dans une fenêtre au-dessus de tout : jamais coupée par le bas de l'écran */}
      {open &&
        createPortal(
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/40 sm:p-6" onClick={() => setOpen(false)}>
        <div
          className="w-full sm:max-w-lg max-h-[88dvh] sm:max-h-[80dvh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2 shrink-0">
            <p className="font-serif text-xl text-gray-900">Choisir une police</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
              <X size={18} />
            </button>
          </div>
          <div className="px-3 pb-2 border-b border-gray-100 relative shrink-0">
            <Search size={15} className="absolute left-6 top-[calc(50%-0.25rem)] -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une police…"
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none"
            />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <button type="button" onClick={() => pick(undefined)} className={`w-full flex items-center justify-between px-4 py-3 text-left ${!value ? "bg-[#fbf7f0]" : "hover:bg-gray-50"}`}>
              <span className="text-sm text-gray-700">Police d&apos;origine du modèle</span>
              {!value && <Check size={15} className="text-[#b8924a]" />}
            </button>
            {groups.map((g) => (
              <div key={g.label}>
                <p className="sticky top-0 bg-white/95 px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#8f6f33]">{g.label}</p>
                {g.fonts.map((f) => (
                  <button
                    key={`${g.label}-${f}`}
                    type="button"
                    onClick={() => pick(f)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left border-t border-gray-50 ${value === f ? "bg-[#fbf7f0]" : "hover:bg-gray-50"}`}
                  >
                    <span className="min-w-0">
                      <span className="block text-[11px] text-gray-400">{f}</span>
                      <span className="block text-2xl leading-snug text-gray-900 truncate" style={fontStyle(f)}>
                        {sample}
                      </span>
                    </span>
                    {value === f && <Check size={15} className="shrink-0 text-[#b8924a]" />}
                  </button>
                ))}
              </div>
            ))}
            {groups.length === 0 && <p className="px-4 py-6 text-sm text-gray-500 text-center">Aucune police ne correspond.</p>}
          </div>
        </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function Colors({ value, onChange }: { value?: string; onChange: (c?: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {COLORS.map((c) => {
        const on = value === c.value;
        return (
          <button
            key={c.name}
            type="button"
            title={c.name}
            aria-label={c.name}
            onClick={() => onChange(c.value)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center ${on ? "ring-2 ring-offset-2 ring-[#b8924a]" : "border-gray-200"}`}
            style={{ background: c.value ?? "linear-gradient(135deg,#fff 45%,#e5e7eb 45%,#e5e7eb 55%,#fff 55%)" }}
          >
            {on && <Check size={15} className={c.value === "#ffffff" || !c.value ? "text-gray-800" : "text-white"} />}
          </button>
        );
      })}
      <label className="relative w-9 h-9 rounded-full border border-dashed border-gray-300 cursor-pointer flex items-center justify-center text-gray-400 text-lg" title="Autre couleur">
        +
        <input type="color" value={value ?? "#b8924a"} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </label>
    </div>
  );
}

function Sizes({ value, onChange }: { value?: number; onChange: (n: number) => void }) {
  const current = value ?? 100;
  return (
    <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-gray-100">
      {SIZES.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => onChange(s.value)}
          className={`py-2 rounded-lg text-xs font-semibold ${current === s.value ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

/** Style d'un modèle : une ambiance en un clic, puis chaque type de texte réglable séparément. */
export default function StyleEditor({ value, onChange }: { value?: InvitationStyle; onChange: (s: InvitationStyle) => void }) {
  const parts = useMemo(() => resolveParts(value), [value]);
  const [openPart, setOpenPart] = useState<StylePart | null>("names");
  // Sur téléphone, l'aperçu ne montre que le type de texte en cours de réglage
  const previewShows = (id: StylePart) => (openPart ?? "names") === id;

  // Les réglages sont toujours enregistrés par type de texte
  const setPart = (id: StylePart, patch: Partial<PartStyle>) =>
    onChange({ parts: { ...parts, [id]: { ...parts[id], ...patch } }, titleSpacing: value?.titleSpacing });
  const resetPart = (id: StylePart) => onChange({ parts: { ...parts, [id]: {} }, titleSpacing: value?.titleSpacing });

  const applyPreset = (p: (typeof PRESETS)[number]) =>
    onChange({
      parts: {
        ...parts,
        names: { ...parts.names, font: p.names },
        titles: { ...parts.titles, font: p.titles },
        body: { ...parts.body, font: p.body },
      },
    });
  const activePreset = PRESETS.find((p) => p.names === parts.names?.font && p.titles === parts.titles?.font && p.body === parts.body?.font);

  // Toutes les polices sont chargées pour les listes d'exemples (studio admin uniquement)
  const fontLinks = useMemo(() => googleFontHrefs([...ALL_FONTS, ...styleFonts(value)]), [value]);

  return (
    <div className="h-full overflow-y-auto overscroll-contain lg:overflow-hidden lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {fontLinks.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <style>{styleCss(value, "[data-style-sample]", SAMPLE_SELECTORS)}</style>

      {/* Aperçu : à gauche sur grand écran ; sur téléphone, le type de texte en cours de réglage */}
      <aside className="sticky top-0 z-20 bg-[#faf7f5]/95 backdrop-blur px-4 pt-3 pb-3 lg:static lg:h-full lg:overflow-y-auto lg:p-8 lg:border-r lg:border-gray-200/70 lg:flex lg:flex-col lg:justify-center">
        <p className="hidden lg:block text-[11px] uppercase tracking-[0.25em] text-[#8f6f33] text-center mb-4">Aperçu</p>
        <div data-style-sample="" className="rounded-2xl lg:rounded-3xl border border-[#b8924a]/30 bg-[#fbf7f0] px-4 py-4 lg:px-8 lg:py-12 text-center space-y-1.5 lg:space-y-4 text-[#2b2118]">
          <p data-part="labels" className={`text-[11px] lg:text-sm tracking-[0.25em] text-[#8f6f33] ${previewShows("labels") ? "" : "hidden lg:block"}`}>{SAMPLES.labels}</p>
          <p data-part="names" className={`font-serif text-3xl sm:text-4xl lg:text-6xl leading-tight ${previewShows("names") ? "" : "hidden lg:block"}`}>{SAMPLES.names}</p>
          <p data-part="numbers" className={`font-serif text-lg lg:text-3xl text-[#6b1f2a] ${previewShows("numbers") ? "" : "hidden lg:block"}`}>{SAMPLES.numbers}</p>
          <p data-part="titles" className={`font-serif text-xl lg:text-4xl ${previewShows("titles") ? "" : "hidden lg:block"}`}>{SAMPLES.titles}</p>
          <p data-part="body" className={`text-sm lg:text-lg text-gray-600 max-w-md mx-auto ${previewShows("body") ? "" : "hidden lg:block"}`}>{SAMPLES.body}</p>
          <span data-part="buttons" className={`inline-block mt-1 px-4 lg:px-6 py-1.5 lg:py-2.5 rounded-full bg-[#2b2118] text-[#f5eee1] text-xs lg:text-sm font-semibold ${previewShows("buttons") ? "" : "hidden lg:inline-block"}`}>{SAMPLES.buttons}</span>
        </div>
      </aside>

      <div className="px-4 sm:px-6 lg:px-10 py-5 lg:py-8 space-y-7 lg:h-full lg:overflow-y-auto overscroll-contain">
        <div className="max-w-2xl mx-auto space-y-7">
        {/* 1. Ambiance */}
        <section className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 space-y-4">
          <h3 className="font-serif text-2xl text-gray-900">1. Ambiance d&apos;écriture</h3>
          <p className="text-xs text-gray-500">Un clic règle ensemble les prénoms, les titres et les textes.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRESETS.map((p) => {
              const on = activePreset?.name === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`relative text-left rounded-2xl border px-4 py-4 ${on ? "border-[#b8924a] bg-[#fbf7f0] ring-1 ring-[#b8924a]" : "border-gray-200 bg-white"}`}
                >
                  {on && <Check size={14} className="absolute top-2 right-2 text-[#b8924a]" />}
                  <span className="block text-2xl leading-snug text-gray-900 truncate" style={fontStyle(p.names)}>
                    Aïcha
                  </span>
                  <span className="block text-xs font-semibold text-gray-800 mt-1">{p.name}</span>
                  <span className="block text-[11px] text-gray-500" style={fontStyle(p.body)}>
                    {p.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Par type de texte */}
        <section className="space-y-3">
          <h3 className="font-serif text-2xl text-gray-900 px-1">2. Réglage par type de texte</h3>
          {STYLE_PARTS.map((part) => {
            const p = parts[part.id] ?? {};
            const open = openPart === part.id;
            return (
              <div key={part.id} className={`bg-white rounded-2xl border ${open ? "border-[#b8924a]/50" : "border-gray-200/80"}`}>
                <button type="button" onClick={() => setOpenPart(open ? null : part.id)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left">
                  <span className="min-w-0">
                    <span className="block text-base font-semibold text-gray-900">{part.label}</span>
                    <span className="block text-xs text-gray-500 truncate mt-0.5">
                      {[p.font ?? "Police d'origine", p.color ? "couleur modifiée" : null, p.scale && p.scale !== 100 ? `taille ${p.scale} %` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open && (
                  <div className="px-5 pb-5 space-y-5 border-t border-gray-100 pt-5">
                    <p className="text-xs text-gray-500">{part.hint}</p>
                    <div>
                      <span className="block text-xs font-semibold text-gray-700 mb-1.5">Police</span>
                      <FontDropdown value={p.font} onChange={(font) => setPart(part.id, { font })} sample={SAMPLES[part.id]} />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-700 mb-1.5">Couleur</span>
                      <Colors value={p.color} onChange={(color) => setPart(part.id, { color })} />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-700 mb-1.5">Taille</span>
                      <Sizes value={p.scale} onChange={(scale) => setPart(part.id, { scale })} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {([
                        ["italic", "Italique"],
                        ["uppercase", "Majuscules"],
                      ] as const).map(([key, text]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPart(part.id, { [key]: !p[key] })}
                          className={`px-4 py-2 rounded-full border text-xs font-semibold ${p[key] ? "bg-[#2b2118] text-[#f5eee1] border-[#2b2118]" : "border-gray-200 text-gray-600"}`}
                        >
                          {text}
                        </button>
                      ))}
                      <button type="button" onClick={() => resetPart(part.id)} className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#8f6f33]">
                        <RotateCcw size={13} /> D&apos;origine
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <button
          type="button"
          onClick={() => onChange({})}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700"
        >
          <RotateCcw size={15} /> Tout remettre comme à l&apos;origine
        </button>
        </div>
      </div>
    </div>
  );
}
