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
  const [invitationType, setInvitationType] = useState<"carte" | "animee">("carte");

  return (
    <section id="tarifs" className="py-24 md:py-32 px-6 lg:px-8 bg-white overflow-hidden border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl md:text-5xl text-gray-900 mb-6 leading-tight">
              Investissez et Organisez dans <br className="hidden md:block" />
              <span className="text-[#D4AF37] italic">la tranquillité d'esprit.</span>
            </h2>
            <p className="text-gray-500 text-lg">Deux formules pensées pour s'adapter à l'envergure de votre événement. Transparence totale, aucun frais caché.</p>
          </div>
          
          {/* Toggle ultra-minimaliste */}
          <div className="bg-gray-50 p-1.5 rounded-full inline-flex self-start md:self-end">
            <button
              onClick={() => setInvitationType("carte")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${invitationType === 'carte' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Invitations classiques
            </button>
            <button
              onClick={() => setInvitationType("animee")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${invitationType === 'animee' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Invitations animées
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Formule PREMIUM */}
          <motion.div 
            whileHover={{ y: -5 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col p-10 md:p-12 rounded-[2rem] bg-white border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
          >
            <h3 className="font-serif text-3xl text-gray-900 mb-2">Premium</h3>
            <p className="text-gray-500 mb-10 h-12">L'essentiel pour centraliser la gestion de vos invités et le design.</p>
            
            <div className="flex items-baseline gap-2 mb-10 pb-10 border-b border-gray-100">
              <span className="text-5xl font-light text-gray-900 tracking-tight">{formulas[0].prices[invitationType]}</span>
              <span className="text-gray-400 font-medium">FCFA</span>
            </div>
            
            <ul className="space-y-5 flex-1 mb-12">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <span className="text-gray-700">{invitationType === 'carte' ? "Génération d'invitations statiques" : "Génération d'invitations animées"}</span>
              </li>
              {formulas[0].features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link 
              href="/create"
              className="w-full py-4 text-center rounded-full font-semibold text-gray-900 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              Choisir Premium
            </Link>
          </motion.div>

          {/* Formule GOLD */}
          <motion.div 
            whileHover={{ y: -5 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col p-10 md:p-12 rounded-[2rem] bg-[#FCFBF8] border border-[#D4AF37]/30 shadow-lg shadow-[#D4AF37]/5 relative"
          >
            {/* Ruban discret */}
            <div className="absolute top-8 right-8 text-xs font-bold uppercase tracking-widest text-[#D4AF37] bg-white px-3 py-1 rounded-full border border-[#D4AF37]/20">
              Recommandé
            </div>

            <h3 className="font-serif text-3xl text-[#D4AF37] mb-2">Gold</h3>
            <p className="text-gray-500 mb-10 h-12">L'organisation de A à Z. Accès complet à tous nos outils et prestataires.</p>
            
            <div className="flex items-baseline gap-2 mb-10 pb-10 border-b border-[#D4AF37]/20">
              <span className="text-5xl font-light text-gray-900 tracking-tight">{formulas[1].prices[invitationType]}</span>
              <span className="text-gray-400 font-medium">FCFA</span>
            </div>
            
            <ul className="space-y-5 flex-1 mb-12">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <span className="text-gray-900 font-medium">{invitationType === 'carte' ? "Génération d'invitations statiques" : "Génération d'invitations animées"}</span>
              </li>
              {formulas[1].features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="text-gray-900 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Link 
              href="/create"
              className="w-full py-4 text-center rounded-full font-semibold text-white bg-gray-900 hover:bg-black shadow-xl shadow-gray-900/10 transition-colors flex items-center justify-center gap-2 group"
            >
              Choisir Gold
              <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
