"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Store, Star, CheckCircle, Clock, XCircle, MoreHorizontal, Trash2, Eye, Ban, Copy, Check, RefreshCw, Calendar, Shield, ShieldOff } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/utils/supabase/client";
import { createProviderAccount, resetProviderPassword, toggleUserSuspension, saveDebugData, getPrestataires, toggleProviderBadge, saveAdminNote, deleteUserAccount } from "../admin-actions";
import Link from "next/link";
import { markPrestatairesSeen, useBadgeStore } from "@/store/BadgeStore";

export default function AdminPrestatairesPage() {
  // The providers list is on screen: new sign-ups are seen (also those arriving while the page is open)
  useEffect(() => {
    markPrestatairesSeen();
    return useBadgeStore.subscribe((s) => {
      if (s.newPrestataires > 0) markPrestatairesSeen();
    });
  }, []);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'annuaire' | 'historique'>('annuaire');
  const [prestataires, setPrestataires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState<{email: string, password: string} | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");

  useEffect(() => {
    fetchPrestataires();

    const channel = supabase
      .channel('admin_prestataires_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchPrestataires(false);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'devis' }, () => {
        fetchPrestataires(false);
      })
      .subscribe();

    const interval = setInterval(() => {
      fetchPrestataires(false);
    }, 12000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchPrestataires = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const { data, error } = await getPrestataires();
      
    if (data) {
      setPrestataires(data);
    }
    if (showLoading) setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if(confirm(`Attention : Voulez-vous vraiment SUPPRIMER DÉFINITIVEMENT le prestataire "${name}" ? Cette action effacera toutes ses données dans Supabase.`)) {
      const result = await deleteUserAccount(id);
      if (result.success) {
        alert(`Le compte prestataire a été supprimé définitivement de Supabase.`);
        fetchPrestataires();
      } else {
        alert(`Erreur lors de la suppression : ${result.error}`);
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setGeneratedCreds(null);

    const formData = new FormData(e.currentTarget);
    const result = await createProviderAccount(formData);

    if (result.error) {
      setErrorMsg(result.error);
    } else if (result.success && result.credentials) {
      setGeneratedCreds(result.credentials);
      fetchPrestataires(); // Refresh the list
    }
    
    setIsSubmitting(false);
  };

  const handleSuspend = async (id: string, currentStatus: string) => {
    if(confirm(`Voulez-vous vraiment ${currentStatus === 'actif' ? 'suspendre' : 'réactiver'} ce prestataire ?`)) {
      const result = await toggleUserSuspension(id, currentStatus);
      if (result.success) {
        alert(`Prestataire ${result.status} avec succès.`);
        fetchPrestataires(); // Refresh
      } else {
        alert(`Erreur: ${result.error}`);
      }
    }
  };

  const handleToggleBadge = async (id: string, currentCertified: boolean) => {
    if(confirm(`Voulez-vous vraiment ${currentCertified ? 'retirer' : 'octroyer'} le Badge Evenium à ce prestataire ?`)) {
      const result = await toggleProviderBadge(id, currentCertified);
      if (result.success) {
        alert(`Badge ${result.certified ? 'octroyé' : 'retiré'} avec succès.`);
        fetchPrestataires();
      } else {
        alert(`Erreur: ${result.error}`);
      }
    }
  };

  const handleCopy = () => {
    if (generatedCreds) {
      const textToCopy = `Bonjour ! Voici vos accès pour gérer votre vitrine Evenium :\nEmail : ${generatedCreds.email}\nMot de passe : ${generatedCreds.password}\nLien : https://evenium.com/login`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    setResettingId(userId);
    const result = await resetProviderPassword(userId);
    setResettingId(null);
    if (result.success && result.newPassword) {
      setGeneratedCreds({ email, password: result.newPassword });
      setIsAddModalOpen(true);
    } else {
      alert("Erreur lors de la réinitialisation : " + result.error);
    }
  };

  const handleSaveNote = async (userId: string) => {
    const result = await saveAdminNote(userId, editingNoteContent);
    if (result.success) {
      setPrestataires(prestataires.map(p => p.id === userId ? { ...p, admin_note: editingNoteContent } : p));
      setEditingNoteId(null);
    } else {
      alert("Erreur lors de la sauvegarde : " + result.error + "\nAssurez-vous d'avoir créé la colonne 'admin_note' (type text) dans la table 'profiles'.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Prestataires Partenaires</h1>
          <p className="text-gray-500 text-sm">Gérez l'annuaire des professionnels inscrits sur la plateforme.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setGeneratedCreds(null);
              setErrorMsg("");
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#8f6f33] hover:bg-[#7a5e2b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md"
          >
            + Générer un accès
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('annuaire')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'annuaire' ? 'border-[#8f6f33] text-[#8f6f33]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Annuaire Complet
        </button>
        <button 
          onClick={() => setActiveTab('historique')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'historique' ? 'border-[#8f6f33] text-[#8f6f33]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Historique des accès
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Prestataire</th>
              <th className="px-6 py-4 font-medium">Email</th>
              {activeTab === 'annuaire' ? (
                <th className="px-6 py-4 font-medium">Origine</th>
              ) : (
                <>
                  <th className="px-6 py-4 font-medium">Généré le</th>
                  <th className="px-6 py-4 font-medium">Activité</th>
                  <th className="px-6 py-4 font-medium">Notes & Accès</th>
                </>
              )}
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Chargement...</td>
              </tr>
            ) : (() => {
              const displayed = activeTab === 'annuaire' 
                ? prestataires 
                : prestataires.filter(p => p.is_evenium_certified === true || p.is_evenium_certified === 'true').sort((a, b) => {
                    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return dateB - dateA;
                  });

              if (displayed.length === 0) {
                return (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Aucun prestataire {activeTab === 'historique' ? 'avec accès généré' : ''} trouvé.
                    </td>
                  </tr>
                );
              }

              return displayed.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${p.is_evenium_certified ? 'bg-[#f5eee1] text-[#8f6f33]' : 'bg-gray-100 text-gray-400'}`}>
                      <Store size={18} />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 flex items-center gap-2">
                        {p.full_name}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{p.email}</td>
                <td className="px-6 py-4">
                  {activeTab === 'annuaire' ? (
                    p.is_evenium_certified ? (
                      <span className="bg-[#b8924a]/10 border border-[#b8924a]/20 text-[#8f6f33] text-xs px-2 py-1 rounded-full flex items-center gap-1 w-max font-medium">
                        <CheckCircle size={12}/> Certifié Evenium
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center w-max font-medium">
                        Auto-inscription
                      </span>
                    )
                  ) : (
                    <span className="text-gray-500 flex items-center gap-1">
                      <Calendar size={14}/> {p.created_at && !isNaN(new Date(p.created_at).getTime()) 
                        ? new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                        : 'Date inconnue'}
                    </span>
                  )}
                </td>
                {activeTab === 'historique' && (
                  <>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-gray-500">
                        <span><strong>{p.events_count || 0}</strong> Devis acceptés</span>
                        <span><strong>{p.total_devis || 0}</strong> Devis envoyés</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingNoteId === p.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea 
                            value={editingNoteContent}
                            onChange={(e) => setEditingNoteContent(e.target.value)}
                            className="text-xs p-2 border border-gray-300 rounded resize-none focus:ring-[#b8924a] focus:border-transparent outline-none w-full"
                            placeholder="Collez le mot de passe ici..."
                            rows={3}
                          />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditingNoteId(null)} className="text-[10px] text-gray-500 hover:text-gray-700">Annuler</button>
                            <button onClick={() => handleSaveNote(p.id)} className="text-[10px] bg-black text-white px-2 py-1 rounded">Enregistrer</button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="text-xs text-gray-600 bg-gray-50 p-2 rounded cursor-text border border-dashed border-gray-300 min-h-[40px] hover:bg-gray-100"
                          onClick={() => { setEditingNoteId(p.id); setEditingNoteContent(p.admin_note || ""); }}
                          title="Cliquez pour éditer la note"
                        >
                          {p.admin_note ? (
                            <span className="whitespace-pre-wrap">{p.admin_note}</span>
                          ) : (
                            <span className="text-gray-400 italic">Ajouter une note (ex: mot de passe)</span>
                          )}
                        </div>
                      )}
                    </td>
                  </>
                )}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleToggleBadge(p.id, p.is_evenium_certified)}
                      className={`p-1 transition-colors ${p.is_evenium_certified ? 'text-[#8f6f33] hover:text-red-500' : 'text-gray-400 hover:text-[#8f6f33]'}`}
                      title={p.is_evenium_certified ? "Retirer le badge Evenium" : "Octroyer le badge Evenium"}
                    >
                      {p.is_evenium_certified ? <ShieldOff size={18} /> : <Shield size={18} />}
                    </button>
                    <button 
                      onClick={() => handleResetPassword(p.id, p.email)}
                      disabled={resettingId === p.id}
                      className="text-gray-400 hover:text-[#8f6f33] transition-colors p-1" 
                      title="Générer un nouveau mot de passe"
                    >
                      <RefreshCw size={18} className={resettingId === p.id ? "animate-spin" : ""} />
                    </button>
                    <Link href={`/admin/prestataires/${p.id}`} className="text-gray-400 hover:text-black transition-colors p-1" title="Voir le profil">
                      <Eye size={18} />
                    </Link>
                    <button onClick={() => handleSuspend(p.id, 'actif')} className="text-gray-400 hover:text-red-600 transition-colors p-1" title="Suspendre le compte">
                      <Ban size={18} />
                    </button>
                    <button onClick={() => handleDelete(p.id, p.full_name)} className="text-gray-400 hover:text-red-600 transition-colors p-1" title="Supprimer définitivement du SaaS et de Supabase">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Générer un accès Prestataire">
        {!generatedCreds ? (
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Créez un compte certifié Evenium pour un partenaire. Il recevra des identifiants générés automatiquement.
            </p>
            
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
              <input name="companyName" required type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#b8924a] outline-none" placeholder="Ex: Studio Photo VIP" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select name="category" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#b8924a] outline-none">
                <option value="Traiteur">Traiteur</option>
                <option value="Photographe">Photographe</option>
                <option value="Lieu">Lieu / Salle</option>
                <option value="Animation">Animation (DJ, Orchestre)</option>
                <option value="Décoration">Décoration</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de connexion</label>
              <input name="email" required type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#b8924a] outline-none" placeholder="contact@prestataire.com" />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                Annuler
              </button>
              <button disabled={isSubmitting} type="submit" className="px-4 py-2 bg-[#2b2118] hover:bg-black text-[#b8924a] rounded-lg text-sm font-medium flex items-center gap-2">
                {isSubmitting ? "Création..." : "Générer les accès"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle size={32} />
            </div>
            <h3 className="font-serif text-xl font-bold">Compte créé avec succès !</h3>
            <p className="text-sm text-gray-500">Copiez les identifiants ci-dessous et envoyez-les à votre prestataire. Il pourra se connecter immédiatement.</p>
            
            <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-200 font-mono text-sm space-y-2">
              <p><span className="text-gray-400 select-none">Email : </span> {generatedCreds.email}</p>
              <p><span className="text-gray-400 select-none">Mot de passe : </span> {generatedCreds.password}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleCopy}
                className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {copied ? <><Check size={18}/> Copié !</> : <><Copy size={18}/> Copier</>}
              </button>
              
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-3 bg-black hover:bg-gray-900 text-[#b8924a] rounded-xl font-semibold flex items-center justify-center transition-colors"
              >
                Ajouter au dashboard
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
