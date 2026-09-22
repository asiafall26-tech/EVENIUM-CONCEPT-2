import { CheckCircle, ShieldCheck, Clock, Sparkles } from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: <ShieldCheck size={32} className="text-[#B8860B]" />,
      title: "Prestataires Certifiés",
      description: "Chaque prestataire de notre réseau est rigoureusement sélectionné, vérifié et noté par nos experts pour vous garantir une prestation d'excellence."
    },
    {
      icon: <Clock size={32} className="text-[#B8860B]" />,
      title: "Gain de temps absolu",
      description: "Fini les heures de recherche. Gérez vos invitations, votre budget, et vos prestataires depuis une seule plateforme centralisée et intuitive."
    },
    {
      icon: <CheckCircle size={32} className="text-[#B8860B]" />,
      title: "Zéro stress le jour J",
      description: "Grâce à notre outil de planification et de suivi des confirmations (RSVP) en temps réel, vous maîtrisez chaque détail de votre événement."
    },
    {
      icon: <Sparkles size={32} className="text-[#B8860B]" />,
      title: "Designs exclusifs",
      description: "Démarquez-vous avec nos modèles d'invitations (cartes ou vidéos animées) uniques, créés par des designers pour marquer les esprits."
    }
  ];

  return (
    <section className="py-24 px-6 lg:px-8 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">Pourquoi confier votre événement à <span className="text-[#B8860B]">Evenium</span> ?</h2>
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
            Votre temps est précieux, et votre événement n'a pas droit à l'erreur. <br className="hidden md:block" />
            Ne laissez plus la place aux mauvaises surprises ni au stress de dernière minute. <strong className="text-gray-900 font-semibold">Nous avons rassemblé l'élite des prestataires et créé la technologie parfaite</strong> pour transformer l'organisation de votre événement en un pur moment de plaisir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 border border-gray-100 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
