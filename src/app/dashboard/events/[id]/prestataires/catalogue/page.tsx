"use client";

import { useState } from "react";
import { mockProviders } from "@/data/mock/prestataires";
import { Search, Star, MapPin, Phone, CheckCircle, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import Image from "next/image";

export default function CataloguePrestatairesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addedProviders, setAddedProviders] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<typeof mockProviders[0] | null>(null);

  const categories = Array.from(new Set(mockProviders.map((p) => p.category)));

  const filteredProviders = mockProviders.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = (providerId: string) => {
    if (!addedProviders.includes(providerId)) {
      setAddedProviders([...addedProviders, providerId]);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="text-xs text-gray-500 font-medium mb-6 flex items-center gap-2">
        <span>Événement</span> <span className="text-gray-300">&gt;</span> 
        <Link href={`/dashboard/events/${id}/prestataires`} className="hover:text-black">Mes Prestataires</Link> 
        <span className="text-gray-300">&gt;</span> 
        <span className="text-black">Catalogue</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <Link href={`/dashboard/events/${id}/prestataires`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-2">
            <ArrowLeft size={16} /> Retour à mes prestataires
          </Link>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Catalogue des Prestataires</h1>
          <p className="text-gray-500 text-sm">Découvrez notre réseau de professionnels certifiés Evenium.</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher un prestataire, un service..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full pb-2 md:pb-0 hide-scrollbar">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${!selectedCategory ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des prestataires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => (
          <div key={provider.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col group">
            <div className="h-40 bg-gray-100 relative overflow-hidden">
              {/* Fake image cover */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-[#B8860B] flex items-center gap-1 shadow-sm">
                <Star size={12} className="fill-[#B8860B]" /> {provider.rating}
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-[#B8860B] uppercase tracking-wider">{provider.category}</div>
                {provider.isPlatformProvider ? (
                  <span className="bg-[#F9F5EC] text-[#B8860B] text-[9px] uppercase px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-bold">
                    <CheckCircle size={8}/> Evenium
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-500 text-[9px] uppercase px-1.5 py-0.5 rounded-sm font-bold border border-gray-200">
                    Externe (Partenaire)
                  </span>
                )}
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">{provider.name}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4">{provider.description}</p>
              
              <div className="space-y-2 mb-6 mt-auto">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <MapPin size={14} className="text-gray-400" /> {provider.zone}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="font-semibold px-2 py-1 bg-gray-100 rounded text-gray-700">{provider.priceRange}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-auto">
                <button 
                  onClick={() => setSelectedProvider(provider)}
                  className="flex-1 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors text-center"
                >
                  Voir profil
                </button>
                <button 
                  onClick={() => handleAdd(provider.id)}
                  disabled={addedProviders.includes(provider.id)}
                  className={`flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    addedProviders.includes(provider.id) 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-black text-white hover:bg-gray-900 shadow-md'
                  }`}
                >
                  {addedProviders.includes(provider.id) ? (
                    <><CheckCircle size={16} /> Ajouté</>
                  ) : (
                    <><Plus size={16} /> Ajouter</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal du Profil Prestataire */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="h-64 bg-gray-200 relative">
              <button 
                onClick={() => setSelectedProvider(null)}
                className="absolute top-4 right-4 bg-white/50 hover:bg-white text-black p-2 rounded-full transition-colors z-10"
              >
                <CheckCircle size={24} className="rotate-45" /> {/* Use CheckCircle rotated for a quick X since X isn't imported here, wait let me import X */}
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-6 left-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider">{selectedProvider.category}</div>
                  {selectedProvider.isPlatformProvider ? (
                    <span className="bg-[#F9F5EC] text-[#B8860B] text-[10px] uppercase px-2 py-0.5 rounded-sm flex items-center gap-1 font-bold">
                      <CheckCircle size={10}/> Evenium
                    </span>
                  ) : (
                    <span className="bg-white/20 text-white text-[10px] uppercase px-2 py-0.5 rounded-sm font-bold border border-white/30 backdrop-blur-sm">
                      Externe (Partenaire)
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-4xl font-bold mb-2">{selectedProvider.name}</h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1"><Star size={16} className="fill-[#D4AF37] text-[#D4AF37]" /> {selectedProvider.rating}/5</span>
                  <span className="flex items-center gap-1"><MapPin size={16} /> {selectedProvider.zone}</span>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">À propos</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedProvider.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-4">Services proposés</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedProvider.services.map((service, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-700">
                          <CheckCircle size={16} className="text-[#D4AF37]" /> {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h4 className="font-bold mb-4">Informations</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Tarifs</div>
                        <div className="font-semibold text-sm">{selectedProvider.priceRange}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Contact</div>
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          <Phone size={14} className="text-gray-400" /> {selectedProvider.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleAdd(selectedProvider.id)}
                    disabled={addedProviders.includes(selectedProvider.id)}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-colors ${
                      addedProviders.includes(selectedProvider.id)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-black text-white hover:bg-gray-900 shadow-xl shadow-black/10'
                    }`}
                  >
                    {addedProviders.includes(selectedProvider.id) ? (
                      <><CheckCircle size={20} /> Déjà dans votre liste</>
                    ) : (
                      <><Plus size={20} /> Ajouter à mon événement</>
                    )}
                  </button>
                  <button 
                    onClick={() => setSelectedProvider(null)}
                    className="w-full py-4 text-gray-500 hover:text-black font-semibold text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
