'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, CreditCard, Smartphone, User, Eye, EyeOff, Sparkles, Check, ArrowRight, ArrowLeft, Phone, Building } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { ActivityFields } from '@/components/prestataire/ActivityFields';
import { EMPTY_ACTIVITY, missingActivity, saveActivity, type ProviderActivity } from '@/lib/providerProfile';
import { Fleuron, LuxFrame } from '@/components/landing/LuxOrnaments';

const inputCls =
  "w-full bg-[#fffdf9] border border-[#e4d8c4] text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-[#b8924a]/25 focus:border-[#b8924a] outline-none transition-all text-sm font-medium";

export default function PrestataireExterneInscription() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    managerName: '',
    phone: '',
    email: '',
    password: '',
    paymentMethod: 'wave' as 'wave' | 'om' | 'card'
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrorMsg("Veuillez remplir le nom, l'email et un mot de passe d'au moins 6 caractères.");
    }
  };

  const handleActivityStep = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = missingActivity(activity);
    if (missing.length) {
      setShowActivityErrors(true);
      setErrorMsg(`Merci de renseigner : ${missing.join(", ")}.`);
      return;
    }
    setErrorMsg(null);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);
    
    try {
      // 1. Simulation du paiement de 20 000 FCFA
      await new Promise(resolve => setTimeout(resolve, 1400));
      
      // 2. Création du compte prestataire
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            manager_name: formData.managerName,
            phone: formData.phone,
            role: 'prestataire',
            badge: 'externe',
            activity
          }
        }
      });

      if (authError) throw authError;

      // 2.5. Sauvegarde immédiate du profil avec le nom, coordonnées et activité
      if (authData?.user) {
        await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            role: 'prestataire',
            is_evenium_certified: false
          }, { onConflict: 'id' });
        await saveActivity(supabase, authData.user.id, activity);
      }

      // 3. Redirection vers le dashboard prestataire
      router.push('/prestataire');
      
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(`Erreur : ${err.message || "Impossible de créer le compte. L'adresse e-mail est peut-être déjà utilisée."}`);
    }
  };

  return (
    <main
      className="theme-luxe bg-silk relative overflow-hidden min-h-dvh flex flex-col items-center justify-center py-10 px-4 font-sans text-gray-900"
      style={{
        paddingTop: "max(2rem, calc(env(safe-area-inset-top, 0px) + 2rem))",
        paddingBottom: "max(2rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))",
      }}
    >
      {/* Décors en arrière-plan */}
      <Image src="/hero/chandelier.png" alt="" aria-hidden width={268} height={124} className="absolute top-0 right-0 w-[45%] max-w-[360px] h-auto pointer-events-none opacity-85" />
      <Image src="/hero/flowers.png" alt="" aria-hidden width={195} height={330} className="absolute bottom-0 right-0 w-[24%] max-w-[200px] h-auto pointer-events-none opacity-85" />

      {/* Logo */}
      <Link href="/" className="relative mb-6 group">
        <Image src="/logo-horizontal-dark.png" alt="Evenium" width={170} height={44} priority className="w-[140px] sm:w-[170px] h-auto object-contain transition-transform group-hover:scale-105" />
      </Link>

      <div className="w-full max-w-4xl relative">
        {/* Carte principale Haute Couture */}
        <div className="bg-[#fffdfa] rounded-3xl border border-[#e4d8c4] shadow-2xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Panneau gauche : Présentation du Réseau & Badge */}
          <div className="w-full md:w-[38%] bg-gradient-to-b from-[#1e150f] via-[#150d07] to-[#0d0703] text-[#fbf5eb] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <LuxFrame className="inset-2.5 opacity-40" />
            <div aria-hidden className="absolute -top-20 -left-20 w-56 h-56 rounded-full bg-[#d4af37]/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#f5ebd7] text-[10px] font-extrabold uppercase tracking-widest">
                <Sparkles size={12} className="text-[#d4af37]" />
                <span>Réseau Partenaire Pro</span>
              </div>

              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                  Adhésion <span className="italic text-[#d4af37]">Prestataire</span>
                </h2>
                <p className="text-xs text-[#d6c4b2] mt-2 leading-relaxed">
                  Rejoignez l&apos;écosystème d&apos;excellence Evenium. Créez votre vitrine, gérez vos devis et gagnez la confiance de milliers d&apos;organisateurs d&apos;événements.
                </p>
              </div>

              {/* Encadré droit d'adhésion unique */}
              <div className="bg-white/5 border border-[#d4af37]/35 rounded-2xl p-4 backdrop-blur-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#d6c4b2] block">Adhésion & Activation officielle</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#f5e6b8]">20 000 FCFA</span>
                  <span className="text-[11px] text-[#b39b82]">/ frais unique</span>
                </div>
                <p className="text-[10.5px] text-[#b39b82] mt-1.5 leading-normal">
                  Activation immédiate de votre compte, vitrine personnalisée et badge « EXTERNE » vérifié.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-[#ebdccb] pt-1">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] shrink-0">
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <span>Vitrine référencée & demandes de devis directes</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] shrink-0">
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <span>Ciblage géographique précis (Pays, Région, Quartiers)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] shrink-0">
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <span>Zéro commission sur vos prestations négociées</span>
                </li>
              </ul>
            </div>

            {/* Pied de panneau gauche */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/10 text-[11px] text-[#b39b82]">
              Déjà inscrit ?{" "}
              <Link href="/login?role=prestataire" className="text-[#f5e6b8] font-bold hover:underline">
                Se connecter
              </Link>
            </div>
          </div>

          {/* Panneau droit : Formulaire d'inscription par étapes */}
          <div className="w-full md:w-[62%] p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
            <div>
              {/* Fil d'Ariane / Indicateur d'étapes */}
              <div className="flex items-center justify-between border-b border-[#e4d8c4] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step >= 1 ? 'bg-[#b8924a] text-white shadow-xs' : 'bg-gray-100 text-gray-400'}`}>
                    1
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${step === 1 ? 'text-[#8f6f33]' : 'text-gray-400'}`}>
                    Profil
                  </span>
                </div>
                <div className="w-6 h-px bg-[#e4d8c4]" />
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step >= 2 ? 'bg-[#b8924a] text-white shadow-xs' : 'bg-gray-100 text-gray-400'}`}>
                    2
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${step === 2 ? 'text-[#8f6f33]' : 'text-gray-400'}`}>
                    Activité & Zones
                  </span>
                </div>
                <div className="w-6 h-px bg-[#e4d8c4]" />
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step >= 3 ? 'bg-[#b8924a] text-white shadow-xs' : 'bg-gray-100 text-gray-400'}`}>
                    3
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${step === 3 ? 'text-[#8f6f33]' : 'text-gray-400'}`}>
                    Adhésion
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-5 p-3.5 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-200">
                  {errorMsg}
                </div>
              )}

              {/* ÉTAPE 1 : IDENTITÉ & COORDONNÉES */}
              {step === 1 && (
                <form onSubmit={handleNextStep} className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                      1. Votre Entreprise & Profil
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Ces informations permettront aux organisateurs de vous identifier et de vous contacter.
                    </p>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 block">
                        Nom de l&apos;entreprise ou Enseigne <span className="text-[#9e1b23]">*</span>
                      </label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={inputCls}
                          placeholder="Ex: Traiteur Royale Étoile"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 block">
                        Nom & Prénom du responsable
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={formData.managerName}
                          onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                          className={inputCls}
                          placeholder="Ex: Aïssatou Diallo"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 block">
                          Adresse e-mail pro <span className="text-[#9e1b23]">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={inputCls}
                            placeholder="contact@entreprise.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 block">
                          Téléphone WhatsApp
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={inputCls}
                            placeholder="+221 77 000 00 00"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 block">
                        Mot de passe sécurisé <span className="text-[#9e1b23]">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className={`${inputCls} pr-12`}
                          placeholder="Au moins 6 caractères"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="btn-lux w-full py-3.5 text-xs sm:text-[13px] font-bold shadow-md hover:brightness-105 transition-all"
                    >
                      <span>Continuer vers mon activité</span>
                      <ArrowRight size={16} className="text-[#f0d999]" />
                    </button>
                  </div>
                </form>
              )}

              {/* ÉTAPE 2 : ACTIVITÉ & LOCALISATION HIÉRARCHIQUE */}
              {step === 2 && (
                <form onSubmit={handleActivityStep} className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                        2. Votre Activité & Zones d&apos;Intervention
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Ciblez avec précision vos prestations et vos zones (Pays, Région, Quartiers).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      <ArrowLeft size={14} /> Retour
                    </button>
                  </div>

                  <ActivityFields value={activity} onChange={setActivity} showErrors={showActivityErrors} />

                  <div className="flex items-center gap-3 pt-4 border-t border-[#e4d8c4]">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-3 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Précédent
                    </button>
                    <button
                      type="submit"
                      className="btn-lux flex-1 py-3.5 text-xs sm:text-[13px] font-bold shadow-md hover:brightness-105 transition-all"
                    >
                      <span>Continuer vers l&apos;adhésion</span>
                      <ArrowRight size={16} className="text-[#f0d999]" />
                    </button>
                  </div>
                </form>
              )}

              {/* ÉTAPE 3 : ADHÉSION & ACTIVATION */}
              {step === 3 && (
                <form onSubmit={handlePayment} className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                        3. Validation de votre Adhésion
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Règlement du droit d&apos;adhésion unique de 20 000 FCFA pour activer votre accès.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      <ArrowLeft size={14} /> Retour
                    </button>
                  </div>

                  {/* Récapitulatif profil */}
                  <div className="bg-[#fbf7f0] border border-[#e4d8c4] rounded-2xl p-4 text-xs space-y-2">
                    <p className="font-bold text-gray-900 flex items-center justify-between">
                      <span>{formData.name}</span>
                      <span className="text-[#8f6f33]">Badge Partenaire Externe</span>
                    </p>
                    <p className="text-gray-600">
                      <strong>Email :</strong> {formData.email} • <strong>Zone :</strong> {activity.country} {activity.region ? `• ${activity.region}` : ''}
                    </p>
                    {activity.services.length > 0 && (
                      <p className="text-gray-600 truncate">
                        <strong>Prestations :</strong> {activity.services.join(", ")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 block">
                      Mode de règlement sécurisé
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: 'wave' })}
                        className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 font-bold text-xs transition-all ${
                          formData.paymentMethod === 'wave'
                            ? 'border-[#1E90FF] bg-[#1E90FF]/10 text-[#1E90FF] shadow-xs'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <Smartphone size={20} className="text-[#1E90FF]" />
                        <span>Wave</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: 'om' })}
                        className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 font-bold text-xs transition-all ${
                          formData.paymentMethod === 'om'
                            ? 'border-[#FF6600] bg-[#FF6600]/10 text-[#FF6600] shadow-xs'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <Smartphone size={20} className="text-[#FF6600]" />
                        <span>Orange Money</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                        className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 font-bold text-xs transition-all ${
                          formData.paymentMethod === 'card'
                            ? 'border-[#b8924a] bg-[#b8924a]/10 text-[#8f6f33] shadow-xs'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <CreditCard size={20} className="text-[#b8924a]" />
                        <span>Carte bancaire</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="btn-lux w-full py-4 text-xs sm:text-[13px] font-bold shadow-xl hover:brightness-105 transition-all flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-[#f5eee1] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck size={18} className="text-[#f0d999]" />
                          <span>Payer 20 000 FCFA & Activer mon compte</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
