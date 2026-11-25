"use client";

import { Wallet, PieChart, TrendingDown, Plus, CheckCircle2, Lock, Receipt, X, FileText, Calendar, Edit2, Trash2, ArrowLeft, Sparkles, Check } from "lucide-react";
import Link from "next/link";
import { use, useState, useEffect, useMemo, useTransition } from "react";
import { useEvents } from "@/store/EventsContext";
import EventBreadcrumb from "@/components/dashboard/EventBreadcrumb";
import {
  getEventBudgetAndExpensesAction,
  updateEventBudgetAction,
  saveBudgetExpenseAction,
  deleteBudgetExpenseAction,
  upgradeEventToGoldAction,
} from "@/app/actions/budgetActions";

interface ExpenseItem {
  id: string;
  description: string;
  category: string;
  date: string;
  amount: number;
  status: "Payé" | "En attente";
}

interface EventBudgetInfo {
  id: string;
  name: string;
  plan: string;
  format?: string;
  budgetTotal: number;
  date?: string;
  location?: string;
}

export default function BudgetDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { events, refreshEvents } = useEvents();

  const [event, setEvent] = useState<EventBudgetInfo | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Édition du budget prévu
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetTotal, setNewBudgetTotal] = useState("");

  // Modale d'ajout / modification de dépense
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpgrading, startUpgradeTransition] = useTransition();

  const [newExpense, setNewExpense] = useState({
    description: "",
    category: "Lieu & Traiteur",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    status: "Payé" as "Payé" | "En attente",
  });

  // Charger les données du budget et des dépenses via Server Action
  const loadBudgetData = async () => {
    try {
      setErrorMsg(null);
      const res = await getEventBudgetAndExpensesAction(id);
      if (res.success && res.event) {
        setEvent(res.event);
        setExpenses(res.expenses || []);
      } else {
        // Fallback context
        const fromContext = events.find((e) => e.id === id);
        if (fromContext) {
          setEvent({
            id: fromContext.id,
            name: fromContext.name,
            plan: fromContext.plan,
            format: fromContext.format,
            budgetTotal: fromContext.budget?.total || 0,
            date: fromContext.date,
            location: fromContext.location,
          });
        } else if (!res.event) {
          setErrorMsg("Événement introuvable.");
        }
      }
    } catch (err: any) {
      console.error("Erreur de chargement du budget:", err);
      setErrorMsg("Impossible de charger le budget pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgetData();
  }, [id]);

  // Synchroniser avec le context des événements si le plan ou le nom change
  useEffect(() => {
    if (events.length > 0) {
      const match = events.find((e) => e.id === id);
      if (match && !event) {
        setEvent({
          id: match.id,
          name: match.name,
          plan: match.plan,
          format: match.format,
          budgetTotal: match.budget?.total || 0,
          date: match.date,
          location: match.location,
        });
      }
    }
  }, [events, id, event]);

  // Calculs financiers
  const globalBudget = event?.budgetTotal || 0;

  const totalSpent = useMemo(() => {
    return expenses
      .filter((e) => e.status === "Payé")
      .reduce((sum, exp) => sum + Number(exp.amount), 0);
  }, [expenses]);

  const remainingBudget = globalBudget - totalSpent;
  const consumedPercentage =
    globalBudget > 0 ? Math.min(100, Math.round((totalSpent / globalBudget) * 100)) : 0;

  const expensesByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach((e) => {
      cats[e.category] = (cats[e.category] || 0) + Number(e.amount);
    });
    return cats;
  }, [expenses]);

  // Mise à jour du budget total
  const handleUpdateBudget = async () => {
    if (!newBudgetTotal) return;
    const num = Number(newBudgetTotal);
    if (isNaN(num) || num < 0) return;

    setIsSubmitting(true);
    // Mise à jour optimiste
    setEvent((prev) => (prev ? { ...prev, budgetTotal: num } : null));

    const res = await updateEventBudgetAction(id, num);
    if (res.success) {
      setIsEditingBudget(false);
      setNewBudgetTotal("");
      if (refreshEvents) refreshEvents();
    } else {
      alert("Erreur lors de la mise à jour du budget.");
    }
    setIsSubmitting(false);
  };

  // Gestion des modales d'ajout/édition
  const openAddModal = () => {
    setEditingExpenseId(null);
    setNewExpense({
      description: "",
      category: "Lieu & Traiteur",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      status: "Payé",
    });
    setIsAddExpenseModalOpen(true);
  };

  const openEditModal = (expense: ExpenseItem) => {
    setEditingExpenseId(expense.id);
    setNewExpense({
      description: expense.description,
      category: expense.category,
      date: expense.date || new Date().toISOString().split("T")[0],
      amount: expense.amount.toString(),
      status: expense.status,
    });
    setIsAddExpenseModalOpen(true);
  };

  // Supprimer une dépense
  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) return;

    // Mise à jour optimiste
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    await deleteBudgetExpenseAction(expenseId, id);
    if (refreshEvents) refreshEvents();
  };

  // Enregistrer une dépense
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.date) return;

    setIsSubmitting(true);
    const amountNum = Number(newExpense.amount);

    const payload = {
      id: editingExpenseId || undefined,
      eventId: id,
      description: newExpense.description,
      category: newExpense.category,
      date: newExpense.date,
      amount: amountNum,
      status: newExpense.status,
    };

    const res = await saveBudgetExpenseAction(payload);
    if (res.success) {
      await loadBudgetData();
      if (refreshEvents) refreshEvents();
      setIsAddExpenseModalOpen(false);
    } else {
      alert("Erreur lors de l'enregistrement de la dépense.");
    }
    setIsSubmitting(false);
  };

  // Upgrade vers Gold en 1 clic
  const handleUpgradeToGold = () => {
    startUpgradeTransition(async () => {
      const res = await upgradeEventToGoldAction(id);
      if (res.success) {
        setEvent((prev) => (prev ? { ...prev, plan: "Gold" } : null));
        if (refreshEvents) await refreshEvents();
        await loadBudgetData();
      } else {
        alert("Impossible de mettre à niveau pour le moment.");
      }
    });
  };

  // Utilitaires de formatage
  const formatCurrency = (num: number) => {
    return Math.round(num)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const getStatusColor = (status: string) => {
    if (status === "Payé") return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
    if (status === "En attente") return "bg-amber-50 text-amber-700 border border-amber-200/60";
    return "bg-gray-50 text-gray-700 border border-gray-200";
  };

  const categoryColors: Record<string, string> = {
    "Lieu & Traiteur": "#b8924a",
    "Photo & Vidéo": "#2b2118",
    "Décoration": "#E0A96D",
    Animation: "#8B5CF6",
    Tenues: "#EC4899",
    Autre: "#9CA3AF",
  };

  // Fermeture modale avec Échap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") return;
      if (e.key === "Escape" && isAddExpenseModalOpen) {
        setIsAddExpenseModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAddExpenseModalOpen]);

  // 1. ÉTAT DE CHARGEMENT
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-3 border-[#b8924a] border-t-transparent rounded-full animate-spin shadow-md shadow-[#b8924a]/20" />
        <p className="font-serif text-lg text-gray-700 animate-pulse">Chargement de votre budget...</p>
        <p className="text-xs text-gray-400">Préparation de vos postes de dépenses et statistiques</p>
      </div>
    );
  }

  // 2. ÉVÉNEMENT INTROUVABLE
  if (!event || errorMsg) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200/60">
          <Wallet size={28} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">Événement introuvable</h2>
        <p className="text-gray-500 text-sm max-w-md mb-6 leading-relaxed">
          Nous n&apos;avons pas pu récupérer les détails de cet événement. Veuillez vérifier le lien ou retourner à la liste de vos événements.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white hover:bg-gray-800 text-sm font-semibold transition-all shadow-md"
        >
          <ArrowLeft size={16} /> Retour au Dashboard
        </Link>
      </div>
    );
  }

  // 3. VÉRIFICATION DE LA FORMULE (GOLD REQUISE)
  const isGold = (event.plan || "").toLowerCase() === "gold";

  if (!isGold) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        <EventBreadcrumb eventId={event.id} eventName={event.name} currentPage="Budget & Finances" />

        <div className="min-h-[60vh] flex items-center justify-center py-6">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl max-w-lg text-center relative overflow-hidden">
            {/* Ruban décoratif */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#b8924a] via-[#f7e7ce] to-[#b8924a]" />

            <div className="w-20 h-20 bg-gradient-to-br from-[#fbf7f0] to-[#f4ebe1] text-[#8f6f33] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-[#b8924a]/20">
              <Lock size={34} strokeWidth={1.8} />
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-[#b8924a]/10 text-[#8f6f33] text-[11px] font-bold uppercase tracking-wider mb-3">
              Fonctionnalité Formule Gold
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Maîtrisez votre budget à 100%
            </h2>

            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Votre formule actuelle (<strong className="text-gray-900">{event.plan || "Premium"}</strong>) inclut{" "}
              <strong>l&apos;Invitation Digitale &amp; le Suivi des Réponses (RSVP)</strong>.
              <br />
              La gestion avancée du <strong>Budget</strong>, des <strong>Dépenses réelles</strong>, de la{" "}
              <strong>Checklist Jour J</strong> et des <strong>Prestataires</strong> est exclusivement disponible avec la{" "}
              <strong className="text-[#8f6f33]">Formule Gold</strong>.
            </p>

            <div className="bg-[#fcfaf7] border border-[#b8924a]/20 rounded-2xl p-4 text-left mb-6 space-y-2 text-xs text-gray-700">
              <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#b8924a]" /> Ce que vous débloquez avec la Formule Gold :
              </p>
              <ul className="space-y-1.5 pl-5 list-disc text-gray-600">
                <li>Suivi complet du budget prévu vs montant dépensé</li>
                <li>Répartition automatique par catégorie de prestataire</li>
                <li>Historique des acomptes et reste à charge calculé en direct</li>
                <li>Checklist et rétroplanning personnalisés pour le Jour J</li>
                <li>Accès direct au catalogue de prestataires certifiés</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleUpgradeToGold}
                disabled={isUpgrading}
                className="w-full bg-gradient-to-r from-[#b8924a] via-[#c9a762] to-[#b8924a] hover:brightness-105 text-white px-6 py-4 rounded-xl text-sm font-bold shadow-lg shadow-[#b8924a]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isUpgrading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Activation de la Formule Gold...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Activer la Formule Gold pour cet événement</span>
                  </>
                )}
              </button>

              <Link
                href={`/dashboard/events/${event.id}`}
                className="block w-full py-3 text-xs text-gray-500 hover:text-gray-800 transition-colors font-medium"
              >
                Retour à l&apos;aperçu de l&apos;événement
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. TABLEAU DE BORD DU BUDGET COMPLET (POUR FORMULE GOLD)
  return (
    <div className="max-w-5xl mx-auto w-full space-y-5 sm:space-y-6">
      {/* Menu d'échappement & Fil d'Ariane */}
      <EventBreadcrumb eventId={event.id} eventName={event.name} currentPage="Budget & Finances" />

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#8f6f33] font-semibold">Budget &amp; Finances</p>
            <span className="px-2 py-0.5 rounded-full bg-[#b8924a]/15 text-[#8f6f33] text-[10px] font-bold">
              Formule Gold
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-gray-900 leading-tight mt-1">Mon budget</h1>
          <p className="text-gray-500 text-sm mt-1">
            Suivez vos dépenses, acomptes et gardez un œil sur ce qu&apos;il vous reste pour {event.name}.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-[#f5eee1] px-5 py-3 rounded-full text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus size={17} /> Ajouter une dépense
        </button>
      </div>

      {/* Chiffres clés */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Budget Prévu */}
          <div className="rounded-2xl bg-gray-50/80 border border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 flex items-center gap-1.5 font-medium">
                <Wallet size={13} /> Budget prévu
              </p>
              <button
                onClick={() => {
                  setNewBudgetTotal(globalBudget > 0 ? globalBudget.toString() : "");
                  setIsEditingBudget(!isEditingBudget);
                }}
                className="p-1 -m-1 text-gray-400 hover:text-[#b8924a] transition-colors"
                aria-label="Modifier le budget prévu"
                title="Modifier le budget total"
              >
                <Edit2 size={14} />
              </button>
            </div>

            {isEditingBudget ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Ex: 5000000"
                  className="min-w-0 flex-1 px-3 py-1.5 border border-[#b8924a] rounded-lg text-sm outline-none bg-white font-mono"
                  value={newBudgetTotal}
                  onChange={(e) => setNewBudgetTotal(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={handleUpdateBudget}
                  disabled={isSubmitting || !newBudgetTotal}
                  className="shrink-0 bg-[#b8924a] hover:bg-[#a17e3a] text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
                >
                  OK
                </button>
                <button
                  onClick={() => setIsEditingBudget(false)}
                  className="shrink-0 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="mt-1 flex items-baseline justify-between">
                <p className="font-serif text-2xl sm:text-3xl text-gray-900 font-bold">
                  {formatCurrency(globalBudget)} <span className="text-sm font-sans font-normal text-gray-400">FCFA</span>
                </p>
                {globalBudget === 0 && (
                  <button
                    onClick={() => setIsEditingBudget(true)}
                    className="text-[11px] text-[#b8924a] hover:underline font-semibold"
                  >
                    Définir un montant
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Dépensé */}
          <div className="rounded-2xl bg-gray-50/80 border border-gray-100 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 flex items-center gap-1.5 font-medium">
              <TrendingDown size={13} /> Dépensé (Payé)
            </p>
            <p className="font-serif text-2xl sm:text-3xl text-gray-900 mt-1 font-bold">
              {formatCurrency(totalSpent)} <span className="text-sm font-sans font-normal text-gray-400">FCFA</span>
            </p>
          </div>

          {/* Restant */}
          <div className="rounded-2xl bg-[#281a10] px-4 py-3 text-white border border-[#3d2b1f]">
            <p className="text-[11px] uppercase tracking-wider text-[#d9c08c] flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={13} /> Restant à engager
            </p>
            <p className="font-serif text-2xl sm:text-3xl text-white mt-1 font-bold">
              {formatCurrency(remainingBudget)} <span className="text-sm font-sans font-normal text-white/50">FCFA</span>
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
            <span>Budget consommé</span>
            <span className={consumedPercentage > 100 ? "font-bold text-red-600" : "font-semibold text-gray-900"}>
              {consumedPercentage}% {consumedPercentage > 100 ? "(Dépassement de budget)" : ""}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                consumedPercentage > 100 ? "bg-red-500" : "bg-[#b8924a]"
              }`}
              style={{ width: `${Math.min(100, consumedPercentage)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Grid Répartition & Liste des dépenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Par Catégorie */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <h2 className="font-serif text-2xl text-gray-900 font-bold">Par catégorie</h2>
          {Object.keys(expensesByCategory).length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              <PieChart size={28} className="mx-auto mb-2 opacity-40 text-gray-400" />
              <p>Aucune dépense pour le moment.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {Object.entries(expensesByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amount]) => {
                  const pct = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
                  return (
                    <li key={cat}>
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: categoryColors[cat] || "#9CA3AF" }}
                          />
                          <span className="text-gray-700 truncate font-medium">{cat}</span>
                        </span>
                        <span className="font-semibold text-gray-900 whitespace-nowrap">
                          {formatCurrency(amount)} F
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: categoryColors[cat] || "#9CA3AF",
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </section>

        {/* Liste des Dépenses */}
        <section className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-5 pb-3 border-b border-gray-100">
            <h2 className="font-serif text-2xl text-gray-900 font-bold">Dépenses</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
              {expenses.length} dépense(s)
            </span>
          </div>

          {expenses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-400">
                <Receipt size={22} />
              </div>
              <p className="text-sm font-medium text-gray-700">Aucune dépense enregistrée pour le moment.</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Ajoutez vos acomptes traiteur, location de salle ou tenues pour garder la maîtrise de votre budget.
              </p>
              <button
                onClick={openAddModal}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#8f6f33] hover:underline cursor-pointer"
              >
                <Plus size={14} /> Ajouter ma première dépense
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {expenses.map((expense) => (
                <li
                  key={expense.id}
                  className="px-4 sm:px-6 py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors"
                >
                  <div
                    className="w-10 h-10 shrink-0 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center"
                    style={{ color: categoryColors[expense.category] || "#6b7280" }}
                  >
                    <Receipt size={16} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{expense.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {expense.category} ·{" "}
                      {new Date(expense.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                      {formatCurrency(expense.amount)} F
                    </p>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-bold ${getStatusColor(
                        expense.status
                      )}`}
                    >
                      {expense.status}
                    </span>
                  </div>

                  <div className="shrink-0 flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(expense)}
                      className="w-8 h-8 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
                      aria-label={`Modifier ${expense.description}`}
                      title="Modifier"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                      aria-label={`Supprimer ${expense.description}`}
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Modale d'Ajout / Modification d'une Dépense */}
      {isAddExpenseModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddExpenseModalOpen(false);
          }}
        >
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92dvh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 pb-[env(safe-area-inset-bottom)] border border-gray-100">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-serif font-bold text-xl text-gray-900">
                  {editingExpenseId ? "Modifier la dépense" : "Ajouter une dépense"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Enregistrez un poste financier pour votre événement</p>
              </div>
              <button
                onClick={() => setIsAddExpenseModalOpen(false)}
                className="text-gray-400 hover:text-black transition-colors bg-white rounded-full p-1.5 shadow-xs border border-gray-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <FileText size={13} /> Intitulé de la dépense *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Acompte Traiteur, Location Sono, Robe de mariée..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Montant (FCFA) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Ex: 150000"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50 font-mono"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Statut de paiement</label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50 font-semibold"
                    value={newExpense.status}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, status: e.target.value as "Payé" | "En attente" })
                    }
                  >
                    <option value="Payé" className="text-emerald-700 font-semibold">
                      Payé (Comptabilisé)
                    </option>
                    <option value="En attente" className="text-amber-700 font-semibold">
                      En attente (Devis / Acompte prévu)
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Catégorie</label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  >
                    <option value="Lieu & Traiteur">Lieu &amp; Traiteur</option>
                    <option value="Photo & Vidéo">Photo &amp; Vidéo</option>
                    <option value="Décoration">Décoration &amp; Fleurs</option>
                    <option value="Animation">Animation (DJ, Artistes)</option>
                    <option value="Tenues">Tenues &amp; Beauté</option>
                    <option value="Autre">Autre dépense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar size={13} /> Date de règlement
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(false)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-black text-white hover:bg-gray-900 px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/10 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Sauvegarde..." : editingExpenseId ? "Enregistrer" : "Ajouter la dépense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
