'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  Sparkles, 
  Heart, 
  Calendar, 
  MapPin, 
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
  Music,
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
import { EVENT_TYPES, EVENT_TYPE_ICONS as EVENT_ICONS } from '@/lib/eventTypes';
import { EventDetailsFields } from '@/components/events/EventDetailsFields';
import { EMPTY_EVENT_DETAILS, eventDetailsToRow, missingEventDetails, requiresEventDetails, type EventDetails } from '@/lib/eventDetails';

// Full Studio components
import VeloursStudio from '@/components/invitations/velours/VeloursStudio';
import { VELOURS_MODEL_ID, DEFAULT_VELOURS, type VeloursContent } from '@/components/invitations/velours/content';
import VeloursInvitation from '@/components/invitations/velours/VeloursInvitation';

import SceauStudio from '@/components/invitations/sceau/SceauStudio';
import { SCEAU_MODEL_ID, DEFAULT_SCEAU, type SceauContent } from '@/components/invitations/sceau/content';
import SceauInvitation from '@/components/invitations/sceau/SceauInvitation';

import IvoireStudio from '@/components/invitations/ivoire/IvoireStudio';
import { IVOIRE_MODEL_ID, DEFAULT_IVOIRE, type IvoireContent } from '@/components/invitations/ivoire/content';
import IvoireInvitation from '@/components/invitations/ivoire/IvoireInvitation';

import RoseOrStudio from '@/components/invitations/rose-or/RoseOrStudio';
import { ROSE_OR_MODEL_ID, DEFAULT_ROSE_OR, type RoseOrContent } from '@/components/invitations/rose-or/content';
import RoseOrInvitation from '@/components/invitations/rose-or/RoseOrInvitation';

import AnniversaireStudio from '@/components/invitations/anniversaire/AnniversaireStudio';
import { ANNIVERSAIRE_MODEL_ID, DEFAULT_ANNIVERSAIRE, type AnniversaireContent } from '@/components/invitations/anniversaire/content';
import AnniversaireInvitation from '@/components/invitations/anniversaire/AnniversaireInvitation';

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
    compatibleEvents: ["Mariage"],
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
    compatibleEvents: ["Mariage"],
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
    compatibleEvents: ["Mariage"],
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
    compatibleEvents: ["Mariage"],
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
  }
];

// Types d'événements
// L'id est le type enregistré sur l'événement ; « Bientôt » tant qu'aucun modèle n'est compatible
const EVENT_CATEGORIES: { id: string; label: string; icon: string; isSoon?: boolean }[] = [
  { id: "Tous", label: "Tous les modèles", icon: "✨" },
  { id: "Mariage", label: "Mariage", icon: EVENT_ICONS["Mariage"] },
  ...EVENT_TYPES.filter((t) => t !== "Mariage").map((t) => ({
    id: t,
    label: t,
    icon: EVENT_ICONS[t],
    isSoon: !CATALOG_MODELS.some((m) => m.compatibleEvents.includes(t)),
  })),
];

