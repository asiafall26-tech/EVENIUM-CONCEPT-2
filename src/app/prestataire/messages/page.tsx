"use client";

import { Search, Mail, MailOpen, PenSquare, X, Send } from "lucide-react";
import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal"; // Assuming this exists

export default function PrestataireMessagesPage() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "Ndeye Astou", event: "Mariage Astou & Ali", subject: "Précisions sur le devis", preview: "Bonjour, pourriez-vous inclure le menu végétarien...", time: "10:42", read: false },
    { id: 2, sender: "Ousmane Diallo", event: "Dîner de Gala", subject: "Confirmation de disponibilité", preview: "Super, nous validons la date du 15 Novembre...", time: "Hier", read: true },
    { id: 3, sender: "Fatou Sow", event: "Anniversaire Sophie", subject: "Question logistique", preview: "Avez-vous besoin d'accéder à la salle avant 16h ?", time: "12 Sept", read: true },
  ]);

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({ to: "", subject: "", body: "" });

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const matchFilter = filter === "all" || (filter === "unread" && !m.read);
      const matchSearch = m.sender.toLowerCase().includes(search.toLowerCase()) || m.event.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [messages, filter, search]);

  const toggleReadStatus = (id: number) => {
    setMessages(messages.map(m => m.id === id ? { ...m, read: !m.read } : m));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.to || !newMessage.body) return;
    
    // Simulate sending message
    alert(`Message envoyé à ${newMessage.to} !`);
    setIsComposeOpen(false);
    setNewMessage({ to: "", subject: "", body: "" });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full h-[calc(100vh-80px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 shrink-0">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Messages</h1>
          <p className="text-gray-500 text-sm">Échangez avec vos clients et les organisateurs d'événements.</p>
        </div>
        <button onClick={() => setIsComposeOpen(true)} className="flex items-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-colors">
          <PenSquare size={16} /> Nouveau message
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex overflow-hidden">
        {/* Sidebar messages */}
        <div className="w-64 border-r border-gray-100 hidden md:flex flex-col bg-gray-50 shrink-0">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Boîtes de réception</h3>
            <div className="space-y-1">
              <button onClick={() => setFilter("all")} className={`w-full flex items-center justify-between px-3 py-2 font-medium rounded-lg text-sm transition-colors ${filter === 'all' ? 'bg-white text-[#B8860B] border border-[#D4AF37]/30 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
                <span>Tous les messages</span>
                <span className={`${filter === 'all' ? 'bg-[#D4AF37] text-white' : 'bg-gray-200 text-gray-600'} text-[10px] font-bold px-2 py-0.5 rounded-full`}>{messages.length}</span>
              </button>
              <button onClick={() => setFilter("unread")} className={`w-full flex items-center justify-between font-medium rounded-lg px-3 py-2 text-sm transition-colors ${filter === 'unread' ? 'bg-white text-[#B8860B] border border-[#D4AF37]/30 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
                <span>Non lus</span>
                <span className={`${filter === 'unread' ? 'bg-[#D4AF37] text-white' : 'bg-gray-200 text-gray-600'} text-[10px] font-bold px-2 py-0.5 rounded-full`}>{messages.filter(m => !m.read).length}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Inbox list */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher par nom, événement..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                <MailOpen size={48} className="opacity-20" />
                <p>Aucun message trouvé.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div key={msg.id} onClick={() => toggleReadStatus(msg.id)} className={`flex items-start gap-4 p-5 border-b border-gray-100 cursor-pointer transition-colors ${msg.read ? 'bg-white hover:bg-gray-50' : 'bg-[#F9F5EC]/30 hover:bg-[#F9F5EC]/70'}`}>
                  <div className="pt-1 text-gray-400">
                    {msg.read ? <MailOpen size={18} /> : <Mail size={18} className="text-[#B8860B]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`font-semibold text-sm truncate ${!msg.read ? 'text-black' : 'text-gray-900'}`}>{msg.sender}</span>
                        <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full shrink-0">{msg.event}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium shrink-0 ml-2">{msg.time}</span>
                    </div>
                    <h4 className={`text-sm mb-1 truncate ${!msg.read ? 'font-bold text-black' : 'font-medium text-gray-800'}`}>{msg.subject}</h4>
                    <p className={`text-sm truncate ${!msg.read ? 'text-gray-700' : 'text-gray-500'}`}>{msg.preview}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Nouveau Message */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">Nouveau message</h3>
              <button onClick={() => setIsComposeOpen(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              <div>
                <input 
                  type="text" required placeholder="À : (Nom du client ou organisateur)" 
                  className="w-full px-0 py-2 border-b border-gray-200 text-sm focus:outline-none focus:border-[#D4AF37]"
                  value={newMessage.to} onChange={e => setNewMessage({...newMessage, to: e.target.value})}
                />
              </div>
              <div>
                <input 
                  type="text" placeholder="Objet" 
                  className="w-full px-0 py-2 border-b border-gray-200 text-sm focus:outline-none font-semibold focus:border-[#D4AF37]"
                  value={newMessage.subject} onChange={e => setNewMessage({...newMessage, subject: e.target.value})}
                />
              </div>
              <div>
                <textarea 
                  rows={8} required placeholder="Rédigez votre message ici..." 
                  className="w-full px-0 py-4 text-sm focus:outline-none resize-none"
                  value={newMessage.body} onChange={e => setNewMessage({...newMessage, body: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-[#B8860B] text-white text-sm font-semibold rounded-lg hover:bg-[#996B00] transition-colors shadow-md">
                  <Send size={16} /> Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
