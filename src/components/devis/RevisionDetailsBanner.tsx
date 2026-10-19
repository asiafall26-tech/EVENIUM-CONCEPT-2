'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  RefreshCw, CheckCircle, XCircle, MessageSquare, Edit3, 
  Paperclip, DollarSign, Calendar, AlertCircle, ArrowRight, X, Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { 
  buildRevisionAcknowledgedMessage, 
  buildRevisionRefusedMessage, 
  RevisionRequestData 
} from '@/lib/devis/revisionMessages';
import { useBadgeStore } from '@/store/BadgeStore';

interface RevisionDetailsBannerProps {
  devisId: string;
  devisReference?: string;
  clientId?: string;
  clientName?: string;
  providerName?: string;
  revisionData?: RevisionRequestData | null;
  currentStatus?: string;
  version?: number;
  onStatusChange?: (newStatus: string) => void;
  showEditButton?: boolean;
}

export function RevisionDetailsBanner({
  devisId,
  devisReference = "DEV",
  clientId,
  clientName = "L'organisateur",
  providerName = "Prestataire",
  revisionData,
  currentStatus,
  version = 1,
  onStatusChange,
  showEditButton = true
}: RevisionDetailsBannerProps) {
  const [isRefuseModalOpen, setIsRefuseModalOpen] = useState(false);
  const [refusalReason, setRefusalReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!revisionData && currentStatus !== 'Révision demandée' && currentStatus !== 'Modification demandée') {
    return null;
  }

  const subject = revisionData?.subject || "Ajustement général";
  const description = revisionData?.description || "Demande d'ajustement formulée par l'organisateur.";
  const budget = revisionData?.target_budget;
  const attachmentUrl = revisionData?.attachment_url;
  const attachmentName = revisionData?.attachment_name || "Pièce jointe";

  // Action 1: Prise en compte de la révision
  const handleAcknowledge = async () => {
    setIsProcessing(true);
    setFeedback(null);
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      // 1. Mettre à jour le statut du devis
      await supabase
        .from('devis')
        .update({ status: 'En cours de révision' })
        .eq('id', devisId);

      // 2. Historique
      await supabase.from('devis_status_history').insert({
        devis_id: devisId,
        status: 'En cours de révision',
        changed_by: user.id,
        comment: "Demande de révision prise en compte par le prestataire"
      });

      // 3. Envoyer le message exact 2 dans la conversation avec les vrais noms en personne
      if (clientId) {
        let realClientName = clientName;
        const { data: cProf } = await supabase.from('profiles').select('full_name').eq('id', clientId).maybeSingle();
        if (cProf?.full_name?.trim()) realClientName = cProf.full_name.trim();

        let realProviderName = providerName;
        const { data: pProf } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
        if (pProf?.full_name?.trim()) {
          realProviderName = pProf.full_name.trim();
        } else if (user.user_metadata?.full_name?.trim()) {
          realProviderName = user.user_metadata.full_name.trim();
        }

        const msgContent = buildRevisionAcknowledgedMessage({
          clientName: realClientName,
          providerName: realProviderName,
          devisReference
        });

        await supabase.from('messages').insert({
          sender_id: user.id,
          receiver_id: clientId,
          content: msgContent,
          is_read: false
        });
      }

      useBadgeStore.getState().refresh();
      setFeedback({ type: 'success', message: "Prise en compte enregistrée et organisateur notifié !" });
      if (onStatusChange) onStatusChange('En cours de révision');
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: err?.message || "Erreur lors de la prise en compte." });
    } finally {
      setIsProcessing(false);
    }
  };

  // Action 2: Refus de la révision avec motif
  const handleRefuse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (refusalReason.trim() === "") return;

    setIsProcessing(true);
    setFeedback(null);
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      // 1. Mettre à jour le statut du devis
      await supabase
        .from('devis')
        .update({ status: 'En attente de validation' }) // Le devis initial reste en attente ou valide
        .eq('id', devisId);

      // 2. Historique
      await supabase.from('devis_status_history').insert({
        devis_id: devisId,
        status: 'Révision refusée',
        changed_by: user.id,
        comment: `Révision refusée par le prestataire. Motif : ${refusalReason.trim()}`
      });

      // 3. Envoyer le message exact 4 dans la conversation avec les vrais noms en personne
      if (clientId) {
        let realClientName = clientName;
        const { data: cProf } = await supabase.from('profiles').select('full_name').eq('id', clientId).maybeSingle();
        if (cProf?.full_name?.trim()) realClientName = cProf.full_name.trim();

        let realProviderName = providerName;
        const { data: pProf } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
        if (pProf?.full_name?.trim()) {
          realProviderName = pProf.full_name.trim();
        } else if (user.user_metadata?.full_name?.trim()) {
          realProviderName = user.user_metadata.full_name.trim();
        }

        const msgContent = buildRevisionRefusedMessage({
          clientName: realClientName,
          providerName: realProviderName,
          devisReference,
          refusalReason: refusalReason.trim()
        });

        await supabase.from('messages').insert({
          sender_id: user.id,
          receiver_id: clientId,
          content: msgContent,
          is_read: false
        });
      }

      useBadgeStore.getState().refresh();
      setIsRefuseModalOpen(false);
      setFeedback({ type: 'success', message: "Refus de révision motivé et transmis à l'organisateur." });
      if (onStatusChange) onStatusChange('En attente de validation');
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: err?.message || "Erreur lors du refus." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-stone-50 border-2 border-amber-300/80 rounded-3xl p-6 md:p-7 shadow-sm mb-8 animate-in fade-in duration-300">
        
        {/* En-tête de la demande de révision */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8f6f33] text-white flex items-center justify-center shadow-xs shrink-0">
              <RefreshCw size={20} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 tracking-wider">
                  Révision demandée · v{version}
                </span>
                <span className="text-xs font-bold text-stone-600">Devis {devisReference}</span>
              </div>
              <h2 className="font-serif text-lg font-bold text-stone-900 mt-0.5">
                {clientName} a demandé un ajustement sur ce devis
              </h2>
            </div>
          </div>

          {clientId && (
            <Link
              href={`/prestataire/messages?contact=${clientId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-300 text-stone-800 hover:text-stone-950 font-bold text-xs rounded-xl shadow-2xs hover:bg-stone-50 transition-all self-start sm:self-auto"
            >
              <MessageSquare size={14} className="text-[#8f6f33]" />
              <span>Échanger avec le client</span>
            </Link>
          )}
        </div>

        {/* Détails de la demande */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-amber-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
              Objet de l'ajustement
            </span>
            <span className="font-bold text-sm text-stone-900">{subject}</span>
          </div>

          {budget && (
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-amber-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1 flex items-center gap-1">
                <DollarSign size={12} className="text-[#8f6f33]" /> Budget souhaité
              </span>
              <span className="font-serif font-bold text-base text-[#8f6f33]">
                {budget.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          )}

          {attachmentUrl && (
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-amber-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1 flex items-center gap-1">
                <Paperclip size={12} className="text-[#8f6f33]" /> Pièce jointe
              </span>
              <a 
                href={attachmentUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 truncate"
              >
                <span>{attachmentName}</span>
                <ArrowRight size={12} />
              </a>
            </div>
          )}
        </div>

        {/* Précisions & Instructions */}
        <div className="bg-white p-4.5 rounded-2xl border border-amber-200/80 mb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
            Détail des modifications demandées par l'organisateur :
          </span>
          <p className="text-sm text-stone-900 whitespace-pre-wrap leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {feedback && (
          <div className={`p-3 rounded-xl text-xs font-bold mb-4 flex items-center gap-2 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* 4 Actions du Prestataire */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2.5">
            {currentStatus !== 'En cours de révision' && (
              <button
                type="button"
                onClick={handleAcknowledge}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle size={14} className="text-emerald-600" />
                <span>Prendre en compte la révision</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsRefuseModalOpen(true)}
              disabled={isProcessing}
              className="px-4 py-2.5 bg-white border border-red-200 text-red-700 hover:bg-red-50 font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <XCircle size={14} className="text-red-600" />
              <span>Décliner la révision (avec motif)</span>
            </button>
          </div>

          {showEditButton && (
            <Link
              href={`/prestataire/devis/${devisId}/edit`}
              className="px-6 py-2.5 bg-[#8f6f33] hover:bg-[#7a5e2b] text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Edit3 size={15} />
              <span>Modifier et transmettre la nouvelle version (v{version + 1})</span>
            </Link>
          )}
        </div>

      </div>

      {/* Modal Motif de refus par le prestataire */}
      {isRefuseModalOpen && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4.5 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                  Décliner l'ajustement demandé
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Motif du refus de la révision
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRefuseModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRefuse} className="p-6 space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                Veuillez expliquer à l'organisateur la raison pour laquelle vous ne pouvez pas donner suite à cette demande (ex. tarif plancher atteint, contraintes de disponibilité ou de matériel). Votre devis initial restera valable s'il est encore dans son délai de validité.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Motif du refus <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={refusalReason}
                  onChange={(e) => setRefusalReason(e.target.value)}
                  placeholder="Ex : Notre formule essentielle est déjà au tarif le plus bas possible compte tenu des charges logistiques..."
                  className="w-full border border-stone-200 rounded-xl p-3.5 text-sm text-stone-900 placeholder:text-stone-400 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-red-400 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsRefuseModalOpen(false)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || refusalReason.trim() === ""}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  <span>Confirmer le refus</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
