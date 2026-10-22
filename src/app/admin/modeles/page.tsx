"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import Image from "next/image";
import { Brush, CheckCircle2, ExternalLink, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { fetchModelDefaults, resetModelDefault, saveModelDefault, type ModelDefaultRow } from "@/lib/modelDefaults";

import VeloursEditorModal from "@/components/invitations/velours/VeloursEditorModal";
import { VELOURS_MODEL_ID, DEFAULT_VELOURS, withDefaults as veloursDefaults } from "@/components/invitations/velours/content";
import SceauEditorModal from "@/components/invitations/sceau/SceauEditorModal";
import { SCEAU_MODEL_ID, DEFAULT_SCEAU, withDefaults as sceauDefaults } from "@/components/invitations/sceau/content";
import IvoireEditorModal from "@/components/invitations/ivoire/IvoireEditorModal";
import { IVOIRE_MODEL_ID, DEFAULT_IVOIRE, withDefaults as ivoireDefaults } from "@/components/invitations/ivoire/content";
import RoseOrEditorModal from "@/components/invitations/rose-or/RoseOrEditorModal";
import { ROSE_OR_MODEL_ID, DEFAULT_ROSE_OR, withDefaults as roseOrDefaults } from "@/components/invitations/rose-or/content";
import AnniversaireEditorModal from "@/components/invitations/anniversaire/AnniversaireEditorModal";
import { ANNIVERSAIRE_MODEL_ID, DEFAULT_ANNIVERSAIRE, withDefaults as anniversaireDefaults } from "@/components/invitations/anniversaire/content";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface EditorProps {
  initial: any;
  onClose: () => void;
  onSave: (content: any) => void | Promise<void>;
  saveLabel?: string;
  defaultContent?: any;
}

interface SiteModel {
  id: string;
  name: string;
  image: string;
  liveUrl: string;
  original: object;
  fill: (partial: any) => object;
  Editor: ComponentType<EditorProps>;
}

const SITE_MODELS: SiteModel[] = [
  { id: VELOURS_MODEL_ID, name: "Velours Bordeaux", image: "/invit-velours-cover.jpg", liveUrl: "/invitation-mariage", original: DEFAULT_VELOURS, fill: veloursDefaults, Editor: VeloursEditorModal },
  { id: SCEAU_MODEL_ID, name: "Sceau d'Or Impérial", image: "/invit-sceau-dor-cover.jpg", liveUrl: "/invitation-sceau-dor", original: DEFAULT_SCEAU, fill: sceauDefaults, Editor: SceauEditorModal },
  { id: IVOIRE_MODEL_ID, name: "Ivoire Couture", image: "/invit-ivoire-cover.jpg", liveUrl: "/invitation-ivoire", original: DEFAULT_IVOIRE, fill: ivoireDefaults, Editor: IvoireEditorModal },
  { id: ROSE_OR_MODEL_ID, name: "Rose Poudrée & Or", image: "/invit-rose-or-cover.jpg", liveUrl: "/invitation-rose-or", original: DEFAULT_ROSE_OR, fill: roseOrDefaults, Editor: RoseOrEditorModal },
  { id: ANNIVERSAIRE_MODEL_ID, name: "Anniversaire Bordeaux & Or", image: "/invit-anniversaire-cover.jpg", liveUrl: "/invitation-anniversaire", original: DEFAULT_ANNIVERSAIRE, fill: anniversaireDefaults, Editor: AnniversaireEditorModal },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Studio admin : modifier les modèles d'invitation proposés sur le site (textes, photos, musique…). */
export default function AdminModelsStudioPage() {
  const [supabase] = useState(() => createClient());
  const [published, setPublished] = useState<Record<string, ModelDefaultRow>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setPublished(await fetchModelDefaults(supabase));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const editing = SITE_MODELS.find((m) => m.id === editingId) ?? null;

  const publish = async (model: SiteModel, content: object) => {
    const { data } = await supabase.auth.getUser();
    await saveModelDefault(supabase, model.id, content, data.user?.id);
    setEditingId(null);
    setNotice(`« ${model.name} » est publié sur le site.`);
    await load();
  };

  const restore = async (model: SiteModel) => {
    if (!confirm(`Rétablir la version d'origine de « ${model.name} » sur le site ?`)) return;
    setBusyId(model.id);
    try {
      await resetModelDefault(supabase, model.id);
      setNotice(`« ${model.name} » a retrouvé sa version d'origine.`);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Impossible de rétablir le modèle.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-5 sm:space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#8f6f33] flex items-center gap-1.5">
          <Brush size={13} /> Studio des modèles
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-gray-900 leading-tight">Modèles d&apos;invitation du site</h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl">
          Ouvrez un modèle dans le studio pour ajuster ses textes, photos, programme et musique. Une fois publié, il s&apos;affiche
          ainsi dans la démo du site et sert de point de départ aux clients qui le choisissent.
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 size={16} className="shrink-0" /> {notice}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center text-gray-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {SITE_MODELS.map((model) => {
            const row = published[model.id];
            return (
              <article key={model.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="relative h-52 bg-gray-900">
                  <Image src={model.image} alt={model.name} fill className="object-cover" sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      row ? "bg-[#b8924a] text-white" : "bg-white/90 text-gray-700"
                    }`}
                  >
                    {row ? "Personnalisé" : "Version d'origine"}
                  </span>
                  <h2 className="absolute bottom-3 left-4 right-4 font-serif text-2xl text-white">{model.name}</h2>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <p className="text-xs text-gray-500">{row ? `Publié le ${formatDate(row.updated_at)}` : "Contenu d'origine du modèle"}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setNotice(null);
                      setEditingId(model.id);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2b2118] text-[#f5eee1] px-4 py-3 text-sm font-semibold"
                  >
                    <Sparkles size={16} className="text-[#d9c08c]" /> Ouvrir dans le studio
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={model.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700"
                    >
                      <ExternalLink size={14} /> Voir sur le site
                    </a>
                    <button
                      type="button"
                      disabled={!row || busyId === model.id}
                      onClick={() => restore(model)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
                    >
                      <RotateCcw size={14} /> Version d&apos;origine
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editing && (
        <editing.Editor
          initial={editing.fill(published[editing.id]?.content ?? editing.original)}
          defaultContent={editing.original}
          saveLabel="Publier sur le site"
          onClose={() => setEditingId(null)}
          onSave={(content) => publish(editing, content)}
        />
      )}
    </div>
  );
}
