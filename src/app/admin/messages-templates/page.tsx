"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import {
  listAdminMessageTemplates,
  upsertAdminMessageTemplate,
  deleteAdminMessageTemplate
} from "@/app/admin/admin-actions";
import {
  SEED_MESSAGE_TEMPLATES,
  type MessageTemplate,
  type MessageTone
} from "@/lib/messageTemplates";

const EVENT_TYPE_OPTIONS = [
  "mariage",
  "baptême",
  "anniversaire",
  "conférence",
  "vœux",
  "mots doux",
];

const TONE_OPTIONS: MessageTone[] = ["chaleureux", "formel", "court", "tendre"];

export default function AdminMessageTemplatesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterTone, setFilterTone] = useState("all");

  // Modal d'ajout / modification
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<MessageTemplate> | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    const res = await listAdminMessageTemplates();
    if (res.templates && res.templates.length > 0) {
      setTemplates(res.templates);
    } else {
      // Fallback sur les graines
      setTemplates(SEED_MESSAGE_TEMPLATES);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const filtered = templates.filter((t) => {
    const matchSearch =
      t.body.toLowerCase().includes(search.toLowerCase()) ||
      t.event_type.toLowerCase().includes(search.toLowerCase()) ||
      (t.sub_type && t.sub_type.toLowerCase().includes(search.toLowerCase()));
    const matchType = filterType === "all" || t.event_type === filterType;
    const matchTone = filterTone === "all" || t.tone === filterTone;
    return matchSearch && matchType && matchTone;
  });

  const openCreateModal = () => {
    setEditingTemplate({
      event_type: "mariage",
      sub_type: "",
      tone: "chaleureux",
      body: "",
      is_active: true,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (t: MessageTemplate) => {
    setEditingTemplate({ ...t });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate || !editingTemplate.body?.trim()) {
      setErrorMsg("Le texte du message est requis.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const res = await upsertAdminMessageTemplate({
      id: editingTemplate.id,
      event_type: editingTemplate.event_type || "mariage",
      sub_type: editingTemplate.sub_type || null,
      tone: editingTemplate.tone || "chaleureux",
      body: editingTemplate.body || "",
      is_active: editingTemplate.is_active ?? true,
    });

    setSaving(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg("Modèle de message enregistré avec succès !");
      setTimeout(() => setSuccessMsg(null), 3000);
      setModalOpen(false);
      loadTemplates();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce message ?")) return;
    const res = await deleteAdminMessageTemplate(id);
    if (!res.error) {
      setSuccessMsg("Message supprimé.");
      setTimeout(() => setSuccessMsg(null), 2000);
      loadTemplates();
    }
  };

  const insertVariable = (varName: string) => {
    if (!editingTemplate) return;
    const current = editingTemplate.body || "";
    setEditingTemplate({
      ...editingTemplate,
      body: current + ` {${varName}} `,
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Bibliothèque de messages d&apos;accompagnement
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les messages tout prêts proposés aux clients selon le type d&apos;invitation et la tonalité souhaitée.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1b140e] hover:bg-[#2c2017] text-white text-xs font-bold transition-all shadow-md shadow-black/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} className="text-[#D4AF37]" />
          <span>Ajouter un message</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par texte, type ou mot-clé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-[#b8924a]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none cursor-pointer"
          >
            <option value="all">Tous les types</option>
            {EVENT_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filterTone}
            onChange={(e) => setFilterTone(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none cursor-pointer"
          >
            <option value="all">Toutes les tonalités</option>
            {TONE_OPTIONS.map((tone) => (
              <option key={tone} value={tone}>
                Ton {tone}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste des messages */}
      {loading ? (
        <div className="p-12 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin text-[#D4AF37]" />
          <span>Chargement de la bibliothèque…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 text-sm text-gray-500">
          Aucun message ne correspond à vos filtres.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="p-4 bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:border-[#b8924a]/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#1b140e] text-white text-[10px] font-bold uppercase tracking-wider">
                      {t.event_type}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-[#8f6f33] border border-[#b8924a]/20 text-[10px] font-bold capitalize">
                      {t.tone}
                    </span>
                    {t.sub_type && (
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px]">
                        {t.sub_type}
                      </span>
                    )}
                  </div>

                  <span
                    className={`w-2 h-2 rounded-full ${t.is_active ? "bg-emerald-500" : "bg-gray-300"}`}
                    title={t.is_active ? "Actif" : "Inactif"}
                  />
                </div>

                <p className="text-xs text-gray-800 leading-relaxed italic bg-gray-50/70 p-3 rounded-xl border border-gray-100 whitespace-pre-line">
                  « {t.body} »
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(t)}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors cursor-pointer"
                  title="Modifier"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Supprimer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'ajout / modification */}
      {modalOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-gray-900">
                {editingTemplate.id ? "Modifier le message" : "Nouveau message d'accompagnement"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-gray-700">Type d&apos;événement</span>
                  <select
                    value={editingTemplate.event_type}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, event_type: e.target.value })}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:border-[#b8924a]"
                  >
                    {EVENT_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-gray-700">Tonalité</span>
                  <select
                    value={editingTemplate.tone}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, tone: e.target.value as MessageTone })}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:border-[#b8924a]"
                  >
                    {TONE_OPTIONS.map((tone) => (
                      <option key={tone} value={tone}>
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-gray-700">Sous-type (facultatif, ex: Korité, couple)</span>
                <input
                  type="text"
                  placeholder="Ex : Korité / Tabaski, Nouvel An, couple, amis…"
                  value={editingTemplate.sub_type || ""}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, sub_type: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-[#b8924a]"
                />
              </label>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">Corps du message</span>
                  <span className="text-[10px] text-gray-400">Cliquez pour insérer :</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-1">
                  {["prenom_invite", "prenoms_hotes", "date", "heure", "lieu", "lien"].map((v) => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => insertVariable(v)}
                      className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-[#8f6f33] border border-[#b8924a]/20 text-[10px] font-mono cursor-pointer"
                    >
                      +{`{${v}}`}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={4}
                  required
                  placeholder="Rédigez le texte du message avec les balises..."
                  value={editingTemplate.body || ""}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 leading-relaxed outline-none focus:border-[#b8924a] resize-y"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editingTemplate.is_active ?? true}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-[#b8924a] focus:ring-[#b8924a]"
                />
                <span className="text-xs text-gray-700 font-semibold">Message actif et disponible pour les clients</span>
              </label>

              {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#1b140e] hover:bg-[#2c2017] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving && <Loader2 size={13} className="animate-spin text-[#D4AF37]" />}
                  <span>Enregistrer le message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
