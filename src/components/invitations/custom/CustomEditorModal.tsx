"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Check, Eye, Loader2, RotateCcw, X } from "lucide-react";
import CustomSectionsEditor from "./CustomSectionsEditor";
import CustomInvitationFrame from "./CustomInvitationFrame";
import { customValues, type CustomModelRow, type CustomValues } from "@/lib/customModels";

interface Props {
  model: CustomModelRow;
  /** Valeurs déjà enregistrées sur l'événement */
  initial?: CustomValues | null;
  isStatic?: boolean;
  saveLabel?: string;
  onClose: () => void;
  onSave: (values: CustomValues) => Promise<void>;
}

/** Personnalisation d'un modèle importé par l'organisateur (seuls les éléments ouverts au client). */
export default function CustomEditorModal({ model, initial, isStatic, saveLabel = "Enregistrer", onClose, onSave }: Props) {
  const [values, setValues] = useState<CustomValues>(() => customValues(model.fields, model.content, initial));
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(values);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'enregistrer.");
    } finally {
      setSaving(false);
    }
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetToOriginal = () => {
    setValues(customValues(model.fields, model.content));
    setShowResetConfirm(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-3 md:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-7xl 2xl:max-w-[1680px] h-dvh sm:h-[96vh] max-h-none sm:max-h-[1020px] bg-[#faf7f5] rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300 border border-white/20">
        {/* En-tête */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 sm:py-3 lg:py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="min-w-0">
            <h3 className="font-serif text-lg sm:text-2xl text-gray-900 font-bold leading-tight truncate">Personnalisez « {model.name} »</h3>
            <p className="hidden md:block text-sm text-gray-500">Textes, photos, musiques et rubriques : personnalisez votre faire-part en direct avec prévisualisation immédiate.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="shrink-0 w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Espace Studio plein écran */}
        <div className="flex-1 min-h-0 p-2 sm:p-4 lg:p-5 overflow-hidden">
          <CustomSectionsEditor
            model={model}
            fields={model.fields}
            values={values}
            onChange={setValues}
            isStatic={isStatic}
            onViewFullScreen={() => setPreview(true)}
          />
        </div>

        {/* Barre d'actions inférieure */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:pb-3 border-t border-gray-100 bg-white flex flex-row gap-2 sm:gap-3 items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100/80 text-amber-900 text-xs font-semibold transition-all shadow-xs"
              aria-label="Revenir à la version originale"
              title="Rétablir les textes et photos d'origine du modèle"
            >
              <RotateCcw size={14} className="text-amber-700" />
              <span className="hidden sm:inline">Revenir à la version originale</span>
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Eye size={15} /> <span className="hidden sm:inline">Aperçu plein écran</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {error && <p className="text-xs sm:text-sm text-red-600 mr-1 sm:mr-2 line-clamp-2">{error}</p>}
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 text-sm"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="px-4 sm:px-8 py-3 rounded-xl whitespace-nowrap bg-[#2b2118] hover:bg-black text-[#f5eee1] font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-60 text-sm border border-[#b8924a]/40"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />} {saveLabel}
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

        {/* Aperçu plein écran */}
        {preview && (
          <div className="fixed inset-0 z-[100] bg-black">
            <button
              type="button"
              onClick={() => setPreview(false)}
              aria-label="Retour au studio"
              className="fixed z-[120] left-3 top-[max(0.75rem,env(safe-area-inset-top))] w-10 h-10 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/25 flex items-center justify-center hover:bg-black/70"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-full h-dvh">
              <CustomInvitationFrame model={model} values={values} hideCta className="w-full h-dvh border-0 block bg-white" />
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
