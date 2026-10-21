"use client";

import { Send, Edit3, Eye, Sparkles, X, CheckCircle, Copy, MessageCircle, RotateCcw } from "lucide-react";
import { useState, use, useEffect } from "react";
import { useEvents } from "@/store/EventsContext";
import { notFound } from "next/navigation";
import Image from "next/image";
import VeloursEditorModal from "@/components/invitations/velours/VeloursEditorModal";
import { VELOURS_MODEL_ID, seedFromEvent, withDefaults } from "@/components/invitations/velours/content";
import SceauEditorModal from "@/components/invitations/sceau/SceauEditorModal";
import * as sceau from "@/components/invitations/sceau/content";
import IvoireEditorModal from "@/components/invitations/ivoire/IvoireEditorModal";
import * as ivoire from "@/components/invitations/ivoire/content";
import RoseOrEditorModal from "@/components/invitations/rose-or/RoseOrEditorModal";
import * as roseOr from "@/components/invitations/rose-or/content";
import AnniversaireEditorModal from "@/components/invitations/anniversaire/AnniversaireEditorModal";
import * as anniversaire from "@/components/invitations/anniversaire/content";
import EventQRCode from "@/components/ui/EventQRCode";
import { createClient } from "@/utils/supabase/client";

export default function InvitationsDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { events, isLoaded, updateEventInvitation, updateEventInvitationContent, refreshEvents } = useEvents();
  const supabase = createClient();
  
  const eventFromContext = events.find((e) => e.id === id);
  const [directEvent, setDirectEvent] = useState<any>(null);
  const [loadingDirect, setLoadingDirect] = useState(!eventFromContext);
  const [notFoundTriggered, setNotFoundTriggered] = useState(false);

  const event = eventFromContext || directEvent;

  useEffect(() => {
    if (eventFromContext) {
      setLoadingDirect(false);
      return;
    }

    const fetchDirect = async () => {
      try {
        const { data } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
        if (data) {
          setDirectEvent({
            id: data.id,
            name: data.name,
            type: data.type,
            date: data.date || "À définir",
            time: data.time || "À définir",
            location: data.location || "À définir",
            guestsCount: data.guests_count || 0,
            plan: data.plan,
            format: data.format,
            status: data.status,
            invitationModelId: data.invitation_model_id,
            invitationTitle: data.invitation_title,
            invitationMessage: data.invitation_message,
            invitationContent: data.invitation_content ?? null,
            eventDetails: data.event_details ?? null,
            budget: { total: Number(data.budget_total) || 0, spent: 0 },
            guests: { total: data.guests_count || 0, confirmed: 0, pending: 0, declined: 0 },
            tasks: { total: 0, completed: 0 },
            providersCount: 0
          });
          refreshEvents();
        } else if (isLoaded) {
          setNotFoundTriggered(true);
        }
      } catch {
        if (isLoaded) setNotFoundTriggered(true);
      } finally {
        setLoadingDirect(false);
      }
    };
    fetchDirect();
  }, [id, eventFromContext, isLoaded, supabase, refreshEvents]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showResetPageModal, setShowResetPageModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [invitationData, setInvitationData] = useState({
    title: "",
    message: ""
  });

  // Sync state with event data
  useEffect(() => {
    if (event) {
      setInvitationData({
        title: event.invitationTitle || `Bienvenue à ${event.name}`,
        message: event.invitationMessage || "Nous avons la joie de vous inviter à célébrer cet événement..."
      });
    }
  }, [event]);

  if (loadingDirect && !event) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 text-[#8f6f33]">
        <div className="w-10 h-10 border-3 border-[#b8924a] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Chargement de votre invitation...</p>
      </div>
    );
  }

  if (notFoundTriggered || (!event && !loadingDirect && isLoaded)) {
    return notFound();
  }

  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (event) {
      setShareUrl(`${window.location.origin}/invite/${event.id}`);
    }
  }, [event]);

  const [waTone, setWaTone] = useState<"chaleureux" | "prestige" | "court">("chaleureux");
  const [waCopiedText, setWaCopiedText] = useState(false);

  const formatEventDate = (dateStr?: string) => {
    if (!dateStr || dateStr === "À définir") return "";
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    } catch {}
    return dateStr;
  };

  const generateWhatsAppMessage = (tone: "chaleureux" | "prestige" | "court" = "chaleureux") => {
    const link = shareUrl;
    const dateFormatted = formatEventDate(event.date);
    const whenText = dateFormatted ? (event.time && event.time !== "À définir" ? `${dateFormatted} à ${event.time}` : dateFormatted) : "";
    const whereText = event.location && event.location !== "À définir" ? event.location : "";
    const type = (event.type || "").toLowerCase().trim();

    // 1. Mariage, Fiançailles, Henné
    if (type.includes("mariage") || type.includes("fiançaille") || type.includes("henné") || type.includes("henne")) {
      if (tone === "prestige") {
        return (
          `⚜️ *INVITATION OFFICIELLE D'HONNEUR · UNION ROYALE* ⚜️\n\n` +
          `Chers invités d'honneur,\n\n` +
          `À l'occasion de la célébration des noces de :\n` +
          `👑 *${event.name}*\n` +
          (whenText ? `📅 *${whenText}*\n` : "") +
          (whereText ? `🏛️ *${whereText}*\n` : "") +
          `\nNous avons l'insigne privilège de solliciter l'honneur de votre présence pour célébrer cet instant solennel et mémorable.\n\n` +
          `Veuillez accéder à votre faire-part scénarisé de haute couture digitale et enregistrer votre confirmation nominative :\n` +
          `👉 ${link}\n\n` +
          `Dans l'impatience de partager cette journée d'exception et de félicité à vos côtés.\n` +
          `Avec nos sentiments les plus distingués. 🥂🤍`
        );
      }
      if (tone === "court") {
        return (
          `💍 *ON SE DIT OUI ! · SAVE THE DATE* ✨\n\n` +
          `Grande nouvelle : *${event.name}* approche à grands pas !\n` +
          (whenText ? `📅 *${whenText}*\n` : "") +
          (whereText ? `📍 *${whereText}*\n` : "") +
          `\nRetrouvez tous les détails, le programme et votre carton interactif ici :\n` +
          `👉 ${link}\n\n` +
          `Merci de confirmer votre présence en 1 clic sur le lien pour que tout soit parfait. On a tellement hâte de vous retrouver ! 🎉🍾`
        );
      }
      // Chaleureux
      return (
        `✨ *UNE HISTOIRE D'AMOUR S'ÉCRIT... ET VOUS EN FAITES PARTIE !* 💍\n\n` +
        `Bonjour !\n\n` +
        `C'est le cœur rempli d'émotion et d'allégresse que nous vous convions à célébrer notre union :\n` +
        `🕊️ *${event.name}*\n` +
        (whenText ? `📅 *${whenText}*\n` : "") +
        (whereText ? `📍 *${whereText}*\n` : "") +
        `\nNous avons imaginé pour vous une invitation interactive d'exception. Découvrez notre univers, notre programme et partagez ce grand bonheur avec nous :\n` +
        `👉 ${link}\n\n` +
        `Merci de confirmer votre présence directement sur le lien. Votre sourire à nos côtés rendra cette journée inoubliable ! Avec toute notre tendresse 🤍🥂`
      );
    }

    // 2. Anniversaire
    if (type.includes("anniversaire")) {
      if (tone === "prestige") {
        return (
          `⚜️ *RÉCEPTION PRIVÉE · JUBILÉ D'EXCEPTION* 🥂\n\n` +
          `Cher(e) invité(e) d'honneur,\n\n` +
          `À l'occasion d'une célébration marquante et privilégiée, vous êtes convié(e) à la réception d'apparat donnée pour :\n` +
          `✨ *${event.name}*\n` +
          (whenText ? `📅 *${whenText}*\n` : "") +
          (whereText ? `🏛️ *${whereText}*\n` : "") +
          `\nAccédez à votre invitation interactive officielle et confirmez votre venue via le salon numérique dédié :\n` +
          `👉 ${link}\n\n` +
          `Dans la joie partagée de porter un toast à ce nouveau chapitre sous le signe du raffinement et de l'élégance.`
        );
      }
      if (tone === "court") {
        return (
          `⚡ *IT'S PARTY TIME !* 🎂🥳\n\n` +
          `C'est officiel : on se retrouve tous pour fêter *${event.name}* !\n` +
          (whenText ? `📅 *${whenText}*\n` : "") +
          (whereText ? `📍 *${whereText}*\n` : "") +
          `\nVotre invitation interactive et le formulaire de réponse rapide sont juste ici :\n` +
          `👉 ${link}\n\n` +
          `Confirmez vite votre présence sur le lien, ambiance garantie ! 🍾🔥`
        );
      }
      // Chaleureux
      return (
        `🎂 *UNE NOUVELLE BOUGIE, UNE FÊTE INOUBLIABLE !* ✨\n\n` +
        `Bonjour !\n\n` +
        `Parce que les plus beaux moments de la vie ne valent que s'ils sont partagés avec les personnes chères, je vous invite chaleureusement à célébrer :\n` +
        `🎉 *${event.name}*\n` +
        (whenText ? `📅 *${whenText}*\n` : "") +
        (whereText ? `📍 *${whereText}*\n` : "") +
        `\nOuvrez votre invitation interactive pour plonger dans l'ambiance et découvrir toutes les surprises qui vous attendent :\n` +
        `👉 ${link}\n\n` +
        `Confirmez votre présence en quelques secondes sur le lien. Préparez vos plus beaux sourires, nous allons créer des souvenirs inoubliables ! 🥳🥂`
      );
    }

    // 3. Baptême, Baby shower, Naissance
    if (type.includes("baptême") || type.includes("bapteme") || type.includes("baby") || type.includes("naissance")) {
      if (tone === "prestige") {
        return (
          `🕊️ *SOLENNITÉ & BÉNÉDICTION FAMILIALE* ⚜️\n\n` +
          `Chers proches et amis précieux,\n\n` +
          `La famille a l'insigne honneur de solliciter votre présence bienveillante à la cérémonie et réception en l'honneur de :\n` +
          `🌿 *${event.name}*\n` +
          (whenText ? `📅 *${whenText}*\n` : "") +
          (whereText ? `🏛️ *${whereText}*\n` : "") +
          `\nVeuillez consulter votre carton officiel d'honneur et renseigner la confirmation de votre maisonnée :\n` +
          `👉 ${link}\n\n` +
          `Que cette journée bénie rassemble nos cœurs dans la paix, la gratitude et la joie la plus pure. 🤍`
        );
      }
      if (tone === "court") {
        return (
          `🍼 *CÉLÉBRATION EN FAMILLE !* ✨👶\n\n` +
          `Nous avons hâte de vous retrouver pour fêter *${event.name}* !\n` +
          (whenText ? `📅 *${whenText}*\n` : "") +
          (whereText ? `📍 *${whereText}*\n` : "") +
          `\nTous les détails et la confirmation en ligne rapide sont ici :\n` +
          `👉 ${link}\n\n` +
          `Merci de valider votre présence en un clin d'œil. À très bientôt pour ce moment de pur bonheur ! 🤍🎉`
        );
      }
      // Chaleureux
      return (
        `🕊️ *UN PETIT TRÉSOR, UNE BÉNÉDICTION IMMENSE !* 🌸\n\n` +
        `Bonjour !\n\n` +
        `Une nouvelle étoile illumine nos vies. C'est avec une tendresse infinie que nous vous invitons à entourer notre trésor pour :\n` +
        `✨ *${event.name}*\n` +
        (whenText ? `📅 *${whenText}*\n` : "") +
        (whereText ? `📍 *${whereText}*\n` : "") +
        `\nDécouvrez votre invitation interactive délicatement personnalisée et confirmez votre venue en un instant :\n` +
        `👉 ${link}\n\n` +
        `Votre présence, vos sourires et vos prières à nos côtés sont notre plus doux cadeau. Avec tout notre amour 🤍🍼`
      );
    }

    // 4. Gala, Soirée, Dîner, Réception, Brunch, Yendou, EVJF
    if (
      type.includes("gala") ||
      type.includes("soirée") ||
      type.includes("soiree") ||
      type.includes("dîner") ||
      type.includes("diner") ||
      type.includes("réception") ||
      type.includes("reception") ||
      type.includes("brunch") ||
      type.includes("yendou") ||
      type.includes("jeune fille")
    ) {
      if (tone === "prestige") {
        return (
          `⚜️ *SOIRÉE DE PRESTIGE & RÉCEPTION PRIVÉE* 🎩✨\n\n` +
          `Chers invités d'exception,\n\n` +
          `Nous avons le plaisir exclusif de solliciter votre distinction pour la prestigieuse réception :\n` +
          `🌟 *${event.name}*\n` +
          (whenText ? `📅 *${whenText}*\n` : "") +
          (whereText ? `🏛️ *${whereText}*\n` : "") +
          `\nAccédez à votre invitation d'apparat et validez votre accréditation nominative via ce portail sécurisé :\n` +
          `👉 ${link}\n\n` +
          `Nous nous réjouissons d'ores et déjà de l'éclat de votre présence parmi nos convives d'honneur. Tenue de circonstance recommandée.`
        );
      }
      if (tone === "court") {
        return (
          `⚡ *SAVE THE DATE · RENDEZ-VOUS EXCLUSIF !* 🍾✨\n\n` +
          `C'est l'événement à ne pas rater : *${event.name}* !\n` +
          (whenText ? `📅 *${whenText}*\n` : "") +
          (whereText ? `📍 *${whereText}*\n` : "") +
          `\nProgramme, lieu et confirmation express sur ce lien :\n` +
          `👉 ${link}\n\n` +
          `Bloquez votre date et confirmez en 1 clic. À très vite pour fêter ça ! 🎉🥂`
        );
      }
      // Chaleureux
      return (
        `🥂 *L'ART DE SE RETROUVER · UN MOMENT DE PURE CONVIVIALITÉ* ✨\n\n` +
        `Bonjour !\n\n` +
        `Rien n'est plus beau qu'une fête réussie entourée des personnes qui comptent. Nous vous convions chaleureusement à :\n` +
        `✨ *${event.name}*\n` +
        (whenText ? `📅 *${whenText}*\n` : "") +
        (whereText ? `📍 *${whereText}*\n` : "") +
        `\nDécouvrez l'ambiance, les surprises et réservez votre place sur votre invitation interactive :\n` +
        `👉 ${link}\n\n` +
        `Confirmez votre présence sur le lien en quelques secondes. Hâte de trinquer ensemble ! 🍾🥂`
      );
    }

    // 5. Conférence, Séminaire, Corporate ou Autre par défaut
    if (tone === "prestige") {
      return (
        `⚜️ *INVITATION OFFICIELLE PROTOCOLAIRE* ⚜️\n\n` +
        `Madame, Monsieur,\n\n` +
        `Nous avons l'honneur de vous convier à l'événement de distinction :\n` +
        `🏛️ *${event.name}*\n` +
        (whenText ? `📅 *${whenText}*\n` : "") +
        (whereText ? `📍 *${whereText}*\n` : "") +
        `\nVeuillez consulter votre carton officiel et enregistrer votre présence via le lien interactif sécurisé :\n` +
        `👉 ${link}\n\n` +
        `Dans l'attente de vous accueillir parmi nos hôtes d'honneur, nous vous prions d'agréer nos salutations les plus distinguées.`
      );
    }
    if (tone === "court") {
      return (
        `⚡ *INVITATION · ${event.name.toUpperCase()}* ✨\n\n` +
        `Bonjour ! Votre invitation interactive pour *${event.name}* est en ligne :\n` +
        (whenText ? `📅 *${whenText}*\n` : "") +
        (whereText ? `📍 *${whereText}*\n` : "") +
        `\nConsultez tous les détails et confirmez votre présence en 1 clic :\n` +
        `👉 ${link}\n\n` +
        `Merci pour votre réponse rapide et à très bientôt ! 🎉`
      );
    }
    // Chaleureux par défaut
    return (
      `✨ *VOUS ÊTES CORDIALEMENT INVITÉ(E) !* ✨\n\n` +
      `Bonjour !\n\n` +
      `Nous avons l'immense joie de vous convier à partager un événement unique et marquant :\n` +
      `🌟 *${event.name}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nDécouvrez votre invitation interactive scénarisée et confirmez votre venue en toute simplicité :\n` +
      `👉 ${link}\n\n` +
      `Votre présence à nos côtés sera un véritable privilège. Au plaisir de vous accueillir ! 🎉🥂`
    );
  };

  const handleCopyFullMessage = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage(waTone));
    setWaCopiedText(true);
    setTimeout(() => setWaCopiedText(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    await updateEventInvitation(event.id, invitationData.title, invitationData.message);
    setIsSaving(false);
    setIsEditModalOpen(false);
  };

  const handleResetToOriginal = async () => {
    setIsResetting(true);
    try {
      let defaultSeed: Record<string, unknown> = {};
      if (isVelours) defaultSeed = seedFromEvent(event) as unknown as Record<string, unknown>;
      else if (isSceau) defaultSeed = sceau.seedFromEvent(event) as unknown as Record<string, unknown>;
      else if (isIvoire) defaultSeed = ivoire.seedFromEvent(event) as unknown as Record<string, unknown>;
      else if (isRoseOr) defaultSeed = roseOr.seedFromEvent(event) as unknown as Record<string, unknown>;
      else if (isAnniversaire) defaultSeed = anniversaire.seedFromEvent(event) as unknown as Record<string, unknown>;

      await updateEventInvitationContent(event.id, defaultSeed);
      setShowResetPageModal(false);
      setResetSuccessMessage("Le modèle a été rétabli à sa version d'origine avec succès. Vous conservez votre modèle et pouvez le personnaliser à nouveau à tout moment sans aucun frais !");
      setTimeout(() => setResetSuccessMessage(null), 6000);
    } catch (e) {
      alert("Erreur lors du rétablissement : " + (e instanceof Error ? e.message : "Erreur inconnue"));
    } finally {
      setIsResetting(false);
    }
  };

  const isVelours = event.invitationModelId === VELOURS_MODEL_ID;
  const isSceau = event.invitationModelId === sceau.SCEAU_MODEL_ID;
  const isIvoire = event.invitationModelId === ivoire.IVOIRE_MODEL_ID;
  const isRoseOr = event.invitationModelId === roseOr.ROSE_OR_MODEL_ID;
  const isAnniversaire = event.invitationModelId === anniversaire.ANNIVERSAIRE_MODEL_ID;
  const isStatic = event.format === "Carte";
  const cover = isVelours
    ? "/invit-velours-cover.jpg"
    : isSceau
      ? "/invit-sceau-dor-cover.jpg"
      : isIvoire
        ? "/invit-ivoire-cover.jpg"
        : isRoseOr
          ? "/invit-rose-or-cover.jpg"
          : isAnniversaire
            ? "/invit-anniversaire-cover.jpg"
            : null;

  const getModelName = () => {
    if (isVelours) return "Velours Bordeaux";
    if (isSceau) return "Sceau d'Or Impérial";
    if (isIvoire) return "Ivoire Couture";
    if (isRoseOr) return "Rose Poudrée & Or Impérial";
    if (isAnniversaire) return "Anniversaire Bordeaux & Or";
    return event.invitationModelId || "Modèle Exclusif";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 font-medium mb-6 flex items-center gap-2">
        <span>Événement</span> <span className="text-gray-300">&gt;</span> <span className="text-black">Invitations</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-black mb-2">L'Invitation - {event.name}</h1>
        <p className="text-gray-500 text-sm">Votre invitation est prête. Partagez le lien avec vos invités.</p>
      </div>

      {/* Purchased Invitation Model */}
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl border border-[#b8924a]/30 shadow-[0_4px_30px_-4px_rgba(184,146,74,0.15)] flex flex-col sm:flex-row gap-8 items-center sm:items-start relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#b8924a] to-[#8f6f33]"></div>
        
        <div className="w-full sm:w-64 aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative flex-shrink-0 border border-gray-200 shadow-md">
          {/* Real or Placeholder image based on model */}
          <div className="w-full h-full relative">
            <div className="absolute inset-0 flex items-center justify-center text-[#b8924a] opacity-20">
              <Sparkles size={64} />
            </div>
            {cover && <Image src={cover} alt={getModelName()} fill className="object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 flex flex-col justify-end p-4">
               <p className="text-white font-serif font-bold text-lg leading-tight">{invitationData.title}</p>
            </div>
          </div>
          <div className="absolute top-3 right-3 bg-[#8f6f33] text-white px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Sparkles size={12} /> {event.format === "Animée" ? "Animée · Avec son" : "Carte · Sans musique"}
          </div>
        </div>
        
        <div className="flex-1 w-full py-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/20 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              ✓ Générée & Prête
            </span>
            <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
              {event.plan}
            </span>
          </div>
          
          <h2 className="font-serif text-3xl font-bold text-gray-900 mb-3">{getModelName()}</h2>
          
          <p className="text-gray-600 text-sm mb-6 max-w-2xl leading-relaxed">
            {isStatic ? (
              <>Votre carte d&apos;invitation digitale épurée est active (format visuel sans animation ni musique). Vos invités pourront consulter votre élégant faire-part et confirmer leur présence directement depuis leur téléphone.</>
            ) : (
              <>Votre mini-site d&apos;invitation immersif est actif. Vos invités pourront vivre cette animation musicale et confirmer leur présence directement depuis leur téléphone.</>
            )}
          </p>

          <div className="mb-8 p-6 bg-gray-50/80 rounded-2xl border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Aperçu du texte</h4>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="text-[#b8924a] text-sm font-semibold hover:underline flex items-center gap-1"
              >
                <Edit3 size={14} /> Corriger
              </button>
            </div>
            <p className="font-serif text-xl font-bold text-gray-900 mb-1">{invitationData.title}</p>
            <p className="text-sm text-[#8f6f33] font-semibold mb-3">{event.date}</p>
            <p className="text-sm italic text-gray-700 leading-relaxed">{invitationData.message}</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            {(isVelours || isSceau || isIvoire || isRoseOr || isAnniversaire) && (
              <button
                onClick={() => setIsStudioOpen(true)}
                className="bg-[#6b1f2a] hover:bg-[#7a1a2e] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-[#6b1f2a]/20"
              >
                <Edit3 size={18} /> Personnaliser l&apos;invitation
              </button>
            )}
            <button
              onClick={() => window.open(shareUrl, '_blank')}
              className="bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-black/10"
            >
              <Eye size={18} /> Voir l&apos;invitation en direct
            </button>
            {(isVelours || isSceau || isIvoire || isRoseOr || isAnniversaire) && (
              <button
                type="button"
                onClick={() => setShowResetPageModal(true)}
                className="border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-5 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-xs"
                title="Rétablir la version originale non modifiée sans aucun rachat"
              >
                <RotateCcw size={16} className="text-amber-700" />
                <span>Revenir à la version originale</span>
              </button>
            )}
          </div>

          {resetSuccessMessage && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{resetSuccessMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION LIEN OFFICIEL & QR CODE ACTIF */}
      <div className="mt-8 bg-gradient-to-br from-[#1a1514] via-[#241c19] to-[#120f0e] rounded-3xl p-6 sm:p-8 border border-[#b8924a]/40 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#b8924a]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b8924a]/20 border border-[#b8924a]/40 text-[#f3e5ab] text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-[#d4af37]" />
              <span>QR Code Actif &amp; Lien Officiel</span>
            </div>
            
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Votre invitation interactive est prête à être partagée
            </h3>
            
            <p className="text-gray-300 text-sm leading-relaxed">
              Scannez le QR Code en direct ou téléchargez-le en haute résolution PNG ainsi que votre carton d&apos;invitation imprimable. Ce QR Code ouvre instantanément votre faire-part interactif sur n&apos;importe quel smartphone.
            </p>

            {/* Lien officiel avec bouton de copie */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-300 mb-2">
                Lien officiel de l&apos;invitation :
              </label>
              <div className="flex items-center gap-2 max-w-lg">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-white outline-none select-all backdrop-blur-xs"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-[#b8924a] hover:bg-[#a07b38] text-black"
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle size={14} />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bouton Partager WhatsApp direct */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="py-3 px-6 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#25D366]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle size={18} />
                <span>Partager sur WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <EventQRCode
              url={shareUrl}
              eventName={event.name}
              date={event.date}
              size={150}
            />
          </div>
        </div>
      </div>

      {isStudioOpen && isVelours && (
        <VeloursEditorModal
          initial={event.invitationContent ? withDefaults(event.invitationContent) : seedFromEvent(event)}
          defaultContent={seedFromEvent(event)}
          isStatic={isStatic}
          onClose={() => setIsStudioOpen(false)}
          saveLabel="Mettre à jour l'invitation"
          onSave={async (content) => {
            try {
              await updateEventInvitationContent(event.id, { ...content });
            } catch {
              throw new Error("Enregistrement impossible : exécutez supabase_invitation_content.sql dans Supabase.");
            }
            setIsStudioOpen(false);
          }}
        />
      )}

      {isStudioOpen && isSceau && (
        <SceauEditorModal
          initial={event.invitationContent ? sceau.withDefaults(event.invitationContent) : sceau.seedFromEvent(event)}
          defaultContent={sceau.seedFromEvent(event)}
          isStatic={isStatic}
          onClose={() => setIsStudioOpen(false)}
          saveLabel="Mettre à jour l'invitation"
          onSave={async (content) => {
            try {
              await updateEventInvitationContent(event.id, { ...content });
            } catch {
              throw new Error("Enregistrement impossible : exécutez supabase_sceau_dor.sql dans Supabase.");
            }
            setIsStudioOpen(false);
          }}
        />
      )}

      {isStudioOpen && isIvoire && (
        <IvoireEditorModal
          initial={event.invitationContent ? ivoire.withDefaults(event.invitationContent) : ivoire.seedFromEvent(event)}
          defaultContent={ivoire.seedFromEvent(event)}
          isStatic={isStatic}
          onClose={() => setIsStudioOpen(false)}
          saveLabel="Mettre à jour l'invitation"
          onSave={async (content) => {
            try {
              await updateEventInvitationContent(event.id, { ...content });
            } catch {
              throw new Error("Enregistrement impossible : exécutez supabase_sceau_dor.sql dans Supabase.");
            }
            setIsStudioOpen(false);
          }}
        />
      )}

      {isStudioOpen && isRoseOr && (
        <RoseOrEditorModal
          initial={event.invitationContent ? roseOr.withDefaults(event.invitationContent) : roseOr.seedFromEvent(event)}
          defaultContent={roseOr.seedFromEvent(event)}
          isStatic={isStatic}
          onClose={() => setIsStudioOpen(false)}
          saveLabel="Mettre à jour l'invitation"
          onSave={async (content) => {
            try {
              await updateEventInvitationContent(event.id, { ...content });
            } catch {
              throw new Error("Enregistrement impossible : exécutez supabase_sceau_dor.sql dans Supabase.");
            }
            setIsStudioOpen(false);
          }}
        />
      )}

      {isStudioOpen && isAnniversaire && (
        <AnniversaireEditorModal
          initial={event.invitationContent ? anniversaire.withDefaults(event.invitationContent) : anniversaire.seedFromEvent(event)}
          defaultContent={anniversaire.seedFromEvent(event)}
          isStatic={isStatic}
          onClose={() => setIsStudioOpen(false)}
          saveLabel="Mettre à jour l'invitation"
          onSave={async (content) => {
            try {
              await updateEventInvitationContent(event.id, { ...content });
            } catch {
              throw new Error("Enregistrement impossible : exécutez supabase_invitation_content.sql dans Supabase.");
            }
            setIsStudioOpen(false);
          }}
        />
      )}

      {/* Modal de rétablissement de la version originale */}
      {showResetPageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 shadow-xs">
              <RotateCcw size={22} />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">
              Rétablir la version originale ?
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Vous êtes sur le point de rétablir <strong>{getModelName()}</strong> à sa version d'origine sans vos modifications personnalisées.
            </p>
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl mb-6 text-xs text-amber-900 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5 text-amber-950">
                <CheckCircle size={14} className="text-amber-700" />
                <span>Aucun rachat nécessaire</span>
              </p>
              <p className="text-amber-800 leading-relaxed">
                Le modèle reste 100% acquis à votre événement. Vous pouvez le modifier à nouveau à tout moment et autant de fois que vous le souhaitez sans aucun frais.
              </p>
            </div>
            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowResetPageModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 disabled:opacity-50"
              >
                Conserver mes modifications
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleResetToOriginal}
                className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <RotateCcw size={13} className={isResetting ? "animate-spin" : ""} />
                <span>{isResetting ? "Rétablissement…" : "Oui, rétablir l'original"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-xl text-gray-900">Corriger le texte</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-400 hover:text-black rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Titre de l'invitation</label>
                <input 
                  type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b8924a]"
                  value={invitationData.title} onChange={e => setInvitationData({...invitationData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Message</label>
                <textarea 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm h-32 focus:outline-none focus:ring-2 focus:ring-[#b8924a] resize-none"
                  value={invitationData.message} onChange={e => setInvitationData({...invitationData, message: e.target.value})}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 bg-black text-[#b8924a] py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center"
              >
                {isSaving ? "Enregistrement..." : "Mettre à jour"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal (Option A : Clic-to-Chat Direct) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#25D366]/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">Partager sur WhatsApp</h3>
                  <p className="text-xs text-gray-500">Envoyez votre invitation interactive à vos contacts ou dans un groupe</p>
                </div>
              </div>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Lien direct */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Lien de votre invitation
                </label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl}
                    className="flex-1 bg-transparent text-sm text-gray-700 px-3 outline-none truncate font-mono text-xs"
                  />
                  <button 
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      copied ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                    {copied ? 'Copié' : 'Copier le lien'}
                  </button>
                </div>
              </div>

              {/* Tone / Template Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Style du message
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWaTone("chaleureux")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      waTone === "chaleureux"
                        ? "bg-[#25D366]/10 border-[#25D366] text-[#128C7E]"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    ✨ Chaleureux
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaTone("prestige")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      waTone === "prestige"
                        ? "bg-[#b8924a]/10 border-[#b8924a] text-[#8f6f33]"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    🎩 Prestige
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaTone("court")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      waTone === "court"
                        ? "bg-black text-white border-black"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    ⚡ Express
                  </button>
                </div>
              </div>

              {/* Message Live Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Aperçu du message WhatsApp
                  </label>
                  <span className="text-[11px] text-gray-400">Prêt à envoyer</span>
                </div>
                <div className="p-4 bg-[#EFEAE2] rounded-2xl border border-gray-200/80 shadow-inner text-sm font-sans text-gray-800 whitespace-pre-line leading-relaxed">
                  <div className="bg-white p-3.5 rounded-xl shadow-sm border border-black/5 text-gray-800">
                    {generateWhatsAppMessage(waTone)}
                  </div>
                </div>
              </div>

              {/* Reassurance */}
              <div className="bg-green-50 border border-green-200/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-green-900">
                <span className="text-base leading-none">💡</span>
                <p>
                  <strong>100% Gratuit :</strong> En cliquant sur « Ouvrir WhatsApp », l'application WhatsApp s'ouvre avec votre message pré-rempli. Vous choisissez simplement vos destinataires ou groupes.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleCopyFullMessage}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {waCopiedText ? (
                  <>
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-green-600">Message copié !</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copier tout le message</span>
                  </>
                )}
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(generateWhatsAppMessage(waTone))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2 text-center"
              >
                <MessageCircle size={18} />
                <span>Ouvrir WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
