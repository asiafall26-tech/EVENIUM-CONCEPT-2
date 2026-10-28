"use client";

import { Save, User, Bell, Shield, CreditCard, Camera, LogOut, Check, CreditCard as CardIcon, Download, Smartphone, Plus, Trash2, X, Sparkles, Mail, Phone, Lock, FileText, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { DeleteAccountSection } from "@/components/ui/DeleteAccountSection";
import { NotificationSoundSettings } from "@/components/settings/NotificationSoundSettings";

// Helper pour calculer les initiales de manière consistante avec la navbar
const getInitials = (name?: string) => {
  if (!name?.trim()) return "EV";
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || "EV";
};

export default function GlobalSettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"profil" | "notifications" | "securite" | "facturation">("profil");
  const [profile, setProfile] = useState<any>(null);

  // Fetch real user data
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (data) {
          setProfile({ ...data, email: user.email, role: data.role || user.user_metadata?.role || 'client' });
        } else {
          setProfile({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Mon Profil",
            phone: user.user_metadata?.phone || "",
            role: user.user_metadata?.role || "client"
          });
        }

        // Load real events for this client ONLY
        const { data: userEventsData } = await supabase
          .from('events')
          .select('id, name, plan, format, date, created_at')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });

        if (userEventsData && userEventsData.length > 0) {
          setUserEvents(userEventsData);
          const realInvoices = userEventsData
            .filter((e: any) => e.plan === 'Gold' || e.plan === 'Premium' || e.plan === 'Standard')
            .map((e: any) => {
              const amount = e.plan === 'Gold' ? '20 000 FCFA' : e.plan === 'Premium' ? '10 000 FCFA' : '5 000 FCFA';
              return {
                id: `INV-${e.id.substring(0, 8).toUpperCase()}`,
                date: e.created_at ? new Date(e.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Récent',
                desc: `Formule ${e.plan} - ${e.name}`,
                amount: amount
              };
            });
          setInvoices(realInvoices);
        } else {
          setUserEvents([]);
          setInvoices([]);
        }
      }
    }
    loadProfile();
  }, [supabase]);

  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Vous devez sélectionner une image.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id || 'avatar'}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('evenium_assets')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('evenium_assets').getPublicUrl(filePath);

      if (profile?.id) {
        await supabase.from('profiles').upsert({
          id: profile.id,
          avatar_url: data.publicUrl,
          role: profile.role || 'client',
        }, { onConflict: 'id' });
        setProfile({ ...profile, avatar_url: data.publicUrl });
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({ number: "", expiry: "", cvc: "" });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    if (profile?.id) {
      try {
        const roleToSave = profile.role || "client";
        const { error } = await supabase.from('profiles').upsert({
          id: profile.id,
          full_name: profile.full_name,
          phone: profile.phone,
          email: profile.email,
          role: roleToSave,
        }, { onConflict: 'id' });

        if (error) throw error;
        
        await supabase.auth.updateUser({
          data: {
            full_name: profile.full_name,
            phone: profile.phone,
          }
        });
        
        router.refresh();
        
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
      } catch (error: any) {
        alert("Erreur lors de la sauvegarde : " + (error?.message || error));
      }
    }
    
    setIsSaving(false);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.number) return;
    const last4 = newCard.number.slice(-4) || "0000";
    setPaymentMethods([...paymentMethods, {
      id: Date.now(),
      last4,
      expiry: newCard.expiry || "12/29",
      type: newCard.number.startsWith("4") ? "Visa" : "Mastercard",
      isDefault: paymentMethods.length === 0
    }]);
    setIsAddCardModalOpen(false);
    setNewCard({ number: "", expiry: "", cvc: "" });
  };

  const handleDeleteCard = (id: number) => {
    if (confirm("Supprimer ce moyen de paiement ?")) {
      const updated = paymentMethods.filter(p => p.id !== id);
      if (updated.length > 0 && paymentMethods.find(p => p.id === id)?.isDefault) {
        updated[0].isDefault = true;
      }
      setPaymentMethods(updated);
    }
  };

  const handleSetDefault = (id: number) => {
    setPaymentMethods(paymentMethods.map(p => ({
      ...p,
      isDefault: p.id === id
    })));
  };

  const handleDownloadInvoice = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    const invoiceNum = id;
    const invoiceDate = inv?.date || new Date().toLocaleDateString('fr-FR');
    const invoiceDesc = inv?.desc || "Formule Evenium";
    const invoiceAmount = inv?.amount || "20 000 FCFA";
    const clientName = profile?.full_name || "Client Evenium";
    const clientEmail = profile?.email || "";

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Facture ${invoiceNum} - Evenium</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111; margin: 40px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #b8924a; padding-bottom: 20px; }
          .logo { font-size: 28px; font-weight: bold; color: #111; font-family: serif; }
          .logo span { color: #b8924a; }
          .title { font-size: 20px; font-weight: bold; margin-top: 30px; }
          .meta { display: flex; justify-content: space-between; margin-top: 20px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          .table th { background: #111; color: white; text-align: left; padding: 12px; }
          .table td { border-bottom: 1px solid #eee; padding: 12px; }
          .total { text-align: right; margin-top: 20px; font-size: 20px; font-weight: bold; color: #b8924a; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">EVENIUM <span>.</span></div>
          <div style="text-align: right; font-size: 13px; color: #555;">
            Plateforme Digitale de Gestion d'Événements<br/>
            contact@evenium.com • www.evenium.com
          </div>
        </div>
        <div class="title">REÇU DE PAIEMENT OFFICIEL</div>
        <div class="meta">
          <div>
            <strong>Facturé à :</strong><br/>
            ${clientName}<br/>
            ${clientEmail}
          </div>
          <div style="text-align: right;">
            <strong>Réf. :</strong> ${invoiceNum}<br/>
            <strong>Date :</strong> ${invoiceDate}<br/>
            <strong>Statut :</strong> <span style="color: green; font-weight: bold;">PAYÉ</span>
          </div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Désignation</th>
              <th style="text-align: right;">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${invoiceDesc}</td>
              <td style="text-align: right; font-weight: bold;">${invoiceAmount}</td>
            </tr>
          </tbody>
        </table>
        <div class="total">
          Total Réglé : ${invoiceAmount}
        </div>
        <div class="footer">
          Merci pour votre confiance. Evenium - Sublimez vos moments précieux.
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(invoiceHtml);
      printWin.document.close();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-300">
      {/* En-tête de la page */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-1">
          Paramètres du compte
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm">
          Gérez votre profil, vos préférences de notifications, votre sécurité et votre facturation.
        </p>
      </div>

      {/* Carte Résumé Profil & Avatar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] flex items-center justify-center font-serif text-2xl font-bold overflow-hidden shadow-md ring-4 ring-[#faf6ee]">
              {uploadingAvatar ? (
                <span className="text-xs font-sans font-bold">Upload…</span>
              ) : profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" unoptimized />
              ) : (
                getInitials(profile?.full_name)
              )}
            </div>
            <label
              htmlFor="avatar-input"
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-md hover:bg-[#b8924a] transition-colors cursor-pointer"
              title="Changer la photo de profil"
            >
              <Camera size={14} />
            </label>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-950 truncate">
                {profile?.full_name || "Organisateur"}
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#faf6ee] text-[#8f6f33] border border-[#b8924a]/30">
                <Sparkles size={11} /> Client Organisateur
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
              {profile?.email || "chargement…"}
            </p>
            {profile?.phone && (
              <p className="text-xs text-stone-600 font-medium mt-0.5">
                📞 {profile.phone}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {showSaveSuccess && (
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
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "notifications"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <Bell size={16} />
          <span>Notifications & Sonneries</span>
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
          <span>Sécurité & Accès</span>
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
          <span>Facturation & Cartes</span>
        </button>

        <button
          onClick={() => router.push('/login')}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors whitespace-nowrap cursor-pointer"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>

      {/* Contenu des Onglets */}
      <div className="space-y-6">
        {/* TAB 1: PROFIL */}
        {activeTab === "profil" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Informations du compte organisateur
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Ces informations sont automatiquement synchronisées dans vos échanges, invitations et fiches de messagerie.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Nom et Prénom
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={profile?.full_name || ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Votre nom complet"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40 focus:border-[#b8924a] transition-all"
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
                    value={profile?.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="Ex: +221 77 000 00 00"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40 focus:border-[#b8924a] transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Adresse E-mail de connexion
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm font-semibold text-stone-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  L'adresse email est liée à votre compte Evenium et ne peut être modifiée qu'auprès du support.
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

        {/* TAB 2: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Canaux de notifications */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-5">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Préférences de réception
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Définissez comment Evenium vous prévient en cas de nouvelle activité.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 hover:bg-[#faf8f5] transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-1 w-4 h-4 text-[#b8924a] rounded border-stone-300 focus:ring-[#b8924a]"
                  />
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-stone-900">
                      Confirmations RSVP des invités
                    </div>
                    <div className="text-xs text-stone-500">
                      Recevoir une alerte instantanée dès qu'un invité valide ou décline son invitation.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 hover:bg-[#faf8f5] transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-1 w-4 h-4 text-[#b8924a] rounded border-stone-300 focus:ring-[#b8924a]"
                  />
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-stone-900">
                      Messages et devis des prestataires
                    </div>
                    <div className="text-xs text-stone-500">
                      Être notifié en cas de proposition, révision ou message dans la messagerie.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 hover:bg-[#faf8f5] transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-1 w-4 h-4 text-[#b8924a] rounded border-stone-300 focus:ring-[#b8924a]"
                  />
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-stone-900">
                      Alertes prioritaires (WhatsApp / SMS)
                    </div>
                    <div className="text-xs text-stone-500">
                      Rappels de calendrier et alertes importantes pour ne rien manquer le jour J.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Personnalisation Sonneries & Push */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs">
              <NotificationSoundSettings role="client" />
            </div>
          </div>
        )}

        {/* TAB 3: SECURITE */}
        {activeTab === "securite" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Changement de mot de passe */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Sécurité du compte & Mot de passe
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Modifiez votre mot de passe pour protéger l'accès à vos événements et données privées.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Confirmer
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]/40"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => alert("Pour mettre à jour votre mot de passe, utilisez l'email de réinitialisation sécurisé ou contactez le support.")}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors"
                >
                  Mettre à jour le mot de passe
                </button>
              </div>
            </div>

            {/* Authentification 2FA */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-stone-900 mb-1">
                  Authentification à deux facteurs (2FA)
                </h4>
                <p className="text-xs text-stone-500">
                  Renforcez la protection de vos paiements et contrats d'événements.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("L'authentification 2FA est gérée automatiquement avec les sessions sécurisées Supabase.")}
                className="px-4 py-2 rounded-xl bg-[#faf6ee] text-[#8f6f33] text-xs font-bold hover:bg-[#efe6d6] transition-colors shrink-0"
              >
                Activer 2FA
              </button>
            </div>

            {/* Suppression du compte */}
            <DeleteAccountSection role="client" />
          </div>
        )}

        {/* TAB 4: FACTURATION */}
        {activeTab === "facturation" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Formule active */}
            {userEvents.length > 0 ? (
              <div className="bg-gradient-to-br from-[#241b13] to-stone-950 p-6 sm:p-7 rounded-3xl border border-[#b8924a]/30 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-lg">
                <div>
                  <div className="text-[#d9c08c] text-[11px] font-bold uppercase tracking-wider mb-1">
                    Formule Actuelle
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-1">
                    Formule {userEvents[0].plan || "Standard"}
                  </h3>
                  <p className="text-stone-300 text-xs sm:text-sm">
                    Événement lié : <span className="text-white font-bold">{userEvents[0].name}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Actif
                  </span>
                  <Link
                    href={`/dashboard/events/${userEvents[0].id}`}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                  >
                    Voir l'événement →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 border border-stone-200 text-center">
                <p className="text-sm font-bold text-stone-800">Aucun événement actif enregistré.</p>
                <Link
                  href="/dashboard/new"
                  className="mt-3 inline-block px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold"
                >
                  Créer un événement
                </Link>
              </div>
            )}

            {/* Cartes et moyens de paiement */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Moyens de paiement
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Cartes bancaires enregistrées pour le règlement sécurisé de vos formules Evenium.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCardModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#faf6ee] text-[#8f6f33] text-xs font-bold hover:bg-[#efe6d6] transition-colors"
                >
                  <Plus size={14} /> Ajouter une carte
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {paymentMethods.length === 0 ? (
                  <div className="md:col-span-2 border border-dashed border-stone-200 rounded-2xl p-6 text-center text-xs text-stone-500">
                    Aucun moyen de paiement enregistré pour le moment.
                  </div>
                ) : (
                  paymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        pm.isDefault ? "bg-[#fcfaf6] border-[#b8924a]" : "bg-white border-stone-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <CardIcon size={20} className={pm.isDefault ? "text-[#8f6f33]" : "text-stone-400"} />
                          <span className="text-xs font-bold text-stone-900">
                            {pm.type} •••• {pm.last4}
                          </span>
                        </div>
                        {pm.isDefault && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Par défaut
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                        <span>Exp : {pm.expiry}</span>
                        <div className="flex items-center gap-2">
                          {!pm.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(pm.id)}
                              className="text-stone-700 hover:text-black font-semibold"
                            >
                              Définir par défaut
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(pm.id)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Historique de facturation */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Historique de facturation
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Consultez et téléchargez vos reçus officiels Evenium.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf8f5] text-stone-600 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Désignation</th>
                      <th className="px-4 py-3">Montant</th>
                      <th className="px-4 py-3 text-right">Reçu officiel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-stone-500">
                          Aucune facture enregistrée pour le moment.
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#faf8f5]/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-stone-600 whitespace-nowrap">{inv.date}</td>
                          <td className="px-4 py-3 font-bold text-stone-900">{inv.desc}</td>
                          <td className="px-4 py-3 font-bold text-[#8f6f33] whitespace-nowrap">{inv.amount}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDownloadInvoice(inv.id)}
                              className="p-1.5 rounded-lg bg-[#faf6ee] text-[#8f6f33] hover:bg-[#efe6d6] transition-colors"
                              title="Télécharger le reçu PDF"
                            >
                              <Download size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modale Ajout de Carte */}
      {isAddCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-stone-200">
            <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-[#faf8f5]">
              <h3 className="font-bold text-sm text-stone-900">Ajouter une carte bancaire</h3>
              <button
                onClick={() => setIsAddCardModalOpen(false)}
                className="text-stone-400 hover:text-stone-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCard} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Numéro de carte
                </label>
                <input
                  type="text"
                  required
                  placeholder="0000 0000 0000 0000"
                  maxLength={16}
                  className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#b8924a]/50 outline-none"
                  value={newCard.number}
                  onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Expiration
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#b8924a]/50 outline-none"
                    value={newCard.expiry}
                    onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    maxLength={3}
                    className="w-full px-3.5 py-2.5 bg-[#faf8f5] border border-stone-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#b8924a]/50 outline-none"
                    value={newCard.cvc}
                    onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 text-white font-bold rounded-xl hover:bg-black transition-colors text-xs"
              >
                Enregistrer la carte
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
