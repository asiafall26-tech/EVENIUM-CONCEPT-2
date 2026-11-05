"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Gift, 
  Heart, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { getLocalVaultCards, type VirtualCard } from "@/lib/cartesService";

export default function DashboardCartesPage() {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Charger les cartes de l'utilisateur
    const local = getLocalVaultCards();
    setCards(local);
  }, []);

  const handleCopy = (cardId: string) => {
    const url = `${window.location.origin}/carte/${cardId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(cardId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShareWhatsApp = (card: VirtualCard) => {
    const url = `${window.location.origin}/carte/${card.id}`;
    const text = encodeURIComponent(
      `Coucou ${card.recipientName} ✨, voici le lien de ton attention : ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
        
        {/* BANDEAU D'EN-TÊTE */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1a0f07] via-[#2c1a0e] to-[#1a0f07] text-[#fbf7ee] border border-[#b8924a]/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#d4af37] flex items-center gap-1.5 justify-center sm:justify-start">
              <ShieldCheck size={13} />
              <span>Coffre-fort Haute Papeterie</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-white">
              Mes Cartes, Vœux & Attentions
            </h1>
            <p className="text-xs text-[#d9c08c]">
              Tous vos liens créés restent scellés et accessibles à vie ici.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/voeux"
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#fbf7ee] text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5"
            >
              <span>+ Nouveau Vœu</span>
            </Link>
            <Link
              href="/mots-doux"
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#d62828] to-[#9e1b23] hover:brightness-110 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
            >
              <Heart size={12} className="fill-white" />
              <span>+ Mot Doux</span>
            </Link>
          </div>
        </div>

        {/* LISTE DES CARTES ACHETÉES */}
        {cards.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-[#e6d7c3] text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#faf0dc] text-[#8f6f33] border border-[#d9c08c] flex items-center justify-center mx-auto text-2xl">
              💌
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-xl text-[#1a0f07]">Vous n'avez pas encore envoyé d'attention</h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Célébrez l'anniversaire d'un proche avec un Vœu d'Exception ou surprenez votre moitié avec un Mot Doux scellé au cachet de cire.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/voeux"
                className="btn-lux px-5 py-2.5 text-xs !tracking-wider flex items-center gap-1.5"
              >
                <span>Envoyer un Vœu</span>
                <ArrowRight size={13} className="text-[#f0d999]" />
              </Link>
              <Link
                href="/mots-doux"
                className="px-5 py-2.5 rounded-full bg-[#d62828] text-white text-xs font-bold hover:brightness-110 transition-all flex items-center gap-1.5"
              >
                <Heart size={13} className="fill-white" />
                <span>Créer un Mot Doux</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8f6f33]">
              Vos Attentions Envoyées ({cards.length})
            </h2>

            <div className="grid grid-cols-1 gap-3.5">
              {cards.map((card) => {
                const isCouple = card.type === "invitation_couple";
                const isMot = card.type === "mot_doux";

                return (
                  <div
                    key={card.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-[#e6d7c3] shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#faf0dc] border border-[#d9c08c] text-xs flex items-center justify-center">
                          {isCouple ? "🕯️" : isMot ? "💌" : "🌟"}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#8f6f33]">
                          {card.occasionName}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          • {new Date(card.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        {isCouple && card.partnerResponse === "accepted" && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            ❤️ Accepté par votre partenaire
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-lg text-[#1a0f07]">
                        Pour <strong>{card.recipientName}</strong> (de {card.senderName})
                      </h3>

                      <p className="text-xs text-[#554131] italic font-serif line-clamp-1 max-w-xl">
                        "{card.message}"
                      </p>

                      {isCouple && card.rendezVousDate && (
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#8f6f33] pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {card.rendezVousDate}
                          </span>
                          {card.rendezVousTime && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {card.rendezVousTime}
                            </span>
                          )}
                          {card.rendezVousPlace && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} /> {card.rendezVousPlace}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                      <button
                        onClick={() => handleCopy(card.id)}
                        className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        {copiedId === card.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        <span>{copiedId === card.id ? "Copié !" : "Copier le lien"}</span>
                      </button>

                      <button
                        onClick={() => handleShareWhatsApp(card)}
                        className="px-3 py-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#13893e] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Share2 size={14} />
                        <span>WhatsApp</span>
                      </button>

                      <Link
                        href={`/carte/${card.id}`}
                        target="_blank"
                        className="btn-lux px-3.5 py-2 text-xs !tracking-wider flex items-center gap-1"
                      >
                        <span>Voir</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
  );
}

