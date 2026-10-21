'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, CreditCard, Smartphone, User, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { ActivityFields } from '@/components/prestataire/ActivityFields';
import { EMPTY_ACTIVITY, missingActivity, saveActivity, type ProviderActivity } from '@/lib/providerProfile';

export default function PrestataireExterneInscription() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    paymentMethod: 'wave'
  });
  const [activity, setActivity] = useState<ProviderActivity>(EMPTY_ACTIVITY);
  const [showActivityErrors, setShowActivityErrors] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.password.length >= 6) {
      setErrorMsg(null);
      setStep(2);
    } else {
      setErrorMsg("Veuillez remplir tous les champs (le mot de passe doit faire au moins 6 caractères).");
    }
  };

  const handleActivityStep = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = missingActivity(activity);
    if (missing.length) {
      setShowActivityErrors(true);
      setErrorMsg(`Merci de renseigner ${missing.join(", ")}.`);
      return;
    }
    setErrorMsg(null);
    setStep(3);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);
    
    try {
      // 1. Simulation du paiement de 20 000 FCFA
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 2. Création du compte prestataire
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: 'prestataire',
            badge: 'externe', // Le prestataire qui s'inscrit lui-même a le badge "externe"
            // Conservée aussi dans le compte au cas où le profil ne peut pas encore être mis à jour
            activity
          }
        }
      });

      if (authError) throw authError;

      // 2.5. Mettre à jour le statut is_evenium_certified à false pour cet utilisateur externe
      if (authData?.user) {
        await supabase
          .from('profiles')
          .update({ is_evenium_certified: false })
          .eq('id', authData.user.id);
        await saveActivity(supabase, authData.user.id, activity);
      }

      // 3. Redirection vers le dashboard prestataire
      router.push('/prestataire');
      
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(`Erreur : ${err.message || "Impossible de créer le compte. L'email est peut-être déjà utilisé."}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Info */}
        <div className="w-full md:w-1/3 bg-gradient-to-br from-gray-900 to-black text-white p-8 flex flex-col justify-between">
          <div>
            <Link href="/" className="font-serif text-2xl font-bold text-[#b8924a] mb-8 block">
              Evenium
            </Link>
            <h2 className="text-xl font-bold mb-4">Adhésion Prestataire Externe</h2>
            <p className="text-gray-400 text-sm mb-6">
              Rejoignez la plateforme et créez votre vitrine pour attirer plus de clients.
            </p>
            
            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <div className="text-sm text-gray-300 mb-1">Droit d'adhésion unique</div>
              <div className="text-2xl font-bold text-[#b8924a]">20 000 FCFA</div>
            </div>
            
            <ul className="space-y-3 text-sm text-gray-300 mt-8">
              <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#b8924a]"/> Vitrine personnalisée</li>
              <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#b8924a]"/> Gestion des devis</li>
              <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#b8924a]"/> Visibilité accrue</li>
            </ul>
          </div>
        </div>

        {/* Formulaire */}
        <div className="w-full md:w-2/3 p-8 md:p-12">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {errorMsg}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">1. Créez votre profil</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Nom de l'entreprise ou Prestataire</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text" required
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#b8924a]/50 outline-none"
                      placeholder="Ex: Traiteur Étoile"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Adresse e-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="email" required
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#b8924a]/50 outline-none"
                      placeholder="contact@entreprise.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type={showPassword ? "text" : "password"} required minLength={6}
                      value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-12 py-3 focus:bg-white focus:ring-2 focus:ring-[#b8924a]/50 outline-none"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-colors mt-8">
                Continuer
              </button>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleActivityStep} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-2">
                <button type="button" onClick={() => setStep(1)} className="text-gray-400 hover:text-black transition-colors">
                  Retour
                </button>
                <h3 className="text-2xl font-bold text-gray-900">2. Votre activité</h3>
              </div>
              <p className="text-sm text-gray-500 -mt-2">Les organisateurs vous trouveront grâce à ces informations. Vous pourrez les modifier dans votre profil.</p>
              <ActivityFields value={activity} onChange={setActivity} showErrors={showActivityErrors} />
              <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-colors mt-8">
                Continuer vers le paiement
              </button>
            </form>
          ) : (
            <form onSubmit={handlePayment} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-6">
                <button type="button" onClick={() => setStep(2)} className="text-gray-400 hover:text-black transition-colors">
                  Retour
                </button>
                <h3 className="text-2xl font-bold text-gray-900">3. Paiement (20 000 FCFA)</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, paymentMethod: 'wave'})}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${
                    formData.paymentMethod === 'wave' ? 'border-[#1E90FF] bg-[#1E90FF]/5 text-[#1E90FF]' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <Smartphone size={20} /> Wave
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, paymentMethod: 'om'})}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${
                    formData.paymentMethod === 'om' ? 'border-[#FF6600] bg-[#FF6600]/5 text-[#FF6600]' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <Smartphone size={20} /> Orange Money
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full py-4 bg-[#b8924a] text-white rounded-xl font-bold hover:bg-[#8f6f33] transition-colors mt-8 flex items-center justify-center disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Payer 20 000 FCFA et s'inscrire"
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
