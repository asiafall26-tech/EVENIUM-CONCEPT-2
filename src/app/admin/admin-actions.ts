"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import fs from "fs";
import { computeEventDates } from "@/utils/date-helpers";

export async function saveDebugData(data: any) {
  try {
    fs.writeFileSync('debug_prestataires.json', JSON.stringify(data, null, 2));
  } catch (e) {}
}

export async function createProviderAccount(formData: FormData) {
  const companyName = formData.get("companyName") as string;
  const email = formData.get("email") as string;
  
  // Types d'événements, prestations et zones : renseignés par le prestataire à sa première connexion
  if (!companyName || !email) {
    return { error: "Tous les champs sont requis." };
  }

  // 1. Initialiser le client Supabase avec la clé Service Role (Admin)
  // Cela permet de créer des utilisateurs sans modifier la session de l'admin actuel.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseServiceKey) {
    return { error: "Configuration serveur manquante (Service Role Key)." };
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // 2. Générer un mot de passe temporaire robuste
  const tempPassword = `EvNm-${Math.random().toString(36).slice(-6)}${Math.floor(Math.random() * 100)}!`;

  try {
    // 3. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: companyName,
        role: "prestataire"
      }
    });

    if (authError) throw authError;

    const newUserId = authData.user.id;

    // 4. Mettre à jour (ou insérer) le profil dans la table 'profiles'
    // L'utilisation de upsert évite l'erreur "duplicate key" si Supabase a un trigger automatique.
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: newUserId,
        full_name: companyName,
        email: email,
        role: "prestataire", // This is the role saved in DB
        is_evenium_certified: true // Important: This marks them as an Evenium Certified Partner
      });

    if (profileError) {
      // Rollback (delete auth user) if profile insertion fails
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw profileError;
    }

    return { 
      success: true, 
      credentials: {
        email: email,
        password: tempPassword
      }
    };

  } catch (error: any) {
    return { error: error.message || "Erreur lors de la création du prestataire." };
  }
}

export async function resetProviderPassword(userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseServiceKey) return { error: "Configuration serveur manquante." };

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const tempPassword = `EvNm-${Math.random().toString(36).slice(-6)}${Math.floor(Math.random() * 100)}!`;

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: tempPassword
  });

  if (error) return { error: error.message };

  return { success: true, newPassword: tempPassword };
}

export async function toggleUserSuspension(userId: string, currentStatus: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseServiceKey) return { error: "Configuration serveur manquante." };

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const newStatus = currentStatus === 'actif' ? 'suspendu' : 'actif';
    
    // Update auth user if you want to actually ban them in Supabase Auth
    // The ban_duration is a string like "8760h" for 1 year.
    const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { ban_duration: newStatus === 'suspendu' ? '87600h' : 'none' }
    );
    if (banError) throw banError;
    
    return { success: true, status: newStatus };
  } catch (error: any) {
    return { error: error.message };
  }
}


export async function getPrestataires() {
  noStore();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseServiceKey) return { data: [], error: "Configuration serveur manquante." };

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('role', 'prestataire');

  if (error || !profiles) return { data: [], error: error?.message };

  // Fetch statistics for each provider (e.g. accepted devis)
  const { data: devis } = await supabaseAdmin
    .from('demandes_devis')
    .select('prestataire_id, status');

  const enrichedProfiles = profiles.map(profile => {
    const providerDevis = (devis || []).filter(d => d.prestataire_id === profile.id);
    const acceptedCount = providerDevis.filter(d => d.status === 'Accepté').length;
    const totalCount = providerDevis.length;

    return {
      ...profile,
      events_count: acceptedCount,
      total_devis: totalCount
    };
  });

  return { data: enrichedProfiles, error: null };
}

export async function toggleProviderBadge(userId: string, currentCertified: boolean) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseServiceKey) return { error: "Configuration serveur manquante." };

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_evenium_certified: !currentCertified })
      .eq("id", userId);
      
    if (error) throw error;
    
    return { success: true, certified: !currentCertified };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteUserAccount(userId: string) {
  const { performFullUserDeletion } = await import("@/utils/supabase/delete-user");
  const result = await performFullUserDeletion(userId);

  if (!result.success) {
    return { error: result.error || "Erreur lors de la suppression du compte." };
  }

  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin/prestataires");
  return { success: true };
}

