"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  ArrowLeft,
  Check,
  Loader2,
  Smartphone,
  Eye,
  SlidersHorizontal,
  MessageSquare,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Maximize2
} from "lucide-react";
import {
  getModelStudioConfig,
  type ModelStudioConfig,
  type StudioSectionConfig
} from "@/lib/modelStudioConfigs";
import { StudioSectionAccordion } from "./SplitStudioFields";
import SendMessagesTab from "./SendMessagesTab";
import type { CustomModelRow } from "@/lib/customModels";

interface Props {
  modelId: string;
  initialContent: Record<string, any>;
  onSave?: (content: Record<string, any>) => Promise<void> | void;
  onClose?: () => void;
  onFinalize?: () => void;
  finalizeLabel?: string;
  customModel?: CustomModelRow | null;
  /** Titre ou nom de l'événement */
  eventName?: string;
  /** Catégorie ou type d'événement pour les messages d'accompagnement */
  eventType?: string;
  shareUrl?: string;
  guests?: Array<{ id: string; nom: string; telephone?: string }>;
  isStatic?: boolean;
}

export default function SplitStudioEditor({
  modelId,
  initialContent,
  onSave,
  onClose,
  onFinalize,
  finalizeLabel = "Valider l'achat",
  customModel,
  eventName,
  eventType = "Mariage",
  shareUrl = "https://evenium.com/invite/demo",
  guests = [],
  isStatic = false,
}: Props) {
  // Configuration déclarative du modèle (zéro code requis pour un nouveau modèle)
  const config: ModelStudioConfig = getModelStudioConfig(modelId, customModel);

  // État local du contenu personnalisé
  const [content, setContent] = useState<Record<string, any>>(() => {
    return { ...config.defaultValues, ...initialContent };
  });

  // Messages d'accompagnement sauvegardés
  const [savedMessages, setSavedMessages] = useState<string[]>(() => {
    return (initialContent?.__saved_messages as string[]) || [];
  });

  // Onglet mobile : "edit" (Modifier) vs "preview" (Aperçu)
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  // Onglet du panneau gauche : "content" (Champs) vs "messages" (Message d'envoi)
  const [activePanelTab, setActivePanelTab] = useState<"content" | "messages">("content");

  // Accordéons ouverts (par défaut, la première section est ouverte)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const firstId = config.sections[0]?.id || "couple";
    return { [firstId]: true };
  });

  // Statut de sauvegarde automatique
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const isIframeReady = useRef(false);

  // Déterminer l'URL de prévisualisation dans l'iframe
  const previewSrc = React.useMemo(() => {
    const base = config.previewPath;
    const delim = base.includes("?") ? "&" : "?";
    return `${base}${delim}preview=1&hideCta=1`;
  }, [config.previewPath]);

  // Envoi postMessage vers l'iframe pour mise à jour instantanée sans rechargement
  const sendPostMessage = useCallback((msg: object) => {
    if (frameRef.current?.contentWindow) {
      try {
        frameRef.current.contentWindow.postMessage(msg, "*");
      } catch {}
    }
  }, []);

  // Dès que le contenu change, on pousse immédiatement l'aperçu sans rechargement
  const pushUpdateToPreview = useCallback((nextContent: Record<string, any>) => {
    // Protocole universel Evenium
    sendPostMessage({ type: "evenium:model-update", content: nextContent });
    // Protocoles spécifiques existants
    sendPostMessage({ type: "velours:content", content: nextContent });
    sendPostMessage({ type: "ev:content", values: nextContent });
  }, [sendPostMessage]);

  // Gestion des messages reçus de l'iframe (prêt / ready)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== "object") return;
      if (
        e.data.type === "evenium:ready" ||
        e.data.type === "velours:ready" ||
        e.data.type === "ev:ready"
      ) {
        isIframeReady.current = true;
        pushUpdateToPreview(content);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [content, pushUpdateToPreview]);

  // Sauvegarde automatique avec debounce de 800 ms
  const triggerAutoSave = useCallback((updatedContent: Record<string, any>) => {
    setSaveStatus("saving");
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (onSave) {
          await onSave(updatedContent);
        }
        setSaveStatus("saved");
      } catch (err) {
        console.error("Échec de la sauvegarde automatique:", err);
        setSaveStatus("error");
      }
    }, 800);
  }, [onSave]);

  // Modification d'un champ
  const handleFieldChange = (fieldId: string, value: any) => {
    setContent((prev) => {
      const next = { ...prev, [fieldId]: value };
      pushUpdateToPreview(next);
      triggerAutoSave(next);
      return next;
    });
  };

  // Focus sur un champ : défilement et surbrillance or 1,5s dans l'iframe
  const handleFieldFocus = (sectionId: string, fieldId: string) => {
    sendPostMessage({
      type: "evenium:focus-field",
      sectionId,
      fieldId,
    });
    sendPostMessage({
      type: "ev:focus",
      id: fieldId,
    });
  };

  // Bascule d'un accordéon
  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Ajout / suppression de message personnalisé
  const handleSaveMessage = (msg: string) => {
    const updated = [...savedMessages, msg];
    setSavedMessages(updated);
    handleFieldChange("__saved_messages", updated);
  };

  const handleDeleteSavedMessage = (index: number) => {
    const updated = savedMessages.filter((_, i) => i !== index);
    setSavedMessages(updated);
    handleFieldChange("__saved_messages", updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0a08] flex flex-col overflow-hidden font-sans select-none">
      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* 1. BARRE SUPÉRIEURE (HEADER UNIFIÉ)                                 */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <header className="h-14 bg-[#140e0a] border-b border-[#b8924a]/30 px-3 sm:px-5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold border border-white/15 transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Retour</span>
            </button>
          )}

          <div className="min-w-0">
            <h1 className="font-serif text-sm sm:text-base font-bold text-white truncate">
              {config.modelName}
            </h1>
            <p className="text-[11px] text-[#b8924a] hidden md:block">
              Éditeur en écran partagé · Aperçu interactif en direct
            </p>
          </div>
        </div>

        {/* Indicateur de sauvegarde automatique 800 ms */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            {saveStatus === "saving" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-medium animate-pulse">
                <Loader2 size={11} className="animate-spin text-amber-300" />
                <span>Enregistrement…</span>
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium">
                <Check size={11} className="text-emerald-400" />
                <span>Enregistré</span>
              </span>
            )}
            {saveStatus === "error" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-[11px] font-medium">
                Erreur de sauvegarde
              </span>
            )}
          </div>

          {onFinalize && (
            <button
              type="button"
              onClick={onFinalize}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black text-xs font-extrabold shadow-md shadow-[#D4AF37]/20 hover:brightness-105 active:scale-95 transition-all border border-[#D4AF37]/60 cursor-pointer"
            >
              <Sparkles size={14} className="text-black shrink-0" />
              <span>{finalizeLabel}</span>
            </button>
          )}
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* 2. SÉLECTEUR D'ONGLETS SUR TÉLÉPHONE (< 900 px)                      */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="min-[900px]:hidden h-11 bg-[#1a130e] border-b border-[#b8924a]/25 px-2 flex items-center justify-center shrink-0">
        <div className="grid grid-cols-2 gap-1 w-full max-w-xs bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setMobileTab("edit")}
            className={`py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === "edit"
                ? "bg-[#D4AF37] text-black shadow-xs"
                : "text-white/70 hover:text-white"
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>Modifier</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === "preview"
                ? "bg-[#D4AF37] text-black shadow-xs"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Eye size={13} />
            <span>Aperçu</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* 3. CORPS : PANNEAU 420 px À GAUCHE + APERÇU À DROITE                */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-row overflow-hidden relative">
        {/* PANNEAU DE CHAMPS (420 px sur ordi ≥ 900 px, pleine largeur sur mobile quand mobileTab === 'edit') */}
        <aside
          className={`w-full min-[900px]:w-[420px] shrink-0 bg-[#fbf9f6] border-r border-[#e6ded5] flex flex-col h-full overflow-hidden z-10 transition-all ${
            mobileTab === "edit" ? "flex" : "hidden min-[900px]:flex"
          }`}
        >
          {/* Onglets du panneau : Contenu vs Message d'envoi */}
          <div className="p-2.5 bg-white border-b border-gray-200/80 flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActivePanelTab("content")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePanelTab === "content"
                  ? "bg-[#1b140e] text-white shadow-xs"
                  : "bg-gray-100/80 text-gray-700 hover:bg-gray-200/80"
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Contenu de l&apos;invitation</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePanelTab("messages")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePanelTab === "messages"
                  ? "bg-[#1b140e] text-white shadow-xs"
                  : "bg-gray-100/80 text-gray-700 hover:bg-gray-200/80"
              }`}
            >
              <MessageSquare size={13} />
              <span>Message d&apos;envoi</span>
            </button>
          </div>

          {/* Corps défilable du panneau */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            {activePanelTab === "content" ? (
              <div className="space-y-2.5">
                {config.sections.map((section) => (
                  <StudioSectionAccordion
                    key={section.id}
                    section={section}
                    isOpen={!!openSections[section.id]}
                    onToggle={() => toggleSection(section.id)}
                    values={content}
                    onChangeField={handleFieldChange}
                    onFocusField={handleFieldFocus}
                  />
                ))}
              </div>
            ) : (
              <SendMessagesTab
                eventType={eventType}
                shareUrl={shareUrl}
                partnerNames={
                  content.partnerA && content.partnerB
                    ? `${content.partnerA} & ${content.partnerB}`
                    : eventName || "Alexandre & Marie"
                }
                eventDate={content.date || "15 mai"}
                eventTime={content.time || "16:00"}
                eventVenue={content.venue || content.city || "Domaine du Jardin Blanc"}
                guests={guests}
                savedMessages={savedMessages}
                onSaveMessage={handleSaveMessage}
                onDeleteSavedMessage={handleDeleteSavedMessage}
              />
            )}
          </div>
        </aside>

        {/* APERÇU DE L'INVITATION À DROITE (IFRAME INTERACTIVE) */}
        <main
          className={`flex-1 h-full bg-[#140e0a] relative flex items-center justify-center overflow-hidden p-0 sm:p-4 lg:p-6 ${
            mobileTab === "preview" ? "flex" : "hidden min-[900px]:flex"
          }`}
        >
          {/* Cadre de simulation téléphone élégant et luxueux */}
          <div className="relative w-full h-full max-w-[430px] sm:max-h-[880px] bg-black rounded-none sm:rounded-[40px] shadow-2xl border-0 sm:border-[8px] sm:border-[#2b2118] overflow-hidden flex flex-col ring-1 ring-white/10">
            {/* Encoche haut de téléphone sur desktop */}
            <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-[#2b2118] rounded-b-xl z-30 items-center justify-center">
              <span className="w-10 h-1 bg-black/40 rounded-full" />
            </div>

            {/* Iframe avec communication postMessage en temps réel */}
            <iframe
              ref={frameRef}
              src={previewSrc}
              title="Aperçu interactif de l'invitation Evenium"
              className="w-full h-full border-0 bg-black"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
