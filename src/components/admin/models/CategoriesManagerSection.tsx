"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Tag,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  type ServiceCategory,
} from "@/lib/serviceCategories";

const ICONS = ["🎉", "🎁", "💌", "❤️", "📜", "🌟", "🥂", "🎊", "🌸", "✨", "🎂", "💍", "👶", "🎓", "🌿", "🕯️", "🏆", "🎵"];

interface CategoriesManagerSectionProps {
  categories: ServiceCategory[];
  onReload: () => Promise<void>;
  onNotice: (notice: { ok: boolean; text: string } | null) => void;
  modelsCountByCategory?: Record<string, number>;
}

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
          <p className="text-xs text-gray-500">Configurez l&apos;intitulé, le slug technique et le tarif associé en FCFA.</p>
        </div>
      </div>

      {/* Choix de l'icône */}
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

export default function CategoriesManagerSection({
  categories,
  onReload,
  onNotice,
  modelsCountByCategory = {},
}: CategoriesManagerSectionProps) {
  const [supabase] = useState(() => createClient());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (data: Partial<ServiceCategory>) => {
    try {
      await createServiceCategory(supabase, data as Omit<ServiceCategory, "id" | "created_at" | "updated_at">);
      setCreating(false);
      onNotice({ ok: true, text: "Catégorie créée avec succès !" });
      await onReload();
    } catch (err) {
      onNotice({ ok: false, text: err instanceof Error ? err.message : "Erreur de création." });
    }
  };

  const handleUpdate = async (id: string, data: Partial<ServiceCategory>) => {
    try {
      await updateServiceCategory(supabase, id, data);
      setEditingId(null);
      onNotice({ ok: true, text: "Catégorie et tarifs mis à jour !" });
      await onReload();
    } catch (err) {
      onNotice({ ok: false, text: err instanceof Error ? err.message : "Erreur de mise à jour." });
    }
  };

  const handleDelete = async (cat: ServiceCategory) => {
    if (!confirm(`Supprimer la catégorie « ${cat.label} » ? Les modèles associés pourront être reclassés.`)) return;
    setDeletingId(cat.id);
    try {
      await deleteServiceCategory(supabase, cat.id);
      onNotice({ ok: true, text: `Catégorie « ${cat.label} » supprimée.` });
      await onReload();
    } catch (err) {
      onNotice({ ok: false, text: err instanceof Error ? err.message : "Erreur lors de la suppression." });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (cat: ServiceCategory) => {
    try {
      await updateServiceCategory(supabase, cat.id, { is_active: !cat.is_active });
      onNotice({ ok: true, text: cat.is_active ? `Catégorie « ${cat.label} » désactivée.` : `Catégorie « ${cat.label} » activée !` });
      await onReload();
    } catch (err) {
      onNotice({ ok: false, text: err instanceof Error ? err.message : "Erreur." });
    }
  };

  return (
    <div className="space-y-5">
      {/* En-tête de section */}
      <div className="flex items-start justify-between gap-4 flex-wrap bg-white rounded-3xl border border-gray-100 p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag size={20} className="text-[#b8924a]" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
              Catégories de services &amp; Tarifs
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl">
            Gérez les catégories dynamiques affichées sur le site et ajustez leurs tarifs associés en FCFA. Chaque catégorie pilote directement les filtres de la page Collection et de la vitrine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!creating && (
            <button
              type="button"
              onClick={() => {
                setCreating(true);
                setEditingId(null);
              }}
              className="btn-lux px-4 py-2.5 text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus size={15} />
              Nouvelle catégorie
            </button>
          )}
          <Link
            href="/invitations"
            target="_blank"
            className="px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Voir la galerie</span>
            <ExternalLink size={13} className="text-[#b8924a]" />
          </Link>
        </div>
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
                      {modelsCountByCategory[cat.slug] || 0} {(modelsCountByCategory[cat.slug] || 0) > 1 ? "modèles" : "modèle"}
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
    </div>
  );
}
