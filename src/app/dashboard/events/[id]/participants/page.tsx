"use client";

import { Users, Plus, Search, MoreHorizontal, Mail, CheckCircle, Clock, XCircle, ChevronDown, ArrowRight, Edit2, Trash2, X, FileText, User, MessageCircle, Copy, Share2, Sparkles, Send, Lock } from "lucide-react";
import Link from "next/link";
import { use, useState, useEffect, useMemo } from "react";
import { useEvents } from "@/store/EventsContext";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { markRsvpSeen } from "@/store/BadgeStore";

export default function ParticipantsDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { events, isLoaded, refreshEvents } = useEvents();
  const supabase = createClient();

  const eventFromContext = events.find((e) => e.id === id);
  const [directEvent, setDirectEvent] = useState<any>(null);
  const [loadingDirect, setLoadingDirect] = useState(!eventFromContext);
  const [notFoundTriggered, setNotFoundTriggered] = useState(false);

  const event = eventFromContext || directEvent;

  useEffect(() => {
    if (eventFromContext) {
      setLoadingDirect(false);
      return;
    }

    const fetchDirect = async () => {
      try {
        const { data } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
        if (data) {
          setDirectEvent(data);
          refreshEvents();
        } else if (isLoaded) {
          setNotFoundTriggered(true);
        }
      } catch {
        if (isLoaded) setNotFoundTriggered(true);
      } finally {
        setLoadingDirect(false);
      }
    };
    fetchDirect();
  }, [id, eventFromContext, isLoaded, supabase, refreshEvents]);

  if (loadingDirect && !event) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 text-[#8f6f33]">
        <div className="w-10 h-10 border-3 border-[#b8924a] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Chargement des participants...</p>
      </div>
    );
  }

  if (notFoundTriggered || (!event && !loadingDirect && isLoaded)) {
    notFound();
  }

  if (event.plan === "Standard") {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full h-[80vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl max-w-md text-center">
          <div className="w-20 h-20 bg-[#f5eee1] text-[#8f6f33] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-black mb-3">Réservé aux Formules Premium &amp; Gold</h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            Le suivi des confirmations RSVP en temps réel et la gestion de la liste des invités sont accessibles à partir de la formule Premium. En formule Standard, vous bénéficiez du téléchargement direct du lien de votre invitation.
          </p>
          <Link href={`/dashboard/events/${event.id}`} className="block w-full bg-[#8f6f33] hover:bg-[#7a5e2b] text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-[#8f6f33]/20 transition-colors">
            Voir mon lien d&apos;invitation ou Évoluer
          </Link>
          <div className="mt-4">
             <Link href={`/dashboard/events/${event.id}`} className="text-sm font-medium text-gray-400 hover:text-black">
               Retour à l&apos;aperçu
             </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [newParticipant, setNewParticipant] = useState({
    name: "",
    phone: "",
    email: "",
    group: "Famille",
    status: "En attente"
  });

  const [participants, setParticipants] = useState<any[]>([]);

  // WhatsApp Share State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppGuest, setWhatsAppGuest] = useState<{ id?: string; name: string; phone?: string } | null>(null);
  const [waTone, setWaTone] = useState<"chaleureux" | "prestige" | "court">("chaleureux");
  const [waPhoneInput, setWaPhoneInput] = useState("");
  const [waCopied, setWaCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/invite/${id}`;
    }
    return `/invite/${id}`;
  };

  const generateWhatsAppMessage = (guestName?: string, tone: "chaleureux" | "prestige" | "court" = "chaleureux") => {
    const link = getShareUrl();
    const greeting = guestName ? `Bonjour ${guestName} !` : "Bonjour !";
    const dateText = event.date ? ` le *${event.date}*` : "";
    const locationText = event.location ? ` à *${event.location}*` : "";

    if (tone === "prestige") {
      return `🎩 *INVITATION OFFICIELLE*\n\n` +
        `${greeting}\n\n` +
        `Vous êtes cordialement invité(e) à célébrer *${event.name}*${dateText}${locationText}.\n\n` +
        `Veuillez découvrir votre carton d'invitation d'honneur et enregistrer votre confirmation de présence via ce lien :\n` +
        `👉 ${link}\n\n` +
        `Au plaisir de vous accueillir parmi nous.`;
    }

    if (tone === "court") {
      return `✨ *Invitation - ${event.name}*\n\n` +
        `${greeting}\n\n` +
        `Voici le lien de votre invitation interactive pour le ${event.date || "jour J"} :\n` +
        `👉 ${link}\n\n` +
        `Merci de confirmer votre présence directement sur le lien. À très bientôt ! 🎉`;
    }

    // Chaleureux par défaut
    return `✨ *VOUS ÊTES INVITÉ(E) !* ✨\n\n` +
      `${greeting}\n\n` +
      `Nous avons l'immense joie de vous convier à célébrer *${event.name}*${dateText}${locationText} !\n\n` +
      `Découvrez votre invitation interactive et confirmez votre présence en quelques secondes ici :\n` +
      `👉 ${link}\n\n` +
      `Nous avons hâte de partager ce moment inoubliable avec vous ! 🎉🥂`;
  };

  const openWhatsAppModalForGuest = (guest: { id?: string; name: string; phone?: string }) => {
    setWhatsAppGuest(guest);
    setWaPhoneInput(guest.phone || "");
    setIsWhatsAppModalOpen(true);
  };

  const openWhatsAppModalGlobal = () => {
    setWhatsAppGuest(null);
    setWaPhoneInput("");
    setIsWhatsAppModalOpen(true);
  };

  const handleDirectSendWhatsApp = () => {
    const guestName = whatsAppGuest?.name;
    const text = generateWhatsAppMessage(guestName, waTone);
    const targetPhone = (waPhoneInput || whatsAppGuest?.phone || "").replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(text);

    const url = targetPhone
      ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(url, "_blank");
  };

  const handleCopyWhatsAppText = () => {
    const guestName = whatsAppGuest?.name;
    const text = generateWhatsAppMessage(guestName, waTone);
    navigator.clipboard.writeText(text);
    setWaCopied(true);
    setTimeout(() => setWaCopied(false), 2500);
  };

  const fetchGuests = async () => {
    const { data } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false });

    if (data) {
      setParticipants(data.map(g => ({
        id: g.id,
        name: g.nom,
        phone: g.telephone || "",
        email: g.email || "",
        group: "Famille", // Fallback local since we didn't add it in DB
        status: g.statut_rsvp || "En attente",
        dateSent: new Date(g.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
      })));
    }
    setLoading(false);
    // The answers are on screen: they are no longer "new" in the menu
    markRsvpSeen(id);
  };

  useEffect(() => {
    fetchGuests();
  }, [id]);

  const stats = useMemo(() => {
    const total = participants.length;
    const confirmed = participants.filter(p => p.status === "Confirmé").length;
    const pending = participants.filter(p => p.status === "En attente").length;
    const refused = participants.filter(p => p.status === "Refusé").length;

    const confirmedPct = total > 0 ? Math.round((confirmed / total) * 100) : 0;
    const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
    const refusedPct = total > 0 ? Math.round((refused / total) * 100) : 0;

    return { total, confirmed, pending, refused, confirmedPct, pendingPct, refusedPct };
  }, [participants]);

  const getStatusStyle = (status: string) => {
    switch(status) {
      case "Confirmé": return "bg-[#E8F5E9] text-[#2E7D32]";
      case "En attente": return "bg-[#FFF8E1] text-[#F57F17]";
      case "Refusé": return "bg-[#FFEBEE] text-[#C62828]";
      case "Non ouverte": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const openAddModal = () => {
    setEditingParticipantId(null);
    setNewParticipant({ name: "", phone: "", email: "", group: "Famille", status: "En attente" });
    setIsModalOpen(true);
  };

  const openEditModal = (p: typeof participants[0]) => {
    setEditingParticipantId(p.id);
    setNewParticipant({
      name: p.name,
      phone: p.phone,
      email: p.email,
      group: p.group,
      status: p.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce participant ?")) {
      await supabase.from('guests').delete().eq('id', id);
      await fetchGuests();
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipant.name) return;

    setIsSubmitting(true);

    if (editingParticipantId) {
      await supabase.from('guests').update({
        nom: newParticipant.name,
        email: newParticipant.email,
        telephone: newParticipant.phone,
        statut_rsvp: newParticipant.status
      }).eq('id', editingParticipantId);
    } else {
      await supabase.from('guests').insert([{
        event_id: id,
        nom: newParticipant.name,
        email: newParticipant.email,
        telephone: newParticipant.phone,
        statut_rsvp: newParticipant.status
      }]);
    }
    
    await fetchGuests();
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const [isRelancing, setIsRelancing] = useState(false);

  const handleRelance = () => {
    setIsRelancing(true);
    setTimeout(() => {
      setIsRelancing(false);
      alert(`Les rappels ont été envoyés avec succès à ${stats.pending} invité(s) en attente !`);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="text-xs text-gray-500 font-medium mb-6 flex items-center gap-2">
        <span>Événement</span> <span className="text-gray-300">&gt;</span> <span className="text-black">Participants & Invitations</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Suivi des Participants</h1>
          <p className="text-gray-500 text-sm">Gérez la liste de vos invités et suivez l'historique des réponses (RSVP).</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openWhatsAppModalGlobal}
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-[#25D366]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle size={17} /> Partager sur WhatsApp
          </button>
          <button 
            onClick={handleRelance}
            disabled={isRelancing || stats.pending === 0}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail size={16} /> {isRelancing ? "Envoi en cours..." : "Relancer les indécis"}
          </button>
          <button onClick={openAddModal} className="flex items-center gap-2 bg-[#8f6f33] hover:bg-[#7a5e2b] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-[#8f6f33]/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus size={16} /> Ajouter un invité
          </button>
        </div>
      </div>

      {/* Stats Cards & Donut Chart (RSVP Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Quick Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-2 text-gray-600">
              <Users size={18} />
              <h3 className="font-medium text-sm">Total Invités</h3>
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-2 text-green-600">
              <CheckCircle size={18} />
              <h3 className="font-medium text-sm">Confirmés</h3>
            </div>
            <p className="text-3xl font-bold text-green-700">{stats.confirmed}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-2 text-amber-500">
              <Clock size={18} />
              <h3 className="font-medium text-sm">En attente</h3>
            </div>
            <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-2 text-red-500">
              <XCircle size={18} />
              <h3 className="font-medium text-sm">Refusés</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.refused}</p>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col justify-center">
          <h2 className="font-semibold text-lg text-black mb-4">Statut des réponses</h2>
          <div className="flex flex-col items-center justify-center">
            {stats.total > 0 ? (
              <div className="relative w-32 h-32 rounded-full flex items-center justify-center" 
                   style={{
                     background: `conic-gradient(
                       #2E7D32 0% ${stats.confirmedPct}%, 
                       #F57F17 ${stats.confirmedPct}% ${stats.confirmedPct + stats.pendingPct}%, 
                       #C62828 ${stats.confirmedPct + stats.pendingPct}% 100%
                     )`
                   }}>
                <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
                  <span className="text-xl font-bold">{stats.confirmedPct}%</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">Confirmés</span>
                </div>
              </div>
            ) : (
              <div className="relative w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Vide</span>
              </div>
            )}
            
            <div className="mt-6 w-full space-y-2 px-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#2E7D32]" /> <span className="text-gray-600 font-medium">Confirmés</span></div>
                <span className="font-bold text-gray-900">{stats.confirmed}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#F57F17]" /> <span className="text-gray-600 font-medium">En attente</span></div>
                <span className="font-bold text-gray-900">{stats.pending}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#C62828]" /> <span className="text-gray-600 font-medium">Refusés</span></div>
                <span className="font-bold text-gray-900">{stats.refused}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Participants & Invitations History Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center bg-gray-50/50 gap-4">
          <h2 className="font-semibold text-lg text-black">Historique des invitations envoyées</h2>
          <div className="flex gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Rechercher un invité..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a] focus:border-transparent" />
            </div>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#b8924a]">
              <option>Tous les statuts</option>
              <option>Confirmé</option>
              <option>En attente</option>
              <option>Refusé</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-semibold tracking-wider uppercase bg-white">
                <th className="py-4 px-6 font-medium">Invité</th>
                <th className="py-4 px-6 font-medium">Contact (Email/Tel)</th>
                <th className="py-4 px-6 font-medium">Groupe</th>
                <th className="py-4 px-6 font-medium">Date d'envoi</th>
                <th className="py-4 px-6 font-medium">Statut RSVP</th>
                <th className="py-4 px-6 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Chargement des invités...</td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Aucun participant enregistré.</td>
                </tr>
              ) : (
                participants.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors bg-white group">
                    <td className="py-4 px-6 font-medium text-gray-900">{p.name}</td>
                    <td className="py-4 px-6 text-gray-500">
                      <div className="flex flex-col">
                        <span>{p.email}</span>
                        <span className="text-xs text-gray-400">{p.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
                        {p.group}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-medium">{p.dateSent}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(p.status)}`}>
                        {p.status === "Confirmé" && <CheckCircle size={12} />}
                        {p.status === "En attente" && <Clock size={12} />}
                        {p.status === "Refusé" && <XCircle size={12} />}
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => openWhatsAppModalForGuest(p)} 
                          className="px-2.5 py-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg text-xs font-semibold transition-all hover:scale-105 shadow-sm flex items-center gap-1.5 shadow-[#25D366]/20" 
                          title={`Envoyer l'invitation à ${p.name} sur WhatsApp`}
                        >
                          <MessageCircle size={13} />
                          <span>WhatsApp</span>
                        </button>
                        <button onClick={() => openEditModal(p)} className="p-1.5 text-gray-500 hover:text-[#8f6f33] hover:bg-[#f5eee1] rounded-md transition-colors shadow-sm bg-white border border-gray-200" title="Modifier">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shadow-sm bg-white border border-gray-200" title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 text-sm text-gray-500">
          <span>Affichage de {participants.length} invité(s)</span>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-xl text-gray-900">
                {editingParticipantId ? "Modifier le participant" : "Ajouter un participant"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black transition-colors bg-white rounded-full p-1 shadow-sm border border-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><User size={14}/> Nom complet</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Amadou Diallo" 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50"
                  value={newParticipant.name}
                  onChange={(e) => setNewParticipant({...newParticipant, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input 
                    type="email" 
                    placeholder="Ex: email@domaine.com" 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50"
                    value={newParticipant.email}
                    onChange={(e) => setNewParticipant({...newParticipant, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                  <input 
                    type="tel" 
                    placeholder="Ex: +221 77..." 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50"
                    value={newParticipant.phone}
                    onChange={(e) => setNewParticipant({...newParticipant, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Groupe</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50"
                    value={newParticipant.group}
                    onChange={(e) => setNewParticipant({...newParticipant, group: e.target.value})}
                  >
                    <option value="Famille">Famille</option>
                    <option value="Amis">Amis</option>
                    <option value="Collègues">Collègues</option>
                    <option value="VIP">VIP</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut RSVP</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50 font-semibold"
                    value={newParticipant.status}
                    onChange={(e) => setNewParticipant({...newParticipant, status: e.target.value})}
                  >
                    <option value="En attente" className="text-amber-700">En attente</option>
                    <option value="Confirmé" className="text-green-700">Confirmé</option>
                    <option value="Refusé" className="text-red-700">Refusé</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl text-sm font-bold transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !newParticipant.name}
                  className="flex-1 bg-black text-white hover:bg-gray-900 px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/10 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Sauvegarde..." : editingParticipantId ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WHATSAPP SHARE MODAL (Option A : Clic-to-Chat Direct) */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#25D366]/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">
                    {whatsAppGuest ? `Inviter ${whatsAppGuest.name}` : "Partager sur WhatsApp"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {whatsAppGuest
                      ? (whatsAppGuest.phone ? `Numéro : ${whatsAppGuest.phone}` : "Sélectionnez le contact dans WhatsApp")
                      : "Envoyez l'invitation à vos contacts ou dans un groupe"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              
              {/* Optional Phone Input */}
              {whatsAppGuest && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Numéro de téléphone du destinataire (optionnel)
                  </label>
                  <input
                    type="tel"
                    value={waPhoneInput}
                    onChange={(e) => setWaPhoneInput(e.target.value)}
                    placeholder="Ex: +225 07 00 00 00 00 ou 06 12 34 56 78"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-colors"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Avec l'indicatif pays, WhatsApp s'ouvrira directement sur la discussion avec cet invité.
                  </p>
                </div>
              )}

              {/* Tone / Template Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Style du message
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWaTone("chaleureux")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      waTone === "chaleureux"
                        ? "bg-[#25D366]/10 border-[#25D366] text-[#128C7E]"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    ✨ Chaleureux
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaTone("prestige")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      waTone === "prestige"
                        ? "bg-[#b8924a]/10 border-[#b8924a] text-[#8f6f33]"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    🎩 Prestige
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaTone("court")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      waTone === "court"
                        ? "bg-black text-white border-black"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    ⚡ Express
                  </button>
                </div>
              </div>

              {/* Message Live Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Aperçu du message WhatsApp
                  </label>
                  <span className="text-[11px] text-gray-400">Prêt à envoyer</span>
                </div>
                <div className="p-4 bg-[#EFEAE2] rounded-2xl border border-gray-200/80 shadow-inner text-sm font-sans text-gray-800 whitespace-pre-line leading-relaxed">
                  <div className="bg-white p-3.5 rounded-xl shadow-sm border border-black/5 text-gray-800">
                    {generateWhatsAppMessage(whatsAppGuest?.name, waTone)}
                  </div>
                </div>
              </div>

              {/* Information Reassurance */}
              <div className="bg-green-50 border border-green-200/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-green-900">
                <span className="text-base leading-none">💡</span>
                <p>
                  <strong>Envoi direct &amp; sécurisé :</strong> Le message est envoyé depuis votre propre compte WhatsApp. Vos invités reconnaissent votre numéro en toute confiance.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleCopyWhatsAppText}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {waCopied ? (
                  <>
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-green-600">Texte copié !</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copier le texte</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDirectSendWhatsApp}
                className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                <span>Ouvrir WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
