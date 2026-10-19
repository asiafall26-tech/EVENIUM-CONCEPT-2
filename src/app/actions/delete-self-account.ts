"use server";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { performFullUserDeletion } from "@/utils/supabase/delete-user";
import { revalidatePath } from "next/cache";

interface DeleteAccountOptions {
  userId?: string;
  accessToken?: string;
}

export async function deleteCurrentAccount(options?: DeleteAccountOptions) {
  let targetUserId: string | null = null;
  let targetEmail: string | null = null;

  // 1. Essayer de récupérer l'utilisateur via les cookies de session SSR
  try {
    const supabaseServer = await createServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (user?.id) {
      targetUserId = user.id;
      targetEmail = user.email || null;
    }
  } catch (_) {}

  // 2. Si non trouvé via cookies, vérifier via l'accessToken fourni par le client
  if (!targetUserId && options?.accessToken) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseServiceKey) {
      const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: { user }, error: tokenErr } = await supabaseAdmin.auth.getUser(options.accessToken);
      if (user?.id && !tokenErr) {
        targetUserId = user.id;
        targetEmail = user.email || null;
      }
    }
  }

  // 3. Si aucun utilisateur Supabase n'est connecté
  if (!targetUserId) {
    return {
      error: "Aucun compte Supabase actif n'a été détecté. Vous êtes actuellement en mode visiteur/démo. Pour supprimer un utilisateur existant dans Supabase, veuillez vous connecter avec vos identifiants réels ou utiliser le panneau Super Admin (/admin/utilisateurs).",
    };
  }

  // 4. Exécuter la suppression complète en cascade dans Supabase
  const result = await performFullUserDeletion(targetUserId);

  if (!result.success) {
    return { error: result.error || "Une erreur est survenue lors de la suppression du compte dans Supabase." };
  }

  // 5. Déconnecter la session côté serveur
  try {
    const supabaseServer = await createServerClient();
    await supabaseServer.auth.signOut();
  } catch (_) {}

  revalidatePath("/", "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/prestataire", "layout");
  revalidatePath("/admin", "layout");

  return { success: true, email: targetEmail };
}
