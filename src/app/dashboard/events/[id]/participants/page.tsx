"use client";

import { Users, Plus, Search, MoreHorizontal, Mail, CheckCircle, Clock, XCircle, ChevronDown, ArrowRight, Edit2, Trash2, X, FileText, User } from "lucide-react";
import Link from "next/link";
import { use, useState, useMemo } from "react";
import { mockEvents } from "@/data/mock/events";
import { notFound } from "next/navigation";

export default function ParticipantsDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    notFound();
  }
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParticipantId, setEditingParticipantId] = useState<number | null>(null);

  const [newParticipant, setNewParticipant] = useState({
    name: "",
    phone: "",
    email: "",
    group: "Famille",
    status: "En attente"
  });

  const [participants, setParticipants] = useState([
    { id: 1, name: "Fatou Diop", phone: "+221 77 123 45 67", email: "fatou@mail.com", group: "Famille", status: "Confirmé", dateSent: "21 sept. 2026" },
    { id: 2, name: "Ousmane Fall", phone: "+221 77 987 65 43", email: "ousmane@mail.com", group: "Amis", status: "En attente", dateSent: "21 sept. 2026" },
    { id: 3, name: "Aïssatou Ndiaye", phone: "+221 76 555 44 33", email: "aissa@mail.com", group: "Famille", status: "Confirmé", dateSent: "20 sept. 2026" },
    { id: 4, name: "Mamadou Sy", phone: "+221 70 111 22 33", email: "m.sy@mail.com", group: "Amis", status: "Refusé", dateSent: "20 sept. 2026" },
    { id: 5, name: "Coumba Kane", phone: "+221 78 444 55 66", email: "coumba@mail.com", group: "Collègues", status: "Confirmé", dateSent: "19 sept. 2026" },
  ]);

  const stats = useMemo(() => {
    const total = participants.length;
    const confirmed = participants.filter(p => p.status === "Confirmé").length;
    const pending = participants.filter(p => p.status === "En attente").length;
    const refused = participants.filter(p => p.status === "Refusé").length;

    const confirmedPct = total > 0 ? Math.round((confirmed / total) * 100) : 0;
    const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
    const refusedPct = total > 0 ? Math.round((refused / total) * 100) : 0;

    return { total, confirmed, pending, refused, confirmedPct, pendingPct, refusedPct };
  }, [participants]);

  const getStatusStyle = (status: string) => {
    switch(status) {
      case "Confirmé": return "bg-[#E8F5E9] text-[#2E7D32]";
      case "En attente": return "bg-[#FFF8E1] text-[#F57F17]";
      case "Refusé": return "bg-[#FFEBEE] text-[#C62828]";
      case "Non ouverte": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const openAddModal = () => {
    setEditingParticipantId(null);
    setNewParticipant({ name: "", phone: "", email: "", group: "Famille", status: "En attente" });
    setIsModalOpen(true);
  };

  const openEditModal = (p: typeof participants[0]) => {
    setEditingParticipantId(p.id);
    setNewParticipant({
      name: p.name,
      phone: p.phone,
      email: p.email,
      group: p.group,
      status: p.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce participant ?")) {
      setParticipants(participants.filter(p => p.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipant.name) return;

    if (editingParticipantId) {
      setParticipants(participants.map(p => 
        p.id === editingParticipantId 
          ? { ...p, ...newParticipant } 
          : p
      ));
    } else {
      const p = {
        id: Date.now(),
        ...newParticipant,
        dateSent: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      setParticipants([p, ...participants]);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="text-xs text-gray-500 font-medium mb-6 flex items-center gap-2">
        <span>Événement</span> <span className="text-gray-300">&gt;</span> <span className="text-black">Participants & Invitations</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Suivi des Participants</h1>
          <p className="text-gray-500 text-sm">Gérez la liste de vos invités et suivez l'historique des réponses (RSVP).</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Mail size={16} /> Relancer les indécis
          </button>
          <button onClick={openAddModal} className="flex items-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-[#B8860B]/20 transition-colors">
            <Plus size={16} /> Ajouter un invité
          </button>
        </div>
      </div>

      {/* Stats Cards & Donut Chart (RSVP Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Quick Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-2 text-gray-600">
              <Users size={18} />
              <h3 className="font-medium text-sm">Total Invités</h3>
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-2 text-green-600">
              <CheckCircle size={18} />
              <h3 className="font-medium text-sm">Confirmés</h3>
            </div>
            <p className="text-3xl font-bold text-green-700">{stats.confirmed}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-2 text-amber-500">
              <Clock size={18} />
              <h3 className="font-medium text-sm">En attente</h3>
            </div>
            <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-2 text-red-500">
              <XCircle size={18} />
              <h3 className="font-medium text-sm">Refusés</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.refused}</p>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col justify-center">
          <h2 className="font-semibold text-lg text-black mb-4">Statut des réponses</h2>
          <div className="flex flex-col items-center justify-center">
            {stats.total > 0 ? (
              <div className="relative w-32 h-32 rounded-full flex items-center justify-center" 
                   style={{
                     background: `conic-gradient(
                       #2E7D32 0% ${stats.confirmedPct}%, 
                       #F57F17 ${stats.confirmedPct}% ${stats.confirmedPct + stats.pendingPct}%, 
                       #C62828 ${stats.confirmedPct + stats.pendingPct}% 100%
                     )`
                   }}>
                <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
                  <span className="text-xl font-bold">{stats.confirmedPct}%</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">Confirmés</span>
                </div>
              </div>
            ) : (
              <div className="relative w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Vide</span>
              </div>
            )}
            
            <div className="mt-6 w-full space-y-2 px-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#2E7D32]" /> <span className="text-gray-600 font-medium">Confirmés</span></div>
                <span className="font-bold text-gray-900">{stats.confirmed}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#F57F17]" /> <span className="text-gray-600 font-medium">En attente</span></div>
                <span className="font-bold text-gray-900">{stats.pending}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#C62828]" /> <span className="text-gray-600 font-medium">Refusés</span></div>
                <span className="font-bold text-gray-900">{stats.refused}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Participants & Invitations History Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center bg-gray-50/50 gap-4">
          <h2 className="font-semibold text-lg text-black">Historique des invitations envoyées</h2>
          <div className="flex gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Rechercher un invité..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent" />
            </div>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]">
              <option>Tous les statuts</option>
              <option>Confirmé</option>
              <option>En attente</option>
              <option>Refusé</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-semibold tracking-wider uppercase bg-white">
                <th className="py-4 px-6 font-medium">Invité</th>
                <th className="py-4 px-6 font-medium">Contact (Email/Tel)</th>
                <th className="py-4 px-6 font-medium">Groupe</th>
                <th className="py-4 px-6 font-medium">Date d'envoi</th>
                <th className="py-4 px-6 font-medium">Statut RSVP</th>
                <th className="py-4 px-6 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Aucun participant enregistré.</td>
                </tr>
              ) : (
                participants.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors bg-white group">
                    <td className="py-4 px-6 font-medium text-gray-900">{p.name}</td>
                    <td className="py-4 px-6 text-gray-500">
                      <div className="flex flex-col">
                        <span>{p.email}</span>
                        <span className="text-xs text-gray-400">{p.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
                        {p.group}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-medium">{p.dateSent}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(p.status)}`}>
                        {p.status === "Confirmé" && <CheckCircle size={12} />}
                        {p.status === "En attente" && <Clock size={12} />}
                        {p.status === "Refusé" && <XCircle size={12} />}
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(p)} className="p-1.5 text-gray-500 hover:text-[#B8860B] hover:bg-[#F9F5EC] rounded-md transition-colors shadow-sm bg-white border border-gray-200" title="Modifier">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shadow-sm bg-white border border-gray-200" title="Supprimer">
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
        
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 text-sm text-gray-500">
          <span>Affichage de {participants.length} invité(s)</span>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-xl text-gray-900">
                {editingParticipantId ? "Modifier le participant" : "Ajouter un participant"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black transition-colors bg-white rounded-full p-1 shadow-sm border border-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><User size={14}/> Nom complet</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Amadou Diallo" 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                  value={newParticipant.name}
                  onChange={(e) => setNewParticipant({...newParticipant, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input 
                    type="email" 
                    placeholder="Ex: email@domaine.com" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                    value={newParticipant.email}
                    onChange={(e) => setNewParticipant({...newParticipant, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                  <input 
                    type="tel" 
                    placeholder="Ex: +221 77..." 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                    value={newParticipant.phone}
                    onChange={(e) => setNewParticipant({...newParticipant, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Groupe</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                    value={newParticipant.group}
                    onChange={(e) => setNewParticipant({...newParticipant, group: e.target.value})}
                  >
                    <option value="Famille">Famille</option>
                    <option value="Amis">Amis</option>
                    <option value="Collègues">Collègues</option>
                    <option value="VIP">VIP</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut RSVP</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 font-semibold"
                    value={newParticipant.status}
                    onChange={(e) => setNewParticipant({...newParticipant, status: e.target.value})}
                  >
                    <option value="En attente" className="text-amber-700">En attente</option>
                    <option value="Confirmé" className="text-green-700">Confirmé</option>
                    <option value="Refusé" className="text-red-700">Refusé</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl text-sm font-bold transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-black text-white hover:bg-gray-900 px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/10 transition-colors"
                >
                  {editingParticipantId ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
