"use client";

import { Store, Plus, Search, MoreHorizontal, Star, Phone, CheckCircle, Clock, Lock, MessageCircle, ExternalLink, MapPin, Camera, Image as ImageIcon, ArrowLeft, X, Users, Calendar, FileText, Download, Share2, RefreshCw, Heart, UserCheck, UserPlus, Sparkles, Zap, MessageSquare } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEvents } from "@/store/EventsContext";
import { notFound } from "next/navigation";
import { use, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { printDevisDocument } from "@/utils/exportDevisPDF";
import { DevisShareModal } from "@/components/ui/DevisShareModal";
import { QuoteRevisionModal } from "@/components/devis/QuoteRevisionModal";
import { DevisVersionHistory } from "@/components/devis/DevisVersionHistory";
import { buildRevisionAcceptedMessage, buildRevisedQuoteRefusedMessage } from "@/lib/devis/revisionMessages";
import { activityFromProfile, providerHeadline } from "@/lib/providerProfile";
import { locationLabel } from "@/lib/zones";
import { offerTagLine } from "@/lib/offres";
import { RubriquesView } from "@/components/prestataire/RubriquesView";
import { sendQuoteAcceptedPushAction } from "@/app/actions/notify";
import { LeaveReviewModal } from "@/components/reviews/LeaveReviewModal";
import EventBreadcrumb from "@/components/dashboard/EventBreadcrumb";
import { ProviderCampaign } from "@/types/campaigns";
import { fetchActiveCampaignsAction, toggleCampaignLikeAction } from "@/app/actions/campaignActions";
import { addNotificationForClient, addNotificationForProvider } from "@/lib/notifications";
import { QuoteRequestModal } from "@/components/dashboard/QuoteRequestModal";

export default function PrestatairesDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { events, isLoaded, refreshEvents } = useEvents();
  const supabase = createClient();
  const eventFromContext = events.find((e) => e.id === id);
  const [directEvent, setDirectEvent] = useState<any>(null);
  const [loadingDirect, setLoadingDirect] = useState(!eventFromContext);
  const [notFoundTriggered, setNotFoundTriggered] = useState(false);

  const event = eventFromContext || directEvent;

  useEffect(() => {
    if (eventFromContext) {
      setLoadingDirect(false);
      return;
    }

    const fetchDirect = async () => {
      try {
        const { data } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
        if (data) {
          setDirectEvent(data);
          refreshEvents();
        } else if (isLoaded) {
          setNotFoundTriggered(true);
        }
      } catch {
        if (isLoaded) setNotFoundTriggered(true);
      } finally {
        setLoadingDirect(false);
      }
    };
    fetchDirect();
  }, [id, eventFromContext, isLoaded, supabase, refreshEvents]);

  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<any | null>(null);
  const [myPrestataires, setMyPrestataires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'evenium' | 'externe'>('evenium');
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "externe" || tab === "evenium") {
        setActiveTab(tab);
      }
    }
  }, []);

  // Devis view state

  // Modification state
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [demandeToModify, setDemandeToModify] = useState<any | null>(null);
  const [newBudget, setNewBudget] = useState("");
  const [newMessage, setNewMessage] = useState("");
  
  // Devis modal states
  const [isDevisOpen, setIsDevisOpen] = useState(false);
  const [selectedDevis, setSelectedDevis] = useState<any | null>(null);
  const [devisProviderName, setDevisProviderName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<any | null>(null);

  // Besoins en prestataires & matching
  const AVAILABLE_SERVICE_CATEGORIES = [
    { id: "traiteur", name: "Traiteur & Gastronomie", icon: "🍽️" },
    { id: "photo_video", name: "Photo & Vidéo 4K", icon: "📸" },
    { id: "decoration", name: "Décoration & Scénographie", icon: "✨" },
    { id: "salle", name: "Salle de Réception & Domaines", icon: "🏰" },
    { id: "dj_musique", name: "DJ & Animation Sonore", icon: "🎶" },
    { id: "tenues", name: "Robes de Mariée & Costumes", icon: "👗" },
    { id: "beaute", name: "Coiffure & Mise en Beauté", icon: "💄" },
    { id: "patisserie", name: "Pâtisserie & Gâteau", icon: "🎂" },
    { id: "papeterie", name: "Faire-part & Papeterie", icon: "💌" },
    { id: "vehicule", name: "Véhicule de Prestige", icon: "🚗" },
  ];

  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [matchingProviders, setMatchingProviders] = useState<any[]>([]);
  const [loadingNeeds, setLoadingNeeds] = useState(false);

  // Pubs & Boosts sponsorisés
  const [sponsoredCampaigns, setSponsoredCampaigns] = useState<ProviderCampaign[]>([]);
  const [likedCampaigns, setLikedCampaigns] = useState<Record<string, boolean>>({});
  const [followedProviders, setFollowedProviders] = useState<Record<string, boolean>>({});
  const [quoteModalProvider, setQuoteModalProvider] = useState<any | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Chargement des besoins enregistrés & des campagnes sponsorisées
  useEffect(() => {
    if (!id) return;
    try {
      const savedNeeds = localStorage.getItem(`evenium_event_needs_${id}`);
      if (savedNeeds) {
        setSelectedNeeds(JSON.parse(savedNeeds));
      }
      const savedLikes = localStorage.getItem("evenium_client_liked_campaigns");
      if (savedLikes) {
        setLikedCampaigns(JSON.parse(savedLikes));
      }
      const savedFollows = localStorage.getItem("evenium_client_followed_providers");
      if (savedFollows) {
        setFollowedProviders(JSON.parse(savedFollows));
      }
    } catch {}

    // Charger les campagnes actives ciblées pour cet événement
    async function loadCampaigns() {
      try {
        const campaigns = await fetchActiveCampaignsAction({
          eventType: event?.type,
          zone: event?.location,
          limit: 10,
        });
        setSponsoredCampaigns(campaigns || []);
      } catch (err) {
        console.warn("Failed to load sponsored campaigns:", err);
      }
    }
    loadCampaigns();
  }, [id, event?.type, event?.location]);

  // Détection & matching automatique des prestataires
  useEffect(() => {
    if (selectedNeeds.length === 0) {
      setMatchingProviders([]);
      return;
    }
    async function findMatches() {
      setLoadingNeeds(true);
      try {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, business_name, avatar_url, activity, rating, review_count, services(*)")
          .limit(20);

        if (profs && profs.length > 0) {
          const matches = profs.filter((p: any) => {
            const acts = (p.activity?.services || []).map((s: string) => s.toLowerCase());
            const servTitles = (p.services || []).map((s: any) => (s.title || "").toLowerCase());
            return selectedNeeds.some((need) => {
              const needle = need.toLowerCase().slice(0, 5);
              return acts.some((a: string) => a.includes(needle)) || servTitles.some((t: string) => t.includes(needle));
            });
          });
          setMatchingProviders(matches.slice(0, 4));

          // Si de nouveaux matches trouvés, envoyer une alerte client réactive
          if (matches.length > 0 && typeof window !== "undefined") {
            const hasNotified = sessionStorage.getItem(`evenium_notified_matches_${id}`);
            if (!hasNotified) {
              sessionStorage.setItem(`evenium_notified_matches_${id}`, "1");
              addNotificationForClient({
                title: "Prestataires recommandés disponibles",
                desc: `✨ ${matches.length} prestataire(s) correspondent à vos besoins pour « ${event?.name || "votre événement"} » !`,
                link: `/dashboard/events/${id}/prestataires`,
                type: "matching_provider"
              });
            }
          }
        }
      } catch (err) {
        console.warn("Matching search error:", err);
      } finally {
        setLoadingNeeds(false);
      }
    }
    findMatches();
  }, [selectedNeeds, id, event?.name, supabase]);

  const handleToggleNeed = (categoryName: string) => {
    const updated = selectedNeeds.includes(categoryName)
      ? selectedNeeds.filter((n) => n !== categoryName)
      : [...selectedNeeds, categoryName];
    setSelectedNeeds(updated);
    try {
      localStorage.setItem(`evenium_event_needs_${id}`, JSON.stringify(updated));
    } catch {}
  };

  const handleLikeCampaign = async (c: ProviderCampaign) => {
    const isCurrentlyLiked = Boolean(likedCampaigns[c.id]);
    const nextState = !isCurrentlyLiked;
    const newLikes = { ...likedCampaigns, [c.id]: nextState };
    setLikedCampaigns(newLikes);
    try {
      localStorage.setItem("evenium_client_liked_campaigns", JSON.stringify(newLikes));
    } catch {}

    toggleCampaignLikeAction(c.id, "client-me", nextState);

    if (nextState) {
      addNotificationForProvider(c.provider_id, {
        title: "Nouveau J'aime reçu ❤️",
        desc: `Un organisateur a aimé votre publication « ${c.title} » !`,
        link: "/prestataire/publicite",
        type: "like"
      });
    }
  };

  const handleFollowProvider = async (c: ProviderCampaign) => {
    const isCurrentlyFollowed = Boolean(followedProviders[c.provider_id]);
    const nextState = !isCurrentlyFollowed;
    const newFollows = { ...followedProviders, [c.provider_id]: nextState };
    setFollowedProviders(newFollows);
    try {
      localStorage.setItem("evenium_client_followed_providers", JSON.stringify(newFollows));
    } catch {}

    if (nextState) {
      addNotificationForProvider(c.provider_id, {
        title: "Nouvel abonné(e) 🎉",
        desc: `Un organisateur s'est abonné à votre profil (${c.provider_name}) !`,
        link: "/prestataire/publicite",
        type: "follow"
      });
      addNotificationForClient({
        title: `Abonnement : ${c.provider_name}`,
        desc: `✓ Vous êtes désormais abonné(e) à ${c.provider_name}. Vous recevrez ses publications et offres exclusives.`,
        link: `/dashboard/events/${id}/prestataires`,
        type: "follow"
      });
    }
  };

  const handleOpenQuoteModal = (providerData: any) => {
    setQuoteModalProvider(providerData);
    setIsQuoteModalOpen(true);
  };

  // Fermeture des modales avec la touche Échap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") return;
      if (e.key === "Escape") {
        if (isDevisOpen) setIsDevisOpen(false);
        else if (isModifyModalOpen) setIsModifyModalOpen(false);
        else if (isShareModalOpen) setIsShareModalOpen(false);
        else if (isRevisionModalOpen) setIsRevisionModalOpen(false);
        else if (reviewTarget) setReviewTarget(null);
        else if (selectedServiceForDetails) setSelectedServiceForDetails(null);
        else if (selectedProvider) setSelectedProvider(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDevisOpen, isModifyModalOpen, isShareModalOpen, isRevisionModalOpen, reviewTarget, selectedServiceForDetails, selectedProvider]);

  const handleDevisResponse = async (status: 'Accepté' | 'Refusé') => {
    if (!selectedDevis) return;
    setIsProcessing(true);

    let refusalReason = "";
    const isRevision = (selectedDevis.version || 1) > 1;

    if (status === 'Refusé' && isRevision) {
      const promptReason = window.prompt("Motif éventuel du refus (facultatif) :");
      refusalReason = promptReason ? promptReason.trim() : "";
    }

    // 1. Mettre à jour le statut du devis
    const { error: devisError } = await supabase
      .from('devis')
      .update({ status: status })
      .eq('id', selectedDevis.id);

    // 2. Mettre à jour le statut de la demande liée et historique
    if (!devisError) {
      if (selectedDevis.demande_id) {
        await supabase
          .from('demandes_devis')
          .update({ status: status === 'Accepté' ? 'Confirmé' : 'Annulé' })
          .eq('id', selectedDevis.demande_id);
      }

      // 3. Insérer dans l'historique
      let comment = status === 'Accepté'
        ? (isRevision ? `Devis révisé (v${selectedDevis.version}) accepté par l'organisateur` : "Proposition de devis acceptée par l'organisateur")
        : (isRevision ? `Devis révisé (v${selectedDevis.version}) refusé par l'organisateur. Motif : ${refusalReason || 'Non précisé'}` : "Proposition de devis refusée par l'organisateur");

      await supabase.from('devis_status_history').insert({
        devis_id: selectedDevis.id,
        status: status,
        comment: comment
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user && selectedDevis.prestataire_id) {
        let clientName = "L'organisateur";
        const { data: clientProf } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
        if (clientProf?.full_name?.trim()) {
          clientName = clientProf.full_name.trim();
        } else if (user.user_metadata?.full_name?.trim()) {
          clientName = user.user_metadata.full_name.trim();
        }

        let providerName = "Prestataire";
        const { data: provProf } = await supabase.from('profiles').select('full_name').eq('id', selectedDevis.prestataire_id).maybeSingle();
        if (provProf?.full_name?.trim()) {
          providerName = provProf.full_name.trim();
        }

        const total = Number(selectedDevis.total || selectedDevis.amount || 0);
        let messageContent = "";

        if (status === 'Accepté') {
          if (isRevision) {
            messageContent = buildRevisionAcceptedMessage({
              organizerName: clientName,
              devisReference: selectedDevis.reference || `DEV-${selectedDevis.id.slice(0, 6).toUpperCase()}`,
              versionNumber: selectedDevis.version || 1,
              finalAmount: total,
              eventName: event?.name || event?.type || "votre événement",
              eventDate: event?.date ? new Date(event.date).toLocaleDateString('fr-FR') : "la date convenue"
            });
          } else {
            messageContent = `Bonjour ${providerName},\n\nJ'ai bien reçu votre proposition de devis n° ${selectedDevis.reference || 'DEV'} (${total.toLocaleString('fr-FR')} FCFA) pour l'événement « ${event?.name || 'notre événement'} ».\n\nJ'ai le plaisir de vous informer que j'accepte votre proposition de devis ! La prestation est ainsi confirmée dans notre planning. Au plaisir de collaborer avec vous !`;
          }
        } else if (status === 'Refusé') {
          if (isRevision) {
            messageContent = buildRevisedQuoteRefusedMessage({
              organizerName: clientName,
              devisReference: selectedDevis.reference || `DEV-${selectedDevis.id.slice(0, 6).toUpperCase()}`,
              reason: refusalReason
            });
          } else {
            messageContent = `Bonjour ${providerName},\n\nAprès étude de votre devis n° ${selectedDevis.reference || 'DEV'}, nous avons décidé de ne pas y donner suite pour le moment.\n\nMerci pour votre professionnalisme.`;
          }
        }

        if (messageContent) {
          await supabase.from('messages').insert({
            event_id: selectedDevis.event_id || event?.id || null,
            sender_id: user.id,
            receiver_id: selectedDevis.prestataire_id,
            content: messageContent,
            is_read: false
          });
        }

        if (status === 'Accepté') {
          // Alerte Push directe sur l'appareil du prestataire (même application fermée)
          sendQuoteAcceptedPushAction(selectedDevis.prestataire_id, clientName, event?.name || event?.type);

          const acompte = Number(selectedDevis.deposit_amount || 0);

          if (acompte > 0) {
            await supabase.from('transactions').insert({
              prestataire_id: selectedDevis.prestataire_id,
              event_id: event?.id || null,
              description: `Acompte payé - Devis ${selectedDevis.reference || 'Événement'}`,
              montant: acompte,
              type: 'revenu',
              date: new Date().toISOString()
            });
            const solde = total - acompte;
            if (solde > 0) {
              const futureDate = event?.date ? new Date(event.date).toISOString() : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();
              await supabase.from('transactions').insert({
                prestataire_id: selectedDevis.prestataire_id,
                event_id: event?.id || null,
                description: `Solde à recevoir - Devis ${selectedDevis.reference || 'Événement'}`,
                montant: solde,
                type: 'revenu',
                date: futureDate
              });
            }
          } else {
            await supabase.from('transactions').insert({
              prestataire_id: selectedDevis.prestataire_id,
              event_id: event?.id || null,
              description: `Paiement complet - Devis ${selectedDevis.reference || 'Événement'}`,
              montant: total,
              type: 'revenu',
              date: new Date().toISOString()
            });
          }


          if (event?.date && selectedDevis.prestataire_id) {
            const eventName = event.name || event.type || 'Événement Evenium';
            const planningTitle = event.time
              ? `[${event.time}] Prestation Evenium - ${eventName}`
              : `Prestation Evenium - ${eventName}`;

            const { data: existingPlanning } = await supabase
              .from('provider_events')
              .select('id')
              .eq('prestataire_id', selectedDevis.prestataire_id)
              .eq('date', event.date)
              .ilike('title', `%${eventName}%`)
              .maybeSingle();

            if (!existingPlanning) {
              await supabase.from('provider_events').insert({
                prestataire_id: selectedDevis.prestataire_id,
                title: planningTitle,
                type: 'evenement',
                date: event.date
              });
            }
          }
        }
      }
    }

    setIsProcessing(false);
    setIsDevisOpen(false);
    setSelectedDevis(null);
    fetchDemandes();
  };

  const handleDownloadDevisPDF = async (devisToPrint: any) => {
    if (!devisToPrint) return;
    const provider = myPrestataires.find(p => p.devis?.id === devisToPrint.id);
    try {
      setIsDownloadingPDF(true);
      await printDevisDocument({
        devis: devisToPrint,
        items: devisToPrint.devis_items || [],
        options: devisToPrint.devis_options || [],
        provider: provider || { full_name: devisProviderName },
        event: event || {},
      });
    } catch (err) {
      console.error("Erreur téléchargement PDF devis:", err);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  useEffect(() => {
    if ((event?.plan || "").toLowerCase() === "gold") {
      fetchDemandes();

      const channel = supabase.channel('client_demandes_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'demandes_devis', filter: `event_id=eq.${id}` }, () => {
          fetchDemandes();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'devis' }, () => {
          fetchDemandes();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [event]);

  const fetchDemandes = async () => {
    setLoading(true);
    // Fetch demandes
    const { data: demandesData } = await supabase
      .from('demandes_devis')
      .select('*')
      .eq('event_id', id);

    // Fetch devis for this event
    const { data: devisData } = await supabase
      .from('devis')
      .select('*, devis_items(*), devis_options(*)')
      .in('demande_id', (demandesData || []).map(d => d.id));
    
    // Fetch provider profiles
    const providerIds = [...new Set([
      ...(demandesData || []).map((d: any) => d.prestataire_id),
      ...(devisData || []).map((d: any) => d.prestataire_id)
    ].filter(Boolean))];

    const { data: profs } = await supabase
      .from('profiles')
      .select('*, services(*)')
      .in('id', providerIds);

    const profMap: Record<string, any> = {};
    (profs || []).forEach((p: any) => profMap[p.id] = p);

    if (demandesData) {
      setMyPrestataires(demandesData.map((d: any) => {
        const prof = profMap[d.prestataire_id];
        // Find the devis linked to this demande if it exists
        const relatedDevis = devisData?.find(dv => dv.demande_id === d.id);
        
        return {
          id: prof?.id || d.prestataire_id,
          demande_id: d.id,
          devis: relatedDevis,
          name: prof?.full_name || d.client_name || 'Prestataire',
          role: prof ? providerHeadline(prof) : d.service_name || 'Service',
          description: prof?.description || '',
          rubriques: prof?.rubriques ?? null,
          phone: prof?.phone || 'Non renseigné',
          zone: (prof && locationLabel(activityFromProfile(prof).country, activityFromProfile(prof).zones)) || prof?.address || 'Non renseigné',
          rating: 5,
          isPlatformProvider: prof?.is_evenium_certified !== false,
          status: relatedDevis?.status === 'Accepté' ? 'Confirmé' : (relatedDevis ? 'Devis envoyé' : d.status),
          cost: relatedDevis ? `${Number(relatedDevis.total || relatedDevis.amount || 0).toLocaleString('fr-FR')} FCFA` : (d.budget_indicatif || d.budget_propose ? `${Number(d.budget_indicatif || d.budget_propose).toLocaleString('fr-FR')} FCFA (Estimé)` : "Sur devis"),
          priceRange: "Sur devis",
          services: Array.isArray(prof?.services) ? prof.services : [],
          gallery: Array.isArray(prof?.gallery) ? prof.gallery : []
        };
      }));
    }
    setLoading(false);
  };

  const handleCancelDemande = async (demandeId: string) => {
    if (confirm("Êtes-vous sûr de vouloir annuler l'envoi de ce devis au prestataire ?")) {
      // Update the status so the provider is informed of the cancellation
      const { error } = await supabase.from('demandes_devis').update({ status: 'Annulé par le client' }).eq('id', demandeId);
      if (error) {
        alert("Erreur lors de l'annulation.");
      } else {
        fetchDemandes();
      }
    }
  };

  const handleModifyDemande = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demandeToModify) return;

    const { error } = await supabase
      .from('demandes_devis')
      .update({ 
        budget_propose: Number(newBudget),
        message: newMessage,
        status: 'Modifié par le client'
      })
      .eq('id', demandeToModify.demande_id);
      
    if (error) {
      alert("Erreur lors de la modification.");
    } else {
      setIsModifyModalOpen(false);
      fetchDemandes();
    }
  };

  if (loadingDirect && !event) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 text-[#8f6f33]">
        <div className="w-10 h-10 border-3 border-[#b8924a] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Chargement des prestataires...</p>
      </div>
    );
  }

  if (notFoundTriggered || (!event && !loadingDirect && isLoaded)) {
    notFound();
  }

  const isGold = (event?.plan || "").toLowerCase() === "gold";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <EventBreadcrumb eventId={event.id} eventName={event.name} currentPage="Mes Prestataires" />

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <h1 className="font-serif text-3xl font-bold text-black flex items-center gap-2">
            Mes Prestataires &amp; Découvertes <Store size={24} className="text-[#b8924a]" />
          </h1>
          <div className="flex items-center gap-2">
            {isGold ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#b8924a]/15 text-[#8f6f33] border border-[#b8924a]/30">
                Formule Gold VIP · Tout-en-un
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1f150e] text-[#f5dfaa] shadow-xs">
                Formule Premium · INVITATION + SUIVI
              </span>
            )}
          </div>
        </div>
        <p className="text-gray-500 text-sm">Gérez l&apos;équipe de professionnels qui fera le succès de votre événement et découvrez les offres sponsorisées.</p>
      </div>

      {/* ─────────────── 1. MES BESOINS EN SERVICES & MATCHING AUTOMATIQUE ─────────────── */}
      <section className="bg-white rounded-3xl border border-[#ecdcc8] p-5 sm:p-7 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fbf7f0] border border-[#b8924a]/30 text-[#8f6f33] flex items-center justify-center font-bold text-lg shrink-0">
              🎯
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                Mes Besoins en Prestataires pour cet Événement
              </h2>
              <p className="text-xs text-gray-500">
                Sélectionnez les services dont vous avez besoin. Dès qu&apos;un prestataire correspondant est disponible ou s&apos;inscrit, vous recevez une alerte directe.
              </p>
            </div>
          </div>
          {selectedNeeds.length > 0 && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#fbf7f0] text-[#8f6f33] border border-[#b8924a]/30 self-start sm:self-auto">
              {selectedNeeds.length} besoin(s) sélectionné(s)
            </span>
          )}
        </div>

        {/* Grille de sélection des catégories de besoins */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {AVAILABLE_SERVICE_CATEGORIES.map((cat) => {
            const isSelected = selectedNeeds.includes(cat.name);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleToggleNeed(cat.name)}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 text-left cursor-pointer ${
                  isSelected
                    ? "bg-[#281a10] text-[#f7e7b4] border-[#281a10] shadow-xs"
                    : "bg-gray-50/70 hover:bg-gray-100 text-gray-700 border-gray-200"
                }`}
              >
                <span className="text-base shrink-0">{cat.icon}</span>
                <span className="truncate">{cat.name}</span>
                {isSelected && <span className="ml-auto text-[10px] text-[#f7e7b4]">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Prestataires correspondants détectés en direct */}
        {selectedNeeds.length > 0 && (
          <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8f6f33] flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#b8924a]" />
                <span>Prestataires recommandés pour vos besoins ({matchingProviders.length})</span>
              </h3>
              {loadingNeeds && <span className="text-xs text-gray-400">Recherche des profils...</span>}
            </div>

            {matchingProviders.length === 0 && !loadingNeeds ? (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <span>🔔</span>
                <p>Vos besoins sont enregistrés ! Dès qu&apos;un nouveau prestataire qualifié propose ces services dans votre zone, une notification vous sera envoyée directement.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {matchingProviders.map((mp) => (
                  <div key={mp.id} className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-[#b8924a] transition-all flex flex-col justify-between shadow-2xs">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-100 border border-gray-200 shrink-0">
                          {mp.avatar_url ? (
                            <Image src={mp.avatar_url} alt={mp.business_name || mp.full_name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-gray-600 bg-gray-100">
                              {(mp.business_name || mp.full_name || "P").charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{mp.business_name || mp.full_name}</p>
                          <p className="text-[10px] text-[#8f6f33] truncate font-medium">{mp.activity?.services?.[0] || "Prestataire Vérifié"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="font-bold text-gray-900">{mp.rating || "5.0"}</span>
                        <span>({mp.review_count || 1} avis)</span>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-gray-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenQuoteModal(mp)}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#281a10] hover:bg-black text-[#f7e7b4] text-[11px] font-bold text-center transition cursor-pointer"
                      >
                        Demander un devis
                      </button>
                      <Link
                        href={`/dashboard/messages?prestataire=${encodeURIComponent(mp.id)}&msg=${encodeURIComponent(`Bonjour, j'organise « ${event?.name || "mon événement"} » et j'aimerais échanger sur vos prestations.`)}`}
                        className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700"
                        title="Contacter par message"
                      >
                        <MessageSquare size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ─────────────── 2. OFFRES SPONSORISÉES & DÉCOUVERTES (PUBS & BOOSTS) ─────────────── */}
      {sponsoredCampaigns.length > 0 && (
        <section className="bg-gradient-to-br from-[#faf7f2] via-[#fbf8f3] to-[#f4ede0] rounded-3xl border border-[#ecdcc8] p-5 sm:p-7 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ebdcca] mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#281a10] text-[#f7e7b4] flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                <Zap size={20} className="text-[#f7e7b4]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                    Découvertes &amp; Offres Sponsorisées (Pubs &amp; Boosts)
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    En Vedette
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Publications exclusives des prestataires pour votre zone géographique. Aimez (❤️) et abonnez-vous pour suivre leurs nouveautés.
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {sponsoredCampaigns.length} offre(s) active(s)
            </span>
          </div>

          {/* Grille des publications au style Instagram avec Like & Follow */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsoredCampaigns.map((pub) => {
              const isLiked = Boolean(likedCampaigns[pub.id]);
              const isFollowed = Boolean(followedProviders[pub.provider_id]);
              const isVideo = pub.media_url?.endsWith(".mp4") || pub.media_url?.includes("video");

              return (
                <div
                  key={pub.id}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  <div>
                    {/* Header carte style Insta */}
                    <div className="p-3.5 flex items-center justify-between border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-neutral-100 border border-gray-200 shrink-0">
                          {pub.provider_avatar ? (
                            <Image src={pub.provider_avatar} alt={pub.provider_name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-700 bg-gray-100">
                              {pub.provider_name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                            <span>{pub.provider_name}</span>
                            <CheckCircle size={12} className="text-[#3897f0] fill-[#3897f0] text-white" />
                          </p>
                          <span className="text-[10px] text-[#8f6f33] font-medium">
                            {pub.badge}
                          </span>
                        </div>
                      </div>

                      {/* Bouton S'abonner / Suivre */}
                      <button
                        type="button"
                        onClick={() => handleFollowProvider(pub)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          isFollowed
                            ? "bg-stone-100 text-stone-700 hover:bg-stone-200"
                            : "bg-[#281a10] hover:bg-black text-[#f7e7b4] shadow-xs"
                        }`}
                      >
                        {isFollowed ? (
                          <>
                            <UserCheck size={12} /> <span>Abonné(e)</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={12} /> <span>+ Suivre</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Visuel média */}
                    <div className="relative aspect-square w-full bg-black overflow-hidden">
                      {isVideo ? (
                        <video src={pub.media_url || ""} className="w-full h-full object-cover" controls playsInline muted />
                      ) : pub.media_url ? (
                        <Image src={pub.media_url} alt={pub.title} fill className="object-cover group-hover:scale-102 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <Camera size={32} />
                        </div>
                      )}

                      <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs text-[#f5ebd7] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#d4af37]/60 shadow-xs">
                        {pub.badge}
                      </span>
                    </div>

                    {/* Actions Insta (Like & Commentaires) */}
                    <div className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleLikeCampaign(pub)}
                            className={`flex items-center gap-1.5 text-xs font-bold transition cursor-pointer p-1 rounded-lg ${
                              isLiked ? "text-rose-600" : "text-gray-600 hover:text-rose-600"
                            }`}
                          >
                            <Heart size={20} className={isLiked ? "fill-rose-500 text-rose-500 animate-in zoom-in" : ""} />
                            <span>{(pub.likes_count || 12) + (isLiked ? 1 : 0)}</span>
                          </button>

                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <MessageSquare size={17} />
                            <span>{pub.contacts_count || 0} devis</span>
                          </span>
                        </div>

                        <Link
                          href={`/prestataire-activite?id=${encodeURIComponent(pub.provider_id)}`}
                          className="text-[11px] font-bold text-[#8f6f33] hover:underline flex items-center gap-1"
                        >
                          <span>Vitrine</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>

                      {/* Titre & Accroche */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                          {pub.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                          {pub.hook}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action : Devis & Message */}
                  <div className="p-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenQuoteModal({
                        id: pub.provider_id,
                        full_name: pub.provider_name,
                        business_name: pub.provider_name,
                      })}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#281a10] hover:bg-black text-[#f7e7b4] text-xs font-bold text-center transition cursor-pointer shadow-xs"
                    >
                      {pub.cta_label || "Demander un devis"}
                    </button>
                    <Link
                      href={`/dashboard/messages?prestataire=${encodeURIComponent(pub.provider_id)}&msg=${encodeURIComponent(`Bonjour, j'ai vu votre publication « ${pub.title} » et je souhaite échanger pour mon événement.`)}`}
                      className="p-2 rounded-xl border border-gray-200 hover:bg-white text-gray-700"
                      title="Échanger en direct"
                    >
                      <MessageSquare size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─────────────── 3. FORMULE PREMIUM : GESTION CENTRALISÉE DES DEVIS RÉSERVÉE GOLD ─────────────── */}
      {!isGold ? (
        <section className="bg-white rounded-3xl border border-[#ecdcc8] p-6 sm:p-10 shadow-sm text-center max-w-3xl mx-auto my-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#fbf7f0] border border-[#b8924a]/30 text-[#8f6f33] mx-auto flex items-center justify-center shadow-xs">
            <Lock size={28} />
          </div>
          <div>
            <div className="inline-block bg-[#1f150e] text-[#f5dfaa] text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-md mb-2 shadow-xs">
              INVITATION + SUIVI DES RÉPONSES
            </div>
            <h3 className="font-serif text-2xl font-bold text-gray-900">
              Formule Premium Activée
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto mt-2 leading-relaxed">
              Votre formule Premium inclut l&apos;envoi illimité de vos invitations haute couture, le suivi complet des réponses (RSVP) et le livre d&apos;or. Pour centraliser vos devis, comparer automatiquement les offres prestataires et suivre les acomptes réglés, passez à la <strong>Formule Gold VIP (Tout-en-un)</strong>.
            </p>
          </div>
          <Link
            href={`/dashboard/events/${event.id}/settings`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#b8924a] to-[#8f6f33] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-110 transition cursor-pointer"
          >
            <Sparkles size={14} /> <span>Évoluer vers la Formule Gold VIP</span>
          </Link>
        </section>
      ) : (
        <>

      {/* 3 Onglets sur la même ligne : 1er Annuaire Evenium, 2ème Prestataires Evenium, 3ème Prestataires Externes */}
      <div className="flex items-center gap-2 sm:gap-6 border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar py-1">
        {/* 1ER : Annuaire Evenium */}
        <Link
          href={`/dashboard/events/${event.id}/prestataires/catalogue`}
          className="pb-3 text-xs sm:text-sm font-bold text-[#b8924a] hover:text-[#8f6f33] transition-colors relative flex items-center gap-2 shrink-0 group whitespace-nowrap"
        >
          <div className="w-6 h-6 rounded-lg bg-[#b8924a]/10 text-[#b8924a] flex items-center justify-center group-hover:bg-[#b8924a] group-hover:text-white transition-colors shrink-0">
            <Search size={13} />
          </div>
          <span>Annuaire Evenium</span>
          <span className="text-[10px] bg-[#b8924a]/10 text-[#8f6f33] px-2 py-0.5 rounded-full font-bold border border-[#b8924a]/20">
            Explorer
          </span>
        </Link>

        {/* 2EME : Prestataires Evenium */}
        <button
          type="button"
          onClick={() => setActiveTab('evenium')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-colors relative flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
            activeTab === 'evenium' ? 'text-black' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Prestataires Evenium</span>
          <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-semibold ${
            activeTab === 'evenium' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {myPrestataires.filter(p => p.isPlatformProvider).length}
          </span>
          {activeTab === 'evenium' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full"></span>
          )}
        </button>

        {/* 3EME : Prestataires Externes */}
        <button
          type="button"
          onClick={() => setActiveTab('externe')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-colors relative flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
            activeTab === 'externe' ? 'text-black' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Prestataires Externes</span>
          <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-semibold ${
            activeTab === 'externe' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {myPrestataires.filter(p => !p.isPlatformProvider).length}
          </span>
          {activeTab === 'externe' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full"></span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPrestataires
            .filter((p) => activeTab === 'evenium' ? p.isPlatformProvider : !p.isPlatformProvider)
            .map((p: any, idx: number) => (
            <div key={idx} className={`bg-white p-6 rounded-2xl border ${p.isPlatformProvider ? 'border-gray-100' : 'border-gray-200 border-dashed'} shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col group hover:border-[#b8924a]/30 transition-all`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center font-serif text-[10px] font-bold leading-tight ${p.isPlatformProvider ? 'bg-gray-100 text-[#8f6f33]' : 'bg-gray-100 text-gray-400'}`}>
                    {p.name.substring(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500">{p.role}</p>
                      {p.isPlatformProvider ? (
                        <span className="bg-[#f5eee1] text-[#8f6f33] text-[9px] uppercase px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-bold">
                          <CheckCircle size={8}/> Evenium
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-[9px] uppercase px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-1">
                          <ExternalLink size={8}/> Externe
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-black">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                {p.isPlatformProvider ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star size={14} className="fill-[#b8924a] text-[#b8924a]" />
                    <span className="font-medium">{p.rating}</span>
                    <span className="text-gray-400 text-xs">(Avis Evenium)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-400 italic">
                    Non évalué (Prestataire hors plateforme)
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} className="text-gray-400" />
                  {p.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Store size={14} className="text-gray-400" />
                  Coût estimé : <span className="font-semibold text-black">{p.cost}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  p.status === "Confirmé" ? "bg-green-50 text-green-700" :
                  p.status === "Devis envoyé" ? "bg-blue-50 text-blue-700" :
                  "bg-amber-50 text-amber-700"
                }`}>
                  {p.status === "Confirmé" && <CheckCircle size={12} />}
                  {p.status === "Devis envoyé" && <CheckCircle size={12} />}
                  {p.status === "En attente" && <Clock size={12} />}
                  {p.status}
                </span>
                
                
                <div className="flex items-center gap-3">
                  {p.devis && (
                    <button 
                      onClick={() => {
                        setSelectedDevis(p.devis);
                        setDevisProviderName(p.name);
                        setIsDevisOpen(true);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                        p.devis.status === 'Accepté' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-[#b8924a] text-white hover:bg-[#8f6f33]'
                      }`}
                    >
                      {p.devis.status === 'Accepté' ? 'Devis accepté' : 'Voir le devis'}
                    </button>
                  )}
                  {p.isPlatformProvider && (
                    <>
                      <button
                        type="button"
                        onClick={() => setReviewTarget({ id: p.prestataire_id || p.id, name: p.name, role: p.role })}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-[#8f6f33] border border-[#b8924a]/30 hover:bg-amber-100 text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Donner une note et un avis à ce prestataire"
                      >
                        <Star size={12} className="fill-[#b8924a]" /> Noter
                      </button>
                      <button onClick={() => { setSelectedProvider(p); }} className="text-xs font-medium text-gray-500 hover:text-black transition-colors cursor-pointer">
                        Voir profil
                      </button>
                    </>
                  )}
                  {p.status === 'En attente' && (
                    <>
                      <button 
                        onClick={() => {
                          setDemandeToModify(p);
                          setNewBudget(p.cost.replace(/\D/g,''));
                          setIsModifyModalOpen(true);
                        }}
                        className="text-xs font-bold text-gray-500 hover:text-black bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Modifier le budget
                      </button>
                      <button 
                        onClick={() => handleCancelDemande(p.demande_id)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Annuler l'envoi
                      </button>
                    </>
                  )}
                  {p.isPlatformProvider ? (
                    <Link 
                      href={`/dashboard/messages?contactId=${p.prestataire_id || ''}&contactName=${encodeURIComponent(p.name || '')}&eventName=${encodeURIComponent(event.name || '')}&eventType=${encodeURIComponent(event.type || '')}`} 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5eee1] text-[#8f6f33] rounded-lg text-xs font-bold hover:bg-[#e4d8c4] transition-colors cursor-pointer"
                    >
                      <MessageCircle size={14} /> Contacter
                    </Link>
                  ) : (
                    <a 
                      href={`https://api.whatsapp.com/send?${p.phone && p.phone !== 'Non renseigné' ? `phone=${p.phone.replace(/[^0-9]/g, '')}&` : ''}text=${encodeURIComponent(`Bonjour ${p.name}, je vous contacte au sujet de mon événement "${event.name}" sur Evenium.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Empty state / Add new */}
          <Link href={`/dashboard/events/${event.id}/prestataires/catalogue`} className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[250px] hover:bg-gray-100 hover:border-[#b8924a] hover:text-[#8f6f33] transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#8f6f33] mb-4 shadow-sm transition-colors">
              <Search size={24} />
            </div>
            <h3 className="font-medium text-gray-900 mb-1 group-hover:text-[#8f6f33] transition-colors">Besoin d'un autre service ?</h3>
            <p className="text-xs text-gray-500 max-w-[200px]">Trouvez le prestataire idéal parmi notre catalogue certifié Evenium.</p>
          </Link>
        </div>
      )}

      {/* Modal du Profil Prestataire (identique au catalogue) */}
      {selectedProvider && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProvider(null);
          }}
        >
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="h-64 bg-gray-200 relative">
              <button 
                onClick={() => setSelectedProvider(null)}
                className="absolute top-4 right-4 bg-white/50 hover:bg-white text-black p-2 rounded-full transition-colors z-10"
              >
                <Plus size={24} className="rotate-45" />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-6 left-8 text-white">
                <div className="text-sm font-bold text-[#b8924a] uppercase tracking-wider mb-2">{selectedProvider.role}</div>
                <h2 className="font-serif text-4xl font-bold mb-2">{selectedProvider.name}</h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1"><Star size={16} className="fill-[#b8924a] text-[#b8924a]" /> {selectedProvider.rating}/5</span>
                  <span className="flex items-center gap-1"><MapPin size={16} /> {selectedProvider.zone}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">À propos</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedProvider.description}</p>
                  </div>
                  <RubriquesView value={selectedProvider.rubriques} />
                  
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Star size={18} className="text-[#b8924a]" />
                      Catalogue & Services
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedProvider.services && selectedProvider.services.length > 0 ? (
                        selectedProvider.services.map((service: any) => (
                          <div 
                            key={service.id} 
                            className="border border-gray-100 rounded-2xl overflow-hidden hover:border-[#b8924a]/50 hover:shadow-lg transition-all bg-white flex flex-col group"
                          >
                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                              {service.image_url ? (
                                <img src={service.image_url} alt={service.nom_service} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <ImageIcon size={40} />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                              <span className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)] truncate bg-[#b8924a] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                                {offerTagLine(service)}
                              </span>
                              <div className="absolute bottom-3 left-3 right-3 text-white">
                                <span className="font-bold text-[#b8924a] text-sm block mb-1">{service.type_prix || 'À partir de'} {service.prix_base ? `${Number(service.prix_base).toLocaleString()} FCFA` : 'Sur devis'}</span>
                                <h4 className="font-bold text-lg leading-tight line-clamp-1" title={service.nom_service}>{service.nom_service}</h4>
                              </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                              <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1 leading-relaxed">{service.description}</p>
                              
                              <div className="flex gap-4 mb-5">
                                {service.infos_pratiques?.capacite && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                                    <Users size={14} className="text-[#b8924a]" /> {service.infos_pratiques.capacite}
                                  </div>
                                )}
                                {service.infos_pratiques?.duree && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                                    <Clock size={14} className="text-[#b8924a]" /> {service.infos_pratiques.duree}
                                  </div>
                                )}
                                {service.zones && service.zones.length > 0 && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                                    <MapPin size={14} className="text-[#b8924a]" /> {service.zones[0]} {service.zones.length > 1 && `+${service.zones.length - 1}`}
                                  </div>
                                )}
                              </div>
                              
                              <div className="mt-auto">
                                <button 
                                  onClick={() => setSelectedServiceForDetails(service)}
                                  className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-xs rounded-xl border border-gray-200 transition-colors text-center"
                                >
                                  Voir détails du catalogue
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic col-span-full">Aucun catalogue disponible.</p>
                      )}
                    </div>
                  </div>

                  {selectedProvider.gallery && selectedProvider.gallery.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ImageIcon size={18} className="text-[#b8924a]" />
                        Galerie (Portfolio)
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedProvider.gallery.map((url: string, idx: number) => (
                          <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                            <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h4 className="font-bold mb-4">Informations</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Tarifs</div>
                        <div className="font-semibold text-sm">{selectedProvider.priceRange}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Contact</div>
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          <Phone size={14} className="text-gray-400" /> {selectedProvider.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedProvider(null)}
                    className="w-full py-4 text-gray-500 hover:text-black font-semibold text-sm"
                  >
                    Fermer la vue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED CATALOGUE MODAL */}
      {selectedServiceForDetails && (
        <div 
          className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedServiceForDetails(null);
          }}
        >
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative">
            <button 
              onClick={() => setSelectedServiceForDetails(null)}
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2.5 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>
            
            <div className="overflow-y-auto flex-1 pb-6">
              <div className="h-80 bg-gray-100 relative">
                {selectedServiceForDetails.image_url ? (
                  <img src={selectedServiceForDetails.image_url} alt={selectedServiceForDetails.nom_service} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-3">
                    <ImageIcon size={64} />
                    <span>Image non disponible</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white pr-8">
                  <span className="bg-[#b8924a] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded shadow-sm mb-4 inline-block">
                    {offerTagLine(selectedServiceForDetails, 4)}
                  </span>
                  <h2 className="font-serif text-4xl md:text-5xl font-bold mb-2 leading-tight">{selectedServiceForDetails.nom_service}</h2>
                  <p className="text-[#b8924a] font-semibold text-xl">{selectedServiceForDetails.type_prix || 'À partir de'} {selectedServiceForDetails.prix_base ? `${Number(selectedServiceForDetails.prix_base).toLocaleString()} FCFA` : 'Sur devis'}</p>
                </div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-12">
                {selectedServiceForDetails.description && (
                  <div>
                    <p className="text-gray-600 text-lg leading-relaxed">{selectedServiceForDetails.description}</p>
                  </div>
                )}

                {selectedServiceForDetails.inclus && selectedServiceForDetails.inclus.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-6 border-b border-gray-100 pb-3">Ce qui est inclus</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedServiceForDetails.inclus.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-gray-700">
                          <CheckCircle size={20} className="text-[#b8924a] shrink-0 mt-0.5" />
                          <span className="font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedServiceForDetails.options && selectedServiceForDetails.options.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-6 border-b border-gray-100 pb-3">Options supplémentaires</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedServiceForDetails.options.map((opt: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm text-gray-700 bg-[#f5eee1] p-4 rounded-xl border border-[#e4d8c4]">
                          <span className="font-bold">{opt.name}</span>
                          <span className="font-semibold text-[#8f6f33]">{opt.price ? `+ ${Number(opt.price).toLocaleString('fr-FR')} FCFA` : 'Sur devis'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedServiceForDetails.infos_pratiques?.capacite || selectedServiceForDetails.infos_pratiques?.duree || (selectedServiceForDetails.zones && selectedServiceForDetails.zones.length > 0)) && (
                  <div>
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-6 border-b border-gray-100 pb-3">Informations pratiques</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedServiceForDetails.zones && selectedServiceForDetails.zones.length > 0 && (
                        <div className="flex flex-col gap-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-2 mb-1 text-gray-400">
                            <MapPin size={16} />
                            <p className="text-[10px] uppercase tracking-wider font-bold">Zones</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">{selectedServiceForDetails.zones.join(', ')}</p>
                        </div>
                      )}
                      {selectedServiceForDetails.infos_pratiques?.capacite && (
                        <div className="flex flex-col gap-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-2 mb-1 text-gray-400">
                            <Users size={16} />
                            <p className="text-[10px] uppercase tracking-wider font-bold">Capacité</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">{selectedServiceForDetails.infos_pratiques.capacite}</p>
                        </div>
                      )}
                      {selectedServiceForDetails.infos_pratiques?.duree && (
                        <div className="flex flex-col gap-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-2 mb-1 text-gray-400">
                            <Clock size={16} />
                            <p className="text-[10px] uppercase tracking-wider font-bold">Durée</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">{selectedServiceForDetails.infos_pratiques.duree}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <RubriquesView value={selectedServiceForDetails.infos_pratiques?.rubriques} />

                {selectedServiceForDetails.gallery && selectedServiceForDetails.gallery.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-6 border-b border-gray-100 pb-3">Aperçus de l'offre</h3>
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 snap-x">
                      {selectedServiceForDetails.gallery.map((url: string, idx: number) => (
                        <img 
                          key={idx} 
                          src={url} 
                          alt={`Gallery ${idx}`} 
                          className="h-32 w-32 object-cover rounded-2xl snap-start shrink-0 border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImages(selectedServiceForDetails.gallery);
                            setLightboxIndex(idx);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal d'examen de Devis */}
      {isDevisOpen && selectedDevis && (() => {
        const currentProvider = myPrestataires.find(p => p.devis?.id === selectedDevis.id);
        
        const safeDateShort = (dateStr: string | null | undefined) => {
          if (!dateStr) return "Non défini";
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return "Non défini";
          return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
        };

        const safeDateLong = (dateStr: string | null | undefined) => {
          if (!dateStr) return "Non défini";
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return "Non défini";
          return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        };

        return (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDevisOpen(false);
          }}
        >
          <div className="bg-[#fbf7f0] rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-[#e4d8c4]/50 shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative bg-white">
              <button 
                onClick={() => setIsDevisOpen(false)} 
                className="absolute top-6 right-6 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors p-2.5 bg-white rounded-full shadow-sm border border-gray-200 z-10"
                aria-label="Fermer"
              >
                <X size={20} strokeWidth={2.5} />
              </button>

              <div className="pr-12">
                <h3 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Proposition de devis</h3>
                <p className="text-gray-500 text-sm md:text-base">Détail de la proposition de votre prestataire</p>
              </div>
              
              <div className="bg-[#f5eee1] border border-[#e4d8c4] rounded-2xl p-4 flex flex-col gap-1.5 text-xs text-gray-700 min-w-[240px]">
                <div className="flex items-center gap-2 font-bold text-[#8f6f33] mb-1.5 bg-white px-3 py-1.5 rounded-lg w-max shadow-sm">
                  <FileText size={14} /> Devis N° {selectedDevis.reference || 'Non défini'}
                </div>
                <div className="px-1">Émis le : {safeDateShort(selectedDevis.created_at)}</div>
                {selectedDevis.valid_until && (
                  <div className="px-1">Valable jusqu'au : {safeDateShort(selectedDevis.valid_until)}</div>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <button 
                    onClick={() => handleDownloadDevisPDF(selectedDevis)}
                    disabled={isDownloadingPDF}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#b8924a]/30 text-[#8f6f33] hover:bg-[#8f6f33] hover:text-white transition-colors px-3 py-2 rounded-xl font-bold shadow-sm cursor-pointer disabled:opacity-60"
                    title="Télécharger en PDF"
                  >
                    <Download size={14} className={isDownloadingPDF ? "animate-bounce" : ""} /> 
                    {isDownloadingPDF ? "Génération..." : "Télécharger"}
                  </button>
                  <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center justify-center p-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors rounded-xl font-bold shadow-sm cursor-pointer"
                    title="Partager"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 md:p-8 space-y-8 overflow-y-auto bg-[#fbf7f0] flex-1">
              
              {/* Informations Prestataire */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center shadow-sm">
                    <Store className="text-gray-300" size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className="font-bold text-xl md:text-2xl text-gray-900">{devisProviderName}</h4>
                      {currentProvider?.isPlatformProvider && (
                        <span className="bg-[#f5eee1] text-[#8f6f33] text-[10px] md:text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 border border-[#e4d8c4]">
                          <CheckCircle size={12} /> Prestataire vérifié
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-1.5">{currentProvider?.role || "Prestataire événementiel"}</p>
                    {currentProvider?.zone && (
                      <p className="text-gray-500 text-sm flex items-center gap-1.5"><MapPin size={14} /> {currentProvider.zone}</p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsDevisOpen(false);
                    if (currentProvider) {
                      setSelectedProvider(currentProvider);
                    }
                  }}
                  className="px-5 py-2.5 border border-[#8f6f33] text-[#8f6f33] rounded-full text-sm font-semibold hover:bg-[#f5eee1] transition-colors whitespace-nowrap"
                >
                  Voir le profil &gt;
                </button>
              </div>

              {/* Informations Événement */}
              <div className="bg-[#f5eee1] rounded-2xl p-6 border border-[#e4d8c4]/50">
                <h5 className="font-bold text-gray-900 mb-5">Votre événement</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {event?.type && (
                    <div>
                      <Calendar size={20} className="text-[#8f6f33] mb-2" />
                      <p className="text-xs text-gray-500 mb-1">Type d'événement</p>
                      <p className="font-bold text-gray-900">{event.type}</p>
                    </div>
                  )}
                  {event?.date && (
                    <div>
                      <Calendar size={20} className="text-[#8f6f33] mb-2" />
                      <p className="text-xs text-gray-500 mb-1">Date de l'événement</p>
                      <p className="font-bold text-gray-900">{safeDateLong(event.date)}</p>
                    </div>
                  )}
                  {event?.location && (
                    <div>
                      <MapPin size={20} className="text-[#8f6f33] mb-2" />
                      <p className="text-xs text-gray-500 mb-1">Lieu</p>
                      <p className="font-bold text-gray-900">{event.location}</p>
                    </div>
                  )}
                  {event?.guests && (
                    <div>
                      <Users size={20} className="text-[#8f6f33] mb-2" />
                      <p className="text-xs text-gray-500 mb-1">Nombre d'invités</p>
                      <p className="font-bold text-gray-900">
                        {typeof event.guests === 'object' && event.guests !== null 
                          ? `${event.guests.total || 0} personnes`
                          : `${event.guests} personnes`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Détail des prestations */}
              {selectedDevis.devis_items && selectedDevis.devis_items.length > 0 && (
                <div>
                  <h5 className="font-bold text-xl text-gray-900 mb-4">Détail des prestations</h5>
                  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <div className="grid grid-cols-12 gap-4 bg-gray-50/80 p-4 border-b border-gray-100 font-bold text-xs text-gray-900 tracking-wide">
                      <div className="col-span-12 md:col-span-4">Prestation</div>
                      <div className="col-span-12 md:col-span-3 hidden md:block">Description</div>
                      <div className="col-span-3 md:col-span-1 text-center hidden md:block">Quantité</div>
                      <div className="col-span-4 md:col-span-2 text-right hidden md:block">Prix unitaire</div>
                      <div className="col-span-12 md:col-span-2 md:text-right hidden md:block">Montant</div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {selectedDevis.devis_items.map((item: any) => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-start md:items-center">
                          <div className="col-span-12 md:col-span-4 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#f5eee1] flex items-center justify-center shrink-0 border border-[#e4d8c4]">
                              <Store size={18} className="text-[#8f6f33]" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900 leading-tight">{item.designation}</p>
                              <p className="text-xs text-gray-500 mt-1">{item.unit || "Forfait"}</p>
                            </div>
                          </div>
                          <div className="col-span-12 md:col-span-3 text-xs md:text-sm text-gray-600 md:pl-0 pl-16">
                            {item.description}
                          </div>
                          {/* Desktop view */}
                          <div className="col-span-1 text-sm text-center text-gray-600 hidden md:block">{item.quantity}</div>
                          <div className="col-span-2 text-sm text-right text-gray-600 whitespace-nowrap hidden md:block">{Number(item.unit_price).toLocaleString('fr-FR')} FCFA</div>
                          <div className="col-span-2 text-sm font-bold text-gray-900 text-right whitespace-nowrap hidden md:block">{Number(item.total).toLocaleString('fr-FR')} FCFA</div>
                          
                          {/* Mobile view for amounts */}
                          <div className="col-span-12 flex justify-between items-center text-sm md:hidden pl-16">
                            <span className="text-gray-500">{item.quantity} x {Number(item.unit_price).toLocaleString('fr-FR')} FCFA</span>
                            <span className="font-bold text-gray-900">{Number(item.total).toLocaleString('fr-FR')} FCFA</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Options & Frais annexes */}
              {selectedDevis.devis_options && selectedDevis.devis_options.length > 0 && (
                <div>
                  <h5 className="font-bold text-xl text-gray-900 mb-4">Options & Frais annexes</h5>
                  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <div className="divide-y divide-gray-100">
                      {selectedDevis.devis_options.map((opt: any) => (
                        <div key={opt.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                          <div className="col-span-12 md:col-span-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                              <Plus size={18} className="text-[#8f6f33]" />
                            </div>
                            <p className="font-bold text-sm text-gray-900 leading-tight">{opt.name}</p>
                          </div>
                          <div className="col-span-12 md:col-span-3 text-xs md:text-sm text-gray-600 md:pl-0 pl-16">
                            Option supplémentaire
                          </div>
                          <div className="col-span-1 text-sm text-center text-gray-600 hidden md:block">1</div>
                          <div className="col-span-2 text-sm text-right text-gray-600 whitespace-nowrap hidden md:block">{opt.is_included ? "-" : `${Number(opt.price).toLocaleString('fr-FR')} FCFA`}</div>
                          <div className="col-span-12 md:col-span-2 text-sm font-bold text-gray-900 text-right whitespace-nowrap pl-16 md:pl-0">
                            {opt.is_included ? <span className="text-green-600">Inclus</span> : `${Number(opt.price).toLocaleString('fr-FR')} FCFA`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {/* Conditions du devis */}
                <div className="bg-[#f5eee1] p-6 md:p-8 rounded-3xl border border-[#e4d8c4] flex flex-col h-full">
                  <h6 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <FileText size={20} className="text-[#8f6f33]" /> Conditions du devis
                  </h6>
                  <ul className="space-y-4">
                    {selectedDevis.valid_until && (
                      <li className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                        <CheckCircle size={18} className="text-[#8f6f33] shrink-0 mt-0.5" /> 
                        <span>Devis valable jusqu'au {safeDateShort(selectedDevis.valid_until)}</span>
                      </li>
                    )}
                    {selectedDevis.deposit_amount > 0 && (
                      <li className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                        <CheckCircle size={18} className="text-[#8f6f33] shrink-0 mt-0.5" /> 
                        <span>Acompte de {selectedDevis.deposit_type === 'percentage' ? `${selectedDevis.deposit_amount} %` : `${Number(selectedDevis.deposit_amount).toLocaleString('fr-FR')} FCFA`} à la confirmation</span>
                      </li>
                    )}
                    {(selectedDevis.notes || selectedDevis.description) && (
                      <li className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                        <CheckCircle size={18} className="text-[#8f6f33] shrink-0 mt-0.5" /> 
                        <span className="whitespace-pre-wrap">{selectedDevis.notes || selectedDevis.description}</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Financial Summary */}
                <div className="bg-[#f5eee1] p-6 md:p-8 rounded-3xl border border-[#e4d8c4] flex flex-col h-full">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Sous-total HT</span>
                      <span>{Number(selectedDevis.subtotal || selectedDevis.amount || 0).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    {selectedDevis.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Réduction ({selectedDevis.discount_type === 'percentage' ? `${selectedDevis.discount}%` : 'Fixe'})</span>
                        <span>- {selectedDevis.discount_type === 'percentage' ? Number((selectedDevis.subtotal || 0) * (selectedDevis.discount / 100)).toLocaleString('fr-FR') : Number(selectedDevis.discount).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    )}
                    {selectedDevis.extra_fees > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Frais annexes</span>
                        <span>{Number(selectedDevis.extra_fees).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-[#e4d8c4] border-b border-[#e4d8c4] py-5 my-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-xl tracking-wide uppercase">Total TTC</span>
                      <span className="font-serif font-bold text-[#8f6f33] text-3xl">{Number(selectedDevis.total || selectedDevis.amount || 0).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>

                  {selectedDevis.deposit_amount > 0 && (
                    <div className="space-y-3 mt-6">
                      <div className="flex justify-between text-sm text-gray-700 font-medium">
                        <span className="flex items-center gap-2"><Lock size={16} className="text-[#8f6f33]"/> Acompte à la réservation ({selectedDevis.deposit_type === 'percentage' ? `${selectedDevis.deposit_amount} %` : 'Fixe'})</span>
                        <span className="font-bold text-gray-900">{selectedDevis.deposit_type === 'percentage' ? Number((selectedDevis.total || selectedDevis.amount || 0) * (selectedDevis.deposit_amount / 100)).toLocaleString('fr-FR') : Number(selectedDevis.deposit_amount).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-700">
                        <span className="pl-6">Solde restant</span>
                        <span className="font-bold text-gray-900">{Number((selectedDevis.total || selectedDevis.amount || 0) - (selectedDevis.deposit_type === 'percentage' ? ((selectedDevis.total || selectedDevis.amount || 0) * (selectedDevis.deposit_amount / 100)) : selectedDevis.deposit_amount)).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Historique des versions du devis */}
              <div className="mt-8 pt-6 border-t border-stone-200">
                <DevisVersionHistory 
                  devisId={selectedDevis.id} 
                  currentVersion={selectedDevis.version || 1}
                  currentTotal={Number(selectedDevis.total || selectedDevis.amount || 0)}
                />
              </div>

              {/* Statut Alerte si Révision demandée */}
              {selectedDevis.status === 'Révision demandée' && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                  <RefreshCw size={18} className="text-amber-600 animate-spin-slow shrink-0" />
                  <p className="text-xs text-amber-800">
                    <span className="font-bold">Demande de révision en cours :</span> Votre demande d'ajustement a bien été transmise au prestataire. Vous recevrez une notification dès qu'une nouvelle version sera disponible.
                  </p>
                </div>
              )}

              {/* Actions */}
              {selectedDevis.status === 'Accepté' ? (
                <div className="bg-green-50 text-green-800 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold border border-green-200 mt-8">
                  <CheckCircle size={32} className="text-green-600 mb-2" />
                  <span className="text-lg">Ce devis a été accepté !</span>
                  <span className="text-sm font-normal text-green-700 text-center">Vous pouvez retrouver le prestataire dans vos messages pour organiser la suite.</span>
                </div>
              ) : selectedDevis.status === 'Refusé' ? (
                <div className="bg-red-50 text-red-800 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold border border-red-200 mt-8">
                  <X size={32} className="text-red-600 mb-2" />
                  <span className="text-lg">Ce devis a été décliné</span>
                  <span className="text-sm font-normal text-red-700 text-center">Vous pouvez toujours échanger avec le prestataire dans la messagerie.</span>
                </div>
              ) : (
                <div className="pt-4 mt-8">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <button 
                      disabled={isProcessing}
                      onClick={() => {
                        if (confirm("Êtes-vous sûr de vouloir refuser ce devis ?")) {
                          handleDevisResponse('Refusé');
                        }
                      }}
                      className="w-full sm:w-auto px-4 sm:px-6 lg:px-8 py-3.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                      Refuser
                    </button>
                    <button 
                      disabled={isProcessing}
                      onClick={() => setIsRevisionModalOpen(true)}
                      className="w-full sm:w-auto px-4 sm:px-6 lg:px-8 py-3.5 border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
                    >
                      <RefreshCw size={16} className="text-[#8f6f33]" />
                      {(selectedDevis.version || 1) > 1 ? 'Nouvelle révision' : 'Demander une révision'}
                    </button>
                    <button 
                      disabled={isProcessing}
                      onClick={() => handleDevisResponse('Accepté')}
                      className="w-full sm:w-auto px-5 sm:px-8 lg:px-10 py-3.5 bg-[#A87B2D] hover:bg-[#8A6525] text-white rounded-xl font-bold transition-colors shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} /> {isProcessing ? 'En cours...' : ((selectedDevis.version || 1) > 1 ? 'Accepter le devis révisé' : 'Valider le devis')}
                    </button>
                  </div>
                  <p className="text-xs text-center text-gray-400 mt-4">
                    En validant ce devis, vous confirmez votre accord avec la proposition du prestataire.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* Modal Complète de Révision de Devis */}
      {selectedDevis && (
        <QuoteRevisionModal
          isOpen={isRevisionModalOpen}
          onClose={() => setIsRevisionModalOpen(false)}
          onSuccess={() => {
            setIsDevisOpen(false);
            fetchDemandes();
          }}
          devis={selectedDevis}
        />
      )}

      {/* Modify Modal */}
      {isModifyModalOpen && demandeToModify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-serif text-xl font-bold text-gray-900">Modifier le budget estimé</h3>
              <button onClick={() => setIsModifyModalOpen(false)} className="text-gray-400 hover:text-black transition-colors p-1 bg-white rounded-full">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleModifyDemande} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nouveau budget (FCFA)</label>
                <input 
                  type="number" 
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8924a]"
                  placeholder="Ex: 500000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Informations supplémentaires / Modification</label>
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8924a] resize-none"
                  placeholder="Ex: J'aimerais ajouter une option drone..."
                />
                <p className="text-xs text-gray-500 mt-2">Expliquez au prestataire ce que vous souhaitez ajouter ou modifier.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModifyModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 px-4 bg-[#b8924a] hover:bg-[#8f6f33] text-white rounded-xl font-bold transition-colors shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setLightboxImages([])}>
          <button 
            onClick={() => setLightboxImages([])}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
          >
            <X size={24} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxImages.length - 1)); }}
            className="absolute left-6 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
          >
            <ArrowLeft size={24} />
          </button>

          <img 
            src={lightboxImages[lightboxIndex]} 
            alt="Fullscreen view" 
            className="max-w-[90vw] max-h-[90vh] object-contain select-none shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <button 
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev < lightboxImages.length - 1 ? prev + 1 : 0)); }}
            className="absolute right-6 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
          >
            <ArrowLeft size={24} className="rotate-180" />
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm font-medium tracking-widest bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
            {lightboxIndex + 1} / {lightboxImages.length}
          </div>
        </div>
      )}

      {/* Modal Partage Devis */}
      {selectedDevis && (
        <DevisShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          devis={{
            id: selectedDevis.id,
            reference: selectedDevis.reference,
            total: selectedDevis.total,
            eventName: event?.name || event?.type,
            providerName: devisProviderName,
          }}
          shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/dashboard/devis/${selectedDevis.id}` : undefined}
        />
      )}

      {/* Modal Avis & Note Prestataire */}
      {reviewTarget && (
        <LeaveReviewModal
          isOpen={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => {
            fetchDemandes();
          }}
          providerId={reviewTarget.id}
          providerName={reviewTarget.name}
          providerRole={reviewTarget.role}
          eventId={id}
          eventName={event?.name || event?.type}
        />
      )}

      {/* Modale Demande de Devis depuis les Pubs/Boosts & Besoins */}
      {isQuoteModalOpen && (
        <QuoteRequestModal
          isOpen={isQuoteModalOpen}
          onClose={() => {
            setIsQuoteModalOpen(false);
            setQuoteModalProvider(null);
          }}
          event={event}
          provider={quoteModalProvider}
          onSubmitSuccess={() => {
            alert("Votre demande de devis a été transmise au prestataire avec succès !");
            setIsQuoteModalOpen(false);
            setQuoteModalProvider(null);
            if (isGold) fetchDemandes();
          }}
        />
      )}

      </>
    )}

    </div>
  );
}
