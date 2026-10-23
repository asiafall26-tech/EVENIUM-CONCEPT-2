"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Brush, CheckCircle2, ExternalLink, EyeOff, Globe, Loader2, Pencil, RotateCcw, Sparkles, Tags } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  classificationOf,
  fetchModelDefaults,
  modelNameOf,
  saveModelClassification,
  saveModelName,
  type InvitationKind,
  publishModel,
  resetModelDefault,
  saveModelDraft,
  setModelHidden,
  type ModelDefaultRow,
} from "@/lib/modelDefaults";
import { SITE_MODELS, type ModelContent, type SiteModel } from "@/components/admin/models/registry";
import AdminModelEditor from "@/components/admin/models/AdminModelEditor";
import { withoutMusic } from "@/lib/staticCard";
import ClassifyModal from "@/components/admin/models/ClassifyModal";
import RenameModelModal from "@/components/admin/models/RenameModelModal";
import { defaultClassification } from "@/data/mock/invitations";
import { EVENT_TYPES, EVENT_TYPE_ICONS } from "@/lib/eventTypes";

const KIND_GROUPS: { id: InvitationKind; title: string }[] = [
  { id: "animée", title: "Invitations animées" },
  { id: "carte", title: "Cartes" },
];

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
  const [classifyingId, setClassifyingId] = useState<string | null>(null);
  const [renamingModel, setRenamingModel] = useState<SiteModel | null>(null);
  const [kindFilter, setKindFilter] = useState<"Tous" | InvitationKind>("Tous");
  const [eventFilter, setEventFilter] = useState<string>("Tous");

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
  const classifying = SITE_MODELS.find((m) => m.id === classifyingId) ?? null;
  const classOf = (m: SiteModel) => classificationOf(rows[m.id], defaultClassification(m.id));
  const currentName = (m: SiteModel) => modelNameOf(rows[m.id], m.name);
  const groups = KIND_GROUPS.filter((g) => kindFilter === "Tous" || kindFilter === g.id)
    .map((g) => ({
      ...g,
      models: SITE_MODELS.filter((m) => {
        const c = classOf(m);
        return c.type === g.id && (eventFilter === "Tous" || c.events.includes(eventFilter));
      }),
    }))
    .filter((g) => g.models.length || kindFilter !== "Tous");
  const eventCount = (t: string) => SITE_MODELS.filter((m) => classOf(m).events.includes(t)).length;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-5 sm:space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#8f6f33] flex items-center gap-1.5">
          <Brush size={13} /> Studio des modèles
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-gray-900 leading-tight">Modèles d&apos;invitation du site</h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl">
          Ajustez noms, textes, photos, polices, couleurs et musique dans le studio, enregistrez, puis publiez. La version publiée s&apos;affiche
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

      {/* Classement : type d'invitation et type d'événement */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-3 sm:p-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {(["Tous", "animée", "carte"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKindFilter(k)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border ${kindFilter === k ? "bg-[#2b2118] text-[#f5eee1] border-[#2b2118]" : "border-gray-200 text-gray-600"}`}
            >
              {k === "Tous" ? "Tous les types" : k === "animée" ? "Animées" : "Cartes"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {["Tous", ...EVENT_TYPES].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setEventFilter(t)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${eventFilter === t ? "bg-[#b8924a] text-white border-[#b8924a]" : "border-gray-200 text-gray-600"}`}
            >
              {t === "Tous" ? "✨ Tous les événements" : <>{EVENT_TYPE_ICONS[t as keyof typeof EVENT_TYPE_ICONS]} {t}</>}
              {t !== "Tous" && <span className="opacity-70">· {eventCount(t)}</span>}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center text-gray-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
        {groups.length === 0 && <p className="text-sm text-gray-500 text-center py-10">Aucun modèle pour ce filtre.</p>}
        {groups.map((g) => (
        <section key={g.id} className="space-y-3">
          <h2 className="font-serif text-2xl text-gray-900">{g.title} <span className="text-sm text-gray-400">· {g.models.length}</span></h2>
          {g.models.length === 0 && <p className="text-sm text-gray-500">Aucun modèle de ce type pour ce filtre.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {g.models.map((model) => {
            const row = rows[model.id];
            const cls = classOf(model);
            const name = currentName(model);
            const st = status(row);
            const busy = busyId === model.id;
            return (
              <article key={model.id} className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ${row?.is_hidden ? "opacity-80" : ""}`}>
                <div className="relative h-48 bg-gray-900">
                  <Image src={model.image} alt={name} fill className={`object-cover ${row?.is_hidden ? "grayscale" : ""}`} sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-serif text-2xl text-white truncate drop-shadow-sm">{name}</h2>
                      {name !== model.name && (
                        <p className="text-[11px] text-white/75 italic truncate">Origine : {model.name}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setRenamingModel(model)}
                      title="Modifier le nom de cette invitation"
                      className="shrink-0 p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{cls.type === "carte" ? "Carte" : "Animée"}</span>
                    {cls.events.map((e) => (
                      <span key={e} className="text-[11px] px-2 py-0.5 rounded-full bg-[#fbf7f0] border border-[#b8924a]/25 text-[#6f5527]">
                        {EVENT_TYPE_ICONS[e as keyof typeof EVENT_TYPE_ICONS]} {e}
                      </span>
                    ))}
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRenamingModel(model)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900"
                      >
                        <Pencil size={12} /> Renommer
                      </button>
                      <button type="button" onClick={() => setClassifyingId(model.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#8f6f33]">
                        <Tags size={13} /> Classer
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {row?.published_at ? `Publié le ${formatDate(row.published_at)}` : row ? `Modifié le ${formatDate(row.updated_at)}` : "Contenu d'origine du modèle"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNotice(null);
                      setEditingId(model.id);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2b2118] text-[#f5eee1] px-4 py-3 text-sm font-semibold hover:bg-black transition-all"
                  >
                    <Sparkles size={16} className="text-[#d9c08c]" /> Ouvrir dans le studio
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => act(model, async () => publishModel(supabase, model.id, classOf(model).type === "carte" ? withoutMusic(workingContent(model)) : workingContent(model), await userId(), name), `« ${name} » est publié sur le site.`)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#b8924a]/50 bg-[#fbf7f0] px-3 py-2.5 text-xs font-semibold text-[#6f5527] disabled:opacity-50 hover:bg-[#f5ede0] transition-colors"
                    >
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />} Publier
                    </button>
                    {row?.is_hidden ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => act(model, async () => setModelHidden(supabase, model.id, false, await userId()), `« ${name} » est de retour sur le site.`)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                      >
                        <Globe size={14} /> Remettre en ligne
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          if (!confirm(`Retirer « ${name} » du site ? Il n'apparaîtra plus dans les galeries ni à la création d'événement. Les invitations déjà achetées restent intactes.`)) return;
                          await act(model, async () => setModelHidden(supabase, model.id, true, await userId()), `« ${name} » est retiré du site.`);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-700 disabled:opacity-50 hover:bg-red-50 transition-colors"
                      >
                        <EyeOff size={14} /> Retirer du site
                      </button>
                    )}
                    <a
                      href={model.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink size={14} /> Voir sur le site
                    </a>
                    <button
                      type="button"
                      disabled={!(row?.content || row?.draft_content || row?.name) || busy}
                      onClick={async () => {
                        if (!confirm(`Rétablir la version d'origine de « ${name} » ? Vos ajustements (nom, textes, photos) seront effacés.`)) return;
                        await act(model, () => resetModelDefault(supabase, model.id, true), `« ${model.name} » a retrouvé son contenu et nom d'origine.`);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw size={14} /> Version d&apos;origine
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        </section>
        ))}
        </div>
      )}

      {renamingModel && (
        <RenameModelModal
          modelName={currentName(renamingModel)}
          originalName={renamingModel.name}
          modelImage={renamingModel.image}
          onClose={() => setRenamingModel(null)}
          onSave={async (newName) => {
            await saveModelName(supabase, renamingModel.id, newName, await userId());
            setRenamingModel(null);
            setNotice({
              ok: true,
              text: `L'invitation s'appelle désormais « ${newName} » sur l'ensemble du site.`,
            });
            await load();
          }}
        />
      )}

      {classifying && (
        <ClassifyModal
          modelName={currentName(classifying)}
          initial={classOf(classifying)}
          onClose={() => setClassifyingId(null)}
          onSave={async (c) => {
            await saveModelClassification(supabase, classifying.id, c, await userId());
            setClassifyingId(null);
            setNotice({ ok: true, text: `« ${currentName(classifying)} » est classé : ${c.type === "carte" ? "carte" : "animée"} · ${c.events.join(", ")}.` });
            await load();
          }}
        />
      )}

      {editing && (
        <AdminModelEditor
          model={editing}
          modelName={currentName(editing)}
          isStatic={classOf(editing).type === "carte"}
          initial={workingContent(editing)}
          onClose={() => setEditingId(null)}
          onSave={async (content: ModelContent, newName?: string) => {
            await saveModelDraft(supabase, editing.id, content, await userId(), newName);
            await load();
          }}
          onPublish={async (content: ModelContent, newName?: string) => {
            await publishModel(supabase, editing.id, classOf(editing).type === "carte" ? withoutMusic(content) : content, await userId(), newName);
            await load();
          }}
        />
      )}
    </div>
  );
}
