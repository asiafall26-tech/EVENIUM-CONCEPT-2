"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EVENT_TYPES, EVENT_TYPE_ICONS } from "@/lib/eventTypes";
import type { InvitationKind, ModelClassification } from "@/lib/modelDefaults";

const KINDS: { id: InvitationKind; label: string; hint: string }[] = [
  { id: "animée", label: "🎬 Invitation animée", hint: "Ouverture animée, musique d'ambiance, défilement cinématique" },
  { id: "carte", label: "📜 Invitation statique", hint: "Faire-part ou carton digital épuré sans musique" },
  { id: "voeu", label: "🎁 Vœux & Célébrations", hint: "Vœux chaleureux, félicitations et célébrations (2 000 FCFA)" },
  { id: "mot_doux", label: "💌 Mots doux", hint: "Lettre d'amour confidentielle scellée au cachet de cire (1 000 FCFA)" },
  { id: "couple", label: "❤️ Espace Couple", hint: "Invitation secrète en tête-à-tête avec scénographie (4 000 FCFA)" },
];

const SERVICE_STRINGS = [
  "vœux",
  "voeux",
  "vœux & célébrations",
  "voeux & celebrations",
  "mots doux",
  "mot doux",
  "mot_doux",
  "espace couple",
  "couple",
  "invitations couple",
  "invitations événementielles",
  "invitations evenementielles",
  "invitation animée",
  "invitation statique",
  "graduation",
];

const isServiceCategory = (name: string) => {
  const s = name.toLowerCase().trim();
  return SERVICE_STRINGS.some((b) => s === b || s.includes("vœux") || s.includes("voeux") || s.includes("mot doux") || s.includes("couple") || s.includes("invitation"));
};

/** Classer un modèle : type d'invitation (service) et types d'événement (ordre officiel). */
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
  // Nettoyage strict : ne conserver QUE les véritables types d'événements
  const cleanInitialEvents = (initial.events || []).filter((e) => !isServiceCategory(e));
  const [events, setEvents] = useState<string[]>(cleanInitialEvents);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (t: string) =>
    setEvents((list) => (list.includes(t) ? list.filter((x) => x !== t) : [...list, t]));

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
                className={`text-left rounded-2xl border px-4 py-3 cursor-pointer transition-all ${
                  type === k.id ? "border-[#b8924a] bg-[#fbf7f0] shadow-2xs" : "border-gray-200 hover:border-gray-300"
                }`}
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
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-gray-700">Types d&apos;événement</p>
            <span className="text-[11px] text-[#8f6f33] font-medium">Ordre officiel</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Le modèle apparaîtra dans ces filtres d&apos;événement. Le premier sélectionné est le type principal.
          </p>
          <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-1">
            {EVENT_TYPES.map((t) => {
              const on = events.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggle(t)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
                    on
                      ? "bg-[#2b2118] text-[#f5eee1] border-[#2b2118] shadow-xs"
                      : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span>{EVENT_TYPE_ICONS[t] || "🎉"}</span> {t}
                  {on && events[0] === t && (
                    <span className="ml-1 text-[9px] uppercase tracking-wider text-[#d9c08c] font-bold bg-white/10 px-1.5 py-0.5 rounded-full">
                      principal
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2b2118] text-[#f5eee1] text-sm font-semibold disabled:opacity-60 hover:bg-[#3d2f23] cursor-pointer"
          >
            {saving && <Loader2 size={16} className="animate-spin" />} Enregistrer le classement
          </button>
        </div>
      </div>
    </Modal>
  );
}
