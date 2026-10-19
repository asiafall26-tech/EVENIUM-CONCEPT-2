"use client";

import { Calendar, MapPin, Users, Clock, Filter, Eye, MessageCircle, FileText, CheckCircle, ArrowLeft, Send, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { getMessagesForUser, sendMessage } from "@/app/actions/messages";
import Link from "next/link";

export default function PrestataireEvenementsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  
  // Direct chat inside event modal
  const [isChatMode, setIsChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    // 1. Demandes confirmées
    const { data: demandesConfirmed } = await supabase
      .from('demandes_devis')
      .select('*, events(*)')
      .eq('prestataire_id', user.id)
      .eq('status', 'Confirmé');

    // 2. Devis acceptés directement
    const { data: devisConfirmed } = await supabase
      .from('devis')
      .select('*, events(*)')
      .eq('prestataire_id', user.id)
      .eq('status', 'Accepté');

    const formattedEvents: any[] = [];
    const seenEventIds = new Set<string>();

    const devisByEvent: Record<string, any> = {};
    if (devisConfirmed) {
      devisConfirmed.forEach(dev => {
        if (dev.event_id) {
          devisByEvent[dev.event_id] = dev;
        }
      });
    }

    if (demandesConfirmed) {
      demandesConfirmed.forEach(d => {
        if (!d.events || !d.events.id) return;
        seenEventIds.add(d.events.id);
        const relatedDevis = devisByEvent[d.events.id];
        const clientId = d.events.client_id || relatedDevis?.client_id || d.client_id;
        formattedEvents.push({
          ...d.events,
          clientName: d.client_name || d.events?.name || 'Client Inconnu',
          clientId: clientId,
          client_id: clientId,
          demande_id: d.id,
          budget_final: relatedDevis?.total || d.budget_indicatif || d.budget_propose
        });
      });
    }

    if (devisConfirmed) {
      devisConfirmed.forEach(dev => {
        if (!dev.events || !dev.events.id || seenEventIds.has(dev.events.id)) return;
        seenEventIds.add(dev.events.id);
        const clientId = dev.events.client_id || dev.client_id;
        formattedEvents.push({
          ...dev.events,
          clientName: dev.events?.name || 'Client Evenium',
          clientId: clientId,
          client_id: clientId,
          demande_id: dev.demande_id,
          budget_final: dev.total
        });
      });
    }

    // Résoudre les vrais noms des clients via profiles
    const clientIds = new Set<string>();
    formattedEvents.forEach(e => {
      if (e.client_id) clientIds.add(e.client_id);
    });

    if (clientIds.size > 0) {
      const { data: clientProfiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', Array.from(clientIds));
      
      const clientNameMap: Record<string, string> = {};
      clientProfiles?.forEach(p => {
        if (p.full_name) clientNameMap[p.id] = p.full_name;
      });

      formattedEvents.forEach(e => {
        if (e.client_id && clientNameMap[e.client_id]) {
          e.clientName = clientNameMap[e.client_id];
        }
      });
    }

    setEvents(formattedEvents);
    setLoading(false);
  };

  const openChatForEvent = async (event: any) => {
    setIsChatMode(true);
    setChatLoading(true);
    const targetClientId = event.client_id || event.clientId;
    if (!targetClientId || !currentUserId) {
      setChatLoading(false);
      return;
    }
    const allMsgs = await getMessagesForUser(currentUserId);
    const convMsgs = (allMsgs || []).filter(
      (m: any) => (m.sender_id === currentUserId && m.receiver_id === targetClientId) ||
                  (m.sender_id === targetClientId && m.receiver_id === currentUserId)
    );
    setChatMessages(convMsgs);
    setChatLoading(false);
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUserId || !selectedEvent) return;
    const targetClientId = selectedEvent.client_id || selectedEvent.clientId;
    if (!targetClientId) return;

    const content = chatInput.trim();
    setChatInput("");
    setIsSending(true);

    const tempMsg = {
      id: "temp-" + Date.now(),
      sender_id: currentUserId,
      receiver_id: targetClientId,
      content: content,
      created_at: new Date().toISOString(),
      is_read: false
    };
    setChatMessages(prev => [...prev, tempMsg]);
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    const res = await sendMessage(currentUserId, targetClientId, content);
    setIsSending(false);
    if (res?.error) {
      alert("Erreur lors de l'envoi : " + res.error);
    } else {
      const allMsgs = await getMessagesForUser(currentUserId);
      const convMsgs = (allMsgs || []).filter(
        (m: any) => (m.sender_id === currentUserId && m.receiver_id === targetClientId) ||
                    (m.sender_id === targetClientId && m.receiver_id === currentUserId)
      );
      setChatMessages(convMsgs);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2 flex items-center gap-2">
            Mes Prestations <Calendar size={24} className="text-[#b8924a]" />
          </h1>
          <p className="text-gray-500 text-sm">Gérez les événements pour lesquels vous avez été sélectionné.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-gray-500">Chargement de vos prestations...</div>
        ) : events.length > 0 ? (
          events.map((e, i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-serif font-bold">
                    {e.name?.substring(0, 2) || "EV"}
                  </div>
                  <span className="bg-green-50 text-green-600 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <CheckCircle size={12} />
                    Confirmé
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">{e.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{e.type || 'Événement Standard'}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-[#b8924a]" />
                    {e.date ? new Date(e.date).toLocaleDateString('fr-FR') : 'Date à définir'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-[#b8924a]" />
                    {e.location || 'Lieu à définir'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} className="text-[#b8924a]" />
                    Client: {e.clientName}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEvent(e)}
                className="w-full bg-gray-50 hover:bg-[#b8924a] hover:text-white text-gray-700 py-3 rounded-full font-medium transition-colors flex items-center justify-center gap-2 group"
              >
                <Eye size={18} className="group-hover:text-white" /> Voir les détails
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-3 bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
              <Calendar size={32} />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">Aucune prestation</h3>
            <p className="text-gray-500 max-w-sm mb-4">Vous n'avez pas encore d'événements validés dans votre agenda.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={!!selectedEvent} 
        onClose={() => { setSelectedEvent(null); setIsChatMode(false); }} 
        title={isChatMode ? `Discussion directe` : "Détails de l'événement"}
      >
        {selectedEvent && (
          isChatMode ? (
            <div className="flex flex-col h-[520px] -mx-6 -my-4">
              {/* Entête dédiée de la discussion */}
              <div className="px-6 py-3 border-b border-gray-100 bg-[#fbf7f0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsChatMode(false)}
                    className="p-1.5 hover:bg-stone-200/60 rounded-full text-stone-600 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
                    title="Retour aux détails"
                  >
                    <ArrowLeft size={16} />
                    <span className="hidden sm:inline">Détails</span>
                  </button>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                      {selectedEvent.clientName}
                      <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-normal">Organisateur</span>
                    </h4>
                    <p className="text-[11px] text-[#8f6f33] font-medium truncate max-w-[200px] sm:max-w-xs">
                      Événement : {selectedEvent.name} {selectedEvent.type ? `(${selectedEvent.type})` : ''}
                    </p>
                  </div>
                </div>

                <Link 
                  href={`/prestataire/messages?contactId=${selectedEvent.client_id || selectedEvent.clientId || ''}&contactName=${encodeURIComponent(selectedEvent.clientName || '')}&eventName=${encodeURIComponent(selectedEvent.name || '')}&eventType=${encodeURIComponent(selectedEvent.type || '')}`}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-[#8f6f33] font-medium transition-colors p-1.5 rounded-lg hover:bg-white"
                  title="Ouvrir dans la messagerie complète"
                >
                  <span className="hidden sm:inline">Plein écran</span>
                  <ExternalLink size={14} />
                </Link>
              </div>

              {/* Messages container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(circle_at_1px_1px,rgba(180,150,80,0.08)_1px,transparent_0)] [background-size:20px_20px]">
                {chatLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-2">
                    <Loader2 size={24} className="animate-spin text-[#b8924a]" />
                    <span className="text-xs">Chargement de la discussion...</span>
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#efe6d6] text-[#8f6f33] flex items-center justify-center mb-3">
                      <MessageCircle size={22} />
                    </div>
                    <p className="text-sm font-semibold text-stone-800">Aucun message échangé</p>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs">
                      Envoyez directement votre message à {selectedEvent.clientName} concernant l'événement {selectedEvent.name}.
                    </p>
                  </div>
                ) : (
                  chatMessages.map((m, idx) => {
                    const isMe = m.sender_id === currentUserId;
                    return (
                      <div key={m.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                          isMe 
                            ? 'bg-gradient-to-br from-[#2b2118] to-[#241b13] text-[#f5eee1] rounded-br-xs' 
                            : 'bg-white text-stone-800 border border-stone-200/80 rounded-bl-xs'
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                          <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-stone-400' : 'text-stone-400'}`}>
                            {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Formulaire d'envoi rapide */}
              <form onSubmit={handleSendChatMessage} className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Écrire à ${selectedEvent.clientName}...`}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50"
                  disabled={isSending}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSending || !chatInput.trim()}
                  className="p-2.5 bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                  title="Envoyer"
                >
                  {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-serif text-2xl font-bold">
                  {selectedEvent.name?.substring(0, 2) || "EV"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedEvent.name}</h3>
                  <p className="text-gray-500">{selectedEvent.type || 'Événement Standard'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">Date de l'événement</div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    <Calendar size={16} className="text-[#b8924a]" />
                    {selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString('fr-FR') : 'Non définie'}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">Lieu</div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    <MapPin size={16} className="text-[#b8924a]" />
                    {selectedEvent.location || 'Non défini'}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">Organisateur (Client)</div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    <Users size={16} className="text-[#b8924a]" />
                    {selectedEvent.clientName}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">Budget / Accord</div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    <FileText size={16} className="text-[#b8924a]" />
                    {selectedEvent.budget_final ? `${Number(selectedEvent.budget_final).toLocaleString()} FCFA` : 'Non renseigné'}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button 
                  type="button"
                  onClick={() => openChatForEvent(selectedEvent)} 
                  className="flex-1 bg-black text-white py-3 rounded-xl font-medium text-center hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                >
                  <MessageCircle size={18} />
                  Contacter le client
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-center hover:bg-gray-200 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          )
        )}
      </Modal>
    </div>
  );
}
