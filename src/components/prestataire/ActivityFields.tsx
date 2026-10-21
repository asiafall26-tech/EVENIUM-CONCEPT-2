"use client";

import { useState } from "react";
import { Check, MapPin, Plus } from "lucide-react";
import { EVENT_TYPES } from "@/lib/eventTypes";
import { PRESTATION_TYPES, categoryOfService } from "@/lib/devis/categories";
import { COUNTRY_NAMES, WHOLE_COUNTRY, zonesOf } from "@/lib/zones";
import type { ProviderActivity } from "@/lib/providerProfile";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const chip = (on: boolean) =>
  `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs border transition-colors ${
    on ? "bg-[#2b2118] text-[#f5eee1] border-[#2b2118]" : "bg-white text-gray-700 border-gray-200 hover:border-[#b8924a]/60"
  }`;
const input =
  "w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm bg-white outline-none focus:border-[#b8924a] focus:ring-2 focus:ring-[#b8924a]/20";

function Section({ title, hint, error, children }: { title: string; hint?: string; error?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-900">
        {title} <span className="text-[#6b1f2a]">*</span>
      </p>
      {hint && <p className={`text-xs mt-0.5 ${error ? "text-[#6b1f2a]" : "text-gray-500"}`}>{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

interface Props {
  value: ProviderActivity;
  onChange: (next: ProviderActivity) => void;
  /** Mettre en évidence les champs obligatoires vides */
  showErrors?: boolean;
}

/** Saisie des types d'événements, prestations, pays et zones d'intervention d'un prestataire. */
export function ActivityFields({ value, onChange, showErrors }: Props) {
  const [customService, setCustomService] = useState("");
  const [customZone, setCustomZone] = useState("");
  const [otherCountry, setOtherCountry] = useState(!!value.country && !COUNTRY_NAMES.includes(value.country));

  const set = (patch: Partial<ProviderActivity>) => onChange({ ...value, ...patch });
  const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const customSelected = value.services.filter((s) => !categoryOfService(s));

  const addCustomService = () => {
    const name = customService.trim();
    if (!name) return;
    if (!value.services.some((s) => norm(s) === norm(name))) set({ services: [...value.services, name] });
    setCustomService("");
  };

  const countryZones = zonesOf(value.country);
  const customZones = value.zones.filter((z) => z !== WHOLE_COUNTRY && !countryZones.includes(z));
  const addCustomZone = () => {
    const name = customZone.trim();
    if (!name) return;
    if (!value.zones.some((z) => norm(z) === norm(name))) set({ zones: [...value.zones, name] });
    setCustomZone("");
  };

  return (
    <div className="space-y-8">
      {/* TYPES D'ÉVÉNEMENTS */}
      <Section
        title="Types d'événements"
        hint={showErrors && !value.event_types.length ? "Choisissez au moins un type d'événement." : "Les événements pour lesquels les organisateurs peuvent vous trouver."}
        error={showErrors && !value.event_types.length}
      >
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((t) => (
            <button key={t} type="button" aria-pressed={value.event_types.includes(t)} onClick={() => set({ event_types: toggle(value.event_types, t) })} className={chip(value.event_types.includes(t))}>
              {value.event_types.includes(t) && <Check size={12} />}
              {t}
            </button>
          ))}
          <button
            type="button"
            onClick={() => set({ event_types: value.event_types.length === EVENT_TYPES.length ? [] : [...EVENT_TYPES] })}
            className="px-3.5 py-2 rounded-full text-xs border border-dashed border-[#b8924a]/60 text-[#8f6f33] hover:bg-[#f5eee1]"
          >
            {value.event_types.length === EVENT_TYPES.length ? "Tout désélectionner" : "Tous les événements"}
          </button>
        </div>
      </Section>

      {/* PRESTATIONS */}
      <Section
        title="Prestations proposées"
        hint={showErrors && !value.services.length ? "Choisissez au moins une prestation." : "Sélectionnez vos types de prestation ; ajoutez le vôtre s'il n'est pas dans la liste."}
        error={showErrors && !value.services.length}
      >
        <div className="flex flex-wrap gap-2">
          {[...PRESTATION_TYPES, ...customSelected].map((p) => (
            <button key={p} type="button" aria-pressed={value.services.includes(p)} onClick={() => set({ services: toggle(value.services, p) })} className={chip(value.services.includes(p))}>
              {value.services.includes(p) && <Check size={12} />}
              {p}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2 max-w-md">
          <input
            value={customService}
            onChange={(e) => setCustomService(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomService();
              }
            }}
            placeholder="Autre prestation (non listée)"
            className={`${input} py-2.5`}
          />
          <button type="button" onClick={addCustomService} disabled={!customService.trim()} className="shrink-0 inline-flex items-center gap-1.5 px-4 rounded-xl border border-[#b8924a]/60 text-[#8f6f33] text-xs font-semibold hover:bg-[#f5eee1] disabled:opacity-40">
            <Plus size={14} /> Ajouter
          </button>
        </div>
        {customSelected.length > 0 && <p className="text-xs text-gray-500 mt-2">Vos prestations personnalisées sont enregistrées dans votre profil uniquement.</p>}
      </Section>

      {/* PAYS */}
      <Section title="Pays" error={showErrors && !value.country.trim()} hint={showErrors && !value.country.trim() ? "Indiquez votre pays." : undefined}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={otherCountry ? "__other" : value.country}
            onChange={(e) => {
              if (e.target.value === "__other") {
                setOtherCountry(true);
                set({ country: "", zones: [] });
              } else {
                setOtherCountry(false);
                // Les zones d'un autre pays ne s'appliquent plus
                set({ country: e.target.value, zones: value.country === e.target.value ? value.zones : [] });
              }
            }}
            className={input}
          >
            <option value="">Sélectionner votre pays…</option>
            {COUNTRY_NAMES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="__other">Autre pays…</option>
          </select>
          {otherCountry && <input autoFocus value={value.country} onChange={(e) => set({ country: e.target.value })} placeholder="Nom de votre pays" className={input} />}
        </div>
      </Section>

      {/* ZONES */}
      <Section
        title="Zones d'intervention"
        hint={showErrors && !value.zones.length ? "Choisissez au moins une zone." : "Où vous pouvez intervenir ; ajoutez votre zone si elle n'est pas proposée."}
        error={showErrors && !value.zones.length}
      >
        {!value.country.trim() ? (
          <p className="text-sm text-gray-500">Choisissez d'abord votre pays.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={value.zones.includes(WHOLE_COUNTRY)} onClick={() => set({ zones: toggle(value.zones, WHOLE_COUNTRY) })} className={chip(value.zones.includes(WHOLE_COUNTRY))}>
                <MapPin size={12} /> {WHOLE_COUNTRY}
              </button>
              {[...countryZones, ...customZones].map((z) => (
                <button key={z} type="button" aria-pressed={value.zones.includes(z)} onClick={() => set({ zones: toggle(value.zones, z) })} className={chip(value.zones.includes(z))}>
                  {value.zones.includes(z) && <Check size={12} />}
                  {z}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2 max-w-md">
              <input
                value={customZone}
                onChange={(e) => setCustomZone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomZone();
                  }
                }}
                placeholder="Ajouter ma zone (ville, quartier…)"
                className={`${input} py-2.5`}
              />
              <button type="button" onClick={addCustomZone} disabled={!customZone.trim()} className="shrink-0 inline-flex items-center gap-1.5 px-4 rounded-xl border border-[#b8924a]/60 text-[#8f6f33] text-xs font-semibold hover:bg-[#f5eee1] disabled:opacity-40">
                <Plus size={14} /> Ajouter
              </button>
            </div>
          </>
        )}
      </Section>
    </div>
  );
}
