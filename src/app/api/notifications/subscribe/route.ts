import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { getSupabaseAdmin } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabaseUser = await createServerClient();
    const { data: { user } } = await supabaseUser.auth.getUser();

    const body = await req.json().catch(() => ({}));
    const { endpoint, keys, userId: bodyUserId } = body;

    let targetUserId = user?.id || bodyUserId;
    if (!targetUserId) {
      return NextResponse.json({ error: "Utilisateur non connecté." }, { status: 401 });
    }

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json({ error: "Données de souscription invalides." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Insertion ou mise à jour de l'abonnement
    const { error } = await admin
      .from("push_subscriptions")
      .upsert(
        {
          user_id: targetUserId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          device_type: req.headers.get("user-agent") || "unknown",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" }
      );

    if (error) {
      if (error.code === "42P01" || error.code === "PGRST205" || error.message?.includes("push_subscriptions")) {
        return NextResponse.json(
          {
            error: "La table push_subscriptions doit être créée dans Supabase SQL Editor.",
            needMigration: true,
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint manquant." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    await admin.from("push_subscriptions").delete().eq("endpoint", endpoint);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
