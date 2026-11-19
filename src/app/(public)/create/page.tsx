import CreateStudio from '@/components/create/CreateStudio';
import { createClient } from "@/utils/supabase/server";
import { fetchModelDefaults } from "@/lib/modelDefaults";
import { fetchCustomModels } from "@/lib/customModels";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CreateExpressStudioPage() {
  const supabase = await createClient();
  const [rows, customs] = await Promise.all([
    fetchModelDefaults(supabase, true),
    fetchCustomModels(supabase, { publishedOnly: true, force: true }),
  ]);

  return <CreateStudio initialPublishedModels={rows} initialCustomModels={customs} />;
}
