import { VELOURS_MODEL_ID, DEFAULT_VELOURS } from "@/components/invitations/velours/content";
import { SCEAU_MODEL_ID, DEFAULT_SCEAU } from "@/components/invitations/sceau/content";
import { IVOIRE_MODEL_ID, DEFAULT_IVOIRE } from "@/components/invitations/ivoire/content";
import { ROSE_OR_MODEL_ID, DEFAULT_ROSE_OR } from "@/components/invitations/rose-or/content";
import { ANNIVERSAIRE_MODEL_ID, DEFAULT_ANNIVERSAIRE } from "@/components/invitations/anniversaire/content";
import type { CustomModelRow } from "@/lib/customModels";

export type StudioFieldType =
  | "text"
  | "textarea"
  | "datetime"
  | "date"
  | "time"
  | "photo"
  | "gallery"
  | "color"
  | "programme";

export interface ProgrammeStep {
  time: string;
  label: string; // ou moment
  detail?: string;
  icon?: string;
}

export interface StudioFieldConfig {
  id: string;
  label: string;
  type: StudioFieldType;
  placeholder?: string;
  hint?: string;
  max?: number;
  options?: { value: string; label: string }[];
}

export interface StudioSectionConfig {
  id: string;
  title: string;
  icon: string; // nom lucide ou emoji
  desc?: string;
  fields: StudioFieldConfig[];
}

