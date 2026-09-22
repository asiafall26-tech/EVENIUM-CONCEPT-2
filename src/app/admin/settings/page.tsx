"use client";

import { Save, User, Lock, Bell, Globe, Key, ShieldCheck, Smartphone, Check } from "lucide-react";
import { useState } from "react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"profil" | "securite" | "notifications" | "langues">("profil");

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Paramètres</h1>
          <p className="text-gray-500 text-sm">Gérez les préférences de votre compte administrateur.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-colors">
          <Save size={16} /> Enregistrer
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab("profil")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 font-semibold rounded-lg text-sm transition-colors ${activeTab === 'profil' ? 'bg-gray-50 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}
            >
              <User size={18} className={activeTab === 'profil' ? 'text-[#B8860B]' : ''} /> Profil
            </button>
            <button 
              onClick={() => setActiveTab("securite")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 font-semibold rounded-lg text-sm transition-colors ${activeTab === 'securite' ? 'bg-gray-50 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}
            >
              <Lock size={18} className={activeTab === 'securite' ? 'text-[#B8860B]' : ''} /> Sécurité
            </button>
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 font-semibold rounded-lg text-sm transition-colors ${activeTab === 'notifications' ? 'bg-gray-50 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}
            >
              <Bell size={18} className={activeTab === 'notifications' ? 'text-[#B8860B]' : ''} /> Notifications
            </button>
            <button 
              onClick={() => setActiveTab("langues")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 font-semibold rounded-lg text-sm transition-colors ${activeTab === 'langues' ? 'bg-gray-50 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}
            >
              <Globe size={18} className={activeTab === 'langues' ? 'text-[#B8860B]' : ''} /> Langue & Région
            </button>
          </nav>
        </div>

        {/* Form Content */}
        <div className="flex-1 space-y-6">
          
          {/* TAB: PROFIL */}
          {activeTab === "profil" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Informations Personnelles</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center font-serif font-bold text-2xl">
                  NA
                </div>
                <div>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 mb-2">
                    Changer d'avatar
                  </button>
                  <p className="text-xs text-gray-400">JPG, GIF ou PNG. 1MB max.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                  <input type="text" defaultValue="Ndeye" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                  <input type="text" defaultValue="Astou" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse Email</label>
                <input type="email" defaultValue="admin@evenium.com" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Rôle</label>
                <input type="text" defaultValue="Administrateur Principal" disabled className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-2">Votre rôle définit vos permissions sur la plateforme.</p>
              </div>
            </div>
          )}

          {/* TAB: SECURITE */}
          {activeTab === "securite" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Mot de passe</h2>
                <p className="text-gray-500 text-sm mb-6">Modifiez votre mot de passe pour sécuriser votre compte admin.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe actuel</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="password" placeholder="••••••••" className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="password" placeholder="••••••••" className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="password" placeholder="••••••••" className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Double Authentification (2FA)</h2>
                    <p className="text-gray-500 text-sm max-w-md">Renforcez la sécurité de votre compte administrateur en exigeant un code temporaire lors de la connexion.</p>
                  </div>
                  <ShieldCheck size={40} className="text-[#D4AF37] opacity-20" />
                </div>
                
                <div className="mt-6 p-4 border border-gray-200 rounded-xl bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">Application d'authentification</h4>
                      <p className="text-xs text-gray-500">Google Authenticator, Authy...</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-800 transition-colors">
                    Activer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Notifications Système</h2>
              <p className="text-gray-500 text-sm mb-6">Sélectionnez les événements pour lesquels vous souhaitez recevoir une alerte par email.</p>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-5">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-[#D4AF37] rounded border-gray-300 focus:ring-[#D4AF37]" />
                    <div>
                      <div className="font-semibold text-sm text-gray-900">Nouveaux inscrits</div>
                      <div className="text-xs text-gray-500 mt-1">Être alerté lors de l'inscription d'un nouvel organisateur ou prestataire.</div>
                    </div>
                  </label>
                  
                  <div className="h-px bg-gray-200 w-full"></div>

                  <label className="flex items-start gap-4 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-[#D4AF37] rounded border-gray-300 focus:ring-[#D4AF37]" />
                    <div>
                      <div className="font-semibold text-sm text-gray-900">Paiements et Souscriptions</div>
                      <div className="text-xs text-gray-500 mt-1">Recevoir un résumé lorsqu'un utilisateur souscrit à la formule Gold.</div>
                    </div>
                  </label>

                  <div className="h-px bg-gray-200 w-full"></div>

                  <label className="flex items-start gap-4 cursor-pointer">
                    <input type="checkbox" className="mt-1 w-4 h-4 text-[#D4AF37] rounded border-gray-300 focus:ring-[#D4AF37]" />
                    <div>
                      <div className="font-semibold text-sm text-gray-900">Rapports d'erreurs (Technique)</div>
                      <div className="text-xs text-gray-500 mt-1">Être notifié en cas d'erreur serveur critique ou de panne technique.</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LANGUES ET REGION */}
          {activeTab === "langues" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Langue & Région</h2>
              <p className="text-gray-500 text-sm mb-6">Définissez vos préférences régionales pour l'interface de gestion.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Langue de l'interface</label>
                  <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]">
                    <option value="fr">Français (France)</option>
                    <option value="en">English (US)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fuseau Horaire</label>
                  <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]">
                    <option value="GMT">Heure moyenne de Greenwich (GMT/UTC)</option>
                    <option value="CET">Heure normale d'Europe centrale (CET)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Devise par défaut pour les rapports</label>
                  <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]">
                    <option value="XOF">Franc CFA (XOF)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar US ($)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
