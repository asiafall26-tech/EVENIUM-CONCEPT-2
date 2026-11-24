import type { Metadata } from "next";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/utils/supabase/admin";
import { isCustomModelId, slugOfModelId } from "@/lib/customModels";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "evenium.app";
  const proto = headerList.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;

  try {
    const admin = getSupabaseAdmin();
    const { data: event } = await admin
      .from("events")
      .select("id, name, type, date, time, location, invitation_model_id, invitation_title, format, invitation_content")
      .eq("id", id)
      .maybeSingle();

    if (!event) {
      return {
        title: "Invitation Officielle",
        description: "Découvrez votre invitation officielle et confirmez votre présence.",
      };
    }

    const eventName = event.invitation_title || event.name || "notre célébration";
    const eventType = (event.type || "").toLowerCase();

    // Formatter le titre personnalisé sans mettre Evenium en avant
    let title = `Vous êtes invités : ${eventName}`;
    if (eventType.includes("mariage")) {
      const cleanName = eventName.replace(/^mariage\s*[·:\-]?\s*(de\s*)?/i, "").trim();
      title = `Vous êtes invités au mariage de ${cleanName || eventName}`;
    } else if (eventType.includes("anniversaire")) {
      const cleanName = eventName.replace(/^anniversaire\s*[·:\-]?\s*(de\s*)?/i, "").trim();
      title = `Vous êtes invités à l'anniversaire de ${cleanName || eventName}`;
    } else if (eventType.includes("bapt")) {
      const cleanName = eventName.replace(/^bapt[êe]me\s*[·:\-]?\s*(de\s*)?/i, "").trim();
      title = `Vous êtes invités au baptême de ${cleanName || eventName}`;
    } else if (eventType.includes("gala") || eventType.includes("soirée")) {
      title = `Invitation officielle · ${eventName}`;
    }

    // Date lisible
    let dateStr = "";
    if (event.date && event.date !== "À définir") {
      try {
        const d = new Date(event.date);
        if (!isNaN(d.getTime())) {
          dateStr = d.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          // Première lettre en majuscule
          dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        }
      } catch {}
    }

    // Description élégante : Lieu · Date · Action
    const descParts: string[] = [];
    if (event.location && event.location !== "À définir") descParts.push(event.location);
    if (dateStr) descParts.push(dateStr);
    descParts.push("Ouvrez votre invitation officielle et confirmez votre présence.");
    const description = descParts.join(" · ");

    // Image de prévisualisation : photo personnalisée des hôtes, ou couverture du modèle
    const content = (event.invitation_content as any)?.values ?? (event.invitation_content as any) ?? {};
    const customPhoto = content.photo || content.couple_photo || content.cover_image || content.hero_image || content.image_principale;

    let imageUrl = `${baseUrl}/invit-velours-cover.jpg`;

    if (customPhoto && typeof customPhoto === "string" && customPhoto.trim().length > 0) {
      imageUrl = customPhoto.trim();
    } else if (isCustomModelId(event.invitation_model_id)) {
      const slug = slugOfModelId(event.invitation_model_id);
      const { data: customModel } = await admin
        .from("custom_invitation_models")
        .select("cover_url")
        .eq("slug", slug)
        .maybeSingle();

      if (customModel?.cover_url) {
        imageUrl = customModel.cover_url;
      }
    } else if (event.invitation_model_id?.includes("sceau")) {
      imageUrl = `${baseUrl}/invit-sceau-dor-cover.jpg`;
    } else if (event.invitation_model_id?.includes("ivoire")) {
      imageUrl = `${baseUrl}/invit-ivoire-cover.jpg`;
    } else if (event.invitation_model_id?.includes("rose-or")) {
      imageUrl = `${baseUrl}/invit-rose-or-cover.jpg`;
    } else if (event.invitation_model_id?.includes("anniversaire")) {
      imageUrl = `${baseUrl}/invit-anniversaire-cover.jpg`;
    } else {
      imageUrl = `${baseUrl}/invit-velours-cover.jpg`;
    }

    // Si l'image est un chemin relatif, la préfixer avec le baseUrl
    if (imageUrl && !imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
      imageUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    }

    const shareUrl = `${baseUrl}/invite/${id}`;
    const cleanSiteName = eventName.replace(/^mariage\s*[·:\-]?\s*(de\s*)?/i, "").trim() || eventName;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: shareUrl,
        siteName: cleanSiteName,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (err) {
    console.warn("generateMetadata error in /invite/[id]/layout:", err);
    return {
      title: "Invitation Officielle",
      description: "Ouvrez votre invitation officielle et confirmez votre présence.",
    };
  }
}

export default function InviteLayout({ children }: Props) {
  return <>{children}</>;
}
