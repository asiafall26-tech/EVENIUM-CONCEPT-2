"use client";

import { useState } from "react";
import { Search, Filter, MessageSquare, AlertCircle, CheckCircle2, X, Send } from "lucide-react";

export default function AdminSupportPage() {
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const tickets = [
    { id: "T-1042", user: "Mamadou Diop", subject: "Problème avec le paiement par Wave", status: "open", priority: "high", date: "Il y a 2h", messages: [
      { sender: "Mamadou Diop", role: "user", time: "Il y a 2h", text: "Bonjour, j'essaie de payer mon abonnement Gold avec Wave mais ça m'affiche une erreur 500." }
    ]},
    { id: "T-1041", user: "Fatou Sow", subject: "Comment ajouter un prestataire externe ?", status: "pending", priority: "medium", date: "Hier", messages: [
      { sender: "Fatou Sow", role: "user", time: "Hier 14:00", text: "J'aimerais ajouter un prestataire qui n'est pas sur votre liste." },
      { sender: "Support Evenium", role: "admin", time: "Hier 16:30", text: "Bonjour Fatou, vous pouvez le faire depuis la page de l'événement en cliquant sur 'Ajouter un invité spécial' ou nous envoyer ses coordonnées." }
    ]},
    { id: "T-1040", user: "Ndeye Astou", subject: "Changement de formule Premium vers Gold", status: "closed", priority: "low", date: "15 Sept", messages: [
      { sender: "Ndeye Astou", role: "user", time: "15 Sept", text: "Je veux passer de Premium à Gold, comment on fait ?" },
      { sender: "Support Evenium", role: "admin", time: "15 Sept", text: "Bonjour, nous avons effectué le changement pour vous. Cordialement." }
    ]},
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Support & Tickets</h1>
          <p className="text-gray-500 text-sm">Gérez les demandes d'assistance des utilisateurs.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tickets ouverts</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">En attente de réponse</p>
            <p className="text-2xl font-bold text-gray-900">5</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Résolus ce mois</p>
            <p className="text-2xl font-bold text-gray-900">148</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">ID Ticket</th>
              <th className="px-6 py-4 font-medium">Utilisateur</th>
              <th className="px-6 py-4 font-medium w-full">Sujet</th>
              <th className="px-6 py-4 font-medium">Priorité</th>
              <th className="px-6 py-4 font-medium">Statut</th>
              <th className="px-6 py-4 font-medium">Création</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.map((t) => (
              <tr 
                key={t.id} 
                onClick={() => setSelectedTicket(t)}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{t.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{t.user}</td>
                <td className="px-6 py-4 text-gray-600 truncate max-w-md">{t.subject}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    t.priority === 'high' ? 'bg-red-100 text-red-700' : 
                    t.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {t.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    t.status === 'open' ? 'bg-red-50 text-red-700' : 
                    t.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      t.status === 'open' ? 'bg-red-500' : 
                      t.status === 'pending' ? 'bg-amber-500' : 'bg-green-500'
                    }`} />
                    {t.status === 'open' ? 'Nouveau' : t.status === 'pending' ? 'En cours' : 'Résolu'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Overlay */}
      {selectedTicket && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm transition-opacity" 
          onClick={() => setSelectedTicket(null)}
        />
      )}

      {/* Ticket Detail Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          selectedTicket ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedTicket && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xs text-gray-500">{selectedTicket.id}</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedTicket.status === 'open' ? 'bg-red-100 text-red-700' : 
                    selectedTicket.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {selectedTicket.status === 'open' ? 'Nouveau' : selectedTicket.status === 'pending' ? 'En cours' : 'Résolu'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
              {selectedTicket.messages.map((msg: any, idx: number) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'admin' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-900">{msg.sender}</span>
                    <span className="text-xs text-gray-400">{msg.time}</span>
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[85%] text-sm ${
                    msg.role === 'admin' ? 'bg-[#111] text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[#D4AF37] focus-within:border-[#D4AF37]">
                <textarea 
                  className="w-full p-4 bg-transparent text-sm focus:outline-none resize-none"
                  rows={3}
                  placeholder="Écrivez votre réponse..."
                />
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-white">
                  <select className="text-sm border border-gray-200 rounded-md px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]">
                    <option>Marquer comme En cours</option>
                    <option>Marquer comme Résolu</option>
                  </select>
                  <button className="flex items-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
                    <Send size={14} /> Envoyer
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
