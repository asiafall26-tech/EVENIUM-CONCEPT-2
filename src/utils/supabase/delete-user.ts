import { createClient } from "@supabase/supabase-js";

/**
 * Supprime complètement et définitivement un utilisateur de Supabase
 * en nettoyant toutes ses données dépendantes dans l'ordre strict des contraintes PostgreSQL.
 */
export async function performFullUserDeletion(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return { success: false, error: "Configuration Supabase manquante (Service Role Key requise)." };
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // 1. Récupérer tous les événements appartenant à cet utilisateur (si client)
    const { data: userEvents } = await supabaseAdmin
      .from("events")
      .select("id")
      .eq("client_id", userId);
    
    const eventIds: string[] = (userEvents || []).map((e: any) => e.id);

    // 2. Récupérer toutes les demandes de devis liées (en tant que prestataire OU via ses événements)
    let demandeIds: string[] = [];
    const { data: d1 } = await supabaseAdmin
      .from("demandes_devis")
      .select("id")
      .eq("prestataire_id", userId);
    if (d1) demandeIds.push(...d1.map((d: any) => d.id));

    if (eventIds.length > 0) {
      const { data: d2 } = await supabaseAdmin
        .from("demandes_devis")
        .select("id")
        .in("event_id", eventIds);
      if (d2) demandeIds.push(...d2.map((d: any) => d.id));
    }
    demandeIds = Array.from(new Set(demandeIds));

    // 3. Récupérer tous les devis associés
    let devisIds: string[] = [];
    const { data: dev1 } = await supabaseAdmin
      .from("devis")
      .select("id")
      .eq("prestataire_id", userId);
    if (dev1) devisIds.push(...dev1.map((d: any) => d.id));

    const { data: dev2 } = await supabaseAdmin
      .from("devis")
      .select("id")
      .eq("client_id", userId);
    if (dev2) devisIds.push(...dev2.map((d: any) => d.id));

    if (eventIds.length > 0) {
      const { data: dev3 } = await supabaseAdmin
        .from("devis")
        .select("id")
        .in("event_id", eventIds);
      if (dev3) devisIds.push(...dev3.map((d: any) => d.id));
    }

    if (demandeIds.length > 0) {
      const { data: dev4 } = await supabaseAdmin
        .from("devis")
        .select("id")
        .in("demande_id", demandeIds);
      if (dev4) devisIds.push(...dev4.map((d: any) => d.id));
    }
    devisIds = Array.from(new Set(devisIds));

    // 4. Supprimer les sous-tables des devis (pour éviter toute violation de clé étrangère)
    if (devisIds.length > 0) {
      const subTables = ["devis_items", "devis_history", "devis_signatures", "devis_relances", "devis_acomptes"];
      for (const table of subTables) {
        try {
          await supabaseAdmin.from(table).delete().in("devis_id", devisIds);
        } catch (_) {}
      }

      // Supprimer les devis eux-mêmes
      await supabaseAdmin.from("devis").delete().in("id", devisIds);
    }
    // Nettoyage de sécurité supplémentaire sur la table devis
    await supabaseAdmin.from("devis").delete().eq("prestataire_id", userId);
    await supabaseAdmin.from("devis").delete().eq("client_id", userId);
    if (eventIds.length > 0) {
      await supabaseAdmin.from("devis").delete().in("event_id", eventIds);
    }

    // 5. Supprimer les messages
    await supabaseAdmin.from("messages").delete().eq("sender_id", userId);
    await supabaseAdmin.from("messages").delete().eq("receiver_id", userId);
    if (eventIds.length > 0) {
      await supabaseAdmin.from("messages").delete().in("event_id", eventIds);
    }

    // 6. Supprimer les transactions
    await supabaseAdmin.from("transactions").delete().eq("prestataire_id", userId);
    if (eventIds.length > 0) {
      await supabaseAdmin.from("transactions").delete().in("event_id", eventIds);
    }

    // 7. Supprimer les invités (guests)
    if (eventIds.length > 0) {
      await supabaseAdmin.from("guests").delete().in("event_id", eventIds);
    }

    // 8. Supprimer les demandes de devis
    if (demandeIds.length > 0) {
      await supabaseAdmin.from("demandes_devis").delete().in("id", demandeIds);
    }
    await supabaseAdmin.from("demandes_devis").delete().eq("prestataire_id", userId);
    if (eventIds.length > 0) {
      await supabaseAdmin.from("demandes_devis").delete().in("event_id", eventIds);
    }

    // 9. Supprimer les avis (reviews) et tickets
    try {
      await supabaseAdmin.from("reviews").delete().eq("prestataire_id", userId);
      await supabaseAdmin.from("reviews").delete().eq("client_id", userId);
    } catch (_) {}

    try {
      await supabaseAdmin.from("support_tickets").delete().eq("user_id", userId);
      await supabaseAdmin.from("tickets").delete().eq("user_id", userId);
    } catch (_) {}

    try {
      if (eventIds.length > 0) {
        await supabaseAdmin.from("tasks").delete().in("event_id", eventIds);
      }
      await supabaseAdmin.from("tasks").delete().eq("user_id", userId);
    } catch (_) {}

    // Nettoyage des fichiers Storage associés à cet utilisateur
    try {
      const { data: avatarFiles } = await supabaseAdmin.storage.from("evenium_assets").list("avatars");
      const userAvatars = (avatarFiles || []).filter((f: any) => f.name.includes(userId)).map((f: any) => `avatars/${f.name}`);
      if (userAvatars.length > 0) {
        await supabaseAdmin.storage.from("evenium_assets").remove(userAvatars);
      }
      const { data: rootFiles } = await supabaseAdmin.storage.from("evenium_assets").list();
      const userRootFiles = (rootFiles || []).filter((f: any) => f.name.includes(userId)).map((f: any) => f.name);
      if (userRootFiles.length > 0) {
        await supabaseAdmin.storage.from("evenium_assets").remove(userRootFiles);
      }
    } catch (_) {}

    // 10. Supprimer les événements
    if (eventIds.length > 0) {
      await supabaseAdmin.from("events").delete().in("id", eventIds);
    }
    await supabaseAdmin.from("events").delete().eq("client_id", userId);

    // 11. Supprimer le profil dans public.profiles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.warn("Notice lors de la suppression du profil:", profileError.message);
    }

    // 12. Supprimer définitivement l'utilisateur dans auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      // Si l'utilisateur n'existe déjà plus dans auth.users, considérer comme un succès
      if (!authError.message.toLowerCase().includes("not found")) {
        console.error("Erreur auth.admin.deleteUser:", authError.message);
        throw authError;
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error("Erreur dans performFullUserDeletion:", err);
    return { success: false, error: err.message || "Erreur lors de la suppression complète du compte." };
  }
}
