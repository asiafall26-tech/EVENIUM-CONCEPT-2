"use client";

import { Star, Filter, MessageSquare, ThumbsUp, X, Send } from "lucide-react";
import { useState, useMemo } from "react";

export default function PrestataireAvisPage() {
  const [reviews, setReviews] = useState([
    { id: 1, client: "Ndeye Astou", event: "Mariage", date: "Il y a 2 jours", rating: 5, comment: "Prestation exceptionnelle ! Le repas était délicieux et le service irréprochable. Tous nos invités ont adoré.", likes: 12, reply: null },
    { id: 2, client: "Ousmane Diallo", event: "Dîner de Gala", date: "Le mois dernier", rating: 4, comment: "Très bon service traiteur. Petit retard lors de l'installation mais vite rattrapé par le professionnalisme de l'équipe.", likes: 3, reply: null },
    { id: 3, client: "Amina Diop", event: "Cocktail Privé", date: "Il y a 3 mois", rating: 5, comment: "Je recommande vivement Saveurs d'Afrique. La présentation des plats est digne des grands restaurants.", likes: 8, reply: "Merci beaucoup Amina ! Ce fut un plaisir de vous accompagner pour cet événement." },
  ]);

  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const filteredReviews = useMemo(() => {
    if (filterRating === null) return reviews;
    return reviews.filter(r => r.rating === filterRating);
  }, [reviews, filterRating]);

  const handleReplySubmit = (e: React.FormEvent, id: number) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    setReviews(reviews.map(r => r.id === id ? { ...r, reply: replyText } : r));
    setReplyingTo(null);
    setReplyText("");
  };

  const handleLike = (id: number) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Avis Clients</h1>
          <p className="text-gray-500 text-sm">Gérez votre e-réputation et répondez aux commentaires.</p>
        </div>
        <div className="flex gap-2">
          {filterRating !== null && (
            <button onClick={() => setFilterRating(null)} className="text-xs font-semibold text-gray-500 hover:text-black transition-colors px-3">
              Effacer les filtres
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#111111] text-white p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center">
          <h2 className="text-4xl font-bold text-[#D4AF37] mb-2">4.8</h2>
          <div className="flex gap-1 mb-2">
            {[1,2,3,4,5].map(i => <Star key={i} size={18} className="fill-[#D4AF37] text-[#D4AF37]" />)}
          </div>
          <p className="text-sm text-gray-400">Note Globale</p>
        </div>
        
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <div className="space-y-3">
            {[
              { stars: 5, percent: 85 },
              { stars: 4, percent: 10 },
              { stars: 3, percent: 5 },
              { stars: 2, percent: 0 },
              { stars: 1, percent: 0 },
            ].map((row, idx) => (
              <div key={idx} className="flex items-center gap-4 text-sm cursor-pointer group" onClick={() => setFilterRating(row.stars)}>
                <div className={`flex items-center gap-1 w-12 font-medium transition-colors ${filterRating === row.stars ? 'text-[#B8860B]' : 'text-gray-600 group-hover:text-black'}`}>
                  {row.stars} <Star size={14} className={filterRating === row.stars ? "fill-[#B8860B] text-[#B8860B]" : "fill-yellow-400 text-yellow-400"} />
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#B8860B] h-2 rounded-full transition-all duration-500" style={{ width: `${row.percent}%` }} />
                </div>
                <div className="w-10 text-right text-gray-500 text-xs font-medium">{row.percent}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            Aucun avis ne correspond à ce filtre.
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                    {review.client.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.client}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span className="font-medium bg-gray-100 px-2 py-0.5 rounded">{review.event}</span>
                      <span>• {review.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} />
                  ))}
                </div>
              </div>
              
              <p className="text-gray-700 text-sm leading-relaxed mb-4">"{review.comment}"</p>
              
              {review.reply ? (
                <div className="mb-4 ml-6 p-4 bg-[#F9F5EC] rounded-xl border border-[#E8DCC4] relative">
                  <div className="absolute top-4 -left-3 w-3 h-3 bg-[#F9F5EC] border-l border-b border-[#E8DCC4] rotate-45"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#996B00]">Votre réponse</span>
                    <button onClick={() => setReviews(reviews.map(r => r.id === review.id ? { ...r, reply: null } : r))} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700">{review.reply}</p>
                </div>
              ) : replyingTo === review.id ? (
                <form onSubmit={(e) => handleReplySubmit(e, review.id)} className="mb-4 ml-6">
                  <textarea 
                    autoFocus
                    rows={3} 
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] resize-none"
                    placeholder="Rédigez votre réponse publique..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button type="button" onClick={() => {setReplyingTo(null); setReplyText("")}} className="text-xs font-semibold px-3 py-1.5 text-gray-500 hover:text-black">
                      Annuler
                    </button>
                    <button type="submit" className="flex items-center gap-1.5 bg-[#B8860B] hover:bg-[#996B00] text-white px-4 py-1.5 rounded text-xs font-bold transition-colors">
                      <Send size={12} /> Publier la réponse
                    </button>
                  </div>
                </form>
              ) : null}

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => handleLike(review.id)} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#B8860B] transition-colors">
                    <ThumbsUp size={14} /> {review.likes} utiles
                  </button>
                </div>
                {!review.reply && replyingTo !== review.id && (
                  <button onClick={() => setReplyingTo(review.id)} className="flex items-center gap-1.5 text-xs font-semibold text-[#B8860B] hover:text-[#996B00] transition-colors">
                    <MessageSquare size={14} /> Répondre
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
