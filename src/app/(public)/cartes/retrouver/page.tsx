"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  ArrowLeft, 
  Sparkles, 
  Heart,
  Calendar,
  Loader2 
} from "lucide-react";
import { searchCardsByContact, type VirtualCard } from "@/lib/cartesService";

export default function RetrouverCartesPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VirtualCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const found = await searchCardsByContact(query);
    setResults(found);
    setLoading(false);
  };

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
    <div className="bg-[#fbf7ee] text-[#2b1d12] min-h-screen pb-20 selection:bg-[#c9a45e]/30">
      
      {/* EN-TÊTE ÉPURÉ */}
      <div className="border-b border-[#e6d7c3] bg-white/60 backdrop-blur-md px-4 sm:px-8 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/voeux"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8f6f33] hover:text-[#1a0f07] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Retour aux modèles</span>
          </Link>

          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8f6f33]">
            Coffre-fort Evenium
          </span>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pt-10 sm:pt-16">
        
        <div className="text-center space-y-3 mb-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#faf0dc] border border-[#d9c08c] flex items-center justify-center text-xl text-[#8f6f33]">
            <ShieldCheck size={24} />
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl text-[#1a0f07]">
            Retrouver mon achat & mes liens
          </h1>
          <p className="text-xs sm:text-sm text-[#665140] max-w-md mx-auto leading-relaxed">
            Vous avez acheté un Vœu d'Exception, un Mot Doux ou une Invitation Couple et perdu le lien ? Retrouvez-le ici instantanément.
          </p>
        </div>

        {/* FORMULAIRE DE RECHERCHE */}
        <form onSubmit={handleSearch} className="mb-10">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-[#d9c08c] shadow-lg flex items-center gap-2">
            <Search size={18} className="text-[#8f6f33] ml-2 shrink-0" />
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Entrez votre email ou numéro de téléphone..."
              className="w-full px-2 py-2 text-xs sm:text-sm text-[#1a0f07] focus:outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-lux shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 text-xs !tracking-[0.1em] cursor-pointer flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Recherche...</span>
                </>
              ) : (
                <span>Rechercher</span>
              )}
            </button>
          </div>
          <span className="block text-[11px] text-gray-500 text-center mt-2">
            Saisissez l'email ou le téléphone Wave/OM utilisé lors du paiement.
          </span>
        </form>

        {/* RÉSULTATS */}
        {results !== null && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8f6f33] flex items-center justify-between">
              <span>Résultats trouvés ({results.length})</span>
            </h2>

            {results.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-[#e6d7c3] text-center space-y-2">
                <span className="text-2xl">🔍</span>
                <p className="font-serif text-base text-[#1a0f07]">Aucune carte trouvée pour cette recherche</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Vérifiez l'orthographe de votre email ou essayez avec votre numéro de téléphone (au format utilisé lors du paiement).
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((card) => {
                  const isCouple = card.type === "invitation_couple";
                  const isMot = card.type === "mot_doux";

                  return (
                    <div
                      key={card.id}
                      className="p-5 rounded-2xl bg-white border border-[#d9c08c] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#faf0dc] text-xs flex items-center justify-center">
                            {isCouple ? "🕯️" : isMot ? "💌" : "🌟"}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8f6f33]">
                            {card.occasionName}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            • {new Date(card.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                        </div>

                        <h3 className="font-serif text-base text-[#1a0f07] font-semibold">
                          Pour <strong>{card.recipientName}</strong> (de la part de {card.senderName})
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1 italic">
                          "{card.message}"
                        </p>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        <button
                          onClick={() => handleCopy(card.id)}
                          className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedId === card.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          <span>{copiedId === card.id ? "Copié" : "Copier"}</span>
                        </button>

                        <button
                          onClick={() => handleShareWhatsApp(card)}
                          className="px-3 py-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#13893e] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Share2 size={14} />
                          <span className="hidden sm:inline">WhatsApp</span>
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
            )}
          </div>
        )}

      </main>

    </div>
  );
}
