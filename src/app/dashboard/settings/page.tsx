"use client";

import { Save, User, Bell, Shield, CreditCard, Camera, LogOut, Check, CreditCard as CardIcon, Download, Smartphone, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function GlobalSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profil" | "notifications" | "securite" | "facturation">("profil");

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, last4: "4242", expiry: "12/28", type: "Visa", isDefault: true }
  ]);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({ number: "", expiry: "", cvc: "" });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const [invoices] = useState([
    { id: "F-2026-001", date: "15 Sept. 2026", desc: "Formule Gold - Mariage N&A", amount: "45 000 FCFA" },
    { id: "F-2026-002", date: "20 Août 2026", desc: "Invitation Premium 'Floral Gold'", amount: "15 000 FCFA" }
  ]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }, 800);
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
    alert(`Téléchargement de la facture ${id} en cours...`);
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
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white flex items-center justify-center font-serif text-3xl font-bold relative group cursor-pointer overflow-hidden">
                    NA
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={20} className="text-white" />
                    </div>
                  </div>
                </div>
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
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prénom</label>
                      <input type="text" defaultValue="Ndeye" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom</label>
                      <input type="text" defaultValue="Astou" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all shadow-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse Email</label>
                      <input type="email" defaultValue="ndeye.astou@example.com" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all shadow-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Numéro de téléphone</label>
                      <input type="tel" defaultValue="+221 77 000 00 00" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all shadow-sm" />
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
                        <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-[#D4AF37] rounded border-gray-300 focus:ring-[#D4AF37]" />
                        <div>
                          <div className="font-semibold text-sm text-gray-900">Nouvelles inscriptions</div>
                          <div className="text-xs text-gray-500">Recevoir un email lorsqu'un invité confirme sa présence.</div>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-[#D4AF37] rounded border-gray-300 focus:ring-[#D4AF37]" />
                        <div>
                          <div className="font-semibold text-sm text-gray-900">Messages des prestataires</div>
                          <div className="text-xs text-gray-500">Recevoir une alerte pour les nouveaux messages et devis.</div>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" className="mt-1 w-4 h-4 text-[#D4AF37] rounded border-gray-300 focus:ring-[#D4AF37]" />
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
                        <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-[#D4AF37] rounded border-gray-300 focus:ring-[#D4AF37]" />
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
                      <input type="password" placeholder="••••••••" className="w-full md:w-2/3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nouveau mot de passe</label>
                      <input type="password" placeholder="••••••••" className="w-full md:w-2/3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmer le nouveau mot de passe</label>
                      <input type="password" placeholder="••••••••" className="w-full md:w-2/3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none shadow-sm" />
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
                    <button className="px-5 py-2.5 bg-[#F9F5EC] text-[#B8860B] text-sm font-bold rounded-lg hover:bg-[#E8DCC4] transition-colors whitespace-nowrap">
                      Activer 2FA
                    </button>
                  </div>
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
                  <div className="bg-gradient-to-br from-[#1A1A1A] to-black p-6 rounded-xl border border-gray-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-black/20">
                    <div>
                      <div className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-2">Formule Actuelle</div>
                      <h3 className="text-2xl font-serif font-bold mb-1">Gold Premium</h3>
                      <p className="text-gray-400 text-sm">Facturé 45 000 FCFA / événement. Tous les outils débloqués.</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="px-4 py-2 bg-green-500/10 text-green-400 text-sm font-bold rounded-lg border border-green-500/20 whitespace-nowrap flex items-center gap-2">
                        <Check size={14} /> Formule Active
                      </span>
                      <p className="text-[10px] text-gray-500 mt-2">Valide pour cet événement</p>
                      <button className="text-[10px] font-semibold text-[#B8860B] hover:underline mt-1 bg-white/10 px-3 py-1.5 rounded-md mt-3 transition-colors hover:bg-white/20">
                        Changer de formule
                      </button>
                    </div>
                  </div>

                  {/* Moyens de paiement */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Moyens de paiement</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paymentMethods.map((pm) => (
                        <div key={pm.id} className={`border ${pm.isDefault ? 'border-[#D4AF37] bg-[#F9F5EC]' : 'border-gray-200 bg-white'} p-4 rounded-xl flex flex-col relative overflow-hidden group transition-all`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center shadow-sm">
                                <CardIcon size={20} className={pm.isDefault ? "text-[#B8860B]" : "text-gray-400"} />
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
                      ))}
                      
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
                                  <button onClick={() => handleDownloadInvoice(inv.id)} className="text-[#B8860B] hover:text-[#996B00] bg-[#F9F5EC] p-2 rounded-lg transition-colors" title="Télécharger">
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
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none font-mono"
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
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none font-mono"
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
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none font-mono"
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
