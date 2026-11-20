"use client";

import SplitStudioEditor from "@/components/studio/SplitStudioEditor";
import { SCEAU_MODEL_ID, type SceauContent } from "./content";

interface Props {
  initial: SceauContent;
  onClose: () => void;
  onSave: (content: SceauContent) => void | Promise<void>;
  saveLabel?: string;
  defaultContent?: SceauContent;
  isStatic?: boolean;
}

/** Éditeur en écran partagé pour Sceau d'Or Impérial */
export default function SceauEditorModal({ initial, onClose, onSave, isStatic, saveLabel = "TERMINER" }: Props) {
  return (
    <SplitStudioEditor
      modelId={SCEAU_MODEL_ID}
      initialContent={initial}
      onClose={onClose}
      onSave={onSave as any}
      isStatic={isStatic}
      onFinalize={onClose}
      finalizeLabel={saveLabel}
    />
  );
}
