"use client";

import { Save, User, Bell, CreditCard, Building2, Link as LinkIcon, Calendar as CalendarIcon, CheckCircle2, Globe, Camera, Briefcase, Music, ImagePlus, X, MapPin } from "lucide-react";
import { useState } from "react";

export default function PrestataireSettingsPage() {
  const [activeTab, setActiveTab] = useState<"vitrine" | "contact" | "facturation" | "notifications" | "integrations">("vitrine");
  const [isSaving, setIsSaving] = useState(false);

  // Fake states to simulate interactivity
  const [integrations, setIntegrations] = useState({
    instagram: false,
    facebook: false,
    linkedin: false,
    tiktok: false,
    gcal: true
  });

  const [notifications, setNotifications] = useState({
    devis: true,
    messages: true,
    paiements: true
  });

  const [gallery, setGallery] = useState([
    "/mock/food1.jpg", 
    "/mock/food2.jpg",
    "/mock/decor1.jpg"
  ]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Paramètres enregistrés avec succès !");
    }, 800);
  };

  const toggleIntegration = (key: keyof typeof integrations) => {
    setIntegrations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const removeImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setGallery([...gallery, ...newImages].slice(0, 10)); // Max 10
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2">Paramètres du Compte</h1>
          <p className="text-gray-500 text-sm">Gérez les informations de votre entreprise et vos préférences.</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-[#B8860B] hover:bg-[#996B00] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-colors disabled:opacity-70">
          <Save size={16} /> {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab("vitrine")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 font-semibold rounded-lg text-sm transition-colors ${activeTab === 'vitrine' ? 'bg-gray-50 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}
            >
              <Building2 size={18} className={activeTab === 'vitrine' ? 'text-[#B8860B]' : ''} /> Ma Vitrine
            </button>
            <button 
              onClick={() => setActiveTab("contact")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 font-semibold rounded-lg text-sm transition-colors ${activeTab === 'contact' ? 'bg-gray-50 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}
            >
              <User size={18} className={activeTab === 'contact' ? 'text-[#B8860B]' : ''} /> Contact principal
            </button>
            <button 
              onClick={() => setActiveTab("facturation")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 font-semibold rounded-lg text-sm transition-colors ${activeTab === 'facturation' ? 'bg-gray-50 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}
            >
              <CreditCard size={18} className={activeTab === 'facturation' ? 'text-[#B8860B]' : ''} /> Facturation & RIB
            </button>
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 font-semibold rounded-lg text-sm transition-colors ${activeTab === 'notifications' ? 'bg-gray-50 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}
            >
              <Bell size={18} className={activeTab === 'notifications' ? 'text-[#B8860B]' : ''} /> Notifications
            </button>
            <button 
              onClick={() => setActiveTab("integrations")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 font-semibold rounded-lg text-sm transition-colors ${activeTab === 'integrations' ? 'bg-gray-50 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}
            >
              <LinkIcon size={18} className={activeTab === 'integrations' ? 'text-[#B8860B]' : ''} /> Intégrations
            </button>
          </nav>
        </div>

        {/* Form Content */}
        <div className="flex-1 space-y-6">
          
          {/* TAB: VITRINE */}
          {activeTab === "vitrine" && (
            <>
              {/* Informations Générales */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Identité de l'entreprise</h2>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center font-serif font-bold text-3xl text-[#B8860B] border border-gray-200 shadow-sm overflow-hidden transition-colors hover:border-[#D4AF37]">
                      SA
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Modifier</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Logo de l'entreprise</h3>
                    <p className="text-xs text-gray-500 mb-3 max-w-sm">Ce logo apparaîtra sur votre fiche dans l'annuaire. Format recommandé : 512x512px.</p>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                      Importer un logo
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'entreprise</label>
                    <input type="text" defaultValue="Saveurs d'Afrique" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie principale</label>
                      <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]">
                        <option value="traiteur">Traiteur & Restauration</option>
                        <option value="photo">Photographie & Vidéo</option>
                        <option value="deco">Décoration & Fleurs</option>
                        <option value="dj">Animation & DJ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">NINEA / SIRET</label>
                      <input type="text" defaultValue="123456789" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description de la vitrine (À propos)</label>
                    <textarea rows={4} defaultValue="Service traiteur haut de gamme spécialisé dans la gastronomie africaine et internationale. Nous sublimons vos réceptions avec des mets raffinés." className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tarif de base (À partir de)</label>
                    <input type="text" defaultValue="15 000 FCFA / personne" placeholder="Ex: 50 000 FCFA ou Sur devis" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                  </div>
                </div>
              </div>

              {/* Localisation & Coordonnées */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Zone d'intervention & Coordonnées</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1"><MapPin size={14}/> Pays</label>
                    <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]">
                      <option value="Sénégal">Sénégal</option>
                      <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                      <option value="France">France</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1"><MapPin size={14}/> Région</label>
                    <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]">
                      <option value="Dakar">Dakar</option>
                      <option value="Thiès">Thiès</option>
                      <option value="Saint-Louis">Saint-Louis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1"><MapPin size={14}/> Ville</label>
                    <input type="text" defaultValue="Dakar (Point E)" placeholder="Ex: Saly" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone public (affiché aux clients)</label>
                    <input type="tel" defaultValue="+221 77 111 22 33" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email de contact public</label>
                    <input type="email" defaultValue="contact@saveursdafrique.sn" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                  </div>
                </div>
              </div>

              {/* Galerie / Réalisations */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Galerie & Réalisations</h2>
                    <p className="text-gray-500 text-sm">Ajoutez des photos de votre travail pour séduire de futurs clients.</p>
                  </div>
                  <label className="flex items-center gap-2 bg-[#F9F5EC] hover:bg-[#E8DCC4] text-[#B8860B] px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer">
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    <ImagePlus size={16} /> Ajouter une photo
                  </label>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {gallery.map((img, idx) => (
                    <div key={idx} className="aspect-square bg-gray-100 rounded-xl relative group overflow-hidden border border-gray-200 bg-cover bg-center" style={{ backgroundImage: img.startsWith('blob:') ? `url(${img})` : 'none' }}>
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        {!img.startsWith('blob:') && <Camera className="text-gray-300" size={24} />}
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => removeImage(idx)} className="bg-white/20 hover:bg-red-500/80 backdrop-blur-sm text-white p-2 rounded-full transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Upload button box */}
                  <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#D4AF37] hover:bg-gray-100 transition-colors rounded-xl flex flex-col items-center justify-center group outline-none cursor-pointer">
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    <ImagePlus size={24} className="text-gray-400 group-hover:text-[#B8860B] mb-2" />
                    <span className="text-xs font-medium text-gray-500 group-hover:text-[#B8860B]">Parcourir</span>
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-4">Formats acceptés : JPG, PNG, WEBP. Jusqu'à 10 photos.</p>
              </div>
            </>
          )}

          {/* TAB: CONTACT PRINCIPAL */}
          {activeTab === "contact" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Contact principal</h2>
              <p className="text-gray-500 text-sm mb-6">La personne à contacter pour les négociations et la planification.</p>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                    <input type="text" defaultValue="Amadou" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                    <input type="text" defaultValue="Fall" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Poste occupé</label>
                    <input type="text" defaultValue="Gérant & Chef de Projet" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone direct</label>
                    <input type="tel" defaultValue="+221 77 999 88 77" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email direct</label>
                    <input type="email" defaultValue="amadou.fall@saveursdafrique.sn" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FACTURATION */}
          {activeTab === "facturation" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Facturation & RIB</h2>
              <p className="text-gray-500 text-sm mb-6">Paramétrez vos informations bancaires pour recevoir vos paiements.</p>

              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Coordonnées Bancaires (RIB)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Titulaire du compte</label>
                      <input type="text" defaultValue="SARL Saveurs d'Afrique" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de la Banque</label>
                      <input type="text" defaultValue="Ecobank Sénégal" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Code BIC / SWIFT</label>
                      <input type="text" defaultValue="ECOCSNSN" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">IBAN</label>
                      <input type="text" defaultValue="SN08 0000 0000 0000 0000 0000" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-mono" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Paiements Mobile Money</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro Wave</label>
                      <input type="tel" defaultValue="+221 76 000 00 00" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro Orange Money</label>
                      <input type="tel" defaultValue="+221 77 000 00 00" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Préférences de Notifications</h2>
              <p className="text-gray-500 text-sm mb-6">Contrôlez les alertes que vous recevez pour ne rien manquer d'important.</p>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-5">
                  <label className="flex items-start gap-4 cursor-pointer" onClick={() => toggleNotification('devis')}>
                    <input type="checkbox" checked={notifications.devis} readOnly className="mt-1 w-4 h-4 text-[#D4AF37] rounded border-gray-300 focus:ring-[#D4AF37]" />
                    <div>
                      <div className="font-semibold text-sm text-gray-900">Nouvelles demandes de devis</div>
                      <div className="text-xs text-gray-500 mt-1">Être alerté dès qu'un organisateur vous contacte via le catalogue.</div>
                    </div>
                  </label>
                  
                  <div className="h-px bg-gray-200 w-full"></div>

                  <label className="flex items-start gap-4 cursor-pointer" onClick={() => toggleNotification('messages')}>
                    <input type="checkbox" checked={notifications.messages} readOnly className="mt-1 w-4 h-4 text-[#D4AF37] rounded border-gray-300 focus:ring-[#D4AF37]" />
                    <div>
                      <div className="font-semibold text-sm text-gray-900">Nouveaux messages</div>
                      <div className="text-xs text-gray-500 mt-1">Être prévenu lors de la réception d'un message sur l'Espace Chat.</div>
                    </div>
                  </label>

                  <div className="h-px bg-gray-200 w-full"></div>

                  <label className="flex items-start gap-4 cursor-pointer" onClick={() => toggleNotification('paiements')}>
                    <input type="checkbox" checked={notifications.paiements} readOnly className="mt-1 w-4 h-4 text-[#D4AF37] rounded border-gray-300 focus:ring-[#D4AF37]" />
                    <div>
                      <div className="font-semibold text-sm text-gray-900">Confirmation de paiement / Acompte</div>
                      <div className="text-xs text-gray-500 mt-1">Recevoir une notification lorsque l'organisateur effectue un paiement pour vos services.</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: INTEGRATIONS */}
          {activeTab === "integrations" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Intégrations & Réseaux</h2>
              <p className="text-gray-500 text-sm mb-6">Connectez vos réseaux sociaux et vos outils externes pour enrichir votre fiche prestataire.</p>

              <div className="space-y-4">
                {[
                  { id: 'instagram', name: 'Instagram', desc: 'Affichez vos dernières réalisations', icon: Camera, color: 'text-pink-600', bg: 'bg-pink-100' },
                  { id: 'facebook', name: 'Facebook', desc: 'Liez votre page professionnelle', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-100' },
                  { id: 'linkedin', name: 'LinkedIn', desc: 'Mettez en avant votre réseau B2B', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-100' },
                  { id: 'tiktok', name: 'TikTok', desc: "Montrez l'envers du décor en vidéo", icon: Music, color: 'text-gray-900', bg: 'bg-gray-200' },
                ].map((social) => {
                  const isConnected = integrations[social.id as keyof typeof integrations];
                  return (
                    <div key={social.id} className={`flex flex-col md:flex-row items-center justify-between p-4 border rounded-xl transition-colors ${isConnected ? 'border-[#D4AF37]/30 bg-[#F9F5EC]' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className={`w-10 h-10 rounded-lg ${isConnected ? 'bg-white text-[#B8860B] shadow-sm' : `${social.bg} ${social.color}`} flex items-center justify-center`}>
                          <social.icon size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900">{social.name}</h4>
                          <p className="text-xs text-gray-500">{social.desc}</p>
                        </div>
                      </div>
                      {isConnected ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-green-600 flex items-center gap-1"><CheckCircle2 size={14}/> Connecté</span>
                          <button onClick={() => toggleIntegration(social.id as any)} className="px-3 py-1.5 text-gray-500 text-xs font-semibold hover:text-red-500 transition-colors">
                            Déconnecter
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => toggleIntegration(social.id as any)} className="w-full md:w-auto px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                          Connecter
                        </button>
                      )}
                    </div>
                  );
                })}

                <div className={`flex flex-col md:flex-row items-center justify-between p-4 border rounded-xl transition-colors ${integrations.gcal ? 'border-[#D4AF37]/30 bg-[#F9F5EC]' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className={`w-10 h-10 rounded-lg ${integrations.gcal ? 'bg-white text-[#B8860B] shadow-sm' : 'bg-gray-200 text-gray-600'} flex items-center justify-center`}>
                      <CalendarIcon size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">Google Calendar</h4>
                      <p className="text-xs text-gray-500">Synchronisé avec votre planning Evenium</p>
                    </div>
                  </div>
                  {integrations.gcal ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-green-600 flex items-center gap-1"><CheckCircle2 size={14}/> Connecté</span>
                      <button onClick={() => toggleIntegration('gcal')} className="px-3 py-1.5 text-gray-500 text-xs font-semibold hover:text-red-500 transition-colors">
                        Déconnecter
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => toggleIntegration('gcal')} className="w-full md:w-auto px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                      Connecter
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
