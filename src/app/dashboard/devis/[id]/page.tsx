"use client";

import { use, useState, useEffect } from "react";
import { ArrowLeft, Download, Share2, Check, MessageSquare, X, Calendar, Clock, MapPin, Users, FileText, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useBadgeStore } from "@/store/BadgeStore";
import { printDevisDocument } from "@/utils/exportDevisPDF";
import { DevisShareModal } from "@/components/ui/DevisShareModal";
import { QuoteRevisionModal } from "@/components/devis/QuoteRevisionModal";
import { DevisVersionHistory } from "@/components/devis/DevisVersionHistory";
import { buildRevisionAcceptedMessage, buildRevisedQuoteRefusedMessage } from "@/lib/devis/revisionMessages";
import { categoryDetailsForDisplay } from "@/lib/devis/categories";
import { lineBreakdown, resolveDeposit, resolveDiscount } from "@/lib/devis/pricing";

export default function DetailedDevisClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [devis, setDevis] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<any>(null);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchDevis();
  }, [id]);

  const fetchDevis = async () => {
    setLoading(true);
    const { data: devisData } = await supabase
      .from('devis')
      .select('*, events(*)')
      .eq('id', id)
      .single();

    if (devisData) {
      if (devisData.prestataire_id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', devisData.prestataire_id)
          .single();
        devisData.profiles = prof || { full_name: 'Prestataire' };
      }

      if (devisData.events?.client_id) {
        const { data: clientProf } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', devisData.events.client_id)
          .single();
        devisData.clientProfile = clientProf || null;
      }

      setDevis(devisData);
      
      const { data: itemsData } = await supabase.from('devis_items').select('*').eq('devis_id', id);
      if (itemsData) setItems(itemsData);
      
      const { data: optsData } = await supabase.from('devis_options').select('*').eq('devis_id', id);
      if (optsData) setOptions(optsData);
    }
    setLoading(false);
  };

  const updateStatus = async (status: string, comment?: string) => {
    const updatePayload: any = { status };
    if (status === 'Accepté') {
      updatePayload.accepted_at = new Date().toISOString();
    }

    const { error } = await supabase.from('devis').update(updatePayload).eq('id', id);
    if (!error) {
      // 1. Historique de statut
      await supabase.from('devis_status_history').insert({
        devis_id: id,
        status: status,
        comment: comment || null
      });

      if (status === 'Accepté' && devis) {
        // 2. Mettre à jour la demande liée en 'Confirmé'
        if (devis.demande_id) {
          await supabase
            .from('demandes_devis')
            .update({ status: 'Confirmé' })
            .eq('id', devis.demande_id);
        } else if (devis.event_id && devis.prestataire_id) {
          await supabase
            .from('demandes_devis')
            .update({ status: 'Confirmé' })
            .eq('event_id', devis.event_id)
            .eq('prestataire_id', devis.prestataire_id);
        }

        // 3. AJOUT AUTOMATIQUE AU PLANNING DU PRESTATAIRE (provider_events)
        const eventDate = devis.events?.date;
        const eventName = devis.events?.name || devis.events?.type || 'Événement Evenium';
        const eventTime = devis.events?.time;
        const planningTitle = eventTime 
          ? `[${eventTime}] Prestation Evenium - ${eventName}`
          : `Prestation Evenium - ${eventName}`;

        if (eventDate && devis.prestataire_id) {
          const { data: existingPlanning } = await supabase
            .from('provider_events')
            .select('id')
            .eq('prestataire_id', devis.prestataire_id)
            .eq('date', eventDate)
            .ilike('title', `%${eventName}%`)
            .maybeSingle();

          if (!existingPlanning) {
            await supabase.from('provider_events').insert({
              prestataire_id: devis.prestataire_id,
              title: planningTitle,
              type: 'evenement',
              date: eventDate
            });
          }
        }

        // 4. Enregistrement des flux financiers pour le prestataire
        const total = Number(devis.total || 0);
        const acompte = resolveDeposit(devis);
        if (devis.prestataire_id) {
          if (acompte > 0) {
            await supabase.from('transactions').insert({
              prestataire_id: devis.prestataire_id,
              event_id: devis.event_id || null,
              description: `Acompte payé - Devis ${devis.reference || 'Événement'}`,
              montant: acompte,
              type: 'revenu',
              date: new Date().toISOString()
            });
            const solde = total - acompte;
            if (solde > 0) {
              const futureDate = eventDate ? new Date(eventDate).toISOString() : new Date().toISOString();
              await supabase.from('transactions').insert({
                prestataire_id: devis.prestataire_id,
                event_id: devis.event_id || null,
                description: `Solde à recevoir - Devis ${devis.reference || 'Événement'}`,
                montant: solde,
                type: 'revenu',
                date: futureDate
              });
            }
          } else if (total > 0) {
            await supabase.from('transactions').insert({
              prestataire_id: devis.prestataire_id,
              event_id: devis.event_id || null,
              description: `Paiement complet - Devis ${devis.reference || 'Événement'}`,
              montant: total,
              type: 'revenu',
              date: new Date().toISOString()
            });
          }


          // 5. Notification personnalisée selon le correspondant
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            let providerName = "Prestataire";
            if (devis.prestataire_id) {
              const { data: provProf } = await supabase.from('profiles').select('full_name').eq('id', devis.prestataire_id).maybeSingle();
              if (provProf?.full_name?.trim()) providerName = provProf.full_name.trim();
              else if (devis.profiles?.full_name?.trim()) providerName = devis.profiles.full_name.trim();
            }

            let clientName = "L'organisateur";
            const { data: myProf } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
            if (myProf?.full_name?.trim()) {
              clientName = myProf.full_name.trim();
            } else if (user.user_metadata?.full_name?.trim()) {
              clientName = user.user_metadata.full_name.trim();
            } else if (devis.clientProfile?.full_name?.trim()) {
              clientName = devis.clientProfile.full_name.trim();
            }

            let messageContent = "";
            if ((devis.version || 1) > 1) {
              // Message 6 : Acceptation du devis révisé !
              messageContent = buildRevisionAcceptedMessage({
                clientName,
                devisReference: devis.reference || 'DEV',
                version: devis.version || 1,
                finalTotal: total,
                eventName: eventName,
                eventDate: eventDate || undefined
              });
            } else {
              messageContent = `Bonjour ${providerName},\n\nJ'ai bien reçu votre proposition de devis n° ${devis.reference || 'DEV'} (${total.toLocaleString('fr-FR')} FCFA) pour l'événement « ${eventName} ».\n\nJ'ai le plaisir de vous informer que j'accepte votre proposition de devis ! La date du ${eventDate || 'la date convenue'} est confirmée dans notre planning. Je me réjouis de collaborer avec vous !`;
            }

            await supabase.from('messages').insert({
              event_id: devis.event_id || null,
              sender_id: user.id,
              receiver_id: devis.prestataire_id,
              content: messageContent,
              is_read: false
            });
          }
        }
      }

      fetchDevis();
      useBadgeStore.getState().refresh();
    } else {
      alert("Erreur lors de la mise à jour du devis.");
    }
  };

  const handleAccept = () => {
    const isRevised = (devis.version || 1) > 1;
    const promptText = isRevised
      ? `Vous êtes sur le point d'accepter la proposition de devis révisée (v${devis.version}) d'un montant de ${devis.total.toLocaleString('fr-FR')} FCFA.`
      : `Vous êtes sur le point d'accepter la proposition de devis du prestataire d'un montant de ${devis.total.toLocaleString('fr-FR')} FCFA.`;

    if (confirm(promptText)) {
      updateStatus("Accepté");
    }
  };

  const handleRefuse = async () => {
    const isRevised = (devis.version || 1) > 1;
    if (isRevised) {
      const motif = prompt("Êtes-vous sûr de vouloir décliner cette proposition révisée ? Précisez le motif éventuel (facultatif) :");
      if (motif === null) return; // Annulé

      await updateStatus("Refusé", motif ? `Refusé par le client : ${motif}` : "Refusé par le client");

      const { data: { user } } = await supabase.auth.getUser();
      let clientName = "L'organisateur";
      if (user) {
        const { data: myProf } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
        if (myProf?.full_name?.trim()) {
          clientName = myProf.full_name.trim();
        } else if (user.user_metadata?.full_name?.trim()) {
          clientName = user.user_metadata.full_name.trim();
        } else if (devis.clientProfile?.full_name?.trim()) {
          clientName = devis.clientProfile.full_name.trim();
        }
      }

      if (user && devis.prestataire_id) {
        // Message 7 : Refus du devis révisé
        const msgContent = buildRevisedQuoteRefusedMessage({
          clientName,
          devisReference: devis.reference || 'DEV',
          motif: motif || undefined
        });

        await supabase.from('messages').insert({
          event_id: devis.event_id || null,
          sender_id: user.id,
          receiver_id: devis.prestataire_id,
          content: msgContent,
          is_read: false
        });
      }
    } else {
      if (confirm("Êtes-vous sûr de vouloir décliner cette proposition de devis ?")) {
        updateStatus("Refusé");
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (!devis) return;
    try {
      setIsDownloadingPDF(true);
      await printDevisDocument({
        devis,
        items,
        options,
        provider: devis.profiles,
        event: devis.events,
        client: devis.clientProfile,
      });
    } catch (err) {
      console.error("Erreur lors de la génération du PDF:", err);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  if (loading) return <div className="p-20 text-center text-gray-500">Chargement du devis...</div>;
  if (!devis) return <div className="p-20 text-center text-red-500">Devis introuvable.</div>;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <Link href="/dashboard/devis" className="text-gray-500 hover:text-black flex items-center gap-2 text-sm mb-4 transition-colors">
            <ArrowLeft size={16} /> Retour
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-black">
              Devis n° {devis.reference || `DEV-${devis.id.substring(0,8).toUpperCase()}`}
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#8f6f33]/15 text-[#6d5322] border border-[#8f6f33]/30">
              v{devis.version || 1}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              devis.status === 'Accepté' ? 'bg-green-100 text-green-700 border-green-200' : 
              devis.status === 'Révision demandée' || devis.status === 'Modification demandée' ? 'bg-orange-100 text-orange-700 border-orange-200' :
              devis.status === 'En cours de révision' ? 'bg-amber-100 text-amber-800 border-amber-200' :
              devis.status === 'Nouvelle version envoyée' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
              devis.status === 'En attente de validation' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
              devis.status === 'Refusé' ? 'bg-red-100 text-red-700 border-red-200' :
              'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
              {devis.status === 'En attente de validation' ? 'En attente' : devis.status}
            </span>
          </div>
          <p className="text-gray-500 mt-2 text-sm">
            Envoyé le {new Date(devis.date_emission).toLocaleDateString()} • Valable jusqu'au {devis.valid_until ? new Date(devis.valid_until).toLocaleDateString() : '-'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer text-gray-800"
            title="Télécharger ou imprimer ce devis en PDF"
          >
            <Download size={16} className={isDownloadingPDF ? "animate-bounce text-[#8f6f33]" : ""} /> 
            {isDownloadingPDF ? "Génération du PDF..." : "Télécharger en PDF"}
          </button>
          <button 
            onClick={handleShare}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer text-gray-800"
            title="Partager ce devis"
          >
            <Share2 size={16} /> Partager
          </button>
          {['En attente de validation', 'Envoyé', 'Nouvelle version envoyée', 'Révision demandée', 'En cours de révision'].includes(devis.status) && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsRevisionModalOpen(true)} 
                className="px-4 py-2 bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw size={14} className="text-[#8f6f33]" /> {(devis.version || 1) > 1 ? 'Nouvelle révision' : 'Demander une révision'}
              </button>
              <button 
                onClick={handleAccept} 
                className="px-6 py-2 bg-[#6b1f2a] text-white rounded-lg hover:bg-[#a03f55] text-sm font-bold flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <Check size={16} /> Accepter la proposition
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bannière d'état pour les révisions */}
      {devis.status === 'Révision demandée' && (
        <div className="mb-6 p-4.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-xs">
          <RefreshCw className="text-amber-600 mt-0.5 animate-spin-slow shrink-0" size={20} />
          <div>
            <h3 className="font-bold text-amber-900 text-sm">Demande de révision en cours d'étude</h3>
            <p className="text-xs text-amber-800 mt-0.5 font-medium leading-relaxed">
              Votre demande de révision a bien été transmise à {devis.profiles?.full_name || 'votre prestataire'}. Vous recevrez une notification et un message dès qu'une nouvelle proposition sera établie.
            </p>
          </div>
        </div>
      )}

      {devis.status === 'En cours de révision' && (
        <div className="mb-6 p-4.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 shadow-xs">
          <Clock className="text-blue-600 mt-0.5 shrink-0" size={20} />
          <div>
            <h3 className="font-bold text-blue-900 text-sm">Révision prise en compte par le prestataire</h3>
            <p className="text-xs text-blue-800 mt-0.5 font-medium leading-relaxed">
              {devis.profiles?.full_name || 'Votre prestataire'} a pris en compte votre demande et finalise une nouvelle proposition adaptée.
            </p>
          </div>
        </div>
      )}

      {/* Widget Historique des Versions */}
      <DevisVersionHistory
        devisId={devis.id}
        currentDevis={devis}
        currentItems={items}
        currentOptions={options}
        selectedVersionNumber={selectedSnapshot?.version_number}
        onSelectVersionSnapshot={(snap) => {
          setSelectedSnapshot(snap);
          if (snap.items && snap.items.length > 0) {
            setItems(snap.items);
          }
          if (snap.options) {
            setOptions(snap.options);
          }
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE (Contenu principal) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Evénement */}
          <div className="bg-white rounded-2xl border border-pink-100/50 shadow-sm overflow-hidden">
            <div className="bg-[#f3e8e2] px-6 py-4 flex items-center gap-3">
              <Calendar className="text-[#6b1f2a]" size={20} />
              <h2 className="font-bold text-lg text-gray-900">1. Informations sur l'événement</h2>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Type d'événement</p>
                <p className="font-medium">{devis.event_type || devis.events?.type || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Date</p>
                <p className="font-medium">{devis.event_date || devis.events?.date || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Heure</p>
                <p className="font-medium">{devis.events?.time || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Nombre d'invités</p>
                <p className="font-medium">{devis.events?.guestsCount || '-'} personnes</p>
              </div>
              <div className="col-span-2 md:col-span-4">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Lieu</p>
                <p className="font-medium flex items-center gap-1"><MapPin size={14} className="text-gray-400"/> {devis.event_location || devis.events?.location || '-'}</p>
              </div>
            </div>
          </div>

          {/* Proposition du prestataire : service, description et détails propres à son activité */}
          {(devis.service_name || devis.description || categoryDetailsForDisplay(devis.category_details).length > 0) && (
            <div className="bg-white rounded-2xl border border-pink-100/50 shadow-sm overflow-hidden">
              <div className="bg-[#f3e8e2] px-6 py-4 flex items-center gap-3">
                <CheckCircle2 className="text-[#6b1f2a]" size={20} />
                <h2 className="font-bold text-lg text-gray-900">Proposition du prestataire</h2>
              </div>
              <div className="p-6 space-y-6">
                {devis.service_name && (
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Service proposé</p>
                    <p className="font-medium text-gray-900">{devis.service_name}</p>
                  </div>
                )}
                {devis.description && <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{devis.description}</p>}
                {categoryDetailsForDisplay(devis.category_details).map((group) => (
                  <div key={group.label}>
                    <p className="text-xs text-[#8f6f33] font-bold uppercase tracking-wider mb-3">{group.label}</p>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      {group.rows.map((row) => (
                        <div key={row.label}>
                          <dt className="text-xs text-gray-500">{row.label}</dt>
                          <dd className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Prestations */}
          <div className="bg-white rounded-2xl border border-pink-100/50 shadow-sm overflow-hidden">
            <div className="bg-[#f3e8e2] px-6 py-4 flex items-center gap-3">
              <FileText className="text-[#6b1f2a]" size={20} />
              <h2 className="font-bold text-lg text-gray-900">2. Prestations proposées</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-gray-500 border-b">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Désignation</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-center">Quantité</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Prix unitaire (FCFA)</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Total (FCFA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{item.designation}</p>
                        {item.description && <p className="text-xs text-gray-500 mt-1 max-w-sm">{item.description}</p>}
                        {item.pricing_mode && <p className="text-[11px] text-[#8f6f33] mt-1">{lineBreakdown(item)}</p>}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{item.pricing_mode === 'forfait' ? 'Forfait' : <>{item.quantity}{item.unit && item.unit !== 'Forfait' ? <span className="block text-[11px] text-gray-400 font-normal">{item.unit}</span> : null}</>}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{item.unit_price?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-bold text-black">{item.total?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Options Incluses / Non Incluses */}
          {options.length > 0 && (
            <div className="bg-white rounded-2xl border border-pink-100/50 shadow-sm overflow-hidden">
              <div className="bg-[#f3e8e2] px-6 py-4 flex items-center gap-3">
                <CheckCircle2 className="text-[#6b1f2a]" size={20} />
                <h2 className="font-bold text-lg text-gray-900">3. Options et Frais</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map(opt => (
                  <div key={opt.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      {opt.is_included ? <CheckCircle2 size={16} className="text-green-600"/> : <CheckCircle2 size={16} className="text-gray-300"/>}
                      <span className={`font-medium ${opt.is_included ? 'text-gray-900' : 'text-gray-500'}`}>{opt.name}</span>
                    </div>
                    {opt.is_included ? (
                      <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Inclus</span>
                    ) : (
                      <span className="text-sm font-bold">{opt.price?.toLocaleString()} FCFA</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Détails financiers */}
          <div className="bg-white rounded-2xl border border-pink-100/50 shadow-sm overflow-hidden">
            <div className="bg-[#f3e8e2] px-6 py-4 flex items-center gap-3">
              <FileText className="text-[#6b1f2a]" size={20} />
              <h2 className="font-bold text-lg text-gray-900">4. Détails financiers</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Total des prestations</span>
                <span className="font-medium">{devis.subtotal?.toLocaleString()} FCFA</span>
              </div>
              {devis.extra_fees > 0 && (
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Frais annexes (Déplacement, etc.)</span>
                  <span className="font-medium">+{devis.extra_fees?.toLocaleString()} FCFA</span>
                </div>
              )}
              {devis.discount > 0 && (
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>Remise exceptionnelle</span>
                  <span className="font-bold">-{resolveDiscount(devis).toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              {Number(devis.tax_amount) > 0 && (
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>TVA ({Number(devis.tax_rate)} %)</span>
                  <span className="font-medium">+{Number(devis.tax_amount).toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
            </div>
            <div className="bg-[#f3e8e2] px-6 py-5 border-t border-pink-100/50 flex justify-between items-center">
              <span className="font-bold text-[#6b1f2a] text-lg">Montant total TTC</span>
              <span className="font-bold text-2xl text-[#6b1f2a]">{devis.total?.toLocaleString()} FCFA</span>
            </div>
          </div>

        </div>
        
        {/* COLONNE DROITE (Infos Prestataire, Paiement, Actions) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Carte Prestataire */}
          <div className="bg-[#f5eee1] rounded-2xl p-6 border border-[#F0E6D2] shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users size={14}/> Prestataire
            </h3>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-full p-1 mb-4 shadow-sm border border-gray-100">
                <img src={devis.profiles?.avatar_url || '/placeholder.png'} className="w-full h-full rounded-full object-cover" alt={devis.profiles?.full_name} />
              </div>
              <h4 className="font-bold text-lg flex items-center justify-center gap-1 text-gray-900">
                {devis.profiles?.full_name} {devis.profiles?.is_evenium_certified !== false && <CheckCircle2 size={14} className="text-[#b8924a] fill-[#b8924a]/20"/>}
              </h4>
              <p className="text-sm text-gray-600 mb-4">{devis.profiles?.category}</p>
              <Link href={`/dashboard/events/${devis.event_id}/prestataires`} className="w-full py-2 bg-white border border-[#b8924a]/30 text-[#8f6f33] font-bold rounded-xl text-sm hover:bg-yellow-50 transition-colors">
                Voir le profil
              </Link>
            </div>
          </div>

          {/* Conditions de paiement */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText size={14}/> Conditions de paiement
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Acompte à la réservation</span>
                <span className="font-bold text-gray-900">{resolveDeposit(devis).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Solde restant</span>
                <span className="font-bold text-gray-900">{Math.max(0, Number(devis.total || 0) - resolveDeposit(devis)).toLocaleString('fr-FR')} FCFA</span>
              </div>
              {Number(devis.caution_amount) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Caution (restituée, hors total)</span>
                  <span className="font-bold text-gray-900">{Number(devis.caution_amount).toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              <div className="pt-4 border-t flex justify-between items-center bg-gray-50 -mx-6 px-6 pb-2">
                <span className="font-medium text-gray-900">Montant total</span>
                <span className="font-bold text-lg text-black">{devis.total?.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {/* Validité */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar size={14}/> Validité du devis
            </h3>
            <p className="text-sm text-gray-600">
              Ce devis est valable jusqu'au <span className="font-bold text-gray-900">{devis.valid_until ? new Date(devis.valid_until).toLocaleDateString() : 'Non définie'}</span>.
            </p>
          </div>

          {/* Notes */}
          {devis.notes && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MessageSquare size={14}/> Notes du prestataire
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{devis.notes}</p>
            </div>
          )}

          {/* Boutons d'action (Sticky on mobile) */}
          {['En attente de validation', 'Envoyé', 'Nouvelle version envoyée', 'Révision demandée', 'En cours de révision'].includes(devis.status) && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t md:relative md:bg-transparent md:border-0 md:p-0 z-50">
              <button onClick={handleAccept} className="w-full py-4 mb-3 bg-[#6b1f2a] text-white rounded-xl hover:bg-[#a03f55] font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Check size={20} /> Accepter la proposition de devis
              </button>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsRevisionModalOpen(true)} 
                  className="flex-1 py-3 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 text-stone-800 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <RefreshCw size={16} className="text-[#8f6f33]" /> {(devis.version || 1) > 1 ? 'Nouvelle révision' : 'Demander une révision'}
                </button>
                <button 
                  type="button"
                  onClick={handleRefuse} 
                  className="px-5 py-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors flex items-center justify-center cursor-pointer shadow-xs"
                >
                  Refuser
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Complète de Demande de Révision */}
      {devis && (
        <QuoteRevisionModal
          isOpen={isRevisionModalOpen}
          onClose={() => setIsRevisionModalOpen(false)}
          onSuccess={fetchDevis}
          devis={devis}
        />
      )}

      {/* Modal Partage de Devis */}
      {devis && (
        <DevisShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          devis={{
            id: devis.id,
            reference: devis.reference,
            total: devis.total,
            eventName: devis.events?.name,
            providerName: devis.profiles?.full_name,
          }}
        />
      )}

    </div>
  );
}
