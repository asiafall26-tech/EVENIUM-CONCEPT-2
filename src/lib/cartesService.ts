import { createClient } from "@/utils/supabase/client";

export type CardCategoryType = "voeu" | "mot_doux" | "invitation_couple";

export interface VirtualCard {
  id: string; // ex: 'c_abc12345'
  type: CardCategoryType;
  occasionId: string;
  occasionName: string;
  templateId: string;
  senderName: string;
  recipientName: string;
  kicker: string;
  title: string;
  message: string;
  music?: string;
  sealColor?: "gold" | "ruby" | "emerald" | "pearl" | "sapphire";
  paperTheme?: "ivory" | "parchment" | "rose" | "dark_velvet";
  photoUrl?: string;
  
  // Champs spécifiques aux Invitations Couple:
  rendezVousDate?: string;
  rendezVousTime?: string;
  rendezVousPlace?: string;
  dressCode?: string;
  partnerResponse?: "pending" | "accepted" | "declined";
  partnerResponseNote?: string;
  
  // Données de l'acheteur & Traçabilité:
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  amount: number;
  paymentMethod: "wave" | "om" | "card";
  paymentStatus: "paid";
  createdAt: string;
}

const STORAGE_KEY = "evenium_virtual_cards_vault";

// Récupérer toutes les cartes sauvegardées localement
export function getLocalVaultCards(): VirtualCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Erreur lecture vault local", e);
    return [];
  }
}

// Sauvegarder dans le coffre-fort local
export function saveToLocalVault(card: VirtualCard) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalVaultCards();
    const filtered = current.filter((c) => c.id !== card.id);
    filtered.unshift(card);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn("Erreur sauvegarde vault local", e);
  }
}

// Enregistrer un achat complet (Supabase + Local Vault)
export async function registerPurchasedCard(card: VirtualCard): Promise<{ success: boolean; card: VirtualCard }> {
  // 1. Sauvegarde locale immédiate (zéro risque de perte)
  saveToLocalVault(card);

  // 2. Sauvegarde Supabase
  try {
    const supabase = createClient();
    
    // Vérifier si l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser();

    // Insertion dans la table cartes_virtuelles
    const { error: insertError } = await supabase.from("cartes_virtuelles").insert([
      {
        id: card.id,
        user_id: user?.id ?? null,
        type: card.type,
        occasion_id: card.occasionId,
        occasion_name: card.occasionName,
        template_id: card.templateId,
        sender_name: card.senderName,
        recipient_name: card.recipientName,
        kicker: card.kicker,
        title: card.title,
        message: card.message,
        music: card.music,
        photo_url: card.photoUrl,
        rendez_vous_date: card.rendezVousDate,
        rendez_vous_time: card.rendezVousTime,
        rendez_vous_place: card.rendezVousPlace,
        dress_code: card.dressCode,
        partner_response: card.partnerResponse ?? "pending",
        buyer_name: card.buyerName,
        buyer_email: card.buyerEmail,
        buyer_phone: card.buyerPhone,
        amount: card.amount,
        payment_method: card.paymentMethod,
        payment_status: "paid",
        created_at: card.createdAt,
      }
    ]);

    if (insertError) {
      console.warn("Notice Supabase (table non migrée ou fallback) :", insertError.message);
    }

    // Enregistrement de la transaction SaaS Evenium
    try {
      await supabase.from("transactions").insert([
        {
          libelle: `Vente ${card.type === "voeu" ? "Vœu" : card.type === "mot_doux" ? "Mot Doux" : "Invitation Couple"} (${card.title})`,
          montant: card.amount,
          type: "revenu",
          date: new Date().toISOString()
        }
      ]);
    } catch (tErr) {
      // ignore si table transactions inexistante
    }

  } catch (err) {
    console.warn("Supabase sync warning:", err);
  }

  return { success: true, card };
}

