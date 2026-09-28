import Link from "next/link";
import { ArrowRight, ShieldCheck, Star } from "lucide-react";

export default function EspacePrestataireLanding() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 px-4 bg-gray-50">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            Espace Prestataire Evenium
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Rejoignez l'écosystème Evenium et proposez vos services d'excellence à des milliers de clients organisant leurs événements.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* OPTION 1 : PRESTATAIRE EVENIUM (Déjà sélectionné) */}
          <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition-all flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck size={100} className="text-[#D4AF37]" />
            </div>
            
            <div className="w-16 h-16 bg-[#F9F5EC] text-[#B8860B] rounded-2xl flex items-center justify-center mb-8 shadow-sm">
              <ShieldCheck size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Je suis déjà prestataire Evenium</h2>
            <p className="text-gray-600 mb-8 flex-1">
              Vous avez été sélectionné par Evenium et avez reçu vos identifiants exclusifs (ex: EVN-0001) ? Connectez-vous à votre espace sécurisé.
            </p>
            
            <Link 
              href="/login?role=prestataire"
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-black/10 transition-colors"
            >
              SE CONNECTER <ArrowRight size={18} />
            </Link>
          </div>

          {/* OPTION 2 : PRESTATAIRE EXTERNE (Nouvelle adhésion) */}
          <div className="bg-gradient-to-br from-[#1A1A1A] to-black rounded-3xl p-10 border border-gray-800 shadow-xl hover:shadow-2xl transition-all flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Star size={100} className="text-[#D4AF37]" />
            </div>

            <div className="w-16 h-16 bg-white/10 text-[#D4AF37] rounded-2xl flex items-center justify-center mb-8 shadow-sm backdrop-blur-sm">
              <Star size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Je souhaite devenir prestataire</h2>
            <p className="text-gray-400 mb-8 flex-1">
              Vous souhaitez rejoindre notre réseau de prestataires ? Créez votre profil, adhérez à Evenium et recevez le badge EXTERNE.
            </p>
            
            <Link 
              href="/espace-prestataire/inscription"
              className="w-full flex items-center justify-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-[#B8860B]/20 transition-colors"
            >
              REJOINDRE EVENIUM <ArrowRight size={18} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
