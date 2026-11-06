"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowLeft, Check, Eye, Globe, Image as ImageIcon, Loader2, Music, Palette, PenLine, Save, X } from "lucide-react";
import CoverModal from "./CoverModal";
import CustomSectionsEditor, { CustomMusicFields } from "@/components/invitations/custom/CustomSectionsEditor";
import CustomInvitationFrame from "@/components/invitations/custom/CustomInvitationFrame";
import StyleEditor from "./StyleEditor";
import { STYLE_KEY, customValues, parseStyle, type CustomField, type CustomModelRow, type CustomValues } from "@/lib/customModels";

type Tab = "contenu" | "style" | "musique";

interface Props {
  model: CustomModelRow;
  onClose: () => void;
  /** Enregistrer (sans publier) */
  onSave: (patch: Partial<CustomModelRow>) => Promise<void>;
  /** Publier sur le site */
  onPublish: (patch: Partial<CustomModelRow>) => Promise<void>;
}

/** Studio admin d'un modèle importé : le même studio que les modèles Evenium (contenu, style & polices, musique). */
export default function CustomModelStudio({ model, onClose, onSave, onPublish }: Props) {
  const [name, setName] = useState(model.name);
  const [editingName, setEditingName] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const confirmName = () => {
    if (nameInput.trim()) setName(nameInput.trim());
    setEditingName(false);
    touch();
  };
  const [nameInput, setNameInput] = useState(model.name);
  const [cover, setCover] = useState(model.cover_url ?? "");
  const [fields, setFields] = useState<CustomField[]>(model.fields);
  const [values, setValues] = useState<CustomValues>(() => customValues(model.fields, model.content, model.draft_content));
  const [tab, setTab] = useState<Tab>("contenu");
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isStatic = model.invitation_type === "carte";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const touch = () => {
    setDirty(true);
    setMessage(null);
  };
  const update = (v: CustomValues) => {
    setValues(v);
    touch();
  };

  const run = async (kind: "save" | "publish") => {
    setBusy(kind);
    setMessage(null);
    const patch: Partial<CustomModelRow> = { name: name.trim() || model.name, cover_url: cover || null, fields, draft_content: values };
    try {
      await (kind === "save" ? onSave(patch) : onPublish({ ...patch, content: values }));
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

  const tabs: { id: Tab; label: string; icon: typeof PenLine }[] = [
    { id: "contenu", label: "Contenu", icon: PenLine },
    { id: "style", label: "Style & polices", icon: Palette },
    ...(isStatic ? [] : [{ id: "musique" as const, label: "Musique", icon: Music }]),
  ];
  const liveModel = { ...model, name };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[60] bg-[#faf7f5] overflow-hidden">
      <div className="w-full h-full flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-gray-100 bg-white shrink-0">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#8f6f33]">Studio des modèles · nom public de l&apos;invitation</p>
            {editingName ? (
              <div className="flex items-center gap-2 mt-0.5 max-w-xl">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmName()}
                  className="min-w-0 flex-1 px-3 py-2 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#b8924a]/30"
                />
                <button
                  type="button"
                  onClick={confirmName}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#2b2118] text-[#f5eee1] text-xs font-semibold"
                >
                  <Check size={14} /> OK
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setNameInput(name);
                  setEditingName(true);
                }}
                className="group flex items-center gap-2 max-w-full text-left"
                title="Modifier le nom"
              >
                <span className="font-serif text-lg sm:text-2xl text-gray-900 truncate">{name}</span>
                <PenLine size={15} className="shrink-0 text-gray-400 group-hover:text-[#8f6f33]" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCoverOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#b8924a]"
          >
            <ImageIcon size={14} /> <span className="hidden sm:inline">Couverture</span>
          </button>
          <button type="button" onClick={close} aria-label="Fermer" className="shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        {/* Onglets */}
        <div className="px-3 sm:px-6 pt-2.5 bg-white border-b border-gray-100 shrink-0">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((t) => (
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
            <div className="h-full w-full max-w-[1680px] mx-auto p-2 sm:p-4 lg:p-6 flex flex-col">
              <div className="flex-1 min-h-0 flex flex-col">
                <CustomSectionsEditor
                  model={liveModel}
                  fields={fields}
                  values={values}
                  onChange={update}
                  admin
                  onFieldsChange={(f) => {
                    setFields(f);
                    touch();
                  }}
                  isStatic={isStatic}
                  musicMenu={false}
                  onViewFullScreen={() => setPreview(true)}
                />
              </div>
            </div>
          )}

          {tab === "style" && (
            <StyleEditor value={parseStyle(values)} onChange={(style) => update({ ...values, [STYLE_KEY]: JSON.stringify(style) })} />
          )}

          {tab === "musique" && !isStatic && (
            <div className="h-full overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8 space-y-5 max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 space-y-3">
                <h3 className="font-serif text-xl text-gray-900">Musique de l&apos;invitation</h3>
                <p className="text-xs text-gray-500">
                  « Choisir une musique » ouvre la banque de sons Evenium. Écoutez, choisissez, puis ajustez le passage joué avec la barre de découpe.
                </p>
                <CustomMusicFields model={model} fields={fields.filter((f) => f.type === "audio")} values={values} onChange={update} />
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

      {coverOpen && (
        <CoverModal
          modelName={name}
          current={cover}
          onClose={() => setCoverOpen(false)}
          onSave={async (url) => {
            setCover(url);
            touch();
            setCoverOpen(false);
          }}
        />
      )}

      {/* Aperçu plein écran : le modèle entier propre (sans bannière CTA intrusive), dans son châssis smartphone sur grand écran */}
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
              <p className="font-serif text-sm text-white/90 truncate font-medium">{name}</p>
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
                {busy === "publish" ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                <span>Publier</span>
              </button>
            </div>
          </div>

          {/* Corps de l'aperçu : centré dans un châssis smartphone sur grand écran, pleine page sur mobile */}
          <div className="flex-1 min-h-0 w-full flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden relative">
            {/* Halo lumineux d'ambiance luxueuse */}
            <div aria-hidden className="hidden sm:block absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-[#b8924a]/10 blur-[140px] pointer-events-none" />
            <div aria-hidden className="hidden sm:block absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-[#6b1428]/20 blur-[140px] pointer-events-none" />

            <div className="relative w-full h-full sm:w-[430px] sm:h-[min(90vh,880px)] sm:max-h-[880px] bg-white sm:rounded-[38px] sm:shadow-[0_25px_90px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.1),0_0_0_6px_#1c1714] overflow-hidden flex flex-col">
              <CustomInvitationFrame
                model={liveModel}
                values={values}
                hideCta
                className="w-full h-full border-0 block bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
