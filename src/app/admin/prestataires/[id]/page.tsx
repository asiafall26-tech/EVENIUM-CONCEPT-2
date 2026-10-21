import Link from "next/link";
import { ArrowLeft, Store, Mail, Calendar as CalendarIcon, ShieldCheck, Activity, CreditCard, Ticket, CheckCircle } from "lucide-react";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { toggleUserSuspension } from "../../admin-actions";
import { revalidatePath } from "next/cache";

export default async function AdminPrestataireProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createSupabaseAdmin(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Fetch provider profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile || profile.role !== 'prestataire') {
    return <div className="p-4 sm:p-6 lg:p-8 text-center text-gray-500">Prestataire introuvable.</div>;
  }

  // Fetch their transactions (money they received)
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('prestataire_id', id)
    .order('date', { ascending: false });

  // Fetch their quotes (devis)
  const { data: devis } = await supabase
    .from('devis')
    .select('*')
    .eq('prestataire_id', id)
    .order('created_at', { ascending: false });

  // Fetch their requests (demandes)
  const { data: demandes } = await supabase
    .from('demandes_devis')
    .select('*, events(name)')
    .eq('prestataire_id', id)
    .order('created_at', { ascending: false });

  const totalEarned = (transactions || []).reduce((sum, t) => sum + Number(t.montant || 0), 0);
  const totalDevis = (devis || []).reduce((sum, d) => sum + Number(d.total || d.amount || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/prestataires" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4 transition-colors">
          <ArrowLeft size={16} /> Retour aux prestataires
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center font-serif text-2xl font-bold uppercase ${profile.is_evenium_certified ? 'bg-[#f5eee1] text-[#8f6f33]' : 'bg-gray-100 text-gray-400'}`}>
              <Store size={28} />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold text-black flex items-center gap-2">
                {profile.full_name || "Prestataire"}
                {profile.is_evenium_certified && <CheckCircle size={20} className="text-[#8f6f33]" />}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1"><Mail size={14} /> {profile.email}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><CalendarIcon size={14} /> Inscrit le {new Date(profile.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors capitalize">
              {profile.category || "Catégorie non définie"}
            </button>
            <form action={async () => {
              "use server";
              await toggleUserSuspension(id, 'actif');
              revalidatePath(`/admin/prestataires/${id}`);
            }}>
              <button type="submit" className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                Suspendre le compte
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Statut</p>
            <p className="font-bold text-gray-900 capitalize">Actif</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Demandes</p>
            <p className="font-bold text-gray-900">{demandes?.length || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Ticket size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Devis Envoyés</p>
            <p className="font-bold text-gray-900">{totalDevis.toLocaleString()} FCFA</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Revenus Générés</p>
            <p className="font-bold text-gray-900">{totalEarned.toLocaleString()} FCFA</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Liste des devis */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-wrap gap-3">
            <h2 className="font-serif text-xl font-bold">Devis Émis</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {devis && devis.length > 0 ? devis.map((d) => (
              <div key={d.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-bold text-gray-900">Client: {d.client_name || "Inconnu"}</h3>
                  <p className="text-sm text-gray-500 mt-1">{new Date(d.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{Number(d.amount).toLocaleString()} FCFA</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.status === 'Accepté' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    {d.status}
                  </span>
                </div>
              </div>
            )) : <div className="p-6 text-center text-gray-500">Aucun devis</div>}
          </div>
        </div>

        {/* Historique des paiements reçus */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-wrap gap-3">
            <h2 className="font-serif text-xl font-bold">Paiements Reçus</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {transactions && transactions.length > 0 ? transactions.map((tx) => (
              <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{tx.libelle}</p>
                  <p className="text-sm text-gray-500 mt-1">{new Date(tx.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{Number(tx.montant).toLocaleString()} FCFA</p>
                  <span className="text-xs text-green-600 font-medium">Complété</span>
                </div>
              </div>
            )) : <div className="p-6 text-center text-gray-500">Aucune transaction</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
