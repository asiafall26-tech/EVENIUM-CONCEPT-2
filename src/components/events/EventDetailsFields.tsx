"use client";

import { Check } from "lucide-react";
import { PRESTATION_TYPES } from "@/lib/devis/categories";
import type { EventDetails } from "@/lib/eventDetails";

const input =
  "w-full max-w-full min-w-0 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#b8924a] focus:ring-2 focus:ring-[#b8924a]/20";
const label = "block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1.5";

interface Props {
  value: EventDetails;
  onChange: (next: EventDetails) => void;
  showErrors?: boolean;
  /** Version resserrée pour la fenêtre de paiement */
  compact?: boolean;
}

/** Saisie des détails importants d'un événement (nombre d'invités, date, lieu, budget…). */
export function EventDetailsFields({ value, onChange, showErrors, compact }: Props) {
  const set = <K extends keyof EventDetails>(k: K, v: EventDetails[K]) => onChange({ ...value, [k]: v });
  const err = (empty: boolean) => (showErrors && empty ? "border-[#6b1f2a] ring-1 ring-[#6b1f2a]/30" : "");
  const req = <span className="text-[#6b1f2a]"> *</span>;

  return (
    <div className="space-y-4">
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${compact ? "" : "lg:grid-cols-3"} gap-3`}>
        <div>
          <label className={label}>Nombre d'invités{req}</label>
          <input
            type="number"
            min="1"
            value={value.guestsCount}
            onChange={(e) => set("guestsCount", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Ex : 250"
            className={`${input} ${err(!(Number(value.guestsCount) > 0))}`}
          />
        </div>
        <div>
          <label className={label}>Date{req}</label>
          <input type="date" value={value.date} onChange={(e) => set("date", e.target.value)} className={`${input} ${err(!value.date)}`} />
        </div>
        <div>
          <label className={label}>Heure</label>
          <input type="time" value={value.time} onChange={(e) => set("time", e.target.value)} className={input} />
        </div>
        <div className={compact ? "sm:col-span-2" : "sm:col-span-2 lg:col-span-2"}>
          <label className={label}>Lieu{req}</label>
          <input value={value.location} onChange={(e) => set("location", e.target.value)} placeholder="Ex : Terrou-Bi, Dakar" className={`${input} ${err(!value.location.trim())}`} />
        </div>
        <div>
          <label className={label}>Budget prévisionnel</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={value.budget}
              onChange={(e) => set("budget", e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Ex : 5000000"
              className={`${input} pr-14`}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">FCFA</span>
          </div>
        </div>
      </div>

      <div>
        <label className={label}>Prestations recherchées</label>
        <div className="flex flex-wrap gap-1.5">
          {PRESTATION_TYPES.map((p) => {
            const on = value.prestationsRecherchees.includes(p);
            return (
              <button
                key={p}
                type="button"
                aria-pressed={on}
                onClick={() => set("prestationsRecherchees", on ? value.prestationsRecherchees.filter((x) => x !== p) : [...value.prestationsRecherchees, p])}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] border transition-colors ${
                  on ? "bg-[#2b2118] text-[#f5eee1] border-[#2b2118]" : "bg-white text-gray-600 border-gray-200 hover:border-[#b8924a]/60"
                }`}
              >
                {on && <Check size={11} />}
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={label}>Informations importantes</label>
        <textarea
          rows={compact ? 2 : 3}
          value={value.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Accès, contraintes du lieu, invités VIP, tenue exigée…"
          className={`${input} resize-y`}
        />
      </div>
    </div>
  );
}
