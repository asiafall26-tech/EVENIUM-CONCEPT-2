import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { fetchModelDefaults, hiddenModelIds } from "@/lib/modelDefaults";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Retourne l'état complet de tous les modèles (classements, contenus publiés et modèles masqués/désactivés) */
export async function GET() {
  const supabase = await createClient();
  const rows = await fetchModelDefaults(supabase);
  const hidden = Array.from(hiddenModelIds(rows));
  return NextResponse.json(
    { rows, hidden },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
  );
}
