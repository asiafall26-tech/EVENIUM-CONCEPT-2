"use client";

import { useState, useEffect, use } from "react";
import { Search, Star, MapPin, Phone, CheckCircle, Plus, ArrowLeft, Globe, Briefcase, Camera, Image as ImageIcon, X, Users, Clock, Share2, Heart, ChevronRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useEvents } from "@/store/EventsContext";
import { QuoteRequestModal } from "@/components/dashboard/QuoteRequestModal";
import { EVENT_TYPES } from "@/lib/eventTypes";
import { PRESTATION_TYPES } from "@/lib/devis/categories";
import { offerEventTypes, offerPrestations, offerTagLine } from "@/lib/offres";
import { RubriquesView } from "@/components/prestataire/RubriquesView";
import { activityFromProfile, providerHeadline } from "@/lib/providerProfile";
import { COUNTRIES, COUNTRY_NAMES, WHOLE_COUNTRY, locationLabel, zonesOf } from "@/lib/zones";

const ALL_EVENTS = "Tous événements";

export default function CataloguePrestatairesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  
  const [prestataires, setPrestataires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string | null>(null);
  const [prestationFilter, setPrestationFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [providerStatus, setProviderStatus] = useState<Record<string, string>>({});
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"presentation" | "catalogues" | "avis">("presentation");
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<any | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { events } = useEvents();
  const event = events.find(e => e.id === id);
  // Par défaut, on filtre sur le type de l'événement en cours
  const activeEventType = eventTypeFilter ?? (event?.type && (EVENT_TYPES as readonly string[]).includes(event.type) ? event.type : "");

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [serviceToRequest, setServiceToRequest] = useState<any | null>(null);
  const [providerToRequest, setProviderToRequest] = useState<any | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    const { data: profs } = await supabase.from('profiles').select('*, services(*)').eq('role', 'prestataire').or('is_active.eq.true,is_active.is.null');
    
    // Check which ones we already requested
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: requests } = await supabase.from('demandes_devis').select('prestataire_id, status').eq('event_id', id);
      if (requests) {
        const statusMap: Record<string, string> = {};
        requests.forEach((r: any) => {
          // If there are multiple requests, we keep the most relevant/recent one.
          // Since we order by something or just assume one request per event/provider.
          statusMap[r.prestataire_id] = r.status;
        });
        setProviderStatus(statusMap);
      }
    }
    
    if (profs) {
      setPrestataires(profs.map(p => {
        // Ne garder que les services publiés
        const publishedServices = Array.isArray(p.services) 
          ? p.services.filter((s: any) => s.status === 'Publié') 
          : [];

        const activity = activityFromProfile(p);
        return {
          id: p.id,
          name: p.full_name || 'Prestataire Anonyme',
          role: providerHeadline(p),
          eventTypes: activity.event_types,
          prestations: activity.services,
          country: activity.country,
          zones: activity.zones,
          description: p.description || 'Aucune description',
          rating: 5,
          reviews: 0,
          zone: locationLabel(activity.country, activity.zones) || p.address || 'Non renseigné',
          priceRange: 'Sur devis',
          phone: p.phone || 'Non renseigné',
          website: p.website || null,
          instagram: p.instagram || null,
          experience: p.experience || null,
          avatar_url: p.avatar_url || null,
          cover_url: p.cover_url || null,
          isPlatformProvider: p.is_evenium_certified !== false,
          services: publishedServices,
          gallery: Array.isArray(p.gallery) ? p.gallery : [],
          rubriques: p.rubriques ?? null
        };
      }));
    }
    setLoading(false);
  };

  // Prestations et pays réellement proposés par les prestataires
  const knownPrestations = new Set<string>(prestataires.flatMap((p) => [...p.prestations, ...p.services.flatMap((s: any) => offerPrestations(s))]));
  const customPrestations = [...knownPrestations].filter((x) => !PRESTATION_TYPES.includes(x)).sort();
  const countries = [...new Set([...COUNTRY_NAMES.filter((c) => prestataires.some((p) => p.country === c)), ...prestataires.map((p) => p.country).filter(Boolean)])];
  
  // Extraction de toutes les zones disponibles (par pays si pays choisi, sinon l'ensemble des zones)
  const allAvailableZones = [...new Set([
    ...COUNTRIES.flatMap((c) => c.zones),
    ...prestataires.flatMap((p) => p.zones).filter(Boolean)
  ])].filter((z: string) => z !== WHOLE_COUNTRY).sort();

  const zones = countryFilter
    ? [...new Set([
        ...zonesOf(countryFilter),
        ...prestataires.filter((p) => p.country === countryFilter).flatMap((p) => p.zones).filter((z: string) => z !== WHOLE_COUNTRY)
      ])].sort()
    : allAvailableZones;

  const activeFilters = [activeEventType, prestationFilter, countryFilter, zoneFilter].filter(Boolean).length;

  const filteredProviders = prestataires.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || [p.name, p.description, ...p.prestations].some((v: string) => (v || "").toLowerCase().includes(term));
    // Filtre automatique (type de l'événement) : on garde les prestataires qui n'ont pas encore renseigné leurs types
    const matchesEvent =
      !activeEventType ||
      p.eventTypes.includes(activeEventType) ||
      p.services.some((s: any) => offerEventTypes(s).includes(activeEventType)) ||
      (eventTypeFilter === null && p.eventTypes.length === 0);
    const matchesPrestation = !prestationFilter || p.prestations.includes(prestationFilter) || p.services.some((s: any) => offerPrestations(s).includes(prestationFilter));
    
    const matchesCountry =
      !countryFilter ||
      (p.country && p.country.toLowerCase() === countryFilter.toLowerCase()) ||
      (p.zone && p.zone.toLowerCase().includes(countryFilter.toLowerCase()));

    const targetZone = zoneFilter.toLowerCase().trim();
    const matchesZone =
      !zoneFilter ||
      p.zones.some((z: string) => (z || "").toLowerCase() === targetZone || (z || "").toLowerCase() === WHOLE_COUNTRY.toLowerCase()) ||
      (p.zone && (p.zone || "").toLowerCase().includes(targetZone)) ||
      (p.address && (p.address || "").toLowerCase().includes(targetZone));

    return matchesSearch && matchesEvent && matchesPrestation && matchesCountry && matchesZone;
  });

  const resetFilters = () => {
    setEventTypeFilter("");
    setPrestationFilter("");
    setCountryFilter("");
    setZoneFilter("");
  };

  const handleOpenRequest = (providerId: string, service: any) => {
    const provider = prestataires.find(p => p.id === providerId);
    if (!provider) return;
    setProviderToRequest(provider);
    setServiceToRequest(service);
    setIsRequestModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="text-xs text-gray-500 font-medium mb-6 flex items-center gap-2">
        <span>Événement</span> <span className="text-gray-300">&gt;</span> 
        <Link href={`/dashboard/events/${id}/prestataires`} className="hover:text-black">Mes Prestataires</Link> 
        <span className="text-gray-300">&gt;</span> 
        <span className="text-black">Catalogue</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <Link href={`/dashboard/events/${id}/prestataires`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-2 transition-colors w-fit">
            <ArrowLeft size={16} /> Retour
          </Link>
          <h1 className="font-serif text-3xl font-bold text-black mb-2 flex items-center gap-2">
            Annuaire Evenium <Star size={24} className="text-[#b8924a] fill-[#b8924a]" />
          </h1>
          <p className="text-gray-500 text-sm">Découvrez nos prestataires vérifiés et demandez-leur des devis.</p>
        </div>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] mb-8 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Rechercher un prestataire, une prestation..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8924a] text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="block">
            <span className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1.5">Type d'événement</span>
            <select value={activeEventType} onChange={(e) => setEventTypeFilter(e.target.value)} className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]">
              <option value="">Tous les événements</option>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1.5">Prestation</span>
            <select value={prestationFilter} onChange={(e) => setPrestationFilter(e.target.value)} className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]">
              <option value="">Toutes les prestations</option>
              {PRESTATION_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
              {customPrestations.length > 0 && (
                <optgroup label="Autres prestations">
                  {customPrestations.map((p) => <option key={p} value={p}>{p}</option>)}
                </optgroup>
              )}
            </select>
          </label>
          <label className="block">
            <span className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1.5">Pays</span>
            <select value={countryFilter} onChange={(e) => { setCountryFilter(e.target.value); setZoneFilter(""); }} className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]">
              <option value="">Tous les pays</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1.5">Zone d'intervention</span>
            <select
              value={zoneFilter}
              onChange={(e) => {
                const val = e.target.value;
                setZoneFilter(val);
                // Si l'utilisateur choisit une zone sans avoir sélectionné de pays, déduire le pays automatiquement
                if (val && !countryFilter) {
                  const matchCountry = COUNTRIES.find((c) => c.zones.some((z) => z.toLowerCase() === val.toLowerCase()));
                  if (matchCountry) {
                    setCountryFilter(matchCountry.name);
                  }
                }
              }}
              className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]"
            >
              <option value="">{countryFilter ? `Toutes les zones (${countryFilter})` : "Toutes les zones"}</option>
              {zones.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </label>
        </div>
        {activeFilters > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{filteredProviders.length} prestataire{filteredProviders.length > 1 ? "s" : ""} correspond{filteredProviders.length > 1 ? "ent" : ""} à vos critères</span>
            <button type="button" onClick={resetFilters} className="text-[#8f6f33] font-semibold hover:underline">Réinitialiser les filtres</button>
          </div>
        )}
      </div>

      {!loading && filteredProviders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 mb-8">
          <p className="font-serif text-2xl text-gray-900">Aucun prestataire ne correspond</p>
          <p className="text-sm text-gray-500 mt-2">Élargissez votre recherche : retirez un filtre ou choisissez une autre zone.</p>
          <button type="button" onClick={resetFilters} className="mt-5 px-5 py-2.5 rounded-full bg-black text-[#f5eee1] text-xs uppercase tracking-[0.2em]">Voir tous les prestataires</button>
        </div>
      )}

      {loading ? (
         <div className="text-center py-20 text-gray-500">Chargement des prestataires...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProviders.map((provider) => (
            <div key={provider.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col group cursor-pointer" onClick={() => { setSelectedProvider(provider); setActiveModalTab("presentation"); }}>
              <div className="h-40 bg-gray-100 relative overflow-hidden">
                {provider.avatar_url ? (
                  <img src={provider.avatar_url} alt={provider.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="font-serif text-3xl sm:text-5xl font-bold text-gray-400 opacity-20">{provider.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-[#8f6f33] flex items-center gap-1 shadow-sm">
                  <Star size={12} className="fill-[#8f6f33]" /> {provider.rating || 5}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-[#8f6f33] uppercase tracking-wider">{provider.role}</div>
                  {provider.isPlatformProvider ? (
                    <span className="bg-[#f5eee1] text-[#8f6f33] text-[9px] uppercase px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-bold">
                      <CheckCircle size={8}/> Evenium
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-500 text-[9px] uppercase px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-bold">
                      <Globe size={8}/> Externe
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">{provider.name}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{provider.description}</p>
                
                <div className="space-y-2 mb-6 mt-auto">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin size={14} className="text-gray-400" /> {provider.zone || "Dakar"}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold px-2 py-1 bg-gray-100 rounded text-gray-700">{provider.priceRange || "Sur devis"}</span>
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-50">
                  <span className="w-full py-2.5 rounded-xl text-xs font-bold text-[#b8924a] flex items-center justify-center gap-2 group-hover:bg-[#f5eee1] transition-colors">
                    Consulter les catalogues
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProvider && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50/95 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedProvider(null)}>
          <div className="min-h-screen p-4 md:p-8 flex justify-center">
            <div 
              className="bg-white w-full max-w-5xl rounded-3xl shadow-xl overflow-hidden relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedProvider(null)}
                className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/80 hover:bg-white backdrop-blur shadow-sm text-gray-800 p-2.5 rounded-full transition-colors z-20"
              >
                <ArrowLeft size={20} />
              </button>

              {/* Cover Image */}
              <div className="h-48 md:h-72 bg-[#FFF5F8] relative shrink-0">
                {selectedProvider.cover_url ? (
                  <img src={selectedProvider.cover_url} alt="Cover" className="w-full h-full object-cover" />
                ) : selectedProvider.gallery && selectedProvider.gallery.length > 0 ? (
                  <img src={selectedProvider.gallery[0]} alt="Cover" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
                ) : null}
              </div>
              
              <div className="px-6 md:px-10 pb-32">
                {/* Provider Header Box */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 -mt-12 md:-mt-16 relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Avatar */}
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden shrink-0 bg-gray-100 -mt-12 md:-mt-16">
                      {selectedProvider.avatar_url ? (
                        <img src={selectedProvider.avatar_url} alt={selectedProvider.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon size={32} />
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2 md:pt-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="font-bold text-2xl md:text-3xl text-gray-900">{selectedProvider.name}</h2>
                        <span className="bg-[#f5eee1] text-[#b8924a] text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                          {selectedProvider.role}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5"><MapPin size={16} className="text-[#b8924a]"/> {selectedProvider.zone}</span>
                        {selectedProvider.rating && <span className="flex items-center gap-1.5"><Star size={16} className="fill-[#b8924a] text-[#b8924a]"/> {selectedProvider.rating} ({selectedProvider.reviews || 0} avis)</span>}
                        {selectedProvider.experience && <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-[#b8924a]"/> {selectedProvider.experience}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 shrink-0 pt-2 md:pt-0">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm">
                      <Share2 size={16} /> Partager
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#b8924a] text-white rounded-xl hover:bg-[#8f6f33] transition-colors text-sm font-semibold shadow-sm">
                      <Heart size={16} /> Enregistrer
                    </button>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-8 border-b border-gray-100 mt-8 mb-8 text-sm font-bold text-gray-400 overflow-x-auto hide-scrollbar">
                  <span 
                    onClick={() => setActiveModalTab("presentation")}
                    className={`pb-3 px-1 whitespace-nowrap cursor-pointer transition-colors ${activeModalTab === "presentation" ? "text-[#b8924a] border-b-2 border-[#b8924a]" : "hover:text-gray-700"}`}
                  >
                    Présentation
                  </span>
                  <span 
                    onClick={() => setActiveModalTab("catalogues")}
                    className={`pb-3 px-1 whitespace-nowrap cursor-pointer transition-colors ${activeModalTab === "catalogues" ? "text-[#b8924a] border-b-2 border-[#b8924a]" : "hover:text-gray-700"}`}
                  >
                    Catalogues ({selectedProvider.services?.length || 0})
                  </span>
                  <span 
                    onClick={() => setActiveModalTab("avis")}
                    className={`pb-3 px-1 whitespace-nowrap cursor-pointer transition-colors ${activeModalTab === "avis" ? "text-[#b8924a] border-b-2 border-[#b8924a]" : "hover:text-gray-700"}`}
                  >
                    Avis ({selectedProvider.reviews || 0})
                  </span>
                </div>

                {activeModalTab === "presentation" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#f5eee1] rounded-2xl p-6 md:p-8 mb-12 border border-[#e4d8c4]">
                      <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">À propos</h3>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedProvider.description || "Aucune description."}
                      </p>
                    </div>
                    <RubriquesView value={selectedProvider.rubriques} className="mb-12" />
                  </div>
                )}

                {activeModalTab === "catalogues" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h3 className="font-serif text-3xl font-bold text-gray-900 mb-2">Nos catalogues</h3>
                    <p className="text-gray-500 text-sm mb-8">Découvrez les offres et prestations proposées par {selectedProvider.name}.</p>
                    
                    {selectedProvider.services && selectedProvider.services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {selectedProvider.services.map((service: any) => (
                          <div key={service.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                            <div className="h-44 bg-gray-100 relative">
                              {service.image_url ? (
                                <img src={service.image_url} alt={service.nom_service} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={32}/></div>
                              )}
                              <span className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)] truncate bg-[#f5eee1]/90 backdrop-blur-sm text-[#8f6f33] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded shadow-sm">
                                {offerTagLine(service)}
                              </span>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                              <div className="flex justify-between items-start gap-4 mb-4">
                                <h4 className="font-bold text-gray-900 leading-tight uppercase tracking-wide text-sm">{service.nom_service}</h4>
                                <div className="text-right shrink-0">
                                  <span className="block text-[#b8924a] font-bold text-lg">{service.prix_base ? `${Number(service.prix_base).toLocaleString()} FCFA` : 'Sur devis'}</span>
                                  {service.type_prix && service.type_prix !== 'Prix fixe' && <span className="text-[10px] text-gray-400 uppercase font-semibold">{service.type_prix}</span>}
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium mb-8">
                                {service.infos_pratiques?.capacite && <span className="flex items-center gap-1.5"><Users size={14} className="text-[#b8924a]"/> {service.infos_pratiques.capacite}</span>}
                                {service.infos_pratiques?.duree && <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#b8924a]"/> {service.infos_pratiques.duree}</span>}
                                {service.zones && service.zones.length > 0 && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#b8924a]"/> {service.zones[0]} {service.zones.length > 1 && `+${service.zones.length - 1}`}</span>}
                              </div>
                              
                              <div className="mt-auto flex flex-col gap-2">
                                <button 
                                  onClick={() => { handleOpenRequest(selectedProvider.id, service); }}
                                  disabled={!!(providerStatus[selectedProvider.id] && providerStatus[selectedProvider.id] !== 'Refusé' && providerStatus[selectedProvider.id] !== 'Annulé par le client')}
                                  className={`w-full py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                                    providerStatus[selectedProvider.id] && providerStatus[selectedProvider.id] !== 'Refusé' && providerStatus[selectedProvider.id] !== 'Annulé par le client'
                                      ? 'bg-green-50 text-green-700 border border-green-200 shadow-none'
                                      : 'bg-[#b8924a] text-white hover:bg-[#8f6f33] shadow-md'
                                  }`}
                                >
                                  {providerStatus[selectedProvider.id] && providerStatus[selectedProvider.id] !== 'Refusé' && providerStatus[selectedProvider.id] !== 'Annulé par le client' ? (
                                    <><CheckCircle size={16} /> En cours de traitement</>
                                  ) : (
                                    <><Plus size={16} /> Demander devis</>
                                  )}
                                </button>
                                <button 
                                  onClick={() => setSelectedServiceForDetails(service)}
                                  className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                                >
                                  Détails de l'offre
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 text-center text-gray-500 text-sm border border-gray-100">
                        Aucun catalogue publié pour le moment.
                      </div>
                    )}
                  </div>
                )}

                {activeModalTab === "avis" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h3 className="font-serif text-3xl font-bold text-gray-900 mb-2">Avis clients</h3>
                    <p className="text-gray-500 text-sm mb-8">Découvrez les retours d'expérience des clients ayant travaillé avec {selectedProvider.name}.</p>
                    <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 text-center text-gray-500 text-sm border border-gray-100">
                      Aucun avis publié pour ce prestataire pour le moment.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}



      {/* DETAILED CATALOGUE MODAL */}
      {selectedServiceForDetails && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative">
            <button 
              onClick={() => setSelectedServiceForDetails(null)}
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2.5 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>
            
            <div className="overflow-y-auto flex-1">
              <div className="h-80 bg-gray-100 relative">
                {selectedServiceForDetails.image_url ? (
                  <img src={selectedServiceForDetails.image_url} alt={selectedServiceForDetails.nom_service} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-3">
                    <ImageIcon size={64} />
                    <span>Image non disponible</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white pr-8">
                  <span className="bg-[#b8924a] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded shadow-sm mb-4 inline-block">
                    {offerTagLine(selectedServiceForDetails, 4)}
                  </span>
                  <h2 className="font-serif text-4xl md:text-5xl font-bold mb-2 leading-tight">{selectedServiceForDetails.nom_service}</h2>
                  <p className="text-[#b8924a] font-semibold text-xl">{selectedServiceForDetails.type_prix || 'À partir de'} {selectedServiceForDetails.prix_base ? `${Number(selectedServiceForDetails.prix_base).toLocaleString()} FCFA` : 'Sur devis'}</p>
                </div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-12">
                {selectedServiceForDetails.description && (
                  <div>
                    <p className="text-gray-600 text-lg leading-relaxed">{selectedServiceForDetails.description}</p>
                  </div>
                )}

                {selectedServiceForDetails.inclus && selectedServiceForDetails.inclus.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-6 border-b border-gray-100 pb-3">Ce qui est inclus</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedServiceForDetails.inclus.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-gray-700">
                          <CheckCircle size={20} className="text-[#b8924a] shrink-0 mt-0.5" />
                          <span className="font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedServiceForDetails.options && selectedServiceForDetails.options.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-6 border-b border-gray-100 pb-3">Options supplémentaires</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedServiceForDetails.options.map((opt: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm text-gray-700 bg-[#f5eee1] p-4 rounded-xl border border-[#e4d8c4]">
                          <span className="font-bold">{opt.name}</span>
                          <span className="font-semibold text-[#8f6f33]">{opt.price ? `+ ${Number(opt.price).toLocaleString('fr-FR')} FCFA` : 'Sur devis'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedServiceForDetails.infos_pratiques?.capacite || selectedServiceForDetails.infos_pratiques?.duree || (selectedServiceForDetails.zones && selectedServiceForDetails.zones.length > 0)) && (
                  <div>
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-6 border-b border-gray-100 pb-3">Informations pratiques</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedServiceForDetails.zones && selectedServiceForDetails.zones.length > 0 && (
                        <div className="flex flex-col gap-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-2 mb-1 text-gray-400">
                            <MapPin size={16} />
                            <p className="text-[10px] uppercase tracking-wider font-bold">Zones</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">{selectedServiceForDetails.zones.join(', ')}</p>
                        </div>
                      )}
                      {selectedServiceForDetails.infos_pratiques?.capacite && (
                        <div className="flex flex-col gap-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-2 mb-1 text-gray-400">
                            <Users size={16} />
                            <p className="text-[10px] uppercase tracking-wider font-bold">Capacité</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">{selectedServiceForDetails.infos_pratiques.capacite}</p>
                        </div>
                      )}
                      {selectedServiceForDetails.infos_pratiques?.duree && (
                        <div className="flex flex-col gap-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-2 mb-1 text-gray-400">
                            <Clock size={16} />
                            <p className="text-[10px] uppercase tracking-wider font-bold">Durée</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">{selectedServiceForDetails.infos_pratiques.duree}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedServiceForDetails.gallery && selectedServiceForDetails.gallery.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-6 border-b border-gray-100 pb-3">Aperçus de l'offre</h3>
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 snap-x">
                      {selectedServiceForDetails.gallery.map((url: string, idx: number) => (
                        <img 
                          key={idx} 
                          src={url} 
                          alt={`Gallery ${idx}`} 
                          className="h-32 w-32 object-cover rounded-2xl snap-start shrink-0 border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImages(selectedServiceForDetails.gallery);
                            setLightboxIndex(idx);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <RubriquesView value={selectedServiceForDetails.infos_pratiques?.rubriques} className="mb-10" />

                {selectedProvider && (
                  <div className="pt-8 mt-8 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-6">À propos du prestataire</h3>
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      {selectedProvider.avatar_url ? (
                        <img src={selectedProvider.avatar_url} alt="Provider" className="w-16 h-16 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <ImageIcon size={24} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-[#b8924a] font-bold uppercase tracking-wider">{selectedProvider.role}</p>
                        <p className="font-bold text-lg text-gray-900">{selectedProvider.name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12}/> {selectedProvider.zone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-gray-100 flex gap-4">
              <button 
                onClick={() => setSelectedServiceForDetails(null)}
                className="py-4 px-6 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
              >
                Fermer
              </button>
              <button 
                onClick={() => { handleOpenRequest(selectedProvider.id, selectedServiceForDetails); }}
                disabled={!!(providerStatus[selectedProvider.id] && providerStatus[selectedProvider.id] !== 'Refusé' && providerStatus[selectedProvider.id] !== 'Annulé par le client')}
                className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg ${
                  providerStatus[selectedProvider.id] && providerStatus[selectedProvider.id] !== 'Refusé' && providerStatus[selectedProvider.id] !== 'Annulé par le client' ? 'bg-green-50 text-green-700 shadow-none' : 'bg-black text-white hover:bg-gray-900 hover:shadow-xl'
                }`}
              >
                {providerStatus[selectedProvider.id] && providerStatus[selectedProvider.id] !== 'Refusé' && providerStatus[selectedProvider.id] !== 'Annulé par le client' ? <><CheckCircle size={18}/> {providerStatus[selectedProvider.id] === 'Devis envoyé' ? 'Devis Reçu' : 'En cours de traitement'}</> : <><Plus size={18}/> {providerStatus[selectedProvider.id] === 'Refusé' ? 'Demander à nouveau pour cette offre' : 'Demander un devis pour cette offre'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Modal Demande de devis Intelligente */}
      <QuoteRequestModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        event={event}
        provider={providerToRequest}
        service={serviceToRequest}
        onSubmitSuccess={() => {
          if (providerToRequest) {
            setProviderStatus({ ...providerStatus, [providerToRequest.id]: 'Nouvelle' });
          }
          fetchData();
        }}
      />

    </div>
  );
}
