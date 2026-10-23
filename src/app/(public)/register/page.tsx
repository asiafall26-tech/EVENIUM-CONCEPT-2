"use client";

import Link from "next/link";
import { ArrowRight, CalendarHeart, Store } from "lucide-react";
import { useSearchParams } from "next/navigation";

/**
 * Inscription : deux parcours à jour.
 * - Organisateur : le tunnel de création (modèle → personnalisation → compte créé à la validation).
 * - Prestataire : l'inscription en 2 étapes de l'espace prestataire (coordonnées puis activité).
 */
export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  return (
    <main className="flex-1 bg-[#faf8f4] px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl text-gray-900">Créer un compte</h1>
          <p className="text-gray-500 text-sm mt-2">Vous êtes…</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Organisateur */}
          <section className="bg-white rounded-3xl border border-[#e4d8c4] p-6 flex flex-col">
            <CalendarHeart size={28} className="text-[#b8924a]" />
            <h2 className="font-serif text-2xl text-gray-900 mt-3">Organisateur</h2>
            <p className="text-sm text-gray-600 mt-2 flex-1">
              Choisissez votre invitation et personnalisez-la. Votre compte est créé au moment de valider votre événement.
            </p>
            <Link
              href="/create"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2b2118] text-[#f5eee1] py-3.5 text-sm font-semibold"
            >
              Créer mon événement <ArrowRight size={16} />
            </Link>
          </section>

          {/* Prestataire */}
          <section className="bg-white rounded-3xl border border-[#e4d8c4] p-6 flex flex-col">
            <Store size={28} className="text-[#b8924a]" />
            <h2 className="font-serif text-2xl text-gray-900 mt-3">Prestataire</h2>
            <p className="text-sm text-gray-600 mt-2 flex-1">
              Inscription en 2 étapes : vos coordonnées, puis votre activité (événements, prestations et zones d&apos;intervention).
            </p>
            <Link
              href="/espace-prestataire/inscription"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#2b2118] text-[#2b2118] py-3.5 text-sm font-semibold"
            >
              Rejoindre Evenium <ArrowRight size={16} />
            </Link>
          </section>
        </div>

        <p className="text-center text-sm text-gray-600 mt-8">
          Déjà inscrit ?{" "}
          <Link href={redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/login"} className="font-semibold text-[#8f6f33] hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
