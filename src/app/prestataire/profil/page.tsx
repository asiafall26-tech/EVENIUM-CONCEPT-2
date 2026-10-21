"use client";

import { User, Store, Mail, Phone, MapPin, Edit2, Save, X, Briefcase, Camera, Image as ImageIcon, ArrowLeft, Crop } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ActivityFields } from "@/components/prestataire/ActivityFields";
import { EMPTY_ACTIVITY, activityFromProfile, missingActivity, providerHeadline, saveActivity, type ProviderActivity } from "@/lib/providerProfile";
import { locationLabel } from "@/lib/zones";
import { useImageEditor } from "@/components/media/ImageEditorModal";
import { RubriquesEditor } from "@/components/prestataire/RubriquesEditor";
import { RubriquesView } from "@/components/prestataire/RubriquesView";
import { parseRubriques, suggestProfileRubriques, type Rubrique } from "@/lib/rubriques";
import { isMissingColumn } from "@/lib/devis/persist";

export default function PrestataireProfilPage() {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ 
    full_name: "", email: "", phone: "", address: "", category: "",
    description: "", website: "", instagram: "", experience: "", 
    is_active: true, gallery: [] as string[], cover_url: ""
  });
  const [activity, setActivity] = useState<ProviderActivity>(EMPTY_ACTIVITY);
  const [showActivityErrors, setShowActivityErrors] = useState(false);
  const [rubriques, setRubriques] = useState<Rubrique[]>([]);
  const { editImage, editorElement } = useImageEditor();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    
    if (data) {
      setProfile(data);
      setActivity(activityFromProfile({ ...data, user_metadata: user.user_metadata }));
      setRubriques(parseRubriques(data.rubriques));
      setFormData({
        full_name: data.full_name || "",
        email: data.email || user.email || "",
        phone: data.phone || "",
        address: data.address || "",
        category: data.category || "",
        description: data.description || "",
        website: data.website || "",
        instagram: data.instagram || "",
        experience: data.experience || "",
        is_active: data.is_active !== false,
        gallery: data.gallery || [],
        cover_url: data.cover_url || ""
      });
    } else {
      // Handle case where profile fails to load due to missing columns or RLS
      const fallbackProfile = { id: user.id, email: user.email, full_name: "Mon Profil" };
      setProfile(fallbackProfile);
      setFormData({
        full_name: fallbackProfile.full_name,
        email: fallbackProfile.email || "",
        phone: "", address: "", category: "", description: "", website: "", instagram: "", experience: "",
        is_active: true, gallery: [], cover_url: ""
      });
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked || !profile) return;
    const file = await editImage(picked, { aspect: 1, title: "Photo de profil" });
    if (!file) return;
    
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar-${profile.id}-${Math.random()}.${fileExt}`;
    
    // Ensure bucket exists in supabase: evenium_assets
    const { data, error } = await supabase.storage.from('evenium_assets').upload(fileName, file);
    
    if (error) {
      alert("Erreur d'upload : " + error.message);
      setUploadingImage(false);
      return;
    }
    
    const { data: publicUrlData } = supabase.storage.from('evenium_assets').getPublicUrl(fileName);
    const newAvatarUrl = publicUrlData.publicUrl;
    
    // Mettre à jour la base de données immédiatement avec la nouvelle photo
    await supabase.from('profiles').update({ avatar_url: newAvatarUrl }).eq('id', profile.id);
    
    // Mettre à jour l'interface
    setProfile({ ...profile, avatar_url: newAvatarUrl });
    setUploadingImage(false);
    
    // Mettre à jour les metadata de l'utilisateur pour la cohérence globale
    await supabase.auth.updateUser({ data: { avatar_url: newAvatarUrl } });
    router.refresh();
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked || !profile) return;
    const file = await editImage(picked, { aspect: 4 / 3, title: "Photo de la galerie" });
    if (!file) return;
    
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `gallery-${profile.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('evenium_assets')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Gallery upload error:", uploadError);
      alert("Erreur lors de l'upload de l'image de la galerie. Assurez-vous d'avoir créé le bucket 'evenium_assets'.");
      setUploadingImage(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('evenium_assets')
      .getPublicUrl(filePath);

    setFormData({ ...formData, gallery: [...formData.gallery, publicUrl] });
    setUploadingImage(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked || !profile) return;
    const file = await editImage(picked, { aspect: 16 / 9, title: "Photo de couverture" });
    if (!file) return;
    
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `cover-${profile.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('evenium_assets')
      .upload(filePath, file);

    if (uploadError) {
      alert("Erreur d'upload de la couverture.");
      setUploadingImage(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('evenium_assets').getPublicUrl(filePath);
    
    await supabase.from('profiles').update({ cover_url: publicUrl }).eq('id', profile.id);
    setProfile({ ...profile, cover_url: publicUrl });
    setFormData({ ...formData, cover_url: publicUrl });
    setUploadingImage(false);
    router.refresh();
  };

  /** Recadre une photo déjà en ligne de la galerie et la remplace */
  const editGalleryImage = async (index: number) => {
    if (!profile) return;
    const file = await editImage(formData.gallery[index], { aspect: 4 / 3, title: "Photo de la galerie" });
    if (!file) return;
    setUploadingImage(true);
    const filePath = `avatars/gallery-${profile.id}-${Math.random()}.jpg`;
    const { error } = await supabase.storage.from('evenium_assets').upload(filePath, file);
    if (error) {
      alert("Erreur lors de l'enregistrement de la photo : " + error.message);
    } else {
      const { data: { publicUrl } } = supabase.storage.from('evenium_assets').getPublicUrl(filePath);
      setFormData(fd => ({ ...fd, gallery: fd.gallery.map((u, i) => (i === index ? publicUrl : u)) }));
    }
    setUploadingImage(false);
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setFormData({
      ...formData,
      gallery: formData.gallery.filter((_, index) => index !== indexToRemove)
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // Prestataire certifié : types d'événements, prestations, pays et zones obligatoires
    const missing = missingActivity(activity);
    if (profile.is_evenium_certified !== false && missing.length) {
      setShowActivityErrors(true);
      alert(`Merci de renseigner ${missing.join(", ")}.`);
      return;
    }

    const profileRow = {
      id: profile.id,
      full_name: formData.full_name,
      phone: formData.phone,
      address: formData.address,
      description: formData.description,
      website: formData.website,
      instagram: formData.instagram,
      experience: formData.experience,
      is_active: formData.is_active,
      gallery: formData.gallery,
      cover_url: formData.cover_url,
      role: 'prestataire'
    };
    let { error } = await supabase.from('profiles').upsert(profileRow);
    if (!error) ({ error } = await saveActivity(supabase, profile.id, activity) as { error: any });
    if (!error) {
      const res = await supabase.from('profiles').update({ rubriques: rubriques.filter(r => r.title.trim()) }).eq('id', profile.id);
      if (isMissingColumn(res.error)) alert("Vos rubriques personnalisées n'ont pas été enregistrées : exécutez le script « supabase_rubriques.sql » dans Supabase.");
      else error = res.error;
    }

    if (error) {
      console.error("Profile update error:", error);
      alert("Erreur lors de la sauvegarde : " + error.message + "\nAssurez-vous d'avoir exécuté les scripts SQL pour ajouter les colonnes et les politiques RLS.");
    } else {
      // Mettre à jour les metadata de l'utilisateur
      await supabase.auth.updateUser({ data: { full_name: formData.full_name } });
      
      setIsEditing(false);
      fetchProfile();
      router.refresh();
    }
  };

  if (loading) return (
    <div className="flex h-[calc(100vh-80px)] items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-[#b8924a] border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black mb-2 flex items-center gap-2">
            Mon Profil Professionnel <Store size={24} className="text-[#b8924a]" />
          </h1>
          <p className="text-gray-500 text-sm">Gerez l'apparence de votre vitrine pour les clients.</p>
        </div>
        {!isEditing ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <span className={`text-sm font-semibold ${formData.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                {formData.is_active ? 'Vitrine Active' : 'Vitrine Inactive'}
              </span>
              <div 
                className={`w-12 h-6 rounded-full flex items-center p-1 cursor-not-allowed ${formData.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                title="Passez en mode édition pour modifier ce statut"
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.is_active ? 'translate-x-6' : ''}`}></div>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-900 transition-all font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Edit2 size={18} />
              Modifier le profil
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <span className={`text-sm font-semibold ${formData.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                {formData.is_active ? 'Rendre Inactif' : 'Rendre Actif'}
              </span>
              <button 
                onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${formData.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.is_active ? 'translate-x-6' : ''}`}></div>
              </button>
            </div>
            <button 
              onClick={() => { setIsEditing(false); setActivity(activityFromProfile(profile)); setRubriques(parseRubriques(profile?.rubriques)); setShowActivityErrors(false); }}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-2.5 rounded-full hover:bg-gray-200 transition-all font-medium"
            >
              <X size={18} />
              Annuler
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#b8924a] text-white px-6 py-2.5 rounded-full hover:bg-[#8f6f33] transition-all font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Save size={18} />
              Enregistrer
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne de gauche : Avatar et infos rapides */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 z-0 bg-[#FFF5F8]">
              {profile?.cover_url && <img src={profile.cover_url} className="w-full h-full object-cover" alt="Cover" />}
              {isEditing && (
                <label className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center cursor-pointer transition-colors z-10 backdrop-blur-sm">
                  <Camera size={14} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={uploadingImage} />
                </label>
              )}
            </div>
            
            <div className="relative z-10 mt-12 mb-4 group">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 shadow-xl flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Store size={48} className="text-gray-300" />
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#b8924a] transition-colors border-2 border-white cursor-pointer">
                  {uploadingImage ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Camera size={16} />}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              )}
            </div>

            <h2 className="font-serif text-2xl font-bold text-gray-900 relative z-10">{formData.full_name || 'Nom de la structure'}</h2>
            <p className="text-[#b8924a] font-medium text-sm mb-4 relative z-10">{providerHeadline({ ...profile, services_proposes: activity.services })}</p>

            <div className="w-full pt-6 border-t border-gray-100 mt-2 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <span className="truncate">{formData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-gray-400" />
                </div>
                <span>{formData.phone || 'Non renseigne'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 text-left">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-gray-400" />
                </div>
                <span>{activity.country ? locationLabel(activity.country, activity.zones, 6) : 'Zones non renseignées'}</span>
              </div>
              {formData.address && (
                <div className="flex items-center gap-3 text-sm text-gray-600 text-left">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                    <Store size={16} className="text-gray-400" />
                  </div>
                  <span>{formData.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne de droite : Formulaire */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            {/* Background design element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#b8924a]/5 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-[#b8924a]" />
              Informations Generales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nom de la structure</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${isEditing ? 'bg-white border-gray-300 focus:ring-2 focus:ring-[#b8924a] focus:border-transparent' : 'bg-gray-50 border-transparent text-gray-600'}`}
                  placeholder="Ex: Traiteur Étoile"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Telephone</label>
                <input 
                  type="tel" 
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${isEditing ? 'bg-white border-gray-300 focus:ring-2 focus:ring-[#b8924a] focus:border-transparent' : 'bg-gray-50 border-transparent text-gray-600'}`}
                  placeholder="+221 77 000 00 00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email de contact</label>
                <input 
                  type="email" 
                  disabled
                  value={formData.email}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 border-transparent text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Adresse (siège, boutique, showroom)</label>
                <p className="text-xs text-gray-500">Vos zones d'intervention se règlent dans la rubrique « Votre activité » ci-dessous.</p>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${isEditing ? 'bg-white border-gray-300 focus:ring-2 focus:ring-[#b8924a] focus:border-transparent' : 'bg-gray-50 border-transparent text-gray-600'}`}
                  placeholder="Ex: Sacré-Cœur 3, Dakar"
                />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Présentation détaillée (À propos)</label>
                <textarea 
                  disabled={!isEditing}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={8}
                  className={`w-full px-4 py-3 rounded-xl border transition-all resize-y min-h-[150px] ${isEditing ? 'bg-white border-gray-300 focus:ring-2 focus:ring-[#b8924a] focus:border-transparent' : 'bg-gray-50 border-transparent text-gray-600'}`}
                  placeholder="Décrivez en détail votre activité, votre histoire, votre expérience et ce qui vous rend unique. Ce texte sera affiché dans l'onglet 'Présentation' de votre vitrine client..."
                />
              </div>
              
              {/* Nouveaux champs pour la vitrine */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Années d'expérience</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.experience}
                  onChange={e => setFormData({...formData, experience: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${isEditing ? 'bg-white border-gray-300 focus:ring-2 focus:ring-[#b8924a] focus:border-transparent' : 'bg-gray-50 border-transparent text-gray-600'}`}
                  placeholder="Ex: 5 ans"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Lien Instagram</label>
                <input 
                  type="url" 
                  disabled={!isEditing}
                  value={formData.instagram}
                  onChange={e => setFormData({...formData, instagram: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${isEditing ? 'bg-white border-gray-300 focus:ring-2 focus:ring-[#b8924a] focus:border-transparent' : 'bg-gray-50 border-transparent text-gray-600'}`}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Site Web ou Portfolio externe</label>
                <input 
                  type="url" 
                  disabled={!isEditing}
                  value={formData.website}
                  onChange={e => setFormData({...formData, website: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${isEditing ? 'bg-white border-gray-300 focus:ring-2 focus:ring-[#b8924a] focus:border-transparent' : 'bg-gray-50 border-transparent text-gray-600'}`}
                  placeholder="https://mon-site.com"
                />
              </div>
              
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mt-6">
            <h2 className="font-serif text-2xl text-black mb-1">Votre activité</h2>
            <p className="text-sm text-gray-500 mb-6">Types d'événements, prestations et zones : les organisateurs filtrent les prestataires avec ces informations.</p>
            {isEditing ? (
              <ActivityFields value={activity} onChange={setActivity} showErrors={showActivityErrors} />
            ) : (
              <dl className="space-y-5">
                {[
                  { label: "Types d'événements", items: activity.event_types },
                  { label: "Prestations", items: activity.services },
                ].map(({ label, items }) => (
                  <div key={label}>
                    <dt className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">{label}</dt>
                    <dd className="flex flex-wrap gap-2">
                      {items.length ? items.map(i => (
                        <span key={i} className="px-3 py-1.5 rounded-full text-xs bg-[#f5eee1] text-[#7a5e2b] border border-[#e4d8c4]">{i}</span>
                      )) : <span className="text-sm text-gray-400">Non renseigné</span>}
                    </dd>
                  </div>
                ))}
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">Pays et zones d'intervention</dt>
                  <dd className="text-sm text-gray-800 flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#b8924a]" />
                    {activity.country ? locationLabel(activity.country, activity.zones, 8) : <span className="text-gray-400">Non renseigné</span>}
                  </dd>
                </div>
              </dl>
            )}
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mt-6">
            <h2 className="font-serif text-2xl text-black mb-1">Vos rubriques</h2>
            <p className="text-sm text-gray-500 mb-6">Personnalisez votre vitrine : ajoutez, renommez ou supprimez des rubriques. Des suggestions s'adaptent à vos prestations et types d'événements.</p>
            {isEditing ? (
              <RubriquesEditor
                value={rubriques}
                onChange={setRubriques}
                suggestions={suggestProfileRubriques(activity.services, activity.event_types, rubriques)}
                newSources={(() => {
                  // Prestations et événements ajoutés depuis le dernier enregistrement : suggestions mises en avant
                  const saved = activityFromProfile(profile);
                  const added = activity.services.filter(x => !saved.services.includes(x));
                  if (activity.event_types.some(x => !saved.event_types.includes(x))) added.push("Vos types d'événements");
                  return added;
                })()}
              />
            ) : rubriques.length ? (
              <RubriquesView value={rubriques} />
            ) : (
              <p className="text-sm text-gray-500">Aucune rubrique. Cliquez sur « Modifier » pour en ajouter.</p>
            )}
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mt-6">
            <h2 className="font-serif text-2xl font-bold text-black mb-6">Galerie Photos (Catalogue)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.gallery.map((url, idx) => (
                <div 
                  key={idx} 
                  className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100 border border-gray-200 cursor-pointer"
                  onClick={() => {
                    if (!isEditing) {
                      setLightboxImages(formData.gallery);
                      setLightboxIndex(idx);
                    }
                  }}
                >
                  <img src={url} alt={`Gallery ${idx}`} className={`w-full h-full object-cover ${!isEditing ? 'hover:opacity-80 transition-opacity' : ''}`} />
                  {isEditing && (
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => editGalleryImage(idx)}
                        className="w-8 h-8 bg-black/70 hover:bg-[#b8924a] text-white rounded-full flex items-center justify-center transition-colors"
                        aria-label="Recadrer et retoucher"
                      >
                        <Crop size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="w-8 h-8 bg-black/70 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors"
                        aria-label="Supprimer la photo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {isEditing && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-[#b8924a] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-gray-500 hover:text-[#8f6f33]">
                  {uploadingImage ? (
                    <div className="w-6 h-6 border-2 border-[#b8924a] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ImageIcon size={24} />
                      <span className="text-xs font-semibold px-2 text-center">Ajouter une photo</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleGalleryUpload} disabled={uploadingImage} />
                </label>
              )}
              
              {!isEditing && formData.gallery.length === 0 && (
                <div className="col-span-full py-8 text-center text-gray-500 text-sm italic">
                  Aucune photo dans votre galerie.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setLightboxImages([])}>
          <button 
            onClick={() => setLightboxImages([])}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
          >
            <X size={24} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxImages.length - 1)); }}
            className="absolute left-6 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
          >
            <ArrowLeft size={24} />
          </button>

          <img 
            src={lightboxImages[lightboxIndex]} 
            alt="Fullscreen view" 
            className="max-w-[90vw] max-h-[90vh] object-contain select-none shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <button 
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev < lightboxImages.length - 1 ? prev + 1 : 0)); }}
            className="absolute right-6 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
          >
            <ArrowLeft size={24} className="rotate-180" />
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm font-medium tracking-widest bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
            {lightboxIndex + 1} / {lightboxImages.length}
          </div>
        </div>
      )}
      {editorElement}
    </div>
  );
}
