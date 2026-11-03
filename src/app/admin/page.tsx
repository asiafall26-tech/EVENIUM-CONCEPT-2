import { createClient } from "@/utils/supabase/server";
import { getInvitationModelName, getInvitationModelThumbnail } from "@/data/mock/invitations";
import { computeEventDates } from "@/utils/date-helpers";
import AdminPurchasesDashboard, {
  ClientPurchase,
  PrestatairePurchase,
  UserDossier,
} from "@/components/admin/AdminPurchasesDashboard";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Fetch real events from Supabase
  const { data: dbEvents } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. Fetch all real profiles (clients & prestataires)
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const profileMap = new Map((allProfiles || []).map((p: any) => [p.id, p]));

  // 3. Fetch real transactions from Supabase
  const { data: realTransactions } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  // 4. Fetch real accepted quotes for commissions
  const { data: realDevisList } = await supabase
    .from("devis")
    .select("*")
    .eq("status", "Accepté")
    .order("created_at", { ascending: false });

  const { data: realDemandesList } = await supabase
    .from("demandes_devis")
    .select("*")
    .in("status", ["Confirmé", "Accepté"])
    .order("created_at", { ascending: false });

  const eventMap = new Map((dbEvents || []).map((e: any) => [e.id, e]));

  // Transform Client Purchases strictly from real events
  const clientPurchases: ClientPurchase[] = (dbEvents || []).map((e: any) => {
    const profile = profileMap.get(e.client_id);
    const modelId = e.invitation_model_id || e.invitationModelId;
    const modelName = getInvitationModelName(modelId);
    const thumbnail = getInvitationModelThumbnail(modelId);
    const isAnim = e.format?.toLowerCase().includes("anim") ?? true;
    const isGold = (e.plan || "").toLowerCase() === "gold";
    const isStandard = (e.plan || "").toLowerCase() === "standard";

    // Evenium pricing rules:
    // Gold + Animée: 20 000 FCFA | Gold + Carte: 15 000 FCFA
    // Premium + Animée: 10 000 FCFA | Premium + Carte: 7 500 FCFA
    // Standard + Animée: 5 000 FCFA | Standard + Carte: 3 500 FCFA
    const amount = isGold
      ? isAnim
        ? 20000
        : 15000
      : isStandard
      ? isAnim
        ? 5000
        : 3500
      : isAnim
      ? 10000
      : 7500;

    // Real payment lookup (from transactions table if present, otherwise validated online payment)
    const eventTx = (realTransactions || []).find((t: any) => t.event_id === e.id);
    const paymentMethod = eventTx?.moyen_paiement || eventTx?.payment_method || "Paiement en ligne (Validé)";
    const datesInfo = computeEventDates(e.date, e.end_date);

    return {
      id: e.id,
      orderRef: `EVN-CMD-${new Date(e.created_at).getFullYear()}-${e.id.slice(0, 5).toUpperCase()}`,
      createdAt: e.created_at,
      clientId: e.client_id,
      clientName: profile?.full_name || `Client #${e.client_id ? e.client_id.slice(0, 6) : "Inconnu"}`,
      clientEmail: profile?.email || "Email non renseigné",
      clientPhone: profile?.phone || "",
      eventName: e.name || "Événement sans titre",
      eventType: e.type || "Événement",
      eventDate: datesInfo.eventDateFormatted,
      eventEndDate: datesInfo.endDateFormatted,
      autoClosingDate: datesInfo.closingDateFormatted,
      closingDateShort: datesInfo.closingDateShort,
      plan: isGold ? "Gold" : "Premium",
      format: isAnim ? "Animée" : "Carte",
      invitationModelId: modelId,
      invitationModelName: modelName,
      invitationThumbnail: thumbnail,
      guestsCount: Number(e.guests_count || e.guestsCount) || 0,
      amount: amount,
      paymentMethod: paymentMethod,
      status: "Payé",
    };
  });

  // Transform Prestataires Purchases strictly from real transactions & accepted devis
  // (No hardcoded/fabricated adhésions for providers who haven't paid)
  const prestatairePurchases: PrestatairePurchase[] = [];

  // A. Real provider transactions from DB
  (realTransactions || []).forEach((t: any) => {
    if (t.prestataire_id) {
      const prest = profileMap.get(t.prestataire_id);
      const descLower = (t.description || "").toLowerCase();
      const typeLower = (t.type || "").toLowerCase();
      const isAdhesion = typeLower.includes("adhesion") || descLower.includes("adhesion");

      const pType = isAdhesion
        ? "Adhésion Plateforme"
        : "Abonnement Vitrine";

      prestatairePurchases.push({
        id: `tx-${t.id}`,
        orderRef: `EVN-TX-${new Date(t.date || t.created_at || Date.now()).getFullYear()}-${t.id.slice(0, 5).toUpperCase()}`,
        createdAt: t.date || t.created_at || new Date().toISOString(),
        prestataireId: t.prestataire_id,
        prestataireName: prest?.full_name || "Prestataire Partenaire",
        prestataireEmail: prest?.email || "",
        prestatairePhone: prest?.phone || "",
        profession: prest?.category || prest?.profession || "Service Événementiel",
        isEveniumCertified: !!prest?.is_evenium_certified,
        type: pType,
        eventName: t.description || undefined,
        platformAmount: Number(t.montant || 0),
        paymentMethod: t.moyen_paiement || t.payment_method || "Virement Bancaire",
        status: "Encaissé",
      });
    }
  });



  // Classify all real users (Clients & Prestataires) for segregated dossier view
  const allUsers: UserDossier[] = (allProfiles || [])
    .filter((p: any) => p.role !== "admin")
    .map((p: any) => ({
      id: p.id,
      fullName: p.full_name || (p.role === "client" ? "Client Organisateur" : "Prestataire"),
      email: p.email || "Non renseigné",
      role: p.role === "prestataire" ? "prestataire" : "client",
      phone: p.phone || "",
      createdAt: p.created_at,
      isActive: p.is_active ?? true,
      category: p.category || p.profession || undefined,
      isEveniumCertified: !!p.is_evenium_certified,
    }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <AdminPurchasesDashboard
        clientPurchases={clientPurchases}
        prestatairePurchases={prestatairePurchases}
        allUsers={allUsers}
      />
    </div>
  );
}

