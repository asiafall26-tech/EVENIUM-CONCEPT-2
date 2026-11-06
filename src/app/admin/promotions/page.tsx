"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Sparkles, 
  Wallet, 
  TrendingUp, 
  Eye, 
  MousePointerClick, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  PauseCircle, 
  PlayCircle, 
  ShieldCheck, 
  Calendar, 
  RefreshCw,
  Search,
  Filter
} from "lucide-react";
import { ProviderCampaign, CampaignStatus } from "@/types/campaigns";
import { 
  fetchAdminCampaignsAction, 
  updateCampaignStatusAction 
} from "@/app/actions/campaignActions";

export default function AdminPromotionsPage() {
  const [campaigns, setCampaigns] = useState<ProviderCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminCampaignsAction();
      setCampaigns(data);
    } catch (err) {
      console.warn("Failed to load admin campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (campaignId: string, newStatus: CampaignStatus) => {
    setUpdatingId(campaignId);
    try {
      await updateCampaignStatusAction(campaignId, newStatus);
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, status: newStatus } : c))
      );
    } catch {
      alert("Erreur lors de la mise à jour du statut.");
    } finally {
      setUpdatingId(null);
    }
  };

  // KPIs
  const totalRevenueFcfa = campaigns.reduce((acc, c) => acc + (c.price_paid_fcfa || 0), 0);
  const activeCount = campaigns.filter((c) => c.status === "active").length;
  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressions_count || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks_count || 0), 0);

  const filteredCampaigns = campaigns.filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = c.provider_name.toLowerCase().includes(term);
      const matchTitle = c.title.toLowerCase().includes(term);
      const matchHook = c.hook.toLowerCase().includes(term);
      return matchName || matchTitle || matchHook;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* 1. EN-TÊTE & SYNTHÈSE DES REVENUS B2B */}
      <section className="relative overflow-hidden rounded-3xl border border-[#3d2f21] bg-[#1a130d] text-[#fbf5eb] p-6 sm:p-10 shadow-lg">
        <div aria-hidden className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-[#d4af37]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3d2e1f] border border-[#d4af37]/40 text-[#e6ca85] text-[11px] font-bold uppercase tracking-widest">
              <Sparkles size={13} className="text-[#f1c40f]" />
              <span>Modération & Monétisation Prestataires</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#fdfbf7] leading-tight">
              Gestion des Annonces & Boosts Privilèges
            </h1>
            <p className="text-sm text-[#bca790] max-w-2xl leading-relaxed">
              Supervisez les campagnes sponsorisées souscrites par les prestataires Evenium. Assurez le contrôle qualité et suivez les revenus publicitaires récurrents.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e2116] border border-[#d4af37]/30 text-[#e6ca85] hover:bg-[#3d2e1f] text-xs font-bold transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Actualiser</span>
          </button>
        </div>

        {/* 2. STATS & REVENUS KPI */}
        <div className="mt-8 pt-6 border-t border-[#3d2f21] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-[#241a12] rounded-2xl border border-[#4a3a29] p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#3d2e1f] text-[#f1c40f] border border-[#d4af37]/40 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#9e8b77]">Revenus Boosts</p>
              <p className="font-serif text-xl sm:text-2xl font-bold text-white">
                {totalRevenueFcfa.toLocaleString("fr-FR")} <span className="text-xs text-[#d4af37]">FCFA</span>
              </p>
            </div>
          </div>

          <div className="bg-[#241a12] rounded-2xl border border-[#4a3a29] p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#9e8b77]">Campagnes Actives</p>
              <p className="font-serif text-xl sm:text-2xl font-bold text-white">
                {activeCount} <span className="text-xs text-gray-400">en ligne</span>
              </p>
            </div>
          </div>

          <div className="bg-[#241a12] rounded-2xl border border-[#4a3a29] p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#3d2e1f] text-[#f1c40f] border border-[#d4af37]/40 flex items-center justify-center">
              <Eye size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#9e8b77]">Total Impressions</p>
              <p className="font-serif text-xl sm:text-2xl font-bold text-white">
                {totalImpressions.toLocaleString("fr-FR")}
              </p>
            </div>
          </div>

          <div className="bg-[#241a12] rounded-2xl border border-[#4a3a29] p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#3d2e1f] text-[#f1c40f] border border-[#d4af37]/40 flex items-center justify-center">
              <MousePointerClick size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#9e8b77]">Total Clics Organisateur</p>
              <p className="font-serif text-xl sm:text-2xl font-bold text-white">
                {totalClicks.toLocaleString("fr-FR")}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FILTRES & RECHERCHE */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par prestataire, mot-clé ou titre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:border-[#b8924a]"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter size={15} className="text-gray-400" />
          <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
            {[
              { label: "Toutes", val: "all" },
              { label: "Actives", val: "active" },
              { label: "En pause", val: "paused" },
              { label: "Expirées", val: "expired" },
            ].map((tab) => (
              <button
                key={tab.val}
                onClick={() => setFilterStatus(tab.val)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterStatus === tab.val
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 4. LISTE DÉTAILLÉE DES CAMPAGNES */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Chargement des campagnes...</div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
          Aucune campagne ne correspond à vos filtres.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((camp) => {
            const isUpdating = updatingId === camp.id;
            return (
              <div
                key={camp.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm hover:border-[#b8924a]/50 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
              >
                {/* Info prestataire & annonce */}
                <div className="flex items-start gap-4 flex-1">
                  
                  {/* Visuel miniature */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    {camp.media_url ? (
                      <Image src={camp.media_url} alt={camp.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sans image</div>
                    )}
                    <span className="absolute top-1.5 left-1.5 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-black/80 text-white">
                      {camp.badge}
                    </span>
                  </div>

                  {/* Contenu textuel */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-gray-900 truncate">
                        {camp.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          camp.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : camp.status === "paused"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {camp.status === "active" ? "● Active" : camp.status === "paused" ? "⏸ En pause" : "Expirée"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2">
                      {camp.hook}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 pt-1">
                      <span>Par : <strong className="text-gray-800">{camp.provider_name}</strong></span>
                      <span>Formule : <strong className="text-[#8f6f33]">{camp.plan_type}</strong></span>
                      <span>Règlement : <strong>{(camp.price_paid_fcfa || 0).toLocaleString("fr-FR")} FCFA</strong></span>
                      <span>Événements : <strong className="text-gray-700">{(camp.target_event_types || ["Tous"]).join(", ")}</strong></span>
                    </div>
                  </div>

                </div>

                {/* Métriques & Actions Modération */}
                <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                  
                  {/* Performances */}
                  <div className="text-left lg:text-right space-y-0.5">
                    <div className="text-xs font-semibold text-gray-900">
                      👁️ {camp.impressions_count?.toLocaleString("fr-FR") || 0} vues
                    </div>
                    <div className="text-xs text-[#8f6f33] font-medium">
                      🎯 {camp.clicks_count?.toLocaleString("fr-FR") || 0} clics
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Expire le {new Date(camp.ends_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex items-center gap-2">
                    {camp.status === "active" ? (
                      <button
                        onClick={() => handleStatusChange(camp.id, "paused")}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <PauseCircle size={14} />
                        <span>Mettre en pause</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(camp.id, "active")}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <PlayCircle size={14} />
                        <span>Activer</span>
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
