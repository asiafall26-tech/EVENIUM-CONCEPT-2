"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, LayoutList, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal"; // Assuming this handles its own close logic normally, but here we control it

export default function PrestataireCataloguePage() {
  const [offres, setOffres] = useState([
    { id: 1, title: "Menu Dégustation VIP", description: "Menu complet avec entrée, plat de résistance (viande/poisson), dessert et boissons locales. Service à table inclus.", price: "15 000 FCFA / pax", category: "Mariage & Gala", status: "actif" },
    { id: 2, title: "Buffet Classique Africain", description: "Grand buffet comprenant Thiéboudienne, Yassa, et grillades. Idéal pour les grands événements.", price: "8 000 FCFA / pax", category: "Tous événements", status: "actif" },
    { id: 3, title: "Pause Café / Goûter", description: "Viennoiseries, beignets locaux, thé, café et jus naturels. Parfait pour les séminaires.", price: "3 500 FCFA / pax", category: "Entreprise", status: "inactif" },
  ]);

  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [newOffer, setNewOffer] = useState({ title: "", description: "", price: "", category: "Tous événements", image: "" });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setNewOffer(prev => ({ ...prev, image: imageUrl }));
    }
  };

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.title || !newOffer.price) return;
    
    setOffres([...offres, {
      id: Date.now(),
      title: newOffer.title,
      description: newOffer.description,
      price: newOffer.price,
      category: newOffer.category,
      status: "actif",
      image: newOffer.image
    } as any]);
    
    setIsAddOfferOpen(false);
    setNewOffer({ title: "", description: "", price: "", category: "Tous événements", image: "" });
  };

  const deleteOffer = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      setOffres(offres.filter(o => o.id !== id));
    }
  };

  const toggleStatus = (id: number) => {
    setOffres(offres.map(o => o.id === id ? { ...o, status: o.status === 'actif' ? 'inactif' : 'actif' } : o));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Catalogue d'Offres</h1>
          <p className="text-gray-500 text-sm">Gérez les prestations et menus que vous proposez aux organisateurs.</p>
        </div>
        <button 
          onClick={() => setIsAddOfferOpen(true)}
          className="flex items-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-colors"
        >
          <Plus size={18} /> Ajouter une offre
        </button>
      </div>

      {offres.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <LayoutList size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Votre catalogue est vide</h3>
          <p className="text-gray-500 text-sm max-w-md mb-6">
            Ajoutez des offres spécifiques (packs, menus, services) pour que les organisateurs sachent exactement ce que vous proposez.
          </p>
          <button 
            onClick={() => setIsAddOfferOpen(true)}
            className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Créer ma première offre
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offres.map((offre) => (
            <div key={offre.id} className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col ${offre.status === 'inactif' ? 'opacity-70' : ''}`}>
              <div 
                className="h-40 bg-gray-100 flex items-center justify-center relative cursor-pointer bg-cover bg-center" 
                style={ (offre as any).image ? { backgroundImage: `url(${(offre as any).image})` } : {} }
                onClick={() => toggleStatus(offre.id)} 
                title="Cliquer pour changer le statut"
              >
                {!(offre as any).image && <ImageIcon size={32} className="text-gray-300" />}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md shadow-sm ${
                    offre.status === 'actif' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    {offre.status}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1" title={offre.title}>{offre.title}</h3>
                </div>
                <p className="text-xs text-[#B8860B] font-medium mb-3 uppercase tracking-wider">{offre.category}</p>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                  {offre.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <span className="font-bold text-gray-900">{offre.price}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-md transition-colors" title="Modifier">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deleteOffer(offre.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-md transition-colors" title="Supprimer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Offer Modal */}
      {isAddOfferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900">Nouvelle offre / prestation</h3>
              <button onClick={() => setIsAddOfferOpen(false)} className="text-gray-400 hover:text-black transition-colors bg-white rounded-full p-1.5 shadow-sm border border-gray-200">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddOffer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'offre</label>
                <input type="text" placeholder="Ex: Pack Mariage Royal" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" required value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix indicatif (FCFA)</label>
                  <input type="text" placeholder="Ex: 10 000" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" required value={newOffer.price} onChange={e => setNewOffer({...newOffer, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]">
                    <option>Par personne (pax)</option>
                    <option>Par jour</option>
                    <option>Forfait global</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie cible</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" value={newOffer.category} onChange={e => setNewOffer({...newOffer, category: e.target.value})}>
                  <option>Mariage & Gala</option>
                  <option>Événement d'entreprise</option>
                  <option>Anniversaire & Fête privée</option>
                  <option>Tous événements</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description détaillée</label>
                <textarea 
                  rows={3} 
                  placeholder="Décrivez ce que contient cette offre..." 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none" 
                  required 
                  value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo d'illustration</label>
                <label className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors relative overflow-hidden group">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  {newOffer.image ? (
                    <img src={newOffer.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                  ) : (
                    <ImageIcon size={24} className="mb-2" />
                  )}
                  <span className="text-xs relative z-10 bg-white/80 px-2 py-1 rounded-md text-gray-700 font-medium">{newOffer.image ? "Changer l'image" : "Cliquez pour ajouter une image (optionnel)"}</span>
                </label>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsAddOfferOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-[#B8860B] text-white text-sm font-medium rounded-lg hover:bg-[#996B00] transition-colors">
                  Enregistrer l'offre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
