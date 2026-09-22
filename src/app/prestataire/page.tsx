"use client";

import { FileText, CalendarCheck, Clock, CheckCircle, ChevronDown, Plus, MoreHorizontal, MapPin, Star, BadgeCheck, Edit2, X } from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";

export default function PrestataireDashboardPage() {
  const [demandes, setDemandes] = useState([
    { id: 1, client: "Amina Diop", init: "AD", type: "Mariage", date: "12 oct. 2026", budget: 1500000, status: "Nouvelle demande" },
    { id: 2, client: "Moussa Kane", init: "MK", type: "Séminaire", date: "5 nov. 2026", budget: 800000, status: "En discussion" },
    { id: 3, client: "Sophie Fall", init: "SF", type: "Anniversaire", date: "28 sept. 2026", budget: 350000, status: "Devis envoyé" },
    { id: 4, client: "Ibrahima Ba", init: "IB", type: "Événement d'entreprise", date: "15 oct. 2026", budget: 1200000, status: "Confirmé" },
    { id: 5, client: "Ndeye Diallo", init: "ND", type: "Baptême", date: "3 oct. 2026", budget: 400000, status: "En discussion" },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDemande, setNewDemande] = useState({ client: "", type: "Mariage", date: "", budget: "" });

  const stats = useMemo(() => {
    const total = demandes.length;
    const nouvelles = demandes.filter(d => d.status === "Nouvelle demande").length;
    const discussion = demandes.filter(d => d.status === "En discussion").length;
    const devis = demandes.filter(d => d.status === "Devis envoyé").length;
    const confirmees = demandes.filter(d => d.status === "Confirmé").length;
    const realisees = demandes.filter(d => d.status === "Réalisé").length;

    const calcPct = (count: number) => total > 0 ? Math.round((count / total) * 100) : 0;

    return { 
      total, nouvelles, discussion, devis, confirmees, realisees,
      pctNouvelles: calcPct(nouvelles),
      pctDiscussion: calcPct(discussion),
      pctDevis: calcPct(devis),
      pctConfirmees: calcPct(confirmees),
      pctRealisees: calcPct(realisees)
    };
  }, [demandes]);

  const getStatusStyle = (status: string) => {
    switch(status) {
      case "Nouvelle demande": return "bg-[#FFF8E1] text-[#F57F17]";
      case "En discussion": return "bg-[#E3F2FD] text-[#1976D2]";
      case "Devis envoyé": return "bg-[#F3E5F5] text-[#7B1FA2]";
      case "Confirmé": return "bg-[#E8F5E9] text-[#2E7D32]";
      case "Réalisé": return "bg-gray-100 text-[#607D8B]";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const handleAddDemande = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDemande.client || !newDemande.budget) return;
    
    const init = newDemande.client.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2) || "NC";
    
    setDemandes([{
      id: Date.now(),
      client: newDemande.client,
      init,
      type: newDemande.type,
      date: newDemande.date || new Date().toLocaleDateString('fr-FR'),
      budget: parseInt(newDemande.budget.replace(/\D/g, '')) || 0,
      status: "Nouvelle demande"
    }, ...demandes]);
    
    setIsAddModalOpen(false);
    setNewDemande({ client: "", type: "Mariage", date: "", budget: "" });
  };

  const messages = [
    { init: "AD", name: "Amina Diop", time: "10:24", msg: "Bonjour, pouvez-vous me faire une pro...", unread: false },
    { init: "MK", name: "Moussa Kane", time: "Hier", msg: "Merci pour votre devis, c'est parfait !", unread: true },
    { init: "SF", name: "Sophie Fall", time: "Hier", msg: "Pouvez-vous proposer un menu végéta...", unread: false },
  ];

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + " FCFA";
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2 flex items-center gap-2">
            Bonjour, Saveurs d'Afrique <span>👋</span>
          </h1>
          <p className="text-gray-500 text-sm">Voici un aperçu de votre activité sur Evenium.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-[#B8860B]/20 transition-colors">
            <Plus size={16} /> Nouvelle demande
          </button>
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm cursor-pointer shadow-sm hover:border-[#D4AF37]/50 transition-colors">
            <CalendarCheck size={16} className="text-gray-500" />
            <div className="text-left leading-tight">
              <div className="text-[10px] text-gray-400 font-medium">Semaine du</div>
              <div className="font-medium text-gray-800">15 - 21 sept. 2026</div>
            </div>
            <ChevronDown size={14} className="text-gray-400 ml-2" />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 cursor-pointer hover:border-[#F57F17]/30 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-[#FFF8E1] text-[#F57F17] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <FileText size={24} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold">{stats.nouvelles}</h3>
            </div>
            <p className="text-xs text-gray-500 font-medium">Nouvelles demandes</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 cursor-pointer hover:border-[#2E7D32]/30 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <CalendarCheck size={24} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{stats.confirmees}</h3>
            <p className="text-xs text-gray-500 font-medium">Événements confirmés</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 cursor-pointer hover:border-[#1976D2]/30 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-[#E3F2FD] text-[#1976D2] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Clock size={24} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{stats.discussion}</h3>
            <p className="text-xs text-gray-500 font-medium">En discussion</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 cursor-pointer hover:border-[#607D8B]/30 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-[#607D8B] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <CheckCircle size={24} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{stats.realisees}</h3>
            <p className="text-xs text-gray-500 font-medium">Événements réalisés</p>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Table: Dernières demandes */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-lg text-black">Dernières demandes</h2>
            <button className="text-sm font-medium text-[#B8860B] flex items-center gap-1 hover:underline">Voir toutes &rarr;</button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
                  <th className="pb-4 font-medium">Client</th>
                  <th className="pb-4 font-medium">Type</th>
                  <th className="pb-4 font-medium">Date</th>
                  <th className="pb-4 font-medium">Budget estimé</th>
                  <th className="pb-4 font-medium">Statut</th>
                  <th className="pb-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {demandes.slice(0, 5).map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-medium text-gray-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">{d.init}</div>
                      {d.client}
                    </td>
                    <td className="py-4 text-gray-600">{d.type}</td>
                    <td className="py-4 text-gray-500">{d.date}</td>
                    <td className="py-4 font-medium text-gray-800">{formatMoney(d.budget)}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusStyle(d.status)}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="px-3 py-1 text-xs font-semibold text-[#B8860B] border border-[#B8860B]/30 rounded hover:bg-[#F9F5EC] transition-colors">Voir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statut des demandes (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <h2 className="font-semibold text-lg text-black mb-6">Statut de votre Pipeline</h2>
          <div className="flex flex-col items-center justify-center flex-1 w-full h-full">
            {stats.total > 0 ? (
              <div className="relative w-40 h-40 rounded-full flex items-center justify-center shrink-0 mb-6 transition-all duration-500" 
                   style={{
                     background: `conic-gradient(
                       #F57F17 0% ${stats.pctNouvelles}%, 
                       #1976D2 ${stats.pctNouvelles}% ${stats.pctNouvelles + stats.pctDiscussion}%, 
                       #7B1FA2 ${stats.pctNouvelles + stats.pctDiscussion}% ${stats.pctNouvelles + stats.pctDiscussion + stats.pctDevis}%, 
                       #2E7D32 ${stats.pctNouvelles + stats.pctDiscussion + stats.pctDevis}% ${stats.pctNouvelles + stats.pctDiscussion + stats.pctDevis + stats.pctConfirmees}%, 
                       #607D8B ${stats.pctNouvelles + stats.pctDiscussion + stats.pctDevis + stats.pctConfirmees}% 100%
                     )`
                   }}>
                <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
                  <span className="text-3xl font-bold leading-none">{stats.total}</span>
                  <span className="text-[11px] text-gray-400 font-medium uppercase mt-1 tracking-wider">Demandes</span>
                </div>
              </div>
            ) : (
              <div className="w-40 h-40 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <span className="text-sm text-gray-400">Aucune donnée</span>
              </div>
            )}
            
            <div className="w-full space-y-3 px-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#F57F17]" /> <span className="text-gray-600 font-medium">Nouvelles</span></div>
                <div className="text-right"><span className="font-bold text-gray-900">{stats.nouvelles}</span> <span className="text-gray-400 text-xs ml-1">({stats.pctNouvelles}%)</span></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#1976D2]" /> <span className="text-gray-600 font-medium">En discussion</span></div>
                <div className="text-right"><span className="font-bold text-gray-900">{stats.discussion}</span> <span className="text-gray-400 text-xs ml-1">({stats.pctDiscussion}%)</span></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#7B1FA2]" /> <span className="text-gray-600 font-medium">Devis envoyés</span></div>
                <div className="text-right"><span className="font-bold text-gray-900">{stats.devis}</span> <span className="text-gray-400 text-xs ml-1">({stats.pctDevis}%)</span></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#2E7D32]" /> <span className="text-gray-600 font-medium">Confirmées</span></div>
                <div className="text-right"><span className="font-bold text-gray-900">{stats.confirmees}</span> <span className="text-gray-400 text-xs ml-1">({stats.pctConfirmees}%)</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'ajout */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900">Nouvelle demande simulée</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-black transition-colors bg-white rounded-full p-1.5 shadow-sm border border-gray-200">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddDemande} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du client</label>
                <input 
                  type="text" required
                  placeholder="Ex: Babacar Ndiaye" 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                  value={newDemande.client} onChange={e => setNewDemande({...newDemande, client: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type d'événement</label>
                <select 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                  value={newDemande.type} onChange={e => setNewDemande({...newDemande, type: e.target.value})}
                >
                  <option value="Mariage">Mariage</option>
                  <option value="Anniversaire">Anniversaire</option>
                  <option value="Baptême">Baptême</option>
                  <option value="Séminaire">Séminaire d'entreprise</option>
                  <option value="Soirée de Gala">Soirée de Gala</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date prévue</label>
                  <input 
                    type="date" required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                    value={newDemande.date} onChange={e => setNewDemande({...newDemande, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget estimé (FCFA)</label>
                  <input 
                    type="number" required min="0" step="10000"
                    placeholder="500000" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none font-mono"
                    value={newDemande.budget} onChange={e => setNewDemande({...newDemande, budget: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3 mt-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors shadow-lg">
                Ajouter la demande
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
