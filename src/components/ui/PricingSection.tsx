"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Crown, Sparkles, Heart, Gift, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Fleuron, DiamondRule } from "@/components/landing/LuxOrnaments";

interface FeatureItem {
  title: string;
  desc: string;
}

interface Formula {
  id: string;
  name: string;
  tagline: {
    carte: string;
    animee: string;
  };
  badge?: string;
  prices: {
    carte: string;
    animee: string;
  };
  features: {
    carte: FeatureItem[];
    animee: FeatureItem[];
  };
}

const formulas: Formula[] = [
  {
    id: "standard",
    name: "Formule Standard",
    tagline: {
      carte: "La carte digitale visuelle épurée & partage direct (sans musique ni animation)",
      animee: "Le faire-part digital immersif essentiel avec musique d'ambiance & partage direct"
    },
    prices: {
      carte: "3 500",
      animee: "5 000"
    },
    features: {
      animee: [
        {
          title: "Faire-part immersif animé haute couture",
          desc: "Design animé interactif personnalisé avec musique d'ambiance, ouverture au sceau et photos."
        },
        {
          title: "Accès au Dashboard Organisateur",
          desc: "Retrouvez votre événement, votre lien officiel et votre QR Code actif à tout moment."
        },
        {
          title: "Lien officiel & QR Code interactif",
          desc: "Générez et téléchargez votre QR code haute définition et votre carton imprimable."
        },
        {
          title: "Partage illimité WhatsApp & Réseaux",
          desc: "Lien diffusable partout en 1 clic sans aucune restriction de convives."
        }
      ],
      carte: [
        {
          title: "Carte digitale haute couture épurée",
          desc: "Design visuel soigné et photos haute définition (modèle graphique épuré, sans musique ni animation sonore)."
        },
        {
          title: "Accès au Dashboard Organisateur",
          desc: "Retrouvez votre événement, votre lien officiel et votre QR Code actif à tout moment."
        },
        {
          title: "Lien officiel & QR Code interactif",
          desc: "Générez et téléchargez votre QR code haute définition et votre carton imprimable."
        },
        {
          title: "Partage illimité WhatsApp & Réseaux",
          desc: "Lien diffusable partout en 1 clic sans aucune restriction de convives."
        }
      ]
    },
  },
  {
    id: "premium",
    name: "Formule Premium",
    tagline: {
      carte: "L'art de la carte digitale épurée & le suivi des convives en temps réel",
      animee: "L'art de l'invitation animée avec musique & le suivi en temps réel"
    },
    prices: {
      carte: "7 500",
      animee: "10 000"
    },
    features: {
      animee: [
        {
          title: "Tout le pack Standard inclus",
          desc: "Faire-part animé haute couture, musique, Dashboard, lien officiel et QR Code actif."
        },
        {
          title: "Suivi des confirmations (RSVP) en direct",
          desc: "Collecte instantanée des présences, régimes et messages des convives sur votre dashboard."
        },
        {
          title: "Programme & Itinéraire Google Maps",
          desc: "Déroulé chronologique du Jour J et guidage GPS direct vers votre réception."
        },
        {
          title: "Musique d'ambiance & Galerie enrichie",
          desc: "Personnalisation audio immersive et album photos haute définition illimité."
        }
      ],
      carte: [
        {
          title: "Tout le pack Standard inclus",
          desc: "Carte statique haute couture, Dashboard, lien officiel et QR Code actif."
        },
        {
          title: "Suivi des confirmations (RSVP) en direct",
          desc: "Collecte instantanée des présences, régimes et messages des convives sur votre dashboard."
        },
        {
          title: "Programme & Itinéraire Google Maps",
          desc: "Déroulé chronologique du Jour J et guidage GPS direct vers votre réception."
        },
        {
          title: "Galerie photos enrichie (sans musique)",
          desc: "Album photos haute définition illimité (les cartes statiques ne peuvent pas comporter de musique ni de son)."
        }
      ]
    },
  },
  {
    id: "gold",
    name: "Formule Gold VIP",
    tagline: {
      carte: "La plateforme complète pour organiser tout votre événement avec carte statique",
      animee: "La plateforme complète pour organiser tout votre événement avec invitation animée"
    },
    badge: "Recommandée",
    prices: {
      carte: "15 000",
      animee: "20 000"
    },
    features: {
      animee: [
        {
          title: "Tout le pack Premium inclus",
          desc: "Faire-part animé avec musique d'ambiance, suivi RSVP en direct et QR Code."
        },
        {
          title: "Tableau de Bord Complet d'Organisation",
          desc: "Pilotez l'ensemble des préparatifs du Jour J depuis votre espace dédié."
        },
        {
          title: "Budget & Suivi des Dépenses Réelles",
          desc: "Calcul automatique du reste à payer, acomptes prestataires et alertes de dépassement."
        },
        {
          title: "Checklist Intelligente & Rétroplanning Jour J",
          desc: "Toutes les étapes clés de l'organisation pré-remplies et personnalisables."
        },
        {
          title: "Réseau Prestataires & Support Privilège 7j/7",
          desc: "Mise en relation directe avec nos prestataires d'exception et assistance prioritaire."
        }
      ],
      carte: [
        {
          title: "Tout le pack Premium inclus",
          desc: "Carte statique haute couture, suivi RSVP en direct et QR Code actif."
        },
        {
          title: "Tableau de Bord Complet d'Organisation",
          desc: "Pilotez l'ensemble des préparatifs du Jour J depuis votre espace dédié."
        },
        {
          title: "Budget & Suivi des Dépenses Réelles",
          desc: "Calcul automatique du reste à payer, acomptes prestataires et alertes de dépassement."
        },
        {
          title: "Checklist Intelligente & Rétroplanning Jour J",
          desc: "Toutes les étapes clés de l'organisation pré-remplies et personnalisables."
        },
        {
          title: "Réseau Prestataires & Support Privilège 7j/7",
          desc: "Mise en relation directe avec nos prestataires d'exception et assistance prioritaire."
        }
      ]
    },
  }
];

