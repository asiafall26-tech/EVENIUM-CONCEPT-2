"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowLeft, Eye, Globe, Loader2, Music, Palette, PenLine, Save, X } from "lucide-react";
import { AudioField } from "@/components/invitations/velours/VeloursStudio";
import { InvitationCtaContext } from "@/components/invitations/InvitationCtaContext";
import StyleEditor from "./StyleEditor";
import type { ModelContent, SiteModel } from "./registry";

type Tab = "contenu" | "style" | "musique";

const TABS: { id: Tab; label: string; icon: typeof PenLine }[] = [
  { id: "contenu", label: "Contenu", icon: PenLine },
  { id: "style", label: "Style & polices", icon: Palette },
  { id: "musique", label: "Musique", icon: Music },
];

interface Props {
  model: SiteModel;
  initial: ModelContent;
  onClose: () => void;
  onSave: (content: ModelContent) => Promise<void>;
  onPublish: (content: ModelContent) => Promise<void>;
}

/** Studio admin d'un modèle du site : contenu, style, musique, aperçu, enregistrement et publication. */
export default function AdminModelEditor({ model, initial, onClose, onSave, onPublish }: Props) {
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
      await (kind === "save" ? onSave(draft) : onPublish(draft));
      setDirty(false);
      setMessage({ ok: true, text: kind === "save" ? "Modification enregistrée (pas encore publiée)." : "Modèle publié sur le site." });
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-7xl h-dvh sm:h-[94vh] sm:max-h-[960px] bg-[#faf7f5] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-gray-100 bg-white shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#8f6f33]">Studio des modèles</p>
            <h3 className="font-serif text-lg sm:text-2xl text-gray-900 truncate">{model.name}</h3>
          </div>
          <button type="button" onClick={close} aria-label="Fermer" className="shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        {/* Onglets */}
        <div className="px-3 sm:px-6 pt-2.5 bg-white border-b border-gray-100 shrink-0">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
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
            <div className="h-full p-2 sm:p-4">
              <Studio value={draft} onChange={update} onViewFullScreen={() => setPreview(true)} />
            </div>
          )}
          {tab === "style" && <StyleEditor value={draft.style} onChange={(style) => update({ ...draft, style })} />}
          {tab === "musique" && (
            <div className="h-full overflow-y-auto overscroll-contain p-3 sm:p-5 space-y-4">
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
                content={draft}
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
