"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { MessagingView } from "@/components/messaging/MessagingView";
import { getMessagesForUser, getProfiles, sendMessage } from "@/app/actions/messages";
import { markConversationRead } from "@/app/actions/notifications";
import { useBadgeStore } from "@/store/BadgeStore";

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
    if (!user) return;
    setMyId(user.id);

    const profData = await getProfiles();
    const profMap: Record<string, any> = {};
    profData?.forEach((p: any) => profMap[p.id] = p);
    setProfiles(profMap);

    // Charger les événements liés aux clients pour afficher le badge d'événement
    const clientEventMap: Record<string, { name: string; type?: string }> = {};
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

    if (contactIdParam && eventNameParam) {
      clientEventMap[contactIdParam] = {
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
            eventContext: clientEventMap[otherId]
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

    // SI UN CONTACT A ÉTÉ DEMANDÉ EN PARAMÈTRE (?contactId=...)
    if (contactIdParam) {
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
            sender_id: user.id,
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

    const { data: demandes } = await supabase.from('demandes_devis').select('events(client_id)').eq('prestataire_id', user.id);
    const clientIds = (demandes || []).map((d: any) => (Array.isArray(d.events) ? d.events[0]?.client_id : d.events?.client_id)).filter(Boolean);
    const adminProfiles = Object.values(profMap).filter(p => p.role === 'admin');
    const adminIds = adminProfiles.map(a => a.id);
    const allValidContactIds = Array.from(new Set([...clientIds, ...adminIds]));
    
    setPotentialContacts(allValidContactIds.map(id => profMap[id]).filter(Boolean));
  };

  // Reload the inbox on mount, then whenever a new message arrives (the unread counter goes up)
  useEffect(() => {
    fetchData();
    return useBadgeStore.subscribe((s, prev) => {
      if (s.unreadMessages > prev.unreadMessages) fetchData();
    });
  }, [contactIdParam]);

  const activeUnread = conversations.find(c => c.id === activeConvId)?.unread ?? 0;

  // Opening a conversation marks its messages as read and updates the menu badges
  useEffect(() => {
    if (!activeConvId || activeUnread === 0) return;
    markConversationRead(activeConvId).then(() => {
      setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, unread: 0 } : c));
      refreshBadges();
    });
  }, [activeConvId, activeUnread, refreshBadges]);

  const handleSendPrivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myId || !activeConvId || !newMessage.trim()) return;

    const { error } = await sendMessage(myId, activeConvId, newMessage.trim());
    
    if (error) {
      alert("Erreur lors de l'envoi : " + error);
    } else {
      setNewMessage("");
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
    <Suspense fallback={<div className="p-12 text-center text-gray-500 font-medium">Chargement de votre messagerie...</div>}>
      <PrestataireMessagesInner />
    </Suspense>
  );
}
