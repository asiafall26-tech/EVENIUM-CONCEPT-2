"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MoreHorizontal, User, ShieldCheck, Ban, Eye, Key, Users } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<"users" | "admins">("users");
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");

  const allUsers = [
    { id: "USR-001", name: "Ndeye Astou", email: "ndeye.astou@example.com", role: "Organisateur", plan: "Gold", events: 2, status: "active", joinDate: "Jan 2026" },
    { id: "USR-002", name: "Ousmane Diallo", email: "ousmane.d@example.com", role: "Organisateur", plan: "Premium", events: 1, status: "active", joinDate: "Fev 2026" },
    { id: "USR-003", name: "Aissatou Sy", email: "a.sy@example.com", role: "Organisateur", plan: "Gratuit", events: 0, status: "inactive", joinDate: "Mar 2026" },
    { id: "ADM-001", name: "Cheikh Tidiane", email: "cheikh.admin@evenium.com", role: "Administrateur", plan: "N/A", events: 0, status: "active", joinDate: "Dec 2025" },
    { id: "ADM-002", name: "Fatou Diop", email: "fatou.diop@evenium.com", role: "Administrateur", plan: "N/A", events: 0, status: "active", joinDate: "Nov 2025" },
  ];

  const displayedUsers = activeTab === "users" 
    ? allUsers.filter(u => u.role !== "Administrateur")
    : allUsers.filter(u => u.role === "Administrateur");

  const handleBanSubmit = () => {
    // API Call to ban user would go here
    console.log(`Banning user ${selectedUser} for reason: ${banReason}`);
    setIsBanModalOpen(false);
    setBanReason("");
    setSelectedUser(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Comptes & Permissions</h1>
          <p className="text-gray-500 text-sm">Gérez les comptes clients et l'équipe de la plateforme.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, ID..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] w-64"
            />
          </div>
          {activeTab === "admins" && (
            <button 
              onClick={() => setIsAddAdminModalOpen(true)}
              className="flex items-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md"
            >
              + Ajouter un admin
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab("users")}
          className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === "users" ? "text-[#B8860B]" : "text-gray-500 hover:text-black"}`}
        >
          <div className="flex items-center gap-2"><User size={16}/> Utilisateurs</div>
          {activeTab === "users" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B8860B] rounded-t-full"></span>}
        </button>
        <button 
          onClick={() => setActiveTab("admins")}
          className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === "admins" ? "text-[#B8860B]" : "text-gray-500 hover:text-black"}`}
        >
          <div className="flex items-center gap-2"><ShieldCheck size={16}/> Administrateurs</div>
          {activeTab === "admins" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B8860B] rounded-t-full"></span>}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">ID</th>
              <th className="px-6 py-4 font-medium">Utilisateur</th>
              <th className="px-6 py-4 font-medium">Rôle</th>
              {activeTab === "users" && <th className="px-6 py-4 font-medium">Abonnement</th>}
              <th className="px-6 py-4 font-medium">Inscription</th>
              <th className="px-6 py-4 font-medium">Statut</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 font-mono text-xs font-bold text-gray-400">{user.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-serif font-bold text-sm shrink-0">
                      {user.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <Link href={`/admin/utilisateurs/${user.id}`} className="font-semibold text-gray-900 hover:text-[#B8860B] transition-colors">
                        {user.name}
                      </Link>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    {user.role === 'Administrateur' ? <ShieldCheck size={16} className="text-[#B8860B]" /> : <User size={16} className="text-gray-400" />}
                    {user.role}
                  </div>
                </td>
                {activeTab === "users" && (
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      user.plan === 'Gold' ? 'bg-[#F9F5EC] text-[#B8860B]' : 
                      user.plan === 'Premium' ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {user.plan}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4 text-gray-500">{user.joinDate}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {user.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/utilisateurs/${user.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Voir le profil détaillé">
                      <Eye size={16} />
                    </Link>
                    {user.role !== 'Administrateur' && (
                      <>
                        <button className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors" title="Réinitialiser le mot de passe">
                          <Key size={16} />
                        </button>
                        <button 
                          onClick={() => { setSelectedUser(user.name); setIsBanModalOpen(true); }}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" 
                          title="Suspendre le compte"
                        >
                          <Ban size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Suspendre Utilisateur */}
      <Modal 
        isOpen={isBanModalOpen} 
        onClose={() => setIsBanModalOpen(false)} 
        title="Suspendre le compte utilisateur"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Vous êtes sur le point de suspendre le compte de <span className="font-bold text-black">{selectedUser}</span>.
            Cette action bloquera immédiatement son accès à la plateforme.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raison de la suspension
            </label>
            <textarea 
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none"
              rows={4}
              placeholder="Veuillez préciser la raison (ex: non respect des CGU, fraude...)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              onClick={() => setIsBanModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Annuler
            </button>
            <button 
              onClick={handleBanSubmit}
              disabled={!banReason.trim()}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmer la suspension
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Ajouter un Administrateur (Processus Simple) */}
      <Modal 
        isOpen={isAddAdminModalOpen} 
        onClose={() => setIsAddAdminModalOpen(false)} 
        title="Créer un compte administrateur"
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsAddAdminModalOpen(false); }}>
          <p className="text-sm text-gray-600 mb-4">
            Créez directement le compte de votre collaborateur. Vous pourrez ensuite lui transmettre ses identifiants.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" 
              placeholder="Ex: Amadou Fall"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" 
              placeholder="amadou.fall@evenium.com"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe provisoire</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                defaultValue="Evenium2026!"
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-mono bg-gray-50" 
                required 
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Le collaborateur pourra le modifier plus tard dans ses paramètres.</p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={() => setIsAddAdminModalOpen(false)} 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-[#B8860B] text-white text-sm font-medium rounded-lg hover:bg-[#996B00] transition-colors shadow-md"
            >
              Créer le compte
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
