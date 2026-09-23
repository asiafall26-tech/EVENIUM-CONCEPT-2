"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "./Modal";

const formulas = [
  {
    id: "premium",
    name: "Premium",
    description: "L'essentiel pour vos invitations",
    prices: {
      carte: "7 500",
      animee: "10 000"
    },
    color: "bg-white",
    textColor: "text-gray-900",
    button: "border border-gray-200 hover:bg-gray-50 text-gray-900",
    features: [
      "Invitation éditable",
      "Tableau de bord pour le suivi des réponses"
    ],
    details: []
  },
  {
    id: "gold",
    name: "Gold",
    description: "La plateforme d'organisation complète",
    prices: {
      carte: "15 000",
      animee: "20 000"
    },
    badge: "Le plus complet",
    color: "bg-gray-900",
    textColor: "text-white",
    button: "bg-[#B8860B] hover:bg-[#996B00] text-white border border-[#B8860B]",
    features: [
      "Invitation éditable",
      "Tableau de bord pour le suivi des réponses",
      "Accès à un réseau de prestataires",
      "Gestion du budget",
      "To do list"
    ],
    details: []
  }
];

export default function PricingSection() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [selectedFormula, setSelectedFormula] = useState<typeof formulas[0] | null>(null);
  const [invitationType, setInvitationType] = useState<"carte" | "animee">("carte");

  const nextFormula = () => setActiveIndex((prev) => (prev === 0 ? 1 : 0));

  return (
    <section id="tarifs" className="py-24 px-6 lg:px-8 bg-gray-50 border-t border-gray-100 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="font-serif text-3xl md:text-5xl text-gray-900 mb-6">Des tarifs transparents, <span className="text-[#B8860B]">sans surprise.</span></h2>
        <p className="text-gray-500 mb-8 max-w-2xl mx-auto text-lg">Choisissez la formule qui correspond parfaitement à vos besoins pour organiser un événement sans stress.</p>
        
        {/* Toggle Invitation Type */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-gray-200 p-1.5 rounded-full inline-flex shadow-sm">
            <button
              onClick={() => setInvitationType("carte")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${invitationType === 'carte' ? 'bg-[#B8860B] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Invitation Carte
            </button>
            <button
              onClick={() => setInvitationType("animee")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${invitationType === 'animee' ? 'bg-[#B8860B] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Invitation Animée
            </button>
          </div>
        </div>
        
        {/* Toggle Mobile Navigation */}
        <div className="md:hidden flex items-center justify-center gap-4 mb-8">
          <button onClick={nextFormula} className="p-2 bg-white rounded-full shadow-sm border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="font-bold text-gray-900 min-w-[100px]">{formulas[activeIndex].name}</div>
          <button onClick={nextFormula} className="p-2 bg-white rounded-full shadow-sm border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="relative h-[550px] md:h-auto w-full max-w-4xl mx-auto">
          {/* Desktop View (Side by Side) */}
          <div className="hidden md:grid md:grid-cols-2 gap-8 text-left">
            {formulas.map((formula, idx) => (
              <motion.div 
                key={formula.id}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
                className={`${formula.color} ${formula.textColor} p-8 rounded-3xl shadow-xl border ${formula.id === 'gold' ? 'border-[#B8860B]/30' : 'border-gray-200'} relative flex flex-col h-full`}
              >
                {formula.badge && (
                  <div className="absolute -top-4 right-8">
                    <span className="bg-[#B8860B] text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-lg shadow-[#B8860B]/20">
                      {formula.badge}
                    </span>
                  </div>
                )}
                
                <h3 className={`font-serif text-3xl mb-2 ${formula.id === 'gold' ? 'text-[#B8860B]' : ''}`}>{formula.name}</h3>
                <p className={formula.id === 'gold' ? 'text-gray-400' : 'text-gray-500'}>{formula.description}</p>
                
                <div className="my-8">
                  <span className="text-sm opacity-70 font-medium uppercase tracking-wider block mb-2">À partir de</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">{formula.prices[invitationType]}</span>
                    <span className="text-lg opacity-70 font-medium">FCFA</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  {[invitationType === 'carte' ? "Carte d'invitation statique" : "Carte d'invitation animée", ...formula.features].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className={formula.id === 'gold' ? 'text-[#B8860B] shrink-0' : 'text-gray-900 shrink-0'} />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setSelectedFormula(formula)}
                  className={`block w-full text-center py-4 rounded-xl font-bold transition-all mt-auto ${formula.button}`}
                >
                  En savoir plus
                </button>
              </motion.div>
            ))}
          </div>

          {/* Mobile View (Animated Slider) */}
          <div className="md:hidden absolute inset-0 w-full h-full">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`${formulas[activeIndex].color} ${formulas[activeIndex].textColor} p-8 rounded-3xl shadow-xl border ${formulas[activeIndex].id === 'gold' ? 'border-[#B8860B]/30' : 'border-gray-200'} relative flex flex-col h-full text-left`}
              >
                {formulas[activeIndex].badge && (
                  <div className="absolute -top-4 right-8">
                    <span className="bg-[#B8860B] text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-lg shadow-[#B8860B]/20">
                      {formulas[activeIndex].badge}
                    </span>
                  </div>
                )}
                
                <h3 className={`font-serif text-3xl mb-2 ${formulas[activeIndex].id === 'gold' ? 'text-[#B8860B]' : ''}`}>{formulas[activeIndex].name}</h3>
                <p className={formulas[activeIndex].id === 'gold' ? 'text-gray-400' : 'text-gray-500'}>{formulas[activeIndex].description}</p>
                
                <div className="my-8">
                  <span className="text-sm opacity-70 font-medium uppercase tracking-wider block mb-2">À partir de</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">{formulas[activeIndex].prices[invitationType]}</span>
                    <span className="text-lg opacity-70 font-medium">FCFA</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  {[invitationType === 'carte' ? "Carte d'invitation statique" : "Carte d'invitation animée", ...formulas[activeIndex].features].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className={formulas[activeIndex].id === 'gold' ? 'text-[#B8860B] shrink-0' : 'text-gray-900 shrink-0'} />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setSelectedFormula(formulas[activeIndex])}
                  className={`block w-full text-center py-4 rounded-xl font-bold transition-all mt-auto ${formulas[activeIndex].button}`}
                >
                  En savoir plus
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Modal isOpen={!!selectedFormula} onClose={() => setSelectedFormula(null)} title={`Formule ${selectedFormula?.name || ''}`}>
        {selectedFormula && (
          <div className="space-y-6">
            <p className="text-gray-600 text-base">{selectedFormula.description}</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold">{selectedFormula.prices[invitationType]}</span>
              <span className="text-lg opacity-70 font-medium">FCFA</span>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Ce qui est inclus :</h4>
              {[invitationType === 'carte' ? "Carte d'invitation statique" : "Carte d'invitation animée", ...selectedFormula.features].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-[#B8860B] shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{feature}</span>
                </div>
              ))}
              
              {selectedFormula.details.length > 0 && (
                <div className="pt-4 mt-4 border-t border-gray-100 space-y-4">
                  <h4 className="font-semibold text-gray-900">Détails exclusifs :</h4>
                  {selectedFormula.details.map((detail, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-green-600 shrink-0" />
                      <span className="text-sm text-gray-600">{detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="pt-6">
              <Link onClick={() => setSelectedFormula(null)} href="/create" className={`flex items-center justify-center w-full text-center py-4 rounded-xl font-bold transition-all ${selectedFormula.id === 'gold' ? 'bg-[#B8860B] hover:bg-[#996B00] text-white shadow-lg shadow-[#B8860B]/20' : 'bg-gray-900 hover:bg-black text-white shadow-lg'}`}>
                Choisir cette formule
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
