"use client";

import { Users, Plus, Search, MoreHorizontal, Mail, CheckCircle, Clock, XCircle, ChevronDown, ArrowRight, Edit2, Trash2, X, FileText, User, MessageCircle, Copy, Share2, Sparkles, Send, Lock, Bell } from "lucide-react";
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full h-[80vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl p-5 sm:p-8 lg:p-10 border border-gray-100 shadow-xl max-w-md text-center">
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

  // Relance Modal States
  const [isRelanceModalOpen, setIsRelanceModalOpen] = useState(false);
  const [relanceGuest, setRelanceGuest] = useState<{ id?: string; name: string; phone?: string; email?: string } | null>(null);
  const [relanceTone, setRelanceTone] = useState<"chaleureux" | "prestige" | "court">("chaleureux");
  const [relanceCopied, setRelanceCopied] = useState(false);
  const [isSendingRelanceEmail, setIsSendingRelanceEmail] = useState(false);
  const [relanceNotification, setRelanceNotification] = useState<string | null>(null);

  const pendingGuests = useMemo(() => {
    return participants.filter(p => p.status === "En attente");
  }, [participants]);

  const generateRelanceMessage = (guestName?: string, tone: "chaleureux" | "prestige" | "court" = "chaleureux") => {
    const link = getShareUrl();
    const greeting = guestName ? `Bonjour ${guestName} !` : "Bonjour !";
    const dateText = event.date ? ` prévu le *${event.date}*` : "";

    if (tone === "prestige") {
      return (
        `⚜️ *RAPPEL DISTINGUÉ · ${event.name.toUpperCase()}*\n\n` +
        `${greeting}\n\n` +
        `À l'approche de la prestigieuse réception *${event.name}*${dateText}, nous serions particulièrement honorés de vous compter parmi nos invités de marque.\n\n` +
        `Afin de nous permettre de parfaire notre organisation et vos cartons d'honneur, nous vous remercions de bien vouloir confirmer votre présence via ce lien sécurisé :\n` +
        `👉 ${link}\n\n` +
        `Dans l'attente du plaisir de vous compter parmi nous.`
      );
    }

    if (tone === "court") {
      return (
        `⚡ *RAPPEL EXPRESS · ${event.name.toUpperCase()}* 🥂\n\n` +
        `${greeting}\n` +
        `Petit rappel amical : nous finalisons la liste des convives pour *${event.name}*${dateText}.\n` +
        `Merci de confirmer ta présence en 1 clic ici :\n` +
        `👉 ${link}\n\n` +
        `À très vite ! 🎉`
      );
    }

    // Chaleureux par défaut
    return (
      `✨ *PETIT RAPPEL AMICAL · ${event.name}* ✨\n\n` +
      `${greeting}\n\n` +
      `Nous sommes en plein dans les préparatifs de *${event.name}*${dateText} et nous serions tellement heureux de t'avoir à nos côtés pour faire la fête !\n\n` +
      `Peux-tu s'il te plaît nous confirmer ta présence en quelques secondes sur ton invitation ?\n` +
      `👉 ${link}\n\n` +
      `Merci d'avance et hâte de célébrer ce moment inoubliable ensemble ! 🎉🥂`
    );
  };

  const handleCopyRelanceText = () => {
    const text = generateRelanceMessage(relanceGuest?.name, relanceTone);
    navigator.clipboard.writeText(text);
    setRelanceCopied(true);
    setTimeout(() => setRelanceCopied(false), 2500);
  };

  const handleSendRelanceWhatsApp = (guest?: { name: string; phone?: string }) => {
    const g = guest || relanceGuest;
    const text = generateRelanceMessage(g?.name, relanceTone);
    const targetPhone = (g?.phone || "").replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(text);
    const url = targetPhone
      ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, "_blank");
  };

  const handleSendRelanceEmails = () => {
    setIsSendingRelanceEmail(true);
    setTimeout(() => {
      setIsSendingRelanceEmail(false);
      setRelanceNotification(`Les rappels ont été envoyés avec succès à ${pendingGuests.length} invité(s) indécis !`);
      setTimeout(() => setRelanceNotification(null), 5000);
      setIsRelanceModalOpen(false);
    }, 1200);
  };

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tous" | "Confirmé" | "En attente" | "Refusé">("Tous");
  const visibleParticipants = participants.filter((p) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || [p.name, p.email, p.phone, p.group].some((v) => String(v ?? "").toLowerCase().includes(q));
    return matchesQuery && (statusFilter === "Tous" || p.status === statusFilter);
  });

  return (
    <div className="max-w-5xl mx-auto w-full space-y-5 sm:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#8f6f33]">Invités & RSVP</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-gray-900 leading-tight">Mes invités</h1>
          <p className="text-gray-500 text-sm mt-1">Ajoutez vos invités, envoyez l&apos;invitation et suivez leurs réponses.</p>
        </div>
        <button onClick={openAddModal} className="inline-flex items-center justify-center gap-2 bg-black text-[#f5eee1] px-5 py-3 rounded-full text-sm font-semibold shadow-md cursor-pointer">
          <Plus size={17} /> Ajouter un invité
        </button>
      </div>

      {/* Chiffres */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Invités", value: stats.total, color: "text-gray-900", icon: Users },
            { label: "Confirmés", value: stats.confirmed, color: "text-green-700", icon: CheckCircle },
            { label: "En attente", value: stats.pending, color: "text-amber-600", icon: Clock },
            { label: "Refusés", value: stats.refused, color: "text-red-600", icon: XCircle },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl bg-gray-50/80 border border-gray-100 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <k.icon size={13} /> {k.label}
              </p>
              <p className={`font-serif text-3xl mt-1 ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Taux de confirmation</span>
            <span className="font-semibold text-gray-900">{stats.confirmedPct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden flex">
            <div className="h-full bg-[#2E7D32]" style={{ width: `${stats.confirmedPct}%` }} />
            <div className="h-full bg-[#F57F17]" style={{ width: `${stats.pendingPct}%` }} />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={openWhatsAppModalGlobal}
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            <MessageCircle size={17} /> Partager sur WhatsApp
          </button>
          <button
            type="button"
            onClick={() => {
              setRelanceGuest(null);
              setIsRelanceModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-[#8f6f33] hover:bg-[#7a5e2b] text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Bell size={16} /> Relancer les indécis ({stats.pending})
          </button>
        </div>

        {relanceNotification && (
          <div className="mt-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            <span>{relanceNotification}</span>
          </div>
        )}
      </section>

      {/* Liste */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="p-4 sm:p-5 border-b border-gray-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un invité, un téléphone, un groupe…"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {([
              ["Tous", stats.total],
              ["Confirmé", stats.confirmed],
              ["En attente", stats.pending],
              ["Refusé", stats.refused],
            ] as const).map(([label, count]) => (
              <button
                key={label}
                type="button"
                onClick={() => setStatusFilter(label)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${statusFilter === label ? "bg-[#2b2118] text-[#f5eee1] border-[#2b2118]" : "bg-white text-gray-600 border-gray-200"}`}
              >
                {label === "Tous" ? "Tous" : label === "Confirmé" ? "Confirmés" : label === "Refusé" ? "Refusés" : "En attente"} · {count}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="py-10 text-center text-gray-500 text-sm">Chargement des invités...</p>
        ) : visibleParticipants.length === 0 ? (
          <div className="py-10 px-6 text-center">
            <p className="text-gray-500 text-sm">{participants.length === 0 ? "Aucun invité pour le moment." : "Aucun invité ne correspond à votre recherche."}</p>
            {participants.length === 0 && (
              <button onClick={openAddModal} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#8f6f33]">
                <Plus size={15} /> Ajouter mon premier invité
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {visibleParticipants.map((p) => (
              <li key={p.id} className="px-4 sm:px-5 py-3.5 flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-full bg-[#f5eee1] text-[#7a5e2b] flex items-center justify-center text-xs font-bold">
                  {String(p.name || "?").trim().slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusStyle(p.status)}`}>
                      {p.status === "Confirmé" && <CheckCircle size={11} />}
                      {p.status === "En attente" && <Clock size={11} />}
                      {p.status === "Refusé" && <XCircle size={11} />}
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {[p.phone, p.email, p.group, p.dateSent].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  {p.status === "En attente" && (
                    <button
                      onClick={() => {
                        setRelanceGuest(p);
                        setIsRelanceModalOpen(true);
                      }}
                      className="w-9 h-9 rounded-full bg-[#8f6f33]/15 text-[#8f6f33] hover:bg-[#8f6f33] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title={`Relancer ${p.name}`}
                      aria-label={`Relancer ${p.name}`}
                    >
                      <Bell size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => openWhatsAppModalForGuest(p)}
                    className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center"
                    title={`Envoyer l'invitation à ${p.name} sur WhatsApp`}
                    aria-label={`WhatsApp à ${p.name}`}
                  >
                    <MessageCircle size={16} />
                  </button>
                  <button onClick={() => openEditModal(p)} className="w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center" aria-label={`Modifier ${p.name}`}>
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="w-9 h-9 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center" aria-label={`Supprimer ${p.name}`}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="px-4 sm:px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
          {visibleParticipants.length} invité(s) affiché(s) sur {participants.length}
        </p>
      </section>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92dvh] overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 pb-[env(safe-area-inset-bottom)]">
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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

      {/* MODALE DE RELANCE DES INDÉCIS */}
      {isRelanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#b8924a]/15 via-white to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#8f6f33] text-white flex items-center justify-center shadow-lg shadow-[#8f6f33]/30">
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">
                    {relanceGuest ? `Relancer ${relanceGuest.name}` : `Relancer les indécis (${pendingGuests.length})`}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {relanceGuest
                      ? "Envoyez un message de rappel personnalisé à cet invité"
                      : "Rappelez aux invités en attente de confirmer leur présence"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsRelanceModalOpen(false);
                  setRelanceGuest(null);
                }}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {pendingGuests.length === 0 && !relanceGuest ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle size={28} />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-gray-900">Aucun invité indécis !</h4>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Tous vos invités actuels ont déjà répondu ou vous n&apos;avez aucun invité avec le statut &quot;En attente&quot;.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRelanceModalOpen(false);
                      openAddModal();
                    }}
                    className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-[#f5eee1] text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <Plus size={14} /> Ajouter un invité
                  </button>
                </div>
              ) : (
                <>
                  {/* Style selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Style du message de rappel
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRelanceTone("chaleureux")}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                          relanceTone === "chaleureux"
                            ? "bg-[#b8924a]/15 border-[#b8924a] text-[#8f6f33]"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        ✨ Chaleureux
                      </button>
                      <button
                        type="button"
                        onClick={() => setRelanceTone("prestige")}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                          relanceTone === "prestige"
                            ? "bg-black text-white border-black"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        🎩 Prestige
                      </button>
                      <button
                        type="button"
                        onClick={() => setRelanceTone("court")}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                          relanceTone === "court"
                            ? "bg-[#25D366]/15 border-[#25D366] text-[#128C7E]"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        ⚡ Express
                      </button>
                    </div>
                  </div>

                  {/* Message preview */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Aperçu du rappel
                      </label>
                      <span className="text-[11px] text-[#8f6f33] font-semibold">Message personnalisé</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs sm:text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                      {generateRelanceMessage(relanceGuest?.name, relanceTone)}
                    </div>
                  </div>

                  {/* Actions principales */}
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSendRelanceWhatsApp()}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25 transition-all cursor-pointer"
                      >
                        <MessageCircle size={18} />
                        <span>Relancer sur WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyRelanceText}
                        className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          relanceCopied
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        }`}
                      >
                        {relanceCopied ? <CheckCircle size={18} /> : <Copy size={18} />}
                        <span>{relanceCopied ? "Message copié !" : "Copier le message"}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendRelanceEmails}
                      disabled={isSendingRelanceEmail}
                      className="w-full py-3 px-4 rounded-xl bg-black hover:bg-gray-900 text-[#f5eee1] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Mail size={16} />
                      <span>{isSendingRelanceEmail ? "Envoi des rappels en cours..." : `Envoyer un rappel email aux ${pendingGuests.length} indécis`}</span>
                    </button>
                  </div>

                  {/* Liste des indécis avec action individuelle rapide */}
                  {!relanceGuest && pendingGuests.length > 0 && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                        Relance individuelle par invité ({pendingGuests.length}) :
                      </p>
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {pendingGuests.map((guest) => (
                          <div key={guest.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                            <div className="min-w-0 pr-2">
                              <p className="font-semibold text-gray-900 truncate">{guest.name}</p>
                              <p className="text-gray-500 truncate">{guest.phone || guest.email || "Sans coordonnées"}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSendRelanceWhatsApp(guest)}
                              className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-bold flex items-center gap-1 shrink-0 hover:bg-[#128C7E] transition-colors cursor-pointer"
                            >
                              <MessageCircle size={13} /> Relancer
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
