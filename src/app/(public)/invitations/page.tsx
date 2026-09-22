"use client";

import { mockInvitationModels } from "@/data/mock/invitations";
import { Sparkles, PlayCircle, Eye, Edit3 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

export default function InvitationsPage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const previewModel = mockInvitationModels.find(m => m.id === selectedModel);

  return (
    <main className="py-24 px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-16">
        <h1 className="font-serif text-4xl md:text-5xl mb-4 text-primary">Modèles d'Invitations</h1>
        <p className="text-gray-600 max-w-2xl mx-auto font-sans">
          Faites forte impression avec nos invitations digitales, cartes ou animées.
          Une fois votre modèle choisi et acheté, vous pourrez le modifier et le personnaliser entièrement depuis votre tableau de bord.
        </p>
      </div>

      <div className="max-w-5xl mx-auto mb-20">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-serif text-3xl text-gray-900">Cartes Classiques</h2>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
          {mockInvitationModels.filter(m => m.type === 'carte').map((model) => (
            <div key={model.id} className="group relative flex flex-col items-center">
              <div 
                className="w-full aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all relative cursor-pointer border border-gray-200"
                onClick={() => setSelectedModel(model.id)}
              >
                <Image 
                  src={model.thumbnail} 
                  alt={model.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-20 gap-3">
                  <button className="bg-white text-primary px-6 py-2 rounded-full font-semibold text-sm shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
                    <Eye size={16} /> Prévisualiser
                  </button>
                </div>
                
                {model.isPremium && (
                  <div className="absolute top-4 right-4 z-10 bg-accent text-white px-2 py-1 rounded text-xs font-semibold shadow-sm flex items-center gap-1">
                    <Sparkles size={12} />
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-center">
                <h3 className="font-serif text-lg font-semibold">{model.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{model.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-serif text-3xl text-gray-900">Invitations Animées</h2>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
          {mockInvitationModels.filter(m => m.type === 'animée').map((model) => (
            <div key={model.id} className="group relative flex flex-col items-center">
              <div 
                className="w-full aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all relative cursor-pointer border border-gray-200"
                onClick={() => setSelectedModel(model.id)}
              >
                <Image 
                  src={model.thumbnail} 
                  alt={model.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-20 gap-3">
                  <button className="bg-white text-primary px-6 py-2 rounded-full font-semibold text-sm shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
                    <Eye size={16} /> Prévisualiser
                  </button>
                </div>
                
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-sm">
                  <PlayCircle size={14} /> Animée
                </div>
                {model.isPremium && (
                  <div className="absolute top-4 right-4 z-10 bg-accent text-white px-2 py-1 rounded text-xs font-semibold shadow-sm flex items-center gap-1">
                    <Sparkles size={12} />
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-center">
                <h3 className="font-serif text-lg font-semibold">{model.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{model.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Prévisualisation */}
      <Modal isOpen={!!selectedModel} onClose={() => setSelectedModel(null)} title="Prévisualisation du Modèle" maxWidth="5xl">
        {previewModel && (
          <div className="flex flex-col md:flex-row gap-8 items-stretch h-full">
            <div className="w-full md:w-3/5 relative min-h-[400px] md:h-[65vh] max-h-[650px] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-inner flex items-center justify-center flex-1">
              <Image 
                src={previewModel.thumbnail} 
                alt={previewModel.name} 
                fill 
                className="object-contain p-2" 
              />
            </div>
            <div className="w-full md:w-2/5 flex flex-col justify-between py-2">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">{previewModel.type}</span>
                  {previewModel.isPremium && (
                    <span className="bg-[#F9F5EC] text-[#B8860B] px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={12} /> Premium
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-4xl font-bold text-gray-900 mb-3">{previewModel.name}</h2>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {previewModel.description}
                </p>
              </div>

              <div className="bg-[#F9F5EC] p-5 rounded-xl border border-[#D4AF37]/20 mb-6">
                <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <Edit3 size={18} className="text-[#B8860B]" /> Personnalisable après achat
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Modification des noms et dates</li>
                  <li>• Ajout de vos propres photos</li>
                  <li>• Changement de la typographie</li>
                  <li>• Personnalisation des couleurs</li>
                </ul>
              </div>

              <div className="mt-auto">
                <button 
                  onClick={() => setSelectedModel(null)}
                  className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white px-6 py-4 rounded-xl text-base font-bold shadow-lg transition-all"
                >
                  Fermer la prévisualisation
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
