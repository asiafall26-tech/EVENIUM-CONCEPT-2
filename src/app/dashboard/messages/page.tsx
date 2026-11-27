"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { MessagingView } from "@/components/messaging/MessagingView";
import { getMessagesForUser, getProfiles, sendMessage } from "@/app/actions/messages";
import { markConversationRead } from "@/app/actions/notifications";
import { useBadgeStore } from "@/store/BadgeStore";
import { notifyMessageReceipt } from "@/lib/notifications";

function ClientMessagesInner() {
  const searchParams = useSearchParams();
  const contactIdParam = searchParams.get('prestataire') || searchParams.get('contactId') || searchParams.get('userId') || searchParams.get('contact') || searchParams.get('providerId');
  const contactNameParam = searchParams.get('name') || searchParams.get('contactName') || searchParams.get('providerName');
  const eventNameParam = searchParams.get('eventName');
  const eventTypeParam = searchParams.get('eventType');
  const initialMsgParam = searchParams.get('msg') || searchParams.get('message');

  const [messages, setMessages] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [conversations, setConversations] = useState<any[]>(() => {
    if (contactIdParam) {
      return [{
        id: contactIdParam,
        profile: {
          id: contactIdParam,
          full_name: contactNameParam ? decodeURIComponent(contactNameParam) : 'Prestataire',
          role: 'prestataire'
        },
        lastMessage: {
          id: 'init',
          sender_id: '',
          receiver_id: contactIdParam,
          content: 'Démarrer une discussion...',
          created_at: new Date().toISOString(),
          is_read: true,
        },
        messages: [],
        unread: 0,
        eventContext: eventNameParam ? {
          name: decodeURIComponent(eventNameParam),
          type: eventTypeParam ? decodeURIComponent(eventTypeParam) : undefined
        } : undefined
      }];
    }
    return [];
  });
  const [activeConvId, setActiveConvId] = useState<string | null>(contactIdParam || null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [potentialContacts, setPotentialContacts] = useState<any[]>([]);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [newMessage, setNewMessage] = useState(() => (initialMsgParam ? decodeURIComponent(initialMsgParam) : ""));
  
  const [myId, setMyId] = useState<string | null>(null);
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const refreshBadges = useBadgeStore((s) => s.refresh);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConvId]);

  useEffect(() => {
    if (contactIdParam) {
      setActiveConvId(contactIdParam);
    }
  }, [contactIdParam]);

  useEffect(() => {
    if (initialMsgParam) {
      setNewMessage(decodeURIComponent(initialMsgParam));
    }
  }, [initialMsgParam]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setMyId(user.id);

    const profData = await getProfiles();
    const profMap: Record<string, any> = {};
    profData?.forEach((p: any) => profMap[p.id] = p);
    setProfiles(profMap);

    const providerEventMap: Record<string, { name: string; type?: string }> = {};

    // Charger les événements de l'organisateur pour rattacher automatiquement chaque prestataire à son événement
    const { data: clientEvents } = await supabase
      .from('events')
      .select('id, name, type')
      .eq('client_id', user.id);

    if (clientEvents && clientEvents.length > 0) {
      const eventIds = clientEvents.map(e => e.id);
      const evMap: Record<string, { name: string; type?: string }> = {};
      clientEvents.forEach(e => { evMap[e.id] = { name: e.name, type: e.type }; });

      const { data: devisRows } = await supabase
        .from('devis')
        .select('event_id, prestataire_id')
        .in('event_id', eventIds);

      (devisRows || []).forEach(d => {
        if (d.prestataire_id && evMap[d.event_id]) {
          providerEventMap[d.prestataire_id] = evMap[d.event_id];
        }
      });

      const { data: demandesRows } = await supabase
        .from('demandes_devis')
        .select('event_id, prestataire_id')
        .in('event_id', eventIds);

      (demandesRows || []).forEach(d => {
        if (d.prestataire_id && evMap[d.event_id]) {
          providerEventMap[d.prestataire_id] = evMap[d.event_id];
        }
      });
    }

    if (contactIdParam && eventNameParam) {
      providerEventMap[contactIdParam] = {
        name: decodeURIComponent(eventNameParam),
        type: eventTypeParam ? decodeURIComponent(eventTypeParam) : undefined
      };
    }

    const msgData = await getMessagesForUser(user.id);
    const convs: any[] = [];

    if (msgData) {
      setMessages(msgData);
      
      const grouped: Record<string, any> = {};
      msgData.forEach(m => {
        const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
        if (!grouped[otherId]) {
          grouped[otherId] = {
            id: otherId,
            profile: profMap[otherId],
            lastMessage: m,
            messages: [],
            unread: 0,
            eventContext: providerEventMap[otherId]
          };
        }
        grouped[otherId].messages.push(m);
        if (m.receiver_id === user.id && !m.is_read) grouped[otherId].unread++;
        grouped[otherId].lastMessage = m;
      });

      const sortedConvs = Object.values(grouped).sort((a, b) => 
        new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      );
      convs.push(...sortedConvs);
    }

    // SI UN CONTACT EST CIBLÉ DANS L'URL (?prestataire=... ou ?contactId=...)
    if (contactIdParam && contactIdParam !== 'evenium_assistant') {
      const existingConv = convs.find(c => c.id === contactIdParam);
      if (existingConv) {
        if (!existingConv.eventContext && providerEventMap[contactIdParam]) {
          existingConv.eventContext = providerEventMap[contactIdParam];
        }
        setActiveConvId(contactIdParam);
      } else {
        let targetProfile = profMap[contactIdParam];
        if (!targetProfile) {
          const { data: directProf } = await supabase.from('profiles').select('*').eq('id', contactIdParam).single();
          if (directProf) {
            targetProfile = directProf;
            profMap[contactIdParam] = directProf;
          } else {
            targetProfile = {
              id: contactIdParam,
              full_name: contactNameParam ? decodeURIComponent(contactNameParam) : 'Prestataire',
              role: 'prestataire'
            };
          }
        }

        const newConv = {
          id: contactIdParam,
          profile: targetProfile,
          lastMessage: {
            id: 'new',
            sender_id: user.id,
            receiver_id: contactIdParam,
            content: 'Démarrer une discussion',
            created_at: new Date().toISOString(),
            is_read: true,
          },
          messages: [],
          unread: 0,
          eventContext: providerEventMap[contactIdParam]
        };

        convs.unshift(newConv);
        setActiveConvId(contactIdParam);
      }
    } else if (!activeConvId && convs.length > 0) {
      setActiveConvId(convs[0].id);
    }

    setConversations(convs);

    // Contacts potentiels pour démarrer un nouveau message : Tous les prestataires et l'administration
    const validContacts = Object.values(profMap).filter((p: any) => 
      p.id !== user.id && 
      p.id !== 'evenium_assistant' &&
      (p.role === 'prestataire' || p.role === 'admin')
    );
    setPotentialContacts(validContacts);
  };

  useEffect(() => {
    fetchData();
    const onMsgsUpdated = () => fetchData();
    window.addEventListener("evenium_messages_updated", onMsgsUpdated);
    const sub = useBadgeStore.subscribe((s, prev) => {
      if (s.unreadMessages > prev.unreadMessages) fetchData();
    });
    return () => {
      window.removeEventListener("evenium_messages_updated", onMsgsUpdated);
      sub();
    };
  }, [contactIdParam]);

  const activeUnread = conversations.find(c => c.id === activeConvId)?.unread ?? 0;

  useEffect(() => {
    if (!activeConvId || activeUnread === 0) return;
    markConversationRead(activeConvId).then(() => {
      setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, unread: 0 } : c));
      refreshBadges();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("evenium_notifications_updated"));
      }
    });
  }, [activeConvId, activeUnread, refreshBadges]);

  const handleSendPrivate = async (e?: React.FormEvent, customContent?: string) => {
    e?.preventDefault?.();
    const contentToSend = (typeof customContent === "string" ? customContent : newMessage).trim();
    if (!myId || !activeConvId || !contentToSend) return;

    const res = await sendMessage(myId, activeConvId, contentToSend);
    
    if (res.error) {
      alert("Erreur lors de l'envoi : " + res.error);
    } else {
      setNewMessage("");
      // Émettre une notification in-app pour le destinataire
      const targetProf = profiles[activeConvId];
      notifyMessageReceipt({
        receiverId: activeConvId,
        senderId: myId,
        senderName: "L'Organisateur",
        senderRole: "client",
        preview: contentToSend.length > 70 ? contentToSend.substring(0, 70) + "…" : contentToSend,
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("evenium_messages_updated"));
        window.dispatchEvent(new Event("evenium_notifications_updated"));
      }
      fetchData();
    }
  };

  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myId || !selectedContactId || !initialMessage) return;

    const { error } = await sendMessage(myId, selectedContactId, initialMessage);
    
    if (error) {
      alert("Erreur lors de la création : " + error);
    } else {
      setIsModalOpen(false);
      handleSelectConversation(selectedContactId);
      setSelectedContactId("");
      setInitialMessage("");
      fetchData();
    }
  };

  const handleSelectConversation = (id: string | null) => {
    setActiveConvId(id);
    if (!id) return;
    const exists = conversations.some(c => c.id === id);
    if (!exists) {
      const prof = profiles[id] || potentialContacts.find(c => c.id === id) || {
        id,
        full_name: 'Prestataire',
        role: 'prestataire'
      };
      const newConv = {
        id,
        profile: prof,
        lastMessage: {
          id: 'new',
          sender_id: myId || '',
          receiver_id: id,
          content: 'Démarrer une discussion',
          created_at: new Date().toISOString(),
          is_read: true,
        },
        messages: [],
        unread: 0,
      };
      setConversations(prev => [newConv, ...prev.filter(c => c.id !== id)]);
    }
  };

  const providerContacts = potentialContacts.filter(c => c.role === 'prestataire');
  const adminContacts = potentialContacts.filter(c => c.role === 'admin');

  return (
    <MessagingView
      subtitle="Vos échanges avec vos prestataires et le support Evenium"
      myId={myId}
      myProfile={myId ? profiles[myId] : undefined}
      conversations={conversations}
      activeConvId={activeConvId}
      onSelectConversation={handleSelectConversation}
      reply={newMessage}
      onReplyChange={setNewMessage}
      onSendReply={handleSendPrivate}
      onSendMessageContent={(content) => handleSendPrivate(undefined, content)}
      messagesEndRef={messagesEndRef}
      compose={{
        isOpen: isModalOpen,
        onOpen: () => setIsModalOpen(true),
        onClose: () => setIsModalOpen(false),
        recipient: selectedContactId,
        onRecipientChange: setSelectedContactId,
        message: initialMessage,
        onMessageChange: setInitialMessage,
        onSubmit: handleStartConversation,
        placeholder: "Sélectionnez un contact",
        groups: [
          ...(providerContacts.length > 0 ? [{
            label: "Prestataires",
            options: providerContacts.map(c => ({
              value: c.id,
              label: `${c.full_name || 'Prestataire'} (Prestataire)`,
              group: "Prestataire"
            }))
          }] : []),
          ...(adminContacts.length > 0 ? [{
            label: "Support Evenium",
            options: adminContacts.map(c => ({
              value: c.id,
              label: `${c.full_name || 'Admin'} (Support Evenium)`,
              group: "Support Evenium"
            }))
          }] : [])
        ],
      }}
    />
  );
}

export default function ClientMessagesPage() {
  return (
    <Suspense fallback={<div className="p-6 sm:p-10 lg:p-12 text-center text-gray-500 font-medium">Chargement de votre messagerie...</div>}>
      <ClientMessagesInner />
    </Suspense>
  );
}