export default function PricingSection() {
  const [activeTab, setActiveTab] = useState<"events" | "express">("events");
  const [invitationType, setInvitationType] = useState<"carte" | "animee">("animee");

  return (
    <section id="tarifs" className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#fbf6ee] overflow-hidden">
      <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#ffe2aa]/30 blur-[100px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">

        {/* En-tête principal */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Fleuron className="mx-auto w-40 md:w-48 h-auto mb-3" />
          <span className="inline-flex items-center gap-2 pl-[0.35em] text-[#8f6f33] text-[11px] font-medium uppercase tracking-[0.35em] mb-4">
            Tarifs clairs &amp; sans surprise
          </span>
          <h2 className="font-serif not-italic text-3xl sm:text-4xl md:text-5xl text-[#1d120a] leading-tight mb-3">
            Des formules transparentes pour chaque <span className="italic text-gold-foil">moment d&apos;exception</span>
          </h2>
          <DiamondRule className="my-5" />
          <p className="text-xs sm:text-sm text-[#3d3126] mb-6">
            Paiement unique, aucun abonnement caché. Votre lien direct est disponible immédiatement après validation.
          </p>

          {/* Sélecteur de Grand Service : Événements vs Express (Vœux, Mots Doux, Couple) */}
          <div className="bg-[#fbf7f0] border border-[#b8924a]/30 p-1.5 rounded-2xl sm:rounded-full inline-flex flex-col sm:flex-row gap-1 shadow-sm mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("events")}
              className={`px-4 sm:px-6 py-2.5 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "events"
                  ? "bg-gradient-to-b from-[#3b2717] to-[#150d07] text-[#f0d999] shadow-md"
                  : "text-gray-700 hover:text-black"
              }`}
            >
              <Crown size={14} className="text-[#d4af37]" />
              <span>Grands Événements &amp; Mariages</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("express")}
              className={`px-4 sm:px-6 py-2.5 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "express"
                  ? "bg-gradient-to-b from-[#3b2717] to-[#150d07] text-[#f0d999] shadow-md"
                  : "text-gray-700 hover:text-black"
              }`}
            >
              <Sparkles size={14} className="text-[#d4af37]" />
              <span>Vœux (2 000 F), Mots Doux (1 000 F) &amp; Couple (4 000 F)</span>
            </button>
          </div>
        </div>

        {/* ─────────────── ONGLET 1 : GRANDS ÉVÉNEMENTS (FORMULES STANDARD, PREMIUM, GOLD) ─────────────── */}
        {activeTab === "events" && (
          <div className="animate-in fade-in duration-300">
            {/* Toggle format animé vs carte statique */}
            <div className="text-center mb-8">
              <div className="bg-[#fbf7f0] border border-[#b8924a]/30 p-1 rounded-full inline-flex shadow-xs">
                <button
                  type="button"
                  onClick={() => setInvitationType("animee")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    invitationType === 'animee'
                      ? 'bg-gradient-to-b from-[#3b2717] to-[#150d07] text-[#f0d999] shadow-[0_0_16px_-6px_rgba(233,196,120,0.8)]'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  ✨ Faire-part immersif animé
                </button>
                <button
                  type="button"
                  onClick={() => setInvitationType("carte")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    invitationType === 'carte'
                      ? 'bg-gradient-to-b from-[#3b2717] to-[#150d07] text-[#f0d999] shadow-[0_0_16px_-6px_rgba(233,196,120,0.8)]'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  📄 Carte statique classique
                </button>
              </div>

              {/* Notice explicite */}
              {invitationType === 'carte' ? (
                <div className="mt-4 max-w-lg mx-auto p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs flex items-center justify-center gap-2 shadow-xs">
                  <span className="text-base">📄</span>
                  <p className="text-left sm:text-center">
                    <strong>Format Carte Statique :</strong> Modèle visuel épuré. Les cartes statiques <u>ne peuvent pas comporter de musique ni de son</u>.
                  </p>
                </div>
              ) : (
                <div className="mt-4 max-w-lg mx-auto p-3 rounded-2xl bg-[#fbf7f0] border border-[#b8924a]/30 text-gray-800 text-xs flex items-center justify-center gap-2 shadow-xs">
                  <span className="text-base">✨</span>
                  <p className="text-left sm:text-center">
                    <strong className="text-[#8f6f33]">Format Animé Immersif :</strong> Scénographie interactive avec ouverture au sceau, <u>musique d&apos;ambiance</u> et effets animés.
                  </p>
                </div>
              )}
            </div>

            {/* Grille des 3 formules d'événements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
              
              {/* Formule STANDARD */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="card-lux flex flex-col p-6 hover:shadow-[0_24px_50px_-20px_rgba(184,134,11,0.45)] transition-shadow justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                      {formulas[0].name}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                    {formulas[0].tagline[invitationType]}
                  </p>
                  
                  <div className="flex items-baseline gap-1.5 mb-5 pb-5 border-b border-gray-100">
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-gray-950 tracking-tight">
                      {formulas[0].prices[invitationType]}
                    </span>
                    <span className="text-xs font-medium text-gray-400">FCFA / événement</span>
                  </div>
                  
                  <ul className="space-y-3.5 mb-6">
                    {formulas[0].features[invitationType].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-[#b8924a] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
                            {feature.title}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                            {feature.desc}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link 
                  href="/create"
                  className="btn-lux w-full py-3.5 text-[11px]"
                >
                  Choisir Standard (5 000 F)
                </Link>
              </motion.div>

              {/* Formule PREMIUM */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="card-lux flex flex-col p-6 !border-2 hover:shadow-[0_24px_50px_-20px_rgba(184,134,11,0.45)] transition-shadow justify-between relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                      {formulas[1].name}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                    {formulas[1].tagline[invitationType]}
                  </p>
                  
                  <div className="flex items-baseline gap-1.5 mb-5 pb-5 border-b border-gray-100">
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-gray-950 tracking-tight">
                      {formulas[1].prices[invitationType]}
                    </span>
                    <span className="text-xs font-medium text-gray-400">FCFA / événement</span>
                  </div>
                  
                  <ul className="space-y-3.5 mb-6">
                    {formulas[1].features[invitationType].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-[#b8924a] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
                            {feature.title}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                            {feature.desc}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link 
                  href="/create"
                  className="btn-lux w-full py-3.5 text-[11px]"
                >
                  Choisir Premium (10 000 F)
                </Link>
              </motion.div>

              {/* Formule GOLD VIP */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col p-6 rounded-3xl bg-gradient-to-b from-[#2a1b0f] to-[#120b06] border border-[#c9a45e]/70 shadow-[0_24px_50px_-20px_rgba(20,12,6,0.8),0_0_30px_-12px_rgba(233,196,120,0.6)] relative overflow-hidden text-white justify-between"
              >
                <div aria-hidden className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#b8924a]/20 blur-[70px] pointer-events-none" />
                
                {/* Badge Recommandé */}
                <div className="absolute top-5 right-5 text-[9px] font-bold uppercase tracking-wider text-[#241b13] bg-gradient-to-r from-[#b8924a] via-[#d9c08c] to-[#b8924a] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <Crown size={11} /> {formulas[2].badge}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-gold-foil">
                      {formulas[2].name}
                    </h3>
                  </div>
                  <p className="text-xs text-white/60 mb-5 leading-relaxed">
                    {formulas[2].tagline[invitationType]}
                  </p>
                  
                  <div className="flex items-baseline gap-1.5 mb-5 pb-5 border-b border-white/10">
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                      {formulas[2].prices[invitationType]}
                    </span>
                    <span className="text-xs font-medium text-white/50">FCFA / événement</span>
                  </div>
                  
                  <ul className="space-y-3.5 mb-6">
                    {formulas[2].features[invitationType].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-[#b8924a] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
                            {feature.title}
                          </p>
                          <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">
                            {feature.desc}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link 
                  href="/create"
                  className="relative w-full py-3 text-center rounded-xl font-bold text-xs sm:text-sm text-black bg-gradient-to-r from-[#b8924a] via-[#d9c08c] to-[#b8924a] hover:brightness-110 shadow-md shadow-[#b8924a]/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Choisir Gold VIP (20 000 F)</span>
                  <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>

            </div>
          </div>
        )}

        {/* ─────────────── ONGLET 2 : VŒUX, MOTS DOUX & COUPLE (TARIFS DIRECTS) ─────────────── */}
        {activeTab === "express" && (
          <div className="animate-in fade-in duration-300">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#9e1b23] text-[10px] font-bold uppercase tracking-wider mb-2">
                Créations Express &amp; Partage Immédiat
              </span>
              <p className="text-xs text-gray-600">
                Tunnel ultra-simplifié : personnalisez vos textes, réglez en 1 clic et recevez immédiatement votre lien officiel copiable à partager par WhatsApp ou SMS.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">

              {/* 1. LES MOTS DOUX : 1 000 FCFA */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="rounded-3xl bg-white border border-[#eed7dc] p-6 shadow-sm hover:shadow-xl hover:border-[#b91c1c]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-11 h-11 rounded-2xl bg-[#fff0f3] border border-[#f7c5ce] flex items-center justify-center text-2xl shadow-xs">
                      💌
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#ffe5e9] text-[#9e1b23] border border-[#f8bcc5]">
                      Romance Privée
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-[#1a0a0e] mb-1">
                    Les Mots Doux
                  </h3>
                  <p className="text-xs text-[#663e46] mb-4 leading-relaxed">
                    Lettre d&apos;amour confidentielle, scellée de cire avec douce mélodie au piano.
                  </p>

                  <div className="flex items-baseline gap-1.5 mb-5 pb-4 border-b border-[#f4dee2]">
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-[#9e1b23] tracking-tight">
                      1 000
                    </span>
                    <span className="text-xs font-semibold text-gray-500">FCFA · Tarif unique</span>
                  </div>

                  <ul className="space-y-3 mb-6 text-xs text-[#4d2830]">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#d62828] shrink-0 mt-0.5" />
                      <span>Lettre d&apos;amour interactive confidentielle</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#d62828] shrink-0 mt-0.5" />
                      <span>Cachet de cire virtuel &amp; musique d&apos;ambiance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#d62828] shrink-0 mt-0.5" />
                      <span><strong>Message d&apos;accompagnement chic WhatsApp</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#d62828] shrink-0 mt-0.5" />
                      <span>Lien officiel copiable en 1 clic sans abonnement</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/create?category=Couple"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d62828] via-[#ba181b] to-[#800f2f] hover:brightness-105 text-white font-bold text-xs tracking-wider shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Créer un Mot Doux (1 000 F)</span>
                  <ArrowRight size={14} />
                </Link>
              </motion.div>

              {/* 2. VŒUX D'EXCEPTION : 2 000 FCFA */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="rounded-3xl bg-white border-2 border-[#b8924a] p-6 shadow-md hover:shadow-xl hover:border-[#8f6f33] transition-all flex flex-col justify-between relative"
              >
                <span className="absolute -top-3 right-5 bg-gradient-to-r from-[#b8924a] to-[#8f6f33] text-white text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  Célébration
                </span>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-11 h-11 rounded-2xl bg-[#faf0dc] border border-[#d9c08c] flex items-center justify-center text-2xl shadow-xs">
                      🌟
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      Vœu d&apos;Or
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-[#1a0f07] mb-1">
                    Vœux d&apos;Exception
                  </h3>
                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                    Faire-part digital interactif de vœux, anniversaires et moments inoubliables.
                  </p>

                  <div className="flex items-baseline gap-1.5 mb-5 pb-4 border-b border-gray-100">
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-[#1a0f07] tracking-tight">
                      2 000
                    </span>
                    <span className="text-xs font-semibold text-gray-500">FCFA · Tarif unique</span>
                  </div>

                  <ul className="space-y-3 mb-6 text-xs text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#b8924a] shrink-0 mt-0.5" />
                      <span>Carte interactive animée avec paillettes d&apos;or</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#b8924a] shrink-0 mt-0.5" />
                      <span>Musique d&apos;ambiance &amp; animation sonore festive</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#b8924a] shrink-0 mt-0.5" />
                      <span><strong>Message d&apos;accompagnement chic WhatsApp</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#b8924a] shrink-0 mt-0.5" />
                      <span>Lien officiel direct copiable &amp; partage instantané</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/create?category=Vœux"
                  className="btn-lux w-full py-3.5 text-xs font-bold"
                >
                  <span>Créer un Vœu (2 000 F)</span>
                  <ArrowRight size={14} className="text-[#f0d999]" />
                </Link>
              </motion.div>

              {/* 3. INVITATIONS COUPLE : 4 000 FCFA */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="rounded-3xl bg-gradient-to-b from-[#2a171b] to-[#140b0d] border border-[#d62828]/50 p-6 text-white shadow-md hover:shadow-2xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-xs">
                      🥂
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-rose-950/70 text-rose-300 border border-rose-800">
                      Tête-à-tête Privé
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-[#fed7aa] mb-1">
                    Invitations Couple
                  </h3>
                  <p className="text-xs text-white/70 mb-4 leading-relaxed">
                    Carton d&apos;invitation secret haute couture pour surprendre votre partenaire.
                  </p>

                  <div className="flex items-baseline gap-1.5 mb-5 pb-4 border-b border-white/10">
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                      4 000
                    </span>
                    <span className="text-xs font-semibold text-white/50">FCFA · Tarif unique</span>
                  </div>

                  <ul className="space-y-3 mb-6 text-xs text-white/80">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#f43f5e] shrink-0 mt-0.5" />
                      <span>Invitation romantique secrète en tête-à-tête</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#f43f5e] shrink-0 mt-0.5" />
                      <span>Date, heure, lieu secret &amp; dress-code séduction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#f43f5e] shrink-0 mt-0.5" />
                      <span>Bouton de confirmation complice &amp; musique</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#f43f5e] shrink-0 mt-0.5" />
                      <span><strong>Message d&apos;accompagnement chic WhatsApp</strong></span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/create?category=Couple"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#e63946] via-[#d62828] to-[#991b1b] hover:brightness-110 text-white font-bold text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Créer une Invitation (4 000 F)</span>
                  <ArrowRight size={14} />
                </Link>
              </motion.div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
