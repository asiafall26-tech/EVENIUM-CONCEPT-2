import { redirect } from "next/navigation";

/**
 * Redirection automatique vers le Studio des modèles fusionné
 * (Onglet Catégories & Tarifs dans /admin/modeles).
 */
export default function AdminCategoriesRedirect() {
  redirect("/admin/modeles?tab=categories");
}
