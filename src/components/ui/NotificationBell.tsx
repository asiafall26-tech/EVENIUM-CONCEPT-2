"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, MessageSquare, Clock, AlertTriangle, ArrowRight, LifeBuoy, Inbox, Star, FileText, Users, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAdminAlertsAndAutoTerminate } from "@/app/admin/admin-actions";
import { messagesHref, totalNewRsvps, totalPending, useBadgeStore } from "@/store/BadgeStore";

const s = (n: number) => (n > 1 ? "s" : "");

interface NotificationBellProps {
  role?: "client" | "prestataire" | "admin";
}

export function NotificationBell({ role }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const counts = useBadgeStore();
  const { unreadMessages, pendingSupport, newPrestataires, pendingDemandes, unansweredReviews, pendingDevis, newRsvps } = counts;
  const rsvpTotal = totalNewRsvps(newRsvps);
  const firstRsvpEvent = Object.keys(newRsvps)[0];

  // Live counters first: they stay until the items are handled (message read, complaint resolved…)
  const pending = [
    role === "admin" && pendingSupport > 0 && {
      id: "pending-support",
      title: `${pendingSupport} réclamation${s(pendingSupport)} en attente`,
      desc: "Des utilisateurs attendent une réponse du support.",
      time: "À traiter",
      link: "/admin/support",
      bg: "bg-red-100 text-red-700",
      icon: <LifeBuoy size={18} />,
    },
    role === "admin" && newPrestataires > 0 && {
      id: "new-prestataires",
      title: `${newPrestataires} nouveau${newPrestataires > 1 ? "x" : ""} prestataire${s(newPrestataires)} inscrit${s(newPrestataires)}`,
      desc: "Vérifiez leur profil dans l'annuaire des prestataires.",
      time: "Prestataires",
      link: "/admin/prestataires",
      bg: "bg-violet-100 text-violet-700",
      icon: <Store size={18} />,
    },
    role === "prestataire" && pendingDemandes > 0 && {
      id: "pending-demandes",
      title: `${pendingDemandes} demande${s(pendingDemandes)} à traiter`,
      desc: "Nouvelles demandes de devis ou modifications demandées par vos clients.",
      time: "Demandes & Devis",
      link: "/prestataire/demandes",
      bg: "bg-blue-100 text-blue-700",
      icon: <Inbox size={18} />,
    },
    role === "prestataire" && unansweredReviews > 0 && {
      id: "unanswered-reviews",
      title: `${unansweredReviews} avis sans réponse`,
      desc: "Répondez à vos clients pour soigner votre réputation.",
      time: "Avis clients",
      link: "/prestataire/avis",
      bg: "bg-amber-100 text-amber-700",
      icon: <Star size={18} />,
    },
    role === "client" && pendingDevis > 0 && {
      id: "pending-devis",
      title: `${pendingDevis} devis à valider`,
      desc: "Des prestataires attendent votre réponse.",
      time: "Mes Devis",
      link: "/dashboard/devis",
      bg: "bg-blue-100 text-blue-700",
      icon: <FileText size={18} />,
    },
    role === "client" && rsvpTotal > 0 && {
      id: "new-rsvps",
      title: `${rsvpTotal} nouvelle${s(rsvpTotal)} réponse${s(rsvpTotal)} d'invités`,
      desc: "Des invités ont confirmé ou décliné votre invitation.",
      time: "Invités & RSVP",
      link: `/dashboard/events/${firstRsvpEvent}/participants`,
      bg: "bg-emerald-100 text-emerald-700",
      icon: <Users size={18} />,
    },
    unreadMessages > 0 && {
      id: "unread-messages",
      title: `${unreadMessages} message${s(unreadMessages)} non lu${s(unreadMessages)}`,
      desc: "Ouvrez la messagerie pour les consulter.",
      time: "Messagerie",
      link: messagesHref(role ?? null),
      bg: "bg-[#f5eee1] text-[#8f6f33]",
      icon: <MessageSquare size={18} />,
    },
  ].filter(Boolean) as any[];
  const allNotifications = [...pending, ...notifications];
  const total = totalPending(counts) + notifications.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadNotifications() {
      if (role === "admin") {
        try {
          const res = await getAdminAlertsAndAutoTerminate();
          if (res.alerts && res.alerts.length > 0) {
            const mapped = res.alerts.slice(0, 10).map((a) => {
              const isReminder = a.type === "pending_reminder";
              const isAuto = a.type === "auto_terminated";
              return {
                id: a.id,
                title: a.title,
                desc: a.message,
                time: a.badge,
                link: `/admin/evenements/${a.eventId}`,
                bg: isReminder ? "bg-amber-100 text-amber-700" : isAuto ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700",
                icon: isReminder ? <Clock size={18} /> : isAuto ? <CheckCircle size={18} /> : <AlertTriangle size={18} />
              };
            });
            setNotifications(mapped);
          }
        } catch (_) {}
      }
    }
    loadNotifications();
  }, [role]);

  const markAllAsRead = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  const handleNotificationClick = (notif: any) => {
    setNotifications(notifications.filter((n) => n.id !== notif.id));
    if (notif.link) {
      setIsOpen(false);
      router.push(notif.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={total > 0 ? `Notifications : ${total} en attente` : "Notifications"}
        className="relative w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md"
      >
        <Bell size={20} />
        {total > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-[#E53935] rounded-full ring-2 ring-white animate-in zoom-in">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-3 top-[4.25rem] max-h-[75dvh] overflow-y-auto sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-96 sm:max-h-none bg-white rounded-2xl shadow-[0_25px_60px_-20px_rgba(40,25,5,0.35)] border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">Notifications &amp; Alertes</h3>
            {total > 0 && (
              <span className="text-xs font-medium text-[#8f6f33] bg-[#f5eee1] px-2 py-1 rounded-full">
                {total} en attente
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {allNotifications.length === 0 ? (
              <div className="p-4 sm:p-6 lg:p-8 text-center text-gray-500">
                <Bell className="mx-auto mb-3 opacity-20" size={32} />
                <p className="text-sm">Vous n'avez aucune nouvelle notification.</p>
              </div>
            ) : (
              allNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif)}
                  className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-4 items-start group"
                >
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center mt-1 ${notif.bg}`}>
                    {notif.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#b8924a] transition-colors">{notif.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.desc}</p>
                    <span className="text-[10px] font-medium text-gray-400 mt-2 block">{notif.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs">
            {role === "admin" && (
              <Link
                href="/admin/alertes"
                onClick={() => setIsOpen(false)}
                className="font-bold text-[#8f6f33] hover:text-black flex items-center gap-1 transition-colors"
              >
                <span>Toutes les alertes</span>
                <ArrowRight size={13} />
              </Link>
            )}
            <button 
              type="button"
              onClick={markAllAsRead}
              className="text-gray-500 hover:text-black transition-colors ml-auto font-medium"
            >
              Marquer tout comme lu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
