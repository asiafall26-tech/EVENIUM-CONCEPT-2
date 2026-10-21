"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, UploadCloud, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { uploadMedia } from "@/utils/uploadMedia";

interface PhotoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentUrl?: string;
  title?: string;
}

export function PhotoPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentUrl,
  title = "Importer une photo",
}: PhotoPickerModalProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const res = await uploadMedia(file, "photos");
      if (res.success && res.url) {
        onSelect(res.url);
        onClose();
      } else {
        setUploadError(res.error || "Erreur lors du téléversement de la photo.");
      }
    } catch (err: any) {
      setUploadError(err?.message || "Échec de l'envoi de la photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleCustomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await processFile(file);
    } else if (file) {
      setUploadError("Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-[#b8924a]/30 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/60">
          <div>
            <h3 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={20} className="text-[#b8924a]" />
              <span>{title}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Sélectionnez une photo depuis votre appareil ou votre galerie personnelle.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body: Upload Zone */}
        <div className="p-6">
          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {uploadError}
            </div>
          )}

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
              dragOver
                ? "border-[#b8924a] bg-[#b8924a]/10"
                : "border-gray-200 hover:border-[#b8924a]/60 hover:bg-gray-50/70"
            }`}
          >
            {uploading ? (
              <div className="py-6 flex flex-col items-center gap-3">
                <Loader2 size={36} className="animate-spin text-[#b8924a]" />
                <p className="text-sm font-semibold text-gray-800">Téléversement de votre photo en cours...</p>
                <p className="text-xs text-gray-500">Optimisation et enregistrement haute définition</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[#fdf8f0] border border-[#b8924a]/30 flex items-center justify-center mb-4 text-[#b8924a] shadow-xs">
                  <UploadCloud size={28} />
                </div>
                <p className="font-semibold text-sm text-gray-900 mb-1">
                  Glissez-déposez votre photo ici
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  ou cliquez pour parcourir les dossiers de votre appareil
                </p>
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-full bg-black text-[#b8924a] border border-[#b8924a]/50 text-xs font-bold hover:bg-gray-900 transition-colors shadow-sm pointer-events-none"
                >
                  Choisir un fichier
                </button>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCustomUpload}
            />
          </div>

          {currentUrl && (
            <div className="mt-4 p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                <Image src={currentUrl} alt="Photo actuelle" fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 truncate">Photo actuelle</p>
                <p className="text-[11px] text-gray-500">Sélectionnez une nouvelle photo pour la remplacer</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <ImageIcon size={14} className="text-[#b8924a]" />
            <span>Formats acceptés : JPG, PNG, WebP (jusqu&apos;à 10 Mo)</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-gray-600 hover:text-black hover:bg-gray-200 transition-colors font-medium cursor-pointer"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
