"use client";

import { Wallet, PieChart, TrendingDown, Plus, ChevronDown, CheckCircle2, Lock, ArrowUpRight, Receipt, Activity, MoreHorizontal, X, FileText, Calendar, Edit2, Trash2 } from "lucide-react";
import { mockEvents } from "@/data/mock/events";
import { notFound } from "next/navigation";
import Link from "next/link";
import { use, useState, useMemo } from "react";

export default function BudgetDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const event = mockEvents.find((e) => e.id === id);

  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  
  const [newExpense, setNewExpense] = useState({
    description: "",
    category: "Lieu & Traiteur",
    date: "",
    amount: "",
    status: "Payé"
  });

  const [expenses, setExpenses] = useState([
    { id: 1, description: "Acompte Traiteur", category: "Lieu & Traiteur", date: "20 Sept. 2026", amount: 850000, status: "Payé", rawDate: "2026-09-20" },
    { id: 2, description: "Acompte Décoration", category: "Décoration", date: "18 Sept. 2026", amount: 300000, status: "Payé", rawDate: "2026-09-18" },
    { id: 3, description: "Location Salle de réception", category: "Lieu & Traiteur", date: "15 Sept. 2026", amount: 1250000, status: "En attente", rawDate: "2026-09-15" },
    { id: 4, description: "Acompte Photographe", category: "Photo & Vidéo", date: "10 Sept. 2026", amount: 150000, status: "Payé", rawDate: "2026-09-10" },
  ]);

  const globalBudget = 5000000;
  
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const remainingBudget = globalBudget - totalSpent;
  const consumedPercentage = Math.min(100, Math.round((totalSpent / globalBudget) * 100));

  const expensesByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    });
    return cats;
  }, [expenses]);

  if (!event) {
    notFound();
  }

  if (event.plan !== "Gold") {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full h-[80vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl max-w-md text-center">
          <div className="w-20 h-20 bg-[#F9F5EC] text-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-black mb-3">Fonctionnalité Gold</h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            La gestion budgétaire avancée est exclusivement réservée aux événements utilisant la formule Gold. Gérez vos dépenses et maîtrisez vos coûts en toute simplicité.
          </p>
          <button className="w-full bg-[#B8860B] hover:bg-[#996B00] text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-[#B8860B]/20 transition-colors">
            Passer à la formule Gold
          </button>
          <div className="mt-4">
             <Link href={`/dashboard/events/${event.id}`} className="text-sm font-medium text-gray-400 hover:text-black">
               Retour à l'aperçu
             </Link>
          </div>
        </div>
      </div>
    );
  }

  const openAddModal = () => {
    setEditingExpenseId(null);
    setNewExpense({ description: "", category: "Lieu & Traiteur", date: "", amount: "", status: "Payé" });
    setIsAddExpenseModalOpen(true);
  };

  const openEditModal = (expense: any) => {
    setEditingExpenseId(expense.id);
    setNewExpense({
      description: expense.description,
      category: expense.category,
      date: expense.rawDate || "", // Use rawDate if available for the input
      amount: expense.amount.toString(),
      status: expense.status
    });
    setIsAddExpenseModalOpen(true);
  };

  const handleDeleteExpense = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.date) return;

    const formattedDate = new Date(newExpense.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

    if (editingExpenseId) {
      setExpenses(expenses.map(exp => 
        exp.id === editingExpenseId 
          ? { 
              ...exp, 
              description: newExpense.description, 
              category: newExpense.category, 
              date: formattedDate,
              rawDate: newExpense.date,
              amount: parseInt(newExpense.amount), 
              status: newExpense.status 
            } 
          : exp
      ));
    } else {
      const expense = {
        id: Date.now(),
        description: newExpense.description,
        category: newExpense.category,
        date: formattedDate,
        rawDate: newExpense.date,
        amount: parseInt(newExpense.amount),
        status: newExpense.status
      };
      setExpenses([expense, ...expenses]);
    }
    
    setIsAddExpenseModalOpen(false);
  };

  const formatCurrency = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const getStatusColor = (status: string) => {
    if (status === "Payé") return "bg-green-50 text-green-700";
    if (status === "En attente") return "bg-amber-50 text-amber-700";
    return "bg-gray-50 text-gray-700";
  };

  const categoryColors: Record<string, string> = {
    "Lieu & Traiteur": "#D4AF37",
    "Photo & Vidéo": "#111111",
    "Décoration": "#E5E5E5",
    "Animation": "#8B5CF6",
    "Tenues": "#EC4899",
    "Autre": "#9CA3AF"
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="text-xs text-gray-500 font-medium mb-6 flex items-center gap-2">
        <span>Événement</span> <span className="text-gray-300">&gt;</span> <span className="text-black">Gestion Budgétaire</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Gestion Budgétaire</h1>
          <p className="text-gray-500 text-sm">Suivez vos dépenses et maîtrisez votre budget événementiel.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-[#B8860B]/20 transition-colors"
        >
          <Plus size={16} /> Ajouter une dépense
        </button>
      </div>

      {/* Dashboard KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet size={80} />
          </div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center shadow-sm">
              <Wallet size={24} />
            </div>
            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full">ESTIMATION</span>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Budget global estimé</p>
            <h3 className="text-3xl font-serif font-bold text-gray-900">{formatCurrency(globalBudget)} <span className="text-lg text-gray-400">FCFA</span></h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-red-500">
            <TrendingDown size={80} />
          </div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shadow-sm">
              <TrendingDown size={24} />
            </div>
            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><ArrowUpRight size={12} /> {consumedPercentage}% CONSOMMÉ</span>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Dépenses actuelles</p>
            <h3 className="text-3xl font-serif font-bold text-gray-900">{formatCurrency(totalSpent)} <span className="text-lg text-gray-400">FCFA</span></h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1A1A1A] to-black p-6 rounded-2xl border border-gray-800 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-[#D4AF37]">
            <CheckCircle2 size={80} />
          </div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-[#D4AF37] flex items-center justify-center shadow-sm backdrop-blur-sm">
              <Activity size={24} />
            </div>
            <span className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-bold px-2.5 py-1 rounded-full">RESTANT</span>
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Budget restant disponible</p>
            <h3 className="text-3xl font-serif font-bold text-white mb-4">{formatCurrency(remainingBudget)} <span className="text-lg text-gray-500">FCFA</span></h3>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
              <div className="bg-gradient-to-r from-[#D4AF37] to-[#F9F5EC] h-1.5 rounded-full transition-all duration-500" style={{ width: `${100 - consumedPercentage}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Charts */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-lg text-black">Répartition par catégorie</h2>
            </div>
            
            <div className="flex items-center justify-center mb-8 pt-4">
              <div className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-inner" 
                   style={{
                     background: 'conic-gradient(#D4AF37 0% 50%, #111111 50% 70%, #E5E5E5 70% 90%, #8B5CF6 90% 100%)'
                   }}>
                <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center z-10 shadow-sm">
                  <span className="text-xl font-bold">{consumedPercentage}%</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Consommé</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(expensesByCategory).sort((a,b) => b[1] - a[1]).map(([cat, amount]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColors[cat] || '#000' }}></span>
                      <span className="font-medium text-gray-700">{cat}</span>
                    </div>
                    <span className="font-bold text-gray-900">{formatCurrency(amount)} F</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Transactions Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-lg text-black">Historique des transactions</h2>
            <div className="text-sm font-semibold text-gray-500">
              {expenses.length} dépense(s)
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-bold tracking-wider uppercase">
                  <th className="pb-4">Description</th>
                  <th className="pb-4">Catégorie</th>
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Statut</th>
                  <th className="pb-4 text-right">Montant</th>
                  <th className="pb-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">Aucune dépense enregistrée pour le moment.</td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600"><Receipt size={14} /></div>
                          <span className="font-bold text-gray-900">{expense.description}</span>
                        </div>
                      </td>
                      <td className="py-4 text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryColors[expense.category] || '#000' }}></span>
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-4 text-gray-500">{expense.date}</td>
                      <td className="py-4"><span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide font-bold ${getStatusColor(expense.status)}`}>{expense.status}</span></td>
                      <td className="py-4 text-right font-bold text-gray-900">{formatCurrency(expense.amount)} F</td>
                      <td className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(expense)} className="p-1.5 text-gray-500 hover:text-[#B8860B] hover:bg-[#F9F5EC] rounded-md transition-colors shadow-sm bg-white border border-gray-200" title="Modifier">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteExpense(expense.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shadow-sm bg-white border border-gray-200" title="Supprimer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-xl text-gray-900">
                {editingExpenseId ? "Modifier la dépense" : "Ajouter une dépense"}
              </h3>
              <button onClick={() => setIsAddExpenseModalOpen(false)} className="text-gray-400 hover:text-black transition-colors bg-white rounded-full p-1 shadow-sm border border-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveExpense} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><FileText size={14}/> Description</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Acompte Traiteur, Location Sono..." 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Montant (FCFA)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="Ex: 150000" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 font-mono"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 font-semibold"
                    value={newExpense.status}
                    onChange={(e) => setNewExpense({...newExpense, status: e.target.value})}
                  >
                    <option value="Payé" className="text-green-700 font-semibold">Payé</option>
                    <option value="En attente" className="text-amber-700 font-semibold">En attente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  >
                    <option value="Lieu & Traiteur">Lieu & Traiteur</option>
                    <option value="Photo & Vidéo">Photo & Vidéo</option>
                    <option value="Décoration">Décoration</option>
                    <option value="Animation">Animation (DJ, Artistes)</option>
                    <option value="Tenues">Tenues & Beauté</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Calendar size={14}/> Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(false)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl text-sm font-bold transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-black text-white hover:bg-gray-900 px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/10 transition-colors"
                >
                  {editingExpenseId ? "Enregistrer les modifications" : "Ajouter la dépense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
