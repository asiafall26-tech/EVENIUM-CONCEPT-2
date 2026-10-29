"use client";

import { useState, useEffect, useRef } from "react";
import { 
  LifeBuoy, Send, List, Plus, CheckCircle, Clock, MoreHorizontal, 
  Mic, Paperclip, X, FileText, Image as ImageIcon, Film, Download, 
  Trash2, ChevronRight, ArrowLeft, Loader2, Volume2, ShieldCheck, 
  Sparkles, AlertCircle 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { createSupportTicket, getUserSupportTickets, type SupportAttachment } from "@/app/actions/support";
import { VoiceRecorder } from "@/components/messaging/VoiceRecorder";
import { AudioMessagePlayer } from "@/components/messaging/AudioMessagePlayer";

const SUBJECT_SUGGESTIONS = [
  "Facturation & Paiement",
  "Devis & Négociation",
  "Question Prestataire",
  "Bug ou Problème technique",
  "Compte & Profil",
  "Autre demande"
];

export function ContactSupportButton({ className = "" }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  
  // Form states
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audio recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // Attachments state
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // History & Ticket detail state
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === "history") {
      fetchHistory();
    }
  }, [isOpen, activeTab]);

  const fetchHistory = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await getUserSupportTickets(user.id);
      setTickets(data || []);
    }
    setLoading(false);
  };

  // Upload d'une note vocale vers Supabase via /api/upload
  const handleSendVoiceNote = async (blob: Blob, durationSeconds: number) => {
    try {
      setIsUploadingAudio(true);
      const mime = blob.type || "audio/webm";
      const ext = mime.includes("mp4") ? "m4a" : mime.includes("ogg") ? "ogg" : "webm";
      const file = new File([blob], `support-vocal-${Date.now()}.${ext}`, { type: mime });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "support");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Échec de l'upload de la note vocale");
      }

      setAudioUrl(json.url);
      setAudioDuration(durationSeconds);
      setIsRecordingVoice(false);
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement audio : " + (err?.message || err));
    } finally {
      setIsUploadingAudio(false);
    }
  };

  // Upload d'un fichier quelconque (PDF, Image, Document, etc.)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      setIsUploadingFile(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "support");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Échec de l'upload du fichier");
      }

      const lowerName = file.name.toLowerCase();
      let type: "image" | "video" | "audio" | "file" = "file";
      if (/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(lowerName)) type = "image";
      else if (/\.(mp4|webm|mov)$/i.test(lowerName)) type = "video";
      else if (/\.(mp3|wav|ogg|m4a)$/i.test(lowerName)) type = "audio";

      setAttachments((prev) => [
        ...prev,
        {
          name: file.name,
          url: json.url,
          size: file.size,
          type,
        },
      ]);
    } catch (err: any) {
      alert("Erreur lors de l'envoi de la pièce jointe : " + (err?.message || err));
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      alert("Veuillez renseigner le sujet de votre réclamation.");
      return;
    }
    if (!message.trim() && !audioUrl && attachments.length === 0) {
      alert("Veuillez détailler votre problème par texte, note vocale ou pièce jointe.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Veuillez vous connecter pour contacter le support.");
      setIsSubmitting(false);
      return;
    }

    const result = await createSupportTicket(
      user.id, 
      subject.trim(), 
      message.trim(), 
      attachments, 
      audioUrl || undefined, 
      audioDuration || undefined
    );
    
    setIsSubmitting(false);

    if (result.error) {
      alert("Erreur: " + result.error);
    } else {
      alert("Votre réclamation a bien été transmise au support Evenium. Nos conseillers traitent votre demande en priorité !");
      setSubject("");
      setMessage("");
      setAudioUrl(null);
      setAudioDuration(0);
      setAttachments([]);
      setActiveTab("history");
      fetchHistory();
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  const getStatusBadge = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'résolu':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 shadow-2xs">
            <CheckCircle size={12} /> Résolu
          </span>
        );
      case 'en cours':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <Clock size={12} /> En cours de traitement
          </span>
        );
      case 'en attente':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#faf6ee] text-[#8f6f33] border border-[#b8924a]/30 shadow-2xs">
            <MoreHorizontal size={12} /> En attente
          </span>
        );
    }
  };

  return (
    <>
      <button 
        type="button"
        onClick={() => { setIsOpen(true); setActiveTab("new"); }}
        className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-sm w-full text-left text-gray-600 hover:bg-red-50 hover:text-red-600 cursor-pointer ${className}`}
      >
        <LifeBuoy size={20} strokeWidth={1.5} />
        Support & Réclamations
      </button>

      {/* GRAND PLAN - Modal Plein Écran Luxueux et Élargi */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[80] flex items-center justify-center p-0 sm:p-4 lg:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-[#faf8f5] w-full sm:max-w-5xl lg:max-w-6xl h-dvh sm:h-[90vh] rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border border-stone-200 flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Conciergerie */}
            <div className="shrink-0 bg-stone-900 text-white px-4 sm:px-8 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sm:py-5 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-stone-950 flex items-center justify-center shadow-md shrink-0">
                  <LifeBuoy size={22} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-base sm:text-xl font-bold tracking-tight text-[#fdfaf5] truncate">
                      Support & Réclamations Evenium
                    </h2>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#b8924a]/20 text-[#d9c08c] border border-[#b8924a]/30">
                      <Sparkles size={10} /> Conciergerie Pro
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-1 sm:line-clamp-none">
                    Assistance dédiée, traitement prioritaire avec messages vocaux et pièces jointes.
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                title="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="shrink-0 bg-white border-b border-stone-200/80 px-4 sm:px-8 flex gap-4 sm:gap-6">
              <button 
                type="button"
                onClick={() => { setActiveTab("new"); setSelectedTicket(null); }}
                className={`py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === "new" 
                    ? "text-[#b8924a] border-[#b8924a]" 
                    : "text-stone-500 border-transparent hover:text-stone-900"
                }`}
              >
                <Plus size={15} /> Nouvelle Demande
              </button>
              <button 
                type="button"
                onClick={() => { setActiveTab("history"); setSelectedTicket(null); }}
                className={`py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === "history" 
                    ? "text-[#b8924a] border-[#b8924a]" 
                    : "text-stone-500 border-transparent hover:text-stone-900"
                }`}
              >
                <List size={15} /> Mes Réclamations ({tickets.length})
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {activeTab === "new" ? (
                <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6">
                  {/* Sujet */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Sujet de votre demande *
                    </label>
                    <input 
                      required
                      type="text" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Ex: Facturation formulaire Gold, Annulation de prestation, etc."
                      className="w-full px-4 py-3 bg-white border border-stone-300 rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50 shadow-2xs font-medium"
                    />

                    {/* Chips de suggestions */}
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {SUBJECT_SUGGESTIONS.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setSubject(sug)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-stone-200 text-stone-700 hover:border-[#b8924a] hover:text-[#b8924a] hover:bg-[#faf6ee] transition-all cursor-pointer shadow-2xs"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message texte */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Explication détaillée
                    </label>
                    <textarea 
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Expliquez en détail la situation rencontrée. Vous pouvez également enregistrer une note vocale ci-dessous pour expliquer de vive voix..."
                      className="w-full px-4 py-3.5 bg-white border border-stone-300 rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#b8924a]/50 shadow-2xs resize-none"
                    />
                  </div>

                  {/* NOTE VOCALE & AUDIO (Fonctionnalité Messagerie) */}
                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-2">
                        <Mic size={15} className="text-[#b8924a]" /> Note Vocale Support
                      </span>
                      {audioUrl && (
                        <button
                          type="button"
                          onClick={() => { setAudioUrl(null); setAudioDuration(0); }}
                          className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <Trash2 size={12} /> Supprimer le vocal
                        </button>
                      )}
                    </div>

                    {isRecordingVoice ? (
                      <VoiceRecorder 
                        onCancel={() => setIsRecordingVoice(false)} 
                        onSendAudio={handleSendVoiceNote} 
                      />
                    ) : audioUrl ? (
                      <div className="p-3 bg-[#faf6ee] rounded-xl border border-[#b8924a]/30">
                        <AudioMessagePlayer src={audioUrl} duration={audioDuration} isMe={false} />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsRecordingVoice(true)}
                        disabled={isUploadingAudio}
                        className="w-full py-3 px-4 border-2 border-dashed border-stone-300 hover:border-[#b8924a] rounded-xl text-stone-600 hover:text-[#b8924a] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer bg-stone-50/50"
                      >
                        {isUploadingAudio ? (
                          <><Loader2 size={15} className="animate-spin" /> Enregistrement audio en cours...</>
                        ) : (
                          <><Mic size={16} /> Cliquez pour enregistrer un message vocal (comme sur WhatsApp)</>
                        )}
                      </button>
                    )}
                  </div>

                  {/* PIÈCES JOINTES (N'importe quel type de fichier) */}
                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-2">
                        <Paperclip size={15} className="text-[#b8924a]" /> Pièces jointes & Documents
                      </span>
                      <span className="text-[11px] text-stone-400">PDF, Word, Excel, Images, Vidéos, ZIP</span>
                    </div>

                    {/* Liste des fichiers attachés */}
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        {attachments.map((att, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between p-2.5 px-3 bg-[#faf8f5] border border-stone-200 rounded-xl"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {att.type === "image" ? (
                                <ImageIcon size={18} className="text-[#b8924a] shrink-0" />
                              ) : att.type === "video" ? (
                                <Film size={18} className="text-purple-600 shrink-0" />
                              ) : (
                                <FileText size={18} className="text-blue-600 shrink-0" />
                              )}
                              <span className="text-xs font-medium text-stone-900 truncate">{att.name}</span>
                              <span className="text-[10px] text-stone-400 shrink-0">({formatFileSize(att.size)})</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                              className="text-stone-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                              title="Retirer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <input 
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
                      onChange={handleFileUpload}
                    />

                    <button
                      type="button"
                      disabled={isUploadingFile}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 border border-stone-300 hover:border-[#b8924a] rounded-xl text-stone-600 hover:text-[#b8924a] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer bg-stone-50/50"
                    >
                      {isUploadingFile ? (
                        <><Loader2 size={14} className="animate-spin" /> Téléversement du document...</>
                      ) : (
                        <><Paperclip size={14} /> + Ajouter un fichier ou document justificatif</>
                      )}
                    </button>
                  </div>

                  {/* Actions bas de formulaire */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-0">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-5 py-3 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isUploadingAudio || isUploadingFile}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#b8924a] to-[#d4af37] text-stone-950 text-xs font-bold flex items-center gap-2 shadow-md hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</>
                      ) : (
                        <><Send size={15} /> Envoyer la réclamation au support</>
                      )}
                    </button>
                  </div>
                </form>
              ) : selectedTicket ? (
                /* VUE DÉTAILLÉE D'UNE RÉCLAMATION */
                <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-0">
                  <button 
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b8924a] hover:underline cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Retour à mes réclamations
                  </button>

                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-5">
                      <div>
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-950">
                          {selectedTicket.subject}
                        </h3>
                        <p className="text-xs text-stone-400 mt-1">
                          Soumis le {new Date(selectedTicket.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} à {new Date(selectedTicket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div>{getStatusBadge(selectedTicket.status)}</div>
                    </div>

                    {/* Message texte de l'utilisateur */}
                    {selectedTicket.cleanMessage && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Votre message :</span>
                        <div className="p-4 rounded-2xl bg-[#faf8f5] border border-stone-200 text-stone-800 text-sm leading-relaxed whitespace-pre-wrap">
                          {selectedTicket.cleanMessage}
                        </div>
                      </div>
                    )}

                    {/* Note vocale si présente */}
                    {selectedTicket.audioUrl && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#b8924a] flex items-center gap-1.5">
                          <Volume2 size={14} /> Note vocale jointe :
                        </span>
                        <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#b8924a]/30">
                          <AudioMessagePlayer src={selectedTicket.audioUrl} duration={selectedTicket.audioDuration} isMe={false} />
                        </div>
                      </div>
                    )}

                    {/* Pièces jointes si présentes */}
                    {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                          <Paperclip size={14} /> Documents joints ({selectedTicket.attachments.length}) :
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedTicket.attachments.map((att: SupportAttachment, i: number) => (
                            <a
                              key={i}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200 hover:border-[#b8924a] hover:bg-[#faf6ee]/50 transition-all shadow-2xs group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {att.type === "image" ? (
                                  <ImageIcon size={18} className="text-[#b8924a] shrink-0" />
                                ) : (
                                  <FileText size={18} className="text-blue-600 shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-stone-900 truncate group-hover:text-[#8f6f33]">{att.name}</p>
                                  {att.size && <p className="text-[10px] text-stone-400">{formatFileSize(att.size)}</p>}
                                </div>
                              </div>
                              <Download size={15} className="text-stone-400 group-hover:text-[#8f6f33] shrink-0 ml-2" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suivi Evenium Support */}
                    <div className="pt-4 border-t border-stone-100 flex items-center gap-3 bg-[#fbf7f0] p-4 rounded-2xl border border-[#b8924a]/20">
                      <ShieldCheck size={24} className="text-[#b8924a] shrink-0" />
                      <div className="text-xs text-stone-700">
                        <p className="font-bold text-stone-900">Traitement en direct par les équipes Evenium</p>
                        <p className="text-stone-500 mt-0.5">
                          Dès qu'un conseiller traite ou résout votre demande, une confirmation vous sera envoyée dans votre messagerie globale.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* LISTE DE L'HISTORIQUE */
                <div className="w-full max-w-4xl mx-auto space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-0">
                  {loading ? (
                    <div className="py-16 text-center text-stone-500 font-medium">
                      <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#b8924a]" />
                      Chargement de vos réclamations...
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 p-8">
                      <div className="w-12 h-12 rounded-full bg-[#faf6ee] text-[#b8924a] flex items-center justify-center mx-auto">
                        <LifeBuoy size={24} />
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm">Aucune réclamation enregistrée</h4>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto">
                        Vous n'avez soumis aucune demande pour le moment. Besoin d'aide sur un événement ou un devis ?
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("new")}
                        className="mt-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
                      >
                        Créer une demande
                      </button>
                    </div>
                  ) : (
                    tickets.map((t) => (
                      <div 
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#b8924a] hover:shadow-md transition-all cursor-pointer group space-y-2"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-bold text-sm text-stone-950 group-hover:text-[#8f6f33] transition-colors line-clamp-1">
                            {t.subject}
                          </h4>
                          <div className="shrink-0">{getStatusBadge(t.status)}</div>
                        </div>

                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {t.cleanMessage || t.message}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-400">
                          <span>
                            {new Date(t.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })} à {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          <div className="flex items-center gap-3">
                            {t.audioUrl && (
                              <span className="inline-flex items-center gap-1 text-[#b8924a] font-semibold">
                                <Mic size={12} /> Vocal
                              </span>
                            )}
                            {t.attachments && t.attachments.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                                <Paperclip size={12} /> {t.attachments.length} fichier(s)
                              </span>
                            )}
                            <span className="font-bold text-[#b8924a] group-hover:translate-x-0.5 transition-transform flex items-center">
                              Voir <ChevronRight size={14} />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
