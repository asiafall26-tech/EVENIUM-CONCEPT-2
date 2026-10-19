"use client";

import { useState, useEffect } from "react";
import { LifeBuoy, Send, List, Plus, CheckCircle, Clock, MoreHorizontal } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/utils/supabase/client";
import { createSupportTicket, getUserSupportTickets } from "@/app/actions/support";

export function ContactSupportButton({ className = "" }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === "history") {
      fetchHistory();
    }
  }, [isOpen, activeTab]);

  const fetchHistory = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await getUserSupportTickets(user.id);
      setTickets(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Veuillez vous connecter pour contacter le support.");
      setIsSubmitting(false);
      return;
    }

    const result = await createSupportTicket(user.id, subject, message);
    
    setIsSubmitting(false);

    if (result.error) {
      alert("Erreur: " + result.error);
    } else {
      alert("Votre réclamation a été envoyée au support Evenium.");
      setSubject("");
      setMessage("");
      setActiveTab("history");
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'résolu':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">
            <CheckCircle size={10} /> Résolu
          </span>
        );
      case 'en attente':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
            <MoreHorizontal size={10} /> En attente
          </span>
        );
    }
  };

  return (
    <>
      <button 
        onClick={() => { setIsOpen(true); setActiveTab("new"); }}
        className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-sm w-full text-left text-gray-600 hover:bg-red-50 hover:text-red-600 ${className}`}
      >
        <LifeBuoy size={20} strokeWidth={1.5} />
        Support & Réclamations
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Support Evenium">
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-100 pb-2">
          <button 
            onClick={() => setActiveTab("new")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'new' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Plus size={16} /> Nouvelle demande
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <List size={16} /> Mes demandes
          </button>
        </div>

        {activeTab === "new" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Décrivez votre problème ou votre question. Notre équipe vous répondra dans les plus brefs délais et vous serez notifié dans votre messagerie.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sujet de la demande</label>
              <input 
                required
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#b8924a] outline-none" 
                placeholder="Ex: Problème de facturation, Question sur un événement..." 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#b8924a] outline-none min-h-[120px] resize-none" 
                placeholder="Détaillez votre problème ici..."
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                type="button" 
                onClick={() => setIsOpen(false)} 
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={16} /> Envoyer au support
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 min-h-[250px] max-h-[400px] overflow-y-auto pr-2">
            {loading ? (
              <p className="text-sm text-gray-500 text-center py-8">Chargement de votre historique...</p>
            ) : tickets.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Vous n'avez soumis aucune réclamation.</p>
            ) : (
              tickets.map(t => (
                <div key={t.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1 flex-1 pr-4">{t.subject}</h4>
                    {getStatusBadge(t.status)}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{new Date(t.created_at).toLocaleDateString()} à {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{t.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
