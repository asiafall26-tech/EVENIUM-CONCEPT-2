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

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-[#faf7f5] flex flex-col h-dvh">
      <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 border-b border-gray-100 bg-white">
        <h3 className="min-w-0 font-serif text-lg sm:text-2xl text-gray-900 truncate">Personnalisez « {model.name} »</h3>
        <button type="button" onClick={onClose} aria-label="Fermer" className="shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 min-h-0 w-full max-w-6xl mx-auto p-2 sm:p-4 lg:p-6">
        <CustomSectionsEditor model={model} fields={model.fields} values={values} onChange={setValues} isStatic={isStatic} onViewFullScreen={() => setPreview(true)} />
      </div>

      <div className="shrink-0 px-3 sm:px-6 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] border-t border-gray-100 bg-white flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setValues(customValues(model.fields, model.content))}
          aria-label="Revenir à la version originale"
          className="inline-flex items-center gap-1.5 px-3 py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs font-semibold"
        >
          <RotateCcw size={14} /> <span className="hidden sm:inline">Version originale</span>
        </button>
        <button type="button" onClick={() => setPreview(true)} className="inline-flex items-center gap-1.5 px-3 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700">
          <Eye size={16} /> <span className="hidden sm:inline">Aperçu</span>
        </button>
        {error && <p className="text-xs text-red-600 line-clamp-2">{error}</p>}
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={onClose} className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700">
            Annuler
          </button>
          <button type="button" disabled={saving} onClick={save} className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-[#6b1f2a] text-white text-sm font-semibold disabled:opacity-60 whitespace-nowrap">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {saveLabel}
          </button>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 z-[100] bg-black">
          <button
            type="button"
            onClick={() => setPreview(false)}
            aria-label="Retour"
            className="fixed z-[120] left-3 top-[max(0.75rem,env(safe-area-inset-top))] w-10 h-10 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/25 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-full min-h-dvh flex items-center justify-center sm:py-6 sm:px-4 bg-[#0d0a08]">
            <div className="relative w-full sm:max-w-[460px] h-dvh sm:h-[92vh] sm:max-h-[920px] bg-white sm:rounded-[42px] sm:shadow-[0_25px_90px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.1),0_0_0_7px_#1c1714] overflow-hidden flex flex-col">
              <div className="hidden sm:flex absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black/90 rounded-full z-30 pointer-events-none items-center justify-end pr-2.5 gap-1.5 shadow-md ring-1 ring-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0a0a0c] ring-1 ring-white/15 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-[#1c1c30]" />
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d0d14]" />
              </div>
              <CustomInvitationFrame model={model} values={values} hideCta className="w-full h-full border-0 block bg-white" />
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
