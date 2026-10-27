import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar as CalendarIcon,
  ShieldCheck,
  Activity,
  CreditCard,
  Ticket,
  Sparkles,
  Smartphone,
  Eye,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { toggleUserSuspension } from "../../admin-actions";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getInvitationModelName, getInvitationModelThumbnail } from "@/data/mock/invitations";
import { computeEventDates } from "@/utils/date-helpers";

export default async function AdminUserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createSupabaseAdmin(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Fetch user profile
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile) {
    const { data: authUser } = await supabase.auth.admin.getUserById(id);
    if (authUser?.user) {
      profile = {
        id: authUser.user.id,
        email: authUser.user.email,
        full_name: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0] || "Utilisateur",
        role: authUser.user.user_metadata?.role || "client",
        created_at: authUser.user.created_at,
        is_active: true
      };
    }
  }

  if (!profile) {
    return <div className="p-4 sm:p-6 lg:p-8 text-center text-gray-500">Utilisateur introuvable.</div>;
  }

  // Strict data separation: If the user is a prestataire, redirect to the dedicated provider dossier
  if (profile.role === 'prestataire') {
    redirect(`/admin/prestataires/${id}`);
  }

  // Fetch events belonging strictly to this client
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false });

  // Map enriched event purchases with real data
  const enrichedPurchases = (events || []).map((e: any) => {
    const modelId = e.invitation_model_id || e.invitationModelId;
    const modelName = getInvitationModelName(modelId);
    const thumbnail = getInvitationModelThumbnail(modelId);
    const plan = (e.plan || "").toLowerCase() === "gold" ? "Gold" : "Premium";
    const format = e.format?.toLowerCase().includes("carte") ? "Carte" : "Animée";
    const isGold = plan === "Gold";
    const isAnim = format === "Animée";
    const amount = isGold
      ? (isAnim ? 20000 : 15000)
      : (isAnim ? 10000 : 7500);

    const paymentMethod = e.payment_method || "Paiement en ligne (Validé)";
    const datesInfo = computeEventDates(e.date, e.end_date);

    return {
      ...e,
      plan,
      format,
      modelName,
      thumbnail,
      amount,
      paymentMethod,
      datesInfo,
      orderRef: `EVN-CMD-${new Date(e.created_at).getFullYear()}-${e.id.slice(0, 5).toUpperCase()}`
    };
  });

  const totalPurchasesAmount = enrichedPurchases.reduce((acc, p) => acc + p.amount, 0);
  const mainPlan = enrichedPurchases[0]?.plan || "Premium";

  // Fetch transactions
  const isClient = profile.role === 'client';
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq(isClient ? 'event_id' : 'prestataire_id', id)
    .order('date', { ascending: false });

  let userTransactions: any[] = [];
  if (isClient) {
    const eventIds = events?.map(e => e.id) || [];
    if (eventIds.length > 0) {
      const { data: clientTx } = await supabase
        .from('transactions')
        .select('*')
        .in('event_id', eventIds)
        .order('date', { ascending: false });
      userTransactions = clientTx || [];
    }
  } else {
    userTransactions = transactions || [];
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      {/* Header with Back button */}
      <div className="mb-8">
        <Link href="/admin/utilisateurs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4 transition-colors font-medium">
          <ArrowLeft size={16} /> Retour aux utilisateurs
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-black text-[#b8924a] border border-[#b8924a]/30 flex items-center justify-center font-serif text-2xl font-bold uppercase shadow-sm">
              {profile.full_name?.substring(0, 2) || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-black">{profile.full_name || "Utilisateur"}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                  {profile.role}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1"><Mail size={14} className="text-gray-400" /> {profile.email}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><CalendarIcon size={14} className="text-gray-400" /> Inscrit(e) le {new Date(profile.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <form action={async () => {
              "use server";
              await toggleUserSuspension(id, 'actif');
              revalidatePath(`/admin/utilisateurs/${id}`);
            }}>
              <button type="submit" className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs sm:text-sm font-semibold hover:bg-red-100 transition-colors">
                Suspendre le compte
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* KPI Cards: Précision sur la Formule et les Achats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Statut du compte</p>
            <p className="font-bold text-gray-900 capitalize text-lg">Actif</p>
          </div>
        </div>

        {/* Real Plan Badge */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#b8924a]/15 text-[#8f6f33] flex items-center justify-center shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Formule Achetée</p>
            <p className="font-bold text-gray-900 text-lg flex items-center gap-1.5">
              Formule {enrichedPurchases.length > 0 ? mainPlan : "Aucune"}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Événements créés</p>
            <p className="font-bold text-gray-900 text-lg">{events?.length || 0}</p>
          </div>
        </div>

        {/* Total Purchases Amount */}
        <div className="bg-[#2b2118] text-white p-6 rounded-3xl border border-gray-800 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#b8924a]/20 text-[#b8924a] flex items-center justify-center shrink-0">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Achats Formules</p>
            <p className="font-bold font-serif text-[#b8924a] text-xl">
              {totalPurchasesAmount.toLocaleString()} FCFA
            </p>
          </div>
        </div>
      </div>

      {/* DÉTAIL COMPLET DES ACHATS & COMMANDES DU CLIENT */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a5e2b] bg-[#b8924a]/20 px-2.5 py-0.5 rounded-full border border-[#b8924a]/40">
              Commandes &amp; Facturation
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mt-1">
              Détails des Achats de l&apos;Utilisateur
            </h2>
            <p className="text-xs text-gray-500">
              Formules, modèles d'invitations choisis, montants réglés et options associées.
            </p>
          </div>
        </div>

        {enrichedPurchases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {enrichedPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="rounded-2xl border border-gray-200/90 bg-gray-50/60 p-5 space-y-4 hover:border-[#b8924a]/50 hover:bg-white transition-all shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {purchase.thumbnail && (
                      <div className="relative w-12 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200 shadow-xs">
                        <Image
                          src={purchase.thumbnail}
                          alt={purchase.modelName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          purchase.plan === "Gold"
                            ? "bg-[#b8924a]/20 text-[#7a5e2b] border border-[#b8924a]/50"
                            : "bg-gray-200 text-gray-800"
                        }`}>
                          Formule {purchase.plan}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          purchase.format === "Animée"
                            ? "bg-[#6b1f2a] text-pink-100"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {purchase.format}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-gray-900 text-base mt-1">
                        {purchase.modelName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Réf : <span className="font-mono font-semibold">{purchase.orderRef}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-serif font-bold text-[#8f6f33] text-lg">
                      {purchase.amount.toLocaleString()} FCFA
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                      <CheckCircle2 size={11} /> Payé
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Événement :</span>
                    <span className="font-medium text-gray-800">{purchase.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Paiement :</span>
                    <span className="font-medium text-gray-800">{purchase.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Célébration (Début) :</span>
                    <span className="font-medium text-gray-800">{purchase.datesInfo.eventDateFormatted}</span>
                  </div>
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2 -my-1">
                    <span className="text-amber-800 block text-[10px] uppercase font-bold">Fin de l&apos;événement :</span>
                    <span className="font-bold text-gray-950 text-xs block">{purchase.datesInfo.endDateFormatted}</span>
                    <span className="text-[10px] text-[#7a5e2b] font-semibold block mt-0.5">Clôture auto : {purchase.datesInfo.closingDateShort}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href={`/admin/evenements/${purchase.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-black bg-white border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Eye size={13} />
                    <span>Voir l&apos;événement complet</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">
            Cet utilisateur n'a pas encore acheté de formule ou créé d'événement.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Liste simple des événements */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-wrap gap-3">
            <h2 className="font-serif text-xl font-bold">Événements en cours</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {events && events.length > 0 ? events.map((event) => {
              const eventDates = computeEventDates(event.date, event.end_date);
              return (
                <div key={event.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-bold text-gray-900">{event.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>Début : <strong>{eventDates.eventDateFormatted}</strong></span>
                      <span>•</span>
                      <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Fin : {eventDates.endDateFormatted}
                      </span>
                      <span>•</span>
                      <span className="text-gray-400">
                        Clôture auto (+7j) : {eventDates.closingDateShort}
                      </span>
                      <span>•</span>
                      <span>{event.guests_count || 0} invités</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                      {event.status}
                    </span>
                    <Link
                      href={`/admin/evenements/${event.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-black bg-white border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                      title="Voir l'événement complet"
                    >
                      <Eye size={13} />
                      <span>Voir</span>
                    </Link>
                  </div>
                </div>
              );
            }) : <div className="p-6 text-center text-gray-500">Aucun événement</div>}
          </div>
        </div>

        {/* Historique des paiements de dépenses associées */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-wrap gap-3">
            <h2 className="font-serif text-xl font-bold">Dépenses &amp; Transactions Budgétaires</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {userTransactions && userTransactions.length > 0 ? userTransactions.map((tx) => (
              <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{tx.libelle || tx.description || "Dépense"}</p>
                  <p className="text-sm text-gray-500 mt-1">{new Date(tx.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{Number(tx.montant).toLocaleString()} FCFA</p>
                  <span className="text-xs text-green-600 font-medium">Complété</span>
                </div>
              </div>
            )) : <div className="p-6 text-center text-gray-500">Aucune dépense enregistrée</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
