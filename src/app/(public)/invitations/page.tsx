import { createClient } from "@/utils/supabase/server";
import { fetchModelDefaults } from "@/lib/modelDefaults";
import { fetchCustomModels } from "@/lib/customModels";
import { fetchServiceCategories } from "@/lib/serviceCategories";
import InvitationsClientPage from "./InvitationsClientPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InvitationsPage() {
  const supabase = await createClient();
  const [modelRows, customRows, serviceCats] = await Promise.all([
    fetchModelDefaults(supabase, true),
    fetchCustomModels(supabase, { publishedOnly: true, force: true }),
    fetchServiceCategories(supabase, true),
  ]);

  return (
    <InvitationsClientPage
      initialRows={modelRows}
      initialCustoms={customRows}
      initialCategories={serviceCats}
    />
  );
}
