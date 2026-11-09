'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Sparkles,
  Heart,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Lock,
  Mail,
  User,
  Crown,
  Eye,
  Gift,
  PartyPopper,
  Share2,
  X,
  Layers,
  ChevronRight,
  Download,
  ExternalLink,
  LayoutDashboard
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import EventQRCode from '@/components/ui/EventQRCode';
import ModelCard from '@/components/landing/ModelCard';
import { Fleuron, DiamondRule, LuxFrame } from '@/components/landing/LuxOrnaments';
import { EVENT_TYPES, EVENT_TYPE_ICONS as EVENT_ICONS } from '@/lib/eventTypes';
import { subscribeToSync } from '@/lib/syncService';
import { EventDetailsFields } from '@/components/events/EventDetailsFields';
import { EMPTY_EVENT_DETAILS, eventDetailsToRow, missingEventDetails, requiresEventDetails, type EventDetails } from '@/lib/eventDetails';

// Full Studio components
import VeloursStudio from '@/components/invitations/velours/VeloursStudio';
import { VELOURS_MODEL_ID, DEFAULT_VELOURS, withDefaults as veloursDefaults, type VeloursContent } from '@/components/invitations/velours/content';
import VeloursInvitation from '@/components/invitations/velours/VeloursInvitation';

import SceauStudio from '@/components/invitations/sceau/SceauStudio';
import { SCEAU_MODEL_ID, DEFAULT_SCEAU, withDefaults as sceauDefaults, type SceauContent } from '@/components/invitations/sceau/content';
import SceauInvitation from '@/components/invitations/sceau/SceauInvitation';

import IvoireStudio from '@/components/invitations/ivoire/IvoireStudio';
import { IVOIRE_MODEL_ID, DEFAULT_IVOIRE, withDefaults as ivoireDefaults, type IvoireContent } from '@/components/invitations/ivoire/content';
import IvoireInvitation from '@/components/invitations/ivoire/IvoireInvitation';

import RoseOrStudio from '@/components/invitations/rose-or/RoseOrStudio';
import { ROSE_OR_MODEL_ID, DEFAULT_ROSE_OR, withDefaults as roseOrDefaults, type RoseOrContent } from '@/components/invitations/rose-or/content';
import RoseOrInvitation from '@/components/invitations/rose-or/RoseOrInvitation';

import AnniversaireStudio from '@/components/invitations/anniversaire/AnniversaireStudio';
import { ANNIVERSAIRE_MODEL_ID, DEFAULT_ANNIVERSAIRE, withDefaults as anniversaireDefaults, type AnniversaireContent } from '@/components/invitations/anniversaire/content';
import AnniversaireInvitation from '@/components/invitations/anniversaire/AnniversaireInvitation';
import { InvitationCtaContext } from '@/components/invitations/InvitationCtaContext';
import { forInvitationKind } from '@/lib/staticCard';
import CustomSectionsEditor from '@/components/invitations/custom/CustomSectionsEditor';
import CustomInvitationFrame from '@/components/invitations/custom/CustomInvitationFrame';
import {
  customModelId,
  customModelUrl,
  customValues,
  fetchCustomModel,
  fetchCustomModels,
  invalidateCustomModelsCache,
  isCustomModelId,
  withoutMusicValues,
  type CustomModelRow,
  type CustomValues,
} from '@/lib/customModels';
import { classificationOf, fetchModelDefaults, hiddenModelIds, invalidateModelDefaultsCache, modelCoverOf, modelNameOf, type InvitationKind, type ModelDefaultRow } from '@/lib/modelDefaults';
import { CartesStudio, type CartesStudioValue } from '@/components/cartes/CartesStudio';
import { CardStudioModal } from '@/components/cartes/CardStudioModal';
import {
  CartesInvitationPreview,
  DEFAULT_VOEU_CONTENT,
  DEFAULT_MOT_DOUX_CONTENT,
  DEFAULT_COUPLE_CONTENT,
} from '@/components/admin/models/registry';
import { VOEUX_INSPIRATIONS } from '@/data/mock/voeux';
import { ROMANCE_INSPIRATIONS } from '@/data/mock/romance';

export const VOEU_EXCEPTION_MODEL_ID = "voeu-exception";
export const MOT_DOUX_MODEL_ID = "mot-doux";
export const INVI_COUPLE_MODEL_ID = "invitation-couple";

/** « public » : parcours du site. « dashboard » : événement supplémentaire d'un client déjà connecté. */
export type CreateStudioMode = 'public' | 'dashboard';

// Catalogue des modèles
interface ModelItem {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  color: string;
  badge: string;
  category: string;
  compatibleEvents: string[];
  liveUrl: string;
  kind?: InvitationKind;
}

const CATALOG_MODELS: ModelItem[] = [
  {
    id: VELOURS_MODEL_ID,
    name: "Velours Bordeaux",
    subtitle: "Enveloppe de cire, velours bordeaux & satin ivoire",
    image: "/invit-velours-cover.jpg",
    color: "from-[#800020] to-[#4A0012]",
    badge: "Prestige Impérial",
    category: "Mariage",
    compatibleEvents: ["Mariage", "Anniversaire de mariage", "Noël", "Fêtes de fin d'année"],
    liveUrl: "/invitation-mariage"
  },
  {
    id: SCEAU_MODEL_ID,
    name: "Sceau d'Or Impérial",
    subtitle: "Sceau de cire doré à briser & rideaux de velours carmin",
    image: "/invit-sceau-dor-cover.jpg",
    color: "from-[#b8924a] to-[#8C6D1F]",
    badge: "Cérémonie Royale",
    category: "Mariage",
    compatibleEvents: ["Mariage", "Anniversaire de mariage", "Gala", "Soirée", "Noël", "Fêtes de fin d'année"],
    liveUrl: "/invitation-sceau-dor"
  },
  {
    id: IVOIRE_MODEL_ID,
    name: "Ivoire Couture",
    subtitle: "Papier de cuve aux bords frangés, rubans satin & dorure",
    image: "/invit-ivoire-cover.jpg",
    color: "from-[#EAE0D5] to-[#C6AC8F]",
    badge: "Haute Couture",
    category: "Mariage",
    compatibleEvents: ["Mariage", "Anniversaire de mariage"],
    liveUrl: "/invitation-ivoire"
  },
  {
    id: ROSE_OR_MODEL_ID,
    name: "Rose Poudrée & Or",
    subtitle: "Soie dorée, colonnes fleuries & ambiance poétique",
    image: "/invit-rose-or-cover.jpg",
    color: "from-[#F3D9DC] to-[#b8924a]",
    badge: "Romantique & Féerique",
    category: "Mariage",
    compatibleEvents: ["Mariage", "Anniversaire de mariage"],
    liveUrl: "/invitation-rose-or"
  },
  {
    id: ANNIVERSAIRE_MODEL_ID,
    name: "Anniversaire Bordeaux & Or",
    subtitle: "Deux pages : photo « Happy Birthday » & carte aux roses dorées",
    image: "/invit-anniversaire-cover.jpg",
    color: "from-[#6b1428] to-[#c9a35c]",
    badge: "Anniversaire Prestige",
    category: "Anniversaire",
    compatibleEvents: ["Anniversaire"],
    liveUrl: "/invitation-anniversaire"
  },
  {
    id: VOEU_EXCEPTION_MODEL_ID,
    name: "Vœu d'Exception",
    subtitle: "Papeterie haute couture, cachet de cire scellé & piano céleste",
    image: "/invit-sceau-dor-cover.jpg",
    color: "from-[#b8924a] to-[#805e26]",
    badge: "Attention 3 900 FCFA",
    category: "Vœux",
    compatibleEvents: ["Vœux", "Anniversaire", "Anniversaire de mariage", "Mariage", "Baptême", "Noël", "Fêtes de fin d'année", "Tous"],
    liveUrl: "/voeux"
  },
  {
    id: MOT_DOUX_MODEL_ID,
    name: "Les Mots Doux",
    subtitle: "Lettre d'amour confidentielle scellée au cachet de cire rubis",
    image: "/invit-rose-or-cover.jpg",
    color: "from-[#9e1b23] to-[#590d12]",
    badge: "Romance 3 900 FCFA",
    category: "Mots Doux",
    compatibleEvents: ["Couple", "Mots Doux", "Mariage", "Anniversaire de mariage", "Noël", "Fêtes de fin d'année", "Tous"],
    liveUrl: "/mots-doux"
  },
  {
    id: INVI_COUPLE_MODEL_ID,
    name: "Invitations Couple",
    subtitle: "Tête-à-tête secret avec scénographie & bouton d'amour « J'accepte »",
    image: "/invit-velours-cover.jpg",
    color: "from-[#4a0e17] to-[#140306]",
    badge: "Tête-à-tête 3 900 FCFA",
    category: "Invitations Couple",
    compatibleEvents: ["Couple", "Invitations Couple", "Soirée", "Dîner", "Noël", "Fêtes de fin d'année", "Tous"],
    liveUrl: "/mots-doux"
  }
];

// Types d'événements
// L'id est le type enregistré sur l'événement ; « Bientôt » tant qu'aucun modèle n'est compatible
const buildEventCategories = (models: ModelItem[]): { id: string; label: string; icon: string; count: number; isSoon?: boolean }[] => {
  const countFor = (catId: string) => {
    if (catId === "Tous") return models.length;
    if (catId === "Vœux") return models.filter((m) => m.kind === "voeu" || m.compatibleEvents.includes("Vœux")).length;
    if (catId === "Couple") {
      return models.filter(
        (m) =>
          m.kind === "couple" ||
          m.kind === "mot_doux" ||
          m.compatibleEvents.includes("Couple") ||
          m.compatibleEvents.includes("Invitations Couple") ||
          m.compatibleEvents.includes("Mots Doux")
      ).length;
    }
    return models.filter((m) => m.compatibleEvents.includes(catId)).length;
  };

  return [
    { id: "Tous", label: "Tous les modèles", icon: "✨", count: countFor("Tous"), isSoon: false },
    { id: "Vœux", label: "Vœux d'Exception", icon: "🌟", count: countFor("Vœux"), isSoon: countFor("Vœux") === 0 },
    { id: "Couple", label: "Mots Doux & Couple", icon: "❤️", count: countFor("Couple"), isSoon: countFor("Couple") === 0 },
    ...EVENT_TYPES.map((t) => {
      const c = countFor(t);
      return {
        id: t,
        label: t,
        icon: EVENT_ICONS[t] || "🎉",
        count: c,
        isSoon: c === 0,
      };
    }),
  ];
};

