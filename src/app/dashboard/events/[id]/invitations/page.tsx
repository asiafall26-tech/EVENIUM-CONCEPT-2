"use client";

import { Send, Edit3, Eye, Sparkles, X, CheckCircle, CheckCircle2, Copy, MessageCircle, RotateCcw, MessageSquare, Users, UserPlus, Search, Trash2, Plus, Clock, XCircle, Phone } from "lucide-react";
import { useState, use, useEffect, useRef, useMemo } from "react";
import { useEvents } from "@/store/EventsContext";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { markRsvpSeen } from "@/store/BadgeStore";
import VeloursEditorModal from "@/components/invitations/velours/VeloursEditorModal";
import { VELOURS_MODEL_ID, seedFromEvent, withDefaults } from "@/components/invitations/velours/content";
import SceauEditorModal from "@/components/invitations/sceau/SceauEditorModal";
import * as sceau from "@/components/invitations/sceau/content";
import IvoireEditorModal from "@/components/invitations/ivoire/IvoireEditorModal";
import * as ivoire from "@/components/invitations/ivoire/content";
import RoseOrEditorModal from "@/components/invitations/rose-or/RoseOrEditorModal";
import * as roseOr from "@/components/invitations/rose-or/content";
import AnniversaireEditorModal from "@/components/invitations/anniversaire/AnniversaireEditorModal";
import CustomEditorModal from "@/components/invitations/custom/CustomEditorModal";
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { fetchCustomModel, isCustomModelId, slugOfModelId, customModelUrl, type CustomModelRow } from "@/lib/customModels";
import * as anniversaire from "@/components/invitations/anniversaire/content";
import { createClient } from "@/utils/supabase/client";
import { generateAccompanimentMessage } from "@/lib/accompanimentMessages";
import SplitStudioEditor from "@/components/studio/SplitStudioEditor";
import EventBreadcrumb from "@/components/dashboard/EventBreadcrumb";
import WishReplyModal, { WishReplyGuest } from "@/components/dashboard/WishReplyModal";
import { getWishRepliesAction } from "@/app/actions/wishReplies";
import WhatsAppShareWidget from "@/components/invitations/WhatsAppShareWidget";

