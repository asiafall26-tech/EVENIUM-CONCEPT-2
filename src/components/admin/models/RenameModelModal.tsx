"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface RenameModelModalProps {
  modelName: string;
  originalName: string;
  modelImage: string;
  onClose: () => void;
  onSave: (newName: string) => Promise<void>;
}

/** Modale pour renommer une invitation directement depuis le studio admin */
export default function RenameModelModal({
  modelName,
  originalName,
  modelImage,
  onClose,
  onSave,
}: RenameModelModalProps) {
  const [name, setName] = useState(modelName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = name.trim();
    if (!clean) {
      setError("Le nom de l'invitation ne peut pas être vide.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(clean);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer le nouveau nom.");
      setSaving(false);
    }
  };

  const isCustomized = name.trim() !== originalName.trim();

  return (
    <Modal isOpen onClose={onClose} title="Renommer l'invitation" maxWidth="lg">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Aperçu du modèle */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
          <div className="relative w-16 h-14 rounded-xl overflow-hidden bg-gray-900 shrink-0 border border-gray-200">
            <Image src={modelImage} alt={modelName} fill className="object-cover" sizes="64px" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 font-medium">Modèle sélectionné</p>
            <h4 className="font-serif text-base text-gray-900 truncate font-semibold">{modelName}</h4>
            {originalName !== modelName && (
              <p className="text-[11px] text-[#8f6f33]">Nom d&apos;origine : {originalName}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="model-name-input" className="block text-xs font-semibold text-gray-700 mb-1.5">
            Nom public de l&apos;invitation sur le site
          </label>
          <input
            id="model-name-input"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Ex : Velours Rubis Impérial"
            maxLength={60}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/30 focus:border-[#b8924a] transition-all"
            autoFocus
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-gray-400">
              {name.length}/60 caractères
            </span>
            {isCustomized && (
              <button
                type="button"
                onClick={() => setName(originalName)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8f6f33] hover:underline"
              >
                <RotateCcw size={12} /> Rétablir « {originalName} »
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-[#fbf7f0] border border-[#b8924a]/25 p-3 text-xs text-[#6f5527] space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#b8924a]" /> Actualisation automatique en ligne
          </p>
          <p className="text-[11px] opacity-90 leading-relaxed">
            Ce nouveau nom apparaîtra immédiatement sur la page d&apos;accueil, dans la vitrine des invitations,
            et lors du choix de modèle par les clients dans le studio de création.
          </p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2b2118] text-[#f5eee1] text-sm font-semibold hover:bg-black transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} className="text-[#d9c08c]" />}
            Enregistrer le nom
          </button>
        </div>
      </form>
    </Modal>
  );
}
