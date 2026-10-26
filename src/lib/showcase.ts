/**
 * Vitrine de la page d'accueil : les modèles en ligne, avec le nom, le classement et la couverture choisis
 * dans le studio des modèles. Les modèles importés publiés y figurent en premier (les plus récents).
 */
import { defaultClassification, mockInvitationModels, showcaseModelIds, type InvitationModel } from "@/data/mock/invitations";
import { classificationOf, hiddenModelIds, modelCoverOf, modelNameOf, type ModelDefaultRow } from "@/lib/modelDefaults";
import { customModelId, customModelUrl, type CustomModelRow } from "@/lib/customModels";

export const SHOWCASE_SIZE = 4;

export function buildShowcase(rows: Record<string, ModelDefaultRow>, customs: CustomModelRow[]): InvitationModel[] {
  const hidden = hiddenModelIds(rows);
  const builtIn = mockInvitationModels
    .filter((m) => !hidden.has(m.id))
    .map((m) => {
      const c = classificationOf(rows[m.id], defaultClassification(m.id));
      return {
        ...m,
        name: modelNameOf(rows[m.id], m.name),
        thumbnail: modelCoverOf(rows[m.id], m.thumbnail),
        type: c.type,
        category: (c.events[0] ?? m.category) as InvitationModel["category"],
      };
    });
  const imported: InvitationModel[] = customs
    .filter((m) => m.status === "published")
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))
    .map((m) => ({
      id: customModelId(m.slug),
      name: m.name,
      type: m.invitation_type,
      category: (m.event_types[0] ?? "Mariage") as InvitationModel["category"],
      thumbnail: m.cover_url || "/invit-velours-cover.jpg",
      isPremium: true,
      description: "Création exclusive Evenium, personnalisable de A à Z.",
      liveUrl: customModelUrl(m),
    }));
  return [
    ...imported,
    ...showcaseModelIds.map((id) => builtIn.find((m) => m.id === id)).filter((m): m is (typeof builtIn)[number] => m !== undefined),
    ...builtIn.filter((m) => !showcaseModelIds.includes(m.id)),
  ].slice(0, SHOWCASE_SIZE);
}
