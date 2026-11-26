"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { MessagingView } from "@/components/messaging/MessagingView";
import { getMessagesForUser, getProfiles, sendMessage } from "@/app/actions/messages";
import { markConversationRead } from "@/app/actions/notifications";
import { useBadgeStore } from "@/store/BadgeStore";
import { notifyMessageReceipt } from "@/lib/notifications";

function PrestataireMessagesInner() {
  const searchParams = useSearchParams();
  const contactIdParam = searchParams.get('contactId') || searchParams.get('userId');
  const contactNameParam = searchParams.get('contactName');
  const eventNameParam = searchParams.get('eventName');
  const eventTypeParam = searchParams.get('eventType');

  const [messages, setMessages] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [conversations, setConversations] = useState<any[]>(() => {
    if (contactIdParam) {
      return [{
        id: contactIdParam,
        profile: {
          id: contactIdParam,
          full_name: contactNameParam ? decodeURIComponent(contactNameParam) : 'Client',
          role: 'client'
        },
        lastMessage: {
          id: 'init',
          sender_id: '',
          receiver_id: contactIdParam,
          content: 'Chargement des messages...',
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
  const [newMessage, setNewMessage] = useState("");
  
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

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const effectiveUserId = user?.id || (typeof window !== "undefined" ? localStorage.getItem("evenium_provider_id") : null) || "prov-me";
    setMyId(effectiveUserId);

    const profData = await getProfiles();
    const profMap: Record<string, any> = {};
    profData?.forEach((p: any) => profMap[p.id] = p);
    setProfiles(profMap);

    // Charger les événements liés aux clients pour afficher le badge d'événement
    const clientEventMap: Record<string, { name: string; type?: string }> = {};
    if (user?.id) {
      const { data: demandesEvents } = await supabase
        .from('demandes_devis')
        .select('events(name, type, client_id)')
        .eq('prestataire_id', user.id);

      (demandesEvents || []).forEach((d: any) => {
        const ev = Array.isArray(d.events) ? d.events[0] : d.events;
        if (ev?.client_id && ev?.name) {
          clientEventMap[ev.client_id] = { name: ev.name, type: ev.type };
        }
      });

      const { data: devisEvents } = await supabase
        .from('devis')
        .select('events(name, type, client_id)')
        .eq('prestataire_id', user.id);

      (devisEvents || []).forEach((dev: any) => {
        const ev = Array.isArray(dev.events) ? dev.events[0] : dev.events;
        if (ev?.client_id && ev?.name) {
          clientEventMap[ev.client_id] = { name: ev.name, type: ev.type };
        }
      });
    }

    if (contactIdParam && eventNameParam) {
      clientEventMap[contactIdParam] = {
        name: decodeURIComponent(eventNameParam),
        type: eventTypeParam ? decodeURIComponent(eventTypeParam) : undefined
      };
    }

    const msgData = await getMessagesForUser(effectiveUserId);
    const convs: any[] = [];

    if (msgData && msgData.length > 0) {
      setMessages(msgData);
      
      const grouped: Record<string, any> = {};
      msgData.forEach(m => {
        const otherId = m.sender_id === effectiveUserId ? m.receiver_id : m.sender_id;
        if (!otherId || otherId === 'evenium_assistant') return;
        if (!grouped[otherId]) {
          grouped[otherId] = {
            id: otherId,
            profile: profMap[otherId] || { id: otherId, full_name: 'Organisateur Evenium', role: 'client' },
            lastMessage: m,
            messages: [],
            unread: 0,
            eventContext: clientEventMap[otherId]
          };
        }
        grouped[otherId].messages.push(m);
        if (m.receiver_id === effectiveUserId && !m.is_read) grouped[otherId].unread++;
        grouped[otherId].lastMessage = m;
      });

      const sortedConvs = Object.values(grouped).sort((a, b) => 
        new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      );
      convs.push(...sortedConvs);
    }

    // SI UN CONTACT A ÉTÉ DEMANDÉ EN PARAMÈTRE (?contactId=...)
    if (contactIdParam && contactIdParam !== 'evenium_assistant') {
      const existingConv = convs.find(c => c.id === contactIdParam);
      if (existingConv) {
        if (!existingConv.eventContext && clientEventMap[contactIdParam]) {
          existingConv.eventContext = clientEventMap[contactIdParam];
        }
        setActiveConvId(contactIdParam);
      } else {
        // Aucune conversation précédente: on la crée immédiatement pour ouvrir directement le fil de discussion
        let targetProfile = profMap[contactIdParam];
        if (!targetProfile) {
          const { data: directProf } = await supabase.from('profiles').select('*').eq('id', contactIdParam).single();
          if (directProf) {
            targetProfile = directProf;
            profMap[contactIdParam] = directProf;
          } else {
            targetProfile = {
              id: contactIdParam,
              full_name: contactNameParam ? decodeURIComponent(contactNameParam) : 'Client',
              role: 'client'
            };
          }
        }

        const newConv = {
          id: contactIdParam,
          profile: targetProfile,
          lastMessage: {
            id: 'new',
            sender_id: effectiveUserId,
            receiver_id: contactIdParam,
            content: 'Démarrer une discussion',
            created_at: new Date().toISOString(),
            is_read: true,
          },
          messages: [],
          unread: 0,
          eventContext: clientEventMap[contactIdParam]
        };

        convs.unshift(newConv);
        setActiveConvId(contactIdParam);
      }
    } else if (!activeConvId && convs.length > 0) {
      // Par défaut sur grand écran, ouvrir la première conversation
      setActiveConvId(convs[0].id);
    }

    setConversations(convs);

    // Contacts potentiels : Tous les clients et administrateurs
    const validContacts = Object.values(profMap).filter((p: any) => 
      p.id !== effectiveUserId && 
      p.id !== 'evenium_assistant' &&
      (p.role === 'client' || p.role === 'admin')
    );
    setPotentialContacts(validContacts);
  };

  // Reload the inbox on mount, then whenever a new message arrives (the unread counter goes up)
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

  // Opening a conversation marks its messages as read and updates the menu badges
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
      // Émettre une notification in-app pour le client destinataire
      const targetProf = profiles[activeConvId];
      notifyMessageReceipt({
        receiverId: activeConvId,
        senderId: myId,
        senderName: "Votre Prestataire",
        senderRole: "prestataire",
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
      setActiveConvId(selectedContactId);
      setSelectedContactId("");
      setInitialMessage("");
      fetchData();
    }
  };

  return (
    <MessagingView
      subtitle="Vos échanges avec vos clients et le support Evenium"
      myId={myId}
      myProfile={myId ? profiles[myId] : undefined}
      conversations={conversations}
      activeConvId={activeConvId}
      onSelectConversation={setActiveConvId}
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
        groups: [{ options: potentialContacts.map(c => ({ value: c.id, label: c.role === 'admin' ? 'Support Evenium (Admin)' : `${c.full_name} (${c.role === 'prestataire' ? 'Prestataire' : 'Organisateur'})` })) }],
      }}
    />
  );
}

export default function PrestataireMessagesPage() {
  return (
    <Suspense fallback={<div className="p-6 sm:p-10 lg:p-12 text-center text-gray-500 font-medium">Chargement de votre messagerie...</div>}>
      <PrestataireMessagesInner />
    </Suspense>
  );
}
