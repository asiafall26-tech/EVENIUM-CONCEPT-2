"use client";

import SplitStudioEditor from "@/components/studio/SplitStudioEditor";
import { ANNIVERSAIRE_MODEL_ID, type AnniversaireContent } from "./content";

interface Props {
  initial: AnniversaireContent;
  onClose: () => void;
  onSave: (content: AnniversaireContent) => void | Promise<void>;
  saveLabel?: string;
  defaultContent?: AnniversaireContent;
  isStatic?: boolean;
}

/** Éditeur en écran partagé pour Anniversaire Bordeaux & Or */
export default function AnniversaireEditorModal({ initial, onClose, onSave, isStatic, saveLabel = "TERMINER" }: Props) {
  return (
    <SplitStudioEditor
      modelId={ANNIVERSAIRE_MODEL_ID}
      initialContent={initial}
      onClose={onClose}
      onSave={onSave as any}
      isStatic={isStatic}
      onFinalize={onClose}
      finalizeLabel={saveLabel}
    />
  );
}
