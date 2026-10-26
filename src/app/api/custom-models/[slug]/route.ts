import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { customValues, fetchCustomModel, styleMessage, withoutMusicValues } from "@/lib/customModels";

export const dynamic = "force-dynamic";

/** Valeurs publiées d'un modèle importé (démo publique du modèle). */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = await fetchCustomModel(await createClient(), slug);
  if (!model || model.status !== "published") return NextResponse.json({ values: null }, { status: 404 });
  const values = customValues(model.fields, model.content);
  return NextResponse.json(
    { values: model.invitation_type === "carte" ? withoutMusicValues(model.fields, values) : values, style: styleMessage(values) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
