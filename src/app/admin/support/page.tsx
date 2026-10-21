"use client";

import { useState, useEffect } from "react";
import { LifeBuoy, CheckCircle, Clock, AlertCircle, RefreshCw, Eye, MoreHorizontal } from "lucide-react";
import { getSupportTickets, updateTicketStatus } from "@/app/actions/support";
import { Modal } from "@/components/ui/Modal";
import { useBadgeStore } from "@/store/BadgeStore";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const refreshBadges = useBadgeStore((s) => s.refresh);

  // Modal state
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // Background reloads keep the list on screen; only the first load / the refresh button show the loader
  const fetchTickets = async () => {
    const { data, error } = await getSupportTickets();
    if (!error) {
      setTickets(data);
    } else if (error.includes("n'existe pas encore")) {
      setTickets([]);
    }
    setLoading(false);
  };

  // Load on mount, then reload whenever a new complaint arrives (the pending counter goes up)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch: state is only set once the request resolves
    fetchTickets();
    return useBadgeStore.subscribe((s, prev) => {
      if (s.pendingSupport > prev.pendingSupport) fetchTickets();
    });
  }, []);

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    const result = await updateTicketStatus(ticketId, status);
    if (result.success) {
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
      fetchTickets();
      refreshBadges();
    } else {
      alert("Erreur: " + result.error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'résolu':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
            <CheckCircle size={14} /> Résolu
          </span>
        );
      case 'en attente':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
            <MoreHorizontal size={14} /> En attente
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2 flex items-center gap-2">
            Support & Réclamations <LifeBuoy size={24} className="text-[#b8924a]" />
          </h1>
          <p className="text-gray-500 text-sm">Gérez les demandes d'assistance des organisateurs et prestataires.</p>
        </div>
        <button 
          onClick={() => {
            setLoading(true);
            fetchTickets();
            refreshBadges();
          }}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors text-gray-600"
        >
          <RefreshCw size={16} /> Rafraîchir
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-stack w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Utilisateur</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Date</th>
                <th className="px-6 py-4 font-medium">Sujet & Aperçu</th>
                <th className="px-6 py-4 font-medium text-right whitespace-nowrap">Statut & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Chargement des tickets...</td>
                </tr>
              ) : tickets.length > 0 ? (
                tickets.map((t) => {
                  const profile = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
                  const isResolved = t.status === 'résolu';
                  
                  return (
                    <tr key={t.id} className={`hover:bg-gray-50 transition-colors ${isResolved ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{profile?.full_name || 'Inconnu'}</div>
                        <div className="text-xs text-gray-500">{profile?.role === 'client' ? 'Organisateur' : 'Prestataire'}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(t.created_at).toLocaleDateString()} à {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <div className="font-bold text-gray-900 mb-1">{t.subject}</div>
                        <div className="text-gray-500 truncate">{t.message}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(t.status)}
                          <button 
                            onClick={() => setSelectedTicket({...t, profile})}
                            className="inline-flex items-center gap-1 text-xs text-[#b8924a] hover:text-[#8f6f33] font-medium"
                          >
                            <Eye size={14} /> Voir le message
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <AlertCircle size={32} className="mx-auto mb-3 text-gray-300" />
                    Aucune réclamation ou demande de support pour le moment.
                    <br/><br/>
                    <span className="text-xs text-gray-400">
                      (Note: Assurez-vous d'avoir exécuté le script SQL pour créer la table <code>support_tickets</code>).
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details Modal */}
      <Modal 
        isOpen={selectedTicket !== null} 
        onClose={() => setSelectedTicket(null)} 
        title="Détails de la réclamation"
      >
        {selectedTicket && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{selectedTicket.subject}</h3>
                <p className="text-sm text-gray-500">
                  Par <span className="font-medium text-gray-900">{selectedTicket.profile?.full_name || 'Inconnu'}</span> 
                  {' '}le {new Date(selectedTicket.created_at).toLocaleDateString()} à {new Date(selectedTicket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div>{getStatusBadge(selectedTicket.status)}</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-800 whitespace-pre-wrap text-sm leading-relaxed max-h-64 overflow-y-auto">
              {selectedTicket.message}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Changer le statut :</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'en attente')}
                  disabled={selectedTicket.status === 'en attente' || selectedTicket.status === 'ouvert'}
                  className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-sm font-bold hover:bg-blue-100 disabled:opacity-50 transition-colors"
                >
                  En attente
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'résolu')}
                  disabled={selectedTicket.status === 'résolu'}
                  className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg text-sm font-bold hover:bg-green-100 disabled:opacity-50 transition-colors"
                >
                  Résolu
                </button>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setSelectedTicket(null)} 
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
