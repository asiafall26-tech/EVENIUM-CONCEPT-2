"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Tag,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  fetchAllServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  type ServiceCategory,
  FALLBACK_CATEGORIES,
  getCategorySlugForModel,
} from "@/lib/serviceCategories";
import {
  classificationOf,
  fetchModelDefaults,
  modelCoverOf,
  modelNameOf,
  type ModelDefaultRow,
} from "@/lib/modelDefaults";
import { fetchCustomModels, type CustomModelRow } from "@/lib/customModels";
import { mockInvitationModels, defaultClassification } from "@/data/mock/invitations";
import { assignModelCategoryAction } from "@/app/actions/adminModelActions";
import { broadcastChange, subscribeToSync } from "@/lib/syncService";

const ICONS = ["📜", "🌟", "💌", "🥂", "🎊", "🌸", "✨", "🎂", "💍", "👶", "🎓", "🌿", "🕯️", "🏆", "🎵"];

function CategoryForm({
  initial,
  onSave,
  onCancel,
  isNew,
}: {
  initial: Partial<ServiceCategory>;
  onSave: (data: Partial<ServiceCategory>) => Promise<void>;
  onCancel: () => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState({
    slug: initial.slug ?? "",
    label: initial.label ?? "",
    description: initial.description ?? "",
    icon: initial.icon ?? "📜",
    price_fcfa: initial.price_fcfa !== null && initial.price_fcfa !== undefined ? initial.price_fcfa.toString() : "",
    sort_order: initial.sort_order?.toString() ?? "0",
    is_active: initial.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) {
      setError("Le nom de la catégorie est obligatoire.");
      return;
    }
    const computedSlug = form.slug.trim()
      ? form.slug.trim().toLowerCase().replace(/\s+/g, "_")
      : form.label.trim().toLowerCase().replace(/[^a-z0-9]/gi, "_");

    setSaving(true);
    setError(null);
    try {
      await onSave({
        slug: computedSlug,
        label: form.label.trim(),
        description: form.description.trim() || null,
        icon: form.icon,
        price_fcfa: form.price_fcfa.trim() ? parseInt(form.price_fcfa.trim(), 10) : null,
        sort_order: parseInt(form.sort_order, 10) || 0,
        is_active: form.is_active,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border-2 border-[#b8924a]/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-md">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-3xl">{form.icon}</div>
        <div>
          <h3 className="font-serif text-lg font-bold text-gray-900">
            {isNew ? "Nouvelle catégorie" : `Modifier « ${initial.label} »`}
          </h3>
          <p className="text-xs text-gray-500">Configurez l&apos;intitulé, le slug et le tarif de cette catégorie.</p>
        </div>
      </div>

      {/* Icône picker */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5">Icône décorative</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => set("icon", ic)}
              className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                form.icon === ic
                  ? "bg-[#b8924a] text-white shadow-md scale-110"
                  : "bg-gray-50 border border-gray-200 hover:border-[#b8924a]"
              }`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Nom affiché <span className="text-red-500">*</span>
          </label>
          <input
            value={form.label}
            onChange={(e) => set("label", e.target.value)}
            placeholder="ex: Invitations – Grands événements"
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:border-[#b8924a] outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Slug (identifiant technique) <span className="text-red-500">*</span>
          </label>
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="ex: invitations, voeux, mots_doux, couple"
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:border-[#b8924a] outline-none"
            required
          />
          <p className="text-[10px] text-gray-400 mt-1">Utilisé dans les filtres URL (?cat=slug)</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="ex: mariages, baptêmes, anniversaires, cérémonies et autres grands événements..."
          rows={2}
          className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:border-[#b8924a] outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Tarif associé (FCFA)</label>
          <input
            type="number"
            value={form.price_fcfa}
            onChange={(e) => set("price_fcfa", e.target.value)}
            placeholder="ex: 2000 (vide = variable)"
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:border-[#b8924a] outline-none"
          />
          <p className="text-[10px] text-gray-400 mt-0.5">Laisser vide = prix selon formule</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Ordre d&apos;affichage</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => set("sort_order", e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:border-[#b8924a] outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Visibilité</label>
          <button
            type="button"
            onClick={() => set("is_active", !form.is_active)}
            className={`w-full px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              form.is_active
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            {form.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
            {form.is_active ? "Active" : "Désactivée"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 btn-lux py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Enregistrement…" : "Enregistrer la catégorie"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <X size={14} /> Annuler
        </button>
      </div>
    </form>
  );
}

export default function AdminCategoriesPage() {
  const [supabase] = useState(() => createClient());
  const [activeTab, setActiveTab] = useState<"categories" | "models">("categories");
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [rows, setRows] = useState<Record<string, ModelDefaultRow>>({});
  const [customs, setCustoms] = useState<CustomModelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingModelId, setUpdatingModelId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const showNotice = (ok: boolean, text: string) => {
    setNotice({ ok, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const reload = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const [cats, modelRows, customRows] = await Promise.all([
        fetchAllServiceCategories(supabase),
        fetchModelDefaults(supabase, force),
        fetchCustomModels(supabase, { force }),
      ]);
      setCategories(cats);
      setRows(modelRows);
      setCustoms(customRows);
    } catch {
      setCategories(FALLBACK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    reload();

    const unsubSyncCats = subscribeToSync("categories", () => reload(true));
    const unsubSyncModels = subscribeToSync("models", () => reload(true));

    return () => {
      unsubSyncCats();
      unsubSyncModels();
    };
  }, [reload]);

  const handleCreate = async (data: Partial<ServiceCategory>) => {
    await createServiceCategory(supabase, data as Omit<ServiceCategory, "id" | "created_at" | "updated_at">);
    setCreating(false);
    showNotice(true, "Catégorie créée avec succès !");
    reload(true);
  };

  const handleUpdate = async (id: string, data: Partial<ServiceCategory>) => {
    await updateServiceCategory(supabase, id, data);
    setEditingId(null);
    showNotice(true, "Catégorie et tarifs mis à jour !");
    reload(true);
  };

  const handleDelete = async (cat: ServiceCategory) => {
    if (!confirm(`Supprimer la catégorie « ${cat.label} » ? Les modèles associés pourront être reclassés.`)) return;
    setDeletingId(cat.id);
    try {
      await deleteServiceCategory(supabase, cat.id);
      showNotice(true, `Catégorie « ${cat.label} » supprimée.`);
      reload(true);
    } catch (err) {
      showNotice(false, err instanceof Error ? err.message : "Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (cat: ServiceCategory) => {
    try {
      await updateServiceCategory(supabase, cat.id, { is_active: !cat.is_active });
      showNotice(true, cat.is_active ? `Catégorie « ${cat.label} » désactivée.` : `Catégorie « ${cat.label} » activée !`);
      reload(true);
    } catch (err) {
      showNotice(false, err instanceof Error ? err.message : "Erreur.");
    }
  };

  // Liste de tous les modèles pour l'affectation
  const allPlatformModels = useMemo(() => {
    const builtIn = mockInvitationModels.map((m) => {
      const c = classificationOf(rows[m.id], defaultClassification(m.id));
      const modelObj = {
        id: m.id,
        name: modelNameOf(rows[m.id], m.name),
        thumbnail: modelCoverOf(rows[m.id], m.thumbnail),
        type: c.type,
        category: c.events[0] ?? m.category,
        events: c.events,
        isCustom: false,
      };
      const assignedSlug = getCategorySlugForModel(modelObj);
      return {
        ...modelObj,
        assignedSlug,
      };
    });

    const imported = customs.map((m) => {
      const modelObj = {
        id: `custom-${m.slug}`,
        name: m.name,
        thumbnail: m.cover_url || "/invit-velours-cover.jpg",
        type: m.invitation_type,
        category: m.event_types?.[0] ?? "Mariage",
        events: Array.isArray(m.event_types) ? m.event_types : [],
        isCustom: true,
      };
      const assignedSlug = getCategorySlugForModel(modelObj);
      return {
        ...modelObj,
        assignedSlug,
      };
    });

    return [...builtIn, ...imported];
  }, [rows, customs]);

  // Reclassement instantané d'un modèle dans une catégorie
  const handleAssignCategory = async (modelId: string, modelName: string, categorySlug: string) => {
    const targetCat = categories.find((c) => c.slug === categorySlug);
    setUpdatingModelId(modelId);
    try {
      await assignModelCategoryAction(modelId, categorySlug, targetCat?.label);
      showNotice(true, `Le modèle « ${modelName} » est désormais classé dans « ${targetCat?.label || categorySlug} » !`);
      broadcastChange("models");
      broadcastChange("categories");
      await reload(true);
    } catch (err) {
      showNotice(false, err instanceof Error ? err.message : "Erreur lors de l'affectation.");
    } finally {
      setUpdatingModelId(null);
    }
  };

  // Nombre de modèles par catégorie
  const countPerCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of categories) {
      counts[cat.slug] = allPlatformModels.filter((m) => m.assignedSlug === cat.slug).length;
    }
    return counts;
  }, [categories, allPlatformModels]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header avec raccourcis */}
      <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-[#c9a45e]/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag size={22} className="text-[#b8924a]" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              Gestion des Catégories &amp; Classement
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Créez, modifiez vos catégories, ajustez leurs tarifs et affectez chaque modèle d&apos;invitation en un clic.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/invitations"
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-[#c9a45e]/40 bg-white text-gray-800 text-xs font-semibold hover:bg-[#fbf7f0] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Voir la page Collection</span>
            <ExternalLink size={13} className="text-[#b8924a]" />
          </Link>
          <Link
            href="/admin/modeles"
            className="px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Studio des modèles</span>
            <ArrowRight size={13} className="text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Notice de confirmation */}
      {notice && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-xl text-sm font-semibold animate-in slide-in-from-top-2 duration-200 shadow-sm ${
            notice.ok ? "bg-green-50 text-green-900 border border-green-200" : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          <CheckCircle2 size={16} className={notice.ok ? "text-green-600" : "text-red-600"} />
          {notice.text}
        </div>
      )}

      {/* Sélecteur d'onglets : Catégories vs Affectation des Modèles */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "categories"
              ? "bg-white text-gray-900 shadow-sm border border-gray-200"
              : "text-gray-600 hover:text-black"
          }`}
        >
          <Tag size={15} className="text-[#b8924a]" />
          <span>Catégories &amp; Tarifs</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">
            {categories.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("models")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "models"
              ? "bg-white text-gray-900 shadow-sm border border-gray-200"
              : "text-gray-600 hover:text-black"
          }`}
        >
          <Layers size={15} className="text-[#b8924a]" />
          <span>Affectation des Modèles</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">
            {allPlatformModels.length}
          </span>
        </button>
      </div>

      {/* ONGLET 1 : GESTION DES CATÉGORIES & TARIFS */}
      {activeTab === "categories" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-gray-900">
                Liste des catégories actives
              </h2>
              <p className="text-xs text-gray-500">
                Ces catégories pilotent directement les filtres sur la page Collection et la vitrine Evenium.
              </p>
            </div>
            {!creating && (
              <button
                type="button"
                onClick={() => {
                  setCreating(true);
                  setEditingId(null);
                }}
                className="btn-lux px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus size={15} />
                Nouvelle catégorie
              </button>
            )}
          </div>

          {/* Formulaire de création */}
          {creating && (
            <CategoryForm
              initial={{ sort_order: categories.length + 1, is_active: true }}
              onSave={handleCreate}
              onCancel={() => setCreating(false)}
              isNew
            />
          )}

          {/* Liste des cartes catégories */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-[#b8924a]" />
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id || cat.slug}>
                  {editingId === (cat.id || cat.slug) ? (
                    <CategoryForm
                      initial={cat}
                      onSave={(data) => handleUpdate(cat.id || cat.slug, data)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div
                      className={`bg-white rounded-2xl border p-4 sm:p-5 flex items-start gap-4 transition-all ${
                        !cat.is_active ? "opacity-60 border-gray-200 bg-gray-50/50" : "border-[#c9a45e]/30 shadow-sm hover:border-[#c9a45e]"
                      }`}
                    >
                      <div className="text-3xl shrink-0 mt-0.5">{cat.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-serif font-bold text-base text-gray-900">{cat.label}</span>
                          {cat.price_fcfa ? (
                            <span className="text-[11px] font-bold bg-[#fbf7f0] border border-[#b8924a]/40 text-[#8f6f33] px-2.5 py-0.5 rounded-full">
                              {cat.price_fcfa.toLocaleString("fr-FR")} FCFA
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                              Tarif formule (Standard / Premium / Gold)
                            </span>
                          )}
                          <span className="text-[11px] font-medium bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                            {countPerCategory[cat.slug] || 0} {(countPerCategory[cat.slug] || 0) > 1 ? "modèles affectés" : "modèle affecté"}
                          </span>
                          {!cat.is_active && (
                            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                              Désactivée
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{cat.description || "Aucune description"}</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-mono">
                          slug: <code className="bg-gray-100 px-1 py-0.5 rounded">{cat.slug}</code> · ordre: {cat.sort_order}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(cat)}
                          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                          title={cat.is_active ? "Désactiver" : "Activer"}
                        >
                          {cat.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(cat.id || cat.slug);
                            setCreating(false);
                          }}
                          className="p-2 rounded-xl hover:bg-[#fbf7f0] text-[#b8924a] transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          disabled={deletingId === cat.id}
                          className="p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                          title="Supprimer"
                        >
                          {deletingId === cat.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {categories.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <Tag size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold">Aucune catégorie</p>
                  <p className="text-sm">Créez votre première catégorie de service.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ONGLET 2 : AFFECTATION DES MODÈLES AUX CATÉGORIES */}
      {activeTab === "models" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-serif text-lg font-bold text-gray-900">
                Affectation des modèles aux catégories
              </h2>
              <p className="text-xs text-gray-500">
                Changez à tout moment la catégorie d&apos;un modèle via la liste déroulante. La modification est immédiate sur le site et la galerie.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allPlatformModels.map((model) => {
              const isUpdating = updatingModelId === model.id;
              return (
                <div
                  key={model.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 shadow-xs hover:border-[#b8924a] transition-all"
                >
                  <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    <Image
                      src={model.thumbnail}
                      alt={model.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <h4 className="font-serif font-bold text-sm text-gray-900 truncate">
                        {model.name}
                      </h4>
                      {model.isCustom && (
                        <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded">
                          Importé
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                      Type technique : <span className="font-medium text-gray-700">{model.type}</span>
                    </p>

                    {/* Sélecteur de catégorie instantané */}
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-gray-600 shrink-0">Catégorie :</label>
                      <div className="relative flex-1">
                        <select
                          value={model.assignedSlug}
                          disabled={isUpdating}
                          onChange={(e) => handleAssignCategory(model.id, model.name, e.target.value)}
                          className="w-full text-xs font-semibold bg-[#fbf7f0] border border-[#b8924a]/50 text-gray-900 rounded-xl px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#b8924a] cursor-pointer disabled:opacity-50"
                        >
                          {categories.map((c) => (
                            <option key={c.slug} value={c.slug}>
                              {c.icon} {c.label} {c.price_fcfa ? `(${c.price_fcfa.toLocaleString("fr-FR")} F)` : ""}
                            </option>
                          ))}
                        </select>
                        {isUpdating && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Loader2 size={13} className="animate-spin text-[#b8924a]" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Guide récapitulatif */}
      <div className="bg-[#fbf7f0] border border-[#c9a45e]/30 rounded-2xl p-5 space-y-2">
        <h3 className="font-serif font-bold text-gray-900 flex items-center gap-2 text-sm">
          <Sparkles size={16} className="text-[#b8924a]" /> Fonctionnement dynamique du système
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Toute modification apportée ici (ajout d&apos;une catégorie, changement de nom, modification de tarif ou réaffectation d&apos;un modèle) est synchronisée en temps réel sans besoin de modifier le code. Les filtres de la page Collection et de la vitrine s&apos;adaptent automatiquement.
        </p>
      </div>
    </div>
  );
}
