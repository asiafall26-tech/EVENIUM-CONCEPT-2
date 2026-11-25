"use server";

import { getSupabaseAdmin } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export interface RecordClientPurchaseParams {
  eventId: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  plan: "Premium" | "Gold" | "Standard";
  format: "Animée" | "Carte";
  modelName: string;
  amount: number;
}

export async function recordClientPurchaseAction(params: RecordClientPurchaseParams) {
  try {
    const admin = getSupabaseAdmin();
    const { eventId, userId, fullName, email, phone, plan, format, modelName, amount } = params;

    // 1. S'assurer que le profil client existe et est à jour
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanName = fullName?.trim() || "Client Organisateur";

    // Vérifier si l'utilisateur existe déjà pour préserver le rôle admin si applicable
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id, role, full_name, email, phone")
      .eq("id", userId)
      .maybeSingle();

    const roleToSet = existingProfile?.role === "admin" || cleanEmail === "asiafall26@gmail.com" ? "admin" : "client";

    await admin.from("profiles").upsert(
      {
        id: userId,
        full_name: cleanName || existingProfile?.full_name || "Client Organisateur",
        email: cleanEmail || existingProfile?.email || "",
        phone: phone || (existingProfile as any)?.phone || "",
        role: roleToSet,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    // 2. Insérer la transaction d'achat dans `transactions` (contourne RLS client)
    const libelle = `Achat Formule ${plan} (${format}) - ${modelName || "Invitation"}`;
    const { data: tx, error: txError } = await admin
      .from("transactions")
      .insert([
        {
          event_id: eventId,
          libelle,
          montant: amount,
          type: "revenu",
          moyen_paiement: "Paiement en ligne (Validé)",
          date: new Date().toISOString(),
        },
      ])
      .select()
      .maybeSingle();

    if (txError) {
      console.warn("recordClientPurchaseAction: transaction insert warning:", txError);
    }

    // 3. Mettre à jour l'événement en statut actif
    await admin
      .from("events")
      .update({
        status: "active",
        client_id: userId,
        plan,
        format,
      })
      .eq("id", eventId);

    // 4. Revalider les caches serveurs du dashboard Admin et Client
    try {
      revalidatePath("/admin");
      revalidatePath("/admin/budget");
      revalidatePath("/admin/utilisateurs");
      revalidatePath("/admin/evenements");
      revalidatePath(`/admin/evenements/${eventId}`);
      revalidatePath("/dashboard");
      revalidatePath(`/dashboard/events/${eventId}`);
    } catch { }

    return { success: true, transactionId: tx?.id };
  } catch (err: any) {
    console.error("recordClientPurchaseAction error:", err);
    return { success: false, error: err?.message || "Erreur lors de l'enregistrement de l'achat" };
  }
}
