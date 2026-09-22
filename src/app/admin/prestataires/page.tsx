"use client";

import { useState } from "react";
import { Search, Filter, Store, Star, CheckCircle, Clock, XCircle, MoreHorizontal, Trash2, Eye, Ban } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export default function AdminPrestatairesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExcludeModalOpen, setIsExcludeModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [excludeReason, setExcludeReason] = useState("");

  const prestataires = [
    { id: "PR-01", name: "Saveurs d'Afrique", category: "Traiteur", rating: 4.8, events: 15, status: "active", revenue: "1 250 000 FCFA", adhesion: "Payée", isPlatformProvider: true },
    { id: "PR-02", name: "Studio Lumière", category: "Photographe", rating: 4.9, events: 32, status: "active", revenue: "4 800 000 FCFA", adhesion: "Payée", isPlatformProvider: true },
    { id: "PR-03", name: "Floral Design", category: "Décoration", rating: 4.7, events: 8, status: "pending", revenue: "0 FCFA", adhesion: "En attente", isPlatformProvider: true },
    { id: "PR-05", name: "Sons & Rythmes (DJ)", category: "Animation", rating: null, events: 1, status: "active", revenue: "N/A", adhesion: "N/A", isPlatformProvider: false },
  ];

  const handleExcludeSubmit = () => {
    console.log(`Excluding provider ${selectedProvider} for reason: ${excludeReason}`);
    setIsExcludeModalOpen(false);
    setExcludeReason("");
    setSelectedProvider(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Prestataires Partenaires</h1>
          <p className="text-gray-500 text-sm">Gérez l'annuaire des professionnels inscrits sur la plateforme.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] w-64"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Filter size={16} /> Filtrer
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md"
          >
            + Ajouter un prestataire
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Prestataire</th>
              <th className="px-6 py-4 font-medium">Catégorie</th>
              <th className="px-6 py-4 font-medium">Évaluation</th>
              <th className="px-6 py-4 font-medium">Événements</th>
              <th className="px-6 py-4 font-medium">CA Généré</th>
              <th className="px-6 py-4 font-medium">Adhésion</th>
              <th className="px-6 py-4 font-medium">Statut</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {prestataires.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${p.isPlatformProvider ? 'bg-gray-100 text-[#B8860B]' : 'bg-gray-100 text-gray-400'}`}>
                      <Store size={18} />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 flex items-center gap-2">
                        {p.name}
                        {p.isPlatformProvider ? (
                          <span className="bg-[#F9F5EC] text-[#B8860B] text-[9px] uppercase px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-bold">
                            <CheckCircle size={8}/> Evenium
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 text-[9px] uppercase px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-bold">
                            Externe
                          </span>
                        )}
                      </span>
                      {!p.isPlatformProvider && <p className="text-[10px] text-gray-400 mt-0.5">Ajouté par un organisateur</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{p.category}</td>
                <td className="px-6 py-4">
                  {p.rating ? (
                    <div className="flex items-center gap-1 text-gray-700">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{p.rating}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600">{p.events} réalisés</td>
                <td className="px-6 py-4 font-medium text-gray-900">{p.revenue}</td>
                <td className="px-6 py-4">
                  {p.isPlatformProvider ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      p.adhesion === 'Payée' ? 'bg-[#F9F5EC] text-[#B8860B]' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.adhesion}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs italic">Hors plateforme</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    p.status === 'active' ? 'bg-green-50 text-green-700' : 
                    p.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {p.status === 'active' && <CheckCircle size={12} />}
                    {p.status === 'pending' && <Clock size={12} />}
                    {p.status === 'suspended' && <XCircle size={12} />}
                    {p.status === 'active' ? 'Actif' : p.status === 'pending' ? 'En validation' : 'Suspendu'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Voir le profil détaillé">
                      <Eye size={16} />
                    </button>
                    {p.status === 'pending' && (
                      <button className="p-1.5 text-gray-400 hover:text-green-600 transition-colors" title="Approuver ce prestataire">
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {p.status === 'active' && (
                      <button className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors" title="Suspendre temporairement">
                        <Ban size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => { setSelectedProvider(p.name); setIsExcludeModalOpen(true); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" 
                      title="Exclure définitivement de la base"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Provider Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Ajouter un prestataire">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" required>
                <option value="">Sélectionner...</option>
                <option value="Traiteur">Traiteur</option>
                <option value="Photographe">Photographe</option>
                <option value="Décoration">Décoration</option>
                <option value="Animation">Animation</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
            <input type="email" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
            <input type="tel" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" required>
                <option value="">Sélectionner...</option>
                <option value="Sénégal">Sénégal</option>
                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                <option value="Cameroun">Cameroun</option>
                <option value="Mali">Mali</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Région / Ville</label>
              <input type="text" placeholder="Ex: Dakar" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" required />
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors">
              Annuler
            </button>
            <button type="submit" className="px-4 py-2 bg-[#B8860B] text-white text-sm font-medium rounded-lg hover:bg-[#996B00] transition-colors">
              Ajouter le prestataire
            </button>
          </div>
        </form>
      </Modal>

      {/* Exclude Provider Modal */}
      <Modal isOpen={isExcludeModalOpen} onClose={() => setIsExcludeModalOpen(false)} title="Exclure un prestataire">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Vous allez exclure définitivement <span className="font-bold text-black">{selectedProvider}</span> de la plateforme.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motif de l'exclusion</label>
            <textarea 
              value={excludeReason}
              onChange={(e) => setExcludeReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none"
              rows={4}
              placeholder="Veuillez préciser la raison..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setIsExcludeModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors">
              Annuler
            </button>
            <button 
              onClick={handleExcludeSubmit}
              disabled={!excludeReason.trim()}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Exclure définitivement
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
