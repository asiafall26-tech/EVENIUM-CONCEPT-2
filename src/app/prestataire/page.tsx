"use client";

import { FileText, CalendarCheck, Clock, CheckCircle, ChevronDown, Plus, MoreHorizontal, MapPin, Star, BadgeCheck, Edit2, X } from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePrestataires } from "@/store/PrestataireContext";
import { createClient } from "@/utils/supabase/client";

export default function PrestataireDashboardPage() {
  const [userName, setUserName] = useState("Prestataire");
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
          const formattedDemandes = realDemandes.map((d: any) => ({
            id: d.id,
            clientName: d.client_name || d.events?.name || 'Client',
            eventType: d.event_type || d.events?.type || 'Événement',
            eventDate: d.event_date || (d.events?.date ? new Date(d.events.date).toLocaleDateString('fr-FR') : 'Date à définir'),
            budget: Number(d.budget_indicatif || d.budget_propose || 0),
            status: d.status || 'Nouvelle'
          }));
          setDemandes(formattedDemandes);
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
    const nouvelles = demandes.filter(d => d.status === "Nouvelle" || d.status === "Nouvelle demande" || d.status === "En attente" || d.status === "À traiter").length;
    const discussion = demandes.filter(d => d.status === "En discussion").length;
    const devis = demandes.filter(d => d.status === "Devis envoyé" || d.status === "Devis en préparation").length;
    const confirmees = demandes.filter(d => d.status === "Confirmé" || d.status === "Accepté").length;
    const realisees = demandes.filter(d => d.status === "Réalisé" || d.status === "Terminé").length;

    const calcPct = (count: number) => total > 0 ? Math.round((count / total) * 100) : 0;

    return { 
      total, nouvelles, discussion, devis, confirmees, realisees,
      pctNouvelles: calcPct(nouvelles),
      pctDiscussion: calcPct(discussion),
      pctDevis: calcPct(devis),
      pctConfirmees: calcPct(confirmees),
      pctRealisees: calcPct(realisees)
    };
  }, [demandes]);

  const getStatusStyle = (status: string) => {
    switch(status) {
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

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + " FCFA";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* BANNER PRESTATAIRE */}
      <div className="relative flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-[#F9F3E9] to-[#fbf7f0] p-6 md:p-0 rounded-3xl border border-[#e4d8c4]/50 shadow-sm overflow-hidden h-[340px] mb-8">
        
        {/* Left Side: Image container safely containing the woman without cropping */}
        <div className="relative w-full md:w-[55%] h-[200px] md:h-full flex-shrink-0 order-2 md:order-1 flex items-end justify-start">
          <img 
            src="/images/welcome-banner-prestataire.jpg" 
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
          <p className="text-gray-600 text-sm md:text-base font-medium mb-2 max-w-md">
            Faites rayonner votre savoir-faire, rencontrez de nouveaux clients et transformez vos talents en opportunités.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 cursor-pointer hover:border-[#F57F17]/30 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-[#FFF8E1] text-[#F57F17] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <FileText size={24} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold">{stats.nouvelles}</h3>
            </div>
            <p className="text-xs text-gray-500 font-medium">Nouvelles demandes</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 cursor-pointer hover:border-[#2E7D32]/30 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <CalendarCheck size={24} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{stats.confirmees}</h3>
            <p className="text-xs text-gray-500 font-medium">Événements confirmés</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 cursor-pointer hover:border-[#1976D2]/30 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-[#E3F2FD] text-[#1976D2] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Clock size={24} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{stats.discussion}</h3>
            <p className="text-xs text-gray-500 font-medium">En discussion</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 cursor-pointer hover:border-[#607D8B]/30 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-[#607D8B] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <CheckCircle size={24} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{stats.realisees}</h3>
            <p className="text-xs text-gray-500 font-medium">Événements réalisés</p>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Table: Dernières demandes */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <h2 className="font-semibold text-lg text-black">Dernières demandes</h2>
            <Link href="/prestataire/demandes" className="text-sm font-medium text-[#8f6f33] flex items-center gap-1 hover:underline">Voir toutes &rarr;</Link>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
                  <th className="pb-4 font-medium">Client</th>
                  <th className="pb-4 font-medium">Type</th>
                  <th className="pb-4 font-medium">Date</th>
                  <th className="pb-4 font-medium">Budget estimé</th>
                  <th className="pb-4 font-medium">Statut</th>
                  <th className="pb-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {demandes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 px-6 text-center">
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#FDF9F0] border border-[#e4d8c4] flex items-center justify-center text-[#8f6f33] mb-3 shadow-sm">
                          <FileText size={24} />
                        </div>
                        <h4 className="font-serif text-base font-bold text-gray-900 mb-1">
                          Aucune demande pour le moment
                        </h4>
                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                          Vos demandes de devis et sollicitations d&apos;organisateurs apparaîtront ici en direct dès qu&apos;un client vous contacte.
                        </p>
                        <div className="flex items-center gap-3">
                          <Link 
                            href="/prestataire/catalogue" 
                            className="px-4 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-[#b8924a] hover:text-black transition-all shadow-sm"
                          >
                            Ajouter une offre
                          </Link>
                          <Link 
                            href="/prestataire/profil" 
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-semibold hover:bg-gray-50 transition-all"
                          >
                            Mon profil
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  demandes.slice(0, 5).map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-medium text-gray-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                          {d.clientName ? d.clientName.substring(0, 2).toUpperCase() : 'C'}
                        </div>
                        {d.clientName}
                      </td>
                      <td className="py-4 text-gray-600">{d.eventType}</td>
                      <td className="py-4 text-gray-500">{d.eventDate}</td>
                      <td className="py-4 font-medium text-gray-800">{formatMoney(d.budget)}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusStyle(d.status)}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Link href="/prestataire/demandes" className="px-3 py-1 text-xs font-semibold text-[#8f6f33] border border-[#8f6f33]/30 rounded hover:bg-[#f5eee1] transition-colors inline-block">Voir</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statut des demandes (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <h2 className="font-semibold text-lg text-black mb-6">Statut de votre Pipeline</h2>
          <div className="flex flex-col items-center justify-center flex-1 w-full h-full">
            {stats.total > 0 ? (
              <div className="relative w-40 h-40 rounded-full flex items-center justify-center shrink-0 mb-6 transition-all duration-500" 
                   style={{
                     background: `conic-gradient(
                       #F57F17 0% ${stats.pctNouvelles}%, 
                       #1976D2 ${stats.pctNouvelles}% ${stats.pctNouvelles + stats.pctDiscussion}%, 
                       #7B1FA2 ${stats.pctNouvelles + stats.pctDiscussion}% ${stats.pctNouvelles + stats.pctDiscussion + stats.pctDevis}%, 
                       #2E7D32 ${stats.pctNouvelles + stats.pctDiscussion + stats.pctDevis}% ${stats.pctNouvelles + stats.pctDiscussion + stats.pctDevis + stats.pctConfirmees}%, 
                       #607D8B ${stats.pctNouvelles + stats.pctDiscussion + stats.pctDevis + stats.pctConfirmees}% 100%
                     )`
                   }}>
                <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
                  <span className="text-3xl font-bold leading-none">{stats.total}</span>
                  <span className="text-[11px] text-gray-400 font-medium uppercase mt-1 tracking-wider">Demandes</span>
                </div>
              </div>
            ) : (
              <div className="relative w-40 h-40 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center shrink-0 mb-6">
                <div className="w-28 h-28 bg-gray-50/50 rounded-full flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-400">0</span>
                  <span className="text-[11px] text-gray-400 font-medium uppercase mt-1 tracking-wider">Demande</span>
                </div>
              </div>
            )}
            
            <div className="w-full space-y-3 px-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#F57F17]" /> <span className="text-gray-600 font-medium">Nouvelles</span></div>
                <div className="text-right"><span className="font-bold text-gray-900">{stats.nouvelles}</span> <span className="text-gray-400 text-xs ml-1">({stats.pctNouvelles}%)</span></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#1976D2]" /> <span className="text-gray-600 font-medium">En discussion</span></div>
                <div className="text-right"><span className="font-bold text-gray-900">{stats.discussion}</span> <span className="text-gray-400 text-xs ml-1">({stats.pctDiscussion}%)</span></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#7B1FA2]" /> <span className="text-gray-600 font-medium">Devis envoyés</span></div>
                <div className="text-right"><span className="font-bold text-gray-900">{stats.devis}</span> <span className="text-gray-400 text-xs ml-1">({stats.pctDevis}%)</span></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#2E7D32]" /> <span className="text-gray-600 font-medium">Confirmées</span></div>
                <div className="text-right"><span className="font-bold text-gray-900">{stats.confirmees}</span> <span className="text-gray-400 text-xs ml-1">({stats.pctConfirmees}%)</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
