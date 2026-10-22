/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType } from "react";

import VeloursStudio from "@/components/invitations/velours/VeloursStudio";
import VeloursInvitation from "@/components/invitations/velours/VeloursInvitation";
import { VELOURS_MODEL_ID, DEFAULT_VELOURS, withDefaults as veloursDefaults } from "@/components/invitations/velours/content";
import SceauStudio from "@/components/invitations/sceau/SceauStudio";
import SceauInvitation from "@/components/invitations/sceau/SceauInvitation";
import { SCEAU_MODEL_ID, DEFAULT_SCEAU, withDefaults as sceauDefaults } from "@/components/invitations/sceau/content";
import IvoireStudio from "@/components/invitations/ivoire/IvoireStudio";
import IvoireInvitation from "@/components/invitations/ivoire/IvoireInvitation";
import { IVOIRE_MODEL_ID, DEFAULT_IVOIRE, withDefaults as ivoireDefaults } from "@/components/invitations/ivoire/content";
import RoseOrStudio from "@/components/invitations/rose-or/RoseOrStudio";
import RoseOrInvitation from "@/components/invitations/rose-or/RoseOrInvitation";
import { ROSE_OR_MODEL_ID, DEFAULT_ROSE_OR, withDefaults as roseOrDefaults } from "@/components/invitations/rose-or/content";
import AnniversaireStudio from "@/components/invitations/anniversaire/AnniversaireStudio";
import AnniversaireInvitation from "@/components/invitations/anniversaire/AnniversaireInvitation";
import { ANNIVERSAIRE_MODEL_ID, DEFAULT_ANNIVERSAIRE, withDefaults as anniversaireDefaults } from "@/components/invitations/anniversaire/content";

export type ModelContent = Record<string, any>;

/** Champs de la musique dans le contenu du modèle */
export interface AudioKeys {
  url: string;
  title: string;
  start: string;
  end: string;
}

const AUDIO: AudioKeys = { url: "audioUrl", title: "audioTitle", start: "audioStart", end: "audioEnd" };

export interface SiteModel {
  id: string;
  name: string;
  image: string;
  liveUrl: string;
  original: ModelContent;
  fill: (partial: any) => ModelContent;
  Studio: ComponentType<{ value: any; onChange: (v: any) => void; onViewFullScreen?: () => void }>;
  Invitation: ComponentType<{ content: any; preview?: boolean; onBackToEdit?: () => void; onFinalize?: () => void }>;
  audio: AudioKeys;
}

/** Modèles d'invitation proposés sur le site, éditables dans le studio des modèles (admin). */
export const SITE_MODELS: SiteModel[] = [
  { id: VELOURS_MODEL_ID, name: "Velours Bordeaux", image: "/invit-velours-cover.jpg", liveUrl: "/invitation-mariage", original: DEFAULT_VELOURS, fill: veloursDefaults, Studio: VeloursStudio, Invitation: VeloursInvitation as any, audio: AUDIO },
  { id: SCEAU_MODEL_ID, name: "Sceau d'Or Impérial", image: "/invit-sceau-dor-cover.jpg", liveUrl: "/invitation-sceau-dor", original: DEFAULT_SCEAU, fill: sceauDefaults, Studio: SceauStudio, Invitation: SceauInvitation as any, audio: AUDIO },
  { id: IVOIRE_MODEL_ID, name: "Ivoire Couture", image: "/invit-ivoire-cover.jpg", liveUrl: "/invitation-ivoire", original: DEFAULT_IVOIRE, fill: ivoireDefaults, Studio: IvoireStudio, Invitation: IvoireInvitation as any, audio: AUDIO },
  {
    id: ROSE_OR_MODEL_ID, name: "Rose Poudrée & Or", image: "/invit-rose-or-cover.jpg", liveUrl: "/invitation-rose-or", original: DEFAULT_ROSE_OR, fill: roseOrDefaults, Studio: RoseOrStudio, Invitation: RoseOrInvitation as any,
    audio: { url: "music", title: "musicTitle", start: "musicStart", end: "musicEnd" },
  },
  { id: ANNIVERSAIRE_MODEL_ID, name: "Anniversaire Bordeaux & Or", image: "/invit-anniversaire-cover.jpg", liveUrl: "/invitation-anniversaire", original: DEFAULT_ANNIVERSAIRE, fill: anniversaireDefaults, Studio: AnniversaireStudio, Invitation: AnniversaireInvitation as any, audio: AUDIO },
];
