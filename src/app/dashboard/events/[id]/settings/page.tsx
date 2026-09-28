"use client";

import { Save, AlertTriangle, Trash2 } from "lucide-react";
import { useEvents } from "@/store/EventsContext";
import { notFound } from "next/navigation";
import { use } from "react";

export default function EventSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { events, updateEventStatus } = useEvents();
  const event = events.find((e) => e.id === id);

  if (!event) {
    notFound();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="text-xs text-gray-500 font-medium mb-6 flex items-center gap-2">
        <span>Événement</span> <span className="text-gray-300">&gt;</span> <span className="text-black">Paramètres</span>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-black mb-2">Paramètres de l'événement</h1>
        <p className="text-gray-500 text-sm">Modifiez les informations générales ou gérez le statut de votre événement.</p>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="text" defaultValue={event.date} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                <input type="text" defaultValue={event.location} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none" />
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-black">Abonnement actuel</h2>
            <div className="bg-[#F9F5EC] border border-[#D4AF37]/30 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-[#B8860B]">Formule {event.plan}</p>
                <p className="text-sm text-gray-600">Facturé annuellement. Renouvellement le 12 Dec 2026.</p>
              </div>
              <button 
                onClick={() => alert("Votre demande de changement de formule a bien été envoyée aux administrateurs. Nous vous recontacterons très vite !")}
                className="text-sm font-medium text-[#B8860B] bg-white px-4 py-2 rounded-lg border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-colors"
              >
                Demander un changement
              </button>
            </div>
          </section>
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-black">Statut de l'événement</h2>
            <div className={`border rounded-xl p-4 flex justify-between items-center ${event.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
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
        
        <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end">
          <button className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            <Save size={16} /> Enregistrer les modifications
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
