"use client";

import { Search, Mail, MailOpen, PenSquare, X, Send } from "lucide-react";
import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal"; // Assuming this exists

export default function PrestataireMessagesPage() {
  const conversations = [
    { 
      id: "1", 
      clientName: "Ndeye Astou", 
      eventName: "Mariage Astou & Ali",
      status: "En ligne", 
      avatar: "NA", 
      unread: 1, 
      lastMessage: "Bonjour, pourriez-vous inclure le menu végétarien...",
      time: "10:42"
    },
    { 
      id: "2", 
      clientName: "Ousmane Diallo", 
      eventName: "Dîner de Gala",
      status: "Hors ligne", 
      avatar: "OD", 
      unread: 0, 
      lastMessage: "Super, nous validons la date du 15 Novembre...",
      time: "Hier"
    },
    { 
      id: "3", 
      clientName: "Fatou Sow", 
      eventName: "Anniversaire Sophie",
      status: "Hors ligne", 
      avatar: "FS", 
      unread: 0, 
      lastMessage: "Avez-vous besoin d'accéder à la salle avant 16h ?",
      time: "12 Sept"
    },
  ];

  const [selectedConv, setSelectedConv] = useState(conversations[0]);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");

  const [chats, setChats] = useState<Record<string, any[]>>({
    "1": [
      { id: 1, sender: "client", text: "Bonjour, nous aimerions confirmer le menu pour 100 personnes.", time: "10:30", date: "Aujourd'hui" },
      { id: 2, sender: "me", text: "Bonjour Ndeye ! C'est noté. Avez-vous des restrictions alimentaires ?", time: "10:35", date: "Aujourd'hui" },
      { id: 3, sender: "client", text: "Bonjour, pourriez-vous inclure le menu végétarien...", time: "10:42", date: "Aujourd'hui" }
    ],
    "2": [
      { id: 1, sender: "me", text: "Bonjour Ousmane, la salle est bien pré-réservée.", time: "Hier", date: "Hier" },
      { id: 2, sender: "client", text: "Super, nous validons la date du 15 Novembre...", time: "Hier", date: "Hier" },
    ],
    "3": [
      { id: 1, sender: "client", text: "Avez-vous besoin d'accéder à la salle avant 16h ?", time: "12 Sept", date: "12 Sept" }
    ]
  });

  const chatHistory = chats[selectedConv.id] || [];

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      sender: "me",
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: "Aujourd'hui"
    };
    
    setChats({
      ...chats,
      [selectedConv.id]: [...(chats[selectedConv.id] || []), newMessage]
    });
    
    setMessageText("");
  };

  const filteredConvs = conversations.filter(c => 
    c.clientName.toLowerCase().includes(search.toLowerCase()) || 
    c.eventName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto w-full h-[calc(100vh-80px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 shrink-0">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Messages</h1>
          <p className="text-gray-500 text-sm">Échangez en direct avec vos clients et organisateurs.</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex overflow-hidden">
        {/* Sidebar Contacts */}
        <div className="w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
          <div className="p-4 border-b border-gray-100 bg-white space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher un client..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map((c) => (
              <div 
                key={c.id}
                onClick={() => setSelectedConv(c)}
                className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-l-4 ${
                  selectedConv.id === c.id 
                    ? 'bg-white border-[#B8860B] shadow-[0_2px_10px_rgb(0,0,0,0.02)]' 
                    : 'border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-serif font-bold text-gray-600 shrink-0">
                    {c.avatar}
                  </div>
                  {c.status === "En ligne" && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900 text-sm truncate pr-2">{c.clientName}</h4>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">{c.time}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F9F5EC] text-[#B8860B] rounded-md truncate max-w-[100px]">
                      {c.eventName}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${c.unread > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                    {c.lastMessage}
                  </p>
                </div>
                {c.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-white flex items-center justify-center text-[10px] font-bold mt-2 shrink-0">
                    {c.unread}
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
                {selectedConv.avatar}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  {selectedConv.clientName}
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Événement : <span className="text-[#B8860B]">{selectedConv.eventName}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F9F9F9] space-y-6 flex flex-col">
            <div className="flex justify-center">
              <span className="px-3 py-1 bg-gray-200/60 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Aujourd'hui
              </span>
            </div>

            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                  msg.sender === 'me' 
                    ? 'bg-[#B8860B] text-white rounded-tr-sm shadow-md' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] text-gray-400 font-medium">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-end gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-[#D4AF37]/50 focus-within:ring-1 focus-within:ring-[#D4AF37]/50 transition-all">
              <textarea 
                placeholder="Écrivez votre message..." 
                className="flex-1 max-h-32 bg-transparent border-none focus:outline-none resize-none py-3 px-4 text-sm text-gray-800"
                rows={1}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button 
                onClick={handleSendMessage}
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
