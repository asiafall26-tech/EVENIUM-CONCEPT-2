"use client";

import { useState, useEffect, useMemo } from "react";
import { useEvents } from "@/store/EventsContext";
import Link from "next/link";
import { Calendar, Plus, ChevronRight, Users, Send, Trash2, CalendarHeart, MapPin, Sparkles, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const parseDate = (d?: string) => {
  if (!d || d === "À définir") return null;
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? null : date;
};

const daysUntil = (d: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = new Date(d);
  t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - today.getTime()) / 86_400_000);
};

const prettyDate = (d?: string) => {
  const date = parseDate(d);
  return date ? date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : d || "Date à définir";
};

export default function DashboardPage() {
  const { events, deleteEvent } = useEvents();
  const [userName, setUserName] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data?.user) {
        // Obtenir le nom depuis la table profiles qui est la source de vérité
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

  const isEventCompleted = (event: typeof events[0]) => {
    if (event.status === 'completed') return true;
    const d = parseDate(event.date);
    return d ? daysUntil(d) < 0 : false;
  };

  const upcomingEvents = useMemo(
    () =>
      events
        .filter(e => !isEventCompleted(e))
        .sort((a, b) => (parseDate(a.date)?.getTime() ?? Infinity) - (parseDate(b.date)?.getTime() ?? Infinity)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events]
  );
  const completedEvents = events.filter(e => isEventCompleted(e));
  const nextEvent = upcomingEvents[0];
  const nextIn = nextEvent && parseDate(nextEvent.date) ? daysUntil(parseDate(nextEvent.date)!) : null;

  const totalGuests = events.reduce((acc, curr) => acc + (curr.guests?.total || 0), 0);
  const confirmedGuests = events.reduce((acc, curr) => acc + (curr.guests?.confirmed || 0), 0);
  const rsvpRate = totalGuests > 0 ? Math.round((confirmedGuests / totalGuests) * 100) : 0;

  const displayName = userName.trim();
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const hour = new Date().getHours();
  const hello = hour < 18 ? "Bonjour" : "Bonsoir";

  const remove = async (e: React.MouseEvent, id: string, message: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(message)) return;
    try {
      await deleteEvent(id);
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  const kpis = [
    { label: "Événements", value: String(events.length), hint: `${upcomingEvents.length} à venir`, icon: Calendar },
    { label: "Invités", value: String(totalGuests), hint: "Toutes listes confondues", icon: Send },
    { label: "Confirmés", value: String(confirmedGuests), hint: "Réponses positives", icon: CheckCircle2 },
    { label: "Taux de réponse", value: `${rsvpRate}%`, hint: "Confirmations / invités", icon: Users, bar: rsvpRate },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* ACCUEIL */}
      <section className="relative overflow-hidden rounded-3xl border border-[#e4d8c4] bg-[#fbf7f0] px-5 py-8 sm:px-10 sm:py-12">
        <div aria-hidden className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#ecd9b0]/50 blur-3xl" />
        <div aria-hidden className="absolute -bottom-28 -left-10 w-72 h-72 rounded-full bg-[#f3e8e2]/80 blur-3xl" />
        <div aria-hidden className="absolute inset-3 sm:inset-4 rounded-[1.25rem] border border-[#b8924a]/20 pointer-events-none" />

        <div className="relative text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8f6f33] first-letter:uppercase">{today}</p>
          <h1 className="font-serif text-3xl sm:text-5xl text-gray-900 mt-3 leading-tight">
            {hello}
            {displayName && (
              <>
                , <span className="text-[#8f6f33]">{displayName}</span>
              </>
            )}
          </h1>
          <div className="ornament mt-4" aria-hidden="true">✦</div>
          <p className="text-gray-600 mt-4 max-w-xl mx-auto">
            {nextEvent
              ? nextIn === 0
                ? `C'est aujourd'hui : « ${nextEvent.name} ». Profitez de chaque instant.`
                : nextIn !== null && nextIn > 0
                  ? `Plus que ${nextIn} jour${nextIn > 1 ? "s" : ""} avant « ${nextEvent.name} ».`
                  : `Votre prochain événement : « ${nextEvent.name} ».`
              : "Créez votre premier événement et gérez invitations, invités et budget au même endroit."}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-center">
            <Link
              href="/dashboard/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 text-xs uppercase tracking-[0.18em] text-[#f5eee1] shadow-md"
            >
              <Plus size={16} /> Nouvel événement
            </Link>
            {nextEvent && (
              <Link
                href={`/dashboard/events/${nextEvent.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#b8924a]/50 bg-white/70 px-6 py-3.5 text-xs uppercase tracking-[0.18em] text-[#7a5e2b]"
              >
                <CalendarHeart size={16} /> Ouvrir mon événement
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* CHIFFRES */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 truncate">{k.label}</p>
              <k.icon size={16} className="text-[#b8924a] shrink-0" />
            </div>
            <p className="font-serif text-3xl sm:text-4xl text-gray-900 mt-2">{k.value}</p>
            {k.bar !== undefined ? (
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="bg-[#b8924a] h-1.5 rounded-full" style={{ width: `${k.bar}%` }} />
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1 truncate">{k.hint}</p>
            )}
          </div>
        ))}
      </section>

      {/* ÉVÉNEMENTS À VENIR */}
      <section>
        <div className="flex items-end justify-between gap-3 mb-3 sm:mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#8f6f33]">Mes événements</p>
            <h2 className="font-serif text-2xl text-gray-900">À venir</h2>
          </div>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#b8924a]/40 bg-white/60 p-8 text-center">
            <p className="text-gray-600">Vous n&apos;avez aucun événement à venir.</p>
            <Link href="/dashboard/new" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#8f6f33]">
              <Plus size={16} /> Créer un événement
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {upcomingEvents.map(event => {
              const d = parseDate(event.date);
              const inDays = d ? daysUntil(d) : null;
              return (
                <Link key={event.id} href={`/dashboard/events/${event.id}`} className="group block">
                  <article className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex gap-4 hover:border-[#b8924a]/50 transition-colors">
                    <div className="shrink-0 w-16 sm:w-[4.5rem] rounded-xl bg-[#f5eee1] border border-[#e4d8c4] flex flex-col items-center justify-center py-2 text-[#7a5e2b]">
                      {d ? (
                        <>
                          <span className="font-serif text-2xl leading-none">{d.getDate()}</span>
                          <span className="text-[10px] uppercase tracking-wider mt-1">{d.toLocaleDateString("fr-FR", { month: "short" })}</span>
                        </>
                      ) : (
                        <Calendar size={20} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-xl text-gray-900 leading-snug group-hover:text-[#8f6f33] line-clamp-2">{event.name}</h3>
                        <button
                          onClick={e => remove(e, event.id, "Êtes-vous sûr de vouloir supprimer cet événement ?")}
                          className="shrink-0 -mr-1 -mt-1 p-2 text-gray-300 hover:text-red-500 rounded-lg"
                          aria-label={`Supprimer ${event.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 truncate">
                        <MapPin size={12} className="shrink-0" /> {event.location && event.location !== "À définir" ? event.location : prettyDate(event.date)}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-600">
                          <strong className="text-gray-900">{event.guests?.confirmed || 0}</strong> / {event.guests?.total || 0} confirmés
                        </span>
                        <span className={`px-2.5 py-1 rounded-full border ${event.plan === "Gold" ? "border-[#b8924a]/40 text-[#7a5e2b] bg-[#b8924a]/10" : "border-gray-100 text-gray-500 bg-gray-50"}`}>
                          {event.plan}
                        </span>
                        {inDays !== null && inDays >= 0 && (
                          <span className="px-2.5 py-1 rounded-full bg-[#2b2118] text-[#f5eee1]">{inDays === 0 ? "Aujourd'hui" : `J-${inDays}`}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={18} className="hidden sm:block self-center shrink-0 text-gray-300 group-hover:text-[#b8924a]" />
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* HISTORIQUE */}
      {completedEvents.length > 0 && (
        <section>
          <div className="mb-3 sm:mb-4">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400">Historique</p>
            <h2 className="font-serif text-2xl text-gray-900">Événements terminés</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            {completedEvents.map(event => (
              <Link key={event.id} href={`/dashboard/events/${event.id}`} className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-gray-50/70">
                <Sparkles size={16} className="text-gray-300 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{event.name}</p>
                  <p className="text-xs text-gray-400">Terminé · {prettyDate(event.date)} · {event.guests?.confirmed || 0} confirmés</p>
                </div>
                <button
                  onClick={e => remove(e, event.id, "Êtes-vous sûr de vouloir supprimer cet événement de votre historique ?")}
                  className="shrink-0 p-2 text-gray-300 hover:text-red-500 rounded-lg"
                  aria-label={`Supprimer ${event.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
