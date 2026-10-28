"use client";

import { Save, Bell, CreditCard, Shield, Map, Lock, Upload, CheckCircle2, User, Phone, Mail, Sparkles, ExternalLink, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { DeleteAccountSection } from "@/components/ui/DeleteAccountSection";
import { NotificationSoundSettings } from "@/components/settings/NotificationSoundSettings";

export default function PrestataireSettingsPage() {
  const [activeTab, setActiveTab] = useState<"preferences" | "facturation" | "securite">("preferences");
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
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
    
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (data) {
      setProfile({ ...data, email: user.email });
    } else {
      setProfile({ id: user.id, email: user.email, full_name: user.user_metadata?.full_name || "Prestataire" });
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
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
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
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-300">
      {/* En-tête de la page */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-1">
          Paramètres du compte prestataire
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm">
          Gérez vos préférences de service, vos coordonnées bancaires et la sécurité de votre compte.
        </p>
      </div>

      {/* Carte Résumé Prestataire */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] flex items-center justify-center font-serif text-2xl font-bold overflow-hidden shadow-md shrink-0">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (profile?.full_name?.[0] || "P").toUpperCase()
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-950 truncate">
                {profile?.full_name || "Prestataire Evenium"}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#faf6ee] text-[#8f6f33] border border-[#b8924a]/30">
                <Sparkles size={11} /> {profile?.category || "Prestataire de services"}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
              {profile?.email || ""}
              {profile?.phone ? ` • 📞 ${profile.phone}` : ""}
            </p>
          </div>
        </div>

        <Link
          href="/prestataire/profil"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs shrink-0 self-end sm:self-center"
        >
          <span>Modifier ma vitrine complète</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Navigation par Onglets */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "preferences"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <Map size={16} />
          <span>Services & Alertes</span>
        </button>

        <button
          onClick={() => setActiveTab("facturation")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "facturation"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <CreditCard size={16} />
          <span>Coordonnées Bancaires (RIB)</span>
        </button>

        <button
          onClick={() => setActiveTab("securite")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "securite"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <Shield size={16} />
          <span>Sécurité & Mot de passe</span>
        </button>
      </div>

      {/* Contenu */}
      <div className="space-y-6">
        {/* TAB 1: PREFERENCES */}
        {activeTab === "preferences" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Zone & Capacité */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Zone d'intervention & Capacité d'accueil
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Ces critères aident les organisateurs à vérifier votre disponibilité lors de leurs demandes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Zone géographique couverte
                  </label>
                  <input
                    type="text"
                    value={coverageArea}
                    onChange={(e) => setCoverageArea(e.target.value)}
                    placeholder="Ex: Dakar, Thiès, Saly et environs"
                    className="w-full px-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Capacité maximale de convives
                  </label>
                  <input
                    type="number"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    placeholder="Ex: 500"
                    className="w-full px-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                  />
                </div>
              </div>
            </div>

            {/* Alertes & Notifications */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Alertes de demandes & Rendez-vous
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Choisissez les notifications actives pour votre activité.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 hover:bg-[#faf8f5] transition-colors">
                  <div className="pr-4">
                    <div className="font-bold text-xs sm:text-sm text-stone-900">
                      Nouvelles demandes de devis
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Recevoir une alerte instantanée dès qu'un organisateur vous sollicite pour son événement.
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifs.devis}
                    onClick={() => setNotifs({ ...notifs, devis: !notifs.devis })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifs.devis ? "bg-[#b8924a]" : "bg-stone-300"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        notifs.devis ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 hover:bg-[#faf8f5] transition-colors">
                  <div className="pr-4">
                    <div className="font-bold text-xs sm:text-sm text-stone-900">
                      Nouveaux messages chat
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Alerte en direct en cas de nouveau message client dans la messagerie Evenium.
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifs.messages}
                    onClick={() => setNotifs({ ...notifs, messages: !notifs.messages })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifs.messages ? "bg-[#b8924a]" : "bg-stone-300"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        notifs.messages ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 hover:bg-[#faf8f5] transition-colors">
                  <div className="pr-4">
                    <div className="font-bold text-xs sm:text-sm text-stone-900">
                      Paiements & Acomptes validés
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Notification immédiate dès qu'un devis est validé et que l'acompte est sécurisé.
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifs.paiements}
                    onClick={() => setNotifs({ ...notifs, paiements: !notifs.paiements })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifs.paiements ? "bg-[#b8924a]" : "bg-stone-300"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        notifs.paiements ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                {showSaveSuccess ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Préférences enregistrées
                  </span>
                ) : <span />}
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
                >
                  <Save size={14} className="inline mr-1.5" />
                  {isSaving ? "Enregistrement…" : "Enregistrer les préférences"}
                </button>
              </div>
            </div>

            {/* Sonneries & Push */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs">
              <NotificationSoundSettings role="prestataire" />
            </div>
          </div>
        )}

        {/* TAB 2: FACTURATION */}
        {activeTab === "facturation" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Coordonnées de virement bancaire (RIB)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Ces informations sont utilisées par la plateforme Evenium pour vous reverser les acomptes et règlements de vos clients.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Nom de la banque
                </label>
                <input
                  type="text"
                  value={bankInfo.bankName}
                  onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                  placeholder="Ex: CBAO, BOA, Ecobank, SGBS…"
                  className="w-full px-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Titulaire du compte
                </label>
                <input
                  type="text"
                  value={bankInfo.accountName}
                  onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value })}
                  placeholder="Nom exact du bénéficiaire ou société"
                  className="w-full px-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Numéro de compte / IBAN
                </label>
                <input
                  type="text"
                  value={bankInfo.iban}
                  onChange={(e) => setBankInfo({ ...bankInfo, iban: e.target.value })}
                  placeholder="SN00 0000 0000 0000 0000 0000"
                  className="w-full px-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Code BIC / SWIFT (Optionnel)
                </label>
                <input
                  type="text"
                  value={bankInfo.swift || ""}
                  onChange={(e) => setBankInfo({ ...bankInfo, swift: e.target.value })}
                  placeholder="Ex: CBAOSNDA"
                  className="w-full px-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              {showSaveSuccess ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> RIB mis à jour avec succès
                </span>
              ) : <span />}
              <button
                type="button"
                onClick={handleSaveBank}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
              >
                <Upload size={14} className="inline mr-1.5" />
                {isSaving ? "Enregistrement…" : "Mettre à jour le RIB"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITE */}
        {activeTab === "securite" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Modifier le mot de passe
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Recommandé si votre mot de passe temporaire a été créé par un administrateur.
                </p>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-200">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                    className="w-full px-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Confirmez le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez à l'identique"
                    className="w-full px-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  <Shield size={14} className="inline mr-1.5" />
                  {isSaving ? "Modification…" : "Mettre à jour le mot de passe"}
                </button>
              </form>
            </div>

            {/* Suppression du compte */}
            <DeleteAccountSection role="prestataire" />
          </div>
        )}
      </div>
    </div>
  );
}
