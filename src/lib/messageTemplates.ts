import { createClient } from "@/utils/supabase/client";

export type MessageTone = "formel" | "chaleureux" | "court" | "tendre";

export interface MessageTemplate {
  id: string;
  event_type: string;
  sub_type?: string | null;
  tone: MessageTone;
  body: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateVariables {
  prenom_invite?: string;
  prenoms_hotes?: string;
  date?: string;
  heure?: string;
  lieu?: string;
  lien?: string;
  [key: string]: string | undefined;
}

/**
 * 13 messages de départ requis par la charte Evenium.
 * Disponibles immédiatement sans attendre l'exécution de la migration SQL.
 */
export const SEED_MESSAGE_TEMPLATES: MessageTemplate[] = [
  // 1. MARIAGE — formel
  {
    id: "seed-mariage-formel",
    event_type: "mariage",
    sub_type: null,
    tone: "formel",
    body: "Bonjour {prenom_invite}, nous avons l'honneur de vous convier au mariage de {prenoms_hotes}, le {date} à {lieu}. Votre invitation vous attend ici : {lien}",
    is_active: true,
  },
  // 2. MARIAGE — chaleureux
  {
    id: "seed-mariage-chaleureux",
    event_type: "mariage",
    sub_type: null,
    tone: "chaleureux",
    body: "{prenom_invite}, le grand jour approche ! {prenoms_hotes} seraient ravis de vous compter parmi eux. Découvrez votre invitation : {lien} 💍",
    is_active: true,
  },
  // 3. BAPTÊME — formel
  {
    id: "seed-bapteme-formel",
    event_type: "baptême",
    sub_type: null,
    tone: "formel",
    body: "Bonjour {prenom_invite}, la famille {prenoms_hotes} a la joie de vous inviter au baptême de leur enfant, le {date}. Votre invitation : {lien}",
    is_active: true,
  },
  // 4. BAPTÊME — chaleureux
  {
    id: "seed-bapteme-chaleureux",
    event_type: "baptême",
    sub_type: null,
    tone: "chaleureux",
    body: "Une petite merveille est arrivée ! {prenoms_hotes} vous invitent à célébrer son baptême le {date}. Tous les détails ici : {lien} 👶",
    is_active: true,
  },
  // 5. ANNIVERSAIRE — chaleureux
  {
    id: "seed-anniversaire-chaleureux",
    event_type: "anniversaire",
    sub_type: null,
    tone: "chaleureux",
    body: "{prenom_invite}, on fête l'anniversaire de {prenoms_hotes} le {date} et ce ne sera pas pareil sans toi ! Ton invitation : {lien} 🎉",
    is_active: true,
  },
  // 6. ANNIVERSAIRE — court
  {
    id: "seed-anniversaire-court",
    event_type: "anniversaire",
    sub_type: null,
    tone: "court",
    body: "Tu es invité·e ! Anniversaire de {prenoms_hotes}, le {date}. Infos et réponse : {lien}",
    is_active: true,
  },
  // 7. CONFÉRENCE — formel
  {
    id: "seed-conference-formel",
    event_type: "conférence",
    sub_type: null,
    tone: "formel",
    body: "Bonjour, vous êtes cordialement invité·e à notre événement du {date} à {lieu}. Merci de confirmer votre présence en indiquant votre nom ici : {lien}",
    is_active: true,
  },
  // 8. CONFÉRENCE — court
  {
    id: "seed-conference-court",
    event_type: "conférence",
    sub_type: null,
    tone: "court",
    body: "Invitation personnelle : événement du {date}. Confirmez votre présence ici : {lien}",
    is_active: true,
  },
  // 9. VŒUX Korité / Tabaski — chaleureux
  {
    id: "seed-voeux-fetes",
    event_type: "vœux",
    sub_type: "Korité / Tabaski",
    tone: "chaleureux",
    body: "{prenom_invite}, en ce jour béni, {prenoms_hotes} vous souhaitent paix, santé et baraka. Une petite surprise vous attend ici : {lien} 🌙",
    is_active: true,
  },
  // 10. VŒUX Nouvel An — chaleureux
  {
    id: "seed-voeux-nouvelan",
    event_type: "vœux",
    sub_type: "Nouvel An",
    tone: "chaleureux",
    body: "Bonne et heureuse année {prenom_invite} ! Que cette année vous apporte joie et réussite. Nos vœux en images : {lien} ✨",
    is_active: true,
  },
  // 11. MOTS DOUX couple — tendre
  {
    id: "seed-motsdoux-couple",
    event_type: "mots doux",
    sub_type: "couple",
    tone: "tendre",
    body: "Pour toi, mon cœur… j'ai préparé quelque chose rien que pour toi : {lien} ❤️",
    is_active: true,
  },
  // 12. MOTS DOUX amis — chaleureux
  {
    id: "seed-motsdoux-amis",
    event_type: "mots doux",
    sub_type: "amis",
    tone: "chaleureux",
    body: "Juste un petit mot pour te dire à quel point tu comptes pour moi. Ouvre ceci : {lien} 💛",
    is_active: true,
  },
  // 13. MOTS DOUX famille — tendre
  {
    id: "seed-motsdoux-famille",
    event_type: "mots doux",
    sub_type: "famille",
    tone: "tendre",
    body: "Parce qu'on ne le dit pas assez : merci d'être là. Un message pour toi : {lien} 🌸",
    is_active: true,
  },
];

/**
 * Normalise un type d'événement vers l'une des clés reconnues :
 * 'mariage' | 'baptême' | 'anniversaire' | 'conférence' | 'vœux' | 'mots doux'
 */
export function normalizeEventType(raw?: string | null): string {
  if (!raw) return "mariage";
  const s = raw.toLowerCase().trim();
  if (s.includes("mariage")) return "mariage";
  if (s.includes("bapt") || s.includes("naissance")) return "baptême";
  if (s.includes("anniv") || s.includes("birthday")) return "anniversaire";
  if (s.includes("conf") || s.includes("sém") || s.includes("sem") || s.includes("gala") || s.includes("prof")) return "conférence";
  if (s.includes("vœu") || s.includes("voeu") || s.includes("korit") || s.includes("tabaski") || s.includes("noël") || s.includes("noel") || s.includes("fête") || s.includes("fete")) return "vœux";
  if (s.includes("mot") || s.includes("doux") || s.includes("couple") || s.includes("romance") || s.includes("amour")) return "mots doux";
  return s;
}

/**
 * Nettoie la ponctuation grammaticale lorsqu'une variable optionnelle est vide.
 * Exemples :
 * - "Bonjour {prenom_invite}," avec prénom vide => "Bonjour," (et non "Bonjour ,")
 * - "le {date} à {lieu}" avec lieu vide => "le {date}" (et non "le {date} à .")
 */
export function cleanPunctuation(text: string): string {
  return text
    // "Bonjour ," ou "Bonjour  ," -> "Bonjour,"
    .replace(/\s+([,;:!?])/g, "$1")
    // "à ." ou "à ," ou "le ." en fin de proposition
    .replace(/\s+(à|au|en|le)\s*([,;:!?.]|$)/gi, "$2")
    // Double espaces
    .replace(/[ \t]{2,}/g, " ")
    // Début de phrase avec virgule
    .replace(/^\s*,\s*/g, "")
    // Nettoyage des lignes
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .trim();
}

/**
 * Remplace automatiquement les variables dans le template en respectant les règles métier :
 * - baptême : ne jamais afficher le prénom du bébé dans le message.
 * - conférence : l'invitation est sans nom (pas de prenom_invite), l'invité saisit son nom sur la page.
 * - phrase grammaticalement correcte si une variable est vide.
 */
export function renderMessageTemplate(
  body: string,
  vars: TemplateVariables,
  eventType?: string
): string {
  const normType = normalizeEventType(eventType);
  let rendered = body;

  // Règle 1 : Conférence = pas de {prenom_invite}
  const isConference = normType === "conférence";
  const guestName = isConference ? "" : (vars.prenom_invite?.trim() || "");

  // Règle 2 : Baptême = jamais le prénom du bébé
  // (prenoms_hotes représente la famille ou les parents)
  const hostNames = vars.prenoms_hotes?.trim() || "nous";
  const dateStr = vars.date?.trim() || "";
  const timeStr = vars.heure?.trim() || "";
  const venueStr = vars.lieu?.trim() || "";
  const linkStr = vars.lien?.trim() || "https://evenium.com/invite/votre-lien";

  // Remplacement des variables
  rendered = rendered.replace(/{prenom_invite}/g, guestName);
  rendered = rendered.replace(/{prenoms_hotes}/g, hostNames);
  rendered = rendered.replace(/{date}/g, dateStr);
  rendered = rendered.replace(/{heure}/g, timeStr);
  rendered = rendered.replace(/{lieu}/g, venueStr);
  rendered = rendered.replace(/{lien}/g, linkStr);

  // Nettoyage de ponctuation
  return cleanPunctuation(rendered);
}

/**
 * Charge tous les modèles de messages actifs pour un type donné
 * (combine la base Supabase et les graines de secours).
 */
export async function fetchMessageTemplates(eventType?: string): Promise<MessageTemplate[]> {
  const norm = normalizeEventType(eventType);
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("message_templates")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      // Filtrer par type d'événement si précisé
      return data.filter((t: MessageTemplate) => {
        if (!norm) return true;
        return normalizeEventType(t.event_type) === norm;
      });
    }
  } catch {
    // En cas d'erreur de requête ou table absente, fallback sur les graines
  }

  // Fallback graines
  return SEED_MESSAGE_TEMPLATES.filter((t) => {
    if (!norm) return true;
    return normalizeEventType(t.event_type) === norm;
  });
}
