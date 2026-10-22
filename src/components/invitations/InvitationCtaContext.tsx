"use client";

import { createContext, useContext } from "react";

/**
 * Réglage du bloc d'actions de fin d'invitation.
 * - force : l'affiche même dans le dashboard (création d'un événement supplémentaire)
 * - variant « choose » : aperçu d'un modèle de la galerie → « Choisir ce modèle » / « Retour »
 * - variant « save » : aperçu dans le studio des modèles (admin) → « Enregistrer la modification » / « Retour »
 */
export interface InvitationCtaSettings {
  force?: boolean;
  variant?: "checkout" | "choose" | "save";
}

export const InvitationCtaContext = createContext<InvitationCtaSettings>({});

export const useInvitationCta = () => useContext(InvitationCtaContext);

export interface CtaText {
  kicker: string;
  title: string;
  desc: string;
  primary: string;
  secondary: string;
  pill: string;
}

export const CTA_TEXTS: Record<"choose" | "save", CtaText> = {
  choose: {
    kicker: "Aperçu du modèle",
    title: "Ce modèle vous plaît ?",
    desc: "Choisissez-le pour le personnaliser avec vos textes, photos et musique, puis validez votre événement.",
    primary: "Choisir ce modèle",
    secondary: "Retour",
    pill: "Vous pourrez tout personnaliser à l'étape suivante",
  },
  save: {
    kicker: "Studio des modèles",
    title: "Le rendu vous convient ?",
    desc: "Enregistrez la modification, puis publiez le modèle depuis le studio pour l'afficher sur le site.",
    primary: "Enregistrer la modification",
    secondary: "Retour",
    pill: "Rien n'est visible sur le site avant la publication",
  },
};

/** Textes du bloc de fin quand ils remplacent ceux de l'achat. */
export const ctaText = (variant?: InvitationCtaSettings["variant"]) => (variant && variant !== "checkout" ? CTA_TEXTS[variant] : null);
