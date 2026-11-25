import * as XLSX from "xlsx";

export interface ParsedGuestRow {
  id?: string;
  prenom: string;
  nom: string;
  fullName: string;
  telephone: string;
  email: string;
  places: number;
  accompagnants: number;
  groupe: string;
  isValid: boolean;
  errors: string[];
}

/**
 * Normalise un numéro de téléphone au format international.
 * Par défaut, applique l'indicatif Sénégal (+221) si le numéro local est à 9 chiffres.
 */
export function normalizePhoneNumber(raw: string | number | undefined | null, defaultCountryCode = "+221"): string {
  if (raw === undefined || raw === null) return "";
  let str = String(raw).trim().replace(/[\s\-\.\(\)]/g, "");
  if (!str) return "";

  // Si commence par 00, remplacer par +
  if (str.startsWith("00")) {
    str = "+" + str.slice(2);
  }

  // Si commence déjà par +, nettoyer les caractères non numériques après
  if (str.startsWith("+")) {
    const digits = str.slice(1).replace(/\D/g, "");
    return "+" + digits;
  }

  // Numéro sénégalais classique : 9 chiffres commençant par 7, 3 ou 8 (ex: 783046676, 771234567)
  if (/^[738]\d{8}$/.test(str)) {
    return defaultCountryCode + str;
  }

  // Numéro français : 10 chiffres commençant par 0 (ex: 0612345678)
  if (/^0[1-9]\d{8}$/.test(str)) {
    return "+33" + str.slice(1);
  }

  // Si commence par 221 sans le + (12 chiffres)
  if (str.startsWith("221") && str.length === 12) {
    return "+" + str;
  }

  // Si composé uniquement de 8 à 14 chiffres sans indicatif, ajouter le code par défaut
  if (/^\d{8,14}$/.test(str)) {
    return defaultCountryCode + str;
  }

  // Tout autre cas
  return str.startsWith("+") ? str : "+" + str;
}

export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  // Format international attendu : + suivi de 8 à 15 chiffres
  return /^\+\d{8,15}$/.test(phone);
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim().toLowerCase());
}

/**
 * Extrait le groupe et le vœu stockés dans la colonne message de guests.
 * Format stocké : "[Groupe: Famille] Texte du vœu" ou "[Groupe: Famille]"
 */
export function extractGroupAndWish(msg?: string | null): { group: string; wish: string } {
  if (!msg) return { group: "Général", wish: "" };
  const match = msg.match(/^\[Groupe:\s*([^\]]+)\]\s*([\s\S]*)/);
  if (match) {
    return { group: match[1].trim() || "Général", wish: match[2].trim() };
  }
  return { group: "Général", wish: msg.trim() };
}

/**
 * Encode le groupe dans le message pour la base de données.
 */
export function formatMsgWithGroup(group?: string | null, wish?: string | null): string | null {
  const cleanGroup = (group || "").trim();
  const cleanWish = (wish || "").trim();

  if (cleanGroup && cleanGroup !== "Général") {
    return cleanWish ? `[Groupe: ${cleanGroup}] ${cleanWish}` : `[Groupe: ${cleanGroup}]`;
  }
  return cleanWish || null;
}

/**
 * Sépare un nom complet en Prénom et Nom pour l'affichage et l'export Excel.
 */
export function splitFullName(fullName: string): { prenom: string; nom: string } {
  if (!fullName) return { prenom: "", nom: "" };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { prenom: parts[0], nom: "" };
  }
  const prenom = parts[0];
  const nom = parts.slice(1).join(" ");
  return { prenom, nom };
}

/**
 * Génère et télécharge le fichier modèle Excel pour l'import d'invités.
 */
