"use client";

import { useState, useEffect } from "react";
import { CheckCircle, ArrowRight, ArrowLeft, X, Calendar, MapPin, Users, Info, Plus, Music, Camera, Utensils, Home, Briefcase, Paperclip } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { sendQuoteRequestPushAction } from "@/app/actions/notify";

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  provider: any;
  service: any;
  onSubmitSuccess: () => void;
}

export function QuoteRequestModal({ isOpen, onClose, event, provider, service, onSubmitSuccess }: QuoteRequestModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [inspirations, setInspirations] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Base Form State
  const [form, setForm] = useState({
    // Client Info
    client_name: "",
    client_phone: "",
    client_email: "",
    client_whatsapp: "",
    
    // Besoin Global
    needs_description: "",
    needs_quantity: 1,
    
    // Specifiques
    specifics: {} as Record<string, any>,
    
    // Preferences
    theme_style: "",
    colors: "",
    level: "Standard",
    options: [] as string[],
    constraints: "",
    
    // Budget & Fichiers
    budget_indicatif: "",
    budget_flexible: false,
    message_final: "",
  });

  const supabase = createClient();

  useEffect(() => {
    // Try to pre-fill client info from auth if available
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setForm(prev => ({
          ...prev,
          client_email: user.email || prev.client_email,
          client_name: user.user_metadata?.full_name || prev.client_name
        }));
      }
    };
    if (isOpen) {
      fetchUser();
      setStep(1);
      setIsSuccess(false);
      setInspirations([]);
      setIsUploading(false);
      setForm(prev => ({ 
        ...prev, 
        event_id: event?.id || "",
        prestataire_id: provider?.id || "",
        service_id: service?.id || "",
        specifics: {} 
      }));
    }
  }, [isOpen, provider, service, event]);

  if (!isOpen || !provider || !service) return null;

  const categoryStr = String(provider?.role || provider?.category || '').toLowerCase();
  const serviceCatStr = String(service?.categorie || service?.category || '').toLowerCase();
  const serviceNameStr = String(service?.nom_service || service?.name || '').toLowerCase();
  const category = `${categoryStr} ${serviceCatStr} ${serviceNameStr}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Optional: Check size < 5MB
      const validFiles = filesArray.filter(file => file.size <= 5 * 1024 * 1024);
      if (validFiles.length < filesArray.length) {
        alert("Certains fichiers dépassent la taille maximale de 5Mo et ont été ignorés.");
      }
      setInspirations(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setInspirations(prev => prev.filter((_, i) => i !== index));
  };

  const updateSpecific = (key: string, value: any) => {
    setForm(prev => ({ ...prev, specifics: { ...prev.specifics, [key]: value } }));
  };

  const renderSpecificQuestions = () => {
    if (category.includes('photograph') || category.includes('vidéo')) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Durée de couverture *</label>
              <select required value={form.specifics.duration || ""} onChange={e => updateSpecific('duration', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50">
                <option value="">Sélectionnez...</option>
                <option value="Quelques heures">Quelques heures</option>
                <option value="Demi-journée">Demi-journée</option>
                <option value="Journée complète">Journée complète</option>
                <option value="Plusieurs jours">Plusieurs jours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de photographes</label>
              <input type="number" min="1" value={form.specifics.count || 1} onChange={e => updateSpecific('count', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Livrables souhaités</label>
            <div className="flex flex-wrap gap-2">
              {['Photos numériques', 'Photos retouchées', 'Album photo imprimé', 'Galerie privée en ligne', 'Vidéo complète', 'Teaser vidéo', 'Drone'].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:border-[#b8924a] transition-colors">
                  <input type="checkbox" checked={form.specifics.deliverables?.includes(opt)} onChange={(e) => {
                    const current = form.specifics.deliverables || [];
                    if (e.target.checked) updateSpecific('deliverables', [...current, opt]);
                    else updateSpecific('deliverables', current.filter((i: string) => i !== opt));
                  }} className="text-[#b8924a] focus:ring-[#b8924a] rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (category.includes('traiteur')) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Type de service *</label>
              <select required value={form.specifics.serviceType || ""} onChange={e => updateSpecific('serviceType', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50">
                <option value="">Sélectionnez...</option>
                <option value="Buffet">Buffet</option>
                <option value="Service à table">Service à table</option>
                <option value="Cocktail dînatoire">Cocktail dînatoire</option>
                <option value="Mixte">Mixte (Buffet + Table)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de convives *</label>
              <input type="number" required min="1" value={form.specifics.guests || event?.guestsCount || ""} onChange={e => updateSpecific('guests', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Besoins inclus</label>
            <div className="flex flex-wrap gap-2">
              {['Vin d\'honneur', 'Entrée', 'Plat principal', 'Dessert / Pièce montée', 'Boissons softs', 'Alcool', 'Vaisselle incluse', 'Personnel de service', 'Mobilier de buffet'].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:border-[#b8924a] transition-colors">
                  <input type="checkbox" checked={form.specifics.inclusions?.includes(opt)} onChange={(e) => {
                    const current = form.specifics.inclusions || [];
                    if (e.target.checked) updateSpecific('inclusions', [...current, opt]);
                    else updateSpecific('inclusions', current.filter((i: string) => i !== opt));
                  }} className="text-[#b8924a] focus:ring-[#b8924a] rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Allergies ou régimes particuliers</label>
            <input type="text" value={form.specifics.dietary || ""} onChange={e => updateSpecific('dietary', e.target.value)} placeholder="Ex: 5 végétariens, 2 sans gluten..." className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
          </div>
        </div>
      );
    }

    if (category.includes('décorat') || category.includes('decorat')) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Espaces à décorer</label>
            <div className="flex flex-wrap gap-2">
              {['Salle de réception', 'Extérieur / Jardin', 'Espace Cérémonie', 'Lieu de culte', 'Photobooth', 'Tables invités', 'Table d\'honneur'].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:border-[#b8924a] transition-colors">
                  <input type="checkbox" checked={form.specifics.spaces?.includes(opt)} onChange={(e) => {
                    const current = form.specifics.spaces || [];
                    if (e.target.checked) updateSpecific('spaces', [...current, opt]);
                    else updateSpecific('spaces', current.filter((i: string) => i !== opt));
                  }} className="text-[#b8924a] focus:ring-[#b8924a] rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Besoins matériels</label>
            <div className="flex flex-wrap gap-2">
              {['Fleurs naturelles', 'Fleurs artificielles', 'Lumières d\'ambiance', 'Drapage / Tissus', 'Centres de table', 'Arche', 'Mobilier décoratif'].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:border-[#b8924a] transition-colors">
                  <input type="checkbox" checked={form.specifics.materials?.includes(opt)} onChange={(e) => {
                    const current = form.specifics.materials || [];
                    if (e.target.checked) updateSpecific('materials', [...current, opt]);
                    else updateSpecific('materials', current.filter((i: string) => i !== opt));
                  }} className="text-[#b8924a] focus:ring-[#b8924a] rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (category.includes('dj') || category.includes('animat') || category.includes('sono')) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Type d'animation *</label>
              <select required value={form.specifics.animType || ""} onChange={e => updateSpecific('animType', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50">
                <option value="">Sélectionnez...</option>
                <option value="DJ uniquement">DJ uniquement</option>
                <option value="DJ + Animateur (MC)">DJ + Animateur (MC)</option>
                <option value="Groupe Live / Orchestre">Groupe Live / Orchestre</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Durée (Heures)</label>
              <input type="number" min="1" value={form.specifics.duration || ""} onChange={e => updateSpecific('duration', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Matériel requis</label>
            <div className="flex flex-wrap gap-2">
              {['Sonorisation incluse', 'Éclairage piste de danse', 'Éclairage architectural', 'Machine à fumée/brouillard', 'Micros sans fil', 'Écran / Vidéoprojecteur'].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:border-[#b8924a] transition-colors">
                  <input type="checkbox" checked={form.specifics.equipments?.includes(opt)} onChange={(e) => {
                    const current = form.specifics.equipments || [];
                    if (e.target.checked) updateSpecific('equipments', [...current, opt]);
                    else updateSpecific('equipments', current.filter((i: string) => i !== opt));
                  }} className="text-[#b8924a] focus:ring-[#b8924a] rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Styles musicaux préférés</label>
            <input type="text" value={form.specifics.music || ""} onChange={e => updateSpecific('music', e.target.value)} placeholder="Ex: Afrobeats, Pop, Années 80, Mbalax..." className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
          </div>
        </div>
      );
    }

    if (category.includes('salle') || category.includes('lieu')) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Configuration *</label>
              <select required value={form.specifics.setup || ""} onChange={e => updateSpecific('setup', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50">
                <option value="">Sélectionnez...</option>
                <option value="Banquet (Tables rondes)">Banquet (Tables rondes)</option>
                <option value="Théâtre (Chaises alignées)">Théâtre (Chaises alignées)</option>
                <option value="Cocktail (Debout)">Cocktail (Debout)</option>
                <option value="En U">En U</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Capacité minimum</label>
              <input type="number" min="1" value={form.specifics.capacity || event?.guestsCount || ""} onChange={e => updateSpecific('capacity', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Services et Équipements</label>
            <div className="flex flex-wrap gap-2">
              {['Tables et chaises incluses', 'Espace traiteur/cuisine', 'Climatisation', 'Parking privé', 'Agent de sécurité', 'Sonorisation de base', 'Accès PMR'].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:border-[#b8924a] transition-colors">
                  <input type="checkbox" checked={form.specifics.features?.includes(opt)} onChange={(e) => {
                    const current = form.specifics.features || [];
                    if (e.target.checked) updateSpecific('features', [...current, opt]);
                    else updateSpecific('features', current.filter((i: string) => i !== opt));
                  }} className="text-[#b8924a] focus:ring-[#b8924a] rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (category.includes('fleur')) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Compositions florales souhaitées</label>
            <div className="flex flex-wrap gap-2">
              {['Bouquet de mariée', 'Boutonnières', 'Centres de table', 'Décoration d\'arche', 'Allée centrale', 'Décoration voiture', 'Couronnes de fleurs'].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:border-[#b8924a] transition-colors">
                  <input type="checkbox" checked={form.specifics.flowers?.includes(opt)} onChange={(e) => {
                    const current = form.specifics.flowers || [];
                    if (e.target.checked) updateSpecific('flowers', [...current, opt]);
                    else updateSpecific('flowers', current.filter((i: string) => i !== opt));
                  }} className="text-[#b8924a] focus:ring-[#b8924a] rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Style ou fleurs préférées</label>
            <input type="text" value={form.specifics.floralStyle || ""} onChange={e => updateSpecific('floralStyle', e.target.value)} placeholder="Ex: Roses blanches, pampa, eucalyptus, style champêtre..." className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
          </div>
        </div>
      );
    }

    if (category.includes('maquill') || category.includes('coiff') || category.includes('beaut')) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de personnes *</label>
              <input type="number" min="1" required value={form.specifics.peopleCount || 1} onChange={e => updateSpecific('peopleCount', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Lieu de prestation *</label>
              <select required value={form.specifics.locationType || ""} onChange={e => updateSpecific('locationType', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50">
                <option value="">Sélectionnez...</option>
                <option value="À domicile / Hôtel">À domicile / Hôtel</option>
                <option value="En salon">En salon</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Prestations souhaitées</label>
            <div className="flex flex-wrap gap-2">
              {['Maquillage mariée', 'Coiffure mariée', 'Essai avant le jour J', 'Maquillage invités', 'Coiffure invités', 'Retouches pendant l\'événement'].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:border-[#b8924a] transition-colors">
                  <input type="checkbox" checked={form.specifics.services?.includes(opt)} onChange={(e) => {
                    const current = form.specifics.services || [];
                    if (e.target.checked) updateSpecific('services', [...current, opt]);
                    else updateSpecific('services', current.filter((i: string) => i !== opt));
                  }} className="text-[#b8924a] focus:ring-[#b8924a] rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (category.includes('transport') || category.includes('véhicul') || category.includes('vehicul')) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Type de véhicule *</label>
              <select required value={form.specifics.vehicleType || ""} onChange={e => updateSpecific('vehicleType', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50">
                <option value="">Sélectionnez...</option>
                <option value="Voiture de luxe">Voiture de luxe</option>
                <option value="Limousine">Limousine</option>
                <option value="Voiture de collection">Voiture de collection</option>
                <option value="Minibus / Navette">Minibus / Navette (Invités)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Avec chauffeur ? *</label>
              <select required value={form.specifics.driver || ""} onChange={e => updateSpecific('driver', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50">
                <option value="">Sélectionnez...</option>
                <option value="Oui">Oui</option>
                <option value="Non (Location simple)">Non (Location simple)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Trajet prévu</label>
            <input type="text" value={form.specifics.route || ""} onChange={e => updateSpecific('route', e.target.value)} placeholder="Ex: De l'hôtel à la mairie, puis vers la salle de réception..." className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
          </div>
        </div>
      );
    }

    if (category.includes('planner') || category.includes('organisat') || category.includes('coordinat')) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Niveau d'accompagnement *</label>
              <select required value={form.specifics.planningLevel || ""} onChange={e => updateSpecific('planningLevel', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50">
                <option value="">Sélectionnez...</option>
                <option value="Organisation de A à Z">Organisation de A à Z</option>
                <option value="Organisation partielle">Organisation partielle</option>
                <option value="Coordination du Jour J">Coordination du Jour J</option>
                <option value="Conseil uniquement">Conseil uniquement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Taille de l'événement</label>
              <select value={form.specifics.eventSize || ""} onChange={e => updateSpecific('eventSize', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50">
                <option value="">Sélectionnez...</option>
                <option value="Intime (- de 50 pers.)">Intime (- de 50 pers.)</option>
                <option value="Moyen (50 à 150 pers.)">Moyen (50 à 150 pers.)</option>
                <option value="Grand (150 à 300 pers.)">Grand (150 à 300 pers.)</option>
                <option value="Très grand (+ de 300 pers.)">Très grand (+ de 300 pers.)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Missions spécifiques souhaitées</label>
            <div className="flex flex-wrap gap-2">
              {['Recherche de lieu', 'Recherche de prestataires', 'Gestion du budget', 'Scénographie/Décoration', 'Gestion des invitations', 'Accueil des invités', 'Logistique hébergement'].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:border-[#b8924a] transition-colors">
                  <input type="checkbox" checked={form.specifics.missions?.includes(opt)} onChange={(e) => {
                    const current = form.specifics.missions || [];
                    if (e.target.checked) updateSpecific('missions', [...current, opt]);
                    else updateSpecific('missions', current.filter((i: string) => i !== opt));
                  }} className="text-[#b8924a] focus:ring-[#b8924a] rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (category.includes('pâtiss') || category.includes('patiss') || category.includes('cake')) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Type de gâteau *</label>
              <select required value={form.specifics.cakeType || ""} onChange={e => updateSpecific('cakeType', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50">
                <option value="">Sélectionnez...</option>
                <option value="Wedding Cake / Gâteau à étages">Wedding Cake / Gâteau à étages</option>
                <option value="Nude Cake">Nude Cake</option>
                <option value="Pièce montée traditionnelle">Pièce montée (Choux)</option>
                <option value="Mignardises / Buffet de desserts">Mignardises / Buffet de desserts</option>
                <option value="Gâteau d'anniversaire personnalisé">Gâteau d'anniversaire personnalisé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de parts *</label>
              <input type="number" min="1" required value={form.specifics.slices || event?.guestsCount || ""} onChange={e => updateSpecific('slices', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Options supplémentaires</label>
            <div className="flex flex-wrap gap-2">
              {['Dégustation avant événement', 'Livraison sur le lieu', 'Installation sur présentoir', 'Figurine / Cake Topper personnalisé', 'Fleurs fraîches sur le gâteau', 'Option Sans Gluten', 'Option Vegan'].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:border-[#b8924a] transition-colors">
                  <input type="checkbox" checked={form.specifics.cakeOptions?.includes(opt)} onChange={(e) => {
                    const current = form.specifics.cakeOptions || [];
                    if (e.target.checked) updateSpecific('cakeOptions', [...current, opt]);
                    else updateSpecific('cakeOptions', current.filter((i: string) => i !== opt));
                  }} className="text-[#b8924a] focus:ring-[#b8924a] rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Parfums souhaités (Génoise, fourrage...)</label>
            <input type="text" value={form.specifics.flavors || ""} onChange={e => updateSpecific('flavors', e.target.value)} placeholder="Ex: Vanille / Framboise, Chocolat praliné..." className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
          </div>
        </div>
      );
    }

    if (category.includes('imprim') || category.includes('papeterie') || category.includes('design')) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Éléments à imprimer / designer</label>
            <div className="flex flex-wrap gap-2">
              {['Faire-part / Invitations', 'Enveloppes personnalisées', 'Menus', 'Marque-places', 'Plan de table', 'Panneau de bienvenue', 'Cartes de remerciement', 'Livrets de messe/cérémonie', 'Étiquettes cadeaux'].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:border-[#b8924a] transition-colors">
                  <input type="checkbox" checked={form.specifics.prints?.includes(opt)} onChange={(e) => {
                    const current = form.specifics.prints || [];
                    if (e.target.checked) updateSpecific('prints', [...current, opt]);
                    else updateSpecific('prints', current.filter((i: string) => i !== opt));
                  }} className="text-[#b8924a] focus:ring-[#b8924a] rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Quantité estimée</label>
              <input type="number" min="1" value={form.specifics.printQuantity || ""} onChange={e => updateSpecific('printQuantity', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Finitions souhaitées</label>
              <select value={form.specifics.finish || ""} onChange={e => updateSpecific('finish', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50">
                <option value="">Sélectionnez...</option>
                <option value="Classique (Papier standard)">Classique (Papier standard)</option>
                <option value="Premium (Papier texturé, mat, brillant)">Premium (Papier texturé, mat, brillant)</option>
                <option value="Luxe (Dorure à chaud, relief, plexiglas)">Luxe (Dorure à chaud, relief, plexiglas)</option>
                <option value="Écologique (Papier recyclé/ensemencé)">Écologique (Papier recyclé/ensemencé)</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    if (category.includes('mobilier') || category.includes('matériel') || category.includes('location')) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Matériel recherché</label>
            <div className="flex flex-wrap gap-2">
              {['Chaises (Chiavari, Napoléon...)', 'Tables (Rondes, Rectangulaires)', 'Mange-debout', 'Tentes / Chapiteaux', 'Vaisselle / Couverts / Verres', 'Espace Lounge (Canapés, Poufs)', 'Matériel de cuisine', 'Chauffage / Climatisation mobile'].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:border-[#b8924a] transition-colors">
                  <input type="checkbox" checked={form.specifics.rentals?.includes(opt)} onChange={(e) => {
                    const current = form.specifics.rentals || [];
                    if (e.target.checked) updateSpecific('rentals', [...current, opt]);
                    else updateSpecific('rentals', current.filter((i: string) => i !== opt));
                  }} className="text-[#b8924a] focus:ring-[#b8924a] rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Livraison souhaitée ?</label>
              <select required value={form.specifics.delivery || ""} onChange={e => updateSpecific('delivery', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50">
                <option value="">Sélectionnez...</option>
                <option value="Oui, avec installation">Oui, avec installation</option>
                <option value="Oui, dépôt seulement">Oui, dépôt seulement</option>
                <option value="Non, retrait en magasin">Non, retrait en magasin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Date de récupération/retour</label>
              <input type="text" value={form.specifics.returnDate || ""} onChange={e => updateSpecific('returnDate', e.target.value)} placeholder="Ex: Retour le lendemain matin" className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
            </div>
          </div>
        </div>
      );
    }

    if (category.includes('sécurit') || category.includes('securit') || category.includes('gardien')) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre d'agents souhaités</label>
              <input type="number" min="1" value={form.specifics.agents || ""} onChange={e => updateSpecific('agents', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Horaires de couverture *</label>
              <input type="text" required value={form.specifics.securityHours || ""} onChange={e => updateSpecific('securityHours', e.target.value)} placeholder="Ex: De 20h00 à 05h00" className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Missions de sécurité</label>
            <div className="flex flex-wrap gap-2">
              {['Contrôle des invitations (Filtrage)', 'Sécurisation du parking / Voiturier', 'Gestion des flux / Foule', 'Ronde de nuit', 'Sécurité incendie (SSIAP)'].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:border-[#b8924a] transition-colors">
                  <input type="checkbox" checked={form.specifics.securityTasks?.includes(opt)} onChange={(e) => {
                    const current = form.specifics.securityTasks || [];
                    if (e.target.checked) updateSpecific('securityTasks', [...current, opt]);
                    else updateSpecific('securityTasks', current.filter((i: string) => i !== opt));
                  }} className="text-[#b8924a] focus:ring-[#b8924a] rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (category.includes('enfant') || category.includes('baby') || category.includes('nounou')) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre d'enfants estimé *</label>
              <input type="number" min="1" required value={form.specifics.kidsCount || ""} onChange={e => updateSpecific('kidsCount', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tranches d'âge dominantes</label>
              <select value={form.specifics.kidsAge || ""} onChange={e => updateSpecific('kidsAge', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50">
                <option value="">Sélectionnez...</option>
                <option value="Bébés (0 - 3 ans)">Bébés (0 - 3 ans)</option>
                <option value="Petits (3 - 6 ans)">Petits (3 - 6 ans)</option>
                <option value="Enfants (6 - 12 ans)">Enfants (6 - 12 ans)</option>
                <option value="Mixte (Tous les âges)">Mixte (Tous les âges)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Besoins d'animation</label>
            <div className="flex flex-wrap gap-2">
              {['Surveillance repas / sommeil', 'Jeux collectifs / Ateliers ludiques', 'Maquillage pour enfants', 'Mascotte / Spectacle de magie', 'Structure gonflable'].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:border-[#b8924a] transition-colors">
                  <input type="checkbox" checked={form.specifics.kidsAnimation?.includes(opt)} onChange={(e) => {
                    const current = form.specifics.kidsAnimation || [];
                    if (e.target.checked) updateSpecific('kidsAnimation', [...current, opt]);
                    else updateSpecific('kidsAnimation', current.filter((i: string) => i !== opt));
                  }} className="text-[#b8924a] focus:ring-[#b8924a] rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (category.includes('artist') || category.includes('groupe') || category.includes('danse') || category.includes('spectacle')) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Type de performance *</label>
              <select required value={form.specifics.performanceType || ""} onChange={e => updateSpecific('performanceType', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50">
                <option value="">Sélectionnez...</option>
                <option value="Groupe de musique Live">Groupe de musique Live</option>
                <option value="Chanteur / Chanteuse solo">Chanteur / Chanteuse solo</option>
                <option value="Danseurs / Troupe chorégraphique">Danseurs / Troupe chorégraphique</option>
                <option value="Spectacle (Magie, Cracheur de feu...)">Spectacle (Magie, Cracheur de feu...)</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Temps de passage souhaité</label>
              <input type="text" value={form.specifics.performanceTime || ""} onChange={e => updateSpecific('performanceTime', e.target.value)} placeholder="Ex: 2 passages de 30 min, pendant le repas..." className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Besoins techniques</label>
            <div className="flex flex-wrap gap-2">
              {['Le prestataire doit fournir sa sonorisation', 'La sonorisation est déjà sur place', 'Besoin de loges', 'Repas prestataire à prévoir'].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:border-[#b8924a] transition-colors">
                  <input type="checkbox" checked={form.specifics.artistNeeds?.includes(opt)} onChange={(e) => {
                    const current = form.specifics.artistNeeds || [];
                    if (e.target.checked) updateSpecific('artistNeeds', [...current, opt]);
                    else updateSpecific('artistNeeds', current.filter((i: string) => i !== opt));
                  }} className="text-[#b8924a] focus:ring-[#b8924a] rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (category.includes('héberg') || category.includes('heberg') || category.includes('hôtel') || category.includes('hotel')) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de chambres *</label>
              <input type="number" min="1" required value={form.specifics.rooms || ""} onChange={e => updateSpecific('rooms', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de nuits *</label>
              <input type="number" min="1" required value={form.specifics.nights || ""} onChange={e => updateSpecific('nights', e.target.value)} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Options et configurations</label>
            <div className="flex flex-wrap gap-2">
              {['Chambres Doubles', 'Chambres Simples', 'Suites (Mariés/VIP)', 'Lits supplémentaires (Enfants)', 'Petit-déjeuner inclus', 'Accès SPA/Piscine', 'Navette aéroport'].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:border-[#b8924a] transition-colors">
                  <input type="checkbox" checked={form.specifics.hotelOptions?.includes(opt)} onChange={(e) => {
                    const current = form.specifics.hotelOptions || [];
                    if (e.target.checked) updateSpecific('hotelOptions', [...current, opt]);
                    else updateSpecific('hotelOptions', current.filter((i: string) => i !== opt));
                  }} className="text-[#b8924a] focus:ring-[#b8924a] rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Default Fallback


    return (
      <div>
         <label className="block text-sm font-bold text-gray-700 mb-1">Quantité / Nombre de jours</label>
         <input type="number" min="1" value={form.needs_quantity} onChange={e => setForm({...form, needs_quantity: Number(e.target.value)})} className="w-full md:w-1/2 border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50" />
      </div>
    );
  };

  const getStepTitle = (s: number) => {
    switch (s) {
      case 1: return "Votre Événement";
      case 2: return "Votre Besoin";
      case 3: return "Détails & Préférences";
      case 4: return "Budget & Infos";
      case 5: return "Récapitulatif";
      default: return "";
    }
  };

  const validateStep = () => {
    if (step === 1) return true; // Just reviewing event info
    if (step === 2) return form.needs_description.trim() !== "";
    if (step === 3) return true; // Form fields handle their own required attributes
    if (step === 4) return form.client_name.trim() !== "" && form.client_phone.trim() !== "";
    return true;
  };

  const submitForm = async () => {
    setLoading(true);

    // Compiling the full description into needs_description to avoid DB changes
    let fullDescription = `=== BESOIN PRINCIPAL ===\n${form.needs_description}\n\n`;
    
    if (Object.keys(form.specifics).length > 0) {
      fullDescription += `=== DÉTAILS SPÉCIFIQUES ===\n`;
      for (const [key, val] of Object.entries(form.specifics)) {
        if (Array.isArray(val)) {
          if (val.length > 0) fullDescription += `- ${key}: ${val.join(', ')}\n`;
        } else if (val) {
          fullDescription += `- ${key}: ${val}\n`;
        }
      }
      fullDescription += `\n`;
    }

    fullDescription += `=== PRÉFÉRENCES ===\n`;
    if (form.theme_style) fullDescription += `- Thème/Style: ${form.theme_style}\n`;
    if (form.colors) fullDescription += `- Couleurs: ${form.colors}\n`;
    if (form.level) fullDescription += `- Niveau de prestation: ${form.level}\n`;
    if (form.options.length > 0) fullDescription += `- Options supplémentaires: ${form.options.join(', ')}\n`;
    if (form.constraints) fullDescription += `- Contraintes: ${form.constraints}\n`;
    if (form.budget_flexible) fullDescription += `- Budget: Flexible\n`;
    if (form.message_final) fullDescription += `\n=== MESSAGE ===\n${form.message_final}\n`;

    if (inspirations.length > 0) {
      setIsUploading(true);
      fullDescription += `\n=== INSPIRATIONS & PIÈCES JOINTES ===\n`;
      for (const file of inspirations) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `devis/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('evenium_assets')
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = supabase.storage.from('evenium_assets').getPublicUrl(filePath);
          fullDescription += `- ${file.name}: ${data.publicUrl}\n`;
        } else {
          console.error("Upload error:", uploadError);
        }
      }
      setIsUploading(false);
    }

    const insertData = {
      event_id: event?.id,
      prestataire_id: provider.id,
      status: 'Nouvelle',
      service_name: service.nom_service,
      catalogue_id: service.id,
      client_name: form.client_name,
      client_phone: form.client_phone,
      client_whatsapp: form.client_whatsapp,
      client_email: form.client_email,
      event_type: event?.type || '',
      event_date: event?.date || '',
      event_time: event?.time || '',
      event_location: event?.location || '',
      event_guests: event?.guestsCount || 0,
      needs_description: fullDescription,
      needs_options: "", // Stored in fullDescription
      needs_quantity: form.needs_quantity || 1,
      budget_indicatif: form.budget_indicatif ? Number(form.budget_indicatif) : null,
      budget_propose: form.budget_indicatif ? Number(form.budget_indicatif) : 0,
    };

    const { error } = await supabase.from('demandes_devis').insert(insertData);

    if (error) {
      alert("Erreur lors de l'envoi de la demande : " + error.message);
      setLoading(false);
    } else {
      // Notification personnalisée selon le correspondant
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const providerName = provider?.nom || provider?.full_name || provider?.name || "Prestataire";
        await supabase.from('messages').insert({
          sender_id: user.id,
          receiver_id: provider.id,
          content: `Bonjour ${providerName},\n\nJe souhaiterais solliciter une proposition de devis de votre part pour la prestation « ${service.nom_service} ».\n\nPourriez-vous consulter votre espace « Demandes de devis » afin de m'établir une proposition tarifaire détaillée ?\n\nMerci d'avance pour votre proposition !`
        });
        sendQuoteRequestPushAction(provider.id, user.user_metadata?.full_name || "Un client", event?.name).catch(() => {});
      }
      setLoading(false);
      setIsSuccess(true);
      onSubmitSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-6 flex flex-col shrink-0 relative z-10">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
          
          {!isSuccess && (
            <>
              <h2 className="font-serif text-3xl font-bold text-gray-900 mb-1">Demander une proposition de devis</h2>
              <p className="text-gray-500 mb-6">Décrivez votre besoin pour recevoir une proposition tarifaire sur-mesure de la part du prestataire.</p>
              
              <div className="flex items-center gap-3 bg-[#f5eee1] p-3 rounded-xl border border-[#e4d8c4]">
                <div className="bg-[#b8924a] text-white p-2 rounded-lg"><Briefcase size={16} /></div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Offre sélectionnée</p>
                  <p className="font-bold text-gray-900">{service.nom_service} <span className="text-gray-400 font-normal">chez {provider.name}</span></p>
                </div>
              </div>
              
              {/* Stepper */}
              <div className="flex items-center mt-8 px-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 ${step === s ? 'bg-[#b8924a] text-white ring-4 ring-[#b8924a]/20' : step > s ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {step > s ? <CheckCircle size={14} /> : s}
                    </div>
                    {s < 5 && (
                      <div className={`h-1 flex-1 mx-2 rounded-full transition-colors duration-300 ${step > s ? 'bg-black' : 'bg-gray-100'}`}></div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-white hide-scrollbar">
          
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center text-center py-12 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={48} className="text-green-500" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Votre demande a bien été envoyée</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Le prestataire <strong>{provider.name}</strong> a été notifié. Il pourra consulter votre demande et vous transmettre son devis directement depuis Evenium.
              </p>
              <button onClick={onClose} className="px-4 sm:px-6 lg:px-8 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors shadow-xl">
                Fermer et retourner au catalogue
              </button>
            </div>
          ) : (
            <form id="intelligent-quote-form" onSubmit={(e) => { e.preventDefault(); if (step === 5) submitForm(); else setStep(s => s + 1); }} className="space-y-8">
              
              {/* STEP 1 */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">{getStepTitle(1)}</h3>
                  
                  {event ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm"><CheckCircle size={20} className="text-[#b8924a]" /></div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase">Type d'événement</p>
                          <p className="font-semibold text-gray-900">{event.type || 'Non défini'}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm"><Calendar size={20} className="text-[#b8924a]" /></div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase">Date & Heure</p>
                          <p className="font-semibold text-gray-900">{event.date || 'Non définie'} {event.time ? `à ${event.time}` : ''}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm"><MapPin size={20} className="text-[#b8924a]" /></div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase">Lieu</p>
                          <p className="font-semibold text-gray-900">{event.location || 'Non défini'}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm"><Users size={20} className="text-[#b8924a]" /></div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase">Participants</p>
                          <p className="font-semibold text-gray-900">{event.guestsCount || 'Non défini'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 text-amber-800 p-4 rounded-xl flex gap-3 text-sm">
                      <Info size={20} className="shrink-0" />
                      <p>Aucun événement contextuel n'a été trouvé. Le prestataire ne verra pas ces informations de base.</p>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <p className="text-xs text-gray-400 mr-auto flex items-center">Ces informations seront envoyées avec votre demande.</p>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">{getStepTitle(2)}</h3>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Décrivez votre besoin en quelques mots *</label>
                    <textarea 
                      required 
                      value={form.needs_description} 
                      onChange={e => setForm({...form, needs_description: e.target.value})} 
                      className="w-full border-gray-200 border rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors min-h-[160px] resize-y" 
                      placeholder="Ex: Nous organisons notre mariage et recherchons une prestation complète pour le dîner. Nous aimerions un mélange de plats locaux et internationaux, avec un vin d'honneur en extérieur..."
                    ></textarea>
                    {form.needs_description.trim() === "" && <p className="text-red-500 text-xs mt-1">Ce champ est requis.</p>}
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                  
                  <section>
                    <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-6">Besoins spécifiques : {category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                    {renderSpecificQuestions()}
                  </section>

                  <section className="pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Vos préférences globales</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Thème / Ambiance souhaitée</label>
                        <input type="text" value={form.theme_style} onChange={e => setForm({...form, theme_style: e.target.value})} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50 focus:bg-white" placeholder="Ex: Bohème chic, Champêtre, Moderne, Traditionnel..." />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Couleurs dominantes</label>
                        <input type="text" value={form.colors} onChange={e => setForm({...form, colors: e.target.value})} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50 focus:bg-white" placeholder="Ex: Blanc et Or, Tons pastel..." />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-bold text-gray-700 mb-3">Niveau de prestation attendu</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Essentiel', 'Standard', 'Premium', 'Sur mesure'].map(lvl => (
                          <div 
                            key={lvl}
                            onClick={() => setForm({...form, level: lvl})}
                            className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${form.level === lvl ? 'bg-black text-white border-black font-bold shadow-md scale-[1.02]' : 'bg-white text-gray-600 border-gray-200 hover:border-black'}`}
                          >
                            <span className="text-sm">{lvl}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Contraintes ou particularités</label>
                      <textarea value={form.constraints} onChange={e => setForm({...form, constraints: e.target.value})} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50 focus:bg-white min-h-[80px] resize-y" placeholder="Ex: Accès difficile au 3ème étage sans ascenseur, horaires stricts de démontage..."></textarea>
                    </div>
                  </section>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                  <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">{getStepTitle(4)}</h3>
                  
                  {/* Budget */}
                  <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">Votre budget (Facultatif)</h4>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Budget indicatif (FCFA)</label>
                        <input type="number" min="0" value={form.budget_indicatif} onChange={e => setForm({...form, budget_indicatif: e.target.value})} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-white" placeholder="Ex: 500000" />
                      </div>
                      <div className="flex flex-col justify-center mt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <div className={`w-10 h-6 rounded-full transition-colors relative ${form.budget_flexible ? 'bg-[#b8924a]' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${form.budget_flexible ? 'translate-x-5' : 'translate-x-1'}`}></div>
                          </div>
                          <input type="checkbox" className="hidden" checked={form.budget_flexible} onChange={e => setForm({...form, budget_flexible: e.target.checked})} />
                          <span className="text-sm font-bold text-gray-700">Mon budget est flexible</span>
                        </label>
                      </div>
                    </div>
                  </section>

                  {/* Coordonnées */}
                  <section>
                    <h4 className="font-bold text-gray-900 mb-4">Vos coordonnées de contact *</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nom complet *</label>
                        <input required type="text" value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50 focus:bg-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Téléphone *</label>
                        <input required type="tel" value={form.client_phone} onChange={e => setForm({...form, client_phone: e.target.value})} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50 focus:bg-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                        <input type="email" value={form.client_email} onChange={e => setForm({...form, client_email: e.target.value})} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50 focus:bg-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp</label>
                        <input type="tel" value={form.client_whatsapp} onChange={e => setForm({...form, client_whatsapp: e.target.value})} className="w-full border-gray-200 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50 focus:bg-white" />
                      </div>
                    </div>
                  </section>

                  {/* Documents (UI & Logic) */}
                  <section>
                    <h4 className="font-bold text-gray-900 mb-2">Ajouter des inspirations (Facultatif)</h4>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*,.pdf" 
                      className="hidden" 
                      id="inspirations-upload" 
                      onChange={handleFileChange} 
                    />
                    <label 
                      htmlFor="inspirations-upload" 
                      className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group w-full block"
                    >
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Paperclip size={20} className="text-gray-400" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">Cliquez pour ajouter des fichiers</p>
                      <p className="text-xs text-gray-500 mt-1">Images, PDF ou documents (Max 5Mo)</p>
                    </label>
                    
                    {inspirations.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {inspirations.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 text-sm">
                            <span className="truncate max-w-[150px] text-gray-700 font-medium">{file.name}</span>
                            <button 
                              type="button" 
                              onClick={() => removeFile(idx)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                </div>
              )}

              {/* STEP 5 - RECAP */}
              {step === 5 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">{getStepTitle(5)}</h3>
                  
                  <div className="bg-[#f5eee1] p-6 rounded-2xl border border-[#e4d8c4] space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs">Votre Événement</h4>
                        <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-[#b8924a] hover:underline">Modifier</button>
                      </div>
                      <p className="text-sm text-gray-700">{event?.type} • {event?.date} • {event?.location} • {event?.guestsCount} participants</p>
                    </div>

                    <div className="border-t border-[#e4d8c4] pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs">Votre Demande</h4>
                        <button type="button" onClick={() => setStep(2)} className="text-xs font-bold text-[#b8924a] hover:underline">Modifier</button>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">{service.nom_service}</p>
                      <p className="text-sm text-gray-700 bg-white/50 p-3 rounded-lg whitespace-pre-wrap">{form.needs_description}</p>
                    </div>

                    <div className="border-t border-[#e4d8c4] pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs">Détails & Préférences</h4>
                        <button type="button" onClick={() => setStep(3)} className="text-xs font-bold text-[#b8924a] hover:underline">Modifier</button>
                      </div>
                      <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                        <li>Niveau: <span className="font-semibold">{form.level}</span></li>
                        {form.theme_style && <li>Thème: <span className="font-semibold">{form.theme_style}</span></li>}
                        {Object.keys(form.specifics).length > 0 && (
                           <li>Choix spécifiques enregistrés</li>
                        )}
                        {form.constraints && <li>Contraintes: <span className="font-semibold">{form.constraints}</span></li>}
                      </ul>
                    </div>

                    <div className="border-t border-[#e4d8c4] pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs">Budget</h4>
                        <button type="button" onClick={() => setStep(4)} className="text-xs font-bold text-[#b8924a] hover:underline">Modifier</button>
                      </div>
                      <p className="text-sm text-gray-700 font-semibold">{form.budget_indicatif ? `${form.budget_indicatif} FCFA` : 'Non renseigné'} {form.budget_flexible && '(Flexible)'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Un dernier mot pour le prestataire ? (Facultatif)</label>
                    <textarea value={form.message_final} onChange={e => setForm({...form, message_final: e.target.value})} className="w-full border-gray-200 border rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#b8924a] focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors min-h-[100px] resize-y" placeholder="Ajoutez toute information qui pourrait l'aider..."></textarea>
                  </div>

                </div>
              )}

            </form>
          )}

        </div>

        {/* Footer Actions */}
        {!isSuccess && (
          <div className="bg-white border-t border-gray-100 p-6 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button 
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-6 py-3 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={18} /> Retour
              </button>
            ) : (
              <div /> // Spacer
            )}
            
            <button 
              type="submit"
              form="intelligent-quote-form"
              disabled={!validateStep() || loading || isUploading}
              className="px-4 sm:px-6 lg:px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || isUploading ? (
                <>{isUploading ? 'Téléchargement...' : 'Envoi en cours...'}</>
              ) : step === 5 ? (
                <>Envoyer ma demande <CheckCircle size={18} /></>
              ) : (
                <>Étape Suivante <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
