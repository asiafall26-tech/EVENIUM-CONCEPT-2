"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Wallet,
  ShoppingBag,
  Store,
  Users,
  Search,
  Filter,
  Download,
  Calendar,
  Sparkles,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Eye,
  X,
  FileSpreadsheet,
  Building2,
  Smartphone,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Lock,
  RefreshCw,
} from "lucide-react";

export interface UserDossier {
  id: string;
  fullName: string;
  email: string;
  role: "client" | "prestataire";
  phone?: string;
  createdAt: string;
  isActive: boolean;
  category?: string;
  isEveniumCertified?: boolean;
}

export interface ClientPurchase {
  id: string;
  orderRef: string;
  createdAt: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  eventEndDate?: string;
  autoClosingDate?: string;
  closingDateShort?: string;
  plan: "Gold" | "Premium" | "Standard";
  format: "Animée" | "Carte";
  invitationModelId?: string;
  invitationModelName: string;
  invitationThumbnail: string;
  guestsCount: number;
  amount: number;
  paymentMethod: string;
  status: "Payé" | "En attente";
}

export interface PrestatairePurchase {
  id: string;
  orderRef: string;
  createdAt: string;
  prestataireId?: string;
  prestataireName: string;
  prestataireEmail: string;
  prestatairePhone?: string;
  profession: string;
  isEveniumCertified: boolean;
  type: "Adhésion Plateforme" | "Abonnement Vitrine";
  eventName?: string;
  clientName?: string;
  devisAmount?: number;
  platformAmount: number;
  paymentMethod: string;
  status: "Encaissé" | "À recouvrer" | "Validé";
}

interface Props {
  clientPurchases: ClientPurchase[];
  prestatairePurchases: PrestatairePurchase[];
  allUsers?: UserDossier[];
}

