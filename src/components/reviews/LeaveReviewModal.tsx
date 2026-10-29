"use client";

import { useState } from "react";
import { Star, X, CheckCircle2, Loader2, MessageSquare, AlertCircle, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  providerId: string;
  providerName: string;
  providerRole?: string;
  eventId?: string;
  eventName?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: "Décevant",
  2: "Moyen",
  3: "Bonne prestation",
  4: "Très satisfait",
  5: "Exceptionnel & Recommandé !",
};

export function LeaveReviewModal({
  isOpen,
  onClose,
  onSuccess,
  providerId,
  providerName,
  providerRole = "Prestataire",
  eventId,
  eventName,
}: Props) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentScore = hoverRating || rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || rating < 1) {
      setError("Veuillez sélectionner une note de 1 à 5 étoiles.");
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setError("Veuillez saisir un commentaire d'au moins 5 caractères.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Vous devez être connecté pour laisser un avis.");
      }

      let { error: insertError } = await supabase.from("reviews").insert({
        prestataire_id: providerId,
        client_id: user.id,
        event_id: eventId || null,
        rating: rating,
        comment: comment.trim(),
        created_at: new Date().toISOString(),
      });

      // Si la colonne event_id n'existe pas encore dans la table Supabase, réessayer sans event_id
      if (insertError && (insertError.message?.includes("event_id") || insertError.code === "PGRST204")) {
        console.warn("Colonne event_id absente de 'reviews', nouvel essai sans event_id...");
        const retry = await supabase.from("reviews").insert({
          prestataire_id: providerId,
          client_id: user.id,
          rating: rating,
          comment: comment.trim(),
          created_at: new Date().toISOString(),
        });
        insertError = retry.error;
      }

      if (insertError) {
        console.warn("Erreur insertion avis reviews:", insertError);
        throw new Error(insertError.message || "Erreur lors de l'enregistrement de l'avis.");
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess?.();
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err?.message || "Impossible d'enregistrer votre avis pour l'instant.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white flex items-start justify-between relative">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] flex items-center gap-1.5">
              <Sparkles size={12} /> Évaluation Organisateur
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold mt-1 text-white">
              Donner un avis sur {providerName}
            </h3>
            <p className="text-xs text-stone-300 mt-0.5">
              {providerRole} {eventName ? `• Pour « ${eventName} »` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-in zoom-in duration-300">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="font-serif text-2xl font-bold text-stone-900">Merci pour votre retour !</h4>
            <p className="text-sm text-stone-600">
              Votre note et commentaire ont été transmis avec succès au prestataire.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Note en étoiles */}
            <div className="text-center space-y-2 py-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Votre note globale
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1.5 hover:scale-115 active:scale-95 transition-transform cursor-pointer"
                    aria-label={`${star} étoile(s)`}
                  >
                    <Star
                      size={32}
                      className={
                        star <= currentScore
                          ? "text-[#b8924a] fill-[#b8924a] drop-shadow-xs"
                          : "text-stone-300 fill-transparent"
                      }
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold text-[#8f6f33] h-4">
                {RATING_LABELS[currentScore] || ""}
              </p>
            </div>

            {/* Commentaire */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Votre retour d&apos;expérience <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
                placeholder="Qualité de la prestation, ponctualité, communication, professionnalisme..."
                className="w-full px-4 py-3 bg-[#faf8f5] border border-stone-300 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50 focus:border-[#b8924a] transition-all resize-none font-medium"
              />
              <p className="text-[11px] text-stone-500">
                Votre avis aidera les autres organisateurs et permettra au prestataire d&apos;améliorer ses services.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b8924a] to-[#d4af37] text-stone-950 text-xs font-extrabold hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Envoi en cours...
                  </>
                ) : (
                  <>
                    <Star size={14} className="fill-stone-950" /> Publier mon avis
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
