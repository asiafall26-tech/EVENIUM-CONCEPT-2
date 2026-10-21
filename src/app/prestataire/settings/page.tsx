"use client";

import { Save, Bell, CreditCard, Shield, Map, Lock, Upload, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { DeleteAccountSection } from "@/components/ui/DeleteAccountSection";

export default function PrestataireSettingsPage() {
  const [activeTab, setActiveTab] = useState<"preferences" | "facturation" | "securite">("preferences");
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  // States
  const [coverageArea, setCoverageArea] = useState("Dakar et environs");
  const [maxCapacity, setMaxCapacity] = useState("500");
  const [notifs, setNotifs] = useState({ devis: true, messages: true, paiements: true });
  const [bankInfo, setBankInfo] = useState({ bankName: "", iban: "", swift: "", accountName: "" });
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile(data);
    }

    const meta = user.user_metadata || {};
    if (meta.coverageArea) setCoverageArea(meta.coverageArea);
    if (meta.maxCapacity) setMaxCapacity(meta.maxCapacity);
    if (meta.notifs) setNotifs(meta.notifs);
    if (meta.bankInfo) setBankInfo(meta.bankInfo);
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          coverageArea,
          maxCapacity,
          notifs
        }
      });
      if (error) throw error;
      alert("Préférences de service enregistrées avec succès !");
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement : " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBank = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          bankInfo
        }
      });
      if (error) throw error;
      alert("Informations bancaires enregistrées avec succès !");
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement : " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (password !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({ password: password });
    setIsSaving(false);

    if (error) {
      setPasswordError(error.message);
    } else {
      alert("Mot de passe mis à jour avec succès !");
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Paramètres Avancés</h1>
          <p className="text-gray-500 text-sm">Gérez vos préférences de service, votre facturation et votre sécurité.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Latérale */}
        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab("preferences")}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all text-left font-medium ${activeTab === 'preferences' ? 'bg-black text-white shadow-xl translate-x-2' : 'bg-transparent hover:bg-white text-gray-600 hover:shadow-sm hover:translate-x-1'}`}
          >
            <Map size={18} className={activeTab === 'preferences' ? 'text-[#b8924a]' : ''} />
            Service & Notifications
          </button>
          
          <button 
            onClick={() => setActiveTab("facturation")}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all text-left font-medium ${activeTab === 'facturation' ? 'bg-black text-white shadow-xl translate-x-2' : 'bg-transparent hover:bg-white text-gray-600 hover:shadow-sm hover:translate-x-1'}`}
          >
            <CreditCard size={18} className={activeTab === 'facturation' ? 'text-[#b8924a]' : ''} />
            Coordonnées Bancaires
          </button>
          
          <button 
            onClick={() => setActiveTab("securite")}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all text-left font-medium ${activeTab === 'securite' ? 'bg-black text-white shadow-xl translate-x-2' : 'bg-transparent hover:bg-white text-gray-600 hover:shadow-sm hover:translate-x-1'}`}
          >
            <Lock size={18} className={activeTab === 'securite' ? 'text-[#b8924a]' : ''} />
            Sécurité & Mot de passe
          </button>
        </div>

        {/* Contenu Principal */}
        <div className="md:col-span-3">
          
          {/* TAB 1 : PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
                  <Map className="text-[#b8924a]" size={20} /> Zone et Capacité
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rayon d'action (Villes couvertes)</label>
                    <input 
                      type="text" 
                      value={coverageArea}
                      onChange={(e) => setCoverageArea(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#b8924a] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacité maximale (invités/personnes)</label>
                    <input 
                      type="number" 
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#b8924a] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
                  <Bell className="text-[#b8924a]" size={20} /> Alertes & Notifications
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-900">Nouvelles demandes de devis</h4>
                      <p className="text-sm text-gray-500">M'alerter par email lorsqu'un client me sollicite.</p>
                    </div>
                    <div className={`w-14 h-8 rounded-full flex items-center transition-colors p-1 ${notifs.devis ? 'bg-black' : 'bg-gray-200'}`} onClick={() => setNotifs({...notifs, devis: !notifs.devis})}>
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform ${notifs.devis ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </label>
                  <label className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-900">Nouveaux messages</h4>
                      <p className="text-sm text-gray-500">M'alerter par email en cas de nouveau message chat.</p>
                    </div>
                    <div className={`w-14 h-8 rounded-full flex items-center transition-colors p-1 ${notifs.messages ? 'bg-black' : 'bg-gray-200'}`} onClick={() => setNotifs({...notifs, messages: !notifs.messages})}>
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform ${notifs.messages ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </label>
                  <label className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-900">Paiements validés</h4>
                      <p className="text-sm text-gray-500">Confirmation lorsqu'un paiement Evenium est validé.</p>
                    </div>
                    <div className={`w-14 h-8 rounded-full flex items-center transition-colors p-1 ${notifs.paiements ? 'bg-black' : 'bg-gray-200'}`} onClick={() => setNotifs({...notifs, paiements: !notifs.paiements})}>
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform ${notifs.paiements ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSavePreferences} disabled={isSaving} className="flex items-center gap-2 bg-[#b8924a] text-white px-4 sm:px-6 lg:px-8 py-4 rounded-full font-bold shadow-lg hover:-translate-y-1 hover:bg-[#8f6f33] hover:shadow-xl transition-all disabled:opacity-50">
                  <Save size={20} /> {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2 : FACTURATION */}
          {activeTab === "facturation" && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-gradient-to-br from-gray-900 to-black p-4 sm:p-6 lg:p-8 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden text-white">
                <div className="absolute right-0 top-0 opacity-10">
                  <CreditCard size={200} />
                </div>
                <h2 className="text-xl font-serif font-bold mb-2 relative z-10">Coordonnées de virement</h2>
                <p className="text-gray-400 text-sm mb-8 relative z-10 max-w-md">
                  Ces informations sont utilisées par Evenium pour vous reverser les paiements effectués par vos clients.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nom de la Banque</label>
                    <input 
                      type="text" 
                      value={bankInfo.bankName}
                      onChange={e => setBankInfo({...bankInfo, bankName: e.target.value})}
                      placeholder="Ex: Ecobank"
                      className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#b8924a] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Titulaire du compte</label>
                    <input 
                      type="text" 
                      value={bankInfo.accountName}
                      onChange={e => setBankInfo({...bankInfo, accountName: e.target.value})}
                      className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#b8924a] transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">IBAN ou Numéro de compte complet</label>
                    <input 
                      type="text" 
                      value={bankInfo.iban}
                      onChange={e => setBankInfo({...bankInfo, iban: e.target.value})}
                      className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#b8924a] transition-all"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end relative z-10">
                  <button onClick={handleSaveBank} disabled={isSaving} className="flex items-center gap-2 bg-[#b8924a] text-white px-4 sm:px-6 lg:px-8 py-4 rounded-full font-bold shadow-lg hover:bg-[#8f6f33] transition-all disabled:opacity-50">
                    <Upload size={20} /> {isSaving ? "Enregistrement..." : "Mettre à jour le RIB"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3 : SECURITE */}
          {activeTab === "securite" && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-0"></div>
                <h2 className="text-xl font-serif font-bold mb-2 flex items-center gap-2 relative z-10">
                  <Lock className="text-red-500" size={20} /> Modifier le mot de passe
                </h2>
                <p className="text-gray-500 text-sm mb-6 relative z-10">Si votre mot de passe a été généré par un administrateur, nous vous recommandons fortement de le changer ici.</p>

                <form onSubmit={handleUpdatePassword} className="space-y-6 relative z-10 max-w-md">
                  {passwordError && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                      {passwordError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmez le mot de passe</label>
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                    />
                  </div>
                  
                  <button type="submit" disabled={isSaving} className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 sm:px-6 lg:px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-gray-900 transition-all disabled:opacity-50">
                    <Shield size={20} /> {isSaving ? "Modification..." : "Modifier mon mot de passe"}
                  </button>
                </form>
              </div>

              {/* Zone de Danger : Suppression du compte prestataire */}
              <DeleteAccountSection role="prestataire" />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
