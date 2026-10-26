"use client";

import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { PhotoField } from "@/components/invitations/velours/VeloursStudio";

/** Photo de couverture d'un modèle : affichée dans la vitrine et les galeries du site. */
export default function CoverModal({
  modelName,
  current,
  original,
  onClose,
  onSave,
}: {
  modelName: string;
  current: string;
  /** Photo d'origine (bouton « Remettre la photo d'origine ») */
  original?: string;
  onClose: () => void;
  /** "" = photo d'origine */
  onSave: (url: string) => Promise<void>;
}) {
  const [cover, setCover] = useState(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (url: string) => {
    setSaving(true);
    setError(null);
    try {
      await onSave(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`Photo de couverture · ${modelName}`} maxWidth="lg">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Cette photo présente le modèle dans la vitrine de la page d&apos;accueil, la galerie « Modèles d&apos;invitations » et le choix du modèle à la création
          d&apos;un événement. Format portrait conseillé, au moins 800 px de large.
        </p>
        <div className="relative w-full max-w-xs mx-auto aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={modelName} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">Aucune photo</span>
          )}
        </div>
        <PhotoField label="Nouvelle photo" value={cover} onChange={setCover} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          {original && cover !== original && (
            <button
              type="button"
              disabled={saving}
              onClick={() => save("")}
              className="mr-auto inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700"
            >
              <RotateCcw size={14} /> Remettre la photo d&apos;origine
            </button>
          )}
          <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700">
            Annuler
          </button>
          <button
            type="button"
            disabled={saving || !cover || cover === current}
            onClick={() => save(cover)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2b2118] text-[#f5eee1] text-sm font-semibold disabled:opacity-50"
          >
            {saving && <Loader2 size={16} className="animate-spin" />} Enregistrer la couverture
          </button>
        </div>
      </div>
    </Modal>
  );
}
