"use client";

import { Search, Filter, Plus, FileText, CheckCircle, Clock, XCircle, Download, Send, X, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal"; // Provided Modal

export default function PrestataireDevisPage() {
  const [devis, setDevis] = useState([
    { id: "DEV-2026-042", event: "Mariage Astou & Ali", client: "Ndeye Astou", date: "12 Sept 2026", amount: 850000, status: "accepted" },
    { id: "DEV-2026-043", event: "Anniversaire Sophie", client: "Fatou Sow", date: "15 Sept 2026", amount: 250000, status: "pending" },
    { id: "DEV-2026-044", event: "Soirée d'Entreprise", client: "Moussa Fall", date: "16 Sept 2026", amount: 1500000, status: "draft" },
    { id: "DEV-2026-041", event: "Cocktail Privé", client: "Amina Diop", date: "01 Sept 2026", amount: 400000, status: "rejected" },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  const [isAddDevisOpen, setIsAddDevisOpen] = useState(false);
  const [newDevis, setNewDevis] = useState({ client: "", event: "", amount: "" });

  const [confirmAction, setConfirmAction] = useState<{id: string, type: 'send' | 'accept' | 'reject'} | null>(null);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + " FCFA";
  };

  const filteredDevis = useMemo(() => {
    return devis.filter(d => {
      const matchSearch = d.client.toLowerCase().includes(search.toLowerCase()) || d.event.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase());
      const matchFilter = statusFilter === 'all' || d.status === statusFilter;
      return matchSearch && matchFilter;
    });
  }, [devis, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      acceptedTotal: devis.filter(d => d.status === 'accepted').reduce((acc, curr) => acc + curr.amount, 0),
      pendingTotal: devis.filter(d => d.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0),
    };
  }, [devis]);

  const handleAddDevis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevis.client || !newDevis.amount) return;
    
    setDevis([{
      id: `DEV-2026-0${devis.length + 50}`,
      event: newDevis.event || "Nouvel Événement",
      client: newDevis.client,
      date: new Date().toLocaleDateString('fr-FR', {day: '2-digit', month: 'short', year: 'numeric'}),
      amount: parseInt(newDevis.amount.replace(/\D/g, '')) || 0,
      status: "draft"
    }, ...devis]);
    
    setIsAddDevisOpen(false);
    setNewDevis({ client: "", event: "", amount: "" });
  };

  const executeAction = () => {
    if (!confirmAction) return;
    
    let newStatus = "";
    if (confirmAction.type === 'send') newStatus = 'pending';
    if (confirmAction.type === 'accept') newStatus = 'accepted';
    if (confirmAction.type === 'reject') newStatus = 'rejected';
    
    setDevis(devis.map(d => d.id === confirmAction.id ? { ...d, status: newStatus } : d));
    setConfirmAction(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Devis & Facturation</h1>
          <p className="text-gray-500 text-sm">Gérez vos propositions commerciales et suivez vos revenus.</p>
        </div>
        <button onClick={() => setIsAddDevisOpen(true)} className="flex items-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-colors">
          <Plus size={16} /> Créer un devis
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Devis Acceptés</p>
          <h3 className="text-2xl font-bold text-gray-900">{formatMoney(stats.acceptedTotal)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">En attente de réponse</p>
          <h3 className="text-2xl font-bold text-[#B8860B]">{formatMoney(stats.pendingTotal)}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher un devis..." 
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} 
              className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Filter size={16} /> 
              {statusFilter === 'all' ? 'Tous les statuts' : 
               statusFilter === 'accepted' ? 'Acceptés' :
               statusFilter === 'pending' ? 'Envoyés' :
               statusFilter === 'draft' ? 'Brouillons' : 'Refusés'}
              <ChevronDown size={14} className="ml-1 text-gray-400" />
            </button>
            
            {isFilterMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20 animate-in fade-in slide-in-from-top-2">
                <button onClick={() => {setStatusFilter('all'); setIsFilterMenuOpen(false);}} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Tous les statuts</button>
                <button onClick={() => {setStatusFilter('accepted'); setIsFilterMenuOpen(false);}} className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50">Acceptés</button>
                <button onClick={() => {setStatusFilter('pending'); setIsFilterMenuOpen(false);}} className="w-full text-left px-4 py-2 text-sm text-amber-700 hover:bg-amber-50">Envoyés (En attente)</button>
                <button onClick={() => {setStatusFilter('draft'); setIsFilterMenuOpen(false);}} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Brouillons</button>
                <button onClick={() => {setStatusFilter('rejected'); setIsFilterMenuOpen(false);}} className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50">Refusés</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-gray-500 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-medium">N° Devis</th>
                <th className="px-6 py-4 font-medium">Événement & Client</th>
                <th className="px-6 py-4 font-medium">Date d'émission</th>
                <th className="px-6 py-4 font-medium">Montant TTC</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDevis.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{d.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{d.event}</div>
                    <div className="text-xs text-gray-500">{d.client}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{d.date}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{formatMoney(d.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      d.status === 'accepted' ? 'bg-green-50 text-green-700' : 
                      d.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                      d.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {d.status === 'accepted' && <CheckCircle size={12} />}
                      {d.status === 'pending' && <Clock size={12} />}
                      {d.status === 'draft' && <FileText size={12} />}
                      {d.status === 'rejected' && <XCircle size={12} />}
                      
                      {d.status === 'accepted' ? 'Accepté' : 
                       d.status === 'pending' ? 'Envoyé' : 
                       d.status === 'draft' ? 'Brouillon' : 'Refusé'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {d.status === 'draft' && (
                        <button onClick={() => setConfirmAction({ id: d.id, type: 'send' })} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors" title="Envoyer au client">
                          <Send size={16} />
                        </button>
                      )}
                      {d.status === 'pending' && (
                        <>
                          <button onClick={() => setConfirmAction({ id: d.id, type: 'accept' })} className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded transition-colors" title="Marquer comme accepté">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => setConfirmAction({ id: d.id, type: 'reject' })} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors" title="Marquer comme refusé">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      <button className="p-1.5 text-gray-500 hover:text-black bg-gray-100 hover:bg-gray-200 rounded transition-colors" title="Voir le PDF">
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredDevis.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucun devis trouvé pour ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout de devis */}
      <Modal isOpen={isAddDevisOpen} onClose={() => setIsAddDevisOpen(false)} title="Créer un nouveau devis" maxWidth="md">
        <form onSubmit={handleAddDevis} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Client</label>
            <input 
              type="text" required
              placeholder="Nom du client" 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
              value={newDevis.client} onChange={e => setNewDevis({...newDevis, client: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'événement</label>
            <input 
              type="text" required
              placeholder="Ex: Mariage Ndeye & Modou" 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
              value={newDevis.event} onChange={e => setNewDevis({...newDevis, event: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Montant TTC estimé (FCFA)</label>
            <input 
              type="number" required min="0" step="1000"
              placeholder="500000" 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none font-mono"
              value={newDevis.amount} onChange={e => setNewDevis({...newDevis, amount: e.target.value})}
            />
          </div>
          
          <div className="pt-4 mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddDevisOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black">
              Annuler
            </button>
            <button type="submit" className="px-5 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-900 transition-colors shadow-lg">
              Générer le devis (Brouillon)
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmation d'action */}
      <Modal isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} title="Confirmation" maxWidth="sm">
        <div className="space-y-6">
          <p className="text-sm text-gray-700">
            {confirmAction?.type === 'send' && "Voulez-vous vraiment envoyer ce devis au client ? Le statut passera à 'Envoyé'."}
            {confirmAction?.type === 'accept' && "Confirmez-vous l'acceptation de ce devis par le client ?"}
            {confirmAction?.type === 'reject' && "Voulez-vous marquer ce devis comme refusé ?"}
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setConfirmAction(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Annuler
            </button>
            <button onClick={executeAction} className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${
              confirmAction?.type === 'send' ? 'bg-blue-600 hover:bg-blue-700' :
              confirmAction?.type === 'accept' ? 'bg-green-600 hover:bg-green-700' :
              'bg-red-600 hover:bg-red-700'
            }`}>
              Confirmer
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
