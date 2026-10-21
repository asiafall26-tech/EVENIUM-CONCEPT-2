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

  const kpis = [
    {
      label: "Taux de présence",
      value: rsvpRate,
      icon: Users,
      bar: "bg-[#2E7D32]",
      rows: [["Confirmés", String(stats.guests.confirmed)], ["Invités", String(stats.guests.total)]],
    },
    {
      label: "Budget consommé",
      value: budgetRate,
      icon: Wallet,
      bar: budgetRate > 100 ? "bg-red-500" : "bg-[#b8924a]",
      rows: [["Dépensé", `${stats.budget.spent.toLocaleString("fr-FR")} F`], ["Prévu", `${stats.budget.total.toLocaleString("fr-FR")} F`]],
    },
    {
      label: "Tâches terminées",
      value: tasksRate,
      icon: CheckSquare,
      bar: "bg-emerald-500",
      rows: [["Terminées", String(stats.tasks.completed)], ["Tâches", String(stats.tasks.total)]],
    },
  ];

  const answers = [
    { label: "Confirmés", value: stats.guests.confirmed, color: "bg-[#2E7D32]" },
    { label: "En attente", value: stats.guests.pending, color: "bg-[#F57F17]" },
    { label: "Refusés", value: stats.guests.declined, color: "bg-[#C62828]" },
  ];

  return (
    <div className="max-w-5xl mx-auto w-full space-y-5 sm:space-y-6 animate-in fade-in duration-500">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#8f6f33] flex items-center gap-1.5">
          <BarChart3 size={13} /> Statistiques
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-gray-900 leading-tight">{event.name}</h1>
        <p className="text-gray-500 text-sm mt-1">L&apos;avancement de votre événement en un coup d&apos;œil.</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <k.icon size={14} className="text-[#b8924a]" /> {k.label}
            </p>
            <p className="font-serif text-4xl text-gray-900 mt-2">{k.value}%</p>
            <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className={`h-full rounded-full ${k.bar}`} style={{ width: `${Math.min(100, k.value)}%` }} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {k.rows.map(([l, v]) => (
                <div key={l}>
                  <dt className="text-xs text-gray-400">{l}</dt>
                  <dd className="font-semibold text-gray-900 whitespace-nowrap">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <h2 className="font-serif text-2xl text-gray-900 flex items-center gap-2">
          <TrendingUp className="text-[#b8924a]" size={20} /> Réponses des invités
        </h2>
        <ul className="mt-5 space-y-4">
          {answers.map((a) => {
            const pct = stats.guests.total > 0 ? Math.round((a.value / stats.guests.total) * 100) : 0;
            return (
              <li key={a.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{a.label}</span>
                  <span className="font-semibold text-gray-900">
                    {a.value} <span className="text-xs font-normal text-gray-400">({pct}%)</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${a.color}`} style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
