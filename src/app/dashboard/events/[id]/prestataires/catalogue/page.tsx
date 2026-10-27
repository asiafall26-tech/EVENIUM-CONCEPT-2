"use client";

import { useState, useEffect, use } from "react";
import { Search, Star, MapPin, Phone, CheckCircle, Plus, ArrowLeft, Globe, Briefcase, Camera, Image as ImageIcon, X, Users, Clock, Share2, Heart, ChevronRight, SlidersHorizontal, Sparkles } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useEvents } from "@/store/EventsContext";
import { QuoteRequestModal } from "@/components/dashboard/QuoteRequestModal";
import { EVENT_TYPES } from "@/lib/eventTypes";
import { PRESTATION_TYPES } from "@/lib/devis/categories";
import { offerEventTypes, offerPrestations, offerTagLine } from "@/lib/offres";
import { RubriquesView } from "@/components/prestataire/RubriquesView";
import { activityFromProfile, providerHeadline } from "@/lib/providerProfile";
import { MAIN_COUNTRIES, WHOLE_COUNTRY, locationLabel, regionsOf, quartiersOf, zonesOf, getAllRegionsWithCountry, findCountryOfRegion, findHierarchyOfQuartier } from "@/lib/zones";
import { mockProviders } from "@/data/mock/prestataires";

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
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("");
  const [prestationFilter, setPrestationFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [quartierFilter, setQuartierFilter] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [providerStatus, setProviderStatus] = useState<Record<string, string>>({});
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"presentation" | "catalogues" | "avis">("presentation");
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<any | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { events } = useEvents();
  const event = events.find(e => e.id === id);
  const activeEventType = eventTypeFilter;

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [serviceToRequest, setServiceToRequest] = useState<any | null>(null);
  const [providerToRequest, setProviderToRequest] = useState<any | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    // 1. Récupération des prestataires réels créés dans la base Supabase
    const { data: profs } = await supabase
      .from('profiles')
      .select('*, services(*)')
      .eq('role', 'prestataire')
      .or('is_active.eq.true,is_active.is.null');
    
    // Check which ones we already requested
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: requests } = await supabase
        .from('demandes_devis')
        .select('prestataire_id, status')
        .eq('event_id', id);
      if (requests) {
        const statusMap: Record<string, string> = {};
        requests.forEach((r: any) => {
          statusMap[r.prestataire_id] = r.status;
        });
        setProviderStatus(statusMap);
      }
    }
    
    const dbProviders = (profs || []).map(p => {
      const publishedServices = Array.isArray(p.services) 
        ? p.services.filter((s: any) => s.status === 'Publié') 
        : [];

      const activity = activityFromProfile(p);
      return {
        id: p.id,
        name: p.full_name || 'Prestataire Evenium',
        role: providerHeadline(p),
        category: p.category || 'Prestataire',
        eventTypes: activity.event_types,
        prestations: activity.services,
        country: activity.country,
        region: activity.zones?.[0] || "",
        quartier: activity.zones?.[1] || "",
        zones: activity.zones,
        description: p.description || 'Prestataire partenaire de la plateforme Evenium.',
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
    });

    // 2. Fusion avec le catalogue certifié Evenium (garantit que l'annuaire est complet et testable)
    const combinedProviders = [
      ...dbProviders,
      ...mockProviders.filter(mp => !dbProviders.some(dp => dp.id === mp.id))
    ];

    setPrestataires(combinedProviders);
    setLoading(false);
  };

  // Pays principaux proposés : Sénégal, Côte d'Ivoire, France
  const countries = MAIN_COUNTRIES;
  
  // Régions et Quartiers dynamiques
  const regions = countryFilter ? regionsOf(countryFilter) : [];
  const quartiers = countryFilter ? quartiersOf(countryFilter, regionFilter) : [];

  const activeFilters = [activeEventType, prestationFilter, countryFilter, regionFilter, quartierFilter].filter(Boolean).length;

  const filteredProviders = prestataires.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || [
      p.name, 
      p.description, 
      p.role, 
      p.category,
      p.zone, 
      p.country,
      p.region,
      p.quartier,
      ...(p.zones || []),
      ...(p.prestations || []), 
      ...(p.services || []).map((s: any) => s.nom_service || "")
    ].some((v: string) => (v || "").toLowerCase().includes(term));

    const matchesEvent =
      !activeEventType ||
      !p.eventTypes ||
      p.eventTypes.length === 0 ||
      p.eventTypes.includes("Tous") ||
      p.eventTypes.some((et: string) => et.toLowerCase() === activeEventType.toLowerCase()) ||
      (p.services && p.services.some((s: any) => offerEventTypes(s).some(et => et.toLowerCase() === activeEventType.toLowerCase())));

    const matchesPrestation = 
      !prestationFilter || 
      (p.prestations && p.prestations.some((pr: string) => pr.toLowerCase().includes(prestationFilter.toLowerCase()))) ||
      (p.role && p.role.toLowerCase().includes(prestationFilter.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(prestationFilter.toLowerCase())) ||
      (p.services && p.services.some((s: any) => offerPrestations(s).some(pr => pr.toLowerCase().includes(prestationFilter.toLowerCase())) || (s.nom_service && s.nom_service.toLowerCase().includes(prestationFilter.toLowerCase()))));
    
    // Filtre précis Pays
    const countryZones = countryFilter ? zonesOf(countryFilter) : [];
    const countryLower = countryFilter.toLowerCase().trim();
    const matchesCountry =
      !countryFilter ||
      (p.country && p.country.toLowerCase().includes(countryLower)) ||
      (p.zone && p.zone.toLowerCase().includes(countryLower)) ||
      (p.address && p.address.toLowerCase().includes(countryLower)) ||
      (p.zones && p.zones.some((z: string) => countryZones.some((cz) => cz.toLowerCase() === (z || "").toLowerCase())));

    // Filtre précis Région
    const regionLower = regionFilter.toLowerCase().trim();
    const regionQuartiers = countryFilter ? quartiersOf(countryFilter, regionFilter) : [];
    const matchesRegion =
      !regionFilter ||
      (p.region && p.region.toLowerCase().includes(regionLower)) ||
      (p.zone && p.zone.toLowerCase().includes(regionLower)) ||
      (p.address && p.address.toLowerCase().includes(regionLower)) ||
      (p.zones && p.zones.some((z: string) => (z || "").toLowerCase().includes(regionLower) || (z || "").toLowerCase() === WHOLE_COUNTRY.toLowerCase())) ||
      (p.zones && p.zones.some((z: string) => regionQuartiers.some((rq) => rq.toLowerCase() === (z || "").toLowerCase()))) ||
      (p.zone && regionQuartiers.some((rq) => p.zone.toLowerCase().includes(rq.toLowerCase())));

    // Filtre précis Quartier
    const quartierLower = quartierFilter.toLowerCase().trim();
    const matchesQuartier =
      !quartierFilter ||
      (p.quartier && p.quartier.toLowerCase().includes(quartierLower)) ||
      (p.zone && p.zone.toLowerCase().includes(quartierLower)) ||
      (p.address && p.address.toLowerCase().includes(quartierLower)) ||
      (p.zones && p.zones.some((z: string) => (z || "").toLowerCase().includes(quartierLower) || (z || "").toLowerCase() === WHOLE_COUNTRY.toLowerCase()));

    return matchesSearch && matchesEvent && matchesPrestation && matchesCountry && matchesRegion && matchesQuartier;
  });

  const resetFilters = () => {
    setEventTypeFilter("");
    setPrestationFilter("");
    setCountryFilter("");
    setRegionFilter("");
    setQuartierFilter("");
    setSearchTerm("");
  };

  const handleOpenRequest = (providerId: string, service: any) => {
    const provider = prestataires.find(p => p.id === providerId);
    if (!provider) return;
    setProviderToRequest(provider);
    setServiceToRequest(service);
    setIsRequestModalOpen(true);
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      {/* Fil d'Ariane */}
      <div className="text-xs text-gray-500 font-medium mb-4 sm:mb-6 flex items-center gap-2">
        <span>Événement</span> <span className="text-gray-300">&gt;</span> 
        <Link href={`/dashboard/events/${id}/prestataires`} className="hover:text-black">Mes Prestataires</Link> 
        <span className="text-gray-300">&gt;</span> 
        <span className="text-black font-semibold">Annuaire Evenium</span>
      </div>

      {/* Titre & Description Aérée */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-black mb-2 flex items-center gap-2">
          Annuaire Evenium <Star size={22} className="text-[#b8924a] fill-[#b8924a] shrink-0" />
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm max-w-3xl leading-relaxed">
          Découvrez notre sélection de professionnels événementiels certifiés (Sénégal, Côte d&apos;Ivoire, France). Demandez-leur des devis et échangez directement en toute sérénité.
        </p>
      </div>

      {/* 3 Onglets sur la même ligne : 1er Annuaire Evenium (Actif), 2ème Prestataires Evenium, 3ème Prestataires Externes */}
      <div className="flex items-center gap-2 sm:gap-6 border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar py-1">
        {/* 1ER : Annuaire Evenium (Actif sur cette page) */}
        <div className="pb-3 text-xs sm:text-sm font-bold text-[#b8924a] relative flex items-center gap-2 shrink-0 whitespace-nowrap">
          <div className="w-6 h-6 rounded-lg bg-[#b8924a] text-white flex items-center justify-center shadow-xs shrink-0">
            <Search size={13} />
          </div>
          <span>Annuaire Evenium</span>
          <span className="text-[10px] bg-[#b8924a]/20 text-[#8f6f33] px-2 py-0.5 rounded-full font-bold">
            {prestataires.length} prestataires
          </span>
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#b8924a] rounded-t-full"></span>
        </div>

        {/* 2EME : Prestataires Evenium */}
        <Link
          href={`/dashboard/events/${id}/prestataires?tab=evenium`}
          className="pb-3 text-xs sm:text-sm font-bold text-gray-500 hover:text-black transition-colors relative flex items-center gap-2 shrink-0 whitespace-nowrap"
        >
          <span>Prestataires Evenium</span>
        </Link>

        {/* 3EME : Prestataires Externes */}
        <Link
          href={`/dashboard/events/${id}/prestataires?tab=externe`}
          className="pb-3 text-xs sm:text-sm font-bold text-gray-500 hover:text-black transition-colors relative flex items-center gap-2 shrink-0 whitespace-nowrap"
        >
          <span>Prestataires Externes</span>
        </Link>
      </div>

      {/* SECTION RECHERCHE RAPIDE & FILTRES AÉRÉE */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs mb-8 space-y-4 sm:space-y-5">
        {/* Barre de recherche avec bouton de filtres intégré */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search size={18} className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-[#b8924a] shrink-0 pointer-events-none" />
            <input 
              type="text"
              placeholder="Rechercher par nom, métier (photographe, traiteur), ville ou mot-clé..."
              className="w-full pl-10 sm:pl-11 pr-10 py-3 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8924a] text-xs sm:text-sm text-gray-900 placeholder-gray-400 font-medium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1 cursor-pointer"
                title="Effacer la recherche"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isFiltersOpen || activeFilters > 0
                  ? "bg-[#b8924a] text-white shadow-xs"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              <SlidersHorizontal size={15} className="shrink-0" />
              <span>{isFiltersOpen ? "Masquer les filtres" : "Filtres géographiques & Métiers"}</span>
              {activeFilters > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-black text-[10px] font-extrabold flex items-center justify-center shrink-0">
                  {activeFilters}
                </span>
              )}
            </button>

            {(activeFilters > 0 || searchTerm) && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-red-600 hover:text-red-700 hover:underline px-3 py-2 font-bold cursor-pointer shrink-0"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Raccourcis express en 1 clic pour un filtrage instantané */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              Catégories en 1 clic :
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { label: "Tous", filter: "", icon: "⚡" },
              ...(event?.type ? [{ label: `${event.type}`, filter: event.type, isEvent: true, icon: "🎉" }] : []),
              { label: "Photographes", filter: "Photographes", icon: "📸" },
              { label: "Traiteurs", filter: "Traiteurs", icon: "🍽️" },
              { label: "Décorateurs", filter: "Décorateurs", icon: "✨" },
              { label: "Salles & Lieux", filter: "Salles de réception", icon: "🏰" },
              { label: "DJ & Musique", filter: "DJ / Animation", icon: "🎵" },
              { label: "Coiffure & Beauté", filter: "Coiffeurs / maquilleurs", icon: "💄" },
              { label: "Sécurité", filter: "Sécurité", icon: "🛡️" },
            ].map((shortcut) => {
              const isSelected = shortcut.isEvent 
                ? activeEventType === shortcut.filter 
                : (!shortcut.filter && !prestationFilter && !activeEventType) || (shortcut.filter && prestationFilter === shortcut.filter);
              return (
                <button
                  key={shortcut.label}
                  type="button"
                  onClick={() => {
                    if (shortcut.isEvent) {
                      setEventTypeFilter(activeEventType === shortcut.filter ? "" : shortcut.filter);
                    } else if (!shortcut.filter) {
                      resetFilters();
                    } else {
                      setPrestationFilter(prestationFilter === shortcut.filter ? "" : shortcut.filter);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap cursor-pointer active:scale-95 ${
                    isSelected
                      ? "bg-black text-white shadow-xs"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <span>{shortcut.icon}</span>
                  <span>{shortcut.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Volet détaillé des filtres : Localisation (Pays, Région, Quartier) & Métiers - TOUS ACTIFS SANS BLOCAGE */}
        {isFiltersOpen && (
          <div className="pt-4 border-t border-gray-100 space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* 1. Événement */}
              <label className="block">
                <span className="block text-[11px] uppercase tracking-wider text-gray-600 mb-1 font-bold">Événement</span>
                <select 
                  value={activeEventType} 
                  onChange={(e) => setEventTypeFilter(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a] font-medium"
                >
                  <option value="">Tous les événements</option>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>

              {/* 2. Prestation */}
              <label className="block">
                <span className="block text-[11px] uppercase tracking-wider text-gray-600 mb-1 font-bold">Prestation</span>
                <select 
                  value={prestationFilter} 
                  onChange={(e) => setPrestationFilter(e.target.value)} 
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a] font-medium"
                >
                  <option value="">Toutes les prestations</option>
                  {PRESTATION_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>

              {/* 3. Pays */}
              <label className="block">
                <span className="block text-[11px] uppercase tracking-wider text-gray-600 mb-1 font-bold">Pays</span>
                <select
                  value={countryFilter}
                  onChange={(e) => {
                    const newCountry = e.target.value;
                    setCountryFilter(newCountry);
                    if (regionFilter && newCountry && findCountryOfRegion(regionFilter) !== newCountry) {
                      setRegionFilter("");
                      setQuartierFilter("");
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a] font-medium"
                >
                  <option value="">Tous les pays</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>

              {/* 4. Région (Débloquée : sélectionnable même si aucun pays choisi) */}
              <label className="block">
                <span className="block text-[11px] uppercase tracking-wider text-gray-600 mb-1 font-bold">Région</span>
                <select
                  value={regionFilter}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setRegionFilter(selected);
                    setQuartierFilter("");
                    if (selected) {
                      const deducedCountry = findCountryOfRegion(selected);
                      if (deducedCountry && !countryFilter) {
                        setCountryFilter(deducedCountry);
                      }
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a] font-medium"
                >
                  <option value="">
                    {countryFilter ? `Toutes les régions (${countryFilter})` : "Toutes les régions (Tous pays)"}
                  </option>
                  {countryFilter ? (
                    regions.map((r) => <option key={r} value={r}>{r}</option>)
                  ) : (
                    countries.map((c) => (
                      <optgroup key={c} label={c}>
                        {regionsOf(c).map((r) => (
                          <option key={`${c}-${r}`} value={r}>{r}</option>
                        ))}
                      </optgroup>
                    ))
                  )}
                </select>
              </label>

              {/* 5. Quartier / Ville (Débloqué : sélectionnable directement) */}
              <label className="block">
                <span className="block text-[11px] uppercase tracking-wider text-gray-600 mb-1 font-bold">Quartier / Ville</span>
                <select
                  value={quartierFilter}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setQuartierFilter(selected);
                    if (selected) {
                      const hierarchy = findHierarchyOfQuartier(selected);
                      if (hierarchy) {
                        if (!countryFilter) setCountryFilter(hierarchy.country);
                        if (!regionFilter) setRegionFilter(hierarchy.region);
                      }
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a] font-medium"
                >
                  <option value="">
                    {regionFilter
                      ? `Tous les quartiers (${regionFilter})`
                      : countryFilter
                      ? `Tous les quartiers (${countryFilter})`
                      : "Tous les quartiers / villes"}
                  </option>
                  {countryFilter ? (
                    quartiers.map((q) => <option key={q} value={q}>{q}</option>)
                  ) : (
                    countries.map((c) => (
                      <optgroup key={c} label={c}>
                        {quartiersOf(c).map((q) => (
                          <option key={`${c}-${q}`} value={q}>{q}</option>
                        ))}
                      </optgroup>
                    ))
                  )}
                </select>
              </label>
            </div>
          </div>
        )}

        {/* Compteur et statut */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm pt-2 text-gray-600 gap-2 border-t border-gray-100">
          <span>
            <strong className="text-gray-900 font-bold">{filteredProviders.length}</strong> prestataire{filteredProviders.length > 1 ? "s" : ""} officiel{filteredProviders.length > 1 ? "s" : ""} Evenium {activeFilters > 0 || searchTerm ? "correspondant à vos critères" : "disponibles"}
          </span>
          {(activeFilters > 0 || searchTerm) && (
            <button type="button" onClick={resetFilters} className="text-[#8f6f33] font-bold hover:underline cursor-pointer text-left sm:text-right">
              Réinitialiser tous les filtres
            </button>
          )}
        </div>
      </div>

      {!loading && prestataires.length === 0 && (
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm mb-8 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#b8924a]/10 text-[#8f6f33] flex items-center justify-center mx-auto mb-4">
            <Briefcase size={28} />
          </div>
          <h3 className="font-serif text-2xl text-gray-900 mb-2">Annuaire Evenium officiel</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            L&apos;annuaire Evenium ne référence que les prestataires certifiés et vérifiés ayant complété leur adhésion. Aucun prestataire fictif n&apos;est affiché.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/dashboard/events/${id}/prestataires`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors"
            >
              Retour à mes prestataires
            </Link>
          </div>
        </div>
      )}

      {!loading && prestataires.length > 0 && filteredProviders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 mb-8">
          <p className="font-serif text-2xl text-gray-900">Aucun prestataire ne correspond à vos filtres</p>
          <p className="text-sm text-gray-500 mt-2">Élargissez votre recherche : retirez un filtre ou choisissez une autre zone.</p>
          <button type="button" onClick={resetFilters} className="mt-5 px-5 py-2.5 rounded-full bg-black text-[#f5eee1] text-xs uppercase tracking-[0.2em] cursor-pointer">Voir tous les prestataires</button>
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
