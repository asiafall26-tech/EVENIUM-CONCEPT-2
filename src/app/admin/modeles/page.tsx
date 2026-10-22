"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Brush, CheckCircle2, ExternalLink, EyeOff, Globe, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  fetchModelDefaults,
  publishModel,
  resetModelDefault,
  saveModelDraft,
  setModelHidden,
  type ModelDefaultRow,
} from "@/lib/modelDefaults";
import { SITE_MODELS, type ModelContent, type SiteModel } from "@/components/admin/models/registry";
import AdminModelEditor from "@/components/admin/models/AdminModelEditor";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

function status(row?: ModelDefaultRow) {
  if (row?.is_hidden) return { label: "Retiré du site", cls: "bg-gray-900/85 text-white" };
  if (row?.draft_content && !same(row.draft_content, row.content)) return { label: "Modifications non publiées", cls: "bg-amber-100 text-amber-900" };
  if (row?.content) return { label: "Publié · personnalisé", cls: "bg-[#b8924a] text-white" };
  return { label: "En ligne · version d'origine", cls: "bg-white/90 text-gray-700" };
}

/** Studio admin : ajuster, enregistrer, publier ou retirer du site les modèles d'invitation. */
export default function AdminModelsStudioPage() {
  const [supabase] = useState(() => createClient());
  const [rows, setRows] = useState<Record<string, ModelDefaultRow>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRows(await fetchModelDefaults(supabase));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const userId = async () => (await supabase.auth.getUser()).data.user?.id;
  const workingContent = (m: SiteModel) => m.fill(rows[m.id]?.draft_content ?? rows[m.id]?.content ?? m.original);

  const act = async (model: SiteModel, action: () => Promise<void>, done: string) => {
    setBusyId(model.id);
    setNotice(null);
    try {
      await action();
      setNotice({ ok: true, text: done });
      await load();
    } catch (e) {
      setNotice({ ok: false, text: e instanceof Error ? e.message : "Une erreur est survenue." });
    } finally {
      setBusyId(null);
    }
  };

  const editing = SITE_MODELS.find((m) => m.id === editingId) ?? null;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-5 sm:space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#8f6f33] flex items-center gap-1.5">
          <Brush size={13} /> Studio des modèles
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-gray-900 leading-tight">Modèles d&apos;invitation du site</h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl">
          Ajustez textes, photos, polices, couleurs et musique dans le studio, enregistrez, puis publiez. La version publiée s&apos;affiche
          dans la démo du site et sert de point de départ aux clients. Un modèle retiré disparaît des galeries et de la création d&apos;événement.
        </p>
      </div>

      {notice && (
        <div
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
            notice.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <CheckCircle2 size={16} className="shrink-0" /> {notice.text}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center text-gray-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {SITE_MODELS.map((model) => {
            const row = rows[model.id];
            const st = status(row);
            const busy = busyId === model.id;
            return (
              <article key={model.id} className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ${row?.is_hidden ? "opacity-80" : ""}`}>
                <div className="relative h-48 bg-gray-900">
                  <Image src={model.image} alt={model.name} fill className={`object-cover ${row?.is_hidden ? "grayscale" : ""}`} sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                  <h2 className="absolute bottom-3 left-4 right-4 font-serif text-2xl text-white">{model.name}</h2>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-2.5">
                  <p className="text-xs text-gray-500">
                    {row?.published_at ? `Publié le ${formatDate(row.published_at)}` : row ? `Modifié le ${formatDate(row.updated_at)}` : "Contenu d'origine du modèle"}
                  </p>
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
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => act(model, async () => publishModel(supabase, model.id, workingContent(model), await userId()), `« ${model.name} » est publié sur le site.`)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#b8924a]/50 bg-[#fbf7f0] px-3 py-2.5 text-xs font-semibold text-[#6f5527] disabled:opacity-50"
                    >
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />} Publier
                    </button>
                    {row?.is_hidden ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => act(model, async () => setModelHidden(supabase, model.id, false, await userId()), `« ${model.name} » est de retour sur le site.`)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700 disabled:opacity-50"
                      >
                        <Globe size={14} /> Remettre en ligne
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          if (!confirm(`Retirer « ${model.name} » du site ? Il n'apparaîtra plus dans les galeries ni à la création d'événement. Les invitations déjà achetées restent intactes.`)) return;
                          await act(model, async () => setModelHidden(supabase, model.id, true, await userId()), `« ${model.name} » est retiré du site.`);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-700 disabled:opacity-50"
                      >
                        <EyeOff size={14} /> Retirer du site
                      </button>
                    )}
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
                      disabled={!row || busy}
                      onClick={async () => {
                        if (!confirm(`Rétablir la version d'origine de « ${model.name} » ? Vos ajustements (publiés ou non) seront effacés.`)) return;
                        await act(model, () => resetModelDefault(supabase, model.id), `« ${model.name} » a retrouvé sa version d'origine.`);
                      }}
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
        <AdminModelEditor
          model={editing}
          initial={workingContent(editing)}
          onClose={() => setEditingId(null)}
          onSave={async (content: ModelContent) => {
            await saveModelDraft(supabase, editing.id, content, await userId());
            await load();
          }}
          onPublish={async (content: ModelContent) => {
            await publishModel(supabase, editing.id, content, await userId());
            await load();
          }}
        />
      )}
    </div>
  );
}
