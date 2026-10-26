import { Calendar, Wallet, MapPin, Eye, Search, Filter, AlertCircle, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { getInvitationModelName } from "@/data/mock/invitations";
import EventClosureBlock from "@/components/admin/EventClosureBlock";
import { computeEventDates } from "@/utils/date-helpers";
import { loadModelLabels } from "@/lib/customModels";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminEvenementsPage() {
  const supabase = await createClient();
  // Noms et couvertures des modèles (dont ceux importés par l'admin) pour getInvitationModelName / Thumbnail
  await loadModelLabels(supabase);

  // Fetch real events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email');

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

  const now = new Date();
  const nowDayTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2 flex items-center gap-2">
            Tous les Événements <Calendar size={24} className="text-[#b8924a]" />
          </h1>
          <p className="text-gray-500 text-sm">Vue globale des événements organisés sur la plateforme.</p>
        </div>
        <Link
          href="/admin/alertes"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors"
        >
          <Clock size={15} />
          <span>Voir les rappels de clôture</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-stack w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Événement & Modèle</th>
                <th className="px-6 py-4 font-medium">Formule & Format</th>
                <th className="px-6 py-4 font-medium">Organisateur</th>
                <th className="px-6 py-4 font-medium">Lieu & Date</th>
                <th className="px-6 py-4 font-medium">Budget Prévu</th>
                <th className="px-6 py-4 font-medium">Statut du Cycle</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events && events.length > 0 ? (
                events.map((e) => {
                  const profile = profileMap.get(e.client_id);
                  const modelName = getInvitationModelName(e.invitation_model_id || e.invitationModelId);
                  const isGold = (e.plan || '').toLowerCase() === 'gold';
                  const isAnim = e.format?.toLowerCase().includes('carte') ? false : true;
                  const purchaseAmount = isGold ? (isAnim ? 20000 : 15000) : (isAnim ? 10000 : 7500);
                  const totalBudget = Number(e.budget_total || e.budget?.total || 0);
                  const datesInfo = computeEventDates(e.date, e.end_date);
                  
                  const isTerminated = e.status === "terminé" || e.status === "completed";
                  let diffDays = 0;
                  let isPassed = false;
                  if (e.date) {
                    const evtDate = new Date(e.date);
                    if (!isNaN(evtDate.getTime())) {
                      const evtDayTime = new Date(evtDate.getFullYear(), evtDate.getMonth(), evtDate.getDate()).getTime();
                      diffDays = Math.floor((nowDayTime - evtDayTime) / (1000 * 60 * 60 * 24));
                      isPassed = diffDays >= 0;
                    }
                  }

                  return (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 text-base">{e.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Modèle : <span className="text-[#7a5e2b] font-semibold">{modelName}</span>
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase w-max ${
                            isGold
                              ? "bg-[#b8924a]/20 text-[#7a5e2b] border border-[#b8924a]/40"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}>
                            <Sparkles size={11} className={isGold ? "text-[#8f6f33]" : "text-gray-500"} />
                            Formule {isGold ? "Gold" : "Premium"}
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium">
                            {isAnim ? "Modèle Animé" : "Modèle Carte"} • <strong className="text-emerald-700">{purchaseAmount.toLocaleString()} FCFA</strong>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{profile?.full_name || 'Inconnu'}</p>
                        <p className="text-xs text-gray-500">{profile?.email || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                          <Calendar size={13} className="text-[#8f6f33]" />
                          <span>Fin célébration : {datesInfo.endDateFormatted}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                          <MapPin size={12} className="text-gray-400" />
                          <span>{e.location || 'Lieu non défini'}</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 inline-flex items-center gap-1">
                            <Clock size={10} className="text-amber-700" />
                            Clôture auto (+7j) : {datesInfo.closingDateShort}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#8f6f33]">
                        {totalBudget > 0 ? `${totalBudget.toLocaleString()} FCFA` : 'Non défini'}
                      </td>
                      <td className="px-6 py-4">
                        {isTerminated ? (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-600" /> Terminé
                          </span>
                        ) : diffDays >= 7 ? (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-600" /> Terminé auto (+7j)
                          </span>
                        ) : isPassed ? (
                          <span className="bg-amber-50 text-amber-900 border border-amber-300 text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1">
                            <Clock size={12} className="text-amber-600" /> Clôture auto dans {7 - diffDays}j
                          </span>
                        ) : (
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1">
                            Actif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <EventClosureBlock
                            eventId={e.id}
                            eventName={e.name}
                            eventDate={e.date}
                            eventEndDate={e.end_date}
                            currentStatus={e.status || "active"}
                            compact={true}
                          />
                          <Link href={`/admin/evenements/${e.id}`} className="inline-block text-gray-400 hover:text-black transition-colors p-2" title="Voir l'événement complet">
                            <Eye size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <AlertCircle size={32} className="mx-auto mb-3 text-gray-300" />
                    Aucun événement n'a encore été créé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
