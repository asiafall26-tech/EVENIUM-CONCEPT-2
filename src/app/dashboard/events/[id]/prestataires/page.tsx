"use client";

import { Store, Plus, Search, MoreHorizontal, Star, Phone, CheckCircle, Clock, Lock, MessageCircle, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import { mockEvents } from "@/data/mock/events";
import { notFound } from "next/navigation";
import { use, useState } from "react";

export default function PrestatairesDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const event = mockEvents.find((e) => e.id === id);

  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);

  if (!event) {
    notFound();
  }

  if (event.plan !== "Gold") {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full h-[80vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl max-w-md text-center">
          <div className="w-20 h-20 bg-[#F9F5EC] text-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-black mb-3">Fonctionnalité Gold</h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            La gestion des prestataires est exclusivement réservée aux événements utilisant la formule Gold. Retrouvez tous vos contacts professionnels au même endroit.
          </p>
          <button className="w-full bg-[#B8860B] hover:bg-[#996B00] text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-[#B8860B]/20 transition-colors">
            Passer à la formule Gold
          </button>
          <div className="mt-4">
             <Link href={`/dashboard/events/${event.id}`} className="text-sm font-medium text-gray-400 hover:text-black">
               Retour à l'aperçu
             </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Fake data for UI preview (Mixed platform vs external providers)
  const prestataires = [
    { 
      id: "PR-01",
      name: "Saveurs d'Afrique", 
      role: "Traiteur", 
      rating: 4.8, 
      status: "Confirmé", 
      phone: "+221 77 111 22 33", 
      cost: "850 000 FCFA", 
      isPlatformProvider: true,
      zone: "Dakar, Sénégal",
      description: "Service traiteur haut de gamme spécialisé dans la gastronomie africaine et internationale.",
      services: ["Buffet de mariage", "Service à table", "Cocktail dinatoire", "Gâteau sur mesure"],
      priceRange: "À partir de 15 000 FCFA / pax"
    },
    { 
      id: "PR-02",
      name: "Studio Lumière", 
      role: "Photographe", 
      rating: 4.9, 
      status: "Devis en attente", 
      phone: "+221 76 222 33 44", 
      cost: "150 000 FCFA", 
      isPlatformProvider: true,
      zone: "Sénégal & International",
      description: "L'art de capturer vos plus beaux moments avec une touche cinématographique.",
      services: ["Couverture complète (journée)", "Shooting couple", "Drone vidéo", "Album photo premium"],
      priceRange: "À partir de 100 000 FCFA"
    },
    { 
      id: "PR-03",
      name: "Sons & Rythmes (DJ)", 
      role: "Animation", 
      rating: null, 
      status: "Acompte payé", 
      phone: "+221 70 333 44 55", 
      cost: "300 000 FCFA", 
      isPlatformProvider: false,
      zone: "Dakar",
      description: "Prestataire externe gérant l'animation musicale.",
      services: ["DJ Set", "Sonorisation"],
      priceRange: "Sur devis"
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="text-xs text-gray-500 font-medium mb-6 flex items-center gap-2">
        <span>Événement</span> <span className="text-gray-300">&gt;</span> <span className="text-black">Mes Prestataires</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Mes Prestataires</h1>
          <p className="text-gray-500 text-sm">Gérez l'équipe de professionnels qui fera le succès de votre événement.</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/events/${event.id}/prestataires/catalogue`} className="flex items-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-[#B8860B]/20 transition-colors">
            <Search size={16} /> Annuaire Evenium
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prestataires.map((p, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-2xl border ${p.isPlatformProvider ? 'border-gray-100' : 'border-gray-200 border-dashed'} shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col group hover:border-[#D4AF37]/30 transition-all`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 items-center">
                <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center font-serif text-[10px] font-bold leading-tight ${p.isPlatformProvider ? 'bg-gray-100 text-[#B8860B]' : 'bg-gray-100 text-gray-400'}`}>
                  {p.name.substring(0, 3).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-500">{p.role}</p>
                    {p.isPlatformProvider ? (
                      <span className="bg-[#F9F5EC] text-[#B8860B] text-[9px] uppercase px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-bold">
                        <CheckCircle size={8}/> Evenium
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-[9px] uppercase px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-1">
                        <ExternalLink size={8}/> Externe
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-black">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-6 flex-1">
              {p.isPlatformProvider ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{p.rating}</span>
                  <span className="text-gray-400 text-xs">(Avis Evenium)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-400 italic">
                  Non évalué (Prestataire hors plateforme)
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} className="text-gray-400" />
                {p.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Store size={14} className="text-gray-400" />
                Coût estimé : <span className="font-semibold text-black">{p.cost}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                p.status === "Confirmé" ? "bg-green-50 text-green-700" :
                p.status === "Acompte payé" ? "bg-blue-50 text-blue-700" :
                "bg-amber-50 text-amber-700"
              }`}>
                {p.status === "Confirmé" && <CheckCircle size={12} />}
                {p.status === "Acompte payé" && <CheckCircle size={12} />}
                {p.status === "Devis en attente" && <Clock size={12} />}
                {p.status}
              </span>
              
              
              <div className="flex items-center gap-3">
                {p.isPlatformProvider && (
                  <button onClick={() => setSelectedProvider(p)} className="text-xs font-medium text-gray-500 hover:text-black transition-colors cursor-pointer">
                    Voir profil
                  </button>
                )}
                {p.isPlatformProvider ? (
                  <Link href={`/dashboard/events/${event.id}/messages`} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F9F5EC] text-[#B8860B] rounded-lg text-xs font-bold hover:bg-[#E8DCC4] transition-colors">
                    <MessageCircle size={14} /> Contacter
                  </Link>
                ) : (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
                     WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Empty state / Add new */}
        <Link href={`/dashboard/events/${event.id}/prestataires/catalogue`} className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[250px] hover:bg-gray-100 hover:border-[#D4AF37] hover:text-[#B8860B] transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#B8860B] mb-4 shadow-sm transition-colors">
            <Search size={24} />
          </div>
          <h3 className="font-medium text-gray-900 mb-1 group-hover:text-[#B8860B] transition-colors">Besoin d'un autre service ?</h3>
          <p className="text-xs text-gray-500 max-w-[200px]">Trouvez le prestataire idéal parmi notre catalogue certifié Evenium.</p>
        </Link>
      </div>

      {/* Modal du Profil Prestataire (identique au catalogue) */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="h-64 bg-gray-200 relative">
              <button 
                onClick={() => setSelectedProvider(null)}
                className="absolute top-4 right-4 bg-white/50 hover:bg-white text-black p-2 rounded-full transition-colors z-10"
              >
                <CheckCircle size={24} className="rotate-45" />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-6 left-8 text-white">
                <div className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-2">{selectedProvider.role}</div>
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
                      {selectedProvider.services.map((service: string, idx: number) => (
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
                    onClick={() => setSelectedProvider(null)}
                    className="w-full py-4 text-gray-500 hover:text-black font-semibold text-sm"
                  >
                    Fermer la vue
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
