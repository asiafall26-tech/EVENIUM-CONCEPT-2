/**
 * Messages d'accompagnement chic pour les partages WhatsApp, SMS et Réseaux.
 * Adaptés sur-mesure à chaque type d'invitation événementielle, vœux, mots doux et espace couple.
 */

export type AccompanimentTone = "chaleureux" | "prestige" | "court" | "poetique" | "religieux";

export interface AccompanimentParams {
  /** Service ou format principal : animée, carte, voeu, mot_doux, couple */
  serviceType?: string;
  /** Type d'événement : Mariage, Anniversaire, Baptême, Gala, etc. */
  eventType?: string;
  /** Nom de l'événement ou de l'invitation (ex: "Mariage d'Aïcha & Ibrahima", "Birthday Story") */
  eventName?: string;
  /** Prénom ou nom de l'invité destinataire (optionnel) */
  guestName?: string;
  /** Date formatée (optionnel) */
  dateFormatted?: string;
  /** Heure (optionnel) */
  time?: string;
  /** Lieu (optionnel) */
  location?: string;
  /** Lien de l'invitation (optionnel, si omis un texte introductif est généré) */
  link?: string;
  /** Ton souhaité */
  tone?: AccompanimentTone;
  /** Raccourcis booléens */
  isVoeu?: boolean;
  isMotDoux?: boolean;
  isCouple?: boolean;
}

export interface AccompanimentSuggestion {
  id: string;
  label: string;
  icon: string;
  tone: AccompanimentTone;
  text: string;
}

/**
 * Normalise un type d'événement pour le routing des messages
 */
function normalizeEvent(evt?: string): string {
  if (!evt) return "";
  return evt.toLowerCase().trim();
}

/**
 * Génère le message d'accompagnement adapté selon le service, l'événement et le ton.
 */
