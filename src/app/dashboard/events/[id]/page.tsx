"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, CheckCircle, CheckCircle2, Clock, Wallet, CheckSquare, Sparkles, MapPin, Calendar, Share2, MessageCircle, Eye, Edit3, Copy, Check, ArrowRight, Lock } from "lucide-react";
import { use, useState, useEffect } from "react";
import { useEvents } from "@/store/EventsContext";
import { createClient } from "@/utils/supabase/client";
import { getInvitationModelName } from "@/data/mock/invitations";
import { eventDetailsFromRow, hasExtraDetails, requiresEventDetails } from "@/lib/eventDetails";
import { PrivilegeOffersCarousel } from "@/components/dashboard/PrivilegeOffersCarousel";
import EventBreadcrumb from "@/components/dashboard/EventBreadcrumb";
import WishReplyModal, { WishReplyGuest } from "@/components/dashboard/WishReplyModal";
import { getWishRepliesAction } from "@/app/actions/wishReplies";
import WhatsAppShareWidget from "@/components/invitations/WhatsAppShareWidget";

const formatFrenchDate = (d?: string) => {
  if (!d || d === "À définir") return d || "Date à définir";
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
};

export default function EventDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { events, isLoaded, updateEventPlan, refreshEvents } = useEvents();
  const supabase = createClient();

  const eventFromContext = events.find(e => e.id === id);
  const [directEvent, setDirectEvent] = useState<any>(null);
  const [loadingDirect, setLoadingDirect] = useState(!eventFromContext);
  const [notFoundTriggered, setNotFoundTriggered] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data?.user) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', data.user.id).maybeSingle();
        if (profile?.full_name?.trim()) {
          setUserName(profile.full_name.trim());
        } else if (data.user.user_metadata?.full_name?.trim()) {
          setUserName(data.user.user_metadata.full_name.trim());
        } else if (data.user.email) {
          setUserName(data.user.email.split('@')[0]);
        }
      }
    });
  }, [supabase]);

  const event = eventFromContext || directEvent;

  useEffect(() => {
    if (eventFromContext) {
      setLoadingDirect(false);
      return;
    }

    const fetchDirect = async () => {
      try {
        const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
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

  if (loadingDirect && !event) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 text-[#8f6f33]">
        <div className="w-10 h-10 border-3 border-[#b8924a] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Ouverture de votre événement...</p>
      </div>
    );
  }

  if (notFoundTriggered || (!event && !loadingDirect && isLoaded)) {
    notFound();
  }

  const [budget, setBudget] = useState({ total: 0, spent: 0 });
  const [guests, setGuests] = useState({ total: 0, confirmed: 0, pending: 0 });
  const [tasks, setTasks] = useState({ total: 0, completed: 0 });
  const [recentGuestMessages, setRecentGuestMessages] = useState<any[]>([]);

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
    setRecentGuestMessages(prev =>
      prev.map(g => (g.id === guestId ? { ...g, reply, repliedAt, channel } : g))
    );
  };

  useEffect(() => {
    if (!event) return;

    // Set static initial values from event
    setBudget(prev => ({ ...prev, total: event.budget?.total || 0 }));
    setGuests(prev => ({ ...prev, total: event.guestsCount || 0 }));

    const fetchStats = async () => {
      // Fetch budget spent
      const { data: txs } = await supabase.from('transactions').select('montant').eq('event_id', id).eq('type', 'depense');
      if (txs) {
        setBudget(prev => ({ ...prev, spent: txs.reduce((sum, t) => sum + Number(t.montant), 0) }));
      }

      // Fetch guests stats, messages and saved replies
      const [{ data: gst }, repliesMap] = await Promise.all([
        supabase
          .from('guests')
          .select('id, nom, telephone, email, statut_rsvp, message, created_at')
          .eq('event_id', id)
          .order('created_at', { ascending: false }),
        getWishRepliesAction(id),
      ]);

      if (gst) {
        const confirmed = gst.filter(g => g.statut_rsvp === 'Confirmé').length;
        const pending = gst.filter(g => g.statut_rsvp === 'En attente').length;
        setGuests(prev => ({ ...prev, total: Math.max(prev.total, gst.length), confirmed, pending }));
        setRecentGuestMessages(
          gst
            .filter(g => g.message && String(g.message).trim().length > 0)
            .map((g: any) => ({
              ...g,
              reply: (g as any).reponse || repliesMap[g.id]?.reply || "",
              repliedAt: (g as any).reponse_envoyee_le || repliesMap[g.id]?.repliedAt || "",
              channel: repliesMap[g.id]?.channel || "whatsapp",
            }))
        );
      }

      // Fetch tasks stats
      const { data: tsk } = await supabase.from('tasks').select('is_completed').eq('event_id', id);
      if (tsk) {
        setTasks({
          total: tsk.length,
          completed: tsk.filter(t => t.is_completed).length
        });
      }
    };

    fetchStats();
  }, [id, event?.id]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Menu d'échappement & Fil d'Ariane */}
      <EventBreadcrumb eventId={event.id} eventName={event.name} />

      {/* Event Header avec Message d'accueil clair & Présentation responsive aérée */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 lg:p-8 border border-gray-200/90 shadow-sm mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#b8924a]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        {/* En-tête d'accueil */}
        <div className="relative z-10 mb-4 pb-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8f6f33] flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#b8924a]" /> Espace Organisateur · Tableau de bord
            </span>
          </div>
          <span className="text-[11px] font-medium text-gray-500">
            {userName ? `Bienvenue, ${userName}` : "Événement actif"}
          </span>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-5 sm:gap-6">
          <div className="flex-1 min-w-0">
            {/* Badges Type & Date */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2.5">
              <span className="bg-[#b8924a]/10 text-[#8f6f33] border border-[#b8924a]/25 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {event.type}
              </span>
              <span className="text-gray-600 text-xs sm:text-sm font-medium flex items-center gap-1.5">
                <Calendar size={14} className="text-[#b8924a] shrink-0" />
                {(event as any).end_date && (event as any).end_date !== event.date
                  ? `Du ${formatFrenchDate(event.date)} au ${formatFrenchDate((event as any).end_date)}`
                  : formatFrenchDate(event.date)}
                {event.time && event.time !== "À définir" ? ` à ${event.time}` : ''}
              </span>
            </div>

            {/* Titre de l'événement en pleine largeur */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2.5 break-words">
              {event.name}
            </h1>

            {/* Lieu */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <MapPin size={14} className="text-[#b8924a] shrink-0" />
              <span className="font-medium text-gray-700">{event.location || "Lieu à définir"}</span>
            </div>
          </div>

          {/* Formule & Modèle Badge */}
          <div className="bg-[#fbf7f0] border border-[#b8924a]/30 rounded-2xl p-4 sm:p-5 shrink-0 flex flex-col justify-between sm:min-w-[240px]">
            <div className="flex items-center justify-between sm:justify-end gap-2 mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Formule &amp; Modèle</span>
              <span className="bg-[#b8924a]/15 text-[#8f6f33] px-2 py-0.5 rounded-full text-[10px] font-bold">
                Actif
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#b8924a] font-bold text-sm sm:text-base sm:justify-end">
              <Sparkles size={16} className="shrink-0" />
              <span>Formule {event.plan}</span>
            </div>
            <p className="text-xs text-gray-600 font-medium mt-1 sm:text-right">
              Modèle : <strong className="text-gray-900">{getInvitationModelName(event.invitationModelId)}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────── CARTE PRINCIPALE : DIFFUSION WHATSAPP OFFICIELLE & APERÇU RÉALISTE ─────────────── */}
      <div className="mb-6 sm:mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8f6f33] bg-[#fbf7f0] px-3 py-1 rounded-full border border-[#b8924a]/30">
              Diffusion WhatsApp &amp; Réponses Invités
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mt-2">
              Votre Invitation Officielle Interactive
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/events/${event.id}/invitations`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-[#d4af37] text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Edit3 size={14} />
              <span>Personnaliser l&apos;invitation</span>
            </Link>
          </div>
        </div>

        {/* Widget WhatsApp avec aperçu fidèle et partage 1 clic */}
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
          shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/invite/${event.id}` : `/invite/${event.id}`}
        />
      </div>

      {/* ─────────────── DÉTAILS DE L'ÉVÉNEMENT (saisis à l'achat Premium / Gold, modifiables) ─────────────── */}
      {(() => {
        const d = eventDetailsFromRow(event);
        if (!requiresEventDetails(event.plan) && !d.guestsCount && !d.budget && !hasExtraDetails(d)) return null;
        const facts = [
          { label: "Invités prévus", value: d.guestsCount ? `${Number(d.guestsCount).toLocaleString("fr-FR")} invités` : "" },
          { label: "Date", value: [d.date && new Date(d.date).toString() !== "Invalid Date" ? new Date(d.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : d.date, d.time && `à ${d.time}`].filter(Boolean).join(" ") },
          { label: "Lieu", value: d.location },
          { label: "Budget prévisionnel", value: d.budget ? `${Number(d.budget).toLocaleString("fr-FR")} FCFA` : "" },
        ];
        return (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
            <div className="px-6 sm:px-8 pt-6 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-[#8f6f33]">Votre événement</p>
                <h2 className="font-serif text-2xl text-gray-900 mt-1">Détails de l'événement</h2>
              </div>
              <Link href={`/dashboard/events/${event.id}/settings`} className="shrink-0 text-sm font-semibold text-[#8f6f33] border border-[#b8924a]/40 rounded-lg px-4 py-2 hover:bg-[#f5eee1]">
                Modifier
              </Link>
            </div>
            <dl className="px-6 sm:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-[11px] uppercase tracking-wider text-gray-500">{f.label}</dt>
                  <dd className={`mt-1 text-sm ${f.value ? "font-medium text-gray-900" : "text-gray-400"}`}>{f.value || "À renseigner"}</dd>
                </div>
              ))}
            </dl>
            {hasExtraDetails(d) && (
              <div className="px-6 sm:px-8 pb-6 pt-5 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
                {d.prestationsRecherchees.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">Prestations recherchées</p>
                    <div className="flex flex-wrap gap-1.5">
                      {d.prestationsRecherchees.map((p) => (
                        <span key={p} className="px-3 py-1 rounded-full text-xs bg-[#f5eee1] text-[#7a5e2b] border border-[#e4d8c4]">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                {d.notes && (
                  <div className="md:col-span-2">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500">Informations importantes</p>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{d.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      <div className={`grid grid-cols-1 md:grid-cols-2 ${event.plan === "Gold" ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-6 mb-8`}>
        {/* Formule Card */}
        <Link href={`/dashboard/events/${event.id}/settings`} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col relative overflow-hidden hover:border-[#b8924a]/50 hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-[0.03]">
            <Sparkles size={80} />
          </div>
          <div className="flex justify-between items-start mb-4 text-gray-600 font-medium relative z-10">
            <div className="flex items-center gap-2 group-hover:text-[#8f6f33] transition-colors">
              <Sparkles size={18} className="text-accent" /> Formule {event.plan === "Gold" ? "Gold VIP" : "Premium"}
            </div>
            <span className="bg-accent/10 text-accent px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {event.format === "Animée" ? "Animée · Musique" : "Statique · Sans son"}
            </span>
          </div>
          <div className="mb-2 relative z-10">
            <span className="text-3xl font-semibold">
              {event.plan === "Gold"
                ? (event.format === "Animée" ? "20 000" : "15 000")
                : (event.format === "Animée" ? "10 000" : "7 500")}
            </span>
            <span className="text-gray-500 text-sm ml-1">FCFA</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">Paiement unique réglé</p>

          <ul className="text-xs text-gray-500 space-y-1.5 mt-auto relative z-10">
            {event.plan === "Gold" ? (
              <>
                <li>• Catalogue prestataires certifiés &amp; devis directs</li>
                <li>• Suivi du budget global &amp; dépenses</li>
                <li>• To-do list &amp; Planning Jour J</li>
                <li>• Suivi des réponses RSVP &amp; Livre d&apos;or</li>
              </>
            ) : (
              <>
                <li>• Envoi d&apos;invitations illimité</li>
                <li>• Suivi des réponses (RSVP) en direct</li>
                <li>• Livre d&apos;or &amp; vœux des invités</li>
                <li>• {event.format === "Animée" ? "Musique d'ambiance & galerie photos" : "Carte digitale haute définition"}</li>
              </>
            )}
          </ul>
        </Link>

        {/* Budget Card (Gold Only) */}
        {(() => {
          const isGold = (event.plan || "").toLowerCase() === "gold";
          return isGold ? (
            <Link href={`/dashboard/events/${event.id}/budget`} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col hover:border-[#b8924a]/50 hover:shadow-md transition-all group">
              <div className="flex items-center gap-2 mb-4 text-gray-600 font-medium group-hover:text-[#8f6f33] transition-colors">
                <Wallet size={18} /> Budget &amp; Finances
              </div>
              <div className="mb-2">
                <span className="text-3xl font-semibold">{budget.spent.toLocaleString()}</span>
                <span className="text-gray-500 text-sm ml-1">FCFA dépensés</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Sur un total de {budget.total.toLocaleString()} FCFA</p>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-auto overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${budget.total > 0 ? Math.min(100, (budget.spent / budget.total) * 100) : 0}%` }}
                />
              </div>
            </Link>
          ) : (
            <Link href={`/dashboard/events/${event.id}/budget`} className="bg-gradient-to-br from-[#1c1209] via-[#24170d] to-[#140b06] text-[#f7eedc] rounded-2xl p-6 border border-[#c9a45e]/40 shadow-sm hover:border-[#c9a45e] hover:shadow-lg transition-all flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a45e]/15 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] bg-[#c9a45e]/20 px-2 py-0.5 rounded-full">
                    Formule Gold VIP
                  </span>
                  <Sparkles size={16} className="text-[#d4af37]" />
                </div>
                <h4 className="font-serif text-lg font-bold text-white mb-1 group-hover:text-[#f0d999] transition-colors">
                  Suivi du Budget &amp; Finances
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">
                  Débloquez le suivi du budget, les dépenses réelles, la to-do list et le catalogue de prestataires certifiés.
                </p>
              </div>
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#f0d999]">
                <span>Débloquer la Formule Gold</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })()}

        {/* Guests Card */}
        <Link href={`/dashboard/events/${event.id}/invitations#rsvps`} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-[#b8924a]/50 hover:shadow-md transition-all group flex flex-col">
          <div className="flex items-center justify-between mb-4 text-gray-600 font-medium group-hover:text-[#8f6f33] transition-colors">
            <span className="flex items-center gap-2"><Users size={18} /> Invités ({guests.total})</span>
            <span className="text-[11px] text-[#8f6f33] font-semibold">Suivi RSVP &rarr;</span>
          </div>
          <div className="space-y-4 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-green-600"><CheckCircle size={16} /> Confirmés</span>
              <span className="font-semibold text-green-700">{guests.confirmed}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-amber-500"><Clock size={16} /> En attente</span>
              <span className="font-semibold text-amber-600">{guests.pending}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
            Livre d&apos;or &amp; vœux inclus
          </p>
        </Link>

        {/* Tasks Card (Gold Only) */}
        {(() => {
          const isGold = (event.plan || "").toLowerCase() === "gold";
          return isGold ? (
            <Link href={`/dashboard/events/${event.id}/checklist`} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-[#b8924a]/50 hover:shadow-md transition-all group flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-gray-600 font-medium group-hover:text-[#8f6f33] transition-colors">
                <CheckSquare size={18} /> To-do List &amp; Planning
              </div>
              <div className="mb-2">
                <span className="text-3xl font-semibold">{tasks.completed}</span>
                <span className="text-gray-500 text-sm ml-1">/ {tasks.total} tâches</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{tasks.total - tasks.completed} tâches restantes</p>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-auto overflow-hidden">
                <div
                  className="bg-accent h-2 rounded-full"
                  style={{ width: `${tasks.total > 0 ? (tasks.completed / tasks.total) * 100 : 0}%` }}
                />
              </div>
            </Link>
          ) : (
            <Link href={`/dashboard/events/${event.id}/checklist`} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-[#b8924a]/50 hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 text-gray-500">
                  <span className="flex items-center gap-2 font-medium text-xs"><CheckSquare size={16} /> To-do List &amp; Planning</span>
                  <span className="text-[10px] font-bold text-[#b8924a] bg-[#b8924a]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock size={10} /> Gold
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold text-gray-900 mb-1">
                  Rétroplanning Jour J
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Gérez chaque étape clé de vos préparatifs avec une to-do list sur-mesure.
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#8f6f33] mt-4">
                <span>Découvrir la To-do List</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })()}
      </div>

      {/* VŒUX & MOTS DOUX REÇUS DES INVITÉS */}
      <div className="bg-gradient-to-br from-[#1c1209] via-[#24170d] to-[#140b06] text-[#f7eedc] rounded-3xl border border-[#c9a45e]/40 shadow-xl p-5 sm:p-7 relative overflow-hidden mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-bold flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#d4af37]" /> Livre d&apos;or en direct
            </p>
            <h3 className="font-serif text-xl sm:text-2xl text-white mt-0.5">
              Mots envoyés aux mariés {recentGuestMessages.length > 0 ? `(${recentGuestMessages.length})` : ""}
            </h3>
          </div>
          <Link
            href={`/dashboard/events/${event.id}/invitations#livredor`}
            className="text-xs text-[#f0d999] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Voir tout le livre d&apos;or ({guests.total})</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {recentGuestMessages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recentGuestMessages.slice(0, 4).map((g) => (
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

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
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
                    className="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer ml-auto"
                  >
                    <MessageCircle size={12} />
                    <span>{g.reply ? "Modifier réponse" : "Répondre"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-black/30 border border-[#c9a45e]/20 rounded-2xl p-6 text-center max-w-lg mx-auto">
            <span className="text-2xl mb-2 block">💌</span>
            <p className="text-sm font-semibold text-[#f5dfaa] mb-1">
              En attente des premiers mots de vos convives
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">
              Dès qu&apos;un invité confirme sa présence sur votre lien d&apos;invitation et vous laisse un mot doux, il apparaîtra ici en temps réel et vous pourrez lui répondre directement sur WhatsApp en 1 clic.
            </p>
          </div>
        )}
      </div>

      {/* SÉLECTION PRIVILÈGE & RECOMMANDATIONS POUR CET ÉVÉNEMENT */}
      <div className="mt-8">
        <PrivilegeOffersCarousel
          eventType={event.type}
          zone={event.location}
          title={`Sélection Privilège pour votre ${event.type || "événement"}`}
        />
      </div>

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