export default function AdminPurchasesDashboard({
  clientPurchases,
  prestatairePurchases,
  allUsers = [],
}: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setLastSyncTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    setTimeout(() => setIsRefreshing(false), 800);
  };

  useEffect(() => {
    setLastSyncTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

    // Supabase Realtime channel for live data synchronisation
    const channel = supabase
      .channel("admin_purchases_realtime_sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => {
        router.refresh();
        setLastSyncTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        router.refresh();
        setLastSyncTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => {
        router.refresh();
        setLastSyncTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "devis" }, () => {
        router.refresh();
        setLastSyncTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "demandes_devis" }, () => {
        router.refresh();
        setLastSyncTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      })
      .subscribe();

    // Fallback polling every 10 seconds to guarantee fresh data even if webhooks or sockets fluctuate
    const interval = setInterval(() => {
      router.refresh();
      setLastSyncTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [router, supabase]);

  const [activeTab, setActiveTab] = useState<"users" | "clients" | "prestataires" | "all">("users");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "client" | "prestataire">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<string>("all");
  const [modalItem, setModalItem] = useState<
    | { type: "client"; data: ClientPurchase }
    | { type: "prestataire"; data: PrestatairePurchase }
    | null
  >(null);

  // Compute key metrics
  const totalClientRevenue = useMemo(
    () => clientPurchases.reduce((acc, c) => acc + c.amount, 0),
    [clientPurchases]
  );
  const totalPrestataireRevenue = useMemo(
    () => prestatairePurchases.reduce((acc, p) => acc + p.platformAmount, 0),
    [prestatairePurchases]
  );
  const totalRevenue = totalClientRevenue + totalPrestataireRevenue;

  // Filtered Client Purchases
  const filteredClients = useMemo(() => {
    return clientPurchases.filter((c) => {
      const matchQuery =
        searchQuery === "" ||
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.invitationModelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.orderRef.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPlan = selectedPlan === "all" || c.plan === selectedPlan;
      const matchPayment = selectedPayment === "all" || c.paymentMethod === selectedPayment;

      return matchQuery && matchPlan && matchPayment;
    });
  }, [clientPurchases, searchQuery, selectedPlan, selectedPayment]);

  // Filtered Prestataire Purchases
  const filteredPrestataires = useMemo(() => {
    return prestatairePurchases.filter((p) => {
      const matchQuery =
        searchQuery === "" ||
        p.prestataireName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.prestataireEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.orderRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.eventName && p.eventName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchPayment = selectedPayment === "all" || p.paymentMethod === selectedPayment;

      return matchQuery && matchPayment;
    });
  }, [prestatairePurchases, searchQuery, selectedPayment]);

  // User Dossiers mapping (Strictly classified by user to ensure confidentiality)
  const usersWithData = useMemo(() => {
    return (allUsers || []).map((u) => {
      const isClient = u.role === "client";
      const userPurchases = clientPurchases.filter((c) => c.clientId === u.id);
      const userTransactions = prestatairePurchases.filter((p) => p.prestataireId === u.id);
      const totalAmount = isClient
        ? userPurchases.reduce((acc, p) => acc + p.amount, 0)
        : userTransactions.reduce((acc, p) => acc + p.platformAmount, 0);

      return {
        ...u,
        userPurchases,
        userTransactions,
        totalAmount,
      };
    });
  }, [allUsers, clientPurchases, prestatairePurchases]);

  const filteredUsers = useMemo(() => {
    return usersWithData.filter((u) => {
      const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
      const matchQuery =
        searchQuery === "" ||
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.category && u.category.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchRole && matchQuery;
    });
  }, [usersWithData, userRoleFilter, searchQuery]);

  // Combined Unified Chronological Stream
  const combinedStream = useMemo(() => {
    const stream = [
      ...filteredClients.map((c) => ({
        type: "client" as const,
        id: c.id,
        orderRef: c.orderRef,
        date: c.createdAt,
        actorName: c.clientName,
        actorEmail: c.clientEmail,
        actorType: "Client / Organisateur",
        itemLabel: `${c.plan} • ${c.invitationModelName}`,
        details: `${c.eventName} (${c.format})`,
        amount: c.amount,
        paymentMethod: c.paymentMethod,
        status: c.status,
        raw: c,
      })),
      ...filteredPrestataires.map((p) => ({
        type: "prestataire" as const,
        id: p.id,
        orderRef: p.orderRef,
        date: p.createdAt,
        actorName: p.prestataireName,
        actorEmail: p.prestataireEmail,
        actorType: p.isEveniumCertified ? "Prestataire Certifié" : "Prestataire Externe",
        itemLabel: p.type,
        details: p.eventName ? `Événement : ${p.eventName}` : p.profession,
        amount: p.platformAmount,
        paymentMethod: p.paymentMethod,
        status: p.status,
        raw: p,
      })),
    ];

    return stream.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredClients, filteredPrestataires]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "Type",
      "Reference",
      "Date",
      "Acheteur",
      "Email",
      "Designation",
      "Montant (FCFA)",
      "Paiement",
      "Statut",
    ];

    const rows = combinedStream.map((item) => [
      item.type === "client" ? "Achat Client" : "Achat Prestataire",
      item.orderRef,
      new Date(item.date).toLocaleDateString(),
      item.actorName,
      item.actorEmail,
      `"${item.itemLabel} - ${item.details}"`,
      item.amount,
      item.paymentMethod,
      item.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `evenium_achats_plateforme_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header with Title and CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7a5e2b] bg-[#b8924a]/15 px-3 py-0.5 rounded-full border border-[#b8924a]/30">
              Administration Financière
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              En direct (Temps réel)
            </span>
            {lastSyncTime && (
              <span className="text-[11px] text-gray-400">
                • Synchronisé à {lastSyncTime}
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-950 flex items-center gap-2.5">
            Suivi des Achats &amp; Transactions
            <Sparkles size={22} className="text-[#b8924a]" />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualisez tous les achats des utilisateurs (formules, modèles animés) et les transactions des prestataires (adhésions, abonnements).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-semibold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shrink-0"
            title="Actualiser les données immédiatement"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin text-[#8f6f33]" : "text-gray-500"} />
            <span>{isRefreshing ? "Actualisation..." : "Actualiser"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-black text-[#b8924a] hover:bg-gray-900 font-semibold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Download size={16} />
            <span>Exporter en CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Chiffre d'Affaires Global */}
        <div className="bg-[#2b2118] text-white p-6 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-5 opacity-10">
            <Wallet size={75} />
          </div>
          <div>
            <div className="w-11 h-11 rounded-2xl bg-[#b8924a]/20 text-[#b8924a] flex items-center justify-center mb-3">
              <Wallet size={22} strokeWidth={1.8} />
            </div>
            <p className="text-xs text-gray-400 font-medium">Revenus Totaux Plateforme</p>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#b8924a] mt-1">
              {totalRevenue.toLocaleString()} <span className="text-sm text-gray-400">FCFA</span>
            </h3>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-800 flex items-center gap-1">
            <TrendingUp size={13} className="text-emerald-400" />
            Clients ({totalClientRevenue.toLocaleString()}) + Prestataires ({totalPrestataireRevenue.toLocaleString()})
          </p>
        </div>

        {/* Card 2: Achats Utilisateurs (Clients) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#8f6f33] flex items-center justify-center mb-3">
              <ShoppingBag size={22} strokeWidth={1.8} />
            </div>
            <p className="text-xs text-gray-500 font-medium">Achats des Organisateurs</p>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-1">
              {totalClientRevenue.toLocaleString()} <span className="text-sm font-sans font-normal text-gray-500">FCFA</span>
            </h3>
          </div>
          <p className="text-[11px] text-gray-500 mt-3 pt-3 border-t border-gray-100">
            {clientPurchases.length} formule(s) &amp; modèle(s) d&apos;invitations vendus
          </p>
        </div>

        {/* Card 3: Adhésions & Revenus Prestataires */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
              <Store size={22} strokeWidth={1.8} />
            </div>
            <p className="text-xs text-gray-500 font-medium">Revenus Réels Prestataires</p>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-1">
              {totalPrestataireRevenue.toLocaleString()} <span className="text-sm font-sans font-normal text-gray-500">FCFA</span>
            </h3>
          </div>
          <p className="text-[11px] text-gray-500 mt-3 pt-3 border-t border-gray-100">
            {totalPrestataireRevenue > 0
              ? `${prestatairePurchases.length} transaction(s) enregistrée(s)`
              : "Aucune transaction payée pour l'instant"}
          </p>
        </div>

        {/* Card 4: Comptes Utilisateurs Réels */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <ShieldCheck size={22} strokeWidth={1.8} />
            </div>
            <p className="text-xs text-gray-500 font-medium">Comptes Utilisateurs Réels</p>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-1">
              {allUsers.length} <span className="text-sm font-sans font-normal text-gray-500">comptes</span>
            </h3>
          </div>
          <p className="text-[11px] text-gray-500 mt-3 pt-3 border-t border-gray-100">
            {allUsers.filter((u) => u.role === "client").length} Client(s) • {allUsers.filter((u) => u.role === "prestataire").length} Prestataire(s)
          </p>
        </div>
      </div>

      {/* Interactive Tabs, Search & Filters */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "users"
                  ? "bg-black text-[#b8924a] shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <UserCheck size={16} />
              <span>Classé par Utilisateur ({allUsers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("clients")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "clients"
                  ? "bg-black text-[#b8924a] shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Users size={16} />
              <span>Achats Clients ({clientPurchases.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("prestataires")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "prestataires"
                  ? "bg-black text-[#b8924a] shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Store size={16} />
              <span>Prestataires &amp; Devis ({prestatairePurchases.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-black text-[#b8924a] shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span>Flux Global ({combinedStream.length})</span>
            </button>
          </div>

          <div className="text-xs text-gray-400 text-right hidden sm:block">
            {activeTab === "users" && `${filteredUsers.length} dossier(s) utilisateur(s)`}
            {activeTab === "clients" && `${filteredClients.length} achat(s) client(s)`}
            {activeTab === "prestataires" && `${filteredPrestataires.length} transaction(s) prestataire(s)`}
            {activeTab === "all" && `${combinedStream.length} ligne(s) affichée(s)`}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par utilisateur, email, événement, modèle d'invitation (Sceau, Velours...)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40 focus:border-[#b8924a]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {activeTab === "users" && (
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
                <button
                  type="button"
                  onClick={() => setUserRoleFilter("all")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    userRoleFilter === "all" ? "bg-black text-[#b8924a]" : "text-gray-600 hover:text-black"
                  }`}
                >
                  Tous ({usersWithData.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter("client")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    userRoleFilter === "client" ? "bg-black text-[#b8924a]" : "text-gray-600 hover:text-black"
                  }`}
                >
                  Clients ({usersWithData.filter((u) => u.role === "client").length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter("prestataire")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    userRoleFilter === "prestataire" ? "bg-black text-[#b8924a]" : "text-gray-600 hover:text-black"
                  }`}
                >
                  Prestataires ({usersWithData.filter((u) => u.role === "prestataire").length})
                </button>
              </div>
            )}

            {activeTab === "clients" && (
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
              >
                <option value="all">Toutes formules</option>
                <option value="Gold">Formule Gold</option>
                <option value="Premium">Formule Premium</option>
              </select>
            )}

            {activeTab !== "users" && (
              <select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
              >
                <option value="all">Tous paiements</option>
                <option value="Paiement en ligne (Validé)">Paiement en ligne</option>
                <option value="Virement Bancaire">Virement Bancaire</option>
                <option value="Carte Bancaire">Carte Bancaire</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Content based on activeTab */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* VIEW 0: CLASSIFIED STRICTLY BY USER (DOSSIERS ISOLÉS) */}
        {activeTab === "users" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-[#b8924a] flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-gray-900 text-sm sm:text-base">
                    Dossiers Réels &amp; Confidentialité Garantie
                  </h3>
                  <p className="text-xs text-gray-600">
                    Chaque utilisateur (client ou prestataire) dispose de son dossier strictement isolé. Les informations ne sont jamais mélangées.
                  </p>
                </div>
              </div>

              <div className="text-xs font-semibold text-amber-900 bg-white px-3 py-1 rounded-xl border border-amber-200 shrink-0">
                {filteredUsers.length} dossier(s) affiché(s)
              </div>
            </div>

            {/* List of User Dossiers */}
            <div className="grid grid-cols-1 gap-5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isClient = user.role === "client";
                  return (
                    <div
                      key={user.id}
                      className="bg-white rounded-3xl border border-gray-200/90 p-6 shadow-xs hover:border-[#b8924a]/50 hover:shadow-md transition-all space-y-4"
                    >
                      {/* User Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-serif text-lg font-bold uppercase shrink-0 shadow-xs ${
                            isClient
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}>
                            {user.fullName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-serif font-bold text-gray-900 text-lg">
                                {user.fullName}
                              </h4>
                              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                                isClient
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-purple-100 text-purple-800 border border-purple-200"
                              }`}>
                                {isClient ? "Client Organisateur" : "Prestataire Partenaire"}
                              </span>
                              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold inline-flex items-center gap-1">
                                <Lock size={10} className="text-emerald-600" />
                                Dossier Isolé
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                              <span>Email : <strong className="text-gray-700">{user.email}</strong></span>
                              <span>•</span>
                              <span>Inscrit(e) le {new Date(user.createdAt).toLocaleDateString("fr-FR")}</span>
                              {user.category && (
                                <>
                                  <span>•</span>
                                  <span>Métier : <strong className="text-gray-800">{user.category}</strong></span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 bg-gray-50/80 px-4 py-2.5 rounded-2xl border border-gray-200/60">
                          <span className="text-[10px] uppercase font-bold text-gray-400">
                            {isClient ? "Total Achats Réels" : "Total Facturé / Adhésions"}
                          </span>
                          <span className="font-serif font-bold text-gray-950 text-base text-[#8f6f33]">
                            {user.totalAmount.toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>

                      {/* Content specific to this user */}
                      {isClient ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                              Événements &amp; Achats de Formules ({user.userPurchases.length})
                            </span>
                            <span className="text-[11px] text-gray-400">
                              Données réelles de {user.fullName}
                            </span>
                          </div>

                          {user.userPurchases.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              {user.userPurchases.map((p) => (
                                <div
                                  key={p.id}
                                  onClick={() => setModalItem({ type: "client", data: p })}
                                  className="p-4 rounded-2xl border border-gray-200/80 bg-gray-50/50 hover:bg-amber-50/40 hover:border-[#b8924a]/50 cursor-pointer transition-all space-y-2.5 shadow-2xs"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                      {p.invitationThumbnail && (
                                        <div className="relative w-8 h-11 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                          <Image src={p.invitationThumbnail} alt={p.invitationModelName} fill className="object-cover" />
                                        </div>
                                      )}
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#b8924a]/20 text-[#7a5e2b]">
                                            {p.plan}
                                          </span>
                                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                                            {p.format}
                                          </span>
                                        </div>
                                        <h5 className="font-serif font-bold text-gray-900 text-sm mt-0.5">
                                          {p.invitationModelName}
                                        </h5>
                                        <p className="text-[11px] text-gray-500 font-medium">{p.eventName}</p>
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="font-serif font-bold text-[#8f6f33] text-sm">
                                        {p.amount.toLocaleString()} FCFA
                                      </p>
                                      <span className="text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                                        <CheckCircle2 size={10} /> Payé
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-gray-200/60 text-gray-600">
                                    <div>
                                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Fin célébration :</span>
                                      <strong className="text-gray-800">{p.eventEndDate || p.eventDate}</strong>
                                    </div>
                                    <div>
                                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Clôture auto (+7j) :</span>
                                      <span className="text-[#7a5e2b] font-semibold">{p.closingDateShort || p.autoClosingDate || "J+7"}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center text-xs text-gray-400">
                              Aucun événement ni achat de formule enregistré pour cet organisateur.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                              Transactions &amp; Adhésions Réelles ({user.userTransactions.length})
                            </span>
                            <span className="text-[11px] text-gray-400">
                              Activité professionnelle de {user.fullName}
                            </span>
                          </div>

                          {user.userTransactions.length > 0 ? (
                            <div className="space-y-2">
                              {user.userTransactions.map((tx) => (
                                <div
                                  key={tx.id}
                                  onClick={() => setModalItem({ type: "prestataire", data: tx })}
                                  className="p-3.5 rounded-2xl border border-gray-200/80 bg-gray-50/50 hover:bg-amber-50/40 hover:border-[#b8924a]/50 cursor-pointer transition-all flex items-center justify-between"
                                >
                                  <div>
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                                      {tx.type}
                                    </span>
                                    <p className="text-xs font-semibold text-gray-900 mt-1">{tx.eventName || tx.profession}</p>
                                    <p className="text-[11px] text-gray-400">Réf : {tx.orderRef} • {new Date(tx.createdAt).toLocaleDateString("fr-FR")}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="font-serif font-bold text-gray-950 text-sm">
                                      {tx.platformAmount.toLocaleString()} FCFA
                                    </p>
                                    <span className="text-[10px] text-emerald-600 font-semibold">{tx.status}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center text-xs text-gray-400">
                              Aucune transaction financière enregistrée pour ce prestataire.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="pt-2 flex justify-end">
                        <Link
                          href={`/admin/utilisateurs/${user.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-black hover:text-white transition-all"
                        >
                          <Eye size={13} />
                          <span>Ouvrir le dossier complet de {user.fullName}</span>
                          <ChevronRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-3xl border border-gray-200 text-gray-400 text-sm">
                  Aucun utilisateur trouvé correspondant à votre recherche.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 1: CLIENTS PURCHASES ONLY */}
        {activeTab === "clients" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Réf &amp; Date</th>
                  <th className="px-6 py-4">Client (Organisateur)</th>
                  <th className="px-6 py-4">Événement</th>
                  <th className="px-6 py-4">Formule &amp; Modèle</th>
                  <th className="px-6 py-4">Format</th>
                  <th className="px-6 py-4">Montant Payé</th>
                  <th className="px-6 py-4">Paiement</th>
                  <th className="px-6 py-4 text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.length > 0 ? (
                  filteredClients.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setModalItem({ type: "client", data: c })}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                          {c.orderRef}
                        </span>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {new Date(c.createdAt).toLocaleDateString()} • {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {c.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm group-hover:text-[#8f6f33] transition-colors">
                              {c.clientName}
                            </p>
                            <p className="text-xs text-gray-400">{c.clientEmail}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{c.eventName}</p>
                        <p className="text-xs text-gray-500">
                          {c.eventType} • {c.guestsCount} invités
                        </p>
                        <div className="mt-1 flex flex-col gap-0.5 text-[11px]">
                          <span className="text-gray-500 font-medium">
                            Fin célébration : <strong className="text-gray-800">{c.eventEndDate || c.eventDate}</strong>
                          </span>
                          {c.autoClosingDate && (
                            <span className="text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60 w-max font-semibold flex items-center gap-1">
                              <Clock size={10} />
                              Clôture auto (+7j) : {c.closingDateShort || c.autoClosingDate}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          {c.invitationThumbnail && (
                            <div className="relative w-9 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                              <Image
                                src={c.invitationThumbnail}
                                alt={c.invitationModelName}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <span
                              className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full mb-0.5 ${
                                c.plan === "Gold"
                                  ? "bg-[#b8924a]/20 text-[#7a5e2b] border border-[#b8924a]/50"
                                  : "bg-gray-100 text-gray-700 border border-gray-300"
                              }`}
                            >
                              {c.plan}
                            </span>
                            <p className="font-semibold text-gray-900 text-xs">
                              {c.invitationModelName}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1 ${
                            c.format === "Animée"
                              ? "bg-[#6b1f2a] text-pink-100"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <Smartphone size={12} />
                          {c.format}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-serif font-bold text-gray-900 text-base">
                          {c.amount.toLocaleString()} FCFA
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <CheckCircle2 size={12} /> Payé
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700">
                          <CreditCard size={13} className="text-[#b8924a]" />
                          {c.paymentMethod}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/evenements/${c.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200/80 transition-colors"
                            title="Voir l'événement complet"
                          >
                            <Calendar size={13} className="text-[#8f6f33]" />
                            <span>Voir l&apos;événement</span>
                          </Link>
                          <button
                            type="button"
                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
                            title="Voir la facturette"
                          >
                            <Eye size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      Aucun achat client ne correspond aux critères.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: PRESTATAIRES PURCHASES & TRANSACTIONS ONLY */}
        {activeTab === "prestataires" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Réf &amp; Date</th>
                  <th className="px-6 py-4">Prestataire &amp; Métier</th>
                  <th className="px-6 py-4">Type de Transaction</th>
                  <th className="px-6 py-4">Détails / Événement</th>
                  <th className="px-6 py-4">Volume Devis</th>
                  <th className="px-6 py-4">Revenu Plateforme</th>
                  <th className="px-6 py-4">Paiement</th>
                  <th className="px-6 py-4 text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPrestataires.length > 0 ? (
                  filteredPrestataires.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setModalItem({ type: "prestataire", data: p })}
                      className="hover:bg-purple-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                          {p.orderRef}
                        </span>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {p.prestataireName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-gray-900 text-sm group-hover:text-purple-700 transition-colors">
                                {p.prestataireName}
                              </p>
                              {p.isEveniumCertified ? (
                                <span className="bg-[#b8924a]/20 text-[#7a5e2b] text-[9px] px-1.5 py-0.2 rounded-full font-bold border border-[#b8924a]/40">
                                  Certifié
                                </span>
                              ) : (
                                <span className="bg-gray-100 text-gray-600 text-[9px] px-1.5 py-0.2 rounded-full font-medium">
                                  Externe
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">{p.profession || p.prestataireEmail}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            p.type === "Adhésion Plateforme"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-[#f5eee1] text-[#8f6f33] border border-[#b8924a]/30"
                          }`}
                        >
                          {p.type}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 text-xs">
                          {p.eventName || "Inscription Répertoire"}
                        </p>
                        {p.clientName && (
                          <p className="text-[11px] text-gray-400">Pour : {p.clientName}</p>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {p.devisAmount ? (
                          <span className="font-medium text-gray-600 text-xs">
                            {p.devisAmount.toLocaleString()} FCFA
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-serif font-bold text-[#8f6f33] text-base">
                          {p.platformAmount.toLocaleString()} FCFA
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <CheckCircle2 size={12} /> {p.status}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700">
                          <CreditCard size={13} className="text-purple-600" />
                          {p.paymentMethod}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
                          title="Voir la facturette"
                        >
                          <Eye size={17} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      Aucune transaction prestataire trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 3: ALL TRANSACTIONS UNIFIED STREAM */}
        {activeTab === "all" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Réf &amp; Date</th>
                  <th className="px-6 py-4">Type &amp; Acteur</th>
                  <th className="px-6 py-4">Désignation de l&apos;Achat</th>
                  <th className="px-6 py-4">Détails</th>
                  <th className="px-6 py-4">Montant Encaissé</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {combinedStream.length > 0 ? (
                  combinedStream.map((item) => (
                    <tr
                      key={`${item.type}-${item.id}`}
                      onClick={() =>
                        setModalItem(
                          item.type === "client"
                            ? { type: "client", data: item.raw as ClientPurchase }
                            : { type: "prestataire", data: item.raw as PrestatairePurchase }
                        )
                      }
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-lg">
                          {item.orderRef}
                        </span>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              item.type === "client"
                                ? "bg-amber-100 text-[#7a5e2b]"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {item.type === "client" ? "C" : "P"}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm group-hover:text-[#8f6f33] transition-colors">
                              {item.actorName}
                            </p>
                            <p className="text-[11px] text-gray-400">{item.actorType}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 text-xs">{item.itemLabel}</p>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-500">
                        {item.details}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-serif font-bold text-gray-900 text-base">
                          {item.amount.toLocaleString()} FCFA
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg font-medium">
                          {item.paymentMethod}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 size={12} />
                          {item.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.type === "client" && (
                            <Link
                              href={`/admin/evenements/${item.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200/80 transition-colors"
                              title="Voir l'événement complet"
                            >
                              <Calendar size={13} className="text-[#8f6f33]" />
                              <span>Voir l&apos;événement</span>
                            </Link>
                          )}
                          <button
                            type="button"
                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
                            title="Voir la facturette"
                          >
                            <Eye size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      Aucune transaction trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL / FACTURETTE */}
      {modalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-gray-900 to-black text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#b8924a]">
                  Fiche de Facturation &amp; Achat
                </span>
                <h3 className="text-xl font-serif font-bold mt-0.5">
                  Réf :{" "}
                  {modalItem.type === "client"
                    ? modalItem.data.orderRef
                    : modalItem.data.orderRef}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {modalItem.type === "client" ? (
                <>
                  <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 flex items-center gap-3">
                    {modalItem.data.invitationThumbnail && (
                      <div className="relative w-14 h-18 rounded-xl overflow-hidden shrink-0 border border-gray-300">
                        <Image
                          src={modalItem.data.invitationThumbnail}
                          alt={modalItem.data.invitationModelName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a5e2b] bg-[#b8924a]/20 px-2 py-0.5 rounded-full">
                        Formule {modalItem.data.plan}
                      </span>
                      <h4 className="font-serif font-bold text-gray-900 text-base mt-1">
                        {modalItem.data.invitationModelName}
                      </h4>
                      <p className="text-xs text-gray-600">
                        Format {modalItem.data.format} • {modalItem.data.guestsCount} invités
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm divide-y divide-gray-100">
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Acheteur (Client) :</span>
                      <span className="font-semibold text-gray-900">
                        {modalItem.data.clientName}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Email :</span>
                      <span className="text-gray-900">{modalItem.data.clientEmail}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Événement :</span>
                      <span className="font-medium text-gray-900">
                        {modalItem.data.eventName} ({modalItem.data.eventType})
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Date de célébration (Début) :</span>
                      <span className="text-gray-900 font-medium">{modalItem.data.eventDate}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Date de fin de l&apos;événement :</span>
                      <span className="text-gray-900 font-bold">{modalItem.data.eventEndDate || modalItem.data.eventDate}</span>
                    </div>
                    <div className="flex justify-between py-1.5 bg-amber-50/70 px-3 py-2 rounded-xl border border-amber-200/60">
                      <span className="text-amber-900 font-semibold flex items-center gap-1.5 text-xs">
                        <Clock size={13} className="text-amber-700" /> Date de clôture auto (+7j) :
                      </span>
                      <span className="text-amber-950 font-bold text-xs">{modalItem.data.autoClosingDate}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Moyen de paiement :</span>
                      <span className="font-semibold text-gray-900">
                        {modalItem.data.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Date de commande :</span>
                      <span className="text-gray-900">
                        {new Date(modalItem.data.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 pt-3 text-base">
                      <span className="font-bold text-gray-900">Total Payé :</span>
                      <span className="font-serif font-bold text-xl text-[#8f6f33]">
                        {modalItem.data.amount.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-purple-50/60 border border-purple-200/60 rounded-2xl p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      {modalItem.data.type}
                    </span>
                    <h4 className="font-serif font-bold text-gray-900 text-lg mt-1">
                      {modalItem.data.prestataireName}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {modalItem.data.profession} •{" "}
                      {modalItem.data.isEveniumCertified
                        ? "Badge Evenium Certifié"
                        : "Prestataire Externe"}
                    </p>
                  </div>

                  <div className="space-y-3 text-sm divide-y divide-gray-100">
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Email professionnel :</span>
                      <span className="text-gray-900">{modalItem.data.prestataireEmail}</span>
                    </div>
                    {modalItem.data.eventName && (
                      <div className="flex justify-between py-1.5">
                        <span className="text-gray-500">Événement associé :</span>
                        <span className="font-medium text-gray-900">
                          {modalItem.data.eventName}
                        </span>
                      </div>
                    )}
                    {modalItem.data.devisAmount && (
                      <div className="flex justify-between py-1.5">
                        <span className="text-gray-500">Montant total de la prestation :</span>
                        <span className="font-medium text-gray-900">
                          {modalItem.data.devisAmount.toLocaleString()} FCFA
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Moyen de règlement :</span>
                      <span className="font-semibold text-gray-900">
                        {modalItem.data.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Date d&apos;enregistrement :</span>
                      <span className="text-gray-900">
                        {new Date(modalItem.data.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 pt-3 text-base">
                      <span className="font-bold text-gray-900">
                        Part Revenu Plateforme :
                      </span>
                      <span className="font-serif font-bold text-xl text-purple-700">
                        {modalItem.data.platformAmount.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              {modalItem.type === "client" ? (
                <Link
                  href={`/admin/evenements/${modalItem.data.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-[#b8924a] hover:bg-gray-900 text-xs font-semibold shadow-sm transition-colors"
                >
                  <Calendar size={14} />
                  <span>Voir l&apos;événement du client</span>
                </Link>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
