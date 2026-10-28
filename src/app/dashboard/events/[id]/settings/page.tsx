"use client";

import { Save, AlertTriangle, Trash2, Loader2, CheckCircle2, Calendar, Sparkles, ChevronRight, Check, ArrowLeft } from "lucide-react";
import { useEvents } from "@/store/EventsContext";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { use, useState } from "react";
import { EventDetailsFields } from "@/components/events/EventDetailsFields";
import { eventDetailsFromRow, eventDetailsToRow, missingEventDetails, requiresEventDetails, type EventDetails } from "@/lib/eventDetails";

export default function EventSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { events, isLoaded, updateEventStatus, updateEventFields } = useEvents();
  const event = events.find((e) => e.id === id);

  const [details, setDetails] = useState<EventDetails>(() => eventDetailsFromRow(event));
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!event) {
    if (!isLoaded) {
      return (
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 text-[#8f6f33]">
          <div className="w-10 h-10 border-3 border-[#b8924a] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs sm:text-sm font-semibold text-stone-500 animate-pulse">Chargement des paramètres…</p>
        </div>
      );
    }
    notFound();
    return null;
  }

  const required = requiresEventDetails(event.plan);

  const save = async () => {
    const missing = missingEventDetails(details);
    if (required && missing.length) {
      setShowErrors(true);
      setError(`Merci de renseigner : ${missing.join(", ")}.`);
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateEventFields(event.id, eventDetailsToRow(details));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.message || "Les modifications n'ont pas pu être enregistrées.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-300">
      {/* Fil d'ariane & Navigation */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href={`/dashboard/events/${event.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#b8924a] transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l'aperçu
        </Link>
        <div className="text-[11px] font-bold text-stone-400 flex items-center gap-1.5 uppercase tracking-wider">
          <span>{event.name}</span>
          <ChevronRight size={12} />
          <span className="text-[#8f6f33]">Paramètres</span>
        </div>
      </div>

      {/* En-tête de la page */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-1">
          Paramètres de l'événement
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm">
          Ajustez les détails logistiques de votre événement, gérez votre formule et son statut de réalisation.
        </p>
      </div>

      {/* Résumé de l'événement */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] flex items-center justify-center font-serif text-2xl font-bold shadow-md shrink-0">
            <Calendar size={28} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-950 truncate">
                {event.name}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#faf6ee] text-[#8f6f33] border border-[#b8924a]/30">
                <Sparkles size={11} /> Formule {event.plan || "Standard"}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
              Type : {event.type || "Événement privé"} • Statut :{" "}
              <span className={event.status === "completed" ? "text-emerald-700 font-bold" : "text-[#8f6f33] font-bold"}>
                {event.status === "completed" ? "Terminé / Archivé" : "En cours d'organisation"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {saved && !error && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
              <Check size={14} /> Enregistré !
            </span>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] text-xs font-bold shadow-md shadow-[#b8924a]/20 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{saving ? "Enregistrement…" : "Enregistrer"}</span>
          </button>
        </div>
      </div>

      {/* Formulaire des paramètres */}
      <div className="space-y-6">
        {/* SECTION 1: Informations de base (verrouillées pour la sécurité) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Informations clés de l'événement
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Le nom et le type sont fixés lors de la création initiale pour garantir la conformité des devis et invitations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Nom de l'événement
              </label>
              <input
                type="text"
                defaultValue={event.name}
                disabled
                className="w-full px-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm font-semibold text-stone-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Catégorie d'événement
              </label>
              <input
                type="text"
                defaultValue={event.type}
                disabled
                className="w-full px-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm font-semibold text-stone-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Détails logistiques & Date / Lieu */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Détails logistiques & Planning
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {required
                ? `Renseignés pour votre formule ${event.plan} : le nombre d'invités, la date et le lieu sont essentiels pour les prestataires.`
                : "Nombre de convives estimé, date du jour J, lieu de réception et budget alloué."}
            </p>
          </div>

          <div className="pt-2">
            <EventDetailsFields
              value={details}
              onChange={(d) => {
                setDetails(d);
                setSaved(false);
              }}
              showErrors={showErrors}
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-200">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#d9c08c] to-[#b8924a] text-[#241b13] text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Sauvegarde en cours…" : "Sauvegarder les modifications"}
            </button>
          </div>
        </div>

        {/* SECTION 3: Formule Evenium & Évolution */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Formule Evenium souscrite
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Débloque vos fonctionnalités avancées (site vitrine, QR code invité, gestion de budget, catalogue).
            </p>
          </div>

          <div className="bg-[#fbf7f0] border border-[#b8924a]/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8f6f33] block mb-1">
                Formule {event.plan || "Standard"}
              </span>
              <p className="text-sm font-bold text-stone-900">
                {event.plan === "Gold"
                  ? "Formule Gold — Accès VIP illimité à tous les modules"
                  : event.plan === "Premium"
                  ? "Formule Premium — Outils de suivi RSVP & invitations"
                  : "Formule Standard — Dashboard & lien officiel"}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                Valable pendant toute la durée de préparation de votre événement.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert("Votre demande d'évolution de formule a bien été transmise à votre conseiller Evenium.")}
              className="px-4 py-2 rounded-xl bg-white text-[#8f6f33] border border-[#b8924a]/30 text-xs font-bold hover:bg-[#efe6d6] transition-colors shrink-0 cursor-pointer"
            >
              Changer de formule
            </button>
          </div>
        </div>

        {/* SECTION 4: Statut de l'événement */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Statut de réalisation
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Lorsque votre événement a eu lieu, vous pouvez le marquer comme terminé pour l'archiver proprement.
            </p>
          </div>

          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              event.status === "completed"
                ? "bg-emerald-50/70 border-emerald-200"
                : "bg-[#faf8f5] border-stone-200"
            }`}
          >
            <div>
              <h4 className={`text-sm font-bold ${event.status === "completed" ? "text-emerald-950" : "text-stone-900"}`}>
                {event.status === "completed"
                  ? "🎉 Cet événement est clôturé et terminé"
                  : "⏳ Événement en cours d'organisation"}
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                {event.status === "completed"
                  ? "Les invitations et le suivi restent consultables en lecture seule."
                  : "Toutes les fonctionnalités d'édition et de devis restent ouvertes."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => updateEventStatus(event.id, event.status === "completed" ? "published" : "completed")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                event.status === "completed"
                  ? "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              }`}
            >
              {event.status === "completed" ? "Rouvrir l'événement" : "Marquer comme terminé"}
            </button>
          </div>
        </div>

        {/* SECTION 5: Zone de danger */}
        <div className="bg-rose-50/60 rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-rose-950 mb-0.5">
                Zone sensible : Archivage définitif
              </h4>
              <p className="text-xs text-rose-800 leading-relaxed max-w-xl">
                La clôture ou la suppression d'un événement retire son accès direct de vos listes actives. Pour toute demande de suppression définitive, contactez l'administrateur.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert("Pour supprimer définitivement un événement souscrit, veuillez contacter le Support Evenium afin de clôturer les contrats en cours.")}
            className="px-4 py-2 rounded-xl bg-white text-rose-700 border border-rose-300 text-xs font-bold hover:bg-rose-100 transition-colors shrink-0 cursor-pointer"
          >
            <Trash2 size={14} className="inline mr-1" />
            Supprimer l'événement
          </button>
        </div>
      </div>
    </div>
  );
}
