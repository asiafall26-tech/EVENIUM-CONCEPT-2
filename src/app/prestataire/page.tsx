"use client";

import { FileText, CalendarCheck, Clock, CheckCircle, ChevronRight, Plus, User, Inbox } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const NEW_STATUSES = ["Nouvelle", "Nouvelle demande", "En attente", "À traiter"];

export default function PrestataireDashboardPage() {
  const [userName, setUserName] = useState("");
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (profile?.full_name) {
          setUserName(profile.full_name);
        } else if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name);
        } else if (user.email) {
          setUserName(user.email.split('@')[0]);
        }

        // Fetch real demandes_devis for this provider ONLY
        const { data: realDemandes } = await supabase
          .from('demandes_devis')
          .select('*, events(name, type, date, location, client_id)')
          .eq('prestataire_id', user.id)
          .order('created_at', { ascending: false });

        if (realDemandes && realDemandes.length > 0) {
          setDemandes(realDemandes.map((d: any) => ({
            id: d.id,
            clientName: d.client_name || d.events?.name || 'Client',
            eventType: d.event_type || d.events?.type || 'Événement',
            eventDate: d.event_date || (d.events?.date ? new Date(d.events.date).toLocaleDateString('fr-FR') : 'Date à définir'),
            budget: Number(d.budget_indicatif || d.budget_propose || 0),
            status: d.status || 'Nouvelle'
          })));
        } else {
          setDemandes([]);
        }
      } else {
        setDemandes([]);
      }
      setLoading(false);
    };
    fetchData();

    let channel: any;
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      channel = supabase.channel('prestataire_dashboard_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'demandes_devis', filter: `prestataire_id=eq.${user.id}` }, () => {
          fetchData();
        })
        .subscribe();
    };
    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const stats = useMemo(() => {
    const total = demandes.length;
    const nouvelles = demandes.filter(d => NEW_STATUSES.includes(d.status)).length;
    const discussion = demandes.filter(d => d.status === "En discussion").length;
    const devis = demandes.filter(d => d.status === "Devis envoyé" || d.status === "Devis en préparation").length;
    const confirmees = demandes.filter(d => d.status === "Confirmé" || d.status === "Accepté").length;
    const realisees = demandes.filter(d => d.status === "Réalisé" || d.status === "Terminé").length;
    return { total, nouvelles, discussion, devis, confirmees, realisees };
  }, [demandes]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Nouvelle":
      case "Nouvelle demande":
      case "En attente":
      case "À traiter":
        return "bg-[#FFF8E1] text-[#F57F17]";
      case "En discussion": return "bg-[#E3F2FD] text-[#1976D2]";
      case "Devis envoyé":
      case "Devis en préparation":
        return "bg-[#F3E5F5] text-[#7B1FA2]";
      case "Confirmé":
      case "Accepté":
        return "bg-[#E8F5E9] text-[#2E7D32]";
      case "Réalisé":
      case "Terminé":
        return "bg-gray-100 text-[#607D8B]";
      case "Refusé":
      case "Annulé par le client":
        return "bg-red-50 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const formatMoney = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + " FCFA";

  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const hello = new Date().getHours() < 18 ? "Bonjour" : "Bonsoir";

  const kpis = [
    { label: "Nouvelles demandes", value: stats.nouvelles, icon: FileText, color: "text-[#F57F17]" },
    { label: "Confirmés", value: stats.confirmees, icon: CalendarCheck, color: "text-[#2E7D32]" },
    { label: "En discussion", value: stats.discussion, icon: Clock, color: "text-[#1976D2]" },
    { label: "Réalisés", value: stats.realisees, icon: CheckCircle, color: "text-[#607D8B]" },
  ];

  const pipeline = [
    { label: "Nouvelles", value: stats.nouvelles, color: "bg-[#F57F17]" },
    { label: "En discussion", value: stats.discussion, color: "bg-[#1976D2]" },
    { label: "Devis envoyés", value: stats.devis, color: "bg-[#7B1FA2]" },
    { label: "Confirmées", value: stats.confirmees, color: "bg-[#2E7D32]" },
    { label: "Réalisées", value: stats.realisees, color: "bg-[#607D8B]" },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* ACCUEIL */}
      <section className="relative overflow-hidden rounded-3xl border border-[#e4d8c4] bg-[#fbf7f0] px-5 py-8 sm:px-10 sm:py-12 text-center">
        <div aria-hidden className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-[#ecd9b0]/50 blur-3xl" />
        <div aria-hidden className="absolute -bottom-28 -right-10 w-72 h-72 rounded-full bg-[#f3e8e2]/80 blur-3xl" />
        <div aria-hidden className="absolute inset-3 sm:inset-4 rounded-[1.25rem] border border-[#b8924a]/20 pointer-events-none" />
        <div className="relative">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8f6f33] first-letter:uppercase">{today}</p>
          <h1 className="font-serif text-3xl sm:text-5xl text-gray-900 mt-3 leading-tight">
            {hello}
            {userName && (
              <>
                , <span className="text-[#8f6f33] break-long">{userName}</span>
              </>
            )}
          </h1>
          <div className="ornament mt-4" aria-hidden="true">✦</div>
          <p className="text-gray-600 mt-4 max-w-xl mx-auto">
            {stats.nouvelles > 0
              ? `${stats.nouvelles} nouvelle${stats.nouvelles > 1 ? "s" : ""} demande${stats.nouvelles > 1 ? "s" : ""} vous attend${stats.nouvelles > 1 ? "ent" : ""}.`
              : "Faites rayonner votre savoir-faire et transformez vos talents en opportunités."}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-center">
            <Link href="/prestataire/demandes" className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 text-xs uppercase tracking-[0.18em] text-[#f5eee1] shadow-md">
              <Inbox size={16} /> Mes demandes
            </Link>
            <Link href="/prestataire/catalogue" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#b8924a]/50 bg-white/70 px-6 py-3.5 text-xs uppercase tracking-[0.18em] text-[#7a5e2b]">
              <Plus size={16} /> Ajouter une offre
            </Link>
          </div>
        </div>
      </section>

      {/* CHIFFRES */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 leading-snug">{k.label}</p>
              <k.icon size={16} className={`${k.color} shrink-0`} />
            </div>
            <p className="font-serif text-3xl sm:text-4xl text-gray-900 mt-2">{loading ? "…" : k.value}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* DERNIÈRES DEMANDES */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-5 pb-3">
            <h2 className="font-serif text-2xl text-gray-900">Dernières demandes</h2>
            <Link href="/prestataire/demandes" className="text-sm font-medium text-[#8f6f33] whitespace-nowrap">Tout voir →</Link>
          </div>
          {demandes.length === 0 ? (
            <div className="px-6 pb-8 pt-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FDF9F0] border border-[#e4d8c4] flex items-center justify-center text-[#8f6f33] mb-3">
                <FileText size={22} />
              </div>
              <h3 className="font-serif text-lg text-gray-900">{loading ? "Chargement…" : "Aucune demande pour le moment"}</h3>
              {!loading && (
                <>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">Les demandes des organisateurs apparaîtront ici en direct.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Link href="/prestataire/catalogue" className="px-4 py-2 bg-black text-white rounded-full text-xs font-semibold">Ajouter une offre</Link>
                    <Link href="/prestataire/profil" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
                      <User size={13} /> Mon profil
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {demandes.slice(0, 5).map(d => (
                <li key={d.id}>
                  <Link href="/prestataire/demandes" className="flex items-center gap-3 px-4 sm:px-6 py-3.5 hover:bg-gray-50/70">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-[#f5eee1] text-[#7a5e2b] flex items-center justify-center text-xs font-bold">
                      {d.clientName ? d.clientName.substring(0, 2).toUpperCase() : "C"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900 truncate">{d.clientName}</p>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${getStatusStyle(d.status)}`}>{d.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {d.eventType} · {d.eventDate}
                        {d.budget > 0 ? ` · ${formatMoney(d.budget)}` : ""}
                      </p>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-gray-300" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* SUIVI */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl text-gray-900">Suivi</h2>
            <span className="text-sm text-gray-500">{stats.total} demande{stats.total > 1 ? "s" : ""}</span>
          </div>
          <ul className="mt-5 space-y-4">
            {pipeline.map(p => {
              const pct = stats.total ? Math.round((p.value / stats.total) * 100) : 0;
              return (
                <li key={p.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{p.label}</span>
                    <span className="font-semibold text-gray-900">
                      {p.value} <span className="text-xs font-normal text-gray-400">({pct}%)</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full ${p.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
