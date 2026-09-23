import Link from "next/link";
import { ArrowRight, Sparkles, Calendar, Users, Wallet, Star, ShieldCheck, Heart, LayoutList, Clock, MessageCircle, Globe, MapPin } from "lucide-react";
import Image from "next/image";
import PricingSection from "@/components/ui/PricingSection";
import WhyChooseUs from "@/components/ui/WhyChooseUs";

export default function Home() {
  return (
    <main className="flex-1 bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[90vh] bg-[url('/hero-collage.jpg')] bg-cover bg-center bg-no-repeat flex items-center">
        {/* Gradient overlay to ensure text is visible on the left side, fading to transparent on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FCFBF8] via-[#FCFBF8]/90 to-transparent w-full md:w-2/3 z-0"></div>
        
        <div className="w-full px-6 md:px-16 lg:px-24 xl:px-32 py-20 relative z-10">
          <div className="max-w-lg md:max-w-xl flex flex-col items-start text-left">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#D4AF37]/30 text-accent text-sm font-semibold mb-8 shadow-sm backdrop-blur-sm">
              <Sparkles size={16} />
              <span>La référence de l'organisation événementielle</span>
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl tracking-tight text-primary leading-tight">
              Avec Evenium, <br />
              <span className="text-accent italic">fini le stress d'organiser votre événement.</span>
            </h1>
            
            <p className="mt-8 text-lg text-gray-700 max-w-lg font-sans font-medium">
              Créez des invitations digitales éblouissantes, gérez votre budget, et accédez aux meilleurs prestataires. Tout votre événement, centralisé sur une seule plateforme premium.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-start items-center w-full sm:w-auto">
              <Link
                href="/create"
                className="w-full sm:w-auto rounded-full bg-primary px-8 py-4 text-sm font-semibold text-white shadow-lg hover:bg-black/80 transition-all flex items-center justify-center gap-2 hover:gap-4"
              >
                Créer mon événement <ArrowRight size={16} />
              </Link>
              <Link
                href="/invitations"
                className="w-full sm:w-auto rounded-full bg-white border border-[#D4AF37]/50 px-8 py-4 text-sm font-semibold text-primary shadow-sm hover:bg-[#F9F5EC] transition-all text-center"
              >
                Découvrir les modèles
              </Link>
            </div>


          </div>
        </div>
      </section>

      {/* 2. SECTION PROBLÈME */}
      <section className="bg-secondary/50 py-24 px-6 lg:px-8 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">Parce que l'organisation ne devrait pas être un calvaire</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Organiser un événement mène souvent au stress et à l'éparpillement. Evenium résout ces problèmes.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                <Clock size={24} />
              </div>
              <h3 className="font-semibold text-xl mb-3">Le temps perdu</h3>
              <p className="text-gray-600">Fini les heures passées à chercher le bon prestataire ou à relancer vos invités un par un par message.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6">
                <Wallet size={24} />
              </div>
              <h3 className="font-semibold text-xl mb-3">Le stress du budget</h3>
              <p className="text-gray-600">Évitez les mauvaises surprises et les dépassements grâce à un suivi en temps réel de vos dépenses.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                <LayoutList size={24} />
              </div>
              <h3 className="font-semibold text-xl mb-3">La dispersion des infos</h3>
              <p className="text-gray-600">Listes Excel, messages WhatsApp, notes éparpillées... Centralisez tout au même endroit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 SECTION NOS SERVICES */}
      <section id="services" className="py-24 px-6 lg:px-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-6 shadow-sm">
              <Sparkles size={16} />
              <span>Tout-en-un</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-primary mb-6">Nos Services</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Evenium regroupe tous les outils nécessaires pour gérer votre événement de A à Z, de la première invitation jusqu'au jour J, sans le moindre stress.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {/* Service 1 */}
            <div className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.35rem)] bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white text-[#B8860B] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                <Sparkles size={28} />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-gray-900">Invitations sur-mesure</h3>
              <p className="text-gray-600 leading-relaxed">
                Générez des cartes d'invitation statiques ou animées, entièrement personnalisables à l'image de votre événement.
              </p>
            </div>

            {/* Service 2 */}
            <div className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.35rem)] bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white text-[#B8860B] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                <Users size={28} />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-gray-900">Suivi des invités</h3>
              <p className="text-gray-600 leading-relaxed">
                Envoyez vos invitations en un clic et suivez les réponses (RSVP) de chacun de vos invités en temps réel.
              </p>
            </div>

            {/* Service 3 */}
            <div className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.35rem)] bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white text-[#B8860B] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                <Wallet size={28} />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-gray-900">Suivi du budget</h3>
              <p className="text-gray-600 leading-relaxed">
                Gardez le contrôle total sur vos finances grâce à un outil de suivi budgétaire clair et détaillé.
              </p>
            </div>

            {/* Service 4 */}
            <div className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.35rem)] bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white text-[#B8860B] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                <LayoutList size={28} />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-gray-900">To-do List intégrée</h3>
              <p className="text-gray-600 leading-relaxed">
                Ne laissez plus rien au hasard. Gérer vos tâches de A à Z avec une to-do list intelligente pour une organisation sans faille.
              </p>
            </div>

            {/* Service 5 */}
            <div className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.35rem)] bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white text-[#B8860B] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                <Star size={28} />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-gray-900">Réseau de prestataires</h3>
              <p className="text-gray-600 leading-relaxed">
                Accédez à un carnet d'adresses exclusif et connectez-vous avec des prestataires triés sur le volet pour garantir le succès de votre événement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION FONCTIONNALITÉS */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">Des outils pensés pour votre sérénité</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Découvrez les fonctionnalités de notre tableau de bord conçu pour vous simplifier la vie.</p>
          </div>

          <div className="space-y-24">
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center">
                  <Sparkles size={24} />
                </div>
                <h3 className="font-serif text-3xl">Invitations Digitales d'Exception</h3>
                <p className="text-gray-600 text-lg">Créez des invitations qui marquent les esprits. Cartes élégantes ou modèles animés, personnalisez-les à votre image et suivez les confirmations en temps réel.</p>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-gray-700"><ShieldCheck className="text-accent" /> Design premium exclusif</li>
                  <li className="flex gap-3 text-gray-700"><ShieldCheck className="text-accent" /> Suivi automatique des RSVP</li>
                  <li className="flex gap-3 text-gray-700"><ShieldCheck className="text-accent" /> Relance en un clic</li>
                </ul>
              </div>
              <div className="flex-1 w-full bg-gray-100 rounded-2xl aspect-[4/3] border border-gray-200 shadow-xl relative overflow-hidden flex items-center justify-center group">
                 <Image src="/invitations-preview.png" alt="Aperçu du dashboard Invitations" fill className="object-cover object-left-top group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center">
                  <Wallet size={24} />
                </div>
                <h3 className="font-serif text-3xl">Maîtrise totale de votre budget</h3>
                <p className="text-gray-600 text-lg">Fixez votre budget global et suivez vos dépenses catégorie par catégorie. Evenium vous alerte avant tout dépassement.</p>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-gray-700"><ShieldCheck className="text-accent" /> Graphiques de répartition</li>
                  <li className="flex gap-3 text-gray-700"><ShieldCheck className="text-accent" /> Suivi des acomptes</li>
                </ul>
              </div>
              <div className="flex-1 w-full bg-gray-100 rounded-2xl aspect-[4/3] border border-gray-200 shadow-xl relative overflow-hidden flex items-center justify-center group">
                <Image src="/budget-preview.png" alt="Aperçu de la gestion budgétaire" fill className="object-cover object-left-top group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION COMMENT ÇA MARCHE */}
      <section className="bg-primary text-white py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl mb-4">L'organisation simplifiée en 3 étapes</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Ligne connectrice sur desktop */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-[1px] bg-white/20 z-0" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6 shadow-lg shadow-accent/20">1</div>
              <h3 className="font-semibold text-xl mb-3">Créez votre événement</h3>
              <p className="text-gray-300">Renseignez les détails, choisissez votre formule et définissez votre budget initial.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6 shadow-lg shadow-accent/20">2</div>
              <h3 className="font-semibold text-xl mb-3">Personnalisez & Invitez</h3>
              <p className="text-gray-300">Sélectionnez votre modèle d'invitation, personnalisez-le et envoyez-le à vos proches.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6 shadow-lg shadow-accent/20">3</div>
              <h3 className="font-semibold text-xl mb-3">Gérez & Profitez</h3>
              <p className="text-gray-300">Trouvez vos prestataires, suivez les confirmations et profitez du jour J sans stress.</p>
            </div>
          </div>
        </div>
      </section>


      {/* 6. SECTION INVITATIONS */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">Des invitations qui marquent les esprits</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">Découvrez un aperçu de notre collection. Des designs exclusifs pour annoncer la couleur de votre événement.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="aspect-[3/4] bg-gray-100 rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group cursor-pointer">
                <Image src={`/invit-${item}.jpg`} alt={`Modèle d'invitation ${item}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase shadow-sm z-10 text-[#B8860B]">Modèle 0{item}</div>
              </div>
            ))}
          </div>
          
          <Link href="/invitations" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-200 font-semibold hover:bg-gray-50 transition-colors">
            Découvrir la galerie
          </Link>
        </div>
      </section>

      {/* 7. SECTION POURQUOI NOUS CHOISIR */}
      <WhyChooseUs />

      {/* 8. SECTION TARIFS (Avec Slider Mobile et Hover Desktop) */}
      <PricingSection />
      
      {/* 8. CTA Final */}
      <section className="py-24 px-6 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-primary mb-8">Prêt à vivre un événement inoubliable ?</h2>
        <Link
          href="/create"
          className="inline-flex rounded-full bg-primary px-8 py-4 text-sm font-semibold text-white shadow-lg hover:bg-black/80 transition-all items-center gap-2"
        >
          Commencer maintenant <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}
