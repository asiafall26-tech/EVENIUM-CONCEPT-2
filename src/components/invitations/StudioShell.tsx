"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Eye, EyeOff, Layers, ListChecks, Plus, RotateCcw, Sparkles, Trash2, type LucideIcon } from "lucide-react";
import { PhotoField, inputCls } from "@/components/invitations/velours/VeloursStudio";
import { newRubrique, type AddedRubrique, type SectionDef, type SectionsState } from "@/lib/invitationSections";

export interface ShellMenu {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  /** rubrique supprimée de l'invitation (affichée barrée) */
  muted?: boolean;
}

interface Props {
  /** nom du modèle */
  title: string;
  subtitle?: string;
  demoUrl?: string;
  menus: ShellMenu[];
  active: string;
  onActive: (id: string) => void;
  onViewFullScreen?: () => void;
  onFinalize?: () => void;
  /** Rubriques de l'invitation : suppression et ajout (tous les modèles) */
  sections?: { defs: SectionDef[]; state: SectionsState; onChange: (next: SectionsState) => void };
  /** Contenu des menus du modèle (affiché selon le menu actif) */
  children: ReactNode;
}

const RUBRIQUES_MENU = "rubriques";
const addedId = (r: AddedRubrique) => `added:${r.id}`;

/**
 * Cadre commun à tous les studios d'invitation (modèles Evenium et importés) :
 * menus en colonne sur grand écran (barre sur téléphone), contenu, étapes Précédent / Suivant,
 * et gestion des rubriques (supprimer, rétablir, ajouter).
 */
