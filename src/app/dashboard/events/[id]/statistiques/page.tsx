"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { useEvents } from "@/store/EventsContext";
import { createClient } from "@/utils/supabase/client";
import { BarChart3, Users, Wallet, CheckSquare, TrendingUp, Sparkles } from "lucide-react";

export default function StatistiquesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { events, isLoaded } = useEvents();
  const event = events.find((e) => e.id === id);

  const [stats, setStats] = useState({
    budget: { total: event?.budget?.total || 0, spent: 0 },
    guests: { total: event?.guestsCount || 0, confirmed: 0, pending: 0, declined: 0 },
    tasks: { total: 0, completed: 0 },
    isLoading: true
  });

  if (!event) {
    if (!isLoaded) {
      return (
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 text-[#8f6f33]">
          <div className="w-10 h-10 border-3 border-[#b8924a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500 animate-pulse">Chargement des statistiques...</p>
        </div>
      );
    }
    notFound();
    return null;
  }

  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      // 1. Fetch budget
      let spent = 0;
      const { data: txs } = await supabase.from('transactions').select('montant').eq('event_id', id).eq('type', 'depense');
      if (txs) {
        spent = txs.reduce((sum, t) => sum + Number(t.montant), 0);
      }

      // 2. Fetch guests
      let confirmed = 0;
      let pending = 0;
      let declined = 0;
      let totalGuests = event.guestsCount || 0;
      const { data: gst } = await supabase.from('guests').select('statut_rsvp').eq('event_id', id);
      if (gst) {
        confirmed = gst.filter(g => g.statut_rsvp === 'Confirmé').length;
        pending = gst.filter(g => g.statut_rsvp === 'En attente').length;
        declined = gst.filter(g => g.statut_rsvp === 'Refusé').length;
        totalGuests = Math.max(totalGuests, gst.length);
      }

      // 3. Fetch tasks
      let totalTasks = 0;
      let completedTasks = 0;
      const { data: tsk } = await supabase.from('tasks').select('is_completed').eq('event_id', id);
      if (tsk) {
        totalTasks = tsk.length;
        completedTasks = tsk.filter(t => t.is_completed).length;
      }

      setStats({
        budget: { total: event.budget?.total || 0, spent },
        guests: { total: totalGuests, confirmed, pending, declined },
        tasks: { total: totalTasks, completed: completedTasks },
        isLoading: false
      });
    };

    fetchStats();
  }, [id, event.budget, event.guestsCount, supabase]);

  if (stats.isLoading) {
    return <div className="p-4 sm:p-6 lg:p-8 text-gray-500 animate-pulse">Chargement des statistiques...</div>;
  }

  // Calculations
  const rsvpRate = stats.guests.total > 0 ? Math.round((stats.guests.confirmed / stats.guests.total) * 100) : 0;
  const budgetRate = stats.budget.total > 0 ? Math.round((stats.budget.spent / stats.budget.total) * 100) : 0;
  const tasksRate = stats.tasks.total > 0 ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-black text-white p-5 sm:p-8 lg:p-10 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-4 sm:p-6 lg:p-8 opacity-10">
          <BarChart3 size={120} />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[#b8924a] text-sm font-semibold mb-6">
            <Sparkles size={16} />
            Analyses & Performances
          </div>
          <h1 className="text-4xl font-serif mb-2">Statistiques de l'événement</h1>
          <p className="text-gray-400 max-w-xl text-lg">
            Suivez en temps réel l'avancement de {event.name}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Guests KPI */}
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Users size={24} />
          </div>
          <h3 className="text-gray-500 font-medium mb-1">Taux de présence</h3>
          <div className="text-4xl font-serif font-semibold text-gray-900 mb-6">{rsvpRate}%</div>
          
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-6">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${rsvpRate}%` }} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm mt-auto">
            <div>
              <p className="text-gray-400">Confirmés</p>
              <p className="font-semibold">{stats.guests.confirmed}</p>
            </div>
            <div>
              <p className="text-gray-400">Total invités</p>
              <p className="font-semibold">{stats.guests.total}</p>
            </div>
          </div>
        </div>

        {/* Budget KPI */}
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-[#f5eee1] text-[#8f6f33] rounded-2xl flex items-center justify-center mb-6">
            <Wallet size={24} />
          </div>
          <h3 className="text-gray-500 font-medium mb-1">Budget consommé</h3>
          <div className="text-4xl font-serif font-semibold text-gray-900 mb-6">{budgetRate}%</div>
          
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-6">
            <div 
              className={`h-full rounded-full ${budgetRate > 100 ? 'bg-red-500' : 'bg-[#b8924a]'}`} 
              style={{ width: `${Math.min(budgetRate, 100)}%` }} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm mt-auto">
            <div>
              <p className="text-gray-400">Dépensé</p>
              <p className="font-semibold text-gray-900">{stats.budget.spent.toLocaleString()} <span className="text-xs text-gray-500">FCFA</span></p>
            </div>
            <div>
              <p className="text-gray-400">Total prévu</p>
              <p className="font-semibold text-gray-900">{stats.budget.total.toLocaleString()} <span className="text-xs text-gray-500">FCFA</span></p>
            </div>
          </div>
        </div>

        {/* Tasks KPI */}
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <CheckSquare size={24} />
          </div>
          <h3 className="text-gray-500 font-medium mb-1">Avancement des tâches</h3>
          <div className="text-4xl font-serif font-semibold text-gray-900 mb-6">{tasksRate}%</div>
          
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-6">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${tasksRate}%` }} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm mt-auto">
            <div>
              <p className="text-gray-400">Terminées</p>
              <p className="font-semibold">{stats.tasks.completed}</p>
            </div>
            <div>
              <p className="text-gray-400">Total tâches</p>
              <p className="font-semibold">{stats.tasks.total}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Advanced Details */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="text-[#b8924a]" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Répartition des réponses (RSVP)</h2>
        </div>
        
        <div className="flex items-end gap-2 h-40">
          <div className="flex-1 bg-gray-50 rounded-t-xl flex flex-col justify-end items-center pb-4 relative group" style={{ height: `${stats.guests.total > 0 ? Math.max((stats.guests.confirmed / stats.guests.total) * 100, 10) : 10}%` }}>
            <div className="absolute -top-10 bg-black text-white text-xs py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {stats.guests.confirmed} Confirmés
            </div>
            <div className="w-full h-full bg-blue-500/20 rounded-t-xl absolute bottom-0 left-0"></div>
            <span className="font-semibold z-10">{stats.guests.confirmed}</span>
            <span className="text-xs text-gray-500 z-10">Confirmé</span>
          </div>
          <div className="flex-1 bg-gray-50 rounded-t-xl flex flex-col justify-end items-center pb-4 relative group" style={{ height: `${stats.guests.total > 0 ? Math.max((stats.guests.pending / stats.guests.total) * 100, 10) : 10}%` }}>
            <div className="absolute -top-10 bg-black text-white text-xs py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {stats.guests.pending} En attente
            </div>
            <div className="w-full h-full bg-yellow-500/20 rounded-t-xl absolute bottom-0 left-0"></div>
            <span className="font-semibold z-10">{stats.guests.pending}</span>
            <span className="text-xs text-gray-500 z-10">Attente</span>
          </div>
          <div className="flex-1 bg-gray-50 rounded-t-xl flex flex-col justify-end items-center pb-4 relative group" style={{ height: `${stats.guests.total > 0 ? Math.max((stats.guests.declined / stats.guests.total) * 100, 10) : 10}%` }}>
            <div className="absolute -top-10 bg-black text-white text-xs py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {stats.guests.declined} Refusés
            </div>
            <div className="w-full h-full bg-red-500/20 rounded-t-xl absolute bottom-0 left-0"></div>
            <span className="font-semibold z-10">{stats.guests.declined}</span>
            <span className="text-xs text-gray-500 z-10">Refusé</span>
          </div>
        </div>
      </div>
    </div>
  );
}
