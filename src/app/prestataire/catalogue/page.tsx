"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, LayoutList, X, CheckCircle, MapPin, Users, Clock, Save, Eye, UploadCloud, ArrowLeft, Crop, Check, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { EVENT_TYPES } from "@/lib/eventTypes";
import { PRESTATION_TYPES } from "@/lib/devis/categories";
import { isMissingColumn } from "@/lib/devis/persist";
import { EMPTY_ACTIVITY, activityFromProfile, type ProviderActivity } from "@/lib/providerProfile";
import { WHOLE_COUNTRY, zonesOf } from "@/lib/zones";
import { ALL_EVENTS, BUILTIN_SECTIONS, offerEventTypes, offerHidden, offerPrestations, offerRubriques, offerTagLine, type BuiltinSection } from "@/lib/offres";
import { suggestOfferRubriques, type Rubrique } from "@/lib/rubriques";
import { RubriquesEditor } from "@/components/prestataire/RubriquesEditor";
import { RubriquesView } from "@/components/prestataire/RubriquesView";
import { useImageEditor } from "@/components/media/ImageEditorModal";

const PRICE_TYPES = ["Prix fixe", "À partir de", "Par personne", "Par table", "Par prestation", "Forfait", "Sur devis"];

/** Photo de la galerie : déjà en ligne (url) ou à téléverser (file) */
interface GalleryItem {
  preview: string;
  file: File | null;
}

interface OfferForm {
  title: string;
  eventTypes: string[];
  prestations: string[];
  price: string;
  priceType: string;
  description: string;
  included: string[];
  options: { name: string; price: string }[];
  practicalInfos: { capacite?: string; duree?: string };
  rubriques: Rubrique[];
  hidden: BuiltinSection[];
  zones: string[];
  imageFile: File | null;
  imagePreview: string;
  gallery: GalleryItem[];
  status: string;
}

const EMPTY_FORM: OfferForm = {
  title: "", eventTypes: [], prestations: [], price: "", priceType: "À partir de", description: "",
  included: [], options: [], practicalInfos: {}, rubriques: [], hidden: [], zones: [],
  imageFile: null, imagePreview: "", gallery: [], status: "Brouillon",
};

const chip = (on: boolean) =>
  `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
    on ? "bg-[#2b2118] text-[#f5eee1] border-[#2b2118]" : "bg-white text-gray-700 border-gray-200 hover:border-[#b8924a]/60"
  }`;

