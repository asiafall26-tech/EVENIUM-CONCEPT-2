import { CheckCircle, ShieldCheck, Clock, Sparkles } from "lucide-react";
import Reveal from "@/components/landing/Reveal";

export default function WhyChooseUs() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Prestataires Certifiés",
      description: "Chaque prestataire de notre réseau est rigoureusement sélectionné, vérifié et noté par nos experts pour vous garantir une prestation d'excellence."
    },
    {
      icon: Clock,
      title: "Gain de temps absolu",
      description: "Fini les heures de recherche. Gérez vos invitations, votre budget, et vos prestataires depuis une seule plateforme centralisée et intuitive."
    },
    {
      icon: CheckCircle,
      title: "Zéro stress le jour J",
      description: "Grâce à notre outil de planification et de suivi des confirmations (RSVP) en temps réel, vous maîtrisez chaque détail de votre événement."
    },
    {
      icon: Sparkles,
      title: "Designs exclusifs",
      description: "Démarquez-vous avec nos modèles d'invitations (cartes ou vidéos animées) uniques, créés par des designers pour marquer les esprits."
    }
  ];

  return (
    <section className="relative overflow-hidden py-24 md:py-28 px-6 lg:px-8 bg-[#fbf7f0] border-y border-gray-100">
      <div aria-hidden className="absolute -top-32 -left-32 w-[460px] h-[460px] rounded-full bg-[#b8924a]/10 blur-[110px]" />
      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-16 items-start">
        <Reveal className="lg:sticky lg:top-28">
          <p className="inline-flex items-center gap-3 text-accent text-xs md:text-sm font-semibold tracking-[0.25em] uppercase mb-5">
            <span className="w-8 h-px bg-accent" /> Pourquoi nous
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-gray-900 mb-6 leading-tight">
            Pourquoi confier votre événement à <span className="whitespace-nowrap"><span className="italic text-[#8f6f33]">Evenium</span>&nbsp;?</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Votre temps est précieux, et votre événement n&apos;a pas droit à l&apos;erreur.{" "}
            Ne laissez plus la place aux mauvaises surprises ni au stress de dernière minute.{" "}
            <strong className="text-gray-900 font-semibold">Nous avons rassemblé l&apos;élite des prestataires et créé la technologie parfaite</strong> pour transformer l&apos;organisation de votre événement en un pur moment de plaisir.
          </p>
        </Reveal>

        <Reveal className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((feature, index) => (
            <div key={feature.title} className={`flex ${index % 2 ? "sm:translate-y-8" : ""}`}>
              <article className="group flex-1 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_10px_40px_-25px_rgba(40,20,10,0.3)] hover:shadow-[0_25px_60px_-25px_rgba(184,134,11,0.4)] hover:border-[#b8924a]/30 transition-all duration-500">
                <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f5eee1] to-white border border-[#b8924a]/25 text-[#8f6f33] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-500">
                  <feature.icon size={26} />
                </span>
                <h3 className="font-serif text-2xl text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
              </article>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
