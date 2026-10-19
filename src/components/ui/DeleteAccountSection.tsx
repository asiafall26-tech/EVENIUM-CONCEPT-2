"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Trash2, X, Loader2, CheckCircle, UserCheck, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteCurrentAccount } from "@/app/actions/delete-self-account";
import { createClient } from "@/utils/supabase/client";

interface DeleteAccountSectionProps {
  role?: "client" | "prestataire";
}

export function DeleteAccountSection({ role = "client" }: DeleteAccountSectionProps) {
  const router = useRouter();
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deletedEmail, setDeletedEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoadingUser(true);
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (_) {
      } finally {
        setIsLoadingUser(false);
      }
    }
    loadUser();
  }, [supabase]);

  const isConfirmed = confirmationInput.trim().toUpperCase() === "SUPPRIMER";

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const result = await deleteCurrentAccount({
        userId: currentUser?.id,
        accessToken: sessionData?.session?.access_token,
      });

      if (result.error) {
        setError(result.error);
        setIsDeleting(false);
        return;
      }

      setDeletedEmail(result.email || currentUser?.email || "votre compte");
      setSuccess(true);

      // Déconnecter côté client et purger les caches locaux
      try {
        await supabase.auth.signOut();
        if (typeof window !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
        }
      } catch (_) {}

      setTimeout(() => {
        window.location.href = "/?deleted=true";
      }, 1800);
    } catch (err: any) {
      setError(err?.message || "Une erreur inattendue est survenue.");
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* CARD ZONE DE DANGER */}
      <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 sm:p-7 relative overflow-hidden transition-all hover:border-red-300">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-red-950">
                  Zone de Danger : Suppression du compte
                </h3>
                {!isLoadingUser && currentUser?.email && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                    <UserCheck size={13} />
                    {currentUser.email}
                  </span>
                )}
                {!isLoadingUser && !currentUser && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                    <ShieldAlert size={13} />
                    Session Démo
                  </span>
                )}
              </div>
              <p className="text-sm text-red-800/80 leading-relaxed max-w-xl">
                {role === "client" ? (
                  <>
                    La suppression de votre compte entraînera l'effacement permanent et irréversible de votre profil, de vos événements, de vos listes d'invités et de votre suivi budgétaire sur <strong>Supabase</strong>.
                  </>
                ) : (
                  <>
                    La suppression de votre compte prestataire entraînera l'effacement définitif de votre vitrine, de vos offres catalogue, de vos demandes de devis et de vos statistiques sur <strong>Supabase</strong>.
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setConfirmationInput("");
              setError(null);
              setIsOpen(true);
            }}
            className="self-start sm:self-center px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-red-600/20 hover:-translate-y-0.5 flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Trash2 size={16} />
            Supprimer mon compte
          </button>
        </div>
      </div>

      {/* MODAL DE CONFIRMATION SÉCURISÉE */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* MODAL HEADER */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </span>
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  Confirmation de suppression
                </h3>
              </div>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 space-y-4">
              {success ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center">
                    <CheckCircle size={30} />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-gray-900">
                    Compte supprimé avec succès
                  </h4>
                  <p className="text-sm text-gray-600">
                    Le compte <strong>{deletedEmail}</strong> a été définitivement effacé de Supabase.
                  </p>
                  <p className="text-xs text-gray-400">
                    Redirection vers la page d'accueil...
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Cette action est <strong>définitive et irréversible</strong>. Votre compte sera clôturé et toutes vos données associées seront effacées de la base Supabase.
                  </p>

                  {currentUser?.email ? (
                    <div className="p-3 bg-red-50/60 border border-red-200/80 rounded-xl text-xs text-red-900 flex items-center gap-2">
                      <UserCheck size={16} className="text-red-600 shrink-0" />
                      <span>Compte qui sera supprimé : <strong>{currentUser.email}</strong></span>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                      <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                      <span>Attention : Vous êtes en mode invité/démo. Aucun compte Supabase n'est actuellement connecté sur ce navigateur.</span>
                    </div>
                  )}

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
                    Pour confirmer la suppression, veuillez saisir le mot <strong className="font-mono text-red-600 bg-white px-1.5 py-0.5 rounded border border-amber-300">SUPPRIMER</strong> ci-dessous :
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600">
                      {error}
                    </div>
                  )}

                  <div>
                    <input
                      type="text"
                      placeholder="Tapez SUPPRIMER"
                      value={confirmationInput}
                      onChange={(e) => setConfirmationInput(e.target.value)}
                      disabled={isDeleting}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all uppercase tracking-wider"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setIsOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={!isConfirmed || isDeleting}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Suppression en cours...
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          Confirmer la suppression
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
