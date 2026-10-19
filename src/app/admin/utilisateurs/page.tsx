"use client";

import { Users, Mail, Calendar, Eye, ShieldAlert, Sparkles, Copy, Search, Ban, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { toggleUserSuspension, getClientsWithStats, deleteUserAccount } from "../admin-actions";
import Link from "next/link";

export default function AdminUtilisateursPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('admin_users_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers(false);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchUsers(false);
      })
      .subscribe();

    const interval = setInterval(() => {
      fetchUsers(false);
    }, 12000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchUsers = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    const { data } = await getClientsWithStats();
    if (data) setClients(data);
    if (showLoading) setIsLoading(false);
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    alert("Email copié dans le presse-papier !");
  };

  const handleSuspend = async (id: string, currentStatus: string) => {
    if(confirm(`Voulez-vous vraiment ${currentStatus === 'actif' ? 'suspendre' : 'réactiver'} cet utilisateur ?`)) {
      const result = await toggleUserSuspension(id, currentStatus);
      if (result.success) {
        alert(`Utilisateur ${result.status} avec succès.`);
        fetchUsers(); // Refresh
      } else {
        alert(`Erreur: ${result.error}`);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm(`Attention : Voulez-vous vraiment SUPPRIMER DÉFINITIVEMENT ce compte ? Cette action est irréversible.`)) {
      const result = await deleteUserAccount(id);
      if (result.success) {
        alert(`Le compte a été supprimé définitivement.`);
        fetchUsers();
      } else {
        alert(`Erreur lors de la suppression : ${result.error}`);
      }
    }
  };

  const filteredClients = clients.filter(c => 
    (c.full_name?.toLowerCase().includes(search.toLowerCase())) || 
    (c.email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2 flex items-center gap-2">
            Utilisateurs (Organisateurs) <Users size={24} className="text-[#b8924a]" />
          </h1>
          <p className="text-gray-500 text-sm">Gérez les clients inscrits sur la plateforme.</p>
        </div>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un utilisateur..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#b8924a] focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Client (Organisateur)</th>
                <th className="px-6 py-4 font-semibold">Formule Achetée</th>
                <th className="px-6 py-4 font-semibold">Modèle d'Invitation</th>
                <th className="px-6 py-4 font-semibold">Format</th>
                <th className="px-6 py-4 font-semibold">Montant Payé</th>
                <th className="px-6 py-4 font-semibold">Événement</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">Chargement...</td>
                </tr>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((c) => (
                  <tr key={c.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/utilisateurs/${c.id}`} className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold hover:ring-2 hover:ring-[#b8924a] transition-all">
                          {c.full_name ? c.full_name.charAt(0).toUpperCase() : 'U'}
                        </Link>
                        <div>
                          <Link href={`/admin/utilisateurs/${c.id}`} className="font-semibold text-gray-900 hover:text-[#8f6f33] transition-colors block">
                            {c.full_name || 'Utilisateur Anonyme'}
                          </Link>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                            <Mail size={12} />
                            <span>{c.email}</span>
                            <button onClick={() => copyEmail(c.email)} className="text-gray-400 hover:text-black ml-0.5" title="Copier l'email">
                              <Copy size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Formule Achetée */}
                    <td className="px-6 py-4">
                      {c.events_count > 0 ? (
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                          c.plan === "Gold"
                            ? "bg-[#b8924a]/20 text-[#7a5e2b] border border-[#b8924a]/50"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}>
                          <Sparkles size={11} className={c.plan === "Gold" ? "text-[#8f6f33]" : "text-gray-500"} />
                          Formule {c.plan}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Aucun achat</span>
                      )}
                    </td>

                    {/* Modèle d'Invitation */}
                    <td className="px-6 py-4">
                      {c.events_count > 0 ? (
                        <div className="flex items-center gap-2.5">
                          {c.model_thumbnail && (
                            <div className="relative w-8 h-10 rounded-md overflow-hidden shrink-0 border border-gray-200">
                              <img
                                src={c.model_thumbnail}
                                alt={c.model_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <p className="font-semibold text-gray-900 text-xs">
                            {c.model_name}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Format */}
                    <td className="px-6 py-4">
                      {c.events_count > 0 ? (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1 ${
                          c.format === "Animée"
                            ? "bg-[#6b1f2a] text-pink-100"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {c.format}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Montant Payé */}
                    <td className="px-6 py-4">
                      {c.events_count > 0 ? (
                        <div>
                          <span className="font-serif font-bold text-gray-900 text-sm">
                            {c.purchase_amount.toLocaleString()} FCFA
                          </span>
                          <span className="block text-[11px] text-emerald-600 font-medium">
                            Payé
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">0 FCFA</span>
                      )}
                    </td>

                    {/* Événement */}
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {c.events && c.events.length > 0 ? (
                        <Link
                          href={`/admin/evenements/${c.events[0].id}`}
                          className="font-semibold text-gray-900 hover:text-[#8f6f33] transition-colors inline-flex items-center gap-1.5 group"
                          title="Voir l'événement complet"
                        >
                          <span>{c.latest_event_name}</span>
                          <Calendar size={13} className="text-[#8f6f33] opacity-70 group-hover:opacity-100" />
                        </Link>
                      ) : (
                        <p className="font-medium text-gray-900">{c.latest_event_name}</p>
                      )}
                      <p className="text-[11px] text-gray-400">{c.events_count} événement(s)</p>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.events && c.events.length > 0 && (
                          <Link
                            href={`/admin/evenements/${c.events[0].id}`}
                            className="text-[#7a5e2b] bg-[#b8924a]/15 hover:bg-[#b8924a]/30 hover:text-black p-2 rounded-xl transition-colors"
                            title="Voir l'événement du client"
                          >
                            <Calendar size={17} />
                          </Link>
                        )}
                        <Link href={`/admin/utilisateurs/${c.id}`} className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-xl transition-colors" title="Voir la fiche détaillée">
                          <Eye size={17} />
                        </Link>
                        <button onClick={() => handleSuspend(c.id, 'actif')} className="text-gray-400 hover:text-orange-500 hover:bg-orange-50 p-2 rounded-xl transition-colors" title="Suspendre le compte">
                          <Ban size={17} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors" title="Supprimer définitivement">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <ShieldAlert size={32} className="mx-auto mb-3 text-gray-300" />
                    Aucun client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