export default function StudioShell({ title, subtitle, demoUrl, menus, active, onActive, onViewFullScreen, onFinalize, sections, children }: Props) {
  const added = sections?.state.rubriques ?? [];
  const hidden = sections?.state.hidden ?? [];

  const allMenus: ShellMenu[] = [
    ...menus,
    ...added.map((r) => ({ id: addedId(r), label: r.title || "Nouvelle rubrique", icon: Sparkles })),
    ...(sections ? [{ id: RUBRIQUES_MENU, label: "Rubriques de l'invitation", icon: ListChecks, badge: hidden.length ? `${hidden.length} masquée(s)` : undefined }] : []),
  ];
  const index = allMenus.findIndex((m) => m.id === active);

  const setState = (patch: Partial<SectionsState>) => sections?.onChange({ ...sections.state, ...patch });
  const addRubrique = () => {
    if (!sections) return;
    const last = sections.defs.filter((d) => !hidden.includes(d.key)).at(-1)?.key ?? "";
    const r = newRubrique(last);
    setState({ rubriques: [...added, r] });
    onActive(addedId(r));
  };
  const patchRubrique = (id: string, patch: Partial<AddedRubrique>) => setState({ rubriques: added.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  const removeRubrique = (id: string) => {
    if (!confirm("Supprimer cette rubrique ajoutée ?")) return;
    setState({ rubriques: added.filter((r) => r.id !== id) });
    onActive(menus[0]?.id ?? "all");
  };
  const toggleHidden = (key: string) => setState({ hidden: hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key] });

  const sectionTitle = (n: number, label: string, desc: string, action?: ReactNode) => (
    <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 shrink-0 rounded-lg bg-[#7a1a2e]/10 text-[#7a1a2e] flex items-center justify-center font-bold text-xs">{n}</span>
          <h4 className="font-serif text-lg font-bold text-gray-900">{label}</h4>
        </div>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>
      {action}
    </div>
  );

  const rubriqueEditor = (r: AddedRubrique) => (
    <section key={r.id} className="space-y-4">
      {sectionTitle(
        allMenus.findIndex((m) => m.id === addedId(r)) + 1,
        r.title || "Nouvelle rubrique",
        "Rubrique ajoutée : titre, texte et photo, à l'endroit de votre choix.",
        <button
          type="button"
          onClick={() => removeRubrique(r.id)}
          className="shrink-0 self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold"
        >
          <Trash2 size={13} /> Supprimer cette rubrique
        </button>
      )}
      <div className="p-4 sm:p-6 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-4">
        <label className="block space-y-1.5">
          <span className="block text-xs font-semibold text-gray-700">Titre de la rubrique</span>
          <input className={inputCls} value={r.title} onChange={(e) => patchRubrique(r.id, { title: e.target.value })} />
        </label>
        <label className="block space-y-1.5">
          <span className="block text-xs sm:text-sm font-semibold text-gray-800">Texte</span>
          <textarea
            rows={5}
            className={`${inputCls} min-h-[130px] resize-y`}
            value={r.text}
            placeholder="Ex : informations pratiques, hébergement, remerciements…"
            onChange={(e) => patchRubrique(r.id, { text: e.target.value })}
          />
        </label>
        <div className="space-y-1.5">
          <span className="block text-xs font-semibold text-gray-700">Photo (facultatif)</span>
          <PhotoField label="" value={r.image} onChange={(v) => patchRubrique(r.id, { image: v })} />
        </div>
        <label className="block space-y-1.5">
          <span className="block text-xs font-semibold text-gray-700">Emplacement sur l&apos;invitation</span>
          <select className={inputCls} value={r.after} onChange={(e) => patchRubrique(r.id, { after: e.target.value })}>
            {sections?.defs.map((d) => (
              <option key={d.key} value={d.key}>
                Après « {d.label} »
              </option>
            ))}
            <option value="">À la fin de l&apos;invitation</option>
          </select>
        </label>
      </div>
    </section>
  );

  const rubriquesManager = () => (
    <section key={RUBRIQUES_MENU} className="space-y-4">
      {sectionTitle(allMenus.findIndex((m) => m.id === RUBRIQUES_MENU) + 1, "Rubriques de l'invitation", "Supprimez les rubriques dont vous n'avez pas besoin, ou ajoutez les vôtres.")}
      <div className="p-4 sm:p-6 bg-gray-50/70 rounded-2xl border border-gray-200/70 space-y-2">
        {sections?.defs.map((d) => {
          const off = hidden.includes(d.key);
          return (
            <div key={d.key} className="flex items-center justify-between gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3">
              <span className={`text-sm font-semibold ${off ? "text-gray-400 line-through" : "text-gray-900"}`}>{d.label}</span>
              <button
                type="button"
                onClick={() => toggleHidden(d.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  off ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 text-red-700 hover:bg-red-50"
                }`}
              >
                {off ? <RotateCcw size={13} /> : <Trash2 size={13} />} {off ? "Rétablir" : "Supprimer"}
              </button>
            </div>
          );
        })}
        {added.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 bg-white rounded-xl border border-dashed border-[#b8924a]/50 px-4 py-3">
            <button type="button" onClick={() => onActive(addedId(r))} className="text-sm font-semibold text-[#8f6f33] text-left">
              <Sparkles size={13} className="inline mr-1" /> {r.title || "Nouvelle rubrique"} <span className="text-xs font-normal text-gray-500">(ajoutée)</span>
            </button>
            <button type="button" onClick={() => removeRubrique(r.id)} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-700 text-xs font-semibold">
              <Trash2 size={13} /> Supprimer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRubrique}
          className="w-full inline-flex items-center justify-center gap-2 mt-2 px-4 py-3 rounded-xl border-2 border-dashed border-[#b8924a]/60 text-sm font-semibold text-[#8f6f33] hover:bg-[#fbf7f0]"
        >
          <Plus size={16} /> Ajouter une rubrique
        </button>
        {hidden.length > 0 && (
          <p className="text-xs text-gray-500 flex items-center gap-1.5 pt-1">
            <EyeOff size={13} /> Les rubriques supprimées n&apos;apparaissent plus sur l&apos;invitation ; « Rétablir » les remet en place.
          </p>
        )}
      </div>
    </section>
  );

  const showAll = active === "all";
  const activeAdded = added.find((r) => addedId(r) === active);

  return (
    <div className="w-full h-full flex-1 flex flex-col min-h-0 bg-white sm:rounded-2xl sm:border border-gray-200/80 sm:shadow-xs overflow-hidden">
      {/* Barre de navigation horizontale supérieure pour tous les écrans */}
      <div className="relative border-b border-gray-100 bg-gray-50/95 backdrop-blur-xs p-1.5 sm:p-2.5 shrink-0 sticky top-[var(--studio-sticky-top,0px)] z-20">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain px-1 pr-10 sm:pr-2">
          {allMenus.map((m) => {
            const on = active === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onActive(m.id)}
                className={`flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all ${
                  on
                    ? "bg-[#2b2118] text-[#f5eee1] shadow-sm ring-1 ring-[#b8924a]/40"
                    : m.muted
                      ? "text-gray-400 hover:bg-gray-100"
                      : "text-gray-700 hover:text-gray-950 hover:bg-gray-200/60"
                }`}
              >
                <m.icon size={15} className={`shrink-0 ${on ? "text-[#d4af37]" : m.muted ? "text-gray-300" : "text-[#8f6f33]"}`} />
                <span className={m.muted ? "line-through" : ""}>{m.label}</span>
                {m.badge !== undefined && !m.muted && (
                  <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${on ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}>
                    {m.badge}
                  </span>
                )}
              </button>
            );
          })}
          {sections && (
            <button
              type="button"
              onClick={addRubrique}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 border border-dashed border-[#b8924a]/60 text-[#8f6f33] hover:bg-[#fbf7f0] transition-colors"
            >
              <Plus size={14} /> Ajouter une rubrique
            </button>
          )}
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-2xs shrink-0"
            >
              <ExternalLink size={13} /> Démo
            </a>
          )}
          <button
            type="button"
            onClick={() => onActive("all")}
            className={`flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 ml-auto ${
              showAll ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-950 hover:bg-gray-200/60"
            }`}
            title="Afficher tous les menus à la suite"
          >
            <Layers size={14} /> Tous les menus
          </button>
        </div>
        {/* Dégradé doux sur mobile pour indiquer visuellement le défilement horizontal sans couper abruptement */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent sm:hidden" />
      </div>

      <div className="flex-1 min-w-0 min-h-0 flex flex-col">
        {/* Contenu - Pleine largeur sans compression */}
        <div className="studio-fields flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-full">
              {children}
              {showAll ? added.map(rubriqueEditor) : activeAdded && rubriqueEditor(activeAdded)}
              {sections && (showAll || active === RUBRIQUES_MENU) && rubriquesManager()}
            </div>

            {/* Étapes */}
            {!showAll && index >= 0 && (
              <div className="px-3 sm:px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:pb-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2 shrink-0 sticky bottom-0 z-20 lg:static">
                <button
                  type="button"
                  onClick={() => index > 0 && onActive(allMenus[index - 1].id)}
                  disabled={index <= 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-200/60 disabled:opacity-30"
                >
                  <ChevronLeft size={14} /> Précédent
                </button>
                <span className="text-xs font-medium text-gray-500">
                  Menu {index + 1} sur {allMenus.length}
                </span>
                {index >= allMenus.length - 1 ? (
                  onViewFullScreen ? (
                    <button
                      type="button"
                      onClick={onViewFullScreen}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#b8924a] via-[#F3E5AB] to-[#b8924a] text-black font-extrabold text-xs shadow-md border border-[#b8924a]/50"
                    >
                      <Eye size={14} /> Voir le résultat en plein écran
                    </button>
                  ) : onFinalize ? (
                    <button type="button" onClick={onFinalize} className="px-4 py-2 rounded-xl bg-[#7a1a2e] text-white text-xs font-semibold">
                      Finaliser
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-lg">Toutes les étapes complétées</span>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => onActive(allMenus[index + 1].id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#7a1a2e] text-white text-xs font-semibold shadow-xs"
                  >
                    Suivant <ChevronRight size={14} />
                  </button>
                )}
              </div>
            )}
      </div>
    </div>
  );
}
