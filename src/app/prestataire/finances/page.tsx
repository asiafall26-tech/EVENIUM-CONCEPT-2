"use client";

import { useState, useMemo } from "react";
import { Wallet, TrendingUp, TrendingDown, Download, Receipt, Plus, Trash2, X, Activity, Edit3 } from "lucide-react";

export default function PrestataireFinancesPage() {
  const [transactions, setTransactions] = useState([
    { id: "TRX-2026-001", date: "2026-10-10", description: "Paiement - Mariage Ndeye & Modou", amount: 450000, type: "income", status: "completed" },
    { id: "TRX-2026-002", date: "2026-10-15", description: "Achat Matières premières (Marché)", amount: -150000, type: "expense", status: "completed" },
    { id: "TRX-2026-003", date: "2026-09-05", description: "Solde - Baptême Ousmane", amount: 200000, type: "income", status: "completed" },
    { id: "TRX-2026-004", date: "2026-09-12", description: "Location Camionnette frigorifique", amount: -40000, type: "expense", status: "completed" },
    { id: "TRX-2026-005", date: "2026-08-20", description: "Paiement Intégral - Séminaire Tech", amount: 800000, type: "income", status: "completed" },
    { id: "TRX-2026-006", date: "2026-10-01", description: "Paiement Staff & Extras", amount: -200000, type: "expense", status: "completed" },
  ]);

  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [newTx, setNewTx] = useState({ date: "", description: "", amount: "", type: "income" });
  const [filterType, setFilterType] = useState<string>("all");

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.abs(amount)) + " FCFA";
  };

  const handleOpenEditModal = (trx: any) => {
    setEditingTxId(trx.id);
    setNewTx({
      date: trx.date,
      description: trx.description,
      amount: Math.abs(trx.amount).toString(),
      type: trx.type
    });
    setIsAddTxModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingTxId(null);
    setNewTx({ date: "", description: "", amount: "", type: "income" });
    setIsAddTxModalOpen(true);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.description || !newTx.amount) return;

    const amt = parseInt(newTx.amount.replace(/\D/g, '')) || 0;
    
    if (editingTxId) {
      setTransactions(transactions.map(t => 
        t.id === editingTxId 
          ? { 
              ...t, 
              date: newTx.date || new Date().toISOString().split('T')[0], 
              description: newTx.description, 
              amount: newTx.type === "expense" ? -amt : amt, 
              type: newTx.type 
            }
          : t
      ));
    } else {
      setTransactions([{
        id: `TRX-${new Date().getFullYear()}-00${transactions.length + 1}`,
        date: newTx.date || new Date().toISOString().split('T')[0],
        description: newTx.description,
        amount: newTx.type === "expense" ? -amt : amt,
        type: newTx.type,
        status: "completed"
      }, ...transactions]);
    }

    setIsAddTxModalOpen(false);
    setEditingTxId(null);
    setNewTx({ date: "", description: "", amount: "", type: "income" });
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm("Supprimer cette transaction ?")) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    const revenus = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
    const depenses = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const benefice = revenus - depenses;
    return { revenus, depenses, benefice };
  }, [transactions]);

  // Chart Data (Dynamic based on transactions)
  const chartData = useMemo(() => {
    let latestDate = new Date();
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d > latestDate) latestDate = d;
    });

    const months = [];
    const incomes = [0, 0, 0, 0, 0, 0];
    const expenses = [0, 0, 0, 0, 0, 0];

    // Generate last 6 months labels up to latestDate
    for (let i = 5; i >= 0; i--) {
      const d = new Date(latestDate.getFullYear(), latestDate.getMonth() - i, 1);
      months.push(d.toLocaleDateString('fr-FR', { month: 'short' }));
    }

    transactions.forEach(t => {
      const txDate = new Date(t.date);
      const monthDiff = (latestDate.getFullYear() - txDate.getFullYear()) * 12 + latestDate.getMonth() - txDate.getMonth();
      
      if (monthDiff >= 0 && monthDiff < 6) {
        const idx = 5 - monthDiff;
        if (t.type === 'income') {
          incomes[idx] += Math.abs(t.amount);
        } else {
          expenses[idx] += Math.abs(t.amount);
        }
      }
    });

    const max = Math.max(...incomes, ...expenses, 100000); 
    
    return months.map((m, i) => ({
      month: m,
      income: incomes[i],
      expense: expenses[i],
      incomeHeight: Math.round((incomes[i] / max) * 100),
      expenseHeight: Math.round((expenses[i] / max) * 100),
    }));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => filterType === 'all' || t.type === filterType);
  }, [transactions, filterType]);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Finance</h1>
          <p className="text-gray-500 text-sm">Suivez vos revenus, vos dépenses et analysez votre rentabilité.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
            <Download size={16} /> Exporter
          </button>
          <button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg">
            <Plus size={16} /> Ajouter une opération
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-center">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <TrendingUp size={18} className="text-green-600" /> <p className="text-sm font-semibold uppercase tracking-wider">Total Revenus</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatMoney(kpis.revenus)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-center">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <TrendingDown size={18} className="text-red-500" /> <p className="text-sm font-semibold uppercase tracking-wider">Total Dépenses</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatMoney(kpis.depenses)}</p>
        </div>

        <div className={`p-6 rounded-2xl border flex flex-col justify-center relative overflow-hidden group ${
          kpis.benefice >= 0 ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200' : 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200'
        }`}>
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Activity size={80} className={kpis.benefice >= 0 ? "text-green-600" : "text-red-600"} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={18} className={kpis.benefice >= 0 ? "text-green-700" : "text-red-700"} /> 
              <p className={`text-sm font-bold uppercase tracking-wider ${kpis.benefice >= 0 ? 'text-green-800' : 'text-red-800'}`}>Bénéfice Net (Gain)</p>
            </div>
            <p className={`text-4xl font-black ${kpis.benefice >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {kpis.benefice >= 0 ? '+' : '-'}{formatMoney(kpis.benefice)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        {/* Chart */}
        <div className="lg:w-1/2 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-semibold text-lg text-black">Évolution Revenus vs Dépenses</h2>
            <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
              <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-green-500"></div> Revenus</span>
              <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-red-400"></div> Dépenses</span>
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-2 md:gap-6 pt-4 h-56">
            {chartData.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end">
                <div className="w-full max-w-[40px] flex items-end gap-1 flex-1">
                  <div className="w-1/2 bg-green-500 rounded-t-md relative flex justify-end flex-col group-hover:brightness-110 transition-all" style={{ height: `${d.incomeHeight}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                      + {formatMoney(d.income)}
                    </div>
                  </div>
                  <div className="w-1/2 bg-red-400 rounded-t-md relative flex justify-end flex-col group-hover:brightness-110 transition-all" style={{ height: `${d.expenseHeight}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                      - {formatMoney(d.expense)}
                    </div>
                  </div>
                </div>
                <span className="mt-3 text-xs font-semibold text-gray-500">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="lg:w-1/2 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
            <h2 className="font-semibold text-lg text-black">Historique des opérations</h2>
            <select 
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Toutes les opérations</option>
              <option value="income">Revenus uniquement</option>
              <option value="expense">Dépenses uniquement</option>
            </select>
          </div>
          
          <div className="overflow-y-auto flex-1 h-[300px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-400 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3">Date & Description</th>
                  <th className="px-6 py-3 text-right">Montant</th>
                  <th className="px-6 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">Aucune opération trouvée.</td>
                  </tr>
                ) : (
                  filteredTransactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{trx.description}</div>
                        <div className="text-xs text-gray-500">{new Date(trx.date).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short', year: 'numeric'})} • {trx.id}</div>
                      </td>
                      <td className={`px-6 py-4 font-black text-right ${trx.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                        {trx.type === 'expense' ? '-' : '+'} {formatMoney(trx.amount)}
                      </td>
                      <td className="px-4 py-4 text-right flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEditModal(trx)} className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors" title="Modifier">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeleteTransaction(trx.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add Transaction */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900">
                {editingTxId ? "Modifier l'opération" : "Ajouter une opération"}
              </h3>
              <button onClick={() => setIsAddTxModalOpen(false)} className="text-gray-400 hover:text-black transition-colors bg-white rounded-full p-1.5 shadow-sm border border-gray-200">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="p-6 space-y-5">
              
              <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-xl">
                <button 
                  type="button"
                  onClick={() => setNewTx({...newTx, type: 'income'})}
                  className={`py-2 text-sm font-bold rounded-lg transition-colors ${newTx.type === 'income' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-black'}`}
                >
                  + Revenu
                </button>
                <button 
                  type="button"
                  onClick={() => setNewTx({...newTx, type: 'expense'})}
                  className={`py-2 text-sm font-bold rounded-lg transition-colors ${newTx.type === 'expense' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-black'}`}
                >
                  - Dépense
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description de l'opération</label>
                <input 
                  type="text" required
                  placeholder={newTx.type === 'income' ? "Ex: Prestation Mariage" : "Ex: Achat matériel"} 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                  value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Montant (FCFA)</label>
                  <input 
                    type="number" required min="0" step="500"
                    placeholder="150000" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none font-mono"
                    value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                  <input 
                    type="date" required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                    value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})}
                  />
                </div>
              </div>
              
              <button type="submit" className={`w-full py-3 mt-4 text-white font-bold rounded-xl transition-colors shadow-lg ${newTx.type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {editingTxId 
                  ? 'Enregistrer les modifications' 
                  : (newTx.type === 'income' ? 'Ajouter le revenu' : 'Ajouter la dépense')
                }
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
