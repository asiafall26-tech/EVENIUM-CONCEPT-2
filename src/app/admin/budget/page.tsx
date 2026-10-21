import { Wallet, TrendingUp, PieChart, Activity, Sparkles, ArrowRight, ShieldCheck, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminFinancesPage() {
  const supabase = await createClient();

  // 1. Fetch Transactions for Organizers (Volume Transité)
  const { data: txs } = await supabase.from('transactions').select('*');
  const totalVolumeOrganisateurs = txs ? txs.reduce((sum, t) => sum + Number(t.montant), 0) : 0;
  
  // 2. Fetch Prestataires "Badge Evenium" and "Externes"
  const { data: prestataires } = await supabase.from('profiles').select('*').eq('role', 'prestataire');
  const certifiedPrestataires = (prestataires || []).filter(p => p.is_evenium_certified);
  const externalPrestataires = (prestataires || []).filter(p => !p.is_evenium_certified);
  
  // Simulation: Droits d'adhésion (Adhesion fee = 50 000 FCFA per external provider)
  const ADHESION_FEE = 50000;
  const adhesionRevenues = externalPrestataires.length * ADHESION_FEE;

  // 3. Fetch real accepted Devis and confirmed Demandes to track Commissions
  const { data: realDevisAcceptes } = await supabase
    .from('devis')
    .select('*, events(name, client_id)')
    .eq('status', 'Accepté');

  const { data: realDemandesConfirmees } = await supabase
    .from('demandes_devis')
    .select('*, events(name, client_id)')
    .in('status', ['Confirmé', 'Accepté']);

  const prestataireMap = new Map((prestataires || []).map(p => [p.id, p]));
  const processedEventIds = new Set<string>();
  const commissionsTracking: any[] = [];

  // Traiter les devis acceptés (priorité avec montant exact)
  (realDevisAcceptes || []).forEach(d => {
    const totalAmount = Number(d.total || d.amount || 0);
    if (totalAmount <= 0) return;
    const prest = prestataireMap.get(d.prestataire_id);
    const eventName = Array.isArray(d.events) ? d.events[0]?.name : d.events?.name || 'Prestation Événement';
    if (d.event_id) processedEventIds.add(d.event_id);

    commissionsTracking.push({
      id: d.id,
      prestataire: prest?.full_name || d.client_name || 'Prestataire Partenaire',
      isCertified: !!prest?.is_evenium_certified,
      evenement: eventName,
      montantDevis: totalAmount,
      commission: 0,
      dateAcceptation: d.accepted_at || d.updated_at || d.created_at,
      statutCommission: '0% de commission (100% prestataire)'
    });
  });

  // Compléter avec les demandes confirmées sans doublons
  (realDemandesConfirmees || []).forEach(d => {
    if (d.event_id && processedEventIds.has(d.event_id)) return;
    const totalAmount = Number(d.budget_propose || d.budget_indicatif || 0);
    if (totalAmount <= 0) return;
    const prest = prestataireMap.get(d.prestataire_id);
    const eventName = Array.isArray(d.events) ? d.events[0]?.name : d.events?.name || 'Prestation Événement';

    commissionsTracking.push({
      id: d.id,
      prestataire: prest?.full_name || 'Prestataire Partenaire',
      isCertified: !!prest?.is_evenium_certified,
      evenement: eventName,
      montantDevis: totalAmount,
      commission: 0,
      dateAcceptation: d.updated_at || d.created_at,
      statutCommission: '0% de commission (100% prestataire)'
    });
  });

  const totalCommissionsEnAttente = 0;

  // Total Platform Revenue (Adhésions / Abonnements)
  const totalRevenusPlateforme = adhesionRevenues;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2 flex items-center gap-2">
            Hub Financier & Revenus <Wallet size={24} className="text-[#b8924a]" />
          </h1>
          <p className="text-gray-500 text-sm">Pilotez la rentabilité de la plateforme et suivez le volume d'affaires (Politique 0% de commission imposée aux prestataires).</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#2b2118] text-white p-4 sm:p-6 lg:p-8 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <PieChart size={100} />
          </div>
          <p className="text-gray-400 font-medium mb-2 relative z-10">Revenus Plateforme (Adhésions)</p>
          <h3 className="text-4xl font-bold font-serif text-[#b8924a] relative z-10">
            {totalRevenusPlateforme.toLocaleString()} <span className="text-xl text-gray-500">FCFA</span>
          </h3>
          <p className="text-xs text-gray-500 mt-4 relative z-10">Droits d'adhésion & forfaits</p>
        </div>

        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-500 font-medium">Droits d'adhésion (Externes)</p>
              <div className="bg-blue-50 text-blue-600 p-2 rounded-xl"><CreditCard size={18} /></div>
            </div>
            <h3 className="text-3xl font-bold font-serif text-gray-900">{adhesionRevenues.toLocaleString()} FCFA</h3>
          </div>
          <p className="text-xs text-gray-500 mt-4">{externalPrestataires.length} prestataire(s) externe(s)</p>
        </div>

        <div className="bg-[#f5eee1] p-4 sm:p-6 lg:p-8 rounded-3xl border border-[#e4d8c4] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-700 font-medium">Commission Prestataire</p>
              <div className="bg-white text-[#8f6f33] p-2 rounded-xl shadow-sm"><ShieldCheck size={18} /></div>
            </div>
            <h3 className="text-3xl font-bold font-serif text-[#8f6f33]">0% (Zéro commission)</h3>
          </div>
          <p className="text-xs text-gray-600 mt-4">100% des gains reviennent aux prestataires sur {commissionsTracking.length} prestation(s)</p>
        </div>
      </div>

      {/* Traçabilité des Prestations */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
              Suivi des Prestations & Volume d'Affaires <ShieldCheck size={20} className="text-[#b8924a]" />
            </h2>
            <p className="text-sm text-gray-500 mt-1">Transparence totale : Evenium ne prélève aucune commission sur les devis des prestataires (0% de commission).</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-stack w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Prestataire</th>
                <th className="px-6 py-4 font-medium">Événement</th>
                <th className="px-6 py-4 font-medium">Date d'acceptation</th>
                <th className="px-6 py-4 font-medium text-right">Montant Devis</th>
                <th className="px-6 py-4 font-medium text-right">Commission Prélevée</th>
                <th className="px-6 py-4 font-medium text-center">Politique Tarifaire</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commissionsTracking.length > 0 ? (
                commissionsTracking.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <span>{c.prestataire}</span>
                        {c.isCertified ? (
                          <span className="text-[10px] bg-[#fbf7f0] text-[#8f6f33] border border-[#b8924a]/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <ShieldCheck size={11} /> Badge Evenium
                          </span>
                        ) : (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                            Partenaire
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{c.evenement}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(c.dateAcceptation).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-600">{c.montantDevis.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">0 FCFA (0%)</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle size={14} /> 100% prestataire
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Aucune prestation enregistrée pour le moment.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Volume Global Organisateur */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8">
        <h2 className="font-serif text-xl font-bold mb-2">Volume global transité (Organisateurs)</h2>
        <p className="text-gray-500 text-sm mb-6">Total des paiements effectués par les organisateurs sur la plateforme : <strong>{totalVolumeOrganisateurs.toLocaleString()} FCFA</strong>.</p>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-full max-w-md">
          <div className="h-full bg-gray-300 w-full" />
        </div>
      </div>
    </div>
  );
}