export async function getClientsWithStats() {
  noStore();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseServiceKey) return { data: [], error: "Configuration serveur manquante." };

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: clients, error: clientsError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false });

  if (clientsError || !clients) return { data: [], error: clientsError?.message };

  const { data: events, error: eventsError } = await supabaseAdmin
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (eventsError) {
    console.error("Error fetching events in getClientsWithStats:", eventsError);
  }

  const { getInvitationModelName, getInvitationModelThumbnail } = await import("@/data/mock/invitations");

  const enrichedClients = clients.map(client => {
    const clientEvents = (events || []).filter(e => e.client_id === client.id);
    const totalBudget = clientEvents.reduce((sum, e) => sum + Number(e.budget_total || e.budget?.total || 0), 0);
    const latestEvent = clientEvents[0];

    const hasPurchased = clientEvents.length > 0;
    const plan = latestEvent?.plan ? (latestEvent.plan.toLowerCase() === "gold" ? "Gold" : "Premium") : "Premium";
    const format = latestEvent?.format?.toLowerCase().includes("carte") ? "Carte" : "Animée";
    const modelId = latestEvent?.invitation_model_id;
    const modelName = hasPurchased ? getInvitationModelName(modelId) : "Aucun modèle";
    const modelThumbnail = hasPurchased ? getInvitationModelThumbnail(modelId) : "/invit-velours-cover.jpg";
    const isGold = plan === "Gold";
    const isAnim = format === "Animée";
    const purchaseAmount = hasPurchased 
      ? (isGold ? (isAnim ? 20000 : 15000) : (isAnim ? 10000 : 7500))
      : 0;

    return {
      ...client,
      events_count: clientEvents.length,
      total_budget: totalBudget,
      latest_event_name: latestEvent?.name || "Aucun événement",
      plan,
      format,
      model_name: modelName,
      model_thumbnail: modelThumbnail,
      purchase_amount: purchaseAmount,
      purchase_status: hasPurchased ? "Payé" : "Non acheté",
      events: clientEvents
    };
  });

  return { data: enrichedClients, error: null };
}

