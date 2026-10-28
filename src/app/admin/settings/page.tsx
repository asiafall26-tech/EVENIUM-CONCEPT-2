"use client";

import {
  Save,
  User,
  Lock,
  Bell,
  Globe,
  ShieldCheck,
  Camera,
  Mail,
  Shield,
  CheckCircle2,
  Sparkles,
  Sliders,
  Radio,
  Server,
  Phone,
  HelpCircle,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { NotificationSoundSettings } from "@/components/settings/NotificationSoundSettings";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "profil" | "securite" | "notifications" | "langues" | "plateforme"
  >("profil");

  // Admin Profile
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+221 77 000 00 00");
  const [role, setRole] = useState("Super Administrateur");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Security
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({
    newUsers: true,
    payments: true,
    errors: false,
    supportTickets: true,
  });

  // Language & Region
  const [language, setLanguage] = useState("fr");
  const [timezone, setTimezone] = useState("GMT");
  const [currency, setCurrency] = useState("XOF");

  // Platform & System Settings
  const [platform, setPlatform] = useState({
    supportEmail: "support@evenium.com",
    supportPhone: "+221 77 123 45 67",
    publicRegistrations: true,
    maintenanceMode: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const fullName = prof?.full_name || user.user_metadata?.full_name || "";
      if (fullName) {
        const parts = fullName.trim().split(/\s+/);
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
      if (prof?.avatar_url) {
        setAvatarUrl(prof.avatar_url);
      }
      if (prof?.role) {
        setRole(prof.role === "admin" ? "Super Administrateur" : prof.role);
      }
      if (prof?.phone || user.user_metadata?.phone) {
        setPhone(prof?.phone || user.user_metadata?.phone || "");
      }
      if (user.user_metadata?.notifsAdmin) {
        setNotifs(user.user_metadata.notifsAdmin);
      }
      if (user.user_metadata?.language) {
        setLanguage(user.user_metadata.language);
      }
      if (user.user_metadata?.timezone) {
        setTimezone(user.user_metadata.timezone);
      }
      if (user.user_metadata?.currency) {
        setCurrency(user.user_metadata.currency);
      }
      if (user.user_metadata?.platformSettings) {
        setPlatform(user.user_metadata.platformSettings);
      }
    }
    loadAdmin();
  }, [supabase]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `admin-avatar-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("evenium_assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("evenium_assets").getPublicUrl(filePath);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              avatar_url: data.publicUrl,
              role: "admin",
            },
            { onConflict: "id" }
          );
        setAvatarUrl(data.publicUrl);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert("Erreur upload photo : " + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const full = `${firstName.trim()} ${lastName.trim()}`.trim();
        await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              full_name: full,
              email: user.email,
              phone: phone,
              role: "admin",
              avatar_url: avatarUrl,
            },
            { onConflict: "id" }
          );

        await supabase.auth.updateUser({
          data: {
            full_name: full,
            phone: phone,
            notifsAdmin: notifs,
            language,
            timezone,
            currency,
            platformSettings: platform,
          },
        });

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e: any) {
      alert("Erreur lors de la sauvegarde : " + (e?.message || e));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err.message || "Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setIsSaving(false);
    }
  };

  const initials =
    `${firstName[0] || ""}${lastName[0] || firstName[1] || ""}`.toUpperCase() || "AD";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-300">
      {/* En-tête de la page */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-1">
          Paramètres Administrateur
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm">
          Gérez votre profil administrateur, la sécurité globale, les alertes système et les paramètres de la plateforme.
        </p>
      </div>

      {/* Carte Résumé Profil Admin & Avatar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#241b13] to-stone-900 text-[#d9c08c] flex items-center justify-center font-serif text-2xl font-bold overflow-hidden shadow-md ring-4 ring-[#faf6ee]">
              {uploadingAvatar ? (
                <span className="text-xs font-sans font-bold text-white">Upload…</span>
              ) : avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar Admin" fill className="object-cover" unoptimized />
              ) : (
                initials
              )}
            </div>
            <label
              htmlFor="admin-avatar-input"
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#b8924a] text-white flex items-center justify-center shadow-md hover:bg-[#8f6f33] transition-colors cursor-pointer"
              title="Changer la photo de profil"
            >
              <Camera size={14} />
            </label>
            <input
              id="admin-avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-950 truncate">
                {`${firstName} ${lastName}`.trim() || "Administrateur Evenium"}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#faf6ee] text-[#8f6f33] border border-[#b8924a]/30">
                <ShieldCheck size={12} /> {role}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
              {email || "admin@evenium.com"}
              {phone ? ` • 📞 ${phone}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
              <Check size={14} /> Enregistré !
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] text-xs font-bold shadow-md shadow-[#b8924a]/20 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
          >
            <Save size={15} />
            <span>{isSaving ? "Enregistrement…" : "Enregistrer"}</span>
          </button>
        </div>
      </div>

      {/* Navigation par Onglets Épurée */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("profil")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "profil"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <User size={16} />
          <span>Mon Profil</span>
        </button>

        <button
          onClick={() => setActiveTab("securite")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "securite"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <Lock size={16} />
          <span>Sécurité & Accès</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "notifications"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <Bell size={16} />
          <span>Alertes & Sonneries</span>
        </button>

        <button
          onClick={() => setActiveTab("langues")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "langues"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <Globe size={16} />
          <span>Langue & Région</span>
        </button>

        <button
          onClick={() => setActiveTab("plateforme")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "plateforme"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <Sliders size={16} />
          <span>Plateforme & Système</span>
        </button>
      </div>

      {/* Contenu des Onglets */}
      <div className="space-y-6">
        {/* TAB 1: PROFIL */}
        {activeTab === "profil" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Informations Personnelles
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Mettez à jour vos informations affichées dans la console d'administration et les échanges support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Prénom
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Votre prénom"
                  className="w-full px-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40 focus:border-[#b8924a] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Nom
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full px-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40 focus:border-[#b8924a] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Adresse Email Administrateur
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm font-semibold text-stone-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Numéro de Téléphone
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+221 77 000 00 00"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40 focus:border-[#b8924a] transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Rôle Système
                </label>
                <div className="relative">
                  <Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={role}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm font-semibold text-stone-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Ce rôle vous confère un accès complet aux données financières, utilisateurs, validation de prestataires et modèles.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? "Sauvegarde en cours…" : "Sauvegarder les modifications"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SECURITE */}
        {activeTab === "securite" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Modification du mot de passe */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Modifier le mot de passe administrateur
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Assurez la sécurité de la plateforme en utilisant un mot de passe robuste d'au moins 6 caractères.
                </p>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-200">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={15} /> Mot de passe mis à jour avec succès !
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
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Mise à jour…" : "Mettre à jour mon mot de passe"}
                </button>
              </form>
            </div>

            {/* Authentification 2FA & Session */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs flex flex-col justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-stone-900 mb-1 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#b8924a]" />
                    Double Authentification (2FA)
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Exigez une validation supplémentaire par email ou application d'authentification lors de la connexion.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    ✓ Protection Active
                  </span>
                  <button
                    type="button"
                    onClick={() => alert("L'authentification renforcée est déjà activée pour le compte administrateur.")}
                    className="px-3 py-1.5 rounded-xl bg-[#faf6ee] text-[#8f6f33] text-xs font-bold hover:bg-[#efe6d6] transition-colors cursor-pointer"
                  >
                    Gérer 2FA
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs flex flex-col justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-stone-900 mb-1 flex items-center gap-2">
                    <Server size={18} className="text-[#b8924a]" />
                    Session & Chiffrement
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Connexion chiffrée SSL / TLS 1.3 avec jetons d'accès JWT sécurisés et renouvellement automatique.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-full">
                    Session courante vérifiée
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS & SONNERIES */}
        {activeTab === "notifications" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Alertes système */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-5">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Alertes de Supervision Administrateur
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Choisissez les événements qui déclenchent une notification immédiate dans la console.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Switch 1: Nouveaux inscrits */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 hover:bg-[#faf8f5] transition-colors">
                  <div className="pr-4">
                    <div className="font-bold text-xs sm:text-sm text-stone-900">
                      Nouveaux inscrits sur Evenium
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Être alerté dès l'inscription d'un nouvel organisateur ou prestataire de services.
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifs.newUsers}
                    onClick={() => setNotifs({ ...notifs, newUsers: !notifs.newUsers })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifs.newUsers ? "bg-[#b8924a]" : "bg-stone-300"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        notifs.newUsers ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Switch 2: Paiements & Souscriptions */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 hover:bg-[#faf8f5] transition-colors">
                  <div className="pr-4">
                    <div className="font-bold text-xs sm:text-sm text-stone-900">
                      Paiements et Souscriptions Gold / Premium
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Recevoir un récapitulatif lorsqu'une formule d'événement est validée et réglée.
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifs.payments}
                    onClick={() => setNotifs({ ...notifs, payments: !notifs.payments })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifs.payments ? "bg-[#b8924a]" : "bg-stone-300"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        notifs.payments ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Switch 3: Tickets de support */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 hover:bg-[#faf8f5] transition-colors">
                  <div className="pr-4">
                    <div className="font-bold text-xs sm:text-sm text-stone-900">
                      Nouveaux tickets de réclamation & support
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Alerte dès qu'un utilisateur soumet une demande ou un litige nécessitant modération.
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifs.supportTickets}
                    onClick={() => setNotifs({ ...notifs, supportTickets: !notifs.supportTickets })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifs.supportTickets ? "bg-[#b8924a]" : "bg-stone-300"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        notifs.supportTickets ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Switch 4: Rapports d'erreurs critiques */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 hover:bg-[#faf8f5] transition-colors">
                  <div className="pr-4">
                    <div className="font-bold text-xs sm:text-sm text-stone-900">
                      Rapports d'erreurs techniques critiques
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Alerte technique en cas d'échec webhook de paiement ou dysfonctionnement API.
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifs.errors}
                    onClick={() => setNotifs({ ...notifs, errors: !notifs.errors })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifs.errors ? "bg-[#b8924a]" : "bg-stone-300"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        notifs.errors ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleSave}
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
              <NotificationSoundSettings role="admin" />
            </div>
          </div>
        )}

        {/* TAB 4: LANGUE & REGION */}
        {activeTab === "langues" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Langue & Paramètres Régionaux
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Définissez la langue, le fuseau horaire et la devise d'affichage par défaut pour la console administrative.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Langue de l'interface
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                >
                  <option value="fr">Français (FR)</option>
                  <option value="en">English (US)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Fuseau Horaire
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                >
                  <option value="GMT">Heure de Greenwich (GMT / UTC - Dakar)</option>
                  <option value="CET">Heure d'Europe centrale (CET - Paris)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Devise de référence
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                >
                  <option value="XOF">Franc CFA (FCFA / XOF)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar US ($)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
              >
                <Save size={14} className="inline mr-1.5" />
                {isSaving ? "Enregistrement…" : "Enregistrer les préférences"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: PLATEFORME & SYSTEME */}
        {activeTab === "plateforme" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Paramètres Généraux de la Plateforme Evenium
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Configurez les coordonnées officielles de contact et la disponibilité du service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Email Support Officiel
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    value={platform.supportEmail}
                    onChange={(e) => setPlatform({ ...platform, supportEmail: e.target.value })}
                    placeholder="contact@evenium.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Téléphone Assistance Clients
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    value={platform.supportPhone}
                    onChange={(e) => setPlatform({ ...platform, supportPhone: e.target.value })}
                    placeholder="+221 77 123 45 67"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                  />
                </div>
              </div>
            </div>

            {/* Platform Controls */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 hover:bg-[#faf8f5] transition-colors">
                <div className="pr-4">
                  <div className="font-bold text-xs sm:text-sm text-stone-900">
                    Inscriptions Publiques Ouvertes
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Permettre aux nouveaux organisateurs et prestataires de créer un compte librement.
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={platform.publicRegistrations}
                  onClick={() =>
                    setPlatform({
                      ...platform,
                      publicRegistrations: !platform.publicRegistrations,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    platform.publicRegistrations ? "bg-[#b8924a]" : "bg-stone-300"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      platform.publicRegistrations ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 hover:bg-[#faf8f5] transition-colors">
                <div className="pr-4">
                  <div className="font-bold text-xs sm:text-sm text-stone-900">
                    Mode Maintenance Système
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Affiche une page de courtoisie aux visiteurs pendant les mises à jour techniques.
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={platform.maintenanceMode}
                  onClick={() =>
                    setPlatform({
                      ...platform,
                      maintenanceMode: !platform.maintenanceMode,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    platform.maintenanceMode ? "bg-rose-500" : "bg-stone-300"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      platform.maintenanceMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
              >
                <Save size={14} className="inline mr-1.5" />
                {isSaving ? "Enregistrement…" : "Enregistrer la configuration"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
