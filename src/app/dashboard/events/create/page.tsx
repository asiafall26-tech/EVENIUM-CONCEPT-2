"use client";

import { Calendar, MapPin, Users, Wallet, Check, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    date: "",
    time: "",
    location: "",
    guests: "",
    budget: "",
    plan: "gold"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.date) return;
    
    setIsSubmitting(true);
    
    // Simulate payment & API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccessModalOpen(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push("/dashboard/events/evt-001");
      }, 2000);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 relative">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-black mb-2">Créer un nouvel événement</h1>
        <p className="text-gray-500">Remplissez les détails ci-dessous pour commencer à organiser votre jour J.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* Informations générales */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-black border-b border-gray-100 pb-2">Informations générales</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'événement *</label>
                <input 
                  type="text" required
                  placeholder="Ex: Mariage de Sophie & Marc" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'événement *</label>
                <select 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all bg-white"
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="Mariage">Mariage</option>
                  <option value="Anniversaire">Anniversaire</option>
                  <option value="Baptême">Baptême</option>
                  <option value="Corporate">Événement d'entreprise</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
          </section>

          {/* Date & Lieu */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-black border-b border-gray-100 pb-2">Date & Lieu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="date" required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none" 
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                <input 
                  type="time" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none" 
                  value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" placeholder="Ex: Saly, Sénégal" 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none" 
                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Budget & Invités */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-black border-b border-gray-100 pb-2">Logistique</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'invités estimé</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="number" placeholder="Ex: 150" 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none" 
                    value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget global (FCFA)</label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="number" placeholder="Ex: 2000000" 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none" 
                    value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Formule */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-black border-b border-gray-100 pb-2">Choix de la formule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="relative flex cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm focus:outline-none hover:border-[#D4AF37] transition-all has-[:checked]:border-[#D4AF37] has-[:checked]:bg-[#F9F5EC] has-[:checked]:ring-1 has-[:checked]:ring-[#D4AF37]">
                <input 
                  type="radio" name="plan" value="premium" className="sr-only" 
                  checked={formData.plan === 'premium'} onChange={() => setFormData({...formData, plan: 'premium'})}
                />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">Formule Premium</span>
                    <span className="mt-1 flex items-center text-sm text-gray-500">Invitations uniquement</span>
                    <span className="mt-4 text-sm font-medium text-gray-900">Dès 7 500 FCFA</span>
                  </span>
                </span>
                <Check className={`h-5 w-5 text-[#D4AF37] ${formData.plan === 'premium' ? 'opacity-100' : 'opacity-0'}`} />
              </label>

              <label className="relative flex cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm focus:outline-none hover:border-[#D4AF37] transition-all has-[:checked]:border-[#D4AF37] has-[:checked]:bg-[#F9F5EC] has-[:checked]:ring-1 has-[:checked]:ring-[#D4AF37]">
                <input 
                  type="radio" name="plan" value="gold" className="sr-only" 
                  checked={formData.plan === 'gold'} onChange={() => setFormData({...formData, plan: 'gold'})}
                />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">Formule Gold</span>
                    <span className="mt-1 flex items-center text-sm text-gray-500">Organisation de A à Z</span>
                    <span className="mt-4 text-sm font-medium text-gray-900">Dès 15 000 FCFA</span>
                  </span>
                </span>
                <Check className={`h-5 w-5 text-[#D4AF37] ${formData.plan === 'gold' ? 'opacity-100' : 'opacity-0'}`} />
              </label>
            </div>
          </section>
        </div>

        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <div className="flex items-start gap-3 p-4 mb-6 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="mt-0.5 text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-800 mb-1">Attention, action définitive</h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                Pour éviter toute fraude, les informations de votre événement et la formule choisie ne pourront <strong>plus être modifiées</strong> une fois le paiement validé. En cas d'erreur, vous devrez contacter l'administration.
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-black">
              Annuler
            </Link>
            <button disabled={isSubmitting} type="submit" className="bg-[#B8860B] hover:bg-[#996B00] disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-colors flex items-center gap-2">
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Traitement...</> : "Payer & Créer l'événement"}
            </button>
          </div>
        </div>
      </form>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-600 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Félicitations !</h3>
            <p className="text-gray-500 mb-6">Votre événement <strong>{formData.name}</strong> a été créé avec succès.</p>
            <div className="flex items-center justify-center gap-2 text-sm text-[#B8860B] font-semibold">
              <Loader2 size={16} className="animate-spin" /> Redirection vers votre tableau de bord...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
