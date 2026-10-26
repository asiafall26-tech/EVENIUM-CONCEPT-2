"use client";

import { useCallback, useEffect, useState } from "react";
import { Camera, ExternalLink, EyeOff, FileArchive, Globe, Loader2, Sparkles, Tags, Trash2, UploadCloud } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { EVENT_TYPE_ICONS } from "@/lib/eventTypes";
import { customModelUrl, fetchCustomModels, saveCustomModel, type CustomModelRow } from "@/lib/customModels";
import type { InvitationKind } from "@/lib/modelDefaults";
import ImportModelModal from "./ImportModelModal";
import CustomModelStudio from "./CustomModelStudio";
import ClassifyModal from "./ClassifyModal";
import CoverModal from "./CoverModal";

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

function status(m: CustomModelRow) {
  if (m.status === "hidden") return { label: "Retiré du site", cls: "bg-gray-900/85 text-white" };
  if (m.status === "draft") return { label: "En préparation", cls: "bg-amber-100 text-amber-900" };
  if (m.draft_content && !same(m.draft_content, m.content)) return { label: "Modifications non publiées", cls: "bg-amber-100 text-amber-900" };
  return { label: "Publié", cls: "bg-[#b8924a] text-white" };
}

interface Props {
  kindFilter: "Tous" | InvitationKind;
  eventFilter: string;
  onNotice: (n: { ok: boolean; text: string } | null) => void;
}

