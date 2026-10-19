"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { MessagingView } from "@/components/messaging/MessagingView";
import { getMessagesForUser, getProfiles, sendMessage, sendBroadcastMessage } from "@/app/actions/messages";
import { markConversationRead } from "@/app/actions/notifications";
import { useBadgeStore } from "@/store/BadgeStore";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  
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

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setMyId(user.id);

    const profData = await getProfiles();
    const profMap: Record<string, any> = {};
    profData?.forEach((p: any) => profMap[p.id] = p);
    setProfiles(profMap);

    const msgData = await getMessagesForUser(user.id);

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
            unread: 0
          };
        }
        grouped[otherId].messages.push(m);
        if (m.receiver_id === user.id && !m.is_read) grouped[otherId].unread++;
        grouped[otherId].lastMessage = m;
      });

      const convs = Object.values(grouped).sort((a, b) => 
        new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      );
      setConversations(convs);
    }

    const allValidContactIds = Object.values(profMap).filter(p => p.role !== 'admin' && p.id !== user.id).map(p => p.id);
    setPotentialContacts(allValidContactIds.map(id => profMap[id]).filter(Boolean));
  };


  // Reload the inbox on mount, then whenever a new message arrives (the unread counter goes up)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch: state is only set once the request resolves
    fetchData();
    return useBadgeStore.subscribe((s, prev) => {
      if (s.unreadMessages > prev.unreadMessages) fetchData();
    });
  }, []);

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
    if (!myId || !activeConvId || !newMessage) return;

    const { error } = await sendMessage(myId, activeConvId, newMessage);
    
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

    if (selectedContactId.startsWith('broadcast_')) {
      const groupMap: Record<string, any> = {
        'broadcast_org': 'all_organisateurs',
        'broadcast_pre': 'all_prestataires',
        'broadcast_all': 'everyone'
      };
      
      const { error, count } = await sendBroadcastMessage(myId, groupMap[selectedContactId], initialMessage);
      
      if (error) {
        alert("Erreur lors de l'envoi groupé : " + error);
      } else {
        alert(`Message groupé envoyé avec succès à ${count} utilisateur(s) !`);
        setIsModalOpen(false);
        setSelectedContactId("");
        setInitialMessage("");
        fetchData();
      }
    } else {
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
    }
  };


  return (
    <MessagingView
      subtitle="Organisateurs, prestataires et envois groupés"
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
        placeholder: "Sélectionnez un contact ou un groupe",
        groups: [
          {
            label: "📢 Diffusions de masse (Groupes)",
            options: [
              { value: "broadcast_org", label: "Tous les organisateurs" },
              { value: "broadcast_pre", label: "Tous les prestataires" },
              { value: "broadcast_all", label: "Tout le monde (Organisateurs + Prestataires)" },
            ],
          },
          { label: "👤 Contacts individuels", options: potentialContacts.map(c => ({ value: c.id, label: c.role === 'admin' ? 'Support Evenium (Admin)' : `${c.full_name} (${c.role === 'prestataire' ? 'Prestataire' : 'Organisateur'})` })) },
        ],
      }}
    />
  );
}
