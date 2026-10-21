"use client";

import { Save, AlertTriangle, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { useEvents } from "@/store/EventsContext";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { EventDetailsFields } from "@/components/events/EventDetailsFields";
import { eventDetailsFromRow, eventDetailsToRow, missingEventDetails, requiresEventDetails, type EventDetails } from "@/lib/eventDetails";

export default function EventSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
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
          <p className="text-sm font-medium text-gray-500 animate-pulse">Chargement des paramètres...</p>
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
      setError(`Merci de renseigner ${missing.join(", ")}.`);
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateEventFields(event.id, eventDetailsToRow(details));
      setSaved(true);
    } catch (err: any) {
      setError(err?.message || "Les modifications n'ont pas pu être enregistrées.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full">
      <div className="text-xs text-gray-500 font-medium mb-6 flex items-center gap-2">
        <span>Événement</span> <span className="text-gray-300">&gt;</span> <span className="text-black">Paramètres</span>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-black mb-2">Paramètres de l'événement</h1>
        <p className="text-gray-500 text-sm">Modifiez les informations de votre événement ou gérez son statut.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 md:p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4 text-black">Informations de base</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'événement <span className="text-xs text-gray-400 font-normal ml-2">(Non modifiable)</span></label>
                <input type="text" defaultValue={event.name} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'événement <span className="text-xs text-gray-400 font-normal ml-2">(Non modifiable)</span></label>
                <input type="text" defaultValue={event.type} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-black">Détails de l'événement</h2>
            <p className="text-sm text-gray-500 mt-1 mb-5">
              {required
                ? `Renseignés lors de l'achat de la formule ${event.plan} ; le nombre d'invités, la date et le lieu sont obligatoires.`
                : "Nombre d'invités, date, lieu, budget et informations importantes."}
            </p>
            <EventDetailsFields
              value={details}
              onChange={(d) => {
                setDetails(d);
                setSaved(false);
              }}
              showErrors={showErrors}
            />
          </section>

          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-black">Abonnement actuel</h2>
            <div className="bg-[#f5eee1] border border-[#b8924a]/30 rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <p className="font-semibold text-[#8f6f33]">Formule {event.plan}</p>
                <p className="text-sm text-gray-600">Facturé annuellement. Renouvellement le 12 Dec 2026.</p>
              </div>
              <button
                onClick={() => alert("Votre demande de changement de formule a bien été envoyée aux administrateurs. Nous vous recontacterons très vite !")}
                className="text-sm font-medium text-[#8f6f33] bg-white px-4 py-2 rounded-lg border border-[#b8924a]/30 hover:bg-[#b8924a]/10 transition-colors"
              >
                Demander un changement
              </button>
            </div>
          </section>
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-black">Statut de l'événement</h2>
            <div className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 ${event.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div>
                <p className={`font-semibold ${event.status === 'completed' ? 'text-green-800' : 'text-gray-800'}`}>
                  {event.status === 'completed' ? 'Cet événement est terminé' : 'Événement en cours'}
                </p>
                <p className="text-sm text-gray-500 mt-1">Clôturer l'événement permet de l'archiver dans votre tableau de bord.</p>
              </div>
              <button
                onClick={() => updateEventStatus(event.id, event.status === 'completed' ? 'published' : 'completed')}
                className={`text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
                  event.status === 'completed'
                    ? 'text-gray-600 bg-white border-gray-200 hover:bg-gray-100'
                    : 'text-green-700 bg-green-100 border-green-200 hover:bg-green-200'
                }`}
              >
                {event.status === 'completed' ? 'Rouvrir l\'événement' : 'Marquer comme terminé'}
              </button>
            </div>
          </section>
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          {error && <p className="text-sm text-[#6b1f2a] sm:mr-auto">{error}</p>}
          {saved && !error && (
            <p className="text-sm text-green-700 sm:mr-auto flex items-center gap-1.5">
              <CheckCircle2 size={16} /> Modifications enregistrées
            </p>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Enregistrer les modifications
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-red-200 rounded-2xl overflow-hidden">
        <div className="bg-red-50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-4 items-start">
            <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0 mt-1 md:mt-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-red-900 mb-1">Zone de danger</h3>
              <p className="text-sm text-red-700">La suppression de cet événement est irréversible. Toutes les données, invitations, et budgets associés seront définitivement effacés.</p>
            </div>
          </div>
          <button className="shrink-0 flex items-center gap-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Trash2 size={16} /> Supprimer l'événement
          </button>
        </div>
      </div>
    </div>
  );
}
