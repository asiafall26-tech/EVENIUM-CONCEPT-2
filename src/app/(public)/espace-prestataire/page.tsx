import Link from "next/link";
import { ArrowRight, ShieldCheck, Star } from "lucide-react";
import { Fleuron, DiamondRule, LuxFrame } from "@/components/landing/LuxOrnaments";

export default function EspacePrestataireLanding() {
  return (
    <div className="bg-silk min-h-[80vh] flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-14">
          <Fleuron className="mx-auto w-48 h-auto mb-3" />
          <p className="pl-[0.35em] text-[11px] md:text-xs font-medium tracking-[0.35em] uppercase text-[#8f6f33] mb-4">
            Le réseau d&apos;excellence
          </p>
          <h1 className="font-serif not-italic text-4xl md:text-6xl text-[#1d120a]">
            Espace <span className="italic text-gold-foil">Prestataire</span>
          </h1>
          <DiamondRule className="mt-6" />
          <p className="mt-6 text-lg text-[#3d3126] max-w-2xl mx-auto leading-relaxed">
            Rejoignez l&apos;écosystème Evenium et proposez vos services d&apos;excellence à des milliers de clients organisant leurs événements.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* OPTION 1 : PRESTATAIRE EVENIUM (Déjà sélectionné) */}
          <div className="card-lux p-6 sm:p-8 lg:p-10 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck size={100} className="text-[#b8924a]" />
            </div>

            <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#3b2717] to-[#150d07] text-[#f0d999] border border-[#c9a45e]/70 shadow-[0_0_20px_-6px_rgba(233,196,120,0.7)] flex items-center justify-center mb-8">
              <ShieldCheck size={28} />
            </div>

            <h2 className="font-serif not-italic text-2xl text-[#1d120a] mb-4">Je suis déjà prestataire Evenium</h2>
            <p className="text-[#3d3126] mb-8 flex-1 leading-relaxed">
              Vous avez été sélectionné par Evenium et avez reçu vos identifiants exclusifs (ex: EVN-0001) ? Connectez-vous à votre espace sécurisé.
            </p>

            <Link href="/login?role=prestataire" className="btn-lux w-full py-4 text-xs">
              Se connecter <ArrowRight size={18} strokeWidth={1.5} className="text-[#f0d999]" />
            </Link>
          </div>

          {/* OPTION 2 : PRESTATAIRE EXTERNE (Nouvelle adhésion) */}
          <div className="bg-gradient-to-b from-[#2a1b0f] to-[#120b06] rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#c9a45e]/50 shadow-[0_24px_50px_-24px_rgba(20,12,6,0.8)] flex flex-col h-full relative overflow-hidden group">
            <LuxFrame className="inset-2.5 opacity-50" />
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Star size={100} className="text-[#c9a45e]" />
            </div>

            <div className="w-16 h-16 rounded-full bg-white/5 text-[#f0d999] border border-[#c9a45e]/70 shadow-[0_0_20px_-6px_rgba(233,196,120,0.7)] flex items-center justify-center mb-8">
              <Star size={28} />
            </div>

            <h2 className="font-serif not-italic text-2xl text-[#fbf3e4] mb-4">Je souhaite devenir prestataire</h2>
            <p className="text-[#e9dcc6]/75 mb-8 flex-1 leading-relaxed">
              Vous souhaitez rejoindre notre réseau de prestataires ? Créez votre profil, adhérez à Evenium et recevez le badge EXTERNE.
            </p>

            <Link href="/espace-prestataire/inscription" className="btn-lux-light relative w-full py-4 text-xs">
              Rejoindre Evenium <ArrowRight size={18} strokeWidth={1.5} className="text-[#8f6f33]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
