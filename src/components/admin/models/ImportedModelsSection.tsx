"use client";

import { useCallback, useEffect, useState } from "react";
import { FileArchive, Loader2, UploadCloud } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { customModelUrl, fetchCustomModels, saveCustomModel, type CustomModelRow } from "@/lib/customModels";
import type { InvitationKind } from "@/lib/modelDefaults";
import ImportModelModal from "./ImportModelModal";
import CustomModelStudio from "./CustomModelStudio";
import ClassifyModal from "./ClassifyModal";
import CoverModal from "./CoverModal";
import ModelCard from "./ModelCard";
import RenameModelModal from "./RenameModelModal";

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
  const [renamingSlug, setRenamingSlug] = useState<string | null>(null);
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
  const renaming = models.find((m) => m.slug === renamingSlug) ?? null;

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
          {shown.map((m) => (
            <ModelCard
              key={m.slug}
              name={m.name}
              cover={m.cover_url}
              status={status(m)}
              presence={m.status === "published" ? "online" : m.status === "hidden" ? "hidden" : "draft"}
              kind={m.invitation_type}
              events={m.event_types}
              info={`${m.fields.length} élément(s) modifiable(s) par vous et par le client`}
              busy={busy === m.slug}
              viewUrl={customModelUrl(m)}
              onOpen={() => {
                onNotice(null);
                setEditingSlug(m.slug);
              }}
              onRename={() => setRenamingSlug(m.slug)}
              onClassify={() => setClassifyingSlug(m.slug)}
              onCover={() => setCoverSlug(m.slug)}
              onPublish={() => act(m, () => publish(m), `« ${m.name} » est publié sur le site.`)}
              onShow={() => act(m, () => saveCustomModel(supabase, m.slug, { status: "published" }), `« ${m.name} » est de retour sur le site.`)}
              onHide={() => {
                if (!confirm(`Retirer « ${m.name} » du site ? Les invitations déjà achetées restent intactes.`)) return;
                act(m, () => saveCustomModel(supabase, m.slug, { status: "hidden" }), `« ${m.name} » est retiré du site.`);
              }}
              onDelete={() => remove(m)}
            />
          ))}
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

      {renaming && (
        <RenameModelModal
          modelName={renaming.name}
          modelImage={renaming.cover_url}
          onClose={() => setRenamingSlug(null)}
          onSave={async (newName) => {
            await saveCustomModel(supabase, renaming.slug, { name: newName });
            setRenamingSlug(null);
            onNotice({ ok: true, text: `Le modèle s'appelle désormais « ${newName} » sur l'ensemble du site.` });
            await load();
          }}
        />
      )}

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
