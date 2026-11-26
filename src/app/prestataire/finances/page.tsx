"use client";

import { Wallet, TrendingUp, DollarSign, Calendar, RefreshCw, Plus, ArrowDownRight, ArrowUpRight, Clock, CheckCircle2, Trash2, CalendarClock } from "lucide-react";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/utils/supabase/client";

export interface ScheduledExpense {
  id: string;
  libelle: string;
  montant: number;
  dueDate: string;
  category: string;
  status: 'prevue' | 'effectuee';
  createdAt: string;
}

export default function PrestataireFinancesPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [devisStats, setDevisStats] = useState({ ca: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ libelle: "", montant: "", type: "revenu" });
  
  // Dépenses programmées
  const [scheduledExpenses, setScheduledExpenses] = useState<ScheduledExpense[]>([]);
  const [isScheduledModalOpen, setIsScheduledModalOpen] = useState(false);
  const [schedFormData, setSchedFormData] = useState({
    libelle: "",
    montant: "",
    dueDate: "",
    category: "Matériel & Équipement",
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

    setCurrentUserId(user.id);
    try {
      const savedSched = localStorage.getItem(`evenium_provider_scheduled_${user.id}`);
      if (savedSched) {
        setScheduledExpenses(JSON.parse(savedSched));
      } else {
        const defaultSched: ScheduledExpense[] = [
          {
            id: 'sched-1',
            libelle: 'Location sono & micro sans fil',
            montant: 85000,
            dueDate: new Date(Date.now() + 864e5 * 7).toISOString().split('T')[0],
            category: 'Matériel & Équipement',
            status: 'prevue',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'sched-2',
            libelle: 'Fournitures & consommables de réception',
            montant: 140000,
            dueDate: new Date(Date.now() + 864e5 * 14).toISOString().split('T')[0],
            category: 'Fournitures & Matières',
            status: 'prevue',
            createdAt: new Date().toISOString(),
          }
        ];
        setScheduledExpenses(defaultSched);
        localStorage.setItem(`evenium_provider_scheduled_${user.id}`, JSON.stringify(defaultSched));
      }
    } catch { }

    setLoading(false);
  };

  const totalRevenus = transactions
    .filter(t => t.type === 'revenu')
    .reduce((sum, t) => sum + Number(t.montant), 0);

  const totalDepenses = transactions
    .filter(t => t.type === 'depense')
    .reduce((sum, t) => sum + Number(t.montant), 0);

  const totalScheduledPending = scheduledExpenses
    .filter(s => s.status === 'prevue')
    .reduce((sum, s) => sum + Number(s.montant), 0);

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

  const handleAddScheduledExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedFormData.libelle || !schedFormData.montant) return;
    const newSched: ScheduledExpense = {
      id: `sched-${Date.now()}`,
      libelle: schedFormData.libelle.trim(),
      montant: Number(schedFormData.montant),
      dueDate: schedFormData.dueDate || new Date().toISOString().split('T')[0],
      category: schedFormData.category,
      status: 'prevue',
      createdAt: new Date().toISOString(),
    };
    const updated = [newSched, ...scheduledExpenses];
    setScheduledExpenses(updated);
    if (currentUserId) {
      try {
        localStorage.setItem(`evenium_provider_scheduled_${currentUserId}`, JSON.stringify(updated));
      } catch { }
    }
    setIsScheduledModalOpen(false);
    setSchedFormData({ libelle: "", montant: "", dueDate: "", category: "Matériel & Équipement" });
  };

  const handleExecuteScheduledExpense = async (sched: ScheduledExpense) => {
    if (!currentUserId) return;
    // Déduire et créer la transaction réelle de dépense
    const { error } = await supabase.from('transactions').insert({
      prestataire_id: currentUserId,
      description: `[Dépense programmée] ${sched.libelle}`,
      montant: Number(sched.montant),
      type: 'depense',
      categorie: sched.category,
      status: 'Validé',
      date: new Date().toISOString().split('T')[0]
    });

    if (error) {
      alert("Erreur lors de la déduction : " + error.message);
      return;
    }

    const updated = scheduledExpenses.map(s => s.id === sched.id ? { ...s, status: 'effectuee' as const } : s);
    setScheduledExpenses(updated);
    try {
      localStorage.setItem(`evenium_provider_scheduled_${currentUserId}`, JSON.stringify(updated));
    } catch { }

    fetchFinances();
  };

  const handleDeleteScheduledExpense = (id: string) => {
    const updated = scheduledExpenses.filter(s => s.id !== id);
    setScheduledExpenses(updated);
    if (currentUserId) {
      try {
        localStorage.setItem(`evenium_provider_scheduled_${currentUserId}`, JSON.stringify(updated));
      } catch { }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2 flex items-center gap-2">
            Mes Finances <Wallet size={24} className="text-[#b8924a]" />
          </h1>
          <p className="text-gray-500 text-sm">Suivez vos revenus réels, vos devis confirmés et vos transactions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-full hover:bg-gray-900 transition-all font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Ajouter une transaction
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 [font-variant-numeric:lining-nums]">
        <div className="bg-[#2b2118] text-white p-5 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign size={80} />
          </div>
          <div>
            <p className="text-gray-300 font-semibold mb-1 relative z-10 text-xs">Chiffre d'Affaires Brut</p>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#f7e7b4] relative z-10 mb-1">
              {devisStats.ca.toLocaleString()} <span className="text-xs text-gray-300 font-medium">FCFA</span>
            </h3>
          </div>
          <p className="text-[11px] text-gray-300 font-medium relative z-10">{devisStats.count} prestation(s) validée(s)</p>
        </div>
        
        <div className="bg-[#fbf7f0] p-5 rounded-3xl border border-[#b8924a]/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 bg-white text-[#4a3512] rounded-full flex items-center justify-center mb-2 shadow-xs">
              <TrendingUp size={18} />
            </div>
            <p className="text-gray-900 font-bold mb-1 text-xs">Prestations Validées</p>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#4a3512]">{devisStats.count} devis</h3>
            <p className="text-[11px] text-gray-700 font-medium mt-0.5">Prestations signées</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 bg-green-50 text-green-700 rounded-full flex items-center justify-center mb-2">
              <DollarSign size={18} />
            </div>
            <p className="text-gray-800 font-bold mb-1 text-xs">Revenus Encaissés</p>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-emerald-700">{netEstimated.toLocaleString()} FCFA</h3>
            <p className="text-[11px] text-gray-600 font-medium mt-0.5">Totalité des gains</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-2">
              <ArrowDownRight size={18} />
            </div>
            <p className="text-gray-800 font-bold mb-1 text-xs">Dépenses Réalisées</p>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-black">{totalDepenses.toLocaleString()} FCFA</h3>
            <p className="text-[11px] text-gray-600 font-medium mt-0.5">Frais déduits</p>
          </div>
        </div>

        <div className="bg-amber-50/70 p-5 rounded-3xl border border-amber-300 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 bg-amber-100 text-[#4a3512] rounded-full flex items-center justify-center mb-2">
              <CalendarClock size={18} />
            </div>
            <p className="text-[#4a3512] font-bold mb-1 text-xs">Charges à Engager</p>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#4a3512]">{totalScheduledPending.toLocaleString()} FCFA</h3>
            <p className="text-[11px] text-gray-800 font-medium mt-0.5">{scheduledExpenses.filter(s => s.status === 'prevue').length} dépense(s) prévue(s)</p>
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
            <thead className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Libellé</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold text-right">Montant</th>
                <th className="px-6 py-4 font-bold text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-600 font-medium">Chargement...</td></tr>
              ) : transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{t.description || t.libelle || 'Transaction'}</td>
                    <td className="px-6 py-4 text-gray-700 font-medium flex items-center gap-2">
                      <Calendar size={14} className="text-gray-500" /> {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${t.type === 'revenu' ? 'text-green-700' : 'text-red-700'}`}>
                      {t.type === 'revenu' ? '+' : '-'}{Number(t.montant).toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">Complété</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-600 font-medium">Aucune transaction enregistrée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION : DÉPENSES PROGRAMMÉES & CHARGES À ENGAGER */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8 [font-variant-numeric:lining-nums]">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fbf7f0]/40">
          <div>
            <h3 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarClock size={20} className="text-[#4a3512]" />
              Dépenses Programmées &amp; Charges à Engager
            </h3>
            <p className="text-gray-700 font-medium text-xs mt-0.5">
              Anticipez vos achats, locations de matériel et acomptes de sous-traitance avant vos événements.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsScheduledModalOpen(true)}
            className="flex items-center gap-2 bg-[#281a10] text-[#f7e7b4] px-4 py-2.5 rounded-full hover:brightness-125 transition-all text-xs font-bold shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} /> Programmer une dépense
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table-stack w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs">
              <tr>
                <th className="px-6 py-3.5 font-medium">Libellé &amp; Nature</th>
                <th className="px-6 py-3.5 font-medium">Catégorie</th>
                <th className="px-6 py-3.5 font-medium">Échéance prévue</th>
                <th className="px-6 py-3.5 font-medium text-right">Montant prévu</th>
                <th className="px-6 py-3.5 font-medium text-center">Statut</th>
                <th className="px-6 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {scheduledExpenses.length > 0 ? (
                scheduledExpenses.map((sched) => (
                  <tr key={sched.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {sched.libelle}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                        {sched.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar size={13} className="text-[#8f6f33]" />
                        {new Date(sched.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {Number(sched.montant).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-6 py-4 text-center">
                      {sched.status === 'effectuee' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
                          <CheckCircle2 size={12} /> Déduite
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full font-bold border border-amber-200">
                          <Clock size={12} /> À engager
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {sched.status === 'prevue' && (
                          <button
                            type="button"
                            onClick={() => handleExecuteScheduledExpense(sched)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Marquer comme effectuée et déduire immédiatement des finances"
                          >
                            <CheckCircle2 size={13} />
                            <span>Déduire</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteScheduledExpense(sched.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Supprimer cette programmation"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400 italic">
                    Aucune dépense programmée. Cliquez sur « Programmer une dépense » pour anticiper vos charges.
                  </td>
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

      {/* Modal Programmer une Dépense Future */}
      <Modal isOpen={isScheduledModalOpen} onClose={() => setIsScheduledModalOpen(false)} title="Programmer une Dépense Future">
        <form onSubmit={handleAddScheduledExpense} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Libellé / Nature de la dépense</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8924a] text-sm"
              value={schedFormData.libelle}
              onChange={(e) => setSchedFormData({...schedFormData, libelle: e.target.value})}
              placeholder="Ex: Acompte traiteur, Location sono, Fleurs fraîches..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant prévu (FCFA)</label>
              <input 
                type="number" 
                required
                min="0"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8924a] text-sm font-mono"
                value={schedFormData.montant}
                onChange={(e) => setSchedFormData({...schedFormData, montant: e.target.value})}
                placeholder="Ex: 80000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Échéance prévue</label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8924a] text-sm"
                value={schedFormData.dueDate}
                onChange={(e) => setSchedFormData({...schedFormData, dueDate: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8924a] text-sm"
              value={schedFormData.category}
              onChange={(e) => setSchedFormData({...schedFormData, category: e.target.value})}
            >
              <option value="Matériel & Équipement">Matériel &amp; Équipement</option>
              <option value="Fournitures & Matières">Fournitures &amp; Matières premières</option>
              <option value="Sous-traitance & Équipe">Sous-traitance &amp; Équipe de renfort</option>
              <option value="Transport & Logistique">Transport &amp; Logistique</option>
              <option value="Autre charge">Autre charge</option>
            </select>
          </div>

          <p className="text-xs text-gray-500 pt-1">
            Une fois la dépense effectuée, vous pourrez cliquer sur « Déduire » pour l&apos;intégrer directement à votre comptabilité réelle.
          </p>

          <button type="submit" className="w-full py-3.5 bg-[#281a10] text-[#f7e7b4] rounded-xl font-bold mt-2 hover:brightness-125 transition-colors cursor-pointer">
            Enregistrer la dépense programmée
          </button>
        </form>
      </Modal>
    </div>
  );
}
