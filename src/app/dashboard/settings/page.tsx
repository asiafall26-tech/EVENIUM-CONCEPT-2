"use client";

import { Save, User, Bell, Shield, CreditCard, Camera, LogOut, Check, CreditCard as CardIcon, Download, Smartphone, Plus, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { DeleteAccountSection } from "@/components/ui/DeleteAccountSection";

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
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile({ ...data, email: user.email });
        } else {
          setProfile({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Mon Profil",
            phone: user.user_metadata?.phone || ""
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
        await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', profile.id);
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
        // Mettre à jour ou créer la ligne dans la table profiles
        const { error } = await supabase.from('profiles').upsert({
          id: profile.id,
          full_name: profile.full_name,
          phone: profile.phone,
          email: profile.email
        });

        if (error) throw error;
        
        // Mettre à jour les metadata de l'utilisateur pour la cohérence globale
        await supabase.auth.updateUser({
          data: { full_name: profile.full_name }
        });
        
        // Rafraîchir les Server Components (comme la Navbar)
        router.refresh();
        
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
      } catch (error: any) {
        alert("Erreur lors de la sauvegarde : " + error.message);
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
    <div className="p-8 max-w-4xl mx-auto w-full relative">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-black mb-2">Mon Profil</h1>
        <p className="text-gray-500 text-sm">Gérez vos informations personnelles et les paramètres de votre compte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation latérale des paramètres */}
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab("profil")}
            className={`w-full text-left px-5 py-3 font-semibold rounded-xl flex items-center gap-3 transition-all ${
              activeTab === "profil" ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-100 hover:text-black"
            }`}
          >
            <User size={18} /> Mon Profil
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full text-left px-5 py-3 font-semibold rounded-xl flex items-center gap-3 transition-all ${
              activeTab === "notifications" ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-100 hover:text-black"
            }`}
          >
            <Bell size={18} /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab("securite")}
            className={`w-full text-left px-5 py-3 font-semibold rounded-xl flex items-center gap-3 transition-all ${
              activeTab === "securite" ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-100 hover:text-black"
            }`}
          >
            <Shield size={18} /> Sécurité
          </button>
          <button 
            onClick={() => setActiveTab("facturation")}
            className={`w-full text-left px-5 py-3 font-semibold rounded-xl flex items-center gap-3 transition-all ${
              activeTab === "facturation" ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-100 hover:text-black"
            }`}
          >
            <CreditCard size={18} /> Facturation
          </button>
          <div className="h-px bg-gray-100 my-4 w-full"></div>
          <button onClick={() => router.push('/login')} className="w-full text-left px-5 py-3 text-red-500 hover:bg-red-50 font-medium rounded-xl flex items-center gap-3 transition-colors">
            <LogOut size={18} /> Déconnexion
          </button>
        </div>

        {/* Contenu principal */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            {/* Cover Photo */}
            <div className="h-32 bg-gradient-to-r from-gray-900 to-gray-700 relative group cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2">
                  <Camera size={16} /> Changer la couverture
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 relative">
              {/* Photo de profil (Avatar) */}
              <div className="absolute -top-16 left-8">
                <label className="w-24 h-24 rounded-full bg-white p-1 shadow-lg block cursor-pointer">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#b8924a] to-[#8f6f33] text-white flex items-center justify-center font-serif text-3xl font-bold relative group overflow-hidden">
                    {uploadingAvatar ? (
                      <span className="text-sm">...</span>
                    ) : profile?.avatar_url ? (
                      <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" unoptimized />
                    ) : (
                      profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "NA"
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={20} className="text-white" />
                    </div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                </label>
              </div>

              {/* Spacer for avatar */}
              <div className="h-10 mb-4"></div>

              {/* Profil Tab */}
              {activeTab === "profil" && (
                <section className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Informations personnelles</h2>
                    <p className="text-sm text-gray-500">Mettez à jour vos informations de contact et votre identité.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom complet</label>
                      <input 
                        type="text" 
                        value={profile?.full_name || ""} 
                        onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b8924a] focus:border-[#b8924a] outline-none transition-all shadow-sm" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse Email</label>
                      <input type="email" value={profile?.email || ""} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b8924a] focus:border-[#b8924a] outline-none transition-all shadow-sm" disabled />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Numéro de téléphone</label>
                      <input 
                        type="tel" 
                        value={profile?.phone || ""} 
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b8924a] focus:border-[#b8924a] outline-none transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Préférences de notification</h2>
                    <p className="text-sm text-gray-500">Choisissez comment vous souhaitez être informé de l'activité de vos événements.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Notifications par Email</h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-[#b8924a] rounded border-gray-300 focus:ring-[#b8924a]" />
                        <div>
                          <div className="font-semibold text-sm text-gray-900">Nouvelles inscriptions</div>
                          <div className="text-xs text-gray-500">Recevoir un email lorsqu'un invité confirme sa présence.</div>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-[#b8924a] rounded border-gray-300 focus:ring-[#b8924a]" />
                        <div>
                          <div className="font-semibold text-sm text-gray-900">Messages des prestataires</div>
                          <div className="text-xs text-gray-500">Recevoir une alerte pour les nouveaux messages et devis.</div>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" className="mt-1 w-4 h-4 text-[#b8924a] rounded border-gray-300 focus:ring-[#b8924a]" />
                        <div>
                          <div className="font-semibold text-sm text-gray-900">Marketing & Astuces</div>
                          <div className="text-xs text-gray-500">Recevoir nos newsletters et conseils pour réussir vos événements.</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Smartphone size={18} /> Notifications Mobiles (SMS / WhatsApp)</h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-[#b8924a] rounded border-gray-300 focus:ring-[#b8924a]" />
                        <div>
                          <div className="font-semibold text-sm text-gray-900">Alertes importantes via WhatsApp</div>
                          <div className="text-xs text-gray-500">Notifications instantanées pour les annulations de prestataires ou urgences.</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </section>
              )}

              {/* Sécurité Tab */}
              {activeTab === "securite" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Mot de passe et Sécurité</h2>
                    <p className="text-sm text-gray-500">Gérez votre mot de passe et protégez votre compte.</p>
                  </div>
                  
                  <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Changer le mot de passe</h3>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe actuel</label>
                      <input type="password" placeholder="••••••••" className="w-full md:w-2/3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b8924a] focus:border-[#b8924a] outline-none shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nouveau mot de passe</label>
                      <input type="password" placeholder="••••••••" className="w-full md:w-2/3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b8924a] focus:border-[#b8924a] outline-none shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmer le nouveau mot de passe</label>
                      <input type="password" placeholder="••••••••" className="w-full md:w-2/3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b8924a] focus:border-[#b8924a] outline-none shadow-sm" />
                    </div>
                    <button className="mt-2 px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-900 transition-colors">
                      Mettre à jour le mot de passe
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Authentification à deux facteurs (2FA)</h3>
                      <p className="text-sm text-gray-500">Ajoute une couche de sécurité supplémentaire à votre compte.</p>
                    </div>
                    <button className="px-5 py-2.5 bg-[#f5eee1] text-[#8f6f33] text-sm font-bold rounded-lg hover:bg-[#e4d8c4] transition-colors whitespace-nowrap">
                      Activer 2FA
                    </button>
                  </div>

                  {/* Zone de Danger : Suppression du compte */}
                  <DeleteAccountSection role="client" />
                </section>
              )}

              {/* Facturation Tab */}
              {activeTab === "facturation" && (
                <section className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Facturation & Abonnement</h2>
                    <p className="text-sm text-gray-500">Gérez votre formule, vos moyens de paiement et vos factures.</p>
                  </div>

                  {/* Plan actuel */}
                  {userEvents.length > 0 ? (
                    <div className="bg-gradient-to-br from-[#2b2118] to-black p-6 rounded-xl border border-gray-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-black/20">
                      <div>
                        <div className="text-[#b8924a] text-xs font-bold uppercase tracking-wider mb-2">Formule Actuelle</div>
                        <h3 className="text-2xl font-serif font-bold mb-1">
                          Formule {userEvents[0].plan || "Standard"}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Événement : <span className="text-white font-medium">{userEvents[0].name}</span>
                          {userEvents[0].plan === 'Gold' ? " (20 000 FCFA - Tous les outils débloqués)" : userEvents[0].plan === 'Premium' ? " (10 000 FCFA - Suivi RSVP & Outils)" : " (5 000 FCFA - Dashboard, Lien officiel & QR Code)"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="px-4 py-2 bg-green-500/10 text-green-400 text-sm font-bold rounded-lg border border-green-500/20 whitespace-nowrap flex items-center gap-2">
                          <Check size={14} /> Actif
                        </span>
                        <Link href={`/dashboard/events/${userEvents[0].id}`} className="text-[11px] font-semibold text-[#b8924a] hover:underline mt-2 bg-white/10 px-3 py-1.5 rounded-md transition-colors hover:bg-white/20">
                          Accéder à l&apos;événement
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl text-center flex flex-col items-center justify-center">
                      <p className="text-gray-700 font-semibold mb-1">Aucun événement actif</p>
                      <p className="text-gray-500 text-xs mb-4">Créez votre événement pour activer votre formule et accéder à tous vos outils.</p>
                      <Link href="/dashboard/new" className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                        Créer un événement
                      </Link>
                    </div>
                  )}

                  {/* Moyens de paiement */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Moyens de paiement</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paymentMethods.length === 0 ? (
                        <div className="border border-gray-200 bg-white p-6 rounded-xl flex flex-col items-center justify-center text-center">
                          <CardIcon size={28} className="text-gray-300 mb-2" />
                          <p className="text-sm font-medium text-gray-600">Aucune carte bancaire enregistrée</p>
                          <p className="text-xs text-gray-400 mt-0.5">Ajoutez une carte pour sécuriser vos futurs règlements.</p>
                        </div>
                      ) : (
                        paymentMethods.map((pm) => (
                          <div key={pm.id} className={`border ${pm.isDefault ? 'border-[#b8924a] bg-[#f5eee1]' : 'border-gray-200 bg-white'} p-4 rounded-xl flex flex-col relative overflow-hidden group transition-all`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center shadow-sm">
                                  <CardIcon size={20} className={pm.isDefault ? "text-[#8f6f33]" : "text-gray-400"} />
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 text-sm">Carte {pm.type} •••• {pm.last4}</div>
                                  <div className="text-xs text-gray-500">Expire le {pm.expiry}</div>
                                </div>
                              </div>
                              {pm.isDefault && (
                                <div className="text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-1 rounded">Défaut</div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-100/50">
                              {!pm.isDefault && (
                                <button onClick={() => handleSetDefault(pm.id)} className="text-xs font-medium text-gray-500 hover:text-black transition-colors">
                                  Définir par défaut
                                </button>
                              )}
                              <button onClick={() => handleDeleteCard(pm.id)} className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors ml-auto flex items-center gap-1">
                                <Trash2 size={12} /> Supprimer
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                      
                      <button onClick={() => setIsAddCardModalOpen(true)} className="border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 p-4 rounded-xl flex items-center justify-center gap-2 text-gray-600 text-sm font-semibold transition-colors min-h-[120px]">
                        <Plus size={18} /> Ajouter un moyen de paiement
                      </button>
                    </div>
                  </div>

                  {/* Historique */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Historique de facturation</h3>
                    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-500 bg-gray-50 text-[11px] uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Description</th>
                            <th className="px-6 py-4 font-semibold">Montant</th>
                            <th className="px-6 py-4 font-semibold text-right">Facture</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {invoices.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-gray-500">Aucune facture enregistrée.</td>
                            </tr>
                          ) : (
                            invoices.map(inv => (
                              <tr key={inv.id} className="text-gray-700 hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">{inv.date}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{inv.desc}</td>
                                <td className="px-6 py-4 font-bold">{inv.amount}</td>
                                <td className="px-6 py-4 text-right">
                                  <button onClick={() => handleDownloadInvoice(inv.id)} className="text-[#8f6f33] hover:text-[#7a5e2b] bg-[#f5eee1] p-2 rounded-lg transition-colors" title="Télécharger">
                                    <Download size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}

            </div>
            
            <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-between items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-green-600 transition-opacity duration-300" style={{ opacity: showSaveSuccess ? 1 : 0 }}>
                <Check size={16} /> Modifications enregistrées
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-black">
                  Annuler
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:bg-gray-400"
                >
                  <Save size={16} /> {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add Card */}
      {isAddCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900">Ajouter une carte</h3>
              <button onClick={() => setIsAddCardModalOpen(false)} className="text-gray-400 hover:text-black transition-colors bg-white rounded-full p-1 shadow-sm border border-gray-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCard} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro de carte</label>
                <input 
                  type="text" 
                  required
                  placeholder="0000 0000 0000 0000" 
                  maxLength={16}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b8924a]/50 outline-none font-mono"
                  value={newCard.number}
                  onChange={e => setNewCard({...newCard, number: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date d'expiration</label>
                  <input 
                    type="text" 
                    required
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b8924a]/50 outline-none font-mono"
                    value={newCard.expiry}
                    onChange={e => setNewCard({...newCard, expiry: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">CVC</label>
                  <input 
                    type="text" 
                    required
                    placeholder="123" 
                    maxLength={3}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b8924a]/50 outline-none font-mono"
                    value={newCard.cvc}
                    onChange={e => setNewCard({...newCard, cvc: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3 mt-2 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors">
                Enregistrer la carte
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
