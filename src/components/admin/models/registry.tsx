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
import { CartesStudio, type CartesStudioValue } from "@/components/cartes/CartesStudio";

export const DEFAULT_VOEU_CONTENT: CartesStudioValue = {
  recipient: "Mon Ami(e)",
  sender: "Moi",
  kicker: "Joyeux Anniversaire & Vœux d'Exception",
  title: "Que cette journée soit mémorable",
  message: "Que cette nouvelle année t'apporte bonheur, santé et réussite...",
  music: "Experience - Ludovico Einaudi",
  sealColor: "gold",
  paperTheme: "parchment",
};

export const DEFAULT_MOT_DOUX_CONTENT: CartesStudioValue = {
  recipient: "Mon Amour",
  sender: "Celui qui t'aime",
  kicker: "Confidentiel & Secret",
  title: "Pour que tu n'oublies jamais à quel point tu comptes",
  message: "Au milieu du bruit du monde, il y a ton sourire qui apaise tout...",
  music: "Experience - Ludovico Einaudi",
  sealColor: "ruby",
  paperTheme: "rose",
};

export const DEFAULT_COUPLE_CONTENT: CartesStudioValue = {
  recipient: "Mon Cœur",
  sender: "Ton Amoureux",
  kicker: "Rendez-vous Intime • Privé",
  title: "Ce soir, laisse-toi guider... Je m'occupe de tout",
  message: "Oublie les contraintes et le quotidien. J'ai réservé une parenthèse rien que pour nous deux...",
  music: "Experience - Ludovico Einaudi",
  sealColor: "ruby",
  paperTheme: "ivory",
  rendezVousDate: "Ce Vendredi soir",
  rendezVousTime: "20h30 précises",
  rendezVousPlace: "Lieu secret... Je passe te chercher en bas",
  dressCode: "Chic & Séduction",
};

function createCartesStudio(cardType: "voeu" | "mot_doux" | "invitation_couple") {
  return function CartesStudioComponent({ value, onChange }: { value: any; onChange: (v: any) => void }) {
    const val: CartesStudioValue = {
      ...(cardType === "voeu" ? DEFAULT_VOEU_CONTENT : cardType === "mot_doux" ? DEFAULT_MOT_DOUX_CONTENT : DEFAULT_COUPLE_CONTENT),
      ...(value || {}),
    };
    return (
      <div className="p-4 sm:p-6 bg-[#faf6ee] overflow-y-auto min-h-[600px]">
        <CartesStudio
          cardType={cardType}
          value={val}
          onChange={(patch) => onChange({ ...val, ...patch })}
        />
      </div>
    );
  };
}

