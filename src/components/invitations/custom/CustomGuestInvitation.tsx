"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import CustomInvitationFrame from "./CustomInvitationFrame";
import { customValues, fetchCustomModel, slugOfModelId, withoutMusicValues, type CustomModelRow, type CustomValues } from "@/lib/customModels";
import type { RsvpPayload } from "@/components/invitations/velours/VeloursInvitation";

interface Props {
  modelId: string;
  /** Valeurs enregistrées par l'organisateur */
  values?: CustomValues | null;
  isStatic?: boolean;
  onRsvp: (rsvp: RsvpPayload & { email?: string }) => Promise<void>;
}

const inputCls = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#b8924a]/30";

/** Invitation d'un modèle importé, vue par un invité : la page du modèle + confirmation de présence. */
export default function CustomGuestInvitation({ modelId, values, isStatic, onRsvp }: Props) {
  const [model, setModel] = useState<CustomModelRow | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", attending: true, guests: 1, message: "" });

  useEffect(() => {
    fetchCustomModel(createClient(), slugOfModelId(modelId)).then(setModel);
  }, [modelId]);

  if (model === undefined) {
    return (
      <div className="min-h-dvh bg-[#111] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4AF37] w-10 h-10" />
      </div>
    );
  }
  if (!model) return <div className="min-h-dvh flex items-center justify-center text-gray-500">Invitation introuvable.</div>;

  const all = customValues(model.fields, model.content, values);
  const shown = isStatic ? withoutMusicValues(model.fields, all) : all;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await onRsvp({ name: form.name.trim(), phone: form.phone.trim(), attending: form.attending, guests: form.attending ? form.guests : 0, message: form.message.trim() });
      setDone(true);
    } catch {
      setError("Votre réponse n'a pas pu être envoyée. Réessayez dans un instant.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative min-h-dvh w-full bg-[#0d0a08] flex items-center justify-center p-0 sm:py-6 overflow-hidden">
      {/* Halo lumineux d'ambiance luxueuse sur ordinateur */}
      <div aria-hidden className="hidden sm:block absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-[#b8924a]/12 blur-[140px] pointer-events-none" />
      <div aria-hidden className="hidden sm:block absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-[#6b1428]/25 blur-[140px] pointer-events-none" />

      {/* Châssis smartphone vertical sur ordinateur, plein écran sur mobile */}
      <div className="relative w-full sm:max-w-[460px] h-dvh sm:h-[92vh] sm:max-h-[920px] bg-white sm:rounded-[42px] sm:shadow-[0_25px_90px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.1),0_0_0_7px_#1c1714] overflow-hidden flex flex-col">
        {/* Dynamic Island / encoche smartphone sur ordinateur */}
        <div className="hidden sm:flex absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black/90 rounded-full z-30 pointer-events-none items-center justify-end pr-2.5 gap-1.5 shadow-md ring-1 ring-white/10">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0a0a0c] ring-1 ring-white/15 flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-[#1c1c30]" />
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0d0d14]" />
        </div>

        <CustomInvitationFrame model={model} values={shown} hideCta className="w-full h-full border-0 block" />

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute z-20 left-1/2 -translate-x-1/2 bottom-[max(1.25rem,env(safe-area-inset-bottom))] px-6 py-3.5 rounded-full bg-[#2b2118] text-[#f5eee1] text-sm font-semibold shadow-2xl border border-[#b8924a]/50 whitespace-nowrap hover:scale-105 active:scale-95 transition-all"
        >
          {done ? "✓ Réponse envoyée" : "Confirmer ma présence"}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl text-gray-900">Votre réponse</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={18} />
              </button>
            </div>
            {done ? (
              <div className="text-center py-6">
                <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
                <p className="mt-3 text-gray-800 font-semibold">Merci, votre réponse a bien été envoyée.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <input required placeholder="Votre nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
                <input type="tel" placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
                <div className="grid grid-cols-2 gap-2">
                  {[
                    [true, "Je serai présent(e)"],
                    [false, "Je ne pourrai pas venir"],
                  ].map(([v, label]) => (
                    <button
                      key={String(v)}
                      type="button"
                      onClick={() => setForm({ ...form, attending: v as boolean })}
                      className={`px-3 py-3 rounded-xl border text-sm font-semibold ${form.attending === v ? "bg-[#2b2118] text-[#f5eee1] border-[#2b2118]" : "border-gray-200 text-gray-700"}`}
                    >
                      {label as string}
                    </button>
                  ))}
                </div>
                {form.attending && (
                  <label className="block">
                    <span className="block text-xs font-semibold text-gray-700 mb-1.5">Nombre de personnes (vous compris)</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={form.guests}
                      onChange={(e) => setForm({ ...form, guests: Math.max(1, Number(e.target.value) || 1) })}
                      className={inputCls}
                    />
                  </label>
                )}
                <textarea rows={3} placeholder="Un petit mot (facultatif)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputCls} resize-none`} />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={sending} className="w-full py-3.5 rounded-xl bg-[#2b2118] text-[#f5eee1] font-semibold disabled:opacity-60">
                  {sending ? "Envoi…" : "Envoyer ma réponse"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
