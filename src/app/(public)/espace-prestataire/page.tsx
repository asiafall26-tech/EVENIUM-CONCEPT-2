import Link from "next/link";
import { ArrowRight, Building2, CheckCircle, CreditCard, Sparkles } from "lucide-react";

export default function EspacePrestatairePage() {
  return (
    <main className="flex-1 bg-white flex flex-col">
      {/* Hero Section for Providers */}
      <section className="bg-[#111111] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B8860B]/20 text-[#D4AF37] text-sm font-semibold mb-6">
            <Sparkles size={16} />
            <span>Rejoignez l'élite des professionnels</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Faites décoller votre activité événementielle</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Accédez à un réseau exclusif d'organisateurs d'événements. Recevez des demandes de devis qualifiées et développez votre chiffre d'affaires avec Evenium.
          </p>
        </div>
      </section>

      {/* Registration Form & Payment */}
      <section className="py-16 px-6 bg-gray-50 flex-1">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande d'admission</h2>
            <p className="text-gray-500 text-sm mb-8">Renseignez les informations de votre entreprise pour rejoindre notre annuaire.</p>
            
            <form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                  <input type="text" placeholder="Votre prénom" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                  <input type="text" placeholder="Votre nom" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'entreprise</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Ex: Studio Lumière" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie de prestation</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50" required defaultValue="">
                    <option value="" disabled>Sélectionnez votre domaine</option>
                    <option value="traiteur">Traiteur & Restauration</option>
                    <option value="photo">Photographie & Vidéographie</option>
                    <option value="decoration">Décoration & Design</option>
                    <option value="animation">Animation & DJ</option>
                    <option value="lieu">Location de Salle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pays d'intervention</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50" required defaultValue="">
                    <option value="" disabled>Votre pays</option>
                    <option value="sn">🇸🇳 Sénégal</option>
                    <option value="ci">🇨🇮 Côte d'Ivoire</option>
                    <option value="tg">🇹🇬 Togo</option>
                    <option value="cm">🇨🇲 Cameroun</option>
                    <option value="ga">🇬🇦 Gabon</option>
                    <option value="fr">🇫🇷 France</option>
                    <option value="ca">🇨🇦 Canada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Région / Ville</label>
                <input type="text" placeholder="Ex: Dakar" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse Email Professionnelle</label>
                <input type="email" placeholder="contact@votre-entreprise.com" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro de téléphone</label>
                <div className="flex gap-2">
                  <select className="w-[100px] sm:w-[120px] px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all appearance-none cursor-pointer">
                    <option value="+221">🇸🇳 +221</option>
                    <option value="+225">🇨🇮 +225</option>
                    <option value="+228">🇹🇬 +228</option>
                    <option value="+237">🇨🇲 +237</option>
                    <option value="+241">🇬🇦 +241</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+1">🇺🇸 +1</option>
                  </select>
                  <input type="tel" placeholder="77 123 45 67" className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Créer un mot de passe</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50" required />
              </div>
            </form>
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#D4AF37]/30 p-8 sm:p-10 sticky top-24">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">Validation immédiate</h3>
            <p className="text-gray-600 text-sm mb-6">
              Dès le règlement de vos frais d'adhésion, votre profil prestataire est <strong>automatiquement validé</strong> et vous accédez instantanément à votre tableau de bord.
            </p>
            
            <div className="bg-[#F9F5EC] p-6 rounded-xl border border-[#D4AF37]/20 mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">Frais d'admission unique</span>
                <span className="font-bold text-xl text-black">2 500 FCFA</span>
              </div>
              <p className="text-xs text-gray-500">Pas d'abonnement mensuel caché. Accès à vie.</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-sm text-gray-700">
                <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
                Validation automatique du compte
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-700">
                <CheckCircle size={18} className="text-[#B8860B] shrink-0 mt-0.5" />
                Création de votre vitrine dans l'annuaire Gold
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-700">
                <CheckCircle size={18} className="text-[#B8860B] shrink-0 mt-0.5" />
                Tableau de bord de gestion des devis intégré
              </li>
            </ul>

            <button type="button" className="w-full flex items-center justify-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white py-4 rounded-xl text-sm font-semibold shadow-xl shadow-[#D4AF37]/20 transition-all">
              <CreditCard size={18} /> Payer 2 500 FCFA & Activer mon compte
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              Paiement sécurisé par Wave, Orange Money ou Carte Bancaire.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
