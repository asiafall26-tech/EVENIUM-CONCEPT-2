"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  RefreshCw, 
  Filter, 
  Search, 
  Sparkles, 
  Layers, 
  Building2, 
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  FolderOpen
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ClientDevisPage() {
  const [devisList, setDevisList] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState<"by_event" | "history">("by_event");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDevis();
    
    // Configurer le temps réel pour les devis du client
    let channel: any;
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      channel = supabase.channel(`client_devis_sync_${user.id}_${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'devis', filter: `client_id=eq.${user.id}` }, () => {
          fetchDevis();
        })
        .subscribe();
    };
    
    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const fetchDevis = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Récupérer les événements du client
    const { data: userEvents } = await supabase
      .from('events')
      .select('id, name, type, date, location')
      .eq('client_id', user.id)
      .order('date', { ascending: false });

    if (userEvents) {
      setEventsList(userEvents);
    }

    // 2. Récupérer les devis (qui ne sont pas des brouillons) adressés à ce client
    const { data: devisData } = await supabase
      .from('devis')
      .select('*, events(id, name, type, date, location), demandes_devis(service_name)')
      .eq('client_id', user.id)
      .eq('is_draft', false)
      .order('created_at', { ascending: false });

    if (devisData) {
      const providerIds = [...new Set(devisData.map(d => d.prestataire_id).filter(Boolean))];
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, category, phone')
        .in('id', providerIds);
      
      const profMap: Record<string, any> = {};
      (profs || []).forEach(p => profMap[p.id] = p);

      const formatted = devisData.map(d => ({
        ...d,
        profiles: profMap[d.prestataire_id] || { full_name: 'Prestataire', category: 'Service' }
      }));
      setDevisList(formatted);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'En attente de validation': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Accepté': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Révision demandée': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'En cours de révision': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Nouvelle version envoyée': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Refusé': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Expiré': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'En attente de validation': return <Clock size={14} />;
      case 'Accepté': return <CheckCircle size={14} />;
      case 'Révision demandée': return <RefreshCw size={14} />;
      case 'En cours de révision': return <Clock size={14} />;
      case 'Nouvelle version envoyée': return <Sparkles size={14} />;
      case 'Refusé': return <XCircle size={14} />;
      case 'Expiré': return <AlertCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  // Filtrage
  const filteredDevis = useMemo(() => {
    return devisList.filter(d => {
      // Filtre Événement
      if (selectedEventId !== "all" && d.event_id !== selectedEventId) {
        return false;
      }
      // Filtre Statut
      if (selectedStatus !== "all" && d.status !== selectedStatus) {
        return false;
      }
      // Recherche textuelle
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const ref = (d.reference || "").toLowerCase();
        const prov = (d.profiles?.full_name || "").toLowerCase();
        const cat = (d.profiles?.category || "").toLowerCase();
        const evName = (d.events?.name || "").toLowerCase();
        const service = (d.demandes_devis?.service_name || "").toLowerCase();
        return ref.includes(term) || prov.includes(term) || cat.includes(term) || evName.includes(term) || service.includes(term);
      }
      return true;
    });
  }, [devisList, selectedEventId, selectedStatus, searchTerm]);

  // Groupement par événement
  const devisGroupedByEvent = useMemo(() => {
    const map = new Map<string, { event: any; devis: any[] }>();

    // Initialiser avec les événements existants
    eventsList.forEach(ev => {
      map.set(ev.id, { event: ev, devis: [] });
    });

    // Assigner les devis
    filteredDevis.forEach(d => {
      const eid = d.event_id || "autre";
      if (!map.has(eid)) {
        map.set(eid, {
          event: d.events || { id: "autre", name: "Événement non rattaché", type: "Général" },
          devis: []
        });
      }
      map.get(eid)!.devis.push(d);
    });

    // Ne retourner que les groupes qui ont des devis ou si filtré spécifiquement
    return Array.from(map.values()).filter(g => g.devis.length > 0 || selectedEventId === g.event?.id);
  }, [eventsList, filteredDevis, selectedEventId]);

  // KPIs
  const stats = useMemo(() => {
    const total = devisList.length;
    const accepted = devisList.filter(d => d.status === 'Accepté');
    const pending = devisList.filter(d => ['En attente de validation', 'Envoyé'].includes(d.status));
    const revision = devisList.filter(d => ['Révision demandée', 'En cours de révision', 'Nouvelle version envoyée'].includes(d.status));
    const totalAcceptedAmount = accepted.reduce((sum, d) => sum + (Number(d.total) || 0), 0);
    return { total, acceptedCount: accepted.length, pendingCount: pending.length, revisionCount: revision.length, totalAcceptedAmount };
  }, [devisList]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500 space-y-8">
      
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#b8924a] flex items-center gap-1.5 mb-1">
            <Sparkles size={14} /> Gestion Financière & Propositions
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
            Mes Devis par Événement
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Consultez, comparez et suivez l&apos;ensemble des propositions de vos prestataires rattachées à vos événements.
          </p>
        </div>

        {/* Switcher de vue */}
        <div className="flex bg-stone-100 p-1.5 rounded-2xl border border-stone-200 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveView("by_event")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === "by_event" 
                ? "bg-white text-stone-900 shadow-sm" 
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <FolderOpen size={15} /> Par Événement
          </button>
          <button
            onClick={() => setActiveView("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === "history" 
                ? "bg-white text-stone-900 shadow-sm" 
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <Layers size={15} /> Historique Global ({devisList.length})
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Devis Reçus</span>
            <FileText size={18} className="text-[#b8924a]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-[11px] text-gray-500 mt-1">{eventsList.length} événement{eventsList.length > 1 ? "s" : ""} organisés</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">En Attente</span>
            <Clock size={18} className="text-amber-600" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-700">{stats.pendingCount}</p>
          <p className="text-[11px] text-amber-600 mt-1 font-medium">À valider ou réviser</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Acceptés</span>
            <CheckCircle size={18} className="text-emerald-600" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700">{stats.acceptedCount}</p>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">Prestations confirmées</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Montant Validé</span>
            <TrendingUp size={18} className="text-[#b8924a]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#b8924a]">
            {stats.totalAcceptedAmount.toLocaleString()} <span className="text-xs font-sans text-stone-500 font-semibold">FCFA</span>
          </p>
          <p className="text-[11px] text-stone-500 mt-1">Total engagé TTC</p>
        </div>
      </div>

      {/* Barre de filtres & recherche */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par référence, prestataire, service ou événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#b8924a] outline-none transition-all"
          />
        </div>

        {/* Filtre Événement */}
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#b8924a] shrink-0 hidden sm:block" />
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#b8924a] outline-none cursor-pointer"
          >
            <option value="all">Tous les événements ({eventsList.length})</option>
            {eventsList.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.name || ev.type} {ev.date ? `(${new Date(ev.date).toLocaleDateString()})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre Statut */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[#b8924a] shrink-0 hidden sm:block" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#b8924a] outline-none cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="En attente de validation">En attente de validation</option>
            <option value="Accepté">Accepté</option>
            <option value="Révision demandée">Révision demandée</option>
            <option value="En cours de révision">En cours de révision</option>
            <option value="Nouvelle version envoyée">Nouvelle version envoyée</option>
            <option value="Refusé">Refusé</option>
          </select>
        </div>
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b8924a] mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Chargement de vos devis...</p>
        </div>
      ) : filteredDevis.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-14 text-center shadow-sm">
          <div className="w-20 h-20 bg-[#faf8f5] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e4d8c4]">
            <FileText size={32} className="text-[#b8924a]" />
          </div>
          <h3 className="font-serif text-2xl font-bold mb-2 text-gray-900">Aucun devis trouvé</h3>
          <p className="text-gray-500 max-w-md mx-auto text-sm mb-6 leading-relaxed">
            {searchTerm || selectedEventId !== "all" || selectedStatus !== "all"
              ? "Aucune proposition ne correspond à vos filtres actuels. Modifiez vos critères de recherche."
              : "Vous n'avez pas encore reçu de proposition de devis. Parcourez le catalogue de prestataires pour solliciter vos premières offres."}
          </p>
          <Link 
            href="/dashboard" 
            className="px-6 py-3 bg-stone-900 hover:bg-black text-[#f5eee1] text-xs font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-2"
          >
            Explorer le catalogue prestataires <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : activeView === "by_event" ? (
        /* VUE PAR ÉVÉNEMENT */
        <div className="space-y-8">
          {devisGroupedByEvent.map(({ event, devis }) => (
            <div key={event.id || event.name} className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
              
              {/* Header de l'événement */}
              <div className="bg-[#faf8f5] p-5 sm:p-6 border-b border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#f5eee1] text-[#8f6f33] border border-[#e4d8c4] flex items-center justify-center font-bold text-lg shrink-0">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                        {event.name || event.type || "Événement"}
                      </h2>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-stone-200/70 text-stone-700">
                        {event.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                      {event.date && <span>📅 {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>}
                      {event.location && <span>📍 {event.location}</span>}
                      <span>• {devis.length} devis rattaché{devis.length > 1 ? "s" : ""}</span>
                    </p>
                  </div>
                </div>

                {event.id && event.id !== "autre" && (
                  <Link
                    href={`/dashboard/events/${event.id}/prestataires`}
                    className="self-start sm:self-auto text-xs font-bold text-[#8f6f33] hover:text-black flex items-center gap-1.5 transition-colors"
                  >
                    Voir dans l&apos;événement <ChevronRight size={14} />
                  </Link>
                )}
              </div>

              {/* Grille des devis de cet événement */}
              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {devis.map((d: any) => (
                    <div 
                      key={d.id} 
                      className="bg-white rounded-2xl border border-stone-200 hover:border-[#b8924a] shadow-2xs hover:shadow-md transition-all flex flex-col group p-5 relative"
                    >
                      {/* Top Prestataire & Statut */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                            {d.profiles?.avatar_url ? (
                              <img src={d.profiles.avatar_url} alt={d.profiles.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold text-base">
                                {d.profiles?.full_name?.charAt(0) || "P"}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#b8924a] block">
                              {d.profiles?.category || "Prestataire"}
                            </span>
                            <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#b8924a] transition-colors leading-tight">
                              {d.profiles?.full_name || "Prestataire"}
                            </h3>
                          </div>
                        </div>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${getStatusColor(d.status)}`}>
                          {getStatusIcon(d.status)}
                          {d.status === "En attente de validation" ? "En attente" : d.status}
                        </span>
                      </div>

                      {/* Référence & Service */}
                      <div className="space-y-1 mb-4 flex-1">
                        <p className="text-xs font-mono font-bold text-stone-600">
                          {d.reference || `DEV-${d.id.substring(0, 8).toUpperCase()}`}
                        </p>
                        {d.demandes_devis?.service_name && (
                          <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                            {d.demandes_devis.service_name}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Calendar size={12} /> Émis le {new Date(d.date_emission || d.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Footer : Montant & Action */}
                      <div className="pt-3 border-t border-stone-100 flex items-end justify-between">
                        <div>
                          <span className="text-[10px] font-medium text-gray-400 block uppercase">Total TTC</span>
                          <span className="font-serif font-bold text-xl text-stone-900">
                            {Number(d.total || 0).toLocaleString()} <span className="text-xs font-sans text-gray-500 font-medium">FCFA</span>
                          </span>
                        </div>
                        <Link 
                          href={`/dashboard/devis/${d.id}`}
                          className="px-3.5 py-2 bg-[#f5eee1] hover:bg-[#e4d8c4] text-[#8f6f33] font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <Eye size={14} /> Consulter
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VUE HISTORIQUE GLOBAL (TABLEAU EXHAUSTIF) */
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-bold text-gray-900">Historique global des devis</h2>
              <p className="text-xs text-gray-500 mt-0.5">Vue consolidée de l&apos;ensemble de vos propositions commerciales reçues.</p>
            </div>
            <span className="text-xs font-bold text-stone-600 px-3 py-1 rounded-full bg-stone-100 self-start sm:self-auto">
              {filteredDevis.length} devis listé{filteredDevis.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200/80 text-[11px] uppercase tracking-wider text-stone-500 font-bold">
                  <th className="py-3.5 px-5">Réf & Date</th>
                  <th className="py-3.5 px-5">Événement Concerné</th>
                  <th className="py-3.5 px-5">Prestataire & Service</th>
                  <th className="py-3.5 px-5 text-right">Montant TTC</th>
                  <th className="py-3.5 px-5 text-center">Statut</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredDevis.map((d: any) => (
                  <tr key={d.id} className="hover:bg-[#faf8f5]/60 transition-colors">
                    
                    {/* Réf & Date */}
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-stone-900 block text-xs">
                        {d.reference || `DEV-${d.id.substring(0, 8).toUpperCase()}`}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(d.date_emission || d.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Événement Concerné */}
                    <td className="py-4 px-5">
                      <div className="font-semibold text-gray-900 text-sm">
                        {d.events?.name || d.events?.type || "Non spécifié"}
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        {d.events?.date && <span>📅 {d.events.date}</span>}
                        {d.events?.location && <span>• 📍 {d.events.location}</span>}
                      </div>
                    </td>

                    {/* Prestataire Concerné */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                          {d.profiles?.avatar_url ? (
                            <img src={d.profiles.avatar_url} alt={d.profiles.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold text-xs">
                              {d.profiles?.full_name?.charAt(0) || "P"}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-xs">{d.profiles?.full_name || "Prestataire"}</p>
                          <p className="text-[10px] text-[#8f6f33] font-semibold">{d.profiles?.category || d.demandes_devis?.service_name || "Prestation"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Montant TTC */}
                    <td className="py-4 px-5 text-right">
                      <span className="font-serif font-bold text-base text-stone-900 block">
                        {Number(d.total || 0).toLocaleString()} FCFA
                      </span>
                      {d.version && (
                        <span className="text-[10px] text-gray-400 font-medium">Version {d.version}</span>
                      )}
                    </td>

                    {/* Statut */}
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(d.status)}`}>
                        {getStatusIcon(d.status)}
                        {d.status === "En attente de validation" ? "En attente" : d.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <Link
                        href={`/dashboard/devis/${d.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-black text-[#f5eee1] rounded-xl text-xs font-bold transition-all shadow-2xs"
                      >
                        <Eye size={13} /> Consulter
                      </Link>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
