"use client";

import { useState, useEffect } from "react";
import { Check, MapPin, Plus, Globe, Building2, Navigation } from "lucide-react";
import { EVENT_TYPES } from "@/lib/eventTypes";
import { PRESTATION_TYPES, categoryOfService } from "@/lib/devis/categories";
import { COUNTRY_NAMES, WHOLE_COUNTRY, regionsOf, quartiersOf } from "@/lib/zones";
import type { ProviderActivity } from "@/lib/providerProfile";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const chip = (on: boolean) =>
  `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${
    on ? "bg-[#2b2118] text-[#f5eee1] border-[#2b2118] shadow-xs" : "bg-white text-gray-700 border-gray-200 hover:border-[#b8924a]/60 hover:bg-[#faf7f2]"
  }`;
const input =
  "w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm bg-white outline-none focus:border-[#b8924a] focus:ring-2 focus:ring-[#b8924a]/20 transition-all";

function Section({ 
  icon: Icon,
  title, 
  hint, 
  error, 
  badge,
  children 
}: { 
  icon?: any;
  title: string; 
  hint?: string; 
  error?: boolean; 
  badge?: string;
  children: React.ReactNode 
}) {
  return (
    <div className="bg-[#fffdfa] rounded-2xl p-4 sm:p-5 border border-[#ede3d4] shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
          {Icon && <Icon size={16} className="text-[#b8924a]" />}
          <span>{title}</span> <span className="text-[#9e1b23]">*</span>
        </p>
        {badge && (
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#f4ebe1] text-[#7d5f2a]">
            {badge}
          </span>
        )}
      </div>
      {hint && <p className={`text-xs ${error ? "text-[#9e1b23] font-medium" : "text-gray-500"}`}>{hint}</p>}
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

/** Saisie structurée des types d'événements, prestations et localisation hiérarchique (Pays -> Région -> Quartier). */
export function ActivityFields({ value, onChange, showErrors }: Props) {
  const [customService, setCustomService] = useState("");
  const [customQuartier, setCustomQuartier] = useState("");
  const [otherCountry, setOtherCountry] = useState(!!value.country && !COUNTRY_NAMES.includes(value.country));

  const set = (patch: Partial<ProviderActivity>) => {
    const updated = { ...value, ...patch };
    // Synchronisation automatique de zones pour rétrocompatibilité
    const unifiedZones = Array.from(new Set([
      ...(updated.zones || []),
      ...(updated.region ? [updated.region] : []),
      ...(updated.quartiers || []),
    ])).filter(Boolean);
    onChange({ ...updated, zones: unifiedZones });
  };

  const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const customSelected = value.services.filter((s) => !categoryOfService(s));

  const addCustomService = () => {
    const name = customService.trim();
    if (!name) return;
    if (!value.services.some((s) => norm(s) === norm(name))) set({ services: [...value.services, name] });
    setCustomService("");
  };

  // Liste des régions et quartiers selon la hiérarchie officielle
  const availableRegions = regionsOf(value.country);
  const currentRegion = value.region || availableRegions[0] || "";
  const availableQuartiers = quartiersOf(value.country, currentRegion);

  const selectedQuartiers = value.quartiers || [];

  const toggleQuartier = (q: string) => {
    const nextQuartiers = toggle(selectedQuartiers, q);
    set({ quartiers: nextQuartiers });
  };

  const selectAllQuartiers = () => {
    if (selectedQuartiers.length === availableQuartiers.length) {
      set({ quartiers: [] });
    } else {
      set({ quartiers: [...availableQuartiers] });
    }
  };

  const addCustomQuartier = () => {
    const name = customQuartier.trim();
    if (!name) return;
    if (!selectedQuartiers.some((q) => norm(q) === norm(name))) {
      set({ quartiers: [...selectedQuartiers, name] });
    }
    setCustomQuartier("");
  };

  return (
    <div className="space-y-6">
      {/* 1. TYPES D'ÉVÉNEMENTS */}
      <Section
        title="Types d'événements couverts"
        badge="Ciblage"
        hint={showErrors && !value.event_types.length ? "Choisissez au moins un type d'événement." : "Sélectionnez les festivités pour lesquelles les organisateurs peuvent vous solliciter."}
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
            className="px-3.5 py-2 rounded-full text-xs font-semibold border border-dashed border-[#b8924a]/60 text-[#8f6f33] hover:bg-[#f5eee1] transition"
          >
            {value.event_types.length === EVENT_TYPES.length ? "Tout désélectionner" : "Tous les événements"}
          </button>
        </div>
      </Section>

      {/* 2. PRESTATIONS PROPOSÉES */}
      <Section
        title="Prestations & Métiers proposés"
        badge="Services"
        hint={showErrors && !value.services.length ? "Choisissez au moins une prestation." : "Sélectionnez vos spécialités ; vous pouvez ajouter un intitulé personnalisé si besoin."}
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
            placeholder="Autre spécialité (ex: Maître crêpier, Drone 8K...)"
            className={`${input} py-2.5`}
          />
          <button type="button" onClick={addCustomService} disabled={!customService.trim()} className="shrink-0 inline-flex items-center gap-1.5 px-4 rounded-xl border border-[#b8924a]/60 text-[#8f6f33] text-xs font-semibold hover:bg-[#f5eee1] disabled:opacity-40 transition">
            <Plus size={14} /> Ajouter
          </button>
        </div>
      </Section>

      {/* 3. LOCALISATION HIÉRARCHIQUE : PAYS -> RÉGION -> QUARTIER */}
      <div className="space-y-4 pt-2">
        <div className="border-b border-[#e4d8c4] pb-2">
          <h4 className="font-serif text-lg font-bold text-[#1d120a] flex items-center gap-2">
            <MapPin size={18} className="text-[#b8924a]" />
            <span>Zone Géographique d&apos;Intervention</span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Renseignez votre zone avec précision (Pays, puis Région, puis Quartiers) pour apparaître exactement là où vos clients cherchent.
          </p>
        </div>

        {/* NIVEAU 1 : PAYS */}
        <Section 
          icon={Globe}
          title="1. Pays d'intervention principal" 
          badge="Niveau 1"
          error={showErrors && !value.country.trim()} 
          hint={showErrors && !value.country.trim() ? "Indiquez votre pays d'activité." : undefined}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={otherCountry ? "__other" : value.country}
              onChange={(e) => {
                if (e.target.value === "__other") {
                  setOtherCountry(true);
                  set({ country: "", region: "", quartiers: [], zones: [] });
                } else {
                  setOtherCountry(false);
                  const selectedC = e.target.value;
                  const defaultReg = regionsOf(selectedC)[0] || "";
                  set({ 
                    country: selectedC, 
                    region: defaultReg,
                    quartiers: [],
                    zones: [selectedC, defaultReg].filter(Boolean)
                  });
                }
              }}
              className={input}
            >
              <option value="">Sélectionner votre pays…</option>
              {COUNTRY_NAMES.map((c) => (
                <option key={c} value={c}>
                  {c === "Sénégal" ? "🇸🇳 Sénégal" : c === "Côte d'Ivoire" ? "🇨🇮 Côte d'Ivoire" : c === "France" ? "🇫🇷 France" : c}
                </option>
              ))}
              <option value="__other">Autre pays…</option>
            </select>
            {otherCountry && (
              <input 
                autoFocus 
                value={value.country} 
                onChange={(e) => set({ country: e.target.value })} 
                placeholder="Nom de votre pays" 
                className={input} 
              />
            )}
          </div>
        </Section>

        {/* NIVEAU 2 : RÉGION / VILLE PRINCIPALE */}
        {value.country.trim() && (
          <Section
            icon={Building2}
            title={`2. Région / Ville principale (${value.country})`}
            badge="Niveau 2"
            hint="Choisissez la région où se trouve votre base ou votre atelier principal."
          >
            {availableRegions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableRegions.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      set({ region: r, quartiers: [] });
                    }}
                    className={chip(value.region === r)}
                  >
                    {value.region === r && <Check size={12} />}
                    {r}
                  </button>
                ))}
              </div>
            ) : (
              <input
                value={value.region || ""}
                onChange={(e) => set({ region: e.target.value })}
                placeholder="Ex : Région principale, Ville..."
                className={input}
              />
            )}
          </Section>
        )}

        {/* NIVEAU 3 : QUARTIERS & COMMUNES */}
        {value.country.trim() && value.region && (
          <Section
            icon={Navigation}
            title={`3. Quartiers & Communes d'intervention (${value.region})`}
            badge="Niveau 3"
            hint={showErrors && !selectedQuartiers.length ? "Sélectionnez au moins un quartier ou toute la région." : "Cochez les quartiers spécifiques où vous vous déplacez."}
            error={showErrors && !selectedQuartiers.length}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={selectAllQuartiers}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border border-dashed border-[#b8924a] text-[#7d5f2a] bg-[#fcf9f2] hover:bg-[#f6eee0] transition"
                >
                  {selectedQuartiers.length === availableQuartiers.length ? "✓ Toute la région (Tous les quartiers)" : "Sélectionner toute la région"}
                </button>

                {availableQuartiers.map((q) => (
                  <button
                    key={q}
                    type="button"
                    aria-pressed={selectedQuartiers.includes(q)}
                    onClick={() => toggleQuartier(q)}
                    className={chip(selectedQuartiers.includes(q))}
                  >
                    {selectedQuartiers.includes(q) && <Check size={12} />}
                    {q}
                  </button>
                ))}
              </div>

              {/* Ajout d'un quartier personnalisé si non répertorié */}
              <div className="flex gap-2 max-w-md pt-1">
                <input
                  value={customQuartier}
                  onChange={(e) => setCustomQuartier(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomQuartier();
                    }
                  }}
                  placeholder="Autre quartier ou commune..."
                  className={`${input} py-2.5 text-xs`}
                />
                <button
                  type="button"
                  onClick={addCustomQuartier}
                  disabled={!customQuartier.trim()}
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 rounded-xl border border-[#b8924a]/60 text-[#8f6f33] text-xs font-semibold hover:bg-[#f5eee1] disabled:opacity-40 transition"
                >
                  <Plus size={14} /> Ajouter
                </button>
              </div>

              {selectedQuartiers.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2">
                  <MapPin size={14} className="text-[#b8924a] shrink-0" />
                  <span>
                    <strong>Localisation configurée :</strong> {value.country} • {value.region} • {selectedQuartiers.slice(0, 4).join(", ")}
                    {selectedQuartiers.length > 4 ? ` (+${selectedQuartiers.length - 4} autres)` : ""}
                  </span>
                </div>
              )}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
