"use client";

import SplitStudioEditor from "@/components/studio/SplitStudioEditor";
import { ROSE_OR_MODEL_ID, type RoseOrContent } from "./content";

interface Props {
  initial: RoseOrContent;
  onClose: () => void;
  onSave: (content: RoseOrContent) => void | Promise<void>;
  saveLabel?: string;
  defaultContent?: RoseOrContent;
  isStatic?: boolean;
}

/** Éditeur en écran partagé pour Rose Poudrée & Or Impérial */
export default function RoseOrEditorModal({ initial, onClose, onSave, isStatic, saveLabel = "TERMINER" }: Props) {
  return (
    <SplitStudioEditor
      modelId={ROSE_OR_MODEL_ID}
      initialContent={initial}
      onClose={onClose}
      onSave={onSave as any}
      isStatic={isStatic}
      onFinalize={onClose}
      finalizeLabel={saveLabel}
    />
  );
}
