"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Lightbulb, Plus, Sparkles, Trash2, X } from "lucide-react";
import {
  KIND_LABELS,
  newRubriqueId,
  rubriqueFromSuggestion,
  type Rubrique,
  type RubriqueKind,
  type RubriqueSuggestion,
} from "@/lib/rubriques";

const input =
  "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white outline-none focus:border-[#b8924a] focus:ring-2 focus:ring-[#b8924a]/20";

interface Props {
  value: Rubrique[];
  onChange: (next: Rubrique[]) => void;
  suggestions: RubriqueSuggestion[];
  /** Sources récemment ajoutées (nouvelle prestation ou nouveau type d'événement) : suggestions mises en avant */
  newSources?: string[];
  emptyHint?: string;
}

/** Rubriques libres : ajouter, renommer, choisir le format, réordonner, supprimer ; avec suggestions adaptées. */
export function RubriquesEditor({ value, onChange, suggestions, newSources = [], emptyHint }: Props) {
  const [blankKind, setBlankKind] = useState<RubriqueKind>("texte");

  const update = (id: string, patch: Partial<Rubrique>) => onChange(value.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => onChange(value.filter((r) => r.id !== id));
  const move = (index: number, dir: -1 | 1) => {
    const next = [...value];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  };
  const changeKind = (r: Rubrique, kind: RubriqueKind) => {
    // Le contenu est converti au mieux pour ne rien perdre
    const lines = r.kind === "texte" ? (r.text ?? "").split("\n") : r.kind === "liste" ? r.items ?? [] : (r.rows ?? []).map((x) => (x.value ? `${x.label} : ${x.value}` : x.label));
    const clean = lines.map((x) => x.trim()).filter(Boolean);
    update(r.id, {
      kind,
      text: kind === "texte" ? clean.join("\n") : undefined,
      items: kind === "liste" ? clean : undefined,
      rows: kind === "infos" ? clean.map((label) => ({ label, value: "" })) : undefined,
    });
  };
  const addBlank = () =>
    onChange([
      ...value,
      {
        id: newRubriqueId(),
        title: "",
        kind: blankKind,
        text: blankKind === "texte" ? "" : undefined,
        items: blankKind === "liste" ? [""] : undefined,
        rows: blankKind === "infos" ? [{ label: "", value: "" }] : undefined,
      },
    ]);

  const sorted = [...suggestions].sort((a, b) => Number(newSources.includes(b.source)) - Number(newSources.includes(a.source)));

  return (
    <div className="space-y-4">
      {value.length === 0 && <p className="text-sm text-gray-500">{emptyHint || "Aucune rubrique pour l'instant. Ajoutez-en une ou choisissez une suggestion."}</p>}

      {value.map((r, index) => (
        <div key={r.id} className="rounded-2xl border border-gray-200 bg-[#fbf7f0]/50 p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input value={r.title} onChange={(e) => update(r.id, { title: e.target.value })} placeholder="Titre de la rubrique" className={`${input} font-medium flex-1`} />
            <div className="flex items-center gap-1.5">
              <select value={r.kind} onChange={(e) => changeKind(r, e.target.value as RubriqueKind)} className={`${input} w-auto py-2`} aria-label="Format de la rubrique">
                {(Object.keys(KIND_LABELS) as RubriqueKind[]).map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABELS[k]}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="p-2 rounded-lg text-gray-500 hover:bg-white disabled:opacity-30" aria-label="Monter">
                <ArrowUp size={15} />
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === value.length - 1} className="p-2 rounded-lg text-gray-500 hover:bg-white disabled:opacity-30" aria-label="Descendre">
                <ArrowDown size={15} />
              </button>
              <button type="button" onClick={() => remove(r.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-white" aria-label="Supprimer la rubrique">
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          <div className="mt-3">
            {r.kind === "texte" && (
              <textarea rows={3} value={r.text ?? ""} onChange={(e) => update(r.id, { text: e.target.value })} placeholder="Votre texte…" className={`${input} resize-y`} />
            )}

            {r.kind === "liste" && (
              <div className="space-y-2">
                {(r.items ?? []).map((item, k) => (
                  <div key={k} className="flex gap-2">
                    <input
                      value={item}
                      onChange={(e) => update(r.id, { items: (r.items ?? []).map((x, j) => (j === k ? e.target.value : x)) })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          update(r.id, { items: [...(r.items ?? []), ""] });
                        }
                      }}
                      placeholder="Élément"
                      className={input}
                    />
                    <button type="button" onClick={() => update(r.id, { items: (r.items ?? []).filter((_, j) => j !== k) })} className="p-2 text-gray-400 hover:text-red-600" aria-label="Retirer l'élément">
                      <X size={15} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => update(r.id, { items: [...(r.items ?? []), ""] })} className="text-xs font-semibold text-[#8f6f33] hover:underline">
                  + Ajouter un élément
                </button>
              </div>
            )}

            {r.kind === "infos" && (
              <div className="space-y-2">
                {(r.rows ?? []).map((row, k) => (
                  <div key={k} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input
                      value={row.label}
                      onChange={(e) => update(r.id, { rows: (r.rows ?? []).map((x, j) => (j === k ? { ...x, label: e.target.value } : x)) })}
                      placeholder="Libellé (ex : Capacité)"
                      className={input}
                    />
                    <input
                      value={row.value}
                      onChange={(e) => update(r.id, { rows: (r.rows ?? []).map((x, j) => (j === k ? { ...x, value: e.target.value } : x)) })}
                      placeholder="Valeur (ex : 300 personnes)"
                      className={input}
                    />
                    <button type="button" onClick={() => update(r.id, { rows: (r.rows ?? []).filter((_, j) => j !== k) })} className="p-2 text-gray-400 hover:text-red-600" aria-label="Retirer la ligne">
                      <X size={15} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => update(r.id, { rows: [...(r.rows ?? []), { label: "", value: "" }] })} className="text-xs font-semibold text-[#8f6f33] hover:underline">
                  + Ajouter une ligne
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-2">
        <select value={blankKind} onChange={(e) => setBlankKind(e.target.value as RubriqueKind)} className={`${input} w-auto py-2`} aria-label="Format de la nouvelle rubrique">
          {(Object.keys(KIND_LABELS) as RubriqueKind[]).map((k) => (
            <option key={k} value={k}>
              {KIND_LABELS[k]}
            </option>
          ))}
        </select>
        <button type="button" onClick={addBlank} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-dashed border-[#b8924a]/60 text-sm font-semibold text-[#8f6f33] hover:bg-[#f5eee1]">
          <Plus size={15} /> Ajouter une rubrique
        </button>
      </div>

      {sorted.length > 0 && (
        <div className="rounded-2xl border border-[#e4d8c4] bg-[#f5eee1]/60 p-4">
          <p className="text-xs font-semibold text-[#7a5e2b] flex items-center gap-1.5 mb-3">
            <Lightbulb size={14} /> Rubriques suggérées pour votre activité
          </p>
          <div className="flex flex-wrap gap-2">
            {sorted.map((s) => {
              const fresh = newSources.includes(s.source);
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => onChange([...value, rubriqueFromSuggestion(s)])}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border bg-white hover:border-[#b8924a] ${fresh ? "border-[#b8924a]" : "border-gray-200"}`}
                  title={`Suggérée pour : ${s.source}`}
                >
                  {fresh ? <Sparkles size={12} className="text-[#b8924a]" /> : <Plus size={12} className="text-gray-400" />}
                  {s.title}
                  <span className="text-gray-400">· {s.source}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
