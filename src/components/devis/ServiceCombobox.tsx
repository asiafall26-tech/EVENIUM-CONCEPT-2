"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Plus, Search, Star, X } from "lucide-react";
import { getCategory } from "@/lib/devis/categories";
import type { CustomService } from "@/lib/devis/persist";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

interface Props {
  value: string;
  /** Service choisi (ou saisi) et catégorie à laquelle il appartient */
  onChange: (name: string, categoryId: string | null) => void;
  /** Activités dont on propose les services */
  categoryIds: string[];
  customServices: CustomService[];
  onAddCustom: (name: string, categoryId: string | null) => Promise<CustomService | null>;
  onRemoveCustom?: (id: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Liste déroulante « Sélectionner un service » : recherche dans les services de la catégorie,
 * services personnalisés du prestataire et ajout d'un nouveau service à la volée.
 */
export function ServiceCombobox({
  value,
  onChange,
  categoryIds,
  customServices,
  onAddCustom,
  onRemoveCustom,
  placeholder = "Sélectionner un service",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [pickedCat, setNewCat] = useState<string | null>(categoryIds[0] ?? null);
  // Activité du nouveau service : celle choisie, tant qu'elle fait partie du devis
  const newCat = pickedCat && categoryIds.includes(pickedCat) ? pickedCat : categoryIds[0] ?? null;
  const [saving, setSaving] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setOpen(false);
    setQuery("");
    setAdding(false);
    setNewName("");
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
        setAdding(false);
        setNewName("");
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const q = norm(query.trim());

  const groups = useMemo(() => {
    const mine = customServices.filter((s) => !s.category_id || categoryIds.includes(s.category_id));
    const out: { key: string; label: string; items: { name: string; categoryId: string | null; customId?: string }[] }[] = [];
    const myItems = mine.filter((s) => !q || norm(s.name).includes(q)).map((s) => ({ name: s.name, categoryId: s.category_id, customId: s.id }));
    if (myItems.length) out.push({ key: "mine", label: "Mes services", items: myItems });
    for (const id of categoryIds) {
      const cat = getCategory(id);
      if (!cat) continue;
      const items = cat.services.filter((s) => !q || norm(s).includes(q)).map((s) => ({ name: s, categoryId: id }));
      if (items.length) out.push({ key: id, label: categoryIds.length > 1 ? cat.label : "Services proposés", items });
    }
    return out;
  }, [customServices, categoryIds, q]);

  const exactExists = useMemo(() => {
    if (!q) return true;
    const all = [...customServices.map((s) => s.name), ...categoryIds.flatMap((id) => getCategory(id)?.services ?? [])];
    return all.some((n) => norm(n) === q);
  }, [q, customServices, categoryIds]);

  const pick = (name: string, categoryId: string | null) => {
    onChange(name, categoryId);
    close();
  };

  const startAdding = (prefill = "") => {
    setAdding(true);
    setNewName(prefill);
  };

  const confirmAdd = async () => {
    const name = newName.trim();
    if (!name || saving) return;
    setSaving(true);
    const created = await onAddCustom(name, newCat);
    setSaving(false);
    pick(created?.name ?? name, created?.category_id ?? newCat);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => searchRef.current?.focus(), 0);
        }}
        className={`w-full flex items-center justify-between gap-2 border rounded-xl px-3.5 py-3 text-sm text-left bg-white transition-colors ${
          open ? "border-[#b8924a] ring-2 ring-[#b8924a]/20" : "border-gray-200 hover:border-[#b8924a]/50"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`truncate ${value ? "text-gray-900 font-medium" : "text-gray-400"}`}>{value || placeholder}</span>
        <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-40 mt-2 w-full min-w-[280px] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-2.5 border-b border-gray-100">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") close();
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const first = groups[0]?.items[0];
                    if (first) pick(first.name, first.categoryId);
                    else if (query.trim()) startAdding(query.trim());
                  }
                }}
                placeholder="Rechercher un service…"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg bg-gray-50 border border-transparent focus:border-[#b8924a]/40 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto py-1" role="listbox">
            {groups.length === 0 && (
              <p className="px-4 py-4 text-sm text-gray-500">Aucun service ne correspond à « {query} ».</p>
            )}
            {groups.map((g) => (
              <div key={g.key} className="py-1">
                <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#8f6f33] flex items-center gap-1.5">
                  {g.key === "mine" && <Star size={10} className="fill-current" />}
                  {g.label}
                </p>
                {g.items.map((it) => {
                  const selected = it.name === value;
                  return (
                    <div key={`${g.key}-${it.name}`} className="group flex items-center">
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => pick(it.name, it.categoryId)}
                        className={`flex-1 flex items-center justify-between gap-2 px-4 py-2 text-sm text-left hover:bg-[#f5eee1] ${
                          selected ? "text-[#8f6f33] font-medium" : "text-gray-800"
                        }`}
                      >
                        <span>{it.name}</span>
                        {selected && <Check size={14} />}
                      </button>
                      {it.customId && onRemoveCustom && (
                        <button
                          type="button"
                          onClick={() => onRemoveCustom(it.customId!)}
                          className="mr-2 p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Retirer de mes services"
                          aria-label={`Retirer ${it.name} de mes services`}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            {!adding && (
              <button
                type="button"
                onClick={() => startAdding(query.trim())}
                className="w-full px-4 py-2 text-sm text-left text-gray-500 hover:bg-[#f5eee1] italic"
              >
                Autre service…
              </button>
            )}
          </div>

          <div className="border-t border-gray-100 p-2.5 bg-[#fbf7f0]">
            {adding ? (
              <div className="space-y-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      confirmAdd();
                    }
                    if (e.key === "Escape") setAdding(false);
                  }}
                  placeholder="Nom du nouveau service"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:border-[#b8924a] outline-none"
                />
                {categoryIds.length > 1 && (
                  <select
                    value={newCat ?? ""}
                    onChange={(e) => setNewCat(e.target.value || null)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white outline-none"
                  >
                    {categoryIds.map((id) => (
                      <option key={id} value={id}>
                        {getCategory(id)?.label}
                      </option>
                    ))}
                  </select>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAdding(false)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={confirmAdd}
                    disabled={!newName.trim() || saving}
                    className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-black text-[#f5eee1] hover:bg-gray-800 flex items-center justify-center gap-1.5"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    Ajouter à mes services
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => startAdding(exactExists ? "" : query.trim())}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-lg text-[#8f6f33] border border-dashed border-[#b8924a]/50 hover:bg-[#f5eee1]"
              >
                <Plus size={15} />
                {exactExists || !query.trim() ? "Ajouter un service" : `Ajouter « ${query.trim()} »`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