export async function saveAdminNote(userId: string, note: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseServiceKey) return { error: "Configuration serveur manquante." };

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ admin_note: note })
      .eq("id", userId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export interface AdminAlert {
  id: string;
  eventId: string;
  eventName: string;
  clientName: string;
  clientEmail: string;
  eventDate: string;
  eventEndDate?: string;
  autoClosingDate?: string;
  closingDateShort?: string;
  diffDays: number;
  daysLeft: number;
  type: "pending_reminder" | "auto_terminated" | "upcoming" | "manual_closed";
  title: string;
  message: string;
  badge: string;
  badgeColor: "amber" | "emerald" | "blue" | "gray";
  status: string;
  createdAt: string;
}

export async function getAdminAlertsAndAutoTerminate(): Promise<{
  alerts: AdminAlert[];
  stats: {
    urgentReminders: number;
    autoTerminated: number;
    upcoming: number;
    totalEvents: number;
    completedEvents: number;
  };
  error: string | null;
}> {
  noStore();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseServiceKey) {
    return {
      alerts: [],
      stats: { urgentReminders: 0, autoTerminated: 0, upcoming: 0, totalEvents: 0, completedEvents: 0 },
      error: "Configuration serveur manquante."
    };
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // 1. Fetch all events
  const { data: events, error: eventsError } = await supabaseAdmin
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (eventsError || !events) {
    return {
      alerts: [],
      stats: { urgentReminders: 0, autoTerminated: 0, upcoming: 0, totalEvents: 0, completedEvents: 0 },
      error: eventsError?.message || "Erreur de chargement des événements."
    };
  }

  // 2. Fetch profiles
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email");

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

  const now = new Date();
  const nowDayTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const alerts: AdminAlert[] = [];
  let urgentRemindersCount = 0;
  let autoTerminatedCount = 0;
  let upcomingCount = 0;
  let completedCount = 0;

  for (const event of events) {
    const prof = profileMap.get(event.client_id);
    const clientName = prof?.full_name || "Organisateur";
    const clientEmail = prof?.email || "";

    const isAlreadyCompleted = event.status === "terminé" || event.status === "completed";
    if (isAlreadyCompleted) {
      completedCount++;
    }

    if (!event.date) continue;

    const eventDate = new Date(event.date);
    if (isNaN(eventDate.getTime())) continue;

    const datesInfo = computeEventDates(event.date, event.end_date);
    const diffDays = datesInfo.daysSinceEnd;

    // RULE 1: If 7 days or more have passed since the event date => AUTO-TERMINATE!
    if (diffDays >= 7) {
      if (!isAlreadyCompleted) {
        // Auto-update status in Supabase database
        await supabaseAdmin
          .from("events")
          .update({ status: "terminé" })
          .eq("id", event.id);

        event.status = "terminé";
        completedCount++;
      }

      autoTerminatedCount++;
      alerts.push({
        id: `auto-${event.id}`,
        eventId: event.id,
        eventName: event.name || "Événement Evenium",
        clientName,
        clientEmail,
        eventDate: datesInfo.eventDateFormatted,
        eventEndDate: datesInfo.endDateFormatted,
        autoClosingDate: datesInfo.closingDateFormatted,
        closingDateShort: datesInfo.closingDateShort,
        diffDays,
        daysLeft: 0,
        type: "auto_terminated",
        title: `Clôture automatique effectuée (+${diffDays}j écoulés)`,
        message: `L'événement « ${event.name} » s'est tenu le ${eventDate.toLocaleDateString("fr-FR")}. Le délai de 7 jours après la fin de l'événement est atteint : l'événement a été automatiquement clôturé et archivé.`,
        badge: `Terminé auto (+7j)`,
        badgeColor: "emerald",
        status: "terminé",
        createdAt: new Date().toISOString()
      });
    }
    // RULE 2: If event date has passed but less than 7 days => REMINDER ALERT!
    else if (diffDays >= 0 && diffDays < 7) {
      const daysLeft = 7 - diffDays;

      if (!isAlreadyCompleted) {
        urgentRemindersCount++;
        alerts.push({
          id: `reminder-${event.id}`,
          eventId: event.id,
          eventName: event.name || "Événement Evenium",
          clientName,
          clientEmail,
          eventDate: datesInfo.eventDateFormatted,
          eventEndDate: datesInfo.endDateFormatted,
          autoClosingDate: datesInfo.closingDateFormatted,
          closingDateShort: datesInfo.closingDateShort,
          diffDays,
          daysLeft,
          type: "pending_reminder",
          title: `Rappel : Événement à clôturer (Clôture auto dans ${daysLeft}j)`,
          message: `L'événement « ${event.name} » s'est terminé le ${datesInfo.endDateFormatted} (il y a ${diffDays === 0 ? "aujourd'hui" : `${diffDays} jour${diffDays > 1 ? "s" : ""}`}). Vous pouvez le clôturer manuellement dès maintenant, ou Evenium le clôturera automatiquement dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}.`,
          badge: `Clôture auto dans ${daysLeft}j`,
          badgeColor: "amber",
          status: event.status || "active",
          createdAt: new Date().toISOString()
        });
      } else {
        // Manually closed during grace period
        alerts.push({
          id: `closed-${event.id}`,
          eventId: event.id,
          eventName: event.name || "Événement Evenium",
          clientName,
          clientEmail,
          eventDate: datesInfo.eventDateFormatted,
          eventEndDate: datesInfo.endDateFormatted,
          autoClosingDate: datesInfo.closingDateFormatted,
          closingDateShort: datesInfo.closingDateShort,
          diffDays,
          daysLeft: 0,
          type: "manual_closed",
          title: `Événement clôturé manuellement`,
          message: `L'événement « ${event.name} » a été clôturé avec succès par l'administrateur.`,
          badge: `Clôturé`,
          badgeColor: "gray",
          status: "terminé",
          createdAt: new Date().toISOString()
        });
      }
    }
    // RULE 3: If upcoming event within 3 days => UPCOMING ALERT!
    else if (diffDays < 0 && diffDays >= -3) {
      const daysUntil = Math.abs(diffDays);
      upcomingCount++;
      alerts.push({
        id: `upcoming-${event.id}`,
        eventId: event.id,
        eventName: event.name || "Événement Evenium",
        clientName,
        clientEmail,
        eventDate: datesInfo.eventDateFormatted,
        eventEndDate: datesInfo.endDateFormatted,
        autoClosingDate: datesInfo.closingDateFormatted,
        closingDateShort: datesInfo.closingDateShort,
        diffDays,
        daysLeft: daysUntil,
        type: "upcoming",
        title: `Célébration imminente (dans ${daysUntil} jour${daysUntil > 1 ? "s" : ""})`,
        message: `L'événement « ${event.name} » aura lieu le ${datesInfo.eventDateFormatted}. La période de clôture automatique de 7 jours s'activera après la fin de l'événement.`,
        badge: `J-${daysUntil}`,
        badgeColor: "blue",
        status: event.status || "active",
        createdAt: new Date().toISOString()
      });
    }
  }

  // Sort alerts: urgent reminders first, then upcoming, then auto-terminated
  alerts.sort((a, b) => {
    const priority = { pending_reminder: 1, upcoming: 2, auto_terminated: 3, manual_closed: 4 };
    return (priority[a.type] || 5) - (priority[b.type] || 5);
  });

  return {
    alerts,
    stats: {
      urgentReminders: urgentRemindersCount,
      autoTerminated: autoTerminatedCount,
      upcoming: upcomingCount,
      totalEvents: events.length,
      completedEvents: completedCount
    },
    error: null
  };
}

export async function toggleEventTermination(eventId: string, newStatus: "active" | "terminé") {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseServiceKey) return { error: "Configuration serveur manquante." };

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const { error } = await supabaseAdmin
      .from("events")
      .update({ status: newStatus })
      .eq("id", eventId);

    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/admin/alertes");
    revalidatePath("/admin/evenements");
    revalidatePath(`/admin/evenements/${eventId}`);
    revalidatePath("/dashboard");

    return { success: true, status: newStatus };
  } catch (err: any) {
    return { error: err.message };
  }
}