export default function InvitationsDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { events, isLoaded, updateEventInvitation, updateEventInvitationContent, refreshEvents } = useEvents();
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
          setDirectEvent({
            id: data.id,
            name: data.name,
            type: data.type,
            date: data.date || "À définir",
            time: data.time || "À définir",
            location: data.location || "À définir",
            guestsCount: data.guests_count || 0,
            plan: data.plan,
            format: data.format,
            status: data.status,
            invitationModelId: data.invitation_model_id,
            invitationTitle: data.invitation_title,
            invitationMessage: data.invitation_message,
            invitationContent: data.invitation_content ?? null,
            eventDetails: data.event_details ?? null,
            budget: { total: Number(data.budget_total) || 0, spent: 0 },
            guests: { total: data.guests_count || 0, confirmed: 0, pending: 0, declined: 0 },
            tasks: { total: 0, completed: 0 },
            providersCount: 0
          });
          refreshEvents();
        } else {
          // Si non trouvé immédiatement, vérifier l'utilisateur et retenter une fois (évite faux 404 lors des redirections après achat)
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            const { data: retryData } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
            if (retryData) {
              setDirectEvent({
                id: retryData.id,
                name: retryData.name,
                type: retryData.type,
                date: retryData.date || "À définir",
                time: retryData.time || "À définir",
                location: retryData.location || "À définir",
                guestsCount: retryData.guests_count || 0,
                plan: retryData.plan,
                format: retryData.format,
                status: retryData.status,
                invitationModelId: retryData.invitation_model_id,
                invitationTitle: retryData.invitation_title,
                invitationMessage: retryData.invitation_message,
                invitationContent: retryData.invitation_content ?? null,
                eventDetails: retryData.event_details ?? null,
                budget: { total: Number(retryData.budget_total) || 0, spent: 0 },
                guests: { total: retryData.guests_count || 0, confirmed: 0, pending: 0, declined: 0 },
                tasks: { total: 0, completed: 0 },
                providersCount: 0
              });
              refreshEvents();
              return;
            }
          }
          if (isLoaded) {
            setNotFoundTriggered(true);
          }
        }
      } catch {
        if (isLoaded) setNotFoundTriggered(true);
      } finally {
        setLoadingDirect(false);
      }
    };
    fetchDirect();
  }, [id, eventFromContext, isLoaded, supabase, refreshEvents]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showResetPageModal, setShowResetPageModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [accompanimentMsg, setAccompanimentMsg] = useState<string>("");
  const [guestStats, setGuestStats] = useState({ total: 0, confirmed: 0, declined: 0 });

  const [guestsList, setGuestsList] = useState<Array<{ id: string; nom: string; telephone?: string; email?: string; statut_rsvp?: string; message?: string; reply?: string; repliedAt?: string; channel?: string; nombre_accompagnants?: number; created_at?: string }>>([]);

  const guestsWithMessages = useMemo(() => {
    return guestsList.filter((g: any) => g.message && String(g.message).trim().length > 0);
  }, [guestsList]);

  // Guest list filters & search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tous" | "Confirmé" | "En attente" | "Refusé">("Tous");

  // Add Guest Modal State
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [newGuest, setNewGuest] = useState({
    nom: "",
    telephone: "",
    statut_rsvp: "Confirmé",
    nombre_accompagnants: 0,
  });

  // Modal de réponse aux vœux
  const [isWishReplyModalOpen, setIsWishReplyModalOpen] = useState(false);
  const [selectedWishGuest, setSelectedWishGuest] = useState<WishReplyGuest | null>(null);

  const openWishReplyModal = (guest: any) => {
    setSelectedWishGuest({
      id: guest.id,
      name: guest.nom,
      phone: guest.telephone,
      email: guest.email,
      message: guest.message,
      status: guest.statut_rsvp,
      reply: guest.reply,
      repliedAt: guest.repliedAt,
      channel: guest.channel,
    });
    setIsWishReplyModalOpen(true);
  };

  const handleWishReplySaved = (guestId: string, reply: string, repliedAt: string, channel: string) => {
    setGuestsList((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, reply, repliedAt, channel } : g))
    );
  };

  useEffect(() => {
    Promise.all([
      supabase
        .from('guests')
        .select('id, nom, telephone, email, statut_rsvp, message, nombre_accompagnants, created_at')
        .eq('event_id', id)
        .order('created_at', { ascending: false }),
      getWishRepliesAction(id),
    ]).then(([{ data }, repliesMap]) => {
      if (data) {
        const enriched = data.map((g: any) => ({
          ...g,
          nombre_accompagnants: Number(g.nombre_accompagnants || 0),
          reply: g.reponse || repliesMap[g.id]?.reply || "",
          repliedAt: g.reponse_envoyee_le || repliesMap[g.id]?.repliedAt || "",
          channel: repliesMap[g.id]?.channel || "whatsapp",
        }));
        setGuestsList(enriched);
        const conf = data.filter((g: any) => g.statut_rsvp === "Confirmé").length;
        const decl = data.filter((g: any) => g.statut_rsvp === "Refusé").length;
        setGuestStats({ total: data.length, confirmed: conf, declined: decl });
      }
      markRsvpSeen(id);
    });
  }, [id, supabase]);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuest.nom.trim()) return;
    const { data } = await supabase.from('guests').insert([{
      event_id: id,
      nom: newGuest.nom.trim(),
      telephone: newGuest.telephone.trim() || null,
      statut_rsvp: newGuest.statut_rsvp,
      nombre_accompagnants: Number(newGuest.nombre_accompagnants) || 0
    }]).select().single();
    if (data) {
      setGuestsList(prev => [data, ...prev]);
      setIsAddGuestModalOpen(false);
      setNewGuest({ nom: "", telephone: "", statut_rsvp: "Confirmé", nombre_accompagnants: 0 });
      const updated = [data, ...guestsList];
      const conf = updated.filter((g: any) => g.statut_rsvp === "Confirmé").length;
      const decl = updated.filter((g: any) => g.statut_rsvp === "Refusé").length;
      setGuestStats({ total: updated.length, confirmed: conf, declined: decl });
    }
  };

  const handleUpdateStatus = async (guestId: string, newStatus: string) => {
    setGuestsList(prev => prev.map(g => g.id === guestId ? { ...g, statut_rsvp: newStatus } : g));
    await supabase.from('guests').update({ statut_rsvp: newStatus }).eq('id', guestId);
    const updated = guestsList.map(g => g.id === guestId ? { ...g, statut_rsvp: newStatus } : g);
    const conf = updated.filter((g: any) => g.statut_rsvp === "Confirmé").length;
    const decl = updated.filter((g: any) => g.statut_rsvp === "Refusé").length;
    setGuestStats({ total: updated.length, confirmed: conf, declined: decl });
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm("Voulez-vous retirer cet invité de la liste ?")) return;
    setGuestsList(prev => prev.filter(g => g.id !== guestId));
    await supabase.from('guests').delete().eq('id', guestId);
    const updated = guestsList.filter(g => g.id !== guestId);
    const conf = updated.filter((g: any) => g.statut_rsvp === "Confirmé").length;
    const decl = updated.filter((g: any) => g.statut_rsvp === "Refusé").length;
    setGuestStats({ total: updated.length, confirmed: conf, declined: decl });
  };

  const handleRelanceGuest = (guest: any) => {
    const text = generateAccompanimentMessage({
      modelId: event.invitationModelId,
      eventType: event.type,
      eventName: event.name,
      guestName: guest.nom,
      dateFormatted: formatEventDate(event.date),
      time: event.time && event.time !== "À définir" ? event.time : undefined,
      location: event.location && event.location !== "À définir" ? event.location : undefined,
      link: shareUrl,
      tone: "chaleureux",
    });
    const phone = (guest.telephone || "").replace(/[^0-9]/g, "");
    const url = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const filteredGuests = useMemo(() => {
    return guestsList.filter((g) => {
      const matchSearch =
        g.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.telephone && g.telephone.includes(searchQuery));
      const matchStatus = statusFilter === "Tous" || g.statut_rsvp === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [guestsList, searchQuery, statusFilter]);

  const totalAccompagnants = useMemo(() => {
    return guestsList
      .filter((g) => g.statut_rsvp === "Confirmé")
      .reduce((sum, g) => sum + Number((g as any).nombre_accompagnants || 0), 0);
  }, [guestsList]);

  const [invitationData, setInvitationData] = useState({
    title: "",
    message: ""
  });

  // Sync state with event data
  useEffect(() => {
    if (event) {
      setInvitationData({
        title: event.invitationTitle || `Bienvenue à ${event.name}`,
        message: event.invitationMessage || "Nous avons la joie de vous inviter à célébrer cet événement..."
      });
    }
  }, [event]);

  if (loadingDirect && !event) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 text-[#8f6f33]">
        <div className="w-10 h-10 border-3 border-[#b8924a] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Chargement de votre invitation...</p>
      </div>
    );
  }

  if (notFoundTriggered || (!event && !loadingDirect && isLoaded)) {
    return notFound();
  }

  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (event) {
      setShareUrl(`${window.location.origin}/invite/${event.id}`);
    }
  }, [event]);

  // Modèle importé par l'admin (ZIP / HTML) : chargé pour l'aperçu et la personnalisation
  const [customModel, setCustomModel] = useState<CustomModelRow | null>(null);
  useEffect(() => {
    if (!isCustomModelId(event?.invitationModelId)) return;
    fetchCustomModel(createBrowserClient(), slugOfModelId(event.invitationModelId)).then(setCustomModel);
  }, [event?.invitationModelId]);

  const [waTone, setWaTone] = useState<"chaleureux" | "prestige" | "court" | "religieux">("chaleureux");
  const [waCopiedText, setWaCopiedText] = useState(false);

  const formatEventDate = (dateStr?: string) => {
    if (!dateStr || dateStr === "À définir") return "";
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    } catch { }
    return dateStr;
  };

  const generateWhatsAppMessage = (tone: "chaleureux" | "prestige" | "court" | "religieux" = "chaleureux") => {
    return generateAccompanimentMessage({
      serviceType: (event as any).invitation_model_type || (event as any).type,
      eventType: event.type,
      eventName: event.name,
      dateFormatted: formatEventDate(event.date),
      time: event.time,
      location: event.location,
      link: shareUrl,
      tone,
    });
  };

  useEffect(() => {
    if (event?.name && !accompanimentMsg) {
      const defaultTone = event.type?.toLowerCase().includes("mariage") ? "religieux" : "chaleureux";
      setWaTone(defaultTone);
      setAccompanimentMsg(generateWhatsAppMessage(defaultTone));
    }
  }, [event?.name, event?.type, shareUrl]);

  const handleCopyFullMessage = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage(waTone));
    setWaCopiedText(true);
    setTimeout(() => setWaCopiedText(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    await updateEventInvitation(event.id, invitationData.title, invitationData.message);
    setIsSaving(false);
    setIsEditModalOpen(false);
  };

  const handleResetToOriginal = async () => {
    setIsResetting(true);
    try {
      let defaultSeed: Record<string, unknown> = {};
      if (isVelours) defaultSeed = seedFromEvent(event) as unknown as Record<string, unknown>;
      else if (isSceau) defaultSeed = sceau.seedFromEvent(event) as unknown as Record<string, unknown>;
      else if (isIvoire) defaultSeed = ivoire.seedFromEvent(event) as unknown as Record<string, unknown>;
      else if (isRoseOr) defaultSeed = roseOr.seedFromEvent(event) as unknown as Record<string, unknown>;
      else if (isAnniversaire) defaultSeed = anniversaire.seedFromEvent(event) as unknown as Record<string, unknown>;
      else if (isCustom) defaultSeed = { values: {} };

      await updateEventInvitationContent(event.id, defaultSeed);
      setShowResetPageModal(false);
      setResetSuccessMessage("Le modèle a été rétabli à sa version d'origine avec succès. Vous conservez votre modèle et pouvez le personnaliser à nouveau à tout moment sans aucun frais !");
      setTimeout(() => setResetSuccessMessage(null), 6000);
    } catch (e) {
      alert("Erreur lors du rétablissement : " + (e instanceof Error ? e.message : "Erreur inconnue"));
    } finally {
      setIsResetting(false);
    }
  };

  const isVelours = event.invitationModelId === VELOURS_MODEL_ID;
  const isSceau = event.invitationModelId === sceau.SCEAU_MODEL_ID;
  const isIvoire = event.invitationModelId === ivoire.IVOIRE_MODEL_ID;
  const isRoseOr = event.invitationModelId === roseOr.ROSE_OR_MODEL_ID;
  const isAnniversaire = event.invitationModelId === anniversaire.ANNIVERSAIRE_MODEL_ID;
  const isStatic = event.format === "Carte";
  const isCustom = isCustomModelId(event.invitationModelId) && !!customModel;
  const cover = isCustom
    ? customModel?.cover_url ?? null
    : isVelours
      ? "/invit-velours-cover.jpg"
      : isSceau
        ? "/invit-sceau-dor-cover.jpg"
        : isIvoire
          ? "/invit-ivoire-cover.jpg"
          : isRoseOr
            ? "/invit-rose-or-cover.jpg"
            : isAnniversaire
              ? "/invit-anniversaire-cover.jpg"
              : null;

  const getModelName = () => {
    if (isVelours) return "Velours Bordeaux";
    if (isSceau) return "Sceau d'Or Impérial";
    if (isIvoire) return "Ivoire Couture";
    if (isRoseOr) return "Rose Poudrée & Or Impérial";
    if (isAnniversaire) return "Anniversaire Bordeaux & Or";
    if (isCustom && customModel) return customModel.name;
    return event.invitationModelId || "Modèle Exclusif";
  };

  // Fermeture des modales d'invitation avec la touche Échap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") return;
      if (e.key === "Escape") {
        if (isStudioOpen) setIsStudioOpen(false);
        else if (isEditModalOpen) setIsEditModalOpen(false);
        else if (showResetPageModal) setShowResetPageModal(false);
        else if (isShareModalOpen) setIsShareModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isStudioOpen, isEditModalOpen, showResetPageModal, isShareModalOpen]);

  return (
    <div className="max-w-5xl mx-auto w-full relative space-y-5 sm:space-y-6">
      {/* Menu d'échappement & Fil d'Ariane */}
      <EventBreadcrumb eventId={event.id} eventName={event.name} currentPage="Invitations & Liens" />

      {/* En-tête */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#8f6f33]">Invitation</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-gray-900 leading-tight">{event.name}</h1>
        <p className="text-gray-500 text-sm mt-1">Votre invitation est prête : personnalisez-la et partagez le lien avec vos invités.</p>
      </div>

      {/* 1. MON INVITATION + ACTIONS */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="flex gap-4 sm:gap-6 items-start">
          <div className="card-lux w-24 sm:w-36 shrink-0 p-1.5 !rounded-2xl">
            <div className="aspect-[3/4] rounded-xl overflow-hidden relative bg-[#1d120a]">
              <div className="absolute inset-0 flex items-center justify-center text-[#c9a45e] opacity-30">
                <Sparkles size={40} />
              </div>
              {cover && <Image src={cover} alt={getModelName()} fill sizes="144px" className="object-cover" />}
              <div aria-hidden className="absolute inset-1.5 rounded-lg border border-[#e7c97f]/55 pointer-events-none" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full text-[11px] font-semibold">✓ En ligne</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[11px] font-semibold">{event.plan}</span>
              <span className="bg-[#f5eee1] text-[#7a5e2b] px-2 py-0.5 rounded-full text-[11px] font-semibold">
                {event.format === "Animée" ? "Animée · avec musique" : "Carte · sans musique"}
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 mt-2 leading-tight">{getModelName()}</h2>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed hidden sm:block">
              {isStatic
                ? "Votre carte d'invitation digitale est active. Vos invités la consultent et confirment leur présence depuis leur téléphone."
                : "Votre invitation animée est active. Vos invités la découvrent en musique et confirment leur présence depuis leur téléphone."}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {(isVelours || isSceau || isIvoire || isRoseOr || isAnniversaire || isCustom) && (
            <button
              onClick={() => setIsStudioOpen(true)}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#6b1f2a] text-white px-3 py-4 text-sm font-semibold"
            >
              <Edit3 size={20} /> Personnaliser
            </button>
          )}
          <button
            onClick={() => window.open(shareUrl, '_blank')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-black text-white px-3 py-4 text-sm font-semibold"
          >
            <Eye size={20} /> Voir en direct
          </button>
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#25D366] text-white px-3 py-4 text-sm font-semibold"
          >
            <MessageCircle size={20} /> WhatsApp
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-4 text-sm font-semibold border ${copied ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-800 border-gray-200"}`}
          >
            {copied ? <CheckCircle size={20} /> : <Copy size={20} />} {copied ? "Lien copié" : "Copier le lien"}
          </button>
        </div>

        {(isVelours || isSceau || isIvoire || isRoseOr || isAnniversaire || isCustom) && (
          <button
            type="button"
            onClick={() => setShowResetPageModal(true)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:underline"
            title="Rétablir la version originale non modifiée sans aucun rachat"
          >
            <RotateCcw size={13} /> Revenir à la version originale du modèle
          </button>
        )}

        {resetSuccessMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{resetSuccessMessage}</p>
          </div>
        )}
      </section>

      {/* 2. PARTAGE DIRECT & MESSAGE D'ACCOMPAGNEMENT WHATSAPP */}
      <WhatsAppShareWidget
        eventId={event.id}
        eventName={event.name}
        eventType={event.type}
        date={event.date}
        time={event.time}
        location={event.location}
        modelId={event.invitationModelId}
        coverImage={
          (event.invitationContent as any)?.values?.photo ||
          (event.invitationContent as any)?.values?.couple_photo ||
          (event.invitationContent as any)?.photo ||
          (event.invitationContent as any)?.couple_photo ||
          (event as any).cover_url ||
          (event as any).image
        }
        shareUrl={shareUrl}
      />

      {/* 2. SUIVI DES RÉPONSES (RSVP) & GESTION DES INVITÉS */}
      <section id="rsvps" className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8f6f33] font-bold flex items-center gap-1.5">
                <Users size={13} className="text-[#b8924a]" /> Suivi en direct
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-gray-900 mt-1">
              Réponses des Invités (RSVP)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Consultez les confirmations en temps réel, ajoutez vos invités ou relancez-les par WhatsApp.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddGuestModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#281a10] hover:bg-[#1a1008] text-[#f7e7b4] text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
          >
            <UserPlus size={15} className="text-[#c9a45e]" />
            <span>Ajouter un invité</span>
          </button>
        </div>

        {/* Synthèse KPI des confirmations */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-100/90 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Confirmés</span>
            <span className="font-serif text-2xl font-bold text-emerald-800 mt-0.5">{guestStats.confirmed}</span>
            {totalAccompagnants > 0 && (
              <span className="text-[10px] text-emerald-600 font-medium mt-0.5">
                +{totalAccompagnants} accompagnant{totalAccompagnants > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-100 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">En attente</span>
            <span className="font-serif text-2xl font-bold text-amber-800 mt-0.5">
              {Math.max(0, guestStats.total - guestStats.confirmed - guestStats.declined)}
            </span>
            <span className="text-[10px] text-amber-600 font-medium mt-0.5">À relancer</span>
          </div>

          <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-100/90 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-rose-700 block">Déclinés</span>
            <span className="font-serif text-2xl font-bold text-rose-800 mt-0.5">{guestStats.declined}</span>
            <span className="text-[10px] text-rose-500 font-medium mt-0.5">Absents</span>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/70 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Réponses</span>
            <span className="font-serif text-2xl font-bold text-gray-900 mt-0.5">{guestStats.total}</span>
            <span className="text-[10px] text-gray-400 font-medium mt-0.5">Convives enregistrés</span>
          </div>
        </div>

        {/* Barre de Recherche & Filtres Rapides */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/60 text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8924a]/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {(["Tous", "Confirmé", "En attente", "Refusé"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? "bg-[#281a10] text-[#f7e7b4] shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab === "Tous"
                  ? `Tous (${guestsList.length})`
                  : tab === "Confirmé"
                  ? `Confirmés (${guestStats.confirmed})`
                  : tab === "Refusé"
                  ? `Refusés (${guestStats.declined})`
                  : `En attente (${Math.max(0, guestStats.total - guestStats.confirmed - guestStats.declined)})`}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des Invités (Tableau épuré et lisible) */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
          {filteredGuests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fbf7f0] text-gray-600 uppercase text-[10px] tracking-wider border-b border-[#b8924a]/20">
                  <tr>
                    <th className="px-4 py-3 font-bold">Invité</th>
                    <th className="px-4 py-3 font-bold">Contact</th>
                    <th className="px-4 py-3 font-bold text-center">Statut RSVP</th>
                    <th className="px-4 py-3 font-bold text-center">Accompagnants</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredGuests.map((g: any) => (
                    <tr key={g.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#f5eee1] text-[#8f6f33] flex items-center justify-center font-bold text-xs shrink-0">
                            {g.nom.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block">{g.nom}</span>
                            {g.created_at && (
                              <span className="text-[10px] text-gray-400 font-mono">
                                {new Date(g.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-gray-600 font-mono text-[11px]">
                        {g.telephone || <span className="text-gray-300 italic">Non renseigné</span>}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <select
                          value={g.statut_rsvp || "En attente"}
                          onChange={(e) => handleUpdateStatus(g.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                            g.statut_rsvp === "Confirmé"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : g.statut_rsvp === "Refusé"
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          <option value="Confirmé">✓ Confirmé</option>
                          <option value="En attente">⏳ En attente</option>
                          <option value="Refusé">✕ Refusé</option>
                        </select>
                      </td>

                      <td className="px-4 py-3.5 text-center text-gray-700 font-semibold">
                        {g.nombre_accompagnants ? `+${g.nombre_accompagnants}` : "—"}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRelanceGuest(g)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Relancer par WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGuest(g.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50/50">
              <Users size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-xs font-semibold text-gray-700">Aucun invité correspondant</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {searchQuery
                  ? "Modifiez votre recherche ou réinitialisez les filtres."
                  : "Partagez votre lien d'invitation ou ajoutez vos premiers invités manuellement."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 3. LIVRE D'OR · VŒUX & MOTS DOUX REÇUS DES CONVIVES */}
      <section id="livredor" className="bg-gradient-to-br from-[#1c1209] via-[#24170d] to-[#140b06] text-[#f7eedc] rounded-3xl border border-[#c9a45e]/40 shadow-xl p-5 sm:p-7 relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#c9a45e]/15 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4 relative z-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-bold flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#d4af37]" /> Livre d&apos;or officiel
            </p>
            <h3 className="font-serif text-xl sm:text-2xl text-white mt-0.5">
              Mots envoyés aux mariés {guestsWithMessages.length > 0 ? `(${guestsWithMessages.length})` : ""}
            </h3>
            <p className="text-xs text-gray-300 mt-0.5">
              Tous les vœux et félicitations laissés par vos invités. Répondez-leur directement sur WhatsApp en 1 clic.
            </p>
          </div>
        </div>

        {guestsWithMessages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {guestsWithMessages.map((g: any) => (
              <div
                key={g.id}
                className="bg-black/40 border border-[#c9a45e]/30 hover:border-[#c9a45e]/60 rounded-2xl p-4 flex flex-col justify-between transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-sm text-white">{g.nom}</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {g.created_at ? new Date(g.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}
                    </span>
                  </div>

                  <p className="font-serif italic text-sm text-[#f5dfaa] leading-relaxed bg-[#140c06]/60 p-3 rounded-xl border border-[#c9a45e]/20">
                    « {g.message} »
                  </p>

                  {g.reply && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={11} /> Votre réponse envoyée :
                      </span>
                      <p className="text-gray-300 italic text-[11px] leading-relaxed">« {g.reply} »</p>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                  {g.reply ? (
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 size={11} /> Répondu
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400/80">Non répondu</span>
                  )}
                  <button
                    type="button"
                    onClick={() => openWishReplyModal(g)}
                    className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ml-auto"
                  >
                    <MessageCircle size={13} />
                    <span>{g.reply ? "Modifier réponse" : "Répondre sur WhatsApp"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-black/30 border border-[#c9a45e]/20 rounded-2xl p-6 text-center max-w-lg mx-auto relative z-10">
            <span className="text-2xl mb-2 block">💌</span>
            <p className="text-sm font-semibold text-[#f5dfaa] mb-1">
              En attente des premiers mots de vos convives
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">
              Dès qu&apos;un invité confirme sa présence sur votre lien d&apos;invitation et vous laisse un mot doux, il apparaîtra ici en temps réel et vous pourrez lui répondre directement sur WhatsApp en 1 clic.
            </p>
          </div>
        )}
      </section>

      {/* MODAL : AJOUTER UN INVITÉ */}
      {isAddGuestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="font-serif text-lg font-bold text-gray-900">Ajouter un invité</h4>
              <button
                type="button"
                onClick={() => setIsAddGuestModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddGuest} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nom &amp; Prénom *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fatou Sow"
                  value={newGuest.nom}
                  onChange={(e) => setNewGuest({ ...newGuest, nom: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/30"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Numéro WhatsApp / Téléphone</label>
                <input
                  type="text"
                  placeholder="Ex: +221 77 000 00 00"
                  value={newGuest.telephone}
                  onChange={(e) => setNewGuest({ ...newGuest, telephone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Statut RSVP</label>
                  <select
                    value={newGuest.statut_rsvp}
                    onChange={(e) => setNewGuest({ ...newGuest, statut_rsvp: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/30"
                  >
                    <option value="Confirmé">✓ Confirmé</option>
                    <option value="En attente">⏳ En attente</option>
                    <option value="Refusé">✕ Refusé</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Accompagnants</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={newGuest.nombre_accompagnants}
                    onChange={(e) => setNewGuest({ ...newGuest, nombre_accompagnants: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/30"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGuestModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#281a10] hover:bg-[#1a1008] text-[#f7e7b4] font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStudioOpen && (
        <SplitStudioEditor
          modelId={event.invitationModelId || VELOURS_MODEL_ID}
          customModel={customModel}
          eventId={event.id}
          eventName={event.name}
          eventType={event.type}
          shareUrl={shareUrl}
          guests={guestsList}
          isStatic={isStatic}
          initialContent={
            event.invitationContent?.values ??
            event.invitation_content?.values ??
            (typeof event.invitationContent === "object" ? event.invitationContent : null) ??
            (typeof event.invitation_content === "object" ? event.invitation_content : null) ??
            {}
          }
          onSave={async (newContent) => {
            const isCustomModel = isCustomModelId(event.invitationModelId);
            const payload = isCustomModel ? { ...newContent, values: newContent } : newContent;
            await supabase.from('events').update({ invitation_content: payload }).eq('id', event.id);
            setDirectEvent((prev: any) => (prev ? { ...prev, invitationContent: payload, invitation_content: payload } : null));
          }}
          onFinalize={() => {
            setIsStudioOpen(false);
            refreshEvents();
            setResetSuccessMessage("Vos modifications ont été enregistrées avec succès et sont visibles en direct pour vos invités !");
            setTimeout(() => setResetSuccessMessage(null), 5000);
          }}
          onClose={() => {
            setIsStudioOpen(false);
            refreshEvents();
          }}
          finalizeLabel="Enregistrer & Fermer"
        />
      )}

      {/* Modal de rétablissement de la version originale */}
      {showResetPageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowResetPageModal(false);
          }}
        >
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 shadow-xs">
              <RotateCcw size={22} />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">
              Rétablir la version originale ?
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Vous êtes sur le point de rétablir <strong>{getModelName()}</strong> à sa version d'origine sans vos modifications personnalisées.
            </p>
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl mb-6 text-xs text-amber-900 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5 text-amber-950">
                <CheckCircle size={14} className="text-amber-700" />
                <span>Aucun rachat nécessaire</span>
              </p>
              <p className="text-amber-800 leading-relaxed">
                Le modèle reste 100% acquis à votre événement. Vous pouvez le modifier à nouveau à tout moment et autant de fois que vous le souhaitez sans aucun frais.
              </p>
            </div>
            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowResetPageModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 disabled:opacity-50"
              >
                Conserver mes modifications
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleResetToOriginal}
                className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <RotateCcw size={13} className={isResetting ? "animate-spin" : ""} />
                <span>{isResetting ? "Rétablissement…" : "Oui, rétablir l'original"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-xl text-gray-900">Corriger le texte</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-400 hover:text-black rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Titre de l'invitation</label>
                <input
                  type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]"
                  value={invitationData.title} onChange={e => setInvitationData({ ...invitationData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Message</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm h-32 focus:outline-none focus:ring-2 focus:ring-[#b8924a] resize-none"
                  value={invitationData.message} onChange={e => setInvitationData({ ...invitationData, message: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 bg-black text-[#b8924a] py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center"
              >
                {isSaving ? "Enregistrement..." : "Mettre à jour"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal (Option A : Clic-to-Chat Direct) */}
      {isShareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsShareModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#25D366]/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">Partager sur WhatsApp</h3>
                  <p className="text-xs text-gray-500">Envoyez votre invitation interactive à vos contacts ou dans un groupe</p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Lien direct */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Lien de votre invitation
                </label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent text-sm text-gray-700 px-3 outline-none truncate font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                    {copied ? 'Copié' : 'Copier le lien'}
                  </button>
                </div>
              </div>

              {/* Tone / Template Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Style du message
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWaTone("chaleureux")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${waTone === "chaleureux"
                      ? "bg-[#25D366]/10 border-[#25D366] text-[#128C7E]"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    ✨ Chaleureux
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaTone("prestige")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${waTone === "prestige"
                      ? "bg-[#b8924a]/10 border-[#b8924a] text-[#8f6f33]"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    🎩 Prestige
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaTone("court")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${waTone === "court"
                      ? "bg-black text-white border-black"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    ⚡ Express
                  </button>
                </div>
              </div>

              {/* Message Live Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Aperçu du message WhatsApp
                  </label>
                  <span className="text-[11px] text-gray-400">Prêt à envoyer</span>
                </div>
                <div className="p-4 bg-[#EFEAE2] rounded-2xl border border-gray-200/80 shadow-inner text-sm font-sans text-gray-800 whitespace-pre-line leading-relaxed">
                  <div className="bg-white p-3.5 rounded-xl shadow-sm border border-black/5 text-gray-800">
                    {generateWhatsAppMessage(waTone)}
                  </div>
                </div>
              </div>

              {/* Reassurance */}
              <div className="bg-green-50 border border-green-200/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-green-900">
                <span className="text-base leading-none">💡</span>
                <p>
                  <strong>100% Gratuit :</strong> En cliquant sur « Ouvrir WhatsApp », l'application WhatsApp s'ouvre avec votre message pré-rempli. Vous choisissez simplement vos destinataires ou groupes.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleCopyFullMessage}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {waCopiedText ? (
                  <>
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-green-600">Message copié !</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copier tout le message</span>
                  </>
                )}
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(generateWhatsAppMessage(waTone))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2 text-center"
              >
                <MessageCircle size={18} />
                <span>Ouvrir WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Réponse aux Vœux */}
      <WishReplyModal
        isOpen={isWishReplyModalOpen}
        onClose={() => setIsWishReplyModalOpen(false)}
        guest={selectedWishGuest}
        event={{
          id,
          name: event?.name,
          type: event?.type,
        }}
        onReplySaved={handleWishReplySaved}
      />
    </div>
  );
}
