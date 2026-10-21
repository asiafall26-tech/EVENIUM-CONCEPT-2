"use client";

import { use, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import VeloursInvitation from "@/components/invitations/velours/VeloursInvitation";
import { VELOURS_MODEL_ID, seedFromEvent } from "@/components/invitations/velours/content";
import SceauInvitation from "@/components/invitations/sceau/SceauInvitation";
import * as sceau from "@/components/invitations/sceau/content";
import IvoireInvitation from "@/components/invitations/ivoire/IvoireInvitation";
import * as ivoire from "@/components/invitations/ivoire/content";
import RoseOrInvitation from "@/components/invitations/rose-or/RoseOrInvitation";
import * as roseOr from "@/components/invitations/rose-or/content";
import AnniversaireInvitation from "@/components/invitations/anniversaire/AnniversaireInvitation";
import * as anniversaire from "@/components/invitations/anniversaire/content";
import type { RsvpPayload } from "@/components/invitations/velours/VeloursInvitation";
import { CheckCircle, XCircle, Users, Phone, Mail, User, Loader2, Music, MapPin, Clock, Camera, Navigation, Gift, Car, Hotel, Info } from "lucide-react";

const FadeInScroll = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
    className="w-full"
  >
    {children}
  </motion.div>
);

export default function InvitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    nombre_accompagnants: 0,
    statut_rsvp: "Confirmé",
    message: ""
  });

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      if (error || !data) setEvent(null);
      else setEvent(data);
      setLoading(false);
    };
    fetchEvent();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4AF37] w-12 h-12" />
      </div>
    );
  }

  if (!event) return notFound();

  const isStatic = event.format === "Carte" || event.format === "Statique";

  if (event.invitation_model_id === VELOURS_MODEL_ID) {
    const rawContent = event.invitation_content ?? seedFromEvent(event);
    const content = isStatic ? { ...rawContent, audioUrl: "" } : rawContent;
    return (
      <VeloursInvitation
        content={content}
        onRsvp={async (rsvp) => {
          const { error } = await supabase.from('guests').insert([{
            event_id: event.id,
            nom: rsvp.name,
            telephone: rsvp.phone || null,
            nombre_accompagnants: rsvp.attending ? Math.max(0, rsvp.guests - 1) : 0,
            statut_rsvp: rsvp.attending ? "Confirmé" : "Refusé",
          }]);
          if (error) throw error;
        }}
      />
    );
  }

  const saveRsvp = async (rsvp: RsvpPayload & { email?: string }) => {
    const row: Record<string, unknown> = {
      event_id: event.id,
      nom: rsvp.name,
      ...(rsvp.email ? { email: rsvp.email } : {}),
      nombre_accompagnants: rsvp.attending ? Math.max(0, rsvp.guests - 1) : 0,
      statut_rsvp: rsvp.attending ? "Confirmé" : "Refusé",
    };
    // Drink choices / guest note go in "message" when that column exists
    if (rsvp.message) row.message = rsvp.message;
    let { error } = await supabase.from('guests').insert([row]);
    if (error && row.message && error.message?.includes('message')) {
      delete row.message;
      ({ error } = await supabase.from('guests').insert([row]));
    }
    if (error) throw error;
  };

  if (event.invitation_model_id === sceau.SCEAU_MODEL_ID) {
    const rawContent = event.invitation_content ?? sceau.seedFromEvent(event);
    const content = isStatic ? { ...rawContent, audioUrl: "" } : rawContent;
    return <SceauInvitation content={content} onRsvp={saveRsvp} />;
  }

  if (event.invitation_model_id === ivoire.IVOIRE_MODEL_ID) {
    const rawContent = event.invitation_content ?? ivoire.seedFromEvent(event);
    const content = isStatic ? { ...rawContent, audioUrl: "" } : rawContent;
    return <IvoireInvitation content={content} onRsvp={saveRsvp} />;
  }

  if (event.invitation_model_id === anniversaire.ANNIVERSAIRE_MODEL_ID) {
    const rawContent = event.invitation_content ? anniversaire.withDefaults(event.invitation_content) : anniversaire.seedFromEvent(event);
    const content = isStatic ? { ...rawContent, audioUrl: "" } : rawContent;
    return <AnniversaireInvitation content={content} onRsvp={saveRsvp} />;
  }

  if (event.invitation_model_id === roseOr.ROSE_OR_MODEL_ID) {
    const rawContent = event.invitation_content ?? roseOr.seedFromEvent(event);
    const content = isStatic ? { ...rawContent, music: "" } : rawContent;
    return (
      <RoseOrInvitation
        content={content}
        onRsvp={(r) => saveRsvp({ name: r.name, email: r.email, phone: "", attending: r.attending, guests: 1, message: r.message })}
      />
    );
  }

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('guests').insert([{
        event_id: event.id,
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone,
        nombre_accompagnants: Number(formData.nombre_accompagnants),
        statut_rsvp: formData.statut_rsvp
      }]);
      if (error) throw error;
      setRsvpSuccess(true);
    } catch (err) {
      alert("Une erreur est survenue lors de la confirmation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "À définir") return "DATE À DÉFINIR";
    return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  };

  // Noms d'exemple basés sur le titre ou par défaut
  const names = event.invitation_title || event.name;

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#D4AF37] selection:text-black overflow-x-hidden">
      <div className="max-w-[480px] mx-auto bg-white shadow-2xl relative">
        
        {/* Page 1 - Accueil */}
        <section className="relative min-h-[90vh] bg-[#FDFBF7] flex flex-col items-center justify-center pt-10 pb-20 px-6 overflow-hidden">
          {/* Décoration florale (simulée via CSS pour l'exemple) */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-[#FFD1B3]/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-[#D4AF37]/20 to-transparent rounded-full blur-3xl" />
          
          <FadeInScroll>
            <div className="text-center mb-8">
              <h2 className="text-[#D4AF37] font-serif text-2xl">Evenium</h2>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mt-1">L'ÉLÉGANCE DE VOS ÉVÉNEMENTS</p>
            </div>
          </FadeInScroll>

          <FadeInScroll delay={0.2}>
            <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto mb-10">
              <Image src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop" alt="Couple" fill className="object-cover" />
            </div>
          </FadeInScroll>

          <FadeInScroll delay={0.4}>
            <div className="text-center space-y-4 relative z-10">
              <h1 className="font-serif text-5xl text-[#2C241B] leading-tight mb-6">
                {names.includes('&') ? (
                  <>
                    {names.split('&')[0].trim()} <br/>
                    <span className="text-[#D4AF37] text-4xl">&</span> <br/>
                    {names.split('&')[1].trim()}
                  </>
                ) : names}
              </h1>
              
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
                <span className="tracking-[0.2em] text-xs font-semibold text-[#2C241B]">SE MARIENT</span>
                <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
              </div>

              <div className="space-y-1">
                <p className="tracking-[0.1em] text-sm text-[#2C241B] font-medium">{formatDate(event.date)}</p>
                <p className="tracking-[0.1em] text-xs text-gray-500 uppercase">{event.location || 'DAKAR, SÉNÉGAL'}</p>
              </div>
            </div>
          </FadeInScroll>
        </section>

        {/* Page 2 - Notre Histoire */}
        <section className="bg-[#111111] text-[#FDFBF7] py-20 px-8 relative">
          <FadeInScroll>
            <h2 className="font-serif text-4xl text-center text-[#FDFBF7] mb-8">Notre histoire</h2>
            <p className="text-[#D4AF37] text-center font-serif italic mb-8">Deux âmes, un même chemin...</p>
            <div className="text-center text-sm leading-relaxed text-gray-300 space-y-6 max-w-sm mx-auto mb-12">
              <p>{event.invitation_message || "C'est avec une immense joie que nous vous invitons à partager l'un des plus beaux jours de notre vie."}</p>
              <p>Votre présence rendra cette journée encore plus spéciale.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 relative">
              <div className="aspect-[3/4] relative rounded-xl overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop" alt="Histoire 1" fill className="object-cover" />
              </div>
              <div className="aspect-[3/4] relative rounded-xl overflow-hidden mt-8">
                <Image src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=400&auto=format&fit=crop" alt="Histoire 2" fill className="object-cover" />
              </div>
            </div>
          </FadeInScroll>
        </section>

        {/* Page 3 - Programme */}
        <section className="bg-[#FDFBF7] py-20 px-8">
          <FadeInScroll>
            <h2 className="font-serif text-4xl text-center text-[#2C241B] mb-12">Notre Programme</h2>
            
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#D4AF37]/0 before:via-[#D4AF37]/50 before:to-[#D4AF37]/0">
              
              {[
                { time: "14h00", title: "Cérémonie civile", desc: "Mairie des Almadies", icon: <Users size={16}/> },
                { time: "16h00", title: "Cérémonie religieuse", desc: "Grande Mosquée de Dakar", icon: <MapPin size={16}/> },
                { time: "18h00", title: "Séance photos", desc: "Jardins d'Eden", icon: <Camera size={16}/> },
                { time: "21h00", title: "Dîner & soirée", desc: "Les Jardins d'Eden", icon: <Music size={16}/> },
              ].map((item, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#D4AF37] bg-white text-[#D4AF37] shadow shrink-0 z-10">
                    {item.icon}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0 md:group-odd:pr-6 md:group-even:pl-6">
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-[#D4AF37]/10">
                      <div className="text-[#D4AF37] font-bold text-sm mb-1">{item.time}</div>
                      <div className="text-[#2C241B] font-serif font-bold text-lg mb-1">{item.title}</div>
                      <div className="text-gray-500 text-xs">{item.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeInScroll>
        </section>

        {/* Page 4 - Les Lieux */}
        <section className="bg-[#111111] text-white py-20 px-6">
          <FadeInScroll>
            <h2 className="font-serif text-4xl text-center text-[#FDFBF7] mb-4">Les Lieux</h2>
            <p className="text-center text-sm text-gray-400 mb-12">Retrouvez ici toutes les informations pour nous rejoindre.</p>
            
            <div className="space-y-6">
              {[
                { title: "Cérémonie", place: "Mairie des Almadies", img: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600&auto=format&fit=crop" },
                { title: "Réception", place: "Les Jardins d'Eden", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600&auto=format&fit=crop" }
              ].map((lieu, i) => (
                <div key={i} className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/5">
                  <div className="h-40 relative">
                    <Image src={lieu.img} alt={lieu.title} fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl text-[#D4AF37] mb-1">{lieu.title}</h3>
                    <p className="text-sm text-gray-300 mb-4">{lieu.place}</p>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <Navigation size={14} /> Itinéraire
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeInScroll>
        </section>

        {/* Page 5 - RSVP */}
        <section className="bg-[#FDFBF7] py-20 px-8" id="rsvp">
          <FadeInScroll>
            <h2 className="font-serif text-4xl text-center text-[#2C241B] mb-4">Confirmez votre présence</h2>
            <p className="text-center text-sm text-gray-500 mb-10 max-w-xs mx-auto">Merci de nous faire part de votre présence avant le 30 Avril 2025.</p>
            
            {rsvpSuccess ? (
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#D4AF37]/20 text-center">
                <CheckCircle className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="font-serif text-2xl text-[#2C241B] mb-2">Merci !</h3>
                <p className="text-gray-500 text-sm">Votre réponse a bien été enregistrée.</p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-4">
                <input required type="text" placeholder="Nom et prénom"
                  value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})}
                  className="w-full px-5 py-4 bg-white border border-[#D4AF37]/20 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
                <input required type="email" placeholder="Email"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-5 py-4 bg-white border border-[#D4AF37]/20 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
                
                <select 
                  value={formData.statut_rsvp} onChange={e => setFormData({...formData, statut_rsvp: e.target.value})}
                  className="w-full px-5 py-4 bg-white border border-[#D4AF37]/20 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] text-gray-700"
                >
                  <option value="Confirmé">Oui, je serai présent(e)</option>
                  <option value="Refusé">Non, je ne pourrai pas venir</option>
                </select>

                {formData.statut_rsvp === 'Confirmé' && (
                  <select 
                    value={formData.nombre_accompagnants} onChange={e => setFormData({...formData, nombre_accompagnants: Number(e.target.value)})}
                    className="w-full px-5 py-4 bg-white border border-[#D4AF37]/20 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] text-gray-700"
                  >
                    <option value={0}>Je viens seul(e)</option>
                    <option value={1}>+1 Adulte</option>
                    <option value={2}>+2 Adultes</option>
                  </select>
                )}

                <textarea placeholder="Un message pour les mariés (facultatif)"
                  value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full px-5 py-4 bg-white border border-[#D4AF37]/20 rounded-xl text-sm h-32 resize-none focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
                
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#B8860B] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#B8860B]/20 flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Envoyer ma réponse"}
                </button>
              </form>
            )}
          </FadeInScroll>
        </section>

        {/* Page 6 - Dress Code */}
        <section className="bg-[#111111] py-20 px-8 text-center relative overflow-hidden">
          <FadeInScroll>
            <h2 className="font-serif text-4xl text-[#FDFBF7] mb-6">Dress code</h2>
            <p className="text-[#D4AF37] text-sm mb-8 max-w-xs mx-auto">Nous vous invitons à porter une tenue élégante dans les tons beige, pêche et doré.</p>
            
            <div className="flex justify-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-full bg-[#F5D0C5] shadow-inner" />
              <div className="w-10 h-10 rounded-full bg-[#FDFBF7] shadow-inner" />
              <div className="w-10 h-10 rounded-full bg-[#E6C2A5] shadow-inner" />
              <div className="w-10 h-10 rounded-full bg-[#D4AF37] shadow-inner" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="aspect-[3/4] relative rounded-xl overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop" alt="Dress 1" fill className="object-cover" />
              </div>
              <div className="aspect-[3/4] relative rounded-xl overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop" alt="Dress 2" fill className="object-cover" />
              </div>
            </div>
            
            <div className="inline-block border border-[#D4AF37]/50 rounded-xl px-6 py-3">
              <p className="text-[#D4AF37] text-xs font-serif uppercase tracking-widest">Tenue chic et élégante</p>
            </div>
          </FadeInScroll>
        </section>

        {/* Page 7 - Infos Pratiques */}
        <section className="bg-[#1A1A1A] py-20 px-8 text-white">
          <FadeInScroll>
            <h2 className="font-serif text-3xl text-center text-[#FDFBF7] mb-10">Informations pratiques</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Hotel size={24}/>, title: "Hébergement", desc: "Hôtels à proximité" },
                { icon: <Car size={24}/>, title: "Transport", desc: "Navettes disponibles" },
                { icon: <MapPin size={24}/>, title: "Parking", desc: "Disponible sur place" },
                { icon: <Info size={24}/>, title: "Contact", desc: "Wedding planner" },
              ].map((info, i) => (
                <div key={i} className="bg-[#111111] border border-white/5 p-6 rounded-2xl text-center flex flex-col items-center">
                  <div className="text-[#D4AF37] mb-3">{info.icon}</div>
                  <h4 className="font-bold text-sm mb-1">{info.title}</h4>
                  <p className="text-xs text-gray-400">{info.desc}</p>
                </div>
              ))}
            </div>
          </FadeInScroll>
        </section>

        {/* Page 8 - Liste de mariage */}
        <section className="bg-[#FDFBF7] py-20 px-8 text-center">
          <FadeInScroll>
            <h2 className="font-serif text-3xl text-[#2C241B] mb-6">Liste de mariage</h2>
            <div className="w-12 h-12 bg-[#F9F5EC] rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift size={20} className="text-[#D4AF37]" />
            </div>
            <p className="text-sm text-gray-600 max-w-sm mx-auto mb-8 leading-relaxed">
              Votre présence est notre plus beau cadeau. Si vous souhaitez contribuer à notre projet de vie, vous pouvez participer à notre cagnotte.
            </p>
            <button className="bg-[#E6C2A5] hover:bg-[#D4AF37] text-black font-bold py-4 px-8 rounded-full transition-colors flex items-center justify-center gap-2 mx-auto">
              Voir la cagnotte
            </button>
            <p className="text-xs text-[#D4AF37] font-serif italic mt-6">Merci du fond du cœur !</p>
          </FadeInScroll>
        </section>

        {/* Page 9 - Galerie */}
        <section className="bg-[#111111] py-20 px-6">
          <FadeInScroll>
            <h2 className="font-serif text-4xl text-center text-[#FDFBF7] mb-10">Notre galerie</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 aspect-[16/9] relative rounded-xl overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop" alt="Gal 1" fill className="object-cover" />
              </div>
              <div className="aspect-square relative rounded-xl overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=400&auto=format&fit=crop" alt="Gal 2" fill className="object-cover" />
              </div>
              <div className="aspect-square relative rounded-xl overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop" alt="Gal 3" fill className="object-cover" />
              </div>
            </div>
          </FadeInScroll>
        </section>

        {/* Page 10 - Mot de fin */}
        <section className="bg-[#FDFBF7] py-32 px-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/10 to-transparent pointer-events-none" />
          <FadeInScroll>
            <h2 className="font-serif text-4xl text-[#2C241B] mb-10">On compte sur vous !</h2>
            <p className="font-serif italic text-lg text-gray-700 max-w-sm mx-auto mb-10 leading-relaxed">
              "Votre présence, dans vos plus beaux atours, rendra cette journée encore plus spéciale."
            </p>
            <p className="font-serif text-3xl text-[#D4AF37] mb-8">{names}</p>
            
            {/* Anneaux */}
            <div className="flex justify-center -space-x-4">
              <div className="w-12 h-12 rounded-full border-[3px] border-[#D4AF37] opacity-80" />
              <div className="w-12 h-12 rounded-full border-[3px] border-[#D4AF37] opacity-80" />
            </div>
          </FadeInScroll>
        </section>

      </div>
    </div>
  );
}
