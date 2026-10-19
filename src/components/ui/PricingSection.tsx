"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
          title: "Gestion budgétaire & Dépenses en direct",
          desc: "Suivi des acomptes, calcul automatique du solde et alertes de dépassement."
        },
        {
          title: "Checklist & Planning intelligent du Jour J",
          desc: "Rétroplanning chronologique pour maîtriser chaque tâche sans rien oublier."
        },
        {
          title: "Annuaire prestataires & Assistance 7j/7",
          desc: "Accès aux meilleurs prestataires certifiés Evenium à 0% de commission et support prioritaire dédié."
        }
      ],
      carte: [
        {
          title: "Tout le pack Premium inclus",
          desc: "Carte statique élégante (sans son), galerie photos, suivi RSVP en direct et QR Code."
        },
        {
          title: "Gestion budgétaire & Dépenses en direct",
          desc: "Suivi des acomptes, calcul automatique du solde et alertes de dépassement."
        },
        {
          title: "Checklist & Planning intelligent du Jour J",
          desc: "Rétroplanning chronologique pour maîtriser chaque tâche sans rien oublier."
        },
        {
          title: "Annuaire prestataires & Assistance 7j/7",
          desc: "Accès aux meilleurs prestataires certifiés Evenium à 0% de commission et support prioritaire dédié."
        }
      ]
    },
  }
];

export default function PricingSection() {
  const [invitationType, setInvitationType] = useState<"carte" | "animee">("animee");

  return (
    <section id="tarifs" className="relative py-14 md:py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#b8924a]/10 blur-[100px] pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto">
        
        {/* En-tête compact */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 text-[#8f6f33] bg-[#fbf7f0] border border-[#b8924a]/30 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles size={12} className="text-[#b8924a]" />
            Tarifs clairs &amp; sans surprise
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
            Choisissez la formule adaptée à votre événement
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-6">
            Paiement unique, aucun abonnement, accès immédiat à votre invitation.
          </p>

          {/* Toggle compact et élégant */}
          <div className="bg-[#fbf7f0] border border-[#b8924a]/30 p-1 rounded-full inline-flex shadow-xs">
            <button
              type="button"
              onClick={() => setInvitationType("animee")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                invitationType === 'animee'
                  ? 'bg-black text-[#b8924a] shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              ✨ Faire-part immersif animé
            </button>
            <button
              type="button"
              onClick={() => setInvitationType("carte")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                invitationType === 'carte'
                  ? 'bg-black text-[#b8924a] shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              📄 Carte statique classique
            </button>
          </div>

          {/* Notification explicite sur les sons / fonctionnalités */}
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

        {/* Grille des 3 formules proportionnées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
          
          {/* Formule STANDARD */}
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col p-6 rounded-3xl bg-white border border-gray-200/90 hover:border-[#b8924a]/40 transition-colors shadow-sm hover:shadow-lg justify-between"
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
              className="w-full py-3 text-center rounded-xl font-bold text-xs sm:text-sm text-gray-900 border border-gray-300 hover:bg-black hover:text-[#b8924a] hover:border-black transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              Choisir Standard
            </Link>
          </motion.div>

          {/* Formule PREMIUM */}
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col p-6 rounded-3xl bg-white border-2 border-[#b8924a]/40 shadow-sm hover:shadow-lg justify-between relative"
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
              className="w-full py-3 text-center rounded-xl font-bold text-xs sm:text-sm text-gray-900 border border-gray-300 hover:bg-black hover:text-[#b8924a] hover:border-black transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              Choisir Premium
            </Link>
          </motion.div>

          {/* Formule GOLD VIP */}
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col p-6 rounded-3xl bg-[#241b13] border border-[#b8924a]/50 shadow-xl relative overflow-hidden text-white justify-between"
          >
            <div aria-hidden className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#b8924a]/20 blur-[70px] pointer-events-none" />
            
            {/* Badge Recommandé */}
            <div className="absolute top-5 right-5 text-[9px] font-bold uppercase tracking-wider text-[#241b13] bg-gradient-to-r from-[#b8924a] via-[#d9c08c] to-[#b8924a] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Crown size={11} /> {formulas[2].badge}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#b8924a]">
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
              <span>Choisir Gold VIP</span>
              <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
