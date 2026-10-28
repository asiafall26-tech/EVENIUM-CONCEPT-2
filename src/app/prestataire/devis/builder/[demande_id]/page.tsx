"use client";

import { use, useState, useEffect, useMemo } from "react";
import { ArrowLeft, Save, Send, FileText, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import DemandViewer from "@/components/prestataire/DemandViewer";
import { DevisForm } from "@/components/devis/DevisForm";
import {
  draftFromDemande,
  devisColumns,
  fetchProvider,
  linesSummary,
  writeDevis,
  writeLines,
  type DevisDraft,
} from "@/lib/devis/persist";
import { useBadgeStore } from "@/store/BadgeStore";
import { sendQuoteSubmittedPushAction } from "@/app/actions/notify";

export default function BuilderDevisPage({
  params,
}: {
  params: Promise<{ demande_id: string }>;
}) {
  const { demande_id } = use(params);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [demande, setDemande] = useState<any>(null);
  const [showDemand, setShowDemand] = useState(false);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [providerCategoryIds, setProviderCategoryIds] = useState<string[]>([]);
  const [draft, setDraft] = useState<DevisDraft | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data }, { data: auth }] = await Promise.all([
        supabase
          .from('demandes_devis')
          .select('*, events(*, profiles:client_id(full_name))')
          .eq('id', demande_id)
          .single(),
        supabase.auth.getUser(),
      ]);

      if (data) {
        setDemande(data);
        const pid = auth.user?.id || data.prestataire_id;
        setProviderId(pid);
        const { categoryIds } = await fetchProvider(supabase, pid);
        setProviderCategoryIds(categoryIds);
        setDraft(draftFromDemande(data, categoryIds));
      }
      setLoading(false);
    };
    load();
  }, [demande_id, supabase]);

  const saveDevis = async (isDraft: boolean) => {
    if (!demande || !draft || saving) return;
    if (!isDraft && !draft.items.some((i) => i.designation.trim() && i.total > 0)) {
      alert("Ajoutez au moins une prestation avec un service et un prix avant d'envoyer le devis.");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetClientId = demande.events?.client_id || demande.client_id || null;
      const { amounts } = devisColumns(draft);

      const { data: inserted, error, degraded } = await writeDevis(
        supabase,
        draft,
        {
          demande_id: demande.id,
          prestataire_id: demande.prestataire_id || user?.id,
          client_id: targetClientId,
          event_id: demande.event_id,
          version: 1,
          is_draft: isDraft,
          status: isDraft ? 'Brouillon' : 'En attente de validation',
          sent_at: isDraft ? null : new Date().toISOString(),
        },
        {}
      );
      if (error || !inserted) throw new Error(error?.message || "Le devis n'a pas pu être enregistré.");

      const { error: linesError } = await writeLines(supabase, inserted.id, draft);
      if (linesError) throw new Error("Les prestations n'ont pas pu être enregistrées : " + linesError.message);

      if (!isDraft) {
        await supabase.from('demandes_devis').update({ status: 'Devis envoyé' }).eq('id', demande.id);
        await supabase.from('devis_status_history').insert({
          devis_id: inserted.id,
          status: 'En attente de validation',
          changed_by: user?.id,
          comment: "Proposition de devis transmise à l'organisateur",
        });

        // Message automatique dans la conversation (déclenche aussi la notification de l'organisateur)
        if (user && targetClientId) {
          let clientName = draft.clientName || demande.client_name;
          if (!clientName) {
            const { data: cProf } = await supabase.from('profiles').select('full_name').eq('id', targetClientId).maybeSingle();
            clientName = cProf?.full_name || "Organisateur";
          }
          const eventName = draft.eventName || demande.events?.name || demande.event_type || "votre événement";
          const summary = linesSummary(draft);
          await supabase.from('messages').insert({
            event_id: demande.event_id || null,
            sender_id: user.id,
            receiver_id: targetClientId,
            is_read: false,
            content:
              `Bonjour ${clientName},\n\nSuite à votre demande, j'ai le plaisir de vous transmettre ma proposition de devis n° ${draft.reference} pour un montant de ${amounts.total.toLocaleString('fr-FR')} FCFA pour votre événement « ${eventName} ».` +
              (summary ? `\n\nPrestations proposées :\n${summary}` : "") +
              `\n\nVous pouvez consulter le détail de ma proposition et la valider directement dans votre espace Devis.\n\nJe reste à votre entière disposition pour tout renseignement complémentaire !`,
          });

          // Alerte Push directe sur l'appareil du client (même application fermée)
          sendQuoteSubmittedPushAction(
            targetClientId,
            user?.user_metadata?.full_name || "Un prestataire",
            amounts.total
          );
        }
        useBadgeStore.getState().refresh();
      }

      if (degraded) {
        alert(
          (isDraft ? "Brouillon sauvegardé" : "Proposition de devis envoyée") +
            ".\n\nAttention : la base de données n'est pas encore à jour. Les détails spécifiques à votre activité, la TVA et la caution n'ont pas été enregistrés. Exécutez le script « supabase_devis_personnalisation.sql » dans Supabase."
        );
      } else {
        alert(isDraft ? "Brouillon sauvegardé !" : "Proposition de devis envoyée avec succès !");
      }
      router.push('/prestataire/demandes');
    } catch (err: any) {
      console.error("Erreur saveDevis :", err);
      alert("Erreur d'enregistrement : " + (err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b8924a]"></div></div>;
  if (!demande || !draft) return <div className="p-20 text-center text-red-500 font-bold">Demande introuvable</div>;

  const saveButtons = (mobile: boolean) => (
    <>
      <button
        onClick={() => saveDevis(true)}
        disabled={saving}
        className={`${mobile ? "w-full py-3.5" : "px-5 py-2.5"} bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-50`}
      >
        <Save size={16} /> Brouillon
      </button>
      <button
        onClick={() => saveDevis(false)}
        disabled={saving}
        className={`${mobile ? "w-full py-4" : "px-5 py-2.5"} bg-black text-[#f5eee1] font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm shadow-md disabled:opacity-50`}
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Envoyer la proposition
      </button>
    </>
  );

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <Link href="/prestataire/demandes" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 shrink-0" aria-label="Retour aux demandes">
              <ArrowLeft size={22} />
            </Link>
            <div className="min-w-0">
              <h1 className="font-serif text-xl sm:text-2xl text-gray-900 leading-tight truncate">Votre proposition de devis</h1>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5 truncate">
                <span className="w-2 h-2 rounded-full bg-[#b8924a] shrink-0"></span>
                Client : <span className="font-medium text-gray-700 truncate">{draft.clientName || demande.events?.profiles?.full_name || "—"}</span>
              </p>
            </div>
          </div>
          <div className="hidden md:flex gap-3">{saveButtons(false)}</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DevisForm
          draft={draft}
          setDraft={setDraft as React.Dispatch<React.SetStateAction<DevisDraft>>}
          providerId={providerId}
          providerCategoryIds={providerCategoryIds}
          onProviderCategoriesSaved={setProviderCategoryIds}
          before={
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setShowDemand(!showDemand)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#f3e8e2] text-[#6b1f2a] rounded-lg"><FileText size={20} /></div>
                  <div className="text-left">
                    <h2 className="font-serif text-xl text-gray-900">Demande de l'organisateur</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Consultez le besoin, les contraintes et les inspirations</p>
                  </div>
                </div>
                {showDemand ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
              </button>
              {showDemand && (
                <div className="p-6 md:p-8 border-t border-gray-100">
                  <DemandViewer demande={demande} />
                </div>
              )}
            </div>
          }
          actions={<div className="grid grid-cols-1 gap-3 md:hidden">{saveButtons(true)}</div>}
        />
      </main>
    </div>
  );
}