export interface ModelStudioConfig {
  modelId: string;
  modelName: string;
  previewPath: string;
  sections: StudioSectionConfig[];
  defaultValues: Record<string, any>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONFIGURATION VELOURS BORDEAUX (Liste FIELDS fidèle au prototype)
// ─────────────────────────────────────────────────────────────────────────────
export const VELOURS_OR_CONFIG: ModelStudioConfig = {
  modelId: VELOURS_MODEL_ID,
  modelName: "Velours Bordeaux & Or",
  previewPath: "/invitation-mariage",
  defaultValues: {
    ...DEFAULT_VELOURS,
    familyParents: "Les familles Dupont et Traoré ont l'immense joie de vous annoncer le mariage de leurs enfants.",
    familyBlessing: "Avec la bénédiction de nos parents et aînés",
    dressCodeText: "Nous serions ravis que vos tenues s'accordent aux nuances de notre fête :",
    dressColors: ["#5e1622", "#7b5960", "#d4bfa4", "#f1e7da", "#D4AF37"],
    mapsUrl: "https://maps.google.com",
    gallery: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
    ],
    rsvpDeadline: "Avant le 15 mai",
    giftTitle: "Un mot sur les cadeaux",
    giftText: "Votre présence est notre plus beau cadeau. Une urne vous attendra à l'entrée pour vos enveloppes et mots doux.",
    footerPhoto: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80"
  },
  sections: [
    {
      id: "couple",
      title: "Couple",
      icon: "HeartHandshake",
      desc: "Prénoms des futurs époux et phrase d'accroche",
      fields: [
        { id: "partnerA", label: "Prénom du 1er marié", type: "text", placeholder: "Ex : Alexandre" },
        { id: "partnerB", label: "Prénom de la mariée", type: "text", placeholder: "Ex : Marie" },
        { id: "tagline", label: "Phrase d'accroche (Kicker)", type: "text", placeholder: "Deux cœurs, une histoire, pour toujours ♡" },
      ],
    },
    {
      id: "date",
      title: "Date",
      icon: "Calendar",
      desc: "Date du mariage et heure d'accueil des invités",
      fields: [
        { id: "date", label: "Date de la cérémonie", type: "date" },
        { id: "time", label: "Heure d'accueil", type: "time" },
      ],
    },
    {
      id: "familles",
      title: "Familles",
      icon: "Users",
      desc: "Annonce au nom des familles et bénédiction",
      fields: [
        { id: "familyParents", label: "Annonce des familles", type: "textarea", placeholder: "Les familles Dupont et Traoré ont l'immense joie..." },
        { id: "familyBlessing", label: "Bénédiction ou vœu", type: "text", placeholder: "Avec la bénédiction de nos parents et aînés" },
      ],
    },
    {
      id: "ceremonie",
      title: "Cérémonie & soirée",
      icon: "Sparkles",
      desc: "Mot d'accueil et lieux de réception",
      fields: [
        { id: "welcomeTitle", label: "Titre d'accueil", type: "text", placeholder: "Chers amis & famille !" },
        { id: "welcomeText", label: "Message de bienvenue", type: "textarea", placeholder: "Nous serions profondément heureux de vous compter parmi nous..." },
        { id: "venue", label: "Lieu de réception", type: "text", placeholder: "Domaine du Jardin Blanc / Le Pavillon des Roses" },
        { id: "city", label: "Ville", type: "text", placeholder: "Paris / Dakar" },
      ],
    },
    {
      id: "programme",
      title: "Programme",
      icon: "Clock",
      desc: "Déroulement chronologique heure par heure",
      fields: [
        { id: "programme", label: "Étapes de la journée", type: "programme" },
        { id: "programmeQuote", label: "Phrase d'ambiance du programme", type: "text", placeholder: "Ce sera beau, délicieux et inoubliable ! ♡" },
        { id: "photoProgramme", label: "Photo d'illustration du programme", type: "photo" },
      ],
    },
    {
      id: "dresscode",
      title: "Dress code",
      icon: "Palette",
      desc: "Consignes vestimentaires et palette de couleurs",
      fields: [
        { id: "dressCodeText", label: "Consignes de tenue", type: "textarea", placeholder: "Nous serions ravis que vos tenues s'accordent aux nuances de notre fête :" },
        { id: "dressColors", label: "Palette de couleurs recommandées", type: "color" },
      ],
    },
    {
      id: "itineraire",
      title: "Itinéraire",
      icon: "MapPin",
      desc: "Adresse exacte et lien GPS pour les invités",
      fields: [
        { id: "address", label: "Adresse complète", type: "text", placeholder: "Route de la Corniche Ouest, Dakar" },
        { id: "mapsUrl", label: "Lien Google Maps / GPS", type: "text", placeholder: "https://maps.google.com/..." },
      ],
    },
    {
      id: "galerie",
      title: "Galerie",
      icon: "Camera",
      desc: "Jusqu'à 5 photos romantiques du couple",
      fields: [
        { id: "gallery", label: "Photos du couple (max 5)", type: "gallery", max: 5 },
      ],
    },
    {
      id: "reponses",
      title: "Réponses",
      icon: "Mail",
      desc: "Date limite de réponse et consignes RSVP",
      fields: [
        { id: "rsvpDeadline", label: "Date limite de confirmation", type: "text", placeholder: "Avant le 15 mai" },
        { id: "rsvpText", label: "Consignes aux invités", type: "textarea", placeholder: "Merci de nous confirmer votre présence pour nous aider dans l'organisation." },
      ],
    },
    {
      id: "cadeau",
      title: "Cadeau",
      icon: "Gift",
      desc: "Informations sur l'urne ou la liste de mariage",
      fields: [
        { id: "giftTitle", label: "Titre de la section cadeau", type: "text", placeholder: "Un mot sur les cadeaux" },
        { id: "giftText", label: "Informations urne ou cagnotte", type: "textarea", placeholder: "Votre présence est notre plus beau cadeau. Une urne vous attendra à l'entrée..." },
      ],
    },
    {
      id: "fin",
      title: "Mot de la fin",
      icon: "Quote",
      desc: "Citation de clôture et photo finale",
      fields: [
        { id: "closingQuote", label: "Citation ou mot de fin", type: "text", placeholder: "Les petits moments créent les grands souvenirs ♡" },
        { id: "footerPhoto", label: "Photo de fin", type: "photo" },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONFIGURATION SCEAU D'OR
// ─────────────────────────────────────────────────────────────────────────────
export const SCEAU_DOR_CONFIG: ModelStudioConfig = {
  modelId: SCEAU_MODEL_ID,
  modelName: "Sceau d'Or Impérial",
  previewPath: "/invitation-sceau-dor",
  defaultValues: DEFAULT_SCEAU,
  sections: [
    {
      id: "couple",
      title: "Les Mariés",
      icon: "HeartHandshake",
      fields: [
        { id: "partnerA", label: "Prénom du 1er hôte", type: "text" },
        { id: "partnerB", label: "Prénom du 2nd hôte", type: "text" },
        { id: "sealInitial", label: "Initiale du sceau de cire", type: "text" },
      ],
    },
    {
      id: "date",
      title: "Date & Horaires",
      icon: "Calendar",
      fields: [
        { id: "date", label: "Date", type: "date" },
        { id: "time", label: "Heure d'accueil", type: "time" },
      ],
    },
    {
      id: "ceremonie",
      title: "Lieux & Accès",
      icon: "MapPin",
      fields: [
        { id: "venue", label: "Lieu de réception", type: "text" },
        { id: "city", label: "Ville", type: "text" },
        { id: "address", label: "Adresse complète", type: "text" },
      ],
    },
    {
      id: "programme",
      title: "Programme",
      icon: "Clock",
      fields: [
        { id: "programme", label: "Déroulement", type: "programme" },
      ],
    },
    {
      id: "dresscode",
      title: "Dress Code",
      icon: "Palette",
      fields: [
        { id: "dressCodeText", label: "Consignes de tenue", type: "textarea" },
        { id: "dressColors", label: "Palette de couleurs", type: "color" },
      ],
    },
    {
      id: "reponses",
      title: "Confirmation RSVP",
      icon: "Mail",
      fields: [
        { id: "rsvpDeadline", label: "Date limite", type: "text" },
        { id: "rsvpText", label: "Message RSVP", type: "textarea" },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. CONFIGURATION IVOIRE COUTURE
// ─────────────────────────────────────────────────────────────────────────────
export const IVOIRE_CONFIG: ModelStudioConfig = {
  modelId: IVOIRE_MODEL_ID,
  modelName: "Ivoire Couture",
  previewPath: "/invitation-ivoire",
  defaultValues: DEFAULT_IVOIRE,
  sections: [
    {
      id: "couple",
      title: "Hôtes & Titre",
      icon: "HeartHandshake",
      fields: [
        { id: "partnerA", label: "Prénom de l'époux", type: "text" },
        { id: "partnerB", label: "Prénom de l'épouse", type: "text" },
        { id: "tagline", label: "Phrase d'accueil", type: "text" },
      ],
    },
    {
      id: "date",
      title: "Date & Cérémonie",
      icon: "Calendar",
      fields: [
        { id: "date", label: "Date", type: "date" },
        { id: "time", label: "Heure", type: "time" },
        { id: "venue", label: "Lieu", type: "text" },
        { id: "city", label: "Ville", type: "text" },
      ],
    },
    {
      id: "programme",
      title: "Programme",
      icon: "Clock",
      fields: [
        { id: "programme", label: "Programme de la journée", type: "programme" },
      ],
    },
    {
      id: "dresscode",
      title: "Dress Code & Couleurs",
      icon: "Palette",
      fields: [
        { id: "dressCodeText", label: "Recommandations de tenues", type: "textarea" },
        { id: "dressColors", label: "Couleurs suggérées", type: "color" },
      ],
    },
    {
      id: "reponses",
      title: "Réponses",
      icon: "Mail",
      fields: [
        { id: "rsvpText", label: "Consignes RSVP", type: "textarea" },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. CONFIGURATION ROSE POUDRÉE & OR
// ─────────────────────────────────────────────────────────────────────────────
export const ROSE_OR_CONFIG: ModelStudioConfig = {
  modelId: ROSE_OR_MODEL_ID,
  modelName: "Rose Poudrée & Or",
  previewPath: "/invitation-rose-or",
  defaultValues: DEFAULT_ROSE_OR,
  sections: [
    {
      id: "couple",
      title: "Les Mariés",
      icon: "HeartHandshake",
      fields: [
        { id: "partnerA", label: "Prénom 1", type: "text" },
        { id: "partnerB", label: "Prénom 2", type: "text" },
        { id: "tagline", label: "Accroche poétique", type: "text" },
      ],
    },
    {
      id: "date",
      title: "Date & Lieux",
      icon: "Calendar",
      fields: [
        { id: "date", label: "Date de célébration", type: "date" },
        { id: "time", label: "Heure", type: "time" },
        { id: "venue", label: "Lieu", type: "text" },
        { id: "city", label: "Ville", type: "text" },
        { id: "address", label: "Adresse", type: "text" },
      ],
    },
    {
      id: "programme",
      title: "Programme",
      icon: "Clock",
      fields: [
        { id: "programme", label: "Moments clés", type: "programme" },
      ],
    },
    {
      id: "reponses",
      title: "RSVP",
      icon: "Mail",
      fields: [
        { id: "rsvpText", label: "Message de confirmation", type: "textarea" },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. CONFIGURATION ANNIVERSAIRE
// ─────────────────────────────────────────────────────────────────────────────
export const ANNIVERSAIRE_CONFIG: ModelStudioConfig = {
  modelId: ANNIVERSAIRE_MODEL_ID,
  modelName: "Anniversaire Bordeaux & Or",
  previewPath: "/invitation-anniversaire",
  defaultValues: DEFAULT_ANNIVERSAIRE,
  sections: [
    {
      id: "hero",
      title: "Hôte & Âge",
      icon: "Sparkles",
      fields: [
        { id: "name", label: "Prénom de l'hôte", type: "text" },
        { id: "age", label: "Âge célébré", type: "text" },
        { id: "tagline", label: "Phrase de fête", type: "text" },
        { id: "photoMain", label: "Photo d'anniversaire", type: "photo" },
      ],
    },
    {
      id: "date",
      title: "Date & Fête",
      icon: "Calendar",
      fields: [
        { id: "date", label: "Date", type: "date" },
        { id: "time", label: "Heure", type: "time" },
        { id: "venue", label: "Lieu", type: "text" },
        { id: "address", label: "Adresse", type: "text" },
      ],
    },
    {
      id: "programme",
      title: "Programme",
      icon: "Clock",
      fields: [
        { id: "programme", label: "Déroulement de la soirée", type: "programme" },
      ],
    },
    {
      id: "reponses",
      title: "RSVP",
      icon: "Mail",
      fields: [
        { id: "rsvpText", label: "Consignes de confirmation", type: "textarea" },
      ],
    },
  ],
};

/**
 * Génère automatiquement la configuration de studio pour N'IMPORTE QUEL modèle :
 * modèle natif (Velours, Sceau, Ivoire, Rose, Anniversaire) ou modèle importé (custom).
 * AUCUN nouveau code n'est requis dans l'éditeur pour intégrer un nouveau modèle !
 */
export function getModelStudioConfig(
  modelId: string,
  customModel?: CustomModelRow | null
): ModelStudioConfig {
  if (modelId === VELOURS_MODEL_ID) return VELOURS_OR_CONFIG;
  if (modelId === SCEAU_MODEL_ID) return SCEAU_DOR_CONFIG;
  if (modelId === IVOIRE_MODEL_ID) return IVOIRE_CONFIG;
  if (modelId === ROSE_OR_MODEL_ID) return ROSE_OR_CONFIG;
  if (modelId === ANNIVERSAIRE_MODEL_ID) return ANNIVERSAIRE_CONFIG;

  // Si c'est un modèle importé (custom model)
  if (customModel) {
    const fields = customModel.fields || [];
    // Regroupement intelligent par type ou sections
    const textFields: StudioFieldConfig[] = [];
    const mediaFields: StudioFieldConfig[] = [];
    const dateFields: StudioFieldConfig[] = [];
    const otherFields: StudioFieldConfig[] = [];

    fields.forEach((f) => {
      const type = f.type === "image" ? "photo" : f.multiline ? "textarea" : "text";
      const config: StudioFieldConfig = {
        id: f.id,
        label: f.label || f.id,
        type: type,
        placeholder: "",
        hint: "",
      };

      const lower = f.id.toLowerCase() + " " + (f.label || "").toLowerCase();
      if (type === "photo") {
        mediaFields.push(config);
      } else if (lower.includes("date") || lower.includes("heure") || lower.includes("time") || lower.includes("quand")) {
        dateFields.push(config);
      } else if (lower.includes("texte") || lower.includes("message") || lower.includes("histoire") || lower.includes("desc") || f.multiline) {
        textFields.push({ ...config, type: "textarea" });
      } else {
        otherFields.push(config);
      }
    });

    const sections: StudioSectionConfig[] = [];
    if (otherFields.length) {
      sections.push({
        id: "essentiel",
        title: "Informations Clés",
        icon: "HeartHandshake",
        desc: "Prénoms, titres et accroches",
        fields: otherFields,
      });
    }
    if (dateFields.length) {
      sections.push({
        id: "date",
        title: "Date & Lieux",
        icon: "Calendar",
        desc: "Date, horaires et accès",
        fields: dateFields,
      });
    }
    if (textFields.length) {
      sections.push({
        id: "messages",
        title: "Textes & Messages",
        icon: "Quote",
        desc: "Messages personnalisés et citations",
        fields: textFields,
      });
    }
    if (mediaFields.length) {
      sections.push({
        id: "photos",
        title: "Photos & Visuels",
        icon: "Camera",
        desc: "Images et arrière-plans",
        fields: mediaFields,
      });
    }

    const defaultValues: Record<string, any> = {};
    fields.forEach((f) => {
      defaultValues[f.id] = f.original || "";
    });

    return {
      modelId: customModel.slug || modelId,
      modelName: customModel.name || "Modèle personnalisé",
      previewPath: `/m/${customModel.slug}/${customModel.entry || "index.html"}`,
      sections: sections.length ? sections : [
        {
          id: "general",
          title: "Personnalisation",
          icon: "Sparkles",
          fields: fields.map((f) => ({
            id: f.id,
            label: f.label || f.id,
            type: f.type === "image" ? "photo" : "text",
          })),
        },
      ],
      defaultValues,
    };
  }

  // Fallback par défaut : modèle Velours
  return VELOURS_OR_CONFIG;
}
