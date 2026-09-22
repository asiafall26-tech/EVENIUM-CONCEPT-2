"use client";

import { Send, Edit3, Eye, Sparkles, X, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export default function InvitationsDashboardPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  
  const [invitationData, setInvitationData] = useState({
    title: "Le Mariage de Sophie & Marc",
    date: "12 Octobre 2026",
    message: "Nous avons la joie de vous inviter à célébrer notre union..."
  });

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        setIsSendModalOpen(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full relative">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 font-medium mb-6 flex items-center gap-2">
        <span>Accueil</span> <span className="text-gray-300">&gt;</span> <span className="text-black">Invitations</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Invitations</h1>
          <p className="text-gray-500 text-sm">Personnalisez votre modèle d'invitation exclusif avant l'envoi.</p>
        </div>
        <button 
          onClick={() => setIsSendModalOpen(true)}
          className="flex items-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-[#B8860B]/20 transition-colors"
        >
          <Send size={16} /> Envoyer des invitations
        </button>
      </div>

      {/* Purchased Invitation Model */}
      <div className="bg-white p-8 rounded-3xl border border-[#D4AF37]/30 shadow-[0_4px_30px_-4px_rgba(212,175,55,0.15)] flex flex-col sm:flex-row gap-8 items-center sm:items-start relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#D4AF37] to-[#B8860B]"></div>
        
        <div className="w-full sm:w-64 aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative flex-shrink-0 border border-gray-200 shadow-md">
          {/* Placeholder for the invitation image */}
          <div className="w-full h-full bg-gradient-to-br from-[#F9F5EC] to-[#E8DCC4] flex items-center justify-center">
            <Sparkles size={48} className="text-[#D4AF37] opacity-60" />
          </div>
          <div className="absolute top-3 right-3 bg-[#B8860B] text-white px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Sparkles size={12} /> Modèle Premium
          </div>
        </div>
        
        <div className="flex-1 w-full py-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/20 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              ✓ Acheté
            </span>
          </div>
          
          <h2 className="font-serif text-3xl font-bold text-gray-900 mb-3">Floral Gold (Animée)</h2>
          
          <p className="text-gray-600 text-sm mb-8 max-w-2xl leading-relaxed">
            Ce modèle est actuellement utilisé pour votre événement. Vous disposez des droits complets pour le modifier. 
            Personnalisez la typographie, les textes, les couleurs, et ajoutez votre propre musique d'ambiance avant de l'envoyer à vos invités.
          </p>

          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="text-sm font-semibold mb-2">Aperçu du texte</h4>
            <p className="font-serif text-lg font-bold">{invitationData.title}</p>
            <p className="text-sm text-gray-500 mb-2">{invitationData.date}</p>
            <p className="text-sm italic">{invitationData.message}</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-black/10"
            >
              <Edit3 size={18} /> Personnaliser l'invitation
            </button>
            <button className="bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
              <Eye size={18} /> Voir l'aperçu complet
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-xl text-gray-900">Personnaliser le texte</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'invitation</label>
                <input 
                  type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  value={invitationData.title} onChange={e => setInvitationData({...invitationData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date affichée</label>
                <input 
                  type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  value={invitationData.date} onChange={e => setInvitationData({...invitationData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm h-32 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  value={invitationData.message} onChange={e => setInvitationData({...invitationData, message: e.target.value})}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="w-full bg-black text-white py-3 rounded-xl font-bold"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-center">
            {sendSuccess ? (
              <div className="p-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-green-600 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Invitations Envoyées !</h3>
                <p className="text-gray-500 mb-6">Vos invités recevront leur invitation par email et WhatsApp d'ici quelques minutes.</p>
              </div>
            ) : (
              <div className="p-8">
                <div className="w-20 h-20 bg-[#F9F5EC] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="text-[#B8860B] w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Envoyer à tous vos invités ?</h3>
                <p className="text-gray-500 text-sm mb-6">Vous vous apprêtez à envoyer cette invitation aux 150 personnes de votre liste d'invités (statut "En attente").</p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsSendModalOpen(false)}
                    disabled={isSending}
                    className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-bold"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleSend}
                    disabled={isSending}
                    className="flex-1 bg-[#B8860B] text-white hover:bg-[#996B00] py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    {isSending ? <Loader2 size={18} className="animate-spin" /> : "Confirmer l'envoi"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