// Récupérer une carte par son ID
export async function getCardById(id: string): Promise<VirtualCard | null> {
  // 1. Vérifier en base Supabase
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("cartes_virtuelles")
      .select("*")
      .eq("id", id)
      .single();

    if (data && !error) {
      return {
        id: data.id,
        type: data.type,
        occasionId: data.occasion_id,
        occasionName: data.occasion_name,
        templateId: data.template_id,
        senderName: data.sender_name,
        recipientName: data.recipient_name,
        kicker: data.kicker,
        title: data.title,
        message: data.message,
        music: data.music,
        photoUrl: data.photo_url,
        rendezVousDate: data.rendez_vous_date,
        rendezVousTime: data.rendez_vous_time,
        rendezVousPlace: data.rendez_vous_place,
        dressCode: data.dress_code,
        partnerResponse: data.partner_response,
        partnerResponseNote: data.partner_response_note,
        buyerName: data.buyer_name,
        buyerEmail: data.buyer_email,
        buyerPhone: data.buyer_phone,
        amount: data.amount,
        paymentMethod: data.payment_method,
        paymentStatus: data.payment_status,
        createdAt: data.created_at,
      };
    }
  } catch (err) {
    console.warn("Supabase fetch fallback:", err);
  }

  // 2. Fallback sur le coffre-fort local du navigateur
  const localCards = getLocalVaultCards();
  const match = localCards.find((c) => c.id === id);
  if (match) return match;

  return null;
}

// Rechercher des cartes par email ou téléphone (pour la page de récupération)
export async function searchCardsByContact(query: string): Promise<VirtualCard[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const results: VirtualCard[] = [];

  // 1. Recherche Supabase
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("cartes_virtuelles")
      .select("*")
      .or(`buyer_email.ilike.%${cleanQuery}%,buyer_phone.ilike.%${cleanQuery}%`)
      .order("created_at", { ascending: false });

    if (data && !error) {
      for (const d of data) {
        results.push({
          id: d.id,
          type: d.type,
          occasionId: d.occasion_id,
          occasionName: d.occasion_name,
          templateId: d.template_id,
          senderName: d.sender_name,
          recipientName: d.recipient_name,
          kicker: d.kicker,
          title: d.title,
          message: d.message,
          music: d.music,
          photoUrl: d.photo_url,
          rendezVousDate: d.rendez_vous_date,
          rendezVousTime: d.rendez_vous_time,
          rendezVousPlace: d.rendez_vous_place,
          dressCode: d.dress_code,
          partnerResponse: d.partner_response,
          partnerResponseNote: d.partner_response_note,
          buyerName: d.buyer_name,
          buyerEmail: d.buyer_email,
          buyerPhone: d.buyer_phone,
          amount: d.amount,
          paymentMethod: d.payment_method,
          paymentStatus: d.payment_status,
          createdAt: d.created_at,
        });
      }
    }
  } catch (err) {
    console.warn("Search supabase error:", err);
  }

  // 2. Fusionner avec le stockage local
  const localCards = getLocalVaultCards();
  for (const c of localCards) {
    const matchEmail = c.buyerEmail?.toLowerCase().includes(cleanQuery);
    const matchPhone = c.buyerPhone?.includes(cleanQuery);
    if ((matchEmail || matchPhone) && !results.some((r) => r.id === c.id)) {
      results.push(c);
    }
  }

  return results;
}

// Mettre à jour la réponse du partenaire (pour les invitations couple)
export async function updatePartnerResponse(
  cardId: string, 
  response: "accepted" | "declined", 
  note?: string
): Promise<boolean> {
  // Mettre à jour localement
  const localCards = getLocalVaultCards();
  const card = localCards.find((c) => c.id === cardId);
  if (card) {
    card.partnerResponse = response;
    if (note) card.partnerResponseNote = note;
    saveToLocalVault(card);
  }

  // Mettre à jour Supabase
  try {
    const supabase = createClient();
    await supabase
      .from("cartes_virtuelles")
      .update({
        partner_response: response,
        partner_response_note: note ?? null,
      })
      .eq("id", cardId);
    return true;
  } catch (e) {
    console.warn("Update response error:", e);
    return true;
  }
}

