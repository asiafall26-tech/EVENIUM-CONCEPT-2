"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowLeft, Eye, Globe, Loader2, Music, Palette, PenLine, Save, X } from "lucide-react";
import { AudioField } from "@/components/invitations/velours/VeloursStudio";
import { InvitationCtaContext } from "@/components/invitations/InvitationCtaContext";
import StyleEditor from "./StyleEditor";
import { withoutMusic } from "@/lib/staticCard";
import type { ModelContent, SiteModel } from "./registry";

type Tab = "contenu" | "style" | "musique";

const TABS: { id: Tab; label: string; icon: typeof PenLine }[] = [
  { id: "contenu", label: "Contenu", icon: PenLine },
  { id: "style", label: "Style & polices", icon: Palette },
  { id: "musique", label: "Musique", icon: Music },
];

interface Props {
  model: SiteModel;
  modelName?: string;
  /** Carte statique : sans musique */
  isStatic?: boolean;
  initial: ModelContent;
  onClose: () => void;
  onSave: (content: ModelContent, name?: string) => Promise<void>;
  onPublish: (content: ModelContent, name?: string) => Promise<void>;
}

/** Studio admin d'un modèle du site : contenu, style, musique, aperçu, enregistrement et publication. */
export default function AdminModelEditor({
  model,
  modelName: initialName,
  initial,
  onClose,
  onSave,
  onPublish,
  isStatic = false,
}: Props) {
  const [modelName, setModelName] = useState(initialName || model.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(initialName || model.name);
  const [draft, setDraft] = useState<ModelContent>(initial);
  const [tab, setTab] = useState<Tab>("contenu");
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  const update = (next: ModelContent) => {
    setDraft(next);
    setDirty(true);
    setMessage(null);
  };

  const commitNameChange = () => {
    const clean = nameInput.trim();
    if (clean) {
      setModelName(clean);
      setDirty(true);
    } else {
      setNameInput(modelName);
    }
    setIsEditingName(false);
  };

  // La page ne défile pas derrière le studio
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const run = async (kind: "save" | "publish") => {
    setBusy(kind);
    setMessage(null);
    try {
      await (kind === "save" ? onSave(draft, modelName) : onPublish(draft, modelName));
      setDirty(false);
      setMessage({
        ok: true,
        text:
          kind === "save"
            ? `« ${modelName} » : modification enregistrée (pas encore publiée).`
            : `« ${modelName} » : modèle publié sur le site.`,
      });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Une erreur est survenue." });
    } finally {
      setBusy(null);
    }
  };

  const close = () => {
    if (dirty && !confirm("Quitter sans enregistrer vos modifications ?")) return;
    onClose();
  };

  const a = model.audio;
  const Studio = model.Studio;
  const Invitation = model.Invitation;

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-[#faf7f5]">
      {/* Plein écran : toute la place pour éditer */}
      <div className="w-full h-dvh overflow-hidden flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-gray-100 bg-white shrink-0">
          <div className="min-w-0 flex-1 max-w-xl">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#8f6f33]">Studio des modèles</p>
            {isEditingName ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Nom de l'invitation..."
                  maxLength={60}
                  className="font-serif text-base sm:text-xl text-gray-900 bg-gray-50 border border-[#b8924a] rounded-lg px-2.5 py-1 w-full focus:outline-none focus:ring-2 focus:ring-[#b8924a]/20"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitNameChange();
                    } else if (e.key === "Escape") {
                      setNameInput(modelName);
                      setIsEditingName(false);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={commitNameChange}
                  className="px-3 py-1.5 rounded-lg bg-[#b8924a] text-white text-xs font-semibold shrink-0 shadow-sm"
                >
                  Valider
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(modelName);
                    setIsEditingName(false);
                  }}
                  className="px-2 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs shrink-0"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h3 className="font-serif text-lg sm:text-2xl text-gray-900 truncate">{modelName}</h3>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(modelName);
                    setIsEditingName(true);
                  }}
                  title="Modifier le nom de cette invitation"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium text-[#8f6f33] bg-[#fbf7f0] border border-[#b8924a]/20 hover:bg-[#f5ede0] transition-colors shrink-0"
                >
                  <PenLine size={13} /> <span className="hidden sm:inline">Renommer</span>
                </button>
              </div>
            )}
          </div>
          <button type="button" onClick={close} aria-label="Fermer" className="shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Onglets */}
        <div className="px-3 sm:px-6 pt-2.5 bg-white border-b border-gray-100 shrink-0">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.filter((t) => !(isStatic && t.id === "musique")).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-semibold border-b-2 ${
                  tab === t.id ? "border-[#b8924a] text-gray-900" : "border-transparent text-gray-500"
                }`}
              >
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Corps */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {tab === "contenu" && (
            <div className="h-full w-full max-w-[1680px] mx-auto p-2 sm:p-4 lg:p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 p-3 px-4 rounded-2xl bg-white border border-gray-100 shadow-sm shrink-0">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Nom public de l&apos;invitation</span>
                  <p className="font-serif text-base sm:text-lg text-gray-900 truncate font-semibold">{modelName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(modelName);
                    setIsEditingName(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#b8924a] hover:text-[#8f6f33] transition-colors shrink-0"
                >
                  <PenLine size={13} /> Modifier le nom
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <Studio value={draft} onChange={update} onViewFullScreen={() => setPreview(true)} isStatic={isStatic} />
              </div>
            </div>
          )}
          {tab === "style" && <StyleEditor value={draft.style} onChange={(style) => update({ ...draft, style })} />}
          {tab === "musique" && !isStatic && (
            <div className="h-full overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8 space-y-5 max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 space-y-3">
                <h3 className="font-serif text-xl text-gray-900">Musique de l&apos;invitation</h3>
                <p className="text-xs text-gray-500">
                  « Choisir une musique » ouvre la banque de sons Evenium. Écoutez, choisissez, puis ajustez le passage joué avec la barre de découpe.
                </p>
                <AudioField
                  label="Morceau joué à l'ouverture"
                  value={{ url: draft[a.url] ?? "", title: draft[a.title] ?? "", start: draft[a.start] ?? 0, end: draft[a.end] ?? 0 }}
                  onChange={(v) => update({ ...draft, [a.url]: v.url, [a.title]: v.title, [a.start]: v.start, [a.end]: v.end })}
                />
              </div>
              <Link href="/admin/sons" target="_blank" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8f6f33] underline underline-offset-2">
                <Music size={15} /> Gérer la banque de sons (ajouter, découper, classer)
              </Link>
            </div>
          )}
        </div>

        {/* Pied */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:pb-3 border-t border-gray-100 bg-white shrink-0 space-y-2">
          {message && <p className={`text-xs sm:text-sm ${message.ok ? "text-emerald-700" : "text-red-600"}`}>{message.text}</p>}
          <div className="flex items-center gap-2 sm:gap-3">
            <button type="button" onClick={close} className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700">
              <ArrowLeft size={16} /> <span className="hidden sm:inline">Retour</span>
            </button>
            <button type="button" onClick={() => setPreview(true)} className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700">
              <Eye size={16} /> <span className="hidden sm:inline">Aperçu plein écran</span>
            </button>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={!!busy}
                onClick={() => run("save")}
                className="inline-flex items-center gap-1.5 px-3 sm:px-5 py-3 rounded-xl border border-[#b8924a]/50 bg-[#fbf7f0] text-sm font-semibold text-[#6f5527] disabled:opacity-60 whitespace-nowrap"
              >
                {busy === "save" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Enregistrer
              </button>
              <button
                type="button"
                disabled={!!busy}
                onClick={() => run("publish")}
                className="inline-flex items-center gap-1.5 px-3 sm:px-5 py-3 rounded-xl bg-[#2b2118] text-[#f5eee1] text-sm font-semibold disabled:opacity-60 whitespace-nowrap"
              >
                {busy === "publish" ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />} Publier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Aperçu plein écran : le modèle entier, puis « Enregistrer la modification » ou « Retour » */}
      {preview && (
        <InvitationCtaContext.Provider value={{ force: true, variant: "save" }}>
          <div className="fixed inset-0 z-[100] h-dvh bg-black overflow-y-auto overscroll-contain">
            <button
              type="button"
              onClick={() => setPreview(false)}
              aria-label="Retour au studio"
              className="fixed z-[120] left-3 top-[max(0.75rem,env(safe-area-inset-top))] w-10 h-10 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/25 flex items-center justify-center shadow-lg"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-full relative min-h-dvh">
              <Invitation
                content={isStatic ? withoutMusic(draft) : draft}
                preview
                onBackToEdit={() => setPreview(false)}
                onFinalize={async () => {
                  setPreview(false);
                  await run("save");
                }}
              />
            </div>
          </div>
        </InvitationCtaContext.Provider>
      )}
    </div>,
    document.body,
  );
}
