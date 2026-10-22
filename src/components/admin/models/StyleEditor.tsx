"use client";

import { useMemo, useState } from "react";
import { Check, RotateCcw, Search } from "lucide-react";
import { FONT_GROUPS, googleFontHrefs, styleCss, type InvitationStyle } from "@/lib/invitationStyle";

const SWATCHES = ["#2b2118", "#000000", "#ffffff", "#f5eee1", "#b8924a", "#d4af37", "#6b1f2a", "#7a1a2e", "#8a5243", "#c98b8b", "#1f3a2e", "#1e2a4a"];

const card = "bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 space-y-4";
const label = "block text-xs font-semibold text-gray-700 mb-1.5";

function FontPicker({ value, onChange, sample }: { value?: string; onChange: (f?: string) => void; sample: string }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const groups = FONT_GROUPS.map((g) => ({ ...g, fonts: g.fonts.filter((f) => !q || f.toLowerCase().includes(q)) })).filter((g) => g.fonts.length);
  return (
    <div>
      <div className="relative mb-2">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une police…"
          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#b8924a]/30"
        />
      </div>
      <div className="max-h-72 overflow-y-auto overscroll-contain rounded-xl border border-gray-100 divide-y divide-gray-100">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm ${!value ? "bg-[#fbf7f0]" : "hover:bg-gray-50"}`}
        >
          <span className="text-gray-600">Police d&apos;origine du modèle</span>
          {!value && <Check size={15} className="text-[#b8924a]" />}
        </button>
        {groups.map((g) => (
          <div key={g.label}>
            <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">{g.label}</p>
            {g.fonts.map((f) => (
              <button
                key={`${g.label}-${f}`}
                type="button"
                onClick={() => onChange(f)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left ${value === f ? "bg-[#fbf7f0]" : "hover:bg-gray-50"}`}
              >
                <span className="min-w-0">
                  <span className="block text-[11px] text-gray-400">{f}</span>
                  <span className="block text-xl text-gray-900 truncate" style={{ fontFamily: `"${f}"` }}>
                    {sample}
                  </span>
                </span>
                {value === f && <Check size={15} className="shrink-0 text-[#b8924a]" />}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorField({ value, onChange }: { value?: string; onChange: (c?: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className={`h-9 px-3 rounded-full border text-xs font-semibold ${!value ? "border-[#b8924a] bg-[#fbf7f0] text-[#8f6f33]" : "border-gray-200 text-gray-600"}`}
      >
        D&apos;origine
      </button>
      {SWATCHES.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`Couleur ${c}`}
          onClick={() => onChange(c)}
          className={`w-9 h-9 rounded-full border ${value === c ? "ring-2 ring-offset-2 ring-[#b8924a]" : "border-gray-200"}`}
          style={{ backgroundColor: c }}
        />
      ))}
      <label className="relative w-9 h-9 rounded-full border border-dashed border-gray-300 overflow-hidden cursor-pointer" title="Autre couleur">
        <input type="color" value={value ?? "#b8924a"} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg">+</span>
      </label>
      {value && <span className="text-xs font-mono text-gray-500">{value}</span>}
    </div>
  );
}

function Range({ value, onChange, min, max, step, format }: { value: number; onChange: (n: number) => void; min: number; max: number; step: number; format: (n: number) => string }) {
  return (
    <div className="flex items-center gap-3">
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-[#b8924a]" />
      <span className="w-14 text-right text-xs font-semibold text-gray-700">{format(value)}</span>
    </div>
  );
}

/** Retouches de polices, couleurs et tailles d'un modèle (studio des modèles). */
export default function StyleEditor({ value, onChange }: { value?: InvitationStyle; onChange: (s: InvitationStyle) => void }) {
  const style = value ?? {};
  const set = (patch: Partial<InvitationStyle>) => onChange({ ...style, ...patch });
  // Toutes les polices pour l'aperçu de la liste (studio admin uniquement)
  const allFontLinks = useMemo(() => googleFontHrefs(FONT_GROUPS.flatMap((g) => g.fonts)), []);

  return (
    <div className="h-full overflow-y-auto overscroll-contain p-3 sm:p-5 space-y-4">
      {allFontLinks.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <style>{styleCss(style, "[data-style-sample]")}</style>

      {/* Aperçu */}
      <div data-style-sample="" className="rounded-2xl border border-[#b8924a]/30 bg-[#fbf7f0] p-5 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#8f6f33] mb-2">Aperçu du style</p>
        <h2 className="font-serif text-4xl text-[#2b2118]">Aïcha &amp; Moussa</h2>
        <h3 className="font-serif text-xl text-[#6b1f2a] mt-1">Samedi 12 décembre 2026</h3>
        <p className="text-sm text-gray-600 mt-3 max-w-md mx-auto">
          Nous avons la joie de vous convier à la célébration de notre union. Votre présence sera notre plus beau cadeau.
        </p>
      </div>
      <p className="text-xs text-gray-500">
        Le style s&apos;applique aux titres (prénoms, titres de section) et aux textes de l&apos;invitation, par-dessus le design du modèle.
        Vérifiez le rendu avec « Aperçu plein écran ».
      </p>

      <section className={card}>
        <h3 className="font-serif text-xl text-gray-900">Titres</h3>
        <div>
          <span className={label}>Police</span>
          <FontPicker value={style.titleFont} onChange={(titleFont) => set({ titleFont })} sample="Aïcha & Moussa" />
        </div>
        <div>
          <span className={label}>Couleur</span>
          <ColorField value={style.titleColor} onChange={(titleColor) => set({ titleColor })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className={label}>Taille</span>
            <Range value={style.titleScale ?? 100} onChange={(titleScale) => set({ titleScale })} min={60} max={160} step={5} format={(n) => `${n} %`} />
          </div>
          <div>
            <span className={label}>Espacement des lettres</span>
            <Range value={style.titleSpacing ?? 0} onChange={(titleSpacing) => set({ titleSpacing })} min={-0.04} max={0.4} step={0.02} format={(n) => n.toFixed(2)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            ["titleItalic", "Italique"],
            ["titleUppercase", "Majuscules"],
          ] as const).map(([key, text]) => (
            <button
              key={key}
              type="button"
              onClick={() => set({ [key]: !style[key] })}
              className={`px-4 py-2 rounded-full border text-xs font-semibold ${style[key] ? "bg-[#2b2118] text-[#f5eee1] border-[#2b2118]" : "border-gray-200 text-gray-600"}`}
            >
              {text}
            </button>
          ))}
        </div>
      </section>

      <section className={card}>
        <h3 className="font-serif text-xl text-gray-900">Textes</h3>
        <div>
          <span className={label}>Police</span>
          <FontPicker value={style.bodyFont} onChange={(bodyFont) => set({ bodyFont })} sample="Votre présence sera notre plus beau cadeau" />
        </div>
        <div>
          <span className={label}>Couleur</span>
          <ColorField value={style.textColor} onChange={(textColor) => set({ textColor })} />
        </div>
        <div>
          <span className={label}>Taille</span>
          <Range value={style.textScale ?? 100} onChange={(textScale) => set({ textScale })} min={70} max={150} step={5} format={(n) => `${n} %`} />
        </div>
      </section>

      <button
        type="button"
        onClick={() => onChange({})}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700"
      >
        <RotateCcw size={15} /> Revenir au style d&apos;origine du modèle
      </button>
    </div>
  );
}
