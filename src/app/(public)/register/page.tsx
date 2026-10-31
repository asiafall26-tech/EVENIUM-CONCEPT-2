"use client";

import Link from "next/link";
import { ArrowRight, CalendarHeart, Store } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Fleuron, DiamondRule } from "@/components/landing/LuxOrnaments";

/**
 * Inscription : deux parcours à jour.
 * - Organisateur : le tunnel de création (modèle → personnalisation → compte créé à la validation).
 * - Prestataire : l'inscription en 2 étapes de l'espace prestataire (coordonnées puis activité).
 */
export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  return (
    <main className="bg-silk flex-1 px-4 py-14 sm:py-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Fleuron className="mx-auto w-44 h-auto mb-3" />
          <h1 className="font-serif not-italic text-4xl sm:text-5xl text-[#1d120a]">Créer un compte</h1>
          <DiamondRule className="mt-5" />
          <p className="font-serif italic text-xl text-[#3d3126] mt-5">Vous êtes…</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Organisateur */}
          <section className="card-lux p-7 flex flex-col">
            <span className="w-12 h-12 rounded-full bg-gradient-to-b from-[#3b2717] to-[#150d07] text-[#f0d999] border border-[#c9a45e]/70 flex items-center justify-center">
              <CalendarHeart size={22} />
            </span>
            <h2 className="font-serif not-italic text-2xl text-[#1d120a] mt-4">Organisateur</h2>
            <p className="text-sm text-[#3d3126] mt-2 flex-1 leading-relaxed">
              Choisissez votre invitation et personnalisez-la. Votre compte est créé au moment de valider votre événement.
            </p>
            <Link href="/create" className="btn-lux mt-6 w-full py-3.5 text-[11px] sm:text-xs">
              Créer mon événement <ArrowRight size={16} strokeWidth={1.5} className="text-[#f0d999]" />
            </Link>
          </section>

          {/* Prestataire */}
          <section className="card-lux p-7 flex flex-col">
            <span className="w-12 h-12 rounded-full bg-gradient-to-b from-[#3b2717] to-[#150d07] text-[#f0d999] border border-[#c9a45e]/70 flex items-center justify-center">
              <Store size={22} />
            </span>
            <h2 className="font-serif not-italic text-2xl text-[#1d120a] mt-4">Prestataire</h2>
            <p className="text-sm text-[#3d3126] mt-2 flex-1 leading-relaxed">
              Inscription en 2 étapes : vos coordonnées, puis votre activité (événements, prestations et zones d&apos;intervention).
            </p>
            <Link href="/espace-prestataire/inscription" className="btn-lux-light mt-6 w-full py-3.5 text-[11px] sm:text-xs">
              Rejoindre Evenium <ArrowRight size={16} strokeWidth={1.5} className="text-[#8f6f33]" />
            </Link>
          </section>
        </div>

        <p className="text-center text-sm text-[#3d3126] mt-10">
          Déjà inscrit ?{" "}
          <Link href={redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/login"} className="link-lux ml-1 text-xs">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
