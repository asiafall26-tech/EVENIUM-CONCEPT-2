"use client";

import { use, useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, Save, Send, FileText, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import DemandViewer from "@/components/prestataire/DemandViewer";
import { RevisionDetailsBanner } from "@/components/devis/RevisionDetailsBanner";
import { DevisVersionHistory } from "@/components/devis/DevisVersionHistory";
import { DevisForm } from "@/components/devis/DevisForm";
import { buildNewVersionMessage, RevisionRequestData } from "@/lib/devis/revisionMessages";
import { useBadgeStore } from "@/store/BadgeStore";
import {
  draftAmounts,
  draftFromDevis,
  fetchProvider,
  linesSummary,
  writeDevis,
  writeLines,
  type DevisDraft,
} from "@/lib/devis/persist";

export default function EditDevisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [devis, setDevis] = useState<any>(null);
  /** État enregistré avant modification : archivé comme version précédente */
  const [original, setOriginal] = useState<{ items: any[]; options: any[] }>({ items: [], options: [] });
  const [demande, setDemande] = useState<any>(null);
  const [showDemand, setShowDemand] = useState(false);
  const [revisionData, setRevisionData] = useState<RevisionRequestData | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [providerCategoryIds, setProviderCategoryIds] = useState<string[]>([]);
  const [draft, setDraft] = useState<DevisDraft | null>(null);

  const fetchDevis = useCallback(async () => {
    const { data } = await supabase
      .from('devis')
      .select('*, profiles:prestataire_id(full_name), demandes_devis(*, events(*, profiles:client_id(full_name)))')
      .eq('id', id)
      .single();

    if (data) {
      const [{ data: itemsData }, { data: optsData }, { data: histData }, { data: auth }] = await Promise.all([
        supabase.from('devis_items').select('*').eq('devis_id', id).order('created_at', { ascending: true }),
        supabase.from('devis_options').select('*').eq('devis_id', id),
        supabase.from('devis_status_history').select('*').eq('devis_id', id).order('created_at', { ascending: false }),
        supabase.auth.getUser(),
      ]);

      const pid = auth.user?.id || data.prestataire_id;
      const { categoryIds } = await fetchProvider(supabase, pid);

      setDevis(data);
      setDemande(data.demandes_devis);
      setOriginal({ items: itemsData || [], options: optsData || [] });
      setProviderId(pid);
      setProviderCategoryIds(categoryIds);
      setDraft(draftFromDevis(data, itemsData || [], optsData || [], data.demandes_devis, categoryIds));

      // Dernière demande de révision du client
      const revHist = (histData || []).find((h: any) => h.status === 'Révision demandée' || h.status === 'Modification demandée');
      if (revHist?.comment) {
        try {
          const parsed = JSON.parse(revHist.comment);
          setRevisionData(
            parsed && typeof parsed === 'object'
              ? {
                  subject: parsed.subject || 'Ajustement général',
                  description: parsed.description || revHist.comment,
                  target_budget: parsed.target_budget,
                  attachment_url: parsed.attachment_url,
                  attachment_name: parsed.attachment_name,
                  created_at: parsed.created_at || revHist.created_at,
                }
              : { subject: 'Ajustement général', description: revHist.comment }
          );
        } catch {
          setRevisionData({ subject: 'Ajustement général', description: revHist.comment });
        }
      }
    }
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    fetchDevis();
  }, [fetchDevis]);

  const saveDevis = async (isDraft: boolean) => {
    if (!devis || !draft || isSaving) return;
    if (!isDraft && !draft.items.some((i) => i.designation.trim() && i.total > 0)) {
      alert("Ajoutez au moins une prestation avec un service et un prix avant d'envoyer le devis.");
      return;
    }
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const oldTotal = Number(devis.total) || 0;
      const currentVersion = devis.version || 1;
      // Un devis encore jamais envoyé reste en v1 ; sinon chaque envoi crée une nouvelle version
      const wasSent = !devis.is_draft && !!devis.sent_at;
      const newVersion = isDraft || !wasSent ? currentVersion : currentVersion + 1;

      // 1. Archiver la version envoyée précédemment, telle qu'elle était
      if (!isDraft && wasSent) {
        const { demandes_devis: _d, profiles: _p, ...devisRow } = devis;
        await supabase.from('devis_versions').insert({
          devis_id: id,
          version_number: currentVersion,
          data: {
            devis: devisRow,
            items: original.items,
            options: original.options,
            created_at: new Date().toISOString(),
            created_by: user?.id,
          },
        });
      }

      // 2. Mettre à jour le devis
      const { error: devisError, degraded } = await writeDevis(
        supabase,
        draft,
        {
          version: newVersion,
          is_draft: isDraft,
          status: isDraft ? 'Brouillon' : wasSent ? 'Nouvelle version envoyée' : 'En attente de validation',
          sent_at: isDraft ? devis.sent_at : new Date().toISOString(),
        },
        { id }
      );
      if (devisError) throw new Error("Erreur lors de la mise à jour du devis : " + devisError.message);

      // 3. Remplacer les prestations et les frais
      const { error: linesError } = await writeLines(supabase, id, draft);
      if (linesError) throw new Error("Les prestations n'ont pas pu être enregistrées : " + linesError.message);

      if (!isDraft) {
        const newTotal = draftAmounts(draft).total;

        await supabase.from('devis_status_history').insert({
          devis_id: id,
          status: wasSent ? 'Nouvelle version envoyée' : 'En attente de validation',
          changed_by: user?.id,
          comment: wasSent ? `Nouvelle version (v${newVersion}) transmise à l'organisateur` : "Proposition de devis transmise à l'organisateur",
        });

        if (demande?.id) {
          await supabase.from('demandes_devis').update({ status: 'Devis envoyé' }).eq('id', demande.id);
        }

        // Message automatique dans la conversation
        const clientId = demande?.events?.client_id || demande?.client_id || devis?.client_id;
        if (clientId && user?.id) {
          const { data: cProf } = await supabase.from('profiles').select('full_name').eq('id', clientId).maybeSingle();
          const clientName =
            cProf?.full_name?.trim() || draft.clientName.trim() || demande?.client_name?.trim() || demande?.events?.profiles?.full_name?.trim() || "L'organisateur";

          const { data: pProf } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
          const providerName =
            pProf?.full_name?.trim() || user.user_metadata?.full_name?.trim() || devis.profiles?.full_name?.trim() || "Le prestataire";

          const eventName = draft.eventName || demande?.events?.name || "Votre événement";
          const reference = draft.reference || devis.reference || `DEV-${id.slice(0, 6).toUpperCase()}`;
          const summary = linesSummary(draft);

          const messageText = wasSent
            ? buildNewVersionMessage({
                clientName,
                prestataireName: providerName,
                eventName,
                devisReference: reference,
                versionNumber: newVersion,
                oldTotal,
                newTotal,
              })
            : `Bonjour ${clientName},\n\nJ'ai le plaisir de vous transmettre ma proposition de devis n° ${reference} pour un montant de ${newTotal.toLocaleString('fr-FR')} FCFA pour votre événement « ${eventName} ».` +
              (summary ? `\n\nPrestations proposées :\n${summary}` : "") +
              `\n\nVous pouvez la consulter et la valider dans votre espace Devis.`;

          await supabase.from('messages').insert({
            event_id: devis.event_id || demande?.event_id || null,
            sender_id: user.id,
            receiver_id: clientId,
            content: messageText,
            is_read: false,
          });
        }

        useBadgeStore.getState().refresh();
      }

      const done = isDraft ? "Brouillon mis à jour" : wasSent ? `Nouvelle version (v${newVersion}) envoyée à l'organisateur` : "Proposition de devis envoyée";
      alert(
        degraded
          ? `${done}.\n\nAttention : la base de données n'est pas encore à jour. Les détails spécifiques à votre activité, la TVA et la caution n'ont pas été enregistrés. Exécutez le script « supabase_devis_personnalisation.sql » dans Supabase.`
          : `${done} !`
      );
      router.push('/prestataire/demandes');
    } catch (err: any) {
      console.error("Erreur saveDevis :", err);
      alert("Une erreur est survenue : " + (err?.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b8924a]"></div></div>;
  if (!devis || !draft) return <div className="p-20 text-center text-red-500 font-bold">Devis introuvable</div>;

  const wasSent = !devis.is_draft && !!devis.sent_at;
  const nextVersion = wasSent ? (devis.version || 1) + 1 : devis.version || 1;

  const saveButtons = (mobile: boolean) => (
    <>
      <button
        onClick={() => saveDevis(true)}
        disabled={isSaving}
        className={`${mobile ? "w-full py-3.5" : "px-5 py-2.5"} bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-50`}
      >
        <Save size={16} /> Brouillon
      </button>
      <button
        onClick={() => saveDevis(false)}
        disabled={isSaving}
        className={`${mobile ? "w-full py-4" : "px-5 py-2.5"} bg-black text-[#f5eee1] font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm shadow-md disabled:opacity-50`}
      >
        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {wasSent ? "Envoyer la nouvelle version" : "Envoyer la proposition"}
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
              <h1 className="font-serif text-xl sm:text-2xl text-gray-900 leading-tight truncate">
                {wasSent ? `Réviser le devis (v${nextVersion})` : "Modifier le devis"}
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5 truncate">
                <span className="w-2 h-2 rounded-full bg-[#b8924a] shrink-0"></span>
                Client : <span className="font-medium text-gray-700 truncate">{draft.clientName || demande?.events?.profiles?.full_name || "—"}</span>
              </p>
            </div>
          </div>
          <div className="hidden md:flex gap-3">{saveButtons(false)}</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RevisionDetailsBanner
          devisId={id}
          devisReference={draft.reference || devis.reference}
          clientId={demande?.events?.client_id || demande?.client_id}
          clientName={demande?.client_name || demande?.events?.profiles?.full_name}
          providerName={devis.profiles?.full_name}
          revisionData={revisionData}
          currentStatus={devis.status}
          version={devis.version || 1}
          onStatusChange={(newStatus) => {
            setDevis((prev: any) => ({ ...prev, status: newStatus }));
          }}
          showEditButton={false}
        />

        <div className="mb-8">
          <DevisVersionHistory devisId={id} currentVersion={devis.version || 1} currentTotal={draftAmounts(draft).total} />
        </div>

        <DevisForm
          draft={draft}
          setDraft={setDraft as React.Dispatch<React.SetStateAction<DevisDraft>>}
          providerId={providerId}
          providerCategoryIds={providerCategoryIds}
          onProviderCategoriesSaved={setProviderCategoryIds}
          before={
            demande ? (
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
            ) : null
          }
          actions={<div className="grid grid-cols-1 gap-3 md:hidden">{saveButtons(true)}</div>}
        />
      </main>
    </div>
  );
}
