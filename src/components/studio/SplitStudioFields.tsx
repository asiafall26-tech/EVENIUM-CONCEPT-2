"use client";

import React, { useState, useRef } from "react";
import {
  ChevronDown,
  ImagePlus,
  Loader2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Calendar,
  Clock,
  Sparkles,
  Camera,
  HeartHandshake,
  Users,
  Palette,
  MapPin,
  Mail,
  Gift,
  Quote,
  Check,
  X
} from "lucide-react";
import type {
  StudioFieldConfig,
  StudioSectionConfig,
  ProgrammeStep
} from "@/lib/modelStudioConfigs";
import { uploadMedia } from "@/utils/uploadMedia";
import { compressImageToMax } from "@/utils/imageCompressor";

// Icône de section dynamique
function getSectionIcon(iconName: string) {
  switch (iconName) {
    case "HeartHandshake": return <HeartHandshake size={18} className="text-[#b8924a]" />;
    case "Calendar": return <Calendar size={18} className="text-[#b8924a]" />;
    case "Users": return <Users size={18} className="text-[#b8924a]" />;
    case "Sparkles": return <Sparkles size={18} className="text-[#b8924a]" />;
    case "Clock": return <Clock size={18} className="text-[#b8924a]" />;
    case "Palette": return <Palette size={18} className="text-[#b8924a]" />;
    case "MapPin": return <MapPin size={18} className="text-[#b8924a]" />;
    case "Camera": return <Camera size={18} className="text-[#b8924a]" />;
    case "Mail": return <Mail size={18} className="text-[#b8924a]" />;
    case "Gift": return <Gift size={18} className="text-[#b8924a]" />;
    case "Quote": return <Quote size={18} className="text-[#b8924a]" />;
    default: return <Sparkles size={18} className="text-[#b8924a]" />;
  }
}

