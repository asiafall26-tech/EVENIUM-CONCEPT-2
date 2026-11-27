"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Check,
  Loader2,
  SlidersHorizontal,
  MessageSquare,
  Sparkles,
  Smartphone,
  Save,
  Eye
} from "lucide-react";
import {
  getModelStudioConfig,
  type ModelStudioConfig,
  type CustomExtraField
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
  /** ID de l'événement en cours d'édition */
  eventId?: string;
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
  finalizeLabel = "Enregistrer les modifications",
  customModel,
  eventId,
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
    const raw = initialContent?.values ?? initialContent ?? {};
    return { ...config.defaultValues, ...(typeof raw === "object" ? raw : {}) };
  });

  // Champs masqués par l'utilisateur
  const [hiddenFields, setHiddenFields] = useState<string[]>(() => {
    return (initialContent?.__hidden_fields as string[]) || [];
  });

  // Champs personnalisés libres ajoutés par l'utilisateur
  const [customFields, setCustomFields] = useState<CustomExtraField[]>(() => {
    return (initialContent?.__custom_fields as CustomExtraField[]) || [];
  });

  // Messages d'accompagnement sauvegardés
  const [savedMessages, setSavedMessages] = useState<string[]>(() => {
    return (initialContent?.__saved_messages as string[]) || [];
  });

  // Mode actif : "edit" (MODIFIER) vs "preview" (APERÇU)
  const hasFields = config.sections.some((s) => s.fields && s.fields.length > 0);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">(() => (hasFields ? "edit" : "preview"));

  // Sous-onglet du panneau gauche : "content" (Champs) vs "messages" (Message d'envoi)
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

  // Déterminer l'URL de prévisualisation dans l'iframe avec le mode édition interactif actif pour l'organisateur
  const previewSrc = React.useMemo(() => {
    const base = config.previewPath;
    const delim = base.includes("?") ? "&" : "?";
    const evParam = eventId ? `&eventId=${encodeURIComponent(eventId)}` : "";
    return `${base}${delim}preview=1&canEdit=1&autoEdit=1&hideCta=1&hideEbar=1${evParam}`;
  }, [config.previewPath, eventId]);

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
    sendPostMessage({ type: "evenium:model-update", content: nextContent, values: nextContent, data: nextContent });
    // Protocoles spécifiques existants
    sendPostMessage({ type: "velours:content", content: nextContent });
    sendPostMessage({ type: "ev:content", values: nextContent, content: nextContent, data: nextContent });
    sendPostMessage({ type: "evenium:set-values", values: nextContent, content: nextContent, data: nextContent });
  }, [sendPostMessage]);

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

  // Gestion des messages reçus de l'iframe (prêt / ready + modifications internes)
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
      } else if (
        e.data.type === "evenium:content-change" ||
        e.data.type === "velours:content" ||
        (e.data.type === "ev:content" && (e.data.source === "iframe" || !e.data.source))
      ) {
        const updated = e.data.content || e.data.values || e.data.data;
        if (updated && typeof updated === "object") {
          setContent((prev) => {
            const next = { ...prev, ...updated };
            triggerAutoSave(next);
            return next;
          });
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [content, pushUpdateToPreview, triggerAutoSave]);

  // Modification d'un champ
  const handleFieldChange = (fieldId: string, value: any) => {
    setContent((prev) => {
      const next = { ...prev };
      if (fieldId.includes(".")) {
        const [parent, child] = fieldId.split(".");
        next[parent] = { ...(typeof next[parent] === "object" ? next[parent] : {}), [child]: value };
        next[child] = value;
      } else {
        next[fieldId] = value;
      }
      pushUpdateToPreview(next);
      triggerAutoSave(next);
      return next;
    });
  };

  // Masquer / démasquer un champ
  const handleToggleHideField = (fieldId: string) => {
    setHiddenFields((prev) => {
      const exists = prev.includes(fieldId);
      const updated = exists ? prev.filter((id) => id !== fieldId) : [...prev, fieldId];
      setContent((cPrev) => {
        const next = { ...cPrev, __hidden_fields: updated };
        pushUpdateToPreview(next);
        triggerAutoSave(next);
        return next;
      });
      return updated;
    });
  };

  // Ajouter un champ personnalisé libre
  const handleAddCustomField = (sectionId: string, label: string, value: string) => {
    const newField: CustomExtraField = {
      id: `custom_${Date.now()}`,
      label,
      value,
    };
    const updatedCustom = [...customFields, newField];
    setCustomFields(updatedCustom);
    setContent((cPrev) => {
      const next = {
        ...cPrev,
        [newField.id]: newField.value,
        __custom_fields: updatedCustom,
      };
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

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Enregistrer explicitement les modifications (sauvegarde manuelle immédiate)
  const handleExplicitSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setSaveStatus("saving");
    try {
      if (onSave) {
        await onSave(content);
      }
      setSaveStatus("saved");
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Erreur à l'enregistrement manuel:", e);
      setSaveStatus("error");
    }
  };

  // Terminer / valider
  const handleFinish = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (onSave) {
      try {
        await onSave(content);
      } catch (e) {
        console.error("Erreur à la validation:", e);
      }
    }
    if (onFinalize) {
      onFinalize();
    } else if (onClose) {
      onClose();
    }
  };

  // Raccourci clavier Échap pour fermer/valider le studio
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") return;
      if (e.key === "Escape") {
        if (onClose) onClose();
        else handleFinish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, content]);

  return (
    <div className="fixed inset-0 z-50 bg-[#13090C] flex flex-col overflow-hidden font-sans select-none pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* 1. BARRE SUPÉRIEURE UNIQUE & LUXUEUSE                               */}
      {/* Exactement identique aux captures d'écran mobiles Evenium            */}
      {/* [ (X) ]            [ MODIFIER | APERÇU ]               [ TERMINER ]   */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <header className="h-14 sm:h-16 bg-[#13090C] border-b border-black/40 px-3 sm:px-6 flex items-center justify-between shrink-0 z-20">
        {/* Côté gauche : Bouton circulaire (X) + infos modèle sur desktop */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose || handleFinish}
            aria-label="Fermer"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white/90 transition-all cursor-pointer shrink-0"
          >
            <X size={18} strokeWidth={2.2} />
          </button>

          <div className="hidden min-[900px]:flex items-center gap-2.5 min-w-0">
            <span className="font-serif text-sm font-bold text-white tracking-wide truncate">
              {config.modelName}
            </span>
            {saveStatus === "saving" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium animate-pulse">
                <Loader2 size={10} className="animate-spin text-amber-300" />
                <span>Enregistrement…</span>
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium">
                <Check size={10} className="text-emerald-400" />
                <span>Enregistré</span>
              </span>
            )}
            {saveStatus === "error" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-[10px] font-medium">
                Erreur de sauvegarde
              </span>
            )}
          </div>
        </div>

        {/* Centre : Sélecteur segmenté MODIFIER / APERÇU */}
        <div className="flex items-center justify-center">
          <div className="flex items-center bg-[#251219] p-1 rounded-full border border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => setMobileTab("edit")}
              className={`px-3.5 sm:px-5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-widest uppercase transition-all cursor-pointer ${
                mobileTab === "edit"
                  ? "bg-white text-[#13090C] shadow-sm font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              MODIFIER
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("preview")}
              className={`px-3.5 sm:px-5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-widest uppercase transition-all cursor-pointer ${
                mobileTab === "preview"
                  ? "bg-white text-[#13090C] shadow-sm font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              APERÇU
            </button>
          </div>
        </div>

        {/* Côté droit : Bouton Enregistrer & Bouton doré d'action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExplicitSave}
            title="Enregistrer les modifications"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer"
          >
            {saveStatus === "saving" ? (
              <Loader2 size={13} className="animate-spin text-amber-300" />
            ) : showSaveSuccess ? (
              <Check size={13} className="text-emerald-400" />
            ) : (
              <Save size={13} className="text-[#D4AF37]" />
            )}
            <span>{showSaveSuccess ? "Enregistré !" : "Enregistrer"}</span>
          </button>

          <button
            type="button"
            onClick={handleFinish}
            className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#3C0D16] font-extrabold text-xs uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
          >
            {finalizeLabel}
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* 2. CORPS : PANNEAU GAUCHE (MODIFIER) + APERÇU DIRECT (APERÇU)        */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-row overflow-hidden relative w-full">
        {/* PANNEAU DE MODIFICATION (Pleine largeur sur mobile quand mobileTab === 'edit', 420 px sur ordi ≥ 900 px) */}
        <aside
          className={`w-full min-[900px]:w-[420px] shrink-0 bg-[#FAF7F2] border-r border-[#E8DFD5] flex flex-col h-full overflow-hidden z-10 transition-all ${
            mobileTab === "edit" ? "flex" : "hidden min-[900px]:flex"
          }`}
        >
          {/* Onglets secondaires du panneau : Contenu de l'invitation vs Messages d'envoi */}
          <div className="px-4 py-2.5 bg-[#FAF7F2] border-b border-[#E8DFD5] flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActivePanelTab("content")}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-serif font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePanelTab === "content"
                  ? "bg-[#4A0E1A] text-white shadow-xs"
                  : "bg-white text-[#4A0E1A] border border-[#E8DFD5] hover:bg-black/[0.02]"
              }`}
            >
              <SlidersHorizontal size={12} />
              <span>Sections</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePanelTab("messages")}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-serif font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePanelTab === "messages"
                  ? "bg-[#4A0E1A] text-white shadow-xs"
                  : "bg-white text-[#4A0E1A] border border-[#E8DFD5] hover:bg-black/[0.02]"
              }`}
            >
              <MessageSquare size={12} />
              <span>Messages d&apos;envoi</span>
            </button>
          </div>

          {/* Liste des sections en accordéon (COUPLE, DATE, PROGRAMME, DRESS CODE, ITINÉRAIRE, GALERIE, RÉPONSES, MOT DE LA FIN, DONNÉES) */}
          <div className="flex-1 overflow-y-auto overscroll-contain bg-[#FAF7F2]">
            {activePanelTab === "content" ? (
              <div className="divide-y divide-[#E8DFD5] border-b border-[#E8DFD5]">
                {config.sections.map((section) => (
                  <StudioSectionAccordion
                    key={section.id}
                    section={section}
                    isOpen={!!openSections[section.id]}
                    onToggle={() => toggleSection(section.id)}
                    values={content}
                    onChangeField={handleFieldChange}
                    onFocusField={handleFieldFocus}
                    hiddenFields={hiddenFields}
                    onToggleHideField={handleToggleHideField}
                    onAddCustomField={handleAddCustomField}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4">
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
              </div>
            )}
          </div>

          {/* Barre d'action inférieure fixe du panneau d'édition : Enregistrer les modifications */}
          <div className="p-3 bg-[#FAF7F2] border-t border-[#E8DFD5] flex items-center justify-between gap-2.5 shrink-0 shadow-xs">
            <button
              type="button"
              onClick={() => setMobileTab("preview")}
              className="min-[900px]:hidden px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-white text-neutral-800 text-xs font-semibold hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Eye size={14} className="text-[#8f6f33]" />
              <span>Voir aperçu</span>
            </button>
            <button
              type="button"
              onClick={handleExplicitSave}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#b8924a] to-[#d4af37] text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 size={14} className="animate-spin text-black" />
                  <span>Enregistrement…</span>
                </>
              ) : showSaveSuccess ? (
                <>
                  <Check size={14} className="text-black" />
                  <span>Modifications enregistrées !</span>
                </>
              ) : (
                <>
                  <Save size={14} className="text-black" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* APERÇU EN DIRECT (Plein écran sur mobile quand mobileTab === 'preview', ou volet droit sur desktop ≥ 900 px) */}
        <main
          className={`flex-1 h-full bg-[#13090C] relative flex items-center justify-center overflow-hidden ${
            mobileTab === "preview" ? "flex p-0" : "hidden min-[900px]:flex min-[900px]:p-6"
          }`}
        >
          {/* Sur mobile (< 900px) en mode aperçu : 100% de la largeur et hauteur sans bordures parasites */}
          <div className="w-full h-full min-[900px]:max-w-[430px] min-[900px]:max-h-[880px] bg-black rounded-none min-[900px]:rounded-[40px] shadow-2xl border-0 min-[900px]:border-[8px] min-[900px]:border-[#251219] overflow-hidden flex flex-col ring-0 min-[900px]:ring-1 min-[900px]:ring-white/10 relative">
            {/* Encoche téléphone élégante visible uniquement sur ordinateur */}
            <div className="hidden min-[900px]:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-[#251219] rounded-b-xl z-30 items-center justify-center">
              <span className="w-10 h-1 bg-black/40 rounded-full" />
            </div>

            {/* Iframe avec communication postMessage en temps réel sans rechargement */}
            <iframe
              ref={frameRef}
              src={previewSrc}
              title="Aperçu interactif de l'invitation Evenium"
              className="w-full h-full border-0 bg-[#13090C]"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>

          {/* Raccourci tactile flottant sur mobile en mode aperçu : Revenir à Modifier ou Enregistrer */}
          <div className="min-[900px]:hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-[#13090C]/90 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-xl">
            <button
              type="button"
              onClick={() => setMobileTab("edit")}
              className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
            >
              <SlidersHorizontal size={13} />
              <span>Modifier</span>
            </button>
            <button
              type="button"
              onClick={handleExplicitSave}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
            >
              {showSaveSuccess ? <Check size={13} /> : <Save size={13} />}
              <span>{showSaveSuccess ? "Enregistré" : "Enregistrer"}</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