export function downloadGuestTemplateExcel() {
  const wsData = [
    ["Prénom", "Nom", "Téléphone", "Email", "Nombre de places", "Groupe"],
    ["Amadou", "Diallo", "+221 77 123 45 67", "amadou.diallo@example.com", 2, "Famille"],
    ["Aïssatou", "Ndiaye", "78 304 66 76", "aissatou.ndiaye@example.com", 1, "Amis"],
    ["Moussa", "Sow", "76 987 65 43", "", 2, "Collègues"],
    ["Fatou", "Ba", "", "fatou.ba@example.com", 1, "Famille"],
    ["", "", "", "", "", ""],
    ["NOTE IMPORTANTE : Le Téléphone OU l'Email est obligatoire pour chaque invité afin de lui envoyer son invitation."],
    ["Le nombre de places (1 par défaut) et le groupe (Famille, Amis, Collègues...) sont facultatifs."],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [
    { wch: 18 }, // Prénom
    { wch: 18 }, // Nom
    { wch: 22 }, // Téléphone
    { wch: 30 }, // Email
    { wch: 18 }, // Places
    { wch: 18 }, // Groupe
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Modèle Invités Evenium");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Modele_Import_Invites_Evenium.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Lit et analyse un fichier Excel ou CSV déposé par l'utilisateur.
 */
export async function parseGuestFile(file: File, existingGuests: any[] = []): Promise<ParsedGuestRow[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];

  // Convertir en tableau 2D
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

  if (rows.length === 0) return [];

  // Trouver la ligne d'en-tête (cherche 'nom', 'prenom', 'telephone', 'email')
  let headerIndex = -1;
  let colMap: Record<string, number> = {
    prenom: -1,
    nom: -1,
    telephone: -1,
    email: -1,
    places: -1,
    groupe: -1,
  };

  for (let r = 0; r < Math.min(10, rows.length); r++) {
    const row = rows[r].map((cell) => String(cell || "").toLowerCase().trim());
    const hasPrenom = row.some((c) => c.includes("prénom") || c.includes("prenom") || c.includes("first"));
    const hasNom = row.some((c) => c === "nom" || c.includes("last") || c.includes("famille"));
    const hasTel = row.some((c) => c.includes("tél") || c.includes("tel") || c.includes("phone"));
    const hasEmail = row.some((c) => c.includes("mail"));

    if ((hasPrenom || hasNom) && (hasTel || hasEmail)) {
      headerIndex = r;
      row.forEach((cell, idx) => {
        if (cell.includes("prénom") || cell.includes("prenom") || cell.includes("first")) colMap.prenom = idx;
        else if (cell === "nom" || cell.includes("nom de") || cell.includes("last")) colMap.nom = idx;
        else if (cell.includes("tél") || cell.includes("tel") || cell.includes("phone") || cell.includes("whatsapp"))
          colMap.telephone = idx;
        else if (cell.includes("mail") || cell.includes("courriel")) colMap.email = idx;
        else if (cell.includes("place") || cell.includes("nombre") || cell.includes("accompagnant") || cell.includes("invité"))
          colMap.places = idx;
        else if (cell.includes("group") || cell.includes("catégorie") || cell.includes("famille")) colMap.groupe = idx;
      });
      break;
    }
  }

  // Si pas d'en-tête strict trouvé, utiliser les colonnes standard par défaut (0: Prénom, 1: Nom, 2: Tel, 3: Email, 4: Places, 5: Groupe)
  const startRow = headerIndex >= 0 ? headerIndex + 1 : 1;
  const pIdx = colMap.prenom >= 0 ? colMap.prenom : 0;
  const nIdx = colMap.nom >= 0 ? colMap.nom : 1;
  const tIdx = colMap.telephone >= 0 ? colMap.telephone : 2;
  const eIdx = colMap.email >= 0 ? colMap.email : 3;
  const plIdx = colMap.places >= 0 ? colMap.places : 4;
  const gIdx = colMap.groupe >= 0 ? colMap.groupe : 5;

  const seenPhones = new Set<string>();
  const seenEmails = new Set<string>();

  // Indexer les contacts existants pour détecter les doublons
  existingGuests.forEach((g) => {
    if (g.telephone) seenPhones.add(normalizePhoneNumber(g.telephone));
    if (g.email) seenEmails.add(String(g.email).trim().toLowerCase());
  });

  const parsedGuests: ParsedGuestRow[] = [];

  for (let r = startRow; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.every((c) => String(c).trim() === "")) continue;

    const rawPrenom = String(row[pIdx] || "").trim();
    const rawNom = String(row[nIdx] || "").trim();

    // Ignorer les lignes de notes / explications
    if (rawPrenom.toLowerCase().startsWith("note") || rawNom.toLowerCase().startsWith("note")) continue;

    const rawTel = String(row[tIdx] || "").trim();
    const rawEmail = String(row[eIdx] || "").trim();
    const rawPlaces = row[plIdx];
    const rawGroupe = String(row[gIdx] || "").trim();

    const normalizedTel = normalizePhoneNumber(rawTel);
    const cleanEmail = rawEmail ? rawEmail.toLowerCase().trim() : "";
    const parsedPlaces = Math.max(1, parseInt(String(rawPlaces), 10) || 1);
    const accompagnants = Math.max(0, parsedPlaces - 1);
    const groupe = rawGroupe || "Général";

    const fullName = [rawPrenom, rawNom].filter(Boolean).join(" ") || "Invité sans nom";

    const errors: string[] = [];

    // Validation 1 : Nom ou Prénom obligatoire
    if (!rawPrenom && !rawNom) {
      errors.push("Prénom ou Nom manquant");
    }

    // Validation 2 : Téléphone OU Email obligatoire
    if (!normalizedTel && !cleanEmail) {
      errors.push("Téléphone ou Email obligatoire");
    }

    // Validation 3 : Numéro de téléphone valide si renseigné
    if (normalizedTel && !isValidPhone(normalizedTel)) {
      errors.push("Format de téléphone invalide");
    }

    // Validation 4 : Email valide si renseigné
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      errors.push("Format d'email invalide");
    }

    // Validation 5 : Doublon téléphone
    if (normalizedTel && seenPhones.has(normalizedTel)) {
      errors.push("Numéro de téléphone déjà existant (doublon)");
    } else if (normalizedTel) {
      seenPhones.add(normalizedTel);
    }

    // Validation 6 : Doublon email
    if (cleanEmail && seenEmails.has(cleanEmail)) {
      errors.push("Email déjà existant (doublon)");
    } else if (cleanEmail) {
      seenEmails.add(cleanEmail);
    }

    parsedGuests.push({
      prenom: rawPrenom,
      nom: rawNom,
      fullName,
      telephone: normalizedTel,
      email: cleanEmail,
      places: parsedPlaces,
      accompagnants,
      groupe,
      isValid: errors.length === 0,
      errors,
    });
  }

  return parsedGuests;
}

