"use client";

import { createContext, useContext } from "react";

/**
 * Réglage du bloc d'actions de fin d'invitation.
 * - force : l'affiche même dans le dashboard (création d'un événement supplémentaire)
 * - variant « choose » : aperçu d'un modèle de la galerie → « Choisir ce modèle » / « Retour »
 */
export interface InvitationCtaSettings {
  force?: boolean;
  variant?: "checkout" | "choose";
}

export const InvitationCtaContext = createContext<InvitationCtaSettings>({});

export const useInvitationCta = () => useContext(InvitationCtaContext);

export const CHOOSE_CTA_TEXT = {
  kicker: "Aperçu du modèle",
  title: "Ce modèle vous plaît ?",
  desc: "Choisissez-le pour le personnaliser avec vos textes, photos et musique, puis validez votre événement.",
  primary: "Choisir ce modèle",
  secondary: "Retour",
};
