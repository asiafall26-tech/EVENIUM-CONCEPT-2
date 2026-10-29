"use client";

import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search, 
  Mail, 
  Eye, 
  MessageCircle, 
  Send, 
  Calendar, 
  Users, 
  MapPin, 
  Briefcase, 
  Image as ImageIcon, 
  Paperclip, 
  RefreshCw,
  FolderOpen,
  Phone,
  MessageSquare,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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
  const [activeTab, setActiveTab] = useState<"demandes" | "devis" | "dossiers">("demandes");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<any>(null);

  // Mode Ajustement / Contre-proposition
  const [isAdjustMode, setIsAdjustMode] = useState(false);
  const [adjustPrice, setAdjustPrice] = useState("");
  const [adjustNotes, setAdjustNotes] = useState("");
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

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

    // 1. Fetch Demandes avec fallback sûr
    let demandesList: any[] = [];
    const { data: dData, error: dErr } = await supabase
      .from('demandes_devis')
      .select('*, events(name, type, date, location, client_id)')
      .eq('prestataire_id', user.id)
      .order('created_at', { ascending: false });

    if (!dErr && dData) {
      demandesList = dData;
    } else {
      // Fallback sans join si erreur de relation
      const { data: dFallback } = await supabase
        .from('demandes_devis')
        .select('*')
        .eq('prestataire_id', user.id)
        .order('created_at', { ascending: false });
      if (dFallback) demandesList = dFallback;
    }
    setDemandes(demandesList);

    // 2. Fetch Devis émis
    let devisList: any[] = [];
    const { data: devData, error: devErr } = await supabase
      .from('devis')
      .select('*, demandes_devis(service_name, client_name, event_type, event_date), events(name)')
      .eq('prestataire_id', user.id)
      .order('created_at', { ascending: false });

    if (!devErr && devData) {
      devisList = devData;
    } else {
      const { data: devFallback } = await supabase
        .from('devis')
        .select('*')
        .eq('prestataire_id', user.id)
        .order('created_at', { ascending: false });
      if (devFallback) devisList = devFallback;
    }
    setDevis(devisList);

    setLoading(false);
    useBadgeStore.getState().refresh();
  };

  const [isAccepting, setIsAccepting] = useState(false);

  // Accepter une demande
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
      .select('id, reference, total')
      .eq('demande_id', demande.id)
      .maybeSingle();

    let finalTotal = amount;
    let devisRef = "";

    if (existingDevis) {
      finalTotal = Number(existingDevis.total || amount);
      devisRef = existingDevis.reference || `DEV-${existingDevis.id.substring(0, 8).toUpperCase()}`;
      await supabase.from('devis').update({
        status: 'Accepté',
        accepted_at: new Date().toISOString()
      }).eq('id', existingDevis.id);
    } else if (amount > 0) {
      const newRef = `DEV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      devisRef = newRef;
      await supabase.from('devis').insert({
        reference: newRef,
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

    // 5. Enregistrer le flux financier
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

    // 6. Message officiel dans la messagerie avec authentification des interlocuteurs
    const targetClientId = demande.client_id || demande.events?.client_id;
    if (targetClientId) {
      let clientName = demande.client_name;
      if (!clientName) {
        const { data: clientProf } = await supabase.from('profiles').select('full_name').eq('id', targetClientId).maybeSingle();
        clientName = clientProf?.full_name || "Client";
      }

      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: targetClientId,
        event_id: demande.event_id || null,
        content: `Bonjour ${clientName},\n\nJ'ai le plaisir de vous confirmer la prise en charge de votre événement « ${eventName} » pour le ${eventDate || 'la date convenue'}.\n\nDevis N° ${devisRef || 'validé'} enregistré pour un montant de ${finalTotal.toLocaleString('fr-FR')} FCFA.\nTous les préparatifs sont confirmés. Notre fil de discussion reste ouvert ici pour organiser les détails pratiques !`
      });
    }

    setIsAccepting(false);
    setIsViewModalOpen(false);
    fetchData();
  };

  // Envoyer une contre-proposition / ajustement
  const handleSendAdjustment = async () => {
    if (!selectedDemande) return;
    const priceNum = Number(adjustPrice);
    if (!priceNum || priceNum <= 0) {
      alert("Veuillez saisir un montant proposé supérieur à 0.");
      return;
    }

    setIsSubmittingAdjust(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const targetClientId = selectedDemande.client_id || selectedDemande.events?.client_id;
      const eventName = selectedDemande.events?.name || selectedDemande.event_type || "votre événement";

      // 1. Mettre à jour la demande
      const updatedNotes = selectedDemande.needs_description 
        ? `${selectedDemande.needs_description}\n\n=== CONTRE-PROPOSITION DU PRESTATAIRE ===\nBudget proposé : ${priceNum.toLocaleString('fr-FR')} FCFA\nRemarques : ${adjustNotes || 'Proposition ajustée'}`
        : `=== CONTRE-PROPOSITION DU PRESTATAIRE ===\nBudget proposé : ${priceNum.toLocaleString('fr-FR')} FCFA\nRemarques : ${adjustNotes || 'Proposition ajustée'}`;

      await supabase.from('demandes_devis').update({
        budget_propose: priceNum,
        needs_description: updatedNotes,
        status: 'Devis en préparation'
      }).eq('id', selectedDemande.id);

      // 2. Notifier l'organisateur dans la messagerie
      if (targetClientId) {
        await supabase.from('messages').insert({
          sender_id: user.id,
          receiver_id: targetClientId,
          event_id: selectedDemande.event_id || null,
          content: `Bonjour,\n\nConcernant votre demande de devis pour « ${selectedDemande.service_name} » (${eventName}) :\n\nJe vous propose un ajustement avec une offre tarifaire de ${priceNum.toLocaleString('fr-FR')} FCFA.` +
            (adjustNotes ? `\n\nDétails de l'ajustement :\n${adjustNotes}` : "") +
            `\n\nN'hésitez pas à me faire part de vos retours ou à me poser des questions.`
        });
      }

      alert("Votre contre-proposition a bien été transmise à l'organisateur !");
      setIsAdjustMode(false);
      setIsViewModalOpen(false);
      setAdjustPrice("");
      setAdjustNotes("");
      fetchData();
    } catch (err: any) {
      alert("Erreur lors de l'envoi de la contre-proposition : " + (err?.message || err));
    } finally {
      setIsSubmittingAdjust(false);
    }
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
      case 'Confirmé': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">Confirmé</span>;
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
      case 'Révision demandée': return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-bold inline-flex items-center gap-1">🔄 Révision</span>;
      case 'En cours de révision': return <span className="px-2.5 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded-full text-xs font-bold inline-flex items-center gap-1">⚙️ En cours</span>;
      case 'Nouvelle version envoyée': return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-full text-xs font-bold inline-flex items-center gap-1">✨ v. révisée</span>;
      case 'Accepté': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">Accepté</span>;
      case 'Refusé': return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Refusé</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{status || 'Brouillon'}</span>;
    }
  };

  // Groupement par "Dossier Client"
  const clientFolders = useMemo(() => {
    const map = new Map<string, {
      id: string;
      name: string;
      phone: string;
      whatsapp: string;
      email: string;
      demandes: any[];
      devis: any[];
      events: any[];
      totalAmount: number;
    }>();

    // 1. Ajouter depuis les demandes
    demandes.forEach(d => {
      const key = d.client_id || d.client_email || d.client_name || `client-${d.id}`;
      if (!map.has(key)) {
        map.set(key, {
          id: d.client_id || key,
          name: d.client_name || d.events?.profiles?.full_name || "Client",
          phone: d.client_phone || "",
          whatsapp: d.client_whatsapp || "",
          email: d.client_email || "",
          demandes: [],
          devis: [],
          events: [],
          totalAmount: 0
        });
      }
      const folder = map.get(key)!;
      folder.demandes.push(d);
      if (d.events && !folder.events.some(e => e.id === d.events.id)) {
        folder.events.push(d.events);
      }
    });

    // 2. Ajouter depuis les devis
    devis.forEach(dev => {
      const key = dev.client_id || dev.demandes_devis?.client_name || `client-${dev.id}`;
      if (!map.has(key)) {
        map.set(key, {
          id: dev.client_id || key,
          name: dev.demandes_devis?.client_name || dev.client_name || "Client",
          phone: "",
          whatsapp: "",
          email: "",
          demandes: [],
          devis: [],
          events: [],
          totalAmount: 0
        });
      }
      const folder = map.get(key)!;
      folder.devis.push(dev);
      folder.totalAmount += Number(dev.total || 0);
      if (dev.events && !folder.events.some(e => e.id === dev.events.id)) {
        folder.events.push(dev.events);
      }
    });

    return Array.from(map.values());
  }, [demandes, devis]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#b8924a] flex items-center gap-1.5 mb-1">
            <Sparkles size={14} /> Espace Commercial
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-black">
            Demandes & Dossiers Clients
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Centralisez vos demandes entrantes, vos propositions de devis et vos dossiers clients.
          </p>
        </div>
      </div>

      {/* Onglets principaux */}
      <div className="flex space-x-2 sm:space-x-4 border-b border-gray-200 overflow-x-auto no-scrollbar">
        <button
          className={`pb-3.5 px-3 font-bold text-xs sm:text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === "demandes" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"
          }`}
          onClick={() => setActiveTab("demandes")}
        >
          <Clock size={16} /> Demandes reçues ({demandes.length})
        </button>
        <button
          className={`pb-3.5 px-3 font-bold text-xs sm:text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === "devis" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"
          }`}
          onClick={() => setActiveTab("devis")}
        >
          <FileText size={16} /> Devis émis ({devis.length})
        </button>
        <button
          className={`pb-3.5 px-3 font-bold text-xs sm:text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === "dossiers" ? "border-[#b8924a] text-[#8f6f33]" : "border-transparent text-gray-400 hover:text-black"
          }`}
          onClick={() => setActiveTab("dossiers")}
        >
          <FolderOpen size={16} /> Dossiers par client ({clientFolders.length})
        </button>
      </div>

      {/* Contenu de l'onglet */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Chargement...</div>
      ) : activeTab === "demandes" ? (
        /* ONGLET DEMANDES */
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          {demandes.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>Aucune demande de devis reçue pour le moment.</p>
            </div>
          ) : (
            <>
            <ul className="md:hidden divide-y divide-gray-100">
              {demandes.map((demande) => (
                <li key={demande.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDemande(demande);
                      setIsAdjustMode(false);
                      setIsViewModalOpen(true);
                      if (demande.status === 'Nouvelle') {
                        supabase.from('demandes_devis').update({ status: 'À traiter' }).eq('id', demande.id).then(() => fetchData());
                      }
                    }}
                    className="w-full text-left px-4 py-4 flex items-start gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 truncate">{demande.client_name || demande.events?.profiles?.full_name || 'Client Inconnu'}</p>
                        {getStatusBadge(demande.status)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {demande.event_type || demande.events?.type || 'Événement'} · {demande.event_date || 'Date non précisée'}
                        {demande.event_location ? ` · ${demande.event_location}` : ''}
                      </p>
                      <p className="text-sm text-gray-800 mt-1.5">
                        {demande.service_name || 'Service non spécifié'}
                        <span className="text-[#8f6f33] font-semibold">
                          {demande.budget_indicatif ? ` · ${Number(demande.budget_indicatif).toLocaleString()} FCFA` : ''}
                        </span>
                      </p>
                    </div>
                    <Eye size={18} className="shrink-0 mt-1 text-gray-400" />
                  </button>
                </li>
              ))}
            </ul>
            <table className="hidden md:table w-full min-w-[680px] text-left border-collapse">
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
                      {demande.budget_indicatif ? `${Number(demande.budget_indicatif).toLocaleString()} FCFA` : 'Non renseigné'}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(demande.status)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedDemande(demande);
                          setIsAdjustMode(false);
                          setIsViewModalOpen(true);
                          if(demande.status === 'Nouvelle') {
                            supabase.from('demandes_devis').update({ status: 'À traiter' }).eq('id', demande.id).then(() => fetchData());
                          }
                        }}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-[#b8924a] hover:text-white rounded-xl text-stone-700 font-bold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Voir la demande"
                      >
                        <Eye size={15} /> Voir détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </>
          )}
        </div>
      ) : activeTab === "devis" ? (
        /* ONGLET DEVIS ÉMIS */
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          {devis.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>Vous n&apos;avez pas encore émis de devis.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-4 font-medium">N° Devis</th>
                    <th className="p-4 font-medium">Client / Demande</th>
                    <th className="p-4 font-medium">Date d&apos;émission</th>
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
                        <div className="font-bold text-gray-900">{d.demandes_devis?.client_name || d.client_name || 'Client Inconnu'}</div>
                        <div className="text-xs text-gray-500">{d.demandes_devis?.service_name || ''}</div>
                      </td>
                      <td className="p-4 text-gray-600">
                        {d.date_emission ? new Date(d.date_emission).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-4 font-bold text-black">
                        {Number(d.total || 0).toLocaleString()} FCFA
                      </td>
                      <td className="p-4">
                        {getDevisStatusBadge(d.is_draft ? 'Brouillon' : d.status)}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/prestataire/devis/${d.id}/edit`}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl transition-colors inline-flex items-center gap-1.5 text-xs font-bold shadow-xs"
                          title="Gérer le devis"
                        >
                          <Edit2 size={13} /> Gérer
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* NOUVEL ONGLET : DOSSIERS PAR CLIENT */
        <div className="space-y-6">
          <div className="bg-[#faf8f5] p-5 rounded-2xl border border-[#e4d8c4] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderOpen size={24} className="text-[#8f6f33]" />
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-lg">Dossiers Clients Evenium</h3>
                <p className="text-xs text-stone-500">Toutes les demandes, événements et devis regroupés par client pour une gestion optimale sans se perdre.</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-white text-stone-800 rounded-full border border-stone-200">
              {clientFolders.length} client{clientFolders.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clientFolders.map((folder) => (
              <div key={folder.id} className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                
                {/* Header du dossier */}
                <div>
                  <div className="flex items-start justify-between pb-4 border-b border-stone-100">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white flex items-center justify-center font-bold text-base shadow-xs">
                        {folder.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-lg text-stone-900">{folder.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5 flex-wrap">
                          {folder.phone && <a href={`tel:${folder.phone}`} className="flex items-center gap-1 hover:text-[#b8924a]"><Phone size={12} /> {folder.phone}</a>}
                          {folder.whatsapp && <a href={`https://wa.me/${folder.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-emerald-600 font-medium hover:underline">WA: {folder.whatsapp}</a>}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f5eee1] text-[#8f6f33]">
                      {folder.demandes.length} demande{folder.demandes.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Événements associés */}
                  {folder.events.length > 0 && (
                    <div className="mt-4 bg-stone-50 p-3.5 rounded-2xl border border-stone-100 text-xs">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider mb-1">
                        Événement{folder.events.length > 1 ? "s" : ""} concerné{folder.events.length > 1 ? "s" : ""}
                      </span>
                      {folder.events.map((ev, i) => (
                        <div key={i} className="font-semibold text-stone-800 flex items-center justify-between">
                          <span>{ev.name || ev.type}</span>
                          <span className="text-stone-400 font-normal">{ev.date || "Date à convenir"}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Devis rattachés à ce client */}
                  <div className="mt-4 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                      Devis & Propositions ({folder.devis.length})
                    </span>
                    {folder.devis.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">Aucun devis formel émis pour le moment.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {folder.devis.map((d) => (
                          <div key={d.id} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50/70 border border-stone-100 text-xs">
                            <div>
                              <span className="font-mono font-bold text-stone-900">{d.reference || `DEV-${d.id.substring(0,6)}`}</span>
                              <span className="text-stone-400 ml-2">{d.demandes_devis?.service_name || "Prestation"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900">{Number(d.total || 0).toLocaleString()} FCFA</span>
                              {getDevisStatusBadge(d.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer du dossier */}
                <div className="pt-5 mt-6 border-t border-stone-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 font-bold block">Volume Total Devis</span>
                    <span className="font-serif font-bold text-stone-900 text-lg">
                      {folder.totalAmount.toLocaleString()} FCFA
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {folder.id && folder.id.length > 15 && (
                      <Link
                        href={`/prestataire/messages`}
                        className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <MessageSquare size={14} /> Messages
                      </Link>
                    )}
                    {folder.demandes.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedDemande(folder.demandes[0]);
                          setIsAdjustMode(false);
                          setIsViewModalOpen(true);
                        }}
                        className="px-4 py-2 bg-[#b8924a] hover:bg-[#a07c39] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye size={14} /> Voir dossier
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal View Demande & Ajustement */}
      {isViewModalOpen && selectedDemande && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-3xl w-full max-w-6xl h-dvh sm:h-auto max-h-dvh sm:max-h-[90vh] md:h-[90vh] flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto md:overflow-hidden relative">
            
            {/* Colonne de gauche : Contexte Client & Événement */}
            <div className="w-full md:w-1/3 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col shrink-0 md:h-full md:overflow-y-auto hide-scrollbar">
              <div className="p-4 sm:p-6 lg:p-8 pb-6 border-b border-gray-200">
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

              <div className="p-4 sm:p-6 lg:p-8 space-y-8 flex-1">
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
                        <p className="font-bold text-gray-900">{selectedDemande.event_guests || selectedDemande.events?.guestsCount || "---"} pers.</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Date et Heure</p>
                      <p className="font-medium text-sm text-gray-700">{selectedDemande.event_date || selectedDemande.events?.date} {selectedDemande.event_time ? `à ${selectedDemande.event_time}` : ''}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Lieu</p>
                      <p className="font-medium text-sm text-gray-700 flex items-start gap-1">
                        <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                        {selectedDemande.event_location || selectedDemande.events?.location || "Non précisé"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Colonne de droite : Détails techniques & Contre-proposition */}
            <div className="w-full md:w-2/3 bg-white flex flex-col shrink-0 md:h-full relative">
              <div className="absolute top-6 right-6 hidden md:block z-10">
                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-8 md:p-10 flex-1 min-h-0 md:overflow-y-auto hide-scrollbar space-y-6">
                
                {/* Formulaire Contre-proposition / Ajustement (SI ACTIF) */}
                {isAdjustMode && (
                  <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-3xl border-2 border-amber-300 shadow-sm animate-in fade-in duration-300 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-lg text-amber-950 flex items-center gap-2">
                        <RefreshCw size={18} className="text-[#8f6f33]" /> Formuler des ajustements / Contre-proposition
                      </h4>
                      <button
                        onClick={() => setIsAdjustMode(false)}
                        className="text-xs font-bold text-stone-500 hover:text-black cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Proposez un tarif adapté, des conditions révisées ou un ajustement sur les prestations demandées. L&apos;organisateur sera directement notifié.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                          Montant proposé ajusté (FCFA) *
                        </label>
                        <input
                          type="number"
                          value={adjustPrice}
                          onChange={(e) => setAdjustPrice(e.target.value)}
                          placeholder="Ex: 450000"
                          className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-[#b8924a] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                          Éditeur complet
                        </label>
                        <Link
                          href={`/prestataire/devis/builder/${selectedDemande.id}`}
                          className="w-full px-4 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
                        >
                          <Briefcase size={14} /> Ouvrir l&apos;éditeur de devis complet
                        </Link>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Détails & explications des ajustements
                      </label>
                      <textarea
                        value={adjustNotes}
                        onChange={(e) => setAdjustNotes(e.target.value)}
                        placeholder="Ex: Ce tarif inclut 2 personnes de service en plus et le matériel de buffet, avec une prestation étendue jusqu'à 02h..."
                        className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs text-stone-900 focus:ring-2 focus:ring-[#b8924a] outline-none min-h-[90px] resize-y"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => setIsAdjustMode(false)}
                        className="px-4 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-50 cursor-pointer"
                      >
                        Fermer
                      </button>
                      <button
                        onClick={handleSendAdjustment}
                        disabled={isSubmittingAdjust}
                        className="px-6 py-2.5 bg-[#8f6f33] hover:bg-[#725725] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingAdjust ? <Clock size={15} className="animate-spin" /> : <Send size={15} />}
                        Transmettre ma contre-proposition
                      </button>
                    </div>
                  </div>
                )}

                {/* Composant DemandViewer restructuré */}
                <DemandViewer demande={selectedDemande} />
              </div>

              {/* Actions Footer */}
              <div className="p-6 md:px-10 border-t bg-white flex flex-col sm:flex-row gap-3 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] sticky bottom-0 md:relative z-20">
                {(selectedDemande.status === 'Nouvelle' || selectedDemande.status === 'À traiter' || selectedDemande.status === 'Devis en préparation') && (
                  <>
                    <button 
                      onClick={() => handleRefuse(selectedDemande.id)} 
                      className="px-4 py-3 bg-white border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      Décliner
                    </button>
                    
                    {/* Bouton Proposer des ajustements */}
                    <button
                      onClick={() => {
                        setAdjustPrice(String(selectedDemande.budget_propose || selectedDemande.budget_indicatif || ""));
                        setIsAdjustMode(true);
                      }}
                      className="px-4 py-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      <RefreshCw size={15} className="text-[#8f6f33]" /> Proposer un ajustement
                    </button>

                    <button 
                      onClick={() => handleAcceptDemande(selectedDemande)} 
                      disabled={isAccepting}
                      className="px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 text-xs"
                    >
                      <CheckCircle size={16} /> {isAccepting ? 'Confirmation...' : 'Accepter la prestation'}
                    </button>
                    
                    <Link 
                      href={`/prestataire/devis/builder/${selectedDemande.id}`}
                      className="flex-1 text-center py-3 bg-[#b8924a] text-white font-bold rounded-xl hover:bg-[#a17f3e] transition-all shadow-md flex items-center justify-center gap-2 text-xs"
                    >
                      <Briefcase size={16} /> Établir devis complet
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
                          className="flex-1 py-3 bg-[#8f6f33] text-white font-bold rounded-xl hover:bg-[#725725] transition-all flex items-center justify-center gap-2 shadow-lg text-xs"
                        >
                          <Edit2 size={16} /> Modifier et transmettre une nouvelle version
                        </Link>
                      ) : (
                        <Link 
                          href={`/prestataire/devis/builder/${selectedDemande.id}`}
                          className="flex-1 py-3 bg-[#8f6f33] text-white font-bold rounded-xl hover:bg-[#725725] transition-all flex items-center justify-center gap-2 shadow-lg text-xs"
                        >
                          <Briefcase size={16} /> Établir un devis révisé
                        </Link>
                      )}
                      <Link
                        href="/prestataire/messages"
                        className="px-4 py-3 bg-stone-100 text-stone-800 font-bold rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center gap-2 text-xs"
                      >
                        <MessageCircle size={16} /> Ouvrir la messagerie
                      </Link>
                    </div>
                  );
                })()}

                {selectedDemande.status === 'Refusé' && (
                  <button onClick={() => handleDeleteDemande(selectedDemande.id)} className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-xs">
                    <Trash2 size={16}/> Supprimer définitivement cette demande
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
