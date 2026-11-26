"use server";

import { getSupabaseAdmin } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export interface BudgetExpensePayload {
  id?: string;
  eventId: string;
  description: string;
  category: string;
  date: string;
  amount: number;
  status: "Payé" | "En attente" | "À engager";
}

export async function getEventBudgetAndExpensesAction(eventId: string) {
  try {
    const admin = getSupabaseAdmin();

    // 1. Récupérer l'événement
    const { data: eventData, error: eventError } = await admin
      .from("events")
      .select("id, name, plan, format, budget_total, status, date, location")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError) {
      console.error("getEventBudgetAndExpensesAction event error:", eventError);
    }

    // 2. Récupérer les dépenses (transactions de type 'depense')
    const { data: txData, error: txError } = await admin
      .from("transactions")
      .select("id, description, categorie, date, montant, status, type")
      .eq("event_id", eventId)
      .eq("type", "depense")
      .order("date", { ascending: false });

    if (txError) {
      console.error("getEventBudgetAndExpensesAction tx error:", txError);
    }

    const expenses = (txData || []).map((t) => ({
      id: t.id,
      description: t.description || "Dépense",
      category: t.categorie || "Autre",
      date: t.date || new Date().toISOString().split("T")[0],
      amount: Number(t.montant) || 0,
      status: (t.status === "Payé" ? "Payé" : (t.status === "À engager" ? "À engager" : "En attente")) as "Payé" | "En attente" | "À engager",
    }));

    return {
      success: true,
      event: eventData
        ? {
            id: eventData.id,
            name: eventData.name,
            plan: eventData.plan,
            format: eventData.format,
            budgetTotal: Number(eventData.budget_total) || 0,
            status: eventData.status,
            date: eventData.date,
            location: eventData.location,
          }
        : null,
      expenses,
    };
  } catch (err: any) {
    console.error("getEventBudgetAndExpensesAction unexpected error:", err);
    return {
      success: false,
      error: err.message || "Erreur de chargement du budget",
      event: null,
      expenses: [],
    };
  }
}

export async function updateEventBudgetAction(eventId: string, budgetTotal: number) {
  try {
    const admin = getSupabaseAdmin();
    const cleanAmount = Math.max(0, Math.round(Number(budgetTotal) || 0));

    const { error } = await admin
      .from("events")
      .update({ budget_total: cleanAmount })
      .eq("id", eventId);

    if (error) {
      console.error("updateEventBudgetAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/events/${eventId}/budget`);
    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true, budgetTotal: cleanAmount };
  } catch (err: any) {
    return { success: false, error: err.message || "Impossible de mettre à jour le budget" };
  }
}

export async function saveBudgetExpenseAction(payload: BudgetExpensePayload) {
  try {
    const admin = getSupabaseAdmin();
    const { id, eventId, description, category, date, amount, status } = payload;
    const cleanAmount = Math.max(0, Math.round(Number(amount) || 0));

    if (id) {
      // Modification
      const { error } = await admin
        .from("transactions")
        .update({
          description: description.trim(),
          categorie: category,
          date: date || new Date().toISOString().split("T")[0],
          montant: cleanAmount,
          status: status || "Payé",
        })
        .eq("id", id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Nouvelle dépense
      const { data: newRow, error } = await admin
        .from("transactions")
        .insert([
          {
            event_id: eventId,
            type: "depense",
            description: description.trim(),
            categorie: category,
            date: date || new Date().toISOString().split("T")[0],
            montant: cleanAmount,
            status: status || "Payé",
          },
        ])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      revalidatePath(`/dashboard/events/${eventId}/budget`);
      revalidatePath(`/dashboard/events/${eventId}`);
      return { success: true, id: newRow.id };
    }

    revalidatePath(`/dashboard/events/${eventId}/budget`);
    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true, id };
  } catch (err: any) {
    return { success: false, error: err.message || "Impossible d'enregistrer la dépense" };
  }
}

export async function deleteBudgetExpenseAction(expenseId: string, eventId: string) {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("transactions").delete().eq("id", expenseId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/events/${eventId}/budget`);
    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Impossible de supprimer la dépense" };
  }
}

/**
 * Défalque une charge engagée sur le budget initial :
 * Met à jour son statut à "Payé" et actualise éventuellement le montant réel réglé et la date.
 */
export async function defalquerChargeAction(payload: {
  expenseId: string;
  eventId: string;
  montantReel?: number;
  dateReglement?: string;
}) {
  try {
    const admin = getSupabaseAdmin();
    const { expenseId, eventId, montantReel, dateReglement } = payload;

    const updateFields: Record<string, any> = {
      status: "Payé",
    };

    if (montantReel !== undefined && montantReel >= 0) {
      updateFields.montant = Math.round(montantReel);
    }
    if (dateReglement) {
      updateFields.date = dateReglement;
    }

    const { error } = await admin
      .from("transactions")
      .update(updateFields)
      .eq("id", expenseId);

    if (error) {
      console.error("defalquerChargeAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/events/${eventId}/budget`);
    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Impossible de défalquer la charge" };
  }
}

export async function upgradeEventToGoldAction(eventId: string) {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("events").update({ plan: "Gold" }).eq("id", eventId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/events/${eventId}/budget`);
    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Impossible de passer à la formule Gold" };
  }
}
