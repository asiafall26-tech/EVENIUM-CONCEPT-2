"use client";

import { useState } from "react";
import { Search, Send, Phone, MoreVertical, Image as ImageIcon, Paperclip, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function EventMessagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Fake providers data
  const providers = [
    { id: "1", name: "Saveurs d'Afrique", role: "Traiteur", status: "En ligne", avatar: "SA", unread: 2, lastMessage: "Je vous envoie le menu révisé demain matin." },
    { id: "2", name: "Golden Decor", role: "Décoration", status: "Hors ligne", avatar: "GD", unread: 0, lastMessage: "Les nappes dorées ont bien été réservées." },
    { id: "3", name: "Studio Lumière", role: "Photographe", status: "Hors ligne", avatar: "SL", unread: 0, lastMessage: "Pouvez-vous confirmer l'heure d'arrivée ?" },
  ];

  const [selectedProvider, setSelectedProvider] = useState(providers[0]);
  const [messageText, setMessageText] = useState("");

  const chatHistory = [
    { sender: "provider", text: "Bonjour, nous faisons suite à votre demande de devis pour le dîner.", time: "10:30", date: "Aujourd'hui" },
    { sender: "me", text: "Bonjour ! Oui, je voulais m'assurer que le menu végétarien est bien pris en compte.", time: "10:45", date: "Aujourd'hui" },
    { sender: "provider", text: "Tout à fait, nous avons prévu 15 repas végétariens comme convenu.", time: "11:02", date: "Aujourd'hui" },
    { sender: "provider", text: "Je vous envoie le menu révisé demain matin.", time: "11:03", date: "Aujourd'hui" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full h-[calc(100vh-80px)] flex flex-col">
      <div className="text-xs text-gray-500 font-medium mb-6 flex items-center gap-2 shrink-0">
        <span>Événement</span> <span className="text-gray-300">&gt;</span> <span className="text-black">Messagerie Prestataires</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 shrink-0">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Messagerie</h1>
          <p className="text-gray-500 text-sm">Discutez en direct avec les prestataires de votre événement.</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex overflow-hidden">
        {/* Sidebar Contacts */}
        <div className="w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher un prestataire..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {providers.map((p) => (
              <div 
                key={p.id}
                onClick={() => setSelectedProvider(p)}
                className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-l-4 ${
                  selectedProvider.id === p.id 
                    ? 'bg-white border-[#B8860B] shadow-[0_2px_10px_rgb(0,0,0,0.02)]' 
                    : 'border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-serif font-bold text-gray-600">
                    {p.avatar}
                  </div>
                  {p.status === "En ligne" && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900 text-sm truncate pr-2">{p.name}</h4>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">11:03</span>
                  </div>
                  <p className="text-xs text-[#B8860B] font-semibold mb-1">{p.role}</p>
                  <p className={`text-xs truncate ${p.unread > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                    {p.lastMessage}
                  </p>
                </div>
                {p.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-white flex items-center justify-center text-[10px] font-bold">
                    {p.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 shrink-0 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-serif font-bold text-[#B8860B]">
                {selectedProvider.avatar}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedProvider.name}</h3>
                <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                  {selectedProvider.status === "En ligne" ? (
                    <><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> En ligne</>
                  ) : (
                    <span className="text-gray-400">Hors ligne</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <button className="p-2 hover:bg-gray-50 rounded-full transition-colors hover:text-[#B8860B]">
                <Phone size={20} />
              </button>
              <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F9F9F9] space-y-6">
            <div className="flex justify-center">
              <span className="px-3 py-1 bg-gray-200/60 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Aujourd'hui
              </span>
            </div>

            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                  msg.sender === 'me' 
                    ? 'bg-black text-white rounded-tr-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] text-gray-400 font-medium">{msg.time}</span>
                  {msg.sender === 'me' && <CheckCircle2 size={12} className="text-[#D4AF37]" />}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-end gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-[#D4AF37]/50 focus-within:ring-1 focus-within:ring-[#D4AF37]/50 transition-all">
              <div className="flex gap-1 pb-1 pl-1">
                <button className="p-2 text-gray-400 hover:text-[#B8860B] rounded-full hover:bg-gray-100 transition-colors">
                  <Paperclip size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-[#B8860B] rounded-full hover:bg-gray-100 transition-colors">
                  <ImageIcon size={20} />
                </button>
              </div>
              <textarea 
                placeholder="Écrivez votre message..." 
                className="flex-1 max-h-32 bg-transparent border-none focus:outline-none resize-none py-3 px-2 text-sm text-gray-800"
                rows={1}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button 
                className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                  messageText.trim().length > 0 
                    ? 'bg-[#B8860B] text-white shadow-md' 
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Send size={18} className={messageText.trim().length > 0 ? 'translate-x-0.5' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
