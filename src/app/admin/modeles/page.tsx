"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Brush, CheckCircle2, Loader2, RotateCcw, Tag, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  classificationOf,
  fetchModelDefaults,
  invalidateModelDefaultsCache,
  modelCoverOf,
  modelNameOf,
  type InvitationKind,
  isModelDeleted,
  type ModelDefaultRow,
} from "@/lib/modelDefaults";
import {
  fetchCustomModels,
  invalidateCustomModelsCache,
  type CustomModelRow,
} from "@/lib/customModels";
import { broadcastChange, subscribeToSync } from "@/lib/syncService";
import {
  saveModelDraftAction,
  publishModelAction,
  saveModelNameAction,
  saveModelClassificationAction,
  saveModelCoverAction,
  setModelHiddenAction,
  setModelDeletedAction,
  resetModelDefaultAction,
} from "@/app/actions/adminModelActions";
import ModelCard from "@/components/admin/models/ModelCard";
import { SITE_MODELS, type ModelContent, type SiteModel } from "@/components/admin/models/registry";
import AdminModelEditor from "@/components/admin/models/AdminModelEditor";
import { withoutMusic } from "@/lib/staticCard";
import ClassifyModal from "@/components/admin/models/ClassifyModal";
import ImportedModelsSection from "@/components/admin/models/ImportedModelsSection";
import RenameModelModal from "@/components/admin/models/RenameModelModal";
import CoverModal from "@/components/admin/models/CoverModal";
import CategoriesManagerSection from "@/components/admin/models/CategoriesManagerSection";
import { defaultClassification } from "@/data/mock/invitations";
import { EVENT_TYPES, EVENT_TYPE_ICONS } from "@/lib/eventTypes";
import {
  fetchAllServiceCategories,
  type ServiceCategory,
  FALLBACK_CATEGORIES,
  getCategorySlugForModel,
} from "@/lib/serviceCategories";

