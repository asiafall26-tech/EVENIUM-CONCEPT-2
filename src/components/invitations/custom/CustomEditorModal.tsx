"use client";

import SplitStudioEditor from "@/components/studio/SplitStudioEditor";
import { type CustomModelRow, type CustomValues } from "@/lib/customModels";

interface Props {
  model: CustomModelRow;
  /** Valeurs déjà enregistrées sur l'événement */
  initial?: CustomValues | null;
  isStatic?: boolean;
  saveLabel?: string;
  onClose: () => void;
  onSave: (values: CustomValues) => Promise<void>;
}

/** Personnalisation d'un modèle importé par l'organisateur en écran partagé */
export default function CustomEditorModal({ model, initial, isStatic, saveLabel = "TERMINER", onClose, onSave }: Props) {
  return (
    <SplitStudioEditor
      modelId={model.slug}
      customModel={model}
      initialContent={initial || {}}
      onClose={onClose}
      onSave={onSave as any}
      isStatic={isStatic}
      onFinalize={onClose}
      finalizeLabel={saveLabel}
    />
  );
}
