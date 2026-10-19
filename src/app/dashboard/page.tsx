"use client";

import { useState, useEffect } from "react";
import { useEvents } from "@/store/EventsContext";
import Link from "next/link";
import { Calendar, Plus, ChevronRight, Activity, Users, Send, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function DashboardPage() {
  const { events, deleteEvent } = useEvents();
  const [userName, setUserName] = useState<string>("Sophie Martin");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data?.user) {
        // Obtenir le nom depuis la table profiles qui est la source de vérité
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', data.user.id).single();
        if (profile?.full_name) {
          setUserName(profile.full_name);
        } else if (data.user.user_metadata?.full_name) {
          setUserName(data.user.user_metadata.full_name);
        }
      }
    });
  }, [supabase]);
  
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status !== "completed").length;
  const totalGuests = events.reduce((acc, curr) => acc + (curr.guests?.total || 0), 0);
  const confirmedGuests = events.reduce((acc, curr) => acc + (curr.guests?.confirmed || 0), 0);
  
  // Calculate average RSVP response rate
  const rsvpRate = totalGuests > 0 ? Math.round((confirmedGuests / totalGuests) * 100) : 0;

  const isEventCompleted = (event: typeof events[0]) => {
    if (event.status === 'completed') return true;
    if (event.date && event.date !== "À définir") {
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate < today;
    }
    return false;
  };

  const upcomingEvents = events.filter(e => !isEventCompleted(e));
  const completedEvents = events.filter(e => isEventCompleted(e));

  return (
    <div className="max-w-6xl mx-auto w-full p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* BANNER ORGANISATEUR */}
      <div className="relative flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-[#F9F3E9] to-[#fbf7f0] p-6 md:p-0 rounded-3xl border border-[#e4d8c4]/50 shadow-sm overflow-hidden h-[340px] mb-8">
        
        {/* Left Side: Image container safely containing the woman without cropping */}
        <div className="relative w-full md:w-[55%] h-[200px] md:h-full flex-shrink-0 order-2 md:order-1 flex items-end justify-start">
          <img 
            src="/images/welcome-banner.jpg" 
            alt="Bienvenue sur Evenium" 
            className="w-full h-full object-contain object-bottom md:object-left-bottom"
          />
          {/* Gradient to smooth out the right edge if image doesn't fill entirely */}
          <div className="hidden md:block absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-[#fbf7f0] via-[#fbf7f0]/80 to-transparent pointer-events-none"></div>
        </div>
        
        {/* Right Side: Content */}
        <div className="w-full md:w-[45%] z-10 flex flex-col justify-center items-center md:items-start text-center md:text-left order-1 md:order-2 md:pr-12 lg:pr-16 mt-4 md:mt-0">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/90 backdrop-blur-sm border border-[#b8924a]/40 text-[#8f6f33] text-sm font-black rounded-full mb-4 shadow-md uppercase tracking-[0.15em] transform hover:scale-105 transition-transform">
            Bienvenue !
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-tight truncate w-full max-w-[280px] md:max-w-[400px]">
            Bonjour, <br className="hidden md:block" />
            <span className="text-[#8f6f33]">{userName}</span> 👋
          </h1>
          <p className="text-gray-600 text-sm md:text-base font-medium mb-6 max-w-md">
            Organisez, suivez et maîtrisez vos événements en toute simplicité.
          </p>
          
          <Link href="/dashboard/new" className="inline-flex items-center gap-2 bg-[#2b2118] hover:bg-black text-[#b8924a] px-6 py-3 rounded-xl text-sm font-semibold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
            <Plus size={18} />
            Nouvel Événement
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[#b8924a]/10 flex items-center justify-center text-[#8f6f33] mb-4">
            <Calendar size={20} />
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Événements</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{totalEvents}</p>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{activeEvents} Actif(s)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
            <Activity size={20} />
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Prochaine date</p>
          <p className="text-xl font-bold text-gray-900 truncate">{events[0]?.date || "-"}</p>
          <p className="text-xs text-gray-400 mt-1 truncate">{events[0]?.name || ""}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
            <Send size={20} />
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Invitations</p>
          <p className="text-3xl font-bold text-gray-900">{totalGuests}</p>
          <p className="text-xs text-gray-400 mt-1">Envoyées globalement</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-4">
            <Users size={20} />
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Indicateur RSVP</p>
          <p className="text-3xl font-bold text-gray-900">{rsvpRate}%</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${rsvpRate}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Mes événements à venir</h2>
          <p className="text-sm text-gray-500">Accès rapide à vos espaces dédiés.</p>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50">
          {upcomingEvents.length === 0 ? (
            <div className="col-span-full py-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
              Vous n'avez aucun événement à venir.
            </div>
          ) : (
            upcomingEvents.map((event) => (
              <Link key={event.id} href={`/dashboard/events/${event.id}`} className="block group">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#b8924a] hover:ring-4 hover:ring-[#b8924a]/5 transition-all flex flex-col h-full relative overflow-hidden">
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-[#f5eee1] text-[#8f6f33] rounded-full">
                      <Calendar size={14} /> {(event as any).end_date && (event as any).end_date !== event.date ? `Du ${event.date} au ${(event as any).end_date}` : event.date}
                    </div>
                    <div className="flex items-center">
                      <div className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${event.plan === 'Gold' ? 'border-[#b8924a] text-[#8f6f33] bg-[#b8924a]/5' : 'border-gray-200 text-gray-500 bg-gray-50'}`}>
                        {event.plan}
                      </div>
                      <button 
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if(confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
                            try {
                              await deleteEvent(event.id);
                            } catch (err) {
                              alert("Erreur lors de la suppression.");
                            }
                          }
                        }}
                        className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-serif text-2xl font-semibold mb-1 transition-colors text-black group-hover:text-[#8f6f33]">{event.name}</h3>
                  <p className="text-sm mb-6 flex-1 font-medium text-green-600">
                    Événement Actif
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-auto">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Invités (RSVP)</p>
                      <p className="font-semibold text-gray-900">{event.guests?.confirmed || 0} <span className="text-gray-400 font-normal text-sm">/ {event.guests?.total || 0}</span></p>
                    </div>
                    {event.plan === 'Gold' ? (
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Budget</p>
                        <p className="font-semibold text-gray-900">4M <span className="text-gray-400 font-normal text-sm">FCFA</span></p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Type Carte</p>
                        <p className="font-semibold text-gray-900">Animée</p>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#b8924a] group-hover:text-white transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {completedEvents.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-8">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Historique des événements (Terminés)</h2>
            <p className="text-sm text-gray-500">Consultez ou supprimez vos événements passés.</p>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50">
            {completedEvents.map((event) => (
              <Link key={event.id} href={`/dashboard/events/${event.id}`} className="block group">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full relative overflow-hidden opacity-70 hover:opacity-100">
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full">
                      <Calendar size={14} /> Terminé le {event.date}
                    </div>
                    <div className="flex items-center">
                      <div className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${event.plan === 'Gold' ? 'border-[#b8924a] text-[#8f6f33] bg-[#b8924a]/5' : 'border-gray-200 text-gray-500 bg-gray-50'}`}>
                        {event.plan}
                      </div>
                      <button 
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if(confirm("Êtes-vous sûr de vouloir supprimer cet événement de votre historique ?")) {
                            try {
                              await deleteEvent(event.id);
                            } catch (err) {
                              alert("Erreur lors de la suppression.");
                            }
                          }
                        }}
                        className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                        title="Supprimer définitivement"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-serif text-2xl font-semibold mb-1 text-gray-600 group-hover:text-black">{event.name}</h3>
                  <p className="text-sm mb-6 flex-1 font-medium text-gray-400">
                    Événement Clos
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 opacity-60 pt-4 mt-auto">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Invités (RSVP)</p>
                      <p className="font-semibold text-gray-900">{event.guests?.confirmed || 0} <span className="text-gray-400 font-normal text-sm">/ {event.guests?.total || 0}</span></p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