function CreateExpressStudioContent() {
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
  const [selectedEventCategory, setSelectedEventCategory] = useState("Mariage");
  const [selectedModelId, setSelectedModelId] = useState<string>(VELOURS_MODEL_ID);

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

  // Choisir un modèle depuis la galerie
  const handleChooseModel = (modelId: string) => {
    const model = CATALOG_MODELS.find(m => m.id === modelId);
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
    return CATALOG_MODELS.find(m => m.id === selectedModelId) || CATALOG_MODELS[0];
  }, [selectedModelId]);

  // Filtrage des modèles selon l'événement choisi
  const filteredModels = useMemo(() => {
    if (selectedEventCategory === "Tous") return CATALOG_MODELS;
    return CATALOG_MODELS.filter(m => m.compatibleEvents.includes(selectedEventCategory));
  }, [selectedEventCategory]);

  // Si le modèle actuellement sélectionné n'est pas compatible avec la nouvelle catégorie, basculer sur le premier disponible
  useEffect(() => {
    const isCurrentCompatible = filteredModels.some(m => m.id === selectedModelId);
    if (!isCurrentCompatible && filteredModels.length > 0) {
      setSelectedModelId(filteredModels[0].id);
    }
  }, [selectedEventCategory, filteredModels, selectedModelId]);

  // Modale de finalisation & paiement
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Écouteurs globaux pour la communication avec les boutons de l'invitation
  useEffect(() => {
    const handleClose = () => setIsPreviewFullScreenOpen(false);
    const handleCheckout = () => {
      setIsPreviewFullScreenOpen(false);
      setIsCheckoutModalOpen(true);
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

    if (selectedModelId === VELOURS_MODEL_ID) {
      const isSingle = ["Baptême", "Anniversaire"].includes(selectedEventCategory);
      name = isSingle || !veloursContent.partnerB?.trim()
        ? `${selectedEventCategory === "Anniversaire" ? "Anniversaire de" : selectedEventCategory === "Baptême" ? "Baptême de" : selectedEventCategory} ${veloursContent.partnerA || "Mon Événement"}`
        : `Mariage de ${veloursContent.partnerA} & ${veloursContent.partnerB}`;
      date = veloursContent.date;
      time = veloursContent.time;
      location = [veloursContent.venue, veloursContent.city].filter(Boolean).join(", ");
      welcomeTitle = veloursContent.welcomeTitle || name;
      welcomeText = veloursContent.welcomeText;
      contentJson = veloursContent;
    } else if (selectedModelId === SCEAU_MODEL_ID) {
      const isSingle = ["Baptême", "Anniversaire"].includes(selectedEventCategory);
      name = isSingle || !sceauContent.partnerB?.trim()
        ? `${selectedEventCategory === "Anniversaire" ? "Anniversaire de" : selectedEventCategory === "Baptême" ? "Baptême de" : selectedEventCategory} ${sceauContent.partnerA || "Mon Événement"}`
        : `Mariage de ${sceauContent.partnerA} & ${sceauContent.partnerB}`;
      date = sceauContent.date;
      time = sceauContent.time;
      location = [sceauContent.venue, sceauContent.city].filter(Boolean).join(", ");
      welcomeTitle = sceauContent.welcomeTitle || name;
      welcomeText = sceauContent.welcomeText;
      contentJson = sceauContent;
    } else if (selectedModelId === IVOIRE_MODEL_ID) {
      const isSingle = ["Baptême", "Anniversaire"].includes(selectedEventCategory);
      name = isSingle || !ivoireContent.partnerB?.trim()
        ? `${selectedEventCategory === "Anniversaire" ? "Anniversaire de" : selectedEventCategory === "Baptême" ? "Baptême de" : selectedEventCategory} ${ivoireContent.partnerA || "Mon Événement"}`
        : `Mariage de ${ivoireContent.partnerA} & ${ivoireContent.partnerB}`;
      date = ivoireContent.date;
      time = ivoireContent.time;
      const v0 = ivoireContent.venues?.[0];
      location = [v0?.name, v0?.address].filter(Boolean).join(", ");
      welcomeTitle = ivoireContent.welcomeLead || name;
      welcomeText = ivoireContent.welcomeText;
      contentJson = ivoireContent;
    } else if (selectedModelId === ROSE_OR_MODEL_ID) {
      const isSingle = ["Baptême", "Anniversaire"].includes(selectedEventCategory);
      name = isSingle || !roseOrContent.partnerB?.trim()
        ? `${selectedEventCategory === "Anniversaire" ? "Anniversaire de" : selectedEventCategory === "Baptême" ? "Baptême de" : selectedEventCategory} ${roseOrContent.partnerA || "Mon Événement"}`
        : `Mariage de ${roseOrContent.partnerA} & ${roseOrContent.partnerB}`;
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
  }, [selectedModelId, selectedEventCategory, veloursContent, sceauContent, ivoireContent, roseOrContent, anniversaireContent]);

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
        format: 'Animée',
        status: 'active',
        invitation_model_id: selectedModelId,
        invitation_title: eventMetadata.welcomeTitle,
        invitation_message: eventMetadata.welcomeText,
        invitation_content: eventMetadata.contentJson,
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
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      
      {!hasChosenModel ? (
        /* ─────────────── 1. GALERIE DES MODÈLES (POUR CEUX QUI CRÉENT SANS MODÈLE D'ABORD) ─────────────── */
        <div className="w-full flex flex-col gap-8 animate-in fade-in duration-300">
          {/* En-tête de prestige */}
          <div className="text-center max-w-3xl mx-auto pt-4 sm:pt-6">
            <div className="inline-flex items-center gap-2 bg-[#fbf7f0] border border-[#b8924a]/40 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#8f6f33] mb-3 shadow-xs">
              <Sparkles size={13} className="text-[#b8924a]" />
              Étape 1 · Choisissez votre modèle
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-gray-950 tracking-tight">
              Sélectionnez votre faire-part digital de prestige
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-2.5 max-w-2xl mx-auto leading-relaxed">
              Chaque création Evenium propose une scénographie interactive unique (sceau de cire animé, velours précieux, rubans satinés, musique immersive et gestion des RSVP). Choisissez votre univers pour ouvrir son studio de personnalisation exclusif.
            </p>

            {/* Filtres de catégorie d'événement */}
            <div className="flex items-center justify-center gap-2 flex-wrap mt-6">
              {EVENT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedEventCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedEventCategory === cat.id
                      ? "bg-[#111] text-[#b8924a] border border-[#b8924a]/50 shadow-md scale-105"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  {cat.isSoon && (
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                      Bientôt
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {filteredModels.length === 0 && (
            <div className="max-w-xl mx-auto w-full text-center rounded-3xl border border-dashed border-[#b8924a]/40 bg-white/60 px-6 py-12">
              <p className="text-3xl mb-3">{EVENT_CATEGORIES.find(c => c.id === selectedEventCategory)?.icon}</p>
              <h3 className="font-serif text-2xl text-gray-900">Les modèles « {selectedEventCategory} » arrivent bientôt</h3>
              <p className="text-sm text-gray-600 mt-2">En attendant, nos modèles actuels peuvent être personnalisés pour votre événement.</p>
              <button
                type="button"
                onClick={() => setSelectedEventCategory("Tous")}
                className="mt-6 px-6 py-3 rounded-full bg-black text-[#f5eee1] text-xs uppercase tracking-[0.2em]"
              >
                Voir tous les modèles
              </button>
            </div>
          )}

          {/* Grille des modèles disponibles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto w-full">
            {filteredModels.map((model) => (
              <div
                key={model.id}
                className="group bg-white rounded-3xl border border-gray-200/90 hover:border-[#b8924a]/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Image & Badges */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gray-900">
                  <Image
                    src={model.image}
                    alt={model.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  
                  {/* Badge supérieur */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="bg-black/80 backdrop-blur-md border border-[#b8924a]/40 text-[#F3E5AB] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                      {model.badge}
                    </span>
                  </div>

                  {/* Titre & sous-titre sur l'image */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-1 drop-shadow-md">
                      {model.name}
                    </h3>
                    <p className="text-xs text-gray-200 line-clamp-1 drop-shadow-xs">
                      {model.subtitle}
                    </p>
                  </div>
                </div>

                {/* Caractéristiques du modèle */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5 bg-white">
                  <div className="space-y-2.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-[#b8924a] shrink-0" />
                      <span>Animation visuelle unique &amp; rideaux/sceaux interactifs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Music size={14} className="text-[#b8924a] shrink-0" />
                      <span>Lecteur audio avec musique de fond immersive</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-[#b8924a] shrink-0" />
                      <span>Formulaire RSVP temps réel avec gestion des invités &amp; QR Code</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#b8924a] shrink-0" />
                      <span>Programme de la journée &amp; itinéraire GPS Google Maps</span>
                    </div>
                  </div>

                  {/* Deux boutons d'action : Voir la démo + Choisir ce modèle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <a
                      href={model.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 rounded-2xl border border-gray-200 hover:border-black text-gray-800 font-bold text-xs flex items-center justify-center gap-2 transition-all bg-gray-50/60 hover:bg-gray-100 active:scale-95"
                    >
                      <Eye size={15} className="text-[#b8924a]" />
                      <span>Voir la démo</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleChooseModel(model.id)}
                      className="px-4 py-3 rounded-2xl bg-gradient-to-r from-black via-gray-900 to-black hover:brightness-125 text-[#b8924a] font-bold text-xs flex items-center justify-center gap-2 transition-all border border-[#b8924a]/40 shadow-md hover:shadow-lg active:scale-95"
                    >
                      <span>Choisir ce modèle</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Rassurance */}
          <div className="max-w-3xl mx-auto w-full pt-4 pb-8 flex items-center justify-center gap-6 flex-wrap text-xs text-gray-500 border-t border-gray-200/70">
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
          {/* Bannière du modèle sélectionné */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden relative shrink-0 shadow-md border border-gray-200 bg-gray-100">
                <Image
                  key={currentModel.id}
                  src={currentModel.image}
                  alt={currentModel.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="inline-flex items-center gap-1.5 bg-[#fbf7f0] border border-[#b8924a]/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#8f6f33]">
                    <Sparkles size={11} className="text-[#b8924a]" />
                    Modèle sélectionné
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {currentModel.badge}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-950">
                  Personnalisation · {currentModel.name}
                </h1>
                <p className="text-xs text-gray-500 mt-1 max-w-xl leading-relaxed">
                  Renseignez vos textes, photos, programme et musiques ci-dessous. Vous pourrez prévisualiser le résultat complet en plein écran à la dernière étape avant de valider votre création.
                </p>
                <div className="mt-2.5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReturnToGallery}
                    className="text-xs text-[#8f6f33] hover:text-black font-semibold underline underline-offset-2 flex items-center gap-1 transition-colors"
                  >
                    ← Choisir un autre modèle dans la galerie
                  </button>
                </div>
              </div>
            </div>

            {/* Boutons d'action rapides */}
            <div className="flex items-center gap-2.5 flex-wrap self-start md:self-center">
              <button
                type="button"
                onClick={() => setIsPreviewFullScreenOpen(true)}
                className="px-4 py-3 rounded-2xl border border-gray-300 hover:border-black bg-white text-gray-800 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 active:scale-95"
              >
                <Eye size={16} className="text-[#b8924a]" />
                <span>Voir le résultat en plein écran</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(true)}
                className="px-5 py-3 bg-gradient-to-r from-black via-gray-900 to-black hover:brightness-125 text-[#b8924a] rounded-2xl font-bold text-xs sm:text-sm shadow-xl shadow-black/10 border border-[#b8924a]/30 transition-all flex items-center gap-2 group active:scale-95"
              >
                <Crown size={16} className="text-[#b8924a]" />
                <span>Valider &amp; Finaliser l&apos;achat</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Le Studio embarqué dédié uniquement au modèle choisi */}
          <div className="w-full bg-[#faf7f5] rounded-3xl shadow-xl border border-gray-200/90 overflow-hidden flex flex-col h-[85dvh] min-h-[560px] max-h-[900px] lg:h-[900px]">
            {selectedModelId === VELOURS_MODEL_ID && (
              <VeloursStudio
                value={veloursContent}
                onChange={setVeloursContent}
                onViewFullScreen={() => setIsPreviewFullScreenOpen(true)}
                onFinalize={() => setIsCheckoutModalOpen(true)}
              />
            )}
            {selectedModelId === SCEAU_MODEL_ID && (
              <SceauStudio
                value={sceauContent}
                onChange={setSceauContent}
                onViewFullScreen={() => setIsPreviewFullScreenOpen(true)}
                onFinalize={() => setIsCheckoutModalOpen(true)}
              />
            )}
            {selectedModelId === IVOIRE_MODEL_ID && (
              <IvoireStudio
                value={ivoireContent}
                onChange={setIvoireContent}
                onViewFullScreen={() => setIsPreviewFullScreenOpen(true)}
                onFinalize={() => setIsCheckoutModalOpen(true)}
              />
            )}
            {selectedModelId === ROSE_OR_MODEL_ID && (
              <RoseOrStudio
                value={roseOrContent}
                onChange={setRoseOrContent}
                onViewFullScreen={() => setIsPreviewFullScreenOpen(true)}
                onFinalize={() => setIsCheckoutModalOpen(true)}
              />
            )}
            {selectedModelId === ANNIVERSAIRE_MODEL_ID && (
              <AnniversaireStudio
                value={anniversaireContent}
                onChange={setAnniversaireContent}
                onViewFullScreen={() => setIsPreviewFullScreenOpen(true)}
                onFinalize={() => setIsCheckoutModalOpen(true)}
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
        <div 
          className="fixed inset-0 z-[100] bg-black/95 overflow-y-auto flex flex-col select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Barre supérieure flottante d'action et de contrôle */}
          <div className="sticky top-0 z-50 w-full bg-black/90 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-[#b8924a]/30 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPreviewFullScreenOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all border border-white/20 active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Revenir à la création</span>
              </button>

              <div className="hidden sm:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#b8924a] animate-pulse" />
                <span className="text-xs text-gray-300 font-medium">
                  Rendu en direct avec vos modifications
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-[#b8924a] bg-[#b8924a]/10 px-3 py-1.5 rounded-xl border border-[#b8924a]/20">
                <Lock size={13} /> Téléchargement débloqué après paiement
              </span>

              <button
                type="button"
                onClick={() => {
                  setIsPreviewFullScreenOpen(false);
                  setIsCheckoutModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b8924a] via-[#F3E5AB] to-[#b8924a] text-black font-extrabold text-xs sm:text-sm shadow-xl hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 border border-[#b8924a]/60 whitespace-nowrap cursor-pointer"
              >
                <Sparkles size={15} />
                <span>Valider &amp; Finaliser l&apos;achat</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Bandeau d'information de protection */}
          <div className="bg-gradient-to-r from-[#5c0f21]/80 via-[#2b1810]/90 to-[#5c0f21]/80 border-b border-[#b8924a]/20 text-center py-2 px-4 text-[11px] text-[#F3E5AB] font-medium flex items-center justify-center gap-2">
            <Lock size={12} className="text-[#b8924a] shrink-0" />
            <span>Aperçu interactif protégé · Les cartons téléchargeables et liens de partage WhatsApp seront activés dès validation de votre achat.</span>
          </div>

          {/* Corps de l'invitation en plein écran avec modifications */}
          <div className="flex-1 w-full relative min-h-screen">
            {selectedModelId === VELOURS_MODEL_ID && (
              <VeloursInvitation
                content={veloursContent}
                preview={true}
                onBackToEdit={() => setIsPreviewFullScreenOpen(false)}
                onFinalize={() => {
                  setIsPreviewFullScreenOpen(false);
                  setIsCheckoutModalOpen(true);
                }}
              />
            )}
            {selectedModelId === SCEAU_MODEL_ID && (
              <SceauInvitation
                content={sceauContent}
                preview={true}
                onBackToEdit={() => setIsPreviewFullScreenOpen(false)}
                onFinalize={() => {
                  setIsPreviewFullScreenOpen(false);
                  setIsCheckoutModalOpen(true);
                }}
              />
            )}
            {selectedModelId === IVOIRE_MODEL_ID && (
              <IvoireInvitation
                content={ivoireContent}
                preview={true}
                onBackToEdit={() => setIsPreviewFullScreenOpen(false)}
                onFinalize={() => {
                  setIsPreviewFullScreenOpen(false);
                  setIsCheckoutModalOpen(true);
                }}
              />
            )}
            {selectedModelId === ROSE_OR_MODEL_ID && (
              <RoseOrInvitation
                content={roseOrContent}
                onBackToEdit={() => setIsPreviewFullScreenOpen(false)}
                onFinalize={() => {
                  setIsPreviewFullScreenOpen(false);
                  setIsCheckoutModalOpen(true);
                }}
              />
            )}
            {selectedModelId === ANNIVERSAIRE_MODEL_ID && (
              <AnniversaireInvitation
                content={anniversaireContent}
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
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODALE DE FINALISATION, FORMULE & ACTIVATION DU COMPTE             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#fbf7f0]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8f6f33] bg-[#fbf7f0] px-2.5 py-0.5 rounded-full border border-[#b8924a]/30">
                  {standardSuccessEvent ? "Paiement Validé · Accès Dashboard Débloqué" : "Étape finale"}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mt-1">
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
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-colors"
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
                <div className="bg-[#fbf7f0] p-5 sm:p-6 rounded-3xl border border-[#b8924a]/30 space-y-4 max-w-xl mx-auto">
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

                  {/* Bouton majeur en tête : Accès au Dashboard */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutModalOpen(false);
                      const targetId = standardSuccessEvent.id;
                      setStandardSuccessEvent(null);
                      window.location.href = `/dashboard/events/${targetId}`;
                    }}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#b8924a] via-[#F3E5AB] to-[#b8924a] text-black font-extrabold text-sm sm:text-base shadow-xl shadow-[#b8924a]/25 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 border border-[#b8924a]/60 cursor-pointer"
                  >
                    <LayoutDashboard size={18} />
                    <span>Accéder à mon Dashboard Organisateur</span>
                    <ArrowRight size={16} />
                  </button>

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
                        className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-gray-900 outline-none select-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/invite/${standardSuccessEvent.id}`;
                          navigator.clipboard.writeText(url);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2500);
                        }}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${
                          copiedLink
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
              <form onSubmit={handleFinalActivation} className="p-6 sm:p-8 space-y-6">
                
                {errorMessage && (
                  <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs sm:text-sm font-medium">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Colonne Gauche : Formule, Compte & Paiement (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* 1. Choix Formule */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                          <Crown size={15} className="text-[#b8924a]" /> 1. Choisissez votre formule Evenium
                        </label>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-3">
                        Sélectionnez la formule correspondant à votre besoin d&apos;organisation.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Formule Standard */}
                        <div
                          onClick={() => choosePlan('Standard')}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            selectedPlan === 'Standard'
                              ? "border-[#b8924a] bg-[#fbf7f0] shadow-sm"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-serif font-bold text-sm text-gray-900">Standard</span>
                              {selectedPlan === 'Standard' && <CheckCircle2 size={16} className="text-[#b8924a]" />}
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
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            selectedPlan === 'Premium'
                              ? "border-[#b8924a] bg-[#fbf7f0] shadow-sm"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-serif font-bold text-sm text-gray-900">Premium</span>
                              {selectedPlan === 'Premium' && <CheckCircle2 size={16} className="text-[#b8924a]" />}
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
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                            selectedPlan === 'Gold'
                              ? "border-[#b8924a] bg-[#fbf7f0] shadow-sm"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <span className="absolute -top-2 right-2 bg-gradient-to-r from-[#b8924a] to-[#8f6f33] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                            Recommandée
                          </span>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-serif font-bold text-sm text-gray-900">Gold VIP</span>
                              {selectedPlan === 'Gold' && <CheckCircle2 size={16} className="text-[#b8924a]" />}
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
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                            <Crown size={15} className="text-[#b8924a]" /> Détails de votre événement
                          </label>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Inclus dans la formule {selectedPlan === "Gold" ? "Gold VIP" : selectedPlan} : ces informations sont reportées automatiquement dans votre dashboard, où vous pourrez les modifier.
                          </p>
                        </div>
                        <div className="bg-[#fbf7f0] p-4 rounded-2xl border border-[#b8924a]/30">
                          <EventDetailsFields value={detailsWithInvitation} onChange={setEventDetails} showErrors={showDetailsErrors} compact />
                        </div>
                      </div>
                    )}

                    {/* 2. Nom de l'Organisateur & Éléments d'Authentification */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="mb-2.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                          <User size={15} className="text-[#b8924a]" /> 2. Nom de l&apos;organisateur &amp; Éléments d&apos;authentification
                        </label>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Renseignez le nom de l&apos;organisateur et vos éléments d&apos;authentification (mail et mot de passe) pour télécharger votre lien officiel, votre QR Code actif et accéder à votre tableau de bord Organisateur.
                        </p>
                      </div>

                      {currentUser ? (
                        <div className="space-y-3 bg-[#fbf7f0] p-4 rounded-2xl border border-[#b8924a]/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={16} className="text-emerald-600" />
                              <span className="text-xs font-bold text-gray-900">Compte Organisateur vérifié</span>
                            </div>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                              Connecté
                            </span>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              Nom de l&apos;organisateur
                            </label>
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Ex: Alexandre Diop ou Famille Diop"
                              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#b8924a] outline-none"
                            />
                          </div>

                          <div className="p-2.5 bg-white rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-gray-400" />
                              <span className="text-gray-600 font-medium">{currentUser.email}</span>
                            </div>
                            <span className="text-[10px] text-gray-400">Authentification validée</span>
                          </div>
                          
                          <p className="text-[10px] text-gray-500 italic">
                            💡 Vos modèles et votre lien de téléchargement direct seront rattachés à ce compte organisateur.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
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
                              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#b8924a] outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-800 mb-1 flex items-center justify-between">
                                <span>Adresse Mail (Identifiant)</span>
                                <Mail size={12} className="text-gray-400" />
                              </label>
                              <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="organisateur@exemple.com"
                                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#b8924a] outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-gray-800 mb-1 flex items-center justify-between">
                                <span>Mot de passe</span>
                                <Lock size={12} className="text-gray-400" />
                              </label>
                              <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#b8924a] outline-none"
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
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-3 flex items-center gap-1.5">
                        <CreditCard size={15} className="text-[#b8924a]" /> 3. Moyen de paiement
                      </label>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('wave')}
                          className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                            paymentMethod === 'wave'
                              ? "border-[#1DA1F2] bg-[#E8F5FD] text-[#1DA1F2] font-bold"
                              : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                          }`}
                        >
                          <span className="text-lg">🌊</span>
                          <span className="text-[11px] font-bold">Wave</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('om')}
                          className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                            paymentMethod === 'om'
                              ? "border-[#FF6600] bg-[#FFF2E8] text-[#FF6600] font-bold"
                              : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                          }`}
                        >
                          <span className="text-lg">🟠</span>
                          <span className="text-[11px] font-bold">Orange Money</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                            paymentMethod === 'card'
                              ? "border-black bg-gray-50 text-black font-bold"
                              : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                          }`}
                        >
                          <CreditCard size={18} />
                          <span className="text-[11px] font-bold">Carte Bancaire</span>
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
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#b8924a] outline-none"
                          />
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Colonne Droite : Récapitulatif Direct de l'Événement (5 cols) */}
                  <div className="lg:col-span-5 bg-[#fbf7f0] p-5 sm:p-6 rounded-3xl border border-gray-200 space-y-4">
                    
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                      <div className="w-14 h-20 rounded-xl overflow-hidden relative border border-gray-300 shrink-0">
                        <Image
                          key={currentModel.id}
                  src={currentModel.image}
                          alt={currentModel.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8f6f33]">
                          {currentModel.badge}
                        </span>
                        <h4 className="font-serif font-bold text-gray-900 text-sm">
                          {currentModel.name}
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          {selectedEventCategory}
                        </p>
                      </div>
                    </div>

                    {/* Informations reprises automatiquement de l'invitation */}
                    <div className="space-y-2 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Reprise automatique des données
                      </span>

                      <div className="bg-white p-3 rounded-xl border border-gray-200/80 space-y-1.5">
                        <p className="text-gray-500 text-[11px]">Nom officiel de l&apos;événement :</p>
                        <p className="font-serif font-bold text-gray-900 text-sm">
                          {eventMetadata.name}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-2.5 rounded-xl border border-gray-200/80">
                          <p className="text-gray-400 text-[10px]">Date &amp; Heure :</p>
                          <p className="font-semibold text-gray-800 text-[11px]">
                            {eventMetadata.date} à {eventMetadata.time}
                          </p>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-gray-200/80">
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
                      className="w-full py-4 bg-gradient-to-r from-black via-gray-900 to-black hover:brightness-125 text-[#b8924a] rounded-2xl font-bold text-sm shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2 border border-[#b8924a]/40 disabled:opacity-50 active:scale-98"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#b8924a] border-t-transparent rounded-full animate-spin" />
                          <span>Activation de votre invitation...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={18} />
                          <span>Confirmer &amp; Accéder au Dashboard ({selectedPlan === "Gold" ? "Gold VIP" : selectedPlan})</span>
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                      <Lock size={11} /> 
                      Paiement chiffré &amp; sécurisé — Lien officiel, QR Code actif &amp; Accès Dashboard immédiats
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

export default function CreateExpressStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[600px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#b8924a] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CreateExpressStudioContent />
    </Suspense>
  );
}
