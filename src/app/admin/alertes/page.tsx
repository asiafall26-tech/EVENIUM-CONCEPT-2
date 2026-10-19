import { 
  Bell, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Eye, 
  RefreshCw,
  Info,
  Archive
} from "lucide-react";
import Link from "next/link";
import { getAdminAlertsAndAutoTerminate } from "../admin-actions";
import EventClosureBlock from "@/components/admin/EventClosureBlock";
import AdminAlertsClientView from "@/components/admin/AdminAlertsClientView";

export const dynamic = "force-dynamic";

export default async function AdminAlertesPage() {
  const { alerts, stats, error } = await getAdminAlertsAndAutoTerminate();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7a5e2b] bg-[#b8924a]/15 px-3 py-0.5 rounded-full border border-[#b8924a]/30">
              Système Automatique &amp; Alertes
            </span>
            <span className="text-xs text-gray-400">• Règle des 7 jours</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-950 flex items-center gap-2.5">
            Alertes &amp; Rappels de Clôture
            <Bell size={24} className="text-[#b8924a]" />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Surveillance automatique des événements, rappels de fin d&apos;événement et clôture automatique après 7 jours.
          </p>
        </div>

        <Link
          href="/admin/alertes"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-black text-[#b8924a] hover:bg-gray-900 font-semibold text-xs sm:text-sm shadow-md transition-all hover:scale-102 active:scale-98 shrink-0"
        >
          <RefreshCw size={15} />
          <span>Synchroniser les alertes</span>
        </Link>
      </div>

      {/* Explanatory Banner: The 7-Day Auto-Termination Rule */}
      <div className="rounded-3xl bg-gradient-to-r from-[#241b13] to-[#2b2118] p-6 text-white border border-[#b8924a]/30 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#b8924a]/20 via-transparent to-transparent pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#b8924a]/20 text-[#b8924a] flex items-center justify-center shrink-0 border border-[#b8924a]/40">
            <ShieldCheck size={24} />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-lg font-bold text-[#b8924a] flex items-center gap-2">
              Fonctionnement de la Clôture Automatique à 7 Jours
              <Sparkles size={16} />
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-4xl">
              <strong>1. Période de grâce (J+0 à J+7) :</strong> Dès la date de célébration passée, une alerte de rappel est émise pour vous inviter à clôturer l&apos;événement de votre côté.
              <br />
              <strong>2. Clôture automatique (J+7) :</strong> Exactement 7 jours après la date de l&apos;événement, le système Evenium passe automatiquement le statut en <strong>« Terminé »</strong> et archive le dossier.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Client View with KPI Cards, Filters, and Actionable Event List */}
      <AdminAlertsClientView alerts={alerts} stats={stats} />
    </div>
  );
}
