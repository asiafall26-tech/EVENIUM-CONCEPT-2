"use client";

import { useState } from "react";
import { Search, Mail, MailOpen, Star, MoreVertical, PenSquare, ArrowLeft, Send } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export default function AdminMessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("all");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  const messages = [
    { id: 1, sender: "Mamadou Diop", email: "m.diop@traiteur.sn", subject: "Demande de partenariat", preview: "Bonjour, je suis traiteur et j'aimerais intégrer votre annuaire...", content: "Bonjour l'équipe Evenium,\n\nJe suis gérant de Saveurs d'Afrique, un service traiteur basé à Dakar. J'ai entendu parler de votre plateforme et je souhaiterais savoir comment faire pour être référencé parmi vos prestataires partenaires.\n\nQuelles sont les conditions tarifaires et les documents à fournir ?\n\nMerci d'avance,\nMamadou Diop", time: "10:42", read: false, starred: true },
    { id: 2, sender: "Système Evenium", email: "no-reply@evenium.com", subject: "Nouveau paiement reçu (TRX-9823)", preview: "Un paiement de 20 000 FCFA a été validé pour l'événement...", content: "Paiement confirmé.\nTransaction ID: TRX-9823\nMontant: 20 000 FCFA\nClient: Ndeye Astou\nProduit: Invitations Animées", time: "Hier", read: true, starred: false },
    { id: 3, sender: "Fatou Sow", email: "fatou.sow99@gmail.com", subject: "Problème avec mes invitations", preview: "Je n'arrive pas à télécharger le QR code pour mes invités...", content: "Bonjour,\nJe vous contacte car je rencontre un problème technique. Lorsque j'essaie de télécharger les QR codes pour mes invités depuis mon tableau de bord, le bouton tourne dans le vide et rien ne se passe.\n\nPouvez-vous m'aider urgemment ? Mon événement est dans 3 jours !\n\nCordialement,\nFatou.", time: "15 Sept", read: true, starred: false },
  ];

  const handleSendBroadcast = () => {
    console.log(`Sending to: ${composeTo}, Subject: ${composeSubject}`);
    setIsComposeOpen(false);
    setComposeSubject("");
    setComposeBody("");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full h-[calc(100vh-80px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 shrink-0">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Messages</h1>
          <p className="text-gray-500 text-sm">Boîte de réception et communications globales.</p>
        </div>
        <button 
          onClick={() => setIsComposeOpen(true)}
          className="flex items-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-colors"
        >
          <PenSquare size={16} /> Nouveau message
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex overflow-hidden">
        {/* Sidebar messages */}
        <div className={`w-64 border-r border-gray-100 bg-gray-50 shrink-0 ${selectedMessage ? 'hidden lg:block' : 'hidden md:block'}`}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Dossiers</h3>
            <div className="space-y-1">
              <button className="w-full flex items-center justify-between px-3 py-2 bg-white text-[#B8860B] font-medium rounded-lg border border-[#D4AF37]/30 shadow-sm text-sm">
                <span>Boîte de réception</span>
                <span className="bg-[#D4AF37] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">1</span>
              </button>
              <button className="w-full flex items-center text-gray-600 hover:bg-gray-100 font-medium rounded-lg px-3 py-2 text-sm transition-colors">
                Messages envoyés
              </button>
              <button className="w-full flex items-center text-gray-600 hover:bg-gray-100 font-medium rounded-lg px-3 py-2 text-sm transition-colors">
                Favoris
              </button>
            </div>
          </div>
        </div>

        {/* Inbox list */}
        <div className={`flex-1 flex flex-col border-r border-gray-100 ${selectedMessage ? 'hidden md:flex md:w-1/2 lg:w-1/3 shrink-0' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher un message..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                onClick={() => setSelectedMessage(msg)}
                className={`flex flex-col gap-1 p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedMessage?.id === msg.id ? 'bg-[#F9F5EC] border-l-2 border-l-[#D4AF37]' : 
                  msg.read ? 'bg-white hover:bg-gray-50' : 'bg-[#F9F5EC]/30 hover:bg-[#F9F5EC]/60'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {!msg.read && <div className="w-2 h-2 rounded-full bg-[#B8860B]" />}
                    <span className={`font-medium text-sm truncate ${!msg.read ? 'text-black' : 'text-gray-900'}`}>{msg.sender}</span>
                  </div>
                  <span className="text-xs text-gray-500">{msg.time}</span>
                </div>
                <div className={`text-sm truncate ${!msg.read ? 'font-semibold text-black' : 'text-gray-700'}`}>
                  {msg.subject}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {msg.preview}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Detail / Chat View */}
        {selectedMessage ? (
          <div className="flex-1 flex flex-col bg-white">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="md:hidden p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-serif font-bold text-gray-600">
                  {selectedMessage.sender.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 leading-tight">{selectedMessage.sender}</h2>
                  <p className="text-xs text-gray-500">{selectedMessage.email}</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-black mb-4">{selectedMessage.subject}</h3>
                <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
                  {selectedMessage.content}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[#D4AF37] focus-within:border-[#D4AF37] transition-shadow">
                <textarea 
                  className="w-full p-4 text-sm focus:outline-none resize-none"
                  rows={3}
                  placeholder="Écrivez votre réponse ici..."
                />
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button className="flex items-center gap-2 bg-[#111] hover:bg-black text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                    <Send size={14} /> Envoyer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8 bg-gray-50/50">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <Mail size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun message sélectionné</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Sélectionnez un message dans la liste à gauche pour le lire ou y répondre.
            </p>
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      <Modal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} title="Nouvelle communication globale" maxWidth="lg">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSendBroadcast(); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destinataires</label>
            <select 
              value={composeTo}
              onChange={(e) => setComposeTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            >
              <option value="all">Tous les utilisateurs et prestataires</option>
              <option value="organizers">Uniquement les organisateurs (Clients)</option>
              <option value="providers">Uniquement les prestataires</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sujet de l'email</label>
            <input 
              type="text" 
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" 
              placeholder="Ex: Maintenance prévue ce week-end"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea 
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none"
              rows={8}
              placeholder="Rédigez votre message ici..."
              required
            />
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsComposeOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors">
              Annuler
            </button>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-[#B8860B] text-white text-sm font-medium rounded-lg hover:bg-[#996B00] transition-colors">
              <Send size={16} /> Envoyer à tous
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
