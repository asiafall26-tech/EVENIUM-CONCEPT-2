/**
 * Générateur et suggestions de réponses aux vœux / mots doux reçus des invités
 * pour le Dashboard Organisateur.
 */

export interface WishReplyParams {
  eventName?: string;
  celebrantsNames?: string;
  guestName?: string;
  originalWish?: string;
  eventType?: string;
  tone?: "chaleureux" | "religieux" | "reconnaissant" | "court";
}

/**
 * Extrait le prénom ou nom d'appel usuel de l'invité
 */
export function getGuestFirstName(fullName?: string): string {
  if (!fullName || !fullName.trim()) return "Cher(e) invité(e)";
  const clean = fullName.trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0];
  // Si le premier mot est un titre (M., Mme, Dr, etc.)
  if (/^(m\.|mme|mlle|dr|me|mr|monsieur|madame)$/i.test(parts[0])) {
    return parts.slice(0, 2).join(" ");
  }
  return parts[0];
}

/**
 * Extrait le nom des hôtes / mariés
 */
export function getCelebrantsSignature(params: WishReplyParams): string {
  if (params.celebrantsNames && params.celebrantsNames.trim()) {
    return params.celebrantsNames.trim();
  }
  if (params.eventName && params.eventName.trim()) {
    // Si l'événement contient "Mariage de A & B" ou "A & B"
    const cleaned = params.eventName
      .replace(/^(mariage\s+de\s+|mariage\s+|anniversaire\s+de\s+|bapt[êe]me\s+de\s+|c[ée]l[ée]bration\s+de\s+)/i, "")
      .trim();
    if (cleaned.length > 0 && cleaned.length < 50) {
      return cleaned;
    }
  }
  return "Les Mariés";
}

/**
 * Génère le texte de réponse personnalisé
 */
export function generateWishReply(params: WishReplyParams): string {
  const firstName = getGuestFirstName(params.guestName);
  const signature = getCelebrantsSignature(params);
  const tone = params.tone || "chaleureux";

  switch (tone) {
    case "religieux":
      return (
        `As-salam Aleykoum wa rahmatoullah ${firstName} 🤍\n\n` +
        `Barak'Allahu fik pour vos vœux si précieux et vos magnifiques duas qui nous vont droit au cœur. ` +
        `Votre présence spirituelle et votre bienveillance illuminent ce moment si important.\n\n` +
        `Que le Tout-Puissant vous comble de Ses grâces, préserve votre foyer et vous accorde une immense paix.\n\n` +
        `Bien fraternellement,\n${signature} 🤍`
      );

    case "reconnaissant":
      return (
        `Cher(e) ${firstName} ✨\n\n` +
        `Nous avons été profondément émus par votre tendre message. Un immense merci du fond du cœur d'avoir pris le temps de nous adresser des mots aussi touchants.\n\n` +
        `Partager ce moment précieux avec des personnes aussi exceptionnelles que vous donne tout son sens à notre célébration.\n\n` +
        `Avec toute notre gratitude et notre affection,\n${signature} 🤍`
      );

    case "court":
      return (
        `Bonjour ${firstName} 💕\n\n` +
        `Mille mercis pour cette adorable attention et vos mots chaleureux qui nous font très plaisir !\n\n` +
        `Hâte de partager ce beau moment avec vous.\n\n` +
        `Chaleureusement,\n${signature} 🤍`
      );

    case "chaleureux":
    default:
      return (
        `Bonjour ${firstName} 🤍\n\n` +
        `Mille mercis pour vos magnifiques vœux qui nous touchent énormément ! Vos mots pleins de tendresse et d'amour nous vont droit au cœur.\n\n` +
        `Votre affection est un véritable cadeau pour nous en cette période si magique.\n\n` +
        `Avec toute notre affection,\n${signature} 🤍`
      );
  }
}

/**
 * Renvoie une liste de suggestions pour que l'hôte choisisse en 1 clic
 */
export function getWishReplyPresets(params: WishReplyParams): Array<{
  id: "chaleureux" | "religieux" | "reconnaissant" | "court";
  label: string;
  icon: string;
  preview: string;
  text: string;
}> {
  return [
    {
      id: "chaleureux",
      label: "Chaleureux & Ému",
      icon: "🤍",
      preview: "Mille mercis pour vos vœux qui nous touchent énormément…",
      text: generateWishReply({ ...params, tone: "chaleureux" }),
    },
    {
      id: "religieux",
      label: "Bénédiction & Duas",
      icon: "🕌",
      preview: "Barak'Allahu fik pour vos duas et vœux précieux…",
      text: generateWishReply({ ...params, tone: "religieux" }),
    },
    {
      id: "reconnaissant",
      label: "Ému & Reconnaissant",
      icon: "✨",
      preview: "Nous avons été profondément émus par votre tendre message…",
      text: generateWishReply({ ...params, tone: "reconnaissant" }),
    },
    {
      id: "court",
      label: "Court & Doux",
      icon: "💌",
      preview: "Merci pour cette adorable attention qui nous fait très plaisir…",
      text: generateWishReply({ ...params, tone: "court" }),
    },
  ];
}
