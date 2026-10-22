import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { fetchPublishedModel } from "@/lib/modelDefaults";
import { ROSE_OR_MODEL_ID, toPreviewMessage, withDefaults, type RoseOrContent } from "@/components/invitations/rose-or/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Version d'un modèle publiée par l'admin (studio des modèles). Pour Rose Poudrée, aussi le message prêt pour la page animée. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { content, hidden } = await fetchPublishedModel<Record<string, unknown>>(await createClient(), id);
  const preview = content && id === ROSE_OR_MODEL_ID ? toPreviewMessage(withDefaults(content as Partial<RoseOrContent>)) : null;
  return NextResponse.json({ content, preview, hidden }, { headers: { "Cache-Control": "no-store" } });
}
