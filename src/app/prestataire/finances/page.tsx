"use client";

import { Wallet, TrendingUp, DollarSign, Calendar, RefreshCw, Plus, ArrowDownRight, ArrowUpRight, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/utils/supabase/client";

export default function PrestataireFinancesPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [devisStats, setDevisStats] = useState({ ca: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ libelle: "", montant: "", type: "revenu" });
  const supabase = createClient();

  useEffect(() => {
    fetchFinances();
  }, []);

  const fetchFinances = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Fetch devis to calculate real Chiffre d'affaires
    const { data: devisData } = await supabase
      .from('devis')
      .select('*, events(name)')
      .eq('prestataire_id', user.id)
      .eq('status', 'Accepté');

    const totalCA = (devisData || []).reduce((sum, d) => sum + Number(d.total || d.amount || 0), 0);
    setDevisStats({ ca: totalCA, count: (devisData || []).length });

    // 2. Fetch transactions linked to this profile
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('prestataire_id', user.id)
      .order('date', { ascending: false });

    // 3. Auto-synchroniser les transactions pour les devis acceptés s'ils ne sont pas encore enregistrés
    const existingTxDescs = new Set((txData || []).map(t => t.description));
    let hasNewTx = false;

    for (const d of (devisData || [])) {
      const totalAmount = Number(d.total || d.amount || 0);
      if (totalAmount <= 0) continue;
      const eventTitle = d.events?.name || 'Prestation Événement';
      const revDesc = `Prestation confirmée - ${eventTitle}`;

      if (!existingTxDescs.has(revDesc)) {
        await supabase.from('transactions').insert({
          prestataire_id: user.id,
          event_id: d.event_id || null,
          description: revDesc,
          montant: totalAmount,
          type: 'revenu',
          categorie: 'Prestation',
          status: 'Validé',
          date: d.accepted_at ? new Date(d.accepted_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
        hasNewTx = true;
      }
    }

    if (hasNewTx) {
      const { data: refreshedTx } = await supabase
        .from('transactions')
        .select('*')
        .eq('prestataire_id', user.id)
        .order('date', { ascending: false });
      if (refreshedTx) setTransactions(refreshedTx);
    } else if (txData) {
      setTransactions(txData);
    }

    setLoading(false);
  };

  const totalRevenus = transactions
    .filter(t => t.type === 'revenu')
    .reduce((sum, t) => sum + Number(t.montant), 0);

  const totalDepenses = transactions
    .filter(t => t.type === 'depense')
    .reduce((sum, t) => sum + Number(t.montant), 0);

  const totalCommissionsDue = 0;
  const netEstimated = devisStats.ca;

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('transactions').insert({
      prestataire_id: user.id,
      description: formData.libelle,
      montant: Number(formData.montant),
      type: formData.type,
      date: new Date().toISOString()
    });

    if (error) {
      alert("Erreur lors de l'ajout : " + error.message);
    } else {
      setIsModalOpen(false);
      setFormData({ libelle: "", montant: "", type: "revenu" });
      fetchFinances();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2 flex items-center gap-2">
            Mes Finances <Wallet size={24} className="text-[#b8924a]" />
          </h1>
          <p className="text-gray-500 text-sm">Suivez vos revenus réels. Evenium ne prélève aucune commission sur vos prestations (0% de commission).</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-full hover:bg-gray-900 transition-all font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Ajouter une transaction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#2b2118] text-white p-6 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign size={80} />
          </div>
          <p className="text-gray-400 font-medium mb-1 relative z-10 text-sm">Chiffre d'Affaires Brut</p>
          <h3 className="text-2xl font-bold font-serif text-[#b8924a] relative z-10 mb-2">
            {devisStats.ca.toLocaleString()} <span className="text-sm text-gray-500">FCFA</span>
          </h3>
          <p className="text-xs text-gray-500 relative z-10">{devisStats.count} prestation(s) validée(s)</p>
        </div>
        
        <div className="bg-[#fbf7f0] p-6 rounded-3xl border border-[#b8924a]/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-white text-[#8f6f33] rounded-full flex items-center justify-center mb-3 shadow-xs">
              <TrendingUp size={20} />
            </div>
            <p className="text-stone-600 font-medium mb-1 text-sm">Taux de Commission</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-serif text-[#8f6f33]">0% (Sans commission)</h3>
            <p className="text-xs text-stone-500 mt-1">100% de vos gains conservés</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
              <DollarSign size={20} />
            </div>
            <p className="text-gray-500 font-medium mb-1 text-sm">Revenu Net Prestataire (100%)</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-serif text-emerald-600">{netEstimated.toLocaleString()} FCFA</h3>
            <p className="text-xs text-gray-400 mt-1">Zéro commission prélevée</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
              <ArrowDownRight size={20} />
            </div>
            <p className="text-gray-500 font-medium mb-1 text-sm">Dépenses & Frais</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-serif text-black">{totalDepenses.toLocaleString()} FCFA</h3>
            <p className="text-xs text-gray-400 mt-1">Frais personnels saisis</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h2 className="font-serif text-xl font-bold">Historique des transactions</h2>
          <button onClick={fetchFinances} className="text-gray-400 hover:text-black transition-colors">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table-stack w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Libellé</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Montant</th>
                <th className="px-6 py-4 font-medium text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Chargement...</td></tr>
              ) : transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{t.description || t.libelle || 'Transaction'}</td>
                    <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" /> {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${t.type === 'revenu' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'revenu' ? '+' : '-'}{Number(t.montant).toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-medium">Complété</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Aucune transaction enregistrée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Transaction">
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setFormData({...formData, type: 'revenu'})}
                className={`py-3 rounded-xl border flex justify-center items-center gap-2 transition-colors ${formData.type === 'revenu' ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              >
                <ArrowUpRight size={18} /> Revenu
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, type: 'depense'})}
                className={`py-3 rounded-xl border flex justify-center items-center gap-2 transition-colors ${formData.type === 'depense' ? 'bg-red-50 border-red-200 text-red-700 font-bold' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              >
                <ArrowDownRight size={18} /> Dépense
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Libellé</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8924a]"
              value={formData.libelle}
              onChange={(e) => setFormData({...formData, libelle: e.target.value})}
              placeholder="Ex: Paiement décoration"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA)</label>
            <input 
              type="number" 
              required
              min="0"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8924a]"
              value={formData.montant}
              onChange={(e) => setFormData({...formData, montant: e.target.value})}
              placeholder="Ex: 150000"
            />
          </div>
          <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-bold mt-4 hover:bg-gray-900 transition-colors">
            Enregistrer
          </button>
        </form>
      </Modal>
    </div>
  );
}
