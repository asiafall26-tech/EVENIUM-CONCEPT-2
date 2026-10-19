"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Bell, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  Sparkles,
  ArrowRight,
  Archive,
  RotateCcw,
  User
} from "lucide-react";
import { AdminAlert, toggleEventTermination } from "@/app/admin/admin-actions";

interface Props {
  alerts: AdminAlert[];
  stats: {
    urgentReminders: number;
    autoTerminated: number;
    upcoming: number;
    totalEvents: number;
    completedEvents: number;
  };
}

export default function AdminAlertsClientView({ alerts: initialAlerts, stats: initialStats }: Props) {
  const [alerts, setAlerts] = useState<AdminAlert[]>(initialAlerts);
  const [stats, setStats] = useState(initialStats);
  const [activeFilter, setActiveFilter] = useState<"all" | "reminders" | "auto" | "upcoming">("all");
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Filter by tab
      if (activeFilter === "reminders" && alert.type !== "pending_reminder") return false;
      if (activeFilter === "auto" && alert.type !== "auto_terminated") return false;
      if (activeFilter === "upcoming" && alert.type !== "upcoming") return false;

      // Filter by search query
      if (search.trim() !== "") {
        const query = search.toLowerCase();
        const matchName = alert.eventName.toLowerCase().includes(query);
        const matchClient = alert.clientName.toLowerCase().includes(query);
        const matchEmail = alert.clientEmail.toLowerCase().includes(query);
        return matchName || matchClient || matchEmail;
      }

      return true;
    });
  }, [alerts, activeFilter, search]);

  const handleAction = async (eventId: string, newStatus: "active" | "terminé") => {
    const actionLabel = newStatus === "terminé" ? "clôturer cet événement" : "réactiver cet événement";
    if (!confirm(`Voulez-vous vraiment ${actionLabel} ?`)) return;

    setLoadingId(eventId);
    try {
      const res = await toggleEventTermination(eventId, newStatus);
      if (res.success) {
        // Update local state
        setAlerts((prev) =>
          prev.map((a) => {
            if (a.eventId === eventId) {
              return {
                ...a,
                status: newStatus,
                type: newStatus === "terminé" ? "manual_closed" : "pending_reminder",
                title: newStatus === "terminé" ? "Événement clôturé manuellement" : a.title,
                badge: newStatus === "terminé" ? "Terminé" : a.badge,
                badgeColor: newStatus === "terminé" ? "emerald" : "amber",
              };
            }
            return a;
          })
        );

        setStats((prev) => ({
          ...prev,
          urgentReminders: Math.max(0, newStatus === "terminé" ? prev.urgentReminders - 1 : prev.urgentReminders + 1),
          completedEvents: newStatus === "terminé" ? prev.completedEvents + 1 : Math.max(0, prev.completedEvents - 1),
        }));
      } else {
        alert("Erreur : " + res.error);
      }
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Rappels Clôture (0-7 jours) */}
        <div className="bg-amber-50/70 border border-amber-200/80 p-5 rounded-3xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
              Rappels Clôture (0-7j)
            </span>
            <p className="text-3xl font-serif font-bold text-amber-950 mt-1">
              {stats.urgentReminders}
            </p>
            <p className="text-[11px] text-amber-700 mt-1">
              À traiter avant clôture auto
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-200/60 text-amber-900 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
        </div>

        {/* Card 2: Clôtures Automatiques (+7 jours) */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 p-5 rounded-3xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Clôtures Automatiques
            </span>
            <p className="text-3xl font-serif font-bold text-emerald-950 mt-1">
              {stats.autoTerminated}
            </p>
            <p className="text-[11px] text-emerald-700 mt-1">
              Archivés à +7 jours révolus
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-200/60 text-emerald-900 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Card 3: Événements Imminents */}
        <div className="bg-blue-50/70 border border-blue-200/80 p-5 rounded-3xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider block">
              Célébrations Imminentes
            </span>
            <p className="text-3xl font-serif font-bold text-blue-950 mt-1">
              {stats.upcoming}
            </p>
            <p className="text-[11px] text-blue-700 mt-1">
              Prévus sous 72 heures
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-200/60 text-blue-900 flex items-center justify-center shrink-0">
            <Calendar size={24} />
          </div>
        </div>

        {/* Card 4: Total Événements & Taux de Clôture */}
        <div className="bg-[#2b2118] text-white border border-gray-800 p-5 rounded-3xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Total Événements
            </span>
            <p className="text-3xl font-serif font-bold text-[#b8924a] mt-1">
              {stats.totalEvents}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              {stats.completedEvents} événement(s) terminé(s)
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#b8924a]/20 text-[#b8924a] flex items-center justify-center shrink-0">
            <Archive size={24} />
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === "all"
                ? "bg-black text-[#b8924a] shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black"
            }`}
          >
            Toutes les alertes ({alerts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("reminders")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === "reminders"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60"
            }`}
          >
            <Clock size={13} />
            <span>Rappels de Clôture ({stats.urgentReminders})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("auto")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === "auto"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60"
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Clôtures Automatiques ({stats.autoTerminated})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("upcoming")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === "upcoming"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60"
            }`}
          >
            <Calendar size={13} />
            <span>À venir ({stats.upcoming})</span>
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par événement ou client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#b8924a]/30 focus:border-[#b8924a]"
          />
        </div>
      </div>

      {/* Alerts Stream List */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const isReminder = alert.type === "pending_reminder";
            const isAuto = alert.type === "auto_terminated";
            const isUpcoming = alert.type === "upcoming";
            const isTerminated = alert.status === "terminé" || alert.status === "completed";

            return (
              <div
                key={alert.id}
                className={`rounded-3xl border bg-white p-5 sm:p-6 shadow-xs transition-all hover:shadow-md ${
                  isReminder
                    ? "border-amber-200 bg-amber-50/20"
                    : isAuto
                    ? "border-emerald-200 bg-emerald-50/20"
                    : isUpcoming
                    ? "border-blue-200 bg-blue-50/20"
                    : "border-gray-200"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Alert Information */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          alert.badgeColor === "amber"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : alert.badgeColor === "emerald"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : alert.badgeColor === "blue"
                            ? "bg-blue-100 text-blue-900 border border-blue-300"
                            : "bg-gray-100 text-gray-800 border border-gray-300"
                        }`}
                      >
                        {isReminder && <Clock size={11} />}
                        {isAuto && <CheckCircle2 size={11} />}
                        {isUpcoming && <Calendar size={11} />}
                        {alert.badge}
                      </span>

                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-600 font-medium">
                        Célébration : <strong className="text-gray-800">{alert.eventDate}</strong>
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Fin : {alert.eventEndDate || alert.eventDate}
                      </span>
                      {alert.closingDateShort && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-[11px] text-[#7a5e2b] font-semibold">
                            Clôture auto (+7j) : {alert.closingDateShort}
                          </span>
                        </>
                      )}
                    </div>

                    <h4 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                      {alert.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                      <span className="flex items-center gap-1 font-medium text-gray-700">
                        <User size={13} className="text-gray-400" />
                        {alert.clientName}
                      </span>
                      {alert.clientEmail && (
                        <span>({alert.clientEmail})</span>
                      )}
                    </div>

                    {/* Progress indicator during 7-day grace period */}
                    {isReminder && (
                      <div className="pt-2 max-w-md">
                        <div className="flex justify-between items-center text-[11px] text-gray-500 mb-1">
                          <span className="font-semibold text-gray-700">Délai avant clôture automatique :</span>
                          <span className="font-bold text-[#8f6f33]">{alert.diffDays}/7 jours écoulés ({alert.daysLeft}j restant{alert.daysLeft > 1 ? "s" : ""})</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#b8924a] to-amber-600 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, Math.round((alert.diffDays / 7) * 100))}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="shrink-0 flex sm:flex-row md:flex-col items-stretch md:items-end gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <Link
                      href={`/admin/evenements/${alert.eventId}`}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 transition-colors shadow-xs"
                    >
                      <Eye size={14} />
                      <span>Voir la fiche</span>
                    </Link>

                    {isTerminated ? (
                      <button
                        type="button"
                        disabled={loadingId === alert.eventId}
                        onClick={() => handleAction(alert.eventId, "active")}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw size={13} />
                        <span>Réactiver</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={loadingId === alert.eventId}
                        onClick={() => handleAction(alert.eventId, "terminé")}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-black text-[#b8924a] hover:bg-gray-900 border border-[#b8924a]/50 shadow-sm transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} className="text-[#b8924a]" />
                        <span>{loadingId === alert.eventId ? "Clôture..." : "Terminer maintenant"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">
              Tout est sous contrôle !
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Aucune alerte active dans cette catégorie. Tous les événements sont à jour conformément à la règle des 7 jours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
