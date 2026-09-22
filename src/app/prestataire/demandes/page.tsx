"use client";

import { MessageSquare, Calendar, Phone, Mail, CheckCircle2, XCircle, Clock, Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";

type DemandeStatus = "new" | "accepted" | "declined";

type Demande = {
  id: number;
  name: string;
  type: string;
  date: string;
  status: DemandeStatus;
  contact: { phone: string; email: string };
  msg: string;
};

export default function PrestataireDemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([
    { 
      id: 1, 
      name: "Astou & Ali", 
      type: "Mariage", 
      date: "20 Septembre 2026", 
      status: "new",
      contact: { phone: "+221 77 000 00 00", email: "astou@example.com" },
      msg: "Bonjour, nous adorons votre travail ! Nous organisons notre mariage à Dakar avec environ 150 invités. Seriez-vous disponible à cette date et quels seraient vos tarifs pour une couverture complète ?" 
    },
    { 
      id: 2, 
      name: "Sophie D.", 
      type: "Anniversaire", 
      date: "10 Octobre 2026", 
      status: "accepted",
      contact: { phone: "+221 76 111 11 11", email: "sophie@example.com" },
      msg: "Quels sont vos tarifs pour un anniversaire à Saly (50 personnes) ? Juste besoin de 2h de présence." 
    },
    { 
      id: 3, 
      name: "Entreprise X", 
      type: "Gala", 
      date: "15 Novembre 2026", 
      status: "declined",
      contact: { phone: "+221 78 222 22 22", email: "contact@entreprise.com" },
      msg: "Nous cherchons un traiteur pour notre gala annuel." 
    }
  ]);

  const [filter, setFilter] = useState<"all" | "new" | "accepted">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number>(1);

  const filteredDemandes = useMemo(() => {
    return demandes.filter(d => {
      const matchFilter = filter === "all" || d.status === filter;
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.type.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [demandes, filter, search]);

  const selectedDemande = demandes.find(d => d.id === selectedId) || filteredDemandes[0];

  const handleUpdateStatus = (id: number, newStatus: DemandeStatus) => {
    setDemandes(demandes.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  const [replyText, setReplyText] = useState("");

  const handleReply = () => {
    if (!replyText.trim()) return;
    alert(`Message envoyé à ${selectedDemande?.name} : ${replyText}`);
    setReplyText("");
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-80px)] p-6 flex flex-col">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-black mb-1">Gestion des Demandes</h1>
        <p className="text-gray-500 text-sm">Répondez rapidement à vos prospects pour maximiser vos chances de conversion.</p>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex overflow-hidden min-h-0">
        {/* Liste des demandes (Sidebar) */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50/50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter("new")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${filter === 'new' ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Nouvelles ({demandes.filter(d => d.status === 'new').length})
              </button>
              <button 
                onClick={() => setFilter("accepted")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${filter === 'accepted' ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Acceptées
              </button>
              <button 
                onClick={() => setFilter("all")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${filter === 'all' ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Toutes
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredDemandes.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">Aucune demande trouvée.</div>
            ) : (
              filteredDemandes.map((d) => (
                <div 
                  key={d.id} 
                  onClick={() => setSelectedId(d.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors relative ${selectedDemande?.id === d.id ? 'bg-[#F9F5EC]' : 'bg-white hover:bg-gray-50'}`}
                >
                  {selectedDemande?.id === d.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]" />}
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-semibold text-sm truncate pr-2 ${selectedDemande?.id === d.id ? 'text-black' : 'text-gray-800'}`}>{d.name}</h4>
                    {d.status === 'new' && <span className="w-2 h-2 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0 shadow-sm shadow-[#D4AF37]/50" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-medium">{d.type}</span>
                    <span className="flex items-center gap-1"><Calendar size={10} /> {d.date}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{d.msg}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Détail de la demande (Main) */}
        {selectedDemande ? (
          <div className="w-2/3 flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/30">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-serif text-2xl font-bold text-black">{selectedDemande.name}</h2>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-md font-semibold">{selectedDemande.type}</span>
                  
                  {selectedDemande.status === 'new' && (
                    <span className="bg-amber-100 text-amber-700 border border-amber-200 text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                      <Clock size={12} /> Nouvelle Demande
                    </span>
                  )}
                  {selectedDemande.status === 'accepted' && (
                    <span className="bg-green-100 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Acceptée
                    </span>
                  )}
                  {selectedDemande.status === 'declined' && (
                    <span className="bg-red-100 text-red-700 border border-red-200 text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                      <XCircle size={12} /> Refusée
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-2 font-medium">
                  <Calendar size={14} className="text-[#D4AF37]"/> Événement prévu le {selectedDemande.date}
                </p>
              </div>
              
              <div className="flex gap-2">
                {selectedDemande.status !== 'declined' && (
                  <button onClick={() => handleUpdateStatus(selectedDemande.id, 'declined')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm">
                    Refuser
                  </button>
                )}
                {selectedDemande.status !== 'accepted' && (
                  <button onClick={() => handleUpdateStatus(selectedDemande.id, 'accepted')} className="flex items-center gap-2 px-4 py-2 bg-[#B8860B] hover:bg-[#996B00] text-white rounded-xl text-sm font-bold shadow-md shadow-[#B8860B]/20 transition-all">
                    <CheckCircle2 size={16} /> Accepter & Discuter
                  </button>
                )}
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Infos client */}
              {selectedDemande.status === 'accepted' ? (
                <div className="bg-[#F9F5EC] rounded-2xl p-5 mb-8 grid grid-cols-2 gap-4 border border-[#E8DCC4] shadow-sm">
                  <div>
                    <p className="text-[10px] text-[#B8860B] font-bold mb-1 uppercase tracking-wider">Téléphone</p>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2"><Phone size={14} className="text-[#B8860B]"/> {selectedDemande.contact.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#B8860B] font-bold mb-1 uppercase tracking-wider">Email</p>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2"><Mail size={14} className="text-[#B8860B]"/> {selectedDemande.contact.email}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-200 flex items-center justify-center text-center">
                  <p className="text-sm text-gray-500 font-medium">
                    Acceptez la demande pour accéder aux coordonnées complètes du client.
                  </p>
                </div>
              )}

              {/* Message Chat */}
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600 shadow-inner">
                    {selectedDemande.name.charAt(0)}
                  </div>
                  <div>
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl rounded-tl-none text-sm text-gray-800 leading-relaxed shadow-sm">
                      {selectedDemande.msg}
                    </div>
                    <span className="text-xs text-gray-400 mt-1.5 ml-1 block font-medium">Client • Il y a 2 heures</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="relative">
                <textarea 
                  rows={3} 
                  placeholder={selectedDemande.status === 'accepted' ? `Répondre à ${selectedDemande.name}...` : "Acceptez la demande pour pouvoir répondre au client."} 
                  className="w-full border border-gray-200 rounded-xl pl-4 pr-14 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 resize-none shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                  disabled={selectedDemande.status !== 'accepted'}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                ></textarea>
                <button 
                  onClick={handleReply}
                  disabled={selectedDemande.status !== 'accepted' || !replyText.trim()}
                  className="absolute bottom-4 right-4 p-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-2/3 flex items-center justify-center bg-gray-50">
            <p className="text-gray-400 text-sm">Sélectionnez une demande pour voir les détails.</p>
          </div>
        )}
      </div>
    </div>
  );
}
