"use client";

import { useEvents } from "@/store/EventsContext";
import Link from "next/link";
import { Calendar, Plus, ChevronRight, Activity, Users, Send } from "lucide-react";

export default function DashboardPage() {
  const { events } = useEvents();
  
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status !== "completed").length;
  const totalGuests = events.reduce((acc, curr) => acc + (curr.guests?.total || 0), 0);
  const confirmedGuests = events.reduce((acc, curr) => acc + (curr.guests?.confirmed || 0), 0);
  
  // Calculate average RSVP response rate
  const rsvpRate = totalGuests > 0 ? Math.round((confirmedGuests / totalGuests) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
          <Calendar size={200} />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-semibold text-gray-900 mb-2">Vue Générale</h1>
          <p className="text-gray-500">Bienvenue sur votre espace de gestion Evenium.</p>
        </div>
        <Link href="/dashboard/new" className="relative z-10 flex items-center gap-2 bg-[#111111] hover:bg-black text-[#D4AF37] px-6 py-3 rounded-xl text-sm font-semibold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
          <Plus size={18} />
          Nouvel Événement
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#B8860B] mb-4">
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
          {events.map((event) => (
            <Link key={event.id} href={`/dashboard/events/${event.id}`} className="block group">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#D4AF37] hover:ring-4 hover:ring-[#D4AF37]/5 transition-all flex flex-col h-full relative overflow-hidden">
                
                <div className="flex justify-between items-start mb-6">
                  {event.status === 'completed' ? (
                    <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full">
                      <Calendar size={14} /> Terminé
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-[#F9F5EC] text-[#B8860B] rounded-full">
                      <Calendar size={14} /> {event.date}
                    </div>
                  )}
                  <div className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${event.plan === 'Gold' ? 'border-[#D4AF37] text-[#B8860B] bg-[#D4AF37]/5' : 'border-gray-200 text-gray-500 bg-gray-50'}`}>
                    {event.plan}
                  </div>
                </div>
                
                <h3 className={`font-serif text-2xl font-semibold mb-1 transition-colors ${event.status === 'completed' ? 'text-gray-600 group-hover:text-black' : 'text-black group-hover:text-[#B8860B]'}`}>{event.name}</h3>
                <p className={`text-sm mb-6 flex-1 font-medium ${event.status === 'completed' ? 'text-gray-400' : 'text-green-600'}`}>
                  {event.status === 'completed' ? 'Événement Clos' : 'Événement Actif'}
                </p>
                
                <div className={`grid grid-cols-2 gap-4 border-t pt-4 mt-auto ${event.status === 'completed' ? 'border-gray-100 opacity-60' : 'border-gray-100'}`}>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Invités (RSVP)</p>
                    <p className="font-semibold text-gray-900">{event.guests.confirmed} <span className="text-gray-400 font-normal text-sm">/ {event.guests.total}</span></p>
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

                <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">
                  <ChevronRight size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
