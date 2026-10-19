"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { toggleEventTermination } from "@/app/admin/admin-actions";
import { computeEventDates } from "@/utils/date-helpers";

interface Props {
  eventId: string;
  eventName: string;
  eventDate?: string;
  eventEndDate?: string;
  currentStatus: string;
  clientName?: string;
  onStatusChanged?: (newStatus: string) => void;
  compact?: boolean;
}

export default function EventClosureBlock({
  eventId,
  eventName,
  eventDate,
  eventEndDate,
  currentStatus: initialStatus,
  clientName,
  onStatusChanged,
  compact = false
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isTerminated = status === "terminé" || status === "completed";

  // Date calculation via standard helper
  const datesInfo = computeEventDates(eventDate, eventEndDate);
  const diffDays = datesInfo.daysSinceEnd;
  const daysLeft = datesInfo.daysLeftUntilClosing;
  const isPassed = datesInfo.isPassed;
  const isOverSevenDays = datesInfo.isOverSevenDays;
  const isValidDate = datesInfo.eventDateFormatted !== "Non définie";

  const handleToggle = async (targetStatus: "active" | "terminé") => {
    const actionLabel = targetStatus === "terminé" ? "clôturer et terminer" : "réactiver";
    if (!confirm(`Confirmez-vous vouloir ${actionLabel} l'événement « ${eventName} » ?`)) {
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await toggleEventTermination(eventId, targetStatus);
      if (res.success && res.status) {
        setStatus(res.status);
        if (onStatusChanged) onStatusChanged(res.status);
        setFeedback(
          targetStatus === "terminé"
            ? "L'événement a été marqué comme « Terminé » avec succès."
            : "L'événement a été réactivé avec succès."
        );
      } else {
        alert("Erreur : " + (res.error || "Impossible de mettre à jour le statut."));
      }
    } catch (err: any) {
      alert("Erreur de connexion : " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isTerminated ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} /> Terminé
          </span>
        ) : (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleToggle("terminé")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-black text-[#b8924a] hover:bg-gray-900 border border-[#b8924a]/40 shadow-xs transition-all active:scale-95 disabled:opacity-50"
            title="Clôturer l'événement de notre côté"
          >
            <CheckCircle2 size={13} />
            <span>{isLoading ? "Clôture..." : "Terminer l'événement"}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-7 relative overflow-hidden transition-all">
      {/* Decorative accent top border */}
      <div 
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          isTerminated 
            ? "bg-emerald-500" 
            : isPassed 
            ? "bg-gradient-to-r from-amber-400 via-[#b8924a] to-amber-600" 
            : "bg-[#b8924a]"
        }`} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#7a5e2b] bg-[#b8924a]/15 px-3 py-0.5 rounded-full border border-[#b8924a]/30">
              Gestion du Cycle de Vie
            </span>

            {isTerminated ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Statut : Terminé &amp; Clôturé
              </span>
            ) : isOverSevenDays ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 animate-pulse">
                <AlertTriangle size={13} />
                Délai de 7 jours atteint
              </span>
            ) : isPassed ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                <Clock size={13} className="text-amber-600" />
                Rappel : Clôture auto dans {daysLeft} jour{daysLeft > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                <Calendar size={13} />
                Événement à venir
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
            {isTerminated
              ? "Cet événement est officiellement terminé"
              : isPassed
              ? "Rappel : Clôture de l'événement"
              : "Suivi & Clôture de l'Événement"}
          </h3>

          <p className="text-sm text-gray-600 leading-relaxed">
            {isTerminated ? (
              <>
                L&apos;événement a été archivé. Les prestations et accès associés sont clôturés. 
                Toutes les informations restent consultables à titre d&apos;historique.
              </>
            ) : isPassed ? (
              <>
                La célébration s&apos;est terminée le{" "}
                <strong className="text-gray-900 font-semibold">
                  {datesInfo.endDateFormatted}
                </strong>{" "}
                (il y a {diffDays === 0 ? "aujourd'hui" : `${diffDays} jour${diffDays > 1 ? "s" : ""}`}).{" "}
                <span className="text-[#7a5e2b] font-semibold">
                  Règle automatique :
                </span>{" "}
                Il sera automatiquement marqué comme <strong>« Terminé »</strong> 7 jours après la fin de l&apos;événement{" "}
                (dans {daysLeft} jour{daysLeft > 1 ? "s" : ""}). Vous pouvez également le clôturer de votre côté dès maintenant.
              </>
            ) : (
              <>
                Prévu du{" "}
                <strong className="text-gray-900 font-semibold">
                  {datesInfo.eventDateFormatted}
                </strong>
                {datesInfo.endDateFormatted !== datesInfo.eventDateFormatted && (
                  <> au <strong>{datesInfo.endDateFormatted}</strong></>
                )}. 
                Conformément aux règles de la plateforme, cet événement sera automatiquement clôturé <strong>7 jours après</strong> la fin de l&apos;événement.
              </>
            )}
          </p>

          {/* Key Dates Badge Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="bg-gray-50 border border-gray-200/70 rounded-2xl p-3 text-xs">
              <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                Date de célébration
              </span>
              <span className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                <Calendar size={13} className="text-gray-400" />
                {datesInfo.eventDateFormatted}
              </span>
            </div>
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-xs">
              <span className="text-amber-800 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                Date de fin d&apos;événement
              </span>
              <span className="font-bold text-gray-950 text-sm flex items-center gap-1.5">
                <Clock size={13} className="text-amber-700" />
                {datesInfo.endDateFormatted}
              </span>
            </div>
            <div className="bg-[#b8924a]/15 border border-[#b8924a]/40 rounded-2xl p-3 text-xs">
              <span className="text-[#7a5e2b] block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                Clôture automatique (+7j)
              </span>
              <span className="font-bold text-[#7a5e2b] text-sm flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#8f6f33]" />
                {datesInfo.closingDateShort}
              </span>
            </div>
          </div>

          {/* Visual Progress Bar during the 7-day grace period */}
          {!isTerminated && isPassed && isValidDate && (
            <div className="pt-2">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1.5">
                <span className="font-semibold text-gray-700">
                  Progression vers la clôture automatique (7 jours) :
                </span>
                <span className="font-bold text-[#8f6f33]">
                  Jour {Math.min(7, diffDays)} sur 7 ({daysLeft}j restant{daysLeft > 1 ? "s" : ""})
                </span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <div 
                  className="h-full bg-gradient-to-r from-[#b8924a] to-amber-600 transition-all duration-700" 
                  style={{ width: `${Math.min(100, Math.round((diffDays / 7) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {feedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 mt-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 items-stretch md:items-end">
          {isTerminated ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleToggle("active")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-semibold transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
            >
              <RotateCcw size={16} />
              <span>{isLoading ? "Mise à jour..." : "Réactiver l'événement"}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleToggle("terminé")}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-black text-[#b8924a] hover:bg-gray-900 border border-[#b8924a]/50 text-xs sm:text-sm font-bold shadow-lg shadow-black/10 hover:shadow-black/20 hover:scale-102 active:scale-98 transition-all disabled:opacity-50"
            >
              <CheckCircle2 size={18} className="text-[#b8924a]" />
              <span>{isLoading ? "Clôture en cours..." : "Terminer l'événement maintenant"}</span>
            </button>
          )}

          <span className="text-[11px] text-gray-400 text-center md:text-right">
            {isTerminated ? "Action réversible par l'administrateur" : "Notification de rappel synchronisée"}
          </span>
        </div>
      </div>
    </div>
  );
}
