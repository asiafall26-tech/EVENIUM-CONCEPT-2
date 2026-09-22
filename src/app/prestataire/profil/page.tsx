"use client";

import { Camera, Save, Plus, X, ImagePlus } from "lucide-react";
import { useState } from "react";

export default function PrestataireProfilPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [gallery, setGallery] = useState([
    "/mock/food1.jpg", 
    "/mock/food2.jpg",
    "/mock/decor1.jpg"
  ]);

  const [services, setServices] = useState([
    "Couverture complète de l'événement",
    "Album photo premium"
  ]);
  const [newService, setNewService] = useState("");

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Votre vitrine a été mise à jour avec succès !");
    }, 800);
  };

  const addService = () => {
    if (newService.trim()) {
      setServices([...services, newService]);
      setNewService("");
    }
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
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
    <div className="p-8 max-w-5xl mx-auto w-full pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-1">Ma Vitrine</h1>
          <p className="text-gray-500 text-sm">Gérez les informations publiques visibles par les organisateurs.</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-[#B8860B] text-white px-5 py-2.5 rounded-lg font-bold shadow-md shadow-[#B8860B]/20 hover:bg-[#996B00] transition-colors disabled:opacity-70">
          <Save size={18} /> {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Informations Générales */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="font-bold text-xl text-gray-900 mb-6">Informations Générales</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'entreprise</label>
                <input type="text" defaultValue="Studio Lumière" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all">
                    <option>Photographes</option>
                    <option>Traiteurs</option>
                    <option>Décorateurs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Zone d'intervention</label>
                  <input type="text" defaultValue="Dakar et alentours" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description détaillée</label>
                <textarea rows={5} defaultValue="Spécialiste de la photographie de mariage haut de gamme avec une approche éditoriale et lumineuse. Nous immortalisons vos moments avec élégance." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none resize-none transition-all"></textarea>
              </div>
            </div>
          </div>

          {/* Services & Tarifs */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="font-bold text-xl text-gray-900 mb-6">Services Inclus</h2>
            
            <div className="space-y-3 mb-4">
              {services.map((service, index) => (
                <div key={index} className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700">
                  <span className="flex-1">{service}</span>
                  <button onClick={() => removeService(index)} className="p-1.5 text-gray-400 hover:text-red-500 bg-white rounded-md transition-colors shadow-sm"><X size={16} /></button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 items-center mb-8">
               <input 
                 type="text" 
                 placeholder="Ajouter un service..." 
                 className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none"
                 value={newService}
                 onChange={e => setNewService(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && addService()}
               />
               <button onClick={addService} className="flex items-center gap-2 bg-[#F9F5EC] hover:bg-[#E8DCC4] text-[#B8860B] px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
                 <Plus size={16} /> Ajouter
               </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Indication tarifaire globale</label>
              <input type="text" defaultValue="Sur devis (à partir de 150 000 FCFA)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all text-sm" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Logo / Avatar */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <label className="w-28 h-28 bg-gray-50 rounded-full mb-4 flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 hover:bg-gray-100 hover:border-[#D4AF37] hover:text-[#B8860B] cursor-pointer transition-colors relative group overflow-hidden">
               <input type="file" accept="image/*" className="hidden" />
               <Camera size={32} className="group-hover:scale-110 transition-transform" />
            </label>
            <h3 className="font-bold text-gray-900 mb-1">Logo de l'entreprise</h3>
            <p className="text-xs text-gray-500">Format carré recommandé. JPG ou PNG (Max 2MB).</p>
          </div>

          {/* Galerie Photo */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl text-gray-900">Galerie</h2>
              <span className="text-xs font-semibold text-[#B8860B] bg-[#F9F5EC] px-2.5 py-1 rounded-md">{gallery.length} / 10</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {gallery.map((img, idx) => (
                <div key={idx} className="aspect-square bg-gray-100 rounded-xl border border-gray-200 relative group overflow-hidden flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: img.startsWith('blob:') ? `url(${img})` : 'none' }}>
                  {!img.startsWith('blob:') && <ImagePlus size={24} className="text-gray-300" />}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => removeImage(idx)} className="bg-white/20 hover:bg-red-500 text-white p-2 rounded-full transition-colors backdrop-blur-sm">
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
              
              {gallery.length < 10 && (
                <label className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#B8860B] hover:border-[#D4AF37] transition-all cursor-pointer">
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  <Plus size={24} className="mb-1" />
                  <span className="text-xs font-semibold">Ajouter</span>
                </label>
              )}
            </div>
          </div>
          
          {/* Coordonnées */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
             <h2 className="font-bold text-xl text-gray-900 mb-6">Contacts Publics</h2>
             <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                <input type="text" defaultValue="+221 77 123 45 67" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp</label>
                <input type="text" defaultValue="+221 77 123 45 67" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/50" />
              </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
