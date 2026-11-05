"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EVENT_TYPES, EVENT_TYPE_ICONS } from "@/lib/eventTypes";
import type { InvitationKind, ModelClassification } from "@/lib/modelDefaults";

const KINDS: { id: InvitationKind; label: string; hint: string }[] = [
  { id: "animée", label: "Invitation animée", hint: "Ouverture animée, musique, défilement" },
  { id: "carte", label: "Carte statique", hint: "Faire-part ou carton sans musique" },
  { id: "voeu", label: "🌟 Vœu d'Exception", hint: "Pour célébrer : anniversaire, mariage, baptême, graduation" },
  { id: "mot_doux", label: "💌 Les Mots Doux", hint: "Lettre d'amour confidentielle scellée au cachet de cire" },
  { id: "couple", label: "🕯️ Invitation Couple", hint: "Tête-à-tête secret avec scénographie & bouton d'amour RSVP" },
];

const EXTRA_EVENT_CATEGORIES: { name: string; icon: string }[] = [
  { name: "Vœux", icon: "🌟" },
  { name: "Mots Doux", icon: "💌" },
  { name: "Couple", icon: "🕯️" },
  { name: "Graduation", icon: "🎓" },
];

/** Classer un modèle : type d'invitation et types d'événement pour lesquels il est proposé. */
export default function ClassifyModal({
  modelName,
  initial,
  onClose,
  onSave,
}: {
  modelName: string;
  initial: ModelClassification;
  onClose: () => void;
  onSave: (c: ModelClassification) => Promise<void>;
}) {
  const [type, setType] = useState<InvitationKind>(initial.type);
  const [events, setEvents] = useState<string[]>(initial.events);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (t: string) => setEvents((list) => (list.includes(t) ? list.filter((x) => x !== t) : [...list, t]));

  const save = async () => {
    if (!events.length) {
      setError("Choisissez au moins un type d'événement.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({ type, events });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'enregistrer le classement.");
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`Classer « ${modelName} »`} maxWidth="2xl">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Type d&apos;invitation</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setType(k.id)}
                className={`text-left rounded-2xl border px-4 py-3 ${type === k.id ? "border-[#b8924a] bg-[#fbf7f0]" : "border-gray-200"}`}
              >
                <span className="flex items-center justify-between gap-2 text-sm font-semibold text-gray-900">
                  {k.label} {type === k.id && <Check size={16} className="text-[#b8924a]" />}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">{k.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1">Types d&apos;événement</p>
          <p className="text-xs text-gray-500 mb-2">Le modèle apparaît dans ces filtres, sur le site et à la création d&apos;événement. Le premier choisi est le type principal.</p>
          <div className="flex flex-wrap gap-2">
            {EXTRA_EVENT_CATEGORIES.map((cat) => {
              const on = events.includes(cat.name);
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => toggle(cat.name)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold ${
                    on ? "bg-[#b8924a] text-white border-[#b8924a] shadow-xs" : "border-amber-200 bg-amber-50/50 text-[#8f6f33] hover:bg-amber-100/50"
                  }`}
                >
                  <span>{cat.icon}</span> {cat.name}
                  {on && events[0] === cat.name && <span className="ml-1 text-[9px] uppercase tracking-wider text-[#2b181c] font-bold bg-white/70 px-1.5 py-0.2 rounded-full">principal</span>}
                </button>
              );
            })}
            {EVENT_TYPES.map((t) => {
              const on = events.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggle(t)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold ${
                    on ? "bg-[#2b2118] text-[#f5eee1] border-[#2b2118]" : "border-gray-200 text-gray-700"
                  }`}
                >
                  <span>{EVENT_TYPE_ICONS[t]}</span> {t}
                  {on && events[0] === t && <span className="ml-1 text-[9px] uppercase tracking-wider text-[#d9c08c]">principal</span>}
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700">
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2b2118] text-[#f5eee1] text-sm font-semibold disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />} Enregistrer le classement
          </button>
        </div>
      </div>
    </Modal>
  );
}
