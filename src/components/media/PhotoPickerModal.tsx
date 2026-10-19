"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Check, UploadCloud, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { PRESET_PHOTOS, type EventCategory } from "@/data/mediaLibrary";
import { uploadMedia } from "@/utils/uploadMedia";

interface PhotoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentUrl?: string;
  title?: string;
}

const CATEGORIES: EventCategory[] = [
  "Tous",
  "Mariage",
  "Anniversaire",
  "Gala",
  "Baptême",
  "Corporate",
];

export function PhotoPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentUrl,
  title = "Choisir une photo",
}: PhotoPickerModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("Tous");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredPhotos =
    selectedCategory === "Tous"
      ? PRESET_PHOTOS
      : PRESET_PHOTOS.filter((p) => p.category === selectedCategory);

  const handleCustomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const res = await uploadMedia(file, "photos");
      if (res.success && res.url) {
        onSelect(res.url);
        onClose();
      } else {
        setUploadError(res.error || "Erreur lors du téléversement.");
      }
    } catch (err: any) {
      setUploadError(err?.message || "Échec de l'envoi.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#b8924a]/30 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/60">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={20} className="text-[#b8924a]" />
              <span>{title}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Sélectionnez une photo d&apos;inspiration classée par type d&apos;événement ou importez la vôtre.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Category tabs + Custom Upload CTA */}
        <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-white">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-[#6b1f2a] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Upload Button */}
          <div className="shrink-0">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-[#b8924a] hover:bg-gray-900 border border-[#b8924a]/40 text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Envoi...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={14} />
                  <span>Importer ma photo</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCustomUpload}
            />
          </div>
        </div>

        {uploadError && (
          <div className="px-6 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600 font-medium">
            {uploadError}
          </div>
        )}

        {/* Photo Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 min-h-[300px]">
          {filteredPhotos.map((photo) => {
            const isSelected = currentUrl === photo.url;
            return (
              <div
                key={photo.id}
                onClick={() => {
                  onSelect(photo.url);
                  onClose();
                }}
                className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  isSelected
                    ? "border-[#b8924a] ring-4 ring-[#b8924a]/20 shadow-md"
                    : "border-gray-200 hover:border-[#b8924a]/60"
                }`}
              >
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                {/* Event Category badge */}
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-xs text-white border border-white/20">
                  {photo.category}
                </span>

                {/* Selected Checkmark badge */}
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#b8924a] text-black flex items-center justify-center shadow-md">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}

                {/* Title */}
                <div className="absolute bottom-2.5 inset-x-2.5">
                  <p className="text-[11px] font-semibold text-white leading-tight line-clamp-2 drop-shadow-xs">
                    {photo.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <ImageIcon size={14} className="text-[#b8924a]" />
            <span>{filteredPhotos.length} photos disponibles dans cette catégorie</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-gray-600 hover:text-black hover:bg-gray-200 transition-colors font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
