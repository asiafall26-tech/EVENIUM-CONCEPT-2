"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Check, X, RotateCcw } from "lucide-react";
import SceauStudio from "./SceauStudio";
import { DEFAULT_SCEAU, type SceauContent } from "./content";

interface Props {
  initial: SceauContent;
  onClose: () => void;
  onSave: (content: SceauContent) => void | Promise<void>;
  saveLabel?: string;
  defaultContent?: SceauContent;
  isStatic?: boolean;
}

/** Full-screen editor for the Sceau d'Or model; mount it only while open. */
export default function SceauEditorModal({ initial, onClose, onSave, saveLabel = "Enregistrer", defaultContent, isStatic }: Props) {
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'enregistrer.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToOriginal = () => {
    setDraft(defaultContent || DEFAULT_SCEAU);
    setShowResetConfirm(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] h-[94vh] max-h-[960px] bg-[#faf7f5] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <div>
            <h3 className="font-serif text-2xl text-gray-900 font-bold">Personnalisez « Sceau d&apos;Or Impérial »</h3>
            <p className="text-sm text-gray-500">Prénoms, date, lieu et Google Maps, programme multi-pages, dress code, cadeaux et fiche invité.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 min-h-0 p-3 sm:p-5 overflow-hidden">
          <SceauStudio value={draft} onChange={setDraft} isStatic={isStatic} />
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row gap-3 sm:items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100/80 text-amber-900 text-xs font-semibold transition-all shadow-xs"
              title="Rétablir les textes, couleurs et programme d'origine du modèle"
            >
              <RotateCcw size={14} className="text-amber-700" />
              <span>Revenir à la version originale</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {error && <p className="text-sm text-red-600 mr-2">{error}</p>}
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 text-sm">
              Annuler
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-[#5c0f21] hover:bg-[#7a1a2e] text-white font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
            >
              <Check size={18} /> {saving ? "Enregistrement…" : saveLabel}
            </button>
          </div>
        </div>

        {/* Modal de confirmation de rétablissement du modèle original */}
        {showResetConfirm && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 shadow-xs">
                <RotateCcw size={22} />
              </div>
              <h4 className="font-serif text-xl font-bold text-gray-900 mb-2">
                Rétablir la version originale ?
              </h4>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Toutes les modifications personnalisées apportées à ce modèle seront réinitialisées à leurs valeurs d'origine. Vous conservez votre modèle et pourrez le rééditer à tout moment sans aucun rachat.
              </p>
              <div className="flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50"
                >
                  Conserver mes modifications
                </button>
                <button
                  type="button"
                  onClick={handleResetToOriginal}
                  className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <RotateCcw size={13} />
                  <span>Oui, rétablir l'original</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
