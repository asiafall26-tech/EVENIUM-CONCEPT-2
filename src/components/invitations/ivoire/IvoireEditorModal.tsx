"use client";

import SplitStudioEditor from "@/components/studio/SplitStudioEditor";
import { IVOIRE_MODEL_ID, type IvoireContent } from "./content";

interface Props {
  initial: IvoireContent;
  onClose: () => void;
  onSave: (content: IvoireContent) => void | Promise<void>;
  saveLabel?: string;
  defaultContent?: IvoireContent;
  isStatic?: boolean;
}

/** Éditeur en écran partagé pour Ivoire Couture */
export default function IvoireEditorModal({ initial, onClose, onSave, isStatic, saveLabel = "TERMINER" }: Props) {
  return (
    <SplitStudioEditor
      modelId={IVOIRE_MODEL_ID}
      initialContent={initial}
      onClose={onClose}
      onSave={onSave as any}
      isStatic={isStatic}
      onFinalize={onClose}
      finalizeLabel={saveLabel}
    />
  );
}