export default function PrestataireCataloguePage() {
  const [offres, setOffres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [form, setForm] = useState<OfferForm>(EMPTY_FORM);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showAllPrestations, setShowAllPrestations] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  /** Types d'événements, prestations et zones du prestataire (profil) */
  const [activity, setActivity] = useState<ProviderActivity>(EMPTY_ACTIVITY);
  const { editImage, editorElement } = useImageEditor();
  const supabase = createClient();

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    setActivity(activityFromProfile({ ...prof, user_metadata: user.user_metadata }));

    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setOffres(data);
    setIsLoading(false);
  }

  const set = <K extends keyof OfferForm>(k: K, v: OfferForm[K]) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter(x => x !== item) : [...list, item]);

  // ── Photos (avec recadrage et retouches) ─────────────────────
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const edited = await editImage(file, { aspect: 16 / 9, title: "Photo de couverture" });
    if (edited) setForm(f => ({ ...f, imageFile: edited, imagePreview: URL.createObjectURL(edited) }));
  };

  const editCover = async () => {
    const source = form.imageFile ?? form.imagePreview;
    if (!source) return;
    const edited = await editImage(source, { aspect: 16 / 9, title: "Photo de couverture" });
    if (edited) setForm(f => ({ ...f, imageFile: edited, imagePreview: URL.createObjectURL(edited) }));
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    // Chaque photo passe par l'éditeur ; « Annuler » l'ignore
    for (const file of files) {
      const edited = await editImage(file, { aspect: 4 / 3, title: `Photo de la galerie (${files.indexOf(file) + 1}/${files.length})` });
      if (edited) setForm(f => ({ ...f, gallery: [...f.gallery, { preview: URL.createObjectURL(edited), file: edited }] }));
    }
  };

  const editGalleryItem = async (index: number) => {
    const item = form.gallery[index];
    const edited = await editImage(item.file ?? item.preview, { aspect: 4 / 3, title: "Photo de la galerie" });
    if (edited) setForm(f => ({ ...f, gallery: f.gallery.map((g, i) => (i === index ? { preview: URL.createObjectURL(edited), file: edited } : g)) }));
  };

  // ── Ouverture de l'éditeur ───────────────────────────────────
  const openCreateModal = () => {
    setEditingOfferId(null);
    setForm({
      ...EMPTY_FORM,
      eventTypes: [...activity.event_types],
      prestations: activity.services.length === 1 ? [...activity.services] : [],
      zones: [...activity.zones],
    });
    setMode('create');
  };

  const openEditModal = (s: any) => {
    const infos = s.infos_pratiques || {};
    setEditingOfferId(s.id);
    setForm({
      title: s.nom_service || "",
      eventTypes: offerEventTypes(s),
      prestations: offerPrestations(s),
      price: s.prix_base ? `${s.prix_base}` : "",
      priceType: s.type_prix || "Prix fixe",
      description: s.description || "",
      included: s.inclus || [],
      options: s.options || [],
      practicalInfos: { capacite: infos.capacite, duree: infos.duree },
      rubriques: offerRubriques(s),
      hidden: offerHidden(s),
      zones: s.zones || [],
      imageFile: null,
      imagePreview: s.image_url || "",
      gallery: (s.gallery || []).map((url: string) => ({ preview: url, file: null })),
      status: s.status || "Publié",
    });
    setMode('edit');
  };

  /** Enregistre une offre ; sans la colonne « prestation » (script SQL non exécuté), elle est omise. */
  const writeService = async (payload: Record<string, unknown>, id?: string | null) => {
    const run = (p: Record<string, unknown>) =>
      id ? supabase.from('services').update(p).eq('id', id) : supabase.from('services').insert([p]);
    const res = await run(payload);
    if (!isMissingColumn(res.error)) return res;
    const { prestation: _omit, ...legacy } = payload;
    return run(legacy);
  };

  const uploadFileToSupabase = async (file: File, pathPrefix: string) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `services/${pathPrefix}-${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from('evenium_assets').upload(filePath, file);
    if (error) throw error;
    return supabase.storage.from('evenium_assets').getPublicUrl(filePath).data.publicUrl;
  };

  const buildPayload = (userId: string, f: OfferForm, extra: Record<string, unknown>) => ({
    profile_id: userId,
    // Anciennes colonnes : première valeur (ou « Tous événements »)
    categorie: f.eventTypes.length === 1 ? f.eventTypes[0] : ALL_EVENTS,
    prestation: f.prestations[0] || null,
    nom_service: f.title,
    prix_base: parseInt(f.price) || null,
    description: f.description,
    type_prix: f.priceType,
    inclus: f.hidden.includes('inclus') ? [] : f.included,
    options: f.hidden.includes('options') ? [] : f.options,
    infos_pratiques: {
      ...(f.hidden.includes('infos') ? {} : f.practicalInfos),
      event_types: f.eventTypes,
      prestations: f.prestations,
      rubriques: f.rubriques.filter(r => r.title.trim()),
      masquees: f.hidden,
    },
    zones: f.zones,
    ...extra,
  });

  const handleSave = async (status: 'Brouillon' | 'Publié') => {
    if (!form.title.trim()) {
      alert("Le nom de l'offre est obligatoire.");
      return;
    }
    if (!form.prestations.length) {
      alert("Sélectionnez au moins une prestation concernée par cette offre.");
      return;
    }

    setIsUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsUploading(false);
      return;
    }

    try {
      let imageUrl = form.imagePreview && !form.imagePreview.startsWith('blob:') ? form.imagePreview : null;
      if (form.imageFile) imageUrl = await uploadFileToSupabase(form.imageFile, 'cover');

      const galleryUrls: string[] = [];
      for (const item of form.gallery) {
        if (item.file) galleryUrls.push(await uploadFileToSupabase(item.file, 'gallery'));
        else if (!item.preview.startsWith('blob:')) galleryUrls.push(item.preview);
      }

      const { error } = await writeService(
        buildPayload(user.id, form, { image_url: imageUrl, gallery: galleryUrls, status }),
        mode === 'edit' ? editingOfferId : null
      );
      if (error) throw new Error(error.message);

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
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (!error) setOffres(offres.filter(o => o.id !== id));
    else alert("Erreur lors de la suppression");
  };

  const toggleStatus = async (s: any) => {
    const newStatus = s.status === 'Publié' ? 'Désactivé' : 'Publié';
    setOffres(offres.map(o => (o.id === s.id ? { ...o, status: newStatus } : o)));
    await supabase.from('services').update({ status: newStatus }).eq('id', s.id);
  };

  const duplicateOffer = async (s: any) => {
    if (!confirm("Voulez-vous dupliquer ce catalogue ?")) return;
    setIsUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { id: _id, created_at: _c, ...copy } = s;
      await writeService({ ...copy, profile_id: user.id, nom_service: `${s.nom_service} (Copie)`, status: 'Brouillon' });
      await fetchServices();
    }
    setIsUploading(false);
  };

  const addIncludedItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      e.preventDefault();
      set('included', [...form.included, e.currentTarget.value.trim()]);
      e.currentTarget.value = '';
    }
  };

  const hideSection = (k: BuiltinSection) => set('hidden', [...form.hidden, k]);
  const showSection = (k: BuiltinSection) => set('hidden', form.hidden.filter(x => x !== k));

  const sectionHeader = (num: string, title: string, removable?: BuiltinSection) => (
    <div className="flex items-center justify-between gap-3 mb-6">
      <h2 className="text-xl font-bold flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">{num}</span>
        {title}
      </h2>
      {removable && (
        <button type="button" onClick={() => hideSection(removable)} className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1" title="Retirer cette rubrique de l'offre">
          <EyeOff size={14} /> Retirer
        </button>
      )}
    </div>
  );

  // ---------------------------------------------------------
  // APERÇU
  // ---------------------------------------------------------
  const renderPreview = () => (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden sticky top-6 max-h-[90vh] overflow-y-auto flex flex-col">
      <div className="relative h-64 bg-gray-100 shrink-0">
        {form.imagePreview ? (
          <img src={form.imagePreview} alt="Couverture" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
            <ImageIcon size={48} />
            <span className="text-sm">Image de couverture</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-6 left-6 text-white pr-6">
          <span className="bg-[#b8924a] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm mb-3 inline-block">
            {offerTagLine({ infos_pratiques: { event_types: form.eventTypes, prestations: form.prestations } })}
          </span>
          <h2 className="font-serif text-3xl font-bold mb-1 leading-tight">{form.title || "Nom de l'offre"}</h2>
          <p className="text-[#d9c08c] font-semibold text-lg">{form.priceType} {form.price ? `${Number(form.price).toLocaleString('fr-FR')} FCFA` : "--- FCFA"}</p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {form.description && <p className="text-gray-600 leading-relaxed text-sm">{form.description}</p>}

        {!form.hidden.includes('inclus') && form.included.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Ce qui est inclus</h3>
            <ul className="space-y-3">
              {form.included.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle size={18} className="text-[#b8924a] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!form.hidden.includes('options') && form.options.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Options supplémentaires</h3>
            <ul className="space-y-3">
              {form.options.map((opt, i) => (
                <li key={i} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="font-medium text-gray-800">{opt.name}</span>
                  <span className="font-semibold text-[#8f6f33]">{opt.price ? `+ ${Number(opt.price).toLocaleString('fr-FR')} FCFA` : 'Sur devis'}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {((!form.hidden.includes('infos') && (form.practicalInfos.capacite || form.practicalInfos.duree)) || form.zones.length > 0) && (
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Informations pratiques</h3>
            <div className="grid grid-cols-2 gap-4">
              {form.zones.length > 0 && (
                <div className="flex items-center gap-3 bg-[#f5eee1] p-3 rounded-xl">
                  <MapPin size={20} className="text-[#8f6f33]" />
                  <div>
                    <p className="text-[10px] text-[#8f6f33] uppercase tracking-wider font-bold">Zones</p>
                    <p className="text-sm font-medium text-gray-900">{form.zones.length} zone(s)</p>
                  </div>
                </div>
              )}
              {!form.hidden.includes('infos') && form.practicalInfos.capacite && (
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Users size={20} className="text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Capacité</p>
                    <p className="text-sm font-medium text-gray-900">{form.practicalInfos.capacite}</p>
                  </div>
                </div>
              )}
              {!form.hidden.includes('infos') && form.practicalInfos.duree && (
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Clock size={20} className="text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Durée</p>
                    <p className="text-sm font-medium text-gray-900">{form.practicalInfos.duree}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <RubriquesView value={form.rubriques} />

        {form.gallery.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Aperçus de l'offre</h3>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 snap-x">
              {form.gallery.map((g, i) => (
                <img key={i} src={g.preview} className="h-20 w-20 rounded-xl object-cover snap-start shrink-0 border border-gray-200" alt={`Aperçu ${i + 1}`} />
              ))}
            </div>
          </div>
        )}

        <div className="pt-4">
          <button className="w-full py-4 bg-black text-white font-bold rounded-xl shadow-lg" disabled>
            Demander un devis
          </button>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // FORMULAIRE
  // ---------------------------------------------------------
  const otherEvents = EVENT_TYPES.filter(t => !activity.event_types.includes(t));
  const otherPrestations = PRESTATION_TYPES.filter(p => !activity.services.includes(p));
  const offerZones = [...new Set([...activity.zones, ...(activity.zones.includes(WHOLE_COUNTRY) ? zonesOf(activity.country) : []), ...form.zones])];
  const suggestions = suggestOfferRubriques(form.prestations, form.eventTypes, form.rubriques);

  const renderEditor = () => (
    <div className="max-w-7xl mx-auto w-full p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
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
        <div className="space-y-8 pb-32 min-w-0">
          {/* 1. Informations générales */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            {sectionHeader("1", "Informations générales")}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'offre *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#b8924a] focus:ring-1 focus:ring-[#b8924a] transition-all bg-gray-50 focus:bg-white"
                  placeholder="Ex: Pack Mariage Élégance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Types d'événements</label>
                <p className="text-xs text-gray-500 mb-2.5">Sélectionnez autant d'événements que nécessaire ; aucun = tous les événements.</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => set('eventTypes', [])} className={chip(form.eventTypes.length === 0)}>
                    {form.eventTypes.length === 0 && <Check size={12} />} {ALL_EVENTS}
                  </button>
                  {[...activity.event_types, ...(showAllEvents ? otherEvents : otherEvents.filter(t => form.eventTypes.includes(t)))].map(t => (
                    <button key={t} type="button" aria-pressed={form.eventTypes.includes(t)} onClick={() => set('eventTypes', toggle(form.eventTypes, t))} className={chip(form.eventTypes.includes(t))}>
                      {form.eventTypes.includes(t) && <Check size={12} />} {t}
                    </button>
                  ))}
                  {otherEvents.length > 0 && (
                    <button type="button" onClick={() => setShowAllEvents(v => !v)} className="px-3 py-1.5 rounded-full text-xs border border-dashed border-[#b8924a]/60 text-[#8f6f33]">
                      {showAllEvents ? "Moins d'événements" : `+ Autres événements (${otherEvents.length})`}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Prestations *</label>
                <p className="text-xs text-gray-500 mb-2.5">Sélectionnez toutes les prestations couvertes par cette offre.</p>
                <div className="flex flex-wrap gap-2">
                  {[...activity.services, ...(showAllPrestations ? otherPrestations : otherPrestations.filter(p => form.prestations.includes(p))), ...form.prestations.filter(p => !activity.services.includes(p) && !PRESTATION_TYPES.includes(p))].map(p => (
                    <button key={p} type="button" aria-pressed={form.prestations.includes(p)} onClick={() => set('prestations', toggle(form.prestations, p))} className={chip(form.prestations.includes(p))}>
                      {form.prestations.includes(p) && <Check size={12} />} {p}
                    </button>
                  ))}
                  {otherPrestations.length > 0 && (
                    <button type="button" onClick={() => setShowAllPrestations(v => !v)} className="px-3 py-1.5 rounded-full text-xs border border-dashed border-[#b8924a]/60 text-[#8f6f33]">
                      {showAllPrestations ? "Moins de prestations" : `+ Autres prestations (${otherPrestations.length})`}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de prix</label>
                  <select value={form.priceType} onChange={e => set('priceType', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                    {PRICE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix (en FCFA)</label>
                  <input type="number" value={form.price} onChange={e => set('price', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" placeholder="Ex: 250000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Courte description</label>
                <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 resize-none" placeholder="Une formule complète pour..." />
              </div>
            </div>
          </div>

          {/* 2. Ce qui est inclus */}
          {!form.hidden.includes('inclus') && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              {sectionHeader("2", "Ce qui est inclus", 'inclus')}
              <div className="space-y-3">
                {form.included.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">{item}</span>
                    <button onClick={() => set('included', form.included.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Retirer">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <input type="text" onKeyDown={addIncludedItem} className="w-full px-4 py-3 rounded-xl border border-dashed border-gray-300 focus:border-[#b8924a] focus:ring-1 focus:ring-[#b8924a] transition-all bg-transparent" placeholder="+ Ajouter un élément (Appuyez sur Entrée)" />
              </div>
            </div>
          )}

          {/* 3. Options */}
          {!form.hidden.includes('options') && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              {sectionHeader("3", "Options supplémentaires", 'options')}
              <div className="space-y-3 mb-4">
                {form.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#f5eee1] px-4 py-3 rounded-xl border border-[#e4d8c4]">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{opt.name}</p>
                      {opt.price && <p className="text-xs text-[#8f6f33] font-medium">+ {opt.price} FCFA</p>}
                    </div>
                    <button onClick={() => set('options', form.options.filter((_, i) => i !== idx))} className="text-[#8f6f33] hover:text-red-500 transition-colors" aria-label="Retirer">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const el = e.target as HTMLFormElement;
                  const name = (el.elements.namedItem('optName') as HTMLInputElement).value.trim();
                  const price = (el.elements.namedItem('optPrice') as HTMLInputElement).value.trim();
                  if (name) set('options', [...form.options, { name, price }]);
                  el.reset();
                }}
                className="flex gap-2"
              >
                <input name="optName" type="text" placeholder="Nom de l'option (ex: Cocktail)" className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" required />
                <input name="optPrice" type="number" placeholder="Prix" className="w-28 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" />
                <button type="submit" className="bg-black text-white px-4 py-3 rounded-xl font-semibold" aria-label="Ajouter l'option"><Plus size={18} /></button>
              </form>
            </div>
          )}

          {/* 4. Informations pratiques */}
          {!form.hidden.includes('infos') && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              {sectionHeader("4", "Informations pratiques", 'infos')}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Capacité (personnes)</label>
                  <input type="text" value={form.practicalInfos.capacite || ""} onChange={e => set('practicalInfos', { ...form.practicalInfos, capacite: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" placeholder="Ex: 100 - 150" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Durée</label>
                  <input type="text" value={form.practicalInfos.duree || ""} onChange={e => set('practicalInfos', { ...form.practicalInfos, duree: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" placeholder="Ex: 8 heures" />
                </div>
              </div>
            </div>
          )}

          {/* Rubriques personnalisées */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            {sectionHeader("+", "Vos rubriques")}
            <p className="text-sm text-gray-500 -mt-3 mb-5">
              Les rubriques ci-dessus ne vous conviennent pas ? Retirez-les et créez les vôtres : texte, liste ou tableau d'informations.
            </p>
            {form.hidden.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500">Rubriques retirées :</span>
                {form.hidden.map(k => (
                  <button key={k} type="button" onClick={() => showSection(k)} className="px-3 py-1.5 rounded-full text-xs border border-gray-200 bg-white text-gray-600 hover:border-[#b8924a]/60">
                    + {BUILTIN_SECTIONS[k]}
                  </button>
                ))}
              </div>
            )}
            <RubriquesEditor
              value={form.rubriques}
              onChange={r => set('rubriques', r)}
              suggestions={suggestions}
              emptyHint="Choisissez une suggestion adaptée à vos prestations ou créez une rubrique vide."
            />
          </div>

          {/* 5. Images */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            {sectionHeader("5", "Images du catalogue")}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">Image de couverture principale</label>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#b8924a] transition-all relative overflow-hidden group">
                {form.imagePreview ? (
                  <>
                    <img src={form.imagePreview} className="w-full h-full object-cover" alt="Couverture" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-semibold text-sm flex items-center gap-2"><Edit2 size={16} /> Remplacer</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 group-hover:text-[#8f6f33]">
                    <UploadCloud size={32} className="mb-3" />
                    <p className="mb-1 text-sm font-semibold">Cliquez pour ajouter une image</p>
                    <p className="text-xs">Vous pourrez la recadrer et la retoucher</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
              </label>
              {form.imagePreview && (
                <button type="button" onClick={editCover} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8f6f33] hover:underline">
                  <Crop size={13} /> Recadrer et retoucher
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Galerie de l'offre (Optionnel)</label>
              <p className="text-xs text-gray-500 mb-3">Chaque photo importée s'ouvre dans l'éditeur ; cliquez sur une photo pour la modifier.</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {form.gallery.map((g, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={g.preview} alt={`Galerie ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button type="button" onClick={() => editGalleryItem(idx)} className="bg-white/90 text-gray-900 rounded-full p-1.5" aria-label="Recadrer et retoucher">
                        <Crop size={14} />
                      </button>
                      <button type="button" onClick={() => set('gallery', form.gallery.filter((_, i) => i !== idx))} className="bg-white/90 text-red-600 rounded-full p-1.5" aria-label="Supprimer la photo">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <label className="flex items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#b8924a] text-gray-400 hover:text-[#8f6f33] transition-all">
                  <Plus size={24} />
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} />
                </label>
              </div>
            </div>
          </div>

          {/* 6. Zones */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            {sectionHeader("6", "Zones d'intervention")}
            <p className="text-sm text-gray-500 -mt-3 mb-4">
              {activity.country ? `Zones en ${activity.country}. Ajoutez-en d'autres dans votre profil.` : "Renseignez votre pays et vos zones dans votre profil."}
            </p>
            <div className="flex flex-wrap gap-2">
              {offerZones.map(z => (
                <button
                  key={z}
                  type="button"
                  onClick={() => set('zones', toggle(form.zones, z))}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${form.zones.includes(z) ? 'bg-[#b8924a] border-[#b8924a] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:border-[#b8924a]/50'}`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block relative">{renderPreview()}</div>
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // LISTE
  // ---------------------------------------------------------
  const renderList = () => (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold text-black mb-2">Mes Catalogues</h1>
          <p className="text-gray-500 text-sm">Gérez vos offres commerciales et ce qu'elles incluent.</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
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
          <button onClick={openCreateModal} className="flex items-center gap-2 bg-[#b8924a] hover:bg-[#8f6f33] text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all">
            Créer ma première offre
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offres.map(s => (
            <div key={s.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all shadow-sm group flex flex-col">
              <div className="h-56 bg-gray-100 relative overflow-hidden">
                {s.image_url ? (
                  <img src={s.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={s.nom_service} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon size={40} className="text-gray-300" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                <div className="absolute top-4 left-4 flex gap-2 z-10">
                  <span className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg shadow-md flex items-center gap-1 ${
                    s.status === 'Publié' ? 'bg-[#b8924a] text-white' : s.status === 'Brouillon' ? 'bg-gray-800 text-gray-200' : 'bg-red-500 text-white'
                  }`}>
                    {s.status === 'Publié' && <CheckCircle size={12} />}
                    {s.status || 'Publié'}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <p className="text-[#d9c08c] font-semibold text-sm mb-1">{s.type_prix || "Prix fixe"} {s.prix_base ? `${Number(s.prix_base).toLocaleString('fr-FR')} FCFA` : "Sur devis"}</p>
                  <h3 className="font-bold text-xl text-white line-clamp-1">{s.nom_service}</h3>
                  <p className="text-[11px] text-white/75 mt-1 line-clamp-1">{offerTagLine(s)}</p>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1 leading-relaxed">{s.description}</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button onClick={() => openEditModal(s)} className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold rounded-xl border border-gray-200 transition-colors text-sm">
                    <Edit2 size={16} /> Modifier
                  </button>
                  <button onClick={() => toggleStatus(s)} className={`flex items-center justify-center gap-2 py-2.5 font-semibold rounded-xl border transition-colors text-sm ${s.status === 'Publié' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'}`}>
                    {s.status === 'Publié' ? <><X size={16} /> Masquer</> : <><CheckCircle size={16} /> Publier</>}
                  </button>
                  <button onClick={() => duplicateOffer(s)} className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold rounded-xl border border-gray-200 transition-colors text-sm">
                    <Plus size={16} /> Dupliquer le catalogue
                  </button>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button onClick={() => deleteOffer(s.id)} className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-1">
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

  return (
    <>
      {mode === 'list' ? renderList() : renderEditor()}
      {editorElement}
    </>
  );
}
