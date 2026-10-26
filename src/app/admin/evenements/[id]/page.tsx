import { Calendar, Wallet, MapPin, ArrowLeft, CheckCircle, Store, Clock, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvitationModelName } from "@/data/mock/invitations";
import EventClosureBlock from "@/components/admin/EventClosureBlock";
import { computeEventDates } from "@/utils/date-helpers";
import { loadModelLabels } from "@/lib/customModels";

export default async function AdminEventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // Noms et couvertures des modèles (dont ceux importés par l'admin) pour getInvitationModelName / Thumbnail
  await loadModelLabels(supabase);

  // 1. Fetch Event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (eventError || !event) {
    notFound();
  }

  // Fetch Organizer profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone')
    .eq('id', event.client_id)
    .single();

  // 2. Fetch Prestataires associés
  const { data: provEvents } = await supabase
    .from('provider_events')
    .select('*')
    .eq('event_id', id);

  const providerIds = (provEvents || []).map((pe: any) => pe.prestataire_id || pe.provider_id).filter(Boolean);
  let providerProfiles: any[] = [];
  if (providerIds.length > 0) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, full_name, email, is_evenium_certified')
      .in('id', providerIds);
    providerProfiles = profs || [];
  }
  const providerProfileMap = new Map(providerProfiles.map((p: any) => [p.id, p]));

  const prestataires = (provEvents || []).map((pe: any) => ({
    ...pe,
    profiles: providerProfileMap.get(pe.prestataire_id || pe.provider_id)
  }));

  // 3. Fetch Checklist stats
  const { data: checklist } = await supabase
    .from('tasks')
    .select('is_completed')
    .eq('event_id', id);
    
  const totalTasks = checklist?.length || 0;
  const completedTasks = checklist?.filter(item => item.is_completed).length || 0;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const modelId = event.invitation_model_id || event.invitationModelId;
  const modelName = getInvitationModelName(modelId);
  const isGold = (event.plan || "").toLowerCase() === "gold";
  const isAnim = event.format?.toLowerCase().includes("carte") ? false : true;
  const purchaseAmount = isGold ? (isAnim ? 20000 : 15000) : (isAnim ? 10000 : 7500);
  const totalBudget = Number(event.budget_total || event.budget?.total || 0);

  // Compute dates including end date and 7-day auto-closing
  const datesInfo = computeEventDates(event.date, event.end_date);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <Link href="/admin/evenements" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-6 font-medium">
        <ArrowLeft size={16} /> Retour à tous les événements
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
              isGold ? "bg-[#b8924a]/20 text-[#7a5e2b] border border-[#b8924a]/40" : "bg-gray-100 text-gray-800 border border-gray-200"
            }`}>
              Formule {isGold ? "Gold" : "Premium"}
            </span>
            <span className="text-xs text-gray-400">• Montant payé : {purchaseAmount.toLocaleString()} FCFA</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">{event.name}</h1>
          <p className="text-gray-500 flex items-center gap-2">
            Organisé par <strong className="text-black">{profile?.full_name || 'Inconnu'}</strong> ({profile?.email})
          </p>
        </div>

        {/* Date Widgets Strip: Start, End date, and Auto-closing */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
              Célébration (Début)
            </span>
            <span className="font-semibold text-sm text-gray-900 flex items-center gap-1.5 mt-0.5">
              <Calendar size={13} className="text-gray-400" />
              {datesInfo.eventDateFormatted}
            </span>
          </div>

          <div className="bg-amber-50/80 border border-amber-200/90 px-4 py-2.5 rounded-2xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
              Date de fin de l&apos;événement
            </span>
            <span className="font-bold text-sm text-gray-950 flex items-center gap-1.5 mt-0.5">
              <Clock size={13} className="text-amber-700" />
              {datesInfo.endDateFormatted}
            </span>
          </div>

          <div className="bg-[#b8924a]/15 border border-[#b8924a]/35 px-4 py-2.5 rounded-2xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#7a5e2b] tracking-wider block">
              Clôture auto (+7j)
            </span>
            <span className="font-bold text-sm text-[#7a5e2b] flex items-center gap-1.5 mt-0.5">
              <Sparkles size={13} className="text-[#8f6f33]" />
              {datesInfo.closingDateShort}
            </span>
          </div>
        </div>
      </div>

      {/* BLOC CLÔTURE & GESTION DE CYCLE DE VIE DE L'ÉVÉNEMENT */}
      <div className="mb-8">
        <EventClosureBlock
          eventId={event.id}
          eventName={event.name}
          eventDate={event.date}
          eventEndDate={event.end_date}
          currentStatus={event.status || "active"}
          clientName={profile?.full_name}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-2 font-medium">
            <Sparkles size={20} className="text-[#b8924a]" /> Modèle d'Invitation
          </div>
          <p className="text-xl font-serif font-bold text-gray-900 mt-2">{modelName}</p>
          <p className="text-xs text-[#7a5e2b] font-semibold mt-1">
            Format {isAnim ? 'Animée' : 'Carte'} • Formule {isGold ? 'Gold' : 'Premium'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-2 font-medium">
            <Wallet size={20} className="text-[#b8924a]" /> Budget Prévu
          </div>
          <p className="text-3xl font-serif font-bold text-gray-900">
            {totalBudget > 0 ? `${totalBudget.toLocaleString()} FCFA` : 'Non défini'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-2 font-medium">
            <MapPin size={20} className="text-[#b8924a]" /> Lieu
          </div>
          <p className="text-xl font-medium text-gray-900 mt-2">{event.location || 'Non défini'}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 mb-4 font-medium">
            <CheckCircle size={20} className="text-[#b8924a]" /> Progression (Checklist)
          </div>
          <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-serif font-bold text-gray-900">{progress}%</span>
            <span className="text-sm text-gray-500">{completedTasks} / {totalTasks} tâches</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-black transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <h2 className="font-serif text-2xl font-bold mb-4">Prestataires Associés</h2>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="table-stack w-full min-w-[640px] text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-medium">Prestataire</th>
              <th className="px-6 py-4 font-medium">Badge</th>
              <th className="px-6 py-4 font-medium">Date d'association</th>
              <th className="px-6 py-4 font-medium text-right">Statut de la prestation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {prestataires && prestataires.length > 0 ? (
              prestataires.map((p, idx) => {
                const provProfile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                      <Store size={16} className="text-gray-400" /> {provProfile?.full_name || 'Inconnu'}
                    </td>
                    <td className="px-6 py-4">
                      {provProfile?.is_evenium_certified ? (
                        <span className="bg-[#b8924a]/10 text-[#8f6f33] text-xs px-2 py-1 rounded-full font-medium flex items-center w-max gap-1">
                          <CheckCircle size={12}/> Certifié
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">Externe</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        p.status === 'Confirmé' ? 'bg-green-50 text-green-600 border border-green-100' :
                        p.status === 'En attente' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {p.status === 'Confirmé' ? <CheckCircle size={14} /> : <Clock size={14} />} {p.status}
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  Aucun prestataire associé à cet événement.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
