"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import CustomInvitationFrame from "./CustomInvitationFrame";
import { customValues, fetchCustomModel, slugOfModelId, withoutMusicValues, type CustomModelRow, type CustomValues } from "@/lib/customModels";
import type { RsvpPayload } from "@/components/invitations/velours/VeloursInvitation";

interface Props {
  modelId: string;
  /** Valeurs enregistrées par l'organisateur */
  values?: CustomValues | null;
  isStatic?: boolean;
  onRsvp: (rsvp: RsvpPayload & { email?: string }) => Promise<void>;
}

/** Invitation d'un modèle importé, vue par un invité : la page du modèle avec son propre RSVP natif. */
export default function CustomGuestInvitation({ modelId, values, isStatic, onRsvp }: Props) {
  const [model, setModel] = useState<CustomModelRow | null | undefined>(undefined);

  useEffect(() => {
    fetchCustomModel(createClient(), slugOfModelId(modelId)).then(setModel);
  }, [modelId]);

  if (model === undefined) {
    return (
      <div className="min-h-dvh bg-[#111] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4AF37] w-10 h-10" />
      </div>
    );
  }
  if (!model) return <div className="min-h-dvh flex items-center justify-center text-gray-500">Invitation introuvable.</div>;

  const all = customValues(model.fields, model.content, values);
  const shown = isStatic ? withoutMusicValues(model.fields, all) : all;

  return (
    <div className="relative h-dvh w-full bg-white overflow-hidden">
      <CustomInvitationFrame
        model={model}
        values={shown}
        hideCta
        className="w-full h-full border-0 block"
        // Formulaire de réponse propre au modèle : enregistré directement sur l'événement
        onRsvp={async (r) => {
          await onRsvp({
            name: r.name,
            phone: "",
            attending: r.attending,
            guests: r.attending ? Math.max(1, r.guests) : 0,
            message: r.message,
          });
        }}
      />
    </div>
  );
}
