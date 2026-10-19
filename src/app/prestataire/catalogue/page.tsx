"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, LayoutList, X, CheckCircle, ChevronRight, ChevronLeft, MapPin, Users, Clock, Save, Eye, UploadCloud, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const CATEGORIES = ["Traiteur", "Photographe", "Vidéaste", "DJ", "Décorateur", "Salle", "Fleuriste", "Maquilleur", "Tous événements"];
const PRICE_TYPES = ["Prix fixe", "À partir de", "Par personne", "Par table", "Par prestation", "Forfait", "Sur devis"];
const ZONES = ["Dakar", "Almadies", "Mermoz", "Sacré-Cœur", "Diamniadio", "Saly", "Somone", "Plateau", "Ngor", "Point E"];

export default function PrestataireCataloguePage() {
  const [offres, setOffres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modes: 'list' | 'create' | 'edit'
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [step, setStep] = useState(1);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  
  const [newOffer, setNewOffer] = useState({ 
    title: "", category: "Tous événements", price: "", priceType: "À partir de", 
    description: "",
    included: [] as string[],
    options: [] as {name: string, price: string}[],
    practicalInfos: {} as any,
    zones: [] as string[],
    imageFile: null as File | null, imagePreview: "",
    galleryFiles: [] as File[], galleryPreviews: [] as string[],
    status: "Brouillon"
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false });
      
    if (data) {
      setOffres(data.map(s => ({
        id: s.id,
        title: s.nom_service,
        description: s.description || "",
        price: s.prix_base ? `${s.prix_base}` : "",
        priceType: s.type_prix || "Prix fixe",
        category: s.categorie || "Tous événements",
        status: s.status || "Publié",
        image: s.image_url,
        gallery: s.gallery || [],
        included: s.inclus || [],
        options: s.options || [],
        practicalInfos: s.infos_pratiques || {},
        zones: s.zones || []
      })));
    }
    setIsLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setNewOffer(prev => ({ ...prev, imageFile: file, imagePreview: imageUrl }));
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const urls = files.map(f => URL.createObjectURL(f));
      setNewOffer(prev => ({ 
        ...prev, 
        galleryFiles: [...prev.galleryFiles, ...files],
        galleryPreviews: [...prev.galleryPreviews, ...urls]
      }));
    }
  };

  const openCreateModal = () => {
    setNewOffer({
      title: "", category: "Tous événements", price: "", priceType: "À partir de", description: "",
      included: [], options: [], practicalInfos: {}, zones: [],
      imageFile: null, imagePreview: "", galleryFiles: [], galleryPreviews: [], status: "Brouillon"
    });
    setMode('create');
    setStep(1);
  };

  const openEditModal = (offer: any) => {
    setEditingOfferId(offer.id);
    setNewOffer({
      title: offer.title, category: offer.category, price: offer.price, priceType: offer.priceType, description: offer.description,
      included: offer.included || [], options: offer.options || [], practicalInfos: offer.practicalInfos || {}, zones: offer.zones || [],
      imageFile: null, imagePreview: offer.image || "",
      galleryFiles: [], galleryPreviews: offer.gallery || [],
      status: offer.status
    });
    setMode('edit');
    setStep(1);
  };

  const uploadFileToSupabase = async (file: File, pathPrefix: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${pathPrefix}-${Math.random()}.${fileExt}`;
    const filePath = `services/${fileName}`;
    
    const { error } = await supabase.storage.from('evenium_assets').upload(filePath, file);
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from('evenium_assets').getPublicUrl(filePath);
    return publicUrl;
  };

  const handleSave = async (status: 'Brouillon' | 'Publié') => {
    if (!newOffer.title) {
      alert("Le nom de l'offre est obligatoire.");
      return;
    }
    
    setIsUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsUploading(false);
      return;
    }

    try {
      let finalImageUrl = newOffer.imagePreview && !newOffer.imagePreview.startsWith('blob:') ? newOffer.imagePreview : null;
      if (newOffer.imageFile) {
        finalImageUrl = await uploadFileToSupabase(newOffer.imageFile, 'cover');
      }

      const galleryUrls = newOffer.galleryPreviews.filter(url => !url.startsWith('blob:'));
      for (const file of newOffer.galleryFiles) {
        const url = await uploadFileToSupabase(file, 'gallery');
        galleryUrls.push(url);
      }

      const payload = {
        profile_id: user.id,
        categorie: newOffer.category,
        nom_service: newOffer.title,
        prix_base: parseInt(newOffer.price) || null,
        description: newOffer.description,
        image_url: finalImageUrl,
        gallery: galleryUrls,
        status: status,
        type_prix: newOffer.priceType,
        inclus: newOffer.included,
        options: newOffer.options,
        infos_pratiques: newOffer.practicalInfos,
        zones: newOffer.zones
      };

      let error;
      if (mode === 'edit' && editingOfferId) {
        const res = await supabase.from('services').update(payload).eq('id', editingOfferId);
        error = res.error;
      } else {
        const res = await supabase.from('services').insert([payload]);
        error = res.error;
      }
      
      if (error) {
        throw new Error(error.message);
      }
      
      await fetchServices();
      setMode('list');
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de l'enregistrement. Vérifiez que la base de données est à jour. Détails : " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteOffer = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (!error) {
        setOffres(offres.filter(o => o.id !== id));
      } else {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const toggleStatus = async (offer: any) => {
    const newStatus = offer.status === 'Publié' ? 'Désactivé' : 'Publié';
    setOffres(offres.map(o => o.id === offer.id ? { ...o, status: newStatus } : o));
    await supabase.from('services').update({ status: newStatus }).eq('id', offer.id);
  };

  const addIncludedItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      e.preventDefault();
      setNewOffer({...newOffer, included: [...newOffer.included, e.currentTarget.value.trim()]});
      e.currentTarget.value = '';
    }
  };

  const addOptionItem = (name: string, price: string) => {
    if (name.trim() !== '') {
      setNewOffer({...newOffer, options: [...newOffer.options, {name: name.trim(), price: price.trim()}]});
    }
  };

  const toggleZone = (zone: string) => {
    if (newOffer.zones.includes(zone)) {
      setNewOffer({...newOffer, zones: newOffer.zones.filter(z => z !== zone)});
    } else {
      setNewOffer({...newOffer, zones: [...newOffer.zones, zone]});
    }
  };

  // ---------------------------------------------------------
  // RENDER: EDITOR PREVIEW
  // ---------------------------------------------------------
  const renderPreview = () => (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden sticky top-6 max-h-[90vh] overflow-y-auto flex flex-col">
      <div className="relative h-64 bg-gray-100 shrink-0">
        {newOffer.imagePreview ? (
          <img src={newOffer.imagePreview} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
            <ImageIcon size={48} />
            <span className="text-sm">Image de couverture</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-6 left-6 text-white pr-6">
          <span className="bg-[#b8924a] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm mb-3 inline-block">
            {newOffer.category}
          </span>
          <h2 className="font-serif text-3xl font-bold mb-1 leading-tight">{newOffer.title || "Nom de l'offre"}</h2>
          <p className="text-[#b8924a] font-semibold text-lg">{newOffer.priceType} {newOffer.price ? `${Number(newOffer.price).toLocaleString('fr-FR')} FCFA` : "--- FCFA"}</p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {newOffer.description && (
          <div>
            <p className="text-gray-600 leading-relaxed text-sm">{newOffer.description}</p>
          </div>
        )}

        {newOffer.included.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Ce qui est inclus</h3>
            <ul className="space-y-3">
              {newOffer.included.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle size={18} className="text-[#b8924a] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {newOffer.options.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Options supplémentaires</h3>
            <ul className="space-y-3">
              {newOffer.options.map((opt, i) => (
                <li key={i} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="font-medium text-gray-800">{opt.name}</span>
                  <span className="font-semibold text-[#b8924a]">{opt.price ? `+ ${Number(opt.price).toLocaleString('fr-FR')} FCFA` : 'Sur devis'}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(Object.keys(newOffer.practicalInfos).length > 0 || newOffer.zones.length > 0) && (
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Informations pratiques</h3>
            <div className="grid grid-cols-2 gap-4">
              {newOffer.zones.length > 0 && (
                <div className="flex items-center gap-3 bg-[#f5eee1] p-3 rounded-xl">
                  <MapPin size={20} className="text-[#8f6f33]" />
                  <div>
                    <p className="text-[10px] text-[#8f6f33] uppercase tracking-wider font-bold">Zones</p>
                    <p className="text-sm font-medium text-gray-900">{newOffer.zones.length} zone(s)</p>
                  </div>
                </div>
              )}
              {newOffer.practicalInfos.capacite && (
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Users size={20} className="text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Capacité</p>
                    <p className="text-sm font-medium text-gray-900">{newOffer.practicalInfos.capacite}</p>
                  </div>
                </div>
              )}
              {newOffer.practicalInfos.duree && (
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Clock size={20} className="text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Durée</p>
                    <p className="text-sm font-medium text-gray-900">{newOffer.practicalInfos.duree}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {newOffer.galleryPreviews.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Aperçus de l'offre</h3>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 snap-x">
              {newOffer.galleryPreviews.map((url, i) => (
                <img key={i} src={url} className="h-20 w-20 rounded-xl object-cover snap-start shrink-0 border border-gray-200" alt={`preview ${i}`} />
              ))}
            </div>
          </div>
        )}

        <div className="pt-4">
          <button className="w-full py-4 bg-black text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all" disabled>
            Demander un devis
          </button>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // RENDER: EDITOR FORM
  // ---------------------------------------------------------
  const renderEditor = () => (
    <div className="max-w-7xl mx-auto w-full p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={() => setMode('list')} className="text-gray-400 hover:text-black flex items-center gap-2 text-sm font-medium transition-colors mb-2">
            <ArrowLeft size={16} /> Retour à mes catalogues
          </button>
          <h1 className="font-serif text-3xl font-bold text-black">{mode === 'create' ? "Créer un catalogue" : "Modifier le catalogue"}</h1>
        </div>
        <div className="flex gap-3">
          <button 
            disabled={isUploading}
            onClick={() => handleSave('Brouillon')}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            <Save size={18} /> Enregistrer le brouillon
          </button>
          <button 
            disabled={isUploading}
            onClick={() => handleSave('Publié')}
            className="px-6 py-2.5 bg-[#b8924a] hover:bg-[#8f6f33] text-white font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isUploading ? 'Enregistrement...' : <><Eye size={18} /> Publier</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Formulaire GAUCHE */}
        <div className="space-y-8 pb-32">
          {/* STEP 1: Infos Générales */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">1</span>
              Informations générales
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'offre *</label>
                <input 
                  type="text" 
                  value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#b8924a] focus:ring-1 focus:ring-[#b8924a] transition-all bg-gray-50 focus:bg-white" 
                  placeholder="Ex: Pack Mariage Élégance"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie</label>
                  <select 
                    value={newOffer.category} onChange={e => setNewOffer({...newOffer, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de prix</label>
                  <select 
                    value={newOffer.priceType} onChange={e => setNewOffer({...newOffer, priceType: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
                  >
                    {PRICE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix (en FCFA)</label>
                <input 
                  type="number" 
                  value={newOffer.price} onChange={e => setNewOffer({...newOffer, price: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" 
                  placeholder="Ex: 250000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Courte description</label>
                <textarea 
                  rows={3}
                  value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 resize-none" 
                  placeholder="Une formule complète pour..."
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Inclus */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">2</span>
              Ce qui est inclus
            </h2>
            <div className="space-y-3">
              {newOffer.included.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">{item}</span>
                  <button onClick={() => setNewOffer({...newOffer, included: newOffer.included.filter((_, i) => i !== idx)})} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ))}
              <div>
                <input 
                  type="text" 
                  onKeyDown={addIncludedItem}
                  className="w-full px-4 py-3 rounded-xl border border-dashed border-gray-300 focus:border-[#b8924a] focus:ring-1 focus:ring-[#b8924a] transition-all bg-transparent" 
                  placeholder="+ Ajouter un élément (Appuyez sur Entrée)"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: Options */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">3</span>
              Options supplémentaires
            </h2>
            <div className="space-y-3 mb-4">
              {newOffer.options.map((opt, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#f5eee1] px-4 py-3 rounded-xl border border-[#e4d8c4]">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{opt.name}</p>
                    {opt.price && <p className="text-xs text-[#8f6f33] font-medium">+ {opt.price} FCFA</p>}
                  </div>
                  <button onClick={() => setNewOffer({...newOffer, options: newOffer.options.filter((_, i) => i !== idx)})} className="text-[#8f6f33] hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <form onSubmit={e => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const name = (form.elements.namedItem('optName') as HTMLInputElement).value;
              const price = (form.elements.namedItem('optPrice') as HTMLInputElement).value;
              addOptionItem(name, price);
              form.reset();
            }} className="flex gap-2">
              <input name="optName" type="text" placeholder="Nom de l'option (ex: Cocktail)" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" required />
              <input name="optPrice" type="number" placeholder="Prix" className="w-32 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" />
              <button type="submit" className="bg-black text-white px-4 py-3 rounded-xl font-semibold"><Plus size={18}/></button>
            </form>
          </div>

          {/* STEP 4: Infos pratiques */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">4</span>
              Informations pratiques
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Capacité (personnes)</label>
                <input 
                  type="text" 
                  value={newOffer.practicalInfos.capacite || ""} onChange={e => setNewOffer({...newOffer, practicalInfos: {...newOffer.practicalInfos, capacite: e.target.value}})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" 
                  placeholder="Ex: 100 - 150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Durée</label>
                <input 
                  type="text" 
                  value={newOffer.practicalInfos.duree || ""} onChange={e => setNewOffer({...newOffer, practicalInfos: {...newOffer.practicalInfos, duree: e.target.value}})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" 
                  placeholder="Ex: 8 heures"
                />
              </div>
            </div>
          </div>

          {/* STEP 5: Images */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">5</span>
              Images du catalogue
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">Image de couverture principale</label>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#b8924a] transition-all relative overflow-hidden group">
                {newOffer.imagePreview ? (
                  <>
                    <img src={newOffer.imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-semibold text-sm flex items-center gap-2"><Edit2 size={16}/> Remplacer</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 group-hover:text-[#8f6f33]">
                    <UploadCloud size={32} className="mb-3" />
                    <p className="mb-1 text-sm font-semibold">Cliquez pour ajouter une image</p>
                    <p className="text-xs">PNG, JPG, WEBP jusqu'à 5MB</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Galerie de l'offre (Optionnel)</label>
              <p className="text-xs text-gray-500 mb-3">Quelques photos spécifiques à cette offre.</p>
              <div className="grid grid-cols-4 gap-3">
                {newOffer.galleryPreviews.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                    <button onClick={() => setNewOffer(p => ({...p, galleryPreviews: p.galleryPreviews.filter((_, i) => i !== idx), galleryFiles: p.galleryFiles.filter((_, i) => i !== idx)}))} className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all">
                      <X size={12}/>
                    </button>
                  </div>
                ))}
                <label className="flex items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#b8924a] text-gray-400 hover:text-[#8f6f33] transition-all">
                  <Plus size={24} />
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} />
                </label>
              </div>
            </div>
          </div>

          {/* STEP 6: Zones */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">6</span>
              Zones d'intervention
            </h2>
            <div className="flex flex-wrap gap-2">
              {ZONES.map(z => (
                <button 
                  key={z} 
                  onClick={() => toggleZone(z)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${newOffer.zones.includes(z) ? 'bg-[#b8924a] border-[#b8924a] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:border-[#b8924a]/50'}`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* APERÇU DROITE */}
        <div className="hidden lg:block relative">
          {renderPreview()}
        </div>
      </div>
    </div>
  );

  const duplicateOffer = async (offer: any) => {
    if (confirm("Voulez-vous dupliquer ce catalogue ?")) {
      setIsUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsUploading(false);
        return;
      }
      
      const payload = {
        profile_id: user.id,
        categorie: offer.category,
        nom_service: `${offer.title} (Copie)`,
        prix_base: parseInt(offer.price) || null,
        description: offer.description,
        image_url: offer.image,
        gallery: offer.gallery,
        status: 'Brouillon',
        type_prix: offer.priceType,
        inclus: offer.included,
        options: offer.options,
        infos_pratiques: offer.practicalInfos,
        zones: offer.zones
      };
      
      await supabase.from('services').insert([payload]);
      await fetchServices();
      setIsUploading(false);
    }
  };

  // ---------------------------------------------------------
  // RENDER: LIST (DASHBOARD)
  // ---------------------------------------------------------
  const renderList = () => (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold text-black mb-2">Mes Catalogues</h1>
          <p className="text-gray-500 text-sm">Gérez vos offres commerciales et ce qu'elles incluent.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={20} /> Créer un catalogue
        </button>
      </div>

      {offres.length === 0 && !isLoading ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6 border border-gray-100">
            <LayoutList size={40} />
          </div>
          <h3 className="font-serif text-3xl font-bold text-gray-900 mb-3">Aucun catalogue</h3>
          <p className="text-gray-500 text-sm max-w-md mb-8 leading-relaxed">
            Créez des catalogues élégants pour présenter vos offres. Indiquez vos prix, ce qui est inclus et vos options.
          </p>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#b8924a] hover:bg-[#8f6f33] text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all"
          >
            Créer ma première offre
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offres.map((offre) => (
            <div key={offre.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all shadow-sm group flex flex-col">
              <div className="h-56 bg-gray-100 relative overflow-hidden">
                {offre.image ? (
                  <img src={offre.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={offre.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon size={40} className="text-gray-300" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                
                <div className="absolute top-4 left-4 flex gap-2 z-10">
                  <span className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg shadow-md flex items-center gap-1 ${
                    offre.status === 'Publié' ? 'bg-[#b8924a] text-white' : 
                    offre.status === 'Brouillon' ? 'bg-gray-800 text-gray-200' : 'bg-red-500 text-white'
                  }`}>
                    {offre.status === 'Publié' && <CheckCircle size={12}/>}
                    {offre.status}
                  </span>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <p className="text-[#b8924a] font-semibold text-sm mb-1">{offre.priceType} {offre.price ? `${Number(offre.price).toLocaleString('fr-FR')} FCFA` : "Sur devis"}</p>
                  <h3 className="font-bold text-xl text-white line-clamp-1">{offre.title}</h3>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1 leading-relaxed">
                  {offre.description}
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button onClick={() => openEditModal(offre)} className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold rounded-xl border border-gray-200 transition-colors text-sm">
                    <Edit2 size={16} /> Modifier
                  </button>
                  <button onClick={() => toggleStatus(offre)} className={`flex items-center justify-center gap-2 py-2.5 font-semibold rounded-xl border transition-colors text-sm ${offre.status === 'Publié' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'}`}>
                    {offre.status === 'Publié' ? <><X size={16} /> Masquer</> : <><CheckCircle size={16} /> Publier</>}
                  </button>
                  <button onClick={() => duplicateOffer(offre)} className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold rounded-xl border border-gray-200 transition-colors text-sm">
                    <Plus size={16} /> Dupliquer le catalogue
                  </button>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button onClick={() => deleteOffer(offre.id)} className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-1">
                    <Trash2 size={14} /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (isLoading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-[#b8924a] border-t-transparent rounded-full animate-spin"></div></div>;

  return mode === 'list' ? renderList() : renderEditor();
}
