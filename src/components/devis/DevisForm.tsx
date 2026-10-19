"use client";

import { useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { Briefcase, CalendarDays, Info, ListChecks, Plus, Receipt, Settings2, Sparkles, Trash2, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ServiceCombobox } from "./ServiceCombobox";
import {
  PROVIDER_CATEGORIES,
  getCategory,
  isFieldVisible,
  type CategoryField,
} from "@/lib/devis/categories";
import {
  PRICING_MODES,
  UNITS,
  formatFCFA,
  modeOf,
  normalizeLine,
  type DevisLine,
  type DevisOption,
  type PricingModeId,
} from "@/lib/devis/pricing";
import {
  addCustomService,
  draftAmounts,
  emptyLine,
  loadCustomServices,
  newLocalId,
  removeCustomService,
  saveProviderCategories,
  type CustomService,
  type DevisDraft,
} from "@/lib/devis/persist";
import { eventTypeOptions } from "@/lib/eventTypes";

const input =
  "w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm bg-white outline-none focus:border-[#b8924a] focus:ring-2 focus:ring-[#b8924a]/20 transition-colors";
const label = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2";

const FEE_SUGGESTIONS = [
  "Frais de déplacement",
  "Livraison et reprise",
  "Installation et démontage",
  "Heures supplémentaires",
  "Personnel de service",
  "Location de matériel",
  "Frais de carburant",
  "Hébergement de l'équipe",
  "Assurance annulation",
];

function Card({ icon, title, hint, children, action }: { icon: ReactNode; title: string; hint?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-5 sm:px-7 pt-6 pb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 w-9 h-9 shrink-0 rounded-xl bg-[#f5eee1] text-[#8f6f33] flex items-center justify-center">{icon}</span>
          <div>
            <h2 className="font-serif text-xl text-gray-900 leading-tight">{title}</h2>
            {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="px-5 sm:px-7 pb-6">{children}</div>
    </section>
  );
}

function FieldInput({ field, value, onChange }: { field: CategoryField; value: unknown; onChange: (v: unknown) => void }) {
  switch (field.type) {
    case "textarea":
      return <textarea rows={2} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={`${input} resize-y`} />;
    case "number":
      return (
        <div className="relative">
          <input
            type="number"
            min="0"
            value={(value as number | string) ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder={field.placeholder}
            className={`${input} ${field.suffix ? "pr-24" : ""}`}
          />
          {field.suffix && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">{field.suffix}</span>}
        </div>
      );
    case "select":
      return (
        <select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={input}>
          <option value="">Sélectionner…</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    case "multiselect": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((o) => {
            const on = selected.includes(o);
            return (
              <button
                key={o}
                type="button"
                aria-pressed={on}
                onClick={() => onChange(on ? selected.filter((s) => s !== o) : [...selected, o])}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  on ? "bg-[#2b2118] text-[#f5eee1] border-[#2b2118]" : "bg-white text-gray-600 border-gray-200 hover:border-[#b8924a]/60"
                }`}
              >
                {o}
              </button>
            );
          })}
        </div>
      );
    }
    case "boolean":
      return (
        <div className="flex gap-2">
          {[true, false].map((b) => (
            <button
              key={String(b)}
              type="button"
              onClick={() => onChange(b)}
              className={`px-4 py-2 rounded-xl text-sm border ${value === b ? "bg-[#2b2118] text-[#f5eee1] border-[#2b2118]" : "bg-white border-gray-200 text-gray-600"}`}
            >
              {b ? "Oui" : "Non"}
            </button>
          ))}
        </div>
      );
    case "date":
      return <input type="date" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={input} />;
    default:
      return <input type="text" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={input} />;
  }
}

interface Props {
  draft: DevisDraft;
  setDraft: Dispatch<SetStateAction<DevisDraft>>;
  providerId: string | null;
  /** Activités enregistrées dans le profil du prestataire */
  providerCategoryIds: string[];
  onProviderCategoriesSaved?: (ids: string[]) => void;
  /** Bloc affiché en tête de la colonne principale (demande de l'organisateur…) */
  before?: ReactNode;
  /** Boutons d'action affichés sous le récapitulatif */
  actions?: ReactNode;
}

export function DevisForm({ draft, setDraft, providerId, providerCategoryIds, onProviderCategoriesSaved, before, actions }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [customServices, setCustomServices] = useState<CustomService[]>([]);
  const [customAvailable, setCustomAvailable] = useState(true);
  const [addingCategory, setAddingCategory] = useState(false);
  /** Lignes dont le prestataire a choisi lui-même le mode de calcul */
  const touchedModes = useRef(new Set<string | number>());

  useEffect(() => {
    if (!providerId) return;
    loadCustomServices(supabase, providerId).then(({ list, available }) => {
      setCustomServices(list);
      setCustomAvailable(available);
    });
  }, [providerId, supabase]);

  const amounts = draftAmounts(draft);
  const set = <K extends keyof DevisDraft>(key: K, value: DevisDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  // ── Activités ───────────────────────────────────────────────
  const addCategory = async (id: string) => {
    if (!id || draft.categoryIds.includes(id)) return;
    setDraft((d) => ({ ...d, categoryIds: [...d.categoryIds, id] }));
    setAddingCategory(false);
    // Sans activité dans le profil, la première choisie y est enregistrée
    if (providerId && providerCategoryIds.length === 0) {
      const ids = [id];
      await saveProviderCategories(supabase, providerId, ids);
      onProviderCategoriesSaved?.(ids);
    }
  };
  const removeCategory = (id: string) =>
    setDraft((d) => {
      const details = { ...d.categoryDetails };
      delete details[id];
      return { ...d, categoryIds: d.categoryIds.filter((c) => c !== id), categoryDetails: details };
    });

  const setDetail = (catId: string, key: string, value: unknown) =>
    setDraft((d) => ({ ...d, categoryDetails: { ...d.categoryDetails, [catId]: { ...(d.categoryDetails[catId] || {}), [key]: value } } }));

  const guestsHint = useMemo(() => {
    for (const values of Object.values(draft.categoryDetails)) {
      for (const k of ["nb_personnes", "nb_invites", "capacite", "nb_parts"]) {
        const n = Number(values?.[k]);
        if (n > 0) return n;
      }
    }
    return 0;
  }, [draft.categoryDetails]);

  // ── Services personnalisés ──────────────────────────────────
  const onAddCustom = async (name: string, categoryId: string | null) => {
    const exists = customServices.find((s) => s.name.toLowerCase() === name.toLowerCase() && s.category_id === categoryId);
    if (exists) return exists;
    if (!providerId) return null;
    const { data, error } = await addCustomService(supabase, providerId, name, categoryId);
    if (error || !data) {
      if (!customAvailable) return { id: newLocalId(), name, category_id: categoryId };
      alert("Le service n'a pas pu être enregistré dans votre profil : " + (error?.message || "erreur inconnue"));
      return null;
    }
    setCustomServices((list) => [...list, data as CustomService].sort((a, b) => a.name.localeCompare(b.name)));
    return data as CustomService;
  };
  const onRemoveCustom = async (id: string) => {
    if (!confirm("Retirer ce service de votre liste personnelle ?")) return;
    const { error } = await removeCustomService(supabase, id);
    if (!error) setCustomServices((list) => list.filter((s) => s.id !== id));
  };

  // ── Lignes ──────────────────────────────────────────────────
  const updateLine = (id: string | number, patch: Partial<DevisLine>) =>
    setDraft((d) => ({ ...d, items: d.items.map((it) => (it.id === id ? normalizeLine({ ...it, ...patch }) : it)) }));

  const selectService = (line: DevisLine, name: string, categoryId: string | null) => {
    const patch: Partial<DevisLine> = { designation: name, category_id: categoryId ?? line.category_id ?? null };
    const cat = getCategory(categoryId);
    if (cat && !touchedModes.current.has(line.id)) {
      const mode = modeOf(cat.defaultPricing);
      patch.pricing_mode = mode.id;
      patch.unit = mode.defaultUnit;
      if (mode.id === "par_personne" && guestsHint && line.quantity <= 1) patch.quantity = guestsHint;
    }
    updateLine(line.id, patch);
    if (!draft.serviceName) set("serviceName", name);
  };

  const changeMode = (line: DevisLine, modeId: PricingModeId) => {
    touchedModes.current.add(line.id);
    const mode = PRICING_MODES[modeId];
    const patch: Partial<DevisLine> = { pricing_mode: modeId, unit: mode.unitChoice ? line.unit : mode.defaultUnit };
    if (modeId === "par_personne" && guestsHint && line.quantity <= 1) patch.quantity = guestsHint;
    if (mode.durationLabel && !line.duration) patch.duration = 1;
    if (mode.durationLabel) patch.duration_unit = mode.durationUnits?.[0];
    updateLine(line.id, patch);
  };

  const addLine = () => setDraft((d) => ({ ...d, items: [...d.items, emptyLine(d.categoryIds[0])] }));
  const removeLine = (id: string | number) => setDraft((d) => (d.items.length > 1 ? { ...d, items: d.items.filter((it) => it.id !== id) } : d));

  const modesFor = (line: DevisLine): { main: PricingModeId[]; others: PricingModeId[] } => {
    const cat = getCategory(line.category_id) ?? getCategory(draft.categoryIds[0]);
    const main = [...new Set<PricingModeId>([...(cat?.pricingModes ?? ["unitaire"]), "forfait"])];
    const others = (Object.keys(PRICING_MODES) as PricingModeId[]).filter((m) => !main.includes(m));
    return { main, others };
  };

  // ── Frais ───────────────────────────────────────────────────
  const updateOption = (id: string | number, patch: Partial<DevisOption>) =>
    setDraft((d) => ({ ...d, options: d.options.map((o) => (o.id === id ? { ...o, ...patch } : o)) }));
  const addOption = (name = "") => setDraft((d) => ({ ...d, options: [...d.options, { id: newLocalId(), name, is_included: false, price: 0 }] }));
  const removeOption = (id: string | number) => setDraft((d) => ({ ...d, options: d.options.filter((o) => o.id !== id) }));

  const availableToAdd = PROVIDER_CATEGORIES.filter((c) => !draft.categoryIds.includes(c.id));
  const servicesCats = draft.categoryIds.length ? draft.categoryIds : PROVIDER_CATEGORIES.map((c) => c.id);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
      <div className="xl:col-span-8 space-y-6 min-w-0">
        {before}

        {/* 1. ACTIVITÉ */}
        <Card
          icon={<Briefcase size={18} />}
          title="Votre activité"
          hint="Les services, les champs et les calculs du devis s'adaptent à votre métier."
        >
          {providerCategoryIds.length === 0 && draft.categoryIds.length === 0 && (
            <p className="mb-4 flex items-start gap-2 text-sm text-[#7a5e2b] bg-[#f5eee1] border border-[#e4d8c4] rounded-xl px-4 py-3">
              <Info size={16} className="mt-0.5 shrink-0" />
              Votre profil n'indique pas encore votre activité. Choisissez-la ci-dessous : elle sera enregistrée dans votre profil.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {draft.categoryIds.map((id) => (
              <span key={id} className="inline-flex items-center gap-2 pl-3.5 pr-2 py-2 rounded-full bg-[#2b2118] text-[#f5eee1] text-xs">
                {getCategory(id)?.label}
                {draft.categoryIds.length > 1 && (
                  <button type="button" onClick={() => removeCategory(id)} className="p-0.5 rounded-full hover:bg-white/15" aria-label={`Retirer ${getCategory(id)?.label}`}>
                    <X size={13} />
                  </button>
                )}
              </span>
            ))}
            {addingCategory || draft.categoryIds.length === 0 ? (
              <select autoFocus={addingCategory} value="" onChange={(e) => addCategory(e.target.value)} className={`${input} sm:w-auto py-2`}>
                <option value="">{draft.categoryIds.length ? "Ajouter une activité…" : "Choisir mon activité…"}</option>
                {availableToAdd.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            ) : (
              <button
                type="button"
                onClick={() => setAddingCategory(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-dashed border-[#b8924a]/60 text-xs text-[#8f6f33] hover:bg-[#f5eee1]"
              >
                <Plus size={13} /> Autre activité
              </button>
            )}
          </div>
        </Card>

        {/* 2. INFORMATIONS GÉNÉRALES */}
        <Card icon={<CalendarDays size={18} />} title="Informations générales">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={label}>Nom du client</label>
              <input value={draft.clientName} onChange={(e) => set("clientName", e.target.value)} className={input} placeholder="Ex : Aminata Diop" />
            </div>
            <div>
              <label className={label}>Nom de l'événement</label>
              <input value={draft.eventName} onChange={(e) => set("eventName", e.target.value)} className={input} placeholder="Ex : Mariage de Fatou & Moussa" />
            </div>
            <div>
              <label className={label}>Type d'événement</label>
              <select value={draft.eventType} onChange={(e) => set("eventType", e.target.value)} className={input}>
                <option value="">Sélectionner…</option>
                {eventTypeOptions(draft.eventType).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Date de l'événement</label>
              <input
                type={/^\d{4}-\d{2}-\d{2}$/.test(draft.eventDate) || !draft.eventDate ? "date" : "text"}
                value={draft.eventDate}
                onChange={(e) => set("eventDate", e.target.value)}
                className={input}
              />
            </div>
            <div className="md:col-span-2">
              <label className={label}>Lieu de l'événement</label>
              <input value={draft.eventLocation} onChange={(e) => set("eventLocation", e.target.value)} className={input} placeholder="Ex : King Fahd Palace, Dakar" />
            </div>
            <div className="md:col-span-2">
              <label className={label}>Service proposé</label>
              <ServiceCombobox
                value={draft.serviceName}
                onChange={(name) => set("serviceName", name)}
                categoryIds={servicesCats}
                customServices={customServices}
                onAddCustom={onAddCustom}
                onRemoveCustom={onRemoveCustom}
              />
            </div>
            <div className="md:col-span-2">
              <label className={label}>Description de la prestation</label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                className={`${input} resize-y`}
                placeholder="Présentez votre proposition : ce qui est prévu, votre approche, ce qui fait la différence…"
              />
            </div>
          </div>
        </Card>

        {/* 3. DÉTAILS PAR ACTIVITÉ */}
        {draft.categoryIds.map((catId) => {
          const cat = getCategory(catId);
          if (!cat) return null;
          const values = draft.categoryDetails[catId] || {};
          return (
            <Card key={catId} icon={<Settings2 size={18} />} title={`Détails · ${cat.label}`} hint="Renseignez ce qui précise votre devis ; les champs vides n'apparaîtront pas au client.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {cat.fields
                  .filter((f) => isFieldVisible(f, values))
                  .map((f) => (
                    <div key={f.key} className={f.type === "textarea" || f.type === "multiselect" ? "md:col-span-2" : ""}>
                      <label className={label}>{f.label}</label>
                      <FieldInput field={f} value={values[f.key]} onChange={(v) => setDetail(catId, f.key, v)} />
                    </div>
                  ))}
              </div>
            </Card>
          );
        })}

        {/* 4. PRESTATIONS */}
        <Card
          icon={<ListChecks size={18} />}
          title="Prestations du devis"
          hint="Ajoutez autant de lignes que nécessaire ; chaque ligne a son propre mode de calcul."
        >
          {!customAvailable && (
            <p className="mb-4 text-xs text-[#7a5e2b] bg-[#f5eee1] rounded-lg px-3 py-2">
              Vos services personnalisés ne peuvent pas encore être enregistrés : le script SQL « supabase_devis_personnalisation.sql » doit être exécuté.
            </p>
          )}
          <div className="space-y-4">
            {draft.items.map((line, index) => {
              const mode = modeOf(line.pricing_mode);
              const { main, others } = modesFor(line);
              return (
                <div key={line.id} className="relative rounded-2xl border border-gray-100 bg-[#fbf7f0]/60 p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8f6f33]">Prestation {index + 1}</span>
                    {draft.items.length > 1 && (
                      <button type="button" onClick={() => removeLine(line.id)} className="p-2 -m-2 text-gray-400 hover:text-red-600 rounded-lg" aria-label={`Supprimer la prestation ${index + 1}`}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-7">
                      <label className={label}>Service</label>
                      <ServiceCombobox
                        value={line.designation}
                        onChange={(name, catId) => selectService(line, name, catId)}
                        categoryIds={servicesCats}
                        customServices={customServices}
                        onAddCustom={onAddCustom}
                        onRemoveCustom={onRemoveCustom}
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className={label}>Mode de calcul</label>
                      <select value={mode.id} onChange={(e) => changeMode(line, e.target.value as PricingModeId)} className={input}>
                        {main.map((m) => (
                          <option key={m} value={m}>
                            {PRICING_MODES[m].label}
                          </option>
                        ))}
                        <optgroup label="Autres modes">
                          {others.map((m) => (
                            <option key={m} value={m}>
                              {PRICING_MODES[m].label}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <div className="md:col-span-12">
                      <label className={label}>Description (facultatif)</label>
                      <textarea
                        rows={2}
                        value={line.description ?? ""}
                        onChange={(e) => updateLine(line.id, { description: e.target.value })}
                        className={`${input} resize-y`}
                        placeholder="Ce qui est inclus dans cette prestation…"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-12 gap-3 items-end">
                    <div className={`col-span-2 ${mode.qtyLabel ? (mode.durationLabel ? "md:col-span-3" : "md:col-span-4") : "md:col-span-8"}`}>
                      <label className={label}>{mode.priceLabel}</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={line.unit_price}
                          onChange={(e) => updateLine(line.id, { unit_price: Number(e.target.value) })}
                          className={`${input} pr-14`}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-400">FCFA</span>
                      </div>
                    </div>

                    {mode.qtyLabel && (
                      <div className={`col-span-1 ${mode.durationLabel ? "md:col-span-3" : "md:col-span-4"}`}>
                        <label className={label}>{mode.qtyLabel}</label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={line.quantity}
                            onChange={(e) => updateLine(line.id, { quantity: Number(e.target.value) })}
                            className={`${input} text-center min-w-0`}
                          />
                          {mode.unitChoice && (
                            <select
                              value={line.unit ?? mode.defaultUnit}
                              onChange={(e) => updateLine(line.id, { unit: e.target.value })}
                              className={`${input} w-auto px-2`}
                              aria-label="Unité"
                            >
                              {[...new Set([line.unit || mode.defaultUnit, ...UNITS])].map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    )}

                    {mode.durationLabel && (
                      <div className="col-span-1 md:col-span-3">
                        <label className={label}>{mode.durationLabel}</label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={line.duration ?? 1}
                            onChange={(e) => updateLine(line.id, { duration: Number(e.target.value) })}
                            className={`${input} text-center min-w-0`}
                          />
                          <select
                            value={line.duration_unit ?? mode.durationUnits?.[0]}
                            onChange={(e) => updateLine(line.id, { duration_unit: e.target.value })}
                            className={`${input} w-auto px-2`}
                            aria-label="Unité de durée"
                          >
                            {mode.durationUnits?.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className={`col-span-2 ${mode.durationLabel ? "md:col-span-3" : mode.qtyLabel ? "md:col-span-4" : "md:col-span-4"}`}>
                      <div className="rounded-xl bg-[#2b2118] px-4 py-2.5 text-right">
                        <p className="text-[10px] uppercase tracking-wider text-[#d9c08c]">Total ligne</p>
                        <p className="text-sm font-semibold text-[#f5eee1]">{formatFCFA(line.total)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addLine}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-dashed border-[#b8924a]/60 text-sm font-semibold text-[#8f6f33] hover:bg-[#f5eee1]"
          >
            <Plus size={17} /> Ajouter une prestation
          </button>
        </Card>

        {/* 5. FRAIS SUPPLÉMENTAIRES */}
        <Card icon={<Receipt size={18} />} title="Frais supplémentaires et options" hint="Déplacement, livraison, installation… inclus ou facturés en plus.">
          {draft.options.length > 0 && (
            <div className="space-y-3 mb-4">
              {draft.options.map((opt) => (
                <div key={opt.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-gray-100 bg-[#fbf7f0]/60">
                  <input
                    list="devis-fee-suggestions"
                    value={opt.name}
                    onChange={(e) => updateOption(opt.id, { name: e.target.value })}
                    placeholder="Ex : Frais de déplacement"
                    className={`${input} flex-1`}
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={opt.is_included ? "true" : "false"}
                      onChange={(e) => updateOption(opt.id, { is_included: e.target.value === "true" })}
                      className={`${input} w-auto`}
                    >
                      <option value="false">En supplément</option>
                      <option value="true">Inclus</option>
                    </select>
                    {opt.is_included ? (
                      <span className="w-36 text-center text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-xl py-3">Offert</span>
                    ) : (
                      <div className="relative w-36">
                        <input type="number" min="0" value={opt.price} onChange={(e) => updateOption(opt.id, { price: Number(e.target.value) })} className={`${input} pr-12`} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">FCFA</span>
                      </div>
                    )}
                    <button type="button" onClick={() => removeOption(opt.id)} className="p-2.5 text-gray-400 hover:text-red-600 rounded-lg" aria-label="Supprimer ces frais">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <datalist id="devis-fee-suggestions">
            {FEE_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <div className="flex flex-wrap gap-2">
            {FEE_SUGGESTIONS.slice(0, 4)
              .filter((s) => !draft.options.some((o) => o.name === s))
              .map((s) => (
                <button key={s} type="button" onClick={() => addOption(s)} className="px-3 py-1.5 rounded-full text-xs border border-gray-200 text-gray-600 hover:border-[#b8924a]/60 bg-white">
                  + {s}
                </button>
              ))}
            <button type="button" onClick={() => addOption()} className="px-3 py-1.5 rounded-full text-xs border border-dashed border-[#b8924a]/60 text-[#8f6f33] hover:bg-[#f5eee1]">
              + Autres frais
            </button>
          </div>
        </Card>

        {/* 6. CONDITIONS */}
        <Card icon={<Sparkles size={18} />} title="Conditions du devis">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={label}>Référence</label>
              <input value={draft.reference} onChange={(e) => set("reference", e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>Valable jusqu'au</label>
              <input type="date" value={draft.validUntil} onChange={(e) => set("validUntil", e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>Acompte demandé</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={draft.depositValue}
                  onChange={(e) => set("depositValue", e.target.value === "" ? "" : Number(e.target.value))}
                  className={input}
                  placeholder="Ex : 30"
                />
                <select value={draft.depositType} onChange={(e) => set("depositType", e.target.value as DevisDraft["depositType"])} className={`${input} w-28`}>
                  <option value="percentage">%</option>
                  <option value="amount">FCFA</option>
                </select>
              </div>
            </div>
            <div>
              <label className={label}>Caution (restituée, hors total)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={draft.cautionAmount}
                  onChange={(e) => set("cautionAmount", e.target.value === "" ? "" : Number(e.target.value))}
                  className={`${input} pr-14`}
                  placeholder="0"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-400">FCFA</span>
              </div>
            </div>
            <div>
              <label className={label}>Taxes applicables (TVA)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  list="devis-tax-rates"
                  value={draft.taxRate}
                  onChange={(e) => set("taxRate", e.target.value === "" ? "" : Number(e.target.value))}
                  className={`${input} pr-10`}
                  placeholder="0 = non assujetti"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                <datalist id="devis-tax-rates">
                  <option value="0" />
                  <option value="18" />
                </datalist>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={label}>Notes et conditions</label>
              <textarea
                value={draft.notes}
                onChange={(e) => set("notes", e.target.value)}
                className={`${input} min-h-[110px] resize-y`}
                placeholder="Conditions de paiement, d'annulation, ce qui n'est pas inclus…"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* RÉCAPITULATIF */}
      <aside className="xl:col-span-4">
        <div className="xl:sticky xl:top-28 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="bg-[#2b2118] px-6 py-5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#d9c08c]">Récapitulatif</p>
              <p className="font-serif text-3xl text-[#f5eee1] mt-1">{formatFCFA(amounts.total)}</p>
              <p className="text-xs text-[#f5eee1]/60 mt-0.5">
                {draft.items.length} prestation{draft.items.length > 1 ? "s" : ""}
                {Number(draft.taxRate) > 0 ? " · TTC" : ""}
              </p>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total prestations</span>
                <span className="font-medium text-gray-900">{formatFCFA(amounts.subtotal)}</span>
              </div>
              {amounts.fees > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Frais supplémentaires</span>
                  <span className="font-medium text-gray-900">+ {formatFCFA(amounts.fees)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Remise</span>
                  {amounts.discount > 0 && <span className="text-xs font-semibold text-green-700">− {formatFCFA(amounts.discount)}</span>}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={draft.discountValue}
                    onChange={(e) => set("discountValue", e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="0"
                    className={`${input} py-2.5`}
                  />
                  <select value={draft.discountType} onChange={(e) => set("discountType", e.target.value as DevisDraft["discountType"])} className={`${input} py-2.5 w-24`}>
                    <option value="amount">FCFA</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
              </div>
              {amounts.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA ({Number(draft.taxRate)} %)</span>
                  <span className="font-medium text-gray-900">+ {formatFCFA(amounts.tax)}</span>
                </div>
              )}
              <div className="pt-3 border-t-2 border-gray-100 flex justify-between items-baseline">
                <span className="font-semibold text-gray-900 uppercase tracking-wider text-xs">Total {Number(draft.taxRate) > 0 ? "TTC" : ""}</span>
                <span className="font-semibold text-[#8f6f33] text-2xl">{formatFCFA(amounts.total)}</span>
              </div>
            </div>
            <div className="bg-[#f5eee1] px-6 py-4 space-y-2 text-sm border-t border-[#e4d8c4]">
              <div className="flex justify-between">
                <span className="text-gray-700">
                  Acompte {draft.depositType === "percentage" && Number(draft.depositValue) > 0 ? `(${Number(draft.depositValue)} %)` : ""}
                </span>
                <span className="font-semibold text-gray-900">{formatFCFA(amounts.deposit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Solde</span>
                <span className="font-semibold text-gray-900">{formatFCFA(amounts.balance)}</span>
              </div>
              {Number(draft.cautionAmount) > 0 && (
                <div className="flex justify-between pt-2 border-t border-[#e4d8c4]">
                  <span className="text-gray-700">Caution (restituée)</span>
                  <span className="font-semibold text-gray-900">{formatFCFA(Number(draft.cautionAmount))}</span>
                </div>
              )}
            </div>
          </div>
          {actions}
        </div>
      </aside>
    </div>
  );
}
