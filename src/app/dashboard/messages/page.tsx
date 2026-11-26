"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { MessagingView } from "@/components/messaging/MessagingView";
import { getMessagesForUser, getProfiles, sendMessage } from "@/app/actions/messages";
import { markConversationRead } from "@/app/actions/notifications";
import { useBadgeStore } from "@/store/BadgeStore";

function ClientMessagesInner() {
  const searchParams = useSearchParams();
  const contactIdParam = searchParams.get('prestataire') || searchParams.get('contactId') || searchParams.get('userId');
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

    // Récupérer les devis récents et réponses RSVP pour alimenter la boîte d'alertes & notifications
    const systemMessages: any[] = [
      {
        id: 'msg-welcome',
        sender_id: 'evenium_assistant',
        receiver_id: user.id,
        content: "✨ Bienvenue sur votre messagerie Evenium !\nVotre tableau de bord et votre suivi d'événements sont opérationnels. Vous retrouverez ici en temps réel les propositions de devis de vos prestataires, le suivi des réponses RSVP de vos convives et les messages de vos invités.",
        created_at: user.created_at || new Date().toISOString(),
        is_read: true,
      }
    ];

    try {
      const { data: clientDevis } = await supabase
        .from('devis')
        .select('id, amount, total, status, created_at, event_id, prestataire_id, profiles(full_name, category)')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (clientDevis && clientDevis.length > 0) {
        clientDevis.forEach((d: any) => {
          const provName = d.profiles?.full_name || 'Votre prestataire';
          const provCat = d.profiles?.category ? `(${d.profiles.category})` : '';
          const amt = Number(d.total || d.amount || 0).toLocaleString('fr-FR');
          systemMessages.push({
            id: `msg-devis-${d.id}`,
            sender_id: 'evenium_assistant',
            receiver_id: user.id,
            content: `📋 Mise à jour Devis - ${provName} ${provCat}\nStatut : ${d.status}\nMontant : ${amt} FCFA\nConsultez les détails et échangez directement avec votre prestataire depuis cet espace.`,
            created_at: d.created_at || new Date().toISOString(),
            is_read: true,
          });
        });
      }

      if (clientEvents && clientEvents.length > 0) {
        const evIds = clientEvents.map(e => e.id);
        const { data: recentGuests } = await supabase
          .from('guests')
          .select('id, name, status, companions, updated_at, event_id')
          .in('event_id', evIds)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (recentGuests && recentGuests.length > 0) {
          recentGuests.forEach((g: any) => {
            const statusLabel = g.status === 'confirmed' ? 'Confirmé' : g.status === 'declined' ? 'Décliné' : g.status;
            systemMessages.push({
              id: `msg-rsvp-${g.id}`,
              sender_id: 'evenium_assistant',
              receiver_id: user.id,
              content: `💌 Réponse Invité (RSVP) : ${g.name} a répondu « ${statusLabel} »${g.companions ? ` (${g.companions} accompagnant(s))` : ''}.`,
              created_at: g.updated_at || new Date().toISOString(),
              is_read: true,
            });
          });
        }
      }
    } catch { }

    const systemConv = {
      id: 'evenium_assistant',
      profile: {
        id: 'evenium_assistant',
        full_name: 'Evenium • Mises à jour & Suivi',
        role: 'admin',
        category: 'Assistant Officiel',
        avatar_url: null,
      },
      lastMessage: systemMessages[systemMessages.length - 1],
      messages: systemMessages,
      unread: 0,
      eventContext: {
        name: 'Notifications & Alertes de vos Événements',
        type: 'Système'
      }
    };

    convs.unshift(systemConv);

    // SI UN CONTACT EST CIBLÉ DANS L'URL (?contactId=...)
    if (contactIdParam) {
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

    const { data: events } = await supabase.from('events').select('id').eq('client_id', user.id);
    const eventIds = (events || []).map(e => e.id);
    const { data: demandes } = await supabase.from('demandes_devis').select('prestataire_id').in('event_id', eventIds);
    const providerIds = (demandes || []).map(d => d.prestataire_id).filter(Boolean);
    const adminProfiles = Object.values(profMap).filter(p => p.role === 'admin');
    const adminIds = adminProfiles.map(a => a.id);
    const allValidContactIds = Array.from(new Set([...providerIds, ...adminIds]));
    
    setPotentialContacts(allValidContactIds.map(id => profMap[id]).filter(Boolean));
  };

  useEffect(() => {
    fetchData();
    return useBadgeStore.subscribe((s, prev) => {
      if (s.unreadMessages > prev.unreadMessages) fetchData();
    });
  }, [contactIdParam]);

  const activeUnread = conversations.find(c => c.id === activeConvId)?.unread ?? 0;

  useEffect(() => {
    if (!activeConvId || activeUnread === 0) return;
    markConversationRead(activeConvId).then(() => {
      setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, unread: 0 } : c));
      refreshBadges();
    });
  }, [activeConvId, activeUnread, refreshBadges]);

  const handleSendPrivate = async (e?: React.FormEvent, customContent?: string) => {
    e?.preventDefault?.();
    const contentToSend = (typeof customContent === "string" ? customContent : newMessage).trim();
    if (!myId || !activeConvId || !contentToSend) return;

    if (activeConvId === 'evenium_assistant') {
      const userMsg = {
        id: `user-${Date.now()}`,
        sender_id: myId,
        receiver_id: 'evenium_assistant',
        content: contentToSend,
        created_at: new Date().toISOString(),
        is_read: true,
      };
      const autoReply = {
        id: `reply-${Date.now() + 1}`,
        sender_id: 'evenium_assistant',
        receiver_id: myId,
        content: "Merci pour votre message ! Votre demande a été enregistrée auprès de l'assistance Evenium. Nos conseillers ou vos prestataires prendront contact avec vous rapidement.",
        created_at: new Date(Date.now() + 600).toISOString(),
        is_read: true,
      };
      setConversations(prev => prev.map(c => {
        if (c.id === 'evenium_assistant') {
          return {
            ...c,
            messages: [...c.messages, userMsg, autoReply],
            lastMessage: autoReply,
          };
        }
        return c;
      }));
      setNewMessage("");
      return;
    }

    const { error } = await sendMessage(myId, activeConvId, contentToSend);
    
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
      subtitle="Vos échanges avec vos prestataires et le support Evenium"
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

export default function ClientMessagesPage() {
  return (
    <Suspense fallback={<div className="p-6 sm:p-10 lg:p-12 text-center text-gray-500 font-medium">Chargement de votre messagerie...</div>}>
      <ClientMessagesInner />
    </Suspense>
  );
}
