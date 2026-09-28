"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, FileText, CheckCircle, MessageSquare, X } from "lucide-react";
import Link from "next/link";

interface NotificationBellProps {
  role: "client" | "prestataire";
}

export function NotificationBell({ role }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Faux notifications selon le rôle (état local pour les rendre supprimables/lues)
  const initialNotifications = role === "prestataire" ? [
    {
      id: 1,
      title: "Nouvelle demande de devis",
      desc: "Ndeye Astou vous a envoyé une demande pour le Mariage de N&D.",
      time: "Il y a 5 min",
      icon: <FileText size={16} className="text-[#B8860B]" />,
      bg: "bg-[#F9F5EC]"
    },
    {
      id: 2,
      title: "Nouveau message",
      desc: "Fatou a répondu à votre message concernant le baptême.",
      time: "Il y a 2 heures",
      icon: <MessageSquare size={16} className="text-blue-500" />,
      bg: "bg-blue-50"
    }
  ] : [
    {
      id: 1,
      title: "Devis accepté !",
      desc: "Studio Lumière a accepté votre demande de devis.",
      time: "Il y a 10 min",
      icon: <CheckCircle size={16} className="text-green-500" />,
      bg: "bg-green-50"
    },
    {
      id: 2,
      title: "Nouveau message",
      desc: "Saveurs d'Afrique vous a envoyé un document.",
      time: "Il y a 1 heure",
      icon: <MessageSquare size={16} className="text-blue-500" />,
      bg: "bg-blue-50"
    }
  ];

  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllAsRead = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  const handleNotificationClick = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
    if (notifications.length === 1) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-500 hover:text-black transition-colors p-2 rounded-full hover:bg-gray-100"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#D4AF37] rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {notifications.length > 0 && (
              <span className="text-xs font-medium text-[#B8860B] bg-[#F9F5EC] px-2 py-1 rounded-full">
                {notifications.length} nouvelle{notifications.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="mx-auto mb-3 opacity-20" size={32} />
                <p className="text-sm">Vous n'avez aucune nouvelle notification.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif.id)}
                  className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-4 items-start group"
                >
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center mt-1 ${notif.bg}`}>
                    {notif.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#D4AF37] transition-colors">{notif.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.desc}</p>
                    <span className="text-[10px] font-medium text-gray-400 mt-2 block">{notif.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div 
              onClick={markAllAsRead}
              className="p-3 border-t border-gray-100 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <span className="text-xs font-medium text-gray-600">Marquer tout comme lu</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
