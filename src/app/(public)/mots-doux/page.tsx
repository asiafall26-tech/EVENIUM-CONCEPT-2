"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Heart, 
  Sparkles, 
  ArrowRight, 
  Music, 
  Calendar, 
  Search,
  ShieldCheck,
  Lock,
  Gift
} from "lucide-react";
import { 
  ROMANCE_INSPIRATIONS,
  type RomanceServiceType 
} from "@/data/mock/romance";
import { CardStudioModal } from "@/components/cartes/CardStudioModal";

export default function RomancePage() {
  const [selectedService, setSelectedService] = useState<RomanceServiceType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenMotDoux = () => {
    setSelectedService("mot_doux");
    setIsModalOpen(true);
  };

  const handleOpenInvitationCouple = () => {
    setSelectedService("invitation_couple");
    setIsModalOpen(true);
  };

  return (
    <div className="bg-[#fcf8f7] text-[#2b181c] min-h-screen selection:bg-[#d62828]/20 selection:text-[#800f2f] pb-24 overflow-hidden">
      
      {/* 1. EN-TÊTE ÉLÉGANT, LUMINEUX & ROMANTIQUE */}
      <section className="relative pt-16 sm:pt-24 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-[#fff6f7] via-[#fdf8f6] to-[#faeff1] border-b border-[#f1d7dc] overflow-hidden">
        
        {/* Halo doux rose poudré & or champagne */}
        <div 
          aria-hidden 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[500px] rounded-full bg-gradient-to-b from-[#fecdd3]/50 via-[#fed7aa]/25 to-transparent blur-[120px] pointer-events-none" 
        />

        {/* Étoiles & scintillements flottants discrets */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <span className="absolute top-10 left-[18%] text-[#e63946] text-xs animate-gold-float opacity-70">✦</span>
          <span className="absolute top-16 right-[20%] text-[#b8924a] text-sm animate-gold-float-slow opacity-80">✧</span>
          <span className="absolute bottom-8 left-[24%] text-[#b8924a] text-base animate-gold-float-slow opacity-60">✦</span>
          <span className="absolute top-1/2 right-[14%] text-[#e63946] text-xs animate-gold-float opacity-75">✧</span>
        </div>

        <div className="max-w-3xl mx-auto relative z-10 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-[#f4c2c9] text-[#9e1b23] text-[11px] font-bold uppercase tracking-[0.22em] shadow-xs hover:scale-105 transition-transform duration-300">
            <Heart size={13} className="text-[#e63946] fill-[#e63946] animate-pulse" />
            <span>L'Écrin Privé des Amoureux • Evenium</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1a0a0e] leading-[1.15] tracking-tight">
            Pour ceux qui s'aiment, <br className="hidden sm:inline" />
            <span className="italic bg-gradient-to-r from-[#b91c1c] via-[#b8924a] to-[#991b1b] bg-clip-text text-transparent">
              chaque jour est une déclaration.
            </span>
          </h1>

          <p className="font-serif text-base sm:text-xl text-[#6b3e47] max-w-2xl mx-auto leading-relaxed pt-1">
            <span className="italic">Des mots doux scellés au cachet de cire et des invitations secrètes en tête-à-tête.</span>{" "}
            <span className="font-semibold text-[#1a0a0e] not-italic block sm:inline mt-1 sm:mt-0">
              Offrez l'inattendu à celui ou celle qui fait battre votre cœur.
            </span>
          </p>

        </div>
      </section>

      {/* 2. LES 2 SERVICES PRIVILÈGE (LUMINEUX, ÉPURÉS & SANS FAUX MODÈLES) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* SERVICE 1 : LES MOTS DOUX */}
          <div className="rounded-3xl bg-white border border-[#eed7dc] p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-[#b91c1c]/40 transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-14 h-14 rounded-2xl bg-[#fff0f3] border border-[#f7c5ce] flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition-transform">
                  💌
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-[#ffe5e9] text-[#9e1b23] border border-[#f8bcc5]">
                  Romance Privée
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-[#1a0a0e] font-medium">
                Les Mots Doux
              </h2>

              <p className="text-xs sm:text-sm text-[#663e46] leading-relaxed">
                Une lettre d'amour numérique confidentielle, scellée d'un cachet de cire rubis et accompagnée d'une douce mélodie au piano.
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-[#4d2830] pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-[#d62828]">✦</span>
                  <span>Déclarations passionnées & poèmes intimes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#d62828]">✦</span>
                  <span>Mots doux du réveil & tendres pensées</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#d62828]">✦</span>
                  <span>Mots de pardon, de paix & de réconciliation</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-[#f4dee2]">
              <button
                onClick={handleOpenMotDoux}
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#d62828] via-[#ba181b] to-[#800f2f] hover:brightness-105 text-white text-xs sm:text-sm font-bold tracking-wider shadow-lg shadow-rose-950/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Rédiger un Mot Doux</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* SERVICE 2 : LES INVITATIONS COUPLE */}
          <div className="rounded-3xl bg-white border border-[#eed7dc] p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-[#b91c1c]/40 transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-14 h-14 rounded-2xl bg-[#fff0f3] border border-[#f7c5ce] flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition-transform">
                  🕯️
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-[#ffe5e9] text-[#9e1b23] border border-[#f8bcc5]">
                  Tête-à-tête Secret
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-[#1a0a0e] font-medium">
                Invitations Couple
              </h2>

              <p className="text-xs sm:text-sm text-[#663e46] leading-relaxed">
                Un carton d'invitation privé haute couture pour surprendre votre partenaire avec une date, un lieu secret et un bouton d'acceptation complice.
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-[#4d2830] pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-[#d62828]">✦</span>
                  <span>Dîners secrets aux chandelles & tables intimes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#d62828]">✦</span>
                  <span>Escapades romantiques & week-ends surprise</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#d62828]">✦</span>
                  <span>Soirées cocooning, cinéma privé & massages en duo</span>
                </li>
                <li className="flex items-center gap-2 font-medium text-[#9e1b23] bg-[#fff0f3] p-2.5 rounded-xl border border-[#fed4dc]">
                  <span>❤️</span>
                  <span>Bouton interactif exclusif : <em>« J'accepte avec amour »</em></span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-[#f4dee2]">
              <button
                onClick={handleOpenInvitationCouple}
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#d62828] via-[#ba181b] to-[#800f2f] hover:brightness-105 text-white text-xs sm:text-sm font-bold tracking-wider shadow-lg shadow-rose-950/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Créer une Invitation Couple</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* 3. LIEN DE SECOURS DE RÉCUPÉRATION */}
      <section className="max-w-md mx-auto px-4 mt-16 text-center">
        <div className="p-5 rounded-2xl bg-white border border-[#eed7dc] shadow-xs space-y-1.5">
          <p className="text-xs text-[#663e46] flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-[#b8924a]" />
            <span>Vous avez déjà envoyé une attention ?</span>
          </p>
          <Link
            href="/cartes/retrouver"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#b91c1c] hover:underline"
          >
            <Search size={12} />
            <span>Retrouver mon lien avec mon email ou téléphone</span>
          </Link>
        </div>
      </section>

      {/* MODALE DE CRÉATION & PERSONNALISATION */}
      {selectedService && (
        <CardStudioModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cardConfig={{
            type: selectedService,
            templateId: selectedService === "mot_doux" ? "mot-doux-prive" : "invi-couple-secret",
            occasionId: selectedService === "mot_doux" ? "lettre_amour" : "diner_secret",
            occasionName: selectedService === "mot_doux" ? "Mot Doux" : "Invitation Couple",
            templateTitle: selectedService === "mot_doux" ? "Mot Doux Romantique" : "Invitation Privée Couple",
            theme: "ruby",
            waxSealColor: "ruby",
            defaultSender: "Celui qui t'aime",
            defaultRecipient: "Mon Amour",
            defaultKicker: selectedService === "mot_doux" ? "Confidentiel & Secret" : "Rendez-vous Intime • Privé",
            defaultTitle: selectedService === "mot_doux" ? "Pour que tu n'oublies jamais à quel point tu comptes" : "Ce soir, laisse-toi guider... Je m'occupe de tout",
            defaultMessage: selectedService === "mot_doux" 
              ? "Au milieu du bruit du monde, il y a ton sourire qui apaise tout. Je voulais simplement te rappeler à quel point ma vie a pris une saveur unique depuis que tu en fais partie. Merci d'être mon port d'attache et mon plus doux réconfort."
              : "Oublie les contraintes, les écrans et le quotidien. J'ai réservé une parenthèse rien que pour nous deux. Viens avec ton plus beau sourire et laisse-toi chérir comme au premier jour.",
            suggestedMusic: "Experience - Ludovico Einaudi",
            defaultDate: selectedService === "invitation_couple" ? "Ce Vendredi soir" : undefined,
            defaultTime: selectedService === "invitation_couple" ? "20h30 précises" : undefined,
            defaultPlace: selectedService === "invitation_couple" ? "Lieu secret... Je passe te chercher" : undefined,
            defaultDressCode: selectedService === "invitation_couple" ? "Chic & Séduction" : undefined,
            priceFcfa: 3900,
            priceEur: "3,90 €",
            inspirations: ROMANCE_INSPIRATIONS.filter((i) => i.type === selectedService).map((i) => ({
              title: i.title,
              text: i.text,
            }))
          }}
        />
      )}

    </div>
  );
}
