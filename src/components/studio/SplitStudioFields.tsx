"use client";

import React, { useState, useRef } from "react";
import {
  ImagePlus,
  Loader2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Camera,
  Video,
  Check,
  X,
  Pipette,
  EyeOff,
  Eye,
  Sparkles
} from "lucide-react";
import type {
  StudioFieldConfig,
  StudioSectionConfig,
  ProgrammeStep
} from "@/lib/modelStudioConfigs";
import { uploadMedia } from "@/utils/uploadMedia";
import { compressImageToMax } from "@/utils/imageCompressor";

export const inputBaseCls =
  "w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-[#DDD3C7] focus:border-[#4A0E1A] rounded-xl text-sm text-[#2C1810] leading-relaxed outline-none focus:ring-1 focus:ring-[#4A0E1A]/40 transition-all shadow-xs placeholder:text-gray-400";

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PHOTO UNIQUE (avec compression 1600px intégrée)
// ─────────────────────────────────────────────────────────────────────────────
export function StudioPhotoField({
  label,
  value,
  onChange,
  onFocus,
  hint,
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  onFocus?: () => void;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    e.target.value = "";
    if (!rawFile) return;

    setUploading(true);
    setError(null);
    try {
      const compressed = await compressImageToMax(rawFile, 1600, 0.85);
      const res = await uploadMedia(compressed, "photos");
      if (res.success && res.url) {
        onChange(res.url);
      } else {
        setError(res.error || "Erreur de téléversement.");
      }
    } catch (err: any) {
      setError(err?.message || "Échec de l'envoi.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5" onFocus={onFocus}>
      {label && (
        <label className="block text-xs font-serif tracking-wider uppercase text-[#5C1A27] font-semibold">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <div
          className="w-16 h-16 rounded-xl bg-white bg-cover bg-center border border-[#DDD3C7] shrink-0 relative overflow-hidden flex items-center justify-center shadow-xs"
          style={{ backgroundImage: value ? `url("${value}")` : undefined }}
        >
          {uploading ? (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 size={18} className="animate-spin text-[#D4AF37]" />
            </div>
          ) : !value ? (
            <Camera size={20} className="text-[#8f6f33]" />
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#4A0E1A] hover:bg-[#631423] text-white text-xs font-serif font-bold tracking-wider uppercase transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin text-[#D4AF37]" />
                <span>Compression…</span>
              </>
            ) : (
              <>
                <ImagePlus size={14} />
                <span>{value ? "Remplacer la photo" : "Importer une photo"}</span>
              </>
            )}
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[11px] text-[#8f6f33] hover:text-red-700 transition-colors text-left cursor-pointer"
            >
              Supprimer cette photo
            </button>
          )}
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT VIDÉO (Remplacement, import ou lien direct, suppression)
// ─────────────────────────────────────────────────────────────────────────────
export function StudioVideoField({
  label,
  value,
  onChange,
  onFocus,
  hint,
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  onFocus?: () => void;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    e.target.value = "";
    if (!rawFile) return;

    setUploading(true);
    setError(null);
    try {
      const res = await uploadMedia(rawFile, "videos");
      if (res.success && res.url) {
        onChange(res.url);
      } else {
        setError(res.error || "Erreur de téléversement de la vidéo.");
      }
    } catch (err: any) {
      setError(err?.message || "Échec de l'envoi.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2" onFocus={onFocus}>
      <label className="block text-xs font-serif tracking-wider uppercase text-[#5C1A27] font-semibold">
        {label}
      </label>

      {value && (
        <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-[#DDD3C7] shadow-sm">
          <video src={value} controls className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 bg-black/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors"
            title="Supprimer la vidéo"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex gap-2 items-center">
        <input
          type="url"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Coller l'URL d'une vidéo (MP4, YouTube, Vimeo...)"
          className={`${inputBaseCls} text-xs`}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-2.5 rounded-xl border border-[#4A0E1A] bg-white hover:bg-[#FAF7F2] text-[#4A0E1A] text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} />}
          <span>Fichier</span>
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
      {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT GALERIE PHOTOS (5 photos max avec compression 1600px)
// ─────────────────────────────────────────────────────────────────────────────
export function StudioGalleryField({
  label,
  value = [],
  onChange,
  onFocus,
  max = 5,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (photos: string[]) => void;
  onFocus?: () => void;
  max?: number;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    e.target.value = "";
    if (!rawFile) return;
    if (value.length >= max) {
      setError(`Limite maximale de ${max} photos atteinte.`);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const compressed = await compressImageToMax(rawFile, 1600, 0.85);
      const res = await uploadMedia(compressed, "photos");
      if (res.success && res.url) {
        onChange([...value, res.url]);
      } else {
        setError(res.error || "Erreur de téléversement.");
      }
    } catch (err: any) {
      setError(err?.message || "Échec de l'envoi.");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2" onFocus={onFocus}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-serif tracking-wider uppercase text-[#5C1A27] font-semibold">
          {label}
        </label>
        <span className="text-[11px] font-semibold text-[#8f6f33]">
          {value.length}/{max} photos
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {value.map((url, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-xl bg-white border border-[#DDD3C7] overflow-hidden group shadow-2xs"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              aria-label="Supprimer photo"
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={11} />
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-[#b8924a]/40 hover:border-[#4A0E1A] hover:bg-white flex flex-col items-center justify-center text-[#8f6f33] transition-all cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin text-[#D4AF37]" />
            ) : (
              <>
                <Plus size={16} />
                <span className="text-[10px] font-bold mt-0.5 font-serif uppercase">Ajouter</span>
              </>
            )}
          </button>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAdd} />
      {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT SÉLECTEUR DE COULEURS / PALETTES & COLOR PICKER SUR-MESURE
// ─────────────────────────────────────────────────────────────────────────────
const SUGGESTED_PALETTES = [
  { name: "Bordeaux", hex: "#5e1622" },
  { name: "Mauve", hex: "#7b5960" },
  { name: "Sable", hex: "#d4bfa4" },
  { name: "Ivoire", hex: "#f1e7da" },
  { name: "Or royal", hex: "#D4AF37" },
  { name: "Bleu nuit", hex: "#14213d" },
  { name: "Émeraude", hex: "#2a9d8f" },
  { name: "Terracotta", hex: "#e76f51" },
  { name: "Noir chic", hex: "#140e0a" },
  { name: "Blanc pur", hex: "#ffffff" },
];

export function StudioColorField({
  label,
  value,
  onChange,
  onFocus,
  hint,
}: {
  label: string;
  value: string | string[];
  onChange: (val: any) => void;
  onFocus?: () => void;
  hint?: string;
}) {
  const colors: string[] = Array.isArray(value) ? value : value ? [value] : ["#5e1622", "#D4AF37", "#f1e7da"];
  const [customHex, setCustomHex] = useState("#D4AF37");

  const toggleColor = (hex: string) => {
    if (colors.includes(hex)) {
      if (colors.length > 1) {
        onChange(colors.filter((c) => c !== hex));
      }
    } else {
      onChange([...colors, hex]);
    }
  };

  const addCustomColor = () => {
    if (customHex && !colors.includes(customHex)) {
      onChange([...colors, customHex]);
    }
  };

  const removeColorAt = (index: number) => {
    if (colors.length <= 1) return;
    onChange(colors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3" onFocus={onFocus}>
      <label className="block text-xs font-serif tracking-wider uppercase text-[#5C1A27] font-semibold">
        {label}
      </label>

      {/* 1. Combinaison actuelle */}
      <div className="p-3 bg-white rounded-xl border border-[#DDD3C7] space-y-2">
        <span className="block text-[11px] font-semibold text-gray-700">Votre combinaison sélectionnée :</span>
        <div className="flex flex-wrap items-center gap-2">
          {colors.map((hex, i) => (
            <div
              key={i}
              className="relative group flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full border border-black/10 bg-[#FAF7F2] shadow-2xs"
            >
              <span
                className="w-5 h-5 rounded-full border border-black/20 shadow-xs"
                style={{ backgroundColor: hex }}
              />
              <span className="font-mono text-[11px] uppercase font-bold text-gray-800">{hex}</span>
              {colors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeColorAt(i)}
                  className="w-4 h-4 rounded-full text-gray-400 hover:text-red-600 flex items-center justify-center cursor-pointer"
                  title="Retirer cette couleur"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Palettes suggérées en 1 clic */}
      <div className="space-y-1.5">
        <span className="block text-[11px] text-gray-600 font-medium">Nuances suggérées (cliquez pour ajouter / retirer) :</span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PALETTES.map((item) => {
            const selected = colors.includes(item.hex);
            return (
              <button
                type="button"
                key={item.hex}
                onClick={() => toggleColor(item.hex)}
                className={`w-7 h-7 rounded-full border-2 transition-transform flex items-center justify-center cursor-pointer shadow-2xs ${
                  selected ? "border-[#4A0E1A] scale-110 ring-2 ring-[#4A0E1A]/20" : "border-gray-300 hover:scale-105"
                }`}
                style={{ backgroundColor: item.hex }}
                title={`${item.name} (${item.hex})`}
              >
                {selected && <Check size={13} className={item.hex === "#ffffff" ? "text-black" : "text-white"} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. VÉRITABLE SÉLECTEUR DE COULEURS LIBRE (COLOR PICKER) */}
      <div className="p-3 bg-white rounded-xl border border-[#DDD3C7] flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-xl border border-gray-300 overflow-hidden shrink-0 shadow-xs cursor-pointer flex items-center justify-center">
          <input
            type="color"
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Ouvrir la palette chromatique"
          />
          <div className="w-full h-full" style={{ backgroundColor: customHex }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              placeholder="#D4AF37"
              className="w-24 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold uppercase text-gray-800 outline-none focus:border-[#4A0E1A]"
            />
            <button
              type="button"
              onClick={addCustomColor}
              className="px-3 py-1 bg-[#4A0E1A] text-white rounded-lg text-xs font-bold hover:bg-[#631423] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus size={12} />
              <span>Ajouter</span>
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">Cliquez sur le carré pour ouvrir la roue des couleurs</p>
        </div>
      </div>

      {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT LISTE DU PROGRAMME (heure, moment, détail, icône ; monter, descendre...)
// ─────────────────────────────────────────────────────────────────────────────
const PROGRAMME_ICONS = ["💍", "🥂", "🍽️", "🎵", "🍰", "📸", "✨", "🚗", "⛪", "🕊️"];

export function StudioProgrammeField({
  label,
  value = [],
  onChange,
  onFocus,
}: {
  label: string;
  value: ProgrammeStep[];
  onChange: (items: ProgrammeStep[]) => void;
  onFocus?: () => void;
}) {
  const updateItem = (index: number, patch: Partial<ProgrammeStep>) => {
    const next = [...value];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...value];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    onChange(next);
  };

  const moveDown = (index: number) => {
    if (index >= value.length - 1) return;
    const next = [...value];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    onChange(next);
  };

  const addItem = () => {
    onChange([...value, { time: "18:00", label: "Nouveau moment", detail: "", icon: "✨" }]);
  };

  return (
    <div className="space-y-2.5" onFocus={onFocus}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-serif tracking-wider uppercase text-[#5C1A27] font-semibold">
          {label}
        </label>
        <span className="text-[11px] text-[#8f6f33] font-semibold">{value.length} moment(s)</span>
      </div>

      <div className="space-y-2">
        {value.map((item, index) => (
          <div
            key={index}
            className="p-3 bg-white rounded-xl border border-[#DDD3C7] space-y-2 shadow-2xs hover:border-[#4A0E1A]/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={item.time}
                onChange={(e) => updateItem(index, { time: e.target.value })}
                className="w-24 px-2 py-1.5 bg-[#FAF7F2] border border-[#DDD3C7] focus:border-[#4A0E1A] rounded-lg text-xs font-mono font-bold text-gray-800 outline-none"
              />
              <input
                type="text"
                placeholder="Ex : Arrivée des mariés"
                value={item.label}
                onChange={(e) => updateItem(index, { label: e.target.value })}
                className="flex-1 px-2.5 py-1.5 bg-[#FAF7F2] border border-[#DDD3C7] focus:border-[#4A0E1A] rounded-lg text-xs font-semibold text-gray-800 outline-none"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Monter"
                  disabled={index === 0}
                  onClick={() => moveUp(index)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:text-black disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  type="button"
                  aria-label="Descendre"
                  disabled={index === value.length - 1}
                  onClick={() => moveDown(index)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:text-black disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown size={12} />
                </button>
                <button
                  type="button"
                  aria-label="Supprimer"
                  onClick={() => removeItem(index)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={item.icon || "✨"}
                onChange={(e) => updateItem(index, { icon: e.target.value })}
                className="w-14 px-1 py-1 bg-[#FAF7F2] border border-[#DDD3C7] rounded-lg text-sm text-center outline-none cursor-pointer"
                title="Choisir une icône"
              >
                {PROGRAMME_ICONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Détail facultatif (ex : sur la terrasse)"
                value={item.detail || ""}
                onChange={(e) => updateItem(index, { detail: e.target.value })}
                className="flex-1 px-2.5 py-1 bg-[#FAF7F2] border border-[#DDD3C7] focus:border-[#4A0E1A] rounded-lg text-xs text-gray-600 outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-[#b8924a]/50 hover:border-[#4A0E1A] hover:bg-white text-xs font-serif font-bold tracking-wider uppercase text-[#4A0E1A] transition-colors cursor-pointer"
      >
        <Plus size={14} /> Ajouter un moment au programme
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCORDÉON DE SECTION DE STUDIO (Fidèle à la Capture d'écran Mobile Evenium)
// ─────────────────────────────────────────────────────────────────────────────
export function StudioSectionAccordion({
  section,
  isOpen,
  onToggle,
  values,
  onChangeField,
  onFocusField,
  hiddenFields = [],
  onToggleHideField,
  onAddCustomField,
}: {
  section: StudioSectionConfig;
  isOpen: boolean;
  onToggle: () => void;
  values: Record<string, any>;
  onChangeField: (id: string, val: any) => void;
  onFocusField: (sectionId: string, fieldId: string) => void;
  hiddenFields?: string[];
  onToggleHideField?: (fieldId: string) => void;
  onAddCustomField?: (sectionId: string, label: string, value: string) => void;
}) {
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomLabel, setNewCustomLabel] = useState("");
  const [newCustomVal, setNewCustomVal] = useState("");

  const handleCreateCustom = () => {
    if (!newCustomLabel.trim() || !onAddCustomField) return;
    onAddCustomField(section.id, newCustomLabel.trim(), newCustomVal.trim());
    setNewCustomLabel("");
    setNewCustomVal("");
    setShowAddCustom(false);
  };

  return (
    <div className="border-b border-[#E8DFD5] last:border-b-0 w-full max-w-full overflow-hidden">
      {/* Bouton d'en-tête de section exactement comme sur la capture : titre bordeaux majuscules espacées + signe '+' */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full py-4 px-5 sm:px-6 flex items-center justify-between text-left hover:bg-black/[0.015] active:bg-black/[0.03] transition-colors cursor-pointer select-none"
      >
        <span className="font-serif text-sm sm:text-base tracking-[0.2em] font-medium text-[#4A0E1A] uppercase">
          {section.title}
        </span>
        <span className="text-[#4A0E1A] text-xl font-light leading-none select-none">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {/* Contenu déplié */}
      {isOpen && (
        <div className="px-5 sm:px-6 pb-6 pt-1 space-y-4 bg-[#FAF7F2] border-t border-[#E8DFD5]/50 animate-in fade-in duration-200">
          {section.fields.map((field) => {
            const isHidden = hiddenFields.includes(field.id);
            const val = values[field.id] ?? (field.id.includes('.') ? values[field.id.split('.')[0]]?.[field.id.split('.')[1]] : undefined);
            const handleFocus = () => onFocusField(section.id, field.id);

            if (isHidden) {
              return (
                <div
                  key={field.id}
                  className="p-2.5 bg-gray-100/70 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-gray-500"
                >
                  <span className="line-through">{field.label} (masqué)</span>
                  {onToggleHideField && (
                    <button
                      type="button"
                      onClick={() => onToggleHideField(field.id)}
                      className="text-xs font-semibold text-[#4A0E1A] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Eye size={12} /> Rétablir
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div key={field.id} className="space-y-1 relative group">
                <div className="flex items-center justify-between">
                  {field.type !== "photo" && field.type !== "gallery" && field.type !== "color" && (
                    <label className="block text-xs font-serif tracking-wider uppercase text-[#5C1A27] font-semibold">
                      {field.label}
                    </label>
                  )}

                  {onToggleHideField && (
                    <button
                      type="button"
                      onClick={() => onToggleHideField(field.id)}
                      className="text-[10px] text-gray-400 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                      title="Masquer ce champ de l'invitation"
                    >
                      <EyeOff size={11} /> Masquer
                    </button>
                  )}
                </div>

                {field.type === "photo" && (
                  <StudioPhotoField
                    label={field.label}
                    value={val}
                    onChange={(url) => onChangeField(field.id, url)}
                    onFocus={handleFocus}
                    hint={field.hint}
                  />
                )}

                {field.type === "video" && (
                  <StudioVideoField
                    label={field.label}
                    value={val}
                    onChange={(url) => onChangeField(field.id, url)}
                    onFocus={handleFocus}
                    hint={field.hint}
                  />
                )}

                {field.type === "gallery" && (
                  <StudioGalleryField
                    label={field.label}
                    value={Array.isArray(val) ? val : []}
                    onChange={(urls) => onChangeField(field.id, urls)}
                    onFocus={handleFocus}
                    max={field.max || 5}
                    hint={field.hint}
                  />
                )}

                {field.type === "color" && (
                  <StudioColorField
                    label={field.label}
                    value={val}
                    onChange={(c) => onChangeField(field.id, c)}
                    onFocus={handleFocus}
                    hint={field.hint}
                  />
                )}

                {field.type === "programme" && (
                  <StudioProgrammeField
                    label={field.label}
                    value={Array.isArray(val) ? val : []}
                    onChange={(items) => onChangeField(field.id, items)}
                    onFocus={handleFocus}
                  />
                )}

                {field.type === "textarea" && (
                  <textarea
                    rows={3}
                    value={val || ""}
                    placeholder={field.placeholder}
                    onChange={(e) => onChangeField(field.id, e.target.value)}
                    onFocus={handleFocus}
                    className={`${inputBaseCls} resize-y min-h-[85px]`}
                  />
                )}

                {field.type === "date" && (
                  <input
                    type="date"
                    value={val || ""}
                    onChange={(e) => onChangeField(field.id, e.target.value)}
                    onFocus={handleFocus}
                    className={inputBaseCls}
                  />
                )}

                {field.type === "time" && (
                  <input
                    type="time"
                    value={val || ""}
                    onChange={(e) => onChangeField(field.id, e.target.value)}
                    onFocus={handleFocus}
                    className={inputBaseCls}
                  />
                )}

                {field.type === "text" && (
                  <input
                    type="text"
                    value={val || ""}
                    placeholder={field.placeholder}
                    onChange={(e) => onChangeField(field.id, e.target.value)}
                    onFocus={handleFocus}
                    className={inputBaseCls}
                  />
                )}

                {field.hint && <p className="text-[11px] text-gray-500">{field.hint}</p>}
              </div>
            );
          })}

          {/* Formulaire d'ajout d'un champ personnalisé libre */}
          {onAddCustomField && (
            <div className="pt-2">
              {!showAddCustom ? (
                <button
                  type="button"
                  onClick={() => setShowAddCustom(true)}
                  className="text-xs font-serif font-bold tracking-wider uppercase text-[#4A0E1A] hover:underline flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <Plus size={14} />
                  <span>Ajouter un texte personnalisé</span>
                </button>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-[#DDD3C7] space-y-2 animate-in fade-in">
                  <span className="block text-xs font-semibold text-gray-800">Nouveau champ personnalisé :</span>
                  <input
                    type="text"
                    placeholder="Titre du champ (ex : Hébergement, Mot doux...)"
                    value={newCustomLabel}
                    onChange={(e) => setNewCustomLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-gray-200 rounded-lg text-xs outline-none"
                  />
                  <textarea
                    rows={2}
                    placeholder="Contenu du texte..."
                    value={newCustomVal}
                    onChange={(e) => setNewCustomVal(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-gray-200 rounded-lg text-xs outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCustom(false)}
                      className="px-3 py-1 text-xs text-gray-500 hover:text-black cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateCustom}
                      className="px-3 py-1 bg-[#4A0E1A] text-white rounded-lg text-xs font-bold hover:bg-[#631423] cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