export function CartesInvitationPreview({ content, onBackToEdit, onFinalize }: { content: any; onBackToEdit?: () => void; onFinalize?: () => void }) {
  const c = content || DEFAULT_VOEU_CONTENT;
  return (
    <div className="min-h-screen bg-[#0d0603] text-[#fbf7ee] flex flex-col select-none">
      {(onBackToEdit || onFinalize) && (
        <header className="fixed top-0 left-0 right-0 z-50 h-[50px] pt-[env(safe-area-inset-top,0px)] px-3 sm:px-6 bg-[#0e0a08]/94 backdrop-blur-md border-b border-[#D4AF37]/35 flex items-center justify-between gap-3 shadow-lg">
          {onBackToEdit ? (
            <button
              type="button"
              onClick={onBackToEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-[#D4AF37]/50 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <span>← Revenir</span>
            </button>
          ) : <div />}

          <div className="text-center min-w-0 max-w-md hidden sm:block">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-extrabold block">Aperçu</span>
            <p className="font-serif text-sm text-white/90 truncate font-medium">{c.title || "Vœux & Cartes"}</p>
          </div>

          {onFinalize ? (
            <button
              type="button"
              onClick={onFinalize}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black font-extrabold text-xs shadow-md shadow-[#D4AF37]/25 hover:brightness-105 active:scale-95 transition-all border border-[#D4AF37]/60 whitespace-nowrap cursor-pointer"
            >
              <span>Valider ✨</span>
            </button>
          ) : <div />}
        </header>
      )}

      <div className={`flex-1 flex items-center justify-center p-4 ${(onBackToEdit || onFinalize) ? "pt-[64px]" : ""}`}>
        <div className="w-full max-w-xl mx-auto space-y-4 my-auto">
          <div className={`p-8 sm:p-12 rounded-3xl ${c.paperTheme === "rose"
              ? "bg-[#fff5f6] text-[#2d1217]"
              : c.paperTheme === "parchment"
                ? "bg-[#f8f0de] text-[#28180c]"
                : c.paperTheme === "dark_velvet"
                  ? "bg-[#160f0c] text-[#fbf7ee]"
                  : "bg-[#fcf9f2] text-[#24170e]"
            } border border-[#d9c08c] shadow-2xl text-center space-y-4 relative`}>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8f6f33]">
              {c.kicker || "Attention Particulière"}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">{c.title}</h3>
            <p className="font-serif text-base sm:text-lg italic leading-relaxed whitespace-pre-line">
              "{c.message}"
            </p>
            {(c.rendezVousDate || c.rendezVousPlace) && (
              <div className="p-4 bg-black/5 rounded-2xl border border-[#b8924a]/30 text-xs text-left space-y-1.5">
                <p className="font-bold text-[#8f6f33]">🕯️ Rendez-vous en Amoureux</p>
                {c.rendezVousDate && <p><strong>Date :</strong> {c.rendezVousDate} {c.rendezVousTime && `à ${c.rendezVousTime}`}</p>}
                {c.rendezVousPlace && <p><strong>Lieu :</strong> {c.rendezVousPlace}</p>}
                {c.dressCode && <p><strong>Dress Code :</strong> {c.dressCode}</p>}
                <p className="pt-2 text-center text-[#d62828] font-bold">Bouton invité : « J'accepte avec amour ❤️ »</p>
              </div>
            )}
            <div className="pt-4 border-t border-black/10 text-right text-xs font-serif italic">
              Avec toute mon affection, <br />
              <strong className="not-italic font-bold">{c.sender || "L'Expéditeur"}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  Studio: ComponentType<{ value: any; onChange: (v: any) => void; onViewFullScreen?: () => void; isStatic?: boolean }>;
  Invitation: ComponentType<{ content: any; preview?: boolean; onBackToEdit?: () => void; onFinalize?: () => void; hideCta?: boolean }>;
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
  {
    id: "voeu-exception",
    name: "Vœu d'Exception",
    image: "/invit-sceau-dor-cover.jpg",
    liveUrl: "/voeux",
    original: DEFAULT_VOEU_CONTENT,
    fill: (p) => ({ ...DEFAULT_VOEU_CONTENT, ...p }),
    Studio: createCartesStudio("voeu") as any,
    Invitation: CartesInvitationPreview as any,
    audio: AUDIO,
  },
  {
    id: "mot-doux",
    name: "Les Mots Doux",
    image: "/invit-rose-or-cover.jpg",
    liveUrl: "/mots-doux",
    original: DEFAULT_MOT_DOUX_CONTENT,
    fill: (p) => ({ ...DEFAULT_MOT_DOUX_CONTENT, ...p }),
    Studio: createCartesStudio("mot_doux") as any,
    Invitation: CartesInvitationPreview as any,
    audio: AUDIO,
  },
  {
    id: "invitation-couple",
    name: "Invitations Couple",
    image: "/invit-velours-cover.jpg",
    liveUrl: "/mots-doux",
    original: DEFAULT_COUPLE_CONTENT,
    fill: (p) => ({ ...DEFAULT_COUPLE_CONTENT, ...p }),
    Studio: createCartesStudio("invitation_couple") as any,
    Invitation: CartesInvitationPreview as any,
    audio: AUDIO,
  },
];
