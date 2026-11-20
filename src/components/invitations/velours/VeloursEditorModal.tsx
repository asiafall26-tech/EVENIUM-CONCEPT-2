"use client";

import SplitStudioEditor from "@/components/studio/SplitStudioEditor";
import { VELOURS_MODEL_ID, type VeloursContent } from "./content";

interface Props {
  initial: VeloursContent;
  onClose: () => void;
  onSave: (content: VeloursContent) => void | Promise<void>;
  saveLabel?: string;
  defaultContent?: VeloursContent;
  isStatic?: boolean;
}

/** Éditeur en écran partagé pour Velours Bordeaux (panneau 420px + aperçu interactif en direct) */
export default function VeloursEditorModal({ initial, onClose, onSave, isStatic }: Props) {
  return (
    <SplitStudioEditor
      modelId={VELOURS_MODEL_ID}
      initialContent={initial}
      onClose={onClose}
      onSave={onSave as any}
      isStatic={isStatic}
      onFinalize={onClose}
      finalizeLabel="Enregistrer & Fermer"
    />
  );
}
