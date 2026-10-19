"use client";

import { FileText, Plus, Edit2, Trash2, CheckCircle, Clock, XCircle, Search, Mail, Eye, MessageCircle, Send, Calendar, Users, MapPin, Briefcase, Image as ImageIcon, Paperclip, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DemandViewer from "@/components/prestataire/DemandViewer";
import { useBadgeStore } from "@/store/BadgeStore";

export default function PrestataireDemandesPage() {
  const [demandes, setDemandes] = useState<any[]>([]);
  const [devis, setDevis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"demandes" | "devis">("demandes");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<any>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const parseDescription = (desc: string) => {
    if (!desc) return null;
    if (!desc.includes('===')) return { "MESSAGE": desc };
    
    const sections: Record<string, string> = {};
    const parts = desc.split(/===\s*(.*?)\s*===/g);
    for (let i = 1; i < parts.length; i += 2) {
      sections[parts[i].trim()] = parts[i + 1].trim();
    }
    return sections;
  };

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchData();

    let channel: any;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase.channel('prestataire_demandes_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'demandes_devis', filter: `prestataire_id=eq.${user.id}` }, () => {
          fetchData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'devis', filter: `prestataire_id=eq.${user.id}` }, () => {
          fetchData();
        })
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch Demandes
    const { data: demandesData } = await supabase
      .from('demandes_devis')
      .select('*, events(name, type, date, location, client_id)')
      .eq('prestataire_id', user.id)
      .order('created_at', { ascending: false });

    if (demandesData) {
      setDemandes(demandesData);
    }

    // Fetch Devis (réels)
    const { data: devisData } = await supabase
      .from('devis')
      .select('*, demandes_devis(service_name, client_name, event_type, event_date), events(name)')
      .eq('prestataire_id', user.id)
      .order('created_at', { ascending: false });

    if (devisData) {
      setDevis(devisData);
    }

    setLoading(false);
    // Requests opened / answered / refused: update the menu badge
    useBadgeStore.getState().refresh();
  };

  const [isAccepting, setIsAccepting] = useState(false);

  const handleAcceptDemande = async (demande: any) => {
    if (!demande) return;
    if (!confirm(`Confirmer et accepter cette prestation pour ${demande.client_name || 'le client'} ?`)) return;

    setIsAccepting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAccepting(false);
      return;
    }

    // 1. Mettre à jour la demande en 'Confirmé'
    await supabase.from('demandes_devis').update({ status: 'Confirmé' }).eq('id', demande.id);

    // 2. Déterminer le montant
    const amount = Number(demande.budget_propose || demande.budget_indicatif || 0);

    // 3. Mettre à jour ou créer un devis lié en 'Accepté'
    const { data: existingDevis } = await supabase
      .from('devis')
      .select('id, total')
      .eq('demande_id', demande.id)
      .maybeSingle();

    let finalTotal = amount;
    if (existingDevis) {
      finalTotal = Number(existingDevis.total || amount);
      await supabase.from('devis').update({
        status: 'Accepté',
        accepted_at: new Date().toISOString()
      }).eq('id', existingDevis.id);
    } else if (amount > 0) {
      await supabase.from('devis').insert({
        demande_id: demande.id,
        event_id: demande.event_id || null,
        prestataire_id: user.id,
        client_id: demande.client_id || null,
        client_name: demande.client_name || 'Client',
        total: amount,
        status: 'Accepté',
        accepted_at: new Date().toISOString()
      });
    }

    // 4. Ajouter automatiquement l'événement au planning du prestataire
    const eventDate = demande.event_date || demande.events?.date;
    const eventName = demande.events?.name || demande.event_type || 'Prestation Evenium';
    if (eventDate) {
      const planningTitle = demande.event_time 
        ? `[${demande.event_time}] Prestation Evenium - ${eventName}`
        : `Prestation Evenium - ${eventName}`;

      const { data: existingPlanning } = await supabase
        .from('provider_events')
        .select('id')
        .eq('prestataire_id', user.id)
        .eq('date', eventDate)
        .ilike('title', `%${eventName}%`)
        .maybeSingle();

      if (!existingPlanning) {
        await supabase.from('provider_events').insert({
          prestataire_id: user.id,
          title: planningTitle,
          type: 'evenement',
          date: eventDate
        });
      }
    }

    // 5. Enregistrer le flux financier (revenu prestataire sans commission)
    if (finalTotal > 0) {
      await supabase.from('transactions').insert({
        prestataire_id: user.id,
        event_id: demande.event_id || null,
        description: `Prestation confirmée - ${eventName}`,
        montant: finalTotal,
        type: 'revenu',
        categorie: 'Prestation',
        status: 'Validé',
        date: new Date().toISOString()
      });
    }

    // 6. Notifier le client dans la messagerie avec message personnalisé selon le correspondant
    if (demande.client_id) {
      const { data: clientProf } = await supabase.from('profiles').select('full_name').eq('id', demande.client_id).single();
      const clientName = clientProf?.full_name || "Client";
      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: demande.client_id,
        content: `Bonjour ${clientName},\n\nJ'ai le plaisir de vous confirmer la prise en charge de votre événement « ${eventName} » pour le ${eventDate || 'la date convenue'}.\n\nVos préparatifs sont bien enregistrés dans mon agenda. Je reste à votre entière disposition pour échanger sur la suite !`
      });
    }

    setIsAccepting(false);
    setIsViewModalOpen(false);
    fetchData();
  };

  const handleRefuse = async (demandeId: string) => {
    if (confirm("Êtes-vous sûr de vouloir refuser cette demande de devis ?")) {
      const { error } = await supabase.from('demandes_devis').update({ status: 'Refusé' }).eq('id', demandeId);
      if (!error) fetchData();
    }
  };

  const handleDeleteDemande = async (demandeId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette demande ?")) {
      const { error } = await supabase.from('demandes_devis').delete().eq('id', demandeId);
      if (error) {
        alert("Impossible de supprimer : " + error.message);
      } else {
        fetchData();
        setIsViewModalOpen(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Nouvelle': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Nouvelle</span>;
      case 'À traiter': return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">À traiter</span>;
      case 'Devis en préparation': return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">En préparation</span>;
      case 'Devis envoyé': return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Envoyé</span>;
      case 'Révision demandée': return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-bold inline-flex items-center gap-1">🔄 Révision demandée</span>;
      case 'En cours de révision': return <span className="px-2.5 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded-full text-xs font-bold inline-flex items-center gap-1">⚙️ En cours de révision</span>;
      case 'Nouvelle version envoyée': return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-full text-xs font-bold inline-flex items-center gap-1">✨ Nouvelle version</span>;
      case 'Refusé': return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Refusé</span>;
      case 'Annulé par le client': return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">Annulé</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{status || 'En attente'}</span>;
    }
  };

  const getDevisStatusBadge = (status: string) => {
    switch (status) {
      case 'Brouillon': return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">Brouillon</span>;
      case 'En attente de validation': return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">En attente</span>;
      case 'Révision demandée': return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-bold inline-flex items-center gap-1">🔄 Révision demandée</span>;
      case 'En cours de révision': return <span className="px-2.5 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded-full text-xs font-bold inline-flex items-center gap-1">⚙️ En cours</span>;
      case 'Nouvelle version envoyée': return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-full text-xs font-bold inline-flex items-center gap-1">✨ v. révisée</span>;
      case 'Modification demandée': return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">Modification</span>;
      case 'Accepté': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">Accepté</span>;
      case 'Refusé': return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Refusé</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{status || 'Brouillon'}</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Demandes & Devis</h1>
          <p className="text-gray-500">Gérez vos demandes entrantes et vos devis émis.</p>
        </div>
      </div>

      <div className="flex space-x-4 mb-6 border-b">
        <button
          className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "demandes" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"
          }`}
          onClick={() => setActiveTab("demandes")}
        >
          Demandes reçues ({demandes.length})
        </button>
        <button
          className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "devis" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"
          }`}
          onClick={() => setActiveTab("devis")}
        >
          Devis émis ({devis.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Chargement...</div>
      ) : activeTab === "demandes" ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {demandes.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>Aucune demande de devis reçue pour le moment.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium">Client & Événement</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Service demandé</th>
                  <th className="p-4 font-medium">Budget indicatif</th>
                  <th className="p-4 font-medium">Statut</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {demandes.map((demande) => (
                  <tr key={demande.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{demande.client_name || demande.events?.profiles?.full_name || 'Client Inconnu'}</div>
                      <div className="text-xs text-gray-500">{demande.event_type || demande.events?.type || 'Événement'}</div>
                    </td>
                    <td className="p-4 text-gray-600">
                      <div>{demande.event_date || 'Date non précisée'}</div>
                      <div className="text-xs">{demande.event_location || ''}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{demande.service_name || 'Non spécifié'}</div>
                      <div className="text-xs text-gray-500">Qte: {demande.needs_quantity || 1}</div>
                    </td>
                    <td className="p-4 font-medium text-[#b8924a]">
                      {demande.budget_indicatif ? `${demande.budget_indicatif.toLocaleString()} FCFA` : 'Non renseigné'}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(demande.status)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedDemande(demande);
                          setIsViewModalOpen(true);
                          if(demande.status === 'Nouvelle') {
                            supabase.from('demandes_devis').update({ status: 'À traiter' }).eq('id', demande.id).then(() => fetchData());
                          }
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors inline-block"
                        title="Voir la demande"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {devis.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>Vous n'avez pas encore émis de devis.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium">N° Devis</th>
                  <th className="p-4 font-medium">Client / Demande</th>
                  <th className="p-4 font-medium">Date d'émission</th>
                  <th className="p-4 font-medium">Montant Total</th>
                  <th className="p-4 font-medium">Statut</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {devis.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-mono font-medium text-gray-900">
                      {d.reference || `DEV-${d.id.substring(0,8).toUpperCase()}`}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{d.demandes_devis?.client_name || 'Client Inconnu'}</div>
                      <div className="text-xs text-gray-500">{d.demandes_devis?.service_name || ''}</div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {d.date_emission ? new Date(d.date_emission).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4 font-medium text-black">
                      {d.total?.toLocaleString()} FCFA
                    </td>
                    <td className="p-4">
                      {getDevisStatusBadge(d.is_draft ? 'Brouillon' : d.status)}
                    </td>
                    <td className="p-4 text-right">
                      {d.status === 'Révision demandée' ? (
                        <Link
                          href={`/prestataire/devis/${d.id}/edit`}
                          className="px-3 py-1.5 bg-[#8f6f33] text-white rounded-lg hover:bg-[#725725] transition-colors inline-flex items-center gap-1.5 text-xs font-bold shadow-xs"
                          title="Traiter la révision"
                        >
                          <Edit2 size={14} />
                          <span>Réviser</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/prestataire/devis/${d.id}/edit`}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors inline-block"
                          title="Gérer le devis"
                        >
                          <Edit2 size={18} />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal View Demande */}
      {isViewModalOpen && selectedDemande && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] md:h-[90vh] flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto md:overflow-hidden relative">
            
            {/* Colonne de gauche : Contexte (Client & Événement) */}
            <div className="w-full md:w-1/3 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col shrink-0 md:h-full md:overflow-y-auto hide-scrollbar">
              <div className="p-8 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  {getStatusBadge(selectedDemande.status)}
                  <button onClick={() => setIsViewModalOpen(false)} className="md:hidden text-gray-400 hover:text-black bg-white rounded-full p-1 shadow-sm">
                    <XCircle size={24} />
                  </button>
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 leading-tight">
                  Demande de devis
                </h2>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                  <Clock size={14} /> Reçue le {new Date(selectedDemande.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="p-8 space-y-8 flex-1">
                {/* Informations Client */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2"><Users size={16} className="text-[#b8924a]"/> Client</h3>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Nom complet</p>
                      <p className="font-bold text-gray-900">{selectedDemande.client_name || selectedDemande.events?.profiles?.full_name}</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">Téléphone</p>
                        <p className="font-medium text-sm text-gray-700">{selectedDemande.client_phone || '---'}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">WhatsApp</p>
                        <p className="font-medium text-sm text-gray-700">{selectedDemande.client_whatsapp || '---'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">E-mail</p>
                      <p className="font-medium text-sm text-gray-700 break-all">{selectedDemande.client_email || '---'}</p>
                    </div>
                  </div>
                </div>

                {/* Informations Événement */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2"><Calendar size={16} className="text-[#b8924a]"/> Événement</h3>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">Type</p>
                        <p className="font-bold text-gray-900">{selectedDemande.event_type || selectedDemande.events?.type}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">Invités</p>
                        <p className="font-bold text-gray-900">{selectedDemande.event_guests} pers.</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Date et Heure</p>
                      <p className="font-medium text-sm text-gray-700">{selectedDemande.event_date} à {selectedDemande.event_time}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Lieu</p>
                      <p className="font-medium text-sm text-gray-700 flex items-start gap-1">
                        <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                        {selectedDemande.event_location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Colonne de droite : Détails techniques du besoin */}
            <div className="w-full md:w-2/3 bg-white flex flex-col shrink-0 md:h-full relative">
              <div className="absolute top-6 right-6 hidden md:block z-10">
                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-8 md:p-10 flex-1 min-h-0 md:overflow-y-auto hide-scrollbar">
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                  Détails du besoin
                </h3>

                {/* Bannière alerte révision si la demande ou le devis lié a une révision */}
                {(selectedDemande.status === 'Révision demandée' || selectedDemande.status === 'En cours de révision') && (
                  <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl flex items-start gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-[#8f6f33] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <RefreshCw size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                          {selectedDemande.status}
                        </span>
                        {devis.find(d => (selectedDemande?.id && d.demande_id === selectedDemande.id) || (selectedDemande?.event_id && d.event_id === selectedDemande.event_id))?.reference && (
                          <span className="text-xs text-stone-600 font-mono font-bold">
                            Devis {devis.find(d => (selectedDemande?.id && d.demande_id === selectedDemande.id) || (selectedDemande?.event_id && d.event_id === selectedDemande.event_id))?.reference}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-stone-900 mt-2">
                        L'organisateur a formulé une demande d'ajustement pour ce devis.
                      </p>
                      <p className="text-xs text-stone-600 mt-1">
                        Consultez la messagerie pour le motif et le budget souhaité, puis transmettez une nouvelle version révisée.
                      </p>
                    </div>
                  </div>
                )}

              {/* Demande Restructurée - Composant Générique */}
              <DemandViewer demande={selectedDemande} />
            </div>

            {/* Actions Footer */}
            <div className="p-6 md:px-10 border-t bg-white flex flex-col sm:flex-row gap-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] sticky bottom-0 md:relative z-20">
              {(selectedDemande.status === 'Nouvelle' || selectedDemande.status === 'À traiter') && (
                <>
                  <button onClick={() => handleRefuse(selectedDemande.id)} className="px-5 py-3.5 bg-white border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    Décliner
                  </button>
                  <button 
                    onClick={() => handleAcceptDemande(selectedDemande)} 
                    disabled={isAccepting}
                    className="px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle size={18} /> {isAccepting ? 'Confirmation...' : 'Accepter la prestation'}
                  </button>
                  <Link 
                    href={`/prestataire/devis/builder/${selectedDemande.id}`}
                    className="flex-1 text-center py-3.5 bg-[#b8924a] text-white font-bold rounded-xl hover:bg-[#a17f3e] hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl hover:shadow-[#b8924a]/20 flex items-center justify-center gap-2"
                  >
                    <Briefcase size={18} /> Établir ma proposition de devis
                  </Link>
                </>
              )}
              {(selectedDemande.status === 'Révision demandée' || selectedDemande.status === 'En cours de révision') && (() => {
                const linkedDev = devis.find(d => (selectedDemande?.id && d.demande_id === selectedDemande.id) || (selectedDemande?.event_id && d.event_id === selectedDemande.event_id));
                return (
                  <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    {linkedDev ? (
                      <Link 
                        href={`/prestataire/devis/${linkedDev.id}/edit`}
                        className="flex-1 py-3.5 bg-[#8f6f33] text-white font-bold rounded-xl hover:bg-[#725725] transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Edit2 size={18} /> Modifier et transmettre une nouvelle version
                      </Link>
                    ) : (
                      <Link 
                        href={`/prestataire/devis/builder/${selectedDemande.id}`}
                        className="flex-1 py-3.5 bg-[#8f6f33] text-white font-bold rounded-xl hover:bg-[#725725] transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Briefcase size={18} /> Établir un devis révisé
                      </Link>
                    )}
                    <Link
                      href="/dashboard/messages"
                      className="px-5 py-3.5 bg-stone-100 text-stone-800 font-bold rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} /> Ouvrir la messagerie
                    </Link>
                  </div>
                );
              })()}
              {selectedDemande.status === 'Refusé' && (
                <button onClick={() => handleDeleteDemande(selectedDemande.id)} className="w-full py-3.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                  <Trash2 size={18}/> Supprimer définitivement cette demande
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Lightbox pour les images d'inspiration */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setLightboxImage(null)}>
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
          >
            <XCircle size={32} />
          </button>

          <img 
            src={lightboxImage} 
            alt="Inspiration" 
            className="max-w-[90vw] max-h-[90vh] object-contain select-none shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