/**
 * Exporte l'ensemble des invités vers un fichier Excel structuré et téléchargeable.
 */
export function exportGuestsToExcel(guests: any[], eventName: string, eventId: string) {
  const headers = [
    "Prénom",
    "Nom",
    "Téléphone",
    "Email",
    "Groupe",
    "Statut RSVP",
    "Nombre de places",
    "Nombre d'accompagnants",
    "Date d'ajout",
    "Message / Vœu des invités",
    "Lien personnel RSVP",
  ];

  const origin = typeof window !== "undefined" ? window.location.origin : "https://evenium.com";

  const rows = guests.map((g) => {
    const { group, wish } = extractGroupAndWish(g.message);
    const { prenom, nom } = splitFullName(g.nom);
    const places = 1 + (Number(g.nombre_accompagnants) || 0);
    const personalUrl = `${origin}/invite/${eventId}?guest=${g.id}`;

    return [
      prenom,
      nom,
      g.telephone || "",
      g.email || "",
      group || "Général",
      g.statut_rsvp || "Non envoyé",
      places,
      Number(g.nombre_accompagnants) || 0,
      g.created_at ? new Date(g.created_at).toLocaleDateString("fr-FR") : "",
      wish || "",
      personalUrl,
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!cols"] = [
    { wch: 16 }, // Prénom
    { wch: 18 }, // Nom
    { wch: 18 }, // Téléphone
    { wch: 28 }, // Email
    { wch: 15 }, // Groupe
    { wch: 14 }, // Statut RSVP
    { wch: 16 }, // Places
    { wch: 22 }, // Accompagnants
    { wch: 14 }, // Date
    { wch: 32 }, // Vœu
    { wch: 45 }, // Lien
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Suivi des Invités (RSVP)");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = (eventName || "Evenium").replace(/[^a-zA-Z0-9_\-]/g, "_");
  a.download = `Suivi_RSVP_${safeName}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
