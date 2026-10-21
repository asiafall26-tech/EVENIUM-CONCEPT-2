"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, CheckCircle, Clock, Wallet, CheckSquare, Sparkles, Share2, Download, Lock, Eye, QrCode, ArrowRight, ExternalLink, MessageCircle } from "lucide-react";
import { use, useState, useEffect } from "react";
import { useEvents } from "@/store/EventsContext";
import { createClient } from "@/utils/supabase/client";
import { getInvitationModelName } from "@/data/mock/invitations";
import EventQRCode from "@/components/ui/EventQRCode";
import { eventDetailsFromRow, hasExtraDetails, requiresEventDetails } from "@/lib/eventDetails";

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

  const [copied, setCopied] = useState(false);
  const [budget, setBudget] = useState({ total: 0, spent: 0 });
  const [guests, setGuests] = useState({ total: 0, confirmed: 0, pending: 0 });
  const [tasks, setTasks] = useState({ total: 0, completed: 0 });

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

      // Fetch guests stats
      const { data: gst } = await supabase.from('guests').select('statut_rsvp').eq('event_id', id);
      if (gst) {
        const confirmed = gst.filter(g => g.statut_rsvp === 'Confirmé').length;
        const pending = gst.filter(g => g.statut_rsvp === 'En attente').length;
        setGuests(prev => ({ ...prev, total: Math.max(prev.total, gst.length), confirmed, pending }));
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
  }, [event, id, supabase]);

  const [eventUrl, setEventUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEventUrl(`${window.location.origin}/invite/${id}`);
    }
  }, [id]);

  // Messages WhatsApp pré-rempli
  const waShareText = encodeURIComponent(
    `✨ Vous êtes cordialement invité(e) : ${event.name} !\n\n` +
    `Découvrez votre invitation interactive de prestige et confirmez votre présence ici :\n` +
    `${eventUrl || `/invite/${event.id}`}`
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Event Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
                {event.type}
              </span>
              <span className="text-gray-500 text-sm font-medium">
                {(event as any).end_date && (event as any).end_date !== event.date
                  ? `Du ${event.date} au ${(event as any).end_date}`
                  : event.date}
                {event.time ? ` à ${event.time}` : ''}
              </span>
            </div>
            <h1 className="font-serif text-4xl font-semibold mb-2">{event.name}</h1>
            <p className="text-gray-500">{event.location}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">Formule & Modèle</p>
            <div className="flex items-center justify-end gap-1 text-[#b8924a] font-semibold text-sm">
              <Sparkles size={14} /> Formule {event.plan}
            </div>
            <p className="text-xs text-gray-600 font-medium mt-1">
              Modèle : <strong className="text-gray-900">{getInvitationModelName(event.invitationModelId)}</strong>
            </p>
          </div>
        </div>
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

      {/* ─────────────── CARTE MAJEURE : LIEN OFFICIEL & QR CODE ACTIF ─────────────── */}
      <div className="bg-gradient-to-br from-[#fcfaf7] via-white to-[#fbf7f0] rounded-3xl p-4 sm:p-8 border border-[#D4AF37]/40 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col xl:flex-row items-center gap-6 xl:gap-8 justify-between">
          
          {/* Colonne Gauche : Le QR Code Actif généré dynamiquement */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <EventQRCode
              url={eventUrl || `/invite/${event.id}`}
              eventName={event.name}
              date={event.date}
              size={180}
              showDownloadButtons={true}
            />
          </div>

          {/* Colonne Droite : Titre, lien copiable, WhatsApp et actions directes */}
          <div className="flex-1 w-full min-w-0 space-y-4 text-center xl:text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#fbf7f0] border border-[#b8924a]/30 text-[#8f6f33] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles size={12} className="text-[#b8924a]" />
                Lien &amp; QR Code Actifs
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
                Votre Invitation Interactive est en ligne
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed max-w-xl">
                Transmettez ce lien unique ou partagez votre QR Code officiel. Vos invités peuvent scanner le QR code ou cliquer sur le lien pour ouvrir votre scénographie interactive.
              </p>
            </div>

            {/* Input du lien officiel avec bouton Copier en 1 clic */}
            <div className="bg-white p-2.5 rounded-2xl border border-gray-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full max-w-xl min-w-0 mx-auto xl:mx-0">
              <input
                type="text"
                readOnly
                value={eventUrl || `/invite/${event.id}`}
                className="min-w-0 w-full flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-gray-900 outline-none select-all text-ellipsis"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(eventUrl || `${window.location.origin}/invite/${event.id}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-black hover:bg-gray-800 text-[#b8924a] border border-[#b8924a]/40"
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle size={14} />
                    <span>Lien Copié !</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} />
                    <span>Copier le Lien</span>
                  </>
                )}
              </button>
            </div>

            {/* Boutons d'action rapides : WhatsApp + Tester l'invitation + Personnaliser */}
            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2.5 pt-1">
              <a
                href={`https://api.whatsapp.com/send?text=${waShareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle size={15} />
                <span>Partager sur WhatsApp</span>
              </a>

              <a
                href={`/invite/${event.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Eye size={15} className="text-[#b8924a]" />
                <span>Tester l&apos;invitation</span>
              </a>

              <Link
                href={`/dashboard/events/${event.id}/invitations`}
                className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles size={14} className="text-[#b8924a]" />
                <span>Personnaliser le contenu</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${event.plan === "Gold" ? "lg:grid-cols-4" : "lg:grid-cols-2 max-w-2xl"} gap-6 mb-8`}>
        {/* Formule Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-[0.03]">
            <Sparkles size={80} />
          </div>
          <div className="flex justify-between items-start mb-4 text-gray-600 font-medium relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-accent" /> Formule {event.plan}
            </div>
            <span className="bg-accent/10 text-accent px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {event.format === "Animée" ? "Animée · Musique" : "Statique · Sans son"}
            </span>
          </div>
          <div className="mb-2 relative z-10">
            <span className="text-3xl font-semibold">
              {event.plan === "Standard"
                ? (event.format === "Animée" ? "5 000" : "3 500")
                : event.plan === "Premium"
                  ? (event.format === "Animée" ? "10 000" : "7 500")
                  : (event.format === "Animée" ? "20 000" : "15 000")}
            </span>
            <span className="text-gray-500 text-sm ml-1">FCFA</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">Paiement unique réglé</p>
          
          <ul className="text-xs text-gray-500 space-y-1.5 mt-auto relative z-10">
            {event.plan === "Gold" ? (
              <>
                <li>• Accès prestataires certifiés (0% commission)</li>
                <li>• Suivi du budget global &amp; dépenses</li>
                <li>• To-do list &amp; Planning Jour J</li>
                <li>• Suivi des confirmations RSVP</li>
              </>
            ) : event.plan === "Premium" ? (
              <>
                <li>• Envoi d&apos;invitations illimité</li>
                <li>• Suivi des réponses (RSVP) en direct</li>
                <li>• Programme &amp; GPS Google Maps</li>
                <li>• {event.format === "Animée" ? "Musique d'ambiance & galerie photos" : "Galerie photos enrichie (sans musique)"}</li>
              </>
            ) : (
              <>
                <li>• {event.format === "Animée" ? "Faire-part animé avec musique" : "Carte digitale statique épurée"}</li>
                <li>• Accès Dashboard Organisateur</li>
                <li>• Lien officiel &amp; QR Code actif</li>
                <li>• Partage WhatsApp illimité</li>
              </>
            )}
          </ul>
        </div>

        {/* Budget Card */}
        {event.plan === "Gold" && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-gray-600 font-medium">
              <Wallet size={18} /> Budget
            </div>
            <div className="mb-2">
              <span className="text-3xl font-semibold">{budget.spent.toLocaleString()}</span>
              <span className="text-gray-500 text-sm ml-1">FCFA dépensés</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">Sur un total de {budget.total.toLocaleString()} FCFA</p>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-auto overflow-hidden">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${budget.total > 0 ? (budget.spent / budget.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Guests Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-gray-600 font-medium">
            <Users size={18} /> Invités ({guests.total})
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-green-600"><CheckCircle size={16} /> Confirmés</span>
              <span className="font-semibold text-green-700">{guests.confirmed}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-amber-500"><Clock size={16} /> En attente</span>
              <span className="font-semibold text-amber-600">{guests.pending}</span>
            </div>
          </div>
        </div>

        {/* Tasks Card */}
        {event.plan === "Gold" && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-gray-600 font-medium">
              <CheckSquare size={18} /> To-do List
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
          </div>
        )}
      </div>

      {/* ─────────────── BANNIÈRE D'ÉVOLUTION DE FORMULE (OPTIONNELLE) ─────────────── */}
      {event.plan !== "Gold" && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D4AF37]/35 shadow-xs space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8f6f33] bg-[#fbf7f0] border border-[#b8924a]/30 px-3 py-1 rounded-full">
              Évolution de formule
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mt-2">
              Envie de débloquer le suivi RSVP en direct ou la gestion globale ?
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-2xl">
              Faites évoluer votre événement à tout moment pour collecter automatiquement les confirmations de vos invités ou gérer votre budget et vos prestataires.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {event.plan === "Standard" && (
              <button
                type="button"
                onClick={async () => {
                  await updateEventPlan(event.id, 'Premium');
                }}
                className="p-5 rounded-2xl border-2 border-gray-200 hover:border-[#b8924a] bg-gray-50/50 hover:bg-[#fbf7f0] text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-gray-900 group-hover:text-[#8f6f33]">Formule Premium</span>
                  <span className="text-xs font-bold text-[#b8924a] bg-white px-2.5 py-0.5 rounded-full border border-[#b8924a]/20">+5 000 FCFA</span>
                </div>
                <p className="text-[11px] text-gray-600 mb-2.5 leading-relaxed">
                  Débloquez le suivi en temps réel des confirmations d&apos;invités (RSVP), le programme interactif et les itinéraires GPS.
                </p>
                <span className="text-xs font-bold text-black group-hover:text-[#8f6f33] flex items-center gap-1.5">
                  <span>Passer en Formule Premium</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={async () => {
                await updateEventPlan(event.id, 'Gold');
              }}
              className="p-5 rounded-2xl border-2 border-[#b8924a]/50 bg-[#fbf7f0] text-left transition-all hover:border-[#b8924a] group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-gray-900 group-hover:text-[#8f6f33]">Formule Gold VIP</span>
                <span className="text-xs font-bold text-[#b8924a] bg-white px-2.5 py-0.5 rounded-full border border-[#b8924a]/30">
                  {event.plan === "Standard" ? "+15 000 FCFA" : "+10 000 FCFA"}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mb-2.5 leading-relaxed">
                Débloquez toute la puissance d&apos;Evenium : Suivi RSVP, Gestion budgétaire &amp; dépenses, Checklist Jour J et Prestataires certifiés.
              </p>
              <span className="text-xs font-bold text-[#8f6f33] flex items-center gap-1.5">
                <span>Passer en Formule Gold VIP</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