export function generateAccompanimentMessage(params: AccompanimentParams): string {
  const {
    serviceType = "",
    eventType = "",
    eventName = "notre événement d'exception",
    guestName,
    dateFormatted,
    time,
    location,
    link,
    tone = "chaleureux",
    isVoeu = false,
    isMotDoux = false,
    isCouple = false,
  } = params;

  const sType = serviceType.toLowerCase().trim();
  const eType = normalizeEvent(eventType);
  const linkSuffix = link ? `\n\n${link}` : "";
  const whenText = dateFormatted ? (time && time !== "À définir" ? `${dateFormatted} à ${time}` : dateFormatted) : "";
  const whereText = location && location !== "À définir" ? location : "";

  const salutation = guestName ? `Bonjour ${guestName} !` : "Bonjour !";
  const salutationPrestige = guestName ? `Cher(e) ${guestName},` : "Cher(e) invité(e) d'honneur,";

  // ========================================================================
  // 1. LES MOTS DOUX (Lettre d'amour confidentielle scellée au cachet de cire)
  // ========================================================================
  if (isMotDoux || sType === "mot_doux" || sType === "mots_doux" || eType.includes("mot doux")) {
    if (tone === "prestige") {
      return (
        `💌 *CONFIDENTIEL · UNE LETTRE RIEN QUE POUR TOI* ⚜️\n\n` +
        `Mon amour,\n\n` +
        `J'ai fait déposer des mots précieux et intimes dans une lettre d'exception scellée au cachet de cire.\n` +
        `Découvre ce que mon cœur a préparé pour toi en ouvrant ton sceau numérique :` +
        linkSuffix
      );
    }
    if (tone === "court") {
      return (
        `💌 *UN MOT DOUX POUR TOI...* ❤️\n\n` +
        `Un petit sourire pour illuminer ta journée. J'ai déposé une douce pensée secrète pour toi ici :` +
        linkSuffix
      );
    }
    if (tone === "poetique") {
      return (
        `🕊️ *QUELQUES MOTS DÉPOSÉS AU CREUX DE TON CŒUR...* ✨\n\n` +
        `Parce que chaque instant à tes côtés est un poème sans fin, ouvre cette lettre confidentielle qui t'est tendrement dédiée :` +
        linkSuffix
      );
    }
    // Chaleureux par défaut
    return (
      `💌 Mon cœur, j'ai préparé quelque chose de doux, délicat et secret rien que pour toi...\n` +
      `Brise le cachet de cire et découvre ta lettre scellée en cliquant sur ce lien :` +
      linkSuffix
    );
  }

  // ========================================================================
  // 2. ESPACE COUPLE (Invitations tête-à-tête, rendez-vous secrets, dîners)
  // ========================================================================
  if (isCouple || sType === "couple" || eType.includes("couple")) {
    if (eType.includes("dîner") || eType.includes("diner")) {
      return (
        `🕯️ *DÎNER EN TÊTE-À-TÊTE · NOTRE SOIRÉE SECRÈTE* 🥂\n\n` +
        `Ce soir, le monde extérieur s'efface pour nous deux. J'ai imaginé notre dîner romantique avec une ambiance sur-mesure.\n` +
        `Découvre notre invitation secrète et tous les détails ici :` +
        linkSuffix
      );
    }
    if (eType.includes("brunch")) {
      return (
        `🥐 *PAUSE DOUCEUR EN AMOUREUX · BRUNCH SIGNATURE* ☕✨\n\n` +
        `Un moment gourmand, complice et romantique rien que nous deux. Découvre l'invitation à notre tête-à-tête :` +
        linkSuffix
      );
    }
    if (eType.includes("demande")) {
      return (
        `💍 *UN INSTANT SUSPENDU DANS NOTRE HISTOIRE...* ✨🤍\n\n` +
        `Une promesse, un regard, un moment unique... Ouvre notre invitation confidentielle pour découvrir ce qui nous attend :` +
        linkSuffix
      );
    }
    if (tone === "prestige") {
      return (
        `🥂 *INVITATION SECRÈTE D'EXCEPTION · TÊTE-À-TÊTE ROMANTIQUE* ⚜️\n\n` +
        `Mon amour, j'ai réservé un moment hors du temps rien que pour nous deux.\n` +
        `Accède à notre invitation confidentielle scénarisée ici :` +
        linkSuffix
      );
    }
    if (tone === "court") {
      return (
        `🥂 *RENDEZ-VOUS SECRET !* ❤️✨\n\n` +
        `Une soirée d'exception rien que nous deux se prépare... Découvre l'invitation en un clic :` +
        linkSuffix
      );
    }
    // Chaleureux par défaut
    return (
      `🥂 Une soirée d'exception, les yeux dans les yeux, rien que nous deux...\n` +
      `J'ai imaginé notre rendez-vous magique. Découvre notre invitation secrète en cliquant sur le lien :` +
      linkSuffix
    );
  }

  // ========================================================================
  // 3. VŒUX & CÉLÉBRATIONS (Cartes interactives de félicitations et vœux)
  // ========================================================================
  if (isVoeu || sType === "voeu" || sType === "voeux") {
    // Vœux d'Anniversaire
    if (eType.includes("anniversaire")) {
      if (tone === "prestige") {
        return (
          `🎂 *VŒUX D'EXCEPTION · JUBILÉ D'OR* ⚜️\n\n` +
          `${salutationPrestige}\n\n` +
          `En ce jour mémorable qui célèbre votre nouvelle année de vie, recevez mes vœux les plus distingués de prospérité, de grâce et d'accomplissements éclatants.\n` +
          `Découvrez votre carte interactive personnalisée d'exception :` +
          linkSuffix
        );
      }
      if (tone === "court") {
        return (
          `🎂 *JOYEUX ANNIVERSAIRE !* 🎉🥳\n\n` +
          `Plein d'amour, de sourires et de merveilleuses réussites pour cette nouvelle année ! Ouvre ta carte de vœux ici :` +
          linkSuffix
        );
      }
      return (
        `🎂 *JOYEUX ANNIVERSAIRE !* ✨🎉\n\n` +
        `${salutation}\n\n` +
        `Une pensée toute particulière pour toi en ce jour précieux. Que cette nouvelle année t'apporte bonheur infini, santé et succès.\n` +
        `Découvre tes vœux d'exception personnalisés en cliquant sur le lien :` +
        linkSuffix
      );
    }

    // Vœux de Fin d'année / Nouvel an / Noël
    if (eType.includes("fin d'année") || eType.includes("noël") || eType.includes("noel") || eType.includes("nouvel an")) {
      if (tone === "prestige") {
        return (
          `⚜️ *VŒUX D'OR & LUMIÈRES DE LA NOUVELLE ANNÉE* 🥂✨\n\n` +
          `${salutationPrestige}\n\n` +
          `Au seuil de cette nouvelle année, recevez nos vœux les plus chaleureux de santé éclatante, de prospérité durable et de réussites éclatantes.\n` +
          `Découvrez notre carte de vœux d'exception en cliquant sur le lien :` +
          linkSuffix
        );
      }
      if (tone === "court") {
        return (
          `🌟 *BONNE ET HEUREUSE ANNÉE !* 🥂🎉\n\n` +
          `Que 2026 t'apporte bonheur, joie et plein de succès ! Ouvre ta carte de vœux festive ici :` +
          linkSuffix
        );
      }
      return (
        `✨ *MEILLEURS VŒUX DE NOUVELLE ANNÉE !* 🥂🌟\n\n` +
        `${salutation}\n\n` +
        `Que cette nouvelle année s'ouvre sur d'infinies opportunités, la joie au cœur et la réalisation de tes plus grands rêves.\n` +
        `Découvre ma carte de vœux animée créée spécialement pour toi :` +
        linkSuffix
      );
    }

    // Vœux de Graduation / Diplôme / Réussite
    if (eType.includes("graduation") || eType.includes("diplôme") || eType.includes("diplome") || eType.includes("réussite") || eType.includes("reussite")) {
      if (tone === "prestige") {
        return (
          `🎓 *FÉLICITATIONS OFFICIELLES D'HONNEUR · EXCELLENCE ACADÉMIQUE* ⚜️\n\n` +
          `${salutationPrestige}\n\n` +
          `C'est avec une immense fierté que nous saluons l'aboutissement brillant de vos études et ce diplôme mérité. Que ce succès ouvre la voie à une carrière éclatante.\n` +
          `Découvrez votre carte de félicitations d'exception personnalisée :` +
          linkSuffix
        );
      }
      if (tone === "court") {
        return (
          `🎓 *CHAPEAU L'ARTISTE ! FÉLICITATIONS !* 🥳🎉\n\n` +
          `Diplôme en poche ! Tellement fier(e) de ton parcours et de ta réussite. Ouvre ta carte de vœux ici :` +
          linkSuffix
        );
      }
      return (
        `🎓 *FÉLICITATIONS POUR TA GRADUATION !* 🌟🎉\n\n` +
        `${salutation}\n\n` +
        `Un parcours exemplaire, des efforts récompensés et un avenir qui s'annonce grandiose ! Bravo pour cette magnifique réussite.\n` +
        `Découvre ta carte de félicitations interactive créée spécialement pour toi :` +
        linkSuffix
      );
    }

    // Vœux de Naissance / Baby Shower
    if (eType.includes("naissance") || eType.includes("bébé") || eType.includes("bebe")) {
      return (
        `🍼 *BIENVENUE AU MONDE PETIT ANGE !* 🌸✨\n\n` +
        `${salutation}\n\n` +
        `Félicitations chaleureuses aux heureux parents pour l'arrivée de ce magnifique trésor. Plein de tendresse et de bonheur à votre famille.\n` +
        `Découvrez notre carte de vœux animée ici :` +
        linkSuffix
      );
    }

    // Vœux généraux / Félicitations
    if (tone === "prestige") {
      return (
        `⚜️ *VŒUX D'EXCEPTION & CHALEUREUSES FÉLICITATIONS* ⚜️\n\n` +
        `${salutationPrestige}\n\n` +
        `En cet événement marquant, recevez mes vœux les plus sincères et distingués de bonheur, de prospérité et d'accomplissements lumineux.\n` +
        `Découvrez votre carte interactive personnalisée d'exception :` +
        linkSuffix
      );
    }
    if (tone === "court") {
      return (
        `✨ *TOUTES MES FÉLICITATIONS !* 🎉🌟\n\n` +
        `Plein de bonheur et de belles surprises pour cette occasion spéciale ! Ouvre ta carte de vœux ici :` +
        linkSuffix
      );
    }
    return (
      `🌟 *VŒUX CHALEUREUX & CÉLÉBRATION D'EXCEPTION* ✨\n\n` +
      `${salutation}\n\n` +
      `Une pensée toute particulière pour toi en ce jour précieux. Reçois mes vœux les plus sincères de bonheur et de réussite.\n` +
      `Découvre tes vœux personnalisés en cliquant sur le lien :` +
      linkSuffix
    );
  }

  // ========================================================================
  // 4. INVITATIONS ÉVÉNEMENTIELLES SELON LE TYPE D'ÉVÉNEMENT
  // ========================================================================

  // A. Anniversaire de mariage
  if (eType === "anniversaire de mariage" || (eType.includes("anniversaire") && eType.includes("mariage"))) {
    if (tone === "prestige") {
      return (
        `🥂 *CÉLÉBRATION DES NOCES · INVITATION OFFICIELLE D'HONNEUR* ⚜️\n\n` +
        `${salutationPrestige}\n\n` +
        `À l'occasion de la célébration de notre anniversaire de mariage :\n` +
        `👑 *${eventName}*\n` +
        (whenText ? `📅 *${whenText}*\n` : "") +
        (whereText ? `🏛️ *${whereText}*\n` : "") +
        `\nNous avons l'immense honneur de solliciter votre présence pour commémorer ces années d'amour et renouveler nos vœux les plus précieux.\n` +
        `Découvrez votre faire-part interactif et enregistrez votre confirmation en un clic :` +
        linkSuffix
      );
    }
    if (tone === "court") {
      return (
        `🥂 *JOYEUX ANNIVERSAIRE DE MARIAGE ! · SAVE THE DATE* ✨\n\n` +
        `Nous fêtons nos années d'amour et d'union : *${eventName}* !\n` +
        (whenText ? `📅 *${whenText}*\n` : "") +
        (whereText ? `📍 *${whereText}*\n` : "") +
        `\nRetrouvez tous les détails et confirmez votre venue en 1 clic :` +
        linkSuffix
      );
    }
    return (
      `✨ *DES ANNÉES D'AMOUR QUI CONTINUENT DE S'ÉCRIRE...* 🥂💍\n\n` +
      `${salutation}\n\n` +
      `C'est le cœur rempli d'émotion et de gratitude que nous vous convions à célébrer notre anniversaire de mariage :\n` +
      `🕊️ *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nNous avons créé une invitation interactive spécialement pour vous. Découvrez tous les détails et partagez ce grand bonheur avec nous :` +
      linkSuffix
    );
  }

  // B. Mariage, Fiançailles, Demande en mariage
  if (eType === "mariage" || eType === "fiançailles" || eType === "demande en mariage") {
    const cleanEventName = eventName.replace(/^mariage\s*[·:\-]?\s*(de\s*)?/i, "").trim();
    const hostsSign = cleanEventName || eventName;
    const datePhrase = whenText
      ? whenText.toLowerCase().startsWith("ce ") || whenText.toLowerCase().startsWith("le ")
        ? `qui aura lieu ${whenText}`
        : `qui aura lieu ce ${whenText}`
      : "";
    const placePhrase = whereText ? ` à ${whereText}` : "";
    const timeAndPlace = datePhrase ? `, ${datePhrase}${placePhrase}` : placePhrase ? ` à ${whereText}` : "";

    if (tone === "religieux") {
      return (
        `As-salam Aleykoum wa rahmatoullah 🤍\n\n` +
        `C’est avec une immense joie que nous avons l’honneur de vous annoncer notre mariage religieux 🕌${timeAndPlace}.\n\n` +
        `Nous serions très heureux de vous compter parmi nous pour partager ce jour béni. Votre présence et vos duas seront pour nous un précieux cadeau. 🤍\n\n` +
        `Voici votre invitation virtuelle pour découvrir les détails de cette belle journée :\n` +
        (link ? `${link}\n\n` : "\n") +
        `${hostsSign} 💍`
      );
    }
    if (tone === "prestige") {
      return (
        `⚜️ *INVITATION OFFICIELLE D'HONNEUR · UNION ROYALE* ⚜️\n\n` +
        `${salutationPrestige}\n\n` +
        `À l'occasion de la célébration des noces de :\n` +
        `👑 *${hostsSign}*\n` +
        (whenText ? `📅 *${whenText}*\n` : "") +
        (whereText ? `🏛️ *${whereText}*\n` : "") +
        `\nNous avons l'insigne privilège de solliciter l'honneur de votre présence pour célébrer cet instant solennel et mémorable.\n` +
        `Voici votre faire-part officiel pour découvrir le programme et enregistrer votre confirmation :` +
        linkSuffix +
        `\n\n${hostsSign} ⚜️`
      );
    }
    if (tone === "court") {
      return (
        `💍 *ON SE DIT OUI ! · SAVE THE DATE* ✨\n\n` +
        `C’est officiel : nous célébrons le mariage de *${hostsSign}*${timeAndPlace ? ` ${timeAndPlace}` : ""} !\n\n` +
        `Découvrez votre invitation interactive et confirmez votre venue en 1 clic ici :` +
        linkSuffix +
        `\n\n${hostsSign} 💍`
      );
    }
    return (
      `✨ *UNE HISTOIRE D'AMOUR S'ÉCRIT... ET VOUS EN FAITES PARTIE !* 💍\n\n` +
      `${salutation}\n\n` +
      `C’est avec une immense joie et beaucoup d’émotion que nous vous convions à célébrer notre mariage 🥂${timeAndPlace}.\n\n` +
      `Votre présence à nos côtés pour partager ce grand moment de bonheur sera pour nous le plus précieux des cadeaux. ✨\n\n` +
      `Voici votre invitation virtuelle pour découvrir tous les détails et nous confirmer votre présence :` +
      linkSuffix +
      `\n\n${hostsSign} 💍`
    );
  }

  // C. Anniversaire
  if (eType === "anniversaire") {
    if (tone === "prestige") {
      return (
        `⚜️ *RÉCEPTION PRIVÉE · JUBILÉ D'EXCEPTION* 🥂\n\n` +
        `${salutationPrestige}\n\n` +
        `À l'occasion d'une célébration marquante et privilégiée, vous êtes convié(e) d'honneur à la réception donnée pour :\n` +
        `✨ *${eventName}*\n` +
        (whenText ? `📅 *${whenText}*\n` : "") +
        (whereText ? `🏛️ *${whereText}*\n` : "") +
        `\nAccédez à votre invitation interactive officielle et confirmez votre venue via le salon numérique dédié :` +
        linkSuffix
      );
    }
    if (tone === "court") {
      return (
        `⚡ *IT'S PARTY TIME !* 🎂🥳\n\n` +
        `C'est officiel : on se retrouve tous pour fêter *${eventName}* !\n` +
        (whenText ? `📅 *${whenText}*\n` : "") +
        (whereText ? `📍 *${whereText}*\n` : "") +
        `\nVotre invitation interactive et le formulaire de réponse rapide sont juste ici :` +
        linkSuffix
      );
    }
    return (
      `🎂 *UNE NOUVELLE BOUGIE, UNE FÊTE INOUBLIABLE !* ✨\n\n` +
      `${salutation}\n\n` +
      `Parce que les plus beaux moments ne valent que s'ils sont partagés avec les personnes chères, je vous invite chaleureusement à célébrer :\n` +
      `🎉 *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nOuvrez votre invitation interactive pour plonger dans l'ambiance et découvrir toutes les surprises :` +
      linkSuffix
    );
  }

  // D. Baptême, Baby shower
  if (eType === "baptême" || eType === "bapteme" || eType === "baby shower") {
    if (tone === "prestige") {
      return (
        `🕊️ *SOLENNITÉ & BÉNÉDICTION FAMILIALE* ⚜️\n\n` +
        `Chers proches et amis précieux,\n\n` +
        `La famille a l'insigne honneur de solliciter votre présence bienveillante à la cérémonie et réception en l'honneur de :\n` +
        `🌿 *${eventName}*\n` +
        (whenText ? `📅 *${whenText}*\n` : "") +
        (whereText ? `🏛️ *${whereText}*\n` : "") +
        `\nVeuillez consulter votre carton officiel d'honneur et renseigner votre confirmation en toute simplicité :` +
        linkSuffix
      );
    }
    if (tone === "court") {
      return (
        `🍼 *CÉLÉBRATION EN FAMILLE !* ✨👶\n\n` +
        `Nous avons hâte de vous retrouver pour fêter *${eventName}* !\n` +
        (whenText ? `📅 *${whenText}*\n` : "") +
        (whereText ? `📍 *${whereText}*\n` : "") +
        `\nTous les détails et la confirmation en ligne rapide sont ici :` +
        linkSuffix
      );
    }
    return (
      `🕊️ *UN PETIT TRÉSOR, UNE BÉNÉDICTION IMMENSE !* 🌸\n\n` +
      `${salutation}\n\n` +
      `Une nouvelle étoile illumine nos vies. C'est avec une tendresse infinie que nous vous invitons à entourer notre trésor pour :\n` +
      `✨ *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nDécouvrez votre invitation interactive délicatement personnalisée et confirmez votre venue en un instant :` +
      linkSuffix
    );
  }

  // E. Gala
  if (eType === "gala") {
    return (
      `⚜️ *SOIRÉE DE PRESTIGE & GALA D'HONNEUR* 🥂✨\n\n` +
      `${salutationPrestige}\n\n` +
      `Nous avons le privilège exclusif de solliciter votre présence distinguée lors de la prestigieuse réception :\n` +
      `🌟 *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `🏛️ *${whereText}*\n` : "") +
      `\nAccédez à votre invitation d'apparat et validez votre confirmation nominative via ce portail sécurisé :` +
      linkSuffix
    );
  }

  // F. Conférence, Séminaire
  if (eType === "conférence" || eType === "conference") {
    return (
      `🎤 *INVITATION OFFICIELLE PROTOCOLAIRE* 🏛️\n\n` +
      `Madame, Monsieur,\n\n` +
      `Nous avons l'honneur de vous convier à la conférence d'exception :\n` +
      `🌟 *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nVeuillez consulter le programme officiel et enregistrer votre accréditation via ce lien :` +
      linkSuffix
    );
  }

  // G. Fêtes religieuses chrétiennes (Noël, Pâques, Pentecôte, Communion)
  if (eType === "noël" || eType === "noel") {
    return (
      `🎄 *MAGIE DE NOËL & MOMENT DE PARTAGE* ✨🎁\n\n` +
      `${salutation}\n\n` +
      `La féerie de Noël se vit ensemble ! C'est avec une grande joie que nous vous invitons à célébrer :\n` +
      `🌟 *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nDécouvrez votre invitation festive et confirmez votre présence ici :` +
      linkSuffix
    );
  }
  if (eType === "pâques" || eType === "paques") {
    return (
      `🐣 *FÊTE DE PÂQUES · JOIE & ESPÉRANCE* 🌸✨\n\n` +
      `${salutation}\n\n` +
      `Dans la joie du renouveau et du partage, nous vous convions chaleureusement à notre fête de Pâques :\n` +
      `🕊️ *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nDécouvrez votre carton d'invitation et confirmez votre présence :` +
      linkSuffix
    );
  }
  if (eType === "pentecôte" || eType === "pentecote" || eType === "communion") {
    return (
      `🕊️ *CÉLÉBRATION SACRÉE & FERVEUR COMMUNE* ⚜️\n\n` +
      `${salutationPrestige}\n\n` +
      `C'est dans la paix, la foi et l'allégresse que nous vous convions à la sainte célébration de :\n` +
      `✨ *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `⛪ *${whereText}*\n` : "") +
      `\nDécouvrez votre invitation solennelle et partagez cette bénédiction à nos côtés :` +
      linkSuffix
    );
  }

  // H. Célébrations traditionnelles & amicales (Henné time, Yendou, EVJF, Picnic)
  if (eType.includes("henné") || eType.includes("henne")) {
    return (
      `🌿 *HENNE TIME · BEAUTÉ DES TRADITIONS & COMPLICITÉ* 🌸✨\n\n` +
      `${salutation}\n\n` +
      `Entre rires, chants et douceur des traditions, nous vous invitons à partager notre cérémonie de Henné :\n` +
      `💐 *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nDécouvrez l'ambiance et votre invitation personnalisée en un clic :` +
      linkSuffix
    );
  }
  if (eType.includes("yendou")) {
    return (
      `🪘 *YENDOU TRADITIONNEL · ÉLÉGANCE & CONVIVIALITÉ* 🌺\n\n` +
      `${salutation}\n\n` +
      `L'art de recevoir et de célébrer ensemble dans la pure tradition ! Vous êtes cordialement convié(e) à notre Yendou :\n` +
      `✨ *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nOuvrez votre carton officiel pour découvrir le programme et confirmer votre présence :` +
      linkSuffix
    );
  }
  if (eType.includes("jeune fille") || eType.includes("evjf")) {
    return (
      `👑 *ENTERREMENT DE VIE DE JEUNE FILLE · TOP SECRET & FUN* 🥂🥳\n\n` +
      `Alerte générale ! On prépare un EVJF inoubliable pour :\n` +
      `✨ *${eventName}* !\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nDécouvrez le programme exclusif, les surprises et confirmez vite votre place sur ce lien :` +
      linkSuffix
    );
  }
  if (eType.includes("picnic") || eType.includes("pique-nique")) {
    return (
      `🧺 *PICNIC CHIC · NATURE & MOMENT PARTAGÉ* ☀️🌿\n\n` +
      `${salutation}\n\n` +
      `Un rayon de soleil, de la bonne humeur et de délicieuses saveurs en plein air pour fêter :\n` +
      `🍃 *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nDécouvrez tous les détails et confirmez votre venue en 1 clic :` +
      linkSuffix
    );
  }

  // I. Graduation / Remise de diplôme / Soutenance
  if (eType.includes("graduation") || eType.includes("diplôme") || eType.includes("diplome") || eType.includes("soutenance")) {
    if (tone === "prestige") {
      return (
        `🎓 *CÉRÉMONIE OFFICIELLE DE GRADUATION & REMISE DE DIPLÔME* ⚜️\n\n` +
        `${salutationPrestige}\n\n` +
        `Nous avons l'honneur et la fierté de solliciter votre présence lors de la cérémonie officielle de :\n` +
        `🌟 *${eventName}*\n` +
        (whenText ? `📅 *${whenText}*\n` : "") +
        (whereText ? `🏛️ *${whereText}*\n` : "") +
        `\nAccédez à votre invitation d'apparat et confirmez votre présence en ligne :` +
        linkSuffix
      );
    }
    if (tone === "court") {
      return (
        `🎓 *DIPLÔME EN VUE ! · VENEZ FÊTER ÇA !* 🎉🥂\n\n` +
        `C'est le grand jour ! Rejoignez-nous pour célébrer *${eventName}* :\n` +
        (whenText ? `📅 *${whenText}*\n` : "") +
        (whereText ? `📍 *${whereText}*\n` : "") +
        `\nVotre carton interactif et confirmation en 1 clic :` +
        linkSuffix
      );
    }
    return (
      `🎓 *UNE GRANDE RÉUSSITE À CÉLÉBRER ENSEMBLE !* 🌟🥂\n\n` +
      `${salutation}\n\n` +
      `Des années d'efforts couronnées de succès ! Nous serions comblés de vous avoir parmi nous pour la fête de graduation :\n` +
      `✨ *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nDécouvrez votre invitation interactive et partagez ce grand bonheur avec nous :` +
      linkSuffix
    );
  }

  // J. Soirée, Réception, Dîner, Brunch
  if (eType.includes("soirée") || eType.includes("soiree")) {
    return (
      `🌙 *SOIRÉE D'EXCEPTION · AMBIANCE & ÉVASION* ✨\n\n` +
      `${salutation}\n\n` +
      `Une nuit magique se prépare... Nous avons le plaisir de vous inviter à notre soirée exclusive :\n` +
      `🥂 *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nDécouvrez votre carton d'accès et réservez votre présence en 1 clic :` +
      linkSuffix
    );
  }
  if (eType.includes("réception") || eType.includes("reception")) {
    return (
      `🍾 *RÉCEPTION PRIVÉE · ART DE RECEVOIR* 🥂\n\n` +
      `${salutationPrestige}\n\n` +
      `Nous serions particulièrement honorés de vous compter parmi nos invités d'honneur à la réception donnée pour :\n` +
      `🌟 *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `🏛️ *${whereText}*\n` : "") +
      `\nVeuillez consulter votre invitation interactive et confirmer votre venue :` +
      linkSuffix
    );
  }
  if (eType.includes("dîner") || eType.includes("diner")) {
    return (
      `🍽️ *DÎNER SIGNATURE · GASTRONOMIE & PARTAGE* ✨\n\n` +
      `${salutation}\n\n` +
      `Pour un moment d'exception autour d'une table raffinée, vous êtes cordialement convié(e) à :\n` +
      `✨ *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nDécouvrez tous les détails et validez votre confirmation en ligne :` +
      linkSuffix
    );
  }
  if (eType.includes("brunch")) {
    return (
      `🥐 *BRUNCH FESTIF · DOUCEUR & CONVIVIALITÉ* ☕✨\n\n` +
      `${salutation}\n\n` +
      `Un délicieux instant de partage et de gourmandise nous attend ! Rejoignez-nous pour fêter :\n` +
      `🌸 *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nDécouvrez votre invitation interactive et confirmez votre venue :` +
      linkSuffix
    );
  }

  // K. Fêtes de fin d'année
  if (eType.includes("fêtes de fin d'année") || eType.includes("fetes de fin d'annee")) {
    return (
      `✨ *FÊTES DE FIN D'ANNÉE · CÉLÉBRATION D'EXCEPTION* 🥂🍾\n\n` +
      `${salutation}\n\n` +
      `Pour clôturer cette belle année sous le signe du partage et de l'élégance, rejoignez-nous pour :\n` +
      `🌟 *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nDécouvrez votre invitation interactive et confirmez votre présence :` +
      linkSuffix
    );
  }

  // Par défaut : Message élégant haut de gamme
  if (tone === "prestige") {
    return (
      `⚜️ *INVITATION D'HONNEUR & CÉLÉBRATION OFFICIELLE* ⚜️\n\n` +
      `${salutationPrestige}\n\n` +
      `Nous avons l'insigne honneur de solliciter votre présence lors de l'événement d'exception :\n` +
      `🌟 *${eventName}*\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `🏛️ *${whereText}*\n` : "") +
      `\nDécouvrez votre carton officiel interactif et confirmez votre venue en toute simplicité :` +
      linkSuffix
    );
  }
  if (tone === "court") {
    return (
      `⚡ *INVITATION OFFICIELLE · ${eventName.toUpperCase()}* ✨\n\n` +
      `Bonjour ! Votre invitation interactive pour *${eventName}* est en ligne :\n` +
      (whenText ? `📅 *${whenText}*\n` : "") +
      (whereText ? `📍 *${whereText}*\n` : "") +
      `\nConsultez tous les détails et confirmez votre présence en 1 clic :` +
      linkSuffix
    );
  }

  return (
    `✨ *VOUS ÊTES CORDIALEMENT INVITÉ(E) !* ✨\n\n` +
    `${salutation}\n\n` +
    `Nous avons l'immense joie de vous convier à notre célébration d'exception :\n` +
    `🌟 *${eventName}*\n` +
    (whenText ? `📅 *${whenText}*\n` : "") +
    (whereText ? `📍 *${whereText}*\n` : "") +
    `\nDécouvrez votre invitation officielle interactive et confirmez votre présence ici :` +
    linkSuffix
  );
}

/**
 * Fournit 3 suggestions de messages d'accompagnement contextuelles (Prestige, Chaleureux, Court/Poétique)
 * adaptées sur-mesure au service (invitation, vœux, mots doux, couple) et à l'événement en cours d'édition.
 */
export function getAccompanimentSuggestions(params: AccompanimentParams): AccompanimentSuggestion[] {
  const sType = (params.serviceType || "").toLowerCase().trim();
  const eType = normalizeEvent(params.eventType);
  const isMotDoux = params.isMotDoux || sType === "mot_doux" || sType === "mots_doux";
  const isCouple = params.isCouple || sType === "couple";
  const isVoeu = params.isVoeu || sType === "voeu" || sType === "voeux";

  if (isMotDoux) {
    return [
      {
        id: "prestige",
        label: "Lettre Scellée d'Or",
        icon: "💌",
        tone: "prestige",
        text: generateAccompanimentMessage({ ...params, isMotDoux: true, tone: "prestige" }),
      },
      {
        id: "chaleureux",
        label: "Mot Doux Romantique",
        icon: "❤️",
        tone: "chaleureux",
        text: generateAccompanimentMessage({ ...params, isMotDoux: true, tone: "chaleureux" }),
      },
      {
        id: "poetique",
        label: "Poétique & Tendre",
        icon: "🕊️",
        tone: "poetique",
        text: generateAccompanimentMessage({ ...params, isMotDoux: true, tone: "poetique" }),
      },
    ];
  }

  if (isCouple) {
    return [
      {
        id: "prestige",
        label: "Tête-à-tête d'Exception",
        icon: "⚜️",
        tone: "prestige",
        text: generateAccompanimentMessage({ ...params, isCouple: true, tone: "prestige" }),
      },
      {
        id: "chaleureux",
        label: "Rendez-vous Romantique",
        icon: "🥂",
        tone: "chaleureux",
        text: generateAccompanimentMessage({ ...params, isCouple: true, tone: "chaleureux" }),
      },
      {
        id: "court",
        label: "Invitation Secrète Express",
        icon: "🕯️",
        tone: "court",
        text: generateAccompanimentMessage({ ...params, isCouple: true, tone: "court" }),
      },
    ];
  }

  if (isVoeu) {
    return [
      {
        id: "prestige",
        label: "Vœux d'Or & Célébration",
        icon: "⚜️",
        tone: "prestige",
        text: generateAccompanimentMessage({ ...params, isVoeu: true, tone: "prestige" }),
      },
      {
        id: "chaleureux",
        label: "Vœux Chaleureux & Sincères",
        icon: "🎂",
        tone: "chaleureux",
        text: generateAccompanimentMessage({ ...params, isVoeu: true, tone: "chaleureux" }),
      },
      {
        id: "court",
        label: "Vœux Courts & Pétillants",
        icon: "🎉",
        tone: "court",
        text: generateAccompanimentMessage({ ...params, isVoeu: true, tone: "court" }),
      },
    ];
  }

  // Par défaut : Invitations événementielles
  const isMarriage = eType === "mariage" || eType.includes("mariage") || eType.includes("noce");

  return [
    ...(isMarriage
      ? [
          {
            id: "religieux",
            label: "Bénédiction & Mariage Religieux",
            icon: "🕌",
            tone: "religieux" as const,
            text: generateAccompanimentMessage({ ...params, tone: "religieux" }),
          },
        ]
      : []),
    {
      id: "prestige",
      label: "Ton Prestige & Cérémonie",
      icon: "⚜️",
      tone: "prestige" as const,
      text: generateAccompanimentMessage({ ...params, tone: "prestige" }),
    },
    {
      id: "chaleureux",
      label: "Ton Chaleureux & Festif",
      icon: "🥂",
      tone: "chaleureux" as const,
      text: generateAccompanimentMessage({ ...params, tone: "chaleureux" }),
    },
    {
      id: "court",
      label: "Ton Express & Moderne",
      icon: "⚡",
      tone: "court" as const,
      text: generateAccompanimentMessage({ ...params, tone: "court" }),
    },
  ];
}
