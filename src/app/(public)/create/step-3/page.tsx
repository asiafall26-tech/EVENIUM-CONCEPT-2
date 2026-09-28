'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventCreation } from '@/store/EventCreationContext';
import { Check, Eye, X } from 'lucide-react';
import Image from 'next/image';

// Mock data for invitation templates
const mockTemplates = [
  { id: 'invit-1', name: 'Élégance Dorée', type: 'Carte', category: 'Mariage', image: '/invit-1.jpg' },
  { id: 'invit-2', name: 'Nuit Étoilée', type: 'Animée', category: 'Mariage', image: '/invit-2.jpg' },
  { id: 'invit-3', name: 'Fête Tropicale', type: 'Carte', category: 'Anniversaire', image: '/invit-3.jpg' },
  { id: 'invit-4', name: 'Chic Minimaliste', type: 'Carte', category: 'Gala', image: '/invit-4.jpg' },
  { id: 'invit-5', name: 'Douceur Pastel', type: 'Animée', category: 'Baby shower', image: '/invit-1.jpg' }, // Reusing images for demo
  { id: 'invit-6', name: 'Design Moderne', type: 'Carte', category: 'Événement professionnel', image: '/invit-2.jpg' },
];

export default function Step3Page() {
  const router = useRouter();
  const { state, updateState } = useEventCreation();
  const [previewId, setPreviewId] = useState<string | null>(null);

  // Filter templates based on the user's choice in Step 2
  // If they somehow skipped step 2, fallback to 'Carte'
  const targetType = state.invitationType || 'Carte';
  
  // Also optionally sort/filter to put their event type first
  const filteredTemplates = mockTemplates.filter(t => t.type === targetType).sort((a, b) => {
    if (a.category === state.type) return -1;
    if (b.category === state.type) return 1;
    return 0;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.invitationModelId) return;
    router.push('/create/step-4'); // Vers récapitulatif
  };

  const previewTemplate = previewId ? mockTemplates.find(t => t.id === previewId) : null;

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-3">Choisissez votre design</h2>
        <p className="text-gray-500 text-lg">
          Voici notre collection exclusive de formats <strong>{targetType}s</strong>, 
          spécialement sélectionnée pour votre {state.type || 'événement'}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        
        {/* Grille de modèles */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-1 mb-8">
          {filteredTemplates.map((template) => {
            const isSelected = state.invitationModelId === template.id;
            
            return (
              <div key={template.id} className="relative group flex flex-col">
                
                {/* Image Container (Click to Select) */}
                <div 
                  onClick={() => updateState({ invitationModelId: template.id })}
                  className={`relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                    isSelected 
                      ? 'border-[#D4AF37] shadow-md ring-4 ring-[#D4AF37]/10' 
                      : 'border-transparent hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {/* Image réelle */}
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                    <Image src={template.image} alt={template.name} fill className="object-cover" />
                  </div>

                  {/* Overlay Sélectionner (Visible uniquement au hover si non sélectionné) */}
                  <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 ${isSelected ? '!opacity-0' : ''}`}>
                    <span className="text-white font-medium bg-black/50 px-6 py-2 rounded-full backdrop-blur-sm border border-white/20">Sélectionner</span>
                  </div>

                  {/* Badge de sélection */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-[#D4AF37] text-white rounded-full flex items-center justify-center shadow-md z-10 animate-in zoom-in duration-200">
                      <Check size={18} className="stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Infos du modèle & Bouton Prévisualiser */}
                <div className="mt-4 flex flex-col text-center">
                  <h4 className={`font-semibold text-lg ${isSelected ? 'text-[#B8860B]' : 'text-gray-900'}`}>{template.name}</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">{template.category}</p>
                  
                  {/* BOUTON PRÉVISUALISER - Désormais séparé et toujours visible */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setPreviewId(template.id);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-xl transition-colors"
                  >
                    <Eye size={18} /> 
                    {template.type === 'Animée' ? "Prévisualiser l'animation" : "Prévisualiser la carte"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="pt-8 mt-auto flex flex-col-reverse md:flex-row justify-between items-center gap-4 border-t border-gray-100">
          <button 
            type="button"
            onClick={() => router.push('/create/step-2')}
            className="w-full md:w-auto px-8 text-gray-500 hover:text-gray-900 font-medium py-3 rounded-full transition-colors flex items-center justify-center"
          >
            Retour
          </button>
          
          <button 
            type="submit"
            disabled={!state.invitationModelId}
            className="w-full md:w-auto px-10 bg-[#111111] hover:bg-black text-[#D4AF37] font-semibold py-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl border border-transparent hover:border-[#D4AF37]/30 flex items-center justify-center gap-2"
          >
            Voir le récapitulatif
          </button>
        </div>
      </form>

      {/* Modal d'aperçu */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-white z-10">
              <div>
                <h3 className="font-serif text-xl text-gray-900 flex items-center gap-2">
                  {previewTemplate.name}
                  <span className="text-xs bg-[#D4AF37]/10 text-[#B8860B] px-2 py-0.5 rounded-full border border-[#D4AF37]/20">Aperçu (Non éditable)</span>
                </h3>
                <p className="text-sm text-gray-500">{previewTemplate.type} • {previewTemplate.category}</p>
              </div>
              <button 
                onClick={() => setPreviewId(null)}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenu Modal avec l'image réelle (défilable pour les animées) */}
            <div className="p-0 bg-gray-100 flex justify-center items-start overflow-y-auto w-full h-[60vh]">
              {previewTemplate.type === 'Animée' ? (
                // Simulation d'une invitation animée (très longue, défilable)
                <div className="relative w-full max-w-sm flex flex-col bg-white shadow-xl min-h-[1200px]">
                  <div className="relative w-full h-[600px]">
                    <Image src={previewTemplate.image} alt={previewTemplate.name} fill className="object-cover" />
                  </div>
                  <div className="p-8 text-center space-y-6">
                    <h4 className="font-serif text-3xl text-[#D4AF37]">Vous êtes invité(e)</h4>
                    <p className="text-gray-500 italic">Faites défiler pour voir l'animation complète...</p>
                    {/* Faux contenu pour le scroll */}
                    <div className="w-full h-32 bg-gray-50 rounded-xl animate-pulse"></div>
                    <div className="w-full h-32 bg-gray-50 rounded-xl animate-pulse delay-75"></div>
                    <div className="w-full h-32 bg-gray-50 rounded-xl animate-pulse delay-150"></div>
                  </div>
                </div>
              ) : (
                // Invitation Carte (Statique, format fixe)
                <div className="relative w-full max-w-sm aspect-[3/4] bg-gray-200 shadow-2xl overflow-hidden mt-6 mb-6">
                  <Image src={previewTemplate.image} alt={previewTemplate.name} fill className="object-cover" />
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 sm:p-6 bg-white border-t border-gray-100 flex justify-end shrink-0 z-10 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
              <button
                onClick={() => {
                  updateState({ invitationModelId: previewTemplate.id });
                  setPreviewId(null);
                }}
                className="w-full sm:w-auto px-8 bg-[#111111] text-[#D4AF37] font-medium py-3 rounded-full hover:bg-black transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Check size={18} /> Choisir ce modèle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