/** Modèles importés (ZIP / HTML) : import, studio, publication, retrait, classement, suppression. */
export default function ImportedModelsSection({ kindFilter, eventFilter, onNotice }: Props) {
  const [supabase] = useState(() => createClient());
  const [models, setModels] = useState<CustomModelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [classifyingSlug, setClassifyingSlug] = useState<string | null>(null);
  const [coverSlug, setCoverSlug] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setModels(await fetchCustomModels(supabase));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const act = async (m: CustomModelRow, action: () => Promise<void>, done: string) => {
    setBusy(m.slug);
    onNotice(null);
    try {
      await action();
      onNotice({ ok: true, text: done });
      await load();
    } catch (e) {
      onNotice({ ok: false, text: e instanceof Error ? e.message : "Une erreur est survenue." });
    } finally {
      setBusy(null);
    }
  };

  const publish = (m: CustomModelRow, patch: Partial<CustomModelRow> = {}) =>
    saveCustomModel(supabase, m.slug, {
      ...patch,
      content: patch.content ?? m.draft_content ?? m.content,
      status: "published",
      published_at: new Date().toISOString(),
    });

  const remove = async (m: CustomModelRow) => {
    if (!confirm(`Supprimer définitivement « ${m.name} » et ses fichiers ? Les invitations déjà achetées avec ce modèle ne s'afficheront plus.`)) return;
    await act(
      m,
      async () => {
        const res = await fetch(`/api/admin/custom-models?slug=${encodeURIComponent(m.slug)}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Suppression impossible.");
      },
      `« ${m.name} » est supprimé.`
    );
  };

  const shown = models.filter(
    (m) => (kindFilter === "Tous" || m.invitation_type === kindFilter) && (eventFilter === "Tous" || m.event_types.includes(eventFilter))
  );
  const editing = models.find((m) => m.slug === editingSlug) ?? null;
  const classifying = models.find((m) => m.slug === classifyingSlug) ?? null;

  return (
    <section className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-gray-900">
            Modèles importés <span className="text-sm text-gray-400">· {shown.length}</span>
          </h2>
          <p className="text-sm text-gray-500">Vos modèles en ZIP ou HTML, rendus modifiables. Ils restent en préparation jusqu&apos;à leur publication.</p>
        </div>
        <button
          type="button"
          onClick={() => setImporting(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2b2118] text-[#f5eee1] px-5 py-3 text-sm font-semibold"
        >
          <UploadCloud size={17} /> Importer un modèle (ZIP ou HTML)
        </button>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center text-gray-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white px-6 py-10 text-center">
          <FileArchive size={28} className="mx-auto text-gray-300" />
          <p className="text-sm text-gray-500 mt-2">{models.length ? "Aucun modèle importé pour ce filtre." : "Aucun modèle importé pour le moment."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {shown.map((m) => {
            const st = status(m);
            const isBusy = busy === m.slug;
            return (
              <article key={m.slug} className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ${m.status === "hidden" ? "opacity-80" : ""}`}>
                <div className="relative h-48 bg-gray-900">
                  {m.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.cover_url} alt={m.name} className={`absolute inset-0 w-full h-full object-cover ${m.status === "hidden" ? "grayscale" : ""}`} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#b8924a]/40">
                      <FileArchive size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                  <button
                    type="button"
                    onClick={() => setCoverSlug(m.slug)}
                    className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 hover:bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold"
                  >
                    <Camera size={13} /> Couverture
                  </button>
                  <h3 className="absolute bottom-3 left-4 right-4 font-serif text-2xl text-white">{m.name}</h3>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {m.invitation_type === "carte" ? "Carte" : "Animée"}
                    </span>
                    {m.event_types.map((e) => (
                      <span key={e} className="text-[11px] px-2 py-0.5 rounded-full bg-[#fbf7f0] border border-[#b8924a]/25 text-[#6f5527]">
                        {EVENT_TYPE_ICONS[e as keyof typeof EVENT_TYPE_ICONS]} {e}
                      </span>
                    ))}
                    <button type="button" onClick={() => setClassifyingSlug(m.slug)} className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#8f6f33]">
                      <Tags size={13} /> Classer
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {m.fields.length} élément(s) modifiable(s) · {m.fields.filter((f) => f.clientEditable).length} ouvert(s) au client
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onNotice(null);
                      setEditingSlug(m.slug);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2b2118] text-[#f5eee1] px-4 py-3 text-sm font-semibold"
                  >
                    <Sparkles size={16} className="text-[#d9c08c]" /> Ouvrir dans le studio
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => act(m, () => publish(m), `« ${m.name} » est publié sur le site.`)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#b8924a]/50 bg-[#fbf7f0] px-3 py-2.5 text-xs font-semibold text-[#6f5527] disabled:opacity-50"
                    >
                      {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />} Publier
                    </button>
                    {m.status === "published" ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          if (!confirm(`Retirer « ${m.name} » du site ? Les invitations déjà achetées restent intactes.`)) return;
                          act(m, () => saveCustomModel(supabase, m.slug, { status: "hidden" }), `« ${m.name} » est retiré du site.`);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-700 disabled:opacity-50"
                      >
                        <EyeOff size={14} /> Retirer du site
                      </button>
                    ) : (
                      <a
                        href={customModelUrl(m)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700"
                      >
                        <ExternalLink size={14} /> Voir le fichier
                      </a>
                    )}
                    {m.status === "published" && (
                      <a
                        href={customModelUrl(m)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700"
                      >
                        <ExternalLink size={14} /> Voir sur le site
                      </a>
                    )}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => remove(m)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-600 disabled:opacity-50 ${m.status === "published" ? "" : "col-span-2"}`}
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {importing && (
        <ImportModelModal
          onClose={() => setImporting(false)}
          onImported={async (slug) => {
            setImporting(false);
            await load();
            onNotice({ ok: true, text: "Modèle importé. Ajustez-le dans le studio, puis publiez-le." });
            setEditingSlug(slug);
          }}
        />
      )}

      {editing && (
        <CustomModelStudio
          model={editing}
          onClose={() => setEditingSlug(null)}
          onSave={async (patch) => {
            await saveCustomModel(supabase, editing.slug, patch);
            await load();
          }}
          onPublish={async (patch) => {
            await publish(editing, patch);
            await load();
          }}
        />
      )}

      {(() => {
        const m = models.find((x) => x.slug === coverSlug);
        if (!m) return null;
        return (
          <CoverModal
            modelName={m.name}
            current={m.cover_url ?? ""}
            onClose={() => setCoverSlug(null)}
            onSave={async (url) => {
              await saveCustomModel(supabase, m.slug, { cover_url: url || null });
              setCoverSlug(null);
              onNotice({ ok: true, text: `La photo de couverture de « ${m.name} » est à jour sur le site.` });
              await load();
            }}
          />
        );
      })()}

      {classifying && (
        <ClassifyModal
          modelName={classifying.name}
          initial={{ type: classifying.invitation_type, events: classifying.event_types }}
          onClose={() => setClassifyingSlug(null)}
          onSave={async (c) => {
            await saveCustomModel(supabase, classifying.slug, { invitation_type: c.type, event_types: c.events });
            setClassifyingSlug(null);
            onNotice({ ok: true, text: `« ${classifying.name} » est classé.` });
            await load();
          }}
        />
      )}
    </section>
  );
}