function CreateExpressStudioContent({ mode }: { mode: CreateStudioMode }) {
  const inDashboard = mode === 'dashboard';
  const router = useRouter();
  const searchParams = useSearchParams();
  const modelParam = searchParams.get('model');
  const supabase = createClient();

  // Modale de prévisualisation plein écran du résultat avec modifications
  const [isPreviewFullScreenOpen, setIsPreviewFullScreenOpen] = useState(false);

  // État de sélection du modèle : si l'utilisateur arrive sans modèle choisi (ex: /create), on lui présente la galerie
  const [hasChosenModel, setHasChosenModel] = useState<boolean>(() => {
    const p = searchParams.get('model');
    return !!p && p.trim().length > 0;
  });

  // Événement & Modèle sélectionné
  const categoryParam = searchParams.get('category');
  const [selectedEventCategory, setSelectedEventCategory] = useState<string>(() => {
    if (categoryParam) {
      const lower = categoryParam.toLowerCase();
      if (lower === "couple" || lower === "mots-doux" || lower === "mot_doux") return "Couple";
      if (lower === "voeux" || lower === "vœux" || lower === "voeu") return "Vœux";
      if (lower === "noel" || lower === "noël") return "Noël";
      if (lower === "fetes" || lower === "fêtes" || lower === "nouvel-an" || lower.includes("fin")) return "Fêtes de fin d'année";
      return categoryParam;
    }
    return "Mariage";
  });
  const [selectedModelId, setSelectedModelId] = useState<string>(VELOURS_MODEL_ID);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      const lower = cat.toLowerCase();
      if (lower === "couple" || lower === "mots-doux" || lower === "mot_doux") setSelectedEventCategory("Couple");
      else if (lower === "voeux" || lower === "vœux" || lower === "voeu") setSelectedEventCategory("Vœux");
      else if (lower === "noel" || lower === "noël") setSelectedEventCategory("Noël");
      else if (lower === "fetes" || lower === "fêtes" || lower === "nouvel-an" || lower.includes("fin")) setSelectedEventCategory("Fêtes de fin d'année");
      else setSelectedEventCategory(cat);
    }
  }, [searchParams]);

  // État d'édition dédié aux Vœux, Mots Doux & Invitations Couple
  const [cartesContent, setCartesContent] = useState<CartesStudioValue>({
    recipient: "Mon Amour",
    sender: "Moi",
    kicker: "Attention Particulière",
    title: "Pour que tu n'oublies jamais à quel point tu comptes",
    message: "Au milieu du bruit du monde, il y a ton sourire qui apaise tout. Je voulais simplement te rappeler à quel point ma vie a pris une saveur unique depuis que tu en fais partie.",
    music: "Experience - Ludovico Einaudi",
    sealColor: "ruby",
    paperTheme: "rose",
    rendezVousDate: "Ce vendredi soir",
    rendezVousTime: "20h30 précises",
    rendezVousPlace: "Lieu secret... Je passe te chercher en bas",
    dressCode: "Chic & Séduction",
  });
  const [isCartesModalOpen, setIsCartesModalOpen] = useState(false);
  const isCardStudioModel = selectedModelId === VOEU_EXCEPTION_MODEL_ID || selectedModelId === MOT_DOUX_MODEL_ID || selectedModelId === INVI_COUPLE_MODEL_ID;

  // Modèles ajustés, classés ou retirés du site par l'admin (studio des modèles)
  const [publishedModels, setPublishedModels] = useState<Record<string, ModelDefaultRow>>({});
  const classifiedModels = useMemo(
    () =>
      CATALOG_MODELS.map((m) => {
        const c = classificationOf(publishedModels[m.id], { type: 'animée', events: m.compatibleEvents });
        return {
          ...m,
          name: modelNameOf(publishedModels[m.id], m.name),
          image: modelCoverOf(publishedModels[m.id], m.image),
          compatibleEvents: c.events,
          category: c.events[0] ?? m.category,
          kind: c.type as InvitationKind,
        };
      }),
    [publishedModels]
  );
  // Modèles importés par l'admin (ZIP / HTML), publiés
  const [customModels, setCustomModels] = useState<CustomModelRow[]>([]);
  const [customContents, setCustomContents] = useState<Record<string, CustomValues>>({});
  const reloadCustoms = React.useCallback((force = false) => {
    if (force) invalidateCustomModelsCache();
    return fetchCustomModels(createClient(), { publishedOnly: true, force }).then((rows) => {
      setCustomModels(rows);
    });
  }, []);

  useEffect(() => {
    reloadCustoms();
  }, [reloadCustoms]);
  const customItems = useMemo(
    () =>
      customModels.map((m) => ({
        id: customModelId(m.slug),
        name: m.name,
        subtitle: "Création exclusive Evenium",
        image: m.cover_url || "/invit-velours-cover.jpg",
        color: "",
        badge: "Nouveau",
        category: m.event_types[0] ?? "Mariage",
        compatibleEvents: m.event_types,
        liveUrl: customModelUrl(m),
        kind: m.invitation_type as InvitationKind,
      })),
    [customModels]
  );
  const siteModels = useMemo(() => {
    const hidden = hiddenModelIds(publishedModels);
    return [...classifiedModels.filter((m) => !hidden.has(m.id)), ...customItems];
  }, [classifiedModels, publishedModels, customItems]);
  const customOf = (id: string) => (isCustomModelId(id) ? customModels.find((m) => customModelId(m.slug) === id) ?? null : null);
  /** Contenu en cours d'un modèle importé (sinon celui publié par l'admin) */
  const customContentOf = (m: CustomModelRow) => customContents[customModelId(m.slug)] ?? customValues(m.fields, m.content);
  const eventCategories = useMemo(() => buildEventCategories(siteModels), [siteModels]);

  // Synchronisation du modèle choisi depuis les paramètres d'URL (ex: /create?model=invit-9)
  useEffect(() => {
    if (!modelParam) return;
    const p = modelParam.toLowerCase().trim();
    let foundId: string | null = null;
    if (p === 'invit-1' || p === 'velours' || p === 'velours-bordeaux') {
      foundId = VELOURS_MODEL_ID;
    } else if (p === 'invit-9' || p === 'sceau' || p === 'sceau-dor' || p === 'sceau-d-or') {
      foundId = SCEAU_MODEL_ID;
    } else if (p === 'invit-8' || p === 'ivoire' || p === 'ivoire-couture') {
      foundId = IVOIRE_MODEL_ID;
    } else if (p === 'invit-10' || p === 'rose-or' || p === 'rose-poudree') {
      foundId = ROSE_OR_MODEL_ID;
    } else if (p === 'invit-11' || p === 'anniversaire') {
      foundId = ANNIVERSAIRE_MODEL_ID;
    } else {
      const found = CATALOG_MODELS.find(m => m.id === modelParam || m.id.toLowerCase() === p);
      if (found) foundId = found.id;
    }
    if (foundId) {
      setSelectedModelId(foundId);
      setHasChosenModel(true);
      // Le filtre d'événement suit le modèle, sinon il serait remplacé par un modèle compatible
      const model = CATALOG_MODELS.find(m => m.id === foundId);
      if (model && !model.compatibleEvents.includes(selectedEventCategory)) setSelectedEventCategory(model.category);
    }
  }, [modelParam]);

  // Lien direct vers un modèle importé (ex. depuis sa démo) : ouvert dès que la liste est chargée
  useEffect(() => {
    if (!modelParam || !isCustomModelId(modelParam)) return;
    const item = customItems.find((m) => m.id === modelParam);
    if (!item) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedModelId(item.id);
    setHasChosenModel(true);
    if (!item.compatibleEvents.includes(selectedEventCategory) && selectedEventCategory !== "Tous") setSelectedEventCategory(item.category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelParam, customItems]);

  // Choisir un modèle depuis la galerie
  const handleChooseModel = (modelId: string) => {
    const model = [...classifiedModels, ...customItems].find(m => m.id === modelId);
    if (model && selectedEventCategory !== "Tous" && !model.compatibleEvents.includes(selectedEventCategory)) setSelectedEventCategory(model.category);
    setSelectedModelId(modelId);
    setHasChosenModel(true);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('model', modelId);
      window.history.replaceState(null, '', url.toString());
    }
  };

  // Revenir à la galerie des modèles
  const handleReturnToGallery = () => {
    setHasChosenModel(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('model');
      window.history.replaceState(null, '', url.pathname);
    }
  };

  // État complet d'édition pour chaque modèle (initialisé avec defaults)
  const [veloursContent, setVeloursContent] = useState<VeloursContent>(DEFAULT_VELOURS);
  const [sceauContent, setSceauContent] = useState<SceauContent>(DEFAULT_SCEAU);
  const [ivoireContent, setIvoireContent] = useState<IvoireContent>(DEFAULT_IVOIRE);
  const [roseOrContent, setRoseOrContent] = useState<RoseOrContent>(DEFAULT_ROSE_OR);
  const [anniversaireContent, setAnniversaireContent] = useState<AnniversaireContent>(DEFAULT_ANNIVERSAIRE);

  // Modèles ajustés par l'admin (studio des modèles) : ils servent de point de départ à la personnalisation
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    const reload = (force = false) => {
      if (force) {
        invalidateModelDefaultsCache();
        invalidateCustomModelsCache();
      }
      reloadCustoms(force);
      fetchModelDefaults(supabase, force).then((rows) => {
        if (cancelled) return;
        setPublishedModels(rows);
        if (rows[VELOURS_MODEL_ID]?.content) setVeloursContent(veloursDefaults(rows[VELOURS_MODEL_ID].content as any));
        if (rows[SCEAU_MODEL_ID]?.content) setSceauContent(sceauDefaults(rows[SCEAU_MODEL_ID].content as any));
        if (rows[IVOIRE_MODEL_ID]?.content) setIvoireContent(ivoireDefaults(rows[IVOIRE_MODEL_ID].content as any));
        if (rows[ROSE_OR_MODEL_ID]?.content) setRoseOrContent(roseOrDefaults(rows[ROSE_OR_MODEL_ID].content as any));
        if (rows[ANNIVERSAIRE_MODEL_ID]?.content) setAnniversaireContent(anniversaireDefaults(rows[ANNIVERSAIRE_MODEL_ID].content as any));
      });
    };

    reload();

    const unsubSync = subscribeToSync("models", () => reload(true));

    // Abonnement Supabase Realtime : actualisation automatique instantanée sur les deux tables
    const channel = supabase
      .channel("create_studio_models_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "invitation_model_defaults" },
        () => reload(true)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "custom_invitation_models" },
        () => reload(true)
      )
      .subscribe();

    return () => {
      cancelled = true;
      unsubSync();
      supabase.removeChannel(channel);
    };
  }, []);

  // Si le modèle actuellement sélectionné a été désactivé par l'admin, basculer automatiquement sur le premier modèle actif disponible
  useEffect(() => {
    if (siteModels.length > 0 && !siteModels.some((m) => m.id === selectedModelId)) {
      setSelectedModelId(siteModels[0].id);
    }
  }, [siteModels, selectedModelId]);

  const publishedContent = (id: string) => publishedModels[id]?.content as any;

  // Synchronisation des champs communs lors du changement de modèle
  const handleModelChange = (newModelId: string) => {
    // Si l'utilisateur a modifié des noms ou dates dans le modèle courant, on synchronise vers le nouveau modèle
    if (selectedModelId === VELOURS_MODEL_ID) {
      const { partnerA, partnerB, date, time, venue, city } = veloursContent;
      if (newModelId === SCEAU_MODEL_ID) {
        setSceauContent(prev => ({ ...prev, partnerA, partnerB, date, time, venue, city }));
      } else if (newModelId === IVOIRE_MODEL_ID) {
        setIvoireContent(prev => ({ ...prev, partnerA, partnerB, date, time }));
      } else if (newModelId === ROSE_OR_MODEL_ID) {
        setRoseOrContent(prev => ({ ...prev, partnerA, partnerB, date, time, venue }));
      }
    } else if (selectedModelId === SCEAU_MODEL_ID) {
      const { partnerA, partnerB, date, time, venue, city } = sceauContent;
      if (newModelId === VELOURS_MODEL_ID) {
        setVeloursContent(prev => ({ ...prev, partnerA, partnerB, date, time, venue, city }));
      } else if (newModelId === IVOIRE_MODEL_ID) {
        setIvoireContent(prev => ({ ...prev, partnerA, partnerB, date, time }));
      } else if (newModelId === ROSE_OR_MODEL_ID) {
        setRoseOrContent(prev => ({ ...prev, partnerA, partnerB, date, time, venue }));
      }
    }
    setSelectedModelId(newModelId);
  };

  // Modèle actuel
  const currentModel = useMemo(() => {
    return [...classifiedModels, ...customItems].find(m => m.id === selectedModelId) || classifiedModels[0];
  }, [selectedModelId, classifiedModels, customItems]);

  // Carte statique : pas de musique (à l'édition, à l'achat et après)
  const isStaticCard = currentModel?.kind === 'carte';

  // Filtrage des modèles selon l'événement choisi
  const filteredModels = useMemo(() => {
    // Modèles retirés du site par l'admin : absents de la galerie
    if (selectedEventCategory === "Tous") return siteModels;
    if (selectedEventCategory === "Vœux") {
      return siteModels.filter((m) => m.kind === "voeu" || m.compatibleEvents.includes("Vœux"));
    }
    if (selectedEventCategory === "Couple") {
      return siteModels.filter(
        (m) =>
          m.kind === "couple" ||
          m.kind === "mot_doux" ||
          m.compatibleEvents.includes("Couple") ||
          m.compatibleEvents.includes("Invitations Couple") ||
          m.compatibleEvents.includes("Mots Doux")
      );
    }
    return siteModels.filter(m => m.compatibleEvents.includes(selectedEventCategory));
  }, [selectedEventCategory, siteModels]);

  // Chargement à la demande des champs complets d'un modèle importé lorsqu'il est sélectionné
  useEffect(() => {
    if (!isCustomModelId(selectedModelId)) return;
    const slug = selectedModelId.replace(/^custom:/, "");
    const m = customModels.find((x) => x.slug === slug);
    if (m && (!m.fields || m.fields.length === 0)) {
      fetchCustomModel(supabase, slug).then((full) => {
        if (full) {
          setCustomModels((prev) => prev.map((x) => (x.slug === slug ? full : x)));
        }
      });
    }
  }, [selectedModelId, customModels, supabase]);

  // Modèle retiré du site alors qu'il était ouvert par un lien : retour à la galerie
  useEffect(() => {
    if (hasChosenModel && hiddenModelIds(publishedModels).has(selectedModelId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasChosenModel(false);
    }
  }, [publishedModels, selectedModelId, hasChosenModel]);

  // Si le modèle actuellement sélectionné n'est pas compatible avec la nouvelle catégorie, basculer sur le premier disponible
  useEffect(() => {
    const isCurrentCompatible = filteredModels.some(m => m.id === selectedModelId);
    if (!isCurrentCompatible && filteredModels.length > 0) {
      setSelectedModelId(filteredModels[0].id);
    }
  }, [selectedEventCategory, filteredModels, selectedModelId]);

  const [demoModelId, setDemoModelId] = useState<string | null>(null);
  const [showDemoExitModal, setShowDemoExitModal] = useState(false);
  const demoOpenRef = useRef(false);
  const demoModelIdRef = useRef<string | null>(null);
  useEffect(() => {
    demoOpenRef.current = !!demoModelId;
    demoModelIdRef.current = demoModelId;
    if (!demoModelId) setShowDemoExitModal(false);
  }, [demoModelId]);

  // Aperçu plein écran : la page de création ne défile pas derrière
  useEffect(() => {
    if (!isPreviewFullScreenOpen && !demoModelId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isPreviewFullScreenOpen, demoModelId]);

  // Modale de finalisation & paiement
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Écouteurs globaux pour la communication avec les boutons de l'invitation
  useEffect(() => {
    const handleClose = () => {
      if (demoOpenRef.current) {
        setShowDemoExitModal(true);
      } else {
        setIsPreviewFullScreenOpen(false);
      }
    };
    const handleCheckout = () => {
      if (demoOpenRef.current && demoModelIdRef.current) {
        handleChooseModel(demoModelIdRef.current);
        setDemoModelId(null);
        setShowDemoExitModal(false);
        window.scrollTo({ top: 0 });
      } else {
        setIsPreviewFullScreenOpen(false);
        setIsCheckoutModalOpen(true);
      }
    };

    window.addEventListener('evenium:close-preview', handleClose);
    window.addEventListener('evenium:open-checkout', handleCheckout);

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'evenium:close-preview') handleClose();
      if (e.data?.type === 'evenium:open-checkout') handleCheckout();
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('evenium:close-preview', handleClose);
      window.removeEventListener('evenium:open-checkout', handleCheckout);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Formule & Paiement
  const [selectedPlan, setSelectedPlan] = useState<'Standard' | 'Premium' | 'Gold'>('Standard');
  // Formules Premium et Gold : détails de l'événement obligatoires, repris dans le dashboard
  const [eventDetails, setEventDetails] = useState<EventDetails>(EMPTY_EVENT_DETAILS);
  const [showDetailsErrors, setShowDetailsErrors] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'om' | 'card'>('wave');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Authentification de l'organisateur
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // États de soumission & succès standard
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [standardSuccessEvent, setStandardSuccessEvent] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Vérifier la session existante
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        setCurrentUser(data.session.user);
        setEmail(data.session.user.email || '');
        setFullName(data.session.user.user_metadata?.full_name || '');
      }
    });
  }, [supabase]);

  // Extraction automatique des métadonnées de l'événement depuis le contenu complet de l'invitation
  const eventMetadata = useMemo(() => {
    let name = "";
    let date = "";
    let time = "";
    let location = "";
    let welcomeTitle = "";
    let welcomeText = "";
    let contentJson: any = null;

    const formatCoupleTitle = (cat: string, partnerA?: string, partnerB?: string) => {
      const pA = partnerA?.trim();
      const pB = partnerB?.trim();
      if (cat === "Anniversaire de mariage") {
        return pB
          ? `Anniversaire de mariage de ${pA || "—"} & ${pB}`
          : `Anniversaire de mariage de ${pA || "Mon Événement"}`;
      }
      const isSingle = ["Baptême", "Anniversaire", "Noël", "Fêtes de fin d'année"].includes(cat);
      if (isSingle || !pB) {
        const prefix = cat === "Anniversaire"
          ? "Anniversaire de"
          : cat === "Baptême"
            ? "Baptême de"
            : cat === "Noël"
              ? "Célébration de Noël de"
              : cat === "Fêtes de fin d'année"
                ? "Fêtes de fin d'année de"
                : cat;
        return `${prefix} ${pA || "Mon Événement"}`;
      }
      return `Mariage de ${pA} & ${pB}`;
    };

    if (selectedModelId === VELOURS_MODEL_ID) {
      name = formatCoupleTitle(selectedEventCategory, veloursContent.partnerA, veloursContent.partnerB);
      date = veloursContent.date;
      time = veloursContent.time;
      location = [veloursContent.venue, veloursContent.city].filter(Boolean).join(", ");
      welcomeTitle = veloursContent.welcomeTitle || name;
      welcomeText = veloursContent.welcomeText;
      contentJson = veloursContent;
    } else if (selectedModelId === SCEAU_MODEL_ID) {
      name = formatCoupleTitle(selectedEventCategory, sceauContent.partnerA, sceauContent.partnerB);
      date = sceauContent.date;
      time = sceauContent.time;
      location = [sceauContent.venue, sceauContent.city].filter(Boolean).join(", ");
      welcomeTitle = sceauContent.welcomeTitle || name;
      welcomeText = sceauContent.welcomeText;
      contentJson = sceauContent;
    } else if (selectedModelId === IVOIRE_MODEL_ID) {
      name = formatCoupleTitle(selectedEventCategory, ivoireContent.partnerA, ivoireContent.partnerB);
      date = ivoireContent.date;
      time = ivoireContent.time;
      const v0 = ivoireContent.venues?.[0];
      location = [v0?.name, v0?.address].filter(Boolean).join(", ");
      welcomeTitle = ivoireContent.welcomeLead || name;
      welcomeText = ivoireContent.welcomeText;
      contentJson = ivoireContent;
    } else if (selectedModelId === ROSE_OR_MODEL_ID) {
      name = formatCoupleTitle(selectedEventCategory, roseOrContent.partnerA, roseOrContent.partnerB);
      date = roseOrContent.date;
      time = roseOrContent.time;
      location = [roseOrContent.venue, roseOrContent.address].filter(Boolean).join(", ");
      welcomeTitle = roseOrContent.kicker || name;
      welcomeText = roseOrContent.quote;
      contentJson = roseOrContent;
    } else if (selectedModelId === ANNIVERSAIRE_MODEL_ID) {
      const c = anniversaireContent;
      name = `Anniversaire de ${c.celebrant || "Mon Événement"}`;
      date = c.date;
      time = c.time;
      location = [c.venueName, c.venueCity].filter(Boolean).join(", ");
      welcomeTitle = [c.kicker, c.title].filter(Boolean).join(" ") || name;
      welcomeText = c.message;
      contentJson = c;
    } else if (isCustomModelId(selectedModelId)) {
      const m = customOf(selectedModelId);
      if (m) {
        const type = selectedEventCategory === "Tous" ? m.event_types[0] ?? "Événement" : selectedEventCategory;
        name = `${type} · ${m.name}`;
        welcomeTitle = name;
        contentJson = { values: customContentOf(m) };
      }
    }

    return {
      name: name.trim() || "Mon Événement Evenium",
      date: date || new Date().toISOString().split('T')[0],
      time: time || "16:00",
      location: location || "Dakar, Sénégal",
      // Valeurs réellement saisies dans l'invitation (sans valeur par défaut)
      rawDate: date || "",
      rawTime: time || "",
      rawLocation: location.trim(),
      welcomeTitle,
      welcomeText,
      contentJson
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModelId, selectedEventCategory, veloursContent, sceauContent, ivoireContent, roseOrContent, anniversaireContent, customModels, customContents]);

  // Montant selon la formule
  const planPrice = selectedPlan === "Gold" ? 20000 : selectedPlan === "Premium" ? 10000 : 5000;

  const choosePlan = (plan: 'Standard' | 'Premium' | 'Gold') => setSelectedPlan(plan);

  // Date, heure et lieu de l'invitation reportés dans les détails tant que l'organisateur ne les modifie pas
  const detailsWithInvitation: EventDetails = {
    ...eventDetails,
    date: eventDetails.date || eventMetadata.rawDate,
    time: eventDetails.time || eventMetadata.rawTime,
    location: eventDetails.location || eventMetadata.rawLocation,
  };

  // Action Finale : Inscription / Connexion + Paiement + Insertion en Base + Accès Dashboard & Partage
  const handleFinalActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (requiresEventDetails(selectedPlan)) {
        const missing = missingEventDetails(detailsWithInvitation);
        if (missing.length) {
          setShowDetailsErrors(true);
          throw new Error(`Formule ${selectedPlan} : merci de renseigner ${missing.join(", ")} de votre événement.`);
        }
      }

      let user = currentUser;

      // 1. Si pas connecté, créer le compte avec les éléments d'authentification ou connecter l'organisateur existant
      if (!user) {
        if (!email || !password || !fullName) {
          throw new Error("Veuillez renseigner le nom de l'organisateur, votre adresse mail et un mot de passe pour enregistrer vos accès.");
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'client'
            }
          }
        });

        if (authError && (authError.message.toLowerCase().includes('already') || authError.status === 400 || authError.status === 422)) {
          // Si déjà enregistré, tentative de connexion directe
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (signInError) {
            throw new Error("Cet email est déjà associé à un compte. Veuillez saisir le mot de passe correspondant pour vous connecter.");
          }
          user = signInData.user;
        } else if (authError) {
          throw authError;
        } else {
          user = authData.user;
        }
      }

      if (!user?.id) {
        throw new Error("Impossible d'authentifier la session. Veuillez réessayer.");
      }

      if (user?.id && fullName?.trim()) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: fullName.trim(),
            email: email,
            role: 'client'
          }, { onConflict: 'id' });
      }

      // 2. Insérer le nouvel événement dérivé des informations de l'invitation
      const eventPayload: any = {
        client_id: user.id,
        name: eventMetadata.name,
        // Depuis « Tous les modèles », le type suit le modèle choisi
        type: selectedEventCategory === "Tous" ? currentModel.category : selectedEventCategory,
        date: eventMetadata.date,
        time: eventMetadata.time,
        location: eventMetadata.location,
        plan: selectedPlan,
        format: isStaticCard ? 'Carte' : 'Animée',
        status: 'active',
        invitation_model_id: selectedModelId,
        invitation_title: eventMetadata.welcomeTitle,
        invitation_message: eventMetadata.welcomeText,
        invitation_content: (() => {
          const c = eventMetadata.contentJson;
          if (!c) return c;
          const m = customOf(selectedModelId);
          if (m) return { values: isStaticCard ? withoutMusicValues(m.fields, c.values) : c.values };
          return forInvitationKind(c, isStaticCard);
        })(),
        // Détails saisis à l'achat (Premium / Gold) : nombre d'invités, date, lieu, budget…
        ...(requiresEventDetails(selectedPlan) ? eventDetailsToRow(detailsWithInvitation) : {})
      };

      let { data: newEvent, error: eventError } = await supabase
        .from('events')
        .insert([eventPayload])
        .select()
        .single();

      // Colonne event_details absente tant que le script SQL n'a pas été exécuté
      if (eventError && eventPayload.event_details && eventError.message?.includes('event_details')) {
        delete eventPayload.event_details;
        const retry = await supabase.from('events').insert([eventPayload]).select().single();
        newEvent = retry.data;
        eventError = retry.error;
      }

      if (eventError && eventPayload.invitation_content && eventError.message?.includes('invitation_content')) {
        delete eventPayload.invitation_content;
        const retry = await supabase.from('events').insert([eventPayload]).select().single();
        newEvent = retry.data;
        eventError = retry.error;
      }

      if (eventError || !newEvent) {
        console.warn("Événement fallback local :", eventError);
        newEvent = {
          id: `evt-${Date.now()}`,
          client_id: user.id,
          ...eventPayload
        };
      }

      // 3. Enregistrer la transaction d'achat
      try {
        await supabase.from('transactions').insert([{
          event_id: newEvent.id,
          libelle: `Achat Formule ${selectedPlan} (${currentModel.name})`,
          montant: planPrice,
          type: 'revenu',
          date: new Date().toISOString()
        }]);
      } catch (txErr) {
        console.warn("Transaction warning:", txErr);
      }

      // 4. Débloquer l'accès au Dashboard et afficher l'écran de confirmation & partage
      setStandardSuccessEvent(newEvent);
      setIsSubmitting(false);

    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || "Une erreur est survenue lors de l'activation.");
    }
  };

  return (
    <div className="w-full max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6 flex flex-col gap-6 animate-in fade-in duration-300">

      {!hasChosenModel ? (
        /* ─────────────── 1. GALERIE DES MODÈLES (POUR CEUX QUI CRÉENT SANS MODÈLE D'ABORD) ─────────────── */
        <div className="w-full flex flex-col gap-8 animate-in fade-in duration-300">
          {/* En-tête de prestige */}
          <div className="text-center max-w-3xl mx-auto pt-4 sm:pt-6">
            <Fleuron className="mx-auto w-40 sm:w-48 h-auto mb-3" />
            <p className="pl-[0.3em] text-[10.5px] sm:text-xs font-medium uppercase tracking-[0.3em] text-[#8f6f33] mb-3">
              Étape 1 · Choisissez votre modèle
            </p>
            <h1 className="text-3xl sm:text-5xl font-serif not-italic text-[#1d120a] leading-tight">
              Votre faire-part <span className="italic text-gold-foil">de prestige</span>
            </h1>
            <DiamondRule className="mt-4" />
            <p className="text-xs sm:text-sm text-[#3d3126] mt-4 max-w-2xl mx-auto leading-relaxed">
              Chaque création Evenium propose une scénographie interactive unique (sceau de cire animé, velours précieux, rubans satinés, musique immersive et gestion des RSVP). Choisissez votre univers pour ouvrir son studio de personnalisation exclusif.
            </p>

            {/* Filtres de catégorie d'événement */}
            <div className="flex items-center justify-center gap-2 flex-wrap mt-6">
              {eventCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedEventCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${selectedEventCategory === cat.id
                      ? "bg-gradient-to-b from-[#3b2717] to-[#150d07] text-[#f0d999] border border-[#c9a45e] shadow-[0_0_18px_-6px_rgba(233,196,120,0.75)]"
                      : "bg-[#fffbf5] text-gray-700 border border-[#e4d8c4] hover:border-[#c9a45e]"
                    }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  {cat.count > 0 ? (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedEventCategory === cat.id ? "bg-[#b8924a]/30 text-[#f0d999]" : "bg-gray-200/80 text-gray-700"
                    }`}>
                      {cat.count}
                    </span>
                  ) : cat.isSoon ? (
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                      Bientôt
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {filteredModels.length === 0 && (
            <div className="card-lux relative max-w-xl mx-auto w-full text-center px-6 py-12">
              <LuxFrame className="inset-2.5" />
              <p className="text-3xl mb-3">{eventCategories.find(c => c.id === selectedEventCategory)?.icon}</p>
              <h3 className="font-serif not-italic text-2xl text-[#1d120a]">Les modèles « {selectedEventCategory} » arrivent bientôt</h3>
              <p className="text-sm text-[#3d3126] mt-2">En attendant, nos modèles actuels peuvent être personnalisés pour votre événement.</p>
              <button
                type="button"
                onClick={() => setSelectedEventCategory("Tous")}
                className="btn-lux relative mt-7 px-7 py-3.5 text-[11px]"
              >
                Voir tous les modèles
              </button>
            </div>
          )}

          {/* Grille des modèles disponibles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto w-full">
            {filteredModels.map((model) => (
              <ModelCard
                key={model.id}
                name={model.name}
                image={model.image}
                kind={model.kind}
                badge={model.badge}
                eyebrow={model.category}
                description={model.subtitle}
                onPreview={() => setDemoModelId(model.id)}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                actions={
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDemoModelId(model.id)}
                      className="btn-lux-light !gap-1.5 !tracking-[0.1em] px-3 py-3 text-[10px] sm:text-[10.5px]"
                    >
                      <Eye size={14} className="text-[#8f6f33] shrink-0" />
                      Voir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChooseModel(model.id)}
                      className="btn-lux !gap-1.5 !tracking-[0.1em] px-3 py-3 text-[10px] sm:text-[10.5px]"
                    >
                      Choisir
                      <ArrowRight size={14} className="text-[#f0d999] shrink-0" />
                    </button>
                  </div>
                }
              />
            ))}
          </div>

          {/* Rassurance */}
          <div className="max-w-3xl mx-auto w-full pt-4 pb-8 flex items-center justify-center gap-6 flex-wrap text-xs text-gray-500 border-t border-[#c9a45e]/30">
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#b8924a]" /> Personnalisation 100% en direct
            </span>
            <span className="flex items-center gap-1.5">
              <Lock size={13} className="text-[#b8924a]" /> Rendu plein écran avant paiement
            </span>
            <span className="flex items-center gap-1.5">
              <Smartphone size={13} className="text-[#b8924a]" /> Prêt pour WhatsApp &amp; tous écrans
            </span>
          </div>
        </div>
      ) : (
        /* ─────────────── 2. STUDIO D'ÉDITION DU MODÈLE CHOISI (SANS AUTRES MODÈLES DISTRAYANTS) ─────────────── */
        <>
          {/* Bannière du modèle sélectionné : compacte sur téléphone, pour laisser la place aux champs */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-gray-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-5">
            <div className="flex items-center gap-3 sm:gap-5 min-w-0">
              <div className="w-11 h-14 sm:w-20 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden relative shrink-0 shadow-md border border-gray-200 bg-gray-100">
                <Image
                  key={currentModel.id}
                  src={currentModel.image}
                  alt={currentModel.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5 sm:mb-1">
                  <span className="inline-flex items-center gap-1.5 sm:bg-[#fbf7f0] sm:border border-[#b8924a]/30 sm:px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#8f6f33]">
                    <Sparkles size={11} className="text-[#b8924a]" />
                    Modèle sélectionné
                  </span>
                  <span className="hidden sm:inline text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {currentModel.badge}
                  </span>
                </div>
                <h1 className="text-lg sm:text-2xl font-serif font-bold text-gray-950 truncate">
                  <span className="hidden sm:inline">Personnalisation · </span>
                  {currentModel.name}
                </h1>
                <p className="hidden sm:block text-xs text-gray-500 mt-1 max-w-xl leading-relaxed">
                  Renseignez vos textes, photos, programme et musiques ci-dessous. Vous pourrez prévisualiser le résultat complet en plein écran à la dernière étape avant de valider votre création.
                </p>
                <div className="mt-0.5 sm:mt-2.5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReturnToGallery}
                    className="text-xs text-[#8f6f33] hover:text-black font-semibold underline underline-offset-2 flex items-center gap-1 transition-colors"
                  >
                    ← <span className="sm:hidden">Changer de modèle</span>
                    <span className="hidden sm:inline">Choisir un autre modèle dans la galerie</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Boutons d'action rapides : côte à côte sur téléphone */}
            <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5 sm:flex-wrap md:self-center">
              <button
                type="button"
                onClick={() => setIsPreviewFullScreenOpen(true)}
                className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-gray-300 hover:border-black bg-white text-gray-800 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95"
              >
                <Eye size={16} className="text-[#b8924a] shrink-0" />
                <span className="sm:hidden">Aperçu</span>
                <span className="hidden sm:inline">Voir le résultat en plein écran</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isCardStudioModel) {
                    setIsCartesModalOpen(true);
                  } else {
                    setIsCheckoutModalOpen(true);
                  }
                }}
                className="px-3 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-black via-gray-900 to-black hover:brightness-125 text-[#b8924a] rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm shadow-xl shadow-black/10 border border-[#b8924a]/30 transition-all flex items-center justify-center gap-1.5 sm:gap-2 group active:scale-95"
              >
                <Crown size={16} className="text-[#b8924a] shrink-0" />
                <span className="sm:hidden">Valider</span>
                <span className="hidden sm:inline">Valider &amp; Finaliser l&apos;achat</span>
                <ArrowRight size={14} className="hidden sm:block group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Le Studio embarqué dédié uniquement au modèle choisi (sans cadre en double sur téléphone) */}
          <div className={`w-full bg-white rounded-2xl sm:rounded-3xl shadow-sm sm:shadow-xl border border-gray-200/90 overflow-hidden flex flex-col sm:min-h-[750px] lg:h-[940px] 2xl:h-[980px] [--studio-sticky-top:4rem] ${inDashboard ? 'sm:[--studio-sticky-top:5rem]' : ''} lg:[--studio-sticky-top:0px]`}>
            {selectedModelId === VELOURS_MODEL_ID && (
              <VeloursStudio
                value={veloursContent}
                onChange={setVeloursContent}
                onViewFullScreen={() => setIsPreviewFullScreenOpen(true)}
                onFinalize={() => setIsCheckoutModalOpen(true)}
                isStatic={isStaticCard}
              />
            )}
            {selectedModelId === SCEAU_MODEL_ID && (
              <SceauStudio
                value={sceauContent}
                onChange={setSceauContent}
                onViewFullScreen={() => setIsPreviewFullScreenOpen(true)}
                onFinalize={() => setIsCheckoutModalOpen(true)}
                isStatic={isStaticCard}
              />
            )}
            {selectedModelId === IVOIRE_MODEL_ID && (
              <IvoireStudio
                value={ivoireContent}
                onChange={setIvoireContent}
                onViewFullScreen={() => setIsPreviewFullScreenOpen(true)}
                onFinalize={() => setIsCheckoutModalOpen(true)}
                isStatic={isStaticCard}
              />
            )}
            {selectedModelId === ROSE_OR_MODEL_ID && (
              <RoseOrStudio
                value={roseOrContent}
                onChange={setRoseOrContent}
                onViewFullScreen={() => setIsPreviewFullScreenOpen(true)}
                onFinalize={() => setIsCheckoutModalOpen(true)}
                isStatic={isStaticCard}
              />
            )}
            {(() => {
              const m = customOf(selectedModelId);
              if (!m) return null;
              return (
                <CustomSectionsEditor
                  model={m}
                  fields={m.fields}
                  values={customContentOf(m)}
                  onChange={(v) => setCustomContents((all) => ({ ...all, [customModelId(m.slug)]: v }))}
                  isStatic={isStaticCard}
                  onViewFullScreen={() => setIsPreviewFullScreenOpen(true)}
                />
              );
            })()}
            {isCardStudioModel && (
              <div className="p-4 sm:p-8 bg-[#faf6ee] overflow-y-auto flex-1">
                <CartesStudio
                  cardType={
                    selectedModelId === VOEU_EXCEPTION_MODEL_ID
                      ? "voeu"
                      : selectedModelId === MOT_DOUX_MODEL_ID
                        ? "mot_doux"
                        : "invitation_couple"
                  }
                  occasionName={currentModel.name}
                  templateTitle={currentModel.name}
                  priceFcfa={3900}
                  priceEur="3,90 €"
                  value={cartesContent}
                  onChange={(patch) => setCartesContent((prev) => ({ ...prev, ...patch }))}
                  onProceedToCheckout={() => setIsCartesModalOpen(true)}
                  inspirations={
                    selectedModelId === VOEU_EXCEPTION_MODEL_ID
                      ? VOEUX_INSPIRATIONS.map((i) => ({ title: i.title, text: i.text }))
                      : ROMANCE_INSPIRATIONS.filter((i) => i.type === (selectedModelId === MOT_DOUX_MODEL_ID ? "mot_doux" : "invitation_couple")).map((i) => ({ title: i.title, text: i.text }))
                  }
                />
              </div>
            )}
            {selectedModelId === ANNIVERSAIRE_MODEL_ID && (
              <AnniversaireStudio
                value={anniversaireContent}
                onChange={setAnniversaireContent}
                onViewFullScreen={() => setIsPreviewFullScreenOpen(true)}
                onFinalize={() => setIsCheckoutModalOpen(true)}
                isStatic={isStaticCard}
              />
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODALE D'APERÇU PLEIN ÉCRAN DU RÉSULTAT AVEC MODIFICATIONS       */}
      {/* (Protégé : sans téléchargement avant paiement)                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isPreviewFullScreenOpen && (
        <InvitationCtaContext.Provider value={{ force: inDashboard }}>
          <div
            className="fixed inset-0 z-[100] h-dvh bg-black overflow-y-auto overscroll-contain select-none flex flex-col"
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* En-tête sur une ligne format très simple au clic */}
            <header className="fixed top-0 left-0 right-0 z-[120] h-[52px] pt-[env(safe-area-inset-top,0px)] px-3 sm:px-6 bg-[#0e0a08]/94 backdrop-blur-md border-b border-[#D4AF37]/35 flex items-center justify-between gap-3 shadow-lg select-none">
              <button
                type="button"
                onClick={() => setIsPreviewFullScreenOpen(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-[#D4AF37]/50 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <ArrowLeft size={14} className="shrink-0" />
                <span>Revenir à la création</span>
              </button>

              <div className="text-center min-w-0 max-w-md hidden sm:block">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-extrabold block">Aperçu de votre invitation</span>
                <p className="font-serif text-sm text-white/90 truncate font-medium">Votre création Evenium</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPreviewFullScreenOpen(false);
                  setIsCheckoutModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black font-extrabold text-xs shadow-md shadow-[#D4AF37]/25 hover:brightness-105 active:scale-95 transition-all border border-[#D4AF37]/60 whitespace-nowrap cursor-pointer"
              >
                <Sparkles size={14} className="text-black shrink-0" />
                <span>Valider l&apos;achat</span>
              </button>
            </header>

            {/* Corps de l'invitation en plein écran avec modifications */}
            <div className="w-full relative min-h-dvh pt-[52px]">
              {selectedModelId === VELOURS_MODEL_ID && (
                <VeloursInvitation
                  content={forInvitationKind(veloursContent, isStaticCard)}
                  preview={true}
                  hideCta={true}
                  onBackToEdit={() => setIsPreviewFullScreenOpen(false)}
                  onFinalize={() => {
                    setIsPreviewFullScreenOpen(false);
                    setIsCheckoutModalOpen(true);
                  }}
                />
              )}
              {selectedModelId === SCEAU_MODEL_ID && (
                <SceauInvitation
                  content={forInvitationKind(sceauContent, isStaticCard)}
                  preview={true}
                  hideCta={true}
                  onBackToEdit={() => setIsPreviewFullScreenOpen(false)}
                  onFinalize={() => {
                    setIsPreviewFullScreenOpen(false);
                    setIsCheckoutModalOpen(true);
                  }}
                />
              )}
              {selectedModelId === IVOIRE_MODEL_ID && (
                <IvoireInvitation
                  content={forInvitationKind(ivoireContent, isStaticCard)}
                  preview={true}
                  hideCta={true}
                  onBackToEdit={() => setIsPreviewFullScreenOpen(false)}
                  onFinalize={() => {
                    setIsPreviewFullScreenOpen(false);
                    setIsCheckoutModalOpen(true);
                  }}
                />
              )}
              {selectedModelId === ROSE_OR_MODEL_ID && (
                <RoseOrInvitation
                  content={forInvitationKind(roseOrContent, isStaticCard)}
                  hideCta={true}
                  onBackToEdit={() => setIsPreviewFullScreenOpen(false)}
                  onFinalize={() => {
                    setIsPreviewFullScreenOpen(false);
                    setIsCheckoutModalOpen(true);
                  }}
                />
              )}
              {(() => {
                const m = customOf(selectedModelId);
                if (!m) return null;
                const values = customContentOf(m);
                return (
                  <div className="w-full h-dvh">
                    <CustomInvitationFrame
                      model={m}
                      values={isStaticCard ? withoutMusicValues(m.fields, values) : values}
                      hideCta={true}
                      className="w-full h-dvh border-0 block bg-white"
                      onBackToEdit={() => setIsPreviewFullScreenOpen(false)}
                      onFinalize={() => {
                        setIsPreviewFullScreenOpen(false);
                        setIsCheckoutModalOpen(true);
                      }}
                    />
                  </div>
                );
              })()}
              {isCardStudioModel && (
                <div className="min-h-screen bg-[#0d0603] text-[#fbf7ee] flex items-center justify-center p-4">
                  <div className="w-full max-w-xl mx-auto space-y-4 my-auto">
                    <div className={`p-8 sm:p-12 rounded-3xl ${cartesContent.paperTheme === "rose"
                        ? "bg-[#fff5f6] text-[#2d1217]"
                        : cartesContent.paperTheme === "parchment"
                          ? "bg-[#f8f0de] text-[#28180c]"
                          : cartesContent.paperTheme === "dark_velvet"
                            ? "bg-[#160f0c] text-[#fbf7ee]"
                            : "bg-[#fcf9f2] text-[#24170e]"
                      } border border-[#d9c08c] shadow-2xl text-center space-y-4 relative`}>
                      <div className="absolute inset-2 border border-[#d4af37]/30 rounded-2xl pointer-events-none" />
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#8f6f33]">
                        {cartesContent.kicker || "Attention Particulière"}
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold">{cartesContent.title}</h3>
                      <p className="font-serif text-base sm:text-lg italic leading-relaxed whitespace-pre-line">
                        "{cartesContent.message}"
                      </p>
                      {selectedModelId === INVI_COUPLE_MODEL_ID && (cartesContent.rendezVousDate || cartesContent.rendezVousPlace) && (
                        <div className="p-4 bg-black/5 rounded-2xl border border-[#b8924a]/30 text-xs text-left space-y-1.5">
                          <p className="font-bold text-[#8f6f33]">🕯️ Rendez-vous en Amoureux</p>
                          {cartesContent.rendezVousDate && <p><strong>Date :</strong> {cartesContent.rendezVousDate} {cartesContent.rendezVousTime && `à ${cartesContent.rendezVousTime}`}</p>}
                          {cartesContent.rendezVousPlace && <p><strong>Lieu :</strong> {cartesContent.rendezVousPlace}</p>}
                          {cartesContent.dressCode && <p><strong>Dress Code :</strong> {cartesContent.dressCode}</p>}
                          <p className="pt-2 text-center text-[#d62828] font-bold">Bouton invité : « J'accepte avec amour ❤️ »</p>
                        </div>
                      )}
                      <div className="pt-4 border-t border-black/10 text-right text-xs font-serif italic">
                        Avec toute mon affection, <br />
                        <strong className="not-italic font-bold">{cartesContent.sender || "L'Expéditeur"}</strong>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsPreviewFullScreenOpen(false)}
                        className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
                      >
                        Revenir à l'édition
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPreviewFullScreenOpen(false);
                          setIsCartesModalOpen(true);
                        }}
                        className="btn-lux px-6 py-2.5 text-xs font-bold cursor-pointer"
                      >
                        Valider &amp; Finaliser (3 900 FCFA)
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {selectedModelId === ANNIVERSAIRE_MODEL_ID && (
                <AnniversaireInvitation
                  content={forInvitationKind(anniversaireContent, isStaticCard)}
                  preview
                  onBackToEdit={() => setIsPreviewFullScreenOpen(false)}
                  onFinalize={() => {
                    setIsPreviewFullScreenOpen(false);
                    setIsCheckoutModalOpen(true);
                  }}
                />
              )}
            </div>
          </div>
        </InvitationCtaContext.Provider>
      )}

      {/* Aperçu d'un modèle de la galerie : immersion totale 100% pure (Proposition 2 Evenium Haute Couture) */}
      {demoModelId && (
        <InvitationCtaContext.Provider value={{ force: true, variant: 'choose' }}>
          <div
            className="fixed inset-0 z-[100] w-screen h-screen bg-[#0c0a09] flex flex-col overflow-hidden select-none"
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Bouton de sortie discret Haute Joaillerie : zéro barre, zéro camouflage, le haut reste 100% libre */}
            <button
              type="button"
              onClick={() => setShowDemoExitModal(true)}
              aria-label="Fermer l'aperçu"
              className="absolute top-3 left-3 sm:top-5 sm:left-5 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Modale de sortie Haute Couture : le client choisit sans jamais gâter la vue pendant l'aperçu */}
            {showDemoExitModal && (
              <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="card-lux max-w-sm w-full p-6 sm:p-7 text-center relative rounded-3xl bg-[#140e0a] border border-[#d4af37]/40 shadow-2xl">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-transparent border border-[#d4af37]/40 flex items-center justify-center">
                    <Sparkles size={22} className="text-[#d4af37]" />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-white mb-2">Ce modèle vous plaît ?</h3>
                  <p className="text-xs text-white/70 mb-6 leading-relaxed">
                    Sélectionnez ce modèle pour le personnaliser avec vos propres textes, photos et musiques, ou continuez à explorer notre collection.
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        handleChooseModel(demoModelId);
                        setDemoModelId(null);
                        setShowDemoExitModal(false);
                        window.scrollTo({ top: 0 });
                      }}
                      className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e7b4] to-[#d4af37] text-black font-extrabold text-xs shadow-lg hover:brightness-105 active:scale-95 transition-all cursor-pointer border border-[#d4af37]/70"
                    >
                      ✨ Choisir ce modèle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDemoModelId(null);
                        setShowDemoExitModal(false);
                      }}
                      className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-semibold transition-all cursor-pointer border border-white/10"
                    >
                      Explorer d&apos;autres modèles
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Corps de l'aperçu : centré dans un châssis smartphone sur grand écran, pleine page sur mobile */}
            <div className="flex-1 min-h-0 w-full flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden relative">
              <div aria-hidden className="hidden sm:block absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-[#b8924a]/10 blur-[140px] pointer-events-none" />
              <div aria-hidden className="hidden sm:block absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-[#6b1428]/20 blur-[140px] pointer-events-none" />

              <div className="relative w-full h-full sm:w-[430px] sm:h-[min(90vh,880px)] sm:max-h-[880px] bg-white sm:rounded-[38px] sm:shadow-[0_25px_90px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.1),0_0_0_6px_#1c1714] overflow-hidden flex flex-col">
                <div className="w-full h-full overflow-y-auto overscroll-contain">
                  {(() => {
                    const back = () => setDemoModelId(null);
                    const choose = () => {
                      handleChooseModel(demoModelId);
                      setDemoModelId(null);
                      window.scrollTo({ top: 0 });
                    };
                    if (demoModelId === VELOURS_MODEL_ID) return <VeloursInvitation content={forInvitationKind(veloursDefaults(publishedContent(VELOURS_MODEL_ID) ?? DEFAULT_VELOURS), classifiedModels.find((m) => m.id === VELOURS_MODEL_ID)?.kind === 'carte')} preview hideCta={true} onBackToEdit={back} onFinalize={choose} />;
                    if (demoModelId === SCEAU_MODEL_ID) return <SceauInvitation content={forInvitationKind(sceauDefaults(publishedContent(SCEAU_MODEL_ID) ?? DEFAULT_SCEAU), classifiedModels.find((m) => m.id === SCEAU_MODEL_ID)?.kind === 'carte')} preview hideCta={true} onBackToEdit={back} onFinalize={choose} />;
                    if (demoModelId === IVOIRE_MODEL_ID) return <IvoireInvitation content={forInvitationKind(ivoireDefaults(publishedContent(IVOIRE_MODEL_ID) ?? DEFAULT_IVOIRE), classifiedModels.find((m) => m.id === IVOIRE_MODEL_ID)?.kind === 'carte')} preview hideCta={true} onBackToEdit={back} onFinalize={choose} />;
                    if (demoModelId === ROSE_OR_MODEL_ID) return <RoseOrInvitation content={forInvitationKind(roseOrDefaults(publishedContent(ROSE_OR_MODEL_ID) ?? DEFAULT_ROSE_OR), classifiedModels.find((m) => m.id === ROSE_OR_MODEL_ID)?.kind === 'carte')} hideCta={true} onBackToEdit={back} onFinalize={choose} />;
                    const custom = customOf(demoModelId);
                    if (custom) {
                      const values = customValues(custom.fields, custom.content);
                      return (
                        <div className="w-full h-full">
                          <CustomInvitationFrame
                            model={custom}
                            values={custom.invitation_type === 'carte' ? withoutMusicValues(custom.fields, values) : values}
                            hideCta={true}
                            className="w-full h-full border-0 block bg-white"
                            onBackToEdit={back}
                            onFinalize={choose}
                          />
                        </div>
                      );
                    }
                    if (demoModelId === ANNIVERSAIRE_MODEL_ID) return <AnniversaireInvitation content={forInvitationKind(anniversaireDefaults(publishedContent(ANNIVERSAIRE_MODEL_ID) ?? DEFAULT_ANNIVERSAIRE), classifiedModels.find((m) => m.id === ANNIVERSAIRE_MODEL_ID)?.kind === 'carte')} preview hideCta={true} onBackToEdit={back} onFinalize={choose} />;
                    if (demoModelId === VOEU_EXCEPTION_MODEL_ID) return <CartesInvitationPreview content={{ ...DEFAULT_VOEU_CONTENT, ...(publishedContent(VOEU_EXCEPTION_MODEL_ID) as any) }} onBackToEdit={back} onFinalize={choose} />;
                    if (demoModelId === MOT_DOUX_MODEL_ID) return <CartesInvitationPreview content={{ ...DEFAULT_MOT_DOUX_CONTENT, ...(publishedContent(MOT_DOUX_MODEL_ID) as any) }} onBackToEdit={back} onFinalize={choose} />;
                    if (demoModelId === INVI_COUPLE_MODEL_ID) return <CartesInvitationPreview content={{ ...DEFAULT_COUPLE_CONTENT, ...(publishedContent(INVI_COUPLE_MODEL_ID) as any) }} onBackToEdit={back} onFinalize={choose} />;
                    return null;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </InvitationCtaContext.Provider>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODALE DE FINALISATION, FORMULE & ACTIVATION DU COMPTE             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Modale d'achat direct pour Vœux, Mots Doux & Invitations Couple */}
      {isCartesModalOpen && (
        <CardStudioModal
          isOpen={isCartesModalOpen}
          onClose={() => setIsCartesModalOpen(false)}
          cardConfig={{
            type: selectedModelId === VOEU_EXCEPTION_MODEL_ID
              ? "voeu"
              : selectedModelId === MOT_DOUX_MODEL_ID
                ? "mot_doux"
                : "invitation_couple",
            templateId: selectedModelId,
            occasionId: selectedModelId === VOEU_EXCEPTION_MODEL_ID ? "anniversaire" : "diner_secret",
            occasionName: currentModel.name,
            templateTitle: currentModel.name,
            theme: cartesContent.paperTheme,
            waxSealColor: cartesContent.sealColor,
            defaultSender: cartesContent.sender,
            defaultRecipient: cartesContent.recipient,
            defaultKicker: cartesContent.kicker,
            defaultTitle: cartesContent.title,
            defaultMessage: cartesContent.message,
            suggestedMusic: cartesContent.music,
            defaultDate: cartesContent.rendezVousDate,
            defaultTime: cartesContent.rendezVousTime,
            defaultPlace: cartesContent.rendezVousPlace,
            defaultDressCode: cartesContent.dressCode,
            priceFcfa: 3900,
            priceEur: "3,90 €",
          }}
        />
      )}

      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden my-3 sm:my-auto animate-in zoom-in-95 duration-200">

            {/* Header Modal */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-5 border-b border-gray-100 bg-[#fbf7f0] gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8f6f33] bg-white px-2.5 py-0.5 rounded-full border border-[#b8924a]/30">
                  {standardSuccessEvent ? "Paiement Validé · Accès Dashboard Débloqué" : "Étape finale"}
                </span>
                <h3 className="font-serif text-lg sm:text-2xl font-bold text-gray-900 mt-1 leading-snug">
                  {standardSuccessEvent
                    ? "Votre Événement & Votre Dashboard sont Prêts !"
                    : "Activez votre Événement & Partagez votre Invitation"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCheckoutModalOpen(false);
                  if (standardSuccessEvent) setStandardSuccessEvent(null);
                }}
                className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Corps Modal : Écran de Succès avec Téléchargement Direct & Accès Dashboard */}
            {standardSuccessEvent ? (
              <div className="p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#b8924a] to-[#d4af37] p-[2px] mx-auto mb-4 shadow-xl shadow-[#b8924a]/25 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <CheckCircle2 size={32} className="text-[#b8924a]" />
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8f6f33] bg-[#fbf7f0] px-3 py-1 rounded-full border border-[#b8924a]/30">
                    Formule {standardSuccessEvent.plan || selectedPlan} Activée · {planPrice.toLocaleString('fr-FR')} FCFA
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                    Félicitations {fullName || "Organisateur"} !
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
                    Votre paiement est validé. Votre invitation interactive et vos accès à votre Dashboard Organisateur sont désormais actifs.
                  </p>
                </div>

                {/* Carte d'accès & Lien direct */}
                <div className="bg-[#fbf7f0] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#b8924a]/30 space-y-4 max-w-xl mx-auto">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    <div className="w-12 h-16 rounded-xl overflow-hidden relative border border-gray-300 shrink-0">
                      <Image
                        key={currentModel.id}
                        src={currentModel.image}
                        alt={currentModel.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#8f6f33]">
                        {currentModel.badge} · Invitation &amp; Dashboard Débloqués
                      </span>
                      <h4 className="font-serif font-bold text-gray-900 text-sm truncate">
                        {eventMetadata.name}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {eventMetadata.date} · {eventMetadata.location || "Dakar"}
                      </p>
                    </div>
                  </div>

                  {/* Le lien officiel */}
                  <div className="pt-1">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <Share2 size={13} className="text-[#b8924a]" />
                      Lien officiel de votre invitation (partageable partout) :
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={typeof window !== 'undefined' ? `${window.location.origin}/invite/${standardSuccessEvent.id}` : `/invite/${standardSuccessEvent.id}`}
                        className="flex-1 min-w-0 bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-gray-900 outline-none select-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/invite/${standardSuccessEvent.id}`;
                          navigator.clipboard.writeText(url);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2500);
                        }}
                        className={`px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${copiedLink
                            ? "bg-emerald-600 text-white"
                            : "bg-black hover:bg-gray-800 text-[#b8924a] border border-[#b8924a]/30"
                          }`}
                      >
                        {copiedLink ? (
                          <>
                            <Check size={14} />
                            <span>Copié !</span>
                          </>
                        ) : (
                          <>
                            <Share2 size={14} />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Boutons d'action : WhatsApp + Tester l'invitation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `✨ Vous êtes cordialement invité(e) : ${eventMetadata.name} !\n\nDécouvrez votre invitation interactive de prestige ici :\n${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${standardSuccessEvent.id}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <span>📱</span>
                      <span>Partager sur WhatsApp</span>
                    </a>

                    <a
                      href={`/invite/${standardSuccessEvent.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                    >
                      <Eye size={15} className="text-[#b8924a]" />
                      <span>Tester mon invitation</span>
                    </a>
                  </div>

                  {/* QR Code Actif & Téléchargements */}
                  <div className="pt-2">
                    <EventQRCode
                      url={typeof window !== 'undefined' ? `${window.location.origin}/invite/${standardSuccessEvent.id}` : `/invite/${standardSuccessEvent.id}`}
                      eventName={eventMetadata.name}
                      date={eventMetadata.date}
                      size={140}
                    />
                  </div>

                  {/* Rappel des éléments d'authentification */}
                  <div className="p-3.5 bg-white/90 rounded-2xl border border-gray-200/90 text-[11px] text-gray-700 space-y-1.5">
                    <p className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Lock size={12} className="text-[#b8924a]" /> Éléments d&apos;authentification de l&apos;organisateur :
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-gray-400">Nom de l&apos;organisateur :</span>{" "}
                        <strong className="text-gray-900">{fullName || "Non spécifié"}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Identifiant Email :</span>{" "}
                        <strong className="text-gray-900">{email || currentUser?.email}</strong>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 pt-1 border-t border-gray-100">
                      💡 Vos identifiants vous permettent d&apos;accéder à tout moment à votre Dashboard Organisateur pour suivre votre événement et retrouver votre lien.
                    </p>
                  </div>

                  {/* Information Espace Dashboard Organisateur Débloqué */}
                  <div className="p-4 bg-gradient-to-r from-[#fbf7f0] via-[#f7f0e4] to-[#fbf7f0] rounded-2xl border border-[#b8924a]/35 text-[11px] text-gray-800 space-y-1.5">
                    <p className="font-bold flex items-center gap-1.5 text-xs text-[#8f6f33]">
                      <Crown size={14} className="text-[#b8924a]" /> Espace Dashboard Organisateur Débloqué !
                    </p>
                    <p className="text-[11px] leading-relaxed text-gray-600">
                      Félicitations ! Vous pouvez désormais piloter votre organisation, suivre vos confirmations, télécharger vos cartons numériques et personnaliser vos contenus en toute liberté depuis votre tableau de bord.
                    </p>
                  </div>
                </div>

                {/* Boutons de navigation post-activation */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutModalOpen(false);
                      const targetId = standardSuccessEvent.id;
                      setStandardSuccessEvent(null);
                      window.location.href = `/dashboard/events/${targetId}`;
                    }}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#b8924a] via-[#F3E5AB] to-[#b8924a] text-black font-extrabold text-sm shadow-xl shadow-[#b8924a]/25 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-[#b8924a]/60 cursor-pointer"
                  >
                    <LayoutDashboard size={17} />
                    <span>Accéder à mon Dashboard Organisateur</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutModalOpen(false);
                      setStandardSuccessEvent(null);
                      window.location.href = '/dashboard';
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs sm:text-sm border border-gray-300 shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <span>Tous mes événements</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Corps Modal Formulaire : Choix formule + Nom organisateur & Auth + Paiement */
              <form onSubmit={handleFinalActivation} className="p-3.5 sm:p-8 space-y-5 sm:space-y-6">

                {errorMessage && (
                  <div className="p-3.5 sm:p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs sm:text-sm font-medium">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">

                  {/* Colonne Gauche : Formule, Compte & Paiement (7 cols) */}
                  <div className="lg:col-span-7 space-y-5 sm:space-y-6 min-w-0">

                    {/* 1. Choix Formule */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                          <Crown size={15} className="text-[#b8924a] shrink-0" /> 1. Choisissez votre formule Evenium
                        </label>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-3">
                        Sélectionnez la formule correspondant à votre besoin d&apos;organisation.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        {/* Formule Standard */}
                        <div
                          onClick={() => choosePlan('Standard')}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${selectedPlan === 'Standard'
                              ? "border-[#b8924a] bg-[#fbf7f0] shadow-sm"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-serif font-bold text-sm text-gray-900">Standard</span>
                              {selectedPlan === 'Standard' && <CheckCircle2 size={16} className="text-[#b8924a] shrink-0" />}
                            </div>
                            <p className="text-lg font-bold text-black mb-2">
                              5 000 <span className="text-[10px] text-gray-500 font-normal">FCFA</span>
                            </p>
                            <ul className="text-[10px] text-gray-600 space-y-1.5">
                              <li className="flex items-start gap-1 font-medium">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span>Faire-part digital interactif</span>
                              </li>
                              <li className="flex items-start gap-1 font-medium">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span><strong>Accès Dashboard Organisateur</strong></span>
                              </li>
                              <li className="flex items-start gap-1 font-medium">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span><strong>Lien officiel direct &amp; QR Code actif</strong></span>
                              </li>
                              <li className="flex items-start gap-1 font-medium">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span>Téléchargement PNG &amp; Carton imprimable</span>
                              </li>
                              <li className="flex items-start gap-1 font-medium">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span>Partage WhatsApp &amp; réseaux illimité</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Formule Premium */}
                        <div
                          onClick={() => choosePlan('Premium')}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${selectedPlan === 'Premium'
                              ? "border-[#b8924a] bg-[#fbf7f0] shadow-sm"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-serif font-bold text-sm text-gray-900">Premium</span>
                              {selectedPlan === 'Premium' && <CheckCircle2 size={16} className="text-[#b8924a] shrink-0" />}
                            </div>
                            <p className="text-lg font-bold text-black mb-2">
                              10 000 <span className="text-[10px] text-gray-500 font-normal">FCFA</span>
                            </p>
                            <ul className="text-[10px] text-gray-600 space-y-1.5">
                              <li className="flex items-start gap-1 font-medium">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span>Tout le pack Standard inclus</span>
                              </li>
                              <li className="flex items-start gap-1 font-medium">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span><strong>Accès Dashboard Organisateur</strong></span>
                              </li>
                              <li className="flex items-start gap-1 font-medium">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span>Suivi des confirmations RSVP</span>
                              </li>
                              <li className="flex items-start gap-1 font-medium">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span>Programme &amp; GPS Maps</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Formule Gold */}
                        <div
                          onClick={() => choosePlan('Gold')}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative mt-2.5 sm:mt-0 ${selectedPlan === 'Gold'
                              ? "border-[#b8924a] bg-[#fbf7f0] shadow-sm"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                        >
                          <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-[#b8924a] to-[#8f6f33] text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                            Recommandée
                          </span>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-serif font-bold text-sm text-gray-900">Gold VIP</span>
                              {selectedPlan === 'Gold' && <CheckCircle2 size={16} className="text-[#b8924a] shrink-0" />}
                            </div>
                            <p className="text-lg font-bold text-black mb-2">
                              20 000 <span className="text-[10px] text-gray-500 font-normal">FCFA</span>
                            </p>
                            <ul className="text-[10px] text-gray-600 space-y-1.5">
                              <li className="flex items-start gap-1 font-medium">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span>Tout le pack Premium inclus</span>
                              </li>
                              <li className="flex items-start gap-1 font-medium">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span><strong>Dashboard complet de Gestion</strong></span>
                              </li>
                              <li className="flex items-start gap-1 font-medium">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span>Budget &amp; Checklist Jour J</span>
                              </li>
                              <li className="flex items-start gap-1 font-medium">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span>Prestataires &amp; Support 7j/7</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Détails de l'événement : obligatoires pour Premium et Gold */}
                    {requiresEventDetails(selectedPlan) && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="mb-3">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                            <Crown size={15} className="text-[#b8924a] shrink-0" /> Détails de votre événement
                          </label>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Inclus dans la formule {selectedPlan === "Gold" ? "Gold VIP" : selectedPlan} : ces informations sont reportées automatiquement dans votre dashboard, où vous pourrez les modifier.
                          </p>
                        </div>
                        <div className="bg-[#fbf7f0] p-3 sm:p-4 rounded-2xl border border-[#b8924a]/30 overflow-hidden">
                          <EventDetailsFields value={detailsWithInvitation} onChange={setEventDetails} showErrors={showDetailsErrors} compact />
                        </div>
                      </div>
                    )}

                    {/* 2. Nom de l'Organisateur & Éléments d'Authentification */}
                    <div className={`pt-2 border-t border-gray-100 ${inDashboard && currentUser ? 'hidden' : ''}`}>
                      <div className="mb-2.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                          <User size={15} className="text-[#b8924a] shrink-0" /> 2. Nom de l&apos;organisateur &amp; Éléments d&apos;authentification
                        </label>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Renseignez le nom de l&apos;organisateur et vos éléments d&apos;authentification (mail et mot de passe) pour télécharger votre lien officiel, votre QR Code actif et accéder à votre tableau de bord Organisateur.
                        </p>
                      </div>

                      {currentUser ? (
                        <div className="space-y-3 bg-[#fbf7f0] p-3.5 sm:p-4 rounded-2xl border border-[#b8924a]/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                              <span className="text-xs font-bold text-gray-900 truncate">Compte Organisateur vérifié</span>
                            </div>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full shrink-0">
                              Connecté
                            </span>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              Nom de l&apos;organisateur
                            </label>
                            <input
                              type="text"
                              required={!inDashboard}
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Ex: Alexandre Diop ou Famille Diop"
                              className="w-full min-w-0 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#b8924a] outline-none"
                            />
                          </div>

                          <div className="p-2.5 bg-white rounded-xl border border-gray-200 flex items-center justify-between text-xs gap-2 min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <Mail size={14} className="text-gray-400 shrink-0" />
                              <span className="text-gray-600 font-medium truncate">{currentUser.email}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap">Authentification validée</span>
                          </div>

                          <p className="text-[10px] text-gray-500 italic">
                            💡 Vos modèles et votre lien de téléchargement direct seront rattachés à ce compte organisateur.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 bg-gray-50 p-3.5 sm:p-4 rounded-2xl border border-gray-200">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-800 mb-1 flex items-center justify-between">
                              <span>Nom de l&apos;organisateur</span>
                              <span className="text-[10px] font-normal text-gray-500">Requis</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Ex: Alexandre Diop (ou Famille Diop)"
                              className="w-full min-w-0 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#b8924a] outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="min-w-0">
                              <label className="block text-[11px] font-bold text-gray-800 mb-1 flex items-center justify-between">
                                <span>Adresse Mail (Identifiant)</span>
                                <Mail size={12} className="text-gray-400 shrink-0" />
                              </label>
                              <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="organisateur@exemple.com"
                                className="w-full min-w-0 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#b8924a] outline-none"
                              />
                            </div>

                            <div className="min-w-0">
                              <label className="block text-[11px] font-bold text-gray-800 mb-1 flex items-center justify-between">
                                <span>Mot de passe</span>
                                <Lock size={12} className="text-gray-400 shrink-0" />
                              </label>
                              <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full min-w-0 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#b8924a] outline-none"
                              />
                            </div>
                          </div>

                          <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/60 text-[10px] text-amber-900 flex items-start gap-2">
                            <Lock size={13} className="text-[#b8924a] shrink-0 mt-0.5" />
                            <span>
                              Ces éléments d&apos;authentification (mail et mot de passe) vous permettront d&apos;avoir accès à votre modèle par téléchargement direct du lien d&apos;invitation à tout moment.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3. Moyen de paiement */}
                    <div className="pt-2 border-t border-gray-100">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2.5 flex items-center gap-1.5">
                        <CreditCard size={15} className="text-[#b8924a] shrink-0" /> 3. Moyen de paiement
                      </label>

                      <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('wave')}
                          className={`p-2 sm:p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all text-center min-w-0 ${paymentMethod === 'wave'
                              ? "border-[#1DA1F2] bg-[#E8F5FD] text-[#1DA1F2] font-bold"
                              : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                            }`}
                        >
                          <span className="text-base sm:text-lg">🌊</span>
                          <span className="text-[10px] sm:text-[11px] font-bold truncate w-full">Wave</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('om')}
                          className={`p-2 sm:p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all text-center min-w-0 ${paymentMethod === 'om'
                              ? "border-[#FF6600] bg-[#FFF2E8] text-[#FF6600] font-bold"
                              : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                            }`}
                        >
                          <span className="text-base sm:text-lg">🟠</span>
                          <span className="text-[10px] sm:text-[11px] font-bold leading-tight truncate w-full">Orange Money</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`p-2 sm:p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all text-center min-w-0 ${paymentMethod === 'card'
                              ? "border-black bg-gray-50 text-black font-bold"
                              : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                            }`}
                        >
                          <CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" />
                          <span className="text-[10px] sm:text-[11px] font-bold leading-tight truncate w-full">Carte Bancaire</span>
                        </button>
                      </div>

                      {(paymentMethod === 'wave' || paymentMethod === 'om') && (
                        <div>
                          <label className="block text-[11px] font-medium text-gray-700 mb-1">
                            Numéro de téléphone pour la validation
                          </label>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Ex: 77 000 00 00"
                            className="w-full min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#b8924a] outline-none"
                          />
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Colonne Droite : Récapitulatif Direct de l'Événement (5 cols) */}
                  <div className="lg:col-span-5 bg-[#fbf7f0] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 space-y-3.5 sm:space-y-4 min-w-0">

                    <div className="flex items-center gap-3 pb-3 border-b border-gray-200 min-w-0">
                      <div className="w-14 h-20 rounded-xl overflow-hidden relative border border-gray-300 shrink-0">
                        <Image
                          key={currentModel.id}
                          src={currentModel.image}
                          alt={currentModel.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8f6f33]">
                          {currentModel.badge}
                        </span>
                        <h4 className="font-serif font-bold text-gray-900 text-sm truncate">
                          {currentModel.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 truncate">
                          {selectedEventCategory}
                        </p>
                      </div>
                    </div>

                    {/* Informations reprises automatiquement de l'invitation */}
                    <div className="space-y-2 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Reprise automatique des données
                      </span>

                      <div className="bg-white p-3 rounded-xl border border-gray-200/80 space-y-1 min-w-0">
                        <p className="text-gray-500 text-[11px]">Nom officiel de l&apos;événement :</p>
                        <p className="font-serif font-bold text-gray-900 text-sm break-words">
                          {eventMetadata.name}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="bg-white p-2.5 rounded-xl border border-gray-200/80 min-w-0">
                          <p className="text-gray-400 text-[10px]">Date &amp; Heure :</p>
                          <p className="font-semibold text-gray-800 text-[11px] truncate">
                            {eventMetadata.date} à {eventMetadata.time}
                          </p>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-gray-200/80 min-w-0">
                          <p className="text-gray-400 text-[10px]">Lieu :</p>
                          <p className="font-semibold text-gray-800 text-[11px] truncate">
                            {eventMetadata.location || "Non spécifié"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Prix Total */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Formule {selectedPlan === "Gold" ? "Gold VIP" : selectedPlan} :</span>
                        <span>{planPrice.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <div className="flex items-center justify-between text-base font-bold text-black">
                        <span>Total à régler :</span>
                        <span className="text-[#b8924a] font-serif text-lg">{planPrice.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    </div>

                    {/* Bouton de confirmation adapté selon formule */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 sm:py-4 px-4 bg-gradient-to-r from-black via-gray-900 to-black hover:brightness-125 text-[#b8924a] rounded-2xl font-bold text-xs sm:text-sm shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2 border border-[#b8924a]/40 disabled:opacity-50 active:scale-98 text-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#b8924a] border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>Activation en cours...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={18} className="shrink-0" />
                          <span className="sm:hidden">Confirmer &amp; Accéder au Dashboard</span>
                          <span className="hidden sm:inline">Confirmer &amp; Accéder au Dashboard ({selectedPlan === "Gold" ? "Gold VIP" : selectedPlan})</span>
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                      <Lock size={11} className="shrink-0" />
                      <span>Paiement sécurisé — Lien officiel, QR Code actif &amp; Dashboard</span>
                    </p>

                  </div>

                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default function CreateStudio({ mode = 'public' }: { mode?: CreateStudioMode }) {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[600px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#b8924a] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CreateExpressStudioContent mode={mode} />
    </Suspense>
  );
}
