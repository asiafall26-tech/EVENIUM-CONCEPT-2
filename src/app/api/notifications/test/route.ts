import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { sendPushToUser } from "@/lib/notifications/serverPush";

export async function POST(req: NextRequest) {
  try {
    const supabaseUser = await createServerClient();
    const { data: { user } } = await supabaseUser.auth.getUser();

    const body = await req.json().catch(() => ({}));
    const targetUserId = user?.id || body.userId;

    if (!targetUserId) {
      return NextResponse.json({ error: "Non connecté." }, { status: 401 });
    }

    const title = body.title || "Evenium • Test d'alerte";
    const message = body.message || "Félicitations ! Les notifications en arrière-plan fonctionnent sur votre appareil.";

    if (body.delayMs && typeof body.delayMs === "number" && body.delayMs > 0) {
      const wait = Math.min(body.delayMs, 10000);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }

    const result = await sendPushToUser(targetUserId, {
      title,
      body: message,
      url: "/dashboard",
      tag: "test-notification",
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sentCount: result.sentCount,
      message:
        result.sentCount > 0
          ? `Notification envoyée à ${result.sentCount} appareil(s) !`
          : "Aucun appareil abonné trouvé pour ce compte. Veuillez cliquer sur 'Activer les notifications push sur cet appareil'.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
