"use client";

import { Star, Filter, MessageSquare, ThumbsUp, X, Send, Store, Share2, Check, Sparkles, UserCheck } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useBadgeStore } from "@/store/BadgeStore";

export default function PrestataireAvisPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [providerId, setProviderId] = useState<string | null>(null);
  
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  
  const supabase = createClient();

  useEffect(() => {
    fetchReviews();

    const handleNewReview = () => {
      fetchReviews();
    };
    window.addEventListener("evenium_review_added", handleNewReview);
    return () => window.removeEventListener("evenium_review_added", handleNewReview);
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setProviderId(user.id);

    try {
      // Suppression définitive de toute ancienne donnée simulée / faux avis
      try {
        localStorage.removeItem(`evenium_mock_reviews_${user.id}`);
      } catch { }

      const { data } = await supabase
        .from('reviews')
        .select('*, profiles(full_name)')
        .eq('prestataire_id', user.id)
        .order('created_at', { ascending: false });

      const localRepliesKey = `evenium_reviews_replies_${user.id}`;
      let localReplies: Record<string, string> = {};
      try {
        localReplies = JSON.parse(localStorage.getItem(localRepliesKey) || "{}");
      } catch { }

      // Avis enregistrés localement pour ce prestataire
      const localReviewsKey = `evenium_provider_reviews_${user.id}`;
      let localReviews: any[] = [];
      try {
        localReviews = JSON.parse(localStorage.getItem(localReviewsKey) || "[]");
      } catch { }

      const allMap = new Map<string, any>();
      if (data && data.length > 0) {
        data.forEach(r => allMap.set(r.id, r));
      }
      localReviews.forEach(r => {
        if (!allMap.has(r.id)) {
          allMap.set(r.id, r);
        }
      });

      const merged = Array.from(allMap.values()).map(r => ({
        ...r,
        reply: r.reply || localReplies[r.id] || null
      }));
      setReviews(merged);
    } catch {
      setReviews([]);
    }
    setLoading(false);
  };

  const filteredReviews = useMemo(() => {
    if (filterRating === null) return reviews;
    return reviews.filter(r => r.rating === filterRating);
  }, [reviews, filterRating]);

  const handleReplySubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    try {
      await supabase.from('reviews').update({ reply: replyText }).eq('id', id);
    } catch { }

    if (providerId) {
      try {
        const key = `evenium_reviews_replies_${providerId}`;
        const prev = JSON.parse(localStorage.getItem(key) || "{}");
        prev[id] = replyText;
        localStorage.setItem(key, JSON.stringify(prev));
      } catch { }
    }
    
    setReviews(reviews.map(r => r.id === id ? { ...r, reply: replyText } : r));
    setReplyingTo(null);
    setReplyText("");
    useBadgeStore.getState().refresh();
  };

  const calculateAverage = () => {
    if (reviews.length === 0) return "0.0";
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const averageRating = calculateAverage();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2 flex items-center gap-2">
            Avis Clients <Star size={24} className="text-[#b8924a]" fill="#b8924a" />
          </h1>
          <p className="text-gray-500 text-sm">Gérez votre e-réputation, répondez aux commentaires réels de vos clients et collectez de nouveaux avis certifiés.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const link = typeof window !== "undefined" ? `${window.location.origin}/prestataire/profil` : "";
              if (link) navigator.clipboard.writeText(link);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2000);
            }}
            className="flex items-center gap-2 bg-[#281a10] text-[#f7e7b4] px-4 py-2 rounded-full text-xs font-bold hover:brightness-125 transition cursor-pointer shadow-sm"
          >
            {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
            <span>{copiedLink ? "Lien de vitrine copié !" : "Lien de collecte d'avis"}</span>
          </button>
          {filterRating !== null && (
            <button onClick={() => setFilterRating(null)} className="text-xs font-semibold text-gray-500 hover:text-black transition-colors px-3">
              Effacer
            </button>
          )}
          <select 
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm outline-none"
            value={filterRating || ""}
            onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Tous les avis</option>
            <option value="5">5 Étoiles</option>
            <option value="4">4 Étoiles</option>
            <option value="3">3 Étoiles</option>
            <option value="2">2 Étoiles</option>
            <option value="1">1 Étoile</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 [font-variant-numeric:lining-nums]">
        <div className="bg-[#2b2118] text-white p-6 rounded-3xl border border-gray-800 shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Star size={100} />
          </div>
          <h3 className="text-4xl sm:text-6xl font-bold font-serif text-[#b8924a] relative z-10">
            {reviews.length > 0 ? averageRating : "—"}
          </h3>
          <div className="flex items-center justify-center gap-1 my-2 relative z-10">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={16} className={reviews.length > 0 && i <= Math.round(Number(averageRating)) ? "text-[#b8924a]" : "text-gray-600"} fill={reviews.length > 0 && i <= Math.round(Number(averageRating)) ? "#b8924a" : "none"} />
            ))}
          </div>
          <p className="text-sm text-gray-400 relative z-10">
            {reviews.length === 0 ? "0 avis enregistré" : `${reviews.length} avis réel${reviews.length > 1 ? "s" : ""}`}
          </p>
        </div>
        
        <div className="md:col-span-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
          {reviews.length === 0 ? (
            <div className="text-center py-4 space-y-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 text-[#8f6f33] mb-1">
                <Sparkles size={20} />
              </div>
              <h4 className="font-serif font-bold text-gray-900 text-base">Aucune évaluation enregistrée pour le moment</h4>
              <p className="text-xs text-gray-500 max-w-lg mx-auto leading-relaxed">
                Les faux avis ont été supprimés. Dès que vos clients réels laisseront une note sur votre vitrine Evenium, leur évaluation s&apos;affichera automatiquement ici.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {[5,4,3,2,1].map(rating => {
                const count = reviews.filter(r => r.rating === rating).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 w-12 font-medium text-gray-700">
                      {rating} <Star size={12} className="text-[#b8924a]" fill="#b8924a" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#b8924a] rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="w-8 text-right text-gray-500 font-medium">{count}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
           <div className="text-center p-6 sm:p-10 lg:p-12 text-gray-500">Chargement des avis vérifiés...</div>
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:border-[#b8924a]/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg uppercase shadow-lg">
                    {review.profiles?.full_name?.substring(0,2) || "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{review.profiles?.full_name || "Client Evenium"}</h3>
                    <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                  <Star size={14} className="text-[#8f6f33]" fill="#8f6f33" />
                  <span className="font-bold text-[#8f6f33]">{review.rating}</span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">{review.comment}</p>
              
              {review.reply ? (
                <div className="ml-12 p-4 bg-gray-50 border-l-2 border-[#b8924a] rounded-r-2xl relative">
                  <div className="absolute -left-6 top-4 w-4 h-4 rounded-full border-4 border-white bg-[#b8924a]"></div>
                  <h4 className="font-bold text-sm text-gray-900 mb-1 flex items-center gap-2">
                    <Store size={14} className="text-[#b8924a]"/> Votre réponse
                  </h4>
                  <p className="text-sm text-gray-600">{review.reply}</p>
                </div>
              ) : (
                <div className="ml-12">
                  {replyingTo === review.id ? (
                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 space-y-2">
                      <form onSubmit={(e) => handleReplySubmit(e, review.id)} className="flex items-end gap-2">
                        <textarea 
                          autoFocus
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Écrivez votre réponse publique..."
                          className="flex-1 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#b8924a] resize-none text-xs sm:text-sm p-2.5 outline-none h-16"
                        />
                        <div className="flex gap-1.5 shrink-0">
                          <button type="button" onClick={() => {setReplyingTo(null); setReplyText("")}} className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-white transition-colors cursor-pointer" title="Annuler">
                            <X size={18} />
                          </button>
                          <button type="submit" disabled={!replyText.trim()} className="p-2.5 bg-black text-[#f7e7b4] rounded-xl hover:brightness-125 transition-colors disabled:opacity-50 cursor-pointer" title="Envoyer">
                            <Send size={18} />
                          </button>
                        </div>
                      </form>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-gray-400">Modèles rapides :</span>
                        <button
                          type="button"
                          onClick={() => setReplyText("Merci infiniment pour votre confiance et pour ces mots chaleureux ! Ce fut un réel plaisir de contribuer à votre grand jour.")}
                          className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full hover:border-[#b8924a] transition cursor-pointer"
                        >
                          « Merci pour votre confiance ! »
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyText("Toute l'équipe vous remercie ! Nous restons à votre entière disposition pour vos prochaines célébrations.")}
                          className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full hover:border-[#b8924a] transition cursor-pointer"
                        >
                          « Toute l'équipe vous remercie ! »
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {setReplyingTo(review.id); setReplyText("")}} 
                      className="text-sm font-medium text-[#b8924a] hover:text-[#8f6f33] flex items-center gap-2 py-1 px-3 hover:bg-yellow-50 rounded-full transition-colors"
                    >
                      <MessageSquare size={14} />
                      Répondre publiquement
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center p-8 sm:p-12 lg:p-16 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-[#8f6f33] flex items-center justify-center mx-auto shadow-2xs">
              <MessageSquare size={28} />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-bold font-serif text-gray-900">
                {filterRating ? `Aucun avis avec ${filterRating} étoile(s)` : "Aucun avis client pour le moment"}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Tous les faux avis ont été supprimés. Partagez votre lien de vitrine auprès de vos clients récents pour recueillir leurs retours d&apos;expérience vérifiés.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const link = typeof window !== "undefined" ? `${window.location.origin}/prestataire/profil` : "";
                if (link) navigator.clipboard.writeText(link);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="inline-flex items-center gap-2 bg-[#281a10] hover:bg-black text-[#f7e7b4] px-6 py-3 rounded-full text-xs font-bold transition shadow-sm cursor-pointer"
            >
              {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              <span>{copiedLink ? "Lien de vitrine copié !" : "Copier mon lien pour collecter des avis"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
