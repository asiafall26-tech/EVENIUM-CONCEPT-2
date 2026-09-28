"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  name: string;
  role: string;
  initials: string;
  avatarColor: string;
  profileHref: string;
}

export function UserMenu({ name, role, initials, avatarColor, profileHref }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Dans le futur: supabase.auth.signOut()
    router.push('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-gray-50 transition-colors"
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${avatarColor}`}>
          {initials}
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-black leading-tight">{name}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="p-2 space-y-1">
            <Link 
              href={profileHref}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-colors"
            >
              <User size={16} className="text-gray-400" />
              Mon Profil
            </Link>
            <Link 
              href={profileHref}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-colors"
            >
              <Settings size={16} className="text-gray-400" />
              Paramètres
            </Link>
          </div>
          <div className="p-2 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={16} className="text-red-500" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