const KIND_GROUPS: { id: InvitationKind; title: string; icon: string }[] = [
  { id: "animée", title: "Invitations animées", icon: "🎬" },
  { id: "carte", title: "Invitations statiques", icon: "📜" },
  { id: "voeu", title: "Vœux & Célébrations", icon: "🎁" },
  { id: "mot_doux", title: "Mots doux", icon: "💌" },
  { id: "couple", title: "Espace Couple", icon: "❤️" },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Contenu sans le nom ni la couverture (réglages de vitrine) */
const bodyOf = (c: unknown) => {
  if (!c || typeof c !== "object") return null;
  const { model_name: _n, model_cover: _c, model_deleted: _d, ...rest } = c as Record<string, unknown>;
  return Object.keys(rest).length ? rest : null;
};

function status(row?: ModelDefaultRow) {
  if (row?.is_hidden) return { label: "Retiré du site", cls: "bg-gray-900/85 text-white" };
  if (bodyOf(row?.draft_content) && !same(bodyOf(row?.draft_content), bodyOf(row?.content))) return { label: "Modifications non publiées", cls: "bg-amber-100 text-amber-900" };
  if (bodyOf(row?.content)) return { label: "Publié · personnalisé", cls: "bg-[#b8924a] text-white" };
  return { label: "En ligne · version d'origine", cls: "bg-white/90 text-gray-700" };
}

/** Studio admin fusionné : modèles d'invitation et gestion des catégories & tarifs associés. */
export default function AdminModelsStudioPage() {
  const [supabase] = useState(() => createClient());
  const [activeTab, setActiveTab] = useState<"modeles" | "categories">("modeles");
  const [rows, setRows] = useState<Record<string, ModelDefaultRow>>({});
  const [customModels, setCustomModels] = useState<CustomModelRow[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [classifyingId, setClassifyingId] = useState<string | null>(null);
  const [renamingModel, setRenamingModel] = useState<SiteModel | null>(null);
  const [coverModel, setCoverModel] = useState<SiteModel | null>(null);
  const [kindFilter, setKindFilter] = useState<"Tous" | InvitationKind>("Tous");
  const [eventFilter, setEventFilter] = useState<string>("Tous");

  // Détection du paramètre d'URL tab=categories
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("tab") === "categories") {
        setActiveTab("categories");
      }
    }
  }, []);

  const load = useCallback(async (force = false) => {
    if (force) {
      invalidateModelDefaultsCache();
      invalidateCustomModelsCache();
    }
    try {
      const [modelRows, customs, cats] = await Promise.all([
        fetchModelDefaults(supabase, force),
        fetchCustomModels(supabase, { force }),
        fetchAllServiceCategories(supabase),
      ]);
      setRows(modelRows);
      setCustomModels(customs);
      setCategories(cats);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    load();

    const unsubSyncModels = subscribeToSync("models", () => load(true));
    const unsubSyncCats = subscribeToSync("categories", () => load(true));

    const channel = supabase
      .channel("admin_models_studio_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "invitation_model_defaults" }, () => load(true))
      .on("postgres_changes", { event: "*", schema: "public", table: "custom_invitation_models" }, () => load(true))
      .subscribe();

    return () => {
      unsubSyncModels();
      unsubSyncCats();
      supabase.removeChannel(channel);
    };
  }, [load, supabase]);

  const workingContent = (m: SiteModel) => m.fill(rows[m.id]?.draft_content ?? rows[m.id]?.content ?? m.original);

  const act = async (model: SiteModel, action: () => Promise<void>, done: string) => {
    setBusyId(model.id);
    setNotice(null);
    try {
      await action();
      setNotice({ ok: true, text: done });
      broadcastChange("models");
      await load(true);
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

  // Modèles supprimés : hors du studio, restaurables plus bas
  const activeModels = SITE_MODELS.filter((m) => !isModelDeleted(rows[m.id]));
  const deletedModels = SITE_MODELS.filter((m) => isModelDeleted(rows[m.id]));
  const groups = KIND_GROUPS.filter((g) => kindFilter === "Tous" || kindFilter === g.id)
    .map((g) => ({
      ...g,
      models: activeModels.filter((m) => {
        const c = classOf(m);
        return c.type === g.id && (eventFilter === "Tous" || c.events.includes(eventFilter));
      }),
    }))
    .filter((g) => g.models.length || kindFilter !== "Tous");

  const eventCount = (t: string) => {
    const builtin = activeModels.filter((m) => {
      const c = classOf(m);
      if (t === "Vœux") return c.type === "voeu" || c.events.includes("Vœux");
      if (t === "Mots Doux") return c.type === "mot_doux" || c.events.includes("Mots Doux");
      if (t === "Couple") return c.type === "couple" || c.events.includes("Couple") || c.events.includes("Invitations Couple");
      return c.events.includes(t);
    }).length;

    const custom = customModels.filter((m) => {
      if (m.status === "hidden") return false;
      const evs = m.event_types || [];
      if (t === "Vœux") return m.invitation_type === "voeu" || evs.includes("Vœux");
      if (t === "Mots Doux") return m.invitation_type === "mot_doux" || evs.includes("Mots Doux");
      if (t === "Couple") return m.invitation_type === "couple" || evs.includes("Couple") || evs.includes("Invitations Couple");
      return evs.includes(t);
    }).length;

    return builtin + custom;
  };

  const kindCount = (k: "Tous" | InvitationKind) => {
    if (k === "Tous") {
      const builtin = activeModels.filter((m) => !rows[m.id]?.is_hidden).length;
      const custom = customModels.filter((m) => m.status !== "hidden").length;
      return builtin + custom;
    }
    const builtin = activeModels.filter((m) => !rows[m.id]?.is_hidden && classOf(m).type === k).length;
    const custom = customModels.filter((m) => m.status !== "hidden" && m.invitation_type === k).length;
    return builtin + custom;
  };

  // Compteur de modèles par catégorie pour la section catégories
  const modelsCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of activeModels) {
      const c = classOf(m);
      const slug = getCategorySlugForModel({ type: c.type, events: c.events, category: c.events[0] });
      counts[slug] = (counts[slug] || 0) + 1;
    }
    for (const m of customModels) {
      if (m.status !== "hidden") {
        const slug = getCategorySlugForModel({ type: m.invitation_type, events: m.event_types || [], category: m.event_types?.[0] });
        counts[slug] = (counts[slug] || 0) + 1;
      }
    }
    return counts;
  }, [activeModels, customModels, rows]);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-5 sm:space-y-6">
      {/* En-tête principal fusionné */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#8f6f33] flex items-center gap-1.5 font-bold">
            <Brush size={13} /> Studio des modèles &amp; Catégories
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-gray-900 leading-tight">
            Modèles d&apos;invitation &amp; Catégories
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl">
            Ajustez, personnalisez et publiez vos modèles d&apos;invitation, et configurez les catégories de services et tarifs en temps réel.
          </p>
        </div>

        <Link
          href="/invitations"
          target="_blank"
          className="px-3.5 py-2 rounded-xl border border-[#c9a45e]/40 bg-white text-gray-800 text-xs font-semibold hover:bg-[#fbf7f0] flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <span>Voir la galerie</span>
          <ExternalLink size={13} className="text-[#b8924a]" />
        </Link>
      </div>

      {/* Barre d'onglets fusionnée : Modèles d'invitation vs Catégories & Tarifs */}
      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit border border-gray-200">
        <button
          type="button"
          onClick={() => {
            setActiveTab("modeles");
            if (typeof window !== "undefined") {
              window.history.replaceState(null, "", window.location.pathname);
            }
          }}
          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "modeles"
              ? "bg-white text-gray-900 shadow-sm border border-gray-200"
              : "text-gray-600 hover:text-black"
          }`}
        >
          <Brush size={15} className="text-[#b8924a]" />
          <span>Modèles d&apos;invitation</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-bold">
            {activeModels.length + customModels.filter((m) => m.status !== "hidden").length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("categories");
            if (typeof window !== "undefined") {
              window.history.replaceState(null, "", `${window.location.pathname}?tab=categories`);
            }
          }}
          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "categories"
              ? "bg-white text-gray-900 shadow-sm border border-gray-200"
              : "text-gray-600 hover:text-black"
          }`}
        >
          <Tag size={15} className="text-[#b8924a]" />
          <span>Catégories &amp; Tarifs</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
            {categories.length}
          </span>
        </button>
      </div>

      {/* Notification de mise à jour */}
      {notice && (
        <div
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm animate-in slide-in-from-top-2 duration-200 shadow-xs ${
            notice.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <CheckCircle2 size={16} className="shrink-0" /> {notice.text}
        </div>
      )}

      {/* ONGLET 1 : GESTION DES MODÈLES D'INVITATION (STUDIO COMPLET) */}
      {activeTab === "modeles" && (
        <div className="space-y-6">
          {/* Classement : type d'invitation et type d'événement */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-3 sm:p-4 space-y-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {(["Tous", "animée", "carte", "voeu", "mot_doux", "couple"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKindFilter(k)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    kindFilter === k
                      ? "bg-[#2b2118] text-[#f5eee1] border-[#2b2118] shadow-xs"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span>
                    {k === "Tous"
                      ? "✨ Tous les formats"
                      : k === "animée"
                      ? "🎬 Invitations animées"
                      : k === "carte"
                      ? "📜 Invitations statiques"
                      : k === "voeu"
                      ? "🎁 Vœux & Célébrations"
                      : k === "mot_doux"
                      ? "💌 Mots doux"
                      : "❤️ Espace Couple"}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    kindFilter === k ? "bg-white/20 text-[#f5eee1]" : "bg-gray-100 text-gray-600"
                  }`}>
                    {kindCount(k)}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-gray-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0">Filtrer par événement :</span>
              <button
                type="button"
                onClick={() => setEventFilter("Tous")}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                  eventFilter === "Tous" ? "bg-[#b8924a] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Tous ({eventCount("Tous")})
              </button>
              {EVENT_TYPES.map((t) => {
                const count = eventCount(t);
                if (count === 0 && eventFilter !== t) return null;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEventFilter(t)}
                    className={`shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                      eventFilter === t ? "bg-[#b8924a] text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span>{EVENT_TYPE_ICONS[t] ?? "📅"}</span>
                    <span>{t}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Modèles importés (ZIP / HTML) */}
          <ImportedModelsSection kindFilter={kindFilter} eventFilter={eventFilter} onReload={load} onNotice={setNotice} />

          {/* Grille des modèles du site regroupés par type */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-[#b8924a]" />
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
              Aucun modèle dans cette catégorie.
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-serif text-xl sm:text-2xl text-gray-900">
                    <span>{group.icon}</span>
                    <span>{group.title}</span>
                    <span className="text-xs font-sans text-gray-400">({group.models.length})</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.models.map((model) => {
                    const row = rows[model.id];
                    const name = currentName(model);
                    const st = status(row);
                    const cls = classOf(model);
                    return (
                      <ModelCard
                        key={model.id}
                        name={name}
                        originalName={model.name}
                        cover={modelCoverOf(row, model.image)}
                        status={st}
                        presence={row?.is_hidden ? "hidden" : "online"}
                        kind={cls.type}
                        events={cls.events}
                        info={row?.published_at ? `Publié le ${formatDate(row.published_at)}` : row ? `Modifié le ${formatDate(row.updated_at)}` : "Contenu d'origine du modèle"}
                        busy={busyId === model.id}
                        viewUrl={model.liveUrl}
                        onOpen={() => {
                          setNotice(null);
                          setEditingId(model.id);
                        }}
                        onRename={() => setRenamingModel(model)}
                        onClassify={() => setClassifyingId(model.id)}
                        onCover={() => setCoverModel(model)}
                        onPublish={async () => act(model, async () => { await publishModelAction(model.id, classOf(model).type === "carte" ? withoutMusic(workingContent(model)) : workingContent(model), name); }, `« ${name} » est publié sur le site.`)}
                        onShow={async () => act(model, async () => { await setModelHiddenAction(model.id, false); }, `« ${name} » est de retour sur le site.`)}
                        onHide={async () => {
                          if (!confirm(`Retirer « ${name} » du site ? Il n'apparaîtra plus dans les galeries ni à la création d'événement. Les invitations déjà achetées restent intactes.`)) return;
                          await act(model, async () => { await setModelHiddenAction(model.id, true); }, `« ${name} » est retiré du site.`);
                        }}
                        onDelete={async () => {
                          if (!confirm(`Supprimer « ${name} » ? Il disparaît du studio et du site. Les invitations déjà achetées restent intactes, et vous pourrez le restaurer depuis « Modèles supprimés ».`)) return;
                          await act(model, async () => { await setModelDeletedAction(model.id, true); }, `« ${name} » est supprimé.`);
                        }}
                        extra={[
                          {
                            label: "Version d'origine",
                            icon: <RotateCcw size={14} />,
                            disabled: !(row?.content || row?.draft_content || row?.name),
                            onClick: async () => {
                              if (!confirm(`Rétablir la version d'origine de « ${name} » ? Vos ajustements (nom, textes, photos) seront effacés.`)) return;
                              await act(model, () => resetModelDefaultAction(model.id, true), `« ${model.name} » a retrouvé son contenu et nom d'origine.`);
                            },
                          },
                        ]}
                      />
                    );
                  })}
                </div>
              </section>
            ))
          )}

          {deletedModels.length > 0 && (
            <details className="rounded-3xl border border-gray-100 bg-white p-4">
              <summary className="cursor-pointer text-sm font-semibold text-gray-700">Modèles supprimés · {deletedModels.length}</summary>
              <ul className="mt-3 divide-y divide-gray-100">
                {deletedModels.map((model) => (
                  <li key={model.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="text-sm text-gray-700 truncate">{currentName(model)}</span>
                    <button
                      type="button"
                      disabled={busyId === model.id}
                      onClick={async () => act(model, async () => { await setModelDeletedAction(model.id, false); }, `« ${currentName(model)} » est restauré (retiré du site jusqu'à sa remise en ligne).`)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                    >
                      <RotateCcw size={13} /> Restaurer
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* ONGLET 2 : GESTION FUSIONNÉE DES CATÉGORIES & TARIFS */}
      {activeTab === "categories" && (
        <CategoriesManagerSection
          categories={categories}
          onReload={() => load(true)}
          onNotice={setNotice}
          modelsCountByCategory={modelsCountByCategory}
        />
      )}

      {/* Modales du studio */}
      {coverModel && (
        <CoverModal
          modelName={currentName(coverModel)}
          current={modelCoverOf(rows[coverModel.id], coverModel.image)}
          original={coverModel.image}
          onClose={() => setCoverModel(null)}
          onSave={async (url) => {
            await saveModelCoverAction(coverModel.id, url);
            setCoverModel(null);
            setNotice({ ok: true, text: `La photo de couverture de « ${currentName(coverModel)} » est à jour sur le site.` });
            await load(true);
          }}
        />
      )}

      {renamingModel && (
        <RenameModelModal
          modelName={currentName(renamingModel)}
          originalName={renamingModel.name}
          modelImage={renamingModel.image}
          onClose={() => setRenamingModel(null)}
          onSave={async (newName) => {
            await saveModelNameAction(renamingModel.id, newName);
            setRenamingModel(null);
            setNotice({
              ok: true,
              text: `L'invitation s'appelle désormais « ${newName} » sur l'ensemble du site.`,
            });
            await load(true);
          }}
        />
      )}

      {classifying && (
        <ClassifyModal
          modelName={currentName(classifying)}
          initial={classOf(classifying)}
          onClose={() => setClassifyingId(null)}
          onSave={async (c) => {
            await saveModelClassificationAction(classifying.id, c);
            setClassifyingId(null);
            setNotice({ ok: true, text: `« ${currentName(classifying)} » est classé : ${c.type} · ${c.events.join(", ")}.` });
            await load(true);
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
            await saveModelDraftAction(editing.id, content, newName);
            await load(true);
          }}
          onPublish={async (content: ModelContent, newName?: string) => {
            await publishModelAction(editing.id, classOf(editing).type === "carte" ? withoutMusic(content) : content, newName);
            await load(true);
          }}
        />
      )}
    </div>
  );
}
