'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, Upload, DollarSign, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { buildRevisionRequestMessage, RevisionRequestData } from '@/lib/devis/revisionMessages';
import { useBadgeStore } from '@/store/BadgeStore';

interface QuoteRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  devis: {
    id: string;
    reference?: string;
    version?: number;
    total?: number;
    subtotal?: number;
    prestataire_id?: string;
    client_id?: string;
    event_id?: string;
    demande_id?: string;
    events?: {
      name?: string;
      type?: string;
      date?: string;
    };
    demandes_devis?: {
      service_name?: string;
      client_name?: string;
    };
    profiles?: {
      full_name?: string;
    };
    clientProfile?: {
      full_name?: string;
    };
  };
}

const REVISION_SUBJECTS = [
  "Prix / Budget",
  "Quantités demandées",
  "Prestations & Options incluses",
  "Date ou planning d'intervention",
  "Autre ajustement sur-mesure"
];

export function QuoteRevisionModal({ isOpen, onClose, onSuccess, devis }: QuoteRevisionModalProps) {
  const [subject, setSubject] = useState(REVISION_SUBJECTS[0]);
  const [description, setDescription] = useState("");
  const [targetBudget, setTargetBudget] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !devis) return null;

  const currentVersion = devis.version || 1;
  const devisRef = devis.reference || `DEV-${devis.id.substring(0, 8).toUpperCase()}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() === "") {
      setError("Veuillez détailler les modifications souhaitées.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Vous devez être connecté pour demander une révision.");
      }

      // 1. Upload de la pièce jointe facultative
      let attachmentUrl: string | null = null;
      let attachmentName: string | null = null;

      if (file) {
        attachmentName = file.name;
        const fileExt = file.name.split('.').pop();
        const fileName = `revision_${devis.id}_v${currentVersion}_${Date.now()}.${fileExt}`;
        const filePath = `devis_revisions/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('evenium_assets')
          .upload(filePath, file);

        if (!uploadError) {
          const { data: pubData } = supabase.storage.from('evenium_assets').getPublicUrl(filePath);
          attachmentUrl = pubData.publicUrl;
        } else {
          console.warn("Storage upload notice:", uploadError.message);
        }
      }

      const parsedBudget = targetBudget ? Number(targetBudget) : null;

      // 1.b. Récupérer le nom de l'organisateur connecté en personne (depuis profiles / auth)
      let clientDisplayName = "";
      const { data: myProfile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      if (myProfile?.full_name?.trim()) {
        clientDisplayName = myProfile.full_name.trim();
      } else if (user.user_metadata?.full_name?.trim()) {
        clientDisplayName = user.user_metadata.full_name.trim();
      } else if (devis.clientProfile?.full_name?.trim()) {
        clientDisplayName = devis.clientProfile.full_name.trim();
      } else if (devis.demandes_devis?.client_name?.trim()) {
        clientDisplayName = devis.demandes_devis.client_name.trim();
      } else {
        clientDisplayName = "L'organisateur";
      }

      // 1.c. Récupérer le nom réel du prestataire en personne
      let providerDisplayName = "";
      if (devis.prestataire_id) {
        const { data: provProf } = await supabase.from('profiles').select('full_name').eq('id', devis.prestataire_id).maybeSingle();
        if (provProf?.full_name?.trim()) {
          providerDisplayName = provProf.full_name.trim();
        } else if (devis.profiles?.full_name?.trim()) {
          providerDisplayName = devis.profiles.full_name.trim();
        } else {
          providerDisplayName = "Prestataire";
        }
      } else {
        providerDisplayName = "Prestataire";
      }

      // 2. Structurer les données de la demande de révision
      const revisionPayload: RevisionRequestData = {
        devis_id: devis.id,
        devis_reference: devisRef,
        version: currentVersion,
        subject,
        description: description.trim(),
        target_budget: parsedBudget,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        created_at: new Date().toISOString(),
        client_id: user.id,
        client_name: clientDisplayName,
        provider_id: devis.prestataire_id,
        provider_name: providerDisplayName,
        event_name: devis.events?.name || devis.events?.type || "votre événement",
        service_name: devis.demandes_devis?.service_name || "la prestation"
      };

      // 3. Mettre à jour le statut du devis en "Révision demandée"
      const { error: updateDevisError } = await supabase
        .from('devis')
        .update({ status: 'Révision demandée' })
        .eq('id', devis.id);

      if (updateDevisError) {
        throw new Error("Erreur de mise à jour du devis : " + updateDevisError.message);
      }

      // 4. Mettre à jour la demande liée si applicable
      if (devis.demande_id) {
        await supabase
          .from('demandes_devis')
          .update({ status: 'Révision demandée' })
          .eq('id', devis.demande_id);
      } else if (devis.event_id && devis.prestataire_id) {
        await supabase
          .from('demandes_devis')
          .update({ status: 'Révision demandée' })
          .eq('event_id', devis.event_id)
          .eq('prestataire_id', devis.prestataire_id);
      }

      // 5. Enregistrer dans l'historique des statuts avec la charge utile complète
      await supabase.from('devis_status_history').insert({
        devis_id: devis.id,
        status: 'Révision demandée',
        changed_by: user.id,
        comment: JSON.stringify(revisionPayload)
      });

      // 6. Tenter l'enregistrement dans devis_revisions si la table existe
      try {
        await supabase.from('devis_revisions').insert({
          devis_id: devis.id,
          version_number: currentVersion,
          subject,
          description: description.trim(),
          target_budget: parsedBudget,
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
          status: 'En attente de traitement'
        });
      } catch (err) {
        // Table optionnelle, l'historique JSON suffit amplement
      }

      // 7. Notifier immédiatement le prestataire dans la messagerie avec le format exact
      if (devis.prestataire_id) {
        const messageContent = buildRevisionRequestMessage({
          providerName: providerDisplayName,
          clientName: clientDisplayName,
          devisReference: devisRef,
          serviceName: devis.demandes_devis?.service_name || "la prestation",
          eventName: devis.events?.name || devis.events?.type || "votre événement",
          subject,
          description: description.trim(),
          targetBudget: parsedBudget,
          attachmentUrl,
          attachmentName,
          version: currentVersion
        });

        await supabase.from('messages').insert({
          event_id: devis.event_id || null,
          sender_id: user.id,
          receiver_id: devis.prestataire_id,
          content: messageContent,
          is_read: false
        });
      }

      // Rafraîchir les compteurs et fermer
      useBadgeStore.getState().refresh();
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erreur demande révision :", err);
      setError(err?.message || "Une erreur est survenue lors de l'envoi de la demande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-stone-200 my-8">
        
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center bg-[#faf8f5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#8f6f33]/15 text-[#6d5322] uppercase tracking-wider mb-1">
              Devis {devisRef} · v{currentVersion}
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Demander une révision de devis
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-stone-400 hover:text-stone-900 p-2 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Objet de la révision */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Objet de la révision <span className="text-[#8f6f33]">*</span>
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-stone-200 rounded-xl p-3 text-sm font-medium text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#8f6f33] focus:border-transparent outline-none transition-all cursor-pointer"
            >
              {REVISION_SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <p className="text-[11px] text-stone-500 mt-1">
              Précisez le domaine principal concerné par cet ajustement.
            </p>
          </div>

          {/* 2. Description détaillée */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Description détaillée des modifications souhaitées <span className="text-[#8f6f33]">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex : Pourriez-vous retirer l'option sonorisation, ajuster le nombre d'invités à 120 au lieu de 150, et nous proposer une alternative sur la formule traiteur..."
              className="w-full border border-stone-200 rounded-xl p-3.5 text-sm text-stone-900 placeholder:text-stone-500 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#8f6f33] focus:border-transparent outline-none resize-y transition-all min-h-[110px]"
            />
          </div>

          {/* 3. Budget souhaité (facultatif) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center justify-between">
              <span>Budget souhaité (facultatif)</span>
              <span className="text-[11px] font-normal text-stone-600">Actuel : {Number(devis.total || 0).toLocaleString('fr-FR')} FCFA</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-600">
                <DollarSign size={16} />
              </div>
              <input
                type="number"
                min="0"
                step="1000"
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                placeholder="Ex : 400000"
                className="w-full pl-9 pr-16 py-3 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 placeholder:text-stone-600 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#8f6f33] focus:border-transparent outline-none"
              />
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-stone-500 pointer-events-none">
                FCFA
              </span>
            </div>
            <p className="text-[11px] text-stone-600 mt-1">
              Indiquez votre enveloppe budgétaire indicative pour aider le prestataire à vous proposer une alternative adaptée.
            </p>
          </div>

          {/* 4. Pièce jointe (facultative) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Pièce jointe (facultative)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-stone-300 hover:border-[#8f6f33] bg-stone-50 hover:bg-white text-xs font-bold text-stone-700 transition-all">
                <Upload size={14} className="text-[#8f6f33]" />
                <span>{file ? "Changer de fichier" : "Ajouter un fichier (PDF, image)"}</span>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                    }
                  }}
                />
              </label>
              {file && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-800 bg-stone-100 px-3 py-1.5 rounded-lg">
                  <FileText size={14} className="text-[#8f6f33]" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <button type="button" onClick={() => setFile(null)} className="ml-1 text-stone-400 hover:text-stone-700">
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || description.trim() === ""}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#8f6f33] hover:bg-[#7a5e2b] text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Envoyer ma demande de révision</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
