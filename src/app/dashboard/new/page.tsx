import CreateStudio from '@/components/create/CreateStudio';
import { createClient } from "@/utils/supabase/server";
import { fetchModelDefaults } from "@/lib/modelDefaults";
import { fetchCustomModels } from "@/lib/customModels";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Événement supplémentaire : même parcours que sur le site (modèles, personnalisation, paiement), sans création de compte. */
export default async function NewEventPage() {
  const supabase = await createClient();
  const [rows, customs] = await Promise.all([
    fetchModelDefaults(supabase, true),
    fetchCustomModels(supabase, { publishedOnly: true, force: true }),
  ]);

  return (
    <div className="w-full max-w-[1550px] mx-auto">
      <CreateStudio mode="dashboard" initialPublishedModels={rows} initialCustomModels={customs} />
    </div>
  );
}
