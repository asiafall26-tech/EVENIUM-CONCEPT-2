"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowLeft, Eye, Globe, Loader2, Mail, Music, Palette, PenLine, Save, Sparkles, X } from "lucide-react";
import { AudioField } from "@/components/invitations/velours/VeloursStudio";
import { InvitationCtaContext } from "@/components/invitations/InvitationCtaContext";
import StyleEditor from "./StyleEditor";
import { withoutMusic } from "@/lib/staticCard";
import type { ModelContent, SiteModel } from "./registry";

type Tab = "contenu" | "message" | "style" | "musique";

const TABS: { id: Tab; label: string; icon: typeof PenLine }[] = [
  { id: "contenu", label: "Contenu", icon: PenLine },
  { id: "message", label: "Message chic", icon: Mail },
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const defaultAdminMessage = (() => {
    const name = (modelName || model.name || "").toLowerCase();
    const id = (model.id || "").toLowerCase();
    if (name.includes("vœu") || name.includes("voeu") || name.includes("birthday queen") || id.includes("voeu") || id.includes("anniversaire")) {
      return "✨ Une pensée toute particulière pour toi en ce jour précieux... Découvre tes vœux d'exception personnalisés en cliquant sur le lien :";
    }
    if (name.includes("mot doux") || name.includes("mots doux") || name.includes("lettre") || id.includes("mot_doux")) {
      return "💌 Mon cœur, j'ai préparé quelque chose de doux et secret rien que pour toi... Ouvre ta lettre scellée en cliquant sur le lien :";
    }
    if (name.includes("couple") || name.includes("rendez-vous") || name.includes("amour") || id.includes("couple")) {
      return "🥂 Une soirée d'exception, rien que nous deux... Découvre notre invitation secrète en cliquant sur le lien :";
    }
    return `✨ Nous avons l'immense honneur de vous convier à notre événement d'exception "${modelName || model.name}". Découvrez votre invitation officielle interactive et confirmez votre présence ici :`;
  })();

  const currentMessage = draft.accompanimentMessage !== undefined ? draft.accompanimentMessage : defaultAdminMessage;

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

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[60] bg-[#faf7f5] overflow-hidden">
      {/* Plein écran : toute la place pour éditer */}
      <div className="w-full h-full flex flex-col">
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
                className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-semibold border-b-2 ${tab === t.id ? "border-[#b8924a] text-gray-900" : "border-transparent text-gray-500"
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
              <div className="flex-1 min-h-0 flex flex-col">
                <Studio value={draft} onChange={update} onViewFullScreen={() => setPreview(true)} isStatic={isStatic} />
              </div>
            </div>
          )}
          {tab === "message" && (
            <div className="h-full overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
              <div className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 space-y-5 shadow-xs">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-2xl bg-[#fbf7f0] border border-[#b8924a]/30 flex items-center justify-center text-[#b8924a] shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl text-gray-900 font-bold">
                      Message d&apos;accompagnement chic
                    </h3>
                    <p className="text-xs text-gray-500">
                      Ce texte élégant précédera le lien officiel de l&apos;invitation lors des partages par WhatsApp ou SMS.
                    </p>
                  </div>
                </div>

                {/* Suggestions de modèles rapides */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                    Modèles de messages rapides :
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => update({ ...draft, accompanimentMessage: `✨ Nous avons l'immense honneur de vous convier à notre événement d'exception "${modelName}". Découvrez votre invitation officielle interactive et confirmez votre présence ici :` })}
                      className="p-3 rounded-2xl border border-gray-200 hover:border-[#b8924a] bg-gray-50 hover:bg-[#fbf7f0] text-left text-xs transition-colors cursor-pointer group"
                    >
                      <span className="font-bold text-gray-900 block mb-1 group-hover:text-[#8f6f33]">👑 Prestige &amp; Cérémonie</span>
                      <span className="text-gray-500 line-clamp-2 text-[11px] leading-relaxed">Nous avons l&apos;immense honneur de vous convier à notre événement d&apos;exception...</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => update({ ...draft, accompanimentMessage: "✨ Une pensée toute particulière pour toi en ce jour précieux... Découvre tes vœux d'exception personnalisés en cliquant sur le lien :" })}
                      className="p-3 rounded-2xl border border-gray-200 hover:border-[#b8924a] bg-gray-50 hover:bg-[#fbf7f0] text-left text-xs transition-colors cursor-pointer group"
                    >
                      <span className="font-bold text-gray-900 block mb-1 group-hover:text-[#8f6f33]">🌟 Vœux d&apos;Exception</span>
                      <span className="text-gray-500 line-clamp-2 text-[11px] leading-relaxed">Une pensée toute particulière pour toi en ce jour précieux... Découvre tes vœux...</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => update({ ...draft, accompanimentMessage: "💌 Mon cœur, j'ai préparé quelque chose de doux et secret rien que pour toi... Ouvre ta lettre scellée en cliquant sur le lien :" })}
                      className="p-3 rounded-2xl border border-gray-200 hover:border-[#b8924a] bg-gray-50 hover:bg-[#fbf7f0] text-left text-xs transition-colors cursor-pointer group"
                    >
                      <span className="font-bold text-gray-900 block mb-1 group-hover:text-[#8f6f33]">💌 Les Mots Doux</span>
                      <span className="text-gray-500 line-clamp-2 text-[11px] leading-relaxed">Mon cœur, j&apos;ai préparé quelque chose de doux et secret rien que pour toi...</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => update({ ...draft, accompanimentMessage: "🥂 Une soirée d'exception, rien que nous deux... Découvre notre invitation secrète en cliquant sur le lien :" })}
                      className="p-3 rounded-2xl border border-gray-200 hover:border-[#b8924a] bg-gray-50 hover:bg-[#fbf7f0] text-left text-xs transition-colors cursor-pointer group"
                    >
                      <span className="font-bold text-gray-900 block mb-1 group-hover:text-[#8f6f33]">🥂 Soirée Couple Intime</span>
                      <span className="text-gray-500 line-clamp-2 text-[11px] leading-relaxed">Une soirée d&apos;exception, rien que nous deux... Découvre notre invitation secrète...</span>
                    </button>
                  </div>
                </div>

                {/* Champ d'édition */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800">
                      Texte personnalisé du message d&apos;accompagnement :
                    </label>
                    <span className="text-[10px] text-gray-400">
                      {String(currentMessage).length} caractères
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={currentMessage}
                    onChange={(e) => update({ ...draft, accompanimentMessage: e.target.value })}
                    placeholder="Écrivez le message qui introduira le lien de l'invitation..."
                    className="w-full bg-gray-50/70 border border-gray-200 rounded-2xl p-3.5 text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none transition-all leading-relaxed"
                  />
                </div>

                {/* Simulation bulle WhatsApp */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                    Aperçu en direct (tel qu&apos;affiché dans WhatsApp) :
                  </span>
                  <div className="bg-[#e5ddd5] p-3 sm:p-4 rounded-2xl border border-gray-300">
                    <div className="max-w-md ml-auto bg-[#dcf8c6] p-3 rounded-2xl rounded-tr-xs shadow-xs text-xs text-gray-900 space-y-2 border border-[#b2d89b]">
                      <p className="whitespace-pre-wrap leading-relaxed font-sans">
                        {currentMessage}
                      </p>
                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-300/60 flex items-center gap-2">
                        <span className="text-lg">✨</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[11px] text-gray-900 truncate">
                            {modelName || model.name}
                          </p>
                          <p className="text-[10px] text-[#0066cc] truncate font-mono">
                            https://evenium.com/invite/demo-invitation
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[9px] text-gray-500 pt-0.5">
                        <span>12:45</span>
                        <span className="text-[#34b7f1] font-bold">✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>

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

      {/* Aperçu plein écran : le modèle entier propre (sans bannière intrusive), dans un châssis smartphone sur grand écran avec barre d'actions supérieure */}
      {preview && (
        <div className="fixed inset-0 w-screen h-screen z-[100] bg-[#0c0a09] flex flex-col overflow-hidden">
          {/* Barre supérieure flottante haut de gamme */}
          <div className="shrink-0 h-16 px-4 sm:px-6 bg-[#15110e]/95 border-b border-white/10 backdrop-blur-md flex items-center justify-between gap-3 z-30">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors"
            >
              <ArrowLeft size={16} /> <span>Retour au studio</span>
            </button>

            <div className="text-center min-w-0 max-w-md hidden sm:block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-bold block">Aperçu du modèle</span>
              <p className="font-serif text-sm text-white/90 truncate font-medium">{modelName}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!!busy}
                onClick={async () => {
                  await run("save");
                  setPreview(false);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#b8924a]/50 bg-[#fbf7f0] text-xs font-semibold text-[#6f5527] hover:bg-white disabled:opacity-60 transition-colors"
              >
                {busy === "save" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Enregistrer</span>
              </button>
              <button
                type="button"
                disabled={!!busy}
                onClick={async () => {
                  await run("publish");
                  setPreview(false);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#b8924a] via-[#e2c77d] to-[#b8924a] text-black text-xs font-bold hover:brightness-105 disabled:opacity-60 transition-all shadow-sm"
              >
                {busy === "publish" ? <Loader2 size={14} className="animate-spin" /> : <Globe size={16} />}
                <span>Publier</span>
              </button>
            </div>
          </div>

          {/* Corps de l'aperçu : centré dans un châssis smartphone sur grand écran, pleine page sur mobile */}
          <div className="flex-1 min-h-0 w-full flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden relative">
            <div aria-hidden className="hidden sm:block absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-[#b8924a]/10 blur-[140px] pointer-events-none" />
            <div aria-hidden className="hidden sm:block absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-[#6b1428]/20 blur-[140px] pointer-events-none" />

            <div className="relative w-full h-full sm:w-[430px] sm:h-[min(90vh,880px)] sm:max-h-[880px] bg-white sm:rounded-[38px] sm:shadow-[0_25px_90px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.1),0_0_0_6px_#1c1714] overflow-hidden flex flex-col">
              <div className="w-full h-full overflow-y-auto overscroll-contain">
                <Invitation
                  content={isStatic ? withoutMusic(draft) : draft}
                  preview
                  hideCta={true}
                  onBackToEdit={() => setPreview(false)}
                  onFinalize={async () => {
                    setPreview(false);
                    await run("save");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