export const inputBaseCls =
  "w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-[#b8924a] rounded-xl text-xs sm:text-sm text-gray-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#b8924a]/20 transition-all shadow-xs placeholder:text-gray-400";

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
      // Compression browser-side à 1600px max avant l'envoi
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
      {label && <label className="block text-xs font-semibold text-gray-800">{label}</label>}
      <div className="flex items-center gap-3">
        <div
          className="w-16 h-16 rounded-xl bg-gray-100 bg-cover bg-center border border-gray-200 shrink-0 relative overflow-hidden flex items-center justify-center shadow-xs"
          style={{ backgroundImage: value ? `url("${value}")` : undefined }}
        >
          {uploading ? (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 size={18} className="animate-spin text-[#D4AF37]" />
            </div>
          ) : !value ? (
            <Camera size={18} className="text-gray-400" />
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1b140e] hover:bg-[#2e2318] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin text-[#D4AF37]" />
                <span>Compression &amp; envoi…</span>
              </>
            ) : (
              <>
                <ImagePlus size={14} />
                <span>{value ? "Changer la photo" : "Importer une photo"}</span>
              </>
            )}
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[11px] text-gray-500 hover:text-red-600 transition-colors text-left cursor-pointer"
            >
              Retirer la photo
            </button>
          )}
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
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
        <label className="block text-xs font-semibold text-gray-800">{label}</label>
        <span className="text-[11px] font-semibold text-[#8f6f33]">
          {value.length}/{max} photos
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {value.map((url, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-xl bg-gray-100 border border-gray-200 overflow-hidden group shadow-2xs"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Galerie ${i + 1}`} className="w-full h-full object-cover" />
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
            className="aspect-square rounded-xl border-2 border-dashed border-[#b8924a]/30 hover:border-[#b8924a] hover:bg-[#b8924a]/5 flex flex-col items-center justify-center text-[#8f6f33] transition-all cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin text-[#D4AF37]" />
            ) : (
              <>
                <Plus size={16} />
                <span className="text-[10px] font-bold mt-0.5">Ajouter</span>
              </>
            )}
          </button>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAdd} />
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT SÉLECTEUR DE COULEURS / PALETTE
// ─────────────────────────────────────────────────────────────────────────────
const SUGGESTED_PALETTES = [
  "#5e1622", // Bordeaux
  "#7b5960", // Mauve
  "#d4bfa4", // Sable
  "#f1e7da", // Ivoire
  "#D4AF37", // Or royal
  "#14213d", // Bleu nuit
  "#2a9d8f", // Émeraude doux
  "#e76f51", // Terracotta
  "#000000", // Noir chic
  "#ffffff", // Blanc pur
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

  const toggleColor = (hex: string) => {
    if (colors.includes(hex)) {
      if (colors.length > 1) {
        onChange(colors.filter((c) => c !== hex));
      }
    } else {
      onChange([...colors, hex]);
    }
  };

  return (
    <div className="space-y-2" onFocus={onFocus}>
      <label className="block text-xs font-semibold text-gray-800">{label}</label>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_PALETTES.map((hex) => {
          const selected = colors.includes(hex);
          return (
            <button
              type="button"
              key={hex}
              onClick={() => toggleColor(hex)}
              className={`w-7 h-7 rounded-full border-2 transition-transform flex items-center justify-center cursor-pointer shadow-2xs ${
                selected ? "border-[#b8924a] scale-110 ring-2 ring-[#b8924a]/30" : "border-gray-200 hover:scale-105"
              }`}
              style={{ backgroundColor: hex }}
              title={hex}
            >
              {selected && <Check size={13} className={hex === "#ffffff" ? "text-black" : "text-white"} />}
            </button>
          );
        })}
      </div>
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
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
        <label className="block text-xs font-semibold text-gray-800">{label}</label>
        <span className="text-[11px] text-[#8f6f33] font-semibold">{value.length} moment(s)</span>
      </div>

      <div className="space-y-2">
        {value.map((item, index) => (
          <div
            key={index}
            className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/80 space-y-2 shadow-2xs hover:border-[#b8924a]/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={item.time}
                onChange={(e) => updateItem(index, { time: e.target.value })}
                className="w-24 px-2.5 py-1.5 bg-white border border-gray-200 focus:border-[#b8924a] rounded-lg text-xs font-mono font-bold text-gray-800 outline-none"
              />
              <input
                type="text"
                placeholder="Ex : Arrivée des mariés"
                value={item.label}
                onChange={(e) => updateItem(index, { label: e.target.value })}
                className="flex-1 px-2.5 py-1.5 bg-white border border-gray-200 focus:border-[#b8924a] rounded-lg text-xs font-semibold text-gray-800 outline-none"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Monter"
                  disabled={index === 0}
                  onClick={() => moveUp(index)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-black disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  type="button"
                  aria-label="Descendre"
                  disabled={index === value.length - 1}
                  onClick={() => moveDown(index)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-black disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown size={12} />
                </button>
                <button
                  type="button"
                  aria-label="Supprimer"
                  onClick={() => removeItem(index)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={item.icon || "✨"}
                onChange={(e) => updateItem(index, { icon: e.target.value })}
                className="w-14 px-1.5 py-1 bg-white border border-gray-200 rounded-lg text-sm text-center outline-none cursor-pointer"
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
                className="flex-1 px-2.5 py-1 bg-white border border-gray-200 focus:border-[#b8924a] rounded-lg text-xs text-gray-600 outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-[#b8924a]/30 hover:border-[#b8924a] hover:bg-[#b8924a]/5 text-xs font-semibold text-[#8f6f33] transition-colors cursor-pointer"
      >
        <Plus size={14} /> Ajouter un moment au programme
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCORDÉON DE SECTION DE STUDIO
// ─────────────────────────────────────────────────────────────────────────────
export function StudioSectionAccordion({
  section,
  isOpen,
  onToggle,
  values,
  onChangeField,
  onFocusField,
}: {
  section: StudioSectionConfig;
  isOpen: boolean;
  onToggle: () => void;
  values: Record<string, any>;
  onChangeField: (id: string, val: any) => void;
  onFocusField: (sectionId: string, fieldId: string) => void;
}) {
  return (
    <div className="border border-gray-200/90 rounded-2xl bg-white overflow-hidden shadow-2xs hover:border-[#b8924a]/40 transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left bg-white hover:bg-gray-50/70 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#b8924a]/10 flex items-center justify-center shrink-0">
            {getSectionIcon(section.icon)}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{section.title}</h4>
            {section.desc && <p className="text-[11px] text-gray-400 truncate">{section.desc}</p>}
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#b8924a]" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-gray-100 bg-[#faf8f6]/50">
          {section.fields.map((field) => {
            const val = values[field.id];
            const handleFocus = () => onFocusField(section.id, field.id);

            if (field.type === "photo") {
              return (
                <StudioPhotoField
                  key={field.id}
                  label={field.label}
                  value={val}
                  onChange={(url) => onChangeField(field.id, url)}
                  onFocus={handleFocus}
                  hint={field.hint}
                />
              );
            }

            if (field.type === "gallery") {
              return (
                <StudioGalleryField
                  key={field.id}
                  label={field.label}
                  value={Array.isArray(val) ? val : []}
                  onChange={(urls) => onChangeField(field.id, urls)}
                  onFocus={handleFocus}
                  max={field.max || 5}
                  hint={field.hint}
                />
              );
            }

            if (field.type === "color") {
              return (
                <StudioColorField
                  key={field.id}
                  label={field.label}
                  value={val}
                  onChange={(c) => onChangeField(field.id, c)}
                  onFocus={handleFocus}
                  hint={field.hint}
                />
              );
            }

            if (field.type === "programme") {
              return (
                <StudioProgrammeField
                  key={field.id}
                  label={field.label}
                  value={Array.isArray(val) ? val : []}
                  onChange={(items) => onChangeField(field.id, items)}
                  onFocus={handleFocus}
                />
              );
            }

            if (field.type === "textarea") {
              return (
                <label key={field.id} className="block space-y-1.5" onFocus={handleFocus}>
                  <span className="block text-xs font-semibold text-gray-800">{field.label}</span>
                  <textarea
                    rows={3}
                    value={val || ""}
                    placeholder={field.placeholder}
                    onChange={(e) => onChangeField(field.id, e.target.value)}
                    className={`${inputBaseCls} resize-y min-h-[75px]`}
                  />
                  {field.hint && <p className="text-[11px] text-gray-400">{field.hint}</p>}
                </label>
              );
            }

            if (field.type === "date") {
              return (
                <label key={field.id} className="block space-y-1.5" onFocus={handleFocus}>
                  <span className="block text-xs font-semibold text-gray-800">{field.label}</span>
                  <input
                    type="date"
                    value={val || ""}
                    onChange={(e) => onChangeField(field.id, e.target.value)}
                    className={inputBaseCls}
                  />
                  {field.hint && <p className="text-[11px] text-gray-400">{field.hint}</p>}
                </label>
              );
            }

            if (field.type === "time") {
              return (
                <label key={field.id} className="block space-y-1.5" onFocus={handleFocus}>
                  <span className="block text-xs font-semibold text-gray-800">{field.label}</span>
                  <input
                    type="time"
                    value={val || ""}
                    onChange={(e) => onChangeField(field.id, e.target.value)}
                    className={inputBaseCls}
                  />
                  {field.hint && <p className="text-[11px] text-gray-400">{field.hint}</p>}
                </label>
              );
            }

            // Default: single line text
            return (
              <label key={field.id} className="block space-y-1.5" onFocus={handleFocus}>
                <span className="block text-xs font-semibold text-gray-800">{field.label}</span>
                <input
                  type="text"
                  value={val || ""}
                  placeholder={field.placeholder}
                  onChange={(e) => onChangeField(field.id, e.target.value)}
                  className={inputBaseCls}
                />
                {field.hint && <p className="text-[11px] text-gray-400">{field.hint}</p>}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
