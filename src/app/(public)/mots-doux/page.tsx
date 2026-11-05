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
    <div className="bg-[#120508] text-[#fbf7ee] min-h-screen selection:bg-[#d62828]/40 selection:text-white pb-24 overflow-hidden">
      
      {/* 1. EN-TÊTE ÉLÉGANT & ROMANTIQUE */}
      <section className="relative pt-16 sm:pt-24 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 text-center border-b border-[#3d121c] overflow-hidden">
        
        {/* Halo rouge rubis & or rose */}
        <div 
          aria-hidden 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[500px] rounded-full bg-gradient-to-b from-[#d62828]/30 via-[#ba181b]/15 to-transparent blur-[130px] pointer-events-none" 
        />

        <div className="max-w-3xl mx-auto relative z-10 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-[#d4af37]/40 text-[#f0d999] text-[11px] font-bold uppercase tracking-[0.22em] shadow-lg">
            <Heart size={13} className="text-[#e63946] fill-[#e63946] animate-pulse" />
            <span>L'Écrin Privé des Amoureux • Evenium</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.15] tracking-tight">
            Pour ceux qui s'aiment, <br className="hidden sm:inline" />
            <span className="italic bg-gradient-to-r from-[#ffcad4] via-[#f4a261] to-[#e76f51] bg-clip-text text-transparent">
              chaque jour est une déclaration.
            </span>
          </h1>

          <p className="font-serif text-base sm:text-xl text-[#e8c2ca] max-w-2xl mx-auto leading-relaxed pt-1">
            <span className="italic">Des mots doux scellés au cachet de cire et des invitations secrètes en tête-à-tête.</span>{" "}
            <span className="font-semibold text-white not-italic block sm:inline mt-1 sm:mt-0">
              Offrez l'inattendu à celui ou celle qui fait battre votre cœur.
            </span>
          </p>

        </div>
      </section>

      {/* 2. LES 2 SERVICES PRIVILÈGE (ÉPURÉS & SANS FAUX MODÈLES) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* SERVICE 1 : LES MOTS DOUX */}
          <div className="rounded-3xl bg-gradient-to-b from-[#1f090e] to-[#140407] border border-[#4a1823] p-8 sm:p-10 shadow-2xl flex flex-col justify-between space-y-6 hover:border-[#b8924a]/50 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-2xl bg-[#3b0b14] border border-[#d62828]/40 flex items-center justify-center text-2xl shadow-inner">
                  💌
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-[#d62828]/20 text-[#ffcad4] border border-[#d62828]/40">
                  Romance Privée
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-white font-medium">
                Les Mots Doux
              </h2>

              <p className="text-xs sm:text-sm text-[#d1a3ac] leading-relaxed">
                Une lettre d'amour numérique confidentielle, scellée d'un cachet de cire rubis et accompagnée d'une douce mélodie au piano.
              </p>

              <ul className="space-y-2 text-xs text-[#e8c2ca] pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-[#e63946]">✦</span>
                  <span>Déclarations passionnées & poèmes intimes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#e63946]">✦</span>
                  <span>Mots doux du réveil & tendres pensées</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#e63946]">✦</span>
                  <span>Mots de pardon, de paix & de réconciliation</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleOpenMotDoux}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#d62828] to-[#9e1b23] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Rédiger un Mot Doux</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* SERVICE 2 : LES INVITATIONS COUPLE */}
          <div className="rounded-3xl bg-gradient-to-b from-[#1f090e] to-[#140407] border border-[#4a1823] p-8 sm:p-10 shadow-2xl flex flex-col justify-between space-y-6 hover:border-[#b8924a]/50 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-2xl bg-[#3b0b14] border border-[#d62828]/40 flex items-center justify-center text-2xl shadow-inner">
                  🕯️
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-[#d62828]/20 text-[#ffcad4] border border-[#d62828]/40">
                  Tête-à-tête Secret
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-white font-medium">
                Invitations Couple
              </h2>

              <p className="text-xs sm:text-sm text-[#d1a3ac] leading-relaxed">
                Un carton d'invitation privé haute couture pour surprendre votre partenaire avec une date, un lieu secret et un bouton d'acceptation complice.
              </p>

              <ul className="space-y-2 text-xs text-[#e8c2ca] pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-[#e63946]">✦</span>
                  <span>Dîners secrets aux chandelles & tables intimes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#e63946]">✦</span>
                  <span>Escapades romantiques & week-ends surprise</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#e63946]">✦</span>
                  <span>Soirées cocooning, cinéma privé & massages en duo</span>
                </li>
                <li className="flex items-center gap-2 font-medium text-white">
                  <span className="text-[#d4af37]">❤️</span>
                  <span>Bouton interactif : <em>"J'accepte avec amour"</em></span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleOpenInvitationCouple}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#d62828] to-[#9e1b23] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Créer une Invitation Couple</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* 3. LIEN DE SECOURS DE RÉCUPÉRATION */}
      <section className="max-w-md mx-auto px-4 mt-16 text-center">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
          <p className="text-xs text-[#d1a3ac] flex items-center justify-center gap-1">
            <ShieldCheck size={13} className="text-[#d4af37]" />
            <span>Vous avez déjà envoyé une attention ?</span>
          </p>
          <Link
            href="/cartes/retrouver"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#d4af37] hover:underline"
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
