"use client";

import { Wallet, PieChart, TrendingDown, Plus, ChevronDown, CheckCircle2, Lock, ArrowUpRight, Receipt, Activity, MoreHorizontal, X, FileText, Calendar, Edit2, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { use, useState, useEffect, useMemo } from "react";
import { useEvents } from "@/store/EventsContext";
import { createClient } from "@/utils/supabase/client";

export default function BudgetDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { events, refreshEvents } = useEvents();
  const supabase = createClient();

  const [event, setEvent] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetTotal, setNewBudgetTotal] = useState("");
  
  const [newExpense, setNewExpense] = useState({
    description: "",
    category: "Lieu & Traiteur",
    date: "",
    amount: "",
    status: "Payé"
  });

  const fetchData = async () => {
    const eventData = events.find(e => e.id === id);
    if (eventData) {
      setEvent(eventData);
    }
    
    // Fetch transactions
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('event_id', id)
      .eq('type', 'depense')
      .order('date', { ascending: false });
      
    if (data) {
      setExpenses(data.map(t => ({
        id: t.id,
        description: t.description,
        category: t.categorie || 'Autre',
        date: t.date,
        amount: Number(t.montant),
        status: t.status || 'En attente'
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id, events]);

  const handleUpdateBudget = async () => {
    if (!newBudgetTotal) return;
    setIsSubmitting(true);
    await supabase.from('events').update({ budget_total: Number(newBudgetTotal) }).eq('id', id);
    await refreshEvents();
    setIsEditingBudget(false);
    setIsSubmitting(false);
  };

  const globalBudget = event?.budget?.total || 0;
  
  const totalSpent = useMemo(() => {
    return expenses.filter(e => e.status === "Payé").reduce((sum, exp) => sum + Number(exp.amount), 0);
  }, [expenses]);

  const remainingBudget = globalBudget - totalSpent;
  const consumedPercentage = globalBudget > 0 ? Math.min(100, Math.round((totalSpent / globalBudget) * 100)) : 0;

  const expensesByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + Number(e.amount);
    });
    return cats;
  }, [expenses]);

  if (loading) {
    return <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center h-[80vh]">Chargement de votre budget...</div>;
  }

  if (!event) {
    return <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center h-[80vh]">Événement introuvable.</div>;
  }

  if (event.plan !== "Gold") {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full h-[80vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl p-5 sm:p-8 lg:p-10 border border-gray-100 shadow-xl max-w-md text-center">
          <div className="w-20 h-20 bg-[#f5eee1] text-[#8f6f33] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-black mb-3">Fonctionnalité Gold</h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            La gestion budgétaire avancée est exclusivement réservée aux événements utilisant la formule Gold. Gérez vos dépenses et maîtrisez vos coûts en toute simplicité.
          </p>
          <button className="w-full bg-[#8f6f33] hover:bg-[#7a5e2b] text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-[#8f6f33]/20 transition-colors">
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
      date: expense.date || "",
      amount: expense.amount.toString(),
      status: expense.status
    });
    setIsAddExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      await supabase.from('transactions').delete().eq('id', expenseId);
      await fetchData();
    }
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.date) return;

    setIsSubmitting(true);
    
    if (editingExpenseId) {
      await supabase.from('transactions').update({
        description: newExpense.description,
        categorie: newExpense.category,
        date: newExpense.date,
        montant: Number(newExpense.amount),
        status: newExpense.status
      }).eq('id', editingExpenseId);
    } else {
      await supabase.from('transactions').insert([{
        event_id: id,
        type: 'depense',
        description: newExpense.description,
        categorie: newExpense.category,
        date: newExpense.date,
        montant: Number(newExpense.amount),
        status: newExpense.status
      }]);
    }

    await fetchData();
    
    setIsSubmitting(false);
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
    "Lieu & Traiteur": "#b8924a",
    "Photo & Vidéo": "#2b2118",
    "Décoration": "#E5E5E5",
    "Animation": "#8B5CF6",
    "Tenues": "#EC4899",
    "Autre": "#9CA3AF"
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-5 sm:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#8f6f33]">Budget</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-gray-900 leading-tight">Mon budget</h1>
          <p className="text-gray-500 text-sm mt-1">Suivez vos dépenses et gardez un œil sur ce qu&apos;il vous reste.</p>
        </div>
        <button onClick={openAddModal} className="inline-flex items-center justify-center gap-2 bg-black text-[#f5eee1] px-5 py-3 rounded-full text-sm font-semibold shadow-md">
          <Plus size={17} /> Ajouter une dépense
        </button>
      </div>

      {/* Chiffres clés */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-gray-50/80 border border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 flex items-center gap-1.5"><Wallet size={13} /> Budget prévu</p>
              <button onClick={() => setIsEditingBudget(!isEditingBudget)} className="p-1 -m-1 text-gray-400 hover:text-[#b8924a]" aria-label="Modifier le budget">
                <Edit2 size={14} />
              </button>
            </div>
            {isEditingBudget ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Montant…"
                  className="min-w-0 flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-white"
                  value={newBudgetTotal}
                  onChange={(e) => setNewBudgetTotal(e.target.value)}
                />
                <button
                  onClick={handleUpdateBudget}
                  disabled={isSubmitting || !newBudgetTotal}
                  className="shrink-0 bg-[#b8924a] text-white px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  OK
                </button>
              </div>
            ) : (
              <p className="font-serif text-2xl sm:text-3xl text-gray-900 mt-1">{formatCurrency(globalBudget)} <span className="text-sm text-gray-400">FCFA</span></p>
            )}
          </div>
          <div className="rounded-2xl bg-gray-50/80 border border-gray-100 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 flex items-center gap-1.5"><TrendingDown size={13} /> Dépensé</p>
            <p className="font-serif text-2xl sm:text-3xl text-gray-900 mt-1">{formatCurrency(totalSpent)} <span className="text-sm text-gray-400">FCFA</span></p>
          </div>
          <div className="rounded-2xl bg-[#2b2118] px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-[#d9c08c] flex items-center gap-1.5"><CheckCircle2 size={13} /> Restant</p>
            <p className="font-serif text-2xl sm:text-3xl text-white mt-1">{formatCurrency(remainingBudget)} <span className="text-sm text-white/50">FCFA</span></p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Budget consommé</span>
            <span className="font-semibold text-gray-900">{consumedPercentage}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div className={`h-full rounded-full ${consumedPercentage > 100 ? "bg-red-500" : "bg-[#b8924a]"}`} style={{ width: `${Math.min(100, consumedPercentage)}%` }} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Répartition réelle par catégorie */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <h2 className="font-serif text-2xl text-gray-900">Par catégorie</h2>
          {Object.keys(expensesByCategory).length === 0 ? (
            <p className="text-sm text-gray-500 mt-3">Aucune dépense pour le moment.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => {
                const pct = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
                return (
                  <li key={cat}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: categoryColors[cat] || "#9CA3AF" }} />
                        <span className="text-gray-700 truncate">{cat}</span>
                      </span>
                      <span className="font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(amount)} F</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: categoryColors[cat] || "#9CA3AF" }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Dépenses */}
        <section className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-5 pb-3">
            <h2 className="font-serif text-2xl text-gray-900">Dépenses</h2>
            <span className="text-sm text-gray-500">{expenses.length} dépense(s)</span>
          </div>
          {expenses.length === 0 ? (
            <div className="px-6 pb-8 pt-2 text-center">
              <p className="text-sm text-gray-500">Aucune dépense enregistrée pour le moment.</p>
              <button onClick={openAddModal} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#8f6f33]">
                <Plus size={15} /> Ajouter ma première dépense
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {expenses.map((expense) => (
                <li key={expense.id} className="px-4 sm:px-6 py-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center" style={{ color: categoryColors[expense.category] || "#6b7280" }}>
                    <Receipt size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{expense.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {expense.category} · {new Date(expense.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(expense.amount)} F</p>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-bold ${getStatusColor(expense.status)}`}>{expense.status}</span>
                  </div>
                  <div className="shrink-0 flex flex-col sm:flex-row gap-0.5">
                    <button onClick={() => openEditModal(expense)} className="w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center" aria-label={`Modifier ${expense.description}`}>
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDeleteExpense(expense.id)} className="w-9 h-9 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center" aria-label={`Supprimer ${expense.description}`}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Add/Edit Expense Modal */}
      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92dvh] overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 pb-[env(safe-area-inset-bottom)]">
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
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Montant (FCFA)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="Ex: 150000" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50 font-mono"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50 font-semibold"
                    value={newExpense.status}
                    onChange={(e) => setNewExpense({...newExpense, status: e.target.value})}
                  >
                    <option value="Payé" className="text-green-700 font-semibold">Payé</option>
                    <option value="En attente" className="text-amber-700 font-semibold">En attente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50"
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
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50"
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
                  disabled={isSubmitting}
                  className="flex-1 bg-black text-white hover:bg-gray-900 px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/10 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Sauvegarde..." : (editingExpenseId ? "Enregistrer" : "Ajouter")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
