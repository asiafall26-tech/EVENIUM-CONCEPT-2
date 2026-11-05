"use client";

import Link from "next/link";
import { Sparkles, Gift, ArrowRight } from "lucide-react";
import { Fleuron, LuxFrame } from "@/components/landing/LuxOrnaments";
import { VOEUX_CATEGORIES } from "@/data/mock/voeux";

export default function VoeuxPage() {
  return (
    <div className="bg-[#fbf7ee] text-[#2b1d12] min-h-screen selection:bg-[#c9a45e]/30 selection:text-[#1a0f07] pb-20 overflow-hidden">
      
      {/* 1. EN-TÊTE ÉPURÉ AVEC ANIMATION D'ÉCLOSION */}
      <section className="relative pt-12 sm:pt-20 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 text-center bg-silk border-b border-[#e6d7c3] overflow-hidden">
        
        {/* Halo doré chaud en arrière-plan */}
        <div aria-hidden className="absolute -top-28 left-1/2 -translate-x-1/2 w-[850px] h-[450px] rounded-full bg-gradient-to-b from-[#f5dfaa]/60 via-[#edd194]/25 to-transparent blur-[110px] pointer-events-none" />
        
        {/* Poussières d'étoiles dorées flottantes animées */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <span className="absolute top-8 left-[15%] text-amber-400 text-xs animate-gold-float opacity-70">✦</span>
          <span className="absolute top-16 right-[18%] text-[#c9a45e] text-sm animate-gold-float-slow opacity-80">✧</span>
          <span className="absolute bottom-10 left-[22%] text-[#d4af37] text-base animate-gold-float-slow opacity-60">✦</span>
          <span className="absolute top-1/2 right-[12%] text-amber-300 text-xs animate-gold-float opacity-75">✧</span>
          <span className="absolute bottom-6 right-[28%] text-[#c9a45e] text-sm animate-gold-float opacity-65">✦</span>
        </div>

        <div className="max-w-3xl mx-auto relative z-10 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
          
          {/* Badge élégant */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#c9a45e] text-[#8f6f33] text-[11px] font-bold uppercase tracking-[0.22em] shadow-2xs hover:scale-105 transition-transform duration-300">
            <Sparkles size={13} className="text-[#b8924a] animate-spin" style={{ animationDuration: "10s" }} />
            <span>Haute Papeterie Numérique • Evenium</span>
          </div>

          {/* Titre Exact Utilisateur */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1a0f07] leading-[1.12] tracking-tight">
            Envoyez un Vœu d'Exception, <br className="hidden sm:inline" />
            <span className="italic text-gold-foil">et faites éclore les émotions.</span>
          </h1>

          {/* Sous-titre Exact Utilisateur */}
          <p className="font-serif text-base sm:text-xl text-[#8f6f33] max-w-2xl mx-auto leading-relaxed pt-1">
            <span className="italic">Il y a les vœux qu'on lit, puis qu'on oublie. Et il y a ceux qui touchent l'âme, que l'on chérit et relit encore et encore.</span>{" "}
            <span className="font-semibold text-[#1a0f07] not-italic block sm:inline mt-1 sm:mt-0">Ici, vos vœux deviennent inoubliables.</span>
          </p>

        </div>
      </section>

      {/* 2. COLLECTION EN AVANT-PREMIÈRE (SANS FAUX MODÈLES) */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 text-center animate-in fade-in duration-700">
        <div className="card-lux rounded-[2.5rem] p-8 sm:p-14 border border-[#e6d7c3] relative overflow-hidden shadow-sm">
          <LuxFrame className="inset-4 sm:inset-6 opacity-40" />
          <Fleuron className="mx-auto w-36 sm:w-48 h-auto mb-5" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#faf0dc] border border-[#d9c08c] text-[#8f6f33] text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
            <Gift size={13} className="text-[#b8924a]" />
            <span>Collection Exclusive en Préparation</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl text-[#1a0f07] mb-3">
            Lancement prochain des modèles de vœux
          </h2>

          <p className="text-sm sm:text-base text-[#665140] max-w-xl mx-auto leading-relaxed font-light mb-8">
            Nos artistes et calligraphes préparent actuellement les premiers modèles de faire-part et lettres numériques d'exception scellés au cachet de cire. Chaque création sera bientôt disponible pour célébrer vos moments les plus précieux.
          </p>

          {/* Aperçu des thématiques de la future collection */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto mb-10">
            {VOEUX_CATEGORIES.map((cat) => (
              <span
                key={cat.id}
                className="text-xs px-4 py-2 rounded-full bg-white border border-[#e6d7c3] text-[#554131] font-medium shadow-2xs flex items-center gap-1.5"
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
            <Link
              href="/invitations"
              className="btn-lux px-7 py-3 text-xs sm:text-[13px] !tracking-[0.15em] cursor-pointer"
            >
              <span>Découvrir nos invitations</span>
              <ArrowRight size={14} className="text-[#f0d999]" />
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-full text-xs font-semibold text-[#665140] hover:text-[#1a0f07] hover:bg-white transition-all border border-[#e6d7c3] cursor-pointer"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>

    </div>
  );
}
